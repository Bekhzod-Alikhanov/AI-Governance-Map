import { describe, expect, it } from "vitest";
import { DEFAULT_FILTER_STATE } from "../types";
import { getCountryMapSummary } from "./getCountryMapSummary";
import { getMapStyle } from "./getMapColor";

const FILTERS = DEFAULT_FILTER_STATE;

const FILL = {
  empty: "#E5E7EB",
  guidance: "#BFDBFE",
  mixed: "#60A5FA",
  binding: "#1D4ED8",
  international: "#C4B5FD",
  corporate: "#B45309",
};

describe("getMapStyle — binding-law mode", () => {
  it("distinguishes international participation from an absence of data", () => {
    // Uzbekistan has no national AI rule but is covered by UN-membership instruments.
    const uzb = getCountryMapSummary("UZB");
    expect(uzb.hasAnyAIRule).toBe(false);
    expect(uzb.internationalParticipationCount).toBeGreaterThan(0);

    const style = getMapStyle("UZB", FILTERS, true, "binding-law");
    expect(style.fill).toBe(FILL.international);
    expect(style.fill).not.toBe(FILL.empty);
  });

  it("keeps the empty fill for an entity with neither a rule nor participation", () => {
    // No tracked country currently has neither, so this guards the fallback path
    // used for geographies that are not in the dataset.
    const unknown = getCountryMapSummary("ZZZ");
    expect(unknown.hasAnyAIRule).toBe(false);
    expect(unknown.internationalParticipationCount).toBe(0);

    expect(getMapStyle("ZZZ", FILTERS, true, "binding-law").fill).toBe(FILL.empty);
  });

  it("still paints binding national law in the binding fill", () => {
    expect(getMapStyle("DEU", FILTERS, true, "binding-law").fill).toBe(FILL.binding);
  });

  it("colours lab-hosting countries by their law, not their office locations", () => {
    // USA has 7 lab HQs and a confirmed binding national rule; the law wins.
    const usa = getCountryMapSummary("USA");
    expect(usa.hqLabCount).toBeGreaterThan(0);
    expect(usa.hasBindingNationalLaw).toBe(true);

    expect(getMapStyle("USA", FILTERS, true, "binding-law").fill).toBe(FILL.binding);
    expect(getMapStyle("USA", FILTERS, true, "binding-law").fill).not.toBe(FILL.corporate);
  });

  it("keeps frontier-lab HQs available as their own colour mode", () => {
    // Retiring the Layers lens must not lose the lab-HQ view; it has a mode.
    expect(getMapStyle("USA", FILTERS, true, "lab-hq").fill).toBe(FILL.corporate);
    expect(getMapStyle("DEU", FILTERS, true, "lab-hq").fill).toBe(FILL.empty);
  });
});
