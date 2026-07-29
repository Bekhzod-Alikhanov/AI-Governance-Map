import type {
  DataConfidence,
  LabExposureDirectness,
  LabExposureKind,
  LabExposureLegalEffect,
  LabExposureTargetType,
  LabRegulatoryExposure,
  SourceKind,
  VerificationStatus,
} from "../types";

type ExposureSource = {
  sourceName: string;
  sourceUrl: string;
  sourceKind: SourceKind;
  verificationStatus: VerificationStatus;
  confidence: DataConfidence;
  lastVerified: string;
  verificationNotes?: string;
  /** See `VerificationMetadata.archivedUrl` — same meaning, same purpose. */
  archivedUrl?: string;
  archivedAt?: string;
};

type ExposureSeed = {
  labId: string;
  targetType: LabExposureTargetType;
  targetId: string;
  exposureKind: LabExposureKind;
  legalEffect: LabExposureLegalEffect;
  directness: LabExposureDirectness;
  strength: number;
  jurisdiction?: string;
  rationale: string;
  notes?: string;
  source: ExposureSource;
};

const EU_AI_ACT_SOURCE: ExposureSource = {
  sourceName: "EUR-Lex - Regulation 2024/1689",
  sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Official source verifies the EU AI Act and its GPAI obligations. Lab-specific exposure is assessed from EU market-facing activity, not from a lab-named enforcement record.",
};

const NIST_RMF_SOURCE: ExposureSource = {
  sourceName: "NIST - AI Risk Management Framework",
  sourceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-20",
  verificationNotes:
    "NIST source verifies voluntary AI RMF scope. Exposure means risk-management influence, not binding legal duty.",
};

const US_CAISI_SOURCE: ExposureSource = {
  sourceName: "NIST - CAISI",
  sourceUrl: "https://www.nist.gov/caisi",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-20",
  verificationNotes:
    "NIST source verifies CAISI's institutional role. Lab-level coordination is conditional on evaluation partnerships, information sharing, or public engagement.",
};

const UK_AISI_SOURCE: ExposureSource = {
  sourceName: "UK AISI - About",
  sourceUrl: "https://www.aisi.gov.uk/about",
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Official UK AISI source verifies the institute's frontier-model evaluation role. Lab-specific exposure is conditional and should not be read as a binding legal obligation.",
};

const SEOUL_COMMITMENTS_SOURCE: ExposureSource = {
  sourceName: "GOV.UK - Frontier AI Safety Commitments",
  sourceUrl:
    "https://www.gov.uk/government/publications/frontier-ai-safety-commitments-ai-seoul-summit-2024/frontier-ai-safety-commitments-ai-seoul-summit-2024",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-21",
  verificationNotes:
    "Official GOV.UK page lists participating companies and describes the commitments as voluntary company commitments.",
};

const FMF_SOURCE: ExposureSource = {
  sourceName: "Frontier Model Forum - Membership",
  sourceUrl: "https://www.frontiermodelforum.org/membership/",
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Issuer-controlled non-state source. Exposure means industry coordination, not public-law obligation.",
};

const CANADA_CODE_SOURCE: ExposureSource = {
  sourceName: "ISED - Voluntary Code of Conduct on Advanced Generative AI",
  sourceUrl:
    "https://ised-isde.canada.ca/site/ised/en/voluntary-code-conduct-responsible-development-and-management-advanced-generative-ai-systems",
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Official ISED source verifies the voluntary code. Treat as Canadian voluntary governance context, not binding law.",
};

const CANADA_AISI_SOURCE: ExposureSource = {
  sourceName: "ISED - Canadian Artificial Intelligence Safety Institute",
  sourceUrl:
    "https://ised-isde.canada.ca/site/ised/en/canadian-artificial-intelligence-safety-institute",
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Official ISED source verifies the Canadian institute. Lab-level exposure is coordination context, not a direct legal obligation.",
};

const FR_AI_STRATEGY_SOURCE: ExposureSource = {
  sourceName: "French Ministry of Economy - National AI strategy",
  sourceUrl: "https://www.economie.gouv.fr/actualites/strategie-nationale-intelligence-artificielle",
  archivedUrl: "https://web.archive.org/web/20260218221039/https://www.economie.gouv.fr/actualites/strategie-nationale-intelligence-artificielle",
  archivedAt: "2026-02-18",
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-29",
  verificationNotes:
    "Official or issuer-controlled strategy source. Treat as national policy context for the French AI ecosystem, not binding law.",
};

