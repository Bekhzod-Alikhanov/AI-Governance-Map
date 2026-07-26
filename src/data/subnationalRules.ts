import type { SubnationalAIRule } from "../types";

const VERIFIED_OFFICIAL_SOURCE = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-20",
} satisfies Pick<
  SubnationalAIRule,
  "sourceKind" | "verificationStatus" | "confidence" | "lastVerified"
>;

const REVIEWED_OFFICIAL_SOURCE = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-29",
} satisfies Pick<
  SubnationalAIRule,
  "sourceKind" | "verificationStatus" | "confidence" | "lastVerified"
>;

export const SUBNATIONAL_AI_RULES: SubnationalAIRule[] = [
  // ===== United States — state and city level =====
  {
    id: "us-il-aivia",
    name: "Illinois Artificial Intelligence Video Interview Act (820 ILCS 42)",
    ...VERIFIED_OFFICIAL_SOURCE,
    verificationNotes:
      "ILGA statute page confirms the Act title, effective date, disclosure, consent, sharing, deletion, and reporting duties.",
    countryIso3: "USA",
    jurisdictionName: "Illinois",
    jurisdictionType: "us_state",
    type: "law",
    bindingStatus: "binding",
    aiSpecific: true,
    status: "In force",
    dateAdopted: "2019-08-09",
    dateInForce: "2020-01-01",
    summary:
      "Requires employers using AI to analyse candidate video interviews to disclose use, obtain consent, and limit data sharing.",
    sourceName: "Illinois General Assembly — 820 ILCS 42",
    sourceUrl: "https://www.ilga.gov/legislation/ilcs/fulltext?DocName=082000420K1",
  },
  {
    id: "us-nyc-local-law-144",
    name: "New York City Local Law 144 — Automated Employment Decision Tools",
    ...VERIFIED_OFFICIAL_SOURCE,
    verificationNotes:
      "NYC DCWP page confirms Local Law 144, AEDT bias-audit, notice, and July 5, 2023 enforcement details.",
    countryIso3: "USA",
    jurisdictionName: "New York City",
    jurisdictionType: "us_city",
    type: "law",
    bindingStatus: "binding",
    aiSpecific: true,
    status: "In force",
    dateAdopted: "2021-12-11",
    dateInForce: "2023-07-05",
    summary:
      "Requires employers to conduct annual independent bias audits of automated employment decision tools and to disclose their use to candidates.",
    sourceName: "NYC Department of Consumer and Worker Protection — AEDT",
    sourceUrl: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
  },
  {
    id: "us-ny-gbs-349a",
    name: "New York General Business Law §349-A — Surveillance Pricing disclosure",
    ...VERIFIED_OFFICIAL_SOURCE,
    verificationNotes:
      "New York Senate statute page confirms the 2025-07-11 revision and personalized algorithmic pricing disclosure requirement.",
    countryIso3: "USA",
    jurisdictionName: "New York State",
    jurisdictionType: "us_state",
    type: "law",
    bindingStatus: "binding",
    aiSpecific: true,
    status: "In force",
    dateAdopted: "2025-07-11",
    dateInForce: "2025-11-24",
    summary:
      "Requires disclosure when prices shown to consumers are personalised using algorithms / AI. First state-level surveillance-pricing law in the U.S.",
    sourceName: "New York State Senate — General Business §349-A",
    sourceUrl: "https://www.nysenate.gov/legislation/laws/GBS/349-A",
  },
  {
    id: "us-ca-2025-ai-package",
    name: "California 2025 AI legislative activity package",
    ...REVIEWED_OFFICIAL_SOURCE,
    verificationNotes:
      "Official Governor source confirms SB 53 and related California AI legislative activity. This remains a representative package marker, not a single codified act, and is not counted as binding law.",
    countryIso3: "USA",
    jurisdictionName: "California",
    jurisdictionType: "us_state",
    type: "framework",
    bindingStatus: "non_binding",
    aiSpecific: true,
    status: "Representative package entry; not a single codified act",
    dateAdopted: "2025-09-29",
    summary:
      "Represents California's 2025 state-level AI lawmaking activity. SB 53 is separately tracked as the binding frontier-AI transparency law; this package marker is not counted as binding law until the broader package boundaries are verified bill by bill.",
    sourceName: "Governor of California - SB 53 signing",
    sourceUrl:
      "https://www.gov.ca.gov/2025/09/29/governor-newsom-signs-sb-53-advancing-californias-world-leading-artificial-intelligence-industry/",
  },
  {
    id: "us-ca-sb-53-frontier",
    name: "California SB 53 — Transparency in Frontier Artificial Intelligence Act",
    ...VERIFIED_OFFICIAL_SOURCE,
    verificationNotes:
      "California Legislature page shows SB 53 as chaptered; Governor source confirms signing of the Transparency in Frontier Artificial Intelligence Act.",
    countryIso3: "USA",
    jurisdictionName: "California",
    jurisdictionType: "us_state",
    type: "law",
    bindingStatus: "binding",
    aiSpecific: true,
    status: "In force",
    dateAdopted: "2025-09-29",
    summary:
      "First U.S. frontier-AI transparency law. Requires large frontier developers to publish safety frameworks, report safety incidents, and submit to whistleblower protections.",
    sourceName: "California Legislature — SB 53",
    sourceUrl: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB53",
  },

  // ===== EU member-state implementations (in addition to Italy & Slovenia already in nationalAIRegulations) =====
  {
    id: "fr-ai-act-implementation-draft",
    name: "France - EU AI Act implementation activity",
    ...REVIEWED_OFFICIAL_SOURCE,
    verificationNotes:
      "Official CNIL annual-report source supports French EU AI Act implementation activity and CNIL's AI-governance role. The record has been softened because this source does not establish a comprehensive national implementation act.",
    countryIso3: "FRA",
    jurisdictionName: "France",
    jurisdictionType: "eu_member",
    type: "framework",
    bindingStatus: "non_binding",
    aiSpecific: true,
    status: "Implementation activity; specific national act not tracked",
    dateAdopted: "2025-06-01",
    summary:
      "French EU AI Act implementation activity, including CNIL's AI governance and supervisory work. This entry is not treated as a national AI Act or binding implementation law until a specific official act is added.",
    sourceName: "CNIL - Annual Report 2025",
    sourceUrl: "https://www.cnil.fr/sites/default/files/2026-05/rapport_annuel_2025.pdf",
  },
  {
    id: "de-ai-act-implementation-draft",
    name: "Germany - draft EU AI Act implementation",
    ...REVIEWED_OFFICIAL_SOURCE,
    verificationNotes:
      "Official Bundestag release supports a 2025 draft implementation bill and BNetzA's proposed central role. Keep as proposed/draft until the act is promulgated.",
    countryIso3: "DEU",
    jurisdictionName: "Germany",
    jurisdictionType: "eu_member",
    type: "proposed_law",
    bindingStatus: "proposed",
    aiSpecific: true,
    status: "Draft; BNetzA proposed as central market surveillance authority",
    dateAdopted: "2025-04-01",
    summary:
      "German implementation of the EU AI Act. BNetzA (Federal Network Agency) proposed as central market surveillance authority; sectoral coordination with BSI and BaFin.",
    sourceName: "German Bundestag - EU AI Act implementation bill",
    sourceUrl: "https://www.bundestag.de/presse/hib/kurzmeldungen-1155112",
  },
];

