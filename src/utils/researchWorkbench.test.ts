import { describe, expect, it } from "vitest";
import { DEFAULT_FILTER_STATE } from "../types";
import { filterCountries, countActiveFilters } from "./filterCountries";
import {
  buildScenarioAssessment,
  getCountryImplementationMilestones,
  getCountryObligations,
  getInstrumentObligations,
  getLabObligations,
  summarizeObligationCategories,
} from "./researchWorkbench";

describe("research workbench helpers", () => {
  it("rolls structured obligations up to countries", () => {
    const usaObligations = getCountryObligations("USA");

    expect(usaObligations.map((row) => row.id)).toContain("ca-sb-53-incident-reporting");
    expect(usaObligations.some((row) => row.category === "incident_reporting")).toBe(true);
    expect(summarizeObligationCategories(usaObligations)).toContain("Risk assessment");
  });

  it("filters countries by obligation category and implementation status", () => {
    const incidentReporting = filterCountries({
      ...DEFAULT_FILTER_STATE,
      selectedObligationCategories: ["incident_reporting"],
    }).filter((row) => row.matchesFilter);
    const phased = filterCountries({
      ...DEFAULT_FILTER_STATE,
      selectedImplementationStatuses: ["phased_application"],
    }).filter((row) => row.matchesFilter);

    expect(incidentReporting.map((row) => row.iso3)).toContain("USA");
    expect(phased.map((row) => row.iso3)).toContain("DEU");
    expect(countActiveFilters({ ...DEFAULT_FILTER_STATE, selectedObligationCategories: ["incident_reporting"] })).toBe(1);
  });

  it("rolls obligations up to labs and instruments without treating soft law as binding", () => {
    const openAiObligations = getLabObligations("openai");
    const seoulCommitments = getInstrumentObligations("seoul-frontier-ai-safety-commitments");

    expect(openAiObligations.some((row) => row.parentType === "lab_exposure")).toBe(true);
    expect(seoulCommitments.every((row) => row.legalEffect !== "binding")).toBe(true);
  });

  it("builds a conservative scenario from lab exposure rows", () => {
    const scenario = buildScenarioAssessment("openai", ["EUU", "USA", "GBR"]);

    expect(scenario?.labName).toBe("OpenAI");
    expect(scenario?.exposureRows.some((row) => row.targetId === "eu-ai-act-regional")).toBe(true);
    expect(scenario?.caveats.join(" ")).toContain("not legal advice");
  });

  it("tracks implementation milestones for high-impact rules", () => {
    const euImplementation = getCountryImplementationMilestones("DEU");

    expect(euImplementation.some((row) => row.id === "eu-ai-act-phased-application")).toBe(true);
  });
});
