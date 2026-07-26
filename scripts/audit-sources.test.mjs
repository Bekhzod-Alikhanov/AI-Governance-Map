import { describe, expect, it } from "vitest";
import {
  buildSourceAuditData,
  describeFetchError,
  detectBlockedContent,
  extractSourceRecordsFromText,
  isManualCheckExpired,
} from "./audit-sources.mjs";

describe("source audit extraction", () => {
  it("uses nested source metadata without losing the parent id", () => {
    const records = extractSourceRecordsFromText(`
const LAB_SOURCE_METADATA = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
} as const;

export const FRONTIER_LABS = [{
  id: "example-lab",
  name: "Example Lab",
  ...LAB_SOURCE_METADATA,
  safetyFramework: {
    name: "Safety Framework",
    maturity: "published",
    ...LAB_SOURCE_METADATA,
    sourceName: "Example source",
    sourceUrl: "https://example.gov/safety",
  },
  sourceName: "Example lab source",
  sourceUrl: "https://example.gov/lab",
}];
`);

    expect(records).toEqual([
      expect.objectContaining({
        id: "example-lab.safetyFramework",
        name: "Safety Framework",
        lastVerified: "2026-05-20",
      }),
      expect.objectContaining({
        id: "example-lab",
        name: "Example Lab",
        lastVerified: "2026-05-20",
      }),
    ]);
  });

  it("labels generated participation-row sources by instrument and participation type", () => {
    const records = extractSourceRecordsFromText(`
rows.push(
  ...makeRows("prior-instrument", [EU], "member"),
  ...makeRows("coe-ai-convention", COE_SIGNATORIES, "signed", {
    sourceName: "Treaty Office",
    sourceUrl: "https://www.coe.int/example",
    sourceKind: "official",
    verificationStatus: "verified",
    confidence: "high",
    lastVerified: "2026-05-27",
  })
);
`);

    expect(records).toEqual([
      expect.objectContaining({
        id: "coe-ai-convention::generated::signed",
        lastVerified: "2026-05-27",
      }),
    ]);
  });

  it("builds machine-readable audit data without metadata warnings", async () => {
    const report = await buildSourceAuditData();

    expect(report.recordCount).toBeGreaterThan(100);
    expect(report.records[0]).toEqual(
      expect.objectContaining({
        file: expect.any(String),
        id: expect.any(String),
        sourceUrl: expect.any(String),
      })
    );
    expect(report.metadataWarnings).toEqual([]);
    expect(report.metadataWarningCount).toBe(0);
  });

  it("describes common automated link-check failures in editorial language", () => {
    expect(describeFetchError(new DOMException("Timeout", "AbortError"))).toContain(
      "timed out"
    );
    expect(describeFetchError(new TypeError("fetch failed"))).toContain("anti-bot");
  });
});

describe("blocked-content detection", () => {
  it("treats a Cloudflare interstitial served with HTTP 200 as a failed check", () => {
    // The Council of Europe convention page - the dataset's only binding treaty -
    // returns 200 with this body, which a status-code-only check reports as healthy.
    const body = `<!DOCTYPE html><html><head><title>Attention Required! | Cloudflare</title></head>
      <body><h1>Sorry, you have been blocked</h1>
      <p>You are unable to access www.coe.int</p></body></html>`;

    expect(detectBlockedContent(body)).toBe(true);
  });

  it("flags other common interstitials", () => {
    expect(detectBlockedContent("<html><body>Access Denied</body></html>")).toBe(true);
    expect(detectBlockedContent("<html><body>Please verify you are a human</body></html>")).toBe(true);
    expect(detectBlockedContent("<title>Just a moment...</title>")).toBe(true);
  });

  it("does not flag a genuine source page", () => {
    const body = `<html><head><title>Framework Convention on Artificial Intelligence</title></head>
      <body><p>Opened for signature 5 September 2024.</p></body></html>`;

    expect(detectBlockedContent(body)).toBe(false);
  });

  it("does not flag an empty or binary body", () => {
    expect(detectBlockedContent("")).toBe(false);
    expect(detectBlockedContent(null)).toBe(false);
  });
});

describe("manual link-check expiry", () => {
  const check = { recordId: "coe-ai-convention", status: "manual_ok", lastChecked: "2026-06-05" };

  it("treats a manual override without an expiry date as current", () => {
    expect(isManualCheckExpired(check, "2027-01-01")).toBe(false);
  });

  it("expires a time-boxed manual override once the date passes", () => {
    const boxed = { ...check, expiresOn: "2026-07-05" };

    expect(isManualCheckExpired(boxed, "2026-07-04")).toBe(false);
    expect(isManualCheckExpired(boxed, "2026-07-05")).toBe(false);
    expect(isManualCheckExpired(boxed, "2026-07-06")).toBe(true);
  });
});
