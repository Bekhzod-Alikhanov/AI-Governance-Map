// Generates public/robots.txt and public/sitemap.xml from the record-page index
// written by scripts/write-public-data.mjs. Runs after that script in the build
// chain so every stable record URL is discoverable by crawlers.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const dataDir = path.join(publicDir, "data");

const SITE_ORIGIN = "https://global-ai-governance-map.vercel.app";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Record pages are stable but change less often than the landing page, and the
// landing page is the only one a crawler should treat as the entry point.
function priorityFor(kind) {
  if (kind === "country") return "0.8";
  if (kind === "instrument" || kind === "rule") return "0.7";
  return "0.6";
}

const recordIndex = JSON.parse(await readFile(path.join(dataDir, "record-page-index.json"), "utf8"));
const releasePackage = JSON.parse(await readFile(path.join(dataDir, "release-package.json"), "utf8"));
const lastmod = releasePackage.snapshotDate ?? new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE_ORIGIN}/`, priority: "1.0" },
  ...recordIndex.map((record) => ({
    loc: record.url ?? `${SITE_ORIGIN}/${record.kind}/${record.id}`,
    priority: priorityFor(record.kind),
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${url.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`;

// Embed cards are framing targets, not pages worth indexing on their own.
const robots = `User-agent: *
Allow: /
Disallow: /embed/

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

await Promise.all([
  writeFile(path.join(publicDir, "sitemap.xml"), sitemap, "utf8"),
  writeFile(path.join(publicDir, "robots.txt"), robots, "utf8"),
]);

console.log(`SEO files written: sitemap.xml (${urls.length} URLs), robots.txt`);