const IT_AI_LAW_SOURCE: ExposureSource = {
  sourceName: "Italian Senate - Law 132/2025",
  sourceUrl: "https://www.senato.it/leg/19/BGT/Schede/Ddliter/58224.htm",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-28",
  verificationNotes:
    "Official parliamentary source supports the Italian AI law record. Lab exposure is conditional on Italian-market activity and applicable scope.",
};

const CHINA_GENAI_SOURCE: ExposureSource = {
  sourceName: "CAC - Interim Measures for Generative AI Services",
  sourceUrl: "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-28",
  verificationNotes:
    "Official CAC source verifies the binding GenAI service measures. Exposure is direct for public-facing Chinese GenAI services.",
};

const CHINA_DEEP_SYNTHESIS_SOURCE: ExposureSource = {
  sourceName: "CAC - Deep Synthesis provisions",
  sourceUrl: "https://www.cac.gov.cn/2022-12/11/c_1672221949354811.htm",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-28",
  verificationNotes:
    "Official CAC source verifies binding deep-synthesis service provisions.",
};

const CHINA_ALGORITHM_SOURCE: ExposureSource = {
  sourceName: "CAC - Algorithmic Recommendation provisions",
  sourceUrl: "https://www.cac.gov.cn/2022-01/04/c_1642894606364259.htm",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-28",
  verificationNotes:
    "Official CAC source verifies binding algorithmic-recommendation service provisions.",
};

const CHINA_LABELING_SOURCE: ExposureSource = {
  sourceName: "CAC - AI Content Labeling Measures",
  sourceUrl: "https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-27",
  verificationNotes:
    "Official CAC notice verifies the AI-generated synthetic-content labeling measures.",
};

const ISO_42001_SOURCE: ExposureSource = {
  sourceName: "ISO - ISO/IEC 42001:2023",
  sourceUrl: "https://www.iso.org/standard/81230.html",
  archivedUrl: "https://web.archive.org/web/20250612081233/https://www.iso.org/standard/81230.html",
  archivedAt: "2025-06-12",
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Official ISO page verifies the standard. Exposure means standards/compliance influence, not national law.",
};

const CEN_CENELEC_SOURCE: ExposureSource = {
  sourceName: "CEN-CENELEC - Artificial Intelligence",
  sourceUrl: "https://www.cencenelec.eu/areas-of-work/cen-cenelec-topics/artificial-intelligence/",
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-21",
  verificationNotes:
    "Official CEN-CENELEC page verifies AI standardization work. Exposure is compliance-environment context, not a standalone duty.",
};

const CHIPS_SOURCE: ExposureSource = {
  sourceName: "NVIDIA Data Center GPUs",
  sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/",
  sourceKind: "mixed",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Primary source verifies a representative advanced AI GPU; broader chip-dependency assessment is analytical synthesis.",
};

const CLOUD_SOURCE: ExposureSource = {
  sourceName: "Synergy Research - Cloud market share",
  sourceUrl:
    "https://www.srgresearch.com/articles/q1-cloud-spending-grows-by-over-10-billion-from-2022-the-big-three-account-for-65-of-the-total",
  sourceKind: "secondary",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Cloud-provider market-structure source is secondary. Exposure is infrastructure dependency context, not law.",
};

const BIS_SOURCE: ExposureSource = {
  sourceName: "U.S. BIS - Press release on AI chip controls",
  sourceUrl:
    "https://www.bis.gov/press-release/department-commerce-rescinds-biden-era-artificial-intelligence-diffusion-rule-strengthens-chip-related",
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Official BIS source verifies the export-control action. Exposure is upstream infrastructure constraint, not an AI-specific national law.",
};

const US_FRONTIER_LABS = ["openai", "anthropic", "google-deepmind", "meta", "microsoft", "amazon", "xai"];
const EU_FACING_LABS = [...US_FRONTIER_LABS, "mistral", "cohere"];
const SEOUL_COMMITMENT_LABS = ["amazon", "anthropic", "cohere", "google-deepmind", "meta", "microsoft", "mistral", "openai", "xai"];
const FMF_LABS = ["openai", "anthropic", "google-deepmind", "meta", "microsoft", "amazon"];
const CHINESE_LABS = ["deepseek", "baidu", "alibaba", "tencent"];
const ALL_LABS = [...US_FRONTIER_LABS, "mistral", "cohere", ...CHINESE_LABS];
const THIRD_PARTY_CLOUD_DEPENDENT_LABS = ["openai", "anthropic", "meta", "xai", "mistral", "cohere", "deepseek", "baidu"];

