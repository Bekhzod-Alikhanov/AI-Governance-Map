import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSourceAuditData, describeFetchError } from "./audit-sources.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "src", "data", "sourceDeltaMonitors.json");
const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

if (isCli()) {
  const data = await buildSourceDeltaAuditData({
    checkLinks: args.has("check-links"),
  });
  const report = formatSourceDeltaReportMarkdown(data);
  const output = args.get("output");
  const jsonOutput = args.get("json-output");
  if (output) {
    await fs.writeFile(path.resolve(root, output), `${report}\n`);
  }
  if (jsonOutput) {
    await fs.writeFile(path.resolve(root, jsonOutput), `${JSON.stringify(data, null, 2)}\n`);
  }
  console.log(report);
  if (args.has("fail-on-changes") && data.summary.changed > 0) {
    process.exitCode = 1;
  }
  if (args.has("fail-on-manual-review") && data.summary.needsManualReview > 0) {
    process.exitCode = 1;
  }
}

export async function buildSourceDeltaAuditData({
  checkLinks = false,
  config,
  fetcher = globalThis.fetch,
  generatedAt = new Date(),
} = {}) {
  const monitorConfig = config ?? JSON.parse(await fs.readFile(configPath, "utf8"));
  const sourceAudit = await buildSourceAuditData();
  const knownRecordIds = new Set(sourceAudit.records.map((record) => record.id));

  const results = [];
  for (const monitor of monitorConfig.monitors ?? []) {
    results.push(
      await runSourceDeltaMonitor(monitor, {
        checkLinks,
        fetcher,
        knownRecordIds,
        snapshotDate: monitorConfig.snapshotDate,
        generatedAt,
      })
    );
  }

  const summary = summarizeResults(results);
  return {
    generatedAt: generatedAt.toISOString(),
    snapshotDate: monitorConfig.snapshotDate,
    monitorCount: results.length,
    summary,
    results,
  };
}

export async function runSourceDeltaMonitor(
  monitor,
  { checkLinks = false, fetcher = globalThis.fetch, knownRecordIds = new Set(), snapshotDate, generatedAt = new Date() } = {}
) {
  const missingRecordIds = (monitor.recordIds ?? []).filter((id) => !knownRecordIds.has(id));
  const evidence = [];
  const recommendedActions = new Set();
  const activeManualVerification = getActiveManualVerification(monitor, generatedAt);

  if (missingRecordIds.length) {
    evidence.push(`Configured record id(s) not found in source audit data: ${missingRecordIds.join(", ")}.`);
    recommendedActions.add("Fix the monitor config or source-audit extraction before trusting this monitor.");
  }

  let response;
  try {
    response = await fetchSourceText(monitor.sourceUrl, { fetcher });
  } catch (error) {
    if (activeManualVerification && !missingRecordIds.length) {
      return finalizeManualVerificationResult({
        monitor,
        manualVerification: activeManualVerification,
        evidence: [
          ...evidence,
          `Automated fetch failed: ${describeFetchError(error)}.`,
          "Manual verification is active, so this known automation block is not treated as unresolved drift.",
        ],
        recommendedActions,
        missingRecordIds,
        checkLinks,
        snapshotDate,
        fetchError: describeFetchError(error),
      });
    }
    return finalizeResult({
      monitor,
      status: "needs_manual_review",
      observedStatus: `Automated fetch failed: ${describeFetchError(error)}.`,
      evidence: [
        ...evidence,
        "Official source could not be fetched by the static monitor. This is audit-only and does not prove the public claim is wrong.",
      ],
      recommendedActions: [
        ...recommendedActions,
        "Manually open the official source and compare it with the current app claim.",
      ],
      missingRecordIds,
      checkLinks,
      snapshotDate,
      fetchError: describeFetchError(error),
    });
  }

  const text = normalizeText(response.text);
  const expectedChecks = checkExpectedValues(monitor.expectedValues ?? [], text);
  const requiredChecks = checkPatternGroup(monitor.requiredPatterns ?? [], text);
  const changeHits = checkPatternGroup(monitor.changeSignals ?? [], text).filter((item) => item.matched);
  const manualHits = checkPatternGroup(monitor.manualReviewPatterns ?? [], text).filter(
    (item) => item.matched
  );

  for (const item of expectedChecks) {
    if (item.matched && item.matchesExpected) {
      evidence.push(`${item.label}: observed ${item.observed}; expected ${item.expected}.`);
    } else if (item.matched) {
      evidence.push(`${item.label}: observed ${item.observed}; expected ${item.expected}.`);
      recommendedActions.add(item.recommendedAction ?? "Review the current app claim against the official source.");
    } else {
      evidence.push(`${item.label}: expected value pattern was not found.`);
      recommendedActions.add(item.recommendedAction ?? "Manually review the source because the expected value was not found.");
    }
  }

  for (const item of requiredChecks) {
    if (item.matched) evidence.push(`${item.label}: present.`);
    else {
      evidence.push(`${item.label}: not found.`);
      recommendedActions.add("Manually inspect the source because an expected identifier was not found.");
    }
  }

  for (const item of changeHits) {
    evidence.push(`${item.label}: change signal present.`);
    recommendedActions.add(item.recommendedAction ?? "Review the record for a possible source delta.");
  }

  for (const item of manualHits) {
    evidence.push(`${item.label}: manual-review signal present.`);
    recommendedActions.add(item.recommendedAction ?? "Review this source manually.");
  }

  const hasChangedExpectedValue = expectedChecks.some(
    (item) => item.matched && !item.matchesExpected
  );
  const hasMissingExpectedValue = expectedChecks.some((item) => !item.matched);
  const hasMissingRequiredPattern = requiredChecks.some((item) => !item.matched);
  const hasManualReviewSignal = manualHits.length > 0;
  const hasConfigProblem = missingRecordIds.length > 0;

  let status = "unchanged";
  let observedStatus = "Automated checks matched the current app claim.";
  if (hasChangedExpectedValue || changeHits.length > 0) {
    status = "changed";
    observedStatus = "Automated checks found a potential source delta.";
  } else if (
    hasMissingExpectedValue ||
    hasMissingRequiredPattern ||
    hasManualReviewSignal ||
    hasConfigProblem
  ) {
    status = "needs_manual_review";
    observedStatus = "Automated checks were inconclusive.";
  }

  if (!recommendedActions.size) {
    recommendedActions.add("No repo action needed unless a human reviewer sees a newer official status.");
  }

  if (status === "needs_manual_review" && activeManualVerification && !missingRecordIds.length) {
    return finalizeManualVerificationResult({
      monitor,
      manualVerification: activeManualVerification,
      evidence: [
        ...evidence,
        "Automated checks were inconclusive, but a current manual verification record is active.",
      ],
      recommendedActions,
      missingRecordIds,
      checkLinks,
      snapshotDate,
      httpStatus: response.status,
      contentType: response.contentType,
      finalUrl: response.finalUrl,
    });
  }

  return finalizeResult({
    monitor,
    status,
    observedStatus,
    evidence,
    recommendedActions,
    missingRecordIds,
    checkLinks,
    snapshotDate,
    httpStatus: response.status,
    contentType: response.contentType,
    finalUrl: response.finalUrl,
  });
}

