import { lazy, Suspense, useEffect, useMemo, useReducer, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  DEFAULT_FILTER_STATE,
  type CompareItem,
  type CompareItemKind,
  type FilterState,
  type FrontierLab,
  type LensKind,
  type MapModeId,
  type MapFitTarget,
  type NetworkDensity,
  type NetworkPresetId,
  type ResearchPreset,
  type TimelineLane,
  type WorkbenchState,
} from "./types";
import { WorldMap } from "./components/WorldMap";
import { Filters } from "./components/Filters";
import { DataActions } from "./components/DataActions";
import { SearchBox } from "./components/SearchBox";
import { Legend } from "./components/Legend";
import { LensSwitch } from "./components/LensSwitch";
import { ResearchQuestionsPanel } from "./components/ResearchQuestionsPanel";
import { DEFAULT_SHAREABLE_STATE, parseShareableState, serializeShareableState } from "./utils/urlState";
import { COUNTRY_BY_ISO3 } from "./data/countries";
import { LAB_BY_ID } from "./data/frontierLabs";
import { DATASET_STATS } from "./data/datasetStats";
import { getMapFitScope } from "./utils/mapFitTarget";
import { parseRecordRoute, type RecordRoute } from "./utils/recordRoutes";
import { parseEmbedRoute } from "./utils/embedRoutes";

// Network + Timeline lenses are non-default. Lazy-load them so d3-force
// and the timeline list don't ship in the initial bundle.
const NetworkView = lazy(() => import("./components/NetworkView").then((m) => ({ default: m.NetworkView })));
const TimelineView = lazy(() => import("./components/TimelineView").then((m) => ({ default: m.TimelineView })));
const TableView = lazy(() => import("./components/TableView").then((m) => ({ default: m.TableView })));
const WorkbenchView = lazy(() => import("./components/WorkbenchView").then((m) => ({ default: m.WorkbenchView })));
const CountrySidePanel = lazy(() => import("./components/CountrySidePanel").then((m) => ({ default: m.CountrySidePanel })));
const LabSidePanel = lazy(() => import("./components/LabSidePanel").then((m) => ({ default: m.LabSidePanel })));
const CountryTooltip = lazy(() => import("./components/CountryTooltip").then((m) => ({ default: m.CountryTooltip })));
const WalkthroughOverlay = lazy(() => import("./components/WalkthroughOverlay").then((m) => ({ default: m.WalkthroughOverlay })));
const MethodologyPanel = lazy(() => import("./components/MethodologyPanel").then((m) => ({ default: m.MethodologyPanel })));
const ComparisonTray = lazy(() => import("./components/ComparisonTray").then((m) => ({ default: m.ComparisonTray })));
const EmbedView = lazy(() => import("./components/EmbedView").then((m) => ({ default: m.EmbedView })));
const MapCountryList = lazy(() => import("./components/MapCountryList").then((m) => ({ default: m.MapCountryList })));

type MapFocusId = "world" | "americas" | "europe" | "africa_mena" | "asia_pacific";
type MapViewState = {
  focusId: MapFocusId | "custom" | "results";
  center?: [number, number];
  zoom: number;
  fitTarget?: MapFitTarget | null;
};

