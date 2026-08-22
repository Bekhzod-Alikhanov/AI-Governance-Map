import { describe, expect, it } from "vitest";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { validateData } from "./validateData";
import { RELEASE_METADATA } from "../data/releaseMetadata";
import { INTERNATIONAL_PARTICIPATION } from "../data/participation";
import { INCIDENT_ENFORCEMENT_RECORDS } from "../data/labIntelligence";

describe("dataset snapshot date", () => {
  it("publishes the exact August release dates and preserves the snapshot alias", () => {
    expect(RELEASE_METADATA).toEqual({
      releaseId: "2026-08-17",
      releaseDate: "2026-08-17",
      coverageCutoff: "2026-08-17",
      statusAsOf: "2026-08-17",
    });
    expect(DATA_SNAPSHOT_DATE).toBe(RELEASE_METADATA.statusAsOf);
  });

  it("includes Albania's 15 June 2026 Convention signature", () => {
    expect(INTERNATIONAL_PARTICIPATION).toContainEqual(
      expect.objectContaining({
        instrumentId: "coe-ai-convention",
        countryIso3: "ALB",
        participationType: "signed",
        date: "2026-06-15",
      })
    );
  });

  it("removes litigation whose purported primary source was unconfirmed", () => {
    expect(
      INCIDENT_ENFORCEMENT_RECORDS.some(
        (row) => row.id === "garcia-v-character-ai-wrongful-death-2024"
      )
    ).toBe(false);
  });

  it("reports only warnings that are known and accepted", () => {
    // Warnings nobody asserts on accumulate silently: this suite previously
    // passed while the validator emitted 378 of them on every run. Pinning the
    // exact set means a new warning fails the build, and the ones that remain
    // are visible decisions rather than background noise.
    const report = validateData();

    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([
      // publication.pravo.gov.ru and static.kremlin.ru serve the two Russian
      // source documents over plain HTTP and do not answer on HTTPS, so the
      // content is unauthenticated in transit. Kept visible rather than hidden.
      "2 source URL(s): source URL is not HTTPS",
    ]);
  });

  it("separates deliberate disclosures from defects", () => {
    // Non-official hosts are disclosed, not wrong: the Atlas layer draws on
    // research indices that the UI names in its source badge.
    const { notes } = validateData();

    expect(notes.some((note) => note.includes("secondary host oxfordinsights.com"))).toBe(true);
    // Real verification coverage is stated rather than implied by a weak check.
    expect(notes.some((note) => note.includes("complete verification triple"))).toBe(true);
  });
});
