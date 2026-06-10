import { LAB_BY_ID } from "../data/frontierLabs";
import { OBLIGATION_CATEGORY_LABELS } from "../data/governanceObligations";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { PARTICIPATION_BY_INSTRUMENT } from "../data/participation";
import type { VerificationMetadata } from "../types";
import { DATA_SNAPSHOT_DATE, isConfirmedBindingNationalRegulation } from "./governanceTaxonomy";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";
import {
  DATA_CONFIDENCE_LABELS,
  SOURCE_KIND_LABELS,
  VERIFICATION_STATUS_LABELS,
} from "./getVerificationLabel";
import {
  INSTRUMENT_BINDING_DESCRIPTIONS,
  INSTRUMENT_BINDING_LABELS,
  PARTICIPATION_LABELS,
} from "./getParticipationLabel";
import {
  getCountryImplementationMilestones,
  getCountryObligations,
  getInstrumentObligations,
  getLabObligations,
  obligationEffectLabel,
  summarizeImplementationStatuses,
  summarizeObligationCategories,
} from "./researchWorkbench";
import {
  getLabExposureTarget,
  getLabRegulatoryExposures,
  LAB_EXPOSURE_DIRECTNESS_LABELS,
  LAB_EXPOSURE_EFFECT_LABELS,
  LAB_EXPOSURE_KIND_LABELS,
  summarizeLabExposures,
} from "./labExposure";
import {
  ATLAS_SOURCE_LABELS,
  formatAtlasRank,
  formatAtlasScore,
  getCountryAtlasSummary,
  READINESS_STATUS_LABELS,
} from "./aiAtlas";
import { INDICATOR_SOURCE_BY_ID } from "../data/aiAtlas";
import {
  COMPUTE_DEPENDENCY_RECORDS_BY_LAB,
  INCIDENT_ENFORCEMENT_RECORDS_BY_LAB,
  LAB_INTELLIGENCE_BY_LAB,
  MODEL_GOVERNANCE_EVIDENCE_BY_LAB,
  SAFETY_EVALUATION_RECORDS_BY_LAB,
} from "../data/labIntelligence";
import {
  corpusKindLabel,
  getCorpusRecord,
  getCorpusRecordsForCountry,
  getCorpusRecordsForRelatedId,
  relatedRecordsFor,
  type CorpusUiKind,
  type ResearchCorpusRecord,
} from "./researchCorpus";

export type DossierKind =
  | "country"
  | "lab"
  | "instrument"
  | "institution"
  | "policy-process"
  | "standard"
  | "public-sector-ai"
  | "enforcement";

export interface EvidenceDossierMetric {
  label: string;
  value: string | number;
}

export interface EvidenceDossierClaim {
  label: string;
  detail: string;
}

export interface EvidenceDossierSection {
  title: string;
  claims: EvidenceDossierClaim[];
}

export interface EvidenceDossierSource extends VerificationMetadata {
  id: string;
  record: string;
  sourceName: string;
  sourceUrl: string;
}

export interface EvidenceDossier {
  kind: DossierKind;
  id: string;
  title: string;
  subtitle: string;
  snapshotDate: string;
  currentUrl: string;
  summary: string;
  metrics: EvidenceDossierMetric[];
  sections: EvidenceDossierSection[];
  caveats: string[];
  sources: EvidenceDossierSource[];
}

type SourceBackedRecord = VerificationMetadata & {
  id: string;
  name: string;
  sourceName: string;
  sourceUrl: string;
};

export function buildEvidenceDossier(
  kind: DossierKind,
  id: string,
  currentUrl = "https://global-ai-governance-map.vercel.app/"
): EvidenceDossier | null {
  if (kind === "country") return buildCountryDossier(id, currentUrl);
  if (kind === "lab") return buildLabDossier(id, currentUrl);
  if (kind === "instrument") return buildInstrumentDossier(id, currentUrl);
  return buildCorpusDossier(kind, id, currentUrl);
}

