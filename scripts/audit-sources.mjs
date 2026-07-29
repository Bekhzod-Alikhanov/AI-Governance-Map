import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "src", "data");
const sourceHostConfigPath = path.join(dataDir, "sourceHosts.json");
const sourceLinkManualChecksPath = path.join(dataDir, "sourceLinkManualChecks.json");
const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const sourceHostConfig = JSON.parse(await fs.readFile(sourceHostConfigPath, "utf8"));
const sourceLinkManualCheckConfig = JSON.parse(await fs.readFile(sourceLinkManualChecksPath, "utf8"));
const OFFICIAL_HOSTS = new Set(sourceHostConfig.officialHosts);
const OFFICIAL_SUFFIXES = sourceHostConfig.officialHostSuffixes;
const MANUAL_LINK_CHECKS = sourceLinkManualCheckConfig.manualChecks ?? [];
const MAX_BODY_SCAN_BYTES = 16_384;
// Anti-bot systems commonly answer with HTTP 200 and an interstitial body, so a
// status code alone cannot tell a live source from a wall. These markers are
// deliberately narrow: they appear in block pages and effectively never in the
// official legal texts, standards pages and court dockets this dataset cites.
// Declared above the CLI entry point below, which runs at module evaluation.
const BLOCKED_CONTENT_MARKERS = [
  "you have been blocked",
  "attention required! | cloudflare",
  "access denied",
  "verify you are a human",
  "just a moment...",
  "checking your browser before accessing",
  "enable javascript and cookies to continue",
];
const MANUAL_LINK_CHECKS_BY_RECORD_AND_URL = new Map(
  MANUAL_LINK_CHECKS.map((check) => [`${check.recordId}::${check.sourceUrl}`, check])
);
const MANUAL_LINK_CHECKS_BY_URL = new Map(
  MANUAL_LINK_CHECKS.map((check) => [check.sourceUrl, check])
);

const now = new Date();

if (isCli()) {
  const data = await buildSourceAuditData({ checkLinks: args.has("check-links") });
  const report = formatSourceAuditMarkdown(data);
  const output = args.get("output");
  const jsonOutput = args.get("json-output");
  if (output) {
    await fs.writeFile(path.resolve(root, output), report);
  }
  if (jsonOutput) {
    await fs.writeFile(path.resolve(root, jsonOutput), `${JSON.stringify(data, null, 2)}\n`);
  }
  console.log(report);
  if (args.has("fail-on-metadata-warnings") && data.metadataWarnings.length > 0) {
    process.exitCode = 1;
  }
  if (args.has("fail-on-link-warnings") && data.linkWarnings.length > 0) {
    process.exitCode = 1;
  }
}

export async function buildSourceAuditReport({ checkLinks = false } = {}) {
  return formatSourceAuditMarkdown(await buildSourceAuditData({ checkLinks }));
}

export async function buildSourceAuditData({ checkLinks = false } = {}) {
  const records = [];

  for (const file of await fs.readdir(dataDir)) {
    if (!file.endsWith(".ts")) continue;
    const abs = path.join(dataDir, file);
    const text = await fs.readFile(abs, "utf8");
    records.push(
      ...extractSourceRecordsFromText(text, path.relative(root, abs).replace(/\\/g, "/"))
    );
  }

  const warnings = [];
  for (const record of records) {
    const host = getHost(record.sourceUrl);
    const ageDays = record.lastVerified ? ageInDays(record.lastVerified) : null;
    if (!record.lastVerified) warnings.push(warn(record, "missing lastVerified metadata"));
    else if (ageDays !== null && ageDays > 180) warnings.push(warn(record, `lastVerified is ${ageDays} days old`));
    else if (ageDays !== null && ageDays > 90) warnings.push(warn(record, `lastVerified is ${ageDays} days old; refresh soon`));
    if (host && !isOfficialHost(host) && record.sourceKind === "official") {
      warnings.push(warn(record, `sourceKind is official but host is not classified: ${host}`));
    }
    if (
      record.verificationStatus === "uncertain" &&
      ["binding", "mixed", "binding_regulation", "binding_on_parties"].includes(record.bindingStatus ?? "")
    ) {
      warnings.push(warn(record, "uncertain record has strong binding map effect"));
    }
  }

  const linkCheckResults = checkLinks
    ? await checkLinksForRecords(records)
    : { warnings: [], manualChecks: [], environmentWarnings: [], archiveVerified: [] };

  return {
    generatedAt: now.toISOString(),
    recordCount: records.length,
    checkLinks,
    metadataWarningCount: warnings.length,
    linkWarningCount: linkCheckResults.warnings.length,
    manualLinkCheckCount: linkCheckResults.manualChecks.length,
    linkEnvironmentWarningCount: linkCheckResults.environmentWarnings.length,
    records,
    metadataWarnings: warnings,
    linkWarnings: linkCheckResults.warnings,
    manualLinkChecks: linkCheckResults.manualChecks,
    linkEnvironmentWarnings: linkCheckResults.environmentWarnings,
    archiveVerified: linkCheckResults.archiveVerified ?? [],
    archiveVerifiedCount: (linkCheckResults.archiveVerified ?? []).length,
  };
}

