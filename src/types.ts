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
export type ExpertReviewStatus =
  | "unreviewed"
  | "editorial_checked"
  | "expert_reviewed"
  | "needs_review";

export interface SourceChainEntry {
  sourceName: string;
  sourceUrl: string;
  sourceKind?: SourceKind;
  note?: string;
}

export interface VerificationMetadata {
  sourceKind?: SourceKind;
  verificationStatus?: VerificationStatus;
  confidence?: DataConfidence;
  lastVerified?: string;
  verificationNotes?: string;
  sourceChain?: SourceChainEntry[];
  reviewStatus?: ExpertReviewStatus;
  reviewNotes?: string;
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
  safetyFramework?: VerificationMetadata & {
    name: string;
    maturity: SafetyFrameworkMaturity;
    sourceName: string;
    sourceUrl: string;
  };
  isFMFMember: boolean;
  powerScore: number; // 1-5
  summary: string;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
}

export type LabExposureTargetType =
  | "national_rule"
  | "international_instrument"
  | "infrastructure"
  | "standard"
  | "company_commitment";

export type LabExposureKind =
  | "hq_jurisdiction"
  | "market_access"
  | "eu_applicability"
  | "safety_institute_coordination"
  | "company_commitment"
  | "standards_influence"
  | "compute_dependency"
  | "export_control_dependency"
  | "policy_influence";

export type LabExposureLegalEffect =
  | "binding"
  | "voluntary"
  | "standard"
  | "guidance"
  | "infrastructure_constraint"
  | "indirect";

export type LabExposureDirectness = "direct" | "conditional" | "indirect";

export interface LabRegulatoryExposure extends VerificationMetadata {
  id: string;
  labId: string;
  targetType: LabExposureTargetType;
  targetId: string;
  exposureKind: LabExposureKind;
  legalEffect: LabExposureLegalEffect;
  directness: LabExposureDirectness;
  strength: number;
  jurisdiction?: string;
  rationale: string;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
}

// ===== Frontier-lab intelligence evidence layer =====
export interface ExpertReviewMetadata {
  reviewerRole: string;
  reviewDate: string;
  reviewScope: string;
  unresolvedCaveats?: string[];
}

export interface RecordChangeLogEntry {
  id: string;
  recordId: string;
  recordKind:
    | "lab_intelligence_profile"
    | "model_governance_evidence"
    | "safety_evaluation"
    | "incident_enforcement"
    | "compute_dependency"
    | "institution"
    | "policy_process"
    | "standards_conformity"
    | "public_sector_ai"
    | "policy_brief"
    | "dataset";
  changeType:
    | "added"
    | "changed"
    | "downgraded"
    | "removed"
    | "source_replaced"
    | "manually_verified";
  date: string;
  summary: string;
  reviewer?: ExpertReviewMetadata;
}

export interface LabIntelligenceProfile extends VerificationMetadata {
  id: string;
  labId: string;
  parentLegalEntity: string;
  majorOffices: Array<{
    label: string;
    countryIso3: string;
    note?: string;
  }>;
  modelFamilies: string[];
  safetyFrameworkName?: string;
  responsibleScalingPolicyUrl?: string;
  frontierCommitmentIds: string[];
  evaluationPartnerIds: string[];
  deploymentMarketIso3s: string[];
  publicGovernanceContactUrl?: string;
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
  expertReview?: ExpertReviewMetadata;
}

export type ModelGovernanceEvidenceKind =
  | "safety_framework"
  | "responsible_scaling_policy"
  | "model_card"
  | "release_note"
  | "frontier_commitment"
  | "evaluation_report";

export interface ModelGovernanceEvidence extends VerificationMetadata {
  id: string;
  labIds: string[];
  evidenceKind: ModelGovernanceEvidenceKind;
  title: string;
  modelOrSystem?: string;
  domains: GovernanceDomainId[];
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
}

export type SafetyEvaluationType =
  | "government_testing"
  | "public_methodology"
  | "third_party_evaluation"
  | "company_evaluation_report"
  | "institute_landscape";

