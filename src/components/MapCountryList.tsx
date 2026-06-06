import { useMemo } from "react";
import type { FilterState, LensKind, MapModeId } from "../types";
import { countActiveFilters, filterCountries } from "../utils/filterCountries";
import { getCountryMapSummary } from "../utils/getCountryMapSummary";
import { buildGovernanceColorReason, type MapColorReason } from "../utils/mapColorReason";

interface Props {
  filters: FilterState;
  lens: LensKind;
  mapMode: MapModeId;
  contextReasonByIso3?: Record<string, MapColorReason> | null;
  onSelectCountry: (iso3: string) => void;
  onClose: () => void;
}

export function MapCountryList({
  filters,
  lens,
  mapMode,
  contextReasonByIso3,
  onSelectCountry,
  onClose,
}: Props) {
  const activeFilterCount = countActiveFilters(filters);
  const rows = useMemo(() => {
    const allRows = filterCountries(filters)
      .filter((row) => row.country.iso3 !== "ATA")
      .map((row) => {
        const summary = getCountryMapSummary(row.iso3);
        const reason = contextReasonByIso3?.[row.iso3] ?? buildGovernanceColorReason(summary, lens, mapMode);
        return { ...row, summary, reason };
      });
    const visibleRows = activeFilterCount > 0 ? allRows.filter((row) => row.matchesFilter) : allRows;
    return visibleRows.sort((a, b) => a.country.name.localeCompare(b.country.name)).slice(0, 160);
  }, [activeFilterCount, contextReasonByIso3, filters, lens, mapMode]);

  return (
    <aside
      role="dialog"
      aria-label="Keyboard-accessible country list"
      className="absolute right-3 top-14 z-20 flex max-h-[min(34rem,calc(100%-7rem))] w-[min(24rem,calc(100%-1.5rem))] flex-col rounded-xl border border-canvas-line bg-white/95 shadow-drawer backdrop-blur sm:right-4 sm:top-16"
    >
      <header className="flex items-start justify-between gap-3 border-b border-canvas-line px-3 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Country list</h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-ink-600">
            {activeFilterCount > 0 ? `${rows.length} countries match active filters.` : "World overview by current map mode."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs font-semibold text-ink-500 hover:bg-canvas hover:text-ink-900"
        >
          Close
        </button>
      </header>
      <div className="policy-scroll flex-1 overflow-auto p-2">
        {rows.length === 0 ? (
          <p className="rounded-lg bg-canvas px-3 py-2 text-xs leading-relaxed text-ink-600">
            No countries match the current filters. Reset filters or switch map mode to broaden the list.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((row) => (
              <li key={row.iso3}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCountry(row.iso3);
                    onClose();
                  }}
                  className="w-full rounded-lg border border-canvas-line bg-white px-3 py-2 text-left hover:border-accent hover:bg-accent/5 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-ink-900">{row.country.name}</span>
                      <span className="mt-0.5 block text-[11px] text-ink-500">{row.reason.label}</span>
                    </span>
                    <span className="shrink-0 rounded bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                      {row.iso3}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-ink-600">
                    {row.reason.detail}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
