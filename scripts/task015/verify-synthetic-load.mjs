import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.TASK015_TEST_SUPABASE_URL;
const serviceKey = process.env.TASK015_TEST_SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.TASK015_TEST_PROJECT_ID;
const summaryPath = process.env.TASK015_FIXTURE_SUMMARY;
const reportPath = process.argv[2];
let endpoint;
try {
  endpoint = new URL(url);
} catch {
  endpoint = null;
}
if (
  !endpoint ||
  endpoint.protocol !== "http:" ||
  !["127.0.0.1", "localhost", "[::1]"].includes(endpoint.hostname) ||
  !serviceKey ||
  !projectId?.startsWith("task015-ci-") ||
  !summaryPath ||
  !reportPath
) {
  throw new Error("task015_load_verification_requires_ephemeral_loopback_supabase");
}

const fixture = JSON.parse(await readFile(summaryPath, "utf8"));
if (
  fixture.projectId !== projectId ||
  fixture.customers?.length !== 200 ||
  fixture.products?.length !== 5
) {
  throw new Error("task015_load_fixture_summary_invalid");
}
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const customerIds = fixture.customers.map((item) => item.customerId);
const orderResult = await admin
  .from("orders")
  .select("id,customer_id,quote_id,idempotency_key,status,payment_confirmed_at")
  .in("customer_id", customerIds)
  .limit(1000);
if (orderResult.error)
  throw new Error("task015_load_orders_read_failed:" + (orderResult.error.code ?? "unknown"));
const orders = orderResult.data ?? [];
const expectedByCustomer = new Map(fixture.customers.map((item) => [item.customerId, item]));
const orderIds = new Set();
const idempotencyKeys = new Set();
let orderInvariantFailures = 0;
for (const order of orders) {
  const expected = expectedByCustomer.get(order.customer_id);
  if (
    !expected ||
    order.quote_id !== expected.quoteId ||
    order.idempotency_key !== expected.idempotencyKey ||
    order.status !== "awaiting_payment" ||
    order.payment_confirmed_at !== null ||
    orderIds.has(order.id) ||
    idempotencyKeys.has(order.idempotency_key)
  ) {
    orderInvariantFailures += 1;
  }
  orderIds.add(order.id);
  idempotencyKeys.add(order.idempotency_key);
}
if (orders.length !== 200 || orderInvariantFailures !== 0)
  orderInvariantFailures += Math.abs(orders.length - 200) || 1;

const productIds = fixture.products.map((item) => item.id);
const productResult = await admin
  .from("catalog_products")
  .select("id,slug,stock_quantity,status")
  .in("id", productIds);
if (productResult.error)
  throw new Error("task015_load_products_read_failed:" + (productResult.error.code ?? "unknown"));
const productMap = new Map((productResult.data ?? []).map((item) => [item.id, item]));
const productInvariantFailures =
  fixture.products.filter((expected) => {
    const actual = productMap.get(expected.id);
    return (
      !actual ||
      actual.slug !== expected.slug ||
      actual.status !== "published" ||
      !Number.isSafeInteger(actual.stock_quantity) ||
      actual.stock_quantity !== expected.expectedStockAfterReservations
    );
  }).length + Math.max(0, 5 - (productResult.data?.length ?? 0));

const notificationResult = await admin
  .from("notification_outbox")
  .select("id,idempotency_key,order_id,notification_type")
  .in(
    "order_id",
    orders.map((item) => item.id),
  )
  .eq("notification_type", "order_created")
  .limit(1000);
if (notificationResult.error)
  throw new Error(
    "task015_load_outbox_read_failed:" + (notificationResult.error.code ?? "unknown"),
  );
const notificationRows = notificationResult.data ?? [];
const notificationKeys = new Set(notificationRows.map((item) => item.idempotency_key));
const outboxInvariantFailures =
  notificationRows.length === 200 &&
  notificationKeys.size === 200 &&
  notificationRows.every((item) => orderIds.has(item.order_id))
    ? 0
    : 1;

const report = {
  task: "TASK-015 post-load data invariants",
  capturedAt: new Date().toISOString(),
  syntheticCustomers: 200,
  expectedOrders: 200,
  observedOrders: orders.length,
  uniqueOrderIds: orderIds.size,
  uniqueOrderIdempotencyKeys: idempotencyKeys.size,
  orderInvariantFailures,
  expectedProducts: 5,
  observedProducts: productResult.data?.length ?? 0,
  productInvariantFailures,
  expectedOrderCreatedOutboxRows: 200,
  observedOrderCreatedOutboxRows: notificationRows.length,
  uniqueOutboxIdempotencyKeys: notificationKeys.size,
  outboxInvariantFailures,
  inventoryNonnegative: (productResult.data ?? []).every((item) => item.stock_quantity >= 0),
  passed:
    orderInvariantFailures === 0 && productInvariantFailures === 0 && outboxInvariantFailures === 0,
};
await writeFile(reportPath, JSON.stringify(report, null, 2), { mode: 0o600, flag: "wx" });
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