export interface SafetyEvaluationRecord extends VerificationMetadata {
  id: string;
  evaluationBody: string;
  jurisdiction?: string;
  labIds: string[];
  evaluationType: SafetyEvaluationType;
  modelOrSystem?: string;
  publicResult: "published" | "methodology_only" | "partnership_disclosed" | "not_public";
  domains: GovernanceDomainId[];
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
}

export type IncidentEnforcementEventType =
  | "enforcement_action"
  | "regulator_investigation"
  | "litigation"
  | "public_incident"
  | "policy_warning";

export interface IncidentEnforcementRecord extends VerificationMetadata {
  id: string;
  eventType: IncidentEnforcementEventType;
  title: string;
  jurisdiction: string;
  countryIso3?: string;
  labIds: string[];
  date: string;
  status: string;
  proceduralStage?: string;
  affectedActorClass?: string;
  outcomeOrRemedy?: string;
  officialDocketUrl?: string;
  domains: GovernanceDomainId[];
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
}

export type ComputeDependencyType =
  | "advanced_chips"
  | "cloud_platform"
  | "export_control"
  | "public_compute"
  | "data_center_investment";

export interface ComputeDependencyRecord extends VerificationMetadata {
  id: string;
  labIds: string[];
  infrastructureId: string;
  dependencyType: ComputeDependencyType;
  jurisdiction?: string;
  directness: LabExposureDirectness;
  strength: number;
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
}

// ===== Research-grade corpus layer =====
export type CorpusRecordKind =
  | "institution"
  | "policy_process"
  | "standards_conformity"
  | "public_sector_ai"
  | "enforcement";

export interface CorpusRecordReference {
  kind:
    | CorpusRecordKind
    | "country"
    | "lab"
    | "instrument"
    | "national_rule"
    | "international_instrument"
    | "subnational_rule"
    | "obligation"
    | "lab_exposure"
    | "implementation";
  id: string;
  label?: string;
}

export type InstitutionType =
  | "ai_office"
  | "ai_safety_institute"
  | "technical_evaluation_body"
  | "data_protection_authority"
  | "consumer_protection_authority"
  | "competition_authority"
  | "standards_body"
  | "procurement_authority"
  | "digital_ministry"
  | "parliamentary_committee"
  | "court_or_tribunal"
  | "treaty_body"
  | "other";

export interface InstitutionRecord extends VerificationMetadata {
  id: string;
  name: string;
  institutionType: InstitutionType;
  jurisdiction: string;
  countryIso3?: string;
  mandate: string;
  authorityScope: string;
  powers: string[];
  domains: GovernanceDomainId[];
  relatedRecords: CorpusRecordReference[];
  contactUrl?: string;
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
}

export type PolicyProcessType =
  | "consultation"
  | "call_for_evidence"
  | "hearing"
  | "parliamentary_stage"
  | "standards_consultation"
  | "treaty_negotiation"
  | "implementation_consultation"
  | "guidance_update"
  | "monitoring_process";

export type PolicyProcessStatus = "open" | "closed" | "ongoing" | "scheduled" | "watch";

export interface PolicyProcessRecord extends VerificationMetadata {
  id: string;
  title: string;
  processType: PolicyProcessType;
  jurisdiction: string;
  countryIso3?: string;
  stage: string;
  status: PolicyProcessStatus;
  deadline?: string;
  conveningBody: string;
  relatedRecords: CorpusRecordReference[];
  domains: GovernanceDomainId[];
  submissionUrl?: string;
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
}

export type StandardsConformityStatus =
  | "published"
  | "under_development"
  | "work_programme"
  | "guidance"
  | "conformity_context";

export interface StandardsConformityRecord extends VerificationMetadata {
  id: string;
  title: string;
  standardsBody: string;
  jurisdiction: string;
  countryIso3?: string;
  status: StandardsConformityStatus;
  legalRole: "voluntary_standard" | "harmonized_standard_candidate" | "presumption_of_conformity" | "guidance" | "context";
  relatedRecords: CorpusRecordReference[];
  domains: GovernanceDomainId[];
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
}

