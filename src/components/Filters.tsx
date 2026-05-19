import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type {
  FilterState,
  InstrumentBindingStatus,
  OrganizationType,
  ParticipationType,
  Region,
} from "../types";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import {
  INSTRUMENT_BINDING_LABELS,
  PARTICIPATION_LABELS,
} from "../utils/getParticipationLabel";
import { countActiveFilters } from "../utils/filterCountries";

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

const PARTICIPATION_OPTIONS: ParticipationType[] = [
  "signed",
  "ratified",
  "endorsed",
  "adopted",
  "adherent",
  "member",
  "participant",
  "applicable_via_eu",
  "covered_by_membership",
];

const BINDING_OPTIONS: InstrumentBindingStatus[] = [
  "binding_on_parties",
  "binding_regulation",
  "voluntary",
  "non_binding",
  "standard",
  "political_guidance",
];

const ORG_OPTIONS: OrganizationType[] = [
  "UN",
  "UNESCO",
  "OECD",
  "G20",
  "G7",
  "EU",
  "Council of Europe",
  "ISO/IEC",
  "ASEAN",
  "African Union",
  "APEC",
  "AI Safety Summit",
  "Bilateral",
  "Other",
];

const REGION_OPTIONS: Region[] = [
  "Europe",
  "North America",
  "Latin America & Caribbean",
  "Sub-Saharan Africa",
  "Middle East & North Africa",
  "East Asia",
  "Southeast Asia",
  "South Asia",
  "Central Asia",
  "Oceania",
  "Eurasia",
];

function useOutsideClose(ref: React.RefObject<HTMLDivElement>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onClose]);
}

interface DropdownProps {
  label: string;
  count: number;
  align?: "left" | "right";
  width?: number;
  children: React.ReactNode;
}

