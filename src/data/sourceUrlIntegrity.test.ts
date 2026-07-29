import { describe, expect, it } from "vitest";
import { INTERNATIONAL_INSTRUMENTS } from "./internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "./nationalAIRegulations";
import { SUBNATIONAL_AI_RULES } from "./subnationalRules";
import {
  INSTITUTION_RECORDS,
  POLICY_PROCESS_RECORDS,
  PUBLIC_SECTOR_AI_RECORDS,
  STANDARDS_CONFORMITY_RECORDS,
} from "./researchCorpus";

interface Sourced {
  id: string;
  sourceUrl?: string;
  sourceName?: string;
}

const COLLECTIONS: Array<{ name: string; rows: readonly Sourced[] }> = [
  { name: "internationalInstruments", rows: INTERNATIONAL_INSTRUMENTS },
  { name: "nationalAIRegulations", rows: NATIONAL_AI_REGULATIONS },
  { name: "subnationalRules", rows: SUBNATIONAL_AI_RULES },
  { name: "institutionRecords", rows: INSTITUTION_RECORDS },
  { name: "policyProcessRecords", rows: POLICY_PROCESS_RECORDS },
  { name: "standardsConformityRecords", rows: STANDARDS_CONFORMITY_RECORDS },
  { name: "publicSectorAIRecords", rows: PUBLIC_SECTOR_AI_RECORDS },
];

const allRows = COLLECTIONS.flatMap(({ name, rows }) =>
  rows.map((row) => ({ collection: name, id: row.id, sourceUrl: row.sourceUrl ?? "" }))
);

describe("source URL integrity", () => {
  it("uses ISO's catalogue URL form, never a bare standard number", () => {
    // iso.org/standard/NNNNN.html takes a catalogue id. "42001" and "42005" are
    // standard numbers, and a URL built from them 404s — but the link checker
    // cannot tell that apart from ISO's bot wall, since both answer 403.
    const isoUrls = allRows
      .filter((row) => row.sourceUrl.includes("iso.org/standard/"))
      .map((row) => `${row.collection}:${row.id} ${row.sourceUrl}`);

    expect(isoUrls.length).toBeGreaterThan(0);
    for (const entry of isoUrls) {
      expect(entry).toMatch(/iso\.org\/standard\/\d+\.html$/);
    }
  });

  it("cites the same issuer for a record wherever it appears", () => {
    // Host, not exact URL. A record id can legitimately appear in two
    // collections citing different pages of the same issuer — the UK AI
    // Security Institute is cited at /about as an institutional framework and
    // at / as an institution record, and both are fair. Two different *issuers*
    // for one id would mean the record disagrees with itself about who says so.
    const hostsById = new Map<string, Set<string>>();
    for (const row of allRows) {
      if (!row.sourceUrl) continue;
      let host: string;
      try {
        host = new URL(row.sourceUrl).host;
      } catch {
        continue;
      }
      const seen = hostsById.get(row.id) ?? new Set<string>();
      seen.add(host);
      hostsById.set(row.id, seen);
    }

    const conflicts = [...hostsById.entries()]
      .filter(([, hosts]) => hosts.size > 1)
      .map(([id, hosts]) => `${id}: ${[...hosts].join(" vs ")}`);

    expect(conflicts).toEqual([]);
  });

  it("points every archive snapshot at the source it claims to archive", () => {
    // An archivedUrl is corroborating evidence for a specific claim. Pointed at
    // the wrong page — or built with a timestamp nobody resolved — it is worse
    // than absent, because the checker will report the record as verified.
    const archived = COLLECTIONS.flatMap(({ name, rows }) =>
      rows
        .map((row) => row as Sourced & { archivedUrl?: string; archivedAt?: string })
        .filter((row) => row.archivedUrl)
        .map((row) => ({ ref: `${name}:${row.id}`, sourceUrl: row.sourceUrl ?? "", archived: row.archivedUrl!, at: row.archivedAt }))
    );

    expect(archived.length).toBeGreaterThan(0);
    for (const row of archived) {
      expect(row.archived).toMatch(/^https:\/\/web\.archive\.org\/web\/\d{14}\//);
      // The snapshot must wrap this record's own source URL, not a near neighbour.
      expect(row.archived.endsWith(row.sourceUrl)).toBe(true);
      // archivedAt must agree with the timestamp embedded in the snapshot URL.
      const stamp = row.archived.match(/\/web\/(\d{4})(\d{2})(\d{2})/);
      expect(`${stamp?.[1]}-${stamp?.[2]}-${stamp?.[3]}`).toBe(row.at);
    }
  });

  it("keeps every source URL on HTTPS except the two known Russian exceptions", () => {
    const insecure = allRows
      .filter((row) => row.sourceUrl.startsWith("http://"))
      .map((row) => row.sourceUrl);

    // Neither host answers on HTTPS; recorded rather than silently tolerated.
    expect(insecure.every((url) => /pravo\.gov\.ru|kremlin\.ru/.test(url))).toBe(true);
  });
});
