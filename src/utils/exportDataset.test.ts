import { describe, expect, it } from "vitest";
import { COUNTRIES } from "../data/countries";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { buildCitationText, buildDatasetSnapshot, DATASET_SCHEMA_VERSION, toPrettyJson } from "./exportDataset";
import { DATASET_SCHEMA_ID, validateDatasetSnapshotShape } from "./datasetSchema";

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
    expect(citation).toContain("https://github.com/bekhzod1990/global-ai-governance-map");
    expect(citation).toContain("not legal advice");
  });

  it("formats exported JSON for readable review", () => {
    expect(toPrettyJson({ source: "official", confidence: "high" })).toBe(
      '{\n  "source": "official",\n  "confidence": "high"\n}'
    );
  });
});
