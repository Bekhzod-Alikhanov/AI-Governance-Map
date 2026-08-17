import { COUNTRY_BY_ISO3 } from "../data/countries";
import { LAB_BY_ID } from "../data/frontierLabs";
import {
  GOVERNANCE_OBLIGATIONS,
  OBLIGATION_BY_ID,
  OBLIGATION_CATEGORY_LABELS,
} from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "../data/implementationMilestones";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { RELEASE_METADATA } from "../data/releaseMetadata";
import { SUBNATIONAL_BY_ID } from "../data/subnationalRules";
import {
  WORKBENCH_QUESTION_BY_ID,
  WORKBENCH_QUESTIONS,
} from "../data/workbenchQuestions";
import type {
  FilterState,
  VerificationMetadata,
  WorkbenchAnswer,
  WorkbenchCompareItem,
  WorkbenchEvidenceRow,
} from "../types";
import { recordRoute } from "./recordRoutes";
import {
  buildWorkbenchAnswerCards,
  implementationMatchesFilters,
  obligationMatchesFilters,
} from "./researchWorkbench";

const CANONICAL_APP_URL = "https://global-ai-governance-map.vercel.app/";

interface EvidenceSource extends VerificationMetadata {
  id: string;
  sourceName: string;
  sourceUrl: string;
}

function evidence(
  row: EvidenceSource,
  name: string,
  entity: string,
  recordUrl?: string,
): WorkbenchEvidenceRow {
  return {
    id: row.id,
    name,
    entity,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    recordUrl,
    sourceKind: row.sourceKind,
    verificationStatus: row.verificationStatus,
    confidence: row.confidence,
    lastVerified: row.lastVerified,
    verificationNotes: row.verificationNotes,
    sourceLocator: row.sourceLocator,
    sourceChain: row.sourceChain,
    reviewStatus: row.reviewStatus,
    reviewNotes: row.reviewNotes,
    archivedUrl: row.archivedUrl,
    archivedAt: row.archivedAt,
  };
}

function uniqueEvidence(rows: WorkbenchEvidenceRow[]): WorkbenchEvidenceRow[] {
  const seenIds = new Set<string>();
  const seenRecordSources = new Set<string>();
  return rows
    .filter((row) => {
      const sourceKey = `${row.recordUrl ?? row.id}|${row.sourceUrl}`;
      if (seenIds.has(row.id) || seenRecordSources.has(sourceKey)) return false;
      seenIds.add(row.id);
      seenRecordSources.add(sourceKey);
      return true;
    })
    .slice(0, 5);
}

function bindingAnswer(questionTitle: string): WorkbenchAnswer {
  const rows = GOVERNANCE_OBLIGATIONS.filter((row) => row.legalEffect === "binding");
  const jurisdictions = uniqueStrings(rows.map((row) => row.jurisdiction).filter(isString));
  const selected = selectDistinct(rows, (row) => row.jurisdiction ?? row.id, 5);
  return answer({
    questionId: "binding-duties-by-jurisdiction",
    questionTitle,
    sentence: `${rows.length} source-backed binding obligation rows span ${jurisdictions.length} tracked jurisdictions or legal hooks.`,
    caveat:
      "Counts describe structured rows in this tracked snapshot, not a complete statement of every duty or legal advice.",
    countLabel: `${rows.length} binding rows · ${jurisdictions.length} jurisdictions or hooks`,
    namedEntities: jurisdictions,
    evidence: selected.map((row) =>
      evidence(
        row,
        `${row.jurisdiction ?? "Jurisdiction not specified"}: ${OBLIGATION_CATEGORY_LABELS[row.category]}`,
        row.jurisdiction ?? "Jurisdiction not specified",
        recordRoute("obligation", row.id),
      ),
    ),
  });
}

