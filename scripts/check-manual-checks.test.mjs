import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditManualChecks, collectManualChecks } from "./check-manual-checks.mjs";

const manualLinkConfig = {
  manualChecks: [
    {
      recordId: "manual-link",
      sourceUrl: "https://official.example/manual-link",
      lastChecked: "2026-05-29",
      expiresOn: "2026-08-27",
    },
  ],
};

const monitorConfig = {
  monitors: [
    {
      id: "manual-monitor",
      sourceUrl: "https://official.example/manual-monitor",
      manualVerification: {
        reviewedAt: "2026-08-17",
        validUntil: "2026-11-15",
      },
    },
  ],
};

describe("manual review expiry audit", () => {
  it("merges manual link checks and source-delta monitor verifications", () => {
    assert.deepEqual(collectManualChecks(manualLinkConfig, monitorConfig), [
      {
        id: "manual-link",
        sourceUrl: "https://official.example/manual-link",
        reviewedAt: "2026-05-29",
        validUntil: "2026-08-27",
      },
      {
        id: "manual-monitor",
        sourceUrl: "https://official.example/manual-monitor",
        reviewedAt: "2026-08-17",
        validUntil: "2026-11-15",
      },
    ]);
  });

  it("warns for checks due in 0 to 14 days without failing", () => {
    const result = auditManualChecks(
      [
        {
          id: "due-today",
          sourceUrl: "https://official.example/due-today",
          reviewedAt: "2026-05-19",
          validUntil: "2026-08-17",
        },
        {
          id: "due-in-fourteen",
          sourceUrl: "https://official.example/due-in-fourteen",
          reviewedAt: "2026-06-02",
          validUntil: "2026-08-31",
        },
      ],
      "2026-08-17"
    );

    assert.equal(result.exitCode, 0);
    assert.deepEqual(
      result.dueSoon.map((check) => check.id),
      ["due-today", "due-in-fourteen"]
    );
    assert.match(result.messages.join("\n"), /due-today.*https:\/\/official\.example\/due-today/);
    assert.match(
      result.messages.join("\n"),
      /due-in-fourteen.*https:\/\/official\.example\/due-in-fourteen/
    );
  });

  it("fails expired and undated checks with actionable ids and URLs", () => {
    const result = auditManualChecks(
      [
        {
          id: "expired-monitor",
          sourceUrl: "https://official.example/expired-monitor",
          reviewedAt: "2026-05-18",
          validUntil: "2026-08-16",
        },
        {
          id: "undated-link",
          sourceUrl: "https://official.example/undated-link",
          reviewedAt: "2026-08-17",
        },
      ],
      "2026-08-17"
    );

    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.expired.map((check) => check.id), ["expired-monitor"]);
    assert.deepEqual(result.undated.map((check) => check.id), ["undated-link"]);
    assert.match(
      result.messages.join("\n"),
      /expired-monitor.*https:\/\/official\.example\/expired-monitor/
    );
    assert.match(
      result.messages.join("\n"),
      /undated-link.*https:\/\/official\.example\/undated-link/
    );
  });

  it("treats calendar-impossible valid-until dates as invalid and undated", () => {
    const result = auditManualChecks(
      [
        {
          id: "impossible-date",
          sourceUrl: "https://official.example/impossible-date",
          reviewedAt: "2026-02-17",
          validUntil: "2026-02-31",
        },
      ],
      "2026-02-17"
    );

    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.undated.map((check) => check.id), ["impossible-date"]);
    assert.match(result.messages.join("\n"), /invalid valid-until date \(2026-02-31\)/);
  });

  it("fails a missing reviewedAt date with an actionable message", () => {
    const result = auditManualChecks(
      [{ id: "missing-review", sourceUrl: "https://official.example/missing", validUntil: "2026-09-01" }],
      "2026-08-17"
    );

    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.invalidReviewDates.map((check) => check.id), ["missing-review"]);
    assert.match(result.messages.join("\n"), /missing-review.*no reviewed-at date.*official\.example\/missing/i);
  });

  it("fails calendar-impossible reviewedAt dates", () => {
    const result = auditManualChecks(
      [{
        id: "impossible-review",
        sourceUrl: "https://official.example/impossible-review",
        reviewedAt: "2026-02-31",
        validUntil: "2026-09-01",
      }],
      "2026-08-17"
    );

    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.invalidReviewDates.map((check) => check.id), ["impossible-review"]);
    assert.match(result.messages.join("\n"), /invalid reviewed-at date \(2026-02-31\)/i);
  });

  it("fails reviewedAt dates in the future", () => {
    const result = auditManualChecks(
      [{
        id: "future-review",
        sourceUrl: "https://official.example/future-review",
        reviewedAt: "2026-08-18",
        validUntil: "2026-09-01",
      }],
      "2026-08-17"
    );

    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.invalidReviewDates.map((check) => check.id), ["future-review"]);
    assert.match(result.messages.join("\n"), /reviewed-at date 2026-08-18 is after audit date 2026-08-17/i);
  });

  it("fails when reviewedAt is later than validUntil", () => {
    const result = auditManualChecks(
      [{
        id: "inverted-review",
        sourceUrl: "https://official.example/inverted-review",
        reviewedAt: "2026-08-17",
        validUntil: "2026-08-16",
      }],
      "2026-08-17"
    );

    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.invalidReviewDates.map((check) => check.id), ["inverted-review"]);
    assert.match(result.messages.join("\n"), /reviewed-at date 2026-08-17 is after valid-until date 2026-08-16/i);
  });

  it("accepts a real leap-day reviewedAt date", () => {
    const result = auditManualChecks(
      [{
        id: "leap-day-review",
        sourceUrl: "https://official.example/leap-day-review",
        reviewedAt: "2024-02-29",
        validUntil: "2024-03-14",
      }],
      "2024-02-29"
    );

    assert.equal(result.exitCode, 0);
    assert.deepEqual(result.invalidReviewDates, []);
    assert.deepEqual(result.expired, []);
  });
});
