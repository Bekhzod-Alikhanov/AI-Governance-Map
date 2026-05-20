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
    expect(DATASET_SCHEMA.properties.schemaVersion.const).toBe(DATASET_SCHEMA_VERSION);
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
});
