import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const url = process.env.TASK015_TEST_SUPABASE_URL;
const anonKey = process.env.TASK015_TEST_SUPABASE_ANON_KEY;
const serviceKey = process.env.TASK015_TEST_SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.TASK015_TEST_PROJECT_ID;
const imageDir = process.env.TASK015_IMAGE_DIR;
const manifestPath = process.env.TASK015_LOAD_MANIFEST;
const fixtureSummaryPath = process.env.TASK015_FIXTURE_SUMMARY;
const appOrigin = process.env.TASK015_APP_ORIGIN ?? "http://127.0.0.1:3215";
const urlObject = (() => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
})();
if (
  !urlObject ||
  urlObject.protocol !== "http:" ||
  !["127.0.0.1", "localhost", "[::1]"].includes(urlObject.hostname) ||
  !anonKey ||
  !serviceKey ||
  !projectId?.startsWith("task015-ci-") ||
  !imageDir ||
  !manifestPath ||
  !fixtureSummaryPath
) {
  throw new Error("task015_fixture_setup_requires_ephemeral_loopback_supabase_and_output_paths");
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const assetManifest = JSON.parse(
  await readFile(new URL("./assets/manifest.json", import.meta.url), "utf8"),
);
const imageSpecs = [
  ["arranjo_flores.webp", "Arranjo sintético de flores variadas."],
  ["buque_flores.webp", "Buquê sintético de flores variadas."],
  ["buque_girassol.webp", "Buquê sintético de flores amarelo-alaranjadas."],
  ["buque_lirio.webp", "Buquê sintético com flores em tons rosados."],
  ["buque_rosas.webp", "Buquê sintético de rosas em diferentes tonalidades."],
];
function dimensions(data) {
  if (data.toString("ascii", 0, 4) !== "RIFF" || data.toString("ascii", 8, 12) !== "WEBP")
    throw new Error("task015_fixture_webp_signature_invalid");
  for (let offset = 12; offset + 8 <= data.length; ) {
    const kind = data.toString("ascii", offset, offset + 4);
    const length = data.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + length > data.length) throw new Error("task015_fixture_webp_chunk_invalid");
    if (kind === "VP8X" && length >= 10)
      return {
        width: 1 + data[start + 4] + (data[start + 5] << 8) + (data[start + 6] << 16),
        height: 1 + data[start + 7] + (data[start + 8] << 8) + (data[start + 9] << 16),
      };
    if (
      kind === "VP8 " &&
      length >= 10 &&
      data[start + 3] === 0x9d &&
      data[start + 4] === 0x01 &&
      data[start + 5] === 0x2a
    )
      return {
        width: data.readUInt16LE(start + 6) & 0x3fff,
        height: data.readUInt16LE(start + 8) & 0x3fff,
      };
    if (kind === "VP8L" && length >= 5 && data[start] === 0x2f) {
      const bits = data.readUInt32LE(start + 1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    offset = start + length + (length & 1);
  }
  throw new Error("task015_fixture_webp_dimensions_unreadable");
}
async function assertOk(result, operation) {
  if (result.error) throw new Error(operation + "_failed:" + (result.error.code ?? "unknown"));
  return result.data;
}
const bucket = await admin.storage.getBucket("catalog");
if (bucket.error || bucket.data?.public !== true)
  throw new Error("task015_ephemeral_catalog_bucket_not_public_after_migrations");
const fixtureRun = projectId.replace(/[^a-z0-9-]/gi, "-");
const products = [];
for (let index = 0; index < imageSpecs.length; index++) {
  const [name, alt] = imageSpecs[index];
  const expectedHash = assetManifest.assets.find((item) => item.name === name)?.sha256;
  const data = await readFile(join(imageDir, name));
  if (createHash("sha256").update(data).digest("hex") !== expectedHash)
    throw new Error("task015_fixture_webp_checksum_mismatch:" + name);
  const size = dimensions(data);
  const category = index === 0 ? "Arranjos" : "Buquês";
  const product = await assertOk(
    await admin
      .from("catalog_products")
      .insert({
        slug: `${fixtureRun}-${name.replace(".webp", "").replaceAll("_", "-")}`,
        name: `Fixture sintética TASK-015 ${index + 1}`,
        product_type: "synthetic-load-fixture",
        description: "Dados sintéticos temporários para validação de carga.",
        price_brl: 1,
        category_name: category,
        stock_quantity: 100000,
        status: "published",
      })
      .select("id,slug")
      .single(),
    "task015_fixture_product_insert",
  );
  const objectKey = `task015/${fixtureRun}/${name}`;
  await assertOk(
    await admin.storage
      .from("catalog")
      .upload(objectKey, data, { contentType: "image/webp", upsert: false }),
    "task015_fixture_image_upload",
  );
  await assertOk(
    await admin.from("catalog_product_images").insert({
      product_id: product.id,
      object_key: objectKey,
      alt_text: alt,
      width: size.width,
      height: size.height,
      mime_type: "image/webp",
      sort_order: 0,
    }),
    "task015_fixture_image_metadata_insert",
  );
  const storedObject = await assertOk(
    await admin.storage.from("catalog").download(objectKey),
    "task015_fixture_image_readback",
  );
  if (
    createHash("sha256")
      .update(Buffer.from(await storedObject.arrayBuffer()))
      .digest("hex") !== expectedHash
  )
    throw new Error("task015_fixture_uploaded_image_checksum_mismatch:" + name);
  const imageRecord = await assertOk(
    await admin
      .from("catalog_product_images")
      .select("object_key,mime_type,width,height")
      .eq("product_id", product.id)
      .single(),
    "task015_fixture_image_metadata_readback",
  );
  if (
    imageRecord.object_key !== objectKey ||
    imageRecord.mime_type !== "image/webp" ||
    imageRecord.width !== size.width ||
    imageRecord.height !== size.height
  )
    throw new Error("task015_fixture_image_metadata_mismatch:" + name);
  products.push({
    id: product.id,
    slug: product.slug,
    objectKey,
    width: size.width,
    height: size.height,
    bytes: data.length,
    sha256: expectedHash,
  });
}

async function createCustomer(index) {
  const email = `task015-load-${fixtureRun}-${String(index).padStart(4, "0")}@example.invalid`;
  const password = `T15-${randomUUID()}-Aa1!`;
  const user = await assertOk(
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "customer" },
    }),
    "task015_fixture_customer_create",
  );
  const cookieJar = new Map();
  const customer = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
      setAll: (values) => {
        for (const item of values) cookieJar.set(item.name, item.value);
      },
    },
  });
  await assertOk(
    await customer.auth.signInWithPassword({ email, password }),
    "task015_fixture_customer_signin",
  );
  const cart = await assertOk(
    await admin.from("carts").insert({ customer_id: user.user.id }).select("id").single(),
    "task015_fixture_cart_create",
  );
  const product = products[index % products.length];
  await assertOk(
    await customer
      .from("cart_items")
      .insert({ cart_id: cart.id, product_id: product.id, quantity: 1 }),
    "task015_fixture_cart_item_insert",
  );
  const reservation = await assertOk(
    await customer.rpc("create_cart_reservation", {
      p_cart_id: cart.id,
      p_selected_product_ids: [product.id],
      p_idempotency_key: randomUUID(),
    }),
    "task015_fixture_reservation",
  );
  const quote = await assertOk(
    await customer.rpc("create_order_quote_with_coupon", {
      p_reservation_id: reservation.id,
      p_coupon_code: null,
    }),
    "task015_fixture_quote",
  );
  if (typeof quote.quote_id !== "string") throw new Error("task015_fixture_quote_id_missing");
  return {
    customerId: user.user.id,
    email,
    productId: product.id,
    cookie: [...cookieJar].map(([name, value]) => `${name}=${value}`).join("; "),
    quoteId: quote.quote_id,
    idempotencyKey: randomUUID(),
  };
}

