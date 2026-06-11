import { useMemo, useState } from "react";
import clsx from "clsx";
import type { MapModeId } from "../types";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { DATA_DICTIONARY } from "../data/dataDictionary";
import { downloadTextFile } from "../utils/downloadTextFile";
import {
  buildCorpusMapContext,
  corpusKindLabel,
  corpusRoute,
  getCorpusCoverageReport,
  getCorpusDatasetChangelog,
  renderCorpusCsv,
  RESEARCH_CORPUS_RECORDS,
  type ResearchCorpusRecord,
} from "../utils/researchCorpus";
import { DATA_CONFIDENCE_LABELS } from "../utils/getVerificationLabel";
import { SourceLink } from "./SourceLink";
import { CorrectionLink } from "./CorrectionLink";
import { EvidenceDossierButton } from "./EvidenceDossierButton";
import { PolicyBriefButton } from "./PolicyBriefButton";

interface Props {
  onOpenMapMode: (mapMode: MapModeId) => void;
}

const CORPUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "institution", label: "Institutions" },
  { id: "policy_process", label: "Policy windows" },
  { id: "standards_conformity", label: "Standards" },
  { id: "public_sector_ai", label: "Public-sector AI" },
  { id: "enforcement", label: "Enforcement" },
] as const;

const CORPUS_MAP_MODES: Array<{ id: MapModeId; label: string; detail: string }> = [
  { id: "ai-institutions", label: "Institution map", detail: "AI offices, safety institutes, standards bodies, and governance authorities." },
  { id: "policy-windows", label: "Policy windows", detail: "Open or ongoing consultations, guidance processes, and standards work." },
  { id: "public-sector-ai", label: "Public-sector AI", detail: "Registries, public-sector assessments, and procurement/public-use context." },
  { id: "enforcement-activity", label: "Enforcement", detail: "Official enforcement, litigation, or regulator activity records." },
  { id: "standards-conformity", label: "Standards", detail: "Standards and conformity infrastructure context." },
];

