import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

export function keyFromBase64(value) {
  if (!value) throw new Error("task013_encryption_key_missing");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32 || key.toString("base64").replace(/=+$/, "") !== value.replace(/=+$/, "")) {
    throw new Error("task013_encryption_key_must_be_32_byte_base64");
  }
  return key;
}

export function encryptBuffer(input, key) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([cipher.update(input), cipher.final()]);
  return {
    ciphertext,
    meta: {
      algorithm: "aes-256-gcm",
      nonce: nonce.toString("hex"),
      tag: cipher.getAuthTag().toString("hex"),
      plaintextSha256: createHash("sha256").update(input).digest("hex"),
      ciphertextSha256: createHash("sha256").update(ciphertext).digest("hex"),
      plaintextBytes: input.length,
    },
  };
}

export function decryptBuffer(ciphertext, meta, key) {
  if (
    meta.algorithm !== "aes-256-gcm" ||
    createHash("sha256").update(ciphertext).digest("hex") !== meta.ciphertextSha256
  )
    throw new Error("task013_ciphertext_integrity_failed");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(meta.nonce, "hex"));
  decipher.setAuthTag(Buffer.from(meta.tag, "hex"));
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  if (
    plaintext.length !== meta.plaintextBytes ||
    createHash("sha256").update(plaintext).digest("hex") !== meta.plaintextSha256
  )
    throw new Error("task013_plaintext_integrity_failed");
  return plaintext;
}

export async function sha256File(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

export async function encryptStreamToFile(source, destination, key) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const hash = createHash("sha256");
  let plaintextBytes = 0;
  const meter = new Transform({
    transform(chunk, _encoding, callback) {
      plaintextBytes += chunk.length;
      hash.update(chunk);
      callback(null, chunk);
    },
  });
  await pipeline(source, meter, cipher, createWriteStream(destination, { flags: "wx" }));
  return {
    algorithm: "aes-256-gcm",
    nonce: nonce.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    plaintextSha256: hash.digest("hex"),
    ciphertextSha256: await sha256File(destination),
    plaintextBytes,
  };
}

export async function decryptFileToFile(source, destination, meta, key) {
  if (meta.algorithm !== "aes-256-gcm" || (await sha256File(source)) !== meta.ciphertextSha256)
    throw new Error("task013_ciphertext_integrity_failed");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(meta.nonce, "hex"));
  decipher.setAuthTag(Buffer.from(meta.tag, "hex"));
  const hash = createHash("sha256");
  let plaintextBytes = 0;
  const meter = new Transform({
    transform(chunk, _encoding, callback) {
      plaintextBytes += chunk.length;
      hash.update(chunk);
      callback(null, chunk);
    },
  });
  try {
    await pipeline(
      createReadStream(source),
      decipher,
      meter,
      createWriteStream(destination, { flags: "wx" }),
    );
    if (plaintextBytes !== meta.plaintextBytes || hash.digest("hex") !== meta.plaintextSha256)
      throw new Error("task013_plaintext_integrity_failed");
  } catch (error) {
    await rm(destination, { force: true });
    throw error;
  }
}

export function safeObjectKey(key) {
  if (
    typeof key !== "string" ||
    !key ||
    key.includes("\\") ||
    key.includes("\0") ||
    key.startsWith("/")
  )
    throw new Error("task013_invalid_storage_object_key");
  const parts = key.split("/");
  if (parts.some((part) => !part || part === "." || part === ".."))
    throw new Error("task013_invalid_storage_object_key");
  return parts.join("/");
}

export function assertLoopbackUrl(raw, label) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label}_url_invalid`);
  }
  const allowed = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "host.docker.internal"]);
  if (!allowed.has(url.hostname.toLowerCase())) throw new Error(`${label}_must_be_localhost`);
  return url;
}

export function isWithin(parent, candidate, pathApi) {
  const relative = pathApi.relative(pathApi.resolve(parent), pathApi.resolve(candidate));
  return (
    relative === "" ||
    (!relative.startsWith(`..${pathApi.sep}`) && relative !== ".." && !pathApi.isAbsolute(relative))
  );
}

export async function readLocalSupabaseConfig(workdir, expectedPrefix) {
  const configPath = path.join(path.resolve(workdir), "supabase", "config.toml");
  const text = await readFile(configPath, "utf8");
  const projectId = text.match(/^project_id\s*=\s*"([^"]+)"/m)?.[1];
  const apiPort = Number(text.match(/^\[api\][\s\S]*?^port\s*=\s*(\d+)/m)?.[1]);
  const dbPort = Number(text.match(/^\[db\][\s\S]*?^port\s*=\s*(\d+)/m)?.[1]);
  if (!projectId || !new RegExp(`^${expectedPrefix}[a-z0-9-]+$`).test(projectId)) {
    throw new Error("task013_isolated_project_id_required");
  }
  if (
    !Number.isInteger(apiPort) ||
    !Number.isInteger(dbPort) ||
    apiPort < 1024 ||
    dbPort < 1024 ||
    apiPort === dbPort
  ) {
    throw new Error("task013_local_ports_invalid");
  }
  if (projectId === "flor-da-meia-noite-local") throw new Error("task013_shared_project_forbidden");
  return { projectId, apiPort, dbPort, configPath };
}

export function assertLocalProjectUrl(raw, expectedPort, label) {
  const url = assertLoopbackUrl(raw, label);
  if (
    !new Set(["127.0.0.1", "localhost"]).has(url.hostname.toLowerCase()) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "" && url.pathname !== "/") ||
    url.protocol !== "http:" ||
    Number(url.port) !== expectedPort
  ) {
    throw new Error(`${label}_does_not_match_isolated_project`);
  }
  return url;
}

export function assertServiceRoleKey(raw) {
  if (typeof raw !== "string") throw new Error("task013_local_service_key_missing");
  const [header, payload, signature, extra] = raw.split(".");
  if (!header || !payload || !signature || extra !== undefined)
    throw new Error("task013_local_service_key_invalid");
  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new Error("task013_local_service_key_invalid");
  }
  if (claims.role !== "service_role")
    throw new Error("task013_service_role_required_for_local_backup");
  return raw;
}

export function hasStorageObjectsDumpEntry(entries) {
  return (
    typeof entries === "string" &&
    /^\s*\d+;\s+\d+\s+\d+\s+TABLE DATA\s+storage\s+objects\s+/im.test(entries)
  );
}

export function attachedPartitionTables(entries) {
  if (typeof entries !== "string") throw new Error("task013_pg_restore_toc_invalid");
  const attached = new Map();
  for (const line of entries.split(/\r?\n/)) {
    const match = line.match(/^\s*\d+;\s+0\s+0\s+TABLE ATTACH\s+(\S+)\s+(\S+)/);
    if (match) attached.set(`${match[1]}\0${match[2]}`, [match[1], match[2]]);
  }
  for (const [schema, table] of attached.values())
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema) || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(table))
      throw new Error("task013_pg_restore_partition_name_invalid");
  return [...attached.values()];
}

export function objectArtifactName(bucket, key) {
  return (
    createHash("sha256")
      .update(bucket + "\0" + safeObjectKey(key))
      .digest("hex") + ".enc"
  );
}
