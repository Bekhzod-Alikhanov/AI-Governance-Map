import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const distAssets = path.join(process.cwd(), "dist", "assets");
const budgets = {
  maxInitialJsBytes: 850_000,
  maxAtlasChunkBytes: 430_000,
  maxTotalJsBytes: 1_400_000,
};

const files = await readdir(distAssets);
const jsFiles = files.filter((file) => file.endsWith(".js"));
const rows = [];

for (const file of jsFiles) {
  const fullPath = path.join(distAssets, file);
  const info = await stat(fullPath);
  rows.push({ file, bytes: info.size });
}

const totalJsBytes = rows.reduce((sum, row) => sum + row.bytes, 0);
const initialRows = rows.filter((row) => !/NetworkView|TimelineView|TableView|WorkbenchView|aiAtlas/i.test(row.file));
const initialJsBytes = initialRows.reduce((sum, row) => sum + row.bytes, 0);
const atlasRows = rows.filter((row) => /aiAtlas/i.test(row.file));
const atlasChunkBytes = atlasRows.reduce((sum, row) => sum + row.bytes, 0);

const issues = [];
if (initialJsBytes > budgets.maxInitialJsBytes) {
  issues.push(`Initial JS ${initialJsBytes} exceeds budget ${budgets.maxInitialJsBytes}`);
}
if (atlasChunkBytes > budgets.maxAtlasChunkBytes) {
  issues.push(`Atlas lazy chunk ${atlasChunkBytes} exceeds budget ${budgets.maxAtlasChunkBytes}`);
}
if (totalJsBytes > budgets.maxTotalJsBytes) {
  issues.push(`Total JS ${totalJsBytes} exceeds budget ${budgets.maxTotalJsBytes}`);
}

console.log(
  JSON.stringify(
    {
      ok: issues.length === 0,
      budgets,
      initialJsBytes,
      atlasChunkBytes,
      totalJsBytes,
      chunks: rows.sort((a, b) => b.bytes - a.bytes).slice(0, 12),
      issues,
    },
    null,
    2
  )
);

if (issues.length) process.exit(1);
