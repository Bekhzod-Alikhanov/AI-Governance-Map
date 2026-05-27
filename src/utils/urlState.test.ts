import { describe, expect, it } from "vitest";
import { parseShareableState, serializeShareableState } from "./urlState";
import { DEFAULT_FILTER_STATE } from "../types";

describe("shareable URL state", () => {
  it("round-trips lens, filters, selection, and network settings", () => {
    const serialized = serializeShareableState({
      lens: "network",
      filters: {
        ...DEFAULT_FILTER_STATE,
        selectedInstrumentIds: ["coe-ai-convention"],
        selectedParticipationTypes: ["signed", "ratified"],
        selectedBindingStatuses: ["binding_on_parties"],
        selectedOrganizations: ["Council of Europe"],
        searchQuery: "convention",
      },
      selectedIso3: "GBR",
      selectedLabId: null,
      networkSelection: "coe-ai-convention",
      networkPreset: "summit-process",
      networkDensity: "core",
      networkFrontierOnly: true,
      timelineLane: "standards",
    });

    const parsed = parseShareableState(serialized);
    expect(parsed.lens).toBe("network");
    expect(parsed.filters.selectedInstrumentIds).toEqual(["coe-ai-convention"]);
    expect(parsed.filters.selectedParticipationTypes).toEqual(["signed", "ratified"]);
    expect(parsed.filters.selectedBindingStatuses).toEqual(["binding_on_parties"]);
    expect(parsed.filters.selectedOrganizations).toEqual(["Council of Europe"]);
    expect(parsed.filters.searchQuery).toBe("convention");
    expect(parsed.selectedIso3).toBe("GBR");
    expect(parsed.networkSelection).toBe("coe-ai-convention");
    expect(parsed.networkPreset).toBe("summit-process");
    expect(parsed.networkDensity).toBe("core");
    expect(parsed.networkFrontierOnly).toBe(true);
    expect(parsed.timelineLane).toBe("standards");
  });

  it("drops invalid values rather than trusting arbitrary URLs", () => {
    const parsed = parseShareableState("?lens=bad&inst=bad-id&country=NOPE&density=nope");
    expect(parsed.lens).toBe("geography");
    expect(parsed.filters.selectedInstrumentIds).toEqual([]);
    expect(parsed.selectedIso3).toBeNull();
    expect(parsed.networkDensity).toBe("all");
  });
});
