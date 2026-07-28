import { describe, expect, it } from "vitest";
import { toDescription } from "./write-record-previews.mjs";

describe("record preview descriptions", () => {
  it("keeps a short summary intact", () => {
    expect(toDescription("Binding AI law in force since 2026.", "fallback")).toBe(
      "Binding AI law in force since 2026."
    );
  });

  it("falls back when a record has no summary", () => {
    expect(toDescription("", "Country record for Uzbekistan.")).toBe("Country record for Uzbekistan.");
    expect(toDescription(undefined, "Country record for Uzbekistan.")).toBe("Country record for Uzbekistan.");
  });

  it("collapses whitespace so multi-line summaries render on one card line", () => {
    expect(toDescription("First line.\n\n   Second line.", "x")).toBe("First line. Second line.");
  });

  it("truncates at a sentence boundary rather than mid-word", () => {
    const long = `${"A".repeat(120)}. ${"B".repeat(200)}`;
    const out = toDescription(long, "x");

    expect(out.length).toBeLessThanOrEqual(201);
    expect(out.endsWith(".")).toBe(true);
    expect(out).not.toContain("B");
  });

  it("ellipsises when there is no sentence boundary to cut at", () => {
    const out = toDescription("C".repeat(400), "x");

    expect(out.length).toBeLessThanOrEqual(201);
    expect(out.endsWith("…")).toBe(true);
  });
});