const MAP_ZOOM_MIN = 1;
const MAP_ZOOM_MAX = 4;
const MAP_ZOOM_STEP = 0.35;
const DEFAULT_MAP_VIEW: MapViewState = { focusId: "world", zoom: 1 };
const MAP_FOCUS_OPTIONS: Array<{
  id: MapFocusId;
  label: string;
  center?: [number, number];
  zoom: number;
}> = [
  { id: "world", label: "World", zoom: 1 },
  { id: "americas", label: "Americas", center: [-78, 18], zoom: 2.05 },
  { id: "europe", label: "Europe", center: [15, 53], zoom: 3 },
  { id: "africa_mena", label: "Africa/MENA", center: [22, 13], zoom: 2.15 },
  { id: "asia_pacific", label: "Asia-Pacific", center: [108, 18], zoom: 2.05 },
];
const MAP_MODE_OPTIONS: Array<{ id: MapModeId; label: string }> = [
  { id: "binding-law", label: "Binding law" },
  { id: "proposed-law", label: "Proposed law" },
  { id: "treaty-participation", label: "Treaty participation" },
  { id: "lab-hq", label: "Lab HQ" },
  { id: "obligation-type", label: "Obligations" },
  { id: "implementation-deadline", label: "Implementation" },
  { id: "source-confidence", label: "Source confidence" },
  { id: "frontier-relevance", label: "Frontier relevance" },
  { id: "ai-institutions", label: "AI institutions" },
  { id: "policy-windows", label: "Policy windows" },
  { id: "public-sector-ai", label: "Public-sector AI" },
  { id: "enforcement-activity", label: "Enforcement" },
  { id: "standards-conformity", label: "Standards" },
  { id: "gov-ai-readiness", label: "Gov readiness" },
  { id: "democratic-values", label: "Democratic values" },
  { id: "unesco-ram-status", label: "UNESCO RAM" },
  { id: "ai-vibrancy", label: "AI vibrancy" },
];
const ATLAS_MAP_MODES = new Set<MapModeId>([
  "gov-ai-readiness",
  "democratic-values",
  "unesco-ram-status",
  "ai-vibrancy",
]);
const CORPUS_MAP_MODES = new Set<MapModeId>([
  "ai-institutions",
  "policy-windows",
  "public-sector-ai",
  "enforcement-activity",
  "standards-conformity",
]);

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
  const initialRouteRecord = useMemo(
    () => (typeof window === "undefined" ? null : parseRecordRoute(window.location.pathname)),
    []
  );
  const embedRouteRecord = useMemo(
    () => (typeof window === "undefined" ? null : parseEmbedRoute(window.location.pathname)),
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
  const [lens, setLens] = useState<LensKind>(
    initialRouteRecord && typeof window !== "undefined" && !new URLSearchParams(window.location.search).has("lens")
      ? "workbench"
      : initialUrlState.lens
  );
  const [routeRecord, setRouteRecord] = useState<RecordRoute | null>(initialRouteRecord);
  const [walkthroughStep, setWalkthroughStep] = useState<number | null>(null);
  const [networkSelection, setNetworkSelection] = useState<string | null>(initialUrlState.networkSelection);
  const [networkPreset, setNetworkPreset] = useState<NetworkPresetId>(initialUrlState.networkPreset);
  const [networkDensity, setNetworkDensity] = useState<NetworkDensity>(initialUrlState.networkDensity);
  const [networkFrontierOnly, setNetworkFrontierOnly] = useState(initialUrlState.networkFrontierOnly);
  const [timelineLane, setTimelineLane] = useState<TimelineLane>(initialUrlState.timelineLane);
  const [timelineFrontierOnly, setTimelineFrontierOnly] = useState(false);
  const [workbenchState, setWorkbenchState] = useState<WorkbenchState>(initialUrlState.workbench);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [mapMode, setMapMode] = useState<MapModeId>("binding-law");
  const [contextFillState, setContextFillState] = useState<{
    mapMode: MapModeId;
    fills: Record<string, string>;
    reasons: Record<string, { label: string; detail: string }>;
  } | null>(null);
  const [mapView, setMapView] = useState<MapViewState>(DEFAULT_MAP_VIEW);
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    if (!import.meta.env.DEV || import.meta.env.VITE_SKIP_DEV_VALIDATION === "1") return;
    void import("./utils/validateData").then(({ runDevValidation }) => runDevValidation());
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!ATLAS_MAP_MODES.has(mapMode) && !CORPUS_MAP_MODES.has(mapMode)) {
      return () => {
        cancelled = true;
      };
    }

    const contextPromise = ATLAS_MAP_MODES.has(mapMode)
      ? import("./utils/aiAtlas").then(({ buildAtlasMapContext }) => buildAtlasMapContext(mapMode))
      : import("./utils/researchCorpus").then(({ buildCorpusMapContext }) => buildCorpusMapContext(mapMode));

    contextPromise
      .then((context) => {
        if (!cancelled) {
          setContextFillState({ mapMode, fills: context.fills, reasons: context.reasons });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("Unable to load context map data", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mapMode]);

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
      setWorkbenchState(next.workbench);
      setRouteRecord(parseRecordRoute(window.location.pathname));
      setActivePresetId(null);
      setIsMapMaximized(false);
      setMapView(DEFAULT_MAP_VIEW);
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
      workbench: workbenchState,
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
    workbenchState,
  ]);

  const stats = useMemo(
    () => ({
      countries: DATASET_STATS.countries,
      instruments: DATASET_STATS.internationalInstruments,
      nationalRegs: DATASET_STATS.nationalRegulations,
      labs: DATASET_STATS.frontierLabs,
      edges: DATASET_STATS.dependencyEdges,
    }),
    []
  );

  const showsMap = lens === "geography" || lens === "layer";
  const mapChromeHidden = showsMap && isMapMaximized;
  const contextFillByIso3 = contextFillState?.mapMode === mapMode ? contextFillState.fills : null;
  const contextReasonByIso3 = contextFillState?.mapMode === mapMode ? contextFillState.reasons : null;
  const resultFitScope = useMemo(
    () => getMapFitScope(filters, selectedIso3, selectedLabId),
    [filters, selectedIso3, selectedLabId]
  );
  const resultFitTarget = resultFitScope.target;
  const mapScopeReadout = resultFitScope.isNoMatch
    ? "No map matches"
    : mapView.fitTarget
      ? `Fitted: ${mapView.fitTarget.summaryLabel}`
      : resultFitTarget
        ? `Matches: ${resultFitTarget.summaryLabel}`
        : "World overview";
  const compactMapScopeReadout = resultFitScope.isNoMatch
    ? "No matches"
    : mapView.fitTarget
      ? "Fitted"
      : resultFitTarget
        ? resultFitScope.compactLabel
        : "World";
  const mapScopeTitle = resultFitTarget
    ? `${mapScopeReadout} (${resultFitTarget.label})`
    : mapScopeReadout;

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
    const target = getMapFitScope(filters, iso3, null).target;
    if (target) setMapView(createFitMapView(target));
  }

  function handleSelectLab(id: string) {
    setSelectedIso3(null);
    setSelectedLabId(id);
    setActivePresetId(null);
    const target = getMapFitScope(filters, null, id).target;
    if (target) setMapView(createFitMapView(target));
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
    const nextFilters = { ...DEFAULT_FILTER_STATE, ...patch };
    dispatch({ type: "patch", patch });
    setLens(nextLens);
    setIsMapMaximized(false);
    setActivePresetId(null);
    if (nextLens === "geography" || nextLens === "layer") {
      const target = getMapFitScope(nextFilters, null, null).target;
      if (target) setMapView(createFitMapView(target));
    }
  }

  function handleApplyPreset(preset: ResearchPreset) {
    const nextFilters = { ...DEFAULT_FILTER_STATE, ...(preset.filterPatch ?? {}) };
    const nextSelectedIso3 = preset.selectedIso3 ?? null;
    const nextSelectedLabId = preset.selectedLabId ?? null;
    dispatch({ type: "patch", patch: preset.filterPatch ?? {} });
    setLens(preset.lens);
    setIsMapMaximized(false);
    setSelectedIso3(nextSelectedIso3);
    setSelectedLabId(nextSelectedLabId);
    setNetworkSelection(preset.selectedNetworkNodeId ?? null);
    setNetworkPreset(preset.networkPreset ?? "all");
    setTimelineLane(preset.timelineLane ?? "all");
    setActivePresetId(preset.id);
    if (preset.lens === "geography" || preset.lens === "layer") {
      const target = getMapFitScope(nextFilters, nextSelectedIso3, nextSelectedLabId).target;
      if (target) setMapView(createFitMapView(target));
    }
  }

  function handleFilterChange(nextFilters: FilterState) {
    dispatch({ type: "set", filters: nextFilters });
    if (mapView.fitTarget) {
      const nextTarget = getMapFitScope(nextFilters, selectedIso3, selectedLabId).target;
      setMapView(nextTarget ? createFitMapView(nextTarget) : DEFAULT_MAP_VIEW);
    }
  }

  function handleFilterReset() {
    dispatch({ type: "reset" });
    setMapView(DEFAULT_MAP_VIEW);
  }

  function handleSelectInstrument(id: string) {
    const nextFilters = {
      ...filters,
      selectedInstrumentIds: filters.selectedInstrumentIds.includes(id)
        ? filters.selectedInstrumentIds
        : [...filters.selectedInstrumentIds, id],
    };
    dispatch({ type: "set", filters: nextFilters });
    const target = getMapFitScope(nextFilters, null, null).target;
    if (target) setMapView(createFitMapView(target));
  }

  function handleOpenAtlasMapMode(nextMode: MapModeId) {
    setMapMode(nextMode);
    setLens("geography");
    setRouteRecord(null);
    setIsMapMaximized(false);
    setMapView(DEFAULT_MAP_VIEW);
  }

  function isComparePinned(kind: CompareItemKind, id: string) {
    return compareItems.some((item) => item.kind === kind && item.id === id);
  }

  function toggleCompareItem(item: CompareItem) {
    setCompareItems((current) => {
      if (current.some((existing) => existing.kind === item.kind && existing.id === item.id)) {
        return current.filter((existing) => existing.kind !== item.kind || existing.id !== item.id);
      }
      return [...current, item].slice(-5);
    });
  }

  function removeCompareItem(item: CompareItem) {
    setCompareItems((current) =>
      current.filter((existing) => existing.kind !== item.kind || existing.id !== item.id)
    );
  }

  function handleZoomToResults() {
    if (!resultFitTarget) return;
    setMapView(createFitMapView(resultFitTarget));
  }

  function handleMapFocusChange(focusId: string) {
    const nextFocus = MAP_FOCUS_OPTIONS.find((option) => option.id === focusId);
    if (!nextFocus) return;
    setMapView({
      focusId: nextFocus.id,
      center: nextFocus.center,
      zoom: nextFocus.zoom,
      fitTarget: null,
    });
  }

  function handleMapZoom(delta: number) {
    setMapView((current) => ({
      ...current,
      focusId: current.fitTarget ? "results" : "custom",
      zoom: clamp(current.zoom + delta, MAP_ZOOM_MIN, MAP_ZOOM_MAX),
    }));
  }

  function handleMapReset() {
    setMapView(DEFAULT_MAP_VIEW);
  }

  if (embedRouteRecord) {
    return (
      <Suspense fallback={<LensFallback />}>
        <EmbedView route={embedRouteRecord} />
      </Suspense>
    );
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
        <header className="relative z-40 flex shrink-0 flex-wrap items-center gap-2 border-b border-canvas-line bg-canvas-surface px-4 py-1.5">
          <div className="min-w-0 shrink-0">
            <h1 className="text-base font-semibold leading-tight tracking-tight text-ink-900">
              AI Governance Map
            </h1>
          </div>

          <LensSwitch value={lens} onChange={handleLensChange} />

          <div className="min-w-40 w-48 shrink-0 md:w-56 xl:w-60">
            <SearchBox
              query={filters.searchQuery}
              onQueryChange={(query) => handleFilterChange({ ...filters, searchQuery: query })}
              onSelectCountry={(iso3) => handleSelectCountry(iso3)}
              onSelectInstrument={handleSelectInstrument}
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
            <DataActions filters={filters} onOpenMethodology={() => setShowMethodology(true)} />
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
        <div data-filter-toolbar className="relative z-30 shrink-0 border-b border-canvas-line bg-canvas-surface px-4 py-1">
          <Filters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        </div>
      )}

      {/* Main canvas — switches between Map / Network / Timeline lenses */}
      <main id="main-content" tabIndex={-1} className="relative z-0 flex-1 overflow-hidden">
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
            mapCenter={mapView.center}
            mapZoom={mapView.zoom}
            mapFitTarget={mapView.fitTarget}
            mapMode={mapMode}
            contextFillByIso3={contextFillByIso3}
          />
        )}
        {lens === "workbench" && (
          <Suspense fallback={<LensFallback />}>
            <WorkbenchView
              filters={filters}
              onFiltersChange={handleFilterChange}
              onSelectCountry={handleSelectCountry}
              onSelectLab={handleSelectLab}
              onSelectInstrument={handleSelectInstrument}
              onOpenMethodology={() => setShowMethodology(true)}
              onOpenAtlasMapMode={handleOpenAtlasMapMode}
              workbenchState={workbenchState}
              onWorkbenchStateChange={setWorkbenchState}
              routeRecord={routeRecord}
            />
          </Suspense>
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
          <div className="absolute left-2 top-2 z-20 flex max-w-[calc(100%-8.5rem)] flex-wrap items-center gap-0.5 rounded-lg border border-canvas-line bg-white/90 p-0.5 shadow-panel backdrop-blur sm:left-4 sm:top-3 sm:max-w-none">
            <label htmlFor="map-focus-select" className="sr-only">
              Map focus
            </label>
            <select
              id="map-focus-select"
              aria-label="Map focus"
              value={mapView.fitTarget ? "results" : mapView.focusId}
              onChange={(event) => handleMapFocusChange(event.target.value)}
              className="h-7 max-w-20 rounded-md border border-canvas-line bg-white px-1.5 text-[11px] font-medium text-ink-800 outline-none hover:border-ink-400 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:max-w-32"
            >
              {mapView.focusId === "custom" && <option value="custom">Custom</option>}
              {mapView.fitTarget && <option value="results">Results</option>}
              {MAP_FOCUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <label htmlFor="map-mode-select" className="sr-only">
              Map color mode
            </label>
            <select
              id="map-mode-select"
              aria-label="Map color mode"
              value={mapMode}
              onChange={(event) => setMapMode(event.target.value as MapModeId)}
              className="h-7 max-w-28 rounded-md border border-canvas-line bg-white px-1.5 text-[11px] font-medium text-ink-800 outline-none hover:border-ink-400 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:max-w-36"
            >
              {MAP_MODE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCountryList((next) => !next)}
              aria-label="Country list"
              aria-expanded={showCountryList}
              className="inline-flex h-7 items-center justify-center rounded-md border border-canvas-line bg-white px-1.5 text-[10px] font-semibold text-ink-700 hover:border-accent hover:text-accent sm:px-2"
            >
              <span className="sm:hidden">List</span>
              <span className="hidden sm:inline">Country list</span>
            </button>
            {resultFitTarget && (
              <button
                type="button"
                onClick={handleZoomToResults}
                aria-label={`Zoom to results: ${resultFitTarget.label}`}
                className="inline-flex h-7 items-center justify-center rounded-md border border-accent/30 bg-accent/10 px-1.5 text-[10px] font-semibold text-accent hover:bg-accent/15 sm:px-2"
              >
                <span className="sm:hidden">Fit</span>
                <span className="hidden sm:inline">Zoom to results</span>
              </button>
            )}
            <span
              role="status"
              aria-live="polite"
              aria-label={`Map scope: ${mapScopeReadout}`}
              title={mapScopeTitle}
              className={
                resultFitScope.isNoMatch
                  ? "order-last w-full truncate rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 sm:order-none sm:w-auto sm:max-w-40"
                  : mapView.fitTarget
                    ? "order-last w-full truncate rounded-md border border-accent/20 bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent sm:order-none sm:w-auto sm:max-w-40"
                    : resultFitTarget
                      ? "order-last w-full truncate rounded-md border border-canvas-line bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-ink-600 sm:order-none sm:w-auto sm:max-w-40"
                      : "order-last w-full truncate rounded-md border border-canvas-line bg-white px-1.5 py-0.5 text-[10px] font-semibold text-ink-500 sm:order-none sm:w-auto sm:max-w-32"
              }
            >
              <span className="hidden sm:inline">{mapScopeReadout}</span>
              <span className="sm:hidden">{compactMapScopeReadout}</span>
            </span>
            <button
              type="button"
              onClick={() => handleMapZoom(-MAP_ZOOM_STEP)}
              disabled={mapView.zoom <= MAP_ZOOM_MIN}
              aria-label="Zoom map out"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-canvas-line bg-white text-xs font-semibold text-ink-800 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              -
            </button>
            <span className="hidden min-w-8 text-center text-[11px] font-semibold text-ink-500 sm:inline">
              {mapView.fitTarget ? "Fit" : `${mapView.zoom.toFixed(1)}x`}
            </span>
            <button
              type="button"
              onClick={() => handleMapZoom(MAP_ZOOM_STEP)}
              disabled={mapView.zoom >= MAP_ZOOM_MAX}
              aria-label="Zoom map in"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-canvas-line bg-white text-xs font-semibold text-ink-800 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleMapReset}
              aria-label="Reset map view"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-canvas-line bg-white text-[11px] font-semibold text-ink-700 hover:border-accent hover:text-accent sm:w-auto sm:px-1.5"
            >
              <svg
                aria-hidden="true"
                className="sm:hidden"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v6h6" />
              </svg>
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        )}

        {showsMap && showCountryList && (
          <Suspense fallback={null}>
            <MapCountryList
              filters={filters}
              lens={lens}
              mapMode={mapMode}
              contextReasonByIso3={contextReasonByIso3}
              onSelectCountry={handleSelectCountry}
              onClose={() => setShowCountryList(false)}
            />
          </Suspense>
        )}

        {showsMap && (
          <button
            type="button"
            onClick={() => setIsMapMaximized((next) => !next)}
            aria-label={mapChromeHidden ? "Exit maximize" : "Maximize map"}
            aria-pressed={mapChromeHidden}
            className="absolute right-2 top-2 z-20 inline-flex h-10 items-center gap-1.5 rounded-md border border-canvas-line bg-white/90 px-2.5 text-xs font-semibold text-ink-800 shadow-panel backdrop-blur hover:border-accent hover:text-accent sm:right-4 sm:top-3 sm:h-auto sm:py-1.5"
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
            <span className="hidden sm:inline">{mapChromeHidden ? "Exit maximize" : "Maximize map"}</span>
            <span className="sm:hidden">{mapChromeHidden ? "Exit" : "Max"}</span>
          </button>
        )}

        {/* Floating legend + lab toggle, bottom-left */}
        {showsMap && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs space-y-2">
            <div className="pointer-events-auto">
              <Legend key={mapChromeHidden ? "maximized" : "normal"} mapMode={mapMode} />
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
              Sources: EUR-Lex · OECD · UNESCO · CoE · ISO · GOV.UK · NIST · CAC · MSIT · IMDA · MeitY · AU · ASEAN · APEC · Oxford Insights · CAIDP · Stanford HAI
            </p>
          </div>
        )}

        {selectedIso3 && (
          <Suspense fallback={null}>
            <CountrySidePanel
              iso3={selectedIso3}
              onClose={() => setSelectedIso3(null)}
              onSelectLab={handleSelectLab}
              onPinCountry={() => toggleCompareItem({ kind: "country", id: selectedIso3 })}
              isCountryPinned={isComparePinned("country", selectedIso3)}
              onPinLab={(labId) => toggleCompareItem({ kind: "lab", id: labId })}
              isLabPinned={(labId) => isComparePinned("lab", labId)}
              onPinInstrument={(instrumentId) => toggleCompareItem({ kind: "instrument", id: instrumentId })}
              isInstrumentPinned={(instrumentId) => isComparePinned("instrument", instrumentId)}
              lens={lens}
              mapMode={mapMode}
              contextReason={contextReasonByIso3?.[selectedIso3]}
            />
          </Suspense>
        )}

        {selectedLabId && (
          <Suspense fallback={null}>
            <LabSidePanel
              labId={selectedLabId}
              onClose={() => setSelectedLabId(null)}
              onPinLab={() => toggleCompareItem({ kind: "lab", id: selectedLabId })}
              isLabPinned={isComparePinned("lab", selectedLabId)}
            />
          </Suspense>
        )}

        {compareItems.length > 0 && (
          <Suspense fallback={null}>
            <ComparisonTray
              items={compareItems}
              onRemove={removeCompareItem}
              onClear={() => setCompareItems([])}
              onOpenCountry={handleSelectCountry}
              onOpenLab={handleSelectLab}
              onOpenInstrument={handleSelectInstrument}
              drawerOpen={Boolean(selectedIso3 || selectedLabId)}
            />
          </Suspense>
        )}
      </main>

      {hover && showsMap && !hoverLab && (
        <Suspense fallback={null}>
          <CountryTooltip
            iso3={hover.iso3}
            countryName={hover.name}
            x={hover.x}
            y={hover.y}
            activeFilterInstrumentIds={filters.selectedInstrumentIds}
            lens={lens}
            mapMode={mapMode}
            contextReason={contextReasonByIso3?.[hover.iso3]}
          />
        </Suspense>
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
        <Suspense fallback={null}>
          <WalkthroughOverlay
            stepIndex={walkthroughStep}
            onStepChange={setWalkthroughStep}
            onApplyStep={handleWalkthroughApply}
            onClose={() => setWalkthroughStep(null)}
          />
        </Suspense>
      )}

      {showMethodology && (
        <Suspense fallback={null}>
          <MethodologyPanel onClose={() => setShowMethodology(false)} />
        </Suspense>
      )}

      <SpeedInsights />
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number(value.toFixed(2))));
}

function createFitMapView(target: MapFitTarget): MapViewState {
  return {
    focusId: "results",
    zoom: 1,
    fitTarget: target,
  };
}