function exposure(seed: ExposureSeed): LabRegulatoryExposure {
  return {
    id: `${seed.labId}--${seed.exposureKind}--${seed.targetId}`,
    labId: seed.labId,
    targetType: seed.targetType,
    targetId: seed.targetId,
    exposureKind: seed.exposureKind,
    legalEffect: seed.legalEffect,
    directness: seed.directness,
    strength: seed.strength,
    jurisdiction: seed.jurisdiction,
    rationale: seed.rationale,
    notes: seed.notes,
    sourceName: seed.source.sourceName,
    sourceUrl: seed.source.sourceUrl,
    sourceKind: seed.source.sourceKind,
    verificationStatus: seed.source.verificationStatus,
    confidence: seed.source.confidence,
    lastVerified: seed.source.lastVerified,
    verificationNotes: seed.source.verificationNotes,
  };
}

const euAiActExposures = EU_FACING_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "national_rule",
    targetId: "eu-ai-act-regional",
    exposureKind: labId === "mistral" ? "eu_applicability" : "market_access",
    legalEffect: "binding",
    directness: labId === "mistral" ? "direct" : "conditional",
    strength: labId === "mistral" ? 5 : 4,
    jurisdiction: "European Union",
    rationale:
      labId === "mistral"
        ? "Mistral is headquartered in France and is directly inside the EU AI Act compliance environment for GPAI providers."
        : "EU-facing GPAI or AI-system offerings can trigger EU AI Act obligations even when the lab is headquartered outside the EU.",
    notes:
      "This is not an official lab-specific enforcement finding; it is a legal-applicability hook based on provider activity in the EU market.",
    source: EU_AI_ACT_SOURCE,
  })
);

const nistRmfExposures = US_FRONTIER_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "national_rule",
    targetId: "us-nist-ai-rmf",
    exposureKind: "standards_influence",
    legalEffect: "guidance",
    directness: "indirect",
    strength: 3,
    jurisdiction: "United States",
    rationale:
      "The lab operates in the U.S. governance ecosystem where NIST AI RMF is a central voluntary risk-management reference.",
    source: NIST_RMF_SOURCE,
  })
);

const usCaisiExposures = US_FRONTIER_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "national_rule",
    targetId: "us-caisi",
    exposureKind: "safety_institute_coordination",
    legalEffect: "guidance",
    directness: "conditional",
    strength: 3,
    jurisdiction: "United States",
    rationale:
      "U.S. CAISI creates a government evaluation and safety-science coordination channel for frontier model developers.",
    notes:
      "Coordination exposure does not itself create binding duties; it indicates the lab sits inside the evaluation ecosystem.",
    source: US_CAISI_SOURCE,
  })
);

const ukAisiExposures = US_FRONTIER_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "national_rule",
    targetId: "uk-ai-security-institute",
    exposureKind: "safety_institute_coordination",
    legalEffect: "guidance",
    directness: "conditional",
    strength: 2,
    jurisdiction: "United Kingdom",
    rationale:
      "UK AISI is a major frontier-model evaluation institution whose work can affect internationally deployed frontier labs.",
    notes:
      "This is broad safety-science coordination exposure, not a UK binding-law claim against the lab.",
    source: UK_AISI_SOURCE,
  })
);

const seoulCommitmentExposures = SEOUL_COMMITMENT_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "company_commitment",
    targetId: "seoul-frontier-ai-safety-commitments",
    exposureKind: "company_commitment",
    legalEffect: "voluntary",
    directness: "direct",
    strength: 3,
    rationale:
      "The lab or its parent company is represented in the official Frontier AI Safety Commitments participant roster.",
    notes: "Voluntary company commitment, not state law or treaty obligation.",
    source: SEOUL_COMMITMENTS_SOURCE,
  })
);

const fmfExposures = FMF_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "company_commitment",
    targetId: "frontier-model-forum",
    exposureKind: "company_commitment",
    legalEffect: "voluntary",
    directness: "direct",
    strength: 2,
    rationale:
      "The lab or parent company participates in the Frontier Model Forum industry-governance layer.",
    notes: "Industry coordination, not public-law exposure.",
    source: FMF_SOURCE,
  })
);

