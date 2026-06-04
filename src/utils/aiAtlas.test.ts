import { describe, expect, it } from "vitest";
import { COUNTRY_BY_ISO3 } from "../data/countries";
import { AI_ATLAS_SOURCES, COUNTRY_INDICATOR_SCORES, COUNTRY_READINESS_REPORTS, INDICATOR_SOURCE_BY_ID } from "../data/aiAtlas";
import { DEFAULT_FILTER_STATE } from "../types";
import { buildEvidenceDossier, renderEvidenceDossierMarkdown } from "./evidenceDossier";
import { getMapStyle } from "./getMapColor";
import {
  buildAtlasMapContext,
  CAIDP_DEMOCRATIC_VALUES_SOURCE_ID,
  getCountryAtlasSummary,
  IMF_AI_PREPAREDNESS_SOURCE_ID,
  OXFORD_READINESS_SOURCE_ID,
  STANFORD_VIBRANCY_SOURCE_ID,
} from "./aiAtlas";

describe("AI Atlas indicators", () => {
  it("has source metadata for every first-batch source", () => {
    expect(AI_ATLAS_SOURCES.map((source) => source.id)).toEqual(
      expect.arrayContaining([
        OXFORD_READINESS_SOURCE_ID,
        CAIDP_DEMOCRATIC_VALUES_SOURCE_ID,
        "unesco-ram-global-hub-2026",
        STANFORD_VIBRANCY_SOURCE_ID,
        IMF_AI_PREPAREDNESS_SOURCE_ID,
      ])
    );
    for (const source of AI_ATLAS_SOURCES) {
      expect(source.sourceUrl).toMatch(/^https:\/\//);
      expect(source.methodologyUrl).toMatch(/^https:\/\//);
      expect(source.caveat).toMatch(/not|does not/i);
      expect(source.lastVerified).toBe("2026-06-04");
    }
  });

  it("maps all imported indicator and readiness rows to known countries and sources", () => {
    for (const row of COUNTRY_INDICATOR_SCORES) {
      expect(COUNTRY_BY_ISO3[row.countryIso3]?.iso3).toBe(row.countryIso3);
      expect(INDICATOR_SOURCE_BY_ID[row.sourceId]?.id).toBe(row.sourceId);
    }
    for (const row of COUNTRY_READINESS_REPORTS) {
      expect(COUNTRY_BY_ISO3[row.countryIso3]?.iso3).toBe(row.countryIso3);
      expect(INDICATOR_SOURCE_BY_ID[row.sourceId]?.id).toBe(row.sourceId);
    }
  });

  it("keeps Atlas map coloring separate from binding-law coloring", () => {
    const legalStyle = getMapStyle("USA", DEFAULT_FILTER_STATE, true, "geography", "binding-law");
    const readinessStyle = getMapStyle("USA", DEFAULT_FILTER_STATE, true, "geography", "gov-ai-readiness");
    const caidpStyle = getMapStyle("USA", DEFAULT_FILTER_STATE, true, "geography", "democratic-values");

    expect(readinessStyle.fill).not.toBe(legalStyle.fill);
    expect(caidpStyle.fill).not.toBe(legalStyle.fill);
  });

  it("builds Atlas map context without turning source-only families into legal effects", () => {
    const context = buildAtlasMapContext("gov-ai-readiness");
    expect(context.fills.USA).toMatch(/^#/);
    expect(context.reasons.USA.label).toContain("Oxford readiness");
    expect(COUNTRY_INDICATOR_SCORES.some((score) => score.sourceId === IMF_AI_PREPAREDNESS_SOURCE_ID)).toBe(false);
  });

  it("includes AI Atlas context in country dossiers", () => {
    const dossier = buildEvidenceDossier("country", "USA", "https://example.test/country/USA");
    expect(dossier).not.toBeNull();
    const markdown = renderEvidenceDossierMarkdown(dossier!);
    expect(markdown).toContain("AI Atlas context indicators");
    expect(markdown).toContain("Government AI readiness");
    expect(markdown).toContain("AI Atlas readiness, democratic-values, RAM, and ecosystem indicators are contextual");
  });

  it("summarizes available Atlas rows by country", () => {
    const us = getCountryAtlasSummary("USA");
    expect(us.oxford?.sourceId).toBe(OXFORD_READINESS_SOURCE_ID);
    expect(us.caidp?.sourceId).toBe(CAIDP_DEMOCRATIC_VALUES_SOURCE_ID);
    expect(us.stanford?.sourceId).toBe(STANFORD_VIBRANCY_SOURCE_ID);
    expect(us.hasAnyAtlasData).toBe(true);
  });
});
