import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "src", "data");
const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const OFFICIAL_HOSTS = new Set([
  "www.gov.uk",
  "www.nist.gov",
  "www.cencenelec.eu",
  "oecd.ai",
  "wp.oecd.ai",
  "legalinstruments.oecd.org",
  "eur-lex.europa.eu",
  "digitallibrary.un.org",
  "www.iso.org",
  "www.coe.int",
  "asean.org",
  "au.int",
  "www.apec.org",
  "www.frontiermodelforum.org",
]);
const OFFICIAL_SUFFIXES = [
  ".gov",
  ".gov.uk",
  ".europa.eu",
  ".coe.int",
  ".oecd.org",
  ".unesco.org",
  ".un.org",
  ".iso.org",
  ".asean.org",
  ".au.int",
  ".apec.org",
];

const now = new Date();
const records = [];

for (const file of await fs.readdir(dataDir)) {
  if (!file.endsWith(".ts")) continue;
  const abs = path.join(dataDir, file);
  const text = await fs.readFile(abs, "utf8");
  const sourceMatches = [...text.matchAll(/sourceUrl:\s*"([^"]+)"/g)];
  for (const match of sourceMatches) {
    const context = nearestObjectText(text, match.index);
    const sharedMetadata = /\.\.\.(OFFICIAL_|LAB_SOURCE_METADATA)/.test(context);
    records.push({
      file: path.relative(root, abs).replace(/\\/g, "/"),
      id: pick(context, /id:\s*"([^"]+)"/g) ?? "unknown",
      name: pick(context, /name:\s*"([^"]+)"/g) ?? pick(context, /sourceName:\s*"([^"]+)"/g) ?? "Unnamed record",
      sourceUrl: match[1],
      sourceKind: pick(context, /sourceKind:\s*"([^"]+)"/g),
      verificationStatus: pick(context, /verificationStatus:\s*"([^"]+)"/g),
      confidence: pick(context, /confidence:\s*"([^"]+)"/g),
      lastVerified: pick(context, /lastVerified:\s*"([^"]+)"/g),
      bindingStatus: pick(context, /bindingStatus:\s*"([^"]+)"/g),
      sharedMetadata,
    });
  }
}

const warnings = [];
for (const record of records) {
  const host = getHost(record.sourceUrl);
  const ageDays = record.lastVerified ? ageInDays(record.lastVerified) : null;
  if (!record.lastVerified && !record.sharedMetadata) warnings.push(warn(record, "missing lastVerified metadata"));
  else if (ageDays !== null && ageDays > 180) warnings.push(warn(record, `lastVerified is ${ageDays} days old`));
  else if (ageDays !== null && ageDays > 90) warnings.push(warn(record, `lastVerified is ${ageDays} days old; refresh soon`));
  if (host && !isOfficialHost(host) && record.sourceKind === "official") {
    warnings.push(warn(record, `sourceKind is official but host is not classified: ${host}`));
  }
  if (record.verificationStatus === "uncertain" && ["binding", "mixed", "binding_regulation", "binding_on_parties"].includes(record.bindingStatus ?? "")) {
    warnings.push(warn(record, "uncertain record has strong binding map effect"));
  }
}

let linkWarnings = [];
if (args.has("check-links")) {
  linkWarnings = await checkLinks(records);
}

const report = [
  "# Source Audit Report",
  "",
  `Generated: ${now.toISOString()}`,
  `Records with sourceUrl: ${records.length}`,
  "",
  "## Metadata Warnings",
  warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "No metadata warnings.",
  "",
  "## Link Warnings",
  linkWarnings.length ? linkWarnings.map((item) => `- ${item}`).join("\n") : "No link warnings, or link checks were not requested.",
  "",
].join("\n");

const output = args.get("output");
if (output) {
  await fs.writeFile(path.resolve(root, output), report);
}
console.log(report);

function pick(context, regex) {
  const matches = [...context.matchAll(regex)];
  return matches.at(-1)?.[1] ?? null;
}

function nearestObjectText(text, index) {
  const start = text.lastIndexOf("{", index);
  const softEnd = text.indexOf("\n  },", index);
  const nestedEnd = text.indexOf("\n    },", index);
  const ends = [softEnd, nestedEnd].filter((value) => value >= 0);
  const end = ends.length ? Math.min(...ends) + 6 : index + 600;
  return text.slice(Math.max(0, start), Math.min(text.length, end));
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
  return `${record.file} :: ${record.id} :: ${message}`;
}

async function checkLinks(sourceRecords) {
  const unique = [...new Map(sourceRecords.map((record) => [record.sourceUrl, record])).values()];
  const warnings = [];
  let index = 0;
  const workers = Array.from({ length: 6 }, async () => {
    while (index < unique.length) {
      const record = unique[index++];
      const result = await checkLink(record.sourceUrl);
      if (result) warnings.push(warn(record, result));
    }
  });
  await Promise.all(workers);
  return warnings.sort();
}

async function checkLink(sourceUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(sourceUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    if (response.ok || response.status === 405 || response.status === 403) return null;
    return `source URL returned HTTP ${response.status}: ${sourceUrl}`;
  } catch (error) {
    return `source URL check failed (${error instanceof Error ? error.name : "unknown"}): ${sourceUrl}`;
  } finally {
    clearTimeout(timeout);
  }
}