function incidentReportingAnswer(questionTitle: string): WorkbenchAnswer {
  const obligations = GOVERNANCE_OBLIGATIONS.filter(
    (row) => row.category === "incident_reporting",
  );
  const jurisdictions = uniqueStrings(
    obligations.map((row) => row.jurisdiction).filter(isString),
  );
  const related = obligations.flatMap((obligation) => {
    const parent =
      obligation.parentType === "national_rule"
        ? NATIONAL_REG_BY_ID[obligation.parentId]
        : obligation.parentType === "subnational_rule"
          ? SUBNATIONAL_BY_ID[obligation.parentId]
          : obligation.parentType === "international_instrument"
            ? INSTRUMENT_BY_ID[obligation.parentId]
            : undefined;
    const parentEvidence = parent
      ? evidence(
          parent,
          parent.name,
          obligation.jurisdiction ?? "Jurisdiction not specified",
          obligation.parentType === "international_instrument"
            ? recordRoute("instrument", parent.id)
            : recordRoute("rule", parent.id),
        )
      : null;
    const milestones = IMPLEMENTATION_MILESTONES.filter(
      (row) => row.parentId === obligation.parentId,
    ).map((row) =>
      evidence(
        row,
        row.label,
        row.jurisdiction,
        implementationRoute(row.id),
      ),
    );
    return [
      evidence(
        obligation,
        `${obligation.jurisdiction ?? "Jurisdiction not specified"}: ${OBLIGATION_CATEGORY_LABELS[obligation.category]}`,
        obligation.jurisdiction ?? "Jurisdiction not specified",
        recordRoute("obligation", obligation.id),
      ),
      ...(parentEvidence ? [parentEvidence] : []),
      ...milestones,
    ];
  });

  return answer({
    questionId: "incident-reporting",
    questionTitle,
    sentence: `${obligations.length} structured incident-reporting obligation ${plural(obligations.length, "row")} ${pluralVerb(obligations.length, "is", "are")} tracked across ${jurisdictions.length} ${plural(jurisdictions.length, "jurisdiction")}.`,
    caveat:
      "Coverage and trigger thresholds differ by rule; the answer does not infer an incident-reporting duty where the dataset has no structured obligation row.",
    countLabel: `${obligations.length} obligation ${plural(obligations.length, "row")}`,
    namedEntities: jurisdictions,
    evidence: uniqueEvidence(related),
  });
}

function coeParticipationAnswer(questionTitle: string): WorkbenchAnswer {
  const rows = INTERNATIONAL_PARTICIPATION.filter(
    (row) => row.instrumentId === "coe-ai-convention",
  );
  const ratified = rows.filter((row) => row.participationType === "ratified");
  const ratifiedParties = new Set(ratified.map((row) => row.countryIso3));
  const signatureOnly = rows.filter(
    (row) => row.participationType === "signed" && !ratifiedParties.has(row.countryIso3),
  );
  const parties = [...ratified, ...signatureOnly];

  return answer({
    questionId: "coe-signed-ratified",
    questionTitle,
    sentence: `${ratified.length} ${plural(ratified.length, "ratification")} and ${signatureOnly.length} signature-only rows are tracked for the Council of Europe AI Convention.`,
    caveat:
      "Signature is not ratification, ratified parties are excluded from the signature-only count, and the convention is not yet in force.",
    countLabel: `${ratified.length} ratified · ${signatureOnly.length} signature-only`,
    namedEntities: uniqueStrings(
      parties.map((row) => COUNTRY_BY_ISO3[row.countryIso3]?.name ?? row.countryIso3),
    ),
    evidence: parties.slice(0, 5).map((row) => {
      const countryName = COUNTRY_BY_ISO3[row.countryIso3]?.name ?? row.countryIso3;
      return evidence(
        row,
        `${countryName} — ${row.participationType === "ratified" ? "ratified" : "signature only"}`,
        countryName,
        recordRoute("country", row.countryIso3),
      );
    }),
  });
}

function frontierLabExposureAnswer(questionTitle: string): WorkbenchAnswer {
  const rows = LAB_REGULATORY_EXPOSURES.filter(
    (row) => row.legalEffect === "binding",
  );
  const labIds = uniqueStrings(rows.map((row) => row.labId));
  const labNames = labIds.map((id) => LAB_BY_ID[id]?.name ?? id);
  const selected = selectDistinct(rows, (row) => row.labId, 5);

  return answer({
    questionId: "frontier-lab-binding-exposure",
    questionTitle,
    sentence: `${labNames.length} tracked frontier labs have ${rows.length} binding exposure hooks in the structured exposure matrix.`,
    caveat:
      "These rows are applicability hooks based on jurisdiction or market activity, not lab-specific enforcement findings or conclusions that every duty is triggered.",
    countLabel: `${labNames.length} labs · ${rows.length} binding hooks`,
    namedEntities: labNames,
    evidence: selected.map((row) => {
      const labName = LAB_BY_ID[row.labId]?.name ?? row.labId;
      const targetName = getTargetName(row.targetId);
      return evidence(
        row,
        `${labName}: ${targetName}`,
        labName,
        recordRoute("exposure", row.id),
      );
    }),
  });
}

