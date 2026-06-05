import { lazy, Suspense } from "react";
import type { LensKind, MapModeId } from "../types";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";
import { getSubnationalRulesByCountry } from "../data/subnationalRules";
import { InstrumentList } from "./InstrumentList";
import { NationalRegulationList } from "./NationalRegulationList";
import { ConnectionsSection } from "./ConnectionsSection";
import { SourceLink } from "./SourceLink";
import { NationalBindingBadge } from "./ParticipationBadge";
import { useDialogFocus } from "../utils/useDialogFocus";
import { VerificationMeta } from "./VerificationMeta";
import { CorrectionLink } from "./CorrectionLink";
import { CopyTextButton } from "./CopyTextButton";
import { PinCompareButton } from "./PinCompareButton";
import { EvidenceDossierButton } from "./EvidenceDossierButton";
import { buildCountryCitation, buildRecordCitation } from "../utils/citation";
import { isConfirmedBindingNationalRegulation } from "../utils/governanceTaxonomy";
import {
  getCountryImplementationMilestones,
  getCountryObligations,
  summarizeImplementationStatuses,
  summarizeObligationCategories,
} from "../utils/researchWorkbench";
import { buildGovernanceColorReason, type MapColorReason } from "../utils/mapColorReason";

const AIAtlasSection = lazy(() => import("./AIAtlasSection").then((module) => ({ default: module.AIAtlasSection })));

interface Props {
  iso3: string;
  onClose: () => void;
  onSelectLab: (labId: string) => void;
  onPinCountry: () => void;
  isCountryPinned: boolean;
  onPinLab: (labId: string) => void;
  isLabPinned: (labId: string) => boolean;
  onPinInstrument: (instrumentId: string) => void;
  isInstrumentPinned: (instrumentId: string) => boolean;
  lens: LensKind;
  mapMode: MapModeId;
  contextReason?: MapColorReason;
}

