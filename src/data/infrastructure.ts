import type { InfrastructureNode } from "../types";

export const INFRASTRUCTURE_NODES: InfrastructureNode[] = [
  {
    id: "advanced-ai-chips",
    name: "Advanced AI chips",
    sourceKind: "mixed",
    verificationStatus: "likely_correct",
    confidence: "medium",
    lastVerified: "2026-05-20",
    verificationNotes:
      "NVIDIA primary source verifies H100 as a representative advanced AI GPU; broader chip ecosystem and bottleneck assessment are analytical synthesis.",
    type: "chips",
    powerScore: 5,
    description:
      "Leading-edge GPUs and AI accelerators (NVIDIA H100/B200, AMD MI300, Google TPU, custom ASICs from AWS, Meta, Microsoft, Apple). The single hardest bottleneck for frontier model training and inference. Concentrated supply means whoever controls fabrication, exports, and resale routes shapes who can build frontier systems at scale.",
    scopeCaveat:
      "Advanced AI chips are not themselves AI law — they are the material substrate that frontier AI governance constrains via export controls, procurement, and cloud allocation.",
    sourceName: "NVIDIA Data Center GPUs",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/",
  },
  {
    id: "hyperscale-cloud",
    name: "Hyperscale cloud",
    sourceKind: "secondary",
    verificationStatus: "likely_correct",
    confidence: "medium",
    lastVerified: "2026-05-20",
    verificationNotes:
      "Cloud-provider market structure is sourced from a secondary market-analysis provider and should be periodically refreshed.",
    type: "cloud",
    powerScore: 5,
    description:
      "Large cloud providers — AWS, Microsoft Azure, Google Cloud, Alibaba Cloud, Tencent Cloud — that host frontier model training and inference. Their allocation decisions, security baselines, and content moderation policies act as a de-facto governance layer. Provider-side controls (model gating, API rate-limits, jurisdictional routing) operate independently of any treaty.",
    scopeCaveat:
      "Cloud providers are not regulators; they are private actors whose decisions function as governance because they hold scarce capacity.",
    sourceName: "Synergy Research — Cloud market share",
    sourceUrl: "https://www.srgresearch.com/articles/q1-cloud-spending-grows",
  },
  {
    id: "us-bis-export-controls",
    name: "U.S. BIS export controls on advanced computing ICs",
    sourceKind: "official",
    verificationStatus: "likely_correct",
    confidence: "medium",
    lastVerified: "2026-05-20",
    verificationNotes:
      "BIS source verifies the 2025 AI-chip export-control action; this record remains out-of-scope as AI-specific law and is included as frontier-AI infrastructure governance.",
    type: "export_control",
    jurisdiction: "United States",
    hqIso3: "USA",
    powerScore: 5,
    description:
      "Bureau of Industry and Security (BIS) export controls on advanced computing integrated circuits, gradually expanded since 2022 with country-by-country quota and licensing rules. Among the strongest geopolitical levers over frontier AI capacity — operates upstream of any AI-specific national law.",
    scopeCaveat:
      "Not an AI-specific instrument under the strict scope rule. Included here because doc1 (the seed brief) is explicit that this is one of the highest-leverage frontier-AI governance levers, and the assignment is about frontier-AI governance specifically.",
    sourceName: "U.S. BIS — Press release on AI chip controls",
    sourceUrl:
      "https://www.bis.gov/press-release/department-commerce-rescinds-biden-era-artificial-intelligence-diffusion-rule-strengthens-chip-related",
  },
];

export const INFRA_BY_ID: Record<string, InfrastructureNode> =
  INFRASTRUCTURE_NODES.reduce((acc, n) => {
    acc[n.id] = n;
    return acc;
  }, {} as Record<string, InfrastructureNode>);
