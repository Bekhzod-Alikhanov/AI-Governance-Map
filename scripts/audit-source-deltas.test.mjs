import { describe, expect, it } from "vitest";
import {
  buildSourceDeltaAuditData,
  formatSourceDeltaReportMarkdown,
  runSourceDeltaMonitor,
} from "./audit-source-deltas.mjs";

const baseMonitor = {
  id: "coe-ai-convention-treaty-office",
  name: "Council of Europe AI Convention Treaty Office status",
  sourceLabel: "Council of Europe Treaty Office, CETS No. 225",
  sourceUrl: "https://example.test/coe",
  recordIds: ["coe-ai-convention"],
  currentAppClaim: "The app tracks one ratification and treaty status caveats.",
  requiredPatterns: [{ label: "Treaty identity", pattern: "Framework Convention" }],
  expectedValues: [
    {
      label: "ratifications/accessions",
      pattern: "Total number of ratifications/accessions\\s*\\|\\s*(\\d+)",
      expected: "1",
      recommendedAction: "Review ratified participation rows.",
    },
  ],
};

describe("source delta audit", () => {
  it("classifies unchanged sources when identity and expected values match", async () => {
    const result = await runSourceDeltaMonitor(baseMonitor, {
      knownRecordIds: new Set(["coe-ai-convention"]),
      fetcher: okFetch("Framework Convention Total number of ratifications/accessions | 1"),
    });

    expect(result.status).toBe("unchanged");
    expect(result.evidence).toContain("ratifications/accessions: observed 1; expected 1.");
    expect(result.recommendedAction).toContain("No repo action needed");
  });

  it("classifies changed sources when an expected value differs", async () => {
    const result = await runSourceDeltaMonitor(baseMonitor, {
      knownRecordIds: new Set(["coe-ai-convention"]),
      fetcher: okFetch("Framework Convention Total number of ratifications/accessions | 2"),
    });

    expect(result.status).toBe("changed");
    expect(result.observedStatus).toContain("potential source delta");
    expect(result.recommendedAction).toContain("Review ratified participation rows");
  });

  it("treats blocked or unavailable official sources as manual-review, not broken claims", async () => {
    const result = await runSourceDeltaMonitor(baseMonitor, {
      knownRecordIds: new Set(["coe-ai-convention"]),
      fetcher: async () => ({ status: 403, text: async () => "Forbidden" }),
    });

    expect(result.status).toBe("needs_manual_review");
    expect(result.observedStatus).toContain("Automated fetch failed");
    expect(result.evidence.join(" ")).toContain("does not prove the public claim is wrong");
  });

  it("flags monitor config references that do not exist in source-audit records", async () => {
    const result = await runSourceDeltaMonitor(baseMonitor, {
      knownRecordIds: new Set(["different-record"]),
      fetcher: okFetch("Framework Convention Total number of ratifications/accessions | 1"),
    });

    expect(result.status).toBe("needs_manual_review");
    expect(result.missingRecordIds).toEqual(["coe-ai-convention"]);
    expect(result.recommendedAction).toContain("Fix the monitor config");
  });

  it("builds a report with a summary table", async () => {
    const data = await buildSourceDeltaAuditData({
      generatedAt: new Date("2026-05-30T00:00:00Z"),
      config: {
        snapshotDate: "2026-05-19",
        monitors: [baseMonitor],
      },
      fetcher: okFetch("Framework Convention Total number of ratifications/accessions | 1"),
    });
    const markdown = formatSourceDeltaReportMarkdown(data);

    expect(data.summary.unchanged).toBe(1);
    expect(markdown).toContain("# Source Delta Report");
    expect(markdown).toContain("Council of Europe AI Convention Treaty Office status");
    expect(markdown).toContain("This report is an editorial aid, not legal advice.");
  });
});

function okFetch(text) {
  return async (url) => ({
    status: 200,
    url,
    headers: new Map([["content-type", "text/html; charset=utf-8"]]),
    text: async () => text,
  });
}
