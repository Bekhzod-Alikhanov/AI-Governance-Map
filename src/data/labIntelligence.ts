import { FRONTIER_LABS, LAB_BY_ID } from "./frontierLabs";
import type {
  ComputeDependencyRecord,
  ExpertReviewMetadata,
  IncidentEnforcementRecord,
  LabIntelligenceProfile,
  ModelGovernanceEvidence,
  SafetyEvaluationRecord,
} from "../types";

const EDITORIAL_REVIEW: ExpertReviewMetadata = {
  reviewerRole: "dataset editor",
  reviewDate: "2026-06-07",
  reviewScope: "Checked context/legal separation for lab-intelligence v1.",
  unresolvedCaveats: ["Refresh markets, evaluation partnerships, and model families monthly."],
};

const PROFILE_CAVEAT = "Research triage layer; not a full entity, product, or liability assessment.";
const COMPANY_FRAMEWORK_CAVEAT = "Company or issuer-controlled evidence; not public law.";
const COMPANY_MODEL_EVIDENCE_CAVEAT =
  "Company or issuer-controlled model evidence; not safety certification, audit evidence, or public law.";
const EVALUATION_CAVEAT = "Evaluation evidence, not certification or a legal finding.";
const INSTITUTE_CAVEAT = "Institute-level context; not a lab-specific legal obligation.";
const COMPUTE_CAVEAT = "Infrastructure context; not AI-specific law or capacity/procurement proof.";

const OFFICIAL_COMPANY = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-06-07",
  reviewStatus: "editorial_checked",
} as const;

const OFFICIAL_COMPANY_2026_06_13 = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-06-13",
  reviewStatus: "editorial_checked",
} as const;

const ISSUER_CONTROLLED_CONTEXT_2026_06_13 = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-06-13",
  reviewStatus: "editorial_checked",
} as const;

const ISSUER_CONTROLLED_CONTEXT = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  reviewStatus: "editorial_checked",
} as const;

const OFFICIAL_ENFORCEMENT_2026_06_11 = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-06-11",
  reviewStatus: "editorial_checked",
} as const;

const LIKELY_OFFICIAL_ENFORCEMENT_2026_06_11 = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-06-11",
  reviewStatus: "editorial_checked",
} as const;

const OFFICIAL_ENFORCEMENT_2026_06_12 = {
  sourceKind: "official",
  verificationStatus: "verified",
  confidence: "high",
  lastVerified: "2026-06-12",
  reviewStatus: "editorial_checked",
} as const;

const SEOUL_COMMITMENT_LABS = [
  "amazon",
  "anthropic",
  "cohere",
  "google-deepmind",
  "meta",
  "microsoft",
  "mistral",
  "openai",
  "xai",
];

const CHINESE_LABS = ["deepseek", "baidu", "alibaba", "tencent"];
const THIRD_PARTY_CLOUD_DEPENDENT_LABS = ["openai", "anthropic", "meta", "xai", "mistral", "cohere", "deepseek", "baidu"];

const PARENT_ENTITY_BY_LAB: Record<string, string> = {
  openai: "OpenAI, L.L.C. / OpenAI OpCo structure",
  anthropic: "Anthropic PBC",
  "google-deepmind": "Google LLC / Alphabet Inc.",
  meta: "Meta Platforms, Inc.",
  microsoft: "Microsoft Corporation",
  amazon: "Amazon.com, Inc.",
  xai: "xAI Corp.",
  mistral: "Mistral AI SAS",
  cohere: "Cohere Inc.",
  deepseek: "Hangzhou DeepSeek Artificial Intelligence Co., Ltd. (reported operating entity)",
  baidu: "Baidu, Inc.",
  alibaba: "Alibaba Group / Alibaba Cloud",
  tencent: "Tencent Holdings / Tencent Cloud",
};

const DEFAULT_MARKETS_BY_LAB: Record<string, string[]> = {
  openai: ["EUU", "USA", "GBR", "KOR", "CAN"],
  anthropic: ["EUU", "USA", "GBR", "KOR", "CAN"],
  "google-deepmind": ["EUU", "USA", "GBR", "KOR", "CAN"],
  meta: ["EUU", "USA", "GBR", "KOR"],
  microsoft: ["EUU", "USA", "GBR", "KOR", "CAN"],
  amazon: ["EUU", "USA", "GBR", "KOR", "CAN"],
  xai: ["EUU", "USA", "GBR"],
  mistral: ["EUU", "FRA", "GBR", "USA"],
  cohere: ["CAN", "USA", "EUU", "GBR"],
  deepseek: ["CHN", "KOR"],
  baidu: ["CHN"],
  alibaba: ["CHN", "EUU"],
  tencent: ["CHN"],
};

