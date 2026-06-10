import { describe, expect, it } from "vitest";
import { parseRecordRoute, recordRoute } from "./recordRoutes";

describe("stable record routes", () => {
  it("parses valid country, lab, instrument, rule, obligation, exposure, and corpus routes", () => {
    expect(parseRecordRoute("/country/USA")).toEqual({ kind: "country", id: "USA" });
    expect(parseRecordRoute("/lab/openai")).toEqual({ kind: "lab", id: "openai" });
    expect(parseRecordRoute("/instrument/eu-ai-act")).toEqual({ kind: "instrument", id: "eu-ai-act" });
    expect(parseRecordRoute("/rule/kr-ai-basic-act")).toEqual({ kind: "rule", id: "kr-ai-basic-act" });
    expect(parseRecordRoute("/obligation/ca-sb-53-incident-reporting")).toEqual({
      kind: "obligation",
      id: "ca-sb-53-incident-reporting",
    });
    expect(parseRecordRoute("/exposure/openai--market_access--eu-ai-act-regional")).toEqual({
      kind: "exposure",
      id: "openai--market_access--eu-ai-act-regional",
    });
    expect(parseRecordRoute("/institution/eu-ai-office")).toEqual({
      kind: "institution",
      id: "eu-ai-office",
    });
    expect(parseRecordRoute("/policy-process/eu-high-risk-ai-guidelines-consultation-2026")).toEqual({
      kind: "policy-process",
      id: "eu-high-risk-ai-guidelines-consultation-2026",
    });
    expect(parseRecordRoute("/standard/iso-iec-42001-ai-management-system")).toEqual({
      kind: "standard",
      id: "iso-iec-42001-ai-management-system",
    });
    expect(parseRecordRoute("/public-sector-ai/us-federal-ai-use-case-inventory")).toEqual({
      kind: "public-sector-ai",
      id: "us-federal-ai-use-case-inventory",
    });
    expect(parseRecordRoute("/enforcement/ftc-operation-ai-comply-2024")).toEqual({
      kind: "enforcement",
      id: "ftc-operation-ai-comply-2024",
    });
  });

  it("rejects unknown records and creates encoded URLs", () => {
    expect(parseRecordRoute("/country/NOPE")).toBeNull();
    expect(recordRoute("instrument", "coe-ai-convention")).toBe("/instrument/coe-ai-convention");
  });
});
