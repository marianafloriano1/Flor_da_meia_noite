import { spawn } from "node:child_process";

const url = process.env.TASK015_TEST_SUPABASE_URL;
const anon = process.env.TASK015_TEST_SUPABASE_ANON_KEY;
const service = process.env.TASK015_TEST_SUPABASE_SERVICE_ROLE_KEY;
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
  !anon ||
  !service ||
  (!projectId?.startsWith("task015-ci-") && !projectId?.startsWith("task015-local-"))
) {
  console.error(
    "TASK015 requires explicitly identified loopback Supabase credentials; no tests were run.",
  );
  process.exit(2);
}
const child = spawn(
  process.execPath,
  ["--test", "--test-reporter=tap", "tests/task015/workflow.integration.test.mjs"],
  { stdio: "inherit", env: process.env },
);
const code = await new Promise((resolveExit) => child.once("exit", resolveExit));
process.exitCode = code ?? 1;
