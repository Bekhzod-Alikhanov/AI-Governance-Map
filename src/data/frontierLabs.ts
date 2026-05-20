import type { FrontierLab } from "../types";

const LAB_SOURCE_METADATA = {
  sourceKind: "official",
  verificationStatus: "likely_correct",
  confidence: "medium",
  lastVerified: "2026-05-20",
  verificationNotes:
    "Primary company source checked for model or safety-framework reference; frontier-lab inclusion, HQ treatment, and power score remain methodology judgments.",
} satisfies Pick<
  FrontierLab,
  "sourceKind" | "verificationStatus" | "confidence" | "lastVerified" | "verificationNotes"
>;

export const FRONTIER_LABS: FrontierLab[] = [
  {
    id: "openai",
    name: "OpenAI",
    ...LAB_SOURCE_METADATA,
    hqIso3: "USA",
    hqCountryName: "United States",
    flagshipModels: ["GPT-5.x", "GPT-5.4 / 5.5", "o-series"],
    safetyFramework: {
      name: "Preparedness Framework",
      maturity: "published",
      sourceName: "OpenAI — Preparedness Framework",
      sourceUrl: "https://openai.com/index/updating-our-preparedness-framework/",
    },
    isFMFMember: true,
    regulatoryExposureIds: ["eu-ai-act", "us-nist-ai-rmf", "us-caisi"],
    powerScore: 5,
    summary:
      "One of the most consequential frontier-model developers. Sets pre-deployment evaluation policy, capability thresholds, and rollout controls via the Preparedness Framework.",
    sourceName: "OpenAI — Models index",
    sourceUrl: "https://developers.openai.com/api/docs/models/all",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    ...LAB_SOURCE_METADATA,
    hqIso3: "USA",
    hqCountryName: "United States",
    flagshipModels: ["Claude 4 family", "Claude Opus line"],
    safetyFramework: {
      name: "Responsible Scaling Policy",
      maturity: "published",
      sourceName: "Anthropic — Responsible Scaling Policy",
      sourceUrl: "https://www.anthropic.com/news/anthropics-responsible-scaling-policy",
    },
    isFMFMember: true,
    regulatoryExposureIds: ["eu-ai-act", "us-nist-ai-rmf", "us-caisi", "uk-ai-security-institute"],
    powerScore: 5,
    summary:
      "Leading frontier model lab whose safety-policy work strongly shapes industry expectations. RSP ties capability thresholds to deployment commitments.",
    sourceName: "Anthropic — Claude 4 announcement",
    sourceUrl: "https://www.anthropic.com/news/claude-4",
  },
  {
    id: "google-deepmind",
    name: "Google DeepMind",
    ...LAB_SOURCE_METADATA,
    hqIso3: "USA",
    hqCountryName: "United States",
    flagshipModels: ["Gemini family"],
    safetyFramework: {
      name: "Frontier Safety Framework",
      maturity: "published",
      sourceName: "Google DeepMind — Frontier Safety Framework",
      sourceUrl: "https://deepmind.google/discover/blog/introducing-the-frontier-safety-framework/",
    },
    isFMFMember: true,
    regulatoryExposureIds: ["eu-ai-act", "us-nist-ai-rmf"],
    powerScore: 5,
    summary:
      "Vertically integrated frontier developer combining model R&D, cloud (Google Cloud / TPUs), and search-scale deployment.",
    sourceName: "DeepMind — Model cards",
    sourceUrl: "https://deepmind.google/models/model-cards/",
  },
  {
    id: "meta",
    name: "Meta",
    ...LAB_SOURCE_METADATA,
    hqIso3: "USA",
    hqCountryName: "United States",
    flagshipModels: ["Llama family"],
    safetyFramework: {
      name: "Advanced AI Scaling Framework",
      maturity: "published",
      sourceName: "Meta — Advanced AI Scaling Framework v2",
      sourceUrl: "https://ai.meta.com/static-resource/Meta_Advanced-AI-Scaling-Framework-v2",
    },
    isFMFMember: true,
    regulatoryExposureIds: ["eu-ai-act", "us-nist-ai-rmf"],
    powerScore: 5,
    summary:
      "Top model developer whose open-weight Llama releases shape the global frontier ecosystem and policy debates on diffusion.",
    sourceName: "Meta AI — Llama",
    sourceUrl: "https://ai.meta.com/llama/",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    ...LAB_SOURCE_METADATA,
    hqIso3: "USA",
    hqCountryName: "United States",
    flagshipModels: ["Phi family", "Azure AI stack"],
    safetyFramework: {
      name: "Frontier Governance Framework",
      maturity: "published",
      sourceName: "Microsoft — Frontier Governance Framework",
      sourceUrl: "https://blogs.microsoft.com/on-the-issues/2024/05/01/responsible-ai-transparency-report/",
    },
    isFMFMember: true,
    regulatoryExposureIds: ["eu-ai-act", "us-nist-ai-rmf"],
    powerScore: 5,
    summary:
      "Major AI company and cloud gatekeeper (Azure). Combines own model family (Phi) with deep OpenAI partnership and platform reach.",
    sourceName: "Microsoft — Azure Phi",
    sourceUrl: "https://azure.microsoft.com/en-us/products/phi/",
  },
  {
    id: "amazon",
    name: "Amazon",
    ...LAB_SOURCE_METADATA,
    hqIso3: "USA",
    hqCountryName: "United States",
    flagshipModels: ["Nova family"],
    safetyFramework: {
      name: "Frontier Model Safety Framework",
      maturity: "published",
      sourceName: "Amazon — Frontier Model Safety Framework",
      sourceUrl: "https://www.aboutamazon.com/news/aws/amazon-nova-frontier-model-safety-framework",
    },
    isFMFMember: true,
    regulatoryExposureIds: ["eu-ai-act", "us-nist-ai-rmf"],
    powerScore: 5,
    summary:
      "Major AI company and infrastructure provider (AWS, custom Trainium / Inferentia chips). Hosts most non-Microsoft frontier inference.",
    sourceName: "Amazon — Nova",
    sourceUrl: "https://www.aboutamazon.com/news/aws/amazon-nova-foundation-models-guide",
  },
  {
    id: "xai",
    name: "xAI",
    ...LAB_SOURCE_METADATA,
    hqIso3: "USA",
    hqCountryName: "United States",
    flagshipModels: ["Grok 3"],
    safetyFramework: {
      name: "Risk Management Framework",
      maturity: "published",
      sourceName: "xAI — Risk Management Framework",
      sourceUrl: "https://x.ai/news/grok-3",
    },
    isFMFMember: false,
    regulatoryExposureIds: ["eu-ai-act", "us-nist-ai-rmf"],
    powerScore: 4,
    summary:
      "Fast-rising frontier developer behind the Grok line; large compute footprint via the Colossus supercluster.",
    sourceName: "xAI — Grok 3",
    sourceUrl: "https://x.ai/news/grok-3",
  },
  {
    id: "mistral",
    name: "Mistral",
    ...LAB_SOURCE_METADATA,
    hqIso3: "FRA",
    hqCountryName: "France",
    flagshipModels: ["Mistral Large 3", "Mistral Medium 3.5", "Le Chat"],
    safetyFramework: {
      name: "Trust & compliance posture (EU AI Act compliance hub)",
      maturity: "internal",
      sourceName: "Mistral AI",
      sourceUrl: "https://mistral.ai/models",
    },
    isFMFMember: false,
    regulatoryExposureIds: ["eu-ai-act", "it-law-132-2025", "fr-ai-for-humanity"],
    powerScore: 4,
    summary:
      "Leading European frontier-model company. Strong open-weight and enterprise positioning; direct EU AI Act exposure.",
    sourceName: "Mistral — Models",
    sourceUrl: "https://mistral.ai/models",
  },
  {
    id: "cohere",
    name: "Cohere",
    ...LAB_SOURCE_METADATA,
    hqIso3: "CAN",
    hqCountryName: "Canada",
    flagshipModels: ["Command A", "Enterprise stack"],
    safetyFramework: {
      name: "Secure AI Frontier Model Framework",
      maturity: "published",
      sourceName: "Cohere — Secure AI Frontier Model Framework",
      sourceUrl: "https://cohere.com/security/frontier-model-framework",
    },
    isFMFMember: false,
    regulatoryExposureIds: ["eu-ai-act", "ca-voluntary-code-genai", "ca-aisi"],
    powerScore: 3,
    summary:
      "Enterprise-oriented model company. Linked to the Seoul 2024 Frontier AI Safety Commitments via its security framework.",
    sourceName: "Cohere — Command",
    sourceUrl: "https://cohere.com/command",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    ...LAB_SOURCE_METADATA,
    hqIso3: "CHN",
    hqCountryName: "China",
    flagshipModels: ["DeepSeek-R1", "DeepSeek-V3"],
    safetyFramework: {
      name: "Usage restrictions / ToS",
      maturity: "internal",
      sourceName: "DeepSeek — Terms of Use",
      sourceUrl: "https://api-docs.deepseek.com/news/news250120",
    },
    isFMFMember: false,
    regulatoryExposureIds: ["cn-genai-interim-measures", "cn-ai-content-labeling"],
    powerScore: 4,
    summary:
      "Major Chinese frontier-model developer whose open releases have had outsized global impact and triggered renewed compute-policy debate.",
    sourceName: "DeepSeek — API docs",
    sourceUrl: "https://api-docs.deepseek.com/news/news250120",
  },
  {
    id: "baidu",
    name: "Baidu",
    ...LAB_SOURCE_METADATA,
    hqIso3: "CHN",
    hqCountryName: "China",
    flagshipModels: ["ERNIE 5.1", "ERNIE 4.5"],
    safetyFramework: {
      name: "Self-discipline / responsible AI principles",
      maturity: "internal",
      sourceName: "Baidu ERNIE — Release notes",
      sourceUrl: "https://ernie.baidu.com/blog/posts/ernie-5.1-0508-release/",
    },
    isFMFMember: false,
    regulatoryExposureIds: ["cn-genai-interim-measures", "cn-deep-synthesis", "cn-algorithm-recommendation"],
    powerScore: 4,
    summary:
      "Major Chinese AI company with the ERNIE family and large internal cloud / platform deployment.",
    sourceName: "Baidu — ERNIE",
    sourceUrl: "https://ernie.baidu.com/blog/posts/ernie-5.1-0508-release/",
  },
  {
    id: "alibaba",
    name: "Alibaba",
    ...LAB_SOURCE_METADATA,
    hqIso3: "CHN",
    hqCountryName: "China",
    flagshipModels: ["Qwen 3", "Qwen-Plus"],
    safetyFramework: {
      name: "AI Guardrails + Qwen3Guard",
      maturity: "published",
      sourceName: "Alibaba Cloud — Qwen3",
      sourceUrl: "https://www.alibabacloud.com/en/press-room/alibaba-introduces-qwen3-setting-new-benchmark?_p_lc=1",
    },
    isFMFMember: false,
    regulatoryExposureIds: ["cn-genai-interim-measures", "cn-algorithm-recommendation"],
    powerScore: 4,
    summary:
      "Couples the Qwen models with significant Alibaba Cloud and enterprise deployment power — model provider and infrastructure actor simultaneously.",
    sourceName: "Alibaba Cloud — Press room",
    sourceUrl: "https://www.alibabacloud.com/en/press-room/alibaba-introduces-qwen3-setting-new-benchmark?_p_lc=1",
  },
  {
    id: "tencent",
    name: "Tencent",
    ...LAB_SOURCE_METADATA,
    hqIso3: "CHN",
    hqCountryName: "China",
    flagshipModels: ["Hunyuan / Hy family"],
    safetyFramework: {
      name: "Responsible AI principles / internal risk governance",
      maturity: "internal",
      sourceName: "Tencent Hunyuan",
      sourceUrl: "https://hunyuan.tencent.com/",
    },
    isFMFMember: false,
    regulatoryExposureIds: ["cn-genai-interim-measures", "cn-deep-synthesis", "cn-algorithm-recommendation"],
    powerScore: 4,
    summary:
      "Develops Hunyuan alongside major social-platform and cloud distribution power. Subject to China's CAC-led rule stack.",
    sourceName: "Tencent — Hunyuan",
    sourceUrl: "https://hunyuan.tencent.com/",
  },
];

export const LAB_BY_ID: Record<string, FrontierLab> = FRONTIER_LABS.reduce(
  (acc, lab) => {
    acc[lab.id] = lab;
    return acc;
  },
  {} as Record<string, FrontierLab>
);

export function getLabsByHqIso3(iso3: string): FrontierLab[] {
  return FRONTIER_LABS.filter((l) => l.hqIso3 === iso3);
}