export function renderEvidenceDossierMarkdown(dossier: EvidenceDossier): string {
  const lines = [
    `# ${dossier.title}`,
    "",
    `**Record:** ${dossier.subtitle}`,
    `**Dataset snapshot:** ${dossier.snapshotDate}`,
    `**Share URL:** ${dossier.currentUrl}`,
    "",
    "> Research aid only; not legal advice. Verify time-sensitive legal status against the linked official sources.",
    "",
    "## Answer summary",
    "",
    dossier.summary,
    "",
  ];

  if (dossier.metrics.length) {
    lines.push("## Key metrics", "");
    for (const metric of dossier.metrics) {
      lines.push(`- **${metric.label}:** ${metric.value}`);
    }
    lines.push("");
  }

  lines.push("## Key claims", "");
  for (const section of dossier.sections) {
    if (!section.claims.length) continue;
    lines.push(`### ${section.title}`, "");
    for (const claim of section.claims) {
      lines.push(`- **${claim.label}:** ${claim.detail}`);
    }
    lines.push("");
  }

  if (dossier.caveats.length) {
    lines.push("## Caveats", "");
    for (const caveat of unique(dossier.caveats)) lines.push(`- ${caveat}`);
    lines.push("");
  }

  lines.push("## Sources", "");
  lines.push("| Record | Source kind | Verification | Confidence | Last verified | URL |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const source of dossier.sources) {
    lines.push(
      `| ${mdCell(source.record)} | ${mdCell(sourceKindLabel(source))} | ${mdCell(verificationLabel(source))} | ${mdCell(confidenceLabel(source))} | ${mdCell(source.lastVerified ?? "")} | ${mdCell(source.sourceUrl)} |`
    );
  }
  lines.push("");

  return lines.join("\n");
}

export function evidenceDossierFilename(dossier: EvidenceDossier): string {
  return `global-ai-governance-map-${dossier.kind}-${slug(dossier.id)}-evidence-dossier.md`;
}

