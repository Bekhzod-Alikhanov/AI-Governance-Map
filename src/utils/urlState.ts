import { COUNTRIES } from "../data/countries";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { GOVERNANCE_DOMAINS } from "../data/governanceDomains";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import type {
  AtlasPresetId,
  FilterState,
  GovernanceDomainId,
  ImplementationStatus,
  InstrumentBindingStatus,
  LensKind,
  NetworkDensity,
  NetworkPresetId,
  ObligationCategory,
  OrganizationType,
  ParticipationType,
  Region,
  TimelineLane,
  WorkbenchCompareKind,
  WorkbenchCompareItem,
  WorkbenchState,
} from "../types";
import { DEFAULT_FILTER_STATE, DEFAULT_WORKBENCH_STATE } from "../types";

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
  workbench: WorkbenchState;
}

const LENSES = new Set<LensKind>(["workbench", "geography", "layer", "network", "timeline", "table"]);
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
const OBLIGATION_CATEGORIES = new Set<ObligationCategory>([
  "risk_assessment",
  "transparency_disclosure",
  "human_oversight",
  "incident_reporting",
  "model_evaluation_red_teaming",
  "registration_filing",
  "conformity_assessment",
  "watermarking_content_labeling",
  "audit_bias_audit",
  "cybersecurity",
  "data_governance",
  "prohibited_practices",
  "compute_infrastructure_reporting",
  "safety_framework_publication",
]);
const DOMAIN_IDS = new Set<GovernanceDomainId>(GOVERNANCE_DOMAINS.map((domain) => domain.id));
const IMPLEMENTATION_STATUSES = new Set<ImplementationStatus>([
  "proposed",
  "adopted",
  "in_force",
  "phased_application",
  "implementing_rules_pending",
  "regulator_appointed",
  "guidance_issued",
  "enforcement_activity_observed",
]);
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
const ATLAS_PRESETS = new Set<AtlasPresetId>([
  "high-readiness-no-binding",
  "ram-activity",
  "caidp-oxford-comparison",
  "vibrancy-regulatory-maturity",
]);
const WORKBENCH_COMPARE_KINDS = new Set<WorkbenchCompareKind>([
  "country",
  "lab",
  "instrument",
  "rule",
  "obligation",
  "exposure",
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
  workbench: DEFAULT_WORKBENCH_STATE,
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
    selectedObligationCategories: parseList(params.get("obl"), OBLIGATION_CATEGORIES),
    selectedDomains: parseList(params.get("domain"), DOMAIN_IDS),
    selectedImplementationStatuses: parseList(params.get("impl"), IMPLEMENTATION_STATUSES),
    searchQuery: params.get("q")?.slice(0, 120) ?? "",
  };

  const selectedIso3 = enumValue(params.get("country"), COUNTRY_IDS, "" as string) || null;
  const selectedLabId = enumValue(params.get("lab"), LAB_IDS, "" as string) || null;
  const networkSelection = params.get("node")?.slice(0, 120) || null;
  const compareKind = enumValue(params.get("wbKind"), WORKBENCH_COMPARE_KINDS, DEFAULT_WORKBENCH_STATE.compareKind);
  const scenarioMarkets = parseList(params.get("wbMarkets"), COUNTRY_IDS);

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
    workbench: {
      compareKind,
      compareId: validWorkbenchId(compareKind, params.get("wbId")) ?? DEFAULT_WORKBENCH_STATE.compareId,
      compareItems: parseWorkbenchCompareItems(params.get("wbCompare")),
      scenarioLabId: enumValue(params.get("wbScenarioLab"), LAB_IDS, DEFAULT_WORKBENCH_STATE.scenarioLabId),
      scenarioMarkets: scenarioMarkets.length ? scenarioMarkets : DEFAULT_WORKBENCH_STATE.scenarioMarkets,
      atlasPresetId: enumValue(params.get("wbAtlas"), ATLAS_PRESETS, DEFAULT_WORKBENCH_STATE.atlasPresetId),
      activeWorkflowId: params.get("wbWorkflow")?.slice(0, 80) || null,
      activeQuestionId: params.get("wbQuestion")?.slice(0, 80) || null,
      activeAnswerCardId: params.get("wbAnswer")?.slice(0, 80) || null,
    },
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
  setList(params, "obl", state.filters.selectedObligationCategories);
  setList(params, "domain", state.filters.selectedDomains);
  setList(params, "impl", state.filters.selectedImplementationStatuses);
  if (state.filters.searchQuery.trim()) params.set("q", state.filters.searchQuery.trim());
  if (state.selectedIso3) params.set("country", state.selectedIso3);
  if (state.selectedLabId) params.set("lab", state.selectedLabId);
  if (state.networkSelection) params.set("node", state.networkSelection);
  if (state.networkPreset !== "all") params.set("network", state.networkPreset);
  if (state.networkDensity !== "all") params.set("density", state.networkDensity);
  if (state.networkFrontierOnly) params.set("frontierNetwork", "1");
  if (state.timelineLane !== "all") params.set("timeline", state.timelineLane);
  if (state.workbench.compareKind !== DEFAULT_WORKBENCH_STATE.compareKind) params.set("wbKind", state.workbench.compareKind);
  if (state.workbench.compareId !== DEFAULT_WORKBENCH_STATE.compareId) params.set("wbId", state.workbench.compareId);
  if (!sameCompareItems(state.workbench.compareItems, DEFAULT_WORKBENCH_STATE.compareItems)) {
    params.set("wbCompare", state.workbench.compareItems.map((item) => `${item.kind}:${item.id}`).join(","));
  }
  if (state.workbench.scenarioLabId !== DEFAULT_WORKBENCH_STATE.scenarioLabId) {
    params.set("wbScenarioLab", state.workbench.scenarioLabId);
  }
  if (!sameStrings(state.workbench.scenarioMarkets, DEFAULT_WORKBENCH_STATE.scenarioMarkets)) {
    setList(params, "wbMarkets", state.workbench.scenarioMarkets);
  }
  if (state.workbench.atlasPresetId !== DEFAULT_WORKBENCH_STATE.atlasPresetId) {
    params.set("wbAtlas", state.workbench.atlasPresetId);
  }
  if (state.workbench.activeWorkflowId) params.set("wbWorkflow", state.workbench.activeWorkflowId);
  if (state.workbench.activeQuestionId) params.set("wbQuestion", state.workbench.activeQuestionId);
  if (state.workbench.activeAnswerCardId) params.set("wbAnswer", state.workbench.activeAnswerCardId);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function parseWorkbenchCompareItems(value: string | null): WorkbenchCompareItem[] {
  if (!value) return DEFAULT_WORKBENCH_STATE.compareItems;
  const items = value
    .split(",")
    .map((part) => {
      const [kind, id] = part.split(":");
      if (!WORKBENCH_COMPARE_KINDS.has(kind as WorkbenchCompareKind)) return null;
      const compareKind = kind as WorkbenchCompareKind;
      const validId = validWorkbenchId(compareKind, id);
      return validId ? { kind: compareKind, id: validId } : null;
    })
    .filter((item): item is WorkbenchCompareItem => Boolean(item));
  return items.length ? items.slice(0, 6) : DEFAULT_WORKBENCH_STATE.compareItems;
}

function validWorkbenchId(kind: WorkbenchCompareKind, id: string | null | undefined): string | null {
  if (!id) return null;
  if (kind === "country") return COUNTRY_IDS.has(id) ? id : null;
  if (kind === "lab") return LAB_IDS.has(id) ? id : null;
  if (kind === "instrument") return INSTRUMENT_IDS.has(id) ? id : null;
  return sanitizeWorkbenchId(id);
}

function sanitizeWorkbenchId(id: string): string | null {
  const sanitized = id.trim().slice(0, 180);
  return /^[a-z0-9][a-z0-9._:-]{0,179}$/i.test(sanitized) ? sanitized : null;
}

function sameStrings(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function sameCompareItems(a: WorkbenchCompareItem[], b: WorkbenchCompareItem[]): boolean {
  return a.length === b.length && a.every((item, index) => item.kind === b[index]?.kind && item.id === b[index]?.id);
}
