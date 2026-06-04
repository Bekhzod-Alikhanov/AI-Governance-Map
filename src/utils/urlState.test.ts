import { describe, expect, it } from "vitest";
import { parseShareableState, serializeShareableState } from "./urlState";
import { DEFAULT_FILTER_STATE, DEFAULT_WORKBENCH_STATE } from "../types";

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
        selectedObligationCategories: ["incident_reporting"],
        selectedDomains: ["frontier-gpai"],
        selectedImplementationStatuses: ["phased_application"],
        searchQuery: "convention",
      },
      selectedIso3: "GBR",
      selectedLabId: null,
      networkSelection: "coe-ai-convention",
      networkPreset: "summit-process",
      networkDensity: "core",
      networkFrontierOnly: true,
      timelineLane: "standards",
      workbench: DEFAULT_WORKBENCH_STATE,
    });

    const parsed = parseShareableState(serialized);
    expect(parsed.lens).toBe("network");
    expect(parsed.filters.selectedInstrumentIds).toEqual(["coe-ai-convention"]);
    expect(parsed.filters.selectedParticipationTypes).toEqual(["signed", "ratified"]);
    expect(parsed.filters.selectedBindingStatuses).toEqual(["binding_on_parties"]);
    expect(parsed.filters.selectedOrganizations).toEqual(["Council of Europe"]);
    expect(parsed.filters.selectedObligationCategories).toEqual(["incident_reporting"]);
    expect(parsed.filters.selectedDomains).toEqual(["frontier-gpai"]);
    expect(parsed.filters.selectedImplementationStatuses).toEqual(["phased_application"]);
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

  it("round-trips workbench comparison, scenario, atlas, and active question state", () => {
    const serialized = serializeShareableState({
      lens: "workbench",
      filters: DEFAULT_FILTER_STATE,
      selectedIso3: null,
      selectedLabId: null,
      networkSelection: null,
      networkPreset: "all",
      networkDensity: "all",
      networkFrontierOnly: false,
      timelineLane: "all",
      workbench: {
        compareKind: "exposure",
        compareId: "openai--market_access--eu-ai-act-regional",
        compareItems: [
          { kind: "obligation", id: "ca-sb-53-incident-reporting" },
          { kind: "exposure", id: "openai--market_access--eu-ai-act-regional" },
        ],
        scenarioLabId: "anthropic",
        scenarioMarkets: ["EUU", "USA"],
        atlasPresetId: "ram-activity",
        activeWorkflowId: null,
        activeQuestionId: "incident-reporting",
        activeAnswerCardId: "binding-obligations",
      },
    });

    const parsed = parseShareableState(serialized);
    expect(parsed.lens).toBe("workbench");
    expect(parsed.workbench.compareKind).toBe("exposure");
    expect(parsed.workbench.compareId).toBe("openai--market_access--eu-ai-act-regional");
    expect(parsed.workbench.compareItems).toEqual([
      { kind: "obligation", id: "ca-sb-53-incident-reporting" },
      { kind: "exposure", id: "openai--market_access--eu-ai-act-regional" },
    ]);
    expect(parsed.workbench.scenarioLabId).toBe("anthropic");
    expect(parsed.workbench.scenarioMarkets).toEqual(["EUU", "USA"]);
    expect(parsed.workbench.atlasPresetId).toBe("ram-activity");
    expect(parsed.workbench.activeQuestionId).toBe("incident-reporting");
    expect(parsed.workbench.activeAnswerCardId).toBe("binding-obligations");
  });
});
