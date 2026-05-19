import { useEffect, useMemo, useReducer, useState } from "react";
import { DEFAULT_FILTER_STATE, type FilterState } from "./types";
import { WorldMap } from "./components/WorldMap";
import { Filters } from "./components/Filters";
import { CountrySidePanel } from "./components/CountrySidePanel";
import { CountryTooltip } from "./components/CountryTooltip";
import { SearchBox } from "./components/SearchBox";
import { Legend } from "./components/Legend";
import { runDevValidation } from "./utils/validateData";
import { COUNTRIES } from "./data/countries";
import { INTERNATIONAL_INSTRUMENTS } from "./data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "./data/nationalAIRegulations";

type Action =
  | { type: "set"; filters: FilterState }
  | { type: "reset" }
  | { type: "select-instrument"; id: string };

function filterReducer(state: FilterState, action: Action): FilterState {
  switch (action.type) {
    case "set":
      return action.filters;
    case "reset":
      return { ...DEFAULT_FILTER_STATE };
    case "select-instrument":
      return {
        ...state,
        selectedInstrumentIds: state.selectedInstrumentIds.includes(action.id)
          ? state.selectedInstrumentIds
          : [...state.selectedInstrumentIds, action.id],
      };
    default:
      return state;
  }
}

export default function App() {
  const [filters, dispatch] = useReducer(filterReducer, DEFAULT_FILTER_STATE);
  const [selectedIso3, setSelectedIso3] = useState<string | null>(null);
  const [hover, setHover] = useState<{
    iso3: string;
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(true);

  useEffect(() => {
    runDevValidation();
  }, []);

  const stats = useMemo(
    () => ({
      countries: COUNTRIES.filter((c) => c.iso3 !== "EUU").length,
      instruments: INTERNATIONAL_INSTRUMENTS.length,
      nationalRegs: NATIONAL_AI_REGULATIONS.length,
    }),
    []
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      {/* Compact header */}
      <header className="z-20 flex shrink-0 items-center gap-4 border-b border-canvas-line bg-canvas-surface px-5 py-2.5">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight tracking-tight text-ink-900">
            Global AI Governance Map
          </h1>
          <p className="text-[11px] leading-tight text-ink-500">
            AI-specific national regulations &amp; international AI governance instruments
          </p>
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <span className="hidden text-[11px] text-ink-500 lg:inline">
            {stats.countries} countries · {stats.instruments} instruments · {stats.nationalRegs} national rules
          </span>
          <div className="w-full max-w-xs">
            <SearchBox
              onSelectCountry={(iso3) => setSelectedIso3(iso3)}
              onSelectInstrument={(id) =>
                dispatch({ type: "select-instrument", id })
              }
            />
          </div>
        </div>
      </header>

      {/* Filter toolbar */}
      <div className="z-10 shrink-0 border-b border-canvas-line bg-canvas-surface px-5 py-2">
        <Filters
          filters={filters}
          onChange={(next) => dispatch({ type: "set", filters: next })}
          onReset={() => dispatch({ type: "reset" })}
        />
      </div>

      {/* Optional thin data-quality banner (dismissible) */}
      {noticeOpen && (
        <div className="z-10 flex shrink-0 items-center gap-3 border-b border-amber-200 bg-amber-50/70 px-5 py-1.5 text-[11px] text-amber-900">
          <svg
            aria-hidden="true"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-amber-700"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <p className="flex-1 truncate">
            <span className="font-semibold">Scope:</span> AI-specific instruments only — privacy,
            cybersecurity, and export-control laws are out of scope unless explicitly AI-specific.
            May 2026 snapshot.
          </p>
          <button
            type="button"
            onClick={() => setNoticeOpen(false)}
            aria-label="Dismiss data-quality notice"
            className="rounded p-0.5 text-amber-700 hover:bg-amber-100"
          >
            <svg
              aria-hidden="true"
              width="12"
              height="12"
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
        </div>
      )}

      {/* Map — fills all remaining vertical space */}
      <main className="relative flex-1 overflow-hidden">
        <WorldMap
          filters={filters}
          selectedIso3={selectedIso3}
          onSelectCountry={(iso3) => setSelectedIso3(iso3)}
          onHover={(data) => setHover(data)}
        />

        {/* Floating legend, bottom-left */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs">
          <div className="pointer-events-auto">
            <Legend />
          </div>
        </div>

        {/* Floating source badge, bottom-right */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 max-w-md text-right">
          <p className="pointer-events-auto inline-block rounded-md bg-white/85 px-2.5 py-1 text-[10px] text-ink-500 shadow-panel backdrop-blur">
            Official sources: EUR-Lex · OECD · UNESCO · Council of Europe · ISO · GOV.UK · NIST · CAC · MSIT · IMDA · MeitY · AU · ASEAN · APEC · CAIDP Index 2026
          </p>
        </div>

        {selectedIso3 && (
          <CountrySidePanel
            iso3={selectedIso3}
            onClose={() => setSelectedIso3(null)}
          />
        )}
      </main>

      {hover && (
        <CountryTooltip
          iso3={hover.iso3}
          countryName={hover.name}
          x={hover.x}
          y={hover.y}
          activeFilterInstrumentIds={filters.selectedInstrumentIds}
        />
      )}
    </div>
  );
}
