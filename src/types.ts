export type Region =
  | "Europe"
  | "North America"
  | "Latin America & Caribbean"
  | "Sub-Saharan Africa"
  | "Middle East & North Africa"
  | "East Asia"
  | "Southeast Asia"
  | "South Asia"
  | "Central Asia"
  | "Oceania"
  | "Eurasia"
  | "Supranational";

export interface Country {
  iso3: string;
  name: string;
  region: Region;
  isEUMember?: boolean;
  nationalAIRegulationIds: string[];
  internationalParticipationIds: string[];
  notes?: string;
}

export type NationalRegulationType =
  | "law"
  | "regulation"
  | "guidance"
  | "code"
  | "strategy"
  | "framework"
  | "standard"
  | "proposed_law"
  | "institutional_framework";

export type NationalBindingStatus =
  | "binding"
  | "non_binding"
  | "voluntary"
  | "proposed"
  | "mixed";

export type SourceKind = "official" | "secondary" | "mixed" | "unknown";
export type VerificationStatus =
  | "verified"
  | "likely_correct"
  | "uncertain"
  | "needs_external_check";
export type DataConfidence = "high" | "medium" | "low";

export interface VerificationMetadata {
  sourceKind?: SourceKind;
  verificationStatus?: VerificationStatus;
  confidence?: DataConfidence;
  lastVerified?: string;
  verificationNotes?: string;
}

export interface NationalAIRegulation extends VerificationMetadata {
  id: string;
  name: string;
  jurisdiction: string;
  countryIso3?: string;
  regionalEntity?: "EU" | "ASEAN" | "African Union" | "APEC" | "Other";
  type: NationalRegulationType;
  bindingStatus: NationalBindingStatus;
  aiSpecific: true;
  status: string;
  dateAdopted?: string;
  dateInForce?: string;
  regulatorOrBody?: string;
  summary: string;
  frontierAIRelevant: boolean;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
}

export type OrganizationType =
  | "UN"
  | "UNESCO"
  | "OECD"
  | "G20"
  | "G7"
  | "EU"
  | "Council of Europe"
  | "ISO/IEC"
  | "ASEAN"
  | "African Union"
  | "APEC"
  | "AI Safety Summit"
  | "Bilateral"
  | "Other";

export type InstrumentType =
  | "treaty"
  | "regulation"
  | "recommendation"
  | "declaration"
  | "code_of_conduct"
  | "principles"
  | "standard"
  | "guidance"
  | "summit_statement"
  | "ministerial_statement"
  | "network"
  | "roadmap"
  | "reporting_framework"
  | "strategy"
  | "compact";

export type InstrumentBindingStatus =
  | "binding_on_parties"
  | "binding_regulation"
  | "non_binding"
  | "voluntary"
  | "standard"
  | "political_guidance";

export interface InternationalInstrument extends VerificationMetadata {
  id: string;
  name: string;
  issuer: string;
  organizationType: OrganizationType;
  date: string;
  instrumentType: InstrumentType;
  bindingStatus: InstrumentBindingStatus;
  aiSpecific: true;
  frontierAIRelevant: boolean;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
  powerScore?: number;
}

export type ParticipationType =
  | "signed"
  | "ratified"
  | "endorsed"
  | "adopted"
  | "adherent"
  | "member"
  | "participant"
  | "applicable_via_eu"
  | "covered_by_membership"
  | "unknown";

export interface InternationalParticipation extends VerificationMetadata {
  id: string;
  instrumentId: string;
  countryIso3: string;
  participationType: ParticipationType;
  date?: string;
  notes?: string;
  sourceName: string;
  sourceUrl: string;
}

export interface OutOfScopeItem {
  id: string;
  name: string;
  reasonExcluded: string;
  notes?: string;
}

export interface SourceNote {
  id: string;
  appliesTo: string;
  note: string;
}

// ===== Frontier-lab actor layer (Tier 1.A) =====
export type SafetyFrameworkMaturity = "published" | "draft" | "internal" | "none";

