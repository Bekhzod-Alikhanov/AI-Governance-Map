import type { InternationalParticipation, ParticipationType, VerificationMetadata } from "../types";
import {
  ASEAN_MEMBERS,
  AFRICAN_UNION_MEMBERS,
  APEC_MEMBERS,
  G20_MEMBERS,
  G7_MEMBERS,
  OECD_MEMBERS,
  OECD_NON_MEMBER_ADHERENTS,
  COUNTRIES,
} from "./countries";
import { EU_MEMBER_ISO3 } from "./euMembers";
import { INSTRUMENT_BY_ID } from "./internationalInstruments";

const EU = "EUU";

function makeRows(
  instrumentId: string,
  iso3List: ReadonlyArray<string>,
  participationType: ParticipationType,
  options: { date?: string; sourceName?: string; sourceUrl?: string; notes?: string } & VerificationMetadata = {}
): InternationalParticipation[] {
  const inst = INSTRUMENT_BY_ID[instrumentId];
  if (!inst) {
    throw new Error(`Unknown instrument id: ${instrumentId}`);
  }
  const sourceName = options.sourceName ?? inst.sourceName;
  const sourceUrl = options.sourceUrl ?? inst.sourceUrl;
  const date = options.date ?? inst.date;
  return iso3List.map((iso3) => ({
    id: `${instrumentId}::${iso3}::${participationType}`,
    instrumentId,
    countryIso3: iso3,
    participationType,
    date,
    sourceName,
    sourceUrl,
    notes: options.notes,
    sourceKind: options.sourceKind ?? inst.sourceKind,
    verificationStatus: options.verificationStatus ?? inst.verificationStatus,
    confidence: options.confidence ?? inst.confidence,
    lastVerified: options.lastVerified ?? inst.lastVerified,
    verificationNotes: options.verificationNotes ?? inst.verificationNotes,
  }));
}

// Bletchley Declaration (30 participants; New Zealand joined later in 2024)
const BLETCHLEY_PARTICIPANTS = [
  "AUS","BRA","CAN","CHL","CHN",EU,"FRA","DEU","IND","IDN","IRL","ISR","ITA","JPN","KEN",
  "SAU","NLD","NGA","PHL","KOR","RWA","SGP","ESP","CHE","TUR","UKR","ARE","GBR","USA","NZL",
];

const SEOUL_LEADERS_PARTICIPANTS = [
  "AUS","CAN",EU,"FRA","DEU","ITA","JPN","KOR","SGP","GBR","USA",
];

const SEOUL_MINISTERIAL_PARTICIPANTS = [
  "AUS","CAN","CHL","FRA","DEU","IND","IDN","ISR","ITA","JPN","KEN","MEX","NLD","NGA","NZL",
  "PHL","KOR","RWA","SAU","SGP","ESP","CHE","TUR","UKR","ARE","GBR","USA",EU,
];

const PARIS_STATEMENT_PARTICIPANTS = [
  "ARM","AUS","AUT","BEL","BRA","BGR","KHM","CAN","CHL","CHN","COL","CIV","HRV","CYP","CZE",
  "DNK","DJI","EGY","EST","FIN","FRA","DEU","GRC","HUN","ISL","IND","IDN","IRL","ITA","JPN",
  "KAZ","KEN","LVA","LIE","LTU","LUX","MLT","MEX","MDA","MCO","MAR","NLD","NZL","NGA","NOR",
  "PER","POL","PRT","KOR","ROU","RWA","SEN","SRB","SGP","SVK","SVN","ESP","SWE","CHE","THA",
  "UKR","URY","ZWE",EU,
];

const INASI_LAUNCH_MEMBERS = [
  "AUS","CAN",EU,"FRA","DEU","ITA","JPN","KOR","SGP","GBR","USA",
];

const COE_CONVENTION_SIGNATORIES = [
  "AND","ARM","BIH","GEO","ISL","LIE","MNE","MKD","NOR","MDA","SMR","CHE","UKR","GBR",
  "CAN",EU,"ISR","JPN","USA","URY",
];

