import { describe, expect, it } from "vitest";
import { COUNTRIES } from "../data/countries";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import {
  buildCitationText,
  buildDatasetSnapshot,
  buildFilteredDatasetSnapshot,
  DATASET_SCHEMA_VERSION,
  toPrettyJson,
} from "./exportDataset";
import { DATASET_SCHEMA_ID, validateDatasetSnapshotShape } from "./datasetSchema";
import { DEFAULT_FILTER_STATE } from "../types";

describe("dataset export helpers", () => {
  it("builds a snapshot with declared schema, counts, and primary data arrays", () => {
    const snapshot = buildDatasetSnapshot();

    expect(snapshot.schemaVersion).toBe(DATASET_SCHEMA_VERSION);
    expect(snapshot.snapshotDate).toBe(DATA_SNAPSHOT_DATE);
    expect(snapshot.schema).toEqual({
      id: DATASET_SCHEMA_ID,
      version: DATASET_SCHEMA_VERSION,
      format: "json-schema-draft-2020-12",
    });
    expect(snapshot.counts.countries).toBe(COUNTRIES.filter((country) => country.iso3 !== "EUU").length);
    expect(snapshot.counts.frontierLabs).toBe(FRONTIER_LABS.length);
    expect(snapshot.counts.internationalInstruments).toBe(INTERNATIONAL_INSTRUMENTS.length);
    expect(snapshot.counts.nationalAIRegulations).toBe(NATIONAL_AI_REGULATIONS.length);
    expect(snapshot.data.countries).toBe(COUNTRIES);
    expect(snapshot.data.frontierLabs).toBe(FRONTIER_LABS);
    expect(validateDatasetSnapshotShape(snapshot)).toEqual([]);
  });

  it("builds citation text with snapshot date and public project URLs", () => {
    const citation = buildCitationText();

    expect(citation).toContain(DATA_SNAPSHOT_DATE);
    expect(citation).toContain("https://github.com/Bekhzod-Alikhanov/global-ai-governance-map");
    expect(citation).toContain("not legal advice");
  });

  it("formats exported JSON for readable review", () => {
    expect(toPrettyJson({ source: "official", confidence: "high" })).toBe(
      '{\n  "source": "official",\n  "confidence": "high"\n}'
    );
  });

  it("builds a filtered snapshot for the current research scope", () => {
    const filtered = buildFilteredDatasetSnapshot({
      ...DEFAULT_FILTER_STATE,
      selectedRegions: ["Europe"],
    });

    expect(filtered.title).toContain("filtered");
    expect(filtered.filters.selectedRegions).toEqual(["Europe"]);
    expect(filtered.counts.countries).toBeLessThan(buildDatasetSnapshot().counts.countries);
    expect(filtered.data.countries.every((country) => country.region === "Europe")).toBe(true);
  });

  it("keeps the full dataset when no filters are active", () => {
    const filtered = buildFilteredDatasetSnapshot(DEFAULT_FILTER_STATE);
    const full = buildDatasetSnapshot();

    expect(filtered.counts).toEqual(full.counts);
    expect(filtered.data.internationalInstruments).toBe(INTERNATIONAL_INSTRUMENTS);
  });

  it("includes search-matched labs and their HQ countries", () => {
    const filtered = buildFilteredDatasetSnapshot({
      ...DEFAULT_FILTER_STATE,
      searchQuery: "OpenAI",
    });

    expect(filtered.data.frontierLabs.map((lab) => lab.id)).toContain("openai");
    expect(filtered.data.countries.map((country) => country.iso3)).toContain("USA");
  });
});
