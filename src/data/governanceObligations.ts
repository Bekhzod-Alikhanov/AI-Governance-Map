import type {
  GovernanceObligation,
  ObligationCategory,
  ObligationLegalEffect,
} from "../types";

const VERIFIED = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-30",
} as const;

const LIKELY = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-30",
} as const;

export const OBLIGATION_CATEGORY_LABELS: Record<ObligationCategory, string> = {
  risk_assessment: "Risk assessment",
  transparency_disclosure: "Transparency / disclosure",
  human_oversight: "Human oversight",
  incident_reporting: "Incident reporting",
  model_evaluation_red_teaming: "Model evaluation / red-teaming",
  registration_filing: "Registration / filing",
  conformity_assessment: "Conformity assessment",
  watermarking_content_labeling: "Watermarking / content labeling",
  audit_bias_audit: "Audit / bias audit",
  cybersecurity: "Cybersecurity",
  data_governance: "Data governance",
  prohibited_practices: "Prohibited practices",
  compute_infrastructure_reporting: "Compute / infrastructure reporting",
  safety_framework_publication: "Safety framework publication",
};

export const OBLIGATION_EFFECT_LABELS: Record<ObligationLegalEffect, string> = {
  binding: "Binding",
  proposed: "Proposed",
  voluntary: "Voluntary",
  standard: "Standard",
  guidance: "Guidance",
  conditional: "Conditional",
  indirect: "Indirect",
};

