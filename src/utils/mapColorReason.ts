import type { LensKind, MapModeId } from "../types";
import type { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";
import { isConfirmedBindingNationalRegulation } from "./governanceTaxonomy";

type GovernanceSummary = ReturnType<typeof getCountryGovernanceSummary>;

export interface MapColorReason {
  label: string;
  detail: string;
}

export function buildGovernanceColorReason(
  summary: GovernanceSummary,
  lens: LensKind,
  mapMode: MapModeId
): MapColorReason {
  if (!summary.country) {
    return {
      label: "No mapped country record",
      detail: "This geography does not resolve to a country record in the current dataset.",
    };
  }

  if (mapMode === "binding-law") {
    const bindingRules = summary.nationalRegulations.filter(isConfirmedBindingNationalRegulation);
    if (bindingRules.length > 0) {
      return {
        label: "Confirmed binding AI-specific law applies",
        detail: bindingRules.slice(0, 2).map((rule) => rule.name).join("; "),
      };
    }
    if (summary.hasAnyAIRule) {
      return {
        label: "AI rule context, but no confirmed binding law",
        detail: "The country has proposed, guidance, strategy, subnational, or other non-binding AI entries in this snapshot.",
      };
    }
    return {
      label: lens === "layer" ? "No layer color trigger" : "No confirmed binding AI law",
      detail: "No confirmed binding AI-specific national law is counted for map coloring in this snapshot.",
    };
  }

  if (mapMode === "proposed-law") {
    const proposed = summary.nationalRegulations.filter((rule) => rule.status === "proposed");
    return proposed.length > 0
      ? {
          label: `${proposed.length} proposed AI rule${proposed.length === 1 ? "" : "s"}`,
          detail: proposed.slice(0, 2).map((rule) => rule.name).join("; "),
        }
      : {
          label: "No proposed AI law tracked",
          detail: "This color mode highlights proposed national AI laws only.",
        };
  }

  if (mapMode === "treaty-participation") {
    return summary.participations.length > 0
      ? {
          label: `${summary.participations.length} international participation row${summary.participations.length === 1 ? "" : "s"}`,
          detail: "Participation rows distinguish signature, ratification, endorsement, applicability, and membership coverage in details.",
        }
      : {
          label: "No international participation row",
          detail: "No mapped treaty, summit, standard, or organization participation row is tracked for this country.",
        };
  }

  if (mapMode === "lab-hq") {
    return summary.hqLabs.length > 0
      ? {
          label: `${summary.hqLabs.length} frontier-lab HQ${summary.hqLabs.length === 1 ? "" : "s"}`,
          detail: summary.hqLabs.map((lab) => lab.name).join("; "),
        }
      : {
          label: "No frontier-lab HQ tracked",
          detail: "Lab HQ coloring does not imply full regulatory control over all lab activity.",
        };
  }

  if (mapMode === "source-confidence") {
    const confidence = summary.nationalRegulations.some((rule) => rule.confidence === "low")
      ? "Contains lower-confidence legal/source records"
      : summary.nationalRegulations.length > 0 || summary.participations.length > 0
        ? "Tracked records are medium/high confidence"
        : "No source-confidence signal";
    return {
      label: confidence,
      detail: "Source-confidence mode is about verification metadata, not the legal strength of an instrument.",
    };
  }

  if (mapMode === "frontier-relevance") {
    return summary.hasFrontierAIRelevant
      ? {
          label: "Frontier-relevant governance context",
          detail: "This country has a frontier-relevant rule, instrument participation, lab HQ, or dependency edge in the dataset.",
        }
      : {
          label: "No frontier-relevant signal",
          detail: "No frontier-relevant dataset hook is currently mapped for this country.",
        };
  }

  if (mapMode === "obligation-type") {
    return {
      label: "Obligation-mode context",
      detail: "This mode highlights structured obligation rows such as risk assessment, transparency, incident reporting, and evaluation.",
    };
  }

  if (mapMode === "implementation-deadline") {
    return {
      label: "Implementation timeline context",
      detail: "This mode highlights records with phased application, regulator appointments, guidance, or other implementation milestones.",
    };
  }

  return {
    label: "Context indicator mode",
    detail: "This mode uses contextual indicator data and does not change legal-status, obligation, or binding-law rollups.",
  };
}