function profileForLab(labId: string): LabIntelligenceProfile {
  const lab = LAB_BY_ID[labId];
  return {
    id: `${labId}-intelligence-profile`,
    labId,
    parentLegalEntity: PARENT_ENTITY_BY_LAB[labId] ?? lab.name,
    majorOffices: [
      {
        label: `Headquarters or principal AI governance hook: ${lab.hqCountryName}`,
        countryIso3: lab.hqIso3,
        note: "This is a jurisdictional hook for research triage, not a complete legal-entity map.",
      },
    ],
    modelFamilies: lab.flagshipModels,
    safetyFrameworkName: lab.safetyFramework?.name,
    responsibleScalingPolicyUrl: lab.safetyFramework?.sourceUrl,
    frontierCommitmentIds: SEOUL_COMMITMENT_LABS.includes(labId)
      ? ["seoul-frontier-ai-safety-commitments"]
      : [],
    evaluationPartnerIds: labId === "deepseek" ? ["nist-caisi-deepseek-evaluation"] : [],
    deploymentMarketIso3s: DEFAULT_MARKETS_BY_LAB[labId] ?? [lab.hqIso3],
    publicGovernanceContactUrl: lab.safetyFramework?.sourceUrl ?? lab.sourceUrl,
    summary: `${lab.name} profile linking safety, commitment, evaluation, and compute-context rows.`,
    caveat: PROFILE_CAVEAT,
    sourceName: lab.sourceName,
    sourceUrl: lab.sourceUrl,
    sourceKind: lab.sourceKind,
    verificationStatus: lab.verificationStatus,
    confidence: lab.confidence,
    lastVerified: lab.lastVerified,
    verificationNotes: lab.verificationNotes,
    sourceChain: lab.safetyFramework
      ? [
          {
            sourceName: lab.safetyFramework.sourceName,
            sourceUrl: lab.safetyFramework.sourceUrl,
            sourceKind: lab.safetyFramework.sourceKind,
            note: "Safety-framework source attached to the lab profile.",
          },
        ]
      : [],
    reviewStatus: "editorial_checked",
    reviewNotes: EDITORIAL_REVIEW.reviewScope,
    expertReview: EDITORIAL_REVIEW,
  };
}

export const LAB_INTELLIGENCE_PROFILES: LabIntelligenceProfile[] = FRONTIER_LABS.map((lab) =>
  profileForLab(lab.id)
);

