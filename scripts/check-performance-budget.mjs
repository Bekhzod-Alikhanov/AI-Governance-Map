import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const distRoot = path.join(process.cwd(), "dist");
const distAssets = path.join(process.cwd(), "dist", "assets");
const budgets = {
  maxInitialJsBytes: 725_000,
  maxInitialGzipBytes: 220_000,
  // Workbench is the default route. Count its complete static dependency closure,
  // rather than only the scripts referenced directly by index.html, so a large
  // route dependency cannot hide behind a dynamic-import boundary.
  maxDefaultRouteGzipBytes: 270_000,
  maxAtlasChunkBytes: 430_000,
  // Corpus rows are source/caveat-heavy text and are loaded lazily; transfer size is
  // the useful budget here because the repeated source language compresses well.
  // Raised 20_000 -> 20_500 after the answer-selector closure changed
  // content-addressed dependency filenames while aggregate uncompressed corpus
  // bytes remained 81,591. This 2.5% tolerance avoids one-byte hash/compression
  // churn becoming a false regression while preserving a deliberately tight cap.
  maxCorpusGzipBytes: 20_500,
  // Total JS includes optional lazy research-workbench, Atlas, dossier, and corpus modules.
  // Keep initial-load budgets strict; allow a narrow ceiling for richer lazy research tools.
  // Raised 1_550_000 -> 1_600_000 for the AI litigation/enforcement corpus expansion
  // (lazy chunk only; initial-load budgets above are unchanged).
  // Raised 1_600_000 -> 1_610_000 for shareable map-mode URL state, browser-history
  // navigation, and the international-participation map tier. Initial-load budgets
  // above are unchanged; ~500 B of this lands in the initial chunk.
  // NOTE: every change to this number must be recorded here and reflected in the
  // README performance table, which is generated from `--json` output.
  maxTotalJsBytes: 1_610_000,
};

const files = await readdir(distAssets);
const jsFiles = files.filter((file) => file.endsWith(".js"));
const rows = [];

for (const file of jsFiles) {
  const fullPath = path.join(distAssets, file);
  const info = await stat(fullPath);
  const content = await readFile(fullPath);
  rows.push({ file, bytes: info.size, gzipBytes: gzipSync(content).length });
}

const indexHtml = await readFile(path.join(distRoot, "index.html"), "utf8");
const initialFileNames = new Set(
  [...indexHtml.matchAll(/(?:src|href)="(?:\.\/|\/)?assets\/([^"]+\.js)"/g)].map((match) => match[1])
);
const totalJsBytes = rows.reduce((sum, row) => sum + row.bytes, 0);
const initialRows = rows.filter((row) => initialFileNames.has(row.file));
const initialJsBytes = initialRows.reduce((sum, row) => sum + row.bytes, 0);
const initialGzipBytes = initialRows.reduce((sum, row) => sum + row.gzipBytes, 0);
const workbenchRow = rows.find((row) => /^WorkbenchView-.*\.js$/i.test(row.file));

function staticImports(file) {
  const content = fileContents.get(file)?.toString("utf8") ?? "";
  return [...content.matchAll(/(?:\bfrom|\bimport)\s*["']\.\/([^"']+\.js)["']/g)].map(
    (match) => match[1],
  );
}

const fileContents = new Map();
for (const row of rows) {
  fileContents.set(row.file, await readFile(path.join(distAssets, row.file)));
}

const defaultRouteFileNames = new Set(initialFileNames);
if (workbenchRow) defaultRouteFileNames.add(workbenchRow.file);
const importQueue = [...defaultRouteFileNames];
while (importQueue.length) {
  const file = importQueue.pop();
  if (!file) continue;
  for (const importedFile of staticImports(file)) {
    if (!defaultRouteFileNames.has(importedFile)) {
      defaultRouteFileNames.add(importedFile);
      importQueue.push(importedFile);
    }
  }
}
const defaultRouteRows = rows.filter((row) => defaultRouteFileNames.has(row.file));
const defaultRouteJsBytes = defaultRouteRows.reduce((sum, row) => sum + row.bytes, 0);
const defaultRouteGzipBytes = defaultRouteRows.reduce((sum, row) => sum + row.gzipBytes, 0);
const atlasRows = rows.filter((row) => /aiAtlas/i.test(row.file));
const atlasChunkBytes = atlasRows.reduce((sum, row) => sum + row.bytes, 0);
const corpusRows = rows.filter((row) => /researchCorpus|policyBrief/i.test(row.file));
const corpusChunkBytes = corpusRows.reduce((sum, row) => sum + row.bytes, 0);
const corpusGzipBytes = corpusRows.reduce((sum, row) => sum + row.gzipBytes, 0);

const issues = [];
if (initialJsBytes > budgets.maxInitialJsBytes) {
  issues.push(`Initial JS ${initialJsBytes} exceeds budget ${budgets.maxInitialJsBytes}`);
}
if (initialGzipBytes > budgets.maxInitialGzipBytes) {
  issues.push(`Initial JS gzip ${initialGzipBytes} exceeds budget ${budgets.maxInitialGzipBytes}`);
}
if (!workbenchRow) {
  issues.push("Default Workbench route chunk was not found");
}
if (defaultRouteGzipBytes > budgets.maxDefaultRouteGzipBytes) {
  issues.push(
    `Default Workbench route gzip ${defaultRouteGzipBytes} exceeds budget ${budgets.maxDefaultRouteGzipBytes}`,
  );
}
if (atlasChunkBytes > budgets.maxAtlasChunkBytes) {
  issues.push(`Atlas lazy chunk ${atlasChunkBytes} exceeds budget ${budgets.maxAtlasChunkBytes}`);
}
if (corpusGzipBytes > budgets.maxCorpusGzipBytes) {
  issues.push(`Corpus lazy gzip ${corpusGzipBytes} exceeds budget ${budgets.maxCorpusGzipBytes}`);
}
if (totalJsBytes > budgets.maxTotalJsBytes) {
  issues.push(`Total JS ${totalJsBytes} exceeds budget ${budgets.maxTotalJsBytes}`);
}

console.log(
  JSON.stringify(
    {
      ok: issues.length === 0,
      budgets,
      initialFiles: [...initialFileNames].sort(),
      initialJsBytes,
      initialGzipBytes,
      defaultRouteFiles: [...defaultRouteFileNames].sort(),
      defaultRouteJsBytes,
      defaultRouteGzipBytes,
      atlasChunkBytes,
      corpusChunkBytes,
      corpusGzipBytes,
      totalJsBytes,
      chunks: rows.sort((a, b) => b.bytes - a.bytes).slice(0, 12),
      issues,
    },
    null,
    2
  )
);

if (issues.length) process.exit(1);
