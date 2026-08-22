import { describe, expect, it } from "vitest";
import { buildDatasetSnapshot } from "./exportDataset";
import {
  DATASET_SCHEMA,
  DATASET_SCHEMA_ID,
  DATASET_SCHEMA_VERSION,
  validateDatasetSnapshotShape,
} from "./datasetSchema";

describe("dataset schema", () => {
  it("declares a stable public schema id and current version", () => {
    expect(DATASET_SCHEMA.$id).toBe(DATASET_SCHEMA_ID);
    expect(DATASET_SCHEMA_ID).toBe(
      "https://global-ai-governance-map.vercel.app/data/schema.json",
    );
    expect(DATASET_SCHEMA.properties.schemaVersion.const).toBe(DATASET_SCHEMA_VERSION);
    expect(DATASET_SCHEMA_VERSION).toBe("2026.08.0");
    expect(DATASET_SCHEMA.required).toEqual(
      expect.arrayContaining(["releaseDate", "coverageCutoff", "statusAsOf", "snapshotDate"])
    );
  });

  it("describes the full verification, review, and pinpoint locator vocabulary", () => {
    expect(DATASET_SCHEMA.definitions.verificationMetadata.properties.verificationStatus.enum).toEqual([
      "verified",
      "likely_correct",
      "uncertain",
      "needs_external_check",
      "unverified",
      "superseded",
    ]);
    expect(DATASET_SCHEMA.definitions.verificationMetadata.properties.reviewStatus.enum).toEqual([
      "unreviewed",
      "editorial_checked",
      "expert_reviewed",
      "needs_review",
    ]);
    expect(DATASET_SCHEMA.definitions.verificationMetadata.properties.sourceLocator).toEqual({
      $ref: "#/definitions/sourceLocator",
    });
    expect(DATASET_SCHEMA.definitions.sourceLocator.required).toEqual(["label"]);
    expect(DATASET_SCHEMA.definitions.sourceLocator.properties).toMatchObject({
      label: { type: "string" },
      documentId: { type: "string" },
      article: { type: "string" },
      section: { type: "string" },
      page: { type: "string" },
      paragraph: { type: "string" },
    });
  });

  it("validates the exported snapshot shape and count mirrors", () => {
    expect(validateDatasetSnapshotShape(buildDatasetSnapshot())).toEqual([]);
  });

  it("flags broken count mirrors", () => {
    const snapshot = buildDatasetSnapshot();
    const broken = {
      ...snapshot,
      counts: {
        ...snapshot.counts,
        frontierLabs: snapshot.counts.frontierLabs + 1,
      },
    };

    expect(validateDatasetSnapshotShape(broken)).toContain(
      `counts.frontierLabs (${snapshot.counts.frontierLabs + 1}) does not match data.frontierLabs.length (${snapshot.data.frontierLabs.length})`
    );
  });

  it.each([
    "releaseId",
    "releaseDate",
    "coverageCutoff",
    "statusAsOf",
    "snapshotDate",
  ] as const)("rejects a missing or mismatched %s", (key) => {
    const snapshot = buildDatasetSnapshot();
    const missing = { ...snapshot, [key]: undefined };
    const mismatched = { ...snapshot, [key]: "1900-01-01" };

    expect(validateDatasetSnapshotShape(missing)).toContainEqual(
      expect.stringMatching(new RegExp(`^${key} must be `)),
    );
    expect(validateDatasetSnapshotShape(mismatched)).toContainEqual(
      expect.stringMatching(new RegExp(`^${key} must be `)),
    );
  });
});
