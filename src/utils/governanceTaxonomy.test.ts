import { describe, expect, it } from "vitest";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { PARTICIPATION_BY_INSTRUMENT } from "../data/participation";
import { SUBNATIONAL_BY_ID } from "../data/subnationalRules";
import {
  assessSourceUrl,
  classifyInternationalInstrument,
  classifyNationalEntry,
  classifyParticipation,
} from "./governanceTaxonomy";

describe("governance taxonomy", () => {
  it("classifies EU AI Act applicability without implying national enactment", () => {
    const classification = classifyNationalEntry(NATIONAL_REG_BY_ID["eu-ai-act-regional"]);
    expect(classification.className).toBe("binding_ai_law");
    expect(classification.caveat).toContain("jurisdictional scope");
  });

  it("classifies ISO standards as technical standards rather than laws", () => {
    const classification = classifyInternationalInstrument(INSTRUMENT_BY_ID["iso-iec-42001-2023"]);
    expect(classification.className).toBe("technical_standard");
    expect(classification.caveat).toContain("not national law");
  });

  it("classifies covered_by_membership as an indirect membership signal", () => {
    const classification = classifyParticipation("covered_by_membership");
    expect(classification.directness).toBe("membership");
    expect(classification.impliesBindingByItself).toBe(false);
    expect(classification.caveat).toContain("not direct signature");
  });

  it("classifies source URLs by host and protocol", () => {
    expect(assessSourceUrl("https://eur-lex.europa.eu/legal-content/EN/TXT/").sourceKind).toBe("official");
    expect(assessSourceUrl("https://asean.org/example").sourceKind).toBe("official");
    expect(assessSourceUrl("https://www.gov.ca.gov/example").sourceKind).toBe("official");
    expect(assessSourceUrl("https://developers.openai.com/api/docs/models/all").sourceKind).toBe("official");
    expect(assessSourceUrl("https://perma.cc/example").sourceKind).toBe("secondary");
    expect(assessSourceUrl("http://example.com").issues).toContain("source URL is not HTTPS");
  });

  it("keeps official-source corrections for high-impact records", () => {
    expect(INSTRUMENT_BY_ID["oecd-ai-principles"].sourceUrl).toContain("OECD-LEGAL-0449");
    expect(INSTRUMENT_BY_ID["iso-iec-42001-2023"].sourceUrl).toContain("81230");
    expect(INSTRUMENT_BY_ID["iso-iec-42005-2025"].date).toBe("2025-05-28");
    expect(NATIONAL_REG_BY_ID["eu-ai-office"].bindingStatus).toBe("non_binding");
    expect(NATIONAL_REG_BY_ID["jp-ai-promotion-act"].dateInForce).toBe("2025-06-04");
    expect(NATIONAL_REG_BY_ID["ca-aida-proposed"].status).toContain("Historical proposal");
    expect(NATIONAL_REG_BY_ID["us-take-it-down-act-2025"].frontierAIRelevant).toBe(false);
    expect(SUBNATIONAL_BY_ID["us-ca-2025-ai-package"].bindingStatus).toBe("mixed");
    expect(SUBNATIONAL_BY_ID["us-ca-2025-ai-package"].verificationStatus).toBe("uncertain");
  });

  it("uses the official INASI launch-member list", () => {
    const members = new Set(
      PARTICIPATION_BY_INSTRUMENT["intl-network-aisi"].map((row) => row.countryIso3)
    );
    expect(members.has("DEU")).toBe(true);
    expect(members.has("ITA")).toBe(true);
    expect(members.has("KEN")).toBe(false);
  });
});