const chinaGenaiExposures = CHINESE_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "national_rule",
    targetId: "cn-genai-interim-measures",
    exposureKind: "hq_jurisdiction",
    legalEffect: "binding",
    directness: "direct",
    strength: labId === "deepseek" ? 4 : 5,
    jurisdiction: "China",
    rationale:
      "Chinese public-facing generative AI services are governed by CAC-led GenAI service requirements.",
    source: CHINA_GENAI_SOURCE,
  })
);

const standardsExposures = ALL_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "standard",
    targetId: "iso-iec-42001-2023",
    exposureKind: "standards_influence",
    legalEffect: "standard",
    directness: "indirect",
    strength: 2,
    rationale:
      "ISO/IEC 42001 shapes the management-system assurance environment for AI developers and enterprise buyers.",
    notes: "Technical-standard influence, not national law unless separately incorporated or required.",
    source: ISO_42001_SOURCE,
  })
);

const computeDependencyExposures = ALL_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "infrastructure",
    targetId: "advanced-ai-chips",
    exposureKind: "compute_dependency",
    legalEffect: "infrastructure_constraint",
    directness: "indirect",
    strength: ["openai", "anthropic", "google-deepmind", "meta", "microsoft", "amazon"].includes(labId) ? 5 : 4,
    rationale:
      "Frontier model development depends on access to advanced AI accelerators and the supply chains that govern them.",
    notes: "Infrastructure dependency, not AI-law exposure.",
    source: CHIPS_SOURCE,
  })
);

const cloudDependencyExposures = THIRD_PARTY_CLOUD_DEPENDENT_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "infrastructure",
    targetId: "hyperscale-cloud",
    exposureKind: "compute_dependency",
    legalEffect: "infrastructure_constraint",
    directness: "indirect",
    strength: 4,
    rationale:
      "The lab depends on hyperscale cloud or cloud-adjacent capacity for training, inference, distribution, or enterprise deployment.",
    notes: "Private infrastructure dependency, not legal obligation.",
    source: CLOUD_SOURCE,
  })
);

const bisExportControlExposures = CHINESE_LABS.map((labId) =>
  exposure({
    labId,
    targetType: "infrastructure",
    targetId: "us-bis-export-controls",
    exposureKind: "export_control_dependency",
    legalEffect: "infrastructure_constraint",
    directness: "indirect",
    strength: 4,
    jurisdiction: "United States / China",
    rationale:
      "U.S. export controls on advanced computing ICs constrain access routes for Chinese frontier-AI compute capacity.",
    notes: "Export-control infrastructure constraint; intentionally separated from AI-specific legal exposure.",
    source: BIS_SOURCE,
  })
);

