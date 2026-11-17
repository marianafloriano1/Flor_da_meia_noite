import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import {
  assertLocalProjectUrl,
  assertLoopbackUrl,
  assertServiceRoleKey,
  attachedPartitionTables,
  decryptBuffer,
  decryptFileToFile,
  encryptBuffer,
  encryptStreamToFile,
  isWithin,
  keyFromBase64,
  readLocalSupabaseConfig,
  safeObjectKey,
} from "../../scripts/task013/backup-lib.mjs";
import { validateProbeTarget } from "../../scripts/task013/probe.mjs";
import {
  availabilitySli,
  backupIntegritySli,
  errorBudget,
  recoveryTargets,
} from "../../scripts/task013/sli.mjs";

const key = Buffer.alloc(32, 9);

test("AES-GCM buffer round trip authenticates ciphertext and plaintext", () => {
  const original = Buffer.from("synthetic task013 backup marker");
  const encrypted = encryptBuffer(original, key);
  assert.deepEqual(decryptBuffer(encrypted.ciphertext, encrypted.meta, key), original);
  const tampered = Buffer.from(encrypted.ciphertext);
  tampered[0] ^= 1;
  assert.throws(() => decryptBuffer(tampered, encrypted.meta, key), /integrity_failed/);
});

test("streaming encryption restores bytes and rejects a modified file", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "task013-crypto-"));
  try {
    const source = path.join(directory, "source");
    const encryptedPath = path.join(directory, "source.enc");
    const restored = path.join(directory, "restored");
    const original = Buffer.from("synthetic-stream-".repeat(1000));
    await writeFile(source, original);
    const meta = await encryptStreamToFile(Readable.from(original), encryptedPath, key);
    await decryptFileToFile(encryptedPath, restored, meta, key);
    assert.deepEqual(await readFile(restored), original);
    const corrupt = await readFile(encryptedPath);
    corrupt[0] ^= 1;
    await writeFile(encryptedPath, corrupt);
    await assert.rejects(
      decryptFileToFile(encryptedPath, path.join(directory, "bad"), meta, key),
      /integrity_failed/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("encryption key parser requires exactly 32 bytes", () => {
  assert.equal(keyFromBase64(key.toString("base64")).length, 32);
  assert.throws(() => keyFromBase64(Buffer.alloc(8).toString("base64")), /32_byte/);
});

test("restore TOC identifies only its attached partition tables", () => {
  const toc = [
    "100; 0 0 TABLE ATTACH realtime messages_2026_11_18 supabase_realtime_admin",
    "200; 2606 16932 CONSTRAINT realtime messages_2026_11_18 messages_2026_11_18_pkey supabase_realtime_admin",
    "201; 2606 100 CONSTRAINT public orders orders_pkey postgres",
    "202; 1259 10 TABLE realtime messages supabase_realtime_admin",
  ].join("\n");
  assert.deepEqual(attachedPartitionTables(toc), [["realtime", "messages_2026_11_18"]]);
  assert.throws(() => attachedPartitionTables(null), /toc_invalid/);
  assert.throws(
    () => attachedPartitionTables("1; 0 0 TABLE ATTACH bad-schema table owner"),
    /partition_name_invalid/,
  );
});

test("Storage object keys cannot escape the artifact root", () => {
  assert.equal(safeObjectKey("contracts/abc/contract.pdf"), "contracts/abc/contract.pdf");
  for (const value of ["../secret", "a/../../secret", "/absolute", "a\\b", "a//b", ""])
    assert.throws(() => safeObjectKey(value));
  assert.equal(isWithin("C:/backup", "C:/backup/run", path.win32), true);
  assert.equal(isWithin("C:/backup", "C:/backup-evil/run", path.win32), false);
});

test("network guards accept loopback only", () => {
  assert.equal(assertLoopbackUrl("http://127.0.0.1:54321", "source").port, "54321");
  assert.throws(
    () => assertLoopbackUrl("https://supabase.example.com", "source"),
    /must_be_localhost/,
  );
});

test("the isolated project guard reads only task013 test/restore identifiers and configured ports", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "task013-config-"));
  try {
    await mkdir(path.join(root, "supabase"));
    await writeFile(
      path.join(root, "supabase/config.toml"),
      'project_id = "task013-test-unit"\n[api]\nport = 56121\n[db]\nport = 56122\n',
    );
    assert.deepEqual(await readLocalSupabaseConfig(root, "task013-test-"), {
      projectId: "task013-test-unit",
      apiPort: 56121,
      dbPort: 56122,
      configPath: path.join(root, "supabase", "config.toml"),
    });
    assert.equal(assertLocalProjectUrl("http://127.0.0.1:56121", 56121, "source").port, "56121");
    assert.throws(
      () => assertLocalProjectUrl("http://127.0.0.1:54321", 56121, "source"),
      /does_not_match/,
    );
    await writeFile(
      path.join(root, "supabase/config.toml"),
      'project_id = "flor-da-meia-noite-local"\n[api]\nport = 54321\n[db]\nport = 54322\n',
    );
    await assert.rejects(
      readLocalSupabaseConfig(root, "task013-test-"),
      /isolated_project_id_required/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("service credentials are accepted only when JWT claims service_role", () => {
  const token = (role) =>
    `e30.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
  assert.equal(assertServiceRoleKey(token("service_role")), token("service_role"));
  assert.throws(() => assertServiceRoleKey(token("anon")), /service_role_required/);
  assert.throws(() => assertServiceRoleKey("not-a-jwt"), /key_invalid/);
});

test("database archive inventory must include the Storage object rows", async () => {
  const { hasStorageObjectsDumpEntry, objectArtifactName } = await import(
    "../../scripts/task013/backup-lib.mjs"
  );
  assert.equal(
    hasStorageObjectsDumpEntry("  234; 0 500 TABLE DATA storage objects postgres"),
    true,
  );
  assert.equal(hasStorageObjectsDumpEntry("  234; 0 500 TABLE DATA public orders postgres"), false);
  assert.equal(
    objectArtifactName("catalog", "flowers/rose.webp"),
    objectArtifactName("catalog", "flowers/rose.webp"),
  );
  assert.notEqual(
    objectArtifactName("catalog", "flowers/rose.webp"),
    objectArtifactName("catalog", "flowers/lily.webp"),
  );
});

test("availability SLI counts timeouts and 5xx without treating valid 4xx as outages", () => {
  const result = availabilitySli([
    { status: 200 },
    { status: 404 },
    { status: 503 },
    { timeout: true, status: 0 },
  ]);
  assert.deepEqual(result, { total: 4, failures: 2, successes: 2, ratio: 0.5 });
  assert.throws(() => availabilitySli([]), /samples_required/);
});

test("backup SLI requires both completed status and verified checksum", () => {
  const result = backupIntegritySli([
    { status: "complete", checksumVerified: true },
    { status: "complete", checksumVerified: false },
    { status: "missing" },
  ]);
  assert.deepEqual(result, {
    total: 3,
    successes: 1,
    failures: 2,
    ratio: 1 / 3,
  });
});

test("error budget and recovery target measurements are deterministic", () => {
  assert.equal(errorBudget(30 * 24 * 60), 216);
  const measured = recoveryTargets(
    {
      lastSuccessfulBackupAt: "2026-11-13T03:00:00Z",
      latestConfirmedMarkerAt: "2026-11-13T03:00:00Z",
      restoredMarkerAt: "2026-11-12T03:00:00Z",
      restoreDurationSeconds: 3600,
    },
    Date.parse("2026-11-14T03:00:00Z"),
  );
  assert.equal(measured.rpoWithin24h, true);
  assert.equal(measured.rtoWithin24h, true);
});

test("probe targets reject credentials, arbitrary HTTP hosts, and external HTTPS without explicit enablement", () => {
  assert.equal(
    validateProbeTarget({ name: "local", url: "http://127.0.0.1:54321" }, false).name,
    "local",
  );
  assert.throws(
    () => validateProbeTarget({ name: "bad", url: "http://example.com" }, true),
    /must_be_localhost/,
  );
  assert.throws(
    () => validateProbeTarget({ name: "bad", url: "https://example.com" }, false),
    /explicit_enablement/,
  );
  assert.throws(
    () => validateProbeTarget({ name: "bad", url: "https://u:p@example.com" }, true),
    /credentials/,
  );
});
