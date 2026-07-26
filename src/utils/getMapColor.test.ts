import { describe, expect, it } from "vitest";
import { DEFAULT_FILTER_STATE } from "../types";
import { getCountryMapSummary } from "./getCountryMapSummary";
import { getMapStyle, pickPrimaryLayer } from "./getMapColor";

const FILTERS = DEFAULT_FILTER_STATE;

const FILL = {
  empty: "#E5E7EB",
  guidance: "#BFDBFE",
  mixed: "#60A5FA",
  binding: "#1D4ED8",
  international: "#C4B5FD",
  corporate: "#B45309",
};

describe("pickPrimaryLayer", () => {
  it("ranks a binding national law above a frontier-lab HQ", () => {
    // USA has both: 7 lab HQs and a confirmed binding national rule.
    const usa = getCountryMapSummary("USA");
    expect(usa.hqLabCount).toBeGreaterThan(0);
    expect(usa.hasBindingNationalLaw).toBe(true);

    expect(pickPrimaryLayer("USA")).toBe("national_binding");
  });

  it("ranks a proposed national rule above a frontier-lab HQ", () => {
    // Canada hosts Cohere but its national AI rule is proposed, not binding.
    const can = getCountryMapSummary("CAN");
    expect(can.hqLabCount).toBeGreaterThan(0);
    expect(can.hasBindingNationalLaw).toBe(false);
    expect(can.proposedNationalRuleCount).toBeGreaterThan(0);

    expect(pickPrimaryLayer("CAN")).toBe("national_proposed");
  });

  it("still reports international participation when no national rule exists", () => {
    expect(pickPrimaryLayer("UZB")).toBe("international");
  });
});

describe("getMapStyle — geography lens", () => {
  it("distinguishes international participation from an absence of data", () => {
    // Uzbekistan has no national AI rule but is covered by UN-membership instruments.
    const uzb = getCountryMapSummary("UZB");
    expect(uzb.hasAnyAIRule).toBe(false);
    expect(uzb.internationalParticipationCount).toBeGreaterThan(0);

    const style = getMapStyle("UZB", FILTERS, true, "geography", "binding-law");
    expect(style.fill).toBe(FILL.international);
    expect(style.fill).not.toBe(FILL.empty);
  });

  it("keeps the empty fill for an entity with neither a rule nor participation", () => {
    // No tracked country currently has neither, so this guards the fallback path
    // used for geographies that are not in the dataset.
    const unknown = getCountryMapSummary("ZZZ");
    expect(unknown.hasAnyAIRule).toBe(false);
    expect(unknown.internationalParticipationCount).toBe(0);

    expect(getMapStyle("ZZZ", FILTERS, true, "geography", "binding-law").fill).toBe(FILL.empty);
  });

  it("still paints binding national law in the binding fill", () => {
    expect(getMapStyle("DEU", FILTERS, true, "geography", "binding-law").fill).toBe(FILL.binding);
  });

  it("no longer hides a lab-hosting country's binding law behind a corporate fill", () => {
    expect(getMapStyle("USA", FILTERS, true, "geography", "binding-law").fill).toBe(FILL.binding);
    expect(getMapStyle("USA", FILTERS, true, "layer", "binding-law").fill).toBe(FILL.binding);
  });
});
