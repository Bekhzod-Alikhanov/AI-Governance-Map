import { describe, expect, it } from "vitest";
import { EU_AI_ACT_AUTHORITY_MATRIX } from "./euAiActAuthorities";
import { EU_MEMBER_ISO3 } from "./euMembers";
import { INSTITUTION_RECORDS } from "./researchCorpus";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";

describe("EU AI Act authority matrix", () => {
  it("tracks one matrix row per EU member state", () => {
    expect(EU_AI_ACT_AUTHORITY_MATRIX).toHaveLength(EU_MEMBER_ISO3.length);
    expect(new Set(EU_AI_ACT_AUTHORITY_MATRIX.map((row) => row.countryIso3))).toEqual(new Set(EU_MEMBER_ISO3));
  });

  it("generates institution records only for listed or pending Commission contacts", () => {
    const cyprus = EU_AI_ACT_AUTHORITY_MATRIX.find((row) => row.countryIso3 === "CYP");
    const germany = EU_AI_ACT_AUTHORITY_MATRIX.find((row) => row.countryIso3 === "DEU");
    const spain = EU_AI_ACT_AUTHORITY_MATRIX.find((row) => row.countryIso3 === "ESP");

    expect(cyprus?.status).toBe("listed");
    expect(germany?.status).toBe("not_yet_published");
    expect(spain?.status).toBe("pending_final_adoption");
    expect(INSTITUTION_RECORDS.some((row) => row.id === "cy-commissioner-communications-ai-act-msa")).toBe(true);
    expect(INSTITUTION_RECORDS.some((row) => row.id === germany?.id)).toBe(false);
    expect(INSTITUTION_RECORDS.some((row) => row.id === "es-aesia-ai-act-pending-msa")).toBe(true);
  });

  it("keeps authority status separate from national binding-law rollups", () => {
    const cyprusSummary = getCountryGovernanceSummary("CYP");

    expect(cyprusSummary.nationalRegulations.some((record) => record.id === "cy-commissioner-communications-ai-act-msa")).toBe(false);
  });
});
