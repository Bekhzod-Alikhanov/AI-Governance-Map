import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const distRoot = path.join(process.cwd(), "dist");
const distAssets = path.join(process.cwd(), "dist", "assets");
const budgets = {
  maxInitialJsBytes: 725_000,
  maxInitialGzipBytes: 220_000,
  maxAtlasChunkBytes: 430_000,
  maxCorpusChunkBytes: 40_000,
  // Total JS includes optional lazy research-workbench, Atlas, dossier, and corpus modules.
  // Keep initial-load budgets strict; allow a narrow ceiling for richer lazy research tools.
  maxTotalJsBytes: 1_500_000,
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
const atlasRows = rows.filter((row) => /aiAtlas/i.test(row.file));
const atlasChunkBytes = atlasRows.reduce((sum, row) => sum + row.bytes, 0);
const corpusRows = rows.filter((row) => /researchCorpus|policyBrief/i.test(row.file));
const corpusChunkBytes = corpusRows.reduce((sum, row) => sum + row.bytes, 0);

const issues = [];
if (initialJsBytes > budgets.maxInitialJsBytes) {
  issues.push(`Initial JS ${initialJsBytes} exceeds budget ${budgets.maxInitialJsBytes}`);
}
if (initialGzipBytes > budgets.maxInitialGzipBytes) {
  issues.push(`Initial JS gzip ${initialGzipBytes} exceeds budget ${budgets.maxInitialGzipBytes}`);
}
if (atlasChunkBytes > budgets.maxAtlasChunkBytes) {
  issues.push(`Atlas lazy chunk ${atlasChunkBytes} exceeds budget ${budgets.maxAtlasChunkBytes}`);
}
if (corpusChunkBytes > budgets.maxCorpusChunkBytes) {
  issues.push(`Corpus lazy chunk ${corpusChunkBytes} exceeds budget ${budgets.maxCorpusChunkBytes}`);
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
      atlasChunkBytes,
      corpusChunkBytes,
      totalJsBytes,
      chunks: rows.sort((a, b) => b.bytes - a.bytes).slice(0, 12),
      issues,
    },
    null,
    2
  )
);

if (issues.length) process.exit(1);
