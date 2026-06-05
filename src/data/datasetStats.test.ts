import { describe, expect, it } from "vitest";
import { DEPENDENCY_EDGES } from "./dependencies";
import { DATASET_STATS } from "./datasetStats";

describe("DATASET_STATS", () => {
  it("keeps lightweight display counts aligned with the graph dataset", () => {
    expect(DATASET_STATS.dependencyEdges).toBe(DEPENDENCY_EDGES.length);
  });
});
