import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { LabPin } from "./LabPin";
import { FRONTIER_LABS } from "../data/frontierLabs";

function radiiFor(labId: string): string[] {
  const lab = FRONTIER_LABS.find((entry) => entry.id === labId);
  if (!lab) throw new Error(`No such lab: ${labId}`);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <svg>
        <LabPin lab={lab} position={[100, 100]} selected={false} onClick={() => {}} />
      </svg>
    );
  });
  const radii = [...container.querySelectorAll("circle")].map((c) => c.getAttribute("r") ?? "");
  act(() => root.unmount());
  container.remove();
  return radii;
}

describe("lab pin sizing", () => {
  it("does not encode the editorial power score in pin area", () => {
    // powerScore is a hand-assigned 1-5 judgement with no published derivation.
    // Area is read pre-attentively, so sizing by it made the least defensible
    // number in the dataset carry the strongest visual claim.
    const highest = FRONTIER_LABS.reduce((a, b) => (a.powerScore >= b.powerScore ? a : b));
    const lowest = FRONTIER_LABS.reduce((a, b) => (a.powerScore <= b.powerScore ? a : b));

    expect(highest.powerScore).toBeGreaterThan(lowest.powerScore);

    const highestRadii = radiiFor(highest.id);
    expect(highestRadii.length).toBeGreaterThan(0);
    expect(highestRadii).toEqual(radiiFor(lowest.id));
  });
});
