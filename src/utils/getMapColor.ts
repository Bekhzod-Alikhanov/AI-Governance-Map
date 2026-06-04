import type { FilterState, InternationalParticipation, LensKind, MapModeId, VerificationMetadata } from "../types";
import { PARTICIPATION_BY_COUNTRY } from "../data/participation";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";
import { getCountryImplementationMilestones, getCountryObligations } from "./researchWorkbench";

const LAYER_FILL: Record<string, string> = {
  corporate: "#B45309",       // gold-700 — has frontier lab HQ
  national_binding: "#1D4ED8", // dark blue — binding national AI law
  national_proposed: "#60A5FA", // mid blue — proposed / mixed
  voluntary: "#BFDBFE",       // light blue — guidance / voluntary / strategy
  international: "#C4B5FD",   // violet-300 — only international participation
  empty: "#E5E7EB",
};

export const LAYER_LABEL: Record<string, string> = {
  corporate: "Has frontier-lab HQ",
  national_binding: "Binding national AI law",
  national_proposed: "Proposed / mixed national rule",
  voluntary: "Guidance / strategy only",
  international: "International participation only",
  empty: "No AI-specific data",
};

const LAYER_CACHE = new Map<string, keyof typeof LAYER_FILL>();

function pickPrimaryLayer(iso3: string): keyof typeof LAYER_FILL {
  const cached = LAYER_CACHE.get(iso3);
  if (cached) return cached;
  const s = getCountryGovernanceSummary(iso3);
  let layer: keyof typeof LAYER_FILL;
  if (s.hqLabs.length > 0) layer = "corporate";
  else if (s.hasBindingNationalLaw) layer = "national_binding";
  else if (s.nationalRegulations.some((r) => r.bindingStatus === "proposed" || r.bindingStatus === "mixed"))
    layer = "national_proposed";
  else if (s.hasAnyAIRule) layer = "voluntary";
  else if (s.participations.length > 0) layer = "international";
  else layer = "empty";
  LAYER_CACHE.set(iso3, layer);
  return layer;
}

export interface MapStyle {
  fill: string;
  outline: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity: number;
}

const FILL = {
  empty: "#E5E7EB",
  guidance: "#BFDBFE",
  mixed: "#60A5FA",
  binding: "#1D4ED8",
};

const OUTLINE = {
  base: "#94A3B8",
  match: "#B45309",
  ratified: "#6D28D9",
  signedNotRatified: "#6D28D9",
};

export function getMapStyle(
  iso3: string,
  filters: FilterState,
  matchesFilter: boolean,
  lens: LensKind = "geography",
  mapMode: MapModeId = "binding-law",
  contextFill?: string | null
): MapStyle {
  if (mapMode !== "binding-law") {
    return getMapModeStyle(iso3, filters, matchesFilter, mapMode, contextFill);
  }
  if (lens === "layer") {
    return getLayerStyle(iso3, filters, matchesFilter);
  }
  const summary = getCountryGovernanceSummary(iso3);

  let fill: string;
  if (!summary.hasAnyAIRule) fill = FILL.empty;
  else if (summary.hasBindingNationalLaw) fill = FILL.binding;
  else {
    const hasProposed = summary.nationalRegulations.some(
      (r) => r.bindingStatus === "proposed" || r.bindingStatus === "mixed"
    );
    fill = hasProposed ? FILL.mixed : FILL.guidance;
  }

  let outline = OUTLINE.base;
  let strokeWidth = 0.5;
  let strokeDasharray: string | undefined;

  const participations = PARTICIPATION_BY_COUNTRY[iso3] ?? [];

  // Treaty outline: ratified vs signed-not-ratified
  const treatyRows = participations.filter(
    (p) => p.instrumentId === "coe-ai-convention"
  );
  if (treatyRows.length > 0) {
    const ratified = treatyRows.some(
      (r: InternationalParticipation) =>
        r.participationType === "ratified" ||
        r.participationType === "applicable_via_eu"
    );
    if (ratified) {
      outline = OUTLINE.ratified;
      strokeWidth = 1.25;
    } else {
      outline = OUTLINE.signedNotRatified;
      strokeWidth = 1.25;
      strokeDasharray = "3 2";
    }
  }

  // Filter outline overlay
  let opacity = 1;
  if (filters.selectedInstrumentIds.length > 0) {
    if (matchesFilter) {
      outline = OUTLINE.match;
      strokeWidth = 1.5;
      strokeDasharray = undefined;
    } else {
      opacity = 0.25;
    }
  } else if (!matchesFilter) {
    opacity = 0.25;
  }

  return { fill, outline, strokeWidth, strokeDasharray, opacity };
}