export const LAB_REGULATORY_EXPOSURES: LabRegulatoryExposure[] = [
  ...euAiActExposures,
  ...nistRmfExposures,
  ...usCaisiExposures,
  ...ukAisiExposures,
  ...seoulCommitmentExposures,
  ...fmfExposures,
  ...chinaGenaiExposures,
  exposure({
    labId: "cohere",
    targetType: "national_rule",
    targetId: "ca-voluntary-code-genai",
    exposureKind: "hq_jurisdiction",
    legalEffect: "voluntary",
    directness: "direct",
    strength: 3,
    jurisdiction: "Canada",
    rationale:
      "Cohere is headquartered in Canada and sits inside the Canadian voluntary advanced-generative-AI code environment.",
    source: CANADA_CODE_SOURCE,
  }),
  exposure({
    labId: "cohere",
    targetType: "national_rule",
    targetId: "ca-aisi",
    exposureKind: "safety_institute_coordination",
    legalEffect: "guidance",
    directness: "conditional",
    strength: 2,
    jurisdiction: "Canada",
    rationale:
      "The Canadian AI Safety Institute creates a domestic frontier-AI safety coordination channel relevant to Canadian frontier labs.",
    source: CANADA_AISI_SOURCE,
  }),
  exposure({
    labId: "mistral",
    targetType: "national_rule",
    targetId: "fr-ai-for-humanity",
    exposureKind: "policy_influence",
    legalEffect: "guidance",
    directness: "indirect",
    strength: 2,
    jurisdiction: "France",
    rationale:
      "Mistral is headquartered in France and is shaped by the French national AI policy ecosystem.",
    source: FR_AI_STRATEGY_SOURCE,
  }),
  exposure({
    labId: "mistral",
    targetType: "national_rule",
    targetId: "it-law-132-2025",
    exposureKind: "market_access",
    legalEffect: "binding",
    directness: "conditional",
    strength: 2,
    jurisdiction: "Italy",
    rationale:
      "Italian-market activity can create conditional exposure to Italy's AI law where the law's scope applies.",
    notes:
      "Conditional market-access exposure; do not read as a finding that every Mistral activity is regulated by this law.",
    source: IT_AI_LAW_SOURCE,
  }),
  exposure({
    labId: "deepseek",
    targetType: "national_rule",
    targetId: "cn-ai-content-labeling",
    exposureKind: "hq_jurisdiction",
    legalEffect: "binding",
    directness: "direct",
    strength: 4,
    jurisdiction: "China",
    rationale:
      "China's synthetic-content labelling rules are directly relevant to public-facing AI-generated content services.",
    source: CHINA_LABELING_SOURCE,
  }),
  exposure({
    labId: "baidu",
    targetType: "national_rule",
    targetId: "cn-deep-synthesis",
    exposureKind: "hq_jurisdiction",
    legalEffect: "binding",
    directness: "direct",
    strength: 4,
    jurisdiction: "China",
    rationale:
      "Baidu's public AI and internet services sit inside China's deep-synthesis service rule stack.",
    source: CHINA_DEEP_SYNTHESIS_SOURCE,
  }),
  exposure({
    labId: "baidu",
    targetType: "national_rule",
    targetId: "cn-algorithm-recommendation",
    exposureKind: "hq_jurisdiction",
    legalEffect: "binding",
    directness: "direct",
    strength: 3,
    jurisdiction: "China",
    rationale:
      "Baidu's platform services are exposed to China's algorithmic-recommendation governance environment.",
    source: CHINA_ALGORITHM_SOURCE,
  }),
  exposure({
    labId: "alibaba",
    targetType: "national_rule",
    targetId: "cn-algorithm-recommendation",
    exposureKind: "hq_jurisdiction",
    legalEffect: "binding",
    directness: "direct",
    strength: 3,
    jurisdiction: "China",
    rationale:
      "Alibaba's platform and cloud services are exposed to China's algorithmic-recommendation governance environment.",
    source: CHINA_ALGORITHM_SOURCE,
  }),
  exposure({
    labId: "tencent",
    targetType: "national_rule",
    targetId: "cn-deep-synthesis",
    exposureKind: "hq_jurisdiction",
    legalEffect: "binding",
    directness: "direct",
    strength: 4,
    jurisdiction: "China",
    rationale:
      "Tencent's public AI and content services sit inside China's deep-synthesis service rule stack.",
    source: CHINA_DEEP_SYNTHESIS_SOURCE,
  }),
  exposure({
    labId: "tencent",
    targetType: "national_rule",
    targetId: "cn-algorithm-recommendation",
    exposureKind: "hq_jurisdiction",
    legalEffect: "binding",
    directness: "direct",
    strength: 3,
    jurisdiction: "China",
    rationale:
      "Tencent's social-platform and content services are exposed to China's algorithmic-recommendation governance environment.",
    source: CHINA_ALGORITHM_SOURCE,
  }),
  ...standardsExposures,
  ...EU_FACING_LABS.map((labId) =>
    exposure({
      labId,
      targetType: "standard",
      targetId: "cen-cenelec-ai-act-standards",
      exposureKind: "standards_influence",
      legalEffect: "standard",
      directness: "indirect",
      strength: 2,
      jurisdiction: "European Union",
      rationale:
        "EU AI Act harmonized-standardization work shapes future conformity and assurance pathways for EU-facing AI providers.",
      notes: "Standardization infrastructure, not national law.",
      source: CEN_CENELEC_SOURCE,
    })
  ),
  ...computeDependencyExposures,
  ...cloudDependencyExposures,
  ...bisExportControlExposures,
];

export const LAB_EXPOSURES_BY_LAB: Record<string, LabRegulatoryExposure[]> =
  LAB_REGULATORY_EXPOSURES.reduce(
    (acc, exposureRow) => {
      (acc[exposureRow.labId] ??= []).push(exposureRow);
      return acc;
    },
    {} as Record<string, LabRegulatoryExposure[]>
  );
