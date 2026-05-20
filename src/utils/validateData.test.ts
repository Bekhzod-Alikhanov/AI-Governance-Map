import { describe, expect, it } from "vitest";
import { validateData } from "./validateData";

describe("validateData", () => {
  it("keeps hard data integrity checks passing", () => {
    const report = validateData();
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("surfaces source-governance migration warnings", () => {
    const report = validateData();
    expect(report.warnings.some((warning) => warning.includes("lack explicit verification metadata"))).toBe(true);
  });
});
