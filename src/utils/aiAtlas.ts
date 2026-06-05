import { COUNTRIES, COUNTRY_BY_ISO3 } from "../data/countries";
import {
  COUNTRY_INDICATOR_SCORE_BY_SOURCE_AND_COUNTRY,
  COUNTRY_INDICATOR_SCORES,
  COUNTRY_INDICATOR_SCORES_BY_COUNTRY,
  COUNTRY_READINESS_REPORTS,
  COUNTRY_READINESS_REPORTS_BY_COUNTRY,
  INDICATOR_SOURCE_BY_ID,
} from "../data/aiAtlas";
import type { AtlasPresetId, CountryIndicatorScore, CountryReadinessReport, MapModeId, ReadinessReportStatus } from "../types";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";

export const OXFORD_READINESS_SOURCE_ID = "oxford-gov-ai-readiness-2025";
export const CAIDP_DEMOCRATIC_VALUES_SOURCE_ID = "caidp-ai-democratic-values-2026";
export const UNESCO_RAM_SOURCE_ID = "unesco-ram-global-hub-2026";
export const STANFORD_VIBRANCY_SOURCE_ID = "stanford-ai-vibrancy-tool-2024";
export const IMF_AI_PREPAREDNESS_SOURCE_ID = "imf-ai-preparedness-index";
export const OECD_AI_OBSERVATORY_INDEX_SOURCE_ID = "oecd-ai-observatory-index-2026";
export const OECD_AI_POLICY_OBSERVATORY_SOURCE_ID = "oecd-ai-policy-observatory";
export const GLOBAL_RESPONSIBLE_AI_SOURCE_ID = "global-index-responsible-ai-2024";
export const NETHERLANDS_ALGORITHM_REGISTER_SOURCE_ID = "netherlands-public-algorithm-register";
export const INTERNATIONAL_AISI_NETWORK_SOURCE_ID = "international-network-ai-safety-institutes";
export const EU_AI_FACTORIES_SOURCE_ID = "eu-ai-factories";
export const US_NAIRR_PILOT_SOURCE_ID = "us-nairr-pilot";
export const UK_AI_PROCUREMENT_GUIDELINES_SOURCE_ID = "uk-ai-procurement-guidelines";
export const EU_AI_OFFICE_GOVERNANCE_SOURCE_ID = "eu-ai-office-governance-enforcement";
export const EU_GPAI_CODE_SOURCE_ID = "eu-gpai-code-practice-2025";
export const FTC_OPERATION_AI_COMPLY_SOURCE_ID = "ftc-operation-ai-comply";
export const US_AI_ACQUISITION_MEMO_SOURCE_ID = "us-ai-acquisition-memo-m-24-18";
export const EU_HIGH_RISK_AI_DATABASE_SOURCE_ID = "eu-high-risk-ai-database";
export const UK_AI_SECURITY_INSTITUTE_SOURCE_ID = "uk-ai-security-institute";
export const JAPAN_AI_SAFETY_INSTITUTE_SOURCE_ID = "japan-ai-safety-institute";

export const ATLAS_SOURCE_LABELS: Record<string, string> = {
  [OXFORD_READINESS_SOURCE_ID]: "Gov AI readiness",
  [CAIDP_DEMOCRATIC_VALUES_SOURCE_ID]: "Democratic values",
  [UNESCO_RAM_SOURCE_ID]: "UNESCO RAM",
  [STANFORD_VIBRANCY_SOURCE_ID]: "AI vibrancy",
  [IMF_AI_PREPAREDNESS_SOURCE_ID]: "AI preparedness",
  [OECD_AI_OBSERVATORY_INDEX_SOURCE_ID]: "OECD.AI index",
  [OECD_AI_POLICY_OBSERVATORY_SOURCE_ID]: "OECD.AI policy",
  [GLOBAL_RESPONSIBLE_AI_SOURCE_ID]: "Responsible AI index",
  [NETHERLANDS_ALGORITHM_REGISTER_SOURCE_ID]: "Public-sector AI registry",
  [INTERNATIONAL_AISI_NETWORK_SOURCE_ID]: "AI safety institute network",
  [EU_AI_FACTORIES_SOURCE_ID]: "EU AI Factories",
  [US_NAIRR_PILOT_SOURCE_ID]: "U.S. NAIRR pilot",
  [UK_AI_PROCUREMENT_GUIDELINES_SOURCE_ID]: "AI procurement",
  [EU_AI_OFFICE_GOVERNANCE_SOURCE_ID]: "EU AI Office",
  [EU_GPAI_CODE_SOURCE_ID]: "GPAI Code of Practice",
  [FTC_OPERATION_AI_COMPLY_SOURCE_ID]: "AI enforcement activity",
  [US_AI_ACQUISITION_MEMO_SOURCE_ID]: "AI acquisition",
  [EU_HIGH_RISK_AI_DATABASE_SOURCE_ID]: "EU AI database",
  [UK_AI_SECURITY_INSTITUTE_SOURCE_ID]: "UK AI Security Institute",
  [JAPAN_AI_SAFETY_INSTITUTE_SOURCE_ID]: "Japan AI Safety Institute",
};

