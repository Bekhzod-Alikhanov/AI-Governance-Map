import { COUNTRY_BY_ISO3 } from "../data/countries";
import { COUNTRY_INDICATOR_SCORE_BY_ID, INDICATOR_SOURCE_BY_ID } from "../data/aiAtlas";
import { LAB_BY_ID } from "../data/frontierLabs";
import { OBLIGATION_BY_ID, OBLIGATION_CATEGORY_LABELS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES, IMPLEMENTATION_STATUS_LABELS } from "../data/implementationMilestones";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import type { EmbedRoute } from "../utils/embedRoutes";
import { DATA_SNAPSHOT_DATE } from "../utils/governanceTaxonomy";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";
import { getLabExposureTarget, getLabRegulatoryExposures, LAB_EXPOSURE_EFFECT_LABELS } from "../utils/labExposure";
import { recordRoute } from "../utils/recordRoutes";

interface Props {
  route: EmbedRoute;
}

interface EmbedCard {
  title: string;
  subtitle: string;
  summary: string;
  metrics: Array<[string, string]>;
  sourceUrl?: string;
  canonicalUrl: string;
}

export function EmbedView({ route }: Props) {
  const card = buildEmbedCard(route);

  return (
    <main className="min-h-screen bg-canvas-surface p-3 text-ink-900">
      <article className="mx-auto max-w-xl rounded-xl border border-canvas-line bg-white p-4 shadow-panel">
        {!card ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">AI Governance Map</p>
            <h1 className="mt-1 text-lg font-semibold">Embed record not found</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              This embed URL does not match a record in the current static dataset.
            </p>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              AI Governance Map embed - snapshot {DATA_SNAPSHOT_DATE}
            </p>
            <h1 className="mt-1 text-lg font-semibold leading-tight">{card.title}</h1>
            <p className="mt-1 text-xs font-medium text-ink-500">{card.subtitle}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{card.summary}</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {card.metrics.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-canvas-line bg-canvas/60 px-3 py-2">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[11px] leading-relaxed text-ink-600">
              Research aid only. This card is not legal advice; verify time-sensitive legal status against official sources.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <a className={embedLinkClass} href={card.canonicalUrl} target="_blank" rel="noopener noreferrer">
                Open full record
              </a>
              {card.sourceUrl && (
                <a className={embedLinkClass} href={card.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Source
                </a>
              )}
            </div>
          </>
        )}
      </article>
    </main>
  );
}

function buildEmbedCard(route: EmbedRoute): EmbedCard | null {
  if (route.kind === "country") {
    const country = COUNTRY_BY_ISO3[route.id];
    if (!country) return null;
    const summary = getCountryGovernanceSummary(route.id);
    return {
      title: country.name,
      subtitle: `${country.region} - ${country.iso3}`,
      summary: `${summary.nationalRegulations.length} national entries, ${summary.participations.length} international participation rows, and ${summary.hqLabs.length} frontier-lab HQ rows are tracked.`,
      metrics: [
        ["Binding law", summary.hasBindingNationalLaw ? "Yes" : "None confirmed"],
        ["Obligations", String(summary.nationalRegulations.length)],
      ],
      canonicalUrl: recordRoute("country", country.iso3),
    };
  }

  if (route.kind === "lab") {
    const lab = LAB_BY_ID[route.id];
    if (!lab) return null;
    const exposures = getLabRegulatoryExposures(lab.id);
    return {
      title: lab.name,
      subtitle: `Frontier lab - HQ ${lab.hqCountryName}`,
      summary: lab.summary,
      metrics: [
        ["Exposure rows", String(exposures.length)],
        ["Binding rows", String(exposures.filter((row) => row.legalEffect === "binding").length)],
      ],
      sourceUrl: lab.sourceUrl,
      canonicalUrl: recordRoute("lab", lab.id),
    };
  }

  if (route.kind === "instrument") {
    const instrument = INSTRUMENT_BY_ID[route.id];
    if (!instrument) return null;
    return {
      title: instrument.name,
      subtitle: `${instrument.organizationType} - ${instrument.bindingStatus.replace(/_/g, " ")}`,
      summary: instrument.summary,
      metrics: [
        ["Date", instrument.date],
        ["Type", instrument.instrumentType.replace(/_/g, " ")],
      ],
      sourceUrl: instrument.sourceUrl,
      canonicalUrl: recordRoute("instrument", instrument.id),
    };
  }

  if (route.kind === "obligation") {
    const obligation = OBLIGATION_BY_ID[route.id];
    if (!obligation) return null;
    return {
      title: OBLIGATION_CATEGORY_LABELS[obligation.category],
      subtitle: `${obligation.legalEffect} - ${obligation.directness}`,
      summary: obligation.summary,
      metrics: [
        ["Jurisdiction", obligation.jurisdiction ?? "Contextual"],
        ["Confidence", obligation.confidence ?? ""],
      ],
      sourceUrl: obligation.sourceUrl,
      canonicalUrl: recordRoute("obligation", obligation.id),
    };
  }

  if (route.kind === "exposure") {
    const exposure = LAB_REGULATORY_EXPOSURES.find((row) => row.id === route.id);
    if (!exposure) return null;
    const lab = LAB_BY_ID[exposure.labId];
    const target = getLabExposureTarget(exposure);
    return {
      title: `${lab?.name ?? exposure.labId} - ${target.name}`,
      subtitle: `${LAB_EXPOSURE_EFFECT_LABELS[exposure.legalEffect]} - ${exposure.directness}`,
      summary: exposure.rationale,
      metrics: [
        ["Strength", `${exposure.strength}/5`],
        ["Confidence", exposure.confidence ?? ""],
      ],
      sourceUrl: exposure.sourceUrl,
      canonicalUrl: recordRoute("exposure", exposure.id),
    };
  }

  if (route.kind === "implementation") {
    const milestone = IMPLEMENTATION_MILESTONES.find((row) => row.id === route.id);
    if (!milestone) return null;
    return {
      title: milestone.label,
      subtitle: `${milestone.jurisdiction} - ${IMPLEMENTATION_STATUS_LABELS[milestone.status]}`,
      summary: milestone.summary,
      metrics: [
        ["Date", milestone.date ?? ""],
        ["Next deadline", milestone.nextDeadline ?? "None tracked"],
      ],
      sourceUrl: milestone.sourceUrl,
      canonicalUrl: `/embed/implementation/${encodeURIComponent(milestone.id)}`,
    };
  }

  const score = COUNTRY_INDICATOR_SCORE_BY_ID[route.id];
  if (!score) return null;
  const source = INDICATOR_SOURCE_BY_ID[score.sourceId];
  const country = COUNTRY_BY_ISO3[score.countryIso3];
  return {
    title: country?.name ?? score.countryIso3,
    subtitle: source?.name ?? score.sourceName,
    summary: score.notes ?? source?.caveat ?? "Context indicator only.",
    metrics: [
      ["Score", score.score !== undefined ? String(score.score) : "No numeric score"],
      ["Rank", score.rank ? String(score.rank) : score.tier ?? ""],
    ],
    sourceUrl: score.sourceUrl,
    canonicalUrl: recordRoute("country", score.countryIso3),
  };
}

const embedLinkClass =
  "inline-flex rounded-md border border-canvas-line bg-white px-2.5 py-1 font-semibold text-ink-700 hover:border-accent hover:text-accent";
