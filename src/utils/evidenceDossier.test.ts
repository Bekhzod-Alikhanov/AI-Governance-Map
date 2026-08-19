import { describe, expect, it } from "vitest";
import {
  buildEvidenceDossier,
  evidenceDossierFilename,
  renderEvidenceDossierMarkdown,
} from "./evidenceDossier";
import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import { RELEASE_METADATA } from "../data/releaseMetadata";

describe("evidence dossiers", () => {
  it("builds a country dossier with status counts, caveats, sources, and snapshot date", () => {
    const dossier = buildEvidenceDossier("country", "USA", "https://example.test/?country=USA");

    expect(dossier).not.toBeNull();
    expect(dossier?.snapshotDate).toBe(DATA_SNAPSHOT_DATE);
    expect(dossier?.metrics.map((metric) => metric.label)).toContain("Confirmed binding AI-specific rules");
    expect(dossier?.sections.some((section) => section.title === "International participation")).toBe(true);
    expect(dossier?.caveats.join(" ")).toContain("research aggregation");
    expect(dossier?.sources.length).toBeGreaterThan(0);
  });

  it("builds a lab dossier with exposure groups and non-binding caveats", () => {
    const dossier = buildEvidenceDossier("lab", "openai", "https://example.test/?lab=openai");
    const markdown = renderEvidenceDossierMarkdown(dossier!);

    expect(dossier).not.toBeNull();
    expect(markdown).toContain("Regulatory exposure");
    expect(markdown).toContain("Voluntary");
    expect(markdown).toContain("Infrastructure constraint");
    expect(markdown).toContain("should not be read as binding public-law duties");
    expect(markdown).toContain("not AI-specific legal obligations");
  });

  it("builds an instrument dossier with participation and legal-effect caveats", () => {
    const dossier = buildEvidenceDossier("instrument", "coe-ai-convention", "https://example.test/?inst=coe-ai-convention");
    const markdown = renderEvidenceDossierMarkdown(dossier!);

    expect(dossier).not.toBeNull();
    expect(markdown).toContain("Legal effect");
    expect(markdown).toContain("Participation pattern");
    expect(markdown).toContain("Signature is not the same as ratification");
    expect(markdown).toContain("Council of Europe");
  });

  it("renders Markdown with source URLs and legal-advice caveat", () => {
    const dossier = buildEvidenceDossier("instrument", "iso-iec-42001-2023", "https://example.test/");
    const markdown = renderEvidenceDossierMarkdown(dossier!);

    expect(markdown).toContain("# ISO/IEC 42001:2023");
    expect(markdown).toContain("not legal advice");
    expect(markdown).toContain("https://www.iso.org/standard/81230.html");
    expect(evidenceDossierFilename(dossier!)).toBe(
      "global-ai-governance-map-instrument-iso-iec-42001-2023-evidence-dossier.md"
    );
  });

  it("preserves the Kadrey Document 700 pinpoint and editorial review in data and Markdown", () => {
    const dossier = buildEvidenceDossier(
      "enforcement",
      "kadrey-v-meta-copyright-2025",
      "https://example.test/enforcement/kadrey-v-meta-copyright-2025",
    );
    const source = dossier?.sources.find((row) => row.id === "kadrey-v-meta-copyright-2025");
    const markdown = renderEvidenceDossierMarkdown(dossier!);

    expect(source).toMatchObject({
      sourceLocator: { documentId: "700", page: "3–5" },
      reviewStatus: "editorial_checked",
    });
    expect(markdown).toContain("Document 700 · pages 3–5");
    expect(markdown).toContain("Editorially checked");
  });

  it("renders an explicit needs-review source without promoting it", () => {
    const dossier = buildEvidenceDossier(
      "enforcement",
      "ftc-everalbum-facial-recognition-2021",
      "https://example.test/enforcement/ftc-everalbum-facial-recognition-2021",
    );
    const markdown = renderEvidenceDossierMarkdown(dossier!);

    expect(dossier?.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reviewStatus: "needs_review" }),
      ]),
    );
    expect(markdown).toContain("Needs review");
    expect(markdown).not.toContain("Expert reviewed");
  });

  it("labels release, coverage, and status dates without calling the current release a snapshot", () => {
    const dossier = buildEvidenceDossier("instrument", "coe-ai-convention", "https://example.test/");
    const markdown = renderEvidenceDossierMarkdown(dossier!);

    expect(markdown).toContain(`**Dataset release:** ${RELEASE_METADATA.releaseDate}`);
    expect(markdown).toContain(`**Coverage through:** ${RELEASE_METADATA.coverageCutoff}`);
    expect(markdown).toContain(`**Status as of:** ${RELEASE_METADATA.statusAsOf}`);
    expect(markdown).not.toMatch(/dataset snapshot/i);
  });
});
