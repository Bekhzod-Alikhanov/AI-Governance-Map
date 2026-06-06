import { describe, expect, it } from "vitest";
import { COUNTRIES } from "./countries";
import { COUNTRY_MAP_SUMMARIES } from "./countryMapSummaries";
import { getCountryMapSummary } from "../utils/getCountryMapSummary";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";
import { isConfirmedBindingNationalRegulation } from "../utils/governanceTaxonomy";
import { getCountryImplementationMilestones, getCountryObligations } from "../utils/researchWorkbench";

describe("COUNTRY_MAP_SUMMARIES", () => {
  it("has one compact map summary for every rendered country", () => {
    const renderedCountries = COUNTRIES.filter((country) => country.iso3 !== "EUU");
    expect(Object.keys(COUNTRY_MAP_SUMMARIES).sort()).toEqual(
      renderedCountries.map((country) => country.iso3).sort()
    );
  });

  it("stays in sync with full country governance summaries", () => {
    for (const country of COUNTRIES.filter((row) => row.iso3 !== "EUU")) {
      const compact = getCountryMapSummary(country.iso3);
      const full = getCountryGovernanceSummary(country.iso3);
      const bindingRules = full.nationalRegulations.filter(isConfirmedBindingNationalRegulation);
      const proposedRules = full.nationalRegulations.filter(
        (rule) => rule.bindingStatus === "proposed" || rule.bindingStatus === "mixed"
      );
      const obligations = getCountryObligations(country.iso3);
      const implementation = getCountryImplementationMilestones(country.iso3);

      expect(compact.nationalRuleCount).toBe(full.nationalRegulations.length);
      expect(compact.confirmedBindingNationalRuleCount).toBe(bindingRules.length);
      expect(compact.proposedNationalRuleCount).toBe(proposedRules.length);
      expect(compact.internationalParticipationCount).toBe(full.participations.length);
      expect(compact.hqLabCount).toBe(full.hqLabs.length);
      expect(compact.hasAnyAIRule).toBe(full.hasAnyAIRule);
      expect(compact.hasFrontierAIRelevant).toBe(full.hasFrontierAIRelevant);
      expect(compact.obligationSignals.length).toBe(obligations.length);
      expect([...compact.implementationStatuses].sort()).toEqual(
        [...new Set(implementation.map((milestone) => milestone.status))].sort()
      );
      expect(compact.hasNextImplementationDeadline).toBe(implementation.some((milestone) => Boolean(milestone.nextDeadline)));
      expect(compact.hasInForceImplementation).toBe(implementation.some((milestone) => milestone.status === "in_force"));
    }
  });

  it("exposes map-facing convenience flags", () => {
    expect(getCountryMapSummary("DEU").hasBindingNationalLaw).toBe(true);
    expect(getCountryMapSummary("USA").hqLabCount).toBeGreaterThan(0);
    expect(getCountryMapSummary("ZZZ").country).toBeNull();
  });
});
