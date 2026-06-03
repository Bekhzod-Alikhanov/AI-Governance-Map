import { COUNTRIES } from "../data/countries";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { PARTICIPATION_BY_COUNTRY } from "../data/participation";
import { LAB_BY_ID } from "../data/frontierLabs";
import type { Country, FilterState } from "../types";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";
import { countryMatchesWorkbenchFilters } from "./researchWorkbench";

export interface CountryMatchResult {
  iso3: string;
  country: Country;
  matchesFilter: boolean;
}

function filterMatchesCountry(country: Country, filters: FilterState): boolean {
  const participations = PARTICIPATION_BY_COUNTRY[country.iso3] ?? [];
  const summary = getCountryGovernanceSummary(country.iso3);

  // International instrument filter
  if (filters.selectedInstrumentIds.length > 0) {
    const matchingInstrumentIds = new Set(
      participations.map((p) => p.instrumentId)
    );

    if (filters.instrumentMatchMode === "AND") {
      for (const id of filters.selectedInstrumentIds) {
        if (!matchingInstrumentIds.has(id)) return false;
      }
    } else {
      let any = false;
      for (const id of filters.selectedInstrumentIds) {
        if (matchingInstrumentIds.has(id)) {
          any = true;
          break;
        }
      }
      if (!any) return false;
    }
  }

  // Participation type filter (applies only to selected instruments if any, else any participation)
  if (filters.selectedParticipationTypes.length > 0) {
    const relevant = filters.selectedInstrumentIds.length
      ? participations.filter((p) =>
          filters.selectedInstrumentIds.includes(p.instrumentId)
        )
      : participations;
    if (
      !relevant.some((p) =>
        filters.selectedParticipationTypes.includes(p.participationType)
      )
    ) {
      return false;
    }
  }

  // Binding force filter (across all instruments the country participates in)
  if (filters.selectedBindingStatuses.length > 0) {
    const matches = participations.some((p) => {
      const inst = INSTRUMENT_BY_ID[p.instrumentId];
      return inst && filters.selectedBindingStatuses.includes(inst.bindingStatus);
    });
    if (!matches) return false;
  }

  // Organization filter
  if (filters.selectedOrganizations.length > 0) {
    const matches = participations.some((p) => {
      const inst = INSTRUMENT_BY_ID[p.instrumentId];
      return inst && filters.selectedOrganizations.includes(inst.organizationType);
    });
    if (!matches) return false;
  }

  // Region filter
  if (filters.selectedRegions.length > 0) {
    if (!filters.selectedRegions.includes(country.region)) return false;
  }

  // Frontier-lab filter: country matches if any selected lab is HQ'd there
  if (filters.selectedLabIds.length > 0) {
    const hqMatch = filters.selectedLabIds.some(
      (id) => LAB_BY_ID[id]?.hqIso3 === country.iso3
    );
    if (!hqMatch) return false;
  }

  // Has binding national AI law
  if (filters.hasBindingNationalLaw === "yes" && !summary.hasBindingNationalLaw)
    return false;
  if (filters.hasBindingNationalLaw === "no" && summary.hasBindingNationalLaw)
    return false;

  // Has any AI rule
  if (filters.hasAnyAIRule === "yes" && !summary.hasAnyAIRule) return false;
  if (filters.hasAnyAIRule === "no" && summary.hasAnyAIRule) return false;

  // Frontier-AI relevant
  if (filters.frontierAIRelevant === "yes" && !summary.hasFrontierAIRelevant)
    return false;
  if (filters.frontierAIRelevant === "no" && summary.hasFrontierAIRelevant)
    return false;

  if (
    filters.selectedObligationCategories.length > 0 ||
    filters.selectedDomains.length > 0 ||
    filters.selectedImplementationStatuses.length > 0
  ) {
    if (!countryMatchesWorkbenchFilters(country.iso3, filters)) return false;
  }

  return true;
}

// Cache keyed by serialised filter state. Filter inputs are small and
// JSON-stringifiable; recomputing across 192 countries on every hover was
// the dominant render cost in the WorldMap.
const FILTER_CACHE = new Map<string, CountryMatchResult[]>();

function filterKey(filters: FilterState): string {
  return JSON.stringify(filters);
}

export function filterCountries(filters: FilterState): CountryMatchResult[] {
  const key = filterKey(filters);
  const cached = FILTER_CACHE.get(key);
  if (cached) return cached;
  const result = COUNTRIES.filter((c) => c.iso3 !== "EUU").map((c) => ({
    iso3: c.iso3,
    country: c,
    matchesFilter: filterMatchesCountry(c, filters),
  }));
  // Bound the cache; typical sessions hit a handful of distinct filter
  // combos. Evict oldest entry past 32 to avoid unbounded growth.
  if (FILTER_CACHE.size >= 32) {
    const first = FILTER_CACHE.keys().next().value;
    if (first) FILTER_CACHE.delete(first);
  }
  FILTER_CACHE.set(key, result);
  return result;
}

export function countActiveFilters(filters: FilterState): number {
  let n = 0;
  if (filters.selectedInstrumentIds.length) n += 1;
  if (filters.selectedParticipationTypes.length) n += 1;
  if (filters.selectedBindingStatuses.length) n += 1;
  if (filters.selectedOrganizations.length) n += 1;
  if (filters.selectedRegions.length) n += 1;
  if (filters.selectedLabIds.length) n += 1;
  if (filters.hasBindingNationalLaw !== "any") n += 1;
  if (filters.hasAnyAIRule !== "any") n += 1;
  if (filters.frontierAIRelevant !== "any") n += 1;
  if (filters.selectedObligationCategories.length) n += 1;
  if (filters.selectedDomains.length) n += 1;
  if (filters.selectedImplementationStatuses.length) n += 1;
  if (filters.searchQuery.trim()) n += 1;
  return n;
}
