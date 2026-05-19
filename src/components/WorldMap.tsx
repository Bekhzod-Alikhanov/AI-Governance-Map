import { useMemo, useRef, useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from "react-simple-maps";
import type { FilterState } from "../types";
import { numericToAlpha3 } from "../utils/normalizeCountry";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { filterCountries } from "../utils/filterCountries";
import { getMapStyle } from "../utils/getMapColor";

const GEO_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

interface Props {
  filters: FilterState;
  selectedIso3: string | null;
  onSelectCountry: (iso3: string) => void;
  onHover: (data: { iso3: string; name: string; x: number; y: number } | null) => void;
}

export function WorldMap({ filters, selectedIso3, onSelectCountry, onHover }: Props) {
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

  const projectionConfig = useMemo(() => {
    // Pick the scale that lets the world fit either width or height of the
    // container, whichever is the tighter constraint. Equal Earth maps the
    // sphere into roughly 2.05 (width / height) at scale 1.
    const scaleByWidth = dims.width / 5.5;
    const scaleByHeight = dims.height / 2.7;
    return {
      scale: Math.max(120, Math.min(scaleByWidth, scaleByHeight)),
      center: [10, 12] as [number, number],
    };
  }, [dims.width, dims.height]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-hidden bg-canvas-surface"
    >
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={projectionConfig}
        width={dims.width}
        height={dims.height}
        style={{ width: "100%", height: "100%" }}
      >
        <Sphere id="globe-sphere" stroke="#E2E8F0" strokeWidth={0.5} fill="#F8FAFC" />
        <Graticule stroke="#E2E8F0" strokeWidth={0.4} step={[20, 20]} />
        <Geographies geography={GEO_URL}>
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
              const style = getMapStyle(iso3, filters, matches);
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
