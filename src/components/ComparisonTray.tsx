import { useState } from "react";
import type { CompareItem } from "../types";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { LAB_BY_ID } from "../data/frontierLabs";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { PARTICIPATION_BY_INSTRUMENT } from "../data/participation";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";
import { INSTRUMENT_BINDING_LABELS } from "../utils/getParticipationLabel";
import { isConfirmedBindingNationalRegulation } from "../utils/governanceTaxonomy";

interface Props {
  items: CompareItem[];
  onRemove: (item: CompareItem) => void;
  onClear: () => void;
  onOpenCountry: (iso3: string) => void;
  onOpenLab: (labId: string) => void;
  onOpenInstrument: (instrumentId: string) => void;
  drawerOpen?: boolean;
}

export function ComparisonTray({
  items,
  onRemove,
  onClear,
  onOpenCountry,
  onOpenLab,
  onOpenInstrument,
  drawerOpen = false,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Pinned comparison"
      className={
        drawerOpen
          ? "absolute bottom-4 right-4 z-20 w-[min(52rem,calc(100%-2rem))] rounded-xl border border-canvas-line bg-white/95 shadow-drawer backdrop-blur md:right-[27rem] md:w-[min(36rem,calc(100%-29rem))]"
          : "absolute bottom-4 right-4 z-20 w-[min(52rem,calc(100%-2rem))] rounded-xl border border-canvas-line bg-white/95 shadow-drawer backdrop-blur"
      }
    >
      <header className="flex items-center gap-2 border-b border-canvas-line px-3 py-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-700">
            Comparison
          </h2>
          <p className="text-[11px] text-ink-500">
            {items.length} pinned {items.length === 1 ? "item" : "items"} for side-by-side review
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((next) => !next)}
          className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-canvas"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-canvas"
        >
          Clear
        </button>
      </header>

      {expanded && (
        <div className="policy-scroll max-h-[42vh] overflow-x-auto overflow-y-auto p-3">
          <div
            className={
              drawerOpen
                ? "grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2"
                : "grid min-w-[40rem] grid-cols-2 gap-2 lg:grid-cols-3"
            }
          >
            {items.map((item) => (
              <CompareCard
                key={`${item.kind}:${item.id}`}
                item={item}
                onRemove={onRemove}
                onOpenCountry={onOpenCountry}
                onOpenLab={onOpenLab}
                onOpenInstrument={onOpenInstrument}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function CompareCard({
  item,
  onRemove,
  onOpenCountry,
  onOpenLab,
  onOpenInstrument,
}: {
  item: CompareItem;
  onRemove: (item: CompareItem) => void;
  onOpenCountry: (iso3: string) => void;
  onOpenLab: (labId: string) => void;
  onOpenInstrument: (instrumentId: string) => void;
}) {
  if (item.kind === "country") {
    const country = COUNTRY_BY_ISO3[item.id];
    const summary = getCountryGovernanceSummary(item.id);
    if (!country) return null;
    const binding = summary.nationalRegulations.filter(isConfirmedBindingNationalRegulation);
    const proposed = summary.nationalRegulations.filter((reg) => reg.bindingStatus === "proposed");
    const guidance = summary.nationalRegulations.filter(
      (reg) => !isConfirmedBindingNationalRegulation(reg) && reg.bindingStatus !== "proposed"
    );
    return (
      <article className="rounded-lg border border-canvas-line bg-canvas/40 p-3">
        <CompareHeader label="Country" title={country.name} item={item} onRemove={onRemove} />
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <Metric label="Binding" value={binding.length ? "Yes" : "No"} strong={binding.length > 0} />
          <Metric label="Proposed" value={proposed.length} />
          <Metric label="Guidance" value={guidance.length} />
          <Metric label="Intl. rows" value={summary.participations.length} />
          <Metric label="Labs" value={summary.hqLabs.length} />
          <Metric label="Region" value={country.region} />
        </dl>
        <button
          type="button"
          onClick={() => onOpenCountry(country.iso3)}
          className="mt-3 rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
        >
          Open country
        </button>
      </article>
    );
  }

  if (item.kind === "lab") {
    const lab = LAB_BY_ID[item.id];
    if (!lab) return null;
    return (
      <article className="rounded-lg border border-canvas-line bg-canvas/40 p-3">
        <CompareHeader label="Frontier lab" title={lab.name} item={item} onRemove={onRemove} />
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <Metric label="HQ" value={lab.hqCountryName} />
          <Metric label="Power" value={`${lab.powerScore}/5`} strong={lab.powerScore >= 4} />
          <Metric label="Models" value={lab.flagshipModels.slice(0, 3).join(", ")} />
          <Metric label="Exposure" value={lab.regulatoryExposureIds.length} />
          <Metric label="FMF" value={lab.isFMFMember ? "Yes" : "No"} />
          <Metric label="Safety" value={lab.safetyFramework?.maturity ?? "None"} />
        </dl>
        <button
          type="button"
          onClick={() => onOpenLab(lab.id)}
          className="mt-3 rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
        >
          Open lab
        </button>
      </article>
    );
  }

  const instrument = INSTRUMENT_BY_ID[item.id];
  if (!instrument) return null;
  const participationCount = PARTICIPATION_BY_INSTRUMENT[instrument.id]?.length ?? 0;
  return (
    <article className="rounded-lg border border-canvas-line bg-canvas/40 p-3">
      <CompareHeader label="Instrument" title={instrument.name} item={item} onRemove={onRemove} />
      <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <Metric label="Issuer" value={instrument.issuer} />
        <Metric label="Effect" value={INSTRUMENT_BINDING_LABELS[instrument.bindingStatus]} strong={instrument.bindingStatus.includes("binding")} />
        <Metric label="Type" value={instrument.instrumentType.replace(/_/g, " ")} />
        <Metric label="Rows" value={participationCount} />
        <Metric label="Date" value={instrument.date} />
        <Metric label="Confidence" value={instrument.confidence ?? "n/a"} />
      </dl>
      <button
        type="button"
        onClick={() => onOpenInstrument(instrument.id)}
        className="mt-3 rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
      >
        Filter instrument
      </button>
    </article>
  );
}

function CompareHeader({
  label,
  title,
  item,
  onRemove,
}: {
  label: string;
  title: string;
  item: CompareItem;
  onRemove: (item: CompareItem) => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-ink-900">
          {title}
        </h3>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item)}
        aria-label={`Remove ${title} from comparison`}
        className="rounded-md p-1 text-ink-500 hover:bg-white hover:text-ink-900"
      >
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}

function Metric({ label, value, strong }: { label: string; value: string | number; strong?: boolean }) {
  return (
    <div className="rounded-md border border-canvas-line bg-white px-2 py-1.5">
      <dt className="text-[10px] uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className={strong ? "mt-0.5 font-semibold text-accent" : "mt-0.5 font-semibold text-ink-800"}>
        {value}
      </dd>
    </div>
  );
}
