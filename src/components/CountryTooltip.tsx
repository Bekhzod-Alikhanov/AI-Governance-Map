import type { LensKind, MapModeId } from "../types";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";
import { isConfirmedBindingNationalRegulation } from "../utils/governanceTaxonomy";
import { PARTICIPATION_LABELS } from "../utils/getParticipationLabel";

interface Props {
  iso3: string;
  countryName: string;
  x: number;
  y: number;
  activeFilterInstrumentIds: string[];
  lens: LensKind;
  mapMode: MapModeId;
  contextReason?: {
    label: string;
    detail: string;
  };
}

export function CountryTooltip({
  iso3,
  countryName,
  x,
  y,
  activeFilterInstrumentIds,
  lens,
  mapMode,
  contextReason,
}: Props) {
  const summary = getCountryGovernanceSummary(iso3);
  const nationalCount = summary.nationalRegulations.length;
  const intlCount = summary.participations.length;
  const colorReason = contextReason ?? buildGovernanceColorReason(summary, lens, mapMode);

  const style: React.CSSProperties = {
    left: x + 14,
    top: y + 14,
    maxWidth: 380,
  };

  const filterMatches = activeFilterInstrumentIds
    .map((id) => summary.participations.find(({ instrument }) => instrument.id === id))
    .filter(Boolean);

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 rounded-xl border border-canvas-line bg-white/95 px-3.5 py-3 text-sm shadow-drawer backdrop-blur"
      style={style}
    >
      <p className="text-sm font-semibold text-ink-900">{countryName}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-500">
        {nationalCount} national rule{nationalCount === 1 ? "" : "s"} -{" "}
        {intlCount} international participation{intlCount === 1 ? "" : "s"}
      </p>

      <div className="mt-2.5 rounded-md border border-canvas-line bg-canvas/70 px-2 py-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
          Why this color?
        </p>
        <p className="mt-0.5 text-xs font-medium text-ink-800">{colorReason.label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-600">{colorReason.detail}</p>
      </div>

      {summary.nationalRegulations.length > 0 && (
        <div className="mt-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            National AI rules
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-ink-700">
            {summary.nationalRegulations.slice(0, 5).map((rule) => (
              <li key={rule.id} className="leading-snug">
                {rule.name}
              </li>
            ))}
            {summary.nationalRegulations.length > 5 && (
              <li className="text-ink-500">
                +{summary.nationalRegulations.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}

      {summary.participations.length > 0 && (
        <div className="mt-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            International AI instruments
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-ink-700">
            {summary.participations.slice(0, 6).map(({ participation, instrument }) => (
              <li key={participation.id} className="leading-snug">
                <span className="font-medium">{instrument.name}</span>
                <span className="ml-1 text-ink-500">
                  - {PARTICIPATION_LABELS[participation.participationType]}
                </span>
              </li>
            ))}
            {summary.participations.length > 6 && (
              <li className="text-ink-500">
                +{summary.participations.length - 6} more
              </li>
            )}
          </ul>
        </div>
      )}

      {activeFilterInstrumentIds.length > 0 && (
        <div className="mt-2.5 rounded-md border border-gold/40 bg-gold-soft/50 px-2 py-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gold">
            Active filter
          </p>
          {filterMatches.length === 0 ? (
            <p className="text-xs text-ink-700">No match for selected instrument.</p>
          ) : (
            <ul className="mt-0.5 space-y-0.5 text-xs text-ink-800">
              {filterMatches.map((match) => (
                <li key={match!.participation.id} className="leading-snug">
                  <span className="font-medium">{match!.instrument.name}</span>
                  <span className="ml-1 text-ink-600">
                    - {PARTICIPATION_LABELS[match!.participation.participationType]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {nationalCount === 0 && intlCount === 0 && (
        <p className="mt-2 text-xs text-ink-500">
          No AI-specific data currently included in this dataset.
        </p>
      )}
    </div>
  );
}

type GovernanceSummary = ReturnType<typeof getCountryGovernanceSummary>;

function buildGovernanceColorReason(summary: GovernanceSummary, lens: LensKind, mapMode: MapModeId) {
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

  return {
    label: "Governance context mode",
    detail: "This mode highlights a specific governance layer; open the country drawer for the source-backed records behind it.",
  };
}