export function CountrySidePanel({
  iso3,
  onClose,
  onSelectLab,
  onPinCountry,
  isCountryPinned,
  onPinLab,
  isLabPinned,
  onPinInstrument,
  isInstrumentPinned,
  lens,
  mapMode,
  contextReason,
}: Props) {
  const summary = getCountryGovernanceSummary(iso3);
  const country = summary.country;
  const dialogRef = useDialogFocus<HTMLElement>(onClose);

  if (!country) return null;
  const confirmedBinding = summary.nationalRegulations.filter(isConfirmedBindingNationalRegulation);
  const proposed = summary.nationalRegulations.filter((reg) => reg.bindingStatus === "proposed");
  const guidance = summary.nationalRegulations.filter(
    (reg) => !isConfirmedBindingNationalRegulation(reg) && reg.bindingStatus !== "proposed"
  );
  const indirectRows = summary.participations.filter(
    ({ participation }) => participation.participationType === "covered_by_membership" || participation.participationType === "applicable_via_eu"
  );
  const countryCitation = buildCountryCitation({
    iso3: country.iso3,
    name: country.name,
    summary: `${confirmedBinding.length} confirmed binding AI-specific national entries; ${proposed.length} proposed entries; ${guidance.length} guidance/strategy/framework entries; ${summary.participations.length} international participation rows.`,
  });
  const obligations = getCountryObligations(country.iso3);
  const implementation = getCountryImplementationMilestones(country.iso3);
  const subnationalRules = getSubnationalRulesByCountry(country.iso3);
  const colorReason = contextReason ?? buildGovernanceColorReason(summary, lens, mapMode);

  return (
    <aside
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${country.name} AI governance details`}
      tabIndex={-1}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-canvas-line bg-white shadow-drawer"
    >
      <header className="flex items-start gap-3 border-b border-canvas-line px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            {country.region}
            {country.isEUMember && " · EU member"}
          </p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-ink-900">
            {country.name}
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">ISO-3166 alpha-3 · {country.iso3}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PinCompareButton pinned={isCountryPinned} onToggle={onPinCountry} />
            <EvidenceDossierButton kind="country" id={country.iso3} />
            <CopyTextButton text={countryCitation} />
            <CorrectionLink
              recordKind="country"
              recordId={country.iso3}
              recordName={country.name}
              claim={country.notes ?? `Country summary and governance aggregation for ${country.name}.`}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close country panel"
          className="rounded-md p-1.5 text-ink-500 hover:bg-canvas"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      <div className="policy-scroll flex-1 overflow-y-auto px-5 py-5">
        <section className="grid grid-cols-3 gap-3 rounded-xl border border-canvas-line bg-canvas/60 p-3 text-center">
          <div>
            <p className="text-2xl font-semibold text-ink-900">
              {summary.nationalRegulations.length}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-ink-500">
              National entries
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink-900">
              {summary.participations.length}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-ink-500">
              Intl. instruments
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink-900">
              {summary.hasBindingNationalLaw ? "Yes" : "—"}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-ink-500">
              Binding law applies
            </p>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-canvas-line bg-white p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Research answer
          </h3>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
            <StatusBox
              label="Binding AI-specific law"
              value={confirmedBinding.length ? `${confirmedBinding.length} applies` : "None confirmed"}
              tone={confirmedBinding.length ? "strong" : "muted"}
            />
            <StatusBox
              label="Proposed law"
              value={proposed.length ? `${proposed.length} tracked` : "None tracked"}
              tone={proposed.length ? "watch" : "muted"}
            />
            <StatusBox
              label="Guidance / strategy"
              value={guidance.length ? `${guidance.length} entries` : "None tracked"}
              tone={guidance.length ? "context" : "muted"}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-600">
            {confirmedBinding.length
              ? "At least one confirmed binding AI-specific national or EU-applicable rule is recorded. Check source notes for scope, dates, and caveats."
              : "No confirmed binding AI-specific national law is recorded for this country in the current snapshot. Proposed laws, strategies, and international participation may still be relevant."}
          </p>
          {indirectRows.length > 0 && (
            <p className="mt-2 rounded-md bg-canvas px-2 py-1.5 text-[11px] leading-relaxed text-ink-700">
              {indirectRows.length} international rows are indirect coverage or EU applicability, not explicit country-by-country sign-on.
            </p>
          )}
        </section>

        <section className="mt-4 rounded-xl border border-canvas-line bg-white p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Why this country is colored this way
          </h3>
          <p className="mt-2 text-sm font-semibold text-ink-900">{colorReason.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-600">{colorReason.detail}</p>
          <p className="mt-2 rounded-md bg-canvas px-2 py-1.5 text-[11px] leading-relaxed text-ink-600">
            Current map mode: {mapMode.replace(/-/g, " ")}. Atlas/context modes do not alter legal-status rollups.
          </p>
        </section>

        <section className="mt-4 rounded-xl border border-canvas-line bg-white p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Obligations and implementation
          </h3>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <StatusBox
              label="Obligation rows"
              value={obligations.length ? `${obligations.length} tracked` : "None tracked"}
              tone={obligations.length ? "context" : "muted"}
            />
            <StatusBox
              label="Implementation"
              value={implementation.length ? `${implementation.length} milestones` : "None tracked"}
              tone={implementation.length ? "watch" : "muted"}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-600">
            {summarizeObligationCategories(obligations)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-600">
            {summarizeImplementationStatuses(implementation)}
          </p>
        </section>

        <Suspense fallback={<AIAtlasSectionFallback />}>
          <AIAtlasSection iso3={country.iso3} />
        </Suspense>

        {summary.hqLabs.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Frontier-lab HQ ({summary.hqLabs.length})
            </h3>
            <ul className="space-y-1.5">
              {summary.hqLabs.map((lab) => (
                <li
                  key={lab.id}
                  className="rounded-md border border-canvas-line bg-white hover:border-accent"
                >
                  <button
                    type="button"
                    onClick={() => onSelectLab(lab.id)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left"
                  >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: lab.isFMFMember ? "#B45309" : "#1E40AF" }}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold leading-snug text-ink-900">{lab.name}</span>
                    <span className="block text-[11px] text-ink-500">
                      Power {lab.powerScore}/5
                      {lab.isFMFMember && " · FMF member"}
                      {lab.safetyFramework && ` · ${lab.safetyFramework.name}`}
                    </span>
                  </span>
                  </button>
                  <div className="border-t border-canvas-line px-3 py-2">
                    <PinCompareButton
                      pinned={isLabPinned(lab.id)}
                      onToggle={() => onPinLab(lab.id)}
                      label={isLabPinned(lab.id) ? "Pinned" : "Compare lab"}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            National AI laws, proposals, and guidance
          </h3>
          <NationalRegulationList regulations={summary.nationalRegulations} />
        </section>

        {subnationalRules.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Subnational AI rules ({subnationalRules.length})
            </h3>
            <ul className="space-y-1.5">
              {subnationalRules.map((rule) => (
                <li
                  key={rule.id}
                  className="rounded-md border border-canvas-line bg-white px-3 py-2 text-xs"
                >
                  <p className="text-[11px] uppercase tracking-wide text-ink-500">
                    {rule.jurisdictionName}
                  </p>
                  <p className="mt-0.5 font-semibold text-ink-900">{rule.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <NationalBindingBadge status={rule.bindingStatus} />
                    <CopyTextButton
                      text={buildRecordCitation({
                        ...rule,
                        recordKind: "subnational AI rule",
                        recordId: rule.id,
                        recordName: rule.name,
                        sourceName: rule.sourceName,
                        sourceUrl: rule.sourceUrl,
                        claim: rule.summary,
                      })}
                    />
                    <SourceLink name={rule.sourceName} url={rule.sourceUrl} />
                    <CorrectionLink
                      recordKind="subnational_ai_rule"
                      recordId={rule.id}
                      recordName={rule.name}
                      sourceUrl={rule.sourceUrl}
                      claim={rule.summary}
                      compact
                    />
                  </div>
                  <div className="mt-2">
                    <VerificationMeta item={rule} compact />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Connections
          </h3>
          <ConnectionsSection nodeId={iso3} />
        </section>

        <section className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            International instruments and participation
          </h3>
          <InstrumentList
            items={summary.participations}
            onPinInstrument={onPinInstrument}
            isInstrumentPinned={isInstrumentPinned}
          />
        </section>

        {country.notes && (
          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Notes
            </h3>
            <p className="rounded-lg border border-canvas-line bg-canvas/60 px-3 py-2.5 text-xs leading-relaxed text-ink-700">
              {country.notes}
            </p>
          </section>
        )}
      </div>
    </aside>
  );
}

function AIAtlasSectionFallback() {
  return (
    <section className="mt-4 rounded-xl border border-canvas-line bg-white p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        AI Atlas context
      </h3>
      <p className="mt-2 text-xs text-ink-500">Loading contextual indicators...</p>
    </section>
  );
}

function StatusBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "strong" | "watch" | "context" | "muted";
}) {
  const toneClass =
    tone === "strong"
      ? "border-accent/30 bg-accent/10 text-accent"
      : tone === "watch"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : tone === "context"
          ? "border-blue-200 bg-blue-50 text-blue-900"
          : "border-canvas-line bg-canvas text-ink-600";

  return (
    <div className={`rounded-lg border px-2.5 py-2 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
