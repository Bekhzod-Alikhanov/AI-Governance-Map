import { lazy, Suspense, useEffect, useMemo, useReducer, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  DEFAULT_FILTER_STATE,
  type FilterState,
  type FrontierLab,
  type LensKind,
  type NetworkDensity,
  type NetworkPresetId,
  type ResearchPreset,
  type TimelineLane,
} from "./types";
import { WorldMap } from "./components/WorldMap";
import { Filters } from "./components/Filters";
import { CountrySidePanel } from "./components/CountrySidePanel";
import { LabSidePanel } from "./components/LabSidePanel";
import { CountryTooltip } from "./components/CountryTooltip";
import { DataActions } from "./components/DataActions";
import { SearchBox } from "./components/SearchBox";
import { Legend } from "./components/Legend";
import { LensSwitch } from "./components/LensSwitch";
import { WalkthroughOverlay } from "./components/WalkthroughOverlay";
import { ResearchQuestionsPanel } from "./components/ResearchQuestionsPanel";
import { MethodologyPanel } from "./components/MethodologyPanel";
import { runDevValidation } from "./utils/validateData";
import { DEFAULT_SHAREABLE_STATE, parseShareableState, serializeShareableState } from "./utils/urlState";
import { COUNTRIES, COUNTRY_BY_ISO3 } from "./data/countries";
import { INTERNATIONAL_INSTRUMENTS } from "./data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "./data/nationalAIRegulations";
import { FRONTIER_LABS, LAB_BY_ID } from "./data/frontierLabs";
import { DEPENDENCY_EDGES } from "./data/dependencies";

// Network + Timeline lenses are non-default. Lazy-load them so d3-force
// and the timeline list don't ship in the initial bundle.
const NetworkView = lazy(() => import("./components/NetworkView").then((m) => ({ default: m.NetworkView })));
const TimelineView = lazy(() => import("./components/TimelineView").then((m) => ({ default: m.TimelineView })));
const TableView = lazy(() => import("./components/TableView").then((m) => ({ default: m.TableView })));

function LensFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-canvas-surface text-xs text-ink-500">
      Loading view…
    </div>
  );
}

type Action =
  | { type: "set"; filters: FilterState }
  | { type: "reset" }
  | { type: "patch"; patch: Partial<FilterState> }
  | { type: "select-instrument"; id: string };

