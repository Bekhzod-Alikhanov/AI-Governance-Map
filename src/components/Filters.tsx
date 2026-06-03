import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type {
  FilterState,
  GovernanceDomainId,
  ImplementationStatus,
  InstrumentBindingStatus,
  ObligationCategory,
  OrganizationType,
  ParticipationType,
  Region,
} from "../types";
import { GOVERNANCE_DOMAINS } from "../data/governanceDomains";
import { OBLIGATION_CATEGORY_LABELS } from "../data/governanceObligations";
import { IMPLEMENTATION_STATUS_LABELS } from "../data/implementationMilestones";
import { INTERNATIONAL_INSTRUMENTS, INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { FRONTIER_LABS, LAB_BY_ID } from "../data/frontierLabs";
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

const OBLIGATION_OPTIONS = Object.keys(OBLIGATION_CATEGORY_LABELS) as ObligationCategory[];
const DOMAIN_OPTIONS = GOVERNANCE_DOMAINS.map((domain) => domain.id);
const IMPLEMENTATION_OPTIONS = Object.keys(IMPLEMENTATION_STATUS_LABELS) as ImplementationStatus[];

function useOutsideClose(ref: React.RefObject<HTMLDivElement | null>, onClose: () => void) {
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

interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

function ActiveChip({ label, onRemove }: Omit<ActiveFilterChip, "id">) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-accent/25 bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent hover:bg-accent/15"
    >
      <span className="truncate">{label}</span>
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
        className="shrink-0"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  );
}

