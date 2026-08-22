import type {
  FilterState,
  WorkbenchState,
  WorkbenchQuestion,
  WorkbenchQuestionCategory,
} from "../types";
import { DEFAULT_FILTER_STATE, DEFAULT_WORKBENCH_STATE } from "../types";

export const WORKBENCH_QUESTION_CATEGORY_LABELS: Record<WorkbenchQuestionCategory, string> = {
  "legal-duties": "Legal duties",
  implementation: "Implementation",
  treaties: "Treaties",
  "frontier-labs": "Frontier labs",
  "sector-rules": "Sector rules",
  "context-evidence": "Context & evidence",
};

function question(
  value: Omit<WorkbenchQuestion, "categoryLabel">,
): WorkbenchQuestion {
  return {
    ...value,
    categoryLabel: WORKBENCH_QUESTION_CATEGORY_LABELS[value.category],
  };
}

export const WORKBENCH_QUESTIONS: WorkbenchQuestion[] = [
  question({
    id: "binding-duties-by-jurisdiction",
    title: "Which countries have binding AI duties?",
    detail: "Show confirmed binding-law countries and source-backed binding obligations.",
    category: "legal-duties",
    featured: true,
    patch: { hasBindingNationalLaw: "yes" },
    compareItems: [
      { kind: "country", id: "EUU" },
      { kind: "country", id: "CHN" },
      { kind: "country", id: "KOR" },
    ],
    answerCardId: "binding-obligations",
  }),
  question({
    id: "incident-reporting",
    title: "Who requires incident reporting?",
    detail: "Filter the obligation matrix to incident-reporting duties.",
    category: "legal-duties",
    featured: true,
    patch: { selectedObligationCategories: ["incident_reporting"] },
    compareItems: [
      { kind: "obligation", id: "ca-sb-53-incident-reporting" },
      { kind: "rule", id: "us-ca-sb-53-frontier" },
    ],
    answerCardId: "binding-obligations",
  }),
  question({
    id: "model-evaluation",
    title: "Who mentions model evaluation?",
    detail: "Focus on evaluation, testing, and red-team style obligations.",
    category: "legal-duties",
    featured: false,
    patch: { selectedObligationCategories: ["model_evaluation_red_teaming"] },
    answerCardId: "binding-obligations",
  }),
  question({
    id: "coe-signed-ratified",
    title: "CoE signed vs ratified?",
    detail: "Separate signature, ratification, and EU applicability.",
    category: "treaties",
    featured: true,
    patch: {
      selectedInstrumentIds: ["coe-ai-convention"],
      selectedParticipationTypes: ["signed", "ratified", "applicable_via_eu"],
    },
    compareItems: [{ kind: "instrument", id: "coe-ai-convention" }],
    answerCardId: "coe-participation",
  }),
  question({
    id: "eu-act-vs-national-law",
    title: "EU AI Act vs national enactment?",
    detail: "Compare regional applicability with country implementation activity.",
    category: "implementation",
    featured: true,
    patch: {
      selectedDomains: ["frontier-gpai"],
      selectedImplementationStatuses: ["phased_application", "regulator_appointed", "implementing_rules_pending"],
    },
    compareItems: [
      { kind: "rule", id: "eu-ai-act-regional" },
      { kind: "rule", id: "it-law-132-2025" },
      { kind: "rule", id: "si-eu-ai-act-implementation-2025" },
    ],
    answerCardId: "implementation",
  }),
  question({
    id: "frontier-lab-binding-exposure",
    title: "Which labs face binding exposure?",
    detail: "Compare binding and conditional lab exposure rows.",
    category: "frontier-labs",
    featured: true,
    patch: { frontierAIRelevant: "yes", selectedDomains: ["frontier-gpai"] },
    compareItems: [
      { kind: "lab", id: "openai" },
      { kind: "lab", id: "google-deepmind" },
      { kind: "exposure", id: "openai--market_access--eu-ai-act-regional" },
    ],
    scenario: { labId: "openai", markets: ["EUU", "USA", "GBR", "KOR"] },
    answerCardId: "lab-exposure",
  }),
  question({
    id: "labs-with-safety-frameworks",
    title: "Which labs publish safety frameworks?",
    detail: "Open the Lab Board and compare public framework and commitment evidence.",
    category: "frontier-labs",
    featured: false,
    patch: { frontierAIRelevant: "yes", selectedDomains: ["frontier-gpai"] },
    compareItems: [
      { kind: "lab", id: "openai" },
      { kind: "lab", id: "anthropic" },
      { kind: "lab", id: "google-deepmind" },
    ],
    answerCardId: "lab-safety-evidence",
  }),
  question({
    id: "government-evaluation-exposure",
    title: "Where is government evaluation evidence visible?",
    detail: "Compare safety-institute and public evaluation evidence without treating it as binding law.",
    category: "frontier-labs",
    featured: false,
    patch: { frontierAIRelevant: "yes", selectedDomains: ["frontier-gpai", "cybersecurity-critical-infrastructure"] },
    compareItems: [
      { kind: "lab", id: "deepseek" },
      { kind: "lab", id: "amazon" },
    ],
    answerCardId: "safety-evaluations",
  }),
  question({
    id: "china-synthetic-media",
    title: "China synthetic-media stack?",
    detail: "Compare GenAI, deep synthesis, algorithmic recommendation, and labeling hooks.",
    category: "sector-rules",
    featured: false,
    patch: { selectedRegions: ["East Asia"], selectedDomains: ["synthetic-media", "frontier-gpai"] },
    compareItems: [
      { kind: "rule", id: "cn-genai-interim-measures" },
      { kind: "rule", id: "cn-deep-synthesis" },
      { kind: "rule", id: "cn-ai-content-labeling" },
    ],
    answerCardId: "binding-obligations",
  }),
  question({
    id: "high-readiness-weak-law",
    title: "High readiness, weak confirmed law?",
    detail: "Use Oxford readiness context while keeping legal status separate.",
    category: "context-evidence",
    featured: false,
    patch: {},
    atlasPresetId: "high-readiness-no-binding",
    compareItems: [
      { kind: "country", id: "USA" },
      { kind: "country", id: "GBR" },
      { kind: "country", id: "CAN" },
    ],
    answerCardId: "current-scope",
  }),
  question({
    id: "unesco-ram-available",
    title: "Where is UNESCO RAM activity visible?",
    detail: "Show completed or in-process RAM/profile activity.",
    category: "context-evidence",
    featured: false,
    patch: {},
    atlasPresetId: "ram-activity",
    answerCardId: "current-scope",
  }),
  question({
    id: "standards-soft-law",
    title: "Which standards and soft-law instruments matter?",
    detail: "Separate standards, guidance, and voluntary commitments from binding law.",
    category: "context-evidence",
    featured: false,
    patch: { selectedBindingStatuses: ["standard", "voluntary", "political_guidance"] },
    compareItems: [
      { kind: "instrument", id: "iso-iec-42001-2023" },
      { kind: "instrument", id: "nist-genai-profile" },
      { kind: "instrument", id: "seoul-frontier-ai-safety-commitments" },
    ],
    answerCardId: "lab-exposure",
  }),
  question({
    id: "implementation-deadlines",
    title: "What deadlines are next?",
    detail: "Focus on phased application and next implementation milestones.",
    category: "implementation",
    featured: true,
    patch: { selectedImplementationStatuses: ["phased_application", "implementing_rules_pending"] },
    answerCardId: "implementation",
  }),
  question({
    id: "employment-ai",
    title: "What employment AI rules exist?",
    detail: "Filter employment/hiring obligations and subnational rows.",
    category: "sector-rules",
    featured: false,
    patch: { selectedDomains: ["employment-hiring"] },
    compareItems: [
      { kind: "rule", id: "us-nyc-local-law-144" },
      { kind: "rule", id: "us-il-aivia" },
    ],
    answerCardId: "current-scope",
  }),
  question({
    id: "biometrics",
    title: "Where are biometric restrictions tracked?",
    detail: "Focus on biometric-identification obligations and restrictions.",
    category: "sector-rules",
    featured: false,
    patch: { selectedDomains: ["biometric-identification"] },
    answerCardId: "binding-obligations",
  }),
  question({
    id: "healthcare-ai",
    title: "Which healthcare AI hooks are tracked?",
    detail: "Filter healthcare-domain obligations and rules.",
    category: "sector-rules",
    featured: false,
    patch: { selectedDomains: ["healthcare"] },
    answerCardId: "current-scope",
  }),
  question({
    id: "compute-dependencies",
    title: "Where do compute constraints matter?",
    detail: "Show compute, chip, cloud, and export-control dependency context.",
    category: "frontier-labs",
    featured: false,
    patch: { selectedDomains: ["compute-cloud-chips"] },
    compareItems: [
      { kind: "exposure", id: "deepseek--export_control_dependency--us-bis-export-controls" },
      { kind: "lab", id: "deepseek" },
    ],
    answerCardId: "lab-exposure",
  }),
  question({
    id: "source-confidence",
    title: "Which claims are highest confidence?",
    detail: "Use source metadata rather than legal-effect labels alone.",
    category: "context-evidence",
    featured: false,
    patch: { frontierAIRelevant: "yes" },
    answerCardId: "current-scope",
  }),
  question({
    id: "proposed-laws",
    title: "Which proposed laws should I watch?",
    detail: "Show proposed national AI law rows and implementation planning.",
    category: "implementation",
    featured: false,
    patch: { hasBindingNationalLaw: "no", selectedImplementationStatuses: ["proposed", "implementing_rules_pending"] },
    answerCardId: "proposed-laws",
  }),
  question({
    id: "gpai-market-access",
    title: "How does GPAI market access work?",
    detail: "Compare conditional exposure for EU-facing GPAI providers.",
    category: "frontier-labs",
    featured: false,
    patch: { selectedDomains: ["frontier-gpai"] },
    compareItems: [
      { kind: "exposure", id: "openai--market_access--eu-ai-act-regional" },
      { kind: "exposure", id: "anthropic--market_access--eu-ai-act-regional" },
      { kind: "exposure", id: "google-deepmind--market_access--eu-ai-act-regional" },
    ],
    answerCardId: "lab-exposure",
  }),
  question({
    id: "public-sector-ai",
    title: "Where is public-sector AI governance visible?",
    detail: "Filter public-sector obligations and registry-context records.",
    category: "sector-rules",
    featured: false,
    patch: { selectedDomains: ["public-sector"] },
    answerCardId: "current-scope",
  }),
  question({
    id: "citation-brief",
    title: "What can I cite quickly?",
    detail: "Compare source-backed records and open evidence dossiers.",
    category: "context-evidence",
    featured: false,
    patch: {},
    compareItems: [
      { kind: "country", id: "EUU" },
      { kind: "instrument", id: "eu-ai-act" },
      { kind: "obligation", id: "eu-ai-act-transparency-disclosure" },
    ],
    answerCardId: "binding-obligations",
  }),
];

