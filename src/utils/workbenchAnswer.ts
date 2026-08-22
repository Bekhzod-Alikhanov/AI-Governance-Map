import { COUNTRY_INDICATOR_SCORES, COUNTRY_READINESS_REPORTS } from "../data/aiAtlas";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { LAB_BY_ID } from "../data/frontierLabs";
import { GOVERNANCE_OBLIGATIONS, OBLIGATION_BY_ID, OBLIGATION_CATEGORY_LABELS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "../data/implementationMilestones";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import { COMPUTE_DEPENDENCY_RECORDS, SAFETY_EVALUATION_RECORDS } from "../data/labIntelligence";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { RELEASE_METADATA } from "../data/releaseMetadata";
import { PUBLIC_SECTOR_AI_RECORDS } from "../data/researchCorpus";
import { SUBNATIONAL_BY_ID } from "../data/subnationalRules";
import { WORKBENCH_QUESTION_BY_ID, WORKBENCH_QUESTIONS } from "../data/workbenchQuestions";
import type {
  VerificationMetadata,
  WorkbenchAnswer,
  WorkbenchCompareItem,
  WorkbenchEvidenceRow,
  WorkbenchQuestion,
} from "../types";
import { recordRoute } from "./recordRoutes";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";
import { formatReviewState, formatSourceLocator, getReviewStatus } from "./sourceProvenance";

const CANONICAL_APP_URL = "https://global-ai-governance-map.vercel.app/";

interface EvidenceSource extends VerificationMetadata {
  id: string;
  sourceName: string;
  sourceUrl: string;
}

function evidence(row: EvidenceSource, name: string, entity: string, recordUrl?: string): WorkbenchEvidenceRow {
  return { ...row, name, entity, recordUrl };
}

function limited(rows: WorkbenchEvidenceRow[]): WorkbenchEvidenceRow[] {
  const ids = new Set<string>();
  return rows.filter((row) => !ids.has(row.id) && Boolean(ids.add(row.id))).slice(0, 5);
}

function sourceDistinct(rows: WorkbenchEvidenceRow[]): WorkbenchEvidenceRow[] {
  const urls = new Set<string>();
  return limited(rows.filter((row) => !urls.has(row.sourceUrl) && Boolean(urls.add(row.sourceUrl))));
}

function scopedAnswer(
  question: WorkbenchQuestion,
  rows: WorkbenchEvidenceRow[],
  noun: string,
  sentence: string,
  caveat: string,
  countLabel = `${rows.length} ${noun}`,
): WorkbenchAnswer {
  const selected = limited(rows);
  return answer({
    questionId: question.id,
    questionTitle: question.title,
    sentence: rows.length ? sentence : `The tracked release has no matching evidence for ${noun}.`,
    caveat,
    countLabel: rows.length ? countLabel : `0 ${noun}`,
    namedEntities: uniqueStrings(selected.map((row) => row.entity)),
    evidence: selected,
  });
}

function obligationEvidence(rows: typeof GOVERNANCE_OBLIGATIONS): WorkbenchEvidenceRow[] {
  return rows.map((row) => evidence(
    row,
    `${row.jurisdiction ?? "Jurisdiction not specified"}: ${OBLIGATION_CATEGORY_LABELS[row.category]}`,
    row.jurisdiction ?? "Jurisdiction not specified",
    recordRoute("obligation", row.id),
  ));
}

function configuredEvidence(question: WorkbenchQuestion): WorkbenchEvidenceRow[] {
  return (question.compareItems ?? []).map(evidenceForCompareItem).filter(isEvidence);
}

function bindingAnswer(question: WorkbenchQuestion): WorkbenchAnswer {
  const rows = GOVERNANCE_OBLIGATIONS.filter((row) => row.legalEffect === "binding");
  const priority = ["European Union", "California"];
  const sorted = [...rows].sort((a, b) => {
    const ai = priority.indexOf(a.jurisdiction ?? "");
    const bi = priority.indexOf(b.jurisdiction ?? "");
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  const selected = selectDistinct(sorted, (row) => row.jurisdiction ?? row.id, 5);
  const evidenceRows = obligationEvidence(selected);
  return scopedAnswer(
    question,
    evidenceRows,
    "binding obligation rows",
    `${rows.length} source-backed binding obligation rows are tracked across ${uniqueStrings(rows.map((row) => row.jurisdiction ?? "")).length} jurisdictions or legal hooks.`,
    "Counts describe structured rows in the tracked release, not every possible duty or legal advice.",
    `${rows.length} binding obligation rows`,
  );
}

function obligationCategoryAnswer(question: WorkbenchQuestion, category: typeof GOVERNANCE_OBLIGATIONS[number]["category"], noun: string): WorkbenchAnswer {
  const rows = GOVERNANCE_OBLIGATIONS.filter((row) => row.category === category);
  const all = obligationEvidence(rows);
  const selected = category === "incident_reporting" ? sourceDistinct(all) : limited(all);
  return scopedAnswer(
    question,
    selected,
    noun,
    `${rows.length} ${noun} are tracked in source-backed obligation rows.`,
    "Coverage and triggers differ by rule; no duty is inferred where the release has no structured obligation row.",
    `${rows.length} ${noun}`,
  );
}

function domainAnswer(question: WorkbenchQuestion, domain: typeof GOVERNANCE_OBLIGATIONS[number]["domains"][number], noun: string): WorkbenchAnswer {
  const obligations = GOVERNANCE_OBLIGATIONS.filter((row) => row.domains.includes(domain));
  const configured = configuredEvidence(question);
  const rows = limited([...configured, ...obligationEvidence(obligations)]);
  return scopedAnswer(
    question,
    rows,
    noun,
    `${obligations.length + configured.length} ${noun} source rows are tracked.`,
    "The scope is limited to structured records tagged to this domain and is not legal advice.",
    `${obligations.length + configured.length} ${noun} source rows`,
  );
}

function coeAnswer(question: WorkbenchQuestion): WorkbenchAnswer {
  const rows = INTERNATIONAL_PARTICIPATION.filter((row) => row.instrumentId === "coe-ai-convention");
  const ratified = rows.filter((row) => row.participationType === "ratified");
  const ratifiedIds = new Set(ratified.map((row) => row.countryIso3));
  const signed = rows.filter((row) => row.participationType === "signed" && !ratifiedIds.has(row.countryIso3));
  const evidenceRows = [...ratified, ...signed].map((row) => {
    const country = COUNTRY_BY_ISO3[row.countryIso3]?.name ?? row.countryIso3;
    return evidence(row, `${country} \u2014 ${row.participationType === "ratified" ? "ratified" : "signature only"}`, country, recordRoute("country", row.countryIso3));
  });
  return scopedAnswer(
    question,
    evidenceRows,
    "ratification and signature-only rows",
    `${ratified.length} ratification and ${signed.length} signature-only rows are tracked for the Council of Europe AI Convention.`,
    "Signature is not ratification, ratified parties are excluded from the signature-only count, and the convention is not yet in force.",
    `${ratified.length} ratified · ${signed.length} signature-only`,
  );
}

function euComparison(question: WorkbenchQuestion): WorkbenchAnswer {
  const rules = (question.compareItems ?? []).filter((item) => item.kind === "rule")
    .map((item) => NATIONAL_REG_BY_ID[item.id]).filter(Boolean);
  const regional = rules.filter((row) => row.regionalEntity === "EU");
  const national = rules.filter((row) => row.countryIso3 && row.regionalEntity !== "EU");
  const rows = rules.map((row) => evidence(row, row.name, row.jurisdiction, recordRoute("rule", row.id)));
  const sentence = regional.length
    ? `${regional.length} tracked EU regulation is directly applicable, while ${national.length} national implementation rows describe member-state activity.`
    : `0 EU regulation rows are configured; ${national.length} national implementation rows remain tracked.`;
  return scopedAnswer(
    question,
    rows,
    "EU regulation and national implementation rows",
    sentence,
    regional.length
      ? "National implementation supplements the directly applicable EU regulation and is not a separate national enactment of that regulation."
      : "Without a configured regional regulation row, national implementation records are not evidence of direct EU applicability.",
    `${regional.length} EU regulations · ${national.length} national implementation rows`,
  );
}

function frontierExposure(question: WorkbenchQuestion): WorkbenchAnswer {
  const binding = LAB_REGULATORY_EXPOSURES.filter((row) => row.legalEffect === "binding");
  const priority = ["openai", "google-deepmind", "mistral"];
  const selected = selectDistinct([...binding].sort((a, b) => {
    const ai = priority.indexOf(a.labId); const bi = priority.indexOf(b.labId);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  }), (row) => row.labId, 5);
  const rows = selected.map((row) => {
    const lab = LAB_BY_ID[row.labId]?.name ?? row.labId;
    return evidence(row, `${lab}: ${targetName(row.targetId)}`, lab, recordRoute("exposure", row.id));
  });
  return scopedAnswer(
    question,
    rows,
    "frontier-lab binding exposure rows",
    `${uniqueStrings(binding.map((row) => row.labId)).length} frontier labs have ${binding.length} binding exposure hooks.`,
    "Applicability hooks are not lab-specific enforcement findings and do not prove every duty is triggered.",
    `${binding.length} frontier-lab binding exposure rows`,
  );
}

function labFrameworks(question: WorkbenchQuestion): WorkbenchAnswer {
  const labs = (question.compareItems ?? []).filter((item) => item.kind === "lab")
    .map((item) => LAB_BY_ID[item.id]).filter((lab) => Boolean(lab?.safetyFramework));
  const rows = labs.map((lab) => evidence(
    { id: `${lab.id}--safety-framework`, ...lab.safetyFramework! },
    lab.safetyFramework!.name,
    lab.name,
    recordRoute("lab", lab.id),
  ));
  return scopedAnswer(question, rows, "labs publishing safety frameworks", `${rows.length} configured labs publish safety framework evidence.`, "Company-published safety frameworks are issuer-controlled evidence, not independent audits or public law.");
}

function governmentEvaluation(question: WorkbenchQuestion): WorkbenchAnswer {
  const labIds = new Set((question.compareItems ?? []).filter((item) => item.kind === "lab").map((item) => item.id));
  const records = SAFETY_EVALUATION_RECORDS.filter((row) => row.labIds.some((id) => labIds.has(id)));
  const rows = records.map((row) => evidence(row, row.evaluationBody, uniqueStrings(row.labIds.filter((id) => labIds.has(id)).map((id) => LAB_BY_ID[id]?.name ?? id)).join(" / "), `/embed/safety-evaluation/${encodeURIComponent(row.id)}`));
  return scopedAnswer(question, rows, "government evaluation evidence rows", `${records.length} government evaluation evidence rows match the configured labs.`, "Evaluation evidence is not certification, binding law, or an enforcement finding.");
}

function highReadiness(question: WorkbenchQuestion): WorkbenchAnswer {
  const records = COUNTRY_INDICATOR_SCORES
    .filter(
      (row) =>
        row.sourceId === "oxford-gov-ai-readiness-2025" &&
        row.score !== undefined &&
        row.score >= 60 &&
        !getCountryGovernanceSummary(row.countryIso3).hasBindingNationalLaw,
    )
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 8);
  const rows = records.map((row) => evidence(row, `Oxford readiness: ${COUNTRY_BY_ISO3[row.countryIso3]?.name ?? row.countryIso3}`, COUNTRY_BY_ISO3[row.countryIso3]?.name ?? row.countryIso3, recordRoute("country", row.countryIso3)));
  return scopedAnswer(
    question,
    rows,
    "high-readiness / no-confirmed-binding-law countries",
    `${records.length} high-readiness countries with no confirmed binding AI-specific law are tracked.`,
    "Readiness is contextual capacity evidence; absence means no binding AI-specific law is confirmed in this release, not that a jurisdiction has no relevant law.",
  );
}

function unescoRam(question: WorkbenchQuestion): WorkbenchAnswer {
  const records = COUNTRY_READINESS_REPORTS.filter(
    (row) =>
      row.sourceId === "unesco-ram-global-hub-2026" &&
      (row.status === "completed" || row.status === "in_process"),
  );
  const rows = records.map((row) => evidence(row, `UNESCO RAM: ${COUNTRY_BY_ISO3[row.countryIso3]?.name ?? row.countryIso3}`, COUNTRY_BY_ISO3[row.countryIso3]?.name ?? row.countryIso3, recordRoute("country", row.countryIso3)));
  return scopedAnswer(question, rows, "UNESCO RAM activity rows", `${records.length} UNESCO RAM activity rows are tracked.`, "RAM activity is assessment context, not a comparable legal score or binding duty.", `${records.length} UNESCO RAM activity rows`);
}

function standards(question: WorkbenchQuestion): WorkbenchAnswer {
  const configured = configuredEvidence(question);
  return scopedAnswer(question, configured, "standards and soft-law instruments", `${configured.length} configured standards and soft-law instruments are tracked.`, "Standards, guidance, and voluntary commitments are not binding law unless incorporated by a verified legal instrument.", `${configured.length} standards and soft-law instruments`);
}

function deadlines(question: WorkbenchQuestion): WorkbenchAnswer {
  const records = IMPLEMENTATION_MILESTONES.filter((row) =>
    ["phased_application", "implementing_rules_pending"].includes(row.status) &&
    Boolean((row.nextDeadline ?? row.date) && (row.nextDeadline ?? row.date)! > RELEASE_METADATA.statusAsOf),
  ).sort((a, b) => (a.nextDeadline ?? a.date ?? "").localeCompare(b.nextDeadline ?? b.date ?? ""));
  const rows = records.map((row) => {
    const date = row.nextDeadline ?? row.date!;
    return evidence(row, `${row.label} \u2014 ${date}`, row.jurisdiction, `/embed/implementation/${encodeURIComponent(row.id)}`);
  });
  return scopedAnswer(question, rows, "upcoming implementation deadlines", `${records.length} upcoming implementation deadlines are tracked after ${RELEASE_METADATA.statusAsOf}, ordered from soonest to latest.`, "The AI Omnibus changed these high-risk-system deadlines; official dates can change.", `${records.length} upcoming deadlines`);
}

function computeDependencies(question: WorkbenchQuestion): WorkbenchAnswer {
  const labIds = new Set((question.compareItems ?? []).filter((item) => item.kind === "lab").map((item) => item.id));
  const records = COMPUTE_DEPENDENCY_RECORDS.filter((row) => row.labIds.some((id) => labIds.has(id)));
  const rows = records.map((row) => evidence(row, row.summary, uniqueStrings(row.labIds.filter((id) => labIds.has(id)).map((id) => LAB_BY_ID[id]?.name ?? id)).join(" / ")));
  return scopedAnswer(question, rows, "compute dependency evidence rows", `${records.length} compute dependency evidence rows match the configured lab.`, "Compute and cloud dependencies are infrastructure context, not AI-specific legal obligations.");
}

function sourceConfidence(question: WorkbenchQuestion): WorkbenchAnswer {
  const records = NATIONAL_AI_REGULATIONS.filter((row) => row.confidence === "high" && row.sourceKind === "official");
  const rows = records.map((row) => evidence(row, row.name, row.jurisdiction, recordRoute("rule", row.id)));
  return scopedAnswer(question, rows, "high-confidence source claims", `${records.length} high-confidence national-rule claims use official sources.`, "Confidence describes source verification, not legal importance or a guarantee that status has not changed.");
}

function proposedLaws(question: WorkbenchQuestion): WorkbenchAnswer {
  const records = NATIONAL_AI_REGULATIONS.filter((row) => row.bindingStatus === "proposed");
  const rows = records.map((row) => evidence(row, row.name, row.jurisdiction, recordRoute("rule", row.id)));
  return scopedAnswer(question, rows, "proposed law rows", `${records.length} proposed law rows are tracked for monitoring.`, "Proposals are not enacted law and may change or lapse.");
}

function gpaiMarket(question: WorkbenchQuestion): WorkbenchAnswer {
  const rows = configuredEvidence(question);
  return scopedAnswer(question, rows, "GPAI market-access exposure rows", `${rows.length} GPAI market-access exposure rows are configured.`, "Market-access exposure is conditional applicability context, not an enforcement finding.");
}

function publicSector(question: WorkbenchQuestion): WorkbenchAnswer {
  const obligations = GOVERNANCE_OBLIGATIONS.filter((row) => row.domains.includes("public-sector"));
  const obligationRows = obligationEvidence(obligations);
  const contextRows = PUBLIC_SECTOR_AI_RECORDS.map((row) => evidence(row, row.title, row.jurisdiction, `/embed/public-sector-ai/${encodeURIComponent(row.id)}`));
  const rows = [...contextRows.slice(0, 2), ...obligationRows, ...contextRows.slice(2)];
  return scopedAnswer(
    question,
    rows,
    "public-sector obligation and registry/context rows",
    `Public-sector AI governance includes ${obligations.length} public-sector obligation rows and ${contextRows.length} registry/context rows.`,
    "Obligations vary in legal effect and applicability; registries and guidance are governance context and do not by themselves establish private-sector duties.",
    `${obligations.length} public-sector obligations · ${contextRows.length} registry/context rows`,
  );
}

function configuredQuestion(question: WorkbenchQuestion, noun: string): WorkbenchAnswer {
  const rows = configuredEvidence(question);
  return scopedAnswer(question, rows, noun, `${rows.length} ${noun} are configured for citation.`, "The citation set is a scoped research aid; verify current legal status against each linked source.");
}

type Selector = (question: WorkbenchQuestion) => WorkbenchAnswer;
const SELECTORS: Record<string, Selector> = {
  "binding-duties-by-jurisdiction": bindingAnswer,
  "incident-reporting": (q) => obligationCategoryAnswer(q, "incident_reporting", "incident-reporting obligation rows"),
  "model-evaluation": (q) => obligationCategoryAnswer(q, "model_evaluation_red_teaming", "model-evaluation obligation rows"),
  "coe-signed-ratified": coeAnswer,
  "eu-act-vs-national-law": euComparison,
  "frontier-lab-binding-exposure": frontierExposure,
  "labs-with-safety-frameworks": labFrameworks,
  "government-evaluation-exposure": governmentEvaluation,
  "china-synthetic-media": (q) => scopedAnswer(q, configuredEvidence(q), "China synthetic-media rule rows", `${configuredEvidence(q).length} China synthetic-media rule rows are configured.`, "These linked rules have distinct scopes and should not be collapsed into one duty."),
  "high-readiness-weak-law": highReadiness,
  "unesco-ram-available": unescoRam,
  "standards-soft-law": standards,
  "implementation-deadlines": deadlines,
  "employment-ai": (q) => domainAnswer(q, "employment-hiring", "employment AI"),
  biometrics: (q) => domainAnswer(q, "biometric-identification", "biometric restriction"),
  "healthcare-ai": (q) => domainAnswer(q, "healthcare", "healthcare AI"),
  "compute-dependencies": computeDependencies,
  "source-confidence": sourceConfidence,
  "proposed-laws": proposedLaws,
  "gpai-market-access": gpaiMarket,
  "public-sector-ai": publicSector,
  "citation-brief": (q) => configuredQuestion(q, "citable source rows"),
};

export function buildWorkbenchAnswer(questionId: string): WorkbenchAnswer {
  const question = WORKBENCH_QUESTION_BY_ID[questionId] ?? WORKBENCH_QUESTIONS[0];
  return SELECTORS[question.id](question);
}

export function renderWorkbenchAnswerCsv(value: WorkbenchAnswer): string {
  const header = ["question_id", "question_title", "answer", "caveat", "entity", "evidence_id", "evidence_name", "source_name", "source_url", "record_url", "source_locator", "review_status", "review_notes", "last_verified", "release_date", "coverage_cutoff", "status_as_of"];
  const sourceRows: Array<WorkbenchEvidenceRow | null> = value.evidence.length ? value.evidence : [null];
  const rows = sourceRows.map((row) => [
    value.questionId, value.questionTitle, value.sentence, value.caveat, row?.entity ?? "", row?.id ?? "", row?.name ?? "",
    row?.sourceName ?? "", row?.sourceUrl ?? "", row?.recordUrl ?? "", row?.sourceLocator ? formatSourceLocator(row.sourceLocator) : "",
    row ? getReviewStatus(row) : "", row?.reviewNotes ?? "", row?.lastVerified ?? "", value.releaseDate, value.coverageCutoff, value.statusAsOf,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function renderWorkbenchAnswerCitation(value: WorkbenchAnswer): string {
  const canonicalUrl = `${CANONICAL_APP_URL}?lens=workbench&wbQuestion=${encodeURIComponent(value.questionId)}`;
  const sources = value.evidence.map((row) => {
    const details = [
      row.sourceLocator ? formatSourceLocator(row.sourceLocator) : null,
      formatReviewState(row),
      row.lastVerified ? `last verified ${row.lastVerified}` : null,
    ].filter(Boolean).join("; ");
    return `- ${row.sourceName} \u2014 ${row.sourceUrl}${details ? ` (${details})` : ""}`;
  });
  return [
    `${value.questionTitle} \u2014 ${value.sentence}`,
    `Global AI Governance Map, release ${value.releaseDate}; coverage through ${value.coverageCutoff}; status as of ${value.statusAsOf}.`,
    `Caveat: ${value.caveat}`,
    `Canonical Workbench URL: ${canonicalUrl}`,
    "Sources:",
    ...(sources.length ? sources : ["- No matching source evidence is recorded in this release."]),
  ].join("\n");
}

function answer(value: Omit<WorkbenchAnswer, "releaseDate" | "coverageCutoff" | "statusAsOf">): WorkbenchAnswer {
  const evidenceRows = limited(value.evidence);
  return {
    ...value,
    evidence: evidenceRows,
    namedEntities: uniqueStrings(evidenceRows.map((row) => row.entity)),
    releaseDate: RELEASE_METADATA.releaseDate,
    coverageCutoff: RELEASE_METADATA.coverageCutoff,
    statusAsOf: RELEASE_METADATA.statusAsOf,
  };
}

function evidenceForCompareItem(item: WorkbenchCompareItem): WorkbenchEvidenceRow | null {
  if (item.kind === "country") {
    const country = COUNTRY_BY_ISO3[item.id];
    const row = NATIONAL_AI_REGULATIONS.find((candidate) => candidate.countryIso3 === item.id);
    return country && row ? evidence(row, row.name, country.name, recordRoute("rule", row.id)) : null;
  }
  if (item.kind === "lab") {
    const row = LAB_BY_ID[item.id];
    return row ? evidence(row, row.name, row.name, recordRoute("lab", row.id)) : null;
  }
  if (item.kind === "instrument") {
    const row = INSTRUMENT_BY_ID[item.id];
    return row ? evidence(row, row.name, row.issuer, recordRoute("instrument", row.id)) : null;
  }
  if (item.kind === "rule") {
    const row = NATIONAL_REG_BY_ID[item.id] ?? SUBNATIONAL_BY_ID[item.id];
    return row ? evidence(row, row.name, row.jurisdiction ?? row.name, recordRoute("rule", row.id)) : null;
  }
  if (item.kind === "obligation") {
    const row = OBLIGATION_BY_ID[item.id];
    return row ? evidence(row, OBLIGATION_CATEGORY_LABELS[row.category], row.jurisdiction ?? "Jurisdiction not specified", recordRoute("obligation", row.id)) : null;
  }
  const row = LAB_REGULATORY_EXPOSURES.find((candidate) => candidate.id === item.id);
  if (!row) return null;
  const lab = LAB_BY_ID[row.labId]?.name ?? row.labId;
  return evidence(row, `${lab}: ${targetName(row.targetId)}`, lab, recordRoute("exposure", row.id));
}

function targetName(id: string): string {
  return NATIONAL_REG_BY_ID[id]?.name ?? SUBNATIONAL_BY_ID[id]?.name ?? INSTRUMENT_BY_ID[id]?.name ?? id;
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function uniqueStrings(values: string[]): string[] { return [...new Set(values.filter(Boolean))]; }
function isEvidence(value: WorkbenchEvidenceRow | null): value is WorkbenchEvidenceRow { return Boolean(value); }
function selectDistinct<T>(values: T[], key: (value: T) => string, limit: number): T[] {
  const seen = new Set<string>();
  return values.filter((value) => !seen.has(key(value)) && Boolean(seen.add(key(value)))).slice(0, limit);
}