export function formatSourceDeltaReportMarkdown(data) {
  const rows = data.results.map((result) =>
    [
      result.name,
      result.status,
      result.sourceLabel,
      result.currentAppClaim,
      result.observedStatus,
      result.recommendedAction,
    ]
      .map(markdownCell)
      .join(" | ")
  );

  const details = data.results.flatMap((result) => [
    `### ${result.name}`,
    "",
    `- **Status:** ${result.status}`,
    `- **Source:** ${result.sourceLabel} — ${result.sourceUrl}`,
    `- **Record IDs:** ${result.recordIds.join(", ")}`,
    `- **Current app claim:** ${result.currentAppClaim}`,
    `- **Observed status:** ${result.observedStatus}`,
    `- **Recommended action:** ${result.recommendedAction}`,
    result.manualVerification
      ? `- **Manual verification:** ${result.manualVerification.reviewedAt} (${result.manualVerification.validUntil ? `valid until ${result.manualVerification.validUntil}` : "no expiry recorded"})`
      : null,
    result.httpStatus ? `- **HTTP status:** ${result.httpStatus}` : null,
    result.contentType ? `- **Content type:** ${result.contentType}` : null,
    result.finalUrl && result.finalUrl !== result.sourceUrl
      ? `- **Final URL:** ${result.finalUrl}`
      : null,
    "",
    "**Evidence**",
    result.evidence.length ? result.evidence.map((item) => `- ${item}`).join("\n") : "- No evidence captured.",
    "",
  ]);

  return [
    "# Source Delta Report",
    "",
    `Generated: ${data.generatedAt}`,
    `Snapshot date: ${data.snapshotDate}`,
    `Monitors: ${data.monitorCount}`,
    "",
    "This report is an editorial aid, not legal advice. It does not auto-update public claims and should not downgrade records solely because an official site blocks scripted requests.",
    "",
    "## Summary",
    "",
    `- Unchanged: ${data.summary.unchanged}`,
    `- Changed: ${data.summary.changed}`,
    `- Needs manual review: ${data.summary.needsManualReview}`,
    "",
    "| Source checked | Status | Official source | Current app claim | Observed status | Recommended action |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map((row) => `| ${row} |`),
    "",
    "## Details",
    "",
    ...details.filter((item) => item !== null),
  ].join("\n");
}

