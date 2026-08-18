import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FILTER_STATE, DEFAULT_WORKBENCH_STATE } from "../types";
import { WorkbenchView } from "./WorkbenchView";

function renderWorkbench() {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(
    <WorkbenchView
        filters={DEFAULT_FILTER_STATE}
        onFiltersChange={vi.fn()}
        onSelectCountry={vi.fn()}
        onSelectLab={vi.fn()}
        onSelectInstrument={vi.fn()}
        onOpenMethodology={vi.fn()}
        onOpenAtlasMapMode={vi.fn()}
        workbenchState={DEFAULT_WORKBENCH_STATE}
        onWorkbenchStateChange={vi.fn()}
        routeRecord={null}
      />
  );
  return container;
}

function text(element: Element | null): string {
  return element?.textContent?.trim() ?? "";
}

describe("answer-first Workbench", () => {
  it("shows freshness, six featured questions, and one evidence-backed default answer", () => {
    const container = renderWorkbench();

    expect(text(container.querySelector("h2"))).toMatch(/answer concrete ai-governance questions/i);
    expect(container.textContent).toMatch(/release 2026-08-17/i);

    const featured = container.querySelector('section[aria-label="Featured research questions"]');
    expect(featured).not.toBeNull();
    expect(featured?.querySelectorAll("button")).toHaveLength(6);
    const pressedQuestions = container.querySelectorAll('button[data-workbench-question][aria-pressed="true"]');
    expect(pressedQuestions).toHaveLength(1);
    expect(pressedQuestions[0]).toHaveAttribute("data-workbench-question", "binding-duties-by-jurisdiction");

    const answer = container.querySelector('section[aria-label="Workbench answer"]');
    expect(answer).not.toBeNull();
    expect(answer).toHaveAttribute("aria-live", "polite");
    expect(answer?.textContent).toContain("European Union");
    expect(answer?.querySelectorAll('a[aria-label^="Official source"]')).toHaveLength(5);
    expect(answer?.querySelectorAll('a[aria-label^="Open record"]')).toHaveLength(5);
    expect(Array.from(answer?.querySelectorAll("button") ?? []).some((button) => text(button) === "Cite answer")).toBe(true);
    expect(Array.from(answer?.querySelectorAll("button") ?? []).some((button) => text(button) === "Export answer CSV")).toBe(true);
  });

  it("keeps question browsing and every secondary Workbench capability collapsed by default", () => {
    const container = renderWorkbench();
    const summaries = [
      "Browse all questions",
      "Research workflows and answer metrics",
      "Frontier lab intelligence board",
      "Research corpus",
      "AI Atlas comparison",
      "Comparison builder and scenario simulator",
      "Obligation and implementation matrices",
    ];

    for (const name of summaries) {
      const summary = Array.from(container.querySelectorAll("summary")).find((candidate) =>
        text(candidate).startsWith(name)
      );
      const details = summary?.closest("details") ?? null;
      expect(details, `${name} is not inside a disclosure`).not.toBeNull();
      expect(details).not.toHaveAttribute("open");
    }
    expect(container.querySelectorAll("details[open]")).toHaveLength(0);
  });
});
