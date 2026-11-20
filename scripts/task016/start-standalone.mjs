import { cp, access, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");
const staticRoot = path.join(projectRoot, ".next", "static");
const serverFile = path.join(standaloneRoot, "server.js");

for (const required of [serverFile, staticRoot]) {
  try {
    await access(required);
  } catch {
    throw new Error(`Build incompleto: recurso ausente: ${path.relative(projectRoot, required)}`);
  }
}

const standaloneNext = path.join(standaloneRoot, ".next");
await mkdir(standaloneNext, { recursive: true });
await cp(staticRoot, path.join(standaloneNext, "static"), { recursive: true, force: true });
const publicRoot = path.join(projectRoot, "public");
if (existsSync(publicRoot)) {
  await cp(publicRoot, path.join(standaloneRoot, "public"), { recursive: true, force: true });
}

const port = process.env.PORT || "3001";
const host = process.env.TASK016_HOST || "127.0.0.1";
console.log(`Servindo build standalone local em http://${host}:${port}`);
const child = spawn(process.execPath, ["server.js"], {
  cwd: standaloneRoot,
  env: { ...process.env, NODE_ENV: "production", HOSTNAME: host, PORT: port },
  stdio: "inherit",
});
child.on("error", (error) => {
  console.error(`Não foi possível iniciar o servidor: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
process.once("SIGINT", () => child.kill("SIGINT"));
process.once("SIGTERM", () => child.kill("SIGTERM"));