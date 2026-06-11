import type {
  ExpertReviewMetadata,
  InstitutionRecord,
  PolicyProcessRecord,
  PublicSectorAIRecord,
  RecordChangeLogEntry,
  StandardsConformityRecord,
  VerificationMetadata,
} from "../types";

const VERIFIED_OFFICIAL = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-06-10",
  reviewStatus: "editorial_checked",
} satisfies VerificationMetadata;

const LIKELY_OFFICIAL = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-06-10",
  reviewStatus: "editorial_checked",
} satisfies VerificationMetadata;

const VERIFIED_OFFICIAL_2026_06_11 = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-06-11",
  reviewStatus: "editorial_checked",
} satisfies VerificationMetadata;

const LIKELY_OFFICIAL_2026_06_11 = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-06-11",
  reviewStatus: "editorial_checked",
} satisfies VerificationMetadata;

const STANDARDS_CAVEAT =
  "Standards and conformity-assessment rows are not national law unless a verified legal instrument incorporates them.";
const MSA_SCOPE =
  "Commission-listed AI Act market-surveillance contact; domestic powers require local implementation checks.";
const MSA_POWERS = ["Listed as national AI Act market-surveillance contact", "Participates in AI Act market-surveillance architecture"];
const MSA_CAVEAT =
  "Commission list confirms the contact; it does not fully describe domestic powers or sectoral enforcement arrangements.";

const CORPUS_REVIEWER = {
  reviewerRole: "editorial source verification",
  reviewDate: "2026-06-10",
  reviewScope:
    "Official-first starter corpus records for institutions, policy processes, standards/conformity, public-sector AI, and corpus exports.",
  unresolvedCaveats: [
    "Council of Europe Treaty Office pages can block automated checks and require periodic manual verification.",
    "Corpus coverage is a curated starter set, not evidence that omitted countries lack relevant institutions or processes.",
  ],
} satisfies ExpertReviewMetadata;

export const INSTITUTION_RECORDS: InstitutionRecord[] = [
  {
    id: "eu-ai-office",
    name: "European AI Office",
    institutionType: "ai_office",
    jurisdiction: "European Union",
    countryIso3: "EUU",
    mandate:
      "Supports AI Act implementation, enforces GPAI model rules at EU level, and coordinates EU AI governance tools.",
    authorityScope:
      "EU-level GPAI supervision and AI Act implementation coordination; national authorities remain responsible for much of member-state enforcement.",
    powers: [
      "Evaluate general-purpose AI model capabilities",
      "Request information and measures from model providers",
      "Investigate possible GPAI-rule infringements",
      "Prepare guidance, implementing tools, and codes of practice",
    ],
    domains: ["frontier-gpai", "public-sector", "enforcement-litigation"],
    relatedRecords: [
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
      { kind: "national_rule", id: "eu-ai-act-regional", label: "EU AI Act regional applicability" },
      { kind: "implementation", id: "eu-ai-act-phased-application", label: "AI Act phased application" },
    ],
    contactUrl: "https://digital-strategy.ec.europa.eu/en/policies/ai-office",
    summary:
      "Central EU institution for AI Act implementation and GPAI supervision, including codes, guidance, evaluations, and coordination.",
    caveat: "EU AI Office powers are tied to the AI Act; this institution row is not a separate national law.",
    sourceName: "European Commission - European AI Office",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/ai-office",
    verificationNotes:
      "Official Commission page describes AI Office support for AI Act implementation, GPAI enforcement, evaluations, information requests, and sanctions.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "us-nist-caisi",
    name: "NIST Center for AI Standards and Innovation (CAISI)",
    institutionType: "ai_safety_institute",
    jurisdiction: "United States",
    countryIso3: "USA",
    mandate:
      "U.S. government point of contact for commercial AI testing, AI security evaluation science, and standards collaboration.",
    authorityScope:
      "Voluntary standards, collaborative research, and unclassified evaluations; not represented here as a mandatory licensing regulator.",
    powers: [
      "Develop AI security guidelines and best practices",
      "Establish voluntary agreements with AI developers and evaluators",
      "Lead unclassified evaluations of risky AI capabilities",
      "Coordinate with federal security, science, and policy agencies",
    ],
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure", "compute-cloud-chips"],
    relatedRecords: [
      { kind: "national_rule", id: "us-nist-ai-rmf", label: "NIST AI RMF" },
      { kind: "institution", id: "us-ftc", label: "FTC" },
    ],
    contactUrl: "https://www.nist.gov/caisi",
    summary:
      "Technical AI evaluation and standards body with public frontier-model evaluation and procurement-evaluation links.",
    caveat: "CAISI rows describe standards/evaluation context, not an independent binding pre-release approval requirement.",
    sourceName: "NIST - Center for AI Standards and Innovation",
    sourceUrl: "https://www.nist.gov/caisi",
    verificationNotes:
      "Official NIST page describes voluntary agreements, unclassified evaluations, national-security risk focus, and interagency coordination.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "uk-ai-security-institute",
    name: "UK AI Security Institute",
    institutionType: "ai_safety_institute",
    jurisdiction: "United Kingdom",
    countryIso3: "GBR",
    mandate:
      "State-backed technical research institute for advanced AI risk understanding, testing, and mitigation research.",
    authorityScope:
      "Research, testing infrastructure, partnerships, and policy evidence; not represented here as a statutory AI licensing authority.",
    powers: [
      "Conduct frontier AI testing and research",
      "Build infrastructure for advanced-AI risk assessment",
      "Partner with AI developers and governments",
      "Inform policymakers about emerging AI risks",
    ],
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    relatedRecords: [{ kind: "policy_process", id: "uk-aisi-frontier-trends-monitoring", label: "AISI frontier trends monitoring" }],
    contactUrl: "https://www.aisi.gov.uk/",
    summary:
      "UK state-backed AI safety institute focused on advanced-AI research, evaluation, and global policy evidence.",
    caveat: "AISI testing and research are tracked as evidence/context unless a separate binding legal source applies.",
    sourceName: "UK AI Security Institute",
    sourceUrl: "https://www.aisi.gov.uk/",
    verificationNotes:
      "Official AISI site describes its state-backed mission, advanced-AI testing, developer partnerships, and policy role.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "cen-cenelec-jtc21",
    name: "CEN-CENELEC Joint Technical Committee 21",
    institutionType: "standards_body",
    jurisdiction: "European Union / European standardization",
    countryIso3: "EUU",
    mandate:
      "Develop European AI standards, including harmonized standards supporting the EU AI Act.",
    authorityScope:
      "European standardization work; legal effect depends on EU publication or incorporation into applicable legal frameworks.",
    powers: [
      "Develop European AI standards",
      "Support EU AI Act implementation through harmonized standards",
      "Coordinate technical working groups and national standards participation",
    ],
    domains: ["frontier-gpai", "standards-conformity"],
    relatedRecords: [
      { kind: "international_instrument", id: "cen-cenelec-ai-act-standards", label: "CEN-CENELEC AI Act standardization" },
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
    ],
    contactUrl: "https://www.cencenelec.eu/areas-of-work/cen-cenelec-topics/artificial-intelligence/",
    summary:
      "European standardization body developing AI Act-supporting standards, including risk, quality, conformity, datasets, robustness, and cybersecurity topics.",
    caveat: STANDARDS_CAVEAT,
    sourceName: "CEN-CENELEC - Artificial Intelligence",
    sourceUrl: "https://www.cencenelec.eu/areas-of-work/cen-cenelec-topics/artificial-intelligence/",
    verificationNotes:
      "Official CEN-CENELEC page describes JTC 21, AI Act support, harmonized standards, and five working groups.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "us-ftc",
    name: "U.S. Federal Trade Commission",
    institutionType: "consumer_protection_authority",
    jurisdiction: "United States",
    countryIso3: "USA",
    mandate:
      "Consumer protection and competition authority with AI-related enforcement activity under existing law.",
    authorityScope:
      "Civil consumer-protection and competition enforcement; not an AI-specific licensing agency.",
    powers: [
      "Bring enforcement actions against deceptive or unfair AI-related conduct",
      "Issue business guidance and policy statements",
      "Investigate conduct under existing consumer-protection and competition law",
    ],
    domains: ["enforcement-litigation", "public-sector"],
    relatedRecords: [{ kind: "enforcement", id: "ftc-operation-ai-comply-2024", label: "Operation AI Comply" }],
    contactUrl: "https://www.ftc.gov/",
    summary:
      "U.S. consumer-protection and competition authority relevant to AI claims, deceptive AI products, and unfair AI-enabled conduct.",
    caveat: "FTC authority is tracked as existing-law enforcement context, not a comprehensive AI statute.",
    sourceName: "FTC - Operation AI Comply",
    sourceUrl:
      "https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes",
    verificationNotes:
      "Official FTC release states that Operation AI Comply announced five law-enforcement actions involving AI claims or AI-enabled deceptive conduct.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "canada-treasury-board-secretariat",
    name: "Treasury Board of Canada Secretariat",
    institutionType: "digital_ministry",
    jurisdiction: "Canada",
    countryIso3: "CAN",
    mandate:
      "Federal digital-government policy body associated with Canada's Algorithmic Impact Assessment and automated-decision policy infrastructure.",
    authorityScope:
      "Public-sector automated-decision governance for federal institutions; not a general private-sector frontier-lab regulator.",
    powers: [
      "Maintain public-sector AI/automated-decision policy tools",
      "Publish Algorithmic Impact Assessment guidance",
      "Set public-sector risk assessment expectations under federal policy",
    ],
    domains: ["public-sector"],
    relatedRecords: [{ kind: "public_sector_ai", id: "canada-algorithmic-impact-assessment", label: "Canada AIA tool" }],
    contactUrl:
      "https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/algorithmic-impact-assessment.html",
    summary:
      "Canadian federal public-sector algorithmic governance body behind the AIA tool and automated-decision risk assessment workflow.",
    caveat: "Public-sector policy context; it should not be read as a general private-sector AI law.",
    sourceName: "Canada.ca - Algorithmic Impact Assessment tool",
    sourceUrl:
      "https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/algorithmic-impact-assessment.html",
    verificationNotes:
      "Official Canada.ca page describes the AIA as a mandatory risk assessment tool supporting the Directive on Automated Decision-Making.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "coe-treaty-office",
    name: "Council of Europe Treaty Office",
    institutionType: "treaty_body",
    jurisdiction: "Council of Europe",
    mandate:
      "Official treaty-status record keeper for Council of Europe treaties, including CETS No. 225.",
    authorityScope:
      "Treaty status and signatures/ratifications; not a direct enforcement body for AI compliance.",
    powers: [
      "Publish signature and ratification status",
      "Maintain treaty metadata and entry-into-force status",
      "Serve as authoritative public treaty-status source",
    ],
    domains: ["frontier-gpai"],
    relatedRecords: [{ kind: "international_instrument", id: "coe-ai-convention", label: "CoE AI Convention" }],
    contactUrl: "https://www.coe.int/en/web/conventions/full-list?module=signatures-by-treaty&treatynum=225",
    summary:
      "Official Treaty Office status source for the Council of Europe Framework Convention on AI.",
    caveat: "Treaty Office status is authoritative for treaty formalities; legal effect still depends on signature, ratification, entry into force, and domestic implementation.",
    sourceName: "Council of Europe Treaty Office - CETS No. 225",
    sourceUrl: "https://www.coe.int/en/web/conventions/full-list?module=signatures-by-treaty&treatynum=225",
    verificationNotes:
      "Official Treaty Office page may block automated checks; manual verification remains required for time-sensitive treaty status.",
    ...LIKELY_OFFICIAL,
  },
  {
    id: "eu-edps-ai-act-supervisor",
    name: "European Data Protection Supervisor as AI Act supervisor for EU institutions",
    institutionType: "data_protection_authority",
    jurisdiction: "European Union institutions, bodies, offices, and agencies",
    countryIso3: "EUU",
    mandate:
      "Market-surveillance authority for AI Act implementation and respect by EU institutions, bodies, offices, and agencies.",
    authorityScope:
      "EU-institution scope under the AI Act; separate from member-state market surveillance authority designations.",
    powers: [
      "Monitor implementation and respect of the AI Act by EU institutions and bodies",
      "Act as designated market surveillance authority for EU institutions",
      "Impose administrative fines under AI Act conditions",
    ],
    domains: ["public-sector", "enforcement-litigation"],
    relatedRecords: [
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
      { kind: "institution", id: "eu-ai-office", label: "European AI Office" },
    ],
    contactUrl: "https://www.edps.europa.eu/",
    summary:
      "EU AI Act supervisory hook for EU institutions and bodies, distinct from national AI Act enforcement.",
    caveat:
      "This row concerns EU institutions and bodies; it should not be read as a national competent-authority designation.",
    sourceName: "European Commission - Market Surveillance Authorities under the AI Act",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/market-surveillance-authorities-under-ai-act",
    verificationNotes:
      "Official Commission page identifies the EDPS as the designated AI Act market surveillance authority for EU institutions, bodies and agencies.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "it-acn-ai-act-msa",
    name: "Agenzia per la cybersicurezza nazionale as Italy AI Act market-surveillance contact",
    institutionType: "other",
    jurisdiction: "Italy",
    countryIso3: "ITA",
    mandate:
      "Italian national contact listed by the European Commission for AI Act market surveillance implementation.",
    authorityScope: MSA_SCOPE,
    powers: MSA_POWERS,
    domains: ["cybersecurity-critical-infrastructure", "enforcement-litigation"],
    relatedRecords: [{ kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" }],
    contactUrl: "https://www.acn.gov.it/",
    summary: "Commission-listed Italian AI Act market-surveillance contact.",
    caveat: MSA_CAVEAT,
    sourceName: "European Commission - Market Surveillance Authorities under the AI Act",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/market-surveillance-authorities-under-ai-act",
    verificationNotes:
      "Official Commission list names Italy's Agenzia per la cybersicurezza nazionale / National Cybersecurity Agency.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "lv-crpc-ai-act-msa",
    name: "Consumer Rights Protection Centre as Latvia AI Act market-surveillance contact",
    institutionType: "consumer_protection_authority",
    jurisdiction: "Latvia",
    countryIso3: "LVA",
    mandate:
      "Latvian national contact listed by the European Commission for AI Act market surveillance implementation.",
    authorityScope: MSA_SCOPE,
    powers: MSA_POWERS,
    domains: ["public-sector", "enforcement-litigation"],
    relatedRecords: [{ kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" }],
    contactUrl: "https://www.ptac.gov.lv/",
    summary: "Commission-listed Latvian AI Act market-surveillance contact.",
    caveat: MSA_CAVEAT,
    sourceName: "European Commission - Market Surveillance Authorities under the AI Act",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/market-surveillance-authorities-under-ai-act",
    verificationNotes:
      "Official Commission list names Latvia's Patērētāju tiesību aizsardzības centrs / Consumer Rights Protection Centre.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "lt-rrt-ai-act-msa",
    name: "Communications Regulatory Authority as Lithuania AI Act market-surveillance contact",
    institutionType: "other",
    jurisdiction: "Lithuania",
    countryIso3: "LTU",
    mandate:
      "Lithuanian national contact listed by the European Commission for AI Act market surveillance implementation.",
    authorityScope: MSA_SCOPE,
    powers: MSA_POWERS,
    domains: ["public-sector", "enforcement-litigation"],
    relatedRecords: [{ kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" }],
    contactUrl: "https://www.rrt.lt/",
    summary: "Commission-listed Lithuanian AI Act market-surveillance contact.",
    caveat: MSA_CAVEAT,
    sourceName: "European Commission - Market Surveillance Authorities under the AI Act",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/market-surveillance-authorities-under-ai-act",
    verificationNotes:
      "Official Commission list names Lithuania's Communications Regulatory Authority.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "ie-dete-ai-act-competent-authority",
    name: "Ireland Minister for Enterprise, Tourism and Employment AI Act contact",
    institutionType: "digital_ministry",
    jurisdiction: "Ireland",
    countryIso3: "IRL",
    mandate:
      "Irish national contact listed by the European Commission for AI Act market surveillance implementation.",
    authorityScope: MSA_SCOPE,
    powers: MSA_POWERS,
    domains: ["public-sector", "enforcement-litigation"],
    relatedRecords: [{ kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" }],
    contactUrl: "https://enterprise.gov.ie/en/what-we-do/innovation-research-development/artificial-intelligence/eu-ai-act/",
    summary: "Commission-listed Irish AI Act market-surveillance contact.",
    caveat: MSA_CAVEAT,
    sourceName: "European Commission - Market Surveillance Authorities under the AI Act",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/market-surveillance-authorities-under-ai-act",
    verificationNotes:
      "Official Commission list names Ireland's Minister for Enterprise, Tourism and Employment.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "kr-ai-safety-institute",
    name: "Korea AI Safety Institute",
    institutionType: "ai_safety_institute",
    jurisdiction: "Republic of Korea",
    countryIso3: "KOR",
    mandate:
      "Korean technical AI-safety institute announced for domestic AI safety work and International Network of AI Safety Institutes participation.",
    authorityScope:
      "Technical safety and international cooperation context; not represented as a general AI licensing regulator.",
    powers: [
      "Participate in International Network of AI Safety Institutes work",
      "Support domestic AI safety research and evaluation activities",
      "Coordinate with MSIT on AI safety policy implementation",
    ],
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    relatedRecords: [{ kind: "national_rule", id: "kr-ai-basic-act", label: "Korea AI Basic Act" }],
    contactUrl: "https://www.msit.go.kr/eng/",
    summary:
      "Korean AI safety institute context for frontier-AI safety coordination and technical evaluation capacity.",
    caveat:
      "The official MSIT source verifies launch and network participation context; it does not by itself create lab-specific legal duties.",
    sourceName: "MSIT - Korea participates in International Network of AI Safety Institutes",
    sourceUrl: "https://www.msit.go.kr/eng/bbs/view.do?bbsSeqNo=42&mId=4&nttSeqNo=1057&sCode=eng",
    verificationNotes:
      "Official MSIT release states Korea launched its domestic AI Safety Institute in November 2024 and joined the international network process.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "sg-ai-verify-foundation",
    name: "AI Verify Foundation",
    institutionType: "technical_evaluation_body",
    jurisdiction: "Singapore / international AI assurance community",
    countryIso3: "SGP",
    mandate:
      "Open-source AI governance testing and assurance community associated with AI Verify tooling, Project Moonshot, sandbox work, and tester accreditation.",
    authorityScope:
      "Technical assurance and testing ecosystem; not a statutory AI regulator or binding certification authority in this dataset.",
    powers: [
      "Maintain AI Verify testing framework and toolkit context",
      "Convene AI owners, solution providers, users, and policymakers",
      "Support AI assurance sandbox and tester accreditation activity",
    ],
    domains: ["frontier-gpai", "standards-conformity", "public-sector"],
    relatedRecords: [],
    contactUrl: "https://aiverifyfoundation.sg/",
    summary:
      "Singapore-linked AI assurance and testing foundation for trustworthy-AI tooling and evaluation ecosystem context.",
    caveat:
      "Issuer-controlled assurance body context; rows using it should not imply legal certification or binding state regulation.",
    sourceName: "AI Verify Foundation",
    sourceUrl: "https://aiverifyfoundation.sg/",
    verificationNotes:
      "Official AI Verify Foundation site describes the foundation as a global open-source community and describes AI Verify, Project Moonshot, sandbox, and accreditation work.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
];

export const POLICY_PROCESS_RECORDS: PolicyProcessRecord[] = [
  {
    id: "eu-high-risk-ai-guidelines-consultation-2026",
    title: "EU draft guidelines on high-risk AI classification consultation",
    processType: "implementation_consultation",
    jurisdiction: "European Union",
    countryIso3: "EUU",
    stage: "Stakeholder feedback on draft guidelines",
    status: "open",
    deadline: "2026-07-23",
    conveningBody: "European Commission / AI Office",
    relatedRecords: [
      { kind: "institution", id: "eu-ai-office", label: "European AI Office" },
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
      { kind: "implementation", id: "eu-ai-act-phased-application", label: "AI Act phased application" },
    ],
    domains: ["frontier-gpai", "public-sector", "employment-hiring", "healthcare", "finance"],
    submissionUrl:
      "https://digital-strategy.ec.europa.eu/en/consultations/targeted-consultation-draft-guidelines-classification-high-risk-artificial-intelligence-systems",
    summary:
      "Open feedback process on draft guidelines for classifying high-risk AI systems under the AI Act.",
    caveat: "Draft guidance process; not a final legal interpretation and not itself a new binding rule.",
    sourceName: "European Commission - high-risk AI classification consultation",
    sourceUrl:
      "https://digital-strategy.ec.europa.eu/en/consultations/targeted-consultation-draft-guidelines-classification-high-risk-artificial-intelligence-systems",
    verificationNotes:
      "Official Commission consultation page says the consultation opened on 19 May 2026, was extended from 23 June to 23 July 2026, and final guidelines are expected by the end of 2026.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "eu-article50-transparency-guidelines-consultation-2026",
    title: "EU draft guidelines on AI Act transparency obligations consultation",
    processType: "implementation_consultation",
    jurisdiction: "European Union",
    countryIso3: "EUU",
    stage: "Stakeholder feedback on draft Article 50 transparency guidelines",
    status: "closed",
    deadline: "2026-06-03",
    conveningBody: "European Commission / AI Office",
    relatedRecords: [
      { kind: "institution", id: "eu-ai-office", label: "European AI Office" },
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
    ],
    domains: ["frontier-gpai", "synthetic-media", "public-sector"],
    submissionUrl:
      "https://digital-strategy.ec.europa.eu/en/consultations/consultation-draft-guidelines-transparency-obligations-under-ai-act",
    summary:
      "Targeted feedback process on draft guidelines for AI Act Article 50 transparency duties for interactive AI, generative AI, deepfakes, and related systems.",
    caveat:
      "Closed draft-guidance process; it should not be read as a final legal interpretation or a separate legal instrument.",
    sourceName: "European Commission - Article 50 transparency-obligations consultation",
    sourceUrl:
      "https://digital-strategy.ec.europa.eu/en/consultations/consultation-draft-guidelines-transparency-obligations-under-ai-act",
    verificationNotes:
      "Official Commission consultation page states opening 8 May 2026, closing 3 June 2026, and describes Article 50 transparency guideline scope.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "ie-ai-bill-pre-legislative-scrutiny-2026",
    title: "Ireland Regulation of Artificial Intelligence Bill pre-legislative scrutiny consultation",
    processType: "parliamentary_stage",
    jurisdiction: "Ireland",
    countryIso3: "IRL",
    stage: "Pre-legislative scrutiny public consultation",
    status: "closed",
    deadline: "2026-04-13",
    conveningBody: "Houses of the Oireachtas committee process",
    relatedRecords: [{ kind: "institution", id: "ie-dete-ai-act-competent-authority", label: "Ireland AI Act contact" }],
    domains: ["frontier-gpai", "public-sector"],
    submissionUrl:
      "https://www.oireachtas.ie/en/committees/making-a-submission/public-consultations/20260306-public-consultation-on-the-pre-legislative-scrutiny-of-the-general-scheme-of-the-regulation-of-the-artificial-intelligence-bill-2026/",
    summary:
      "Irish parliamentary pre-legislative scrutiny consultation on the General Scheme of the Regulation of the Artificial Intelligence Bill 2026.",
    caveat:
      "Parliamentary process row; it should not be treated as enacted law or a final implementation model.",
    sourceName: "Houses of the Oireachtas - AI Bill 2026 public consultation",
    sourceUrl:
      "https://www.oireachtas.ie/en/committees/making-a-submission/public-consultations/20260306-public-consultation-on-the-pre-legislative-scrutiny-of-the-general-scheme-of-the-regulation-of-the-artificial-intelligence-bill-2026/",
    verificationNotes:
      "Official Oireachtas consultation URL from the submitted research report; direct automated retrieval may be unreliable, so the row is kept medium-confidence pending periodic manual check.",
    ...LIKELY_OFFICIAL_2026_06_11,
  },
  {
    id: "uk-jchr-ai-human-rights-inquiry-2026",
    title: "UK Joint Committee on Human Rights inquiry on AI regulation",
    processType: "call_for_evidence",
    jurisdiction: "United Kingdom",
    countryIso3: "GBR",
    stage: "Parliamentary inquiry evidence gathering",
    status: "closed",
    deadline: "2025-09-05",
    conveningBody: "UK Parliament Joint Committee on Human Rights",
    relatedRecords: [{ kind: "institution", id: "uk-ai-security-institute", label: "UK AI Security Institute" }],
    domains: ["frontier-gpai", "public-sector", "biometric-identification", "enforcement-litigation"],
    submissionUrl:
      "https://committees.parliament.uk/committee/93/human-rights-joint-committee/news/208676/new-inquiry-human-rights-and-the-regulation-of-artificial-intelligence/",
    summary:
      "UK parliamentary inquiry examining how human rights can be protected in the age of AI and whether existing regulation is sufficient.",
    caveat:
      "Parliamentary inquiry process; it is evidence-gathering and policy scrutiny, not a binding legal instrument.",
    sourceName: "UK Parliament - Joint Committee on Human Rights AI inquiry",
    sourceUrl:
      "https://committees.parliament.uk/committee/93/human-rights-joint-committee/news/208676/new-inquiry-human-rights-and-the-regulation-of-artificial-intelligence/",
    verificationNotes:
      "Official UK Parliament page states the inquiry launch, terms of reference, and 5 September 2025 submission deadline.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "eu-parliament-ai-democracy-hearing-2026",
    title: "European Parliament hearing on democracy and elections in the AI era",
    processType: "hearing",
    jurisdiction: "European Union",
    countryIso3: "EUU",
    stage: "Committee hearing held",
    status: "closed",
    deadline: "2026-03-18",
    conveningBody: "European Parliament AFCO, LIBE, and EUDS committees",
    relatedRecords: [{ kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" }],
    domains: ["synthetic-media", "public-sector", "enforcement-litigation"],
    summary:
      "European Parliament joint hearing on how AI affects elections, disinformation, deepfakes, and democratic integrity.",
    caveat:
      "Parliamentary hearing context; it does not by itself create legal obligations.",
    sourceName: "European Parliament - Democracy and elections in the AI era hearing",
    sourceUrl:
      "https://www.europarl.europa.eu/committees/en/joint-public-hearing-on-democracy-and-el/product-details/20260309CHE13842",
    verificationNotes:
      "Official European Parliament hearing page lists the 18 March 2026 joint hearing and its AI-democracy scope.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "coe-ai-convention-open-signature-process",
    title: "Council of Europe AI Framework Convention signature and ratification process",
    processType: "treaty_negotiation",
    jurisdiction: "Council of Europe / international",
    stage: "Open signature and ratification process",
    status: "ongoing",
    conveningBody: "Council of Europe",
    relatedRecords: [
      { kind: "institution", id: "coe-treaty-office", label: "Council of Europe Treaty Office" },
      { kind: "international_instrument", id: "coe-ai-convention", label: "CoE AI Convention" },
    ],
    domains: ["frontier-gpai", "public-sector"],
    summary:
      "Ongoing signature and ratification process for the Council of Europe Framework Convention on AI.",
    caveat:
      "Treaty status depends on signature, ratification, entry into force, and domestic implementation; signature is not the same as ratification.",
    sourceName: "Council of Europe - Framework Convention on Artificial Intelligence",
    sourceUrl: "https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence",
    verificationNotes:
      "Official Council of Europe page states the Convention opened for signature on 5 September 2024 and lists parties/signatories; Treaty Office status still requires periodic manual checks.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "eu-ai-office-gpai-tools-process",
    title: "EU AI Office GPAI implementation tools and code-of-practice process",
    processType: "guidance_update",
    jurisdiction: "European Union",
    countryIso3: "EUU",
    stage: "Implementation tools and guidance preparation",
    status: "ongoing",
    conveningBody: "European AI Office",
    relatedRecords: [
      { kind: "institution", id: "eu-ai-office", label: "European AI Office" },
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
      { kind: "implementation", id: "eu-gpai-code-practice-published", label: "GPAI Code of Practice milestone" },
    ],
    domains: ["frontier-gpai"],
    summary:
      "Ongoing EU AI Office process for AI Act GPAI implementation tools, codes of practice, guidance, and compliance-monitoring support.",
    caveat: "Process row; it should not be read as a separate obligation beyond the underlying AI Act and adopted implementing materials.",
    sourceName: "European Commission - European AI Office",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/ai-office",
    verificationNotes:
      "Official AI Office page describes drawing up codes of practice and preparing guidance, implementing/delegated acts, and tools.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "cen-cenelec-jtc21-ai-act-standardization-process",
    title: "CEN-CENELEC JTC 21 AI Act standardization work programme",
    processType: "standards_consultation",
    jurisdiction: "European standardization",
    countryIso3: "EUU",
    stage: "Standards under development",
    status: "ongoing",
    conveningBody: "CEN-CENELEC JTC 21",
    relatedRecords: [
      { kind: "institution", id: "cen-cenelec-jtc21", label: "CEN-CENELEC JTC 21" },
      { kind: "standards_conformity", id: "cen-cenelec-ai-act-harmonized-standards", label: "AI Act harmonized standards work" },
    ],
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    summary:
      "European AI standards work programme supporting AI Act conformity, including risk management, quality management, conformity assessment, datasets, robustness, and cybersecurity.",
    caveat: STANDARDS_CAVEAT,
    sourceName: "CEN-CENELEC - Artificial Intelligence",
    sourceUrl: "https://www.cencenelec.eu/areas-of-work/cen-cenelec-topics/artificial-intelligence/",
    verificationNotes:
      "Official page links JTC 21 work to harmonized standards supporting the EU AI Act.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "uk-aisi-frontier-trends-monitoring",
    title: "UK AISI frontier AI trends and testing monitoring",
    processType: "monitoring_process",
    jurisdiction: "United Kingdom",
    countryIso3: "GBR",
    stage: "Public frontier-model testing evidence and monitoring",
    status: "ongoing",
    conveningBody: "UK AI Security Institute",
    relatedRecords: [{ kind: "institution", id: "uk-ai-security-institute", label: "UK AISI" }],
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    summary:
      "AISI process for public evidence on frontier-model trends, capabilities, and testing.",
    caveat: "Monitoring and research process; not a certification or legal compliance determination.",
    sourceName: "UK AI Security Institute",
    sourceUrl: "https://www.aisi.gov.uk/",
    verificationNotes:
      "Official AISI site describes frontier model testing, the Frontier AI Trends Report, and advanced-AI risk research.",
    ...VERIFIED_OFFICIAL,
  },
];

export const STANDARDS_CONFORMITY_RECORDS: StandardsConformityRecord[] = [
  {
    id: "cen-cenelec-ai-act-harmonized-standards",
    title: "CEN-CENELEC AI Act harmonized-standardization work",
    standardsBody: "CEN-CENELEC JTC 21",
    jurisdiction: "European Union / European standardization",
    countryIso3: "EUU",
    status: "under_development",
    legalRole: "harmonized_standard_candidate",
    relatedRecords: [
      { kind: "institution", id: "cen-cenelec-jtc21", label: "CEN-CENELEC JTC 21" },
      { kind: "international_instrument", id: "cen-cenelec-ai-act-standards", label: "CEN-CENELEC AI Act standardization work" },
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
    ],
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    summary:
      "AI Act-supporting harmonized standards work covering risk management, transparency, human oversight, cybersecurity, quality assurance, and conformity assessment.",
    caveat: STANDARDS_CAVEAT,
    sourceName: "CEN-CENELEC - Artificial Intelligence",
    sourceUrl: "https://www.cencenelec.eu/areas-of-work/cen-cenelec-topics/artificial-intelligence/",
    verificationNotes:
      "Official page states that standards, once published in the OJEU, can provide legal presumption of conformity.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "iso-iec-42001-ai-management-system",
    title: "ISO/IEC 42001:2023 AI management system standard",
    standardsBody: "ISO/IEC JTC 1/SC 42",
    jurisdiction: "International",
    status: "published",
    legalRole: "voluntary_standard",
    relatedRecords: [{ kind: "international_instrument", id: "iso-iec-42001-2023", label: "ISO/IEC 42001:2023" }],
    domains: ["frontier-gpai", "public-sector"],
    summary:
      "International AI management-system standard for establishing, implementing, maintaining, and improving AI governance processes.",
    caveat: STANDARDS_CAVEAT,
    sourceName: "ISO - ISO/IEC 42001:2023",
    sourceUrl: "https://www.iso.org/standard/42001",
    verificationNotes:
      "Official ISO page identifies ISO/IEC 42001:2023 as a published international AI management-system standard.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "nist-ai-rmf-conformity-context",
    title: "NIST AI RMF standards and risk-management context",
    standardsBody: "NIST",
    jurisdiction: "United States / international influence",
    countryIso3: "USA",
    status: "guidance",
    legalRole: "guidance",
    relatedRecords: [{ kind: "national_rule", id: "us-nist-ai-rmf", label: "NIST AI RMF" }],
    domains: ["frontier-gpai", "public-sector", "cybersecurity-critical-infrastructure"],
    summary:
      "Voluntary AI risk-management framework used as technical governance context and referenced across public/private AI governance.",
    caveat: "NIST AI RMF is voluntary guidance unless a separate legal or contractual instrument makes it operative.",
    sourceName: "NIST - AI Risk Management Framework",
    sourceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
    verificationNotes:
      "Official NIST source used for voluntary technical-governance context.",
    ...LIKELY_OFFICIAL,
  },
  {
    id: "nist-genai-profile-conformity-context",
    title: "NIST AI RMF Generative AI Profile context",
    standardsBody: "NIST",
    jurisdiction: "United States / international influence",
    countryIso3: "USA",
    status: "guidance",
    legalRole: "guidance",
    relatedRecords: [{ kind: "international_instrument", id: "nist-genai-profile", label: "NIST GenAI Profile" }],
    domains: ["frontier-gpai", "synthetic-media", "cybersecurity-critical-infrastructure"],
    summary:
      "Generative-AI profile for applying the NIST AI RMF to generative AI risks and controls.",
    caveat: "Voluntary U.S. technical guidance; not an international agreement or binding law.",
    sourceName: "NIST - AI RMF Generative AI Profile",
    sourceUrl:
      "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
    verificationNotes:
      "Official NIST publication page used for source-backed generative-AI governance context.",
    ...LIKELY_OFFICIAL,
  },
  {
    id: "eu-ai-act-standardisation-request",
    title: "European Commission AI Act standardisation request",
    standardsBody: "European Commission / CEN-CENELEC",
    jurisdiction: "European Union / European standardization",
    countryIso3: "EUU",
    status: "work_programme",
    legalRole: "harmonized_standard_candidate",
    relatedRecords: [
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
      { kind: "institution", id: "cen-cenelec-jtc21", label: "CEN-CENELEC JTC 21" },
      { kind: "standards_conformity", id: "cen-cenelec-ai-act-harmonized-standards", label: "AI Act harmonized standards work" },
    ],
    domains: ["frontier-gpai", "standards-conformity", "cybersecurity-critical-infrastructure"],
    summary:
      "Commission request and work programme for CEN-CENELEC AI Act-supporting harmonized standards across risk, data, transparency, oversight, robustness, cybersecurity, quality, and conformity assessment.",
    caveat: STANDARDS_CAVEAT,
    sourceName: "European Commission - Standardisation of the AI Act",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/ai-act-standardisation",
    verificationNotes:
      "Official Commission page states that the Commission requested CEN and CENELEC to develop standards in ten key AI Act areas.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "eu-pren-18286-public-enquiry",
    title: "prEN 18286 AI quality management system public enquiry",
    standardsBody: "CEN-CENELEC JTC 21",
    jurisdiction: "European Union / European standardization",
    countryIso3: "EUU",
    status: "under_development",
    legalRole: "harmonized_standard_candidate",
    relatedRecords: [
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
      { kind: "standards_conformity", id: "eu-ai-act-standardisation-request", label: "AI Act standardisation request" },
    ],
    domains: ["frontier-gpai", "standards-conformity"],
    summary:
      "First AI Act harmonized-standard candidate to enter public enquiry, focused on quality management systems for EU AI Act regulatory purposes.",
    caveat: STANDARDS_CAVEAT,
    sourceName: "European Commission - Standardisation of the AI Act",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/ai-act-standardisation",
    verificationNotes:
      "Official Commission page states that prEN 18286 entered public enquiry on 30 October 2025 and is designed to help high-risk AI providers comply with AI Act Article 17.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "eu-ai-act-notified-bodies-infrastructure",
    title: "EU AI Act notified-body list infrastructure",
    standardsBody: "European Commission",
    jurisdiction: "European Union",
    countryIso3: "EUU",
    status: "conformity_context",
    legalRole: "context",
    relatedRecords: [{ kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" }],
    domains: ["standards-conformity", "public-sector"],
    summary:
      "AI Act mechanism requiring the Commission to assign identification numbers and maintain a public list of notified bodies under the Regulation.",
    caveat:
      "This row tracks the legal/institutional mechanism, not a populated final list of AI Act notified bodies.",
    sourceName: "AI Act Service Desk - Article 35",
    sourceUrl: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-35",
    verificationNotes:
      "Official AI Act Service Desk text for Article 35 states that the Commission shall assign identification numbers and make the list of notified bodies publicly available and up to date.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "nist-ai-rmf-playbook",
    title: "NIST AI RMF Playbook",
    standardsBody: "NIST",
    jurisdiction: "United States / international influence",
    countryIso3: "USA",
    status: "guidance",
    legalRole: "guidance",
    relatedRecords: [
      { kind: "standards_conformity", id: "nist-ai-rmf-conformity-context", label: "NIST AI RMF standards context" },
      { kind: "national_rule", id: "us-nist-ai-rmf", label: "NIST AI RMF" },
    ],
    domains: ["frontier-gpai", "standards-conformity", "cybersecurity-critical-infrastructure"],
    summary:
      "Voluntary NIST AI RMF companion playbook with suggested actions for Govern, Map, Measure, and Manage functions.",
    caveat:
      "Voluntary technical guidance; it becomes operative only through separate law, policy, contract, or organizational adoption.",
    sourceName: "NIST - AI RMF Playbook",
    sourceUrl: "https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook",
    verificationNotes:
      "Official NIST page describes the Playbook as a voluntary companion to AI RMF 1.0 with suggested actions and references.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "iso-iec-23894-risk-management",
    title: "ISO/IEC 23894:2023 AI risk management guidance",
    standardsBody: "ISO/IEC JTC 1/SC 42",
    jurisdiction: "International",
    status: "published",
    legalRole: "voluntary_standard",
    relatedRecords: [{ kind: "standards_conformity", id: "iso-iec-42001-ai-management-system", label: "ISO/IEC 42001" }],
    domains: ["frontier-gpai", "standards-conformity", "cybersecurity-critical-infrastructure"],
    summary:
      "Published ISO/IEC guidance standard on managing risk related to AI products, systems, and services.",
    caveat:
      "Issuer-controlled standards-body source; this is voluntary standards context unless incorporated by law or contract.",
    sourceName: "ISO - ISO/IEC 23894:2023",
    sourceUrl: "https://www.iso.org/standard/77304.html",
    verificationNotes:
      "Official ISO page identifies ISO/IEC 23894:2023 as a published international standard and describes AI risk-management guidance.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "iso-iec-42005-impact-assessment",
    title: "ISO/IEC 42005:2025 AI system impact assessment guidance",
    standardsBody: "ISO/IEC JTC 1/SC 42",
    jurisdiction: "International",
    status: "published",
    legalRole: "voluntary_standard",
    relatedRecords: [{ kind: "standards_conformity", id: "iso-iec-42001-ai-management-system", label: "ISO/IEC 42001" }],
    domains: ["frontier-gpai", "standards-conformity", "public-sector"],
    summary:
      "Published ISO/IEC standard providing guidance for organizations conducting AI system impact assessments.",
    caveat:
      "Issuer-controlled standards-body source; this is voluntary standards context unless incorporated by law or contract.",
    sourceName: "ISO - ISO/IEC 42005:2025",
    sourceUrl: "https://www.iso.org/standard/42005",
    verificationNotes:
      "Official ISO page identifies ISO/IEC 42005:2025 as a published international standard and describes AI system impact-assessment guidance.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
];

export const PUBLIC_SECTOR_AI_RECORDS: PublicSectorAIRecord[] = [
  {
    id: "us-federal-ai-use-case-inventory",
    title: "U.S. federal AI use case inventories",
    recordType: "ai_use_case_inventory",
    jurisdiction: "United States",
    countryIso3: "USA",
    legalEffect: "transparency_registry",
    coveredPublicBodies: "U.S. federal agencies publishing AI use-case inventory materials.",
    relatedRecords: [{ kind: "institution", id: "us-nist-caisi", label: "NIST CAISI" }],
    domains: ["public-sector"],
    summary:
      "OMB-backed federal government AI use-case inventory reporting requirement and public inventory context.",
    caveat: "Public-sector transparency context; not a private-sector frontier-lab obligation.",
    sourceName: "OMB Memorandum M-25-21",
    sourceUrl:
      "https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-21-Accelerating-Federal-Use-of-AI-through-Innovation-Governance-and-Public-Trust.pdf",
    verificationNotes:
      "Prior AI.gov inventory page now returns 404; retained as federal inventory context using live official OMB M-25-21 source for annual AI inventory reporting.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "canada-algorithmic-impact-assessment",
    title: "Canada Algorithmic Impact Assessment tool",
    recordType: "algorithmic_impact_assessment",
    jurisdiction: "Canada",
    countryIso3: "CAN",
    legalEffect: "binding_public_sector_policy",
    coveredPublicBodies:
      "Canadian federal departments using automated decision systems under the Directive on Automated Decision-Making.",
    relatedRecords: [{ kind: "institution", id: "canada-treasury-board-secretariat", label: "Treasury Board of Canada Secretariat" }],
    domains: ["public-sector"],
    summary:
      "Mandatory public-sector risk assessment tool for automated decision systems under Canadian federal digital-government policy.",
    caveat: "Applies to covered public-sector automated decision systems; not a general private-sector AI regulation.",
    sourceName: "Canada.ca - Algorithmic Impact Assessment tool",
    sourceUrl:
      "https://www.canada.ca/en/government/system/digital-government/digital-government-innovations/responsible-use-ai/algorithmic-impact-assessment.html",
    verificationNotes:
      "Official Canada.ca page calls the AIA a mandatory risk assessment tool supporting the Directive on Automated Decision-Making.",
    ...VERIFIED_OFFICIAL,
  },
  {
    id: "eu-ai-act-article-71-high-risk-database",
    title: "EU AI Act Article 71 high-risk AI systems database",
    recordType: "public_ai_registry",
    jurisdiction: "European Union",
    countryIso3: "EUU",
    legalEffect: "transparency_registry",
    coveredPublicBodies:
      "European Commission database infrastructure for registered high-risk AI systems and related public-authority deployer entries under the AI Act.",
    relatedRecords: [{ kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" }],
    domains: ["public-sector", "standards-conformity"],
    summary:
      "AI Act database mechanism for high-risk AI systems listed in Annex III and related registration requirements.",
    caveat:
      "Tracks the legal database mechanism; it is not evidence that every required record is already publicly populated.",
    sourceName: "AI Act Service Desk - Article 71",
    sourceUrl: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-71",
    verificationNotes:
      "Official AI Act Service Desk text for Article 71 states that the Commission shall set up and maintain an EU database and that most registered information is publicly accessible.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "nl-algorithm-register",
    title: "Netherlands government Algorithm Register",
    recordType: "public_ai_registry",
    jurisdiction: "Netherlands",
    countryIso3: "NLD",
    legalEffect: "transparency_registry",
    coveredPublicBodies:
      "Dutch government organizations publishing information about algorithms used in their work.",
    relatedRecords: [],
    domains: ["public-sector"],
    summary:
      "Dutch public algorithm register focused on impactful algorithms, including high-risk AI systems.",
    caveat:
      "Public-sector transparency register; it should not be read as a full inventory of all AI systems or private-sector AI use.",
    sourceName: "Netherlands government Algorithm Register",
    sourceUrl: "https://algoritmes.overheid.nl/en",
    verificationNotes:
      "Official register page states that Dutch government organizations publish algorithm information and that the register focuses on impactful algorithms, including high-risk AI systems.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "uk-algorithmic-transparency-recording-standard",
    title: "UK Algorithmic Transparency Recording Standard hub",
    recordType: "public_ai_registry",
    jurisdiction: "United Kingdom",
    countryIso3: "GBR",
    legalEffect: "binding_public_sector_policy",
    coveredPublicBodies:
      "UK government departments and in-scope arm's-length bodies delivering public/frontline services or directly interacting with the public.",
    relatedRecords: [],
    domains: ["public-sector"],
    summary:
      "UK public-sector standard and repository for publishing information about algorithmic tools and algorithm-assisted decisions.",
    caveat:
      "Public-sector transparency obligation/context; it is not a private-sector frontier-lab law.",
    sourceName: "GOV.UK - Algorithmic Transparency Recording Standard Hub",
    sourceUrl: "https://www.gov.uk/government/collections/algorithmic-transparency-recording-standard-hub",
    verificationNotes:
      "Official GOV.UK page states that ATRS is mandatory for government departments and in-scope arm's-length bodies and includes a repository of published records.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "us-omb-m25-21-public-ai-inventories",
    title: "U.S. OMB M-25-21 federal AI use-case inventory requirements",
    recordType: "ai_use_case_inventory",
    jurisdiction: "United States",
    countryIso3: "USA",
    legalEffect: "binding_public_sector_policy",
    coveredPublicBodies:
      "U.S. federal executive departments and agencies covered by OMB federal AI governance memoranda.",
    relatedRecords: [{ kind: "public_sector_ai", id: "us-federal-ai-use-case-inventory", label: "U.S. federal AI inventories" }],
    domains: ["public-sector"],
    summary:
      "Federal AI governance memorandum requiring agencies to continue annual AI use-case inventory reporting and publication of publicly releasable uses.",
    caveat:
      "Federal public-sector policy; it does not impose private-sector AI duties.",
    sourceName: "OMB Memorandum M-25-21",
    sourceUrl:
      "https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-21-Accelerating-Federal-Use-of-AI-through-Innovation-Governance-and-Public-Trust.pdf",
    verificationNotes:
      "Official OMB memorandum describes agency AI governance, Chief AI Officer expectations, and continued annual AI use-case inventory reporting.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "us-doj-2025-ai-use-case-inventory",
    title: "U.S. Department of Justice 2025 AI use-case inventory",
    recordType: "ai_use_case_inventory",
    jurisdiction: "United States",
    countryIso3: "USA",
    legalEffect: "transparency_registry",
    coveredPublicBodies:
      "U.S. Department of Justice components contributing to the consolidated 2025 DOJ AI Use Case Inventory.",
    relatedRecords: [
      { kind: "public_sector_ai", id: "us-omb-m25-21-public-ai-inventories", label: "OMB M-25-21 inventories" },
      { kind: "public_sector_ai", id: "us-federal-ai-use-case-inventory", label: "U.S. federal AI inventories" },
    ],
    domains: ["public-sector", "enforcement-litigation"],
    summary:
      "Agency-specific 2025 AI use-case inventory with DOJ AI uses across development, pilot, deployed, and retired stages.",
    caveat:
      "Agency inventory context; release limitations mean it should not be read as a complete operational audit of all DOJ AI use.",
    sourceName: "U.S. Department of Justice - AI Inventory",
    sourceUrl: "https://www.justice.gov/ai/ai-inventory",
    verificationNotes:
      "Official DOJ page says M-25-21 and EO 13960 require annual AI inventories and describes the 2025 DOJ inventory as including 315 entries.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
  {
    id: "us-omb-m25-22-ai-acquisition",
    title: "U.S. OMB M-25-22 AI acquisition guidance",
    recordType: "procurement_guidance",
    jurisdiction: "United States",
    countryIso3: "USA",
    legalEffect: "procurement_context",
    coveredPublicBodies:
      "U.S. federal executive departments and agencies acquiring AI capabilities.",
    relatedRecords: [
      { kind: "public_sector_ai", id: "us-omb-m25-21-public-ai-inventories", label: "OMB M-25-21" },
      { kind: "institution", id: "us-nist-caisi", label: "NIST CAISI" },
    ],
    domains: ["public-sector", "public-procurement"],
    summary:
      "Federal procurement guidance for improving agency acquisition of AI capabilities in government.",
    caveat:
      "Public-sector acquisition guidance; it is procurement context and should not be treated as a general private-sector AI law.",
    sourceName: "OMB Memorandum M-25-22",
    sourceUrl:
      "https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-22-Driving-Efficient-Acquisition-of-Artificial-Intelligence-in-Government.pdf",
    verificationNotes:
      "Official OMB memorandum M-25-22 provides guidance to agencies on acquiring AI responsibly and improving government AI acquisition.",
    ...VERIFIED_OFFICIAL_2026_06_11,
  },
];

export const RESEARCH_CORPUS_CHANGELOG = [
  {
    id: "2026-06-10-research-corpus-v1",
    recordId: "research-corpus-v1",
    recordKind: "dataset",
    changeType: "added",
    date: "2026-06-10",
    summary:
      "Added research-corpus starter records for institutions, policy processes, standards/conformity, public-sector AI, and corpus exports.",
    reviewer: CORPUS_REVIEWER,
  },
  {
    id: "2026-06-11-official-corpus-data-expansion-sprint-1",
    recordId: "official-corpus-data-expansion-sprint-1",
    recordKind: "dataset",
    changeType: "added",
    date: "2026-06-11",
    summary:
      "Added official-source institution, policy-process, standards/conformity, and public-sector AI records from the first corpus data expansion sprint; skipped unsupported or duplicate report items.",
    reviewer: {
      ...CORPUS_REVIEWER,
      reviewDate: "2026-06-11",
      reviewScope:
        "Official Corpus Data Expansion Sprint DOCX triage, direct official-source checks, duplicate removal, and conservative corpus import.",
    },
  },
  ...INSTITUTION_RECORDS.map((record) => ({
    id: `${record.lastVerified ?? "2026-06-10"}-institution-${record.id}`,
    recordId: record.id,
    recordKind: "institution" as const,
    changeType: "added" as const,
    date: record.lastVerified ?? "2026-06-10",
    summary: `Added institution corpus record for ${record.name}.`,
    reviewer: CORPUS_REVIEWER,
  })),
  ...POLICY_PROCESS_RECORDS.map((record) => ({
    id: `${record.lastVerified ?? "2026-06-10"}-policy-process-${record.id}`,
    recordId: record.id,
    recordKind: "policy_process" as const,
    changeType: "added" as const,
    date: record.lastVerified ?? "2026-06-10",
    summary: `Added policy-process corpus record for ${record.title}.`,
    reviewer: CORPUS_REVIEWER,
  })),
  ...STANDARDS_CONFORMITY_RECORDS.map((record) => ({
    id: `${record.lastVerified ?? "2026-06-10"}-standard-${record.id}`,
    recordId: record.id,
    recordKind: "standards_conformity" as const,
    changeType: "added" as const,
    date: record.lastVerified ?? "2026-06-10",
    summary: `Added standards/conformity corpus record for ${record.title}.`,
    reviewer: CORPUS_REVIEWER,
  })),
  ...PUBLIC_SECTOR_AI_RECORDS.map((record) => ({
    id: `${record.lastVerified ?? "2026-06-10"}-public-sector-ai-${record.id}`,
    recordId: record.id,
    recordKind: "public_sector_ai" as const,
    changeType: "added" as const,
    date: record.lastVerified ?? "2026-06-10",
    summary: `Added public-sector AI corpus record for ${record.title}.`,
    reviewer: CORPUS_REVIEWER,
  })),
] satisfies RecordChangeLogEntry[];

export const INSTITUTION_BY_ID = Object.fromEntries(
  INSTITUTION_RECORDS.map((record) => [record.id, record])
) as Record<string, InstitutionRecord>;

export const POLICY_PROCESS_BY_ID = Object.fromEntries(
  POLICY_PROCESS_RECORDS.map((record) => [record.id, record])
) as Record<string, PolicyProcessRecord>;

export const STANDARDS_CONFORMITY_BY_ID = Object.fromEntries(
  STANDARDS_CONFORMITY_RECORDS.map((record) => [record.id, record])
) as Record<string, StandardsConformityRecord>;

export const PUBLIC_SECTOR_AI_BY_ID = Object.fromEntries(
  PUBLIC_SECTOR_AI_RECORDS.map((record) => [record.id, record])
) as Record<string, PublicSectorAIRecord>;