export type PublicSectorAIType =
  | "ai_use_case_inventory"
  | "algorithmic_impact_assessment"
  | "public_ai_registry"
  | "procurement_guidance"
  | "public_ai_pilot"
  | "public_compute_service";

export interface PublicSectorAIRecord extends VerificationMetadata {
  id: string;
  title: string;
  recordType: PublicSectorAIType;
  jurisdiction: string;
  countryIso3?: string;
  legalEffect: "binding_public_sector_policy" | "guidance" | "transparency_registry" | "procurement_context" | "context";
  coveredPublicBodies: string;
  relatedRecords: CorpusRecordReference[];
  domains: GovernanceDomainId[];
  summary: string;
  caveat: string;
  sourceName: string;
  sourceUrl: string;
}

export type PolicyBriefKind =
  | "country"
  | "lab_market"
  | "institution"
  | "deadline_watch"
  | "enforcement_watch"
  | "standards_conformity";

export interface PolicyBrief {
  id: string;
  kind: PolicyBriefKind;
  title: string;
  subtitle: string;
  summary: string;
  recordRefs: CorpusRecordReference[];
  sourceRefs: Array<{
    recordId: string;
    sourceName: string;
    sourceUrl: string;
    sourceKind?: SourceKind;
    verificationStatus?: VerificationStatus;
    confidence?: DataConfidence;
    lastVerified?: string;
  }>;
  caveats: string[];
  markdown: string;
}

// ===== Research workbench taxonomy =====
export type GovernanceDomainId =
  | "frontier-gpai"
  | "public-sector"
  | "employment-hiring"
  | "biometric-identification"
  | "synthetic-media"
  | "healthcare"
  | "finance"
  | "education-children"
  | "defense-autonomous-weapons"
  | "cybersecurity-critical-infrastructure"
  | "compute-cloud-chips"
  | "standards-conformity"
  | "public-procurement"
  | "enforcement-litigation";

export interface GovernanceDomain {
  id: GovernanceDomainId;
  label: string;
  description: string;
}

export type ObligationCategory =
  | "risk_assessment"
  | "transparency_disclosure"
  | "human_oversight"
  | "incident_reporting"
  | "model_evaluation_red_teaming"
  | "registration_filing"
  | "conformity_assessment"
  | "watermarking_content_labeling"
  | "audit_bias_audit"
  | "cybersecurity"
  | "data_governance"
  | "prohibited_practices"
  | "compute_infrastructure_reporting"
  | "safety_framework_publication";

export type ObligationParentType =
  | "national_rule"
  | "international_instrument"
  | "lab_exposure"
  | "subnational_rule";

export type ObligationLegalEffect =
  | "binding"
  | "proposed"
  | "voluntary"
  | "standard"
  | "guidance"
  | "conditional"
  | "indirect";

export interface GovernanceObligation extends VerificationMetadata {
  id: string;
  parentType: ObligationParentType;
  parentId: string;
  category: ObligationCategory;
  legalEffect: ObligationLegalEffect;
  directness: LabExposureDirectness;
  jurisdiction?: string;
  domains: GovernanceDomainId[];
  summary: string;
  caveat?: string;
  sourceName: string;
  sourceUrl: string;
}

export type ImplementationStatus =
  | "proposed"
  | "adopted"
  | "in_force"
  | "phased_application"
  | "implementing_rules_pending"
  | "regulator_appointed"
  | "guidance_issued"
  | "enforcement_activity_observed";

export interface ImplementationMilestone extends VerificationMetadata {
  id: string;
  parentType: ObligationParentType | "international_instrument";
  parentId: string;
  jurisdiction: string;
  status: ImplementationStatus;
  date?: string;
  nextDeadline?: string;
  label: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
}

// ===== AI Atlas context indicators =====
export type IndicatorSourceCategory =
  | "government_readiness"
  | "democratic_values"
  | "readiness_assessment"
  | "ai_vibrancy"
  | "ai_preparedness"
  | "policy_index"
  | "responsible_ai"
  | "public_sector_registry"
  | "ai_regulator"
  | "enforcement_activity"
  | "ai_safety_institute"
  | "public_procurement"
  | "compute_investment";

