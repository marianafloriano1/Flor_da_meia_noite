import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const summaryPath = process.argv[2];
const apiUrl = process.env.TASK015_TEST_SUPABASE_URL;
const api = (() => {
  try {
    return new URL(apiUrl);
  } catch {
    return null;
  }
})();
if (
  !summaryPath ||
  !api ||
  api.protocol !== "http:" ||
  !["127.0.0.1", "localhost", "[::1]"].includes(api.hostname)
) {
  console.error("task015_headless_image_benchmark_requires_ephemeral_loopback_storage");
  process.exit(2);
}

const summary = JSON.parse(await readFile(summaryPath, "utf8"));
if (
  !Array.isArray(summary.products) ||
  summary.products.length !== 5 ||
  summary.products.some((item) => !item.objectKey || !item.sha256)
) {
  console.error("task015_headless_image_benchmark_requires_five_verified_fixtures");
  process.exit(2);
}
const images = summary.products.map((item) => ({
  name: item.objectKey.split("/").at(-1),
  url: `${api.origin}/storage/v1/object/public/catalog/${item.objectKey}`,
  width: item.width,
  height: item.height,
  bytes: item.bytes,
  sha256: item.sha256,
}));

const profileDir = await mkdtemp(join(tmpdir(), "task015-chromium-"));
const chrome = spawn(
  process.env.CHROME_BIN || "google-chrome",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profileDir}`,
    "--remote-debugging-port=0",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "ignore"] },
);
let chromeError = false;
chrome.on("error", () => {
  chromeError = true;
});

let socket;
let nextId = 0;
const pending = new Map();
let reportWritten = false;
async function cdp(method, params = {}) {
  const id = ++nextId;
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("cdp_command_timeout"));
    }, 120_000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
function connect(wsUrl) {
  socket = new WebSocket(wsUrl);
  socket.addEventListener("message", (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    if (message.id === undefined) return;
    const item = pending.get(message.id);
    if (!item) return;
    clearTimeout(item.timer);
    pending.delete(message.id);
    if (message.error) item.reject(new Error("cdp_command_failed:" + message.error.code));
    else item.resolve(message.result ?? {});
  });
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("cdp_connection_failed")), {
      once: true,
    });
  });
}
async function browserTarget() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (chromeError || chrome.exitCode !== null) throw new Error("headless_chromium_exited");
    try {
      const active = (await readFile(join(profileDir, "DevToolsActivePort"), "utf8"))
        .trim()
        .split(/\r?\n/);
      const port = Number(active[0]);
      if (Number.isInteger(port) && port > 0) {
        const response = await fetch(`http://127.0.0.1:${port}/json/list`);
        if (response.ok) {
          const targets = await response.json();
          const page = targets.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
          if (page) return page.webSocketDebuggerUrl;
        }
      }
    } catch {}
    await delay(500);
  }
  throw new Error("headless_chromium_devtools_unavailable");
}
function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] : null;
}
async function sample(url) {
  const result = await cdp("Runtime.evaluate", {
    expression: `(async()=>{const image=new Image();const started=performance.now();image.src=${JSON.stringify(url)};await image.decode();return {decodeAndTransferMs:+(performance.now()-started).toFixed(3),width:image.naturalWidth,height:image.naturalHeight}})()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails || !result.result?.value) return null;
  return result.result.value;
}
async function writeReport(report) {
  console.log(JSON.stringify(report, null, 2));
  reportWritten = true;
}

try {
  await connect(await browserTarget());
  await cdp("Page.enable");
  await cdp("Runtime.enable");
  const userAgent = await cdp("Runtime.evaluate", {
    expression: "navigator.userAgent",
    returnByValue: true,
  });
  await cdp("Network.enable");
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await cdp("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp("Network.emulateNetworkConditions", {
    offline: false,
    latency: 100,
    downloadThroughput: 1_250_000,
    uploadThroughput: 250_000,
    connectionType: "cellular4g",
  });

  const results = [];
  for (const image of images) {
    await cdp("Network.setCacheDisabled", { cacheDisabled: true });
    const cold = [];
    let coldFailures = 0;
    for (let index = 0; index < 30; index += 1) {
      const value = await sample(image.url);
      if (!value) coldFailures += 1;
      else cold.push(value);
    }

    await cdp("Network.setCacheDisabled", { cacheDisabled: false });
    const warmup = await sample(image.url);
    const warm = [];
    let warmFailures = warmup ? 0 : 1;
    for (let index = 0; index < 30; index += 1) {
      const value = await sample(image.url);
      if (!value) warmFailures += 1;
      else warm.push(value);
    }
    results.push({
      image: image.name,
      sourceBytes: image.bytes,
      sourceSha256: image.sha256,
      sourceDimensions: { width: image.width, height: image.height },
      cold: {
        samples: cold.length,
        failures: coldFailures,
        p50_ms: percentile(
          cold.map((item) => item.decodeAndTransferMs),
          0.5,
        ),
        p95_ms: percentile(
          cold.map((item) => item.decodeAndTransferMs),
          0.95,
        ),
        p99_ms: percentile(
          cold.map((item) => item.decodeAndTransferMs),
          0.99,
        ),
      },
      warm: {
        samples: warm.length,
        failures: warmFailures,
        p50_ms: percentile(
          warm.map((item) => item.decodeAndTransferMs),
          0.5,
        ),
        p95_ms: percentile(
          warm.map((item) => item.decodeAndTransferMs),
          0.95,
        ),
        p99_ms: percentile(
          warm.map((item) => item.decodeAndTransferMs),
          0.99,
        ),
      },
      decodedDimensions: cold[0] ? { width: cold[0].width, height: cold[0].height } : null,
    });
  }

  const report = {
    task: "TASK-015 image performance benchmark",
    capturedAt: new Date().toISOString(),
    environment:
      "GitHub-hosted Ubuntu; headless Chromium; mobile viewport emulation; not physical Android hardware",
    browser: userAgent.result?.value ?? "Chromium headless",
    profile: {
      viewport: "390x844",
      mobile: true,
      cpuThrottle: "4x",
      network: { type: "cellular4g", downMbps: 10, upMbps: 2, latencyMs: 100 },
      coldSamplesPerImage: 30,
      warmSamplesPerImage: 30,
    },
    coldP95LimitMs: 2000,
    physicalAndroidReferenceSatisfied: false,
    images: results,
    coldP95Passed:
      results.length === 5 &&
      results.every(
        (item) =>
          item.cold.samples === 30 &&
          item.cold.failures === 0 &&
          item.cold.p95_ms !== null &&
          item.cold.p95_ms <= 2000,
      ),
    warmMeasurementsComplete:
      results.length === 5 &&
      results.every((item) => item.warm.samples === 30 && item.warm.failures === 0),
  };
  await writeReport(report);
  if (!report.coldP95Passed || !report.warmMeasurementsComplete) process.exitCode = 1;
} catch (error) {
  if (!reportWritten) {
    await writeReport({
      task: "TASK-015 image performance benchmark",
      status: "failed",
      failure:
        error?.message === "headless_chromium_exited" ||
        error?.message === "headless_chromium_devtools_unavailable"
          ? error.message
          : "image_benchmark_execution_failed",
      physicalAndroidReferenceSatisfied: false,
    });
  }
  process.exitCode = 1;
} finally {
  socket?.close();
  if (chrome.exitCode === null) {
    chrome.kill("SIGTERM");
    await Promise.race([new Promise((resolve) => chrome.once("exit", resolve)), delay(5_000)]);
    if (chrome.exitCode === null) chrome.kill("SIGKILL");
  }
  await rm(profileDir, { recursive: true, force: true });
}