function yesNoLabel(value: "yes" | "no") {
  return value === "yes" ? "Yes" : "No";
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
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
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
  const activeChips: ActiveFilterChip[] = [];

  for (const id of filters.selectedInstrumentIds) {
    activeChips.push({
      id: `instrument-${id}`,
      label: `Instrument: ${INSTRUMENT_BY_ID[id]?.name ?? id}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedInstrumentIds: filters.selectedInstrumentIds.filter((x) => x !== id),
        }),
    });
  }
  for (const type of filters.selectedParticipationTypes) {
    activeChips.push({
      id: `participation-${type}`,
      label: `Participation: ${PARTICIPATION_LABELS[type]}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedParticipationTypes: filters.selectedParticipationTypes.filter((x) => x !== type),
        }),
    });
  }
  for (const status of filters.selectedBindingStatuses) {
    activeChips.push({
      id: `binding-${status}`,
      label: `Legal effect: ${INSTRUMENT_BINDING_LABELS[status]}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedBindingStatuses: filters.selectedBindingStatuses.filter((x) => x !== status),
        }),
    });
  }
  for (const org of filters.selectedOrganizations) {
    activeChips.push({
      id: `organization-${org}`,
      label: `Organization: ${org}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedOrganizations: filters.selectedOrganizations.filter((x) => x !== org),
        }),
    });
  }
  for (const region of filters.selectedRegions) {
    activeChips.push({
      id: `region-${region}`,
      label: `Region: ${region}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedRegions: filters.selectedRegions.filter((x) => x !== region),
        }),
    });
  }
  for (const id of filters.selectedLabIds) {
    activeChips.push({
      id: `lab-${id}`,
      label: `Lab HQ: ${LAB_BY_ID[id]?.name ?? id}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedLabIds: filters.selectedLabIds.filter((x) => x !== id),
        }),
    });
  }
  for (const category of filters.selectedObligationCategories) {
    activeChips.push({
      id: `obligation-${category}`,
      label: `Obligation: ${OBLIGATION_CATEGORY_LABELS[category]}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedObligationCategories: filters.selectedObligationCategories.filter((x) => x !== category),
        }),
    });
  }
  for (const domainId of filters.selectedDomains) {
    activeChips.push({
      id: `domain-${domainId}`,
      label: `Domain: ${GOVERNANCE_DOMAINS.find((domain) => domain.id === domainId)?.label ?? domainId}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedDomains: filters.selectedDomains.filter((x) => x !== domainId),
        }),
    });
  }
  for (const status of filters.selectedImplementationStatuses) {
    activeChips.push({
      id: `implementation-${status}`,
      label: `Implementation: ${IMPLEMENTATION_STATUS_LABELS[status]}`,
      onRemove: () =>
        onChange({
          ...filters,
          selectedImplementationStatuses: filters.selectedImplementationStatuses.filter((x) => x !== status),
        }),
    });
  }
  if (filters.hasBindingNationalLaw !== "any") {
    activeChips.push({
      id: "binding-national-law",
      label: `Binding AI law applies: ${yesNoLabel(filters.hasBindingNationalLaw)}`,
      onRemove: () => onChange({ ...filters, hasBindingNationalLaw: "any" }),
    });
  }
  if (filters.hasAnyAIRule !== "any") {
    activeChips.push({
      id: "any-ai-rule",
      label: `Any national AI entry: ${yesNoLabel(filters.hasAnyAIRule)}`,
      onRemove: () => onChange({ ...filters, hasAnyAIRule: "any" }),
    });
  }
  if (filters.frontierAIRelevant !== "any") {
    activeChips.push({
      id: "frontier-relevant",
      label: `Frontier-AI relevant: ${yesNoLabel(filters.frontierAIRelevant)}`,
      onRemove: () => onChange({ ...filters, frontierAIRelevant: "any" }),
    });
  }
  if (filters.searchQuery.trim()) {
    activeChips.push({
      id: "search-query",
      label: `Search: ${filters.searchQuery.trim()}`,
      onRemove: () => onChange({ ...filters, searchQuery: "" }),
    });
  }

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
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1.5">
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
        label="Legal effect"
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
        label="Frontier labs"
        count={filters.selectedLabIds.length}
        width={260}
      >
        {Array.from(
          FRONTIER_LABS.reduce((map, lab) => {
            (map.get(lab.hqCountryName) ?? map.set(lab.hqCountryName, []).get(lab.hqCountryName))!.push(lab);
            return map;
          }, new Map<string, typeof FRONTIER_LABS>())
        ).map(([country, labs]) => (
          <div key={country} className="pb-1">
            <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              {country}
            </p>
            {labs.map((lab) => (
              <CheckboxRow
                key={lab.id}
                checked={filters.selectedLabIds.includes(lab.id)}
                onChange={() => toggleArrayValue("selectedLabIds", lab.id)}
                label={
                  <span className="font-medium leading-snug">
                    {lab.name}
                    {lab.isFMFMember && (
                      <span className="ml-1 rounded bg-amber-100 px-1 text-[9px] uppercase tracking-wide text-amber-900">
                        FMF
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
        label="Obligation"
        count={filters.selectedObligationCategories.length}
        width={300}
      >
        {OBLIGATION_OPTIONS.map((category) => (
          <CheckboxRow
            key={category}
            checked={filters.selectedObligationCategories.includes(category)}
            onChange={() => toggleArrayValue("selectedObligationCategories", category)}
            label={OBLIGATION_CATEGORY_LABELS[category]}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="Domain"
        count={filters.selectedDomains.length}
        width={320}
      >
        {DOMAIN_OPTIONS.map((domainId: GovernanceDomainId) => {
          const domain = GOVERNANCE_DOMAINS.find((item) => item.id === domainId);
          return (
            <CheckboxRow
              key={domainId}
              checked={filters.selectedDomains.includes(domainId)}
              onChange={() => toggleArrayValue("selectedDomains", domainId)}
              label={
                <span>
                  <span className="font-medium text-ink-800">{domain?.label ?? domainId}</span>
                  {domain?.description && (
                    <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">
                      {domain.description}
                    </span>
                  )}
                </span>
              }
            />
          );
        })}
      </FilterDropdown>

      <FilterDropdown
        label="Implementation"
        count={filters.selectedImplementationStatuses.length}
        width={280}
      >
        {IMPLEMENTATION_OPTIONS.map((status) => (
          <CheckboxRow
            key={status}
            checked={filters.selectedImplementationStatuses.includes(status)}
            onChange={() => toggleArrayValue("selectedImplementationStatuses", status)}
            label={IMPLEMENTATION_STATUS_LABELS[status]}
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
            <p className="mb-1 text-[11px] text-ink-700">Binding AI law applies</p>
            <YesNoAny
              value={filters.hasBindingNationalLaw}
              onChange={(v) => onChange({ ...filters, hasBindingNationalLaw: v })}
            />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-ink-700">
              Any national AI law, proposal, guidance, strategy, or framework
            </p>
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
        className="ml-auto rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-ink-400 disabled:opacity-40"
      >
        Reset
      </button>
      </div>

      {activeChips.length > 0 && (
        <div className="flex max-h-20 flex-wrap items-center gap-1.5 overflow-y-auto pr-1">
          <span className="text-[11px] font-medium text-ink-500">Active:</span>
          {activeChips.map((chip) => (
            <ActiveChip key={chip.id} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
