import { useState } from "react";
import { getLabSummary } from "../utils/getLabSummary";
import { SourceLink } from "./SourceLink";
import { ConnectionsSection } from "./ConnectionsSection";
import { useDialogFocus } from "../utils/useDialogFocus";
import { VerificationMeta } from "./VerificationMeta";
import { CorrectionLink } from "./CorrectionLink";
import { CopyTextButton } from "./CopyTextButton";
import { PinCompareButton } from "./PinCompareButton";
import { EvidenceDossierButton } from "./EvidenceDossierButton";
import { buildRecordCitation } from "../utils/citation";
import { getLabObligations, summarizeObligationCategories } from "../utils/researchWorkbench";
import {
  getLabExposureTarget,
  LAB_EXPOSURE_DIRECTNESS_LABELS,
  LAB_EXPOSURE_EFFECT_LABELS,
  LAB_EXPOSURE_KIND_LABELS,
  LAB_EXPOSURE_TARGET_TYPE_LABELS,
} from "../utils/labExposure";
import type { LabExposureLegalEffect, LabRegulatoryExposure } from "../types";

interface Props {
  labId: string;
  onClose: () => void;
  onPinLab: () => void;
  isLabPinned: boolean;
}

export function LabSidePanel({ labId, onClose, onPinLab, isLabPinned }: Props) {
  const { lab, regulatoryExposure, exposureSummary } = getLabSummary(labId);
  const dialogRef = useDialogFocus<HTMLElement>(onClose);
  const [exposureFilter, setExposureFilter] = useState<ExposureFilter>("all");

  const visibleExposure = filterExposure(regulatoryExposure, exposureFilter);
  const groupedExposure = groupExposureByEffect(visibleExposure);
  const obligations = getLabObligations(labId);

  if (!lab) return null;

  return (
    <aside
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${lab.name} frontier-lab details`}
      tabIndex={-1}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-canvas-line bg-white shadow-drawer"
    >
      <header className="flex items-start gap-3 border-b border-canvas-line px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Frontier lab · HQ: {lab.hqCountryName}
            {lab.isFMFMember && " · Frontier Model Forum member"}
          </p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-ink-900">{lab.name}</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            Power score {lab.powerScore}/5
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PinCompareButton pinned={isLabPinned} onToggle={onPinLab} />
            <EvidenceDossierButton kind="lab" id={lab.id} />
            <CopyTextButton
              text={buildRecordCitation({
                ...lab,
                recordKind: "frontier lab",
                recordId: lab.id,
                recordName: lab.name,
                sourceName: lab.sourceName,
                sourceUrl: lab.sourceUrl,
                claim: lab.summary,
              })}
            />
            <CorrectionLink
              recordKind="frontier_lab"
              recordId={lab.id}
              recordName={lab.name}
              sourceUrl={lab.sourceUrl}
              claim={lab.summary}
              compact
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lab panel"
          className="rounded-md p-1.5 text-ink-500 hover:bg-canvas"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      <div className="policy-scroll flex-1 overflow-y-auto px-5 py-5">
        <p className="text-sm leading-relaxed text-ink-700">{lab.summary}</p>
        <div className="mt-3">
          <VerificationMeta item={lab} />
        </div>

        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Flagship frontier models
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {lab.flagshipModels.map((m) => (
              <li
                key={m}
                className="rounded-md border border-canvas-line bg-canvas px-2 py-0.5 text-xs text-ink-700"
              >
                {m}
              </li>
            ))}
          </ul>
        </section>

        {lab.safetyFramework && (
          <section className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Internal safety framework
            </h3>
            <div className="rounded-lg border border-canvas-line bg-white px-3 py-2.5">
              <p className="text-sm font-semibold text-ink-900">{lab.safetyFramework.name}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-500">
                Maturity: {lab.safetyFramework.maturity}
              </p>
              <div className="mt-2">
                <VerificationMeta item={lab.safetyFramework} compact />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CopyTextButton
                  text={buildRecordCitation({
                    ...lab.safetyFramework,
                    recordKind: "lab safety framework",
                    recordId: `${lab.id}.safetyFramework`,
                    recordName: lab.safetyFramework.name,
                    sourceName: lab.safetyFramework.sourceName,
                    sourceUrl: lab.safetyFramework.sourceUrl,
                    claim: `${lab.name} safety framework maturity: ${lab.safetyFramework.maturity}.`,
                  })}
                />
                <SourceLink
                  name={lab.safetyFramework.sourceName}
                  url={lab.safetyFramework.sourceUrl}
                />
              </div>
            </div>
          </section>
        )}

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Regulatory exposure
            </h3>
            <p className="text-[11px] text-ink-500">
              {visibleExposure.length} of {regulatoryExposure.length} rows
            </p>
          </div>
          {regulatoryExposure.length === 0 ? (
            <p className="text-xs text-ink-500">None recorded.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-canvas-line bg-canvas/60 p-2 text-center text-xs">
                <ExposureMetric label="Binding" value={exposureSummary.binding} strong={exposureSummary.binding > 0} />
                <ExposureMetric label="Conditional" value={exposureSummary.conditional} />
                <ExposureMetric label="Voluntary" value={exposureSummary.voluntary} />
                <ExposureMetric label="Standards" value={exposureSummary.standards} />
                <ExposureMetric label="Infra" value={exposureSummary.infrastructure} />
                <ExposureMetric label="Indirect" value={exposureSummary.indirect} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {EXPOSURE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setExposureFilter(filter.id)}
                    className={
                      exposureFilter === filter.id
                        ? "rounded-md border border-accent bg-accent px-2 py-1 text-[11px] font-medium text-white"
                        : "rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
                    }
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-3">
                {groupedExposure.map(([effect, rows]) => (
                  <div key={effect}>
                    <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      {LAB_EXPOSURE_EFFECT_LABELS[effect]}
                    </h4>
                    <ul className="space-y-1.5">
                      {rows.map((r) => (
                        <ExposureCard key={r.id} exposure={r} labName={lab.name} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {visibleExposure.length === 0 && (
                <p className="mt-3 rounded-lg border border-canvas-line bg-white px-3 py-2 text-xs text-ink-500">
                  No exposure rows match this quick filter.
                </p>
              )}
            </>
          )}
        </section>

        <section className="mt-5 rounded-xl border border-canvas-line bg-white p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Structured obligations
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
            <ExposureMetric label="Rows" value={obligations.length} strong={obligations.some((row) => row.legalEffect === "binding")} />
            <ExposureMetric label="Binding" value={obligations.filter((row) => row.legalEffect === "binding").length} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-600">
            {summarizeObligationCategories(obligations)}
          </p>
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Connections
          </h3>
          <ConnectionsSection nodeId={lab.id} />
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Source
          </h3>
          <div className="mb-2">
            <VerificationMeta item={lab} compact />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyTextButton
              text={buildRecordCitation({
                ...lab,
                recordKind: "frontier lab",
                recordId: lab.id,
                recordName: lab.name,
                sourceName: lab.sourceName,
                sourceUrl: lab.sourceUrl,
                claim: lab.summary,
              })}
            />
            <SourceLink name={lab.sourceName} url={lab.sourceUrl} />
            <CorrectionLink
              recordKind="frontier_lab"
              recordId={lab.id}
              recordName={lab.name}
              sourceUrl={lab.sourceUrl}
              claim={lab.summary}
              compact
            />
          </div>
        </section>
      </div>
    </aside>
  );
}

type ExposureFilter = "all" | "binding" | "voluntary" | "standards" | "infrastructure" | "indirect";

const EXPOSURE_FILTERS: Array<{ id: ExposureFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "binding", label: "Binding" },
  { id: "voluntary", label: "Voluntary" },
  { id: "standards", label: "Standards" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "indirect", label: "Indirect" },
];

function filterExposure(exposures: LabRegulatoryExposure[], filter: ExposureFilter) {
  if (filter === "binding") return exposures.filter((item) => item.legalEffect === "binding");
  if (filter === "voluntary") return exposures.filter((item) => item.legalEffect === "voluntary");
  if (filter === "standards") return exposures.filter((item) => item.legalEffect === "standard");
  if (filter === "infrastructure") {
    return exposures.filter((item) => item.legalEffect === "infrastructure_constraint");
  }
  if (filter === "indirect") return exposures.filter((item) => item.directness === "indirect");
  return exposures;
}

function groupExposureByEffect(exposures: LabRegulatoryExposure[]) {
  const order: LabExposureLegalEffect[] = [
    "binding",
    "voluntary",
    "guidance",
    "standard",
    "infrastructure_constraint",
    "indirect",
  ];
  const grouped = new Map<LabExposureLegalEffect, LabRegulatoryExposure[]>();
  for (const exposure of exposures) {
    const items = grouped.get(exposure.legalEffect) ?? [];
    items.push(exposure);
    grouped.set(exposure.legalEffect, items);
  }
  return order
    .filter((effect) => grouped.has(effect))
    .map((effect) => [effect, grouped.get(effect)!] as const);
}

function ExposureMetric({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-lg border border-canvas-line bg-white px-2 py-1.5">
      <p className={strong ? "text-lg font-semibold text-accent" : "text-lg font-semibold text-ink-900"}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-ink-500">{label}</p>
    </div>
  );
}

function ExposureCard({ exposure, labName }: { exposure: LabRegulatoryExposure; labName: string }) {
  const target = getLabExposureTarget(exposure);
  const citation = buildRecordCitation({
    ...exposure,
    recordKind: "lab regulatory exposure",
    recordId: exposure.id,
    recordName: `${labName} - ${target.name}`,
    sourceName: exposure.sourceName,
    sourceUrl: exposure.sourceUrl,
    claim: exposure.rationale,
  });
  return (
    <li className="rounded-lg border border-canvas-line bg-white px-3 py-2.5 text-xs text-ink-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-ink-900">{target.name}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-500">
            {LAB_EXPOSURE_TARGET_TYPE_LABELS[exposure.targetType]} · {LAB_EXPOSURE_KIND_LABELS[exposure.exposureKind]}
          </p>
        </div>
        <span className={effectBadgeClass(exposure.legalEffect)}>
          {LAB_EXPOSURE_EFFECT_LABELS[exposure.legalEffect]}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-700">
          {LAB_EXPOSURE_DIRECTNESS_LABELS[exposure.directness]}
        </span>
        <span className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-700">
          Strength {exposure.strength}/5
        </span>
        {exposure.jurisdiction && (
          <span className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-700">
            {exposure.jurisdiction}
          </span>
        )}
      </div>
      <p className="mt-2 leading-relaxed">{exposure.rationale}</p>
      {exposure.notes && (
        <p className="mt-2 rounded-md bg-canvas px-2 py-1.5 text-[11px] leading-relaxed text-ink-600">
          {exposure.notes}
        </p>
      )}
      <div className="mt-2">
        <VerificationMeta item={exposure} compact />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <CopyTextButton text={citation} />
        <SourceLink name={exposure.sourceName} url={exposure.sourceUrl} />
        <CorrectionLink
          recordKind="lab_regulatory_exposure"
          recordId={exposure.id}
          recordName={`${labName} - ${target.name}`}
          sourceUrl={exposure.sourceUrl}
          claim={exposure.rationale}
          compact
        />
      </div>
    </li>
  );
}

function effectBadgeClass(effect: LabExposureLegalEffect) {
  const base = "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";
  if (effect === "binding") return `${base} border-accent/30 bg-accent/10 text-accent`;
  if (effect === "voluntary") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  if (effect === "standard") return `${base} border-violet-200 bg-violet-50 text-violet-900`;
  if (effect === "infrastructure_constraint") {
    return `${base} border-slate-300 bg-slate-100 text-slate-800`;
  }
  return `${base} border-blue-200 bg-blue-50 text-blue-900`;
}
