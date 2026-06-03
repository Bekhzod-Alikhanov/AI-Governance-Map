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

export type DossierKind = "country" | "lab" | "instrument";

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
  return buildInstrumentDossier(id, currentUrl);
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
  const sources = createSourceCollector();
  sources.add("Frontier lab", lab);
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
    ],
    sections: [
      {
        title: "Actor profile",
        claims: [
          { label: "Summary", detail: lab.summary },
          { label: "Flagship models", detail: lab.flagshipModels.join("; ") },
          { label: "Safety framework", detail: lab.safetyFramework?.name ?? "None tracked." },
          { label: "Frontier Model Forum", detail: lab.isFMFMember ? "Member." : "Not tracked as a member." },
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
