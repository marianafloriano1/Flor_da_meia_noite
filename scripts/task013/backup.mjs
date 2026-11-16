import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, mkdtemp, rename, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import {
  assertLocalProjectUrl,
  assertServiceRoleKey,
  decryptFileToFile,
  encryptBuffer,
  encryptStreamToFile,
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
const now = () => new Date().toISOString();

function dockerContainer(projectId) {
  return `supabase_db_${projectId}`;
}

async function ensureContainer(container) {
  const result = await new Promise((resolve, reject) => {
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
        : reject(new Error("task013_isolated_database_container_missing")),
    );
  });
  const [running, labelsJson] = String(result).split("|", 2);
  let labels;
  try {
    labels = JSON.parse(labelsJson);
  } catch {
    throw new Error("task013_isolated_database_container_identity_mismatch");
  }
  if (
    running !== "true" ||
    labels["com.supabase.cli.project"] !== container.replace("supabase_db_", "")
  )
    throw new Error("task013_isolated_database_container_identity_mismatch");
}

async function dumpDatabase(container, destination, key) {
  const child = spawn(
    "docker",
    [
      "exec",
      container,
      "pg_dump",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "--format=custom",
      "--serializable-deferrable",
      "--no-owner",
    ],
    { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] },
  );
  let spawnError;
  child.on("error", () => {
    spawnError = new Error("task013_pg_dump_unavailable");
  });
  const closed = new Promise((resolve) => child.once("close", resolve));
  let meta;
  try {
    meta = await encryptStreamToFile(Readable.from(child.stdout), destination, key);
  } catch {
    child.kill();
    await rm(destination, { force: true });
    throw new Error("task013_database_dump_failed");
  }
  const code = await closed;
  if (spawnError || code !== 0) {
    await rm(destination, { force: true });
    throw new Error("task013_database_dump_failed");
  }
  return meta;
}

async function inspectDumpArchive(container, encryptedDump, seal, key) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "task013-dump-check-"));
  const plainDump = path.join(tempRoot, "database.dump");
  try {
    await decryptFileToFile(encryptedDump, plainDump, seal, key);
    if ((await sha256File(plainDump)) !== seal.plaintextSha256)
      throw new Error("task013_database_dump_hash_mismatch");
    const child = spawn("docker", ["exec", "-i", container, "pg_restore", "--list"], {
      windowsHide: true,
      stdio: ["pipe", "pipe", "ignore"],
    });
    let output = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => {
      output += chunk;
    });
    const close = new Promise((resolve, reject) => {
      child.on("error", () => reject(new Error("task013_pg_restore_unavailable")));
      child.once("close", (code) =>
        code === 0 ? resolve() : reject(new Error("task013_database_archive_invalid")),
      );
    });
    createReadStream(plainDump).pipe(child.stdin);
    await close;
    if (!hasStorageObjectsDumpEntry(output))
      throw new Error("task013_storage_metadata_missing_from_database_dump");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function requestJson(url, serviceKey, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) throw new Error(`task013_storage_api_failed:${response.status}`);
  return response.json();
}

function storageUrl(base, bucket, key = "") {
  const segments = [bucket, ...key.split("/").filter(Boolean)].map(encodeURIComponent);
  return `${base}/storage/v1/object/${segments.join("/")}`;
}

async function listBucketObjects(base, serviceKey, bucket) {
  const objects = [];
  const queue = [""];
  const visited = new Set();
  while (queue.length) {
    const prefix = queue.shift();
    if (visited.has(prefix)) throw new Error("task013_storage_listing_cycle");
    visited.add(prefix);
    let offset = 0;
    while (true) {
      const rows = await requestJson(
        `${base}/storage/v1/object/list/${encodeURIComponent(bucket)}`,
        serviceKey,
        {
          method: "POST",
          body: JSON.stringify({
            prefix,
            limit: 1000,
            offset,
            sortBy: { column: "name", order: "asc" },
          }),
        },
      );
      if (!Array.isArray(rows)) throw new Error("task013_storage_listing_invalid");
      for (const row of rows) {
        if (typeof row?.name !== "string") throw new Error("task013_storage_listing_invalid");
        const key = safeObjectKey(prefix ? `${prefix}/${row.name}` : row.name);
        if (row.id == null) queue.push(key);
        else
          objects.push({
            key,
            mimeType:
              row.metadata?.mimetype || row.metadata?.mimeType || "application/octet-stream",
            metadata: row.metadata ?? {},
          });
      }
      if (rows.length < 1000) break;
      offset += rows.length;
    }
  }
  return objects;
}

