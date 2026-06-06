import { describe, expect, it } from "vitest";
import { COUNTRIES } from "./countries";
import { DEPENDENCY_EDGES } from "./dependencies";
import { DATASET_STATS } from "./datasetStats";
import { FRONTIER_LABS } from "./frontierLabs";
import { INTERNATIONAL_INSTRUMENTS } from "./internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "./nationalAIRegulations";

describe("DATASET_STATS", () => {
  it("keeps lightweight display counts aligned with the graph dataset", () => {
    expect(DATASET_STATS.countries).toBe(COUNTRIES.filter((country) => country.iso3 !== "EUU").length);
    expect(DATASET_STATS.internationalInstruments).toBe(INTERNATIONAL_INSTRUMENTS.length);
    expect(DATASET_STATS.nationalRegulations).toBe(NATIONAL_AI_REGULATIONS.length);
    expect(DATASET_STATS.frontierLabs).toBe(FRONTIER_LABS.length);
    expect(DATASET_STATS.dependencyEdges).toBe(DEPENDENCY_EDGES.length);
  });
});