function checkExpectedValues(expectedValues, text) {
  return expectedValues.map((item) => {
    const match = text.match(new RegExp(item.pattern, item.flags ?? "i"));
    const observed = match?.[item.captureGroup ?? 1]?.trim() ?? null;
    return {
      ...item,
      matched: observed !== null,
      observed,
      matchesExpected: observed !== null && normalizeValue(observed) === normalizeValue(item.expected),
    };
  });
}

function checkPatternGroup(patterns, text) {
  return patterns.map((item) => ({
    ...item,
    matched: new RegExp(item.pattern, item.flags ?? "i").test(text),
  }));
}

function getActiveManualVerification(monitor, generatedAt) {
  const manualVerification = monitor.manualVerification;
  if (!manualVerification || manualVerification.status !== "unchanged") return null;
  if (manualVerification.validUntil) {
    const validUntil = Date.parse(`${manualVerification.validUntil}T23:59:59Z`);
    if (!Number.isNaN(validUntil) && generatedAt.getTime() > validUntil) return null;
  }
  return manualVerification;
}

function finalizeManualVerificationResult({
  monitor,
  manualVerification,
  evidence,
  missingRecordIds,
  checkLinks,
  snapshotDate,
  httpStatus,
  contentType,
  finalUrl,
  fetchError,
}) {
  const action =
    manualVerification.recommendedAction ??
    "No repo action needed until the manual verification expires or a human reviewer sees a newer official status.";
  const recommendedActions = new Set([action]);
  return finalizeResult({
    monitor,
    status: "unchanged",
    observedStatus:
      manualVerification.observedStatus ??
      `Manual verification recorded on ${manualVerification.reviewedAt} confirms the current app claim.`,
    evidence: [
      ...evidence,
      `Manual verification date: ${manualVerification.reviewedAt}.`,
      manualVerification.reviewer ? `Manual reviewer: ${manualVerification.reviewer}.` : null,
      manualVerification.validUntil ? `Manual verification valid until: ${manualVerification.validUntil}.` : null,
      ...(manualVerification.evidence ?? []),
    ].filter((item) => item !== null),
    recommendedActions,
    missingRecordIds,
    checkLinks,
    snapshotDate,
    httpStatus,
    contentType,
    finalUrl,
    fetchError,
    manualVerification,
  });
}

async function fetchSourceText(sourceUrl, { fetcher }) {
  if (typeof fetcher !== "function") {
    throw new TypeError("No fetch implementation is available.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetcher(sourceUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GlobalAIGovernanceMapSourceDeltaAudit/1.0; +https://global-ai-governance-map.vercel.app/)",
        Accept: "text/html,application/xhtml+xml,text/plain,application/json,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response || typeof response.text !== "function") {
      throw new TypeError("fetch returned an invalid response");
    }
    if (response.status >= 400) {
      throw new Error(`HTTP ${response.status}`);
    }
    return {
      status: response.status,
      contentType: getHeader(response, "content-type"),
      finalUrl: response.url ?? sourceUrl,
      text: await response.text(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function finalizeResult({
  monitor,
  status,
  observedStatus,
  evidence,
  recommendedActions,
  missingRecordIds,
  checkLinks,
  snapshotDate,
  httpStatus,
  contentType,
  finalUrl,
  fetchError,
  manualVerification,
}) {
  return {
    id: monitor.id,
    name: monitor.name,
    sourceLabel: monitor.sourceLabel,
    sourceUrl: monitor.sourceUrl,
    recordIds: monitor.recordIds ?? [],
    missingRecordIds,
    currentAppClaim: monitor.currentAppClaim,
    observedStatus,
    status,
    recommendedAction: [...recommendedActions].join(" "),
    evidence,
    checkLinks,
    snapshotDate,
    httpStatus,
    contentType,
    finalUrl,
    fetchError,
    manualVerification,
  };
}

function summarizeResults(results) {
  return {
    unchanged: results.filter((result) => result.status === "unchanged").length,
    changed: results.filter((result) => result.status === "changed").length,
    needsManualReview: results.filter((result) => result.status === "needs_manual_review").length,
  };
}

function normalizeText(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

function normalizeValue(value) {
  return String(value).trim().replace(/^0+(\d)/, "$1").toLowerCase();
}

function markdownCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function getHeader(response, name) {
  if (!response.headers) return null;
  if (typeof response.headers.get === "function") return response.headers.get(name);
  return response.headers[name] ?? response.headers[name.toLowerCase()] ?? null;
}

function isCli() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}
