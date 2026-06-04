import { useMemo, useRef, useState, useEffect } from "react";
import { geoEqualEarth, geoPath, type GeoPermissibleObjects, type GeoProjection } from "d3-geo";
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from "react-simple-maps";
import type { ProjectionFunction } from "react-simple-maps";
import { feature } from "topojson-client";
import type { Feature } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { FilterState, FrontierLab, LensKind, MapFitTarget, MapModeId } from "../types";
import { numericToAlpha3 } from "../utils/normalizeCountry";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { filterCountries } from "../utils/filterCountries";
import { getMapStyle } from "../utils/getMapColor";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { LAB_COORDINATES, LabPin } from "./LabPin";
import { activateOnKeyboard } from "../utils/keyboardActivation";
// Bundle the world topojson locally — eliminates the unpkg round-trip and
// removes a known cause of first-paint stall when the CDN is slow/offline.
import worldTopo from "world-atlas/countries-110m.json";

const GEO_DATA = worldTopo as unknown as Parameters<typeof Geographies>[0]["geography"];
const TOPOLOGY = worldTopo as unknown as Topology<{ countries: GeometryCollection }>;
type CountryFeature = Feature & {
  id?: string | number;
  properties?: { id?: string | number } | null;
};
const RAW_COUNTRY_FEATURES = feature(TOPOLOGY, TOPOLOGY.objects.countries) as unknown as {
  type: "FeatureCollection";
  features: CountryFeature[];
};
const FITTED_COUNTRY_FEATURES = {
  ...RAW_COUNTRY_FEATURES,
  features: RAW_COUNTRY_FEATURES.features.filter((geo) => featureIso3(geo) !== "ATA"),
} as unknown as GeoPermissibleObjects;
const MAP_SIDE_PADDING = 8;
const MAP_TOP_PADDING = 2;
const MAP_BOTTOM_PADDING = 6;
const FIT_SIDE_PADDING = 80;
const FIT_TOP_PADDING = 60;
const FIT_BOTTOM_PADDING = 96;
const FIT_MOBILE_SIDE_PADDING = 24;
const FIT_MOBILE_TOP_PADDING = 60;
const FIT_MOBILE_BOTTOM_PADDING = 132;
const FIT_TOP_SLACK = 16;
const FIT_POINT_PADDING = 26;

const BASE_COUNTRY_BOUNDS = geoPath(
  geoEqualEarth().scale(1).center([10, 10]).translate([0, 0])
).bounds(FITTED_COUNTRY_FEATURES);

const COUNTRY_FEATURE_BY_ISO3 = new Map<string, CountryFeature>();
for (const geo of RAW_COUNTRY_FEATURES.features) {
  const iso3 = featureIso3(geo);
  if (iso3) COUNTRY_FEATURE_BY_ISO3.set(iso3, geo);
}

interface Props {
  filters: FilterState;
  selectedIso3: string | null;
  selectedLabId: string | null;
  onSelectCountry: (iso3: string) => void;
  onSelectLab: (id: string) => void;
  onHover: (data: { iso3: string; name: string; x: number; y: number } | null) => void;
  onHoverLab?: (data: { lab: FrontierLab; x: number; y: number } | null) => void;
  showLabs: boolean;
  lens: LensKind;
  scaleBoost?: number;
  mapCenter?: [number, number];
  mapZoom?: number;
  mapFitTarget?: MapFitTarget | null;
  mapMode?: MapModeId;
  contextFillByIso3?: Record<string, string> | null;
}

