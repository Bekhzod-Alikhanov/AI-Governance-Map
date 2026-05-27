import { describe, expect, it } from "vitest";
import { buildCorrectionIssueUrl } from "./correctionLink";

describe("correction links", () => {
  it("builds a prefilled GitHub issue URL", () => {
    const url = buildCorrectionIssueUrl({
      recordKind: "international_instrument",
      recordId: "coe-ai-convention",
      recordName: "Council of Europe AI Convention",
      sourceUrl: "https://www.coe.int/example",
      claim: "Treaty status claim",
    });

    const params = new URL(url).searchParams;
    expect(url).toContain("issues/new");
    expect(params.get("title")).toBe("Data correction: Council of Europe AI Convention");
    expect(params.get("body")).toContain("coe-ai-convention");
    expect(params.get("body")).toContain("Treaty status claim");
  });
});
