import type { EUAIActAuthorityMatrixRow, VerificationMetadata } from "../types";
import { EU_AI_ACT_AUTHORITY_CONTACT_BY_COUNTRY } from "./euAiActAuthorityContacts";

const COMMISSION_MSA_SOURCE_URL =
  "https://digital-strategy.ec.europa.eu/en/policies/market-surveillance-authorities-under-ai-act";
const SOURCE_NAME = "European Commission - Market Surveillance Authorities under the AI Act";

const VERIFIED_COMMISSION = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-06-13",
  reviewStatus: "editorial_checked",
} satisfies VerificationMetadata;

const LIKELY_COMMISSION = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-06-13",
  reviewStatus: "editorial_checked",
} satisfies VerificationMetadata;

const LISTED_CAVEAT =
  "Commission list status only; domestic powers and sectoral designations still require member-state source checks.";
const MISSING_CAVEAT =
  "Commission table currently shows no published member-state contact; this is not proof that no authority exists.";
const PENDING_CAVEAT =
  "Commission table marks this row with an asterisk, meaning final national adoption is still pending.";

function memberRow(countryIso3: string, countryName: string): EUAIActAuthorityMatrixRow {
  const contact = EU_AI_ACT_AUTHORITY_CONTACT_BY_COUNTRY[countryIso3];
  if (contact) {
    return {
      ...contact,
      caveat: contact.status === "listed" ? LISTED_CAVEAT : PENDING_CAVEAT,
      sourceName: SOURCE_NAME,
      sourceUrl: COMMISSION_MSA_SOURCE_URL,
      ...(contact.status === "listed" ? VERIFIED_COMMISSION : LIKELY_COMMISSION),
    };
  }

  return {
    id: `${countryIso3.toLowerCase()}-ai-act-msa-not-yet-published`,
    countryIso3,
    countryName,
    status: "not_yet_published",
    jurisdiction: countryName,
    domains: ["public-sector", "enforcement-litigation"],
    summary: "No published AI Act market-surveillance contact appears in the current Commission table.",
    caveat: MISSING_CAVEAT,
    sourceName: SOURCE_NAME,
    sourceUrl: COMMISSION_MSA_SOURCE_URL,
    verificationNotes:
      "Commission page shows a dash for this member-state row in the 2026-06-13 check; this is list-status context, not a domestic legal conclusion.",
    ...LIKELY_COMMISSION,
  };
}

const EU_MEMBER_COUNTRY_ROWS = [
  ["AUT", "Austria"],
  ["BEL", "Belgium"],
  ["BGR", "Bulgaria"],
  ["HRV", "Croatia"],
  ["CYP", "Cyprus"],
  ["CZE", "Czechia"],
  ["DNK", "Denmark"],
  ["EST", "Estonia"],
  ["FIN", "Finland"],
  ["FRA", "France"],
  ["DEU", "Germany"],
  ["GRC", "Greece"],
  ["HUN", "Hungary"],
  ["IRL", "Ireland"],
  ["ITA", "Italy"],
  ["LVA", "Latvia"],
  ["LTU", "Lithuania"],
  ["LUX", "Luxembourg"],
  ["MLT", "Malta"],
  ["NLD", "Netherlands"],
  ["POL", "Poland"],
  ["PRT", "Portugal"],
  ["ROU", "Romania"],
  ["SVK", "Slovakia"],
  ["SVN", "Slovenia"],
  ["ESP", "Spain"],
  ["SWE", "Sweden"],
] as const;

export const EU_AI_ACT_AUTHORITY_MATRIX: EUAIActAuthorityMatrixRow[] = EU_MEMBER_COUNTRY_ROWS.map(
  ([iso3, name]) => memberRow(iso3, name)
);

export const EU_AI_ACT_AUTHORITY_BY_COUNTRY = Object.fromEntries(
  EU_AI_ACT_AUTHORITY_MATRIX.map((row) => [row.countryIso3, row])
) as Record<string, EUAIActAuthorityMatrixRow>;