const UN_MEMBER_ISO3: ReadonlyArray<string> = COUNTRIES.filter(
  (c) => c.iso3 !== EU
).map((c) => c.iso3);

const rows: InternationalParticipation[] = [];

// EU AI Act: applies to 27 EU member states via 'applicable_via_eu'; also the EU itself.
rows.push(
  ...makeRows("eu-ai-act", EU_MEMBER_ISO3, "applicable_via_eu", {
    notes: "Directly applicable EU regulation via EU membership.",
  }),
  ...makeRows("eu-ai-act", [EU], "member"),
);

// Council of EU conclusions on AI: EU member states
rows.push(
  ...makeRows("council-eu-ai-conclusions-2024", EU_MEMBER_ISO3, "covered_by_membership", {
    notes: "Council of the EU conclusions are EU-level political guidance; coverage shown via EU membership.",
  }),
  ...makeRows("council-eu-ai-conclusions-2024", [EU], "member"),
);

// CEN-CENELEC AI Act standards work: European standardization infrastructure,
// not country-by-country enactment or explicit state endorsement.
rows.push(
  ...makeRows("cen-cenelec-ai-act-standards", EU_MEMBER_ISO3, "covered_by_membership", {
    notes:
      "Coverage shown via EU/CEN-CENELEC standardization ecosystem. This is not national law or explicit country sign-on.",
  }),
  ...makeRows("cen-cenelec-ai-act-standards", [EU], "member", {
    notes:
      "EU-level standardization support for AI Act implementation; not a standalone binding regulation.",
  }),
);

// Council of Europe Framework Convention on AI — signed (20), and EU ratified.
rows.push(
    ...makeRows("coe-ai-convention", COE_CONVENTION_SIGNATORIES, "signed", {
      sourceName: "Council of Europe — Treaty Office, CETS No. 225",
      sourceUrl: "https://www.coe.int/en/web/conventions/full-list?module=signatures-by-treaty&treatynum=225",
      notes:
        "Signed 5 Sep 2024 or later. Manual Treaty Office check on 5 Jun 2026 confirmed status as of 22 May 2026: 19 signatures not followed by ratification and 1 EU ratification/accession; treaty not yet in force.",
      sourceKind: "official",
      verificationStatus: "verified",
      confidence: "high",
      lastVerified: "2026-06-05",
    }),
  ...makeRows("coe-ai-convention", [EU], "ratified", {
    date: "2026-05-15",
    sourceName: "Council of Europe — Treaty Office, CETS No. 225",
    sourceUrl: "https://www.coe.int/en/web/conventions/full-list?module=signatures-by-treaty&treatynum=225",
      notes: "EU deposited its instrument of ratification on 15 May 2026.",
      sourceKind: "official",
      verificationStatus: "verified",
      confidence: "high",
      lastVerified: "2026-06-05",
    }),
  );

// Bletchley Declaration
rows.push(
  ...makeRows("bletchley-declaration", BLETCHLEY_PARTICIPANTS, "endorsed", {
    notes: "Endorsed at the UK AI Safety Summit, 1–2 November 2023. New Zealand joined later.",
  })
);

// Seoul Declaration
rows.push(...makeRows("seoul-declaration", SEOUL_LEADERS_PARTICIPANTS, "endorsed"));
rows.push(...makeRows("seoul-statement-of-intent", SEOUL_LEADERS_PARTICIPANTS, "endorsed"));

// Seoul Ministerial
rows.push(...makeRows("seoul-ministerial-statement", SEOUL_MINISTERIAL_PARTICIPANTS, "endorsed"));

// Paris AI Action Summit Statement
rows.push(
  ...makeRows("paris-statement-2025", PARIS_STATEMENT_PARTICIPANTS, "endorsed", {
    notes:
      "Signed by 63 countries plus the African Union Commission and the EU. Notably not signed by the United States or the United Kingdom.",
  })
);

