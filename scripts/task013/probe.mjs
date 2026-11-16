import { pathToFileURL } from "node:url";
import { assertLoopbackUrl } from "./backup-lib.mjs";

const targetPattern = /^[a-z0-9][a-z0-9._-]{0,63}$/;

export function validateProbeTarget(target, allowExternal) {
  if (
    !target ||
    typeof target.name !== "string" ||
    !targetPattern.test(target.name) ||
    typeof target.url !== "string"
  ) {
    throw new Error("task013_probe_target_invalid");
  }
  let url;
  try {
    url = new URL(target.url);
  } catch {
    throw new Error("task013_probe_url_invalid");
  }
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "" && url.pathname !== "/")
  ) {
    throw new Error("task013_probe_url_must_not_include_credentials_or_path");
  }
  if (url.protocol === "http:") assertLoopbackUrl(url.href, "task013_probe");
  else if (url.protocol !== "https:" || !allowExternal)
    throw new Error("task013_external_probe_requires_explicit_enablement");
  return { name: target.name, url };
}

export async function probe(target, timeoutMs = 10000) {
  const started = performance.now();
  let status = 0;
  let timeout = false;
  try {
    const response = await fetch(target.url, {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
    status = response.status;
    await response.body?.cancel();
  } catch (error) {
    timeout = error?.name === "TimeoutError" || error?.name === "AbortError";
  }
  return {
    observedAt: new Date().toISOString(),
    target: target.name,
    status,
    timeout,
    durationMs: Math.round((performance.now() - started) * 100) / 100,
  };
}

async function main() {
  const rawTargets = process.env.TASK013_PROBE_TARGETS;
  if (!rawTargets) throw new Error("task013_probe_targets_missing");
  const allowExternal = process.env.TASK013_EXTERNAL_PROBES_ENABLED === "YES";
  const parsed = JSON.parse(rawTargets);
  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 30)
    throw new Error("task013_probe_targets_invalid");
  const targets = parsed.map((target) => validateProbeTarget(target, allowExternal));
  let failed = false;
  for (const target of targets) {
    const sample = await probe(target);
    if (sample.timeout || sample.status >= 500) failed = true;
    process.stdout.write(JSON.stringify(sample) + "\n");
  }
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write((error instanceof Error ? error.message : "task013_probe_failed") + "\n");
    process.exitCode = 1;
  });
}