function formatSourceAuditMarkdown(data) {
  return [
    "# Source Audit Report",
    "",
    `Generated: ${data.generatedAt}`,
    `Records with sourceUrl: ${data.recordCount}`,
    `Metadata warnings: ${data.metadataWarningCount}`,
    `Link warnings: ${data.linkWarningCount}`,
    `Manual link checks: ${data.manualLinkCheckCount ?? 0}`,
    `Link environment warnings: ${data.linkEnvironmentWarningCount ?? 0}`,
    `Verified via archive snapshot: ${data.archiveVerifiedCount ?? 0}`,
    "",
    "## Metadata Warnings",
    data.metadataWarnings.length
      ? data.metadataWarnings.map((item) => `- ${formatWarning(item)}`).join("\n")
      : "No metadata warnings.",
    "",
    "## Link Warnings",
    data.linkWarnings.length
      ? data.linkWarnings.map((item) => `- ${formatWarning(item)}`).join("\n")
      : "No link warnings, or link checks were not requested.",
    "",
    "## Link Environment Warnings",
    data.linkEnvironmentWarnings?.length
      ? data.linkEnvironmentWarnings.map((item) => `- ${item.message}`).join("\n")
      : "No link environment warnings.",
    "",
    "## Verified Via Archive Snapshot",
    data.archiveVerified?.length
      ? data.archiveVerified.map((item) => `- ${item}`).join("\n")
      : "No archive fallbacks were needed.",
    "",
    "## Manual Link Checks",
    data.manualLinkChecks?.length
      ? data.manualLinkChecks.map((item) => `- ${formatManualLinkCheck(item)}`).join("\n")
      : "No manual link-check exceptions used.",
    "",
  ].join("\n");
}

