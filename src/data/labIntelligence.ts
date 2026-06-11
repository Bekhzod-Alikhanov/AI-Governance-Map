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

const ISSUER_CONTROLLED_CONTEXT = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
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
  deepseek: ["CHN"],
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
    id: "2026-06-10-ftc-operation-ai-comply-corpus",
    recordId: "ftc-operation-ai-comply-2024",
    recordKind: "incident_enforcement",
    changeType: "changed",
    date: "2026-06-10",
    summary:
      "Expanded the FTC Operation AI Comply row with procedural-stage, affected-actor, outcome/remedy, and corpus-route metadata.",
    reviewer: EDITORIAL_REVIEW,
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