export const FEATURED_WORKBENCH_QUESTIONS = WORKBENCH_QUESTIONS.filter(
  (item) => item.featured,
);

export const WORKBENCH_QUESTION_BY_ID = Object.fromEntries(
  WORKBENCH_QUESTIONS.map((item) => [item.id, item]),
) as Record<string, WorkbenchQuestion>;

export function getWorkbenchQuestion(id: string | null | undefined): WorkbenchQuestion {
  return WORKBENCH_QUESTION_BY_ID[id ?? ""] ?? WORKBENCH_QUESTIONS[0];
}

export function getQuestionEffectiveFilters(id: string | null | undefined): FilterState {
  return { ...DEFAULT_FILTER_STATE, ...getWorkbenchQuestion(id).patch };
}

export function getQuestionWorkbenchState(id: string | null | undefined): WorkbenchState {
  const item = getWorkbenchQuestion(id);
  const first = item.compareItems?.[0];
  return {
    ...DEFAULT_WORKBENCH_STATE,
    compareKind: first?.kind ?? DEFAULT_WORKBENCH_STATE.compareKind,
    compareId: first?.id ?? DEFAULT_WORKBENCH_STATE.compareId,
    compareItems: item.compareItems ?? [],
    scenarioLabId: item.scenario?.labId ?? DEFAULT_WORKBENCH_STATE.scenarioLabId,
    scenarioMarkets: item.scenario?.markets ?? DEFAULT_WORKBENCH_STATE.scenarioMarkets,
    atlasPresetId: item.atlasPresetId ?? DEFAULT_WORKBENCH_STATE.atlasPresetId,
    activeQuestionId: item.id,
    activeAnswerCardId: item.answerCardId ?? null,
  };
}
