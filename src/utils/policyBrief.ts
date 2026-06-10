import { COUNTRY_BY_ISO3 } from "../data/countries";
import { LAB_BY_ID } from "../data/frontierLabs";
import { POLICY_PROCESS_RECORDS, STANDARDS_CONFORMITY_RECORDS } from "../data/researchCorpus";
import type { CorpusRecordReference, PolicyBrief, PolicyBriefKind, VerificationMetadata } from "../types";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";
import { getLabExposureTarget, getLabRegulatoryExposures, LAB_EXPOSURE_EFFECT_LABELS } from "./labExposure";
import { buildScenarioAssessment, getCountryImplementationMilestones, getCountryObligations } from "./researchWorkbench";
import {
  corpusKindLabel,
  getCorpusRecordsForCountry,
  getCorpusRecord,
  RESEARCH_CORPUS_RECORDS,
  type CorpusUiKind,
  type ResearchCorpusRecord,
} from "./researchCorpus";

export interface PolicyBriefRequest {
  kind: PolicyBriefKind;
  id?: string;
  labId?: string;
  marketIso3s?: string[];
}

export const POLICY_BRIEF_INDEX = [
  {
    id: "country-brief",
    kind: "country",
    title: "Country brief",
    description: "Legal status, obligations, implementation milestones, corpus records, and source caveats for one jurisdiction.",
  },
  {
    id: "lab-by-market",
    kind: "lab_market",
    title: "Lab-by-market brief",
    description: "Likely governance layers for a lab across selected deployment markets, using exposure rows and caveats.",
  },
  {
    id: "institution-brief",
    kind: "institution",
    title: "Institution brief",
    description: "Mandate, powers, related records, source confidence, and caveats for a regulator or governance body.",
  },
  {
    id: "deadline-watch",
    kind: "deadline_watch",
    title: "Upcoming deadline brief",
    description: "Open policy windows and implementation deadlines from official-source rows.",
  },
  {
    id: "enforcement-watch",
    kind: "enforcement_watch",
    title: "Enforcement/process watch brief",
    description: "Official enforcement and litigation context without converting activity into legal conclusions.",
  },
  {
    id: "standards-conformity",
    kind: "standards_conformity",
    title: "Standards/conformity brief",
    description: "Standards work and conformity hooks, with explicit caveats about non-law status.",
  },
] as const;

export function buildPolicyBrief(request: PolicyBriefRequest): PolicyBrief | null {
  if (request.kind === "country" && request.id) return buildCountryBrief(request.id);
  if (request.kind === "lab_market" && request.labId) {
    return buildLabMarketBrief(request.labId, request.marketIso3s ?? ["EUU", "USA", "GBR", "KOR"]);
  }
  if (request.kind === "institution" && request.id) return buildCorpusBrief("institution", request.id, "institution");
  if (request.kind === "deadline_watch") return buildDeadlineBrief();
  if (request.kind === "enforcement_watch") return buildEnforcementBrief();
  if (request.kind === "standards_conformity") return buildStandardsBrief(request.id);
  return null;
}

export function renderPolicyBriefMarkdown(brief: PolicyBrief): string {
  return brief.markdown;
}

export function policyBriefFilename(brief: PolicyBrief): string {
  return `global-ai-governance-map-${slug(brief.id)}-policy-brief.md`;
}

