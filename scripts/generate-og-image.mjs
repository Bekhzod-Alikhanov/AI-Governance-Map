// Renders the live map to public/og-image.png at 1200x630, the size social
// platforms expect for a large link-preview card. Run manually after visual
// changes to the map: `npm run data:og`. Requires a built or running dev app.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const OUT = path.join(root, "public", "og-image.png");
const PORT = 4319;
const URL = `http://localhost:${PORT}/?lens=geography`;

const preview = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  cwd: root,
  stdio: "ignore",
  shell: process.platform === "win32",
});

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(URL);
      if (response.ok) return;
    } catch {
      // server not up yet
    }
    await delay(300);
  }
  throw new Error(`Preview server did not start on port ${PORT}`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(URL, { waitUntil: "networkidle" });

  // Let the projection settle, then drop the chrome that would be meaningless
  // in a static card: header, filter toolbar, and the floating map controls.
  await page.waitForSelector("main svg", { timeout: 15_000 });
  await page.addStyleTag({
    content: `
      header, [data-filter-toolbar] { display: none !important; }
      main > div:has(> select#map-focus-select) { display: none !important; }
      main button[aria-label="Maximize map"] { display: none !important; }
      main label:has(> input[type="checkbox"]) { display: none !important; }
    `,
  });
  await delay(1200);

  await page.screenshot({ path: OUT, type: "png" });
  console.log(`OG image written: ${path.relative(root, OUT)} (1200x630)`);
} finally {
  await browser?.close();
  preview.kill();
}
