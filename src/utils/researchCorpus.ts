import { COUNTRIES, COUNTRY_BY_ISO3 } from "../data/countries";
import { EU_MEMBER_ISO3 } from "../data/euMembers";
import {
  INSTITUTION_BY_ID,
  INSTITUTION_RECORDS,
  POLICY_PROCESS_BY_ID,
  POLICY_PROCESS_RECORDS,
  PUBLIC_SECTOR_AI_BY_ID,
  PUBLIC_SECTOR_AI_RECORDS,
  RESEARCH_CORPUS_CHANGELOG,
  STANDARDS_CONFORMITY_BY_ID,
  STANDARDS_CONFORMITY_RECORDS,
} from "../data/researchCorpus";
import {
  INCIDENT_ENFORCEMENT_RECORDS,
  RECORD_CHANGE_LOG_ENTRIES as LAB_INTELLIGENCE_CHANGELOG,
} from "../data/labIntelligence";
import type {
  CorpusRecordKind,
  CorpusRecordReference,
  GovernanceDomainId,
  IncidentEnforcementRecord,
  InstitutionRecord,
  MapModeId,
  PolicyProcessRecord,
  PublicSectorAIRecord,
  RecordChangeLogEntry,
  StandardsConformityRecord,
  VerificationMetadata,
} from "../types";
import { DATA_CONFIDENCE_LABELS } from "./getVerificationLabel";

export type CorpusUiKind =
  | "institution"
  | "policy-process"
  | "standard"
  | "public-sector-ai"
  | "enforcement";

export type ResearchCorpusRecord =
  | { kind: "institution"; routeKind: "institution"; id: string; title: string; jurisdiction: string; countryIso3?: string; status: string; domains: GovernanceDomainId[]; summary: string; caveat: string; sourceName: string; sourceUrl: string; metadata: VerificationMetadata; raw: InstitutionRecord }
  | { kind: "policy_process"; routeKind: "policy-process"; id: string; title: string; jurisdiction: string; countryIso3?: string; status: string; domains: GovernanceDomainId[]; summary: string; caveat: string; sourceName: string; sourceUrl: string; metadata: VerificationMetadata; raw: PolicyProcessRecord }
  | { kind: "standards_conformity"; routeKind: "standard"; id: string; title: string; jurisdiction: string; countryIso3?: string; status: string; domains: GovernanceDomainId[]; summary: string; caveat: string; sourceName: string; sourceUrl: string; metadata: VerificationMetadata; raw: StandardsConformityRecord }
  | { kind: "public_sector_ai"; routeKind: "public-sector-ai"; id: string; title: string; jurisdiction: string; countryIso3?: string; status: string; domains: GovernanceDomainId[]; summary: string; caveat: string; sourceName: string; sourceUrl: string; metadata: VerificationMetadata; raw: PublicSectorAIRecord }
  | { kind: "enforcement"; routeKind: "enforcement"; id: string; title: string; jurisdiction: string; countryIso3?: string; status: string; domains: GovernanceDomainId[]; summary: string; caveat: string; sourceName: string; sourceUrl: string; metadata: VerificationMetadata; raw: IncidentEnforcementRecord };

export interface CorpusMapReason {
  label: string;
  detail: string;
}

export interface CorpusMapContext {
  fills: Record<string, string>;
  reasons: Record<string, CorpusMapReason>;
}

export interface CorpusCoverageReport {
  totalRecords: number;
  recordsByKind: Record<string, number>;
  countriesWithInstitutionData: string[];
  countriesWithNoInstitutionData: string[];
  openPolicyWindows: number;
  recordsMissingDeadlines: string[];
  staleVerificationRecords: string[];
  officialSourceGaps: string[];
  caveat:
    "Corpus coverage is an editorial snapshot. Missing records mean not yet collected, not absence of governance activity.";
}

