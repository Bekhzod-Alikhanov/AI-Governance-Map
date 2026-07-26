import { describe, expect, it } from "vitest";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { validateData } from "./validateData";
import {
  COMPUTE_DEPENDENCY_RECORDS,
  INCIDENT_ENFORCEMENT_RECORDS,
  LAB_INTELLIGENCE_PROFILES,
  MODEL_GOVERNANCE_EVIDENCE,
  SAFETY_EVALUATION_RECORDS,
} from "../data/labIntelligence";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import { EU_AI_ACT_AUTHORITY_MATRIX } from "../data/euAiActAuthorities";
import { GOVERNANCE_OBLIGATIONS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "../data/implementationMilestones";
import {
  INSTITUTION_RECORDS,
  POLICY_PROCESS_RECORDS,
  PUBLIC_SECTOR_AI_RECORDS,
  STANDARDS_CONFORMITY_RECORDS,
} from "../data/researchCorpus";

/** Every collection that carries a `lastVerified` date. */
const VERIFIED_COLLECTIONS: Array<{ lastVerified?: string }[]> = [
  LAB_REGULATORY_EXPOSURES,
  LAB_INTELLIGENCE_PROFILES,
  MODEL_GOVERNANCE_EVIDENCE,
  SAFETY_EVALUATION_RECORDS,
  INCIDENT_ENFORCEMENT_RECORDS,
  COMPUTE_DEPENDENCY_RECORDS,
  EU_AI_ACT_AUTHORITY_MATRIX,
  GOVERNANCE_OBLIGATIONS,
  IMPLEMENTATION_MILESTONES,
  INSTITUTION_RECORDS,
  POLICY_PROCESS_RECORDS,
  STANDARDS_CONFORMITY_RECORDS,
  PUBLIC_SECTOR_AI_RECORDS,
];

function latestVerificationDate(): string {
  let latest = "";
  for (const collection of VERIFIED_COLLECTIONS) {
    for (const row of collection) {
      if (row.lastVerified && row.lastVerified > latest) latest = row.lastVerified;
    }
  }
  return latest;
}

describe("dataset snapshot date", () => {
  it("matches the most recent verification in the corpus", () => {
    // The published snapshot date is what readers see on the badge, in citations
    // and in evidence dossiers. If records are re-verified past it, the badge
    // understates the data's currency and every date check downstream is wrong.
    expect(DATA_SNAPSHOT_DATE).toBe(latestVerificationDate());
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