function buildCountryDossier(iso3: string, currentUrl: string): EvidenceDossier | null {
  const summary = getCountryGovernanceSummary(iso3);
  const country = summary.country;
  if (!country) return null;

  const binding = summary.nationalRegulations.filter(isConfirmedBindingNationalRegulation);
  const proposed = summary.nationalRegulations.filter((reg) => reg.bindingStatus === "proposed");
  const guidance = summary.nationalRegulations.filter(
    (reg) => !isConfirmedBindingNationalRegulation(reg) && reg.bindingStatus !== "proposed"
  );
  const indirectRows = summary.participations.filter(
    ({ participation }) =>
      participation.participationType === "covered_by_membership" ||
      participation.participationType === "applicable_via_eu"
  );
  const obligations = getCountryObligations(iso3);
  const implementation = getCountryImplementationMilestones(iso3);
  const atlas = getCountryAtlasSummary(iso3);
  const corpusRecords = getCorpusRecordsForCountry(iso3);

  const caveats = [
    "This country profile is a research aggregation, not legal advice.",
    ...(!binding.length
      ? ["No confirmed binding AI-specific national law is recorded in this snapshot; absence from the dataset is not proof that no relevant law exists."]
      : []),
    ...(country.isEUMember
      ? ["EU AI Act applicability does not mean the member state enacted a separate national AI law."]
      : []),
    ...(indirectRows.length
      ? ["Indirect membership coverage and EU applicability rows should not be read as explicit country-by-country signature, ratification, or endorsement."]
      : []),
    ...(atlas.hasAnyAtlasData
      ? ["AI Atlas readiness, democratic-values, RAM, and ecosystem indicators are contextual research evidence; they do not establish binding AI duties or legal compliance."]
      : []),
  ];

  const sources = createSourceCollector();
  for (const reg of summary.nationalRegulations) sources.add("National rule", reg);
  for (const rule of summary.subnationalRules) sources.add("Subnational rule", rule);
  for (const { participation, instrument } of summary.participations) {
    sources.add("Participation", { ...participation, name: `${country.name} - ${instrument.name}` });
    sources.add("International instrument", instrument);
  }
  for (const lab of summary.hqLabs) sources.add("Frontier lab", lab);
  for (const obligation of obligations) {
    sources.add("Obligation", { ...obligation, name: `${OBLIGATION_CATEGORY_LABELS[obligation.category]} - ${country.name}` });
  }
  for (const milestone of implementation) {
    sources.add("Implementation milestone", { ...milestone, name: milestone.label });
  }
  for (const score of atlas.scores) {
    sources.add("AI Atlas indicator", {
      ...score,
      name: `${country.name} - ${INDICATOR_SOURCE_BY_ID[score.sourceId]?.name ?? score.sourceName}`,
    });
  }
  for (const report of atlas.readinessReports) {
    sources.add("AI Atlas readiness", {
      ...report,
      name: `${country.name} - ${INDICATOR_SOURCE_BY_ID[report.sourceId]?.name ?? report.sourceName}`,
    });
  }
  for (const record of corpusRecords) sources.add(corpusKindLabel(record.kind), corpusSourceRecord(record));

  return {
    kind: "country",
    id: country.iso3,
    title: `${country.name} evidence dossier`,
    subtitle: `Country profile (${country.iso3})`,
    snapshotDate: DATA_SNAPSHOT_DATE,
    currentUrl,
    summary: binding.length
      ? `${country.name} has ${binding.length} confirmed binding AI-specific national or EU-applicable rule(s) in this snapshot, plus ${proposed.length} proposed and ${guidance.length} guidance, strategy, or framework entrie(s).`
      : `${country.name} has no confirmed binding AI-specific national law in this snapshot, but has ${proposed.length} proposed and ${guidance.length} guidance, strategy, or framework entrie(s), plus ${summary.participations.length} international participation row(s).`,
    metrics: [
      { label: "Confirmed binding AI-specific rules", value: binding.length },
      { label: "Proposed AI laws", value: proposed.length },
      { label: "Guidance, strategy, or framework entries", value: guidance.length },
      { label: "International participation rows", value: summary.participations.length },
      { label: "Frontier labs headquartered here", value: summary.hqLabs.length },
      { label: "Structured obligation rows", value: obligations.length },
      { label: "Implementation milestones", value: implementation.length },
      { label: "Research-corpus rows", value: corpusRecords.length },
      ...(atlas.oxford ? [{ label: "Government AI readiness", value: `${formatAtlasScore(atlas.oxford)} ${formatAtlasRank(atlas.oxford)}` }] : []),
      ...(atlas.caidp ? [{ label: "CAIDP democratic-values score", value: `${formatAtlasScore(atlas.caidp)}${atlas.caidp.tier ? ` Tier ${atlas.caidp.tier}` : ""}` }] : []),
      ...(atlas.stanford ? [{ label: "Stanford AI vibrancy", value: `${formatAtlasScore(atlas.stanford)} ${formatAtlasRank(atlas.stanford)}` }] : []),
      ...(atlas.unescoRam ? [{ label: "UNESCO RAM status", value: READINESS_STATUS_LABELS[atlas.unescoRam.status] }] : []),
    ],
    sections: [
      {
        title: "National legal status",
        claims: [
          {
            label: "Binding AI-specific law",
            detail: binding.length ? binding.map((reg) => reg.name).join("; ") : "None confirmed in the current dataset.",
          },
          {
            label: "Proposed AI law",
            detail: proposed.length ? proposed.map((reg) => reg.name).join("; ") : "None tracked.",
          },
          {
            label: "Guidance, strategy, or framework",
            detail: guidance.length ? guidance.map((reg) => reg.name).join("; ") : "None tracked.",
          },
        ],
      },
      {
        title: "Obligations and implementation",
        claims: [
          { label: "Obligation categories", detail: summarizeObligationCategories(obligations) },
          { label: "Implementation status", detail: summarizeImplementationStatuses(implementation) },
        ],
      },
      {
        title: "International participation",
        claims: participationClaims(summary.participations),
      },
      {
        title: "Frontier-lab presence",
        claims: [
          {
            label: "Headquartered frontier labs",
            detail: summary.hqLabs.length ? summary.hqLabs.map((lab) => lab.name).join("; ") : "None tracked.",
          },
        ],
      },
      {
        title: "AI Atlas context indicators",
        claims: atlasClaims(atlas),
      },
      {
        title: "Research corpus evidence",
        claims: corpusRecords.length
          ? corpusRecords.map((record) => ({
              label: `${record.title} (${corpusKindLabel(record.kind)})`,
              detail: `${record.status}. ${record.summary} Caveat: ${record.caveat}`,
            }))
          : [{ label: "Research corpus", detail: "No institution, process, standards, public-sector AI, or enforcement row is mapped here yet." }],
      },
    ],
    caveats,
    sources: sources.list(),
  };
}

