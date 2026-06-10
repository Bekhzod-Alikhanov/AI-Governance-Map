import type {
  InstitutionRecord,
  PolicyProcessRecord,
  PublicSectorAIRecord,
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

const STANDARDS_CAVEAT =
  "Standards and conformity-assessment rows are not national law unless a verified legal instrument incorporates them.";

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
    deadline: "2026-06-23",
    conveningBody: "European Commission / AI Office",
    relatedRecords: [
      { kind: "institution", id: "eu-ai-office", label: "European AI Office" },
      { kind: "international_instrument", id: "eu-ai-act", label: "EU AI Act" },
      { kind: "implementation", id: "eu-ai-act-phased-application", label: "AI Act phased application" },
    ],
    domains: ["frontier-gpai", "public-sector", "employment-hiring", "healthcare", "finance"],
    submissionUrl:
      "https://digital-strategy.ec.europa.eu/en/news/commission-seeks-feedback-draft-guidelines-classification-high-risk-artificial-intelligence-systems",
    summary:
      "Open feedback process on draft guidelines for classifying high-risk AI systems under the AI Act.",
    caveat: "Draft guidance process; not a final legal interpretation and not itself a new binding rule.",
    sourceName: "European Commission - high-risk AI classification feedback",
    sourceUrl:
      "https://digital-strategy.ec.europa.eu/en/news/commission-seeks-feedback-draft-guidelines-classification-high-risk-artificial-intelligence-systems",
    verificationNotes:
      "Official Commission release says stakeholders are invited to share views by 23 June 2026.",
    ...VERIFIED_OFFICIAL,
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
      "AI.gov inventory page for U.S. federal government AI use cases and agency inventory links.",
    caveat: "Public-sector transparency context; not a private-sector frontier-lab obligation.",
    sourceName: "AI.gov - Federal AI Use Case Inventories",
    sourceUrl: "https://www.ai.gov/ai-use-cases/",
    verificationNotes:
      "Official AI.gov page lists federal AI use-case inventory materials and agency links.",
    ...VERIFIED_OFFICIAL,
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
  },
] as const;

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