export function WorldMap({
  filters,
  selectedIso3,
  selectedLabId,
  onSelectCountry,
  onSelectLab,
  onHover,
  onHoverLab,
  showLabs,
  lens,
  scaleBoost = 1,
  mapCenter,
  mapZoom = 1,
  mapFitTarget,
  mapMode = "binding-law",
  contextFillByIso3,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origin: [number, number];
    moved: boolean;
    captured: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [dims, setDims] = useState({ width: 1200, height: 700 });
  const [panState, setPanState] = useState<{ key: string; offset: [number, number] }>({
    key: "",
    offset: [0, 0],
  });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        setDims({ width: Math.max(320, width), height: Math.max(280, height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const matchByIso = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const r of filterCountries(filters)) map[r.iso3] = r.matchesFilter;
    return map;
  }, [filters]);

  const projection = useMemo<GeoProjection>(() => {
    const [[x0, y0], [x1, y1]] = BASE_COUNTRY_BOUNDS;
    const boundedWidth = x1 - x0;
    const boundedHeight = y1 - y0;
    const availableWidth = Math.max(1, dims.width - MAP_SIDE_PADDING * 2);
    const availableHeight = Math.max(1, dims.height - MAP_TOP_PADDING - MAP_BOTTOM_PADDING);
    const scale = Math.min(
      availableWidth / boundedWidth,
      availableHeight / boundedHeight
    ) * scaleBoost;

    return geoEqualEarth()
      .scale(scale)
      .center([10, 10])
      .translate([
        dims.width / 2 - ((x0 + x1) / 2) * scale,
        MAP_TOP_PADDING - y0 * scale,
      ]);
  }, [dims.width, dims.height, scaleBoost]);

  const projectedCountryBounds = useMemo(
    () => geoPath(projection).bounds(FITTED_COUNTRY_FEATURES),
    [projection]
  );

  const projectedFitBounds = useMemo(() => {
    if (!mapFitTarget) return null;
    return getProjectedFitBounds(mapFitTarget, projection);
  }, [mapFitTarget, projection]);

  const baseMapTransform = useMemo(() => {
    if (projectedFitBounds) {
      const [[x0, y0], [x1, y1]] = projectedFitBounds;
      const boundedWidth = Math.max(1, x1 - x0);
      const boundedHeight = Math.max(1, y1 - y0);
      const isCompact = dims.width < 640;
      const sidePadding = isCompact ? FIT_MOBILE_SIDE_PADDING : FIT_SIDE_PADDING;
      const topPadding = isCompact ? FIT_MOBILE_TOP_PADDING : FIT_TOP_PADDING;
      const bottomPadding = isCompact ? FIT_MOBILE_BOTTOM_PADDING : FIT_BOTTOM_PADDING;
      const availableWidth = Math.max(1, dims.width - sidePadding * 2);
      const availableHeight = Math.max(1, dims.height - topPadding - bottomPadding);
      const fitZoom = clamp(
        Math.min(availableWidth / boundedWidth, availableHeight / boundedHeight),
        1,
        4
      );
      const zoom = clamp(fitZoom * mapZoom, 1, 4);
      const fittedHeight = boundedHeight * zoom;
      const centeredTop = topPadding + (availableHeight - fittedHeight) / 2;
      const targetTop = topPadding + Math.max(0, Math.min(FIT_TOP_SLACK, centeredTop - topPadding));

      return {
        x: dims.width / 2 - ((x0 + x1) / 2) * zoom,
        y: targetTop - y0 * zoom,
        k: zoom,
      };
    }

    const focusPoint = mapCenter
      ? projection(mapCenter)
      : [
          (projectedCountryBounds[0][0] + projectedCountryBounds[1][0]) / 2,
          (projectedCountryBounds[0][1] + projectedCountryBounds[1][1]) / 2,
        ];
    if (!focusPoint) return { x: 0, y: 0, k: mapZoom };

    const targetPoint = mapCenter
      ? [dims.width / 2, dims.height / 2]
      : focusPoint;

    return {
      x: targetPoint[0] - focusPoint[0] * mapZoom,
      y: targetPoint[1] - focusPoint[1] * mapZoom,
      k: mapZoom,
    };
  }, [dims.height, dims.width, mapCenter, mapZoom, projectedCountryBounds, projectedFitBounds, projection]);

  const panKey = `${baseMapTransform.x}:${baseMapTransform.y}:${baseMapTransform.k}`;
  const panOffset = panState.key === panKey ? panState.offset : ([0, 0] as [number, number]);

  const appliedMapTransform = {
    x: baseMapTransform.x + panOffset[0],
    y: baseMapTransform.y + panOffset[1],
    k: baseMapTransform.k,
  };

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: panOffset,
      moved: false,
      captured: false,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    if (!drag.captured) {
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.captured = true;
    }
    suppressClickRef.current = true;
    setPanState({ key: panKey, offset: [drag.origin[0] + dx, drag.origin[1] + dy] });
  }

  function endPointerDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.captured && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  return (
    <div
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerDrag}
      onPointerCancel={endPointerDrag}
      className="relative h-full w-full overflow-hidden bg-canvas-surface"
    >
      <ComposableMap
        projection={projection as unknown as ProjectionFunction}
        width={dims.width}
        height={dims.height}
        style={{ width: "100%", height: "100%" }}
      >
        <g
          transform={`translate(${appliedMapTransform.x} ${appliedMapTransform.y}) scale(${appliedMapTransform.k})`}
        >
          <Sphere id="globe-sphere" stroke="#E2E8F0" strokeWidth={0.5} fill="#F8FAFC" />
          <Graticule stroke="#E2E8F0" strokeWidth={0.4} step={[20, 20]} />
          <Geographies geography={GEO_DATA}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericId = (geo.id as string) ?? geo.properties?.id;
                const iso3 = numericToAlpha3(numericId);
                if (iso3 === "ATA") return null;
                if (!iso3 || !COUNTRY_BY_ISO3[iso3]) {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { fill: "#E5E7EB", stroke: "#CBD5E1", strokeWidth: 0.4, outline: "none" },
                        hover: { fill: "#E5E7EB", outline: "none" },
                        pressed: { fill: "#E5E7EB", outline: "none" },
                      }}
                    />
                  );
                }

                const matches = matchByIso[iso3] ?? true;
                const style = getMapStyle(iso3, filters, matches, lens, mapMode, contextFillByIso3?.[iso3]);
                const isSelected = selectedIso3 === iso3;
                const hoverFill = adjustColor(style.fill, -10);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (suppressClickRef.current) return;
                      onSelectCountry(iso3);
                    }}
                    onKeyDown={(event) => activateOnKeyboard(event, () => onSelectCountry(iso3))}
                    onMouseEnter={(e) => {
                      onHover({
                        iso3,
                        name: COUNTRY_BY_ISO3[iso3].name,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      onHover({
                        iso3,
                        name: COUNTRY_BY_ISO3[iso3].name,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseLeave={() => onHover(null)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${COUNTRY_BY_ISO3[iso3].name} - open country details`}
                    style={{
                      default: {
                        fill: style.fill,
                        stroke: isSelected ? "#0F172A" : style.outline,
                        strokeWidth: isSelected ? 1.5 : style.strokeWidth,
                        strokeDasharray: style.strokeDasharray,
                        opacity: style.opacity,
                        outline: "none",
                        cursor: "pointer",
                        transition: "fill 120ms ease-out, opacity 120ms ease-out",
                      },
                      hover: {
                        fill: hoverFill,
                        stroke: "#0F172A",
                        strokeWidth: 1.2,
                        opacity: 1,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: hoverFill,
                        stroke: "#0F172A",
                        strokeWidth: 1.5,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {showLabs &&
            FRONTIER_LABS.map((lab) => {
              const dimmed =
                filters.selectedLabIds.length > 0 &&
                !filters.selectedLabIds.includes(lab.id);
              return (
                <LabPin
                  key={lab.id}
                  lab={lab}
                  selected={selectedLabId === lab.id}
                  dimmed={dimmed}
                  onClick={(id) => {
                    if (suppressClickRef.current) return;
                    onSelectLab(id);
                  }}
                  onHover={(l, e) => {
                    if (!onHoverLab) return;
                    if (l && e) onHoverLab({ lab: l, x: e.clientX, y: e.clientY });
                    else onHoverLab(null);
                  }}
                />
              );
            })}
        </g>
      </ComposableMap>
    </div>
  );
}

function featureIso3(geo: { id?: string | number; properties?: { id?: string | number } | null }) {
  return numericToAlpha3(geo.id ?? geo.properties?.id);
}

function getProjectedFitBounds(target: MapFitTarget, projection: GeoProjection) {
  const path = geoPath(projection);
  const bounds: Array<[[number, number], [number, number]]> = [];

  for (const iso3 of target.countryIso3s) {
    const geo = COUNTRY_FEATURE_BY_ISO3.get(iso3);
    if (!geo) continue;
    bounds.push(path.bounds(geo as GeoPermissibleObjects));
  }

  for (const labId of target.labIds) {
    const projected = projection(LAB_COORDINATES[labId]);
    if (!projected) continue;
    const [x, y] = projected;
    bounds.push([
      [x - FIT_POINT_PADDING, y - FIT_POINT_PADDING],
      [x + FIT_POINT_PADDING, y + FIT_POINT_PADDING],
    ]);
  }

  if (bounds.length === 0) return null;

  return bounds.reduce<[[number, number], [number, number]]>(
    (acc, bound) => [
      [Math.min(acc[0][0], bound[0][0]), Math.min(acc[0][1], bound[0][1])],
      [Math.max(acc[1][0], bound[1][0]), Math.max(acc[1][1], bound[1][1])],
    ],
    bounds[0]
  );
}

function adjustColor(hex: string, percent: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + percent));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + percent));
  const b = Math.max(0, Math.min(255, (n & 255) + percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number(value.toFixed(2))));
}
