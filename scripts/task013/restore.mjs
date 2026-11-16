import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import {
  assertLocalProjectUrl,
  assertServiceRoleKey,
  attachedPartitionTables,
  decryptBuffer,
  decryptFileToFile,
  hasStorageObjectsDumpEntry,
  isWithin,
  keyFromBase64,
  objectArtifactName,
  readLocalSupabaseConfig,
  safeObjectKey,
  sha256File,
} from "./backup-lib.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`task013_required_env_missing:${name}`);
  return value;
};

function containerName(projectId) {
  return `supabase_db_${projectId}`;
}

async function ensureContainer(container) {
  const running = await new Promise((resolve, reject) => {
    const child = spawn(
      "docker",
      ["inspect", "--format", "{{.State.Running}}|{{json .Config.Labels}}", container],
      { windowsHide: true },
    );
    let stdout = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => {
      stdout += chunk;
    });
    child.on("error", () => reject(new Error("task013_docker_unavailable")));
    child.on("close", (code) =>
      code === 0
        ? resolve(stdout.trim())
        : reject(new Error("task013_isolated_restore_container_missing")),
    );
  });
  const [isRunning, labelsJson] = String(running).split("|", 2);
  let labels;
  try {
    labels = JSON.parse(labelsJson);
  } catch {
    throw new Error("task013_isolated_container_identity_mismatch");
  }
  if (
    isRunning !== "true" ||
    labels["com.supabase.cli.project"] !== container.replace("supabase_db_", "")
  )
    throw new Error("task013_isolated_container_identity_mismatch");
}

async function inspectDumpArchive(container, dumpFile) {
  const child = spawn("docker", ["exec", "-i", container, "pg_restore", "--list"], {
    windowsHide: true,
    stdio: ["pipe", "pipe", "ignore"],
  });
  let output = "";
  child.stdout.setEncoding("utf8").on("data", (chunk) => {
    output += chunk;
  });
  await new Promise((resolve, reject) => {
    child.on("error", () => reject(new Error("task013_pg_restore_unavailable")));
    child.once("close", (code) =>
      code === 0 ? resolve() : reject(new Error("task013_database_archive_invalid")),
    );
    createReadStream(dumpFile).pipe(child.stdin);
  });
  if (!hasStorageObjectsDumpEntry(output))
    throw new Error("task013_storage_metadata_missing_from_database_dump");
  return output;
}

async function detachArchivePartitions(container, tocEntries) {
  const partitions = attachedPartitionTables(tocEntries);
  if (!partitions.length) return;
  const values = partitions.map(([schema, table]) => `('${schema}','${table}')`).join(",");
  const sql = `DO $task013$ DECLARE child record; BEGIN FOR child IN SELECT pn.nspname AS parent_schema, pc.relname AS parent_table, cn.nspname AS child_schema, cc.relname AS child_table FROM pg_inherits i JOIN pg_class pc ON pc.oid = i.inhparent JOIN pg_namespace pn ON pn.oid = pc.relnamespace JOIN pg_class cc ON cc.oid = i.inhrelid JOIN pg_namespace cn ON cn.oid = cc.relnamespace WHERE (cn.nspname, cc.relname) IN (VALUES ${values}) LOOP EXECUTE format('ALTER TABLE %I.%I DETACH PARTITION %I.%I', child.parent_schema, child.parent_table, child.child_schema, child.child_table); END LOOP; END $task013$;`;
  await new Promise((resolve, reject) => {
    const child = spawn(
      "docker",
      [
        "exec",
        "-i",
        container,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "supabase_admin",
        "-d",
        "postgres",
      ],
      { windowsHide: true, stdio: ["pipe", "ignore", "ignore"] },
    );
    child.on("error", () => reject(new Error("task013_pg_restore_unavailable")));
    child.once("close", (code) =>
      code === 0 ? resolve() : reject(new Error("task013_restore_partition_detach_failed")),
    );
    child.stdin.end(sql);
  });
}

async function restoreDatabase(container, dumpFile, tocEntries) {
  await detachArchivePartitions(container, tocEntries);
  const child = spawn(
    "docker",
    [
      "exec",
      "-i",
      container,
      "pg_restore",
      "--clean",
      "--if-exists",
      "--no-owner",
      "--exit-on-error",
      "--single-transaction",
      "-U",
      "supabase_admin",
      "-d",
      "postgres",
    ],
    { windowsHide: true, stdio: ["pipe", "ignore", "ignore"] },
  );
  let spawnError;
  child.on("error", () => {
    spawnError = true;
  });
  try {
    await new Promise((resolve, reject) => {
      const input = createReadStream(dumpFile);
      input.on("error", () => reject(new Error("task013_restore_archive_read_failed")));
      input.pipe(child.stdin);
      child.once("error", () => reject(new Error("task013_pg_restore_unavailable")));
      child.once("close", (code) =>
        code === 0 ? resolve() : reject(new Error("task013_database_restore_failed")),
      );
    });
  } catch (error) {
    child.kill();
    throw error;
  }
  if (spawnError) throw new Error("task013_pg_restore_unavailable");
}

function objectUrl(base, bucket, key) {
  return `${base}/storage/v1/object/${[bucket, ...key.split("/")].map(encodeURIComponent).join("/")}`;
}

async function uploadObject(base, serviceKey, item, filePath) {
  const response = await fetch(objectUrl(base, item.bucket, item.key), {
    method: "PUT",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": item.mimeType,
      "cache-control": `max-age=${Number(item.cacheControl) || 0}`,
      "x-upsert": "true",
    },
    body: Readable.toWeb(createReadStream(filePath)),
    duplex: "half",
  });
  if (!response.ok) throw new Error(`task013_storage_restore_failed:${response.status}`);
}