function buildLabDossier(labId: string, currentUrl: string): EvidenceDossier | null {
  const lab = LAB_BY_ID[labId];
  if (!lab) return null;
  const exposures = getLabRegulatoryExposures(lab.id);
  const exposureSummary = summarizeLabExposures(exposures);
  const obligations = getLabObligations(lab.id);
  const labProfile = LAB_INTELLIGENCE_BY_LAB[lab.id];
  const modelGovernanceEvidence = MODEL_GOVERNANCE_EVIDENCE_BY_LAB[lab.id] ?? [];
  const safetyEvaluationRecords = SAFETY_EVALUATION_RECORDS_BY_LAB[lab.id] ?? [];
  const incidentEnforcementRecords = INCIDENT_ENFORCEMENT_RECORDS_BY_LAB[lab.id] ?? [];
  const computeDependencyRecords = COMPUTE_DEPENDENCY_RECORDS_BY_LAB[lab.id] ?? [];
  const relatedCorpusRecords = getCorpusRecordsForRelatedId(lab.id);
  const sources = createSourceCollector();
  sources.add("Frontier lab", lab);
  if (labProfile) sources.add("Lab intelligence profile", { ...labProfile, name: `${lab.name} intelligence profile` });
  if (lab.safetyFramework) {
    sources.add("Lab safety framework", {
      id: `${lab.id}.safetyFramework`,
      name: lab.safetyFramework.name,
      sourceName: lab.safetyFramework.sourceName,
      sourceUrl: lab.safetyFramework.sourceUrl,
      sourceKind: lab.safetyFramework.sourceKind,
      verificationStatus: lab.safetyFramework.verificationStatus,
      confidence: lab.safetyFramework.confidence,
      lastVerified: lab.safetyFramework.lastVerified,
      verificationNotes: lab.safetyFramework.verificationNotes,
    });
  }
  for (const exposure of exposures) sources.add("Lab exposure", exposureSourceRecord(lab.name, exposure));
  for (const obligation of obligations) {
    sources.add("Obligation", { ...obligation, name: `${OBLIGATION_CATEGORY_LABELS[obligation.category]} - ${lab.name}` });
  }
  for (const row of modelGovernanceEvidence) sources.add("Model governance evidence", { ...row, name: row.title });
  for (const row of safetyEvaluationRecords) sources.add("Safety evaluation", { ...row, name: row.evaluationBody });
  for (const row of incidentEnforcementRecords) sources.add("Incident/enforcement", { ...row, name: row.title });
  for (const row of computeDependencyRecords) sources.add("Compute dependency", { ...row, name: row.dependencyType });
  for (const record of relatedCorpusRecords) sources.add(corpusKindLabel(record.kind), corpusSourceRecord(record));

  const caveats = [
    "Lab exposure is an analytical mapping of governance hooks, not a finding of enforcement or liability.",
    ...(exposures.some((row) => row.directness === "conditional")
      ? ["Conditional exposure depends on market activity, model deployment context, or evaluation partnerships."]
      : []),
    ...(exposures.some((row) => row.legalEffect === "voluntary")
      ? ["Voluntary commitments and industry initiatives should not be read as binding public-law duties."]
      : []),
    ...(exposures.some((row) => row.legalEffect === "standard")
      ? ["Standards exposure means compliance-environment influence, not national law unless separately incorporated or required."]
      : []),
    ...(exposures.some((row) => row.legalEffect === "infrastructure_constraint")
      ? ["Infrastructure and export-control dependency rows describe ecosystem constraints, not AI-specific legal obligations."]
      : []),
    ...(modelGovernanceEvidence.length
      ? ["Model-governance evidence rows describe public company or issuer-controlled evidence, not regulatory certification."]
      : []),
    ...(safetyEvaluationRecords.length
      ? ["Safety/evaluation rows are public evidence records and should not be read as a complete list of non-public evaluations."]
      : []),
    ...(computeDependencyRecords.length
      ? ["Compute-dependency rows are infrastructure context and should not be read as procurement or capacity findings."]
      : []),
  ];

  return {
    kind: "lab",
    id: lab.id,
    title: `${lab.name} evidence dossier`,
    subtitle: `Frontier lab - HQ: ${lab.hqCountryName}`,
    snapshotDate: DATA_SNAPSHOT_DATE,
    currentUrl,
    summary: `${lab.name} is tracked as a frontier-AI lab headquartered in ${lab.hqCountryName}, with ${exposureSummary.binding} binding exposure row(s), ${exposureSummary.voluntary} voluntary row(s), ${exposureSummary.standards} standards row(s), and ${exposureSummary.infrastructure} infrastructure row(s).`,
    metrics: [
      { label: "Power score", value: `${lab.powerScore}/5` },
      { label: "Binding exposure rows", value: exposureSummary.binding },
      { label: "Conditional exposure rows", value: exposureSummary.conditional },
      { label: "Voluntary exposure rows", value: exposureSummary.voluntary },
      { label: "Standards exposure rows", value: exposureSummary.standards },
      { label: "Infrastructure exposure rows", value: exposureSummary.infrastructure },
      { label: "Structured obligation rows", value: obligations.length },
      { label: "Model-governance evidence rows", value: modelGovernanceEvidence.length },
      { label: "Safety/evaluation rows", value: safetyEvaluationRecords.length },
      { label: "Compute-dependency context rows", value: computeDependencyRecords.length },
      { label: "Research-corpus context rows", value: relatedCorpusRecords.length },
    ],
    sections: [
      {
        title: "Actor profile",
        claims: [
          { label: "Summary", detail: lab.summary },
          { label: "Flagship models", detail: lab.flagshipModels.join("; ") },
          { label: "Safety framework", detail: lab.safetyFramework?.name ?? "None tracked." },
          { label: "Frontier Model Forum", detail: lab.isFMFMember ? "Member." : "Not tracked as a member." },
          {
            label: "Scenario markets",
            detail: labProfile?.deploymentMarketIso3s.join("; ") ?? "No lab-intelligence scenario markets tracked.",
          },
        ],
      },
      {
        title: "Structured obligations",
        claims: obligations.length
          ? obligations.map((obligation) => ({
              label: `${OBLIGATION_CATEGORY_LABELS[obligation.category]} (${obligationEffectLabel(obligation.legalEffect)})`,
              detail: `${obligation.summary}${obligation.caveat ? ` Caveat: ${obligation.caveat}` : ""}`,
            }))
          : [{ label: "Obligations", detail: "No structured lab-exposure obligation rows tracked." }],
      },
      {
        title: "Regulatory exposure",
        claims: exposures.map((exposure) => {
          const target = getLabExposureTarget(exposure);
          return {
            label: `${target.name} (${LAB_EXPOSURE_EFFECT_LABELS[exposure.legalEffect]})`,
            detail: `${LAB_EXPOSURE_KIND_LABELS[exposure.exposureKind]}; ${LAB_EXPOSURE_DIRECTNESS_LABELS[exposure.directness]}; strength ${exposure.strength}/5. ${exposure.rationale}${exposure.notes ? ` Caveat: ${exposure.notes}` : ""}`,
          };
        }),
      },
      {
        title: "Model-governance evidence",
        claims: modelGovernanceEvidence.length
          ? modelGovernanceEvidence.map((row) => ({
              label: row.title,
              detail: `${row.summary} Caveat: ${row.caveat}`,
            }))
          : [{ label: "Model-governance evidence", detail: "No public evidence rows tracked." }],
      },
      {
        title: "Safety and evaluation evidence",
        claims: safetyEvaluationRecords.length
          ? safetyEvaluationRecords.map((row) => ({
              label: row.evaluationBody,
              detail: `${row.summary} Caveat: ${row.caveat}`,
            }))
          : [{ label: "Safety and evaluation evidence", detail: "No lab-specific public evaluation rows tracked." }],
      },
      {
        title: "Compute and infrastructure context",
        claims: computeDependencyRecords.length
          ? computeDependencyRecords.map((row) => ({
              label: row.dependencyType.replace(/_/g, " "),
              detail: `${row.summary} Caveat: ${row.caveat}`,
            }))
          : [{ label: "Compute context", detail: "No compute-dependency context rows tracked." }],
      },
      {
        title: "Research corpus evidence",
        claims: relatedCorpusRecords.length
          ? relatedCorpusRecords.map((record) => ({
              label: `${record.title} (${corpusKindLabel(record.kind)})`,
              detail: `${record.status}. ${record.summary} Caveat: ${record.caveat}`,
            }))
          : [{ label: "Research corpus", detail: "No directly related corpus rows are linked to this lab yet." }],
      },
    ],
    caveats,
    sources: sources.list(),
  };
}

