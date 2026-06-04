import { INDICATOR_SOURCE_BY_ID } from "../data/aiAtlas";
import type { CountryIndicatorScore, CountryReadinessReport, VerificationMetadata } from "../types";
import {
  CAIDP_DEMOCRATIC_VALUES_SOURCE_ID,
  formatAtlasRank,
  formatAtlasScore,
  formatAtlasSource,
  getCountryAtlasSummary,
  OXFORD_READINESS_SOURCE_ID,
  READINESS_STATUS_LABELS,
  STANFORD_VIBRANCY_SOURCE_ID,
} from "../utils/aiAtlas";
import { SourceLink } from "./SourceLink";
import { VerificationMeta } from "./VerificationMeta";

interface Props {
  iso3: string;
}

export function AIAtlasSection({ iso3 }: Props) {
  const atlas = getCountryAtlasSummary(iso3);
  if (!atlas.hasAnyAtlasData) return null;

  const cards = [
    atlas.oxford &&
      scoreCard("Gov AI readiness", atlas.oxford, {
        detail: formatRankAndSource(atlas.oxford),
        caveat: INDICATOR_SOURCE_BY_ID[OXFORD_READINESS_SOURCE_ID]?.caveat,
      }),
    atlas.caidp &&
      scoreCard("Democratic values", atlas.caidp, {
        detail: `${atlas.caidp.tier ? `Tier ${atlas.caidp.tier}` : "No tier"} | ${formatAtlasSource(atlas.caidp)}`,
        caveat: INDICATOR_SOURCE_BY_ID[CAIDP_DEMOCRATIC_VALUES_SOURCE_ID]?.caveat,
      }),
    atlas.stanford &&
      scoreCard("AI vibrancy", atlas.stanford, {
        detail: formatRankAndSource(atlas.stanford),
        caveat: INDICATOR_SOURCE_BY_ID[STANFORD_VIBRANCY_SOURCE_ID]?.caveat,
      }),
    atlas.unescoRam && readinessCard(atlas.unescoRam),
  ].filter(Boolean);

  return (
    <section className="mt-4 rounded-xl border border-canvas-line bg-white p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        AI Atlas context
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-ink-600">
        Readiness, democratic-values, RAM, and ecosystem indicators are context only. They do not change legal-status coloring or confirm binding AI duties.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {cards.map((card) => card)}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-canvas-line">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-canvas/70 text-ink-500">
            <tr>
              <th className="px-2 py-1.5 font-semibold">Source</th>
              <th className="px-2 py-1.5 font-semibold">Score / status</th>
              <th className="px-2 py-1.5 font-semibold">Rank / tier</th>
              <th className="px-2 py-1.5 font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-line bg-white">
            {atlas.scores.map((score) => (
              <tr key={score.id}>
                <td className="px-2 py-1.5 font-medium text-ink-900">
                  {INDICATOR_SOURCE_BY_ID[score.sourceId]?.name ?? score.sourceName}
                </td>
                <td className="px-2 py-1.5 text-ink-700">{formatAtlasScore(score)}</td>
                <td className="px-2 py-1.5 text-ink-700">
                  {[formatAtlasRank(score), score.tier ? `Tier ${score.tier}` : ""].filter(Boolean).join(" | ") || "n/a"}
                </td>
                <td className="px-2 py-1.5 text-ink-600">
                  {summarizeIndicatorDetail(score.pillars ?? score.dimensions)}
                </td>
              </tr>
            ))}
            {atlas.readinessReports.map((report) => (
              <tr key={report.id}>
                <td className="px-2 py-1.5 font-medium text-ink-900">
                  {INDICATOR_SOURCE_BY_ID[report.sourceId]?.name ?? report.sourceName}
                </td>
                <td className="px-2 py-1.5 text-ink-700">{READINESS_STATUS_LABELS[report.status]}</td>
                <td className="px-2 py-1.5 text-ink-700">n/a</td>
                <td className="px-2 py-1.5 text-ink-600">
                  {report.profileUrl ? "Country profile linked" : "RAM table status"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function scoreCard(
  label: string,
  score: CountryIndicatorScore,
  options: { detail: string; caveat?: string }
) {
  return (
    <div key={score.id} className="rounded-lg border border-canvas-line bg-canvas/50 p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink-900">{formatAtlasScore(score)}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-600">{options.detail}</p>
      {options.caveat && <p className="mt-1 text-[11px] leading-relaxed text-ink-600">{options.caveat}</p>}
      <div className="mt-2 space-y-1.5">
        <SourceLink name={score.sourceName} url={score.sourceUrl} />
        <VerificationMeta item={score} compact />
      </div>
    </div>
  );
}

function readinessCard(report: CountryReadinessReport) {
  return (
    <div key={report.id} className="rounded-lg border border-canvas-line bg-canvas/50 p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">UNESCO RAM</p>
      <p className="mt-1 text-lg font-semibold text-ink-900">{READINESS_STATUS_LABELS[report.status]}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-600">{report.caveat}</p>
      {report.profileUrl && (
        <a
          href={report.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex text-xs font-medium text-accent underline-offset-2 hover:underline"
        >
          UNESCO country profile
        </a>
      )}
      <div className="mt-2 space-y-1.5">
        <SourceLink name={report.sourceName} url={report.sourceUrl} />
        <VerificationMeta item={report as VerificationMetadata} compact />
      </div>
    </div>
  );
}

function formatRankAndSource(score: CountryIndicatorScore) {
  return [formatAtlasRank(score), formatAtlasSource(score)].filter(Boolean).join(" | ");
}

function summarizeIndicatorDetail(detail: Record<string, number | string> | undefined) {
  if (!detail) return "No dimension detail";
  return Object.entries(detail)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");
}