async function encryptObject(base, serviceKey, bucket, object, output, key) {
  const response = await fetch(storageUrl(base, bucket, object.key), {
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
  });
  if (!response.ok || !response.body)
    throw new Error(`task013_storage_download_failed:${response.status}`);
  const encrypted = await encryptStreamToFile(Readable.fromWeb(response.body), output, key);
  return {
    bucket,
    key: object.key,
    mimeType: object.mimeType,
    cacheControl: object.metadata?.cacheControl ?? null,
    metadata: object.metadata,
    plaintextBytes: encrypted.plaintextBytes,
    plaintextSha256: encrypted.plaintextSha256,
    ciphertextFile: path.basename(output),
    ciphertextBytes: (await stat(output)).size,
    encryption: encrypted,
  };
}

async function main() {
  const workdir = path.resolve(required("TASK013_SUPABASE_WORKDIR"));
  const root = path.resolve(required("TASK013_BACKUP_ROOT"));
  if (isWithin(repoRoot, root, path) || isWithin(root, repoRoot, path))
    throw new Error("task013_backup_root_must_be_outside_repository");
  const config = await readLocalSupabaseConfig(workdir, "task013-test-");
  const api = assertLocalProjectUrl(
    required("TASK013_SUPABASE_URL"),
    config.apiPort,
    "task013_source",
  );
  const serviceKey = assertServiceRoleKey(required("TASK013_SERVICE_ROLE_KEY"));
  const encryptionKey = keyFromBase64(required("TASK013_ENCRYPTION_KEY"));
  const container = dockerContainer(config.projectId);
  await ensureContainer(container);

  const backupId = `${new Date().toISOString().replaceAll(/[^0-9TZ]/g, "-")}-${randomUUID()}`;
  const staging = path.join(root, `.${backupId}.partial`);
  const final = path.join(root, backupId);
  const objectRoot = path.join(staging, "storage");
  await mkdir(objectRoot, { recursive: true });
  const startedAt = now();
  try {
    const database = await dumpDatabase(
      container,
      path.join(staging, "database.dump.enc"),
      encryptionKey,
    );
    await inspectDumpArchive(
      container,
      path.join(staging, "database.dump.enc"),
      database,
      encryptionKey,
    );
    const buckets = await requestJson(`${api.origin}/storage/v1/bucket`, serviceKey);
    if (!Array.isArray(buckets)) throw new Error("task013_bucket_inventory_invalid");
    const objects = [];
    for (const bucket of buckets) {
      if (typeof bucket?.name !== "string") throw new Error("task013_bucket_inventory_invalid");
      for (const object of await listBucketObjects(api.origin, serviceKey, bucket.name)) {
        const destination = path.join(objectRoot, objectArtifactName(bucket.name, object.key));
        const record = await encryptObject(
          api.origin,
          serviceKey,
          bucket.name,
          object,
          destination,
          encryptionKey,
        );
        objects.push(record);
      }
    }
    const manifest = {
      format: "flor-da-meia-noite-task013-backup-v1",
      backupId,
      sourceProjectId: config.projectId,
      startedAt,
      completedAt: now(),
      database: { file: "database.dump.enc", ...database },
      buckets: buckets.map(({ name, public: isPublic, file_size_limit: fileSizeLimit }) => ({
        name,
        public: Boolean(isPublic),
        fileSizeLimit: fileSizeLimit ?? null,
      })),
      objects,
    };
    const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
    const sealed = encryptBuffer(manifestBytes, encryptionKey);
    await writeFile(path.join(staging, "manifest.enc"), sealed.ciphertext, {
      flag: "wx",
    });
    await writeFile(
      path.join(staging, "manifest.seal.json"),
      `${JSON.stringify(sealed.meta, null, 2)}\n`,
      { flag: "wx" },
    );
    await writeFile(
      path.join(staging, "descriptor.json"),
      `${JSON.stringify({ format: manifest.format, backupId, sourceProjectId: config.projectId, completedAt: manifest.completedAt, encryptedManifestSha256: sealed.meta.ciphertextSha256 }, null, 2)}\n`,
      { flag: "wx" },
    );
    await rename(staging, final);
    process.stdout.write(
      `${JSON.stringify({ status: "complete", backupId, projectId: config.projectId, objectCount: objects.length, directory: final })}\n`,
    );
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    process.stderr.write(`${error instanceof Error ? error.message : "task013_backup_failed"}\n`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "task013_backup_failed"}\n`);
  process.exitCode = 1;
});