function buildInstrumentDossier(instrumentId: string, currentUrl: string): EvidenceDossier | null {
  const instrument = INSTRUMENT_BY_ID[instrumentId];
  if (!instrument) return null;
  const participations = PARTICIPATION_BY_INSTRUMENT[instrument.id] ?? [];
  const obligations = getInstrumentObligations(instrument.id);
  const relatedCorpusRecords = getCorpusRecordsForRelatedId(instrument.id);
  const sources = createSourceCollector();
  sources.add("International instrument", instrument);
  for (const obligation of obligations) {
    sources.add("Obligation", { ...obligation, name: `${OBLIGATION_CATEGORY_LABELS[obligation.category]} - ${instrument.name}` });
  }
  for (const participation of participations) {
    sources.add("Participation", {
      ...participation,
      name: `${participation.countryIso3} - ${instrument.name}`,
    });
  }
  for (const record of relatedCorpusRecords) sources.add(corpusKindLabel(record.kind), corpusSourceRecord(record));

  const participationCounts = countBy(participations.map((row) => row.participationType));
  const caveats = [
    "Instrument classification is a research aid; check the official source for legal status, entry-into-force, and scope.",
    INSTRUMENT_BINDING_DESCRIPTIONS[instrument.bindingStatus],
    ...(participationCounts.signed
      ? ["Signature is not the same as ratification or entry into force."]
      : []),
    ...(participationCounts.covered_by_membership
      ? ["Covered-by-membership rows do not prove direct signature, ratification, or explicit endorsement."]
      : []),
    ...(instrument.bindingStatus === "standard"
      ? ["Technical standards are not national law unless separately adopted, referenced, or required."]
      : []),
    ...(instrument.bindingStatus === "voluntary" || instrument.bindingStatus === "non_binding"
      ? ["Soft-law and voluntary instruments should not be read as binding legal obligations."]
      : []),
  ];

  return {
    kind: "instrument",
    id: instrument.id,
    title: `${instrument.name} evidence dossier`,
    subtitle: `${instrument.organizationType} ${instrument.instrumentType.replace(/_/g, " ")}`,
    snapshotDate: DATA_SNAPSHOT_DATE,
    currentUrl,
    summary: `${instrument.name} is classified as ${INSTRUMENT_BINDING_LABELS[instrument.bindingStatus].toLowerCase()} with ${participations.length} participation row(s) in this snapshot.`,
    metrics: [
      { label: "Issuer", value: instrument.issuer },
      { label: "Legal effect", value: INSTRUMENT_BINDING_LABELS[instrument.bindingStatus] },
      { label: "Date", value: instrument.date },
      { label: "Participation rows", value: participations.length },
      { label: "Frontier-AI relevant", value: instrument.frontierAIRelevant ? "Yes" : "No" },
      { label: "Structured obligation rows", value: obligations.length },
      { label: "Research-corpus rows", value: relatedCorpusRecords.length },
    ],
    sections: [
      {
        title: "Instrument status",
        claims: [
          { label: "Summary", detail: instrument.summary },
          { label: "Legal effect", detail: INSTRUMENT_BINDING_DESCRIPTIONS[instrument.bindingStatus] },
          { label: "AI-specific scope", detail: instrument.aiSpecific ? "Included as AI-specific." : "Not AI-specific." },
        ],
      },
      {
        title: "Structured obligations",
        claims: obligations.length
          ? obligations.map((obligation) => ({
              label: `${OBLIGATION_CATEGORY_LABELS[obligation.category]} (${obligationEffectLabel(obligation.legalEffect)})`,
              detail: `${obligation.summary}${obligation.caveat ? ` Caveat: ${obligation.caveat}` : ""}`,
            }))
          : [{ label: "Obligations", detail: "No structured obligation rows tracked for this instrument." }],
      },
      {
        title: "Participation pattern",
        claims: Object.entries(participationCounts).map(([type, count]) => ({
          label: PARTICIPATION_LABELS[type as keyof typeof PARTICIPATION_LABELS],
          detail: `${count} row(s): ${participations
            .filter((row) => row.participationType === type)
            .map((row) => row.countryIso3)
            .join(", ")}`,
        })),
      },
      {
        title: "Research corpus evidence",
        claims: relatedCorpusRecords.length
          ? relatedCorpusRecords.map((record) => ({
              label: `${record.title} (${corpusKindLabel(record.kind)})`,
              detail: `${record.status}. ${record.summary} Caveat: ${record.caveat}`,
            }))
          : [{ label: "Research corpus", detail: "No directly related corpus rows are linked to this instrument yet." }],
      },
    ],
    caveats,
    sources: sources.list(),
  };
}

