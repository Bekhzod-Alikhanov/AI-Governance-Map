import { useMemo, useRef, useState, useEffect } from "react";
import { geoEqualEarth, geoGraticule, geoPath, type GeoPermissibleObjects, type GeoProjection } from "d3-geo";
import type { FilterState, FrontierLab, MapFitTarget, MapModeId } from "../types";
import {
  featureIso3,
  loadWorldTopology,
  type WorldTopology,
} from "../utils/worldTopology";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { filterCountries } from "../utils/filterCountries";
import { getMapStyle } from "../utils/getMapColor";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { LAB_COORDINATES, LabPin } from "./LabPin";
import { activateOnKeyboard } from "../utils/keyboardActivation";
const GRATICULE = geoGraticule().step([20, 20])();
const SPHERE = { type: "Sphere" } as const;
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

interface Props {
  filters: FilterState;
  selectedIso3: string | null;
  selectedLabId: string | null;
  onSelectCountry: (iso3: string) => void;
  onSelectLab: (id: string) => void;
  onHover: (data: { iso3: string; name: string; x: number; y: number } | null) => void;
  onHoverLab?: (data: { lab: FrontierLab; x: number; y: number } | null) => void;
  showLabs: boolean;
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
  const [topology, setTopology] = useState<WorldTopology | null>(null);
  const [topologyError, setTopologyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadWorldTopology()
      .then((loaded) => {
        if (!cancelled) setTopology(loaded);
      })
      .catch((error: unknown) => {
        if (!cancelled) setTopologyError(error instanceof Error ? error.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    const [[x0, y0], [x1, y1]] = topology?.baseBounds ?? [
      [0, 0],
      [1, 1],
    ];
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
  }, [dims.width, dims.height, scaleBoost, topology]);

  const projectedCountryBounds = useMemo(
    () =>
      topology
        ? geoPath(projection).bounds(topology.fitted)
        : ([
            [0, 0],
            [dims.width, dims.height],
          ] as [[number, number], [number, number]]),
    [projection, topology, dims.width, dims.height]
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const projectedFitBounds = useMemo(() => {
    if (!mapFitTarget || !topology) return null;
    return getProjectedFitBounds(mapFitTarget, projection, topology);
  }, [mapFitTarget, projection, topology]);

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
      {topologyError && (
        <p role="alert" className="absolute inset-x-0 top-1/2 px-6 text-center text-sm text-ink-700">
          The world map could not load ({topologyError}). The country list under &ldquo;Country
          list&rdquo; lists the same data as text.
        </p>
      )}
      <svg
        className="world-map h-full w-full"
        viewBox={`0 0 ${dims.width} ${dims.height}`}
        width={dims.width}
        height={dims.height}
        // Not role="img": the map contains 167 focusable country buttons, and
        // role="img" declares the whole SVG one indivisible graphic, which axe
        // correctly flags as nested-interactive. A group names the collection
        // without claiming its children are decorative.
        role="group"
        aria-label="World map of AI governance status. Each country is a button."
      >
        <g
          transform={`translate(${appliedMapTransform.x} ${appliedMapTransform.y}) scale(${appliedMapTransform.k})`}
        >
          <path d={pathGenerator(SPHERE) ?? undefined} stroke="#E2E8F0" strokeWidth={0.5} fill="#F8FAFC" />
          <path d={pathGenerator(GRATICULE) ?? undefined} stroke="#E2E8F0" strokeWidth={0.4} fill="none" />
          {(topology?.features ?? []).map((geo, index) => {
            const iso3 = featureIso3(geo);
            const d = pathGenerator(geo as GeoPermissibleObjects);
            if (!d || iso3 === "ATA") return null;
            if (!iso3 || !COUNTRY_BY_ISO3[iso3]) {
              return (
                <path
                  key={`unmapped-${index}`}
                  d={d}
                  fill="#E5E7EB"
                  stroke="#CBD5E1"
                  strokeWidth={0.4}
                />
              );
            }

                const matches = matchByIso[iso3] ?? true;
                const style = getMapStyle(iso3, filters, matches, mapMode, contextFillByIso3?.[iso3]);
                const isSelected = selectedIso3 === iso3;
                const hoverFill = adjustColor(style.fill, -10);

                return (
                  <path
                    key={iso3}
                    d={d}
                    className="world-map__country"
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
                    style={
                      {
                        // Hover is CSS, not React state: re-rendering 179 paths on
                        // every pointer move is what a custom property avoids.
                        "--country-fill": style.fill,
                        "--country-hover-fill": hoverFill,
                        stroke: isSelected ? "#0F172A" : style.outline,
                        strokeWidth: isSelected ? 1.5 : style.strokeWidth,
                        strokeDasharray: style.strokeDasharray,
                        opacity: style.opacity,
                      } as React.CSSProperties
                    }
                  />
                );
          })}

          {showLabs &&
            FRONTIER_LABS.map((lab) => {
              const dimmed =
                filters.selectedLabIds.length > 0 &&
                !filters.selectedLabIds.includes(lab.id);
              const coords = LAB_COORDINATES[lab.id];
              const projected = coords ? projection(coords) : null;
              if (!projected) return null;
              return (
                <LabPin
                  key={lab.id}
                  lab={lab}
                  position={projected}
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
      </svg>
    </div>
  );
}

function getProjectedFitBounds(target: MapFitTarget, projection: GeoProjection, topology: WorldTopology) {
  const path = geoPath(projection);
  const bounds: Array<[[number, number], [number, number]]> = [];

  for (const iso3 of target.countryIso3s) {
    const geo = topology.byIso3.get(iso3);
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
