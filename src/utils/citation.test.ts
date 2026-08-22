import { describe, expect, it } from "vitest";
import { buildCountryCitation, buildRecordCitation } from "./citation";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { RELEASE_METADATA } from "../data/releaseMetadata";
import { DATASET_CITATION_TITLE } from "./citation";

describe("citation helpers", () => {
  it("builds source-backed record citations", () => {
    const citation = buildRecordCitation({
      recordKind: "national AI regulation",
      recordId: "example",
      recordName: "Example AI Act",
      sourceName: "Official Gazette",
      sourceUrl: "https://example.gov/act",
      verificationStatus: "verified",
      confidence: "high",
      lastVerified: "2026-05-29",
      claim: "Binding AI-specific rule.",
    });

    expect(citation).toContain("Example AI Act");
    expect(citation).toContain(DATA_SNAPSHOT_DATE);
    expect(citation).toContain("Official Gazette");
    expect(citation).toContain("not legal advice");
  });

  it("builds country profile citations", () => {
    const citation = buildCountryCitation({
      iso3: "USA",
      name: "United States",
      summary: "Country summary.",
    });

    expect(citation).toContain("United States");
    expect(citation).toContain("country=USA");
  });

  it("distinguishes the current release, coverage cutoff, and status date", () => {
    expect(DATASET_CITATION_TITLE).toContain(`release ${RELEASE_METADATA.releaseDate}`);
    expect(DATASET_CITATION_TITLE).toContain(`coverage through ${RELEASE_METADATA.coverageCutoff}`);
    expect(DATASET_CITATION_TITLE).toContain(`status as of ${RELEASE_METADATA.statusAsOf}`);
    expect(DATASET_CITATION_TITLE).not.toMatch(/snapshot/i);
  });
});