function buildCorpusDossier(kind: CorpusUiKind, id: string, currentUrl: string): EvidenceDossier | null {
  const record = getCorpusRecord(kind, id);
  if (!record) return null;
  const related = relatedRecordsFor(record);
  const sources = createSourceCollector();
  sources.add(corpusKindLabel(record.kind), corpusSourceRecord(record));
  const caveats = [
    "Research-corpus records are context/evidence records unless a separate verified legal record establishes binding effect.",
    record.caveat,
  ];
  return {
    kind,
    id: record.id,
    title: `${record.title} evidence dossier`,
    subtitle: `${corpusKindLabel(record.kind)} - ${record.jurisdiction}`,
    snapshotDate: DATA_SNAPSHOT_DATE,
    currentUrl,
    summary: `${record.title} is tracked as ${record.status} for ${record.jurisdiction}.`,
    metrics: [
      { label: "Corpus type", value: corpusKindLabel(record.kind) },
      { label: "Jurisdiction", value: record.jurisdiction },
      { label: "Status", value: record.status },
      { label: "Confidence", value: record.metadata.confidence ? DATA_CONFIDENCE_LABELS[record.metadata.confidence] : "" },
    ],
    sections: [
      {
        title: "Research corpus evidence",
        claims: [
          { label: "Summary", detail: record.summary },
          { label: "Caveat", detail: record.caveat },
          {
            label: "Related records",
            detail: related.length
              ? related.map((reference) => `${reference.label ?? reference.id} (${reference.kind})`).join("; ")
              : "No related record references tracked.",
          },
        ],
      },
    ],
    caveats,
    sources: sources.list(),
  };
}

