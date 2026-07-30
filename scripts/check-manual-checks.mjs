// Fails when a manual source-verification override has outlived its expiry date,
// or has no expiry date at all.
//
// A manual check records a human confirming something automation cannot reach.
// That confirmation ages: the Council of Europe override expired on 5 July 2026
// and nothing surfaced it, so the dataset kept reporting a treaty status nobody
// had re-checked. This turns that into a build failure.
import { readFile } from "node:fs/promises";
import path from "node:path";

// Matches AGEING_AFTER_DAYS in src/utils/verificationAge.ts, and the interval
// already used by the g7-hiroshima-statement entry.
const EXPIRY_WINDOW_DAYS = 90;

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
  console.error(
    `NO EXPIRY  ${check.recordId} — manual verification has no expiresOn, so it can never lapse. ` +
      `Add expiresOn (convention: lastChecked + ${EXPIRY_WINDOW_DAYS} days), or mark the record superseded.`
  );
}

console.log(
  `Manual source checks: ${checks.length} total, ${expired.length} expired, ${undated.length} without an expiry date.`
);

// An override with no expiry is not a smaller problem than an expired one — it
// is the same problem with the alarm disabled. A human wrote "I checked this on
// this date"; without an expiry that dated act silently becomes a permanent
// claim, which is exactly how the Council of Europe status went stale. Both
// conditions fail the build.
if (expired.length > 0 || undated.length > 0) process.exit(1);
