import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { runNotificationCycle } from "../../src/workers/transactional-notifications.mjs";

const url = process.env.TASK015_TEST_SUPABASE_URL;
const anonKey = process.env.TASK015_TEST_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.TASK015_TEST_SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.TASK015_TEST_PROJECT_ID;
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
  !anonKey ||
  !serviceRoleKey ||
  !projectId?.startsWith("task015-ci-")
) {
  throw new Error(
    "TASK015 requires identified ephemeral loopback Supabase credentials; no tests were run.",
  );
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

test("TASK-015 local E2E: order event creates outbox and bounded retry reaches sent", async () => {
  const setting = await admin.from("notification_channel_settings").upsert(
    {
      channel: "email",
      enabled: true,
      max_messages_per_period: 1000,
      period_seconds: 3600,
      monthly_budget_brl: 1000,
      budget_alert_threshold_brl: 900,
      estimated_unit_cost_brl: 0,
      max_attempts: 3,
      retry_base_seconds: 1,
      retry_max_seconds: 2,
      metadata_retention_days: 30,
      payload_retention_days: 14,
    },
    { onConflict: "channel" },
  );
  assert.equal(setting.error, null);

  const suffix = randomUUID();
  const email = `task015-${suffix}@example.invalid`;
  const password = `T15-${randomUUID()}-Aa1!`;
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "customer" },
  });
  assert.equal(created.error, null);
  const customerId = created.data.user.id;
  const customer = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  assert.equal((await customer.auth.signInWithPassword({ email, password })).error, null);
  const cart = await customer
    .from("carts")
    .insert({ customer_id: customerId })
    .select("id")
    .single();
  assert.equal(cart.error, null);
  const product = await admin
    .from("catalog_products")
    .insert({
      slug: `task015-${suffix}`,
      name: "Fixture sintética TASK-015",
      product_type: "fixture",
      description: "Registro sintético sem pagamento externo.",
      price_brl: 1,
      category_name: "Arranjos",
      stock_quantity: 3,
      status: "published",
    })
    .select("id")
    .single();
  assert.equal(product.error, null);
  assert.equal(
    (
      await customer
        .from("cart_items")
        .insert({ cart_id: cart.data.id, product_id: product.data.id, quantity: 1 })
    ).error,
    null,
  );
  const reservation = await customer.rpc("create_cart_reservation", {
    p_cart_id: cart.data.id,
    p_selected_product_ids: [product.data.id],
    p_idempotency_key: randomUUID(),
  });
  assert.equal(reservation.error, null);
  const quote = await customer.rpc("create_order_quote", { p_reservation_id: reservation.data.id });
  assert.equal(quote.error, null);
  const order = await customer.rpc("create_order_from_quote", {
    p_quote_id: quote.data.quote_id,
    p_idempotency_key: randomUUID(),
    p_consent: true,
  });
  assert.equal(order.error, null);
  const outbox = await admin
    .from("notification_outbox")
    .select("id,status")
    .eq("order_id", order.data.id)
    .eq("notification_type", "order_created")
    .single();
  assert.equal(outbox.error, null);
  assert.equal(outbox.data.status, "pending");

  let sends = 0;
  const adapter = {
    async send() {
      sends += 1;
      if (sends === 1) {
        const error = new Error("synthetic transient gateway failure");
        error.code = "notification_smtp_temporary_failure";
        throw error;
      }
      return { accepted: true, providerMessageId: `task015-${suffix}` };
    },
  };
  const first = await runNotificationCycle(admin, adapter);
  assert.deepEqual(first, { claimed: 1, sent: 0, failed: 1, disabled: false });
  let status = await admin
    .from("notification_outbox")
    .select("status,attempt_count,accepted_at,available_at")
    .eq("id", outbox.data.id)
    .single();
  assert.equal(status.data.status, "retry_wait");
  assert.equal(status.data.attempt_count, 1);
  assert.equal(status.data.accepted_at, null);
  const availableAt = Date.parse(status.data.available_at);
  if (availableAt > Date.now())
    await new Promise((resolve) => setTimeout(resolve, availableAt - Date.now() + 50));
  const second = await runNotificationCycle(admin, adapter);
  assert.deepEqual(second, { claimed: 1, sent: 1, failed: 0, disabled: false });
  status = await admin
    .from("notification_outbox")
    .select("status,attempt_count,accepted_at")
    .eq("id", outbox.data.id)
    .single();
  assert.equal(status.data.status, "sent");
  assert.equal(status.data.attempt_count, 2);
  assert.ok(status.data.accepted_at);
  assert.equal(sends, 2);
});
