import type { ImplementationMilestone, ImplementationStatus } from "../types";

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

export const IMPLEMENTATION_STATUS_LABELS: Record<ImplementationStatus, string> = {
  proposed: "Proposed",
  adopted: "Adopted",
  in_force: "In force",
  phased_application: "Phased application",
  implementing_rules_pending: "Implementing rules pending",
  regulator_appointed: "Regulator appointed",
  guidance_issued: "Guidance issued",
  enforcement_activity_observed: "Enforcement activity observed",
};

export const IMPLEMENTATION_MILESTONES: ImplementationMilestone[] = [
  {
    id: "eu-ai-act-entered-force",
    parentType: "international_instrument",
    parentId: "eu-ai-act",
    jurisdiction: "European Union",
    status: "in_force",
    date: "2024-08-01",
    label: "EU AI Act entered into force",
    summary:
      "Regulation (EU) 2024/1689 entered into force on 1 August 2024, with phased application after that date.",
    sourceName: "EUR-Lex - Regulation (EU) 2024/1689",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ...VERIFIED,
  },
  {
    id: "eu-ai-act-phased-application",
    parentType: "international_instrument",
    parentId: "eu-ai-act",
    jurisdiction: "European Union",
    status: "phased_application",
    date: "2024-08-01",
    nextDeadline: "2026-08-02",
    label: "EU AI Act phased application",
    summary:
      "The Act applies through phased deadlines; the next broad deadline tracked here is 2 August 2026.",
    sourceName: "EUR-Lex - Regulation (EU) 2024/1689",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng",
    ...VERIFIED,
    verificationNotes:
      "This milestone intentionally uses a broad next-deadline cue. Detailed article-by-article deadlines should be added as separate rows before legal reliance.",
  },
  {
    id: "coe-ai-convention-not-in-force",
    parentType: "international_instrument",
    parentId: "coe-ai-convention",
    jurisdiction: "Council of Europe parties",
    status: "adopted",
    date: "2024-05-17",
    label: "CoE AI Convention adopted; not yet in force in snapshot",
    summary:
      "The Convention was adopted and opened for signature, but the snapshot notes that entry-into-force conditions had not yet been met.",
    sourceName: "Council of Europe - Framework Convention on Artificial Intelligence",
    sourceUrl: "https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence",
    ...VERIFIED,
  },
  {
    id: "kr-ai-basic-act-application",
    parentType: "national_rule",
    parentId: "kr-ai-basic-act",
    jurisdiction: "South Korea",
    status: "phased_application",
    date: "2025-01-21",
    nextDeadline: "2026-01-22",
    label: "Korea AI Basic Act adopted; application begins in 2026",
    summary:
      "Korea's AI Basic Act is tracked as adopted with application beginning in 2026.",
    sourceName: "MSIT - AI Basic Act",
    sourceUrl: "https://www.msit.go.kr/eng/bbs/view.do?bbsSeqNo=42&mId=4&mPid=2&nttSeqNo=1214&sCode=eng",
    ...VERIFIED,
  },
  {
    id: "cn-genai-measures-in-force",
    parentType: "national_rule",
    parentId: "cn-genai-interim-measures",
    jurisdiction: "China",
    status: "in_force",
    date: "2023-08-15",
    label: "China generative-AI measures in force",
    summary:
      "China's Interim Measures for generative-AI services are tracked as in force for public-facing generative-AI services.",
    sourceName: "CAC - Interim Measures for Generative AI Services",
    sourceUrl: "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm",
    ...VERIFIED,
  },
  {
    id: "ca-sb-53-in-force",
    parentType: "subnational_rule",
    parentId: "us-ca-sb-53-frontier",
    jurisdiction: "California",
    status: "in_force",
    date: "2025-09-29",
    label: "California SB 53 signed",
    summary:
      "California SB 53 is tracked as a binding state-level frontier-AI transparency law after signing.",
    sourceName: "California Legislature - SB 53",
    sourceUrl: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB53",
    ...VERIFIED,
  },
  {
    id: "br-ai-bill-proposed",
    parentType: "national_rule",
    parentId: "br-ai-bill-2338",
    jurisdiction: "Brazil",
    status: "proposed",
    date: "2023-05-03",
    label: "Brazil PL 2338/2023 under consideration",
    summary:
      "Brazil's AI framework bill remains tracked as proposed until enactment is verified.",
    sourceName: "Federal Senate of Brazil - PL 2338/2023",
    sourceUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/157233",
    ...LIKELY,
  },
  {
    id: "tr-ai-draft-proposed",
    parentType: "national_rule",
    parentId: "tr-ai-law-draft",
    jurisdiction: "Türkiye",
    status: "proposed",
    date: "2024-06-24",
    label: "Türkiye draft AI law under consideration",
    summary:
      "Türkiye's draft AI law remains tracked as proposed pending official enactment.",
    sourceName: "Grand National Assembly of Türkiye - Draft AI Law",
    sourceUrl: "https://www.tbmm.gov.tr/Yasama/KanunTeklifi/e21539a0-888a-4500-81be-01904a918c53",
    ...LIKELY,
  },
  {
    id: "mx-ai-law-proposed",
    parentType: "national_rule",
    parentId: "mx-federal-ai-law-proposed",
    jurisdiction: "Mexico",
    status: "proposed",
    date: "2024-05-01",
    label: "Mexico federal AI proposal tracked",
    summary:
      "Mexico's federal AI proposal is retained as proposed and not counted as binding law.",
    sourceName: "Mexico SIL - AI bill follow-up",
    sourceUrl:
      "https://sil.gobernacion.gob.mx/Librerias/pp_ReporteSeguimiento.php?Asunto=4729480&Seguimiento=4740725",
    ...LIKELY,
  },
  {
    id: "no-ai-act-consultation-proposed",
    parentType: "national_rule",
    parentId: "no-ai-act-draft-2025",
    jurisdiction: "Norway",
    status: "proposed",
    date: "2025-06-01",
    label: "Norway AI Act implementation consultation",
    summary:
      "Norway is tracked as proposed/implementation planning for EEA alignment with the EU AI Act.",
    sourceName: "Norwegian Government - AI Act consultation",
    sourceUrl: "https://www.regjeringen.no/id3112327/",
    ...LIKELY,
  },
];

export const IMPLEMENTATION_BY_PARENT = IMPLEMENTATION_MILESTONES.reduce(
  (acc, milestone) => {
    const key = `${milestone.parentType}:${milestone.parentId}`;
    (acc[key] ??= []).push(milestone);
    return acc;
  },
  {} as Record<string, ImplementationMilestone[]>
);

export function getImplementationForParent(parentType: ImplementationMilestone["parentType"], parentId: string) {
  return IMPLEMENTATION_BY_PARENT[`${parentType}:${parentId}`] ?? [];
}
