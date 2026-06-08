import { describe, expect, it } from "vitest";
import { FRONTIER_LABS } from "../data/frontierLabs";
import {
  COMPUTE_DEPENDENCY_RECORDS,
  LAB_INTELLIGENCE_PROFILES,
  MODEL_GOVERNANCE_EVIDENCE,
  SAFETY_EVALUATION_RECORDS,
} from "../data/labIntelligence";
import { buildLabBoardRows, getLabIntelligenceSummary, renderLabBoardCsv } from "./labIntelligence";

describe("lab intelligence helpers", () => {
  it("creates one profile for every tracked frontier lab", () => {
    expect(LAB_INTELLIGENCE_PROFILES).toHaveLength(FRONTIER_LABS.length);
    expect(new Set(LAB_INTELLIGENCE_PROFILES.map((profile) => profile.labId)).size).toBe(FRONTIER_LABS.length);
  });

  it("keeps safety, evaluation, and compute evidence separate from legal-effect claims", () => {
    expect(MODEL_GOVERNANCE_EVIDENCE.every((row) => /not|company|issuer-controlled/.test(row.caveat.toLowerCase()))).toBe(true);
    expect(SAFETY_EVALUATION_RECORDS.every((row) => row.caveat.toLowerCase().includes("not"))).toBe(true);
    expect(COMPUTE_DEPENDENCY_RECORDS.every((row) => /not|separate/.test(row.caveat.toLowerCase()))).toBe(true);
  });

  it("summarizes lab evidence for the Lab Board", () => {
    const openAi = getLabIntelligenceSummary("openai");

    expect(openAi?.safetyFramework).toMatch(/Preparedness/i);
    expect(openAi?.modelGovernanceEvidence.length).toBeGreaterThan(0);
    expect(openAi?.computeDependencyRecords.length).toBeGreaterThan(0);
  });

  it("exports Lab Board rows as CSV", () => {
    const rows = buildLabBoardRows().filter((row) => row.labId === "openai");
    const csv = renderLabBoardCsv(rows);

    expect(csv).toContain("lab,hq,safety_framework");
    expect(csv).toContain("OpenAI");
    expect(csv).toContain("Preparedness Framework");
  });
});
