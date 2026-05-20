import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createServer } from "vite";

const host = "127.0.0.1";
const port = 5173;
const baseURL = `http://${host}:${port}`;
const cliPath = resolve("node_modules", "@playwright", "test", "cli.js");
const args = ["test", ...process.argv.slice(2)];

process.env.VITE_SKIP_DEV_VALIDATION = "1";

const server = await createServer({
  clearScreen: false,
  logLevel: "warn",
  server: {
    host,
    port,
    strictPort: true,
  },
});

await server.listen();

const exitCode = await new Promise((resolveExit) => {
  const child = spawn(process.execPath, [cliPath, ...args], {
    stdio: "inherit",
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: baseURL,
      VITE_SKIP_DEV_VALIDATION: "1",
    },
  });

  child.on("exit", (code) => resolveExit(code ?? 1));
  child.on("error", (error) => {
    console.error(error);
    resolveExit(1);
  });
});

await server.close();
process.exit(exitCode);