export function extractSourceRecordsFromText(text, file = "inline.ts") {
  const constants = extractMetadataConstants(text);
  const spans = findObjectSpans(text);
  const sourceMatches = [...text.matchAll(/"?sourceUrl"?:\s*"([^"]+)"/g)];
  return sourceMatches.map((match) => {
    const sourceUrl = match[1];
    const spanChain = spans
      .filter((span) => span.start <= match.index && span.end >= match.index)
      .sort((a, b) => a.end - a.start - (b.end - b.start));
    const sourceSpan = spanChain[0] ?? { start: Math.max(0, match.index - 300), end: match.index + 600 };
    const recordSpan = spanChain.find((span) => /"?id"?:\s*"([^"]+)"/.test(text.slice(span.start, span.end))) ?? sourceSpan;
    const sourceContext = text.slice(sourceSpan.start, sourceSpan.end);
    const recordContext = text.slice(recordSpan.start, recordSpan.end);
    const sourceMetadata = extractMetadata(sourceContext, constants);
    const recordMetadata = extractMetadata(recordContext, constants);
    const metadata = { ...recordMetadata, ...sourceMetadata };
    const parentId = pick(recordContext, /"?id"?:\s*"([^"]+)"/g);
    const generatedParticipationId = generatedParticipationIdBefore(text, sourceSpan.start);
    const propertyName = propertyNameBefore(text, sourceSpan.start);
    const id =
      pick(sourceContext, /"?id"?:\s*"([^"]+)"/g) ??
      (parentId && propertyName ? `${parentId}.${propertyName}` : parentId) ??
      generatedParticipationId ??
      "unknown";
    const sourceName = pick(sourceContext, /"?name"?:\s*"([^"]+)"/g);
    const recordName = pickFirst(recordContext, /"?name"?:\s*"([^"]+)"/g);

    return {
      file,
      id,
      name:
        (propertyName ? sourceName : recordName) ??
        sourceName ??
        pick(sourceContext, /"?sourceName"?:\s*"([^"]+)"/g) ??
        "Unnamed record",
      sourceUrl,
      archivedUrl: pick(sourceContext, /"?archivedUrl"?:\s*"([^"]+)"/g),
      archivedAt: pick(sourceContext, /"?archivedAt"?:\s*"([^"]+)"/g),
      sourceKind: metadata.sourceKind,
      verificationStatus: metadata.verificationStatus,
      confidence: metadata.confidence,
      lastVerified: metadata.lastVerified,
      verificationNotes: metadata.verificationNotes,
      bindingStatus: metadata.bindingStatus ?? pick(recordContext, /"?bindingStatus"?:\s*"([^"]+)"/g),
    };
  });
}

function extractMetadataConstants(text) {
  const constants = new Map();
  const constMatches = [...text.matchAll(/const\s+(\w+)\s*=\s*\{([\s\S]*?)\n\}\s*(?:as const|satisfies)/g)];
  for (const match of constMatches) {
    constants.set(match[1], extractLiteralMetadata(match[2]));
  }
  return constants;
}

function extractMetadata(context, constants) {
  const metadata = {};
  const spreadMatches = [...context.matchAll(/\.\.\.(\w+)/g)];
  for (const spread of spreadMatches) {
    Object.assign(metadata, constants.get(spread[1]) ?? {});
  }
  Object.assign(metadata, extractLiteralMetadata(context));
  return metadata;
}

function extractLiteralMetadata(context) {
  const metadata = {
    sourceKind: pick(context, /"?sourceKind"?:\s*"([^"]+)"/g),
    verificationStatus: pick(context, /"?verificationStatus"?:\s*"([^"]+)"/g),
    confidence: pick(context, /"?confidence"?:\s*"([^"]+)"/g),
    lastVerified: pick(context, /"?lastVerified"?:\s*"([^"]+)"/g),
    verificationNotes: pick(context, /"?verificationNotes"?:\s*"([^"]+)"/g),
    bindingStatus: pick(context, /"?bindingStatus"?:\s*"([^"]+)"/g),
  };
  return Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== null));
}

function findObjectSpans(text) {
  const spans = [];
  const stack = [];
  let quote = null;
  let escaped = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
    } else if (char === "{") {
      stack.push(i);
    } else if (char === "}") {
      const start = stack.pop();
      if (start !== undefined) spans.push({ start, end: i });
    }
  }
  return spans;
}

function propertyNameBefore(text, objectStart) {
  const prefix = text.slice(Math.max(0, objectStart - 80), objectStart);
  return prefix.match(/([A-Za-z0-9_]+):\s*$/)?.[1] ?? null;
}

function generatedParticipationIdBefore(text, objectStart) {
  const prefix = text.slice(Math.max(0, objectStart - 600), objectStart);
  const callStart = prefix.lastIndexOf("makeRows(");
  if (callStart === -1) return null;
  const callPrefix = prefix.slice(callStart);
  const instrumentId = callPrefix.match(/makeRows\(\s*"([^"]+)"/)?.[1];
  const quotedArgs = [...callPrefix.matchAll(/,\s*"([^"]+)"/g)].map((match) => match[1]);
  const participationType = quotedArgs.at(-1);
  if (!instrumentId || !participationType) return null;
  return `${instrumentId}::generated::${participationType}`;
}

function pick(context, regex) {
  const matches = [...context.matchAll(regex)];
  return matches.at(-1)?.[1] ?? null;
}

