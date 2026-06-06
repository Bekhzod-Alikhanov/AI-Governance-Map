import { COUNTRY_BY_ISO3 } from "../data/countries";
import {
  COUNTRY_MAP_SUMMARIES,
  EMPTY_COUNTRY_MAP_SUMMARY,
  type CountryMapSummary,
} from "../data/countryMapSummaries";
import type { Country } from "../types";

export interface CountryMapSummaryResult extends CountryMapSummary {
  iso3: string;
  country: Country | null;
  hasBindingNationalLaw: boolean;
}

export function getCountryMapSummary(iso3: string): CountryMapSummaryResult {
  const summary = {
    ...EMPTY_COUNTRY_MAP_SUMMARY,
    ...(COUNTRY_MAP_SUMMARIES[iso3] ?? {}),
  };
  return {
    ...summary,
    iso3,
    country: COUNTRY_BY_ISO3[iso3] ?? null,
    hasBindingNationalLaw: summary.confirmedBindingNationalRuleCount > 0,
  };
}
