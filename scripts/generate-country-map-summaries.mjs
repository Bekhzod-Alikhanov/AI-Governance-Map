import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const root = process.cwd();
const outFile = path.join(root, "src", "data", "countryMapSummaries.ts");

function sourceConfidence(records) {
  if (records.some((record) => record?.confidence === "low")) return "low";
  if (records.some((record) => record?.confidence === "medium")) return "medium";
  if (records.length > 0) return "high";
  return "none";
}

function stableObject(value) {
  return JSON.stringify(value, null, 2);
}

function omitDefaults(summary) {
  const result = {};
  for (const [key, value] of Object.entries(summary)) {
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "number" && value === 0) continue;
    if (typeof value === "boolean" && value === false) continue;
    if (key === "sourceConfidence" && value === "none") continue;
    result[key] = value;
  }
  return result;
}

const server = await createServer({
  root,
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

try {
  const countriesModule = await server.ssrLoadModule("/src/data/countries.ts");
  const euMembersModule = await server.ssrLoadModule("/src/data/euMembers.ts");
  const nationalModule = await server.ssrLoadModule("/src/data/nationalAIRegulations.ts");
  const participationModule = await server.ssrLoadModule("/src/data/participation.ts");
  const instrumentsModule = await server.ssrLoadModule("/src/data/internationalInstruments.ts");
  const labsModule = await server.ssrLoadModule("/src/data/frontierLabs.ts");
  const labExposureModule = await server.ssrLoadModule("/src/data/labRegulatoryExposures.ts");
  const subnationalModule = await server.ssrLoadModule("/src/data/subnationalRules.ts");
  const subnationalSummaryModule = await server.ssrLoadModule("/src/data/subnationalRuleSummary.ts");
  const obligationsModule = await server.ssrLoadModule("/src/data/governanceObligations.ts");
  const implementationModule = await server.ssrLoadModule("/src/data/implementationMilestones.ts");
  const taxonomyModule = await server.ssrLoadModule("/src/utils/governanceTaxonomy.ts");

  const summaries = {};
  for (const country of countriesModule.COUNTRIES) {
    if (country.iso3 === "EUU") continue;

    const nationalRegulations = nationalModule.NATIONAL_AI_REGULATIONS.filter((reg) => {
      if (reg.countryIso3 === country.iso3) return true;
      return (
        reg.regionalEntity === "EU" &&
        reg.id === "eu-ai-act-regional" &&
        euMembersModule.EU_MEMBER_ISO3.includes(country.iso3)
      );
    });
    const subnationalRules = subnationalModule.SUBNATIONAL_AI_RULES.filter((rule) => rule.countryIso3 === country.iso3);
    const participations = participationModule.PARTICIPATION_BY_COUNTRY[country.iso3] ?? [];
    const participationInstruments = participations
      .map((row) => instrumentsModule.INSTRUMENT_BY_ID[row.instrumentId])
      .filter(Boolean);
    const hqLabs = labsModule.getLabsByHqIso3(country.iso3).sort((a, b) => b.powerScore - a.powerScore);
    const bindingRules = nationalRegulations.filter(taxonomyModule.isConfirmedBindingNationalRegulation);
    const proposedRules = nationalRegulations.filter((reg) => reg.bindingStatus === "proposed" || reg.bindingStatus === "mixed");
    const parentKeys = [
      ...nationalRegulations.map((reg) => `national_rule:${reg.id}`),
      ...(subnationalSummaryModule.SUBNATIONAL_RULE_IDS_BY_COUNTRY[country.iso3] ?? []).map((ruleId) => `subnational_rule:${ruleId}`),
      ...participationInstruments.map((instrument) => `international_instrument:${instrument.id}`),
      ...hqLabs.flatMap((lab) =>
        labExposureModule.LAB_REGULATORY_EXPOSURES.filter((row) => row.labId === lab.id).map((row) => `lab_exposure:${row.id}`)
      ),
    ];
    const obligations = uniqueById(parentKeys.flatMap((key) => obligationsModule.OBLIGATIONS_BY_PARENT[key] ?? []));
    const implementationMilestones = uniqueById(parentKeys.flatMap((key) => implementationModule.IMPLEMENTATION_BY_PARENT[key] ?? []));
    const recordsForConfidence = [
      ...nationalRegulations,
      ...subnationalRules,
      ...participations,
      ...participationInstruments,
    ];

    summaries[country.iso3] = {
      nationalRuleCount: nationalRegulations.length,
      nationalRuleNames: nationalRegulations.map((reg) => reg.name),
      confirmedBindingNationalRuleCount: bindingRules.length,
      bindingRuleNames: bindingRules.map((reg) => reg.name),
      proposedNationalRuleCount: proposedRules.length,
      proposedRuleNames: proposedRules.map((reg) => reg.name),
      internationalParticipationCount: participations.length,
      hqLabCount: hqLabs.length,
      hqLabNames: hqLabs.map((lab) => lab.name),
      hasAnyAIRule: nationalRegulations.length > 0 || subnationalRules.length > 0,
      hasFrontierAIRelevant:
        nationalRegulations.some((reg) => reg.frontierAIRelevant) ||
        participationInstruments.some((instrument) => instrument.frontierAIRelevant) ||
        hqLabs.length > 0,
      obligationSignals: obligations.map((obligation) => ({
        category: obligation.category,
        legalEffect: obligation.legalEffect,
        domains: obligation.domains,
      })),
      implementationStatuses: unique(implementationMilestones.map((milestone) => milestone.status)),
      hasNextImplementationDeadline: implementationMilestones.some((milestone) => Boolean(milestone.nextDeadline)),
      hasInForceImplementation: implementationMilestones.some((milestone) => milestone.status === "in_force"),
      sourceConfidence: sourceConfidence(recordsForConfidence),
    };
  }

  const sparseSummaries = Object.fromEntries(
    Object.entries(summaries).map(([iso3, summary]) => [iso3, omitDefaults(summary)])
  );

  const content = `import type { GovernanceDomainId, ImplementationStatus, ObligationCategory, ObligationLegalEffect } from "../types";

export type CountryMapSourceConfidence = "none" | "high" | "medium" | "low";

export interface CountryMapSummary {
  nationalRuleCount: number;
  nationalRuleNames: string[];
  confirmedBindingNationalRuleCount: number;
  bindingRuleNames: string[];
  proposedNationalRuleCount: number;
  proposedRuleNames: string[];
  internationalParticipationCount: number;
  hqLabCount: number;
  hqLabNames: string[];
  hasAnyAIRule: boolean;
  hasFrontierAIRelevant: boolean;
  obligationSignals: Array<{
    category: ObligationCategory;
    legalEffect: ObligationLegalEffect;
    domains: GovernanceDomainId[];
  }>;
  implementationStatuses: ImplementationStatus[];
  hasNextImplementationDeadline: boolean;
  hasInForceImplementation: boolean;
  sourceConfidence: CountryMapSourceConfidence;
}

export const EMPTY_COUNTRY_MAP_SUMMARY: CountryMapSummary = {
  nationalRuleCount: 0,
  nationalRuleNames: [],
  confirmedBindingNationalRuleCount: 0,
  bindingRuleNames: [],
  proposedNationalRuleCount: 0,
  proposedRuleNames: [],
  internationalParticipationCount: 0,
  hqLabCount: 0,
  hqLabNames: [],
  hasAnyAIRule: false,
  hasFrontierAIRelevant: false,
  obligationSignals: [],
  implementationStatuses: [],
  hasNextImplementationDeadline: false,
  hasInForceImplementation: false,
  sourceConfidence: "none",
};

export const COUNTRY_MAP_SUMMARIES: Record<string, Partial<CountryMapSummary>> = ${stableObject(sparseSummaries)};
`;

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, content, "utf8");
} finally {
  await server.close();
}

function uniqueById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function unique(items) {
  return [...new Set(items)];
}