async function verifyObject(base, serviceKey, item) {
  const response = await fetch(objectUrl(base, item.bucket, item.key), {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok || !response.body)
    throw new Error(`task013_storage_restore_verification_failed:${response.status}`);
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of response.body) {
    hash.update(chunk);
    bytes += chunk.length;
  }
  if (bytes !== item.plaintextBytes || hash.digest("hex") !== item.plaintextSha256) {
    throw new Error("task013_restored_object_integrity_failed");
  }
}

async function main() {
  if (required("TASK013_RESTORE_ACKNOWLEDGE_ISOLATED_TARGET") !== "YES")
    throw new Error("task013_isolated_restore_acknowledgement_required");
  const workdir = path.resolve(required("TASK013_SUPABASE_WORKDIR"));
  const backupDir = path.resolve(required("TASK013_BACKUP_DIR"));
  if (isWithin(repoRoot, backupDir, path) || isWithin(backupDir, repoRoot, path))
    throw new Error("task013_backup_dir_must_be_outside_repository");
  const config = await readLocalSupabaseConfig(workdir, "task013-restore-");
  const api = assertLocalProjectUrl(
    required("TASK013_SUPABASE_URL"),
    config.apiPort,
    "task013_restore_target",
  );
  const serviceKey = assertServiceRoleKey(required("TASK013_SERVICE_ROLE_KEY"));
  const encryptionKey = keyFromBase64(required("TASK013_ENCRYPTION_KEY"));
  const container = containerName(config.projectId);
  await ensureContainer(container);

  const descriptor = JSON.parse(await readFile(path.join(backupDir, "descriptor.json"), "utf8"));
  if (
    descriptor.format !== "flor-da-meia-noite-task013-backup-v1" ||
    !/^task013-test-[a-z0-9-]+$/.test(descriptor.sourceProjectId)
  ) {
    throw new Error("task013_backup_descriptor_invalid");
  }
  const manifestCipher = await readFile(path.join(backupDir, "manifest.enc"));
  const manifestSeal = JSON.parse(
    await readFile(path.join(backupDir, "manifest.seal.json"), "utf8"),
  );
  const manifestText = decryptBuffer(manifestCipher, manifestSeal, encryptionKey).toString("utf8");
  const manifest = JSON.parse(manifestText);
  if (
    manifest.format !== descriptor.format ||
    manifest.backupId !== descriptor.backupId ||
    manifest.sourceProjectId !== descriptor.sourceProjectId ||
    !Array.isArray(manifest.objects) ||
    !Array.isArray(manifest.buckets)
  ) {
    throw new Error("task013_backup_manifest_invalid");
  }
  const seenObjects = new Set();
  for (const item of manifest.objects) {
    const objectKey = safeObjectKey(item.key);
    const pair = item.bucket + "\0" + objectKey;
    if (
      !item.bucket ||
      seenObjects.has(pair) ||
      item.ciphertextFile !== objectArtifactName(item.bucket, objectKey) ||
      !item.encryption ||
      !Number.isSafeInteger(item.plaintextBytes) ||
      item.plaintextBytes < 0
    ) {
      throw new Error("task013_backup_manifest_invalid");
    }
    seenObjects.add(pair);
  }

  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "task013-restore-"));
  try {
    const dumpPath = path.join(tempRoot, "database.dump");
    await decryptFileToFile(
      path.join(backupDir, manifest.database.file),
      dumpPath,
      manifest.database,
      encryptionKey,
    );
    if ((await sha256File(dumpPath)) !== manifest.database.plaintextSha256)
      throw new Error("task013_database_archive_hash_mismatch");
    const restoreToc = await inspectDumpArchive(container, dumpPath);
    const verifiedObjects = [];
    for (const item of manifest.objects) {
      const encryptedPath = path.join(backupDir, "storage", item.ciphertextFile);
      const plainPath = path.join(tempRoot, "object-" + verifiedObjects.length);
      await decryptFileToFile(encryptedPath, plainPath, item.encryption, encryptionKey);
      const size = await stat(plainPath);
      if (
        size.size !== item.plaintextBytes ||
        (await sha256File(plainPath)) !== item.plaintextSha256
      )
        throw new Error("task013_storage_archive_hash_mismatch");
      verifiedObjects.push({ item, plainPath });
    }
    await restoreDatabase(container, dumpPath, restoreToc);
    const buckets = await fetch(`${api.origin}/storage/v1/bucket`, {
      headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
    });
    if (!buckets.ok) throw new Error(`task013_restore_bucket_inventory_failed:${buckets.status}`);
    const existingNames = new Set((await buckets.json()).map((bucket) => bucket.name));
    for (const bucket of manifest.buckets)
      if (!existingNames.has(bucket.name))
        throw new Error("task013_restore_bucket_missing_from_database_archive");
    let restored = 0;
    for (const { item, plainPath } of verifiedObjects) {
      await uploadObject(api.origin, serviceKey, item, plainPath);
      await verifyObject(api.origin, serviceKey, item);
      restored += 1;
    }
    process.stdout.write(
      `${JSON.stringify({ status: "restored_and_verified", backupId: descriptor.backupId, targetProjectId: config.projectId, objectCount: restored })}\n`,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "task013_restore_failed"}\n`);
  process.exitCode = 1;
});
