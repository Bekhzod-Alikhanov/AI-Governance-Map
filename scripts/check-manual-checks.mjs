// Audits every time-boxed manual source check in the two data stores that can
// carry one. Imports are side-effect free so the normalization and expiry
// policy can be tested with fixtures.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DAY_MS = 86_400_000;
const DUE_SOON_DAYS = 14;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function collectManualChecks(manualLinkConfig = {}, sourceDeltaConfig = {}) {
  const manualLinkChecks = (manualLinkConfig.manualChecks ?? []).map((check) => ({
    id: check.recordId,
    sourceUrl: check.sourceUrl,
    reviewedAt: check.lastChecked,
    validUntil: check.expiresOn,
  }));
  const monitorChecks = (sourceDeltaConfig.monitors ?? [])
    .filter((monitor) => monitor.manualVerification)
    .map((monitor) => ({
      id: monitor.id,
      sourceUrl: monitor.sourceUrl,
      reviewedAt: monitor.manualVerification.reviewedAt,
      validUntil: monitor.manualVerification.validUntil,
    }));

  return [...manualLinkChecks, ...monitorChecks];
}

export function auditManualChecks(checks, today = new Date().toISOString().slice(0, 10)) {
  const expired = [];
  const undated = [];
  const dueSoon = [];
  const invalidReviewDates = [];
  const messages = [];
  const todayTime = parseIsoDate(today);

  if (todayTime === null) throw new TypeError(`Invalid audit date: ${today}`);

  for (const check of checks) {
    const reviewedAtTime = parseIsoDate(check.reviewedAt);
    if (!check.reviewedAt) {
      invalidReviewDates.push(check);
      messages.push(
        `INVALID REVIEW  ${check.id} — manual verification has no reviewed-at date. ` +
          `Re-check ${check.sourceUrl} and add reviewedAt/lastChecked.`
      );
    } else if (reviewedAtTime === null) {
      invalidReviewDates.push(check);
      messages.push(
        `INVALID REVIEW  ${check.id} — manual verification has an invalid reviewed-at date (${check.reviewedAt}). ` +
          `Re-check ${check.sourceUrl} and add a real ISO calendar date.`
      );
    } else if (reviewedAtTime > todayTime) {
      invalidReviewDates.push(check);
      messages.push(
        `INVALID REVIEW  ${check.id} — reviewed-at date ${check.reviewedAt} is after audit date ${today}. ` +
          `Re-check ${check.sourceUrl} and correct the review date.`
      );
    }

    if (!check.validUntil) {
      undated.push(check);
      messages.push(
        `NO EXPIRY  ${check.id} — manual verification has no valid-until date. ` +
          `Re-check ${check.sourceUrl} and add validUntil/expiresOn, or mark the record superseded.`
      );
      continue;
    }

    const validUntilTime = parseIsoDate(check.validUntil);
    if (validUntilTime === null) {
      undated.push(check);
      messages.push(
        `NO EXPIRY  ${check.id} — manual verification has an invalid valid-until date (${check.validUntil}). ` +
          `Re-check ${check.sourceUrl} and add a valid ISO date, or mark the record superseded.`
      );
      continue;
    }

    if (reviewedAtTime !== null && reviewedAtTime > validUntilTime) {
      if (!invalidReviewDates.includes(check)) invalidReviewDates.push(check);
      messages.push(
        `INVALID REVIEW  ${check.id} — reviewed-at date ${check.reviewedAt} is after valid-until date ${check.validUntil}. ` +
          `Re-check ${check.sourceUrl} and correct the review window.`
      );
    }

    const daysUntilExpiry = Math.round((validUntilTime - todayTime) / DAY_MS);
    if (daysUntilExpiry < 0) {
      expired.push(check);
      messages.push(
        `EXPIRED  ${check.id} — manual verification lapsed on ${check.validUntil}. ` +
          `Re-check ${check.sourceUrl} and update the review dates, or mark the record superseded.`
      );
    } else if (daysUntilExpiry <= DUE_SOON_DAYS) {
      dueSoon.push(check);
      messages.push(
        `DUE SOON  ${check.id} — manual verification expires in ${daysUntilExpiry} day(s) on ${check.validUntil}. ` +
          `Re-check ${check.sourceUrl} before expiry.`
      );
    }
  }

  return {
    checks,
    dueSoon,
    expired,
    undated,
    invalidReviewDates,
    messages,
    exitCode: expired.length > 0 || undated.length > 0 || invalidReviewDates.length > 0 ? 1 : 0,
  };
}

export async function runManualCheckAudit({ today } = {}) {
  const [manualLinkConfig, sourceDeltaConfig] = await Promise.all([
    readJson(path.join(root, "src", "data", "sourceLinkManualChecks.json")),
    readJson(path.join(root, "src", "data", "sourceDeltaMonitors.json")),
  ]);
  const result = auditManualChecks(
    collectManualChecks(manualLinkConfig, sourceDeltaConfig),
    today
  );

  for (const message of result.messages) {
    const log = message.startsWith("DUE SOON") ? console.warn : console.error;
    log(message);
  }
  console.log(
    `Manual source checks: ${result.checks.length} total, ${result.dueSoon.length} due soon, ` +
      `${result.expired.length} expired, ${result.undated.length} without an expiry date, ` +
      `${result.invalidReviewDates.length} with invalid review dates.`
  );

  return result;
}

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(`${value}T00:00:00Z`);
  const time = date.getTime();
  if (!Number.isFinite(time)) return null;
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
  return time;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function isCli() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isCli()) {
  const result = await runManualCheckAudit();
  process.exitCode = result.exitCode;
}
