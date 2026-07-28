import { describe, expect, it } from "vitest";
import { AGEING_AFTER_DAYS, STALE_AFTER_DAYS, getVerificationAge } from "./verificationAge";

describe("verification age", () => {
  it("phrases recent checks in reader-facing terms", () => {
    expect(getVerificationAge("2026-07-26", "2026-07-26")?.label).toBe("checked today");
    expect(getVerificationAge("2026-07-25", "2026-07-26")?.label).toBe("checked yesterday");
    expect(getVerificationAge("2026-06-18", "2026-07-26")?.label).toBe("checked 38 days ago");
  });

  it("crosses into ageing and stale at the thresholds the data review already uses", () => {
    const at = (days: number) => {
      const then = new Date(Date.UTC(2026, 0, 1) + days * 86_400_000).toISOString().slice(0, 10);
      return getVerificationAge("2026-01-01", then)?.freshness;
    };

    expect(at(0)).toBe("current");
    expect(at(AGEING_AFTER_DAYS - 1)).toBe("current");
    expect(at(AGEING_AFTER_DAYS)).toBe("ageing");
    expect(at(STALE_AFTER_DAYS - 1)).toBe("ageing");
    expect(at(STALE_AFTER_DAYS)).toBe("stale");
  });

  it("returns nothing rather than guessing when the date is missing or malformed", () => {
    expect(getVerificationAge(undefined)).toBeNull();
    expect(getVerificationAge("")).toBeNull();
    expect(getVerificationAge("June 2026")).toBeNull();
    expect(getVerificationAge("2026-6-1")).toBeNull();
  });

  it("does not report negative ages for a future date", () => {
    expect(getVerificationAge("2026-08-01", "2026-07-26")?.days).toBe(0);
  });
});
