import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import type { VerificationMetadata } from "../types";
import { VerificationMeta } from "./VerificationMeta";

function renderMeta(lastVerified: string) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <VerificationMeta
        item={{ sourceKind: "official", verificationStatus: "verified", lastVerified }}
      />
    );
  });
  const text = container.textContent ?? "";
  const amber = container.querySelector('[class*="amber"]') !== null;
  act(() => root.unmount());
  container.remove();
  return { text, amber };
}

function renderItem(item: VerificationMetadata, compact = false) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(<VerificationMeta item={item} compact={compact} />));
  return {
    container,
    cleanup() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

/** Days before today, as an ISO date — so the test does not rot. */
function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

describe("VerificationMeta age", () => {
  it("tells the reader how old this record's check is, not just its date", () => {
    const { text } = renderMeta(daysAgo(38));

    expect(text).toContain("Last checked");
    expect(text).toContain("checked 38 days ago");
  });

  it("flags a record past the stale threshold", () => {
    const { text, amber } = renderMeta(daysAgo(200));

    expect(text).toContain("checked 200 days ago");
    expect(amber).toBe(true);
  });

  it("leaves a recent record unflagged", () => {
    expect(renderMeta(daysAgo(3)).amber).toBe(false);
  });
});

describe("VerificationMeta review provenance", () => {
  it.each([
    ["editorial_checked", "Editorially checked"],
    ["needs_review", "Needs review"],
    ["unreviewed", "Unreviewed"],
    ["expert_reviewed", "Expert reviewed"],
  ] as const)("renders %s as its literal review state", (reviewStatus, label) => {
    const view = renderItem({ reviewStatus });
    expect(view.container).toHaveTextContent(label);
    for (const other of ["Editorially checked", "Needs review", "Unreviewed", "Expert reviewed"]) {
      if (other !== label) expect(view.container).not.toHaveTextContent(other);
    }
    view.cleanup();
  });

  it("keeps review notes, source pinpoint, and per-record last check distinct", () => {
    const view = renderItem({
      sourceKind: "official",
      verificationStatus: "verified",
      lastVerified: "2026-06-15",
      reviewStatus: "editorial_checked",
      reviewNotes: "Second-person source and claim check completed.",
      sourceLocator: {
        label: "N.D. Cal. Document 700, filed 25 March 2026, pages 3–5",
        documentId: "700",
        page: "3–5",
      },
    });

    expect(view.container).toHaveTextContent("Editorially checked");
    expect(view.container).toHaveTextContent("Second-person source and claim check completed.");
    expect(view.container).toHaveTextContent("Source pinpoint: Document 700 · pages 3–5");
    expect(view.container).toHaveTextContent("Last checked");
    expect(view.container).toHaveTextContent("2026-06-15");
    view.cleanup();
  });

  it("keeps the review badge and source pinpoint visible in compact mode", () => {
    const view = renderItem(
      {
        reviewStatus: "needs_review",
        sourceLocator: { label: "Article 53", paragraph: "1" },
      },
      true
    );

    expect(view.container).toHaveTextContent("Needs review");
    expect(view.container).toHaveTextContent("Source pinpoint: Article 53 · paragraph 1");
    view.cleanup();
  });
});
