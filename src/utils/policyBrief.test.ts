import { describe, expect, it } from "vitest";
import { buildPolicyBrief, renderPolicyBriefMarkdown } from "./policyBrief";

describe("policy brief generation", () => {
  it("builds a country brief with source caveats and corpus context", () => {
    const brief = buildPolicyBrief({ kind: "country", id: "USA" });

    expect(brief?.title).toContain("United States");
    expect(brief?.markdown).toContain("Research aid only; not legal advice");
    expect(brief?.markdown).toContain("Corpus/context records do not affect binding-law map coloring");
    expect(brief?.sourceRefs.length).toBeGreaterThan(0);
  });

  it("builds a lab-by-market brief without treating context rows as binding law", () => {
    const brief = buildPolicyBrief({ kind: "lab_market", labId: "anthropic", marketIso3s: ["EUU", "USA", "GBR", "KOR"] });
    const markdown = brief ? renderPolicyBriefMarkdown(brief) : "";

    expect(markdown).toContain("Binding rows are separated from voluntary commitments");
    expect(markdown).toContain("not legal advice");
    expect(markdown).toContain("Anthropic");
  });

  it("builds corpus watch briefs", () => {
    const deadline = buildPolicyBrief({ kind: "deadline_watch" });
    const standards = buildPolicyBrief({ kind: "standards_conformity" });

    expect(deadline?.markdown).toContain("Open windows");
    expect(standards?.markdown).toContain("Standards and conformity rows are not national law");
  });
});