const CORPUS_KIND_LABELS: Record<CorpusRecordKind, string> = {
  institution: "Institution",
  policy_process: "Policy process",
  standards_conformity: "Standards / conformity",
  public_sector_ai: "Public-sector AI",
  enforcement: "Enforcement / litigation",
};

const ROUTE_KIND_TO_CORPUS_KIND: Record<CorpusUiKind, CorpusRecordKind> = {
  institution: "institution",
  "policy-process": "policy_process",
  standard: "standards_conformity",
  "public-sector-ai": "public_sector_ai",
  enforcement: "enforcement",
};

export const RESEARCH_CORPUS_RECORDS: ResearchCorpusRecord[] = [
  ...INSTITUTION_RECORDS.map((record) => normalizeInstitution(record)),
  ...POLICY_PROCESS_RECORDS.map((record) => normalizePolicyProcess(record)),
  ...STANDARDS_CONFORMITY_RECORDS.map((record) => normalizeStandard(record)),
  ...PUBLIC_SECTOR_AI_RECORDS.map((record) => normalizePublicSector(record)),
  ...INCIDENT_ENFORCEMENT_RECORDS.map((record) => normalizeEnforcement(record)),
];

export const RESEARCH_CORPUS_BY_ROUTE = Object.fromEntries(
  RESEARCH_CORPUS_RECORDS.map((record) => [`${record.routeKind}:${record.id}`, record])
) as Record<string, ResearchCorpusRecord | undefined>;

export function getCorpusRecord(routeKind: CorpusUiKind, id: string): ResearchCorpusRecord | null {
  return RESEARCH_CORPUS_BY_ROUTE[`${routeKind}:${id}`] ?? null;
}

export function getCorpusRecordByReference(reference: CorpusRecordReference): ResearchCorpusRecord | null {
  if (!isCorpusReference(reference.kind)) return null;
  return getCorpusRecord(corpusKindToRouteKind(reference.kind), reference.id);
}

export function corpusRoute(record: ResearchCorpusRecord): string {
  return `${routePrefix(record.routeKind)}${encodeURIComponent(record.id)}`;
}

export function corpusKindLabel(kind: CorpusRecordKind | CorpusUiKind): string {
  const corpusKind = isCorpusUiKind(kind) ? ROUTE_KIND_TO_CORPUS_KIND[kind] : kind;
  return CORPUS_KIND_LABELS[corpusKind];
}

export function corpusRecordDisplayName(routeKind: CorpusUiKind, id: string): string {
  return getCorpusRecord(routeKind, id)?.title ?? id;
}

export function getCorpusRecordsForCountry(iso3: string): ResearchCorpusRecord[] {
  const isEuMember = Boolean(COUNTRY_BY_ISO3[iso3]?.isEUMember);
  return RESEARCH_CORPUS_RECORDS.filter((record) => {
    if (record.countryIso3 === iso3) return true;
    return isEuMember && record.countryIso3 === "EUU";
  });
}

export function getCorpusRecordsForRelatedId(id: string): ResearchCorpusRecord[] {
  return RESEARCH_CORPUS_RECORDS.filter((record) =>
    relatedRecordsFor(record).some((reference) => reference.id === id)
  );
}

export function buildCorpusRows() {
  return RESEARCH_CORPUS_RECORDS.map((record) => ({
    id: `${record.routeKind}:${record.id}`,
    route: corpusRoute(record),
    kind: record.kind,
    kindLabel: corpusKindLabel(record.kind),
    title: record.title,
    jurisdiction: record.jurisdiction,
    country: record.countryIso3 ? COUNTRY_BY_ISO3[record.countryIso3]?.name ?? record.countryIso3 : "Global / regional",
    status: record.status,
    domains: record.domains,
    summary: record.summary,
    caveat: record.caveat,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    sourceKind: record.metadata.sourceKind,
    verificationStatus: record.metadata.verificationStatus,
    confidence: record.metadata.confidence,
    lastVerified: record.metadata.lastVerified,
  }));
}

