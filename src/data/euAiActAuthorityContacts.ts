import type { EUAIActAuthorityStatus, GovernanceDomainId, InstitutionType } from "../types";

export interface EUAIActAuthorityContactRow {
  id: string;
  countryIso3: string;
  countryName: string;
  status: Exclude<EUAIActAuthorityStatus, "not_yet_published">;
  authorityName: string;
  authorityEnglishName: string;
  institutionType: InstitutionType;
  jurisdiction: string;
  contactUrl?: string;
  domains: GovernanceDomainId[];
  summary: string;
  verificationNotes: string;
}

export const EU_AI_ACT_AUTHORITY_CONTACTS: EUAIActAuthorityContactRow[] = [
  {
    id: "cy-commissioner-communications-ai-act-msa",
    countryIso3: "CYP",
    countryName: "Cyprus",
    status: "listed",
    jurisdiction: "Cyprus",
    authorityName: "Commissioner of Communications",
    authorityEnglishName: "Commissioner of Communications",
    institutionType: "other",
    domains: ["public-sector", "enforcement-litigation"],
    summary: "Commission-listed Cyprus AI Act market-surveillance contact.",
    verificationNotes: "Official Commission list names Cyprus's Commissioner of Communications.",
  },
  {
    id: "ie-dete-ai-act-competent-authority",
    countryIso3: "IRL",
    countryName: "Ireland",
    status: "listed",
    jurisdiction: "Ireland",
    authorityName: "Minister for Enterprise, Tourism and Employment",
    authorityEnglishName: "Minister for Enterprise, Tourism and Employment",
    institutionType: "digital_ministry",
    contactUrl:
      "https://enterprise.gov.ie/en/what-we-do/innovation-research-development/artificial-intelligence/eu-ai-act/",
    domains: ["public-sector", "enforcement-litigation"],
    summary: "Commission-listed Irish AI Act market-surveillance contact.",
    verificationNotes: "Official Commission list names Ireland's Minister for Enterprise, Tourism and Employment.",
  },
  {
    id: "it-acn-ai-act-msa",
    countryIso3: "ITA",
    countryName: "Italy",
    status: "listed",
    jurisdiction: "Italy",
    authorityName: "Agenzia per la cybersicurezza nazionale",
    authorityEnglishName: "National Cybersecurity Agency",
    institutionType: "other",
    contactUrl: "https://www.acn.gov.it/",
    domains: ["cybersecurity-critical-infrastructure", "enforcement-litigation"],
    summary: "Commission-listed Italian AI Act market-surveillance contact.",
    verificationNotes: "Official Commission list names Italy's National Cybersecurity Agency.",
  },
  {
    id: "lv-crpc-ai-act-msa",
    countryIso3: "LVA",
    countryName: "Latvia",
    status: "listed",
    jurisdiction: "Latvia",
    authorityName: "Pateretaju tiesibu aizsardzibas centrs",
    authorityEnglishName: "Consumer Rights Protection Centre",
    institutionType: "consumer_protection_authority",
    contactUrl: "https://www.ptac.gov.lv/",
    domains: ["public-sector", "enforcement-litigation"],
    summary: "Commission-listed Latvian AI Act market-surveillance contact.",
    verificationNotes: "Official Commission list names Latvia's Consumer Rights Protection Centre.",
  },
  {
    id: "lt-rrt-ai-act-msa",
    countryIso3: "LTU",
    countryName: "Lithuania",
    status: "listed",
    jurisdiction: "Lithuania",
    authorityName: "Lietuvos Respublikos rysiu reguliavimo tarnyba",
    authorityEnglishName: "Communications Regulatory Authority of the Republic of Lithuania",
    institutionType: "other",
    contactUrl: "https://www.rrt.lt/",
    domains: ["public-sector", "enforcement-litigation"],
    summary: "Commission-listed Lithuanian AI Act market-surveillance contact.",
    verificationNotes: "Official Commission list names Lithuania's Communications Regulatory Authority.",
  },
  {
    id: "lu-cnpd-ai-act-pending-msa",
    countryIso3: "LUX",
    countryName: "Luxembourg",
    status: "pending_final_adoption",
    jurisdiction: "Luxembourg",
    authorityName: "Commission nationale pour la protection des donnees",
    authorityEnglishName: "National Commission for Data Protection",
    institutionType: "data_protection_authority",
    contactUrl: "https://cnpd.public.lu/",
    domains: ["public-sector", "enforcement-litigation"],
    summary: "Pending Commission-listed Luxembourg AI Act Single Point of Contact.",
    verificationNotes: "Commission marks Luxembourg's National Commission for Data Protection as pending final adoption.",
  },
  {
    id: "si-akos-ai-act-pending-msa",
    countryIso3: "SVN",
    countryName: "Slovenia",
    status: "pending_final_adoption",
    jurisdiction: "Slovenia",
    authorityName: "Agencija za komunikacijska omrezja in storitve Republike Slovenije",
    authorityEnglishName: "Agency for Communication Networks and Services of the Republic of Slovenia",
    institutionType: "other",
    contactUrl: "https://www.akos-rs.si/",
    domains: ["public-sector", "enforcement-litigation"],
    summary: "Pending Commission-listed Slovenian AI Act Single Point of Contact.",
    verificationNotes: "Commission marks Slovenia's Agency for Communication Networks and Services as pending final adoption.",
  },
  {
    id: "es-aesia-ai-act-pending-msa",
    countryIso3: "ESP",
    countryName: "Spain",
    status: "pending_final_adoption",
    jurisdiction: "Spain",
    authorityName: "Agencia Espanola de Supervision de Inteligencia Artificial",
    authorityEnglishName: "Spanish Artificial Intelligence Surveillance Agency",
    institutionType: "ai_office",
    contactUrl: "https://aesia.digital.gob.es/",
    domains: ["frontier-gpai", "public-sector", "enforcement-litigation"],
    summary: "Pending Commission-listed Spanish AI Act Single Point of Contact.",
    verificationNotes: "Commission marks Spain's AI supervision agency as pending final adoption.",
  },
];

export const EU_AI_ACT_AUTHORITY_CONTACT_BY_COUNTRY = Object.fromEntries(
  EU_AI_ACT_AUTHORITY_CONTACTS.map((row) => [row.countryIso3, row])
) as Record<string, EUAIActAuthorityContactRow>;
