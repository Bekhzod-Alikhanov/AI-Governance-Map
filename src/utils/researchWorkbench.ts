import { COUNTRIES, COUNTRY_BY_ISO3 } from "../data/countries";
import { LAB_BY_ID } from "../data/frontierLabs";
import { GOVERNANCE_DOMAINS } from "../data/governanceDomains";
import {
  GOVERNANCE_OBLIGATIONS,
  OBLIGATION_CATEGORY_LABELS,
  OBLIGATIONS_BY_PARENT,
} from "../data/governanceObligations";
import {
  IMPLEMENTATION_BY_PARENT,
  IMPLEMENTATION_MILESTONES,
  IMPLEMENTATION_STATUS_LABELS,
} from "../data/implementationMilestones";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { SUBNATIONAL_BY_ID } from "../data/subnationalRules";
import { SUBNATIONAL_RULE_IDS_BY_COUNTRY } from "../data/subnationalRuleSummary";
import type {
  FilterState,
  GovernanceObligation,
  ImplementationMilestone,
  LabRegulatoryExposure,
  ObligationParentType,
} from "../types";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";
import {
  getLabExposureTarget,
  getLabRegulatoryExposures,
  LAB_EXPOSURE_EFFECT_LABELS,
  summarizeLabExposures,
} from "./labExposure";

type ParentKey = `${ObligationParentType}:${string}`;

