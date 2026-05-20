import type { FilterState, InternationalParticipation, LensKind } from "../types";
import { PARTICIPATION_BY_COUNTRY } from "../data/participation";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";

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
  lens: LensKind = "geography"
): MapStyle {
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
