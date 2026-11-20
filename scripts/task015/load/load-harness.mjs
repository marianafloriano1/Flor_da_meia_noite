import { readFile } from "node:fs/promises";
import { isIP } from "node:net";
import { performance } from "node:perf_hooks";

const profile = {
  sessions: 1000,
  rampMs: 10 * 60_000,
  holdMs: 30 * 60_000,
  rampDownMs: 10 * 60_000,
  mix: { catalog: 35, details_images: 25, cart_checkout: 20, orders: 10, admin_inventory: 10 },
};
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}
function fail(message) {
  console.error(message);
  process.exit(2);
}
const manifestPath = option("--manifest");
const baseValue = option("--base-url");
const scale = Number(option("--duration-scale") ?? 1);
if (!manifestPath || !baseValue || !Number.isFinite(scale) || scale <= 0) {
  fail(
    "usage: node scripts/task015/load/load-harness.mjs --base-url http://127.0.0.1:3215 --manifest <synthetic-fixtures.json> [--duration-scale 1]",
  );
}
if (scale !== 1 && process.env.TASK015_ALLOW_SHORT_RUN !== "1") {
  fail("duration_scale_override_requires_TASK015_ALLOW_SHORT_RUN");
}
let base;
try {
  base = new URL(baseValue);
} catch {
  fail("invalid_base_url");
}
if (
  base.protocol !== "http:" ||
  !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname) ||
  base.username ||
  base.password ||
  base.search ||
  base.hash ||
  (base.hostname !== "localhost" && isIP(base.hostname.replace(/[[\]]/g, "")) === 0)
) {
  fail("load_target_must_be_loopback_http_without_credentials_query_or_fragment");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (
  manifest.kind !== "task015-synthetic-load-v1" ||
  manifest.sessions?.length !== profile.sessions
) {
  fail("manifest_must_contain_exactly_1000_synthetic_sessions");
}
const counts = Object.fromEntries(Object.keys(profile.mix).map((flow) => [flow, 0]));
const ids = new Set();
for (const session of manifest.sessions) {
  if (
    typeof session?.id !== "string" ||
    !session.id.startsWith("task015-") ||
    ids.has(session.id) ||
    !Object.hasOwn(profile.mix, session.flow) ||
    !Array.isArray(session.steps) ||
    session.steps.length === 0
  )
    fail("invalid_or_non_synthetic_session_fixture");
  ids.add(session.id);
  counts[session.flow] += 1;
  for (const step of session.steps) {
    const targetValue = step.url ?? step.path;
    let targetUrl;
    try {
      targetUrl = step.url ? new URL(step.url) : null;
    } catch {
      fail("fixture_contains_invalid_url");
    }
    if (
      typeof targetValue !== "string" ||
      (!step.url && (!step.path.startsWith("/") || step.path.startsWith("//"))) ||
      (step.url &&
        (!targetUrl ||
          targetUrl.protocol !== "http:" ||
          !["127.0.0.1", "localhost", "[::1]"].includes(targetUrl.hostname) ||
          targetUrl.username ||
          targetUrl.password ||
          targetUrl.search ||
          targetUrl.hash)) ||
      step.payment === true ||
      step.external_delivery === true ||
      (step.consumeBody !== undefined && typeof step.consumeBody !== "boolean") ||
      !["GET", "POST", "PUT", "PATCH", "DELETE"].includes(step.method ?? "GET")
    )
      fail("fixture_contains_invalid_path_or_external_side_effect");
  }
}
for (const [flow, percent] of Object.entries(profile.mix)) {
  if (counts[flow] !== (profile.sessions * percent) / 100) fail("invalid_flow_mix:" + flow);
}

const histograms = new Map();
const requestsByFlow = new Map();
const statusCounts = new Map();
let errors = 0;
let serverErrors = 0;
let totalRequests = 0;
let startedSessions = 0;
let peakSessions = 0;
let activeSessions = 0;
function observe(flow, metric, milliseconds) {
  const key = flow + ":" + metric;
  let histogram = histograms.get(key);
  if (!histogram) {
    histogram = new Uint32Array(120_001);
    histograms.set(key, histogram);
  }
  histogram[Math.min(120_000, Math.max(0, Math.ceil(milliseconds)))] += 1;
  requestsByFlow.set(key, (requestsByFlow.get(key) ?? 0) + 1);
}
function percentile(histogram, count, fraction) {
  const target = Math.max(1, Math.ceil(count * fraction));
  let cumulative = 0;
  for (let index = 0; index < histogram.length; index += 1) {
    cumulative += histogram[index];
    if (cumulative >= target) return index;
  }
  return null;
}
function expand(value, session) {
  if (typeof value === "string")
    return value.replaceAll("{{session_id}}", encodeURIComponent(session.id));
  if (Array.isArray(value)) return value.map((item) => expand(item, session));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, expand(item, session)]),
    );
  return value;
}
async function requestStep(session, step) {
  totalRequests += 1;
  const started = performance.now();
  try {
    const expandedTarget = expand(step.url ?? step.path, session);
    const response = await fetch(
      step.url ? new URL(expandedTarget) : new URL(expandedTarget, base),
      {
        method: step.method ?? "GET",
        headers: { accept: "application/json", ...expand(step.headers ?? {}, session) },
        ...(step.body === undefined ? {} : { body: JSON.stringify(expand(step.body, session)) }),
        signal: AbortSignal.timeout(120_000),
        redirect: "manual",
      },
    );
    const key = session.flow + ":" + response.status;
    statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
    const expectedStatuses =
      step.expectedStatus === undefined
        ? null
        : Array.isArray(step.expectedStatus)
          ? step.expectedStatus
          : [step.expectedStatus];
    if (!response.ok || (expectedStatuses && !expectedStatuses.includes(response.status)))
      errors += 1;
    if (response.status >= 500) serverErrors += 1;
    if (step.consumeBody === true && response.body) {
      const reader = response.body.getReader();
      try {
        while (!(await reader.read()).done) {
          // Consume and discard each chunk; response bodies are never accumulated in RAM.
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      await response.body?.cancel().catch(() => {});
    }
    const duration = performance.now() - started;
    observe(session.flow, "all", duration);
    if (step.critical === true) observe(session.flow, "critical", duration);
  } catch {
    errors += 1;
    observe(session.flow, "all", 120_000);
    if (step.critical === true) observe(session.flow, "critical", 120_000);
  }
}
const startedAt = performance.now();
const ramp = profile.rampMs * scale;
const hold = profile.holdMs * scale;
const down = profile.rampDownMs * scale;
const totalDuration = ramp + hold + down;
const workers = manifest.sessions.map(async (session, index) => {
  const position = index / (profile.sessions - 1);
  const startAt = startedAt + ramp * position;
  const stopAt = startedAt + ramp + hold + down * (1 - position);
  if (performance.now() < startAt)
    await new Promise((resolve) => setTimeout(resolve, startAt - performance.now()));
  startedSessions += 1;
  activeSessions += 1;
  peakSessions = Math.max(peakSessions, activeSessions);
  try {
    while (performance.now() < stopAt) {
      for (const step of session.steps) {
        if (performance.now() >= stopAt) break;
        await requestStep(session, step);
      }
    }
  } finally {
    activeSessions -= 1;
  }
});
await Promise.all(workers);
const metrics = {};
for (const [key, histogram] of histograms) {
  const count = requestsByFlow.get(key) ?? 0;
  metrics[key] = {
    count,
    p50_ms: percentile(histogram, count, 0.5),
    p95_ms: percentile(histogram, count, 0.95),
    p99_ms: percentile(histogram, count, 0.99),
    resolution_ms: 1,
    overflow_bucket_ms: 120_000,
  };
}
const criticalP95ByFlow = Object.fromEntries(
  [...histograms]
    .filter(([key]) => key.endsWith(":critical"))
    .map(([key, histogram]) => [
      key.slice(0, -":critical".length),
      percentile(histogram, requestsByFlow.get(key) ?? 0, 0.95),
    ]),
);
const criticalP95Passed =
  Object.keys(criticalP95ByFlow).length > 0 &&
  Object.values(criticalP95ByFlow).every((value) => value !== null && value <= 2000);
const report = {
  task: "TASK-015 load harness",
  target: base.origin,
  profile,
  durationScale: scale,
  durationMs: Math.round(performance.now() - startedAt),
  capturedAt: new Date().toISOString(),
  startedSessions,
  peakSessions,
  totalRequests,
  errors,
  errorRate: totalRequests ? errors / totalRequests : 0,
  serverErrors,
  serverErrorRate: totalRequests ? serverErrors / totalRequests : 0,
  criticalP95LimitMs: 2000,
  criticalP95ByFlowMs: criticalP95ByFlow,
  criticalP95Passed,
  statusCounts: Object.fromEntries(statusCounts),
  metrics,
  payloadsRetained: false,
  localOnly: true,
};
console.log(JSON.stringify(report, null, 2));
if (
  startedSessions !== profile.sessions ||
  peakSessions !== profile.sessions ||
  report.errorRate > 0.01 ||
  report.serverErrorRate > 0.001 ||
  !criticalP95Passed
)
  process.exitCode = 1;
