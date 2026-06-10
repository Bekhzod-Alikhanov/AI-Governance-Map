import { describe, expect, it } from "vitest";
import {
  buildCorpusMapContext,
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
    expect(csv).toContain("NIST Center for AI Standards and Innovation");
  });

  it("builds an editorial coverage report", () => {
    const report = getCorpusCoverageReport();

    expect(report.totalRecords).toBe(RESEARCH_CORPUS_RECORDS.length);
    expect(report.openPolicyWindows).toBeGreaterThanOrEqual(1);
    expect(report.officialSourceGaps).toEqual([]);
  });
});
