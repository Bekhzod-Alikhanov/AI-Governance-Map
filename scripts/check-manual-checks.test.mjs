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
});
