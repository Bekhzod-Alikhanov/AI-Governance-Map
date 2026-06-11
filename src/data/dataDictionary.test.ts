import { describe, expect, it } from "vitest";
import { DATA_DICTIONARY } from "./dataDictionary";
import { DATASET_SCHEMA_VERSION } from "../utils/datasetSchema";

describe("data dictionary", () => {
  it("tracks the public schema version and legal separation invariant", () => {
    expect(DATA_DICTIONARY.schemaVersion).toBe(DATASET_SCHEMA_VERSION);
    expect(DATA_DICTIONARY.legalSeparationInvariant).toContain("Legal records drive legal map modes");
  });

  it("defines corpus collections with source metadata fields and caveats", () => {
    expect(DATA_DICTIONARY.collections.length).toBeGreaterThanOrEqual(5);

    for (const collection of DATA_DICTIONARY.collections) {
      expect(collection.legalEffectCaveat).toMatch(/not|unless|should/i);
      expect(collection.fields.some((field) => field.name === "sourceKind")).toBe(true);
      expect(collection.fields.some((field) => field.name === "verificationStatus")).toBe(true);
      expect(collection.fields.some((field) => field.name === "lastVerified")).toBe(true);
    }
  });

  it("keeps secondary and inferred evidence out of legal coloring", () => {
    const blocked = DATA_DICTIONARY.confidenceLadder.filter((entry) =>
      ["reputable_secondary_context", "inferred_relationship"].includes(entry.id)
    );

    expect(blocked.every((entry) => entry.mapEffect === "no_legal_color")).toBe(true);
  });
});
