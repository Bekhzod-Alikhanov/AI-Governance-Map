// Emits a static HTML file per stable record route with its own metadata, so a
// shared link to /country/UZB previews as Uzbekistan rather than as the site.
//
// The app is a client-only SPA: crawlers and link-preview bots receive an empty
// <div id="root"> and whatever is in <head>. Every one of the 543 record routes
// therefore shared a single title and Open Graph card, which made the stable
// record URLs useless for the thing they exist for.
//
// This runs after `vite build` and writes dist/<kind>/<id>/index.html — the same
// bundle, with <head> rewritten. Vercel serves the exact-path file when present;
// the SPA rewrites still handle client-side navigation.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const dataDir = path.join(root, "public", "data");

const SITE_ORIGIN = "https://global-ai-governance-map.vercel.app";
const MAX_DESCRIPTION = 200;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Collapse a record summary into one clean sentence for a preview card. */
function toDescription(text, fallback) {
  const raw = (text ?? "").replace(/\s+/g, " ").trim() || fallback;
  if (raw.length <= MAX_DESCRIPTION) return raw;
  const cut = raw.slice(0, MAX_DESCRIPTION);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (lastStop > 80 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`).trim();
}

const KIND_LABEL = {
  country: "Country",
  lab: "Frontier AI lab",
  instrument: "International instrument",
  rule: "National AI rule",
  obligation: "Governance obligation",
  exposure: "Lab regulatory exposure",
  institution: "AI institution",
  "policy-process": "Policy process",
  standard: "Standard / conformity record",
  "public-sector-ai": "Public-sector AI record",
  enforcement: "Enforcement / litigation record",
};

const recordIndex = JSON.parse(await readFile(path.join(dataDir, "record-page-index.json"), "utf8"));
const dataset = JSON.parse(await readFile(path.join(dataDir, "full-dataset.json"), "utf8"));
const shell = await readFile(path.join(dist, "index.html"), "utf8");
const snapshotDate = dataset.snapshotDate ?? "";

// Index every collection by id once, so each record's summary is a lookup.
const summaryById = new Map();
for (const rows of Object.values(dataset.data ?? {})) {
  if (!Array.isArray(rows)) continue;
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const key = row.id ?? row.iso3;
    if (!key || summaryById.has(key)) continue;
    const summary = row.summary ?? row.description ?? row.notes ?? row.status ?? "";
    if (summary) summaryById.set(key, summary);
  }
}

/** Replace a tag's content if present, otherwise leave the shell untouched. */
function setMeta(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function buildPage(record) {
  const kindLabel = KIND_LABEL[record.kind] ?? "Record";
  const title = `${record.name} — ${kindLabel} | AI Governance Map`;
  const description = toDescription(
    summaryById.get(record.id),
    `${kindLabel} record for ${record.name} in the AI Governance Map dataset${snapshotDate ? `, snapshot ${snapshotDate}` : ""}.`
  );
  const url = record.url ?? `${SITE_ORIGIN}/${record.kind}/${record.id}`;

  let html = shell;
  html = setMeta(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = setMeta(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  html = setMeta(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${escapeHtml(url)}" />`);
  html = setMeta(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = setMeta(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = setMeta(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${escapeHtml(url)}" />`);
  html = setMeta(
    html,
    /<meta name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = setMeta(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  return html;
}

export { buildPage, toDescription };

// Matches the CLI detection used in audit-sources.mjs; a hand-rolled file://
// comparison silently fails on Windows, where the URL carries a drive letter.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let written = 0;
  await Promise.all(
    recordIndex.map(async (record) => {
      const dir = path.join(dist, record.kind, record.id);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "index.html"), buildPage(record), "utf8");
      written += 1;
    })
  );
  console.log(`Record previews written: ${written} routes with their own title and Open Graph metadata.`);
}