const cartCustomers = [];
for (let base = 0; base < 200; base += 8) {
  const batch = await Promise.all(
    Array.from({ length: Math.min(8, 200 - base) }, (_, offset) => createCustomer(base + offset)),
  );
  cartCustomers.push(...batch);
}
const employeeEmail = `task015-load-employee-${fixtureRun}@example.invalid`;
const employeePassword = `T15-${randomUUID()}-Aa1!`;
const employee = await assertOk(
  await admin.auth.admin.createUser({
    email: employeeEmail,
    password: employeePassword,
    email_confirm: true,
    app_metadata: { role: "employee" },
  }),
  "task015_fixture_employee_create",
);
await assertOk(
  await admin.from("employee_profiles").insert({
    id: employee.user.id,
    full_name: "Fixture sintética TASK-015",
    age: 30,
    phone_e164: "+15555550150",
    email: employeeEmail,
    cpf: "00000000001",
    hire_date: new Date().toISOString().slice(0, 10),
    account_status: "active",
  }),
  "task015_fixture_employee_profile",
);
const employeeJar = new Map();
const employeeClient = createServerClient(url, anonKey, {
  cookies: {
    getAll: () => [...employeeJar].map(([name, value]) => ({ name, value })),
    setAll: (values) => {
      for (const item of values) employeeJar.set(item.name, item.value);
    },
  },
});
await assertOk(
  await employeeClient.auth.signInWithPassword({
    email: employeeEmail,
    password: employeePassword,
  }),
  "task015_fixture_employee_signin",
);
const employeeCookie = [...employeeJar].map(([name, value]) => `${name}=${value}`).join("; ");

