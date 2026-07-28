import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
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