function buildCountryBrief(iso3: string): PolicyBrief | null {
  const country = COUNTRY_BY_ISO3[iso3];
  if (!country) return null;
  const summary = getCountryGovernanceSummary(iso3);
  const obligations = getCountryObligations(iso3);
  const milestones = getCountryImplementationMilestones(iso3);
  const corpus = getCorpusRecordsForCountry(iso3);
  const sources = [
    ...summary.nationalRegulations,
    ...summary.subnationalRules,
    ...summary.participations.map(({ participation }) => participation),
    ...obligations,
    ...milestones,
    ...corpus.map((record) => sourceRecord(record)),
  ];
  const caveats = unique([
    "Research aid only; not legal advice.",
    "Corpus/context records do not affect binding-law map coloring unless a verified legal record separately supports the claim.",
    ...(country.isEUMember ? ["EU AI Act applicability does not mean this country enacted a separate national AI statute."] : []),
  ]);
  const lines = briefHeader(`${country.name} policy brief`, `Country record ${country.iso3}`);
  lines.push(
    `Executive answer: ${country.name} has ${summary.nationalRegulations.length} national AI entry row(s), ${summary.participations.length} international participation row(s), ${obligations.length} structured obligation row(s), ${milestones.length} implementation milestone(s), and ${corpus.length} research-corpus context row(s).`,
    "",
    "## Governance status",
    "",
    `- Confirmed binding law: ${summary.hasBindingNationalLaw ? "Yes" : "None confirmed in this snapshot"}`,
    `- Proposed or guidance/context entries: ${summary.nationalRegulations.filter((row) => row.bindingStatus !== "binding").length}`,
    `- Frontier labs headquartered here: ${summary.hqLabs.map((lab) => lab.name).join("; ") || "None tracked"}`,
    "",
    "## Corpus context",
    "",
    ...(corpus.length
      ? corpus.map((record) => `- **${record.title}:** ${corpusKindLabel(record.kind)}; ${record.status}. ${record.caveat}`)
      : ["- No research-corpus context rows are mapped to this country yet."]),
    "",
    caveatBlock(caveats),
    sourceTable(sources)
  );
  return createBrief({
    id: `country-${iso3}`,
    kind: "country",
    title: `${country.name} policy brief`,
    subtitle: `Country record ${country.iso3}`,
    summary: `${country.name} brief from legal, implementation, obligation, participation, and corpus context rows.`,
    recordRefs: [{ kind: "country", id: iso3, label: country.name }],
    sources,
    caveats,
    markdown: lines.join("\n"),
  });
}

function buildLabMarketBrief(labId: string, marketIso3s: string[]): PolicyBrief | null {
  const lab = LAB_BY_ID[labId];
  if (!lab) return null;
  const scenario = buildScenarioAssessment(labId, marketIso3s);
  if (!scenario) return null;
  const exposures = getLabRegulatoryExposures(labId);
  const sources = [
    lab,
    ...exposures,
    ...scenario.obligations,
    ...scenario.modelGovernanceEvidence,
    ...scenario.safetyEvaluationRecords,
    ...scenario.computeDependencyRecords,
  ];
  const marketNames = scenario.marketNames.join(", ");
  const caveats = unique([
    ...scenario.caveats,
    "This lab-by-market brief does not determine actual applicability, provider role, or enforcement risk.",
  ]);
  const lines = briefHeader(`${lab.name} lab-by-market brief`, `Markets: ${marketNames}`);
  lines.push(
    `Executive answer: ${lab.name} has ${scenario.exposureRows.length} scenario-relevant exposure row(s) for ${marketNames}. Binding rows are separated from voluntary commitments, standards influence, and infrastructure context.`,
    "",
    "## Exposure rows",
    "",
    ...scenario.exposureRows.map((row) => {
      const target = getLabExposureTarget(row);
      return `- **${target.name}:** ${LAB_EXPOSURE_EFFECT_LABELS[row.legalEffect]}; ${row.directness}; strength ${row.strength}/5. ${row.rationale}`;
    }),
    "",
    "## Related obligations",
    "",
    ...(scenario.obligations.length
      ? scenario.obligations.map((row) => `- **${row.category.replace(/_/g, " ")}:** ${row.legalEffect}; ${row.summary}`)
      : ["- No scenario-specific structured obligation rows are currently linked."]),
    "",
    caveatBlock(caveats),
    sourceTable(sources)
  );
  return createBrief({
    id: `lab-market-${lab.id}`,
    kind: "lab_market",
    title: `${lab.name} lab-by-market brief`,
    subtitle: `Markets: ${marketNames}`,
    summary: `Scenario brief for ${lab.name} across ${marketNames}.`,
    recordRefs: [
      { kind: "lab", id: lab.id, label: lab.name },
      ...marketIso3s.map((iso3) => ({ kind: "country" as const, id: iso3, label: COUNTRY_BY_ISO3[iso3]?.name ?? iso3 })),
    ],
    sources,
    caveats,
    markdown: lines.join("\n"),
  });
}