export interface FrontierLab extends VerificationMetadata {
  id: string;
  name: string;
  hqIso3: string;
  hqCountryName: string;
  flagshipModels: string[];
  safetyFramework?: {
    name: string;
    maturity: SafetyFrameworkMaturity;
    sourceName: string;
    sourceUrl: string;
  };
  isFMFMember: boolean;
  regulatoryExposureIds: string[];
  powerScore: number; // 1-5
  summary: string;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
}

// ===== Infrastructure layer (Tier 1.B) =====
export type InfrastructureType = "chips" | "cloud" | "export_control";

export interface InfrastructureNode extends VerificationMetadata {
  id: string;
  name: string;
  type: InfrastructureType;
  jurisdiction?: string;
  hqIso3?: string;
  powerScore: number;
  description: string;
  scopeCaveat: string;
  sourceName: string;
  sourceUrl: string;
}

// ===== Dependency-edge layer (Tier 1.C) =====
export type RelationshipKind =
  | "regulates"
  | "depends_on"
  | "constrains"
  | "influences"
  | "coordinates"
  | "participates_in";

export type GraphNodeType =
  | "country"
  | "lab"
  | "instrument"
  | "national_rule"
  | "infrastructure";

export interface GraphEdge {
  id: string;
  sourceType: GraphNodeType;
  sourceId: string;
  targetType: GraphNodeType;
  targetId: string;
  relationship: RelationshipKind;
  strength: number; // 1-5
  description: string;
}

// ===== Subnational AI rules (Tier 2.H) =====
export interface SubnationalAIRule extends VerificationMetadata {
  id: string;
  name: string;
  countryIso3: string;
  jurisdictionName: string;
  jurisdictionType: "us_state" | "us_city" | "eu_member" | "province" | "other";
  type: NationalRegulationType;
  bindingStatus: NationalBindingStatus;
  aiSpecific: true;
  status: string;
  dateAdopted?: string;
  dateInForce?: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
}

// ===== Guided walkthrough (Tier 2.F) =====
export type LensKind = "geography" | "layer" | "network" | "timeline" | "table";
export type NetworkPresetId =
  | "all"
  | "labs-laws"
  | "summit-process"
  | "standards-layer"
  | "compute-chokepoints";
export type NetworkDensity = "all" | "core" | "sparse";
export type TimelineLane =
  | "all"
  | "international"
  | "national_binding"
  | "national_proposed"
  | "standards"
  | "labs_infrastructure";

export interface WalkthroughStep {
  id: string;
  title: string;
  narrative: string;
  lens: LensKind;
  filterPatch?: Partial<FilterState>;
  highlightNodeIds?: string[];
}

export interface ResearchPreset {
  id: string;
  title: string;
  description: string;
  lens: LensKind;
  filterPatch?: Partial<FilterState>;
  selectedIso3?: string;
  selectedLabId?: string;
  selectedNetworkNodeId?: string;
  networkPreset?: NetworkPresetId;
  timelineLane?: TimelineLane;
}

// ===== Application state =====
export interface FilterState {
  selectedInstrumentIds: string[];
  instrumentMatchMode: "OR" | "AND";
  selectedParticipationTypes: ParticipationType[];
  selectedBindingStatuses: InstrumentBindingStatus[];
  selectedOrganizations: OrganizationType[];
  selectedRegions: Region[];
  selectedLabIds: string[];
  hasBindingNationalLaw: "any" | "yes" | "no";
  hasAnyAIRule: "any" | "yes" | "no";
  frontierAIRelevant: "any" | "yes" | "no";
  searchQuery: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  selectedInstrumentIds: [],
  instrumentMatchMode: "OR",
  selectedParticipationTypes: [],
  selectedBindingStatuses: [],
  selectedOrganizations: [],
  selectedRegions: [],
  selectedLabIds: [],
  hasBindingNationalLaw: "any",
  hasAnyAIRule: "any",
  frontierAIRelevant: "any",
  searchQuery: "",
};
