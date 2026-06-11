import { describe, expect, it } from "vitest";
import {
  buildCorpusMapContext,
  getCorpusChangelogForRecord,
  getCorpusCoverageReport,
  getCorpusRecord,
  getCorpusRecordsForCountry,
  renderCorpusCsv,
  RESEARCH_CORPUS_RECORDS,
} from "./researchCorpus";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";

describe("research corpus helpers", () => {
  it("normalizes official-source corpus records for stable route lookup", () => {
    const euOffice = getCorpusRecord("institution", "eu-ai-office");

    expect(euOffice?.title).toBe("European AI Office");
    expect(euOffice?.metadata.sourceKind).toBe("official");
    expect(euOffice?.routeKind).toBe("institution");
  });

  it("maps EU-level corpus context to EU member countries without changing legal rollups", () => {
    const germanyBefore = getCountryGovernanceSummary("DEU").hasBindingNationalLaw;
    const context = buildCorpusMapContext("ai-institutions");
    const germanyAfter = getCountryGovernanceSummary("DEU").hasBindingNationalLaw;

    expect(context.fills.DEU).toBe("#0F766E");
    expect(context.reasons.DEU.label).toContain("ai institutions");
    expect(germanyAfter).toBe(germanyBefore);
  });

  it("groups country corpus rows and exports a CSV", () => {
    const usRows = getCorpusRecordsForCountry("USA");
    const csv = renderCorpusCsv(usRows);

    expect(usRows.some((row) => row.id === "us-nist-caisi")).toBe(true);
    expect(usRows.some((row) => row.id === "us-omb-m25-22-ai-acquisition")).toBe(true);
    expect(csv).toContain("NIST Center for AI Standards and Innovation");
  });

  it("keeps new corpus context records separate from binding-law rollups", () => {
    const italyRows = getCorpusRecordsForCountry("ITA");
    const netherlandsRows = getCorpusRecordsForCountry("NLD");
    const italySummary = getCountryGovernanceSummary("ITA");
    const netherlandsSummary = getCountryGovernanceSummary("NLD");

    expect(italyRows.some((row) => row.id === "it-acn-ai-act-msa")).toBe(true);
    expect(netherlandsRows.some((row) => row.id === "nl-algorithm-register")).toBe(true);
    expect(italySummary.nationalRegulations.some((record) => record.id === "it-acn-ai-act-msa")).toBe(false);
    expect(netherlandsSummary.nationalRegulations.some((record) => record.id === "nl-algorithm-register")).toBe(false);
  });

  it("builds an editorial coverage report", () => {
    const report = getCorpusCoverageReport();

    expect(report.totalRecords).toBe(RESEARCH_CORPUS_RECORDS.length);
    expect(report.openPolicyWindows).toBeGreaterThanOrEqual(1);
    expect(report.officialSourceGaps).toEqual([]);
  });

  it("exposes record-level corpus changelog entries", () => {
    const euOffice = getCorpusRecord("institution", "eu-ai-office");
    expect(euOffice).not.toBeNull();

    const changelog = getCorpusChangelogForRecord(euOffice!);
    expect(changelog[0]?.recordKind).toBe("institution");
    expect(changelog[0]?.summary).toContain("European AI Office");
  });
});
