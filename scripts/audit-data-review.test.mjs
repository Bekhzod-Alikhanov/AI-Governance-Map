import { describe, expect, it } from "vitest";
import {
  buildDataReviewData,
  formatDataReviewMarkdown,
  getReviewItemsForRecord,
  hasStrongLegalEffect,
} from "./audit-data-review.mjs";

const BASE_RECORD = {
  file: "src/data/example.ts",
  id: "example-record",
  name: "Example record",
  sourceUrl: "https://example.gov/source",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-20",
  bindingStatus: "non_binding",
};

describe("data review audit", () => {
  it("flags uncertain strong legal-effect claims as high-priority review items", () => {
    const items = getReviewItemsForRecord({
      ...BASE_RECORD,
      verificationStatus: "uncertain",
      confidence: "low",
      bindingStatus: "binding",
    });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "high",
          category: "verification",
        }),
        expect.objectContaining({
          severity: "high",
          category: "verification_notes",
        }),
        expect.objectContaining({
          severity: "medium",
          category: "legal_effect",
        }),
      ])
    );
  });

  it("does not flag verified high-confidence official records", () => {
    expect(getReviewItemsForRecord(BASE_RECORD)).toEqual([]);
  });

  it("classifies binding treaty and national binding statuses as strong legal effect", () => {
    expect(hasStrongLegalEffect({ bindingStatus: "binding_on_parties" })).toBe(true);
    expect(hasStrongLegalEffect({ bindingStatus: "binding" })).toBe(true);
    expect(hasStrongLegalEffect({ bindingStatus: "voluntary" })).toBe(false);
  });

  it("builds a machine-readable review report from source metadata", async () => {
    const report = await buildDataReviewData();

    expect(report.recordCount).toBeGreaterThan(100);
    expect(report.reviewItems).toEqual(expect.any(Array));
    expect(report.summary).toEqual(
      expect.objectContaining({
        weakVerificationCount: expect.any(Number),
        lowConfidenceCount: expect.any(Number),
      })
    );
  });

  it("formats markdown output for CI artifacts", () => {
    const markdown = formatDataReviewMarkdown({
      generatedAt: "2026-05-28T00:00:00.000Z",
      recordCount: 1,
      reviewItems: [
        {
          severity: "high",
          category: "verification",
          file: "src/data/example.ts",
          id: "example-record",
          name: "Example record",
          sourceUrl: "https://example.gov/source",
          message: "needs review",
        },
      ],
      highPriorityCount: 1,
      mediumPriorityCount: 0,
      lowPriorityCount: 0,
      summary: {
        recordsOlderThan90Days: 0,
        recordsOlderThan180Days: 0,
        weakVerificationCount: 1,
        lowConfidenceCount: 0,
        strongLegalEffectReviewCount: 0,
      },
    });

    expect(markdown).toContain("# Data Review Report");
    expect(markdown).toContain("High-priority items");
    expect(markdown).toContain("src/data/example.ts :: example-record");
  });
});
