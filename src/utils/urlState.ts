import { COUNTRIES } from "../data/countries";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import type {
  FilterState,
  InstrumentBindingStatus,
  LensKind,
  NetworkDensity,
  NetworkPresetId,
  OrganizationType,
  ParticipationType,
  Region,
  TimelineLane,
} from "../types";
import { DEFAULT_FILTER_STATE } from "../types";

export interface ShareableAppState {
  lens: LensKind;
  filters: FilterState;
  selectedIso3: string | null;
  selectedLabId: string | null;
  networkSelection: string | null;
  networkPreset: NetworkPresetId;
  networkDensity: NetworkDensity;
  networkFrontierOnly: boolean;
  timelineLane: TimelineLane;
}

const LENSES = new Set<LensKind>(["geography", "layer", "network", "timeline", "table"]);
const PARTICIPATION_TYPES = new Set<ParticipationType>([
  "signed",
  "ratified",
  "endorsed",
  "adopted",
  "adherent",
  "member",
  "participant",
  "applicable_via_eu",
  "covered_by_membership",
  "unknown",
]);
const BINDING_STATUSES = new Set<InstrumentBindingStatus>([
  "binding_on_parties",
  "binding_regulation",
  "non_binding",
  "voluntary",
  "standard",
  "political_guidance",
]);
const ORGANIZATIONS = new Set<OrganizationType>([
  "UN",
  "UNESCO",
  "OECD",
  "G20",
  "G7",
  "EU",
  "Council of Europe",
  "ISO/IEC",
  "ASEAN",
  "African Union",
  "APEC",
  "AI Safety Summit",
  "Bilateral",
  "Other",
]);
const REGIONS = new Set<Region>([
  "Europe",
  "North America",
  "Latin America & Caribbean",
  "Sub-Saharan Africa",
  "Middle East & North Africa",
  "East Asia",
  "Southeast Asia",
  "South Asia",
  "Central Asia",
  "Oceania",
  "Eurasia",
  "Supranational",
]);
const INSTRUMENT_IDS = new Set(INTERNATIONAL_INSTRUMENTS.map((instrument) => instrument.id));
const COUNTRY_IDS = new Set(COUNTRIES.map((country) => country.iso3));
const LAB_IDS = new Set(FRONTIER_LABS.map((lab) => lab.id));
const NETWORK_PRESETS = new Set<NetworkPresetId>([
  "all",
  "labs-laws",
  "summit-process",
  "standards-layer",
  "compute-chokepoints",
]);
const NETWORK_DENSITIES = new Set<NetworkDensity>(["all", "core", "sparse"]);
const TIMELINE_LANES = new Set<TimelineLane>([
  "all",
  "international",
  "national_binding",
  "national_proposed",
  "standards",
  "labs_infrastructure",
]);

export const DEFAULT_SHAREABLE_STATE: ShareableAppState = {
  lens: "geography",
  filters: DEFAULT_FILTER_STATE,
  selectedIso3: null,
  selectedLabId: null,
  networkSelection: null,
  networkPreset: "all",
  networkDensity: "all",
  networkFrontierOnly: false,
  timelineLane: "all",
};

function parseList<T extends string>(value: string | null, allowed: Set<T>): T[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is T => allowed.has(item as T));
}

function setList(params: URLSearchParams, key: string, values: readonly string[]) {
  if (values.length > 0) params.set(key, values.join(","));
}

function enumValue<T extends string>(value: string | null, allowed: Set<T>, fallback: T): T {
  return value && allowed.has(value as T) ? (value as T) : fallback;
}

export function parseShareableState(search: string): ShareableAppState {
  const params = new URLSearchParams(search);
  const filters: FilterState = {
    ...DEFAULT_FILTER_STATE,
    selectedInstrumentIds: parseList(params.get("inst"), INSTRUMENT_IDS),
    selectedParticipationTypes: parseList(params.get("part"), PARTICIPATION_TYPES),
    selectedBindingStatuses: parseList(params.get("effect"), BINDING_STATUSES),
    selectedOrganizations: parseList(params.get("org"), ORGANIZATIONS),
    selectedRegions: parseList(params.get("region"), REGIONS),
    selectedLabIds: parseList(params.get("labs"), LAB_IDS),
    instrumentMatchMode: params.get("mode") === "AND" ? "AND" : "OR",
    hasBindingNationalLaw: enumValue(params.get("bindingLaw"), new Set(["any", "yes", "no"]), "any"),
    hasAnyAIRule: enumValue(params.get("anyRule"), new Set(["any", "yes", "no"]), "any"),
    frontierAIRelevant: enumValue(params.get("frontier"), new Set(["any", "yes", "no"]), "any"),
    searchQuery: params.get("q")?.slice(0, 120) ?? "",
  };

  const selectedIso3 = enumValue(params.get("country"), COUNTRY_IDS, "" as string) || null;
  const selectedLabId = enumValue(params.get("lab"), LAB_IDS, "" as string) || null;
  const networkSelection = params.get("node")?.slice(0, 120) || null;

  return {
    lens: enumValue(params.get("lens"), LENSES, DEFAULT_SHAREABLE_STATE.lens),
    filters,
    selectedIso3,
    selectedLabId,
    networkSelection,
    networkPreset: enumValue(params.get("network"), NETWORK_PRESETS, "all"),
    networkDensity: enumValue(params.get("density"), NETWORK_DENSITIES, "all"),
    networkFrontierOnly: params.get("frontierNetwork") === "1",
    timelineLane: enumValue(params.get("timeline"), TIMELINE_LANES, "all"),
  };
}

export function serializeShareableState(state: ShareableAppState): string {
  const params = new URLSearchParams();
  if (state.lens !== DEFAULT_SHAREABLE_STATE.lens) params.set("lens", state.lens);
  setList(params, "inst", state.filters.selectedInstrumentIds);
  setList(params, "part", state.filters.selectedParticipationTypes);
  setList(params, "effect", state.filters.selectedBindingStatuses);
  setList(params, "org", state.filters.selectedOrganizations);
  setList(params, "region", state.filters.selectedRegions);
  setList(params, "labs", state.filters.selectedLabIds);
  if (state.filters.instrumentMatchMode === "AND") params.set("mode", "AND");
  if (state.filters.hasBindingNationalLaw !== "any") params.set("bindingLaw", state.filters.hasBindingNationalLaw);
  if (state.filters.hasAnyAIRule !== "any") params.set("anyRule", state.filters.hasAnyAIRule);
  if (state.filters.frontierAIRelevant !== "any") params.set("frontier", state.filters.frontierAIRelevant);
  if (state.filters.searchQuery.trim()) params.set("q", state.filters.searchQuery.trim());
  if (state.selectedIso3) params.set("country", state.selectedIso3);
  if (state.selectedLabId) params.set("lab", state.selectedLabId);
  if (state.networkSelection) params.set("node", state.networkSelection);
  if (state.networkPreset !== "all") params.set("network", state.networkPreset);
  if (state.networkDensity !== "all") params.set("density", state.networkDensity);
  if (state.networkFrontierOnly) params.set("frontierNetwork", "1");
  if (state.timelineLane !== "all") params.set("timeline", state.timelineLane);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
