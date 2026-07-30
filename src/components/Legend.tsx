import { useState } from "react";
import type { MapModeId } from "../types";

export interface LegendFill {
  color: string;
  label: string;
  dashed?: boolean;
}

const FILLS: LegendFill[] = [
  { color: "#E5E7EB", label: "No included AI-specific entry" },
  { color: "#C4B5FD", label: "International participation only; no national rule" },
  { color: "#BFDBFE", label: "Guidance, strategy, or voluntary framework only" },
  { color: "#60A5FA", label: "Proposed law or mixed legal effect" },
  { color: "#1D4ED8", label: "Binding AI-specific law applies" },
];

/**
 * Keys for the modes coloured by `getMapColor.ts`.
 *
 * These used to fall through to the binding-law key above, so seven of the
 * seventeen modes shipped with a legend describing a different mode. The worst
 * case was cosmetic-looking and wasn't: `treaty-participation` painted 151
 * countries `#EDE9FE`, a colour absent from the key entirely, while the swatch
 * the reader could see labelled `#1D4ED8` "Binding AI-specific law applies".
 *
 * Every colour below is lifted from the branch in `getMapStyle` that produces
 * it, and `Legend.test.tsx` asserts the two cannot drift apart again.
 */
const BASE_MODE_FILLS: Partial<Record<MapModeId, LegendFill[]>> = {
  "binding-law": FILLS,
  "proposed-law": [
    { color: "#E5E7EB", label: "No proposed or mixed-effect national rule" },
    { color: "#60A5FA", label: "Proposed law or mixed legal effect" },
  ],
  "treaty-participation": [
    { color: "#E5E7EB", label: "No international participation rows" },
    { color: "#EDE9FE", label: "Other international participation only" },
    { color: "#C4B5FD", label: "Signed the CoE AI Convention; not ratified", dashed: true },
    { color: "#7C3AED", label: "Ratified, or applicable via EU accession" },
  ],
  "lab-hq": [
    { color: "#E5E7EB", label: "No tracked frontier-lab headquarters" },
    { color: "#B45309", label: "Frontier-lab headquarters" },
  ],
  "obligation-type": [
    { color: "#E5E7EB", label: "No obligation rows match the active filters" },
    { color: "#99F6E4", label: "Obligation rows tracked; none binding" },
    { color: "#0F766E", label: "At least one binding obligation" },
  ],
  "implementation-deadline": [
    { color: "#E5E7EB", label: "No implementation milestones tracked" },
    { color: "#FDBA74", label: "Milestones tracked; none in force or upcoming" },
    { color: "#16A34A", label: "At least one milestone in force" },
    { color: "#EA580C", label: "Upcoming implementation deadline" },
  ],
};

/**
 * The key for a mode, in the order a reader should scan it: absence first, then
 * increasing strength. Exported so the regression test can compare it against
 * the fills the map actually renders for the same mode.
 */
export function legendFillsForMode(mapMode: MapModeId): LegendFill[] {
  if (ATLAS_MODES.includes(mapMode)) return atlasFillsForMode(mapMode);
  if (CORPUS_MODES.includes(mapMode)) return corpusFillsForMode(mapMode);
  return BASE_MODE_FILLS[mapMode] ?? FILLS;
}

const INSTRUMENT_MATCH_OUTLINE = {
  color: "#B45309",
  label: "Matches selected international instrument",
  dashed: false,
};

// The treaty outlines are drawn only on the binding-law path of `getMapStyle`;
// every other mode leaves the outline at base or instrument-match. Advertising
// them everywhere was the outline half of the same key-describes-another-mode
// bug as the fills above.
const TREATY_OUTLINES = [
  { color: "#6D28D9", label: "Ratified binding AI treaty", dashed: false },
  { color: "#6D28D9", label: "Signed only; not ratified", dashed: true },
];

function outlinesForMode(mapMode: MapModeId) {
  return mapMode === "binding-law"
    ? [INSTRUMENT_MATCH_OUTLINE, ...TREATY_OUTLINES]
    : [INSTRUMENT_MATCH_OUTLINE];
}

const ATLAS_MODES: MapModeId[] = [
  "gov-ai-readiness",
  "democratic-values",
  "unesco-ram-status",
];

const CORPUS_MODES: MapModeId[] = [
  "ai-institutions",
  "policy-windows",
  "public-sector-ai",
  "enforcement-activity",
  "standards-conformity",
];

interface Props {
  mapMode?: MapModeId;
}