export interface WorkbenchAnswerCard {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface ScenarioAssessment {
  labName: string;
  marketNames: string[];
  exposureRows: LabRegulatoryExposure[];
  obligations: GovernanceObligation[];
  caveats: string[];
}

export function parentKey(parentType: ObligationParentType, parentId: string): ParentKey {
  return `${parentType}:${parentId}`;
}

export function getRecordDisplayName(parentType: ObligationParentType | "international_instrument", parentId: string): string {
  if (parentType === "national_rule") return NATIONAL_REG_BY_ID[parentId]?.name ?? parentId;
  if (parentType === "international_instrument") return INSTRUMENT_BY_ID[parentId]?.name ?? parentId;
  if (parentType === "subnational_rule") return SUBNATIONAL_BY_ID[parentId]?.name ?? parentId;
  const exposure = LAB_REGULATORY_EXPOSURES.find((row) => row.id === parentId);
  if (!exposure) return parentId;
  const lab = LAB_BY_ID[exposure.labId];
  const target = getLabExposureTarget(exposure);
  return `${lab?.name ?? exposure.labId} - ${target.name}`;
}

export function getCountryObligations(iso3: string): GovernanceObligation[] {
  return uniqueById(getCountryParentKeys(iso3).flatMap((key) => OBLIGATIONS_BY_PARENT[key] ?? []));
}

export function getCountryImplementationMilestones(iso3: string): ImplementationMilestone[] {
  return uniqueById(getCountryParentKeys(iso3).flatMap((key) => IMPLEMENTATION_BY_PARENT[key] ?? []));
}

export function getLabObligations(labId: string): GovernanceObligation[] {
  const exposureKeys = getLabRegulatoryExposures(labId).map((row) => parentKey("lab_exposure", row.id));
  return uniqueById(exposureKeys.flatMap((key) => OBLIGATIONS_BY_PARENT[key] ?? []));
}

export function getInstrumentObligations(instrumentId: string): GovernanceObligation[] {
  return OBLIGATIONS_BY_PARENT[parentKey("international_instrument", instrumentId)] ?? [];
}

export function getRuleObligations(ruleId: string): GovernanceObligation[] {
  return [
    ...(OBLIGATIONS_BY_PARENT[parentKey("national_rule", ruleId)] ?? []),
    ...(OBLIGATIONS_BY_PARENT[parentKey("subnational_rule", ruleId)] ?? []),
  ];
}

export function getRuleImplementationMilestones(ruleId: string): ImplementationMilestone[] {
  return [
    ...(IMPLEMENTATION_BY_PARENT[parentKey("national_rule", ruleId)] ?? []),
    ...(IMPLEMENTATION_BY_PARENT[parentKey("subnational_rule", ruleId)] ?? []),
  ];
}

export function countryMatchesWorkbenchFilters(iso3: string, filters: FilterState): boolean {
  const obligations = getCountryObligations(iso3);
  const milestones = getCountryImplementationMilestones(iso3);

  if (filters.selectedObligationCategories.length) {
    if (!obligations.some((row) => filters.selectedObligationCategories.includes(row.category))) return false;
  }

  if (filters.selectedDomains.length) {
    if (!obligations.some((row) => row.domains.some((domain) => filters.selectedDomains.includes(domain)))) {
      return false;
    }
  }

  if (filters.selectedImplementationStatuses.length) {
    if (!milestones.some((row) => filters.selectedImplementationStatuses.includes(row.status))) return false;
  }

  return true;
}

export function obligationMatchesFilters(obligation: GovernanceObligation, filters: FilterState): boolean {
  if (
    filters.selectedObligationCategories.length &&
    !filters.selectedObligationCategories.includes(obligation.category)
  ) {
    return false;
  }
  if (
    filters.selectedDomains.length &&
    !obligation.domains.some((domain) => filters.selectedDomains.includes(domain))
  ) {
    return false;
  }
  return true;
}

export function implementationMatchesFilters(milestone: ImplementationMilestone, filters: FilterState): boolean {
  if (
    filters.selectedImplementationStatuses.length &&
    !filters.selectedImplementationStatuses.includes(milestone.status)
  ) {
    return false;
  }
  return true;
}

export function buildWorkbenchAnswerCards(filters: FilterState): WorkbenchAnswerCard[] {
  const matchingCountries = COUNTRIES
    .filter((country) => country.iso3 !== "EUU")
    .filter((country) => countryMatchesWorkbenchFilters(country.iso3, filters));
  const bindingObligations = GOVERNANCE_OBLIGATIONS.filter((row) => row.legalEffect === "binding");
  const proposedRules = NATIONAL_AI_REGULATIONS.filter((row) => row.bindingStatus === "proposed");
  const coeRows = INTERNATIONAL_PARTICIPATION.filter((row) => row.instrumentId === "coe-ai-convention");
  const labExposureSummary = summarizeLabExposures(LAB_REGULATORY_EXPOSURES);
  const activeImplementation = IMPLEMENTATION_MILESTONES.filter((row) =>
    ["in_force", "phased_application", "implementing_rules_pending"].includes(row.status)
  );

  return [
    {
      id: "binding-obligations",
      label: "Binding duties",
      value: String(bindingObligations.length),
      detail: `${unique(bindingObligations.map((row) => row.jurisdiction ?? "")).filter(Boolean).length} jurisdictions or hooks with source-backed binding obligation rows.`,
    },
    {
      id: "proposed-laws",
      label: "Proposed laws",
      value: String(proposedRules.length),
      detail: "Draft or consultation-stage AI-specific laws are kept separate from in-force duties.",
    },
    {
      id: "coe-participation",
      label: "CoE Convention",
      value: `${coeRows.filter((row) => row.participationType === "ratified").length} ratified`,
      detail: `${coeRows.filter((row) => row.participationType === "signed").length} signed-only rows; signature is not ratification.`,
    },
    {
      id: "lab-exposure",
      label: "Lab exposure",
      value: `${labExposureSummary.binding} binding`,
      detail: `${labExposureSummary.voluntary} voluntary, ${labExposureSummary.standards} standards, ${labExposureSummary.infrastructure} infrastructure rows are clearly separated.`,
    },
    {
      id: "implementation",
      label: "Implementation",
      value: String(activeImplementation.length),
      detail: "In-force, phased-application, and pending-implementation milestones tracked for high-impact rules.",
    },
    {
      id: "current-scope",
      label: "Current scope",
      value: String(matchingCountries.length),
      detail: "Countries with obligation/domain/status rows matching the active workbench filters.",
    },
  ];
}

export function buildScenarioAssessment(labId: string, marketIso3s: string[]): ScenarioAssessment | null {
  const lab = LAB_BY_ID[labId];
  if (!lab) return null;

  const marketSet = new Set(marketIso3s);
  const exposureRows = getLabRegulatoryExposures(labId).filter((exposure) => {
    if (exposure.legalEffect === "infrastructure_constraint") return true;
    if (
      ["EU", "European Union"].includes(exposure.jurisdiction ?? "") &&
      [...marketSet].some((iso3) => COUNTRY_BY_ISO3[iso3]?.isEUMember || iso3 === "EUU")
    ) {
      return true;
    }
    if (exposure.jurisdiction === "United States" && marketSet.has("USA")) return true;
    if (exposure.jurisdiction === "China" && marketSet.has("CHN")) return true;
    if (exposure.jurisdiction === "United Kingdom" && marketSet.has("GBR")) return true;
    if (exposure.jurisdiction === "Canada" && marketSet.has("CAN")) return true;
    if (exposure.jurisdiction === "France" && marketSet.has("FRA")) return true;
    if (exposure.jurisdiction === "Italy" && marketSet.has("ITA")) return true;
    return exposure.directness === "indirect";
  });

  return {
    labName: lab.name,
    marketNames: marketIso3s.map((iso3) => COUNTRY_BY_ISO3[iso3]?.name ?? iso3),
    exposureRows,
    obligations: uniqueById(exposureRows.flatMap((row) => OBLIGATIONS_BY_PARENT[parentKey("lab_exposure", row.id)] ?? [])),
    caveats: [
      "Scenario output is a research aid, not legal advice.",
      "Market-access exposure depends on deployment facts, provider role, model capability, and local implementing rules.",
      "Infrastructure rows describe ecosystem constraints and should not be read as AI-specific legal duties.",
    ],
  };
}

export function summarizeObligationCategories(rows: GovernanceObligation[]): string {
  if (!rows.length) return "No structured obligations tracked.";
  const counts = countBy(rows.map((row) => row.category));
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, count]) => `${OBlLabel(category)} (${count})`)
    .join("; ");
}