function FilterDropdown({ label, count, align = "left", width = 320, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClose(wrapRef, () => setOpen(false));

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={clsx(
          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
          count > 0
            ? "border-accent bg-accent text-white shadow-sm hover:bg-accent/90"
            : "border-canvas-line bg-white text-ink-700 hover:border-ink-400"
        )}
      >
        <span>{label}</span>
        {count > 0 && (
          <span
            className={clsx(
              "rounded-full px-1.5 text-[10px] font-semibold leading-4",
              count > 0 ? "bg-white/25 text-white" : "bg-accent/10 text-accent"
            )}
          >
            {count}
          </span>
        )}
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={clsx("transition-transform", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className={clsx(
            "policy-scroll absolute top-full z-40 mt-2 max-h-[480px] overflow-y-auto rounded-xl border border-canvas-line bg-white p-2 shadow-drawer",
            align === "right" ? "right-0" : "left-0"
          )}
          style={{ width }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-xs leading-snug text-ink-700 hover:bg-canvas">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded border-canvas-line text-accent focus:ring-accent"
      />
      <span>{label}</span>
    </label>
  );
}

function YesNoAny({
  value,
  onChange,
}: {
  value: "any" | "yes" | "no";
  onChange: (v: "any" | "yes" | "no") => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-canvas-line">
      {(["any", "yes", "no"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={clsx(
            "px-2 py-1 text-[11px] font-medium capitalize transition-colors",
            value === v
              ? "bg-accent text-white"
              : "bg-white text-ink-700 hover:bg-canvas"
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export function Filters({ filters, onChange, onReset }: Props) {
  const activeCount = countActiveFilters(filters);

  const instrumentsByOrg = useMemo(() => {
    const map: Record<string, typeof INTERNATIONAL_INSTRUMENTS> = {};
    for (const inst of INTERNATIONAL_INSTRUMENTS) {
      (map[inst.organizationType] ??= []).push(inst);
    }
    return map;
  }, []);

  function toggleInstrument(id: string) {
    const sel = filters.selectedInstrumentIds;
    const next = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id];
    onChange({ ...filters, selectedInstrumentIds: next });
  }

  function toggleArrayValue<T extends string>(key: keyof FilterState, value: T) {
    const current = filters[key] as T[];
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* International instrument (with AND/OR mode) */}
      <FilterDropdown
        label="Instrument"
        count={filters.selectedInstrumentIds.length}
        width={380}
      >
        <div className="mb-2 flex items-center justify-between border-b border-canvas-line px-2 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Match mode
          </span>
          <div className="inline-flex overflow-hidden rounded-md border border-canvas-line">
            {(["OR", "AND"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange({ ...filters, instrumentMatchMode: m })}
                className={clsx(
                  "px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                  filters.instrumentMatchMode === m
                    ? "bg-accent text-white"
                    : "bg-white text-ink-700 hover:bg-canvas"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {Object.keys(instrumentsByOrg)
          .sort()
          .map((org) => (
            <div key={org} className="pb-1">
              <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                {org}
              </p>
              {instrumentsByOrg[org].map((inst) => (
                <CheckboxRow
                  key={inst.id}
                  checked={filters.selectedInstrumentIds.includes(inst.id)}
                  onChange={() => toggleInstrument(inst.id)}
                  label={
                    <span className="font-medium leading-snug">
                      {inst.name}
                      {inst.date && (
                        <span className="ml-1 text-[10px] text-ink-500">
                          · {inst.date.slice(0, 4)}
                        </span>
                      )}
                    </span>
                  }
                />
              ))}
            </div>
          ))}
      </FilterDropdown>

      <FilterDropdown
        label="Participation"
        count={filters.selectedParticipationTypes.length}
        width={260}
      >
        {PARTICIPATION_OPTIONS.map((p) => (
          <CheckboxRow
            key={p}
            checked={filters.selectedParticipationTypes.includes(p)}
            onChange={() => toggleArrayValue("selectedParticipationTypes", p)}
            label={PARTICIPATION_LABELS[p]}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="Binding force"
        count={filters.selectedBindingStatuses.length}
        width={240}
      >
        {BINDING_OPTIONS.map((b) => (
          <CheckboxRow
            key={b}
            checked={filters.selectedBindingStatuses.includes(b)}
            onChange={() => toggleArrayValue("selectedBindingStatuses", b)}
            label={INSTRUMENT_BINDING_LABELS[b]}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="Organization"
        count={filters.selectedOrganizations.length}
        width={220}
      >
        {ORG_OPTIONS.map((o) => (
          <CheckboxRow
            key={o}
            checked={filters.selectedOrganizations.includes(o)}
            onChange={() => toggleArrayValue("selectedOrganizations", o)}
            label={o}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="Region"
        count={filters.selectedRegions.length}
        width={250}
      >
        {REGION_OPTIONS.map((r) => (
          <CheckboxRow
            key={r}
            checked={filters.selectedRegions.includes(r)}
            onChange={() => toggleArrayValue("selectedRegions", r)}
            label={r}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="National AI rules"
        count={
          (filters.hasBindingNationalLaw !== "any" ? 1 : 0) +
          (filters.hasAnyAIRule !== "any" ? 1 : 0) +
          (filters.frontierAIRelevant !== "any" ? 1 : 0)
        }
        width={300}
        align="right"
      >
        <div className="space-y-3 px-2 py-1">
          <div>
            <p className="mb-1 text-[11px] text-ink-700">Has binding national AI law</p>
            <YesNoAny
              value={filters.hasBindingNationalLaw}
              onChange={(v) => onChange({ ...filters, hasBindingNationalLaw: v })}
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-ink-700">Has any AI-specific rule</p>
            <YesNoAny
              value={filters.hasAnyAIRule}
              onChange={(v) => onChange({ ...filters, hasAnyAIRule: v })}
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-ink-700">Frontier-AI relevant</p>
            <YesNoAny
              value={filters.frontierAIRelevant}
              onChange={(v) => onChange({ ...filters, frontierAIRelevant: v })}
            />
          </div>
        </div>
      </FilterDropdown>

      <span className="ml-1 text-[11px] text-ink-500">
        {activeCount > 0 ? `${activeCount} filter${activeCount === 1 ? "" : "s"} active` : "No active filters"}
      </span>

      <button
        type="button"
        onClick={onReset}
        disabled={activeCount === 0}
        className="ml-auto rounded-md border border-canvas-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:border-ink-400 disabled:opacity-40"
      >
        Reset
      </button>
    </div>
  );
}