export const READINESS_STATUS_LABELS: Record<ReadinessReportStatus, string> = {
  completed: "Completed",
  in_process: "In process",
  in_preparation: "In preparation",
  profile_available: "Profile available",
};

export interface CountryAtlasSummary {
  iso3: string;
  scores: CountryIndicatorScore[];
  readinessReports: CountryReadinessReport[];
  oxford?: CountryIndicatorScore;
  caidp?: CountryIndicatorScore;
  stanford?: CountryIndicatorScore;
  unescoRam?: CountryReadinessReport;
  hasAnyAtlasData: boolean;
}

export interface AtlasPresetRow {
  iso3: string;
  countryName: string;
  primary: string;
  secondary: string;
}

export interface AtlasMapReason {
  label: string;
  detail: string;
}

export interface AtlasMapContext {
  fills: Record<string, string>;
  reasons: Record<string, AtlasMapReason>;
}

export function getCountryIndicatorScore(iso3: string, sourceId: string): CountryIndicatorScore | undefined {
  return COUNTRY_INDICATOR_SCORE_BY_SOURCE_AND_COUNTRY[`${sourceId}:${iso3}`];
}

export function getCountryAtlasSummary(iso3: string): CountryAtlasSummary {
  const scores = COUNTRY_INDICATOR_SCORES_BY_COUNTRY[iso3] ?? [];
  const readinessReports = COUNTRY_READINESS_REPORTS_BY_COUNTRY[iso3] ?? [];
  const oxford = getCountryIndicatorScore(iso3, OXFORD_READINESS_SOURCE_ID);
  const caidp = getCountryIndicatorScore(iso3, CAIDP_DEMOCRATIC_VALUES_SOURCE_ID);
  const stanford = getCountryIndicatorScore(iso3, STANFORD_VIBRANCY_SOURCE_ID);
  const unescoRam =
    readinessReports.find((report) => report.sourceId === UNESCO_RAM_SOURCE_ID) ?? readinessReports[0];
  return {
    iso3,
    scores,
    readinessReports,
    oxford,
    caidp,
    stanford,
    unescoRam,
    hasAnyAtlasData: scores.length > 0 || readinessReports.length > 0,
  };
}

export function formatAtlasScore(score: CountryIndicatorScore | undefined): string {
  if (!score || score.score === undefined) return "No data";
  const suffix = score.scoreLabel?.includes("/ 12") ? "/12" : "/100";
  return `${formatNumber(score.score)}${suffix}`;
}

export function formatAtlasRank(score: CountryIndicatorScore | undefined): string {
  if (!score?.rank) return "";
  return `Rank ${score.rank}`;
}

export function formatAtlasSource(score: CountryIndicatorScore | undefined): string {
  if (!score) return "";
  const source = INDICATOR_SOURCE_BY_ID[score.sourceId];
  return source ? `${source.publisher} ${score.year}` : String(score.year);
}

export function atlasCaveatForSource(sourceId: string): string {
  return INDICATOR_SOURCE_BY_ID[sourceId]?.caveat ?? "Context indicator only; not legal advice.";
}