export function summarizeImplementationStatuses(rows: ImplementationMilestone[]): string {
  if (!rows.length) return "No implementation milestones tracked.";
  const counts = countBy(rows.map((row) => row.status));
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => `${IMPLEMENTATION_STATUS_LABELS[status as keyof typeof IMPLEMENTATION_STATUS_LABELS]} (${count})`)
    .join("; ");
}

export function domainLabel(id: string): string {
  return GOVERNANCE_DOMAINS.find((domain) => domain.id === id)?.label ?? id;
}

export function obligationEffectLabel(effect: GovernanceObligation["legalEffect"]): string {
  if (effect === "binding") return "Binding";
  if (effect === "proposed") return "Proposed";
  if (effect === "voluntary") return "Voluntary";
  if (effect === "standard") return "Standard";
  if (effect === "guidance") return "Guidance";
  if (effect === "conditional") return "Conditional";
  return "Indirect";
}

export function exposureEffectSummary(exposures: LabRegulatoryExposure[]): string {
  const counts = countBy(exposures.map((row) => row.legalEffect));
  return Object.entries(counts)
    .map(([effect, count]) => `${LAB_EXPOSURE_EFFECT_LABELS[effect as keyof typeof LAB_EXPOSURE_EFFECT_LABELS]} (${count})`)
    .join("; ");
}

function getCountryParentKeys(iso3: string): ParentKey[] {
  const summary = getCountryGovernanceSummary(iso3);
  return [
    ...summary.nationalRegulations.map((reg) => parentKey("national_rule", reg.id)),
    ...(SUBNATIONAL_RULE_IDS_BY_COUNTRY[iso3] ?? []).map((ruleId) => parentKey("subnational_rule", ruleId)),
    ...summary.participations.map(({ instrument }) => parentKey("international_instrument", instrument.id)),
    ...summary.hqLabs.flatMap((lab) => getLabRegulatoryExposures(lab.id).map((row) => parentKey("lab_exposure", row.id))),
  ];
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function countBy<T extends string>(items: T[]): Record<T, number> {
  return items.reduce(
    (acc, item) => {
      acc[item] = (acc[item] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>
  );
}

function OBlLabel(category: string) {
  return OBLIGATION_CATEGORY_LABELS[category as keyof typeof OBLIGATION_CATEGORY_LABELS] ?? category;
}
