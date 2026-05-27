import { useState } from "react";
import type { InternationalParticipation, InternationalInstrument } from "../types";
import {
  INSTRUMENT_BINDING_DESCRIPTIONS,
  PARTICIPATION_DESCRIPTIONS,
  PARTICIPATION_LABELS,
  INSTRUMENT_BINDING_LABELS,
} from "../utils/getParticipationLabel";
import {
  InstrumentBindingBadge,
  ParticipationBadge,
} from "./ParticipationBadge";
import { SourceLink } from "./SourceLink";
import { EmptyState } from "./EmptyState";
import { VerificationMeta } from "./VerificationMeta";
import { CorrectionLink } from "./CorrectionLink";

interface Item {
  participation: InternationalParticipation;
  instrument: InternationalInstrument;
}

interface Props {
  items: Item[];
}

export function InstrumentList({ items }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState message="No verified participation data currently included." />
    );
  }

  return (
    <ul className="space-y-2">
      {items.map(({ participation, instrument }) => {
        const expanded = expandedId === participation.id;
        return (
          <li
            key={participation.id}
            className="rounded-lg border border-canvas-line bg-white"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedId(expanded ? null : participation.id)
              }
              className="flex w-full items-start gap-2 px-3 py-2.5 text-left"
              aria-expanded={expanded}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug text-ink-900">
                  {instrument.name}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-500">
                  {instrument.organizationType} · {instrument.instrumentType.replace(/_/g, " ")}
                  {instrument.date && (
                    <span className="ml-1">· {instrument.date.slice(0, 10)}</span>
                  )}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <ParticipationBadge type={participation.participationType} />
                  <InstrumentBindingBadge status={instrument.bindingStatus} />
                </div>
              </div>
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`mt-1 text-ink-500 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {expanded && (
              <div className="space-y-2 border-t border-canvas-line px-3 py-2.5 text-xs text-ink-700">
                <p className="leading-relaxed">{instrument.summary}</p>
                <dl className="grid gap-2 rounded-md bg-canvas px-2 py-2 text-[11px] leading-relaxed sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-ink-900">
                      Participation: {PARTICIPATION_LABELS[participation.participationType]}
                    </dt>
                    <dd className="mt-0.5 text-ink-700">
                      {PARTICIPATION_DESCRIPTIONS[participation.participationType]}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-900">
                      Legal effect: {INSTRUMENT_BINDING_LABELS[instrument.bindingStatus]}
                    </dt>
                    <dd className="mt-0.5 text-ink-700">
                      {INSTRUMENT_BINDING_DESCRIPTIONS[instrument.bindingStatus]}
                    </dd>
                  </div>
                </dl>
                {participation.notes && (
                  <p className="rounded bg-canvas px-2 py-1.5 text-[11px] leading-relaxed text-ink-700">
                    <span className="font-semibold text-ink-900">Note: </span>
                    {participation.notes}
                  </p>
                )}
                {instrument.notes && (
                  <p className="rounded bg-canvas px-2 py-1.5 text-[11px] leading-relaxed text-ink-700">
                    <span className="font-semibold text-ink-900">Instrument note: </span>
                    {instrument.notes}
                  </p>
                )}
                <VerificationMeta item={participation} label="Participation verification" />
                <VerificationMeta item={instrument} label="Instrument verification" />
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <SourceLink
                    name={participation.sourceName}
                    url={participation.sourceUrl}
                  />
                  {instrument.sourceUrl !== participation.sourceUrl && (
                    <SourceLink
                      name={instrument.sourceName}
                      url={instrument.sourceUrl}
                    />
                  )}
                  <CorrectionLink
                    recordKind="international_instrument"
                    recordId={instrument.id}
                    recordName={instrument.name}
                    sourceUrl={instrument.sourceUrl}
                    claim={instrument.summary}
                    compact
                  />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
