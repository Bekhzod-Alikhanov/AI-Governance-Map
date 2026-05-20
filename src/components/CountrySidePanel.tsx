import { useEffect } from "react";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";
import { InstrumentList } from "./InstrumentList";
import { NationalRegulationList } from "./NationalRegulationList";
import { ConnectionsSection } from "./ConnectionsSection";
import { SourceLink } from "./SourceLink";
import { NationalBindingBadge } from "./ParticipationBadge";

interface Props {
  iso3: string;
  onClose: () => void;
  onSelectLab: (labId: string) => void;
}

export function CountrySidePanel({ iso3, onClose, onSelectLab }: Props) {
  const summary = getCountryGovernanceSummary(iso3);
  const country = summary.country;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!country) return null;

  return (
    <aside
      role="dialog"
      aria-label={`${country.name} AI governance details`}
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

        {summary.hqLabs.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Frontier-lab HQ ({summary.hqLabs.length})
            </h3>
            <ul className="space-y-1.5">
              {summary.hqLabs.map((lab) => (
                <li
                  key={lab.id}
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-canvas-line bg-white px-3 py-2 hover:border-accent"
                  onClick={() => onSelectLab(lab.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSelectLab(lab.id);
                  }}
                  tabIndex={0}
                >
                  <span
                    className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: lab.isFMFMember ? "#B45309" : "#1E40AF" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug text-ink-900">{lab.name}</p>
                    <p className="text-[11px] text-ink-500">
                      Power {lab.powerScore}/5
                      {lab.isFMFMember && " · FMF member"}
                      {lab.safetyFramework && ` · ${lab.safetyFramework.name}`}
                    </p>
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

        {summary.subnationalRules.length > 0 && (
          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Subnational AI rules ({summary.subnationalRules.length})
            </h3>
            <ul className="space-y-1.5">
              {summary.subnationalRules.map((rule) => (
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
                    <SourceLink name={rule.sourceName} url={rule.sourceUrl} />
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
          <InstrumentList items={summary.participations} />
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