export const GOVERNANCE_OBLIGATIONS: GovernanceObligation[] = [
  {
    id: "eu-ai-act-risk-assessment",
    parentType: "international_instrument",
    parentId: "eu-ai-act",
    category: "risk_assessment",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "European Union",
    domains: ["frontier-gpai", "public-sector", "biometric-identification", "cybersecurity-critical-infrastructure"],
    summary:
      "The EU AI Act creates risk-based duties, including high-risk AI risk management and GPAI risk-management obligations under phased application.",
    caveat:
      "EU applicability is not the same as separate national enactment; member-state implementation and enforcement arrangements vary.",
    sourceName: "EUR-Lex - Regulation (EU) 2024/1689",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ...VERIFIED,
    verificationNotes:
      "EUR-Lex confirms Regulation (EU) 2024/1689 and phased risk-based obligations. This obligation row is a workbench index into the official regulation, not a substitute for the legal text.",
  },
  {
    id: "eu-ai-act-transparency-disclosure",
    parentType: "international_instrument",
    parentId: "eu-ai-act",
    category: "transparency_disclosure",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "European Union",
    domains: ["frontier-gpai", "synthetic-media", "public-sector"],
    summary:
      "The EU AI Act includes transparency duties for specified AI systems and additional information duties for general-purpose AI model providers.",
    caveat: "Specific transparency duties depend on role, system type, and phased application date.",
    sourceName: "EUR-Lex - Regulation (EU) 2024/1689",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ...VERIFIED,
  },
  {
    id: "eu-ai-act-conformity-assessment",
    parentType: "international_instrument",
    parentId: "eu-ai-act",
    category: "conformity_assessment",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "European Union",
    domains: ["frontier-gpai", "biometric-identification", "healthcare", "education-children", "employment-hiring"],
    summary:
      "High-risk AI systems must satisfy conformity and quality-management requirements before placement on the EU market.",
    caveat: "Actual route depends on product sector, harmonized standards, notified bodies, and delegated implementation.",
    sourceName: "EUR-Lex - Regulation (EU) 2024/1689",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ...VERIFIED,
  },
  {
    id: "eu-ai-act-prohibited-practices",
    parentType: "international_instrument",
    parentId: "eu-ai-act",
    category: "prohibited_practices",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "European Union",
    domains: ["biometric-identification", "public-sector", "employment-hiring"],
    summary:
      "The EU AI Act prohibits specified AI practices, including certain manipulative, social-scoring, and biometric uses.",
    caveat: "Read the official legal text for exceptions, law-enforcement carve-outs, and phased applicability.",
    sourceName: "EUR-Lex - Regulation (EU) 2024/1689",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ...VERIFIED,
  },
  {
    id: "coe-ai-convention-risk-impact",
    parentType: "international_instrument",
    parentId: "coe-ai-convention",
    category: "risk_assessment",
    legalEffect: "binding",
    directness: "conditional",
    jurisdiction: "Council of Europe parties",
    domains: ["frontier-gpai", "public-sector"],
    summary:
      "The CoE AI Convention requires parties to maintain measures addressing AI lifecycle risks and impacts on human rights, democracy, and rule of law.",
    caveat: "As of the snapshot, the Convention was not yet in force; treaty duties apply only for parties once entry-into-force conditions are met.",
    sourceName: "Council of Europe - Framework Convention on Artificial Intelligence",
    sourceUrl: "https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence",
    ...VERIFIED,
  },
  {
    id: "kr-ai-basic-act-risk-management",
    parentType: "national_rule",
    parentId: "kr-ai-basic-act",
    category: "risk_assessment",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "South Korea",
    domains: ["frontier-gpai", "public-sector", "cybersecurity-critical-infrastructure"],
    summary:
      "Korea's AI Basic Act creates a national framework for high-impact AI and governance duties before its 2026 application date.",
    caveat: "Detailed obligations depend on subordinate rules and implementation guidance.",
    sourceName: "MSIT - AI Basic Act",
    sourceUrl: "https://www.msit.go.kr/eng/bbs/view.do?bbsSeqNo=42&mId=4&mPid=2&nttSeqNo=1214&sCode=eng",
    ...VERIFIED,
  },
  {
    id: "cn-genai-registration-filing",
    parentType: "national_rule",
    parentId: "cn-genai-interim-measures",
    category: "registration_filing",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "China",
    domains: ["frontier-gpai", "synthetic-media", "public-sector"],
    summary:
      "China's generative-AI measures require providers of public-facing generative AI services to satisfy filing, security, and content-governance expectations.",
    caveat: "This row summarizes the governance hook already tracked in the dataset; consult CAC sources for provider-specific filing details.",
    sourceName: "CAC - Interim Measures for Generative AI Services",
    sourceUrl: "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm",
    ...VERIFIED,
  },
  {
    id: "cn-genai-watermarking-content",
    parentType: "national_rule",
    parentId: "cn-genai-interim-measures",
    category: "watermarking_content_labeling",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "China",
    domains: ["synthetic-media", "frontier-gpai"],
    summary:
      "China's AI rule stack includes generated-content governance and labelling expectations for public generative-AI services.",
    caveat: "Specific labelling obligations also interact with later synthetic-content measures not expanded in this row.",
    sourceName: "CAC - Interim Measures for Generative AI Services",
    sourceUrl: "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm",
    ...LIKELY,
  },
  {
    id: "ca-sb-53-safety-framework-publication",
    parentType: "subnational_rule",
    parentId: "us-ca-sb-53-frontier",
    category: "safety_framework_publication",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "California",
    domains: ["frontier-gpai"],
    summary:
      "California SB 53 requires covered frontier developers to publish safety frameworks.",
    caveat: "Coverage depends on statutory thresholds and the developer's connection to California.",
    sourceName: "California Legislature - SB 53",
    sourceUrl: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB53",
    ...VERIFIED,
  },
  {
    id: "ca-sb-53-incident-reporting",
    parentType: "subnational_rule",
    parentId: "us-ca-sb-53-frontier",
    category: "incident_reporting",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "California",
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    summary:
      "California SB 53 requires covered frontier developers to report specified safety incidents.",
    caveat: "This is not a federal U.S. frontier-model law; scope is state-level and threshold-dependent.",
    sourceName: "California Legislature - SB 53",
    sourceUrl: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB53",
    ...VERIFIED,
  },
  {
    id: "seoul-commitments-safety-framework",
    parentType: "international_instrument",
    parentId: "seoul-frontier-ai-safety-commitments",
    category: "safety_framework_publication",
    legalEffect: "voluntary",
    directness: "direct",
    jurisdiction: "Participating companies",
    domains: ["frontier-gpai"],
    summary:
      "The Seoul Frontier AI Safety Commitments ask participating companies to publish safety frameworks, thresholds, and severe-risk management processes.",
    caveat: "Company commitments are voluntary and should not be read as state law or treaty obligations.",
    sourceName: "GOV.UK - Frontier AI Safety Commitments",
    sourceUrl:
      "https://www.gov.uk/government/publications/frontier-ai-safety-commitments-ai-seoul-summit-2024/frontier-ai-safety-commitments-ai-seoul-summit-2024",
    ...VERIFIED,
  },
  {
    id: "nist-genai-profile-risk-management",
    parentType: "international_instrument",
    parentId: "nist-genai-profile",
    category: "risk_assessment",
    legalEffect: "guidance",
    directness: "direct",
    jurisdiction: "United States / international technical governance",
    domains: ["frontier-gpai", "synthetic-media", "cybersecurity-critical-infrastructure"],
    summary:
      "The NIST GenAI Profile gives voluntary guidance for identifying, measuring, managing, and governing generative-AI risks.",
    caveat: "NIST guidance is influential technical guidance, not binding law by itself.",
    sourceName: "NIST - AI RMF Generative AI Profile",
    sourceUrl:
      "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
    ...VERIFIED,
  },
  {
    id: "iso-42001-management-system",
    parentType: "international_instrument",
    parentId: "iso-iec-42001-2023",
    category: "data_governance",
    legalEffect: "standard",
    directness: "direct",
    jurisdiction: "International standardization",
    domains: ["frontier-gpai", "public-sector", "cybersecurity-critical-infrastructure"],
    summary:
      "ISO/IEC 42001 provides AI management-system requirements for organizational governance across the AI lifecycle.",
    caveat: "ISO standards are voluntary unless adopted into contracts, procurement, or law.",
    sourceName: "ISO - ISO/IEC 42001:2023",
    sourceUrl: "https://www.iso.org/standard/81230.html",
    ...VERIFIED,
  },
  {
    id: "nyc-aedt-bias-audit",
    parentType: "subnational_rule",
    parentId: "us-nyc-local-law-144",
    category: "audit_bias_audit",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "New York City",
    domains: ["employment-hiring"],
    summary:
      "NYC Local Law 144 requires annual independent bias audits for covered automated employment decision tools.",
    caveat: "The law is employment-specific and does not govern frontier models generally.",
    sourceName: "NYC DCWP - Automated Employment Decision Tools",
    sourceUrl: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
    ...VERIFIED,
  },
  {
    id: "us-take-it-down-deepfake-removal",
    parentType: "national_rule",
    parentId: "us-take-it-down-act-2025",
    category: "watermarking_content_labeling",
    legalEffect: "binding",
    directness: "direct",
    jurisdiction: "United States",
    domains: ["synthetic-media"],
    summary:
      "The TAKE IT DOWN Act creates notice-and-removal duties for covered platforms handling nonconsensual intimate imagery, including AI-generated digital forgeries.",
    caveat: "This is a synthetic-media/content law, not broad frontier-model governance.",
    sourceName: "U.S. Congress - S.146",
    sourceUrl: "https://www.congress.gov/bill/119th-congress/senate-bill/146",
    ...LIKELY,
  },
  {
    id: "au-mandatory-guardrails-proposed-risk",
    parentType: "national_rule",
    parentId: "au-proposed-mandatory-guardrails",
    category: "risk_assessment",
    legalEffect: "proposed",
    directness: "conditional",
    jurisdiction: "Australia",
    domains: ["frontier-gpai", "public-sector", "employment-hiring", "healthcare"],
    summary:
      "Australia's proposed mandatory guardrails would turn selected high-risk AI safety expectations into mandatory duties.",
    caveat: "This remains a proposal in the snapshot and must not be treated as binding law.",
    sourceName: "Department of Industry, Science and Resources - Proposed mandatory guardrails",
    sourceUrl:
      "https://www.industry.gov.au/publications/introducing-mandatory-guardrails-ai-high-risk-settings-proposals-paper",
    ...LIKELY,
  },
  {
    id: "br-ai-bill-risk-assessment-proposed",
    parentType: "national_rule",
    parentId: "br-ai-bill-2338",
    category: "risk_assessment",
    legalEffect: "proposed",
    directness: "conditional",
    jurisdiction: "Brazil",
    domains: ["frontier-gpai", "public-sector", "employment-hiring"],
    summary:
      "Brazil's PL 2338/2023 would create a risk-based AI framework with duties for developers and operators.",
    caveat: "The bill remains proposed until enactment is verified through official sources.",
    sourceName: "Federal Senate of Brazil - PL 2338/2023",
    sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/157233",
    ...LIKELY,
  },
  {
    id: "tr-ai-draft-risk-assessment-proposed",
    parentType: "national_rule",
    parentId: "tr-ai-law-draft",
    category: "risk_assessment",
    legalEffect: "proposed",
    directness: "conditional",
    jurisdiction: "Türkiye",
    domains: ["frontier-gpai", "healthcare", "public-sector"],
    summary:
      "Türkiye's draft AI law would create risk-assessment and compliance expectations for high-risk AI systems.",
    caveat: "The draft remains under legislative consideration and should not be treated as in force.",
    sourceName: "Grand National Assembly of Türkiye - Draft AI Law",
    sourceUrl: "https://www.tbmm.gov.tr/Yasama/KanunTeklifi/e21539a0-888a-4500-81be-01904a918c53",
    ...LIKELY,
  },
  {
    id: "mx-ai-law-proposed-transparency",
    parentType: "national_rule",
    parentId: "mx-federal-ai-law-proposed",
    category: "transparency_disclosure",
    legalEffect: "proposed",
    directness: "conditional",
    jurisdiction: "Mexico",
    domains: ["frontier-gpai", "public-sector"],
    summary:
      "Mexico's proposed federal AI law is tracked as a proposal for AI governance duties, including transparency-oriented obligations.",
    caveat: "Status is proposed and source pages are session-sensitive; do not treat as enacted law.",
    sourceName: "Mexico SIL - AI bill follow-up",
    sourceUrl:
      "https://sil.gobernacion.gob.mx/Librerias/pp_ReporteSeguimiento.php?Asunto=4729480&Seguimiento=4740725",
    ...LIKELY,
  },
  {
    id: "openai-eu-market-access-gpai",
    parentType: "lab_exposure",
    parentId: "openai--market_access--eu-ai-act-regional",
    category: "risk_assessment",
    legalEffect: "conditional",
    directness: "conditional",
    jurisdiction: "European Union",
    domains: ["frontier-gpai"],
    summary:
      "OpenAI's EU-facing general-purpose AI activity creates a conditional EU AI Act exposure hook captured in the lab exposure dataset.",
    caveat: "This is an applicability hook, not a public enforcement finding against the lab.",
    sourceName: "EUR-Lex - Regulation (EU) 2024/1689",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ...VERIFIED,
  },
  {
    id: "deepseek-export-control-compute",
    parentType: "lab_exposure",
    parentId: "deepseek--export_control_dependency--us-bis-export-controls",
    category: "compute_infrastructure_reporting",
    legalEffect: "indirect",
    directness: "indirect",
    jurisdiction: "United States / China",
    domains: ["compute-cloud-chips", "frontier-gpai"],
    summary:
      "U.S. advanced-chip export controls are tracked as an infrastructure constraint affecting Chinese frontier-AI compute capacity.",
    caveat: "This is infrastructure governance context, not an AI-specific national law exposure row.",
    sourceName: "BIS - advanced computing export controls",
    sourceUrl:
      "https://www.bis.gov/press-release/department-commerce-rescinds-biden-era-artificial-intelligence-diffusion-rule-strengthens-chip-related",
    ...LIKELY,
  },
];

export const OBLIGATION_BY_ID: Record<string, GovernanceObligation> =
  GOVERNANCE_OBLIGATIONS.reduce((acc, obligation) => {
    acc[obligation.id] = obligation;
    return acc;
  }, {} as Record<string, GovernanceObligation>);

export const OBLIGATIONS_BY_PARENT = GOVERNANCE_OBLIGATIONS.reduce(
  (acc, obligation) => {
    const key = `${obligation.parentType}:${obligation.parentId}`;
    (acc[key] ??= []).push(obligation);
    return acc;
  },
  {} as Record<string, GovernanceObligation[]>
);

export function getObligationsForParent(parentType: GovernanceObligation["parentType"], parentId: string) {
  return OBLIGATIONS_BY_PARENT[`${parentType}:${parentId}`] ?? [];
}