export function getAtlasMapFill(iso3: string, mapMode: MapModeId): string | null {
  if (mapMode === "gov-ai-readiness") {
    return sequentialFill(getCountryIndicatorScore(iso3, OXFORD_READINESS_SOURCE_ID)?.score, 100, [
      "#E5E7EB",
      "#DBEAFE",
      "#93C5FD",
      "#2563EB",
      "#1E3A8A",
    ]);
  }
  if (mapMode === "democratic-values") {
    return sequentialFill(getCountryIndicatorScore(iso3, CAIDP_DEMOCRATIC_VALUES_SOURCE_ID)?.score, 12, [
      "#E5E7EB",
      "#FEF3C7",
      "#FDE68A",
      "#059669",
      "#065F46",
    ]);
  }
  if (mapMode === "ai-vibrancy") {
    return sequentialFill(getCountryIndicatorScore(iso3, STANFORD_VIBRANCY_SOURCE_ID)?.score, 100, [
      "#E5E7EB",
      "#EDE9FE",
      "#C4B5FD",
      "#7C3AED",
      "#4C1D95",
    ]);
  }
  if (mapMode === "unesco-ram-status") {
    const status = getCountryAtlasSummary(iso3).unescoRam?.status;
    if (status === "completed") return "#16A34A";
    if (status === "in_process") return "#F59E0B";
    if (status === "in_preparation") return "#93C5FD";
    if (status === "profile_available") return "#A7F3D0";
    return "#E5E7EB";
  }
  return null;
}

export function buildAtlasMapFills(mapMode: MapModeId): Record<string, string> {
  return Object.fromEntries(
    COUNTRIES
      .filter((country) => country.iso3 !== "EUU")
      .map((country) => [country.iso3, getAtlasMapFill(country.iso3, mapMode) ?? "#E5E7EB"])
  );
}

export function buildAtlasMapContext(mapMode: MapModeId): AtlasMapContext {
  const fills: Record<string, string> = {};
  const reasons: Record<string, AtlasMapReason> = {};

  for (const country of COUNTRIES) {
    if (country.iso3 === "EUU") continue;
    fills[country.iso3] = getAtlasMapFill(country.iso3, mapMode) ?? "#E5E7EB";
    reasons[country.iso3] = getAtlasMapReason(country.iso3, mapMode);
  }

  return { fills, reasons };
}

export function getAtlasMapReason(iso3: string, mapMode: MapModeId): AtlasMapReason {
  const countryName = COUNTRY_BY_ISO3[iso3]?.name ?? iso3;
  if (mapMode === "gov-ai-readiness") {
    const score = getCountryIndicatorScore(iso3, OXFORD_READINESS_SOURCE_ID);
    if (!score) return noAtlasReason(countryName, "Oxford readiness score");
    return {
      label: `Oxford readiness: ${formatAtlasScore(score)}`,
      detail: `${formatAtlasRank(score) || "No rank shown"} from ${formatAtlasSource(score)}. Context only; it does not indicate legal effect.`,
    };
  }
  if (mapMode === "democratic-values") {
    const score = getCountryIndicatorScore(iso3, CAIDP_DEMOCRATIC_VALUES_SOURCE_ID);
    if (!score) return noAtlasReason(countryName, "CAIDP democratic-values score");
    return {
      label: `CAIDP score: ${formatAtlasScore(score)}`,
      detail: `${score.tier ? `Tier ${score.tier}. ` : ""}${formatAtlasSource(score)} assessment; not official legal status.`,
    };
  }
  if (mapMode === "ai-vibrancy") {
    const score = getCountryIndicatorScore(iso3, STANFORD_VIBRANCY_SOURCE_ID);
    if (!score) return noAtlasReason(countryName, "Stanford AI vibrancy score");
    return {
      label: `AI vibrancy: ${formatAtlasScore(score)}`,
      detail: `${formatAtlasRank(score) || "No rank shown"} from ${formatAtlasSource(score)}. Ecosystem context only.`,
    };
  }
  if (mapMode === "unesco-ram-status") {
    const report = getCountryAtlasSummary(iso3).unescoRam;
    if (!report) return noAtlasReason(countryName, "UNESCO RAM status");
    return {
      label: `UNESCO RAM: ${READINESS_STATUS_LABELS[report.status]}`,
      detail: report.profileUrl
        ? "UNESCO profile or RAM activity is linked for this country. This is not a comparable numeric score."
        : "UNESCO RAM table activity is tracked for this country. This is not a legal obligation.",
    };
  }
  return {
    label: "Context indicator mode",
    detail: "This Atlas mode is contextual and does not change legal-status summaries.",
  };
}

