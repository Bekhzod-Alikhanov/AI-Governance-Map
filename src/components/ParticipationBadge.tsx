import clsx from "clsx";
import type { ParticipationType, InstrumentBindingStatus, NationalBindingStatus } from "../types";
import {
  PARTICIPATION_LABELS,
  PARTICIPATION_DESCRIPTIONS,
  INSTRUMENT_BINDING_LABELS,
  INSTRUMENT_BINDING_DESCRIPTIONS,
  NATIONAL_BINDING_LABELS,
  NATIONAL_BINDING_DESCRIPTIONS,
} from "../utils/getParticipationLabel";

const PARTICIPATION_STYLES: Record<ParticipationType, string> = {
  signed: "bg-violet-50 text-violet-800 border-violet-200",
  ratified: "bg-violet-100 text-violet-900 border-violet-300",
  endorsed: "bg-sky-50 text-sky-800 border-sky-200",
  adopted: "bg-emerald-50 text-emerald-800 border-emerald-200",
  adherent: "bg-emerald-50 text-emerald-800 border-emerald-200",
  member: "bg-indigo-50 text-indigo-800 border-indigo-200",
  participant: "bg-slate-100 text-slate-800 border-slate-300",
  applicable_via_eu: "bg-blue-50 text-blue-800 border-blue-200",
  covered_by_membership: "bg-slate-100 text-slate-700 border-slate-200",
  unknown: "bg-slate-100 text-slate-500 border-slate-200",
};

const INSTRUMENT_BINDING_STYLES: Record<InstrumentBindingStatus, string> = {
  binding_on_parties: "bg-emerald-100 text-emerald-900 border-emerald-300",
  binding_regulation: "bg-emerald-100 text-emerald-900 border-emerald-300",
  non_binding: "bg-slate-100 text-slate-700 border-slate-200",
  voluntary: "bg-amber-50 text-amber-900 border-amber-200",
  standard: "bg-cyan-50 text-cyan-800 border-cyan-200",
  political_guidance: "bg-slate-100 text-slate-700 border-slate-200",
};

const NATIONAL_BINDING_STYLES: Record<NationalBindingStatus, string> = {
  binding: "bg-emerald-100 text-emerald-900 border-emerald-300",
  non_binding: "bg-slate-100 text-slate-700 border-slate-200",
  voluntary: "bg-amber-50 text-amber-900 border-amber-200",
  proposed: "bg-sky-50 text-sky-800 border-sky-200",
  mixed: "bg-violet-50 text-violet-800 border-violet-200",
};

const BASE = "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium";

export function ParticipationBadge({ type }: { type: ParticipationType }) {
  const label = PARTICIPATION_LABELS[type];
  const description = PARTICIPATION_DESCRIPTIONS[type];
  return (
    <span
      className={clsx(BASE, PARTICIPATION_STYLES[type])}
      title={description}
      aria-label={`${label}: ${description}`}
    >
      {label}
    </span>
  );
}

export function InstrumentBindingBadge({ status }: { status: InstrumentBindingStatus }) {
  const label = INSTRUMENT_BINDING_LABELS[status];
  const description = INSTRUMENT_BINDING_DESCRIPTIONS[status];
  return (
    <span
      className={clsx(BASE, INSTRUMENT_BINDING_STYLES[status])}
      title={description}
      aria-label={`${label}: ${description}`}
    >
      {label}
    </span>
  );
}

export function NationalBindingBadge({ status }: { status: NationalBindingStatus }) {
  const label = NATIONAL_BINDING_LABELS[status];
  const description = NATIONAL_BINDING_DESCRIPTIONS[status];
  return (
    <span
      className={clsx(BASE, NATIONAL_BINDING_STYLES[status])}
      title={description}
      aria-label={`${label}: ${description}`}
    >
      {label}
    </span>
  );
}
