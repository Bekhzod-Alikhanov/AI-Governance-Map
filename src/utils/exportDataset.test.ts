import { describe, expect, it } from "vitest";
import { COUNTRIES } from "../data/countries";
import { AI_ATLAS_SOURCES, COUNTRY_INDICATOR_SCORES, COUNTRY_READINESS_REPORTS } from "../data/aiAtlas";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { GOVERNANCE_OBLIGATIONS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "../data/implementationMilestones";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import {
  COMPUTE_DEPENDENCY_RECORDS,
  LAB_INTELLIGENCE_PROFILES,
  MODEL_GOVERNANCE_EVIDENCE,
  SAFETY_EVALUATION_RECORDS,
} from "../data/labIntelligence";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import {
  INSTITUTION_RECORDS,
  POLICY_PROCESS_RECORDS,
  PUBLIC_SECTOR_AI_RECORDS,
  STANDARDS_CONFORMITY_RECORDS,
} from "../data/researchCorpus";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import {
  buildCitationText,
  buildDatasetSnapshot,
  buildFilteredDatasetSnapshot,
  DATASET_SCHEMA_VERSION,
  toPrettyJson,
} from "./exportDataset";
import { DATASET_SCHEMA_ID, validateDatasetSnapshotShape } from "./datasetSchema";
import { DEFAULT_FILTER_STATE } from "../types";

describe("dataset export helpers", () => {
  it("builds a snapshot with declared schema, counts, and primary data arrays", () => {
    const snapshot = buildDatasetSnapshot();

    expect(snapshot.schemaVersion).toBe(DATASET_SCHEMA_VERSION);
    expect(snapshot.snapshotDate).toBe(DATA_SNAPSHOT_DATE);
    expect(snapshot.schema).toEqual({
      id: DATASET_SCHEMA_ID,
      version: DATASET_SCHEMA_VERSION,
      format: "json-schema-draft-2020-12",
    });
    expect(snapshot.counts.countries).toBe(COUNTRIES.filter((country) => country.iso3 !== "EUU").length);
    expect(snapshot.counts.frontierLabs).toBe(FRONTIER_LABS.length);
    expect(snapshot.counts.labRegulatoryExposures).toBe(LAB_REGULATORY_EXPOSURES.length);
    expect(snapshot.counts.labIntelligenceProfiles).toBe(LAB_INTELLIGENCE_PROFILES.length);
    expect(snapshot.counts.modelGovernanceEvidence).toBe(MODEL_GOVERNANCE_EVIDENCE.length);
    expect(snapshot.counts.safetyEvaluationRecords).toBe(SAFETY_EVALUATION_RECORDS.length);
    expect(snapshot.counts.computeDependencyRecords).toBe(COMPUTE_DEPENDENCY_RECORDS.length);
    expect(snapshot.counts.institutionRecords).toBe(INSTITUTION_RECORDS.length);
    expect(snapshot.counts.policyProcessRecords).toBe(POLICY_PROCESS_RECORDS.length);
    expect(snapshot.counts.standardsConformityRecords).toBe(STANDARDS_CONFORMITY_RECORDS.length);
    expect(snapshot.counts.publicSectorAIRecords).toBe(PUBLIC_SECTOR_AI_RECORDS.length);
    expect(snapshot.counts.internationalInstruments).toBe(INTERNATIONAL_INSTRUMENTS.length);
    expect(snapshot.counts.nationalAIRegulations).toBe(NATIONAL_AI_REGULATIONS.length);
    expect(snapshot.counts.governanceObligations).toBe(GOVERNANCE_OBLIGATIONS.length);
    expect(snapshot.counts.implementationMilestones).toBe(IMPLEMENTATION_MILESTONES.length);
    expect(snapshot.counts.indicatorSources).toBe(AI_ATLAS_SOURCES.length);
    expect(snapshot.counts.countryIndicatorScores).toBe(COUNTRY_INDICATOR_SCORES.length);
    expect(snapshot.counts.countryReadinessReports).toBe(COUNTRY_READINESS_REPORTS.length);
    expect(snapshot.data.countries).toBe(COUNTRIES);
    expect(snapshot.data.frontierLabs).toBe(FRONTIER_LABS);
    expect(snapshot.data.labRegulatoryExposures).toBe(LAB_REGULATORY_EXPOSURES);
    expect(snapshot.data.labIntelligenceProfiles).toBe(LAB_INTELLIGENCE_PROFILES);
    expect(snapshot.data.modelGovernanceEvidence).toBe(MODEL_GOVERNANCE_EVIDENCE);
    expect(snapshot.data.institutionRecords).toBe(INSTITUTION_RECORDS);
    expect(snapshot.data.countryIndicatorScores).toBe(COUNTRY_INDICATOR_SCORES);
    expect(validateDatasetSnapshotShape(snapshot)).toEqual([]);
  });

  it("builds citation text with snapshot date and public project URLs", () => {
    const citation = buildCitationText();

    expect(citation).toContain(DATA_SNAPSHOT_DATE);
    expect(citation).toContain("https://github.com/Bekhzod-Alikhanov/global-ai-governance-map");
    expect(citation).toContain("not legal advice");
  });

  it("formats exported JSON for readable review", () => {
    expect(toPrettyJson({ source: "official", confidence: "high" })).toBe(
      '{\n  "source": "official",\n  "confidence": "high"\n}'
    );
  });

  it("builds a filtered snapshot for the current research scope", () => {
    const filtered = buildFilteredDatasetSnapshot({
      ...DEFAULT_FILTER_STATE,
      selectedRegions: ["Europe"],
    });

    expect(filtered.title).toContain("filtered");
    expect(filtered.filters.selectedRegions).toEqual(["Europe"]);
    expect(filtered.counts.countries).toBeLessThan(buildDatasetSnapshot().counts.countries);
    expect(filtered.data.countries.every((country) => country.region === "Europe")).toBe(true);
  });

  it("keeps the full dataset when no filters are active", () => {
    const filtered = buildFilteredDatasetSnapshot(DEFAULT_FILTER_STATE);
    const full = buildDatasetSnapshot();

    expect(filtered.counts).toEqual(full.counts);
    expect(filtered.data.internationalInstruments).toBe(INTERNATIONAL_INSTRUMENTS);
  });

  it("includes search-matched labs and their HQ countries", () => {
    const filtered = buildFilteredDatasetSnapshot({
      ...DEFAULT_FILTER_STATE,
      searchQuery: "OpenAI",
    });

    expect(filtered.data.frontierLabs.map((lab) => lab.id)).toContain("openai");
    expect(filtered.data.labRegulatoryExposures.map((exposure) => exposure.labId)).toContain("openai");
    expect(filtered.data.countries.map((country) => country.iso3)).toContain("USA");
  });

  it("filters structured obligations by obligation category", () => {
    const filtered = buildFilteredDatasetSnapshot({
      ...DEFAULT_FILTER_STATE,
      selectedObligationCategories: ["incident_reporting"],
    });

    expect(filtered.data.governanceObligations.length).toBeGreaterThan(0);
    expect(filtered.data.governanceObligations.every((row) => row.category === "incident_reporting")).toBe(true);
  });
});