export function buildAtlasPresetRows(presetId: AtlasPresetId): AtlasPresetRow[] {
  if (presetId === "high-readiness-no-binding") {
    return COUNTRIES
      .filter((country) => country.iso3 !== "EUU")
      .map((country) => ({ country, score: getCountryIndicatorScore(country.iso3, OXFORD_READINESS_SOURCE_ID) }))
      .filter(({ country, score }) => score?.score !== undefined && score.score >= 60 && !getCountryGovernanceSummary(country.iso3).hasBindingNationalLaw)
      .sort((a, b) => (b.score?.score ?? 0) - (a.score?.score ?? 0))
      .slice(0, 8)
      .map(({ country, score }) => ({
        iso3: country.iso3,
        countryName: country.name,
        primary: `Readiness ${formatAtlasScore(score)}`,
        secondary: "No confirmed binding AI-specific law in this snapshot",
      }));
  }
  if (presetId === "ram-activity") {
    return COUNTRY_READINESS_REPORTS
      .filter((report) => report.status === "completed" || report.status === "in_process")
      .slice(0, 12)
      .map((report) => ({
        iso3: report.countryIso3,
        countryName: COUNTRY_BY_ISO3[report.countryIso3]?.name ?? report.countryIso3,
        primary: READINESS_STATUS_LABELS[report.status],
        secondary: report.profileUrl ? "UNESCO country profile linked" : "UNESCO RAM table status",
      }));
  }
  if (presetId === "caidp-oxford-comparison") {
    return COUNTRY_INDICATOR_SCORES
      .filter((score) => score.sourceId === CAIDP_DEMOCRATIC_VALUES_SOURCE_ID)
      .map((caidp) => ({
        caidp,
        oxford: getCountryIndicatorScore(caidp.countryIso3, OXFORD_READINESS_SOURCE_ID),
      }))
      .filter(({ oxford }) => oxford?.score !== undefined)
      .sort((a, b) => (b.caidp.score ?? 0) - (a.caidp.score ?? 0))
      .slice(0, 8)
      .map(({ caidp, oxford }) => ({
        iso3: caidp.countryIso3,
        countryName: COUNTRY_BY_ISO3[caidp.countryIso3]?.name ?? caidp.countryIso3,
        primary: `CAIDP ${formatAtlasScore(caidp)} | ${caidp.tier ? `Tier ${caidp.tier}` : "No tier"}`,
        secondary: `Oxford readiness ${formatAtlasScore(oxford)}`,
      }));
  }
  return COUNTRY_INDICATOR_SCORES
    .filter((score) => score.sourceId === STANFORD_VIBRANCY_SOURCE_ID)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .slice(0, 8)
    .map((score) => {
      const summary = getCountryGovernanceSummary(score.countryIso3);
      return {
        iso3: score.countryIso3,
        countryName: COUNTRY_BY_ISO3[score.countryIso3]?.name ?? score.countryIso3,
        primary: `Vibrancy ${formatAtlasScore(score)} | ${formatAtlasRank(score)}`,
        secondary: summary.hasBindingNationalLaw ? "Confirmed binding AI-specific law tracked" : "No confirmed binding AI-specific law tracked",
      };
    });
}

function sequentialFill(value: number | undefined, max: number, colors: [string, string, string, string, string]) {
  if (value === undefined) return colors[0];
  const normalized = Math.max(0, Math.min(1, value / max));
  if (normalized >= 0.8) return colors[4];
  if (normalized >= 0.6) return colors[3];
  if (normalized >= 0.4) return colors[2];
  return colors[1];
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function noAtlasReason(countryName: string, label: string): AtlasMapReason {
  return {
    label: `No ${label}`,
    detail: `${countryName} has no imported row for this Atlas source in the current static dataset.`,
  };
}