export function ResearchCorpusPanel({ onOpenMapMode }: Props) {
  const [kindFilter, setKindFilter] = useState<(typeof CORPUS_FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [showDictionary, setShowDictionary] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESEARCH_CORPUS_RECORDS.filter((record) => {
      if (kindFilter !== "all" && record.kind !== kindFilter) return false;
      if (!q) return true;
      return `${record.title} ${record.jurisdiction} ${record.status} ${record.summary} ${record.caveat}`
        .toLowerCase()
        .includes(q);
    });
  }, [kindFilter, query]);
  const answerCards = useMemo(() => buildCorpusAnswerCards(), []);
  const coverageReport = useMemo(() => getCorpusCoverageReport(), []);
  const datasetChangelog = useMemo(() => getCorpusDatasetChangelog().slice(0, 3), []);

  function exportCsv() {
    downloadTextFile("global-ai-governance-map-research-corpus.csv", renderCorpusCsv(rows), "text/csv;charset=utf-8");
  }

  return (
    <section className="mt-4 rounded-lg border border-canvas-line bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Research Corpus</p>
          <h3 className="mt-0.5 text-sm font-semibold text-ink-900">Find institutions, policy windows, standards, public-sector AI, and enforcement evidence</h3>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-ink-600">
            Corpus rows are official-first evidence and context. They do not change binding-law summaries unless a verified legal record separately supports that effect.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setShowDictionary((value) => !value)}
            className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
            aria-expanded={showDictionary}
          >
            Data dictionary
          </button>
          <button
            type="button"
            onClick={() => setShowCoverage((value) => !value)}
            className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
            aria-expanded={showCoverage}
          >
            Coverage report
          </button>
          <PolicyBriefButton kind="deadline_watch" compact />
          <PolicyBriefButton kind="enforcement_watch" compact />
          <PolicyBriefButton kind="standards_conformity" compact />
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
          >
            Export corpus CSV
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {answerCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-canvas-line bg-canvas/40 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{card.label}</p>
            <p className="mt-1 text-lg font-semibold text-ink-900">{card.value}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-600">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <TrustMetric label="Corpus records" value={coverageReport.totalRecords} detail="Official-first context rows." />
        <TrustMetric
          label="No institution data"
          value={coverageReport.countriesWithNoInstitutionData.length}
          detail="Editorial gaps, not absence claims."
        />
        <TrustMetric label="Stale checks" value={coverageReport.staleVerificationRecords.length} detail="Older than 180 days." />
        <TrustMetric label="Source gaps" value={coverageReport.officialSourceGaps.length} detail="Non-official corpus sources." />
      </div>

      {showDictionary && <DataDictionaryPanel />}
      {showCoverage && <CoverageReportPanel report={coverageReport} />}
      {datasetChangelog.length > 0 && (
        <div className="mt-3 rounded-lg border border-canvas-line bg-canvas/35 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Latest corpus changelog</p>
          <ul className="mt-2 grid gap-2 md:grid-cols-3">
            {datasetChangelog.map((entry) => (
              <li key={entry.id} className="rounded-md bg-white px-2.5 py-2 text-xs">
                <p className="font-semibold text-ink-900">
                  {entry.changeType.replace(/_/g, " ")} - {entry.date}
                </p>
                <p className="mt-1 leading-relaxed text-ink-600">{entry.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 grid gap-2 md:grid-cols-5">
        {CORPUS_MAP_MODES.map((mode) => {
          const context = buildCorpusMapContext(mode.id);
          const highlighted = Object.values(context.fills).filter((fill) => fill !== "#E5E7EB").length;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onOpenMapMode(mode.id)}
              title={mode.detail}
              className="rounded-lg border border-canvas-line bg-canvas/40 px-3 py-2 text-left hover:border-accent hover:bg-accent/5"
            >
              <span className="block text-xs font-semibold text-ink-900">{mode.label}</span>
              <span className="mt-1 block text-[11px] text-ink-600">{highlighted} mapped countries</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-canvas-line">
          {CORPUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setKindFilter(filter.id)}
              className={clsx(
                "whitespace-nowrap px-2.5 py-1 text-[11px] font-medium transition-colors",
                kindFilter === filter.id ? "bg-accent text-white" : "bg-white text-ink-700 hover:bg-canvas"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="min-w-56 flex-1 sm:max-w-xs">
          <span className="sr-only">Filter research corpus rows</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter corpus rows..."
            className="w-full rounded-lg border border-canvas-line bg-white px-3 py-1.5 text-xs text-ink-900 outline-none placeholder:text-ink-400 focus:border-accent"
          />
        </label>
      </div>

      <div className="policy-scroll mt-3 max-h-[32rem] overflow-auto rounded-lg border border-canvas-line">
        <table className="min-w-full border-separate border-spacing-0 text-left text-xs">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_#CBD5E1]">
            <tr>
              <th className="px-3 py-2 font-semibold text-ink-700">Record</th>
              <th className="px-3 py-2 font-semibold text-ink-700">Jurisdiction</th>
              <th className="px-3 py-2 font-semibold text-ink-700">Status</th>
              <th className="px-3 py-2 font-semibold text-ink-700">Confidence</th>
              <th className="px-3 py-2 font-semibold text-ink-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => (
              <CorpusRow key={`${record.routeKind}:${record.id}`} record={record} />
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="px-3 py-4 text-sm text-ink-500">No corpus rows match this filter.</p>}
      </div>
    </section>
  );
}

function TrustMetric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-lg border border-canvas-line bg-canvas/35 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink-900">{value}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-600">{detail}</p>
    </div>
  );
}

function DataDictionaryPanel() {
  return (
    <div className="mt-3 rounded-lg border border-canvas-line bg-canvas/35 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Data dictionary</p>
          <h4 className="mt-0.5 text-sm font-semibold text-ink-900">{DATA_DICTIONARY.title}</h4>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-ink-600">
            {DATA_DICTIONARY.legalSeparationInvariant}
          </p>
        </div>
        <a
          href="/data/data-dictionary.json"
          className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
        >
          JSON
        </a>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-2">
        {DATA_DICTIONARY.collections.map((collection) => (
          <article key={collection.id} className="rounded-lg border border-canvas-line bg-white p-3 text-xs">
            <p className="font-semibold text-ink-900">{collection.label}</p>
            <p className="mt-1 leading-relaxed text-ink-600">{collection.purpose}</p>
            <p className="mt-2 rounded-md bg-canvas/60 px-2 py-1.5 text-[11px] leading-relaxed text-ink-600">
              {collection.legalEffectCaveat}
            </p>
            <dl className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {collection.fields.slice(0, 6).map((field) => (
                <div key={field.name} className="rounded-md border border-canvas-line px-2 py-1.5">
                  <dt className="font-medium text-ink-900">{field.name}</dt>
                  <dd className="mt-0.5 text-[11px] text-ink-600">
                    {field.type}
                    {field.required ? " - required" : " - optional"}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-canvas-line bg-white p-3">
        <p className="text-xs font-semibold text-ink-900">Confidence ladder</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {DATA_DICTIONARY.confidenceLadder.map((entry) => (
            <div key={entry.id} className="rounded-md bg-canvas/50 px-2.5 py-2 text-xs">
              <p className="font-semibold text-ink-900">{entry.label}</p>
              <p className="mt-1 leading-relaxed text-ink-600">{entry.definition}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-500">
                {entry.mapEffect.replace(/_/g, " ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoverageReportPanel({ report }: { report: ReturnType<typeof getCorpusCoverageReport> }) {
  const missingCountries = report.countriesWithNoInstitutionData.slice(0, 16);
  return (
    <div className="mt-3 rounded-lg border border-canvas-line bg-canvas/35 p-3 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Corpus coverage report</p>
          <h4 className="mt-0.5 text-sm font-semibold text-ink-900">Editorial gaps and source-health checks</h4>
          <p className="mt-1 max-w-4xl leading-relaxed text-ink-600">{report.caveat}</p>
        </div>
        <a
          href="/data/corpus-coverage-report.json"
          className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
        >
          JSON
        </a>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-lg border border-canvas-line bg-white p-3">
          <p className="font-semibold text-ink-900">Records by kind</p>
          <dl className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {Object.entries(report.recordsByKind).map(([kind, count]) => (
              <div key={kind} className="flex items-center justify-between rounded-md bg-canvas/50 px-2 py-1.5">
                <dt className="text-ink-600">{corpusKindLabel(kind as Parameters<typeof corpusKindLabel>[0])}</dt>
                <dd className="font-semibold text-ink-900">{count}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-lg border border-canvas-line bg-white p-3">
          <p className="font-semibold text-ink-900">Institution coverage gaps</p>
          <p className="mt-1 leading-relaxed text-ink-600">
            {report.countriesWithNoInstitutionData.length} countries do not yet have a mapped institution row.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-600">
            Sample:{" "}
            {missingCountries
              .map((iso3) => COUNTRY_BY_ISO3[iso3]?.name ?? iso3)
              .join(", ")}
            {report.countriesWithNoInstitutionData.length > missingCountries.length ? ", ..." : ""}
          </p>
        </div>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <CoverageList title="Missing open deadlines" rows={report.recordsMissingDeadlines} />
        <CoverageList title="Stale verification" rows={report.staleVerificationRecords} />
        <CoverageList title="Official-source gaps" rows={report.officialSourceGaps} />
      </div>
    </div>
  );
}

function CoverageList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-lg border border-canvas-line bg-white p-3">
      <p className="font-semibold text-ink-900">{title}</p>
      {rows.length ? (
        <ul className="mt-2 space-y-1 text-[11px] text-ink-600">
          {rows.slice(0, 6).map((row) => (
            <li key={row} className="rounded-md bg-canvas/50 px-2 py-1">
              {row}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-[11px] text-emerald-800">No current rows.</p>
      )}
    </div>
  );
}

function CorpusRow({ record }: { record: ResearchCorpusRecord }) {
  const brief = briefForRecord(record);
  return (
    <tr className="odd:bg-white even:bg-canvas/50">
      <td className="max-w-lg border-b border-canvas-line px-3 py-2 align-top">
        <p className="font-semibold text-ink-900">{record.title}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-500">{corpusKindLabel(record.kind)}</p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-600">{record.summary}</p>
      </td>
      <td className="border-b border-canvas-line px-3 py-2 align-top text-ink-700">{record.jurisdiction}</td>
      <td className="border-b border-canvas-line px-3 py-2 align-top text-ink-700">{record.status}</td>
      <td className="border-b border-canvas-line px-3 py-2 align-top text-ink-700">
        {record.metadata.confidence ? DATA_CONFIDENCE_LABELS[record.metadata.confidence] : ""}
      </td>
      <td className="border-b border-canvas-line px-3 py-2 align-top">
        <div className="flex min-w-56 flex-wrap gap-1.5">
          <a className={smallButtonClass} href={corpusRoute(record)}>
            URL
          </a>
          <EvidenceDossierButton kind={record.routeKind} id={record.id} compact />
          <PolicyBriefButton {...brief} compact />
          <SourceLink name={record.sourceName} url={record.sourceUrl} />
          <CorrectionLink
            recordKind={record.kind}
            recordId={record.id}
            recordName={record.title}
            sourceUrl={record.sourceUrl}
            claim={record.summary}
            compact
          />
        </div>
      </td>
    </tr>
  );
}

function briefForRecord(record: ResearchCorpusRecord): {
  kind: "institution" | "deadline_watch" | "enforcement_watch" | "standards_conformity" | "country";
  id?: string;
} {
  if (record.kind === "institution") return { kind: "institution", id: record.id };
  if (record.kind === "standards_conformity") return { kind: "standards_conformity", id: record.id };
  if (record.kind === "enforcement") return { kind: "enforcement_watch" };
  if (record.kind === "policy_process") return { kind: "deadline_watch" };
  return record.countryIso3 ? { kind: "country", id: record.countryIso3 } : { kind: "deadline_watch" };
}

function buildCorpusAnswerCards() {
  const openProcesses = RESEARCH_CORPUS_RECORDS.filter(
    (record) => record.kind === "policy_process" && record.raw.status === "open"
  );
  const upcomingDeadlines = RESEARCH_CORPUS_RECORDS.filter(
    (record) => record.kind === "policy_process" && "deadline" in record.raw && Boolean(record.raw.deadline)
  );
  const aiInstitutions = RESEARCH_CORPUS_RECORDS.filter((record) => record.kind === "institution");
  const safetyInstitutes = RESEARCH_CORPUS_RECORDS.filter(
    (record) => record.kind === "institution" && "institutionType" in record.raw && record.raw.institutionType === "ai_safety_institute"
  );
  const registries = RESEARCH_CORPUS_RECORDS.filter((record) => record.kind === "public_sector_ai");
  const enforcement = RESEARCH_CORPUS_RECORDS.filter((record) => record.kind === "enforcement");
  return [
    { label: "Open consultations", value: String(openProcesses.length), detail: "Official open policy windows in the corpus." },
    { label: "Upcoming deadlines", value: String(upcomingDeadlines.length), detail: "Rows with explicit deadline metadata." },
    { label: "Institutions", value: String(aiInstitutions.length), detail: "AI offices, safety institutes, treaty bodies, and authorities." },
    { label: "Safety institutes", value: String(safetyInstitutes.length), detail: "Technical evaluation or AI safety bodies." },
    { label: "Public-sector AI", value: String(registries.length), detail: "Registries, AIA tools, and public-use context." },
    { label: "Enforcement records", value: String(enforcement.length), detail: "Official enforcement/litigation context rows." },
  ];
}

const smallButtonClass =
  "inline-flex items-center rounded-md border border-canvas-line bg-white px-2 py-0.5 text-[11px] font-medium text-ink-600 hover:border-accent hover:text-accent";