function buildCorpusBrief(routeKind: CorpusUiKind, id: string, kind: PolicyBriefKind): PolicyBrief | null {
  const record = getCorpusRecord(routeKind, id);
  if (!record) return null;
  const sources = [sourceRecord(record)];
  const related = "relatedRecords" in record.raw ? record.raw.relatedRecords : [];
  const caveats = unique(["Research aid only; not legal advice.", record.caveat]);
  const lines = briefHeader(`${record.title} brief`, `${corpusKindLabel(record.kind)} - ${record.jurisdiction}`);
  lines.push(
    `Executive answer: ${record.title} is tracked as ${record.status} for ${record.jurisdiction}.`,
    "",
    "## Summary",
    "",
    record.summary,
    "",
    "## Related records",
    "",
    ...(related.length ? related.map((ref) => `- ${ref.label ?? ref.id} (${ref.kind})`) : ["- No related record references tracked."]),
    "",
    caveatBlock(caveats),
    sourceTable(sources)
  );
  return createBrief({
    id: `${routeKind}-${id}`,
    kind,
    title: `${record.title} brief`,
    subtitle: `${corpusKindLabel(record.kind)} - ${record.jurisdiction}`,
    summary: record.summary,
    recordRefs: [{ kind: record.kind, id: record.id, label: record.title }],
    sources,
    caveats,
    markdown: lines.join("\n"),
  });
}

function buildDeadlineBrief(): PolicyBrief {
  const open = POLICY_PROCESS_RECORDS.filter((record) => record.status === "open" || record.deadline);
  const sources = open;
  const caveats = [
    "Policy windows and deadlines are time-sensitive and must be checked against the official source before use.",
    "Draft guidance or consultation activity is not itself a final legal rule.",
  ];
  const lines = briefHeader("Upcoming AI policy windows brief", "Open consultations and deadline watch");
  lines.push(
    `Executive answer: ${open.length} open or deadline-bearing policy-process row(s) are tracked in the current corpus.`,
    "",
    "## Open windows",
    "",
    ...open.map((record) => `- **${record.title}:** ${record.stage}; ${record.deadline ? `deadline ${record.deadline}` : record.status}.`),
    "",
    caveatBlock(caveats),
    sourceTable(sources)
  );
  return createBrief({
    id: "deadline-watch",
    kind: "deadline_watch",
    title: "Upcoming AI policy windows brief",
    subtitle: "Open consultations and deadline watch",
    summary: `${open.length} policy windows or deadlines tracked.`,
    recordRefs: open.map((record) => ({ kind: "policy_process", id: record.id, label: record.title })),
    sources,
    caveats,
    markdown: lines.join("\n"),
  });
}

function buildEnforcementBrief(): PolicyBrief {
  const enforcement = RESEARCH_CORPUS_RECORDS.filter((record) => record.kind === "enforcement");
  const sources = enforcement.map(sourceRecord);
  const caveats = [
    "Enforcement rows describe official public actions or records; they are not proof of broader sector-wide liability.",
    "Media-only allegations are excluded from public legal summaries.",
  ];
  const lines = briefHeader("AI enforcement and litigation watch brief", "Official-source enforcement context");
  lines.push(
    `Executive answer: ${enforcement.length} official-source enforcement or litigation context row(s) are tracked.`,
    "",
    "## Enforcement context",
    "",
    ...enforcement.map((record) => `- **${record.title}:** ${record.jurisdiction}; ${record.status}. ${record.summary}`),
    "",
    caveatBlock(caveats),
    sourceTable(sources)
  );
  return createBrief({
    id: "enforcement-watch",
    kind: "enforcement_watch",
    title: "AI enforcement and litigation watch brief",
    subtitle: "Official-source enforcement context",
    summary: `${enforcement.length} enforcement/context rows tracked.`,
    recordRefs: enforcement.map((record) => ({ kind: "enforcement", id: record.id, label: record.title })),
    sources,
    caveats,
    markdown: lines.join("\n"),
  });
}

