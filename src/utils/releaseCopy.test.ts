import { describe, expect, it } from "vitest";
import citationCff from "../../CITATION.cff?raw";
import zenodoRaw from "../../.zenodo.json?raw";

describe("release-facing metadata copy", () => {
  it("calls the August package a release rather than a dated snapshot", () => {
    const zenodo = JSON.parse(zenodoRaw) as { title: string; description: string };

    expect(citationCff).toContain("17 August 2026 research release");
    expect(citationCff).not.toContain("17 August 2026 research snapshot");
    expect(`${zenodo.title} ${zenodo.description}`).toContain("17 August 2026 research release");
    expect(`${zenodo.title} ${zenodo.description}`).not.toMatch(/August 2026 research snapshot/i);
  });
});