export function getCorpusChangelogForRecord(record: ResearchCorpusRecord): RecordChangeLogEntry[] {
  const recordKind = changelogKindForRecord(record);
  return [...RESEARCH_CORPUS_CHANGELOG, ...LAB_INTELLIGENCE_CHANGELOG].filter(
    (entry) => entry.recordKind === recordKind && entry.recordId === record.id
  ).sort((a, b) => b.date.localeCompare(a.date));
}

export function getCorpusDatasetChangelog(): RecordChangeLogEntry[] {
  return [...RESEARCH_CORPUS_CHANGELOG, ...LAB_INTELLIGENCE_CHANGELOG]
    .filter((entry) => entry.recordKind === "dataset")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function renderCorpusCsv(records: ResearchCorpusRecord[] = RESEARCH_CORPUS_RECORDS): string {
  const rows = [
    ["kind", "id", "title", "jurisdiction", "country_iso3", "status", "domains", "confidence", "last_verified", "source_url", "summary", "caveat"],
    ...records.map((record) => [
      corpusKindLabel(record.kind),
      record.id,
      record.title,
      record.jurisdiction,
      record.countryIso3 ?? "",
      record.status,
      record.domains.join("; "),
      record.metadata.confidence ? DATA_CONFIDENCE_LABELS[record.metadata.confidence] : "",
      record.metadata.lastVerified ?? "",
      record.sourceUrl,
      record.summary,
      record.caveat,
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export function buildCorpusMapContext(mapMode: MapModeId): CorpusMapContext {
  const fills = Object.fromEntries(
    COUNTRIES.filter((country) => country.iso3 !== "EUU").map((country) => [country.iso3, "#E5E7EB"])
  );
  const reasons = Object.fromEntries(
    COUNTRIES.filter((country) => country.iso3 !== "EUU").map((country) => [
      country.iso3,
      {
        label: noCorpusLabel(mapMode),
        detail: "No matching research-corpus row is mapped to this country in the current static dataset.",
      },
    ])
  );

  if (mapMode === "enforcement-activity") {
    applyCountryRecords(
      fills,
      reasons,
      INCIDENT_ENFORCEMENT_RECORDS.filter((record) => record.countryIso3).map((record) => normalizeEnforcement(record)),
      "#DC2626",
      "enforcement or litigation record"
    );
    return { fills, reasons };
  }

  const records =
    mapMode === "ai-institutions"
      ? INSTITUTION_RECORDS.map(normalizeInstitution)
      : mapMode === "policy-windows"
        ? POLICY_PROCESS_RECORDS.map(normalizePolicyProcess)
        : mapMode === "public-sector-ai"
          ? PUBLIC_SECTOR_AI_RECORDS.map(normalizePublicSector)
          : mapMode === "standards-conformity"
            ? STANDARDS_CONFORMITY_RECORDS.map(normalizeStandard)
            : [];

  const fill =
    mapMode === "ai-institutions"
      ? "#0F766E"
      : mapMode === "policy-windows"
        ? "#EA580C"
        : mapMode === "public-sector-ai"
          ? "#2563EB"
          : "#7C3AED";

  applyCountryRecords(fills, reasons, records, fill, corpusModeLabel(mapMode).toLowerCase());
  return { fills, reasons };
}

export function corpusModeLabel(mapMode: MapModeId): string {
  if (mapMode === "ai-institutions") return "AI institutions";
  if (mapMode === "policy-windows") return "Policy windows";
  if (mapMode === "public-sector-ai") return "Public-sector AI";
  if (mapMode === "enforcement-activity") return "Enforcement activity";
  if (mapMode === "standards-conformity") return "Standards / conformity";
  return "Research corpus";
}

export function getCorpusCoverageReport(today = "2026-06-10"): CorpusCoverageReport {
  const countriesWithInstitutionData = unique(
    INSTITUTION_RECORDS.flatMap((record) => expandCountryIso3(record.countryIso3))
  ).filter((iso3) => iso3 !== "EUU");
  const institutionCountrySet = new Set(countriesWithInstitutionData);
  const countriesWithNoInstitutionData = COUNTRIES.filter((country) => country.iso3 !== "EUU" && country.iso3 !== "ATA")
    .filter((country) => !institutionCountrySet.has(country.iso3))
    .map((country) => country.iso3);

  const recordsByKind = RESEARCH_CORPUS_RECORDS.reduce<Record<string, number>>((acc, record) => {
    acc[record.kind] = (acc[record.kind] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalRecords: RESEARCH_CORPUS_RECORDS.length,
    recordsByKind,
    countriesWithInstitutionData,
    countriesWithNoInstitutionData,
    openPolicyWindows: POLICY_PROCESS_RECORDS.filter((record) => record.status === "open").length,
    recordsMissingDeadlines: POLICY_PROCESS_RECORDS.filter((record) => record.status === "open" && !record.deadline).map(
      (record) => record.id
    ),
    staleVerificationRecords: RESEARCH_CORPUS_RECORDS.filter((record) =>
      isStale(record.metadata.lastVerified, today)
    ).map((record) => `${record.routeKind}:${record.id}`),
    officialSourceGaps: RESEARCH_CORPUS_RECORDS.filter((record) => record.metadata.sourceKind !== "official").map(
      (record) => `${record.routeKind}:${record.id}`
    ),
    caveat:
      "Corpus coverage is an editorial snapshot. Missing records mean not yet collected, not absence of governance activity.",
  };
}

export function relatedRecordsFor(record: ResearchCorpusRecord): CorpusRecordReference[] {
  return "relatedRecords" in record.raw ? record.raw.relatedRecords : [];
}

export function routeKindForCorpusKind(kind: CorpusRecordKind): CorpusUiKind {
  return corpusKindToRouteKind(kind);
}

function normalizeInstitution(record: InstitutionRecord): ResearchCorpusRecord {
  return {
    kind: "institution",
    routeKind: "institution",
    id: record.id,
    title: record.name,
    jurisdiction: record.jurisdiction,
    countryIso3: record.countryIso3,
    status: record.institutionType.replace(/_/g, " "),
    domains: record.domains,
    summary: record.summary,
    caveat: record.caveat,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    metadata: record,
    raw: record,
  };
}

function normalizePolicyProcess(record: PolicyProcessRecord): ResearchCorpusRecord {
  return {
    kind: "policy_process",
    routeKind: "policy-process",
    id: record.id,
    title: record.title,
    jurisdiction: record.jurisdiction,
    countryIso3: record.countryIso3,
    status: record.deadline ? `${record.status} until ${record.deadline}` : record.status,
    domains: record.domains,
    summary: record.summary,
    caveat: record.caveat,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    metadata: record,
    raw: record,
  };
}

function normalizeStandard(record: StandardsConformityRecord): ResearchCorpusRecord {
  return {
    kind: "standards_conformity",
    routeKind: "standard",
    id: record.id,
    title: record.title,
    jurisdiction: record.jurisdiction,
    countryIso3: record.countryIso3,
    status: record.status.replace(/_/g, " "),
    domains: record.domains,
    summary: record.summary,
    caveat: record.caveat,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    metadata: record,
    raw: record,
  };
}

function normalizePublicSector(record: PublicSectorAIRecord): ResearchCorpusRecord {
  return {
    kind: "public_sector_ai",
    routeKind: "public-sector-ai",
    id: record.id,
    title: record.title,
    jurisdiction: record.jurisdiction,
    countryIso3: record.countryIso3,
    status: record.legalEffect.replace(/_/g, " "),
    domains: record.domains,
    summary: record.summary,
    caveat: record.caveat,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    metadata: record,
    raw: record,
  };
}

function normalizeEnforcement(record: IncidentEnforcementRecord): ResearchCorpusRecord {
  return {
    kind: "enforcement",
    routeKind: "enforcement",
    id: record.id,
    title: record.title,
    jurisdiction: record.jurisdiction,
    countryIso3: record.countryIso3,
    status: record.proceduralStage ?? record.status,
    domains: record.domains,
    summary: record.summary,
    caveat: record.caveat,
    sourceName: record.sourceName,
    sourceUrl: record.officialDocketUrl ?? record.sourceUrl,
    metadata: record,
    raw: record,
  };
}

function applyCountryRecords(
  fills: Record<string, string>,
  reasons: Record<string, CorpusMapReason>,
  records: ResearchCorpusRecord[],
  fill: string,
  labelNoun: string
) {
  const byCountry = new Map<string, ResearchCorpusRecord[]>();
  for (const record of records) {
    for (const iso3 of expandCountryIso3(record.countryIso3)) {
      if (iso3 === "EUU" || iso3 === "ATA") continue;
      byCountry.set(iso3, [...(byCountry.get(iso3) ?? []), record]);
    }
  }

  for (const [iso3, rows] of byCountry) {
    fills[iso3] = fill;
    const count = rows.length;
    reasons[iso3] = {
      label: `${count} ${labelNoun}${count === 1 ? "" : "s"}`,
      detail: rows
        .slice(0, 3)
        .map((record) => `${record.title}: ${record.status}`)
        .join("; "),
    };
  }
}

function expandCountryIso3(iso3: string | undefined): string[] {
  if (!iso3) return [];
  if (iso3 === "EUU") return [...EU_MEMBER_ISO3];
  return [iso3];
}

function corpusKindToRouteKind(kind: CorpusRecordKind): CorpusUiKind {
  if (kind === "policy_process") return "policy-process";
  if (kind === "standards_conformity") return "standard";
  if (kind === "public_sector_ai") return "public-sector-ai";
  return kind;
}

function changelogKindForRecord(record: ResearchCorpusRecord): RecordChangeLogEntry["recordKind"] {
  if (record.kind === "enforcement") return "incident_enforcement";
  return record.kind;
}

function isCorpusReference(kind: CorpusRecordReference["kind"]): kind is CorpusRecordKind {
  return ["institution", "policy_process", "standards_conformity", "public_sector_ai", "enforcement"].includes(kind);
}

function isCorpusUiKind(kind: string): kind is CorpusUiKind {
  return ["institution", "policy-process", "standard", "public-sector-ai", "enforcement"].includes(kind);
}

function routePrefix(kind: CorpusUiKind): string {
  if (kind === "policy-process") return "/policy-process/";
  if (kind === "public-sector-ai") return "/public-sector-ai/";
  if (kind === "standard") return "/standard/";
  return `/${kind}/`;
}

function noCorpusLabel(mapMode: MapModeId): string {
  return `No ${corpusModeLabel(mapMode).toLowerCase()} row`;
}

function isStale(lastVerified: string | undefined, today: string): boolean {
  if (!lastVerified) return true;
  const then = Date.parse(lastVerified);
  const now = Date.parse(today);
  if (!Number.isFinite(then) || !Number.isFinite(now)) return true;
  return now - then > 180 * 24 * 60 * 60 * 1000;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export function rawCorpusRecordExists(kind: CorpusUiKind, id: string): boolean {
  if (kind === "institution") return Boolean(INSTITUTION_BY_ID[id]);
  if (kind === "policy-process") return Boolean(POLICY_PROCESS_BY_ID[id]);
  if (kind === "standard") return Boolean(STANDARDS_CONFORMITY_BY_ID[id]);
  if (kind === "public-sector-ai") return Boolean(PUBLIC_SECTOR_AI_BY_ID[id]);
  return Boolean(INCIDENT_ENFORCEMENT_RECORDS.find((record) => record.id === id));
}