function pickFirst(context, regex) {
  const matches = [...context.matchAll(regex)];
  return matches[0]?.[1] ?? null;
}

function getHost(sourceUrl) {
  try {
    return new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isOfficialHost(host) {
  return OFFICIAL_HOSTS.has(host) || OFFICIAL_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

function ageInDays(dateText) {
  const date = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

function warn(record, message) {
  return {
    file: record.file,
    id: record.id,
    name: record.name,
    sourceUrl: record.sourceUrl,
    message,
  };
}

function formatWarning(warning) {
  return `${warning.file} :: ${warning.id} :: ${warning.message}`;
}

async function checkLinksForRecords(sourceRecords) {
  // Prefer a record carrying an archivedUrl when several share a source URL,
  // so the archive fallback is not lost to deduplication.
  const byUrl = new Map();
  for (const record of sourceRecords) {
    const existing = byUrl.get(record.sourceUrl);
    if (!existing || (!existing.archivedUrl && record.archivedUrl)) byUrl.set(record.sourceUrl, record);
  }
  const unique = [...byUrl.values()];
  const warnings = [];
  const manualChecks = [];
  const archiveVerified = [];
  let index = 0;
  const workers = Array.from({ length: 3 }, async () => {
    while (index < unique.length) {
      const record = unique[index++];
      let result = await checkLink(record.sourceUrl);
      // Only fall back to the archive for a wall — an issuer refusing automation.
      // A network or timeout failure says nothing about the source, and retrying
      // those against archive.org doubles the request load for no information.
      if (result && record.archivedUrl && !isNetworkEnvironmentFailure(result)) {
        // The official URL stays canonical; the archive is what lets us confirm
        // a claim the issuer's bot wall would otherwise make unverifiable.
        const archiveResult = await checkLink(record.archivedUrl);
        if (!archiveResult) {
          archiveVerified.push(
            `${record.file} :: ${record.id} :: live source is walled, verified via archive snapshot${record.archivedAt ? ` of ${record.archivedAt}` : ""}: ${record.archivedUrl}`
          );
          result = null;
        } else {
          result = `${result} (archive snapshot also unreachable: ${record.archivedUrl})`;
        }
      }
      if (!result) continue;
      const manualCheck = getManualLinkCheck(record);
      if (manualCheck && !isManualCheckExpired(manualCheck)) {
        manualChecks.push(manualLinkCheck(record, manualCheck, result));
      } else if (manualCheck) {
        // The override has outlived its expiry date, so it no longer excuses the
        // automated failure and the record needs re-verifying by a human.
        warnings.push(
          warn(
            record,
            `${result} (manual verification override expired on ${manualCheck.expiresOn}; re-verify and update src/data/sourceLinkManualChecks.json)`
          )
        );
      } else {
        warnings.push(warn(record, result));
      }
    }
  });
  await Promise.all(workers);
  const environmentWarnings = detectLinkCheckEnvironmentWarnings(
    unique.length,
    warnings,
    manualChecks
  );
  if (environmentWarnings.length) {
    return {
      warnings: [],
      manualChecks: sortWarnings(manualChecks),
      environmentWarnings,
    };
  }
  return {
    warnings: sortWarnings(warnings),
    manualChecks: sortWarnings(manualChecks),
    environmentWarnings: [],
    archiveVerified: archiveVerified.sort(),
  };
}

function isCli() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

export function detectBlockedContent(bodyText) {
  if (!bodyText || typeof bodyText !== "string") return false;
  const haystack = bodyText.slice(0, MAX_BODY_SCAN_BYTES).toLowerCase();
  return BLOCKED_CONTENT_MARKERS.some((marker) => haystack.includes(marker));
}

/**
 * Manual verification overrides record a human check that automation cannot
 * repeat. A time-boxed override that quietly outlives its expiry date is worse
 * than no override, because the record keeps reporting as verified.
 */
export function isManualCheckExpired(check, today = new Date().toISOString().slice(0, 10)) {
  if (!check?.expiresOn) return false;
  return today > check.expiresOn;
}

async function checkLink(sourceUrl) {
  const headResult = await requestUrl(sourceUrl, "HEAD");
  // A successful HEAD proves reachability but never shows a body, so confirm
  // with a bounded GET that the response is the source and not an interstitial.
  if (headResult === null) return (await requestUrl(sourceUrl, "GET")) ?? null;
  if (headResult === "retry") return (await requestUrl(sourceUrl, "GET")) ?? null;
  return headResult;
}

async function requestUrl(sourceUrl, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(sourceUrl, {
      method,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GlobalAIGovernanceMapSourceAudit/1.0; +https://global-ai-governance-map.vercel.app/)",
        Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (response.status < 400 || response.status === 405 || response.status === 403) {
      if (method === "GET" && isHtmlResponse(response)) {
        const body = await readBoundedText(response);
        if (detectBlockedContent(body)) {
          return `source URL returned HTTP ${response.status} but served an anti-bot or access-denied page rather than the source: ${sourceUrl}`;
        }
      }
      return null;
    }
    if (method === "HEAD") return "retry";
    return `source URL returned HTTP ${response.status} after ${method} request: ${sourceUrl}`;
  } catch (error) {
    if (method === "HEAD") return "retry";
    return `source URL check failed after HEAD-to-GET retry (${describeFetchError(error)}): ${sourceUrl}`;
  } finally {
    clearTimeout(timeout);
  }
}

function isHtmlResponse(response) {
  return (response.headers.get("content-type") ?? "").toLowerCase().includes("html");
}

// Read only enough of the body to recognise an interstitial. Some sources are
// multi-megabyte PDFs or consolidated legal texts, and downloading them in full
// would make the audit unusable.
async function readBoundedText(response) {
  if (!response.body) return await response.text();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const reader = response.body.getReader();
  let text = "";
  try {
    while (text.length < MAX_BODY_SCAN_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return text;
}

function getManualLinkCheck(record) {
  return (
    MANUAL_LINK_CHECKS_BY_RECORD_AND_URL.get(`${record.id}::${record.sourceUrl}`) ??
    MANUAL_LINK_CHECKS_BY_URL.get(record.sourceUrl) ??
    null
  );
}

function manualLinkCheck(record, check, automatedResult) {
  return {
    file: record.file,
    id: record.id,
    name: record.name,
    sourceUrl: record.sourceUrl,
    status: check.status,
    lastChecked: check.lastChecked,
    reason: check.reason,
    automatedResult,
  };
}

function sortWarnings(items) {
  return items.sort((a, b) =>
    `${a.file}::${a.id}::${a.sourceUrl}`.localeCompare(`${b.file}::${b.id}::${b.sourceUrl}`)
  );
}

function detectLinkCheckEnvironmentWarnings(recordCount, warnings, manualChecks) {
  const failures = [
    ...warnings.map((item) => item.message),
    ...manualChecks.map((item) => item.automatedResult),
  ];
  if (recordCount === 0 || failures.length / recordCount < 0.5) return [];
  if (!failures.every(isNetworkEnvironmentFailure)) return [];
  return [
    {
      message:
        `Link check inconclusive: ${failures.length} of ${recordCount} automated requests failed with network or timeout errors. ` +
        "This usually means the current runtime cannot reach external source sites; rerun from CI or another unrestricted network before treating links as broken.",
    },
  ];
}

function isNetworkEnvironmentFailure(message) {
  return (
    message.includes("network, TLS, redirect, or anti-bot fetch failure") ||
    message.includes("request timed out or was aborted")
  );
}

function formatManualLinkCheck(item) {
  return `${item.file} :: ${item.id} :: ${item.status} checked ${item.lastChecked} - ${item.reason} Automated result: ${item.automatedResult}`;
}

export function describeFetchError(error) {
  if (!error || typeof error !== "object") return "unknown fetch failure";
  const name = "name" in error ? String(error.name) : "unknown";
  const message = "message" in error ? String(error.message) : "";
  if (name === "AbortError") return "request timed out or was aborted";
  if (name === "TypeError") return "network, TLS, redirect, or anti-bot fetch failure";
  return message ? `${name}: ${message}` : name;
}
