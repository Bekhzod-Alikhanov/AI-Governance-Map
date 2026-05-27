import { describe, expect, it } from "vitest";
import { COUNTRIES } from "./countries";
import { FRONTIER_LABS } from "./frontierLabs";
import { INFRASTRUCTURE_NODES } from "./infrastructure";
import { INSTRUMENT_BY_ID } from "./internationalInstruments";
import { NATIONAL_REG_BY_ID } from "./nationalAIRegulations";
import { RESEARCH_PRESETS } from "./researchPresets";

describe("research presets", () => {
  it("defines stable question presets with valid referenced IDs", () => {
    expect(RESEARCH_PRESETS.length).toBeGreaterThanOrEqual(8);

    const nodeIds = new Set([
      ...COUNTRIES.map((country) => country.iso3),
      ...FRONTIER_LABS.map((lab) => lab.id),
      ...INFRASTRUCTURE_NODES.map((node) => node.id),
      ...Object.keys(INSTRUMENT_BY_ID),
      ...Object.keys(NATIONAL_REG_BY_ID),
    ]);

    for (const preset of RESEARCH_PRESETS) {
      expect(preset.id).toMatch(/^[a-z0-9-]+$/);
      expect(preset.title).toBeTruthy();
      expect(preset.description).toBeTruthy();
      for (const id of preset.filterPatch?.selectedInstrumentIds ?? []) {
        expect(INSTRUMENT_BY_ID[id]).toBeTruthy();
      }
      if (preset.selectedIso3) expect(nodeIds.has(preset.selectedIso3)).toBe(true);
      if (preset.selectedLabId) expect(nodeIds.has(preset.selectedLabId)).toBe(true);
      if (preset.selectedNetworkNodeId) expect(nodeIds.has(preset.selectedNetworkNodeId)).toBe(true);
    }
  });
});