// International Network of AI Safety Institutes
rows.push(
  ...makeRows("intl-network-aisi", INASI_LAUNCH_MEMBERS, "member", {
    sourceName: "GOV.UK — Seoul Declaration, leaders' session",
    sourceUrl:
      "https://www.gov.uk/government/publications/seoul-declaration-for-safe-innovative-and-inclusive-ai-ai-seoul-summit-2024/seoul-declaration-for-safe-innovative-and-inclusive-ai-by-participants-attending-the-leaders-session-ai-seoul-summit-21-may-2024",
    notes: "Launch members of the international network; renamed in December 2025.",
    sourceKind: "official",
    verificationStatus: "verified",
    confidence: "high",
    lastVerified: "2026-05-20",
  })
);

// G7 Hiroshima trio (statement + guiding principles + code of conduct)
const HIROSHIMA_PARTICIPANTS = [...G7_MEMBERS, EU];
for (const id of [
  "g7-hiroshima-statement",
  "hiroshima-guiding-principles",
  "hiroshima-code-of-conduct",
  "hiroshima-reporting-framework",
]) {
  rows.push(...makeRows(id, HIROSHIMA_PARTICIPANTS, "endorsed"));
}

// G20 AI Principles
rows.push(...makeRows("g20-ai-principles-2019", [...G20_MEMBERS, EU], "member"));

// OECD AI Principles — adherence
rows.push(
  ...makeRows("oecd-ai-principles", [...OECD_MEMBERS, EU], "adherent", {
    notes: "OECD member or EU adherent.",
  }),
  ...makeRows("oecd-ai-principles", OECD_NON_MEMBER_ADHERENTS, "adherent", {
    notes: "Non-OECD-member adherent to the AI Principles.",
  }),
);

// UNESCO Recommendation
rows.push(
  ...makeRows("unesco-ethics-rec-2021", UN_MEMBER_ISO3, "covered_by_membership", {
    notes: "Adopted by UNESCO General Conference in 2021. Coverage shown via UN/UNESCO membership; not a per-state sign-on.",
  })
);

// UN General Assembly resolutions and Global Digital Compact
for (const id of ["unga-78-265", "unga-78-311", "global-digital-compact", "unga-79-325"]) {
  rows.push(
    ...makeRows(id, UN_MEMBER_ISO3, "covered_by_membership", {
      notes: "Adopted by the UN General Assembly. Coverage shown via UN membership.",
    })
  );
}

// ASEAN guides
for (const id of ["asean-ai-guide-2024", "asean-genai-guide-2025"]) {
  rows.push(
    ...makeRows(id, ASEAN_MEMBERS, "covered_by_membership", {
      notes: "Coverage shown via ASEAN membership.",
    })
  );
}

// African Union Continental AI Strategy
rows.push(
  ...makeRows("au-ai-strategy-2024", AFRICAN_UNION_MEMBERS, "covered_by_membership", {
    notes: "Coverage shown via African Union membership.",
  })
);

// APEC instruments
for (const id of ["apec-digital-ai-ministerial-2025", "apec-ai-initiative-2026-2030"]) {
  rows.push(
    ...makeRows(id, APEC_MEMBERS, "covered_by_membership", {
      notes: "Coverage shown via APEC membership. APEC includes economies rather than only sovereign states.",
    })
  );
}

// Bilateral AI instruments
rows.push(
  ...makeRows("eu-us-trustworthy-ai-roadmap", [EU, "USA"], "participant"),
  ...makeRows("uk-us-aisi-mou", ["GBR", "USA"], "signed"),
);

export const INTERNATIONAL_PARTICIPATION: InternationalParticipation[] = rows;

export const PARTICIPATION_BY_COUNTRY: Record<string, InternationalParticipation[]> = rows.reduce(
  (acc, row) => {
    (acc[row.countryIso3] ??= []).push(row);
    return acc;
  },
  {} as Record<string, InternationalParticipation[]>
);

export const PARTICIPATION_BY_INSTRUMENT: Record<string, InternationalParticipation[]> = rows.reduce(
  (acc, row) => {
    (acc[row.instrumentId] ??= []).push(row);
    return acc;
  },
  {} as Record<string, InternationalParticipation[]>
);
