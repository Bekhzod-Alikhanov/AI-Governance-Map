import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  buildLabBoardRows,
  getLabIntelligenceSummary,
  renderLabBoardCsv,
  type LabBoardRow,
} from "../utils/labIntelligence";
import { downloadTextFile } from "../utils/downloadTextFile";
import { SourceLink } from "./SourceLink";
import { VerificationMeta } from "./VerificationMeta";

interface Props {
  onSelectLab: (labId: string) => void;
}

const FILTERS = ["all", "binding", "frameworks", "evaluations", "compute"] as const;
type LabBoardFilter = (typeof FILTERS)[number];

export function LabIntelligenceBoard({ onSelectLab }: Props) {
  const [selectedLabId, setSelectedLabId] = useState("openai");
  const [filter, setFilter] = useState<LabBoardFilter>("all");
  const rows = useMemo(() => buildLabBoardRows(), []);
  const visibleRows = useMemo(() => rows.filter((row) => rowMatchesFilter(row, filter)), [rows, filter]);
  const selectedSummary = getLabIntelligenceSummary(selectedLabId);

  function exportCsv() {
    downloadTextFile("global-ai-governance-map-lab-intelligence.csv", renderLabBoardCsv(visibleRows), "text/csv;charset=utf-8");
  }

  return (
    <section className="mt-4 rounded-lg border border-canvas-line bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Frontier lab intelligence board</h3>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-ink-600">
            Lab-facing matrix for safety frameworks, evaluation evidence, compute dependencies, and regulatory exposure.
            Context rows do not change binding-law coloring.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-canvas-line">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={clsx(
                  "px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                  filter === item ? "bg-accent text-white" : "bg-white text-ink-700 hover:bg-canvas"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-md border border-canvas-line bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:border-accent hover:text-accent"
          >
            Export Lab Board CSV
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="policy-scroll overflow-x-auto rounded-lg border border-canvas-line">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-canvas/70 text-[11px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-2.5 py-2">Lab</th>
                <th className="px-2.5 py-2">Safety framework</th>
                <th className="px-2.5 py-2 text-right">Binding</th>
                <th className="px-2.5 py-2 text-right">Conditional</th>
                <th className="px-2.5 py-2 text-right">Evidence</th>
                <th className="px-2.5 py-2 text-right">Eval</th>
                <th className="px-2.5 py-2 text-right">Compute</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row.labId}
                  className={clsx(
                    "border-t border-canvas-line",
                    row.labId === selectedLabId ? "bg-accent/5" : "bg-white"
                  )}
                >
                  <td className="px-2.5 py-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLabId(row.labId)}
                      className="font-semibold text-ink-900 hover:text-accent"
                    >
                      {row.labName}
                    </button>
                    <p className="mt-0.5 text-[11px] text-ink-500">{row.hq}</p>
                  </td>
                  <td className="max-w-xs px-2.5 py-2 text-ink-700">{row.safetyFramework}</td>
                  <td className="px-2.5 py-2 text-right font-semibold text-ink-900">{row.bindingExposure}</td>
                  <td className="px-2.5 py-2 text-right">{row.conditionalExposure}</td>
                  <td className="px-2.5 py-2 text-right">{row.modelGovernanceEvidence}</td>
                  <td className="px-2.5 py-2 text-right">{row.safetyEvaluations}</td>
                  <td className="px-2.5 py-2 text-right">{row.computeDependencies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="rounded-lg border border-canvas-line bg-canvas/40 p-3 text-xs">
          {selectedSummary && (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Exposure brief
                  </p>
                  <h4 className="mt-0.5 text-base font-semibold text-ink-900">{selectedSummary.labName}</h4>
                  <p className="mt-1 leading-relaxed text-ink-600">
                    {selectedSummary.profile?.summary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectLab(selectedSummary.labId)}
                  className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-semibold text-ink-700 hover:border-accent hover:text-accent"
                >
                  Open lab drawer
                </button>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2">
                <Metric label="Binding" value={selectedSummary.exposureCounts.binding} />
                <Metric label="Conditional" value={selectedSummary.exposureCounts.conditional} />
                <Metric label="Voluntary" value={selectedSummary.exposureCounts.voluntary} />
                <Metric label="Infrastructure" value={selectedSummary.exposureCounts.infrastructure} />
              </dl>

              <div className="mt-3 space-y-3">
                <EvidenceGroup
                  title="Model governance evidence"
                  empty="No model-governance evidence rows."
                  rows={selectedSummary.modelGovernanceEvidence.map((row) => ({
                    id: row.id,
                    title: row.title,
                    detail: row.summary,
                    sourceName: row.sourceName,
                    sourceUrl: row.sourceUrl,
                  }))}
                />
                <EvidenceGroup
                  title="Safety and evaluation evidence"
                  empty="No lab-specific public evaluation rows."
                  rows={selectedSummary.safetyEvaluationRecords.map((row) => ({
                    id: row.id,
                    title: row.evaluationBody,
                    detail: row.summary,
                    sourceName: row.sourceName,
                    sourceUrl: row.sourceUrl,
                  }))}
                />
                <EvidenceGroup
                  title="Compute dependencies"
                  empty="No compute-dependency context rows."
                  rows={selectedSummary.computeDependencyRecords.map((row) => ({
                    id: row.id,
                    title: row.dependencyType.replace(/_/g, " "),
                    detail: row.summary,
                    sourceName: row.sourceName,
                    sourceUrl: row.sourceUrl,
                  }))}
                />
              </div>

              {selectedSummary.profile && (
                <div className="mt-3 rounded-md bg-white p-2">
                  <VerificationMeta item={selectedSummary.profile} compact />
                  <p className="mt-2 text-[11px] leading-relaxed text-ink-600">{selectedSummary.profile.caveat}</p>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white px-2 py-1.5">
      <dt className="text-[10px] uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

function EvidenceGroup({
  title,
  rows,
  empty,
}: {
  title: string;
  empty: string;
  rows: Array<{ id: string; title: string; detail: string; sourceName: string; sourceUrl: string }>;
}) {
  return (
    <div>
      <p className="font-semibold text-ink-900">{title}</p>
      <div className="mt-1 space-y-1.5">
        {rows.length ? (
          rows.slice(0, 3).map((row) => (
            <div key={row.id} className="rounded-md bg-white px-2 py-1.5">
              <p className="font-medium text-ink-900">{row.title}</p>
              <p className="mt-0.5 leading-relaxed text-ink-600">{row.detail}</p>
              <div className="mt-1">
                <SourceLink name={row.sourceName} url={row.sourceUrl} />
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-md bg-white px-2 py-1.5 text-ink-500">{empty}</p>
        )}
      </div>
    </div>
  );
}

function rowMatchesFilter(row: LabBoardRow, filter: LabBoardFilter): boolean {
  if (filter === "binding") return row.bindingExposure > 0;
  if (filter === "frameworks") return row.modelGovernanceEvidence > 0 || row.commitments > 0;
  if (filter === "evaluations") return row.safetyEvaluations > 0;
  if (filter === "compute") return row.computeDependencies > 0;
  return true;
}
