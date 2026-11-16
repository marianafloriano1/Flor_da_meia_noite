import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const args = process.argv.slice(2);
const manifestIndex = args.indexOf("--manifest");
if (manifestIndex < 0 || !args[manifestIndex + 1]) {
  console.error(
    "usage: node scripts/task015/load/run-local.mjs --manifest <synthetic-fixtures.json> [--duration-scale 1]",
  );
  process.exit(2);
}
const baseUrl = "http://127.0.0.1:3215";
let supabaseUrl;
try {
  supabaseUrl = new URL(process.env.TASK015_TEST_SUPABASE_URL);
} catch {
  supabaseUrl = null;
}
const anonKey = process.env.TASK015_TEST_SUPABASE_ANON_KEY;
const serviceKey = process.env.TASK015_TEST_SUPABASE_SERVICE_ROLE_KEY;
if (
  !supabaseUrl ||
  supabaseUrl.protocol !== "http:" ||
  !["127.0.0.1", "localhost", "[::1]"].includes(supabaseUrl.hostname) ||
  !anonKey ||
  !serviceKey
) {
  console.error(
    "TASK015 local Supabase endpoint and keys are required; remote targets are forbidden.",
  );
  process.exit(2);
}
const shortRun = args.includes("--duration-scale");
if (shortRun && process.env.TASK015_ALLOW_SHORT_RUN !== "1") {
  console.error("duration_scale_override_requires_TASK015_ALLOW_SHORT_RUN");
  process.exit(2);
}
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const build = spawn(npm, ["run", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
const buildCode = await new Promise((resolveExit) => build.once("exit", resolveExit));
if (buildCode !== 0) process.exit(buildCode ?? 1);

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3215"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl.origin,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
      SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    },
  },
);
let serverReady = false;
try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error("production_server_exited");
    try {
      const response = await fetch(baseUrl + "/auth", { signal: AbortSignal.timeout(1000) });
      if (response.status === 200) {
        serverReady = true;
        break;
      }
    } catch {}
    await delay(1000);
  }
  if (!serverReady) throw new Error("production_server_not_ready_at_local_auth_endpoint");
  const harnessArgs = [
    "scripts/task015/load/load-harness.mjs",
    "--base-url",
    baseUrl,
    "--manifest",
    args[manifestIndex + 1],
    ...(shortRun ? ["--duration-scale", args[args.indexOf("--duration-scale") + 1]] : []),
  ];
  const harness = spawn(process.execPath, harnessArgs, { stdio: "inherit", env: process.env });
  const harnessCode = await new Promise((resolveExit) => harness.once("exit", resolveExit));
  process.exitCode = harnessCode ?? 1;
} finally {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await Promise.race([
      new Promise((resolveExit) => server.once("exit", resolveExit)),
      delay(10_000),
    ]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
