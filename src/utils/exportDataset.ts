import { COUNTRIES } from "../data/countries";
import { AI_ATLAS_SOURCES, COUNTRY_INDICATOR_SCORES, COUNTRY_READINESS_REPORTS } from "../data/aiAtlas";
import { DATASET_RELEASES } from "../data/datasetReleases";
import { DEPENDENCY_EDGES } from "../data/dependencies";
import { EU_MEMBER_ISO3 } from "../data/euMembers";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { GOVERNANCE_DOMAINS } from "../data/governanceDomains";
import { GOVERNANCE_OBLIGATIONS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "../data/implementationMilestones";
import { INFRASTRUCTURE_NODES } from "../data/infrastructure";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { OUT_OF_SCOPE_ITEMS } from "../data/outOfScope";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { SOURCE_NOTES } from "../data/sourceNotes";
import { SUBNATIONAL_AI_RULES } from "../data/subnationalRules";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { DATASET_SCHEMA_ID, DATASET_SCHEMA_VERSION } from "./datasetSchema";
import { DEFAULT_FILTER_STATE, type FilterState, type LabRegulatoryExposure } from "../types";
import { countActiveFilters, filterCountries } from "./filterCountries";
import { downloadTextFile } from "./downloadTextFile";
import { implementationMatchesFilters, obligationMatchesFilters } from "./researchWorkbench";

export { DATASET_SCHEMA_VERSION } from "./datasetSchema";
export { downloadTextFile } from "./downloadTextFile";

export function buildDatasetSnapshot() {
  return {
    schemaVersion: DATASET_SCHEMA_VERSION,
    snapshotDate: DATA_SNAPSHOT_DATE,
    schema: {
      id: DATASET_SCHEMA_ID,
      version: DATASET_SCHEMA_VERSION,
      format: "json-schema-draft-2020-12",
    },
    title: "Global AI Governance Map dataset",
    caveat:
      "Research dataset only. It is not legal advice and time-sensitive legal status should be verified against official sources.",
    counts: {
      countries: COUNTRIES.filter((country) => country.iso3 !== "EUU").length,
      euMembers: EU_MEMBER_ISO3.length,
      frontierLabs: FRONTIER_LABS.length,
      labRegulatoryExposures: LAB_REGULATORY_EXPOSURES.length,
      internationalInstruments: INTERNATIONAL_INSTRUMENTS.length,
      internationalParticipationRows: INTERNATIONAL_PARTICIPATION.length,
      nationalAIRegulations: NATIONAL_AI_REGULATIONS.length,
      subnationalAIRules: SUBNATIONAL_AI_RULES.length,
      governanceDomains: GOVERNANCE_DOMAINS.length,
      governanceObligations: GOVERNANCE_OBLIGATIONS.length,
      implementationMilestones: IMPLEMENTATION_MILESTONES.length,
      indicatorSources: AI_ATLAS_SOURCES.length,
      countryIndicatorScores: COUNTRY_INDICATOR_SCORES.length,
      countryReadinessReports: COUNTRY_READINESS_REPORTS.length,
      infrastructureNodes: INFRASTRUCTURE_NODES.length,
      dependencyEdges: DEPENDENCY_EDGES.length,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS.length,
      sourceNotes: SOURCE_NOTES.length,
      datasetReleases: DATASET_RELEASES.length,
    },
    data: {
      countries: COUNTRIES,
      euMembers: EU_MEMBER_ISO3,
      frontierLabs: FRONTIER_LABS,
      labRegulatoryExposures: LAB_REGULATORY_EXPOSURES,
      internationalInstruments: INTERNATIONAL_INSTRUMENTS,
      internationalParticipation: INTERNATIONAL_PARTICIPATION,
      nationalAIRegulations: NATIONAL_AI_REGULATIONS,
      subnationalAIRules: SUBNATIONAL_AI_RULES,
      governanceDomains: GOVERNANCE_DOMAINS,
      governanceObligations: GOVERNANCE_OBLIGATIONS,
      implementationMilestones: IMPLEMENTATION_MILESTONES,
      indicatorSources: AI_ATLAS_SOURCES,
      countryIndicatorScores: COUNTRY_INDICATOR_SCORES,
      countryReadinessReports: COUNTRY_READINESS_REPORTS,
      infrastructureNodes: INFRASTRUCTURE_NODES,
      dependencyEdges: DEPENDENCY_EDGES,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS,
      sourceNotes: SOURCE_NOTES,
      datasetReleases: DATASET_RELEASES,
    },
  };
}

export function buildCitationText(): string {
  return [
    `Global AI Governance Map dataset, snapshot ${DATA_SNAPSHOT_DATE}.`,
    "Coverage: frontier-AI governance actors, instruments, national AI-specific rules, participation rows, labs, structured obligations, implementation milestones, AI Atlas context indicators, infrastructure, dependency links, and source metadata.",
    "Use with source verification. This dataset is a research aid and is not legal advice.",
    "Repository: https://github.com/Bekhzod-Alikhanov/global-ai-governance-map",
    "Live app: https://global-ai-governance-map.vercel.app/",
  ].join("\n");
}

export function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function downloadDatasetJson(): void {
  downloadTextFile(
    `global-ai-governance-map-${DATA_SNAPSHOT_DATE}.json`,
    toPrettyJson(buildDatasetSnapshot()),
    "application/json;charset=utf-8"
  );
}

export function buildFilteredDatasetSnapshot(filters: FilterState) {
  const baseSnapshot = buildDatasetSnapshot();
  if (countActiveFilters(filters) === 0) {
    return {
      ...baseSnapshot,
      title: "Global AI Governance Map filtered dataset",
      filters,
    };
  }

  const countryIso3s = new Set(getFilteredCountryIso3s(filters));
  const instrumentIds = new Set(filters.selectedInstrumentIds);
  const labIds = new Set(getFilteredLabIds(filters));
  const filteredCountries = COUNTRIES.filter((country) => countryIso3s.has(country.iso3));
  const filteredParticipation = INTERNATIONAL_PARTICIPATION.filter((row) => {
    if (!countryIso3s.has(row.countryIso3)) return false;
    if (instrumentIds.size && !instrumentIds.has(row.instrumentId)) return false;
    if (
      filters.selectedParticipationTypes.length &&
      !filters.selectedParticipationTypes.includes(row.participationType)
    ) {
      return false;
    }
    return true;
  });
  const participationInstrumentIds = new Set(filteredParticipation.map((row) => row.instrumentId));
  const filteredInstruments = INTERNATIONAL_INSTRUMENTS.filter((instrument) => {
    if (instrumentIds.size) return instrumentIds.has(instrument.id);
    return participationInstrumentIds.has(instrument.id);
  });
  const filteredNational = NATIONAL_AI_REGULATIONS.filter((reg) => {
    if (reg.countryIso3) return countryIso3s.has(reg.countryIso3);
    return reg.regionalEntity === "EU" && filteredCountries.some((country) => country.isEUMember);
  });
  const filteredSubnational = SUBNATIONAL_AI_RULES.filter((rule) => countryIso3s.has(rule.countryIso3));
  const filteredLabs = FRONTIER_LABS.filter((lab) => {
    if (labIds.size) return labIds.has(lab.id);
    return countryIso3s.has(lab.hqIso3);
  });
  const filteredLabIds = new Set(filteredLabs.map((lab) => lab.id));
  const filteredLabRegulatoryExposures = LAB_REGULATORY_EXPOSURES.filter((exposure) =>
    exposureMatchesExportScope(exposure, filters, filteredLabIds)
  );
  const filteredObligations = GOVERNANCE_OBLIGATIONS.filter((obligation) =>
    obligationMatchesExportScope(obligation, filters, countryIso3s, filteredLabIds)
  );
  const filteredImplementationMilestones = IMPLEMENTATION_MILESTONES.filter((milestone) =>
    implementationMatchesExportScope(milestone, filters, countryIso3s)
  );
  const filteredCountryIndicatorScores = COUNTRY_INDICATOR_SCORES.filter((score) => countryIso3s.has(score.countryIso3));
  const filteredCountryReadinessReports = COUNTRY_READINESS_REPORTS.filter((report) => countryIso3s.has(report.countryIso3));
  const filteredIndicatorSourceIds = new Set([
    ...filteredCountryIndicatorScores.map((score) => score.sourceId),
    ...filteredCountryReadinessReports.map((report) => report.sourceId),
  ]);
  const filteredIndicatorSources = AI_ATLAS_SOURCES.filter((source) => filteredIndicatorSourceIds.has(source.id));

  return {
    ...buildDatasetSnapshot(),
    title: "Global AI Governance Map filtered dataset",
    filters,
    counts: {
      countries: filteredCountries.length,
      euMembers: filteredCountries.filter((country) => country.isEUMember).length,
      frontierLabs: filteredLabs.length,
      labRegulatoryExposures: filteredLabRegulatoryExposures.length,
      internationalInstruments: filteredInstruments.length,
      internationalParticipationRows: filteredParticipation.length,
      nationalAIRegulations: filteredNational.length,
      subnationalAIRules: filteredSubnational.length,
      governanceDomains: GOVERNANCE_DOMAINS.length,
      governanceObligations: filteredObligations.length,
      implementationMilestones: filteredImplementationMilestones.length,
      indicatorSources: filteredIndicatorSources.length,
      countryIndicatorScores: filteredCountryIndicatorScores.length,
      countryReadinessReports: filteredCountryReadinessReports.length,
      infrastructureNodes: INFRASTRUCTURE_NODES.length,
      dependencyEdges: DEPENDENCY_EDGES.length,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS.length,
      sourceNotes: SOURCE_NOTES.length,
      datasetReleases: DATASET_RELEASES.length,
    },
    data: {
      countries: filteredCountries,
      euMembers: EU_MEMBER_ISO3.filter((iso3) => countryIso3s.has(iso3)),
      frontierLabs: filteredLabs,
      labRegulatoryExposures: filteredLabRegulatoryExposures,
      internationalInstruments: filteredInstruments,
      internationalParticipation: filteredParticipation,
      nationalAIRegulations: filteredNational,
      subnationalAIRules: filteredSubnational,
      governanceDomains: GOVERNANCE_DOMAINS,
      governanceObligations: filteredObligations,
      implementationMilestones: filteredImplementationMilestones,
      indicatorSources: filteredIndicatorSources,
      countryIndicatorScores: filteredCountryIndicatorScores,
      countryReadinessReports: filteredCountryReadinessReports,
      infrastructureNodes: INFRASTRUCTURE_NODES,
      dependencyEdges: DEPENDENCY_EDGES,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS,
      sourceNotes: SOURCE_NOTES,
      datasetReleases: DATASET_RELEASES,
    },
  };
}

function getFilteredCountryIso3s(filters: FilterState) {
  let countryIso3s = filterCountries(filters)
    .filter((match) => match.matchesFilter)
    .map((match) => match.country.iso3);
  const query = filters.searchQuery.trim().toLowerCase();
  if (!query) return unique(countryIso3s);

  const queryCountryIso3s = COUNTRIES
    .filter((country) => country.iso3 !== "EUU")
    .filter((country) => `${country.name} ${country.iso3} ${country.region}`.toLowerCase().includes(query))
    .map((country) => country.iso3);
  const queryLabHqIso3s = FRONTIER_LABS
    .filter((lab) => `${lab.name} ${lab.hqCountryName} ${lab.hqIso3}`.toLowerCase().includes(query))
    .map((lab) => lab.hqIso3);
  const queryCountrySet = new Set([...queryCountryIso3s, ...queryLabHqIso3s]);
  const queryOnly =
    countActiveFilters({ ...DEFAULT_FILTER_STATE, searchQuery: filters.searchQuery }) ===
    countActiveFilters(filters);

  countryIso3s = queryOnly
    ? [...queryCountrySet]
    : countryIso3s.filter((iso3) => queryCountrySet.has(iso3));
  return unique(countryIso3s);
}

function getFilteredLabIds(filters: FilterState) {
  const labIds = [...filters.selectedLabIds];
  const query = filters.searchQuery.trim().toLowerCase();
  if (query) {
    labIds.push(
      ...FRONTIER_LABS
        .filter((lab) => `${lab.name} ${lab.hqCountryName} ${lab.hqIso3}`.toLowerCase().includes(query))
        .map((lab) => lab.id)
    );
  }
  return unique(labIds);
}

function exposureMatchesExportScope(
  exposure: LabRegulatoryExposure,
  filters: FilterState,
  filteredLabIds: Set<string>
) {
  const hasLabScopedFilter =
    filters.selectedLabIds.length > 0 ||
    filters.selectedRegions.length > 0 ||
    filters.hasBindingNationalLaw !== "any" ||
    filters.hasAnyAIRule !== "any" ||
    filters.frontierAIRelevant !== "any" ||
    Boolean(filters.searchQuery.trim());

  if (hasLabScopedFilter && !filteredLabIds.has(exposure.labId)) return false;
  if (filters.selectedInstrumentIds.length && !filters.selectedInstrumentIds.includes(exposure.targetId)) {
    return false;
  }
  if (filters.selectedBindingStatuses.length) {
    const instrument = INTERNATIONAL_INSTRUMENTS.find((item) => item.id === exposure.targetId);
    if (!instrument || !filters.selectedBindingStatuses.includes(instrument.bindingStatus)) return false;
  }
  return true;
}

function obligationMatchesExportScope(
  obligation: (typeof GOVERNANCE_OBLIGATIONS)[number],
  filters: FilterState,
  countryIso3s: Set<string>,
  filteredLabIds: Set<string>
) {
  if (!obligationMatchesFilters(obligation, filters)) return false;
  if (obligation.parentType === "national_rule") {
    const reg = NATIONAL_AI_REGULATIONS.find((item) => item.id === obligation.parentId);
    if (reg?.countryIso3) return countryIso3s.has(reg.countryIso3);
  }
  if (obligation.parentType === "subnational_rule") {
    const rule = SUBNATIONAL_AI_RULES.find((item) => item.id === obligation.parentId);
    if (rule) return countryIso3s.has(rule.countryIso3);
  }
  if (obligation.parentType === "lab_exposure") {
    const exposure = LAB_REGULATORY_EXPOSURES.find((item) => item.id === obligation.parentId);
    if (exposure) return filteredLabIds.size === 0 || filteredLabIds.has(exposure.labId);
  }
  return true;
}

function implementationMatchesExportScope(
  milestone: (typeof IMPLEMENTATION_MILESTONES)[number],
  filters: FilterState,
  countryIso3s: Set<string>
) {
  if (!implementationMatchesFilters(milestone, filters)) return false;
  if (milestone.parentType === "national_rule") {
    const reg = NATIONAL_AI_REGULATIONS.find((item) => item.id === milestone.parentId);
    if (reg?.countryIso3) return countryIso3s.has(reg.countryIso3);
  }
  if (milestone.parentType === "subnational_rule") {
    const rule = SUBNATIONAL_AI_RULES.find((item) => item.id === milestone.parentId);
    if (rule) return countryIso3s.has(rule.countryIso3);
  }
  return true;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function downloadFilteredDatasetJson(filters: FilterState): void {
  downloadTextFile(
    `global-ai-governance-map-filtered-${DATA_SNAPSHOT_DATE}.json`,
    toPrettyJson(buildFilteredDatasetSnapshot(filters)),
    "application/json;charset=utf-8"
  );
}

export function downloadCitationText(): void {
  downloadTextFile(
    `global-ai-governance-map-citation-${DATA_SNAPSHOT_DATE}.txt`,
    buildCitationText(),
    "text/plain;charset=utf-8"
  );
}
