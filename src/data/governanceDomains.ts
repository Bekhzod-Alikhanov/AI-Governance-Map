import type { GovernanceDomain, GovernanceDomainId } from "../types";

export const GOVERNANCE_DOMAINS: GovernanceDomain[] = [
  {
    id: "frontier-gpai",
    label: "Frontier / GPAI",
    description: "General-purpose and frontier-model governance, including safety frameworks and GPAI obligations.",
  },
  {
    id: "public-sector",
    label: "Public sector",
    description: "Rules or guidance for government use, procurement, transparency, and public-service deployment.",
  },
  {
    id: "employment-hiring",
    label: "Employment / hiring",
    description: "Automated employment decision tools, hiring audits, and worker-facing AI disclosures.",
  },
  {
    id: "biometric-identification",
    label: "Biometric identification",
    description: "Remote biometric identification, biometric categorisation, and related high-risk uses.",
  },
  {
    id: "synthetic-media",
    label: "Synthetic media",
    description: "Deepfakes, generated content, provenance, watermarking, labelling, and notice-and-removal regimes.",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description: "AI systems deployed in medical, health, or care settings.",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Financial-services AI governance, algorithmic risk, and consumer-facing financial decisions.",
  },
  {
    id: "education-children",
    label: "Education / children",
    description: "AI uses affecting education, students, children, and youth.",
  },
  {
    id: "defense-autonomous-weapons",
    label: "Defense / autonomous weapons",
    description: "Military AI, autonomous weapons, and defense-sector AI governance.",
  },
  {
    id: "cybersecurity-critical-infrastructure",
    label: "Cybersecurity / critical infrastructure",
    description: "Security duties, critical infrastructure, resilience, and cyber-risk controls for AI systems.",
  },
  {
    id: "compute-cloud-chips",
    label: "Compute / cloud / chips",
    description: "AI compute, hyperscale cloud, export controls, chips, and infrastructure bottlenecks.",
  },
  {
    id: "standards-conformity",
    label: "Standards / conformity",
    description: "AI standards, harmonized standards, conformity assessment, assurance, and certification context.",
  },
  {
    id: "public-procurement",
    label: "Public procurement",
    description: "AI procurement, public purchasing rules, vendor assurance, and government acquisition controls.",
  },
  {
    id: "enforcement-litigation",
    label: "Enforcement / litigation",
    description: "Observed enforcement, litigation, complaints, regulator decisions, and implementation actions.",
  },
];

export const GOVERNANCE_DOMAIN_BY_ID: Record<GovernanceDomainId, GovernanceDomain> =
  GOVERNANCE_DOMAINS.reduce(
    (acc, domain) => {
      acc[domain.id] = domain;
      return acc;
    },
    {} as Record<GovernanceDomainId, GovernanceDomain>
  );