function buildStandardsBrief(id?: string): PolicyBrief | null {
  if (id) return buildCorpusBrief("standard", id, "standards_conformity");
  const records = STANDARDS_CONFORMITY_RECORDS;
  const sources = records;
  const caveats = [
    "Standards and conformity rows are not national law unless a verified legal instrument incorporates or requires them.",
    "Standards work can influence compliance infrastructure without creating a direct public-law duty by itself.",
  ];
  const lines = briefHeader("AI standards and conformity brief", "Standards, harmonized standards, and conformity context");
  lines.push(
    `Executive answer: ${records.length} standards/conformity row(s) are tracked as context for AI governance and compliance infrastructure.`,
    "",
    "## Standards context",
    "",
    ...records.map((record) => `- **${record.title}:** ${record.status.replace(/_/g, " ")}; ${record.legalRole.replace(/_/g, " ")}. ${record.caveat}`),
    "",
    caveatBlock(caveats),
    sourceTable(sources)
  );
  return createBrief({
    id: "standards-conformity",
    kind: "standards_conformity",
    title: "AI standards and conformity brief",
    subtitle: "Standards, harmonized standards, and conformity context",
    summary: `${records.length} standards/conformity rows tracked.`,
    recordRefs: records.map((record) => ({ kind: "standards_conformity", id: record.id, label: record.title })),
    sources,
    caveats,
    markdown: lines.join("\n"),
  });
}

function createBrief({
  id,
  kind,
  title,
  subtitle,
  summary,
  recordRefs,
  sources,
  caveats,
  markdown,
}: {
  id: string;
  kind: PolicyBriefKind;
  title: string;
  subtitle: string;
  summary: string;
  recordRefs: CorpusRecordReference[];
  sources: SourceLike[];
  caveats: string[];
  markdown: string;
}): PolicyBrief {
  return {
    id,
    kind,
    title,
    subtitle,
    summary,
    recordRefs,
    sourceRefs: sources.filter(hasSource).map((source) => ({
      recordId: source.id,
      sourceName: source.sourceName,
      sourceUrl: source.sourceUrl,
      sourceKind: source.sourceKind,
      verificationStatus: source.verificationStatus,
      confidence: source.confidence,
      lastVerified: source.lastVerified,
    })),
    caveats,
    markdown,
  };
}

type SourceLike = VerificationMetadata & {
  id: string;
  sourceName?: string;
  sourceUrl?: string;
  name?: string;
  title?: string;
};

function sourceRecord(record: ResearchCorpusRecord): SourceLike {
  return {
    id: record.id,
    name: record.title,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    sourceKind: record.metadata.sourceKind,
    verificationStatus: record.metadata.verificationStatus,
    confidence: record.metadata.confidence,
    lastVerified: record.metadata.lastVerified,
    verificationNotes: record.metadata.verificationNotes,
  };
}

function hasSource(source: SourceLike): source is SourceLike & { sourceName: string; sourceUrl: string } {
  return Boolean(source.sourceName && source.sourceUrl);
}

function briefHeader(title: string, subtitle: string): string[] {
  return [
    `# ${title}`,
    "",
    `**Record:** ${subtitle}`,
    `**Dataset snapshot:** ${DATA_SNAPSHOT_DATE}`,
    "",
    "> Research aid only; not legal advice. Verify time-sensitive legal status against official sources.",
    "",
  ];
}

function caveatBlock(caveats: string[]): string {
  return ["## Caveats", "", ...unique(caveats).map((caveat) => `- ${caveat}`), ""].join("\n");
}

function sourceTable(sources: SourceLike[]): string {
  const rows = sources.filter(hasSource);
  return [
    "## Sources",
    "",
    "| Record | Source | Confidence | Last verified | URL |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map((source) =>
      `| ${mdCell(source.name ?? source.title ?? source.id)} | ${mdCell(source.sourceName)} | ${mdCell(source.confidence ?? "")} | ${mdCell(source.lastVerified ?? "")} | ${mdCell(source.sourceUrl)} |`
    ),
    "",
  ].join("\n");
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function mdCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
