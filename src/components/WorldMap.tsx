import { useMemo, useRef, useState, useEffect } from "react";
import { geoEqualEarth, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from "react-simple-maps";
import type { ProjectionFunction } from "react-simple-maps";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { FilterState, FrontierLab, LensKind } from "../types";
import { numericToAlpha3 } from "../utils/normalizeCountry";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { filterCountries } from "../utils/filterCountries";
import { getMapStyle } from "../utils/getMapColor";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { LabPin } from "./LabPin";
// Bundle the world topojson locally — eliminates the unpkg round-trip and
// removes a known cause of first-paint stall when the CDN is slow/offline.
import worldTopo from "world-atlas/countries-110m.json";

const GEO_DATA = worldTopo as unknown as Parameters<typeof Geographies>[0]["geography"];
const TOPOLOGY = worldTopo as unknown as Topology<{ countries: GeometryCollection }>;
const COUNTRY_FEATURES = feature(TOPOLOGY, TOPOLOGY.objects.countries) as GeoPermissibleObjects;
const MAP_PADDING = 12;

const BASE_COUNTRY_BOUNDS = geoPath(
  geoEqualEarth().scale(1).center([10, 10]).translate([0, 0])
).bounds(COUNTRY_FEATURES);

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
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 1200, height: 700 });

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

  const projection = useMemo(() => {
    const [[x0, y0], [x1, y1]] = BASE_COUNTRY_BOUNDS;
    const boundedWidth = x1 - x0;
    const boundedHeight = y1 - y0;
    const availableWidth = Math.max(1, dims.width - MAP_PADDING * 2);
    const availableHeight = Math.max(1, dims.height - MAP_PADDING * 2);
    const scale = Math.min(
      availableWidth / boundedWidth,
      availableHeight / boundedHeight
    );

    return geoEqualEarth()
      .scale(scale)
      .center([10, 10])
      .translate([
        dims.width / 2 - ((x0 + x1) / 2) * scale,
        MAP_PADDING - y0 * scale,
      ]) as unknown as ProjectionFunction;
  }, [dims.width, dims.height]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-hidden bg-canvas-surface"
    >
      <ComposableMap
        projection={projection}
        width={dims.width}
        height={dims.height}
        style={{ width: "100%", height: "100%" }}
      >
        <Sphere id="globe-sphere" stroke="#E2E8F0" strokeWidth={0.5} fill="#F8FAFC" />
        <Graticule stroke="#E2E8F0" strokeWidth={0.4} step={[20, 20]} />
        <Geographies geography={GEO_DATA}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const numericId = (geo.id as string) ?? geo.properties?.id;
              const iso3 = numericToAlpha3(numericId);
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
              const style = getMapStyle(iso3, filters, matches, lens);
              const isSelected = selectedIso3 === iso3;
              const hoverFill = adjustColor(style.fill, -10);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => onSelectCountry(iso3)}
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
                  tabIndex={0}
                  aria-label={`${COUNTRY_BY_ISO3[iso3].name} — click for details`}
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
                onClick={onSelectLab}
                onHover={(l, e) => {
                  if (!onHoverLab) return;
                  if (l && e) onHoverLab({ lab: l, x: e.clientX, y: e.clientY });
                  else onHoverLab(null);
                }}
              />
            );
          })}
      </ComposableMap>
    </div>
  );
}

function adjustColor(hex: string, percent: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + percent));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + percent));
  const b = Math.max(0, Math.min(255, (n & 255) + percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}