export interface IndicatorSource extends VerificationMetadata {
  id: string;
  name: string;
  publisher: string;
  year: number;
  category: IndicatorSourceCategory;
  coverage: string;
  methodologyUrl: string;
  sourceName: string;
  sourceUrl: string;
  caveat: string;
}

export interface CountryIndicatorScore extends VerificationMetadata {
  id: string;
  sourceId: string;
  countryIso3: string;
  year: number;
  score?: number;
  rank?: number;
  tier?: string;
  scoreLabel?: string;
  pillars?: Record<string, number>;
  dimensions?: Record<string, number | string>;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
}

export type ReadinessReportStatus =
  | "completed"
  | "in_process"
  | "in_preparation"
  | "profile_available";

export interface CountryReadinessReport extends VerificationMetadata {
  id: string;
  sourceId: string;
  countryIso3: string;
  status: ReadinessReportStatus;
  reportDate?: string;
  profileUrl?: string;
  reportUrl?: string;
  dimensions: string[];
  caveat: string;
  sourceName: string;
  sourceUrl: string;
  notes?: string;
}

export type WorkbenchWorkflowId =
  | "compare-countries"
  | "compare-labs"
  | "binding-duties"
  | "treaty-participation"
  | "lab-exposure"
  | "citation-brief"
  | "implementation-status"
  | "scenario-simulator";

export type MapModeId =
  | "binding-law"
  | "proposed-law"
  | "treaty-participation"
  | "lab-hq"
  | "obligation-type"
  | "implementation-deadline"
  | "source-confidence"
  | "frontier-relevance"
  | "ai-institutions"
  | "policy-windows"
  | "public-sector-ai"
  | "enforcement-activity"
  | "standards-conformity"
  | "gov-ai-readiness"
  | "democratic-values"
  | "unesco-ram-status"
  | "ai-vibrancy";

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
export type LensKind = "workbench" | "geography" | "layer" | "network" | "timeline" | "table";
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

export type AtlasPresetId =
  | "high-readiness-no-binding"
  | "ram-activity"
  | "caidp-oxford-comparison"
  | "vibrancy-regulatory-maturity";

export type WorkbenchCompareKind = "country" | "lab" | "instrument" | "rule" | "obligation" | "exposure";

export interface WorkbenchCompareItem {
  kind: WorkbenchCompareKind;
  id: string;
}

export interface WorkbenchState {
  compareKind: WorkbenchCompareKind;
  compareId: string;
  compareItems: WorkbenchCompareItem[];
  scenarioLabId: string;
  scenarioMarkets: string[];
  atlasPresetId: AtlasPresetId;
  activeWorkflowId: string | null;
  activeQuestionId: string | null;
  activeAnswerCardId: string | null;
}

export const DEFAULT_WORKBENCH_STATE: WorkbenchState = {
  compareKind: "country",
  compareId: "USA",
  compareItems: [
    { kind: "country", id: "USA" },
    { kind: "country", id: "EUU" },
  ],
  scenarioLabId: "openai",
  scenarioMarkets: ["EUU", "USA", "GBR", "KOR"],
  atlasPresetId: "high-readiness-no-binding",
  activeWorkflowId: null,
  activeQuestionId: null,
  activeAnswerCardId: null,
};

export interface MapFitTarget {
  id: string;
  label: string;
  countryIso3s: string[];
  labIds: string[];
  countryCount: number;
  labCount: number;
  summaryLabel: string;
}

export type CompareItemKind = "country" | "lab" | "instrument";

export interface CompareItem {
  kind: CompareItemKind;
  id: string;
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
  selectedObligationCategories: ObligationCategory[];
  selectedDomains: GovernanceDomainId[];
  selectedImplementationStatuses: ImplementationStatus[];
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
  selectedObligationCategories: [],
  selectedDomains: [],
  selectedImplementationStatuses: [],
  searchQuery: "",
};