const sessions = [];
const add = (flow, count, makeSteps) => {
  for (let i = 0; i < count; i++)
    sessions.push({
      id: `task015-${flow}-${String(i).padStart(4, "0")}`,
      flow,
      steps: makeSteps(i),
    });
};
add("catalog", 350, () => [
  { path: "/api/catalog", method: "GET", expectedStatus: 200, critical: true },
]);
add("details_images", 250, (i) => {
  const product = products[i % products.length];
  return [
    {
      path: `/api/catalog/${encodeURIComponent(product.slug)}`,
      method: "GET",
      expectedStatus: 200,
      critical: true,
    },
    {
      url: `${urlObject.origin}/storage/v1/object/public/catalog/${product.objectKey}`,
      method: "GET",
      expectedStatus: 200,
      critical: true,
      consumeBody: true,
    },
  ];
});
add("cart_checkout", 200, (i) => [
  {
    path: "/api/orders",
    method: "POST",
    headers: { cookie: cartCustomers[i].cookie, origin: appOrigin },
    body: {
      quoteId: cartCustomers[i].quoteId,
      idempotencyKey: cartCustomers[i].idempotencyKey,
      consent: true,
    },
    expectedStatus: [200, 201],
    critical: true,
  },
]);
add("orders", 100, () => [
  {
    path: "/api/orders",
    method: "GET",
    headers: { cookie: cartCustomers[0].cookie },
    expectedStatus: 200,
    critical: true,
  },
]);
add("admin_inventory", 100, () => [
  {
    path: "/api/admin/catalog/products",
    method: "GET",
    headers: { cookie: employeeCookie },
    expectedStatus: 200,
    critical: true,
  },
]);
if (sessions.length !== 1000) throw new Error("task015_session_manifest_count_invalid");
await writeFile(
  manifestPath,
  JSON.stringify(
    { kind: "task015-synthetic-load-v1", createdAt: new Date().toISOString(), sessions },
    null,
    2,
  ),
  { mode: 0o600, flag: "wx" },
);
const productsWithExpectedStock = products.map((product) => ({
  ...product,
  expectedStockAfterReservations:
    100_000 - cartCustomers.filter((item) => item.productId === product.id).length,
}));
await writeFile(
  fixtureSummaryPath,
  JSON.stringify(
    {
      task: "TASK-015 synthetic fixtures",
      projectId,
      products: productsWithExpectedStock,
      customers: cartCustomers.map(({ customerId, quoteId, idempotencyKey }) => ({
        customerId,
        quoteId,
        idempotencyKey,
      })),
      loadSessions: 1000,
      mix: {
        catalog: 350,
        details_images: 250,
        cart_checkout: 200,
        orders: 100,
        admin_inventory: 100,
      },
      syntheticAccounts: { customers: 200, employees: 1 },
      externalSideEffects: false,
    },
    null,
    2,
  ),
  { mode: 0o600, flag: "wx" },
);
console.log(
  "Prepared 5 synthetic catalog products/images and a deterministic 1000-session manifest (350/250/200/100/100). Credentials and cookie manifest remain only in runner temporary files.",
);