function euActVsNationalAnswer(questionTitle: string): WorkbenchAnswer {
  const ids = [
    "eu-ai-act-regional",
    "it-law-132-2025",
    "si-eu-ai-act-implementation-2025",
  ];
  const rules = ids
    .map((id) => NATIONAL_REG_BY_ID[id])
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const milestones = IMPLEMENTATION_MILESTONES.filter((row) =>
    ids.includes(row.parentId),
  );
  const rows = uniqueEvidence([
    ...rules.map((row) => evidence(row, row.name, row.jurisdiction, recordRoute("rule", row.id))),
    ...milestones.map((row) =>
      evidence(row, row.label, row.jurisdiction, implementationRoute(row.id)),
    ),
  ]);

  return answer({
    questionId: "eu-act-vs-national-law",
    questionTitle,
    sentence: `The EU AI Act has direct applicability across the EU, while ${Math.max(0, rules.length - 1)} tracked national law rows describe implementation activity in member states.`,
    caveat:
      "National implementation and enforcement arrangements supplement the directly applicable EU regulation; they should not be counted as separate national enactments of the EU AI Act itself.",
    countLabel: `1 EU regulation · ${Math.max(0, rules.length - 1)} national implementation rows`,
    namedEntities: ["European Union", "Italy", "Slovenia"],
    evidence: rows,
  });
}

function genericAnswer(
  questionId: string,
  filters: FilterState,
): WorkbenchAnswer {
  const question = WORKBENCH_QUESTION_BY_ID[questionId] ?? WORKBENCH_QUESTIONS[0];
  const cards = buildWorkbenchAnswerCards(filters);
  const card =
    cards.find((item) => item.id === question.answerCardId) ?? cards[0];
  const fromComparison = (question.compareItems ?? [])
    .map(evidenceForCompareItem)
    .filter((row): row is WorkbenchEvidenceRow => Boolean(row));
  const fallback = GOVERNANCE_OBLIGATIONS
    .filter((row) => obligationMatchesFilters(row, filters))
    .map((row) =>
      evidence(
        row,
        `${row.jurisdiction ?? "Jurisdiction not specified"}: ${OBLIGATION_CATEGORY_LABELS[row.category]}`,
        row.jurisdiction ?? "Jurisdiction not specified",
        recordRoute("obligation", row.id),
      ),
    );
  const evidenceRows = uniqueEvidence([...fromComparison, ...fallback]);
  return answer({
    questionId: question.id,
    questionTitle: question.title,
    sentence: card.sentence,
    caveat:
      "This answer summarizes tracked rows matching the configured question and filters; it does not claim that untracked activity is absent and is not legal advice.",
    countLabel: `${card.value} · ${card.label}`,
    namedEntities: uniqueStrings(evidenceRows.map((row) => row.entity)),
    evidence: evidenceRows,
  });
}

export function buildWorkbenchAnswer(
  questionId: string,
  filters: FilterState,
): WorkbenchAnswer {
  const question = WORKBENCH_QUESTION_BY_ID[questionId] ?? WORKBENCH_QUESTIONS[0];
  if (question.id === "binding-duties-by-jurisdiction") return bindingAnswer(question.title);
  if (question.id === "incident-reporting") return incidentReportingAnswer(question.title);
  if (question.id === "coe-signed-ratified") return coeParticipationAnswer(question.title);
  if (question.id === "frontier-lab-binding-exposure") return frontierLabExposureAnswer(question.title);
  if (question.id === "eu-act-vs-national-law") return euActVsNationalAnswer(question.title);
  if (question.id === "implementation-deadlines") {
    const rows = IMPLEMENTATION_MILESTONES.filter((row) =>
      implementationMatchesFilters(row, { ...filters, ...question.patch }),
    );
    return answer({
      questionId: question.id,
      questionTitle: question.title,
      sentence: `${rows.length} tracked implementation milestones match the selected deadline statuses.`,
      caveat: "Dates describe tracked implementation milestones and may change in official sources.",
      countLabel: `${rows.length} milestones`,
      namedEntities: uniqueStrings(rows.map((row) => row.jurisdiction)),
      evidence: rows.slice(0, 5).map((row) =>
        evidence(row, row.label, row.jurisdiction, implementationRoute(row.id)),
      ),
    });
  }
  return genericAnswer(question.id, filters);
}

