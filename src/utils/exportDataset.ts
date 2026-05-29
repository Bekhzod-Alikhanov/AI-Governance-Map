import { COUNTRIES } from "../data/countries";
import { DEPENDENCY_EDGES } from "../data/dependencies";
import { EU_MEMBER_ISO3 } from "../data/euMembers";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { INFRASTRUCTURE_NODES } from "../data/infrastructure";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { OUT_OF_SCOPE_ITEMS } from "../data/outOfScope";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { SOURCE_NOTES } from "../data/sourceNotes";
import { SUBNATIONAL_AI_RULES } from "../data/subnationalRules";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { DATASET_SCHEMA_ID, DATASET_SCHEMA_VERSION } from "./datasetSchema";
import { DEFAULT_FILTER_STATE, type FilterState } from "../types";
import { countActiveFilters, filterCountries } from "./filterCountries";

export { DATASET_SCHEMA_VERSION } from "./datasetSchema";

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
      internationalInstruments: INTERNATIONAL_INSTRUMENTS.length,
      internationalParticipationRows: INTERNATIONAL_PARTICIPATION.length,
      nationalAIRegulations: NATIONAL_AI_REGULATIONS.length,
      subnationalAIRules: SUBNATIONAL_AI_RULES.length,
      infrastructureNodes: INFRASTRUCTURE_NODES.length,
      dependencyEdges: DEPENDENCY_EDGES.length,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS.length,
      sourceNotes: SOURCE_NOTES.length,
    },
    data: {
      countries: COUNTRIES,
      euMembers: EU_MEMBER_ISO3,
      frontierLabs: FRONTIER_LABS,
      internationalInstruments: INTERNATIONAL_INSTRUMENTS,
      internationalParticipation: INTERNATIONAL_PARTICIPATION,
      nationalAIRegulations: NATIONAL_AI_REGULATIONS,
      subnationalAIRules: SUBNATIONAL_AI_RULES,
      infrastructureNodes: INFRASTRUCTURE_NODES,
      dependencyEdges: DEPENDENCY_EDGES,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS,
      sourceNotes: SOURCE_NOTES,
    },
  };
}

export function buildCitationText(): string {
  return [
    `Global AI Governance Map dataset, snapshot ${DATA_SNAPSHOT_DATE}.`,
    "Coverage: frontier-AI governance actors, instruments, national AI-specific rules, participation rows, labs, infrastructure, and dependency links.",
    "Use with source verification. This dataset is a research aid and is not legal advice.",
    "Repository: https://github.com/Bekhzod-Alikhanov/global-ai-governance-map",
    "Live app: https://global-ai-governance-map.vercel.app/",
  ].join("\n");
}

export function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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

  return {
    ...buildDatasetSnapshot(),
    title: "Global AI Governance Map filtered dataset",
    filters,
    counts: {
      countries: filteredCountries.length,
      euMembers: filteredCountries.filter((country) => country.isEUMember).length,
      frontierLabs: filteredLabs.length,
      internationalInstruments: filteredInstruments.length,
      internationalParticipationRows: filteredParticipation.length,
      nationalAIRegulations: filteredNational.length,
      subnationalAIRules: filteredSubnational.length,
      infrastructureNodes: INFRASTRUCTURE_NODES.length,
      dependencyEdges: DEPENDENCY_EDGES.length,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS.length,
      sourceNotes: SOURCE_NOTES.length,
    },
    data: {
      countries: filteredCountries,
      euMembers: EU_MEMBER_ISO3.filter((iso3) => countryIso3s.has(iso3)),
      frontierLabs: filteredLabs,
      internationalInstruments: filteredInstruments,
      internationalParticipation: filteredParticipation,
      nationalAIRegulations: filteredNational,
      subnationalAIRules: filteredSubnational,
      infrastructureNodes: INFRASTRUCTURE_NODES,
      dependencyEdges: DEPENDENCY_EDGES,
      outOfScopeItems: OUT_OF_SCOPE_ITEMS,
      sourceNotes: SOURCE_NOTES,
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
