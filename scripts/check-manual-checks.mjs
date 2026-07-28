// Fails when a manual source-verification override has outlived its expiry date.
//
// A manual check records a human confirming something automation cannot reach.
// That confirmation ages: the Council of Europe override expired on 5 July 2026
// and nothing surfaced it, so the dataset kept reporting a treaty status nobody
// had re-checked. This turns that into a build failure.
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "src", "data", "sourceLinkManualChecks.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
const checks = config.manualChecks ?? [];

const today = new Date().toISOString().slice(0, 10);
const expired = checks.filter((check) => check.expiresOn && today > check.expiresOn);
const undated = checks.filter((check) => !check.expiresOn);

for (const check of expired) {
  console.error(
    `EXPIRED  ${check.recordId} — manual verification lapsed on ${check.expiresOn}. ` +
      `Re-check ${check.sourceUrl} and update lastChecked/expiresOn, or mark the record superseded.`
  );
}
for (const check of undated) {
  console.warn(`no expiry  ${check.recordId} — consider adding expiresOn so this cannot age silently.`);
}

console.log(
  `Manual source checks: ${checks.length} total, ${expired.length} expired, ${undated.length} without an expiry date.`
);

if (expired.length > 0) process.exit(1);