function participationClaims(participations: ReturnType<typeof getCountryGovernanceSummary>["participations"]) {
  if (!participations.length) {
    return [{ label: "Participation rows", detail: "None tracked." }];
  }
  const counts = countBy(participations.map(({ participation }) => participation.participationType));
  return Object.entries(counts).map(([type, count]) => ({
    label: PARTICIPATION_LABELS[type as keyof typeof PARTICIPATION_LABELS],
    detail: `${count} row(s): ${participations
      .filter(({ participation }) => participation.participationType === type)
      .map(({ instrument }) => instrument.name)
      .join("; ")}`,
  }));
}

function atlasClaims(atlas: ReturnType<typeof getCountryAtlasSummary>) {
  if (!atlas.hasAnyAtlasData) {
    return [{ label: "AI Atlas context", detail: "No contextual AI-readiness or index rows tracked for this country." }];
  }
  const claims: EvidenceDossierClaim[] = [];
  for (const score of atlas.scores) {
    const label = ATLAS_SOURCE_LABELS[score.sourceId] ?? INDICATOR_SOURCE_BY_ID[score.sourceId]?.name ?? score.sourceName;
    claims.push({
      label,
      detail: [
        score.score !== undefined ? `Score ${formatAtlasScore(score)}` : "",
        formatAtlasRank(score),
        score.tier ? `Tier ${score.tier}` : "",
        INDICATOR_SOURCE_BY_ID[score.sourceId]?.caveat ?? score.notes ?? "",
      ]
        .filter(Boolean)
        .join("; "),
    });
  }
  for (const report of atlas.readinessReports) {
    claims.push({
      label: "UNESCO RAM",
      detail: `${READINESS_STATUS_LABELS[report.status]}. ${report.caveat}${report.profileUrl ? ` Profile: ${report.profileUrl}` : ""}`,
    });
  }
  return claims;
}

