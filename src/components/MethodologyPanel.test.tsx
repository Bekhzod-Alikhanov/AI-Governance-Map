import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { MethodologyPanel } from "./MethodologyPanel";
import { RELEASE_METADATA } from "../data/releaseMetadata";

describe("MethodologyPanel", () => {
  it("renders the main methodology caveats", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    act(() => {
      root.render(<MethodologyPanel onClose={vi.fn()} />);
    });

    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    expect(container.textContent).toContain("How to read this map");
    expect(container.textContent).toContain("EU Applicability");
    expect(container.textContent).toContain("Standards");
    expect(container.textContent?.toLowerCase()).toContain("not legal advice");
    expect(container.textContent).toContain(`Release ${RELEASE_METADATA.releaseDate}`);
    expect(container.textContent).toContain(`coverage through ${RELEASE_METADATA.coverageCutoff}`);
    expect(container.textContent).toContain(`status as of ${RELEASE_METADATA.statusAsOf}`);
    expect(container.textContent).not.toMatch(/static research snapshot/i);

    act(() => root.unmount());
    container.remove();
  });
});
