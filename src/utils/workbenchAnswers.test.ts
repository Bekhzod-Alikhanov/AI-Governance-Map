import { describe, expect, it } from "vitest";
import { DEFAULT_FILTER_STATE } from "../types";
import { buildWorkbenchAnswerCards } from "./researchWorkbench";

const cards = buildWorkbenchAnswerCards(DEFAULT_FILTER_STATE);

describe("workbench answer sentences", () => {
  it("gives every answer card a readable sentence, not a bare number", () => {
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      expect(card.sentence, `${card.id} has no sentence`).toBeTruthy();
      // A sentence, not a metric: more than one word, and terminated.
      expect(card.sentence.trim().split(/\s+/).length, `${card.id} is too terse`).toBeGreaterThan(3);
      expect(card.sentence.trim().endsWith("."), `${card.id} is not a sentence`).toBe(true);
      expect(card.sentence.trim()).not.toMatch(/^\d+$/);
    }
  });

  it("states the Council of Europe answer with its caveat inline", () => {
    // Signature is not ratification, and the convention is not yet in force.
    // A reader who takes the number without the caveat gets it wrong.
    const coe = cards.find((card) => card.id === "coe-participation");

    expect(coe?.sentence).toMatch(/ratif/i);
    expect(coe?.sentence).toMatch(/signature is not ratification/i);
  });

  it("says how many jurisdictions the binding-duty count spans", () => {
    // The old tile read "BINDING DUTIES 12" while its subtext counted a
    // different noun, so the headline could not be read aloud as a fact.
    const binding = cards.find((card) => card.id === "binding-obligations");

    expect(binding?.sentence).toMatch(/\d+ source-backed binding obligation row/);
    expect(binding?.sentence).toMatch(/\d+ jurisdiction/);
  });
});