function exposureSourceRecord(
  labName: string,
  exposure: ReturnType<typeof getLabRegulatoryExposures>[number]
): SourceBackedRecord {
  const target = getLabExposureTarget(exposure);
  return {
    id: exposure.id,
    name: `${labName} - ${target.name}`,
    sourceName: exposure.sourceName,
    sourceUrl: exposure.sourceUrl,
    sourceKind: exposure.sourceKind,
    verificationStatus: exposure.verificationStatus,
    confidence: exposure.confidence,
    lastVerified: exposure.lastVerified,
    verificationNotes: exposure.verificationNotes,
  };
}

function corpusSourceRecord(record: ResearchCorpusRecord): SourceBackedRecord {
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

function createSourceCollector() {
  const sources = new Map<string, EvidenceDossierSource>();
  return {
    add(kind: string, record: SourceBackedRecord) {
      const key = `${kind}:${record.id}:${record.sourceUrl}`;
      if (sources.has(key)) return;
      sources.set(key, {
        id: record.id,
        record: `${kind}: ${record.name}`,
        sourceName: record.sourceName,
        sourceUrl: record.sourceUrl,
        sourceKind: record.sourceKind,
        verificationStatus: record.verificationStatus,
        confidence: record.confidence,
        lastVerified: record.lastVerified,
        verificationNotes: record.verificationNotes,
      });
    },
    list() {
      return [...sources.values()].sort((a, b) => a.record.localeCompare(b.record));
    },
  };
}

function sourceKindLabel(source: VerificationMetadata) {
  return source.sourceKind ? SOURCE_KIND_LABELS[source.sourceKind] : "";
}

function verificationLabel(source: VerificationMetadata) {
  return source.verificationStatus ? VERIFICATION_STATUS_LABELS[source.verificationStatus] : "";
}

function confidenceLabel(source: VerificationMetadata) {
  return source.confidence ? DATA_CONFIDENCE_LABELS[source.confidence] : "";
}

function countBy<T extends string>(items: T[]): Partial<Record<T, number>> {
  return items.reduce(
    (acc, item) => {
      acc[item] = (acc[item] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<T, number>>
  );
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function mdCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
