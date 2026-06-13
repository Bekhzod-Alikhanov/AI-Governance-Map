import { describe, expect, it } from "vitest";
import publicDataCatalog from "../../public/data/catalog.json";
import { COUNTRIES } from "./countries";
import { DEPENDENCY_EDGES } from "./dependencies";
import { DATASET_COVERAGE_STATS } from "./datasetCoverageStats";
import { DATASET_STATS } from "./datasetStats";
import { FRONTIER_LABS } from "./frontierLabs";
import { INTERNATIONAL_INSTRUMENTS } from "./internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "./nationalAIRegulations";
import { INTERNATIONAL_PARTICIPATION } from "./participation";
import { LAB_REGULATORY_EXPOSURES } from "./labRegulatoryExposures";
import { GOVERNANCE_OBLIGATIONS } from "./governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "./implementationMilestones";
import { EU_AI_ACT_AUTHORITY_MATRIX } from "./euAiActAuthorities";
import { AI_ATLAS_SOURCES, COUNTRY_INDICATOR_SCORES, COUNTRY_READINESS_REPORTS } from "./aiAtlas";
import {
  COMPUTE_DEPENDENCY_RECORDS,
  INCIDENT_ENFORCEMENT_RECORDS,
  MODEL_GOVERNANCE_EVIDENCE,
  SAFETY_EVALUATION_RECORDS,
} from "./labIntelligence";
import {
  INSTITUTION_RECORDS,
  POLICY_PROCESS_RECORDS,
  PUBLIC_SECTOR_AI_RECORDS,
  STANDARDS_CONFORMITY_RECORDS,
} from "./researchCorpus";

describe("DATASET_STATS", () => {
  it("keeps lightweight header counts aligned with the graph dataset", () => {
    expect(DATASET_STATS.countries).toBe(COUNTRIES.filter((country) => country.iso3 !== "EUU").length);
    expect(DATASET_STATS.internationalInstruments).toBe(INTERNATIONAL_INSTRUMENTS.length);
    expect(DATASET_STATS.nationalRegulations).toBe(NATIONAL_AI_REGULATIONS.length);
    expect(DATASET_STATS.frontierLabs).toBe(FRONTIER_LABS.length);
    expect(DATASET_STATS.dependencyEdges).toBe(DEPENDENCY_EDGES.length);
  });

  it("keeps expanded Methodology coverage counts aligned with the source datasets", () => {
    expect(DATASET_COVERAGE_STATS.countries).toBe(COUNTRIES.filter((country) => country.iso3 !== "EUU").length);
    expect(DATASET_COVERAGE_STATS.internationalInstruments).toBe(INTERNATIONAL_INSTRUMENTS.length);
    expect(DATASET_COVERAGE_STATS.nationalRegulations).toBe(NATIONAL_AI_REGULATIONS.length);
    expect(DATASET_COVERAGE_STATS.frontierLabs).toBe(FRONTIER_LABS.length);
    expect(DATASET_COVERAGE_STATS.dependencyEdges).toBe(DEPENDENCY_EDGES.length);
    expect(DATASET_COVERAGE_STATS.internationalParticipationRows).toBe(INTERNATIONAL_PARTICIPATION.length);
    expect(DATASET_COVERAGE_STATS.labRegulatoryExposures).toBe(LAB_REGULATORY_EXPOSURES.length);
    expect(DATASET_COVERAGE_STATS.governanceObligations).toBe(GOVERNANCE_OBLIGATIONS.length);
    expect(DATASET_COVERAGE_STATS.implementationMilestones).toBe(IMPLEMENTATION_MILESTONES.length);
    expect(DATASET_COVERAGE_STATS.euAiActAuthorityMatrix).toBe(EU_AI_ACT_AUTHORITY_MATRIX.length);
    expect(DATASET_COVERAGE_STATS.modelGovernanceEvidence).toBe(MODEL_GOVERNANCE_EVIDENCE.length);
    expect(DATASET_COVERAGE_STATS.safetyEvaluationRecords).toBe(SAFETY_EVALUATION_RECORDS.length);
    expect(DATASET_COVERAGE_STATS.incidentEnforcementRecords).toBe(INCIDENT_ENFORCEMENT_RECORDS.length);
    expect(DATASET_COVERAGE_STATS.computeDependencyRecords).toBe(COMPUTE_DEPENDENCY_RECORDS.length);
    expect(DATASET_COVERAGE_STATS.indicatorSources).toBe(AI_ATLAS_SOURCES.length);
    expect(DATASET_COVERAGE_STATS.countryIndicatorScores).toBe(COUNTRY_INDICATOR_SCORES.length);
    expect(DATASET_COVERAGE_STATS.countryReadinessReports).toBe(COUNTRY_READINESS_REPORTS.length);
    expect(DATASET_COVERAGE_STATS.researchCorpusRecords).toBe(
      INSTITUTION_RECORDS.length +
        POLICY_PROCESS_RECORDS.length +
        STANDARDS_CONFORMITY_RECORDS.length +
        PUBLIC_SECTOR_AI_RECORDS.length +
        INCIDENT_ENFORCEMENT_RECORDS.length
    );
    expect(DATASET_COVERAGE_STATS.publicDataEndpoints).toBe(publicDataCatalog.endpoints.length);
  });
});
