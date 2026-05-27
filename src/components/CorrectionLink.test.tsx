import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { CorrectionLink } from "./CorrectionLink";

describe("CorrectionLink", () => {
  it("renders a prefilled correction issue link", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    act(() => {
      root.render(
        <CorrectionLink
          recordKind="national_ai_regulation"
          recordId="us-nist-ai-rmf"
          recordName="NIST AI RMF"
          sourceUrl="https://www.nist.gov/itl/ai-risk-management-framework"
          claim="Voluntary framework"
        />
      );
    });

    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    if (!link) throw new Error("Expected correction link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain("us-nist-ai-rmf");

    act(() => root.unmount());
    container.remove();
  });
});