function getMapModeStyle(
  iso3: string,
  filters: FilterState,
  matchesFilter: boolean,
  mapMode: MapModeId,
  contextFill?: string | null
): MapStyle {
  const summary = getCountryGovernanceSummary(iso3);
  const participations = PARTICIPATION_BY_COUNTRY[iso3] ?? [];
  const obligations = getCountryObligations(iso3);
  const implementation = getCountryImplementationMilestones(iso3);
  let fill = FILL.empty;
  let outline = OUTLINE.base;
  let strokeWidth = 0.5;
  let strokeDasharray: string | undefined;

  if (mapMode === "proposed-law") {
    fill = summary.nationalRegulations.some((reg) => reg.bindingStatus === "proposed") ? "#60A5FA" : FILL.empty;
  } else if (mapMode === "treaty-participation") {
    const treatyRows = participations.filter((row) => row.instrumentId === "coe-ai-convention");
    if (treatyRows.some((row) => row.participationType === "ratified" || row.participationType === "applicable_via_eu")) {
      fill = "#7C3AED";
    } else if (treatyRows.some((row) => row.participationType === "signed")) {
      fill = "#C4B5FD";
      strokeDasharray = "3 2";
    } else if (participations.length) {
      fill = "#EDE9FE";
    }
  } else if (mapMode === "lab-hq") {
    fill = summary.hqLabs.length ? "#B45309" : FILL.empty;
  } else if (mapMode === "obligation-type") {
    const relevant = obligations.filter((row) => {
      if (
        filters.selectedObligationCategories.length &&
        !filters.selectedObligationCategories.includes(row.category)
      ) {
        return false;
      }
      if (filters.selectedDomains.length && !row.domains.some((domain) => filters.selectedDomains.includes(domain))) {
        return false;
      }
      return true;
    });
    if (relevant.some((row) => row.legalEffect === "binding")) fill = "#0F766E";
    else if (relevant.length) fill = "#99F6E4";
  } else if (mapMode === "implementation-deadline") {
    if (implementation.some((row) => row.nextDeadline)) fill = "#EA580C";
    else if (implementation.some((row) => row.status === "in_force")) fill = "#16A34A";
    else if (implementation.length) fill = "#FDBA74";
  } else if (mapMode === "source-confidence") {
    const records: VerificationMetadata[] = [
      ...summary.nationalRegulations,
      ...summary.subnationalRules,
      ...summary.participations.map((row) => row.participation),
      ...summary.participations.map((row) => row.instrument),
    ];
    if (records.some((record) => record.confidence === "low")) fill = "#FCA5A5";
    else if (records.some((record) => record.confidence === "medium")) fill = "#FCD34D";
    else if (records.length) fill = "#86EFAC";
  } else if (mapMode === "frontier-relevance") {
    fill = summary.hasFrontierAIRelevant ? "#1D4ED8" : FILL.empty;
  } else {
    fill = contextFill ?? FILL.empty;
  }

  let opacity = 1;
  if (!matchesFilter) opacity = 0.25;
  if (matchesFilter && filters.selectedInstrumentIds.length > 0) {
    outline = OUTLINE.match;
    strokeWidth = 1.5;
  }

  return { fill, outline, strokeWidth, strokeDasharray, opacity };
}

function getLayerStyle(
  iso3: string,
  filters: FilterState,
  matchesFilter: boolean
): MapStyle {
  const layer = pickPrimaryLayer(iso3);
  const fill = LAYER_FILL[layer];

  let outline = OUTLINE.base;
  let strokeWidth = 0.5;
  let opacity = 1;

  if (filters.selectedInstrumentIds.length > 0) {
    if (matchesFilter) {
      outline = OUTLINE.match;
      strokeWidth = 1.5;
    } else {
      opacity = 0.25;
    }
  } else if (!matchesFilter) {
    opacity = 0.25;
  }

  return { fill, outline, strokeWidth, opacity };
}

export { pickPrimaryLayer };
