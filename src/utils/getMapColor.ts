import type { FilterState, InternationalParticipation, MapModeId } from "../types";
import { PARTICIPATION_BY_COUNTRY } from "../data/participation";
import { getCountryMapSummary } from "./getCountryMapSummary";

export interface MapStyle {
  fill: string;
  outline: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity: number;
}

const FILL = {
  empty: "#E5E7EB",
  international: "#C4B5FD",
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
  mapMode: MapModeId = "binding-law",
  contextFill?: string | null
): MapStyle {
  if (mapMode !== "binding-law") {
    return getMapModeStyle(iso3, filters, matchesFilter, mapMode, contextFill);
  }
  const summary = getCountryMapSummary(iso3);

  // "No AI-specific rule" and "no data at all" are different claims, so they get
  // different fills. Most countries without a national rule are still covered by
  // international instruments; painting them the same grey as an empty record
  // understates both the dataset and the state of global AI governance.
  let fill: string;
  if (!summary.hasAnyAIRule) {
    fill = summary.internationalParticipationCount > 0 ? FILL.international : FILL.empty;
  } else if (summary.hasBindingNationalLaw) fill = FILL.binding;
  else fill = summary.proposedNationalRuleCount > 0 ? FILL.mixed : FILL.guidance;

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
  const summary = getCountryMapSummary(iso3);
  const participations = PARTICIPATION_BY_COUNTRY[iso3] ?? [];
  let fill = FILL.empty;
  let outline = OUTLINE.base;
  let strokeWidth = 0.5;
  let strokeDasharray: string | undefined;

  if (mapMode === "proposed-law") {
    fill = summary.proposedNationalRuleCount > 0 ? "#60A5FA" : FILL.empty;
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
    fill = summary.hqLabCount > 0 ? "#B45309" : FILL.empty;
  } else if (mapMode === "obligation-type") {
    const relevant = summary.obligationSignals.filter((row) => {
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
    if (summary.hasNextImplementationDeadline) fill = "#EA580C";
    else if (summary.hasInForceImplementation) fill = "#16A34A";
    else if (summary.implementationStatuses.length) fill = "#FDBA74";
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