export const MODEL_GOVERNANCE_EVIDENCE: ModelGovernanceEvidence[] = [
  {
    id: "openai-preparedness-framework-evidence",
    labIds: ["openai"],
    evidenceKind: "safety_framework",
    title: "OpenAI Preparedness Framework",
    modelOrSystem: "GPT and o-series frontier models",
    domains: ["frontier-gpai"],
    summary: "Company framework for frontier risk tracking, evaluations, thresholds, and deployment controls.",
    caveat: COMPANY_FRAMEWORK_CAVEAT,
    sourceName: "OpenAI - Preparedness Framework",
    sourceUrl: "https://openai.com/index/updating-our-preparedness-framework/",
    ...OFFICIAL_COMPANY,
  },
  {
    id: "anthropic-responsible-scaling-policy-evidence",
    labIds: ["anthropic"],
    evidenceKind: "responsible_scaling_policy",
    title: "Anthropic Responsible Scaling Policy",
    modelOrSystem: "Claude frontier models",
    domains: ["frontier-gpai"],
    summary: "Responsible-scaling policy using AI Safety Levels and capability-triggered safeguards.",
    caveat: COMPANY_FRAMEWORK_CAVEAT,
    sourceName: "Anthropic - Responsible Scaling Policy",
    sourceUrl: "https://www.anthropic.com/rsp/",
    ...OFFICIAL_COMPANY,
  },
  {
    id: "deepmind-frontier-safety-framework-evidence",
    labIds: ["google-deepmind"],
    evidenceKind: "safety_framework",
    title: "Google DeepMind Frontier Safety Framework",
    modelOrSystem: "Gemini frontier models",
    domains: ["frontier-gpai"],
    summary: "Framework for critical-capability thresholds plus security and deployment mitigations.",
    caveat: COMPANY_FRAMEWORK_CAVEAT,
    sourceName: "Google DeepMind - Frontier Safety Framework",
    sourceUrl: "https://deepmind.google/discover/blog/introducing-the-frontier-safety-framework/",
    ...OFFICIAL_COMPANY,
  },
  {
    id: "meta-advanced-ai-scaling-framework-evidence",
    labIds: ["meta"],
    evidenceKind: "safety_framework",
    title: "Meta Advanced AI Scaling Framework",
    modelOrSystem: "Llama frontier releases",
    domains: ["frontier-gpai"],
    summary: "Company framework for increasingly capable AI systems and release governance.",
    caveat: COMPANY_FRAMEWORK_CAVEAT,
    sourceName: "Meta AI - Advanced AI Scaling Framework",
    sourceUrl: "https://ai.meta.com/static-resource/Meta_Advanced-AI-Scaling-Framework-v2",
    ...ISSUER_CONTROLLED_CONTEXT,
  },
  {
    id: "microsoft-frontier-governance-framework-evidence",
    labIds: ["microsoft"],
    evidenceKind: "safety_framework",
    title: "Microsoft Frontier Governance Framework",
    modelOrSystem: "Microsoft frontier model and platform stack",
    domains: ["frontier-gpai", "compute-cloud-chips"],
    summary: "Company frontier-governance evidence for model, deployment, and platform controls.",
    caveat: COMPANY_FRAMEWORK_CAVEAT,
    sourceName: "Microsoft - Responsible AI transparency report",
    sourceUrl: "https://blogs.microsoft.com/on-the-issues/2024/05/01/responsible-ai-transparency-report/",
    ...ISSUER_CONTROLLED_CONTEXT,
  },
  {
    id: "amazon-nova-premier-critical-risk-evidence",
    labIds: ["amazon"],
    evidenceKind: "evaluation_report",
    title: "Amazon Nova Premier critical-risk evaluation",
    modelOrSystem: "Amazon Nova Premier",
    domains: ["frontier-gpai"],
    summary: "Public critical-risk evaluation evidence under Amazon's Frontier Model Safety Framework.",
    caveat: EVALUATION_CAVEAT,
    sourceName: "Amazon Science - Nova Premier critical-risk evaluation",
    sourceUrl:
      "https://www.amazon.science/publications/evaluating-the-critical-risks-of-amazons-nova-premier-under-the-frontier-model-safety-framework",
    ...OFFICIAL_COMPANY,
  },
  {
    id: "cohere-secure-ai-frontier-model-framework-evidence",
    labIds: ["cohere"],
    evidenceKind: "safety_framework",
    title: "Cohere Secure AI Frontier Model Framework",
    modelOrSystem: "Command family",
    domains: ["frontier-gpai"],
    summary: "Company framework for secure frontier-model development and deployment risk management.",
    caveat: COMPANY_FRAMEWORK_CAVEAT,
    sourceName: "Cohere - Secure AI Frontier Model Framework",
    sourceUrl: "https://cohere.com/blog/secure-model-framework",
    ...ISSUER_CONTROLLED_CONTEXT,
  },
  {
    id: "seoul-frontier-ai-safety-commitments-company-roster",
    labIds: SEOUL_COMMITMENT_LABS,
    evidenceKind: "frontier_commitment",
    title: "Frontier AI Safety Commitments company roster",
    domains: ["frontier-gpai"],
    summary: "Official Seoul Summit company roster for voluntary frontier-AI safety commitments.",
    caveat: "Company commitments, not treaty obligations or state participation.",
    sourceName: "GOV.UK - Frontier AI Safety Commitments",
    sourceUrl:
      "https://www.gov.uk/government/publications/frontier-ai-safety-commitments-ai-seoul-summit-2024/frontier-ai-safety-commitments-ai-seoul-summit-2024",
    ...OFFICIAL_COMPANY,
  },
  {
    id: "openai-model-catalog-evidence",
    labIds: ["openai"],
    evidenceKind: "model_card",
    title: "OpenAI API model catalog",
    modelOrSystem: "GPT-5.x and o-series model families",
    domains: ["frontier-gpai"],
    summary: "Official OpenAI model catalog used as current model-family evidence.",
    caveat: COMPANY_MODEL_EVIDENCE_CAVEAT,
    sourceName: "OpenAI API docs - models",
    sourceUrl: "https://developers.openai.com/api/docs/models/all",
    verificationNotes: "Issuer-controlled model catalog; not an external safety audit.",
    ...OFFICIAL_COMPANY_2026_06_13,
  },
  {
    id: "anthropic-model-overview-evidence",
    labIds: ["anthropic"],
    evidenceKind: "model_card",
    title: "Anthropic Claude model overview",
    modelOrSystem: "Claude model family",
    domains: ["frontier-gpai"],
    summary: "Official Anthropic docs used as Claude model-family evidence.",
    caveat: COMPANY_MODEL_EVIDENCE_CAVEAT,
    sourceName: "Anthropic docs - Claude models overview",
    sourceUrl: "https://docs.anthropic.com/en/docs/about-claude/models/overview",
    verificationNotes: "Official docs were reachable through the platform redirect; refresh monthly.",
    ...ISSUER_CONTROLLED_CONTEXT_2026_06_13,
  },
  {
    id: "deepmind-model-cards-evidence",
    labIds: ["google-deepmind"],
    evidenceKind: "model_card",
    title: "Google DeepMind model-card index",
    modelOrSystem: "Gemini and other DeepMind model families",
    domains: ["frontier-gpai"],
    summary: "Official DeepMind model-card page used as model documentation evidence.",
    caveat: COMPANY_MODEL_EVIDENCE_CAVEAT,
    sourceName: "Google DeepMind - model cards",
    sourceUrl: "https://deepmind.google/models/model-cards/",
    verificationNotes: "Issuer-controlled model-card index; not independent certification.",
    ...OFFICIAL_COMPANY_2026_06_13,
  },
  {
    id: "meta-llama-model-evidence",
    labIds: ["meta"],
    evidenceKind: "model_card",
    title: "Meta Llama model family page",
    modelOrSystem: "Llama model family",
    domains: ["frontier-gpai"],
    summary: "Official Meta Llama page used as model-family evidence.",
    caveat: COMPANY_MODEL_EVIDENCE_CAVEAT,
    sourceName: "Meta AI - Llama",
    sourceUrl: "https://ai.meta.com/llama/",
    verificationNotes: "Issuer-controlled model-family evidence; context only.",
    ...ISSUER_CONTROLLED_CONTEXT_2026_06_13,
  },
  {
    id: "xai-grok-model-docs-evidence",
    labIds: ["xai"],
    evidenceKind: "release_note",
    title: "xAI Grok model documentation",
    modelOrSystem: "Grok 4.3",
    domains: ["frontier-gpai"],
    summary: "Official xAI docs describe Grok 4.3 model-context information.",
    caveat: COMPANY_MODEL_EVIDENCE_CAVEAT,
    sourceName: "xAI docs - models",
    sourceUrl: "https://docs.x.ai/developers/models",
    verificationNotes: "Official xAI docs listed Grok 4.3 in the 2026-06-13 check.",
    ...OFFICIAL_COMPANY_2026_06_13,
  },
  {
    id: "mistral-model-portfolio-evidence",
    labIds: ["mistral"],
    evidenceKind: "release_note",
    title: "Mistral model portfolio",
    modelOrSystem: "Mistral Medium 3.5 and Mistral Large 3",
    domains: ["frontier-gpai"],
    summary: "Official Mistral page describes flagship and open-weight model families.",
    caveat: COMPANY_MODEL_EVIDENCE_CAVEAT,
    sourceName: "Mistral AI - models",
    sourceUrl: "https://mistral.ai/models",
    verificationNotes: "Official page checked for Medium 3.5, Large 3, and open-weight positioning.",
    ...OFFICIAL_COMPANY_2026_06_13,
  },
  {
    id: "alibaba-qwen-model-family-evidence",
    labIds: ["alibaba"],
    evidenceKind: "release_note",
    title: "Alibaba Qwen model family",
    modelOrSystem: "Qwen3 and Qwen multimodal family",
    domains: ["frontier-gpai"],
    summary: "Official Alibaba Cloud page describes Qwen3 and Qwen model coverage.",
    caveat: COMPANY_MODEL_EVIDENCE_CAVEAT,
    sourceName: "Alibaba Cloud - Qwen",
    sourceUrl: "https://www.alibabacloud.com/en/solutions/generative-ai/qwen",
    verificationNotes: "Official page checked for Qwen3, multilingual, and multimodal coverage.",
    ...OFFICIAL_COMPANY_2026_06_13,
  },
  {
    id: "baidu-ernie-5-1-release-evidence",
    labIds: ["baidu"],
    evidenceKind: "release_note",
    title: "Baidu ERNIE 5.1 release",
    modelOrSystem: "ERNIE 5.1",
    domains: ["frontier-gpai"],
    summary: "Official Baidu note describes ERNIE 5.1 release and benchmark positioning.",
    caveat: COMPANY_MODEL_EVIDENCE_CAVEAT,
    sourceName: "Baidu ERNIE - ERNIE 5.1 release",
    sourceUrl: "https://ernie.baidu.com/blog/posts/ernie-5.1-0508-release/",
    verificationNotes: "Official blog announced ERNIE 5.1 on 2026-05-09.",
    ...OFFICIAL_COMPANY_2026_06_13,
  },
];

