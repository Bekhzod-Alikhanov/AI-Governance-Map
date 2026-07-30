import { describe, expect, it } from "vitest";
import { legendFillsForMode } from "./Legend";
import { MAP_MODE_OPTIONS, DEFAULT_FILTER_STATE, type MapModeId } from "../types";
import { COUNTRIES } from "../data/countries";
import { getMapStyle } from "../utils/getMapColor";
import { buildAtlasMapContext } from "../utils/aiAtlas";
import { buildCorpusMapContext } from "../utils/researchCorpus";

const ATLAS_MODES: MapModeId[] = ["gov-ai-readiness", "democratic-values", "unesco-ram-status"];
const CORPUS_MODES: MapModeId[] = [
  "ai-institutions",
  "policy-windows",
  "public-sector-ai",
  "enforcement-activity",
  "standards-conformity",
];

// `buildAtlasMapContext` and `buildCorpusMapContext` both skip EUU, and the map
// has no topology feature for it either.
const ISO3 = COUNTRIES.map((country) => country.iso3).filter((iso3) => iso3 !== "EUU");

/** Every fill the map actually paints for a mode, across all countries. */
function renderedFills(mapMode: MapModeId): Set<string> {
  if (ATLAS_MODES.includes(mapMode)) {
    const { fills } = buildAtlasMapContext(mapMode);
    return new Set(ISO3.map((iso3) => fills[iso3]));
  }
  if (CORPUS_MODES.includes(mapMode)) {
    const { fills } = buildCorpusMapContext(mapMode);
    return new Set(ISO3.map((iso3) => fills[iso3]));
  }
  return new Set(
    ISO3.map((iso3) => getMapStyle(iso3, DEFAULT_FILTER_STATE, true, mapMode).fill)
  );
}

describe("map legend", () => {
  // The bug this exists to prevent: `Legend` fell through to the hardcoded
  // binding-law key for every mode it did not explicitly handle, so seven modes
  // shipped a key describing a different mode. `frontier-relevance` painted all
  // 192 countries #1D4ED8 while the key on screen called #1D4ED8 "Binding
  // AI-specific law applies" — the artifact asserting something false.
  it.each(MAP_MODE_OPTIONS.map((option) => option.id))(
    "%s: every colour the map paints appears in the legend",
    (mapMode) => {
      const legendColours = new Set(legendFillsForMode(mapMode).map((fill) => fill.color));
      const unexplained = [...renderedFills(mapMode)].filter((fill) => !legendColours.has(fill));
      expect(unexplained).toEqual([]);
    }
  );

  it("gives each mode its own key rather than reusing the binding-law one", () => {
    const bindingLaw = JSON.stringify(legendFillsForMode("binding-law"));
    const reused = MAP_MODE_OPTIONS.map((option) => option.id)
      .filter((id) => id !== "binding-law")
      .filter((id) => JSON.stringify(legendFillsForMode(id)) === bindingLaw);
    expect(reused).toEqual([]);
  });

  it("advertises the purple treaty outlines only where they are drawn", () => {
    // getMapStyle paints the ratified / signed-not-ratified outline in #6D28D9
    // on the binding-law path only; every other mode leaves the outline at base
    // (#94A3B8) or instrument-match (#B45309). Claiming the treaty outlines
    // elsewhere would be the outline version of the same key-describes-another-
    // mode bug.
    //
    // Note `treaty-participation` still *dashes* its outline for signed-only
    // countries — but in the base colour, not the treaty purple, and its legend
    // carries that dash on the swatch instead.
    const treatyOutline = (mapMode: MapModeId) =>
      ISO3.some((iso3) => getMapStyle(iso3, DEFAULT_FILTER_STATE, true, mapMode).outline === "#6D28D9");

    expect(treatyOutline("binding-law")).toBe(true);

    for (const mapMode of MAP_MODE_OPTIONS.map((option) => option.id)) {
      if (mapMode === "binding-law") continue;
      expect(treatyOutline(mapMode), `${mapMode} should not draw the purple treaty outline`).toBe(
        false
      );
    }
  });

  it("marks the signed-not-ratified tier as dashed wherever the map dashes it", () => {
    const dashedFills = new Set(
      ISO3.map((iso3) => getMapStyle(iso3, DEFAULT_FILTER_STATE, true, "treaty-participation"))
        .filter((style) => style.strokeDasharray)
        .map((style) => style.fill)
    );
    expect(dashedFills.size).toBeGreaterThan(0);

    const dashedInLegend = new Set(
      legendFillsForMode("treaty-participation")
        .filter((fill) => fill.dashed)
        .map((fill) => fill.color)
    );
    expect([...dashedFills].sort()).toEqual([...dashedInLegend].sort());
  });
});