function filterReducer(state: FilterState, action: Action): FilterState {
  switch (action.type) {
    case "set":
      return action.filters;
    case "reset":
      return { ...DEFAULT_FILTER_STATE };
    case "patch":
      return { ...DEFAULT_FILTER_STATE, ...action.patch };
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
  const initialUrlState = useMemo(
    () =>
      typeof window === "undefined"
        ? DEFAULT_SHAREABLE_STATE
        : parseShareableState(window.location.search),
    []
  );
  const [filters, dispatch] = useReducer(filterReducer, initialUrlState.filters);
  const [selectedIso3, setSelectedIso3] = useState<string | null>(initialUrlState.selectedIso3);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(initialUrlState.selectedLabId);
  const [hover, setHover] = useState<{
    iso3: string;
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const [hoverLab, setHoverLab] = useState<{ lab: FrontierLab; x: number; y: number } | null>(null);
  const [showLabs, setShowLabs] = useState(true);
  const [lens, setLens] = useState<LensKind>(initialUrlState.lens);
  const [walkthroughStep, setWalkthroughStep] = useState<number | null>(null);
  const [networkSelection, setNetworkSelection] = useState<string | null>(initialUrlState.networkSelection);
  const [networkPreset, setNetworkPreset] = useState<NetworkPresetId>(initialUrlState.networkPreset);
  const [networkDensity, setNetworkDensity] = useState<NetworkDensity>(initialUrlState.networkDensity);
  const [networkFrontierOnly, setNetworkFrontierOnly] = useState(initialUrlState.networkFrontierOnly);
  const [timelineLane, setTimelineLane] = useState<TimelineLane>(initialUrlState.timelineLane);
  const [timelineFrontierOnly, setTimelineFrontierOnly] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [isMapMaximized, setIsMapMaximized] = useState(false);

  useEffect(() => {
    if (import.meta.env.VITE_SKIP_DEV_VALIDATION === "1") return;
    runDevValidation();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handlePopState() {
      const next = parseShareableState(window.location.search);
      dispatch({ type: "set", filters: next.filters });
      setLens(next.lens);
      setSelectedIso3(next.selectedIso3);
      setSelectedLabId(next.selectedLabId);
      setNetworkSelection(next.networkSelection);
      setNetworkPreset(next.networkPreset);
      setNetworkDensity(next.networkDensity);
      setNetworkFrontierOnly(next.networkFrontierOnly);
      setTimelineLane(next.timelineLane);
      setActivePresetId(null);
      setIsMapMaximized(false);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = serializeShareableState({
      lens,
      filters,
      selectedIso3,
      selectedLabId,
      networkSelection,
      networkPreset,
      networkDensity,
      networkFrontierOnly,
      timelineLane,
    });
    const nextUrl = `${window.location.pathname}${query}${window.location.hash}`;
    if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [
    filters,
    lens,
    networkDensity,
    networkFrontierOnly,
    networkPreset,
    networkSelection,
    selectedIso3,
    selectedLabId,
    timelineLane,
  ]);

  const stats = useMemo(
    () => ({
      countries: COUNTRIES.filter((c) => c.iso3 !== "EUU").length,
      instruments: INTERNATIONAL_INSTRUMENTS.length,
      nationalRegs: NATIONAL_AI_REGULATIONS.length,
      labs: FRONTIER_LABS.length,
      edges: DEPENDENCY_EDGES.length,
    }),
    []
  );

  const showsMap = lens === "geography" || lens === "layer";
  const mapChromeHidden = showsMap && isMapMaximized;

  useEffect(() => {
    if (!isMapMaximized) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMapMaximized(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMapMaximized]);

  const selectionAnnouncement = selectedIso3
    ? `Selected country ${COUNTRY_BY_ISO3[selectedIso3]?.name ?? selectedIso3}`
    : selectedLabId
      ? `Selected lab ${LAB_BY_ID[selectedLabId]?.name ?? selectedLabId}`
      : `${lens} view active`;

  function handleSelectCountry(iso3: string) {
    setSelectedLabId(null);
    setSelectedIso3(iso3);
    setActivePresetId(null);
  }

  function handleSelectLab(id: string) {
    setSelectedIso3(null);
    setSelectedLabId(id);
    setActivePresetId(null);
  }

  function handleNetworkSelect(id: string, kind: string) {
    setNetworkSelection(id);
    if (kind === "country") handleSelectCountry(id);
    else if (kind === "lab") handleSelectLab(id);
  }

  function handleLensChange(nextLens: LensKind) {
    setLens(nextLens);
    setIsMapMaximized(false);
    setHover(null);
    setHoverLab(null);
    setSelectedIso3(null);
    setSelectedLabId(null);
    setNetworkSelection(null);
    setActivePresetId(null);
  }

  function handleWalkthroughApply(patch: Partial<FilterState>, nextLens: LensKind) {
    dispatch({ type: "patch", patch });
    setLens(nextLens);
    setIsMapMaximized(false);
    setActivePresetId(null);
  }

  function handleApplyPreset(preset: ResearchPreset) {
    dispatch({ type: "patch", patch: preset.filterPatch ?? {} });
    setLens(preset.lens);
    setIsMapMaximized(false);
    setSelectedIso3(preset.selectedIso3 ?? null);
    setSelectedLabId(preset.selectedLabId ?? null);
    setNetworkSelection(preset.selectedNetworkNodeId ?? null);
    setNetworkPreset(preset.networkPreset ?? "all");
    setTimelineLane(preset.timelineLane ?? "all");
    setActivePresetId(preset.id);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-3 py-2 text-sm font-semibold text-accent shadow-panel focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to main content
      </a>
      {!mapChromeHidden && (
        <header className="z-20 flex shrink-0 flex-wrap items-center gap-2 border-b border-canvas-line bg-canvas-surface px-4 py-1.5">
          <div className="min-w-0 shrink-0">
            <h1 className="text-base font-semibold leading-tight tracking-tight text-ink-900">
              Global AI Governance Map
            </h1>
            <p className="hidden text-[11px] leading-tight text-ink-500 md:block">
              Frontier AI governance: actors, instruments, dependencies
            </p>
          </div>

          <LensSwitch value={lens} onChange={handleLensChange} />

          <div className="min-w-44 w-56 shrink-0 md:w-64 xl:w-72">
            <SearchBox
              query={filters.searchQuery}
              onQueryChange={(query) => dispatch({ type: "set", filters: { ...filters, searchQuery: query } })}
              onSelectCountry={(iso3) => handleSelectCountry(iso3)}
              onSelectInstrument={(id) => dispatch({ type: "select-instrument", id })}
            />
          </div>

          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
            <div className="hidden text-right text-[11px] leading-tight text-ink-500 xl:block">
              <div>
                {stats.countries} countries · {stats.labs} labs · {stats.instruments} instruments
              </div>
              <div>
                {stats.nationalRegs} national rules · {stats.edges} edges
              </div>
            </div>
            <ResearchQuestionsPanel activePresetId={activePresetId} onApplyPreset={handleApplyPreset} />
            <DataActions onOpenMethodology={() => setShowMethodology(true)} />
            <button
              type="button"
              onClick={() => setWalkthroughStep(0)}
              className="rounded-md border border-accent bg-accent/5 px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/10"
            >
              Take the tour
            </button>
          </div>
        </header>
      )}

      <div className="sr-only" aria-live="polite">
        {selectionAnnouncement}
      </div>

      {/* Filter toolbar */}
      {!mapChromeHidden && (
        <div data-filter-toolbar className="z-10 shrink-0 border-b border-canvas-line bg-canvas-surface px-4 py-1">
          <Filters
            filters={filters}
            onChange={(next) => dispatch({ type: "set", filters: next })}
            onReset={() => dispatch({ type: "reset" })}
          />
        </div>
      )}

      {/* Main canvas — switches between Map / Network / Timeline lenses */}
      <main id="main-content" tabIndex={-1} className="relative flex-1 overflow-hidden">
        {showsMap && (
          <WorldMap
            filters={filters}
            selectedIso3={selectedIso3}
            selectedLabId={selectedLabId}
            onSelectCountry={handleSelectCountry}
            onSelectLab={handleSelectLab}
            onHover={(data) => setHover(data)}
            onHoverLab={(data) => setHoverLab(data)}
            showLabs={showLabs}
            lens={lens}
            scaleBoost={mapChromeHidden ? 1.08 : 1}
          />
        )}
        {lens === "network" && (
          <Suspense fallback={<LensFallback />}>
            <NetworkView
              selectedNodeId={networkSelection}
              onSelectNode={handleNetworkSelect}
              preset={networkPreset}
              onPresetChange={setNetworkPreset}
              density={networkDensity}
              onDensityChange={setNetworkDensity}
              frontierOnly={networkFrontierOnly}
              onFrontierOnlyChange={setNetworkFrontierOnly}
            />
          </Suspense>
        )}
        {lens === "timeline" && (
          <Suspense fallback={<LensFallback />}>
            <TimelineView
              lane={timelineLane}
              onLaneChange={setTimelineLane}
              frontierOnly={timelineFrontierOnly}
              onFrontierOnlyChange={setTimelineFrontierOnly}
            />
          </Suspense>
        )}
        {lens === "table" && (
          <Suspense fallback={<LensFallback />}>
            <TableView
              filters={filters}
              onSelectCountry={handleSelectCountry}
              onSelectLab={handleSelectLab}
              onSelectInstrument={(id) => dispatch({ type: "select-instrument", id })}
            />
          </Suspense>
        )}

        {showsMap && (
          <button
            type="button"
            onClick={() => setIsMapMaximized((next) => !next)}
            aria-pressed={mapChromeHidden}
            className="absolute right-4 top-3 z-20 inline-flex items-center gap-1.5 rounded-md border border-canvas-line bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-ink-800 shadow-panel backdrop-blur hover:border-accent hover:text-accent"
          >
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
            >
              {mapChromeHidden ? (
                <>
                  <path d="M8 3v5H3" />
                  <path d="M16 3v5h5" />
                  <path d="M8 21v-5H3" />
                  <path d="M16 21v-5h5" />
                </>
              ) : (
                <>
                  <path d="M3 8V3h5" />
                  <path d="M21 8V3h-5" />
                  <path d="M3 16v5h5" />
                  <path d="M21 16v5h-5" />
                </>
              )}
            </svg>
            {mapChromeHidden ? "Exit maximize" : "Maximize map"}
          </button>
        )}

        {/* Floating legend + lab toggle, bottom-left */}
        {showsMap && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs space-y-2">
            <div className="pointer-events-auto">
              <Legend key={mapChromeHidden ? "maximized" : "normal"} />
            </div>
            <label className="pointer-events-auto inline-flex cursor-pointer items-center gap-2 rounded-md border border-canvas-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 shadow-panel">
              <input
                type="checkbox"
                checked={showLabs}
                onChange={(e) => setShowLabs(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-canvas-line text-accent focus:ring-accent"
              />
              {mapChromeHidden ? `Labs (${stats.labs})` : `Show frontier-lab HQs (${stats.labs})`}
            </label>
          </div>
        )}

        {/* Floating source badge */}
        {showsMap && !mapChromeHidden && (
          <div className="pointer-events-none absolute bottom-4 right-4 z-10 max-w-md text-right">
            <p className="pointer-events-auto inline-block rounded-md bg-white/85 px-2.5 py-1 text-[10px] text-ink-500 shadow-panel backdrop-blur">
              Sources: EUR-Lex · OECD · UNESCO · CoE · ISO · GOV.UK · NIST · CAC · MSIT · IMDA · MeitY · AU · ASEAN · APEC · CAIDP Index 2026 · doc1 frontier-AI brief
            </p>
          </div>
        )}

        {selectedIso3 && (
          <CountrySidePanel
            iso3={selectedIso3}
            onClose={() => setSelectedIso3(null)}
            onSelectLab={handleSelectLab}
          />
        )}

        {selectedLabId && (
          <LabSidePanel labId={selectedLabId} onClose={() => setSelectedLabId(null)} />
        )}
      </main>

      {hover && showsMap && !hoverLab && (
        <CountryTooltip
          iso3={hover.iso3}
          countryName={hover.name}
          x={hover.x}
          y={hover.y}
          activeFilterInstrumentIds={filters.selectedInstrumentIds}
        />
      )}

      {hoverLab && showsMap && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 rounded-xl border border-canvas-line bg-white/95 px-3 py-2 text-xs shadow-drawer backdrop-blur"
          style={{ left: hoverLab.x + 14, top: hoverLab.y + 14, maxWidth: 280 }}
        >
          <p className="text-sm font-semibold text-ink-900">{hoverLab.lab.name}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-500">
            Frontier lab · HQ: {hoverLab.lab.hqCountryName}
          </p>
          {hoverLab.lab.safetyFramework && (
            <p className="mt-1 text-xs text-ink-700">
              Safety framework: <span className="font-semibold">{hoverLab.lab.safetyFramework.name}</span>
            </p>
          )}
          <p className="mt-1 text-[11px] text-ink-500">
            Power {hoverLab.lab.powerScore}/5
            {hoverLab.lab.isFMFMember && " · FMF member"}
          </p>
        </div>
      )}

      {walkthroughStep !== null && (
        <WalkthroughOverlay
          stepIndex={walkthroughStep}
          onStepChange={setWalkthroughStep}
          onApplyStep={handleWalkthroughApply}
          onClose={() => setWalkthroughStep(null)}
        />
      )}

      {showMethodology && <MethodologyPanel onClose={() => setShowMethodology(false)} />}

      <SpeedInsights />
    </div>
  );
}