export const SAFETY_EVALUATION_RECORDS: SafetyEvaluationRecord[] = [
  {
    id: "nist-caisi-frontier-evaluation-landscape",
    evaluationBody: "NIST Center for AI Standards and Innovation",
    jurisdiction: "United States",
    labIds: [],
    evaluationType: "institute_landscape",
    publicResult: "methodology_only",
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    summary: "U.S. public technical body for AI standards, security, and evaluation science.",
    caveat: INSTITUTE_CAVEAT,
    sourceName: "NIST - Center for AI Standards and Innovation",
    sourceUrl: "https://www.nist.gov/caisi",
    ...OFFICIAL_COMPANY,
  },
  {
    id: "nist-caisi-deepseek-evaluation",
    evaluationBody: "NIST Center for AI Standards and Innovation",
    jurisdiction: "United States",
    labIds: ["deepseek"],
    evaluationType: "government_testing",
    modelOrSystem: "DeepSeek AI models",
    publicResult: "published",
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    summary: "Published CAISI evaluation record for DeepSeek models.",
    caveat: EVALUATION_CAVEAT,
    sourceName: "NIST - CAISI evaluation of DeepSeek AI models",
    sourceUrl: "https://www.nist.gov/document/caisi-evaluation-deepseek-ai-models-report",
    ...OFFICIAL_COMPANY,
  },
  {
    id: "uk-aisi-frontier-trends-testing-landscape",
    evaluationBody: "UK AI Security Institute",
    jurisdiction: "United Kingdom",
    labIds: [],
    evaluationType: "institute_landscape",
    publicResult: "methodology_only",
    domains: ["frontier-gpai", "cybersecurity-critical-infrastructure"],
    summary: "UK public frontier-model testing and evaluation landscape evidence.",
    caveat: INSTITUTE_CAVEAT,
    sourceName: "UK AISI - Frontier AI Trends Report",
    sourceUrl: "https://www.aisi.gov.uk/frontier-ai-trends-report",
    ...OFFICIAL_COMPANY,
  },
  {
    id: "amazon-nova-premier-evaluation-record",
    evaluationBody: "Amazon Science",
    jurisdiction: "United States",
    labIds: ["amazon"],
    evaluationType: "company_evaluation_report",
    modelOrSystem: "Amazon Nova Premier",
    publicResult: "published",
    domains: ["frontier-gpai"],
    summary: "Published critical-risk evaluation report for Nova Premier.",
    caveat: EVALUATION_CAVEAT,
    sourceName: "Amazon Science - Nova Premier critical-risk evaluation",
    sourceUrl:
      "https://www.amazon.science/publications/evaluating-the-critical-risks-of-amazons-nova-premier-under-the-frontier-model-safety-framework",
    ...OFFICIAL_COMPANY,
  },
];

