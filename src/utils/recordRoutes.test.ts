import { describe, expect, it } from "vitest";
import { parseRecordRoute, recordRoute } from "./recordRoutes";

describe("stable record routes", () => {
  it("parses valid country, lab, instrument, and rule routes", () => {
    expect(parseRecordRoute("/country/USA")).toEqual({ kind: "country", id: "USA" });
    expect(parseRecordRoute("/lab/openai")).toEqual({ kind: "lab", id: "openai" });
    expect(parseRecordRoute("/instrument/eu-ai-act")).toEqual({ kind: "instrument", id: "eu-ai-act" });
    expect(parseRecordRoute("/rule/kr-ai-basic-act")).toEqual({ kind: "rule", id: "kr-ai-basic-act" });
  });

  it("rejects unknown records and creates encoded URLs", () => {
    expect(parseRecordRoute("/country/NOPE")).toBeNull();
    expect(recordRoute("instrument", "coe-ai-convention")).toBe("/instrument/coe-ai-convention");
  });
});