export const SUBNATIONAL_BY_ID: Record<string, SubnationalAIRule> =
  SUBNATIONAL_AI_RULES.reduce((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {} as Record<string, SubnationalAIRule>);

export function getSubnationalRulesByCountry(iso3: string): SubnationalAIRule[] {
  return SUBNATIONAL_AI_RULES.filter((r) => r.countryIso3 === iso3);
}

/**
 * "Subnational" has a precise meaning to this audience, and an EU member state
 * implementing the AI Act is not one. These rows live in the same module because
 * they share a shape — a rule below the level of a distinct national AI statute —
 * but they are counted and labelled separately.
 */
export type JurisdictionLevel = "subnational" | "national_implementation";

export function jurisdictionLevel(
  jurisdictionType: SubnationalAIRule["jurisdictionType"]
): JurisdictionLevel {
  return jurisdictionType === "eu_member" ? "national_implementation" : "subnational";
}

/** Genuine subnational rules: US states, cities, provinces. */
export const SUBNATIONAL_ONLY_RULES: SubnationalAIRule[] = SUBNATIONAL_AI_RULES.filter(
  (rule) => jurisdictionLevel(rule.jurisdictionType) === "subnational"
);

/** National-level implementation activity, tracked separately from subnational rules. */
export const NATIONAL_IMPLEMENTATION_RULES: SubnationalAIRule[] = SUBNATIONAL_AI_RULES.filter(
  (rule) => jurisdictionLevel(rule.jurisdictionType) === "national_implementation"
);