export const INCIDENT_ENFORCEMENT_RECORDS: IncidentEnforcementRecord[] = [
  {
    id: "ftc-operation-ai-comply-2024",
    eventType: "enforcement_action",
    title: "FTC Operation AI Comply",
    jurisdiction: "United States",
    countryIso3: "USA",
    labIds: [],
    date: "2024-09-25",
    status: "public enforcement sweep announced",
    proceduralStage: "announced enforcement actions",
    affectedActorClass: "AI products, AI claims, and AI-enabled deceptive schemes",
    outcomeOrRemedy: "Five law-enforcement actions announced; outcomes vary by matter.",
    officialDocketUrl:
      "https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes",
    domains: ["enforcement-litigation"],
    summary: "FTC enforcement sweep against deceptive AI claims and schemes.",
    caveat: "Enforcement context only; no tracked frontier lab is treated as a target without an official source.",
    sourceName: "FTC - Operation AI Comply",
    sourceUrl:
      "https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes",
    sourceKind: "official",
    verificationStatus: "verified",
    confidence: "high",
    lastVerified: "2026-06-10",
    verificationNotes:
      "Official FTC release announces five law-enforcement actions and states that using AI tools does not exempt firms from existing law.",
    reviewStatus: "editorial_checked",
  },
  {
    id: "ftc-rytr-ai-review-generator-2024",
    eventType: "enforcement_action",
    title: "FTC Rytr AI review-generator proposed order",
    jurisdiction: "United States",
    countryIso3: "USA",
    labIds: [],
    date: "2024-09-25",
    status: "proposed order announced",
    proceduralStage: "FTC administrative complaint and proposed order",
    affectedActorClass: "AI writing assistant provider and review/testimonial generation service",
    outcomeOrRemedy:
      "Proposed order would bar offering a service dedicated or promoted for generating consumer reviews or testimonials.",
    officialDocketUrl:
      "https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes",
    domains: ["synthetic-media", "enforcement-litigation"],
    summary:
      "FTC Operation AI Comply matter alleging that Rytr's AI writing assistant enabled false and deceptive consumer reviews.",
    caveat:
      "Consumer-protection enforcement context; it is not a frontier-lab matter and does not create a new AI-specific statute.",
    sourceName: "FTC - Operation AI Comply / Rytr",
    sourceUrl:
      "https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes",
    verificationNotes:
      "Official FTC release identifies Rytr as an AI writing assistant matter, describes alleged fake-review generation, and summarizes the proposed order.",
    ...OFFICIAL_ENFORCEMENT_2026_06_12,
  },
  {
    id: "ftc-rite-aid-facial-recognition-2024",
    eventType: "enforcement_action",
    title: "FTC Rite Aid facial-recognition order",
    jurisdiction: "United States",
    countryIso3: "USA",
    labIds: [],
    date: "2024-03-08",
    status: "stipulated order filed; case listed as pending on FTC page",
    proceduralStage: "federal court case and FTC stipulated order",
    affectedActorClass: "Retail deployer using facial recognition for security and surveillance",
    outcomeOrRemedy:
      "Five-year prohibition on facial-recognition use for security or surveillance plus automated-system safeguards and information-security obligations.",
    officialDocketUrl:
      "https://www.ftc.gov/legal-library/browse/cases-proceedings/2023190-rite-aid-corporation-ftc-v",
    domains: ["biometric-identification", "enforcement-litigation"],
    summary:
      "FTC case involving Rite Aid's use of facial recognition technology and safeguards for automated biometric systems.",
    caveat:
      "Existing-law enforcement context for biometric AI; no frontier lab is treated as a party or target.",
    sourceName: "FTC - Rite Aid Corporation, FTC v.",
    sourceUrl: "https://www.ftc.gov/legal-library/browse/cases-proceedings/2023190-rite-aid-corporation-ftc-v",
    verificationNotes:
      "Official FTC case page lists the AI/facial-recognition tags, docket details, and case summary describing the five-year facial-recognition prohibition and safeguards.",
    ...OFFICIAL_ENFORCEMENT_2026_06_11,
  },
  {
    id: "sec-ai-washing-investment-advisers-2024",
    eventType: "enforcement_action",
    title: "SEC AI-washing settlements with investment advisers",
    jurisdiction: "United States",
    countryIso3: "USA",
    labIds: [],
    date: "2024-03-18",
    status: "settled charges announced",
    proceduralStage: "SEC settled enforcement actions",
    affectedActorClass: "Investment advisers making AI-use claims",
    outcomeOrRemedy: "$400,000 in total civil penalties across two settling investment advisers.",
    officialDocketUrl: "https://www.sec.gov/newsroom/press-releases/2024-36",
    domains: ["finance", "enforcement-litigation"],
    summary:
      "SEC settled charges against investment advisers for allegedly false and misleading AI-use statements.",
    caveat:
      "Securities-enforcement context for AI claims; it does not establish a general AI-specific statute.",
    sourceName: "SEC - AI-washing investment adviser settlements",
    sourceUrl: "https://www.sec.gov/newsroom/press-releases/2024-36",
    verificationNotes:
      "Official SEC release announces settled charges against Delphia and Global Predictions for false and misleading AI-use statements and total civil penalties.",
    ...OFFICIAL_ENFORCEMENT_2026_06_11,
  },
  {
    id: "ftc-donotpay-ai-lawyer-2025",
    eventType: "enforcement_action",
    title: "FTC DoNotPay AI-lawyer deceptive-claims order",
    jurisdiction: "United States",
    countryIso3: "USA",
    labIds: [],
    date: "2025-02-11",
    status: "final order announced",
    proceduralStage: "FTC final order",
    affectedActorClass: "Consumer AI service making professional-substitution claims",
    outcomeOrRemedy:
      "Order prohibiting deceptive professional-substitution claims, imposing monetary relief, and requiring notice to affected subscribers.",
    officialDocketUrl: "https://www.ftc.gov/legal-library/browse/cases-proceedings/donotpay",
    domains: ["enforcement-litigation"],
    summary:
      "FTC case against DoNotPay over claims that its AI service could substitute for a human lawyer.",
    caveat:
      "Consumer-protection enforcement context; not a general finding about all legal-AI products or frontier labs.",
    sourceName: "FTC - DoNotPay",
    sourceUrl: "https://www.ftc.gov/legal-library/browse/cases-proceedings/donotpay",
    verificationNotes:
      "Official FTC case page describes the AI-lawyer claims, settlement, final order, monetary relief, and notice requirement.",
    ...OFFICIAL_ENFORCEMENT_2026_06_11,
  },
  {
    id: "nl-ap-clearview-ai-fine-2024",
    eventType: "enforcement_action",
    title: "Dutch DPA Clearview AI facial-recognition fine",
    jurisdiction: "Netherlands",
    countryIso3: "NLD",
    labIds: [],
    date: "2024-09-03",
    status: "administrative fine decision published",
    proceduralStage: "Dutch data-protection authority decision",
    affectedActorClass: "Facial-recognition service provider",
    outcomeOrRemedy:
      "Fine decision concerning Clearview AI facial-recognition data collection; exact continuing procedural posture should be checked manually.",
    officialDocketUrl: "https://www.autoriteitpersoonsgegevens.nl/en/documents/decision-fine-clearview-ai",
    domains: ["biometric-identification", "enforcement-litigation"],
    summary:
      "Dutch Data Protection Authority decision concerning Clearview AI's facial-recognition data collection.",
    caveat:
      "Official page can reject automated retrieval; keep as medium confidence until manually spot-checked in the next source review.",
    sourceName: "Dutch Data Protection Authority - Clearview AI fine decision",
    sourceUrl: "https://www.autoriteitpersoonsgegevens.nl/en/documents/decision-fine-clearview-ai",
    verificationNotes:
      "Official Dutch DPA URL was identified by the source report but automated access returned a rejection; row remains medium confidence and should not be used as a frontier-lab legal exposure claim.",
    ...LIKELY_OFFICIAL_ENFORCEMENT_2026_06_11,
  },
  {
    id: "kr-pipc-deepseek-status-examination-2025",
    eventType: "regulator_investigation",
    title: "Korean PIPC DeepSeek status examination",
    jurisdiction: "Republic of Korea",
    countryIso3: "KOR",
    labIds: ["deepseek"],
    date: "2025-04-24",
    status: "recommendations for correction and improvement announced",
    proceduralStage: "PIPC status examination results",
    affectedActorClass: "Foreign generative-AI service provider operating in Korea",
    outcomeOrRemedy:
      "Recommendations on cross-border transfer legal bases, deletion of certain transferred user-entered data, Korean privacy policy disclosure, child-data checks, safeguards, and domestic-agent designation.",
    officialDocketUrl:
      "https://www.pipc.go.kr/eng/user/ltn/new/noticeDetail.do?bbsId=BBSMSTR_000000000001&nttId=2819",
    domains: ["frontier-gpai", "enforcement-litigation"],
    summary:
      "Korean PIPC status-examination results and recommendations concerning DeepSeek's R1 LLM chatbot service in Korea.",
    caveat:
      "Privacy regulator examination and recommendations; legal effect should be read from the official PIPC release and underlying PIPA, not generalized to all frontier labs.",
    sourceName: "PIPC - DeepSeek status examination results",
    sourceUrl: "https://www.pipc.go.kr/eng/user/ltn/new/noticeDetail.do?bbsId=BBSMSTR_000000000001&nttId=2819",
    verificationNotes:
      "Official PIPC release states the commission concluded deliberations on DeepSeek status-examination results and issued recommendations for correction and improvement.",
    ...OFFICIAL_ENFORCEMENT_2026_06_11,
  },
];