export function Legend({ mapMode = "binding-law" }: Props) {
  // Open by default: a choropleth whose key is hidden on arrival gives the
  // reader colour without meaning.
  const [open, setOpen] = useState(true);
  const isAtlasMode = ATLAS_MODES.includes(mapMode);
  const isCorpusMode = CORPUS_MODES.includes(mapMode);
  const fills = legendFillsForMode(mapMode);
  return (
    <div className="rounded-xl border border-canvas-line bg-white shadow-panel">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Legend
        </span>
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
          className={`text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="grid gap-3 border-t border-canvas-line px-4 py-3 text-xs text-ink-700 md:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Country fill
            </p>
            <ul className="space-y-1.5">
              {fills.map((f) => (
                <li key={f.label} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3.5 w-5 rounded-sm"
                    style={{
                      backgroundColor: f.color,
                      // The dashed border is how the map marks signed-not-ratified,
                      // so the swatch has to carry it too or the key is incomplete.
                      border: f.dashed ? "1px dashed #6D28D9" : "1px solid rgba(100,116,139,0.3)",
                    }}
                  />
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Outline
            </p>
            <ul className="space-y-1.5">
              {outlinesForMode(mapMode).map((o) => (
                <li key={o.label} className="flex items-center gap-2">
                  <svg width="20" height="14" viewBox="0 0 20 14">
                    <rect
                      x="1"
                      y="1"
                      width="18"
                      height="12"
                      rx="2"
                      fill="none"
                      stroke={o.color}
                      strokeWidth="1.5"
                      strokeDasharray={o.dashed ? "3 2" : undefined}
                    />
                  </svg>
                  <span>{o.label}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 pt-1 text-ink-500">
                <span className="inline-block h-3.5 w-5 rounded-sm bg-canvas-line opacity-25" />
                <span>Dimmed: does not match active filter</span>
              </li>
            </ul>
          </div>
          <p className="md:col-span-2 rounded-md bg-canvas px-2 py-1.5 text-[11px] leading-relaxed text-ink-600">
            {isAtlasMode
              ? "AI Atlas colors show contextual readiness, assessment, democratic-values, or ecosystem indicators. They do not imply binding AI law, legal compliance, or treaty participation."
              : isCorpusMode
                ? "Research-corpus colors show official-source context such as institutions, open policy windows, standards, registries, or enforcement records. They do not change binding-law summaries."
              : mapMode === "binding-law"
                ? "Map colors are dataset classifications, not legal conclusions. EU member states can show binding applicability through the EU AI Act rather than a separate national AI law."
                : "Map colors are dataset classifications, not legal conclusions. This mode recolors the map on a single dimension; it does not restate binding-law status."}
          </p>
        </div>
      )}
    </div>
  );
}

function corpusFillsForMode(mapMode: MapModeId) {
  if (mapMode === "ai-institutions") {
    return [
      { color: "#E5E7EB", label: "No mapped institution row" },
      { color: "#0F766E", label: "AI institution / authority context" },
    ];
  }
  if (mapMode === "policy-windows") {
    return [
      { color: "#E5E7EB", label: "No mapped policy-window row" },
      { color: "#EA580C", label: "Open or ongoing policy process" },
    ];
  }
  if (mapMode === "public-sector-ai") {
    return [
      { color: "#E5E7EB", label: "No public-sector AI row" },
      { color: "#2563EB", label: "Registry, AIA, or public-sector AI context" },
    ];
  }
  if (mapMode === "enforcement-activity") {
    return [
      { color: "#E5E7EB", label: "No official enforcement row" },
      { color: "#DC2626", label: "Official enforcement / litigation context" },
    ];
  }
  return [
    { color: "#E5E7EB", label: "No standards/conformity row" },
    { color: "#7C3AED", label: "Standards or conformity infrastructure context" },
  ];
}

function atlasFillsForMode(mapMode: MapModeId) {
  if (mapMode === "democratic-values") {
    return [
      { color: "#E5E7EB", label: "No CAIDP score" },
      { color: "#FEF3C7", label: "Lower score" },
      { color: "#FDE68A", label: "Moderate score" },
      { color: "#059669", label: "Higher score" },
      { color: "#065F46", label: "Highest score" },
    ];
  }
  if (mapMode === "unesco-ram-status") {
    return [
      { color: "#E5E7EB", label: "No UNESCO RAM/profile row" },
      { color: "#A7F3D0", label: "Profile available" },
      { color: "#93C5FD", label: "In preparation" },
      { color: "#F59E0B", label: "In process" },
      { color: "#16A34A", label: "Completed" },
    ];
  }
  return [
    { color: "#E5E7EB", label: "No Oxford score" },
    { color: "#DBEAFE", label: "Lower score" },
    { color: "#93C5FD", label: "Moderate score" },
    { color: "#2563EB", label: "Higher score" },
    { color: "#1E3A8A", label: "Highest score" },
  ];
}