export function renderWorkbenchAnswerCsv(answerValue: WorkbenchAnswer): string {
  const header = [
    "question_id",
    "question_title",
    "answer",
    "caveat",
    "entity",
    "evidence_id",
    "evidence_name",
    "source_name",
    "source_url",
    "record_url",
    "status_as_of",
  ];
  const rows = answerValue.evidence.map((row) => [
    answerValue.questionId,
    answerValue.questionTitle,
    answerValue.sentence,
    answerValue.caveat,
    row.entity,
    row.id,
    row.name,
    row.sourceName,
    row.sourceUrl,
    row.recordUrl ?? "",
    answerValue.statusAsOf,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function renderWorkbenchAnswerCitation(answerValue: WorkbenchAnswer): string {
  const canonicalUrl = `${CANONICAL_APP_URL}?lens=workbench&wbQuestion=${encodeURIComponent(answerValue.questionId)}`;
  const sources = uniqueStrings(
    answerValue.evidence.map((row) => `${row.sourceName} — ${row.sourceUrl}`),
  );
  return [
    `${answerValue.questionTitle} — ${answerValue.sentence}`,
    `Global AI Governance Map, release ${RELEASE_METADATA.releaseDate}; status as of ${answerValue.statusAsOf}.`,
    `Caveat: ${answerValue.caveat}`,
    `Canonical Workbench URL: ${canonicalUrl}`,
    "Sources:",
    ...sources.map((source) => `- ${source}`),
  ].join("\n");
}

function answer(
  value: Omit<WorkbenchAnswer, "statusAsOf">,
): WorkbenchAnswer {
  return { ...value, evidence: uniqueEvidence(value.evidence), statusAsOf: RELEASE_METADATA.statusAsOf };
}

function evidenceForCompareItem(item: WorkbenchCompareItem): WorkbenchEvidenceRow | null {
  if (item.kind === "country") {
    const country = COUNTRY_BY_ISO3[item.id];
    const row = NATIONAL_AI_REGULATIONS.find((candidate) => candidate.countryIso3 === item.id);
    return country && row
      ? evidence(row, row.name, country.name, recordRoute("rule", row.id))
      : null;
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
    return row ? evidence(row, row.name, row.jurisdiction, recordRoute("rule", row.id)) : null;
  }
  if (item.kind === "obligation") {
    const row = OBLIGATION_BY_ID[item.id];
    return row
      ? evidence(
          row,
          OBLIGATION_CATEGORY_LABELS[row.category],
          row.jurisdiction ?? "Jurisdiction not specified",
          recordRoute("obligation", row.id),
        )
      : null;
  }
  const row = LAB_REGULATORY_EXPOSURES.find((candidate) => candidate.id === item.id);
  if (!row) return null;
  const labName = LAB_BY_ID[row.labId]?.name ?? row.labId;
  return evidence(row, `${labName}: ${getTargetName(row.targetId)}`, labName, recordRoute("exposure", row.id));
}

function getTargetName(targetId: string): string {
  return (
    NATIONAL_REG_BY_ID[targetId]?.name ??
    SUBNATIONAL_BY_ID[targetId]?.name ??
    INSTRUMENT_BY_ID[targetId]?.name ??
    targetId
  );
}

function implementationRoute(id: string): string {
  return `/embed/implementation/${encodeURIComponent(id)}`;
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function selectDistinct<T>(
  values: T[],
  key: (value: T) => string,
  limit: number,
): T[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const candidate = key(value);
    if (seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  }).slice(0, limit);
}

function plural(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

function pluralVerb(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}