export const COMPUTE_DEPENDENCY_RECORDS: ComputeDependencyRecord[] = [
  {
    id: "frontier-labs-advanced-ai-chip-dependency",
    labIds: FRONTIER_LABS.map((lab) => lab.id),
    infrastructureId: "advanced-ai-chips",
    dependencyType: "advanced_chips",
    directness: "indirect",
    strength: 5,
    summary: "Frontier training and inference depend on advanced accelerators and supply chains.",
    caveat: COMPUTE_CAVEAT,
    sourceName: "NVIDIA - H100 Tensor Core GPU",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/",
    sourceKind: "official",
    verificationStatus: "likely_correct",
    confidence: "medium",
    lastVerified: "2026-05-20",
    verificationNotes:
      "Representative advanced-AI accelerator source; row is analytical infrastructure context.",
    reviewStatus: "editorial_checked",
  },
  {
    id: "frontier-labs-hyperscale-cloud-dependency",
    labIds: THIRD_PARTY_CLOUD_DEPENDENT_LABS,
    infrastructureId: "hyperscale-cloud",
    dependencyType: "cloud_platform",
    directness: "indirect",
    strength: 4,
    summary: "Cloud or cloud-adjacent capacity for training, inference, distribution, or enterprise deployment.",
    caveat: COMPUTE_CAVEAT,
    sourceName: "Synergy Research - Cloud market share",
    sourceUrl:
      "https://www.srgresearch.com/articles/q1-cloud-spending-grows-by-over-10-billion-from-2022-the-big-three-account-for-65-of-the-total",
    sourceKind: "secondary",
    verificationStatus: "likely_correct",
    confidence: "medium",
    lastVerified: "2026-05-20",
    verificationNotes:
      "Secondary market source used for cloud-market context only; no legal claim depends on this row.",
    reviewStatus: "editorial_checked",
  },
  {
    id: "chinese-frontier-labs-us-export-control-dependency",
    labIds: CHINESE_LABS,
    infrastructureId: "us-bis-export-controls",
    dependencyType: "export_control",
    jurisdiction: "United States / China",
    directness: "indirect",
    strength: 4,
    summary: "Upstream export-control constraint for Chinese frontier-AI compute access.",
    caveat: "Export-control context, separate from AI-specific legal exposure.",
    sourceName: "U.S. BIS - AI chip controls",
    sourceUrl:
      "https://www.bis.gov/press-release/department-commerce-rescinds-biden-era-artificial-intelligence-diffusion-rule-strengthens-chip-related",
    sourceKind: "official",
    verificationStatus: "likely_correct",
    confidence: "medium",
    lastVerified: "2026-05-20",
    verificationNotes:
      "BIS source verifies export-control context; lab-specific dependency is analytical synthesis.",
    reviewStatus: "editorial_checked",
  },
  {
    id: "us-nairr-public-compute-context",
    labIds: [],
    infrastructureId: "hyperscale-cloud",
    dependencyType: "public_compute",
    jurisdiction: "United States",
    directness: "indirect",
    strength: 2,
    summary: "Public compute-access context for researchers and non-frontier actors.",
    caveat: COMPUTE_CAVEAT,
    sourceName: "NSF - National AI Research Resource Pilot",
    sourceUrl: "https://www.nsf.gov/focus-areas/artificial-intelligence/nairr",
    sourceKind: "official",
    verificationStatus: "likely_correct",
    confidence: "medium",
    lastVerified: "2026-06-07",
    verificationNotes:
      "Official NSF source used for public-compute context; not used for legal map coloring.",
    reviewStatus: "editorial_checked",
  },
];

