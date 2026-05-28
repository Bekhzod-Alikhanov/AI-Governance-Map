import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSourceAuditData } from "./audit-sources.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const now = new Date();
const STALE_SOON_DAYS = 90;
const STALE_DAYS = 180;
const STRONG_LEGAL_EFFECT_STATUSES = new Set([
  "binding",
  "mixed",
  "binding_regulation",
  "binding_on_parties",
]);

if (isCli()) {
  const data = await buildDataReviewData({ checkLinks: args.has("check-links") });
  const report = formatDataReviewMarkdown(data);
  const output = args.get("output");
  const jsonOutput = args.get("json-output");
  if (output) await fs.writeFile(path.resolve(root, output), report);
  if (jsonOutput) await fs.writeFile(path.resolve(root, jsonOutput), `${JSON.stringify(data, null, 2)}\n`);
  console.log(report);
  if (args.has("fail-on-high-priority") && data.highPriorityCount > 0) {
    process.exitCode = 1;
  }
}

export async function buildDataReviewData({ checkLinks = false } = {}) {
  const sourceAudit = await buildSourceAuditData({ checkLinks });
  const reviewItems = sourceAudit.records.flatMap((record) => getReviewItemsForRecord(record));
  const linkReviewItems = sourceAudit.linkWarnings.map((warning) => ({
    severity: "medium",
    category: "link_check",
    file: warning.file,
    id: warning.id,
    name: warning.name,
    sourceUrl: warning.sourceUrl,
    message:
      "Automated source-link check failed; manually spot-check before changing legal or verification status.",
  }));
  const allItems = [...reviewItems, ...linkReviewItems];

  return {
    generatedAt: now.toISOString(),
    recordCount: sourceAudit.recordCount,
    checkLinks,
    summary: summarizeRecords(sourceAudit.records, allItems),
    highPriorityCount: countBySeverity(allItems, "high"),
    mediumPriorityCount: countBySeverity(allItems, "medium"),
    lowPriorityCount: countBySeverity(allItems, "low"),
    reviewItems: allItems,
  };
}

export function getReviewItemsForRecord(record) {
  const items = [];
  const strongLegalEffect = hasStrongLegalEffect(record);
  const ageDays = record.lastVerified ? ageInDays(record.lastVerified) : null;
  const weakVerification =
    record.verificationStatus === "uncertain" || record.verificationStatus === "needs_external_check";
  const needsFreshnessReview = ageDays !== null && ageDays > STALE_SOON_DAYS;

  if (ageDays !== null && ageDays > STALE_DAYS) {
    items.push(reviewItem(record, "high", "freshness", `lastVerified is ${ageDays} days old; refresh against the official source.`));
  } else if (needsFreshnessReview) {
    items.push(reviewItem(record, "medium", "freshness", `lastVerified is ${ageDays} days old; schedule a source refresh.`));
  }

  if (weakVerification) {
    items.push(
      reviewItem(
        record,
        strongLegalEffect ? "high" : "medium",
        "verification",
        `${record.verificationStatus} record should be checked before being cited as settled.`
      )
    );
  }

  if ((weakVerification || record.confidence === "low") && !record.verificationNotes) {
    items.push(
      reviewItem(
        record,
        strongLegalEffect ? "high" : "medium",
        "verification_notes",
        "low-confidence or uncertain record needs verificationNotes explaining the caveat."
      )
    );
  }

  if (record.confidence === "low") {
    items.push(reviewItem(record, "medium", "confidence", "low-confidence source metadata needs editorial review."));
  }

  if (strongLegalEffect && record.sourceKind && record.sourceKind !== "official") {
    items.push(
      reviewItem(
        record,
        "high",
        "official_source",
        "strong legal-effect claim should be backed by a direct official source."
      )
    );
  }

  if (strongLegalEffect && record.verificationStatus && record.verificationStatus !== "verified") {
    items.push(
      reviewItem(
        record,
        "medium",
        "legal_effect",
        "strong legal-effect claim is not marked verified; confirm legal status before map-color reliance."
      )
    );
  }

  return items;
}

export function hasStrongLegalEffect(record) {
  return STRONG_LEGAL_EFFECT_STATUSES.has(record.bindingStatus ?? "");
}

export function formatDataReviewMarkdown(data) {
  const high = data.reviewItems.filter((item) => item.severity === "high");
  const medium = data.reviewItems.filter((item) => item.severity === "medium");
  const low = data.reviewItems.filter((item) => item.severity === "low");

  return [
    "# Data Review Report",
    "",
    `Generated: ${data.generatedAt}`,
    `Records with sourceUrl: ${data.recordCount}`,
    `Review items: ${data.reviewItems.length}`,
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| High-priority items | ${data.highPriorityCount} |`,
    `| Medium-priority items | ${data.mediumPriorityCount} |`,
    `| Low-priority items | ${data.lowPriorityCount} |`,
    `| Records older than ${STALE_SOON_DAYS} days | ${data.summary.recordsOlderThan90Days} |`,
    `| Records older than ${STALE_DAYS} days | ${data.summary.recordsOlderThan180Days} |`,
    `| Uncertain or needs external check | ${data.summary.weakVerificationCount} |`,
    `| Low-confidence records | ${data.summary.lowConfidenceCount} |`,
    `| Strong legal-effect records needing review | ${data.summary.strongLegalEffectReviewCount} |`,
    "",
    "## High Priority",
    "",
    high.length ? high.map(formatReviewItem).join("\n") : "No high-priority review items.",
    "",
    "## Medium Priority",
    "",
    medium.length ? medium.map(formatReviewItem).join("\n") : "No medium-priority review items.",
    "",
    "## Low Priority",
    "",
    low.length ? low.map(formatReviewItem).join("\n") : "No low-priority review items.",
    "",
  ].join("\n");
}

function summarizeRecords(records, reviewItems) {
  return {
    recordsOlderThan90Days: records.filter((record) => {
      const age = record.lastVerified ? ageInDays(record.lastVerified) : null;
      return age !== null && age > STALE_SOON_DAYS;
    }).length,
    recordsOlderThan180Days: records.filter((record) => {
      const age = record.lastVerified ? ageInDays(record.lastVerified) : null;
      return age !== null && age > STALE_DAYS;
    }).length,
    weakVerificationCount: records.filter((record) =>
      ["uncertain", "needs_external_check"].includes(record.verificationStatus ?? "")
    ).length,
    lowConfidenceCount: records.filter((record) => record.confidence === "low").length,
    strongLegalEffectReviewCount: new Set(
      reviewItems
        .filter((item) => item.category === "legal_effect" || item.category === "official_source")
        .map((item) => `${item.file}::${item.id}`)
    ).size,
  };
}

function countBySeverity(items, severity) {
  return items.filter((item) => item.severity === severity).length;
}

function reviewItem(record, severity, category, message) {
  return {
    severity,
    category,
    file: record.file,
    id: record.id,
    name: record.name,
    sourceUrl: record.sourceUrl,
    message,
  };
}

function formatReviewItem(item) {
  return `- **${item.category}** \`${item.file} :: ${item.id}\` — ${item.message} Source: ${item.sourceUrl}`;
}

function ageInDays(dateText) {
  const date = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

function isCli() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}
