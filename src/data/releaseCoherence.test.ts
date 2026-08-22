import { describe, expect, it } from "vitest";
import { buildWorkbenchAnswer } from "../utils/workbenchAnswer";
import { INSTRUMENT_BY_ID } from "./internationalInstruments";
import { INTERNATIONAL_PARTICIPATION } from "./participation";
import { RELEASE_METADATA } from "./releaseMetadata";
import { SOURCE_NOTES } from "./sourceNotes";

describe("August release coherence", () => {
  it("publishes one current Council of Europe status across canonical data, participation, answer, and notes", () => {
    const instrument = INSTRUMENT_BY_ID["coe-ai-convention"];
    const rows = INTERNATIONAL_PARTICIPATION.filter(
      (row) => row.instrumentId === "coe-ai-convention",
    );
    const ratified = rows.filter((row) => row.participationType === "ratified");
    const ratifiedParties = new Set(ratified.map((row) => row.countryIso3));
    const signatureOnly = rows.filter(
      (row) => row.participationType === "signed" && !ratifiedParties.has(row.countryIso3),
    );
    const answer = buildWorkbenchAnswer("coe-signed-ratified");
    const conventionNote = SOURCE_NOTES.find((note) => note.id === "coe-convention-not-in-force");
    const releaseNote = SOURCE_NOTES.find((note) => note.id === "release-coverage-status");

    expect(instrument.lastVerified).toBe(RELEASE_METADATA.statusAsOf);
    expect(`${instrument.summary} ${instrument.verificationNotes}`).toMatch(
      /20 signatures not followed by ratification/i,
    );
    expect(`${instrument.summary} ${instrument.verificationNotes}`).toMatch(/1 ratification/i);
    expect(`${instrument.summary} ${instrument.verificationNotes}`).toMatch(/not yet in force/i);

    expect(ratified).toHaveLength(1);
    expect(signatureOnly).toHaveLength(20);
    for (const row of rows) {
      expect(row.lastVerified).toBe(RELEASE_METADATA.statusAsOf);
      expect(row.notes).toBeTruthy();
      expect(row.verificationNotes).toMatch(/reviewed on 2026-08-17/i);
      expect(row.verificationNotes).toMatch(/20 signatures not followed by ratification/i);
      expect(row.verificationNotes).toMatch(/1 ratification/i);
    }

    expect(answer.sentence).toContain("1 ratification and 20 signature-only rows");
    expect(conventionNote?.note).toContain("status as of 2026-08-17");
    expect(conventionNote?.note).toMatch(/20 signatures not followed by ratification/i);
    expect(conventionNote?.note).toMatch(/1 ratification/i);
    expect(releaseNote?.note).toContain("Release 2026-08-17");
    expect(releaseNote?.note).toContain("coverage through 2026-08-17");
    expect(releaseNote?.note).toContain("status as of 2026-08-17");
    expect(SOURCE_NOTES.map((note) => note.note).join("\n")).not.toMatch(/May 2026 snapshot/i);
  });
});