export const RECORD_CHANGE_LOG_ENTRIES = [
  {
    id: "2026-06-07-lab-intelligence-layer",
    recordId: "lab-intelligence-v1",
    recordKind: "dataset",
    changeType: "added",
    date: "2026-06-07",
    summary: "Added lab-intelligence profiles, evidence rows, compute context, and public endpoints.",
    reviewer: EDITORIAL_REVIEW,
  },
  {
    id: "2026-06-07-context-separation",
    recordId: "lab-intelligence-v1",
    recordKind: "dataset",
    changeType: "manually_verified",
    date: "2026-06-07",
    summary: "Confirmed lab-intelligence rows do not drive binding-law coloring, summaries, or obligation counts.",
    reviewer: EDITORIAL_REVIEW,
  },
  {
    id: "2026-06-13-frontier-lab-model-evidence-sprint",
    recordId: "frontier-lab-intelligence",
    recordKind: "dataset",
    changeType: "added",
    date: "2026-06-13",
    summary:
      "Added official model catalog/release evidence for OpenAI, Anthropic, DeepMind, Meta, xAI, Mistral, Alibaba/Qwen, and Baidu/ERNIE; Tencent deferred.",
    reviewer: {
      ...EDITORIAL_REVIEW,
      reviewDate: "2026-06-13",
      reviewScope:
        "Frontier-lab intelligence sprint for official lab profiles, model-release evidence, and deployment-market context separation.",
      unresolvedCaveats: [
        "Company model pages are issuer-controlled context, not safety certification or legal status.",
        "Tencent Hunyuan evidence was not expanded in this pass because the official page did not expose enough verifiable text in the automated/manual check.",
      ] as string[],
    },
  },
  {
    id: "2026-06-10-ftc-operation-ai-comply-corpus",
    recordId: "ftc-operation-ai-comply-2024",
    recordKind: "incident_enforcement",
    changeType: "changed",
    date: "2026-06-10",
    summary:
      "Expanded the FTC Operation AI Comply row with procedural-stage, affected-actor, outcome/remedy, and corpus-route metadata.",
    reviewer: EDITORIAL_REVIEW,
  },
  {
    id: "2026-06-11-official-enforcement-corpus-expansion",
    recordId: "incident-enforcement-corpus",
    recordKind: "dataset",
    changeType: "added",
    date: "2026-06-11",
    summary:
      "Added official-source enforcement and regulator-action records from the first corpus data expansion sprint.",
    reviewer: {
      ...EDITORIAL_REVIEW,
      reviewDate: "2026-06-11",
      reviewScope:
        "Official regulator/court/docket source checks for enforcement records; media-only allegations excluded.",
    },
  },
  {
    id: "2026-06-12-ftc-rytr-enforcement-corpus",
    recordId: "ftc-rytr-ai-review-generator-2024",
    recordKind: "incident_enforcement",
    changeType: "added",
    date: "2026-06-12",
    summary:
      "Added official FTC Rytr AI-review-generator enforcement context row from Operation AI Comply.",
    reviewer: {
      ...EDITORIAL_REVIEW,
      reviewDate: "2026-06-12",
      reviewScope:
        "Official Corpus Data Expansion Sprint 2 enforcement check; official regulator sources only.",
    },
  },
] as const;

export const LAB_INTELLIGENCE_BY_LAB = Object.fromEntries(
  LAB_INTELLIGENCE_PROFILES.map((profile) => [profile.labId, profile])
) as Record<string, LabIntelligenceProfile>;

export const MODEL_GOVERNANCE_EVIDENCE_BY_LAB = groupByLab(MODEL_GOVERNANCE_EVIDENCE);
export const SAFETY_EVALUATION_RECORDS_BY_LAB = groupByLab(SAFETY_EVALUATION_RECORDS);
export const INCIDENT_ENFORCEMENT_RECORDS_BY_LAB = groupByLab(INCIDENT_ENFORCEMENT_RECORDS);
export const COMPUTE_DEPENDENCY_RECORDS_BY_LAB = groupByLab(COMPUTE_DEPENDENCY_RECORDS);

function groupByLab<T extends { labIds: string[] }>(rows: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  for (const row of rows) {
    for (const labId of row.labIds) {
      (grouped[labId] ??= []).push(row);
    }
  }
  return grouped;
}
