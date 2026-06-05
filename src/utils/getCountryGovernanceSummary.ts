import { COUNTRY_BY_ISO3 } from "../data/countries";
import { EU_MEMBER_ISO3 } from "../data/euMembers";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { PARTICIPATION_BY_COUNTRY } from "../data/participation";
import { getLabsByHqIso3, LAB_BY_ID } from "../data/frontierLabs";
import { INFRASTRUCTURE_LABEL_BY_ID } from "../data/infrastructureSummary";
import { SUBNATIONAL_RULE_COUNTRY_ISO3S } from "../data/subnationalRuleSummary";
import type {
  Country,
  FrontierLab,
  GraphEdge,
  InternationalInstrument,
  InternationalParticipation,
  NationalAIRegulation,
  SubnationalAIRule,
} from "../types";
import { isConfirmedBindingNationalRegulation } from "./governanceTaxonomy";

export interface CountryGovernanceSummary {
  country: Country | null;
  nationalRegulations: NationalAIRegulation[];
  participations: Array<{
    participation: InternationalParticipation;
    instrument: InternationalInstrument;
  }>;
  hqLabs: FrontierLab[];
  subnationalRules: SubnationalAIRule[];
  edges: { outgoing: GraphEdge[]; incoming: GraphEdge[] };
  hasBindingNationalLaw: boolean;
  hasAnyAIRule: boolean;
  hasFrontierAIRelevant: boolean;
}

const EMPTY_SUMMARY: CountryGovernanceSummary = {
  country: null,
  nationalRegulations: [],
  participations: [],
  hqLabs: [],
  subnationalRules: [],
  edges: { outgoing: [], incoming: [] },
  hasBindingNationalLaw: false,
  hasAnyAIRule: false,
  hasFrontierAIRelevant: false,
};
const EMPTY_EDGES = { outgoing: [], incoming: [] } as { outgoing: GraphEdge[]; incoming: GraphEdge[] };

// Cache: dataset is static at runtime, so per-iso3 summary can be memoised
// once forever. Tooltips on hover hit this O(1) instead of recomputing.
const SUMMARY_CACHE = new Map<string, CountryGovernanceSummary>();

export function getCountryGovernanceSummary(iso3: string): CountryGovernanceSummary {
  const cached = SUMMARY_CACHE.get(iso3);
  if (cached) return cached;
  const computed = computeCountryGovernanceSummary(iso3);
  SUMMARY_CACHE.set(iso3, computed);
  return computed;
}

function computeCountryGovernanceSummary(iso3: string): CountryGovernanceSummary {
  const country = COUNTRY_BY_ISO3[iso3];
  if (!country) return { ...EMPTY_SUMMARY };

  const regulations: NationalAIRegulation[] = [];
  for (const reg of NATIONAL_AI_REGULATIONS) {
    if (reg.countryIso3 === iso3) {
      regulations.push(reg);
    }
    if (
      reg.regionalEntity === "EU" &&
      reg.id === "eu-ai-act-regional" &&
      EU_MEMBER_ISO3.includes(iso3)
    ) {
      regulations.push(reg);
    }
  }

  const participations = (PARTICIPATION_BY_COUNTRY[iso3] ?? [])
    .map((p) => ({
      participation: p,
      instrument: INSTRUMENT_BY_ID[p.instrumentId],
    }))
    .filter((p) => Boolean(p.instrument))
    .sort((a, b) => {
      const pa = a.instrument.powerScore ?? 0;
      const pb = b.instrument.powerScore ?? 0;
      if (pb !== pa) return pb - pa;
      return a.instrument.name.localeCompare(b.instrument.name);
    });

  const hqLabs = getLabsByHqIso3(iso3).sort((a, b) => b.powerScore - a.powerScore);

  const hasBindingNationalLaw = regulations.some(isConfirmedBindingNationalRegulation);
  const hasAnyAIRule = regulations.length > 0 || SUBNATIONAL_RULE_COUNTRY_ISO3S.has(iso3);
  const hasFrontierAIRelevant =
    regulations.some((r) => r.frontierAIRelevant) ||
    participations.some(({ instrument }) => instrument.frontierAIRelevant) ||
    hqLabs.length > 0;

  return {
    country,
    nationalRegulations: regulations,
    participations,
    hqLabs,
    subnationalRules: [],
    edges: EMPTY_EDGES,
    hasBindingNationalLaw,
    hasAnyAIRule,
    hasFrontierAIRelevant,
  };
}

// Resolve any graph node id into a display label + node type
export interface ResolvedNode {
  id: string;
  name: string;
  kind: "country" | "lab" | "instrument" | "national_rule" | "infrastructure";
}

export function resolveNode(id: string): ResolvedNode | null {
  if (COUNTRY_BY_ISO3[id]) return { id, name: COUNTRY_BY_ISO3[id].name, kind: "country" };
  if (LAB_BY_ID[id]) return { id, name: LAB_BY_ID[id].name, kind: "lab" };
  if (INSTRUMENT_BY_ID[id]) return { id, name: INSTRUMENT_BY_ID[id].name, kind: "instrument" };
  if (INFRASTRUCTURE_LABEL_BY_ID[id]) return { id, name: INFRASTRUCTURE_LABEL_BY_ID[id], kind: "infrastructure" };
  const reg = NATIONAL_AI_REGULATIONS.find((r) => r.id === id);
  if (reg) return { id, name: reg.name, kind: "national_rule" };
  return null;
}
