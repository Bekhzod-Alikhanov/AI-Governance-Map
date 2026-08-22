import { useMemo, useState } from "react";
import clsx from "clsx";
import { COUNTRIES, COUNTRY_BY_ISO3 } from "../data/countries";
import { FRONTIER_LABS, LAB_BY_ID } from "../data/frontierLabs";
import {
  GOVERNANCE_OBLIGATIONS,
  OBLIGATION_BY_ID,
  OBLIGATION_CATEGORY_LABELS,
} from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES, IMPLEMENTATION_STATUS_LABELS } from "../data/implementationMilestones";
import { INTERNATIONAL_INSTRUMENTS, INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { LAB_REGULATORY_EXPOSURES } from "../data/labRegulatoryExposures";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { PARTICIPATION_BY_INSTRUMENT } from "../data/participation";
import { SUBNATIONAL_AI_RULES, SUBNATIONAL_BY_ID } from "../data/subnationalRules";
import {
  DEFAULT_FILTER_STATE,
  DEFAULT_WORKBENCH_STATE,
  type AtlasPresetId,
  type FilterState,
  type MapModeId,
  type WorkbenchCompareItem,
  type WorkbenchCompareKind,
  type WorkbenchQuestion,
  type WorkbenchQuestionCategory,
  type WorkbenchState,
} from "../types";
import type { RecordRoute, RecordRouteKind } from "../utils/recordRoutes";
import { recordRoute } from "../utils/recordRoutes";
import { downloadTextFile } from "../utils/downloadTextFile";
import { getCountryGovernanceSummary } from "../utils/getCountryGovernanceSummary";
import {
  buildScenarioAssessment,
  buildWorkbenchAnswerCards,
  exposureEffectSummary,
  getCountryImplementationMilestones,
  getCountryObligations,
  getInstrumentObligations,
  getLabObligations,
  getRecordDisplayName,
  getRuleImplementationMilestones,
  getRuleObligations,
  obligationEffectLabel,
  summarizeImplementationStatuses,
  summarizeObligationCategories,
} from "../utils/researchWorkbench";
import {
  getLabExposureTarget,
  getLabRegulatoryExposures,
  LAB_EXPOSURE_EFFECT_LABELS,
} from "../utils/labExposure";
import {
  buildAtlasMapContext,
  buildAtlasPresetRows,
  formatAtlasScore,
  getCountryAtlasSummary,
  READINESS_STATUS_LABELS,
} from "../utils/aiAtlas";
import { INSTRUMENT_BINDING_LABELS } from "../utils/getParticipationLabel";
import { DATA_CONFIDENCE_LABELS } from "../utils/getVerificationLabel";
import { SourceLink } from "./SourceLink";
import { VerificationMeta } from "./VerificationMeta";
import { EvidenceDossierButton } from "./EvidenceDossierButton";
import { CorrectionLink } from "./CorrectionLink";
import { LabIntelligenceBoard } from "./LabIntelligenceBoard";
import { ResearchCorpusPanel } from "./ResearchCorpusPanel";
import { PolicyBriefButton } from "./PolicyBriefButton";
import { getLabIntelligenceSummary } from "../utils/labIntelligence";
import { RELEASE_METADATA } from "../data/releaseMetadata";
import {
  FEATURED_WORKBENCH_QUESTIONS,
  getQuestionEffectiveFilters,
  getQuestionWorkbenchState,
  WORKBENCH_QUESTIONS,
  WORKBENCH_QUESTION_CATEGORY_LABELS,
} from "../data/workbenchQuestions";
import {
  buildWorkbenchAnswer,
  renderWorkbenchAnswerCitation,
  renderWorkbenchAnswerCsv,
} from "../utils/workbenchAnswer";
import { formatReviewState, formatSourceLocator } from "../utils/sourceProvenance";
import { CopyTextButton } from "./CopyTextButton";
import {
  corpusKindLabel,
  corpusRoute,
  getCorpusChangelogForRecord,
  getCorpusRecord,
  relatedRecordsFor,
  type CorpusUiKind,
} from "../utils/researchCorpus";

interface Props {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSelectCountry: (iso3: string) => void;
  onSelectLab: (labId: string) => void;
  onSelectInstrument: (instrumentId: string) => void;
  onOpenMethodology: () => void;
  onOpenAtlasMapMode: (mapMode: MapModeId) => void;
  workbenchState: WorkbenchState;
  onWorkbenchStateChange: (state: WorkbenchState) => void;
  routeRecord: RecordRoute | null;
}

const WORKFLOWS: Array<{
  id: string;
  title: string;
  detail: string;
  patch: Partial<FilterState>;
}> = [
  {
    id: "compare-countries",
    title: "Compare countries",
    detail: "Start from binding/proposed/rule coverage, then add specific jurisdictions below.",
    patch: {},
  },
  {
    id: "binding-duties",
    title: "Find binding AI duties",
    detail: "Focus on source-backed binding obligation rows and confirmed binding national rules.",
    patch: { hasBindingNationalLaw: "yes", selectedObligationCategories: ["risk_assessment", "transparency_disclosure"] },
  },
  {
    id: "treaty-participation",
    title: "Track treaty participation",
    detail: "Separate Council of Europe signatures from ratifications and EU applicability.",
    patch: {
      selectedInstrumentIds: ["coe-ai-convention"],
      selectedParticipationTypes: ["signed", "ratified", "applicable_via_eu"],
    },
  },
  {
    id: "lab-exposure",
    title: "Assess frontier-lab exposure",
    detail: "Emphasize lab-facing binding, voluntary, standard, and infrastructure hooks.",
    patch: { frontierAIRelevant: "yes", selectedDomains: ["frontier-gpai", "compute-cloud-chips"] },
  },
  {
    id: "lab-intelligence-board",
    title: "Use Lab Board",
    detail: "Compare safety frameworks, evaluation evidence, compute dependencies, and exposure counts by lab.",
    patch: { frontierAIRelevant: "yes", selectedDomains: ["frontier-gpai", "compute-cloud-chips"] },
  },
  {
    id: "implementation",
    title: "Find enforcement / implementation status",
    detail: "Track what is proposed, in force, phased, or still awaiting implementing rules.",
    patch: { selectedImplementationStatuses: ["in_force", "phased_application", "implementing_rules_pending"] },
  },
  {
    id: "citation-brief",
    title: "Prepare a citation brief",
    detail: "Open dossiers and source metadata for the active research question.",
    patch: {},
  },
];

const SCENARIO_MARKETS = ["EUU", "USA", "GBR", "KOR", "CHN", "CAN", "FRA", "ITA"];
const ATLAS_PRESETS: Array<{ id: AtlasPresetId; title: string; detail: string }> = [
  {
    id: "high-readiness-no-binding",
    title: "High readiness, no binding law",
    detail: "Find countries with high Oxford readiness but no confirmed binding AI-specific law.",
  },
  {
    id: "ram-activity",
    title: "UNESCO RAM activity",
    detail: "Show countries with completed or in-process UNESCO RAM/profile activity.",
  },
  {
    id: "caidp-oxford-comparison",
    title: "CAIDP vs Oxford",
    detail: "Compare democratic-values scores with government AI readiness.",
  },
  {
    id: "vibrancy-regulatory-maturity",
    title: "AI vibrancy vs regulation",
    detail: "Compare Stanford vibrancy signals with binding-law coverage.",
  },
];

const ATLAS_COMPARISON_MAPS: Array<{
  id: string;
  title: string;
  mapMode: MapModeId;
  presetId: AtlasPresetId;
  detail: string;
}> = [
  {
    id: "readiness-law",
    title: "Readiness vs binding law",
    mapMode: "gov-ai-readiness",
    presetId: "high-readiness-no-binding",
    detail: "Spot high-capacity countries without confirmed binding AI-specific law.",
  },
  {
    id: "ram-status",
    title: "RAM status",
    mapMode: "unesco-ram-status",
    presetId: "ram-activity",
    detail: "Find countries with UNESCO RAM/profile activity.",
  },
  {
    id: "democratic-values",
    title: "CAIDP vs Oxford",
    mapMode: "democratic-values",
    presetId: "caidp-oxford-comparison",
    detail: "Compare democratic-values assessment with government readiness.",
  },
];

export function WorkbenchView({
  filters,
  onFiltersChange,
  onSelectCountry,
  onSelectLab,
  onSelectInstrument,
  onOpenMethodology,
  onOpenAtlasMapMode,
  workbenchState,
  onWorkbenchStateChange,
  routeRecord,
}: Props) {
  const compareKind = workbenchState.compareKind;
  const compareId = workbenchState.compareId;
  const compareItems = workbenchState.compareItems;
  const scenarioLabId = workbenchState.scenarioLabId;
  const scenarioMarkets = workbenchState.scenarioMarkets;
  const atlasPresetId = workbenchState.atlasPresetId;
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionCategory, setQuestionCategory] = useState<WorkbenchQuestionCategory | "all">("all");

  const answerCards = useMemo(() => buildWorkbenchAnswerCards(filters), [filters]);
  const atlasRows = useMemo(() => buildAtlasPresetRows(atlasPresetId), [atlasPresetId]);
  const scenario = useMemo(
    () => buildScenarioAssessment(scenarioLabId, scenarioMarkets),
    [scenarioLabId, scenarioMarkets]
  );
  const compareOptions = optionsForKind(compareKind);
  const activeQuestionId =
    workbenchState.activeQuestionId ??
    DEFAULT_WORKBENCH_STATE.activeQuestionId ??
    "binding-duties-by-jurisdiction";
  const activeAnswer = useMemo(
    () => buildWorkbenchAnswer(activeQuestionId),
    [activeQuestionId],
  );
  const filteredQuestions = useMemo(() => {
    const query = questionSearch.trim().toLowerCase();
    return WORKBENCH_QUESTIONS.filter((question) => {
      if (question.featured) return false;
      if (questionCategory !== "all" && question.category !== questionCategory) return false;
      if (!query) return true;
      return `${question.title} ${question.detail} ${question.categoryLabel}`.toLowerCase().includes(query);
    });
  }, [questionCategory, questionSearch]);

  function updateWorkbenchState(patch: Partial<WorkbenchState>) {
    onWorkbenchStateChange({ ...workbenchState, ...patch });
  }

  function applyWorkflow(workflow: (typeof WORKFLOWS)[number]) {
    onFiltersChange({ ...DEFAULT_FILTER_STATE, ...workflow.patch });
    updateWorkbenchState({
      activeWorkflowId: workflow.id,
    });
  }

  function applyQuestion(question: WorkbenchQuestion) {
    onFiltersChange(getQuestionEffectiveFilters(question.id));
    onWorkbenchStateChange(getQuestionWorkbenchState(question.id));
  }

  function addCompareItem() {
    if (!compareId) return;
    if (compareItems.some((item) => item.kind === compareKind && item.id === compareId)) return;
    updateWorkbenchState({
      compareItems: [...compareItems, { kind: compareKind, id: compareId }].slice(-6),
    });
  }

  function removeCompareItem(item: WorkbenchCompareItem) {
    updateWorkbenchState({
      compareItems: compareItems.filter((candidate) => candidate.kind !== item.kind || candidate.id !== item.id),
    });
  }

  function setScenarioMarket(iso3: string) {
    updateWorkbenchState({
      scenarioMarkets: scenarioMarkets.includes(iso3)
        ? scenarioMarkets.filter((item) => item !== iso3)
        : [...scenarioMarkets, iso3],
    });
  }

  function exportComparisonCsv() {
    downloadTextFile("ai-governance-workbench-comparison.csv", renderComparisonCsv(compareItems), "text/csv;charset=utf-8");
  }

  function exportScenarioCsv() {
    downloadTextFile(
      "ai-governance-scenario.csv",
      renderScenarioCsv(scenarioLabId, scenarioMarkets, scenario),
      "text/csv;charset=utf-8"
    );
  }

  function exportAnswerCsv() {
    downloadTextFile(
      `ai-governance-workbench-${activeAnswer.questionId}.csv`,
      renderWorkbenchAnswerCsv(activeAnswer),
      "text/csv;charset=utf-8",
    );
  }

  return (
    <div className="policy-scroll h-full overflow-auto bg-canvas-surface">
      <div className="mx-auto max-w-[1600px] px-4 py-4">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-canvas-line pb-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Research-grade workbench · release {RELEASE_METADATA.releaseDate} · status as of {RELEASE_METADATA.statusAsOf}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink-900">
              Answer concrete AI-governance questions
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-600">
              Compare jurisdictions, labs, instruments, obligations, implementation status, and source confidence from the same structured dataset.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenMethodology}
            className="rounded-md border border-canvas-line bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-accent hover:text-accent"
          >
            Methodology
          </button>
        </header>

        {routeRecord && (
          <section className="mt-4">
            <RecordRoutePanel
              routeRecord={routeRecord}
              onSelectCountry={onSelectCountry}
              onSelectLab={onSelectLab}
              onSelectInstrument={onSelectInstrument}
            />
          </section>
        )}

        <section
          className="mt-4 rounded-lg border border-canvas-line bg-white p-3"
          aria-label="Featured research questions"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Featured research questions</h3>
              <p className="text-xs text-ink-600">
                One click applies the relevant filters, comparison records, scenario inputs, and answer card.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_WORKBENCH_QUESTIONS.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() => applyQuestion(question)}
                title={question.detail}
                aria-pressed={activeQuestionId === question.id}
                data-workbench-question={question.id}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-left transition-colors",
                  activeQuestionId === question.id
                    ? "border-accent bg-accent/10"
                    : "border-canvas-line bg-canvas/40 hover:border-accent hover:bg-accent/5"
                )}
              >
                <span className="block text-xs font-semibold leading-snug text-ink-900">{question.title}</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-ink-600">{question.detail}</span>
              </button>
            ))}
          </div>
        </section>

        <section
          className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4"
          aria-label="Workbench answer"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                Answer · {activeAnswer.countLabel}
              </p>
              <h3 className="mt-1 text-base font-semibold leading-snug text-ink-900">
                {activeAnswer.questionTitle}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-ink-900">
                {activeAnswer.sentence}
              </p>
              <p className="mt-1 max-w-4xl text-xs leading-relaxed text-ink-700">
                {activeAnswer.caveat}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <CopyTextButton
                text={renderWorkbenchAnswerCitation(activeAnswer)}
                label="Cite answer"
                copiedLabel="Citation copied"
              />
              <button type="button" onClick={exportAnswerCsv} className={smallButtonClass}>
                Export answer CSV
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Named entities">
            {activeAnswer.namedEntities.map((entity) => (
              <span key={entity} className="rounded-full border border-accent/20 bg-white px-2 py-1 text-[11px] font-medium text-ink-700">
                {entity}
              </span>
            ))}
          </div>
          <div className="mt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-600">Evidence</h4>
            <ul className="mt-2 grid gap-2 lg:grid-cols-2 xl:grid-cols-5">
              {activeAnswer.evidence.map((row) => (
                <li key={row.id} className="rounded-lg border border-canvas-line bg-white p-2.5">
                  <p className="text-xs font-semibold leading-snug text-ink-900">{row.name}</p>
                  <p className="mt-1 text-[11px] text-ink-500">Record checked {row.lastVerified ?? "date not recorded"}</p>
                  {row.sourceLocator && (
                    <p className="mt-1 text-[11px] text-ink-600">
                      Source pinpoint: {formatSourceLocator(row.sourceLocator)}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-ink-600">Review: {formatReviewState(row)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Official source for ${row.name}`}
                      className={smallButtonClass}
                    >
                      Official source
                    </a>
                    {row.recordUrl && (
                      <a
                        href={row.recordUrl}
                        aria-label={`Open record for ${row.name}`}
                        className={smallButtonClass}
                      >
                        Open record
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-[11px] text-ink-600">
            Release {RELEASE_METADATA.releaseDate} · answer status as of {activeAnswer.statusAsOf} · per-record check dates shown above
          </p>
        </section>

        <details className="mt-3 rounded-lg border border-canvas-line bg-white [&[open]>summary]:border-b [&[open]>summary]:border-canvas-line">
          <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-ink-900">
            Browse all questions
          </summary>
          <div className="p-3">
            <label className="block text-xs font-medium text-ink-700">
              Search questions
              <input
                type="search"
                value={questionSearch}
                onChange={(event) => setQuestionSearch(event.target.value)}
                placeholder="Search titles, details, or categories"
                className="mt-1 h-9 w-full rounded-md border border-canvas-line bg-white px-2.5 text-sm text-ink-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Question categories">
              <button
                type="button"
                aria-pressed={questionCategory === "all"}
                onClick={() => setQuestionCategory("all")}
                className={smallButtonClass}
              >
                All
              </button>
              {(Object.entries(WORKBENCH_QUESTION_CATEGORY_LABELS) as Array<[WorkbenchQuestionCategory, string]>).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={questionCategory === id}
                  onClick={() => setQuestionCategory(id)}
                  className={smallButtonClass}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuestions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => applyQuestion(question)}
                  aria-pressed={activeQuestionId === question.id}
                  data-workbench-question={question.id}
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30",
                    activeQuestionId === question.id
                      ? "border-accent bg-accent/10"
                      : "border-canvas-line bg-canvas/40 hover:border-accent hover:bg-accent/5",
                  )}
                >
                  <span className="block text-xs font-semibold leading-snug text-ink-900">{question.title}</span>
                  <span className="mt-1 block text-[11px] font-medium text-accent">{question.categoryLabel}</span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-ink-600">{question.detail}</span>
                </button>
              ))}
            </div>
          </div>
        </details>

        <CollapsibleSection summary="Research workflows and answer metrics" note="Apply legacy workflows or inspect all derived answer cards">
        <section className="grid gap-3 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-lg border border-canvas-line bg-white p-3">
            <h3 className="text-sm font-semibold text-ink-900">Research workflows</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {WORKFLOWS.map((workflow) => (
                <button
                  key={workflow.id}
                  type="button"
                  onClick={() => applyWorkflow(workflow)}
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-left hover:border-accent hover:bg-accent/5",
                    workbenchState.activeWorkflowId === workflow.id
                      ? "border-accent bg-accent/10"
                      : "border-canvas-line bg-canvas/40"
                  )}
                >
                  <span className="block text-xs font-semibold text-ink-900">{workflow.title}</span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-ink-600">{workflow.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-canvas-line bg-white p-3">
            <h3 className="text-sm font-semibold text-ink-900">Answer cards</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {answerCards.map((card) => (
                <div key={card.id} className="rounded-lg border border-canvas-line bg-canvas/40 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{card.label}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-ink-900">{card.sentence}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-600">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </CollapsibleSection>
        <CollapsibleSection summary="Frontier lab intelligence board" note="13 labs — safety frameworks, evaluations, compute, exposure">
          <LabIntelligenceBoard onSelectLab={onSelectLab} />
        </CollapsibleSection>

        <CollapsibleSection summary="Research corpus" note="Institutions, policy windows, standards, public-sector AI, enforcement">
          <ResearchCorpusPanel onOpenMapMode={onOpenAtlasMapMode} />
        </CollapsibleSection>


        <CollapsibleSection summary="AI Atlas comparison" note="Context indicators only — these never change legal-status summaries">
          <section className="mt-4 rounded-lg border border-canvas-line bg-white p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">AI Atlas presets</h3>
                <p className="text-xs text-ink-600">
                  Context indicators only. These scores do not change legal-status summaries.
                </p>
              </div>
              <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-canvas-line">
                {ATLAS_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => updateWorkbenchState({ atlasPresetId: preset.id })}
                    title={preset.detail}
                    className={clsx(
                      "whitespace-nowrap px-2.5 py-1 text-[11px] font-medium transition-colors",
                      atlasPresetId === preset.id ? "bg-accent text-white" : "bg-white text-ink-700 hover:bg-canvas"
                    )}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {ATLAS_COMPARISON_MAPS.map((item) => (
                <AtlasMapCard
                  key={item.id}
                  item={item}
                  onOpenAtlasMapMode={onOpenAtlasMapMode}
                  onSelectCountry={onSelectCountry}
                />
              ))}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {atlasRows.map((row) => (
                <button
                  key={`${atlasPresetId}:${row.iso3}`}
                  type="button"
                  onClick={() => onSelectCountry(row.iso3)}
                  className="rounded-lg border border-canvas-line bg-canvas/40 px-3 py-2 text-left hover:border-accent hover:bg-accent/5"
                >
                  <span className="block text-xs font-semibold text-ink-900">{row.countryName}</span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-ink-700">{row.primary}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-500">{row.secondary}</span>
                </button>
              ))}
            </div>
          </section>
        </CollapsibleSection>

        <CollapsibleSection summary="Comparison builder and scenario simulator" note="Pin up to six records; model lab exposure across markets">
          <section className="mt-4 grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-lg border border-canvas-line bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Comparison builder</h3>
                  <p className="text-xs text-ink-600">Compare up to six records side by side.</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={exportComparisonCsv}
                    className="h-8 rounded-md border border-canvas-line bg-white px-2.5 text-xs font-semibold text-ink-700 hover:border-accent hover:text-accent"
                  >
                    Export comparison CSV
                  </button>
                  <select
                    value={compareKind}
                    onChange={(event) => {
                      const nextKind = event.target.value as WorkbenchCompareKind;
                      updateWorkbenchState({
                        compareKind: nextKind,
                        compareId: optionsForKind(nextKind)[0]?.id ?? "",
                      });
                    }}
                    className="h-8 rounded-md border border-canvas-line bg-white px-2 text-xs text-ink-800"
                  >
                    <option value="country">Countries</option>
                    <option value="lab">Labs</option>
                    <option value="instrument">Instruments</option>
                    <option value="rule">Rules</option>
                    <option value="obligation">Obligations</option>
                    <option value="exposure">Exposures</option>
                  </select>
                  <select
                    value={compareId}
                    onChange={(event) => updateWorkbenchState({ compareId: event.target.value })}
                    className="h-8 max-w-72 rounded-md border border-canvas-line bg-white px-2 text-xs text-ink-800"
                  >
                    {compareOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addCompareItem}
                    className="h-8 rounded-md border border-accent bg-accent/10 px-2.5 text-xs font-semibold text-accent hover:bg-accent/15"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
                {compareItems.map((item) => (
                  <CompareCard
                    key={`${item.kind}:${item.id}`}
                    item={item}
                    onRemove={() => removeCompareItem(item)}
                    onSelectCountry={onSelectCountry}
                    onSelectLab={onSelectLab}
                    onSelectInstrument={onSelectInstrument}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-canvas-line bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Regulatory scenario</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-600">
                    Select a lab and likely deployment markets. Results come from structured exposure and obligation rows only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportScenarioCsv}
                  className="rounded-md border border-canvas-line bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:border-accent hover:text-accent"
                >
                  Export scenario CSV
                </button>
              </div>
              <label className="mt-3 block text-xs font-medium text-ink-700">
                Lab
                <select
                  value={scenarioLabId}
                  onChange={(event) => updateWorkbenchState({ scenarioLabId: event.target.value })}
                  className="mt-1 h-8 w-full rounded-md border border-canvas-line bg-white px-2 text-xs text-ink-800"
                >
                  {FRONTIER_LABS.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-3">
                <p className="text-xs font-medium text-ink-700">Deployment markets</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {SCENARIO_MARKETS.map((iso3) => (
                    <button
                      key={iso3}
                      type="button"
                      onClick={() => setScenarioMarket(iso3)}
                      className={clsx(
                        "rounded-md border px-2 py-1 text-[11px] font-medium",
                        scenarioMarkets.includes(iso3)
                          ? "border-accent bg-accent text-white"
                          : "border-canvas-line bg-white text-ink-700 hover:border-accent"
                      )}
                    >
                      {COUNTRY_BY_ISO3[iso3]?.name ?? iso3}
                    </button>
                  ))}
                </div>
              </div>
              {scenario && (
                <div className="mt-3 rounded-lg border border-canvas-line bg-canvas/40 p-3 text-xs text-ink-700">
                  <p className="font-semibold text-ink-900">
                    {scenario.labName}: {scenario.exposureRows.length} exposure row(s)
                  </p>
                  <p className="mt-1 text-ink-600">{exposureEffectSummary(scenario.exposureRows)}</p>
                  <p className="mt-2 font-semibold text-ink-900">Structured obligations</p>
                  <p className="mt-1 text-ink-600">{summarizeObligationCategories(scenario.obligations)}</p>
                  <p className="mt-2 font-semibold text-ink-900">Evidence context</p>
                  <p className="mt-1 text-ink-600">
                    {scenario.modelGovernanceEvidence.length} model-governance row(s);{" "}
                    {scenario.safetyEvaluationRecords.length} safety/evaluation row(s);{" "}
                    {scenario.computeDependencyRecords.length} compute-dependency row(s).
                  </p>
                  <ul className="mt-2 space-y-1">
                    {scenario.exposureRows.slice(0, 5).map((row) => {
                      const target = getLabExposureTarget(row);
                      return (
                        <li key={row.id} className="rounded-md bg-white px-2 py-1">
                          <span className="font-medium text-ink-900">{target.name}</span>
                          <span className="text-ink-500"> · {LAB_EXPOSURE_EFFECT_LABELS[row.legalEffect]}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 rounded-md bg-white px-2 py-1.5 text-[11px] leading-relaxed text-ink-600">
                    {scenario.caveats.join(" ")}
                  </p>
                </div>
              )}
            </div>
          </section>
        </CollapsibleSection>

        <CollapsibleSection summary="Obligation and implementation matrices" note="Structured duty rows and milestone tracking">
          <section className="mt-4 grid gap-3 xl:grid-cols-3">
            <MiniMatrix
              title="Obligation matrix"
              rows={GOVERNANCE_OBLIGATIONS.slice(0, 8).map((row) => ({
                id: row.id,
                name: OBLIGATION_CATEGORY_LABELS[row.category],
                detail: `${obligationEffectLabel(row.legalEffect)} · ${getRecordDisplayName(row.parentType, row.parentId)}`,
              }))}
            />
            <MiniMatrix
              title="Implementation tracker"
              rows={IMPLEMENTATION_MILESTONES.slice(0, 8).map((row) => ({
                id: row.id,
                name: IMPLEMENTATION_STATUS_LABELS[row.status],
                detail: `${row.jurisdiction} · ${row.nextDeadline ?? row.date ?? "date not specified"}`,
              }))}
            />
            <MiniMatrix
              title="Public data endpoints"
              rows={[
                { id: "full", name: "/data/full-dataset.json", detail: "Full static research release" },
                { id: "obligations", name: "/data/obligation-matrix.json", detail: "Structured obligation rows" },
                { id: "labs", name: "/data/lab-exposure-matrix.json", detail: "Lab regulatory-exposure matrix" },
                { id: "lab-intel", name: "/data/lab-intelligence.json", detail: "Frontier-lab intelligence profiles" },
                { id: "safety", name: "/data/safety-evaluations.json", detail: "Safety and evaluation evidence" },
              ]}
            />
          </section>
        </CollapsibleSection>
      </div>
    </div>
  );
}

function RecordRoutePanel({
  routeRecord,
  onSelectCountry,
  onSelectLab,
  onSelectInstrument,
}: {
  routeRecord: RecordRoute;
  onSelectCountry: (iso3: string) => void;
  onSelectLab: (labId: string) => void;
  onSelectInstrument: (instrumentId: string) => void;
}) {
  if (routeRecord.kind === "country") {
    const summary = getCountryGovernanceSummary(routeRecord.id);
    const obligations = getCountryObligations(routeRecord.id);
    const implementation = getCountryImplementationMilestones(routeRecord.id);
    if (!summary.country) return null;
    return (
      <RecordPanelShell title={summary.country.name} subtitle={`Country record · ${summary.country.iso3}`}>
        <RecordMetrics
          items={[
            ["Binding law", summary.hasBindingNationalLaw ? "Yes" : "None confirmed"],
            ["Obligations", String(obligations.length)],
            ["Implementation", String(implementation.length)],
            ["International rows", String(summary.participations.length)],
          ]}
        />
        <RecordText label="Research summary" value={`${summary.country.name} has ${summary.nationalRegulations.length} national entries, ${summary.participations.length} international rows, and ${summary.hqLabs.length} headquartered frontier lab(s) in this release.`} />
        <RecordText label="Obligations" value={summarizeObligationCategories(obligations)} />
        <RecordText label="Implementation" value={summarizeImplementationStatuses(implementation)} />
        <RecordActions>
          <button type="button" onClick={() => onSelectCountry(summary.country!.iso3)} className={smallButtonClass}>
            Open country drawer
          </button>
          <EvidenceDossierButton kind="country" id={summary.country.iso3} />
          <a className={smallButtonClass} href={recordRoute("country", summary.country.iso3)}>
            Stable URL
          </a>
        </RecordActions>
      </RecordPanelShell>
    );
  }

  if (routeRecord.kind === "lab") {
    const lab = LAB_BY_ID[routeRecord.id];
    if (!lab) return null;
    const exposures = getLabRegulatoryExposures(lab.id);
    const obligations = getLabObligations(lab.id);
    return (
      <RecordPanelShell title={lab.name} subtitle={`Frontier lab · HQ: ${lab.hqCountryName}`}>
        <RecordMetrics
          items={[
            ["Exposure rows", String(exposures.length)],
            ["Obligations", String(obligations.length)],
            ["Binding rows", String(exposures.filter((row) => row.legalEffect === "binding").length)],
            ["Salience (editorial)", `${lab.powerScore}/5`],
          ]}
        />
        <RecordText label="Research summary" value={lab.summary} />
        <RecordText label="Exposure" value={exposureEffectSummary(exposures)} />
        <RecordText label="Obligations" value={summarizeObligationCategories(obligations)} />
        <RecordActions>
          <button type="button" onClick={() => onSelectLab(lab.id)} className={smallButtonClass}>
            Open lab drawer
          </button>
          <EvidenceDossierButton kind="lab" id={lab.id} />
          <a className={smallButtonClass} href={recordRoute("lab", lab.id)}>
            Stable URL
          </a>
        </RecordActions>
      </RecordPanelShell>
    );
  }

  if (routeRecord.kind === "instrument") {
    const instrument = INSTRUMENT_BY_ID[routeRecord.id];
    if (!instrument) return null;
    const obligations = getInstrumentObligations(instrument.id);
    const participations = PARTICIPATION_BY_INSTRUMENT[instrument.id] ?? [];
    return (
      <RecordPanelShell title={instrument.name} subtitle={`${instrument.organizationType} · ${instrument.instrumentType.replace(/_/g, " ")}`}>
        <RecordMetrics
          items={[
            ["Legal effect", INSTRUMENT_BINDING_LABELS[instrument.bindingStatus]],
            ["Participation", String(participations.length)],
            ["Obligations", String(obligations.length)],
            ["Confidence", instrument.confidence ? DATA_CONFIDENCE_LABELS[instrument.confidence] : ""],
          ]}
        />
        <RecordText label="Research summary" value={instrument.summary} />
        <RecordText label="Obligations" value={summarizeObligationCategories(obligations)} />
        <RecordActions>
          <button type="button" onClick={() => onSelectInstrument(instrument.id)} className={smallButtonClass}>
            Filter map
          </button>
          <EvidenceDossierButton kind="instrument" id={instrument.id} />
          <a className={smallButtonClass} href={recordRoute("instrument", instrument.id)}>
            Stable URL
          </a>
          <SourceLink name={instrument.sourceName} url={instrument.sourceUrl} />
        </RecordActions>
      </RecordPanelShell>
    );
  }

  if (routeRecord.kind === "obligation") {
    const obligation = OBLIGATION_BY_ID[routeRecord.id];
    if (!obligation) return null;
    return (
      <RecordPanelShell
        title={OBLIGATION_CATEGORY_LABELS[obligation.category]}
        subtitle={`Obligation record - ${getRecordDisplayName(obligation.parentType, obligation.parentId)}`}
      >
        <RecordMetrics
          items={[
            ["Legal effect", obligationEffectLabel(obligation.legalEffect)],
            ["Directness", obligation.directness],
            ["Jurisdiction", obligation.jurisdiction ?? "Contextual"],
            ["Confidence", obligation.confidence ? DATA_CONFIDENCE_LABELS[obligation.confidence] : ""],
          ]}
        />
        <RecordText label="Research summary" value={obligation.summary} />
        {obligation.caveat && <RecordText label="Caveat" value={obligation.caveat} />}
        <div className="mt-3">
          <VerificationMeta item={obligation} compact />
        </div>
        <RecordActions>
          <a className={smallButtonClass} href={recordRoute("obligation", obligation.id)}>
            Stable URL
          </a>
          <a className={smallButtonClass} href={recordRoute(parentRouteKind(obligation.parentType), obligation.parentId)}>
            Parent record
          </a>
          <SourceLink name={obligation.sourceName} url={obligation.sourceUrl} />
          <CorrectionLink
            recordKind="obligation"
            recordId={obligation.id}
            recordName={OBLIGATION_CATEGORY_LABELS[obligation.category]}
            sourceUrl={obligation.sourceUrl}
            claim={obligation.summary}
            compact
          />
        </RecordActions>
      </RecordPanelShell>
    );
  }

  if (routeRecord.kind === "exposure") {
    const exposure = LAB_REGULATORY_EXPOSURES.find((row) => row.id === routeRecord.id);
    if (!exposure) return null;
    const lab = LAB_BY_ID[exposure.labId];
    const target = getLabExposureTarget(exposure);
    return (
      <RecordPanelShell
        title={`${lab?.name ?? exposure.labId} - ${target.name}`}
        subtitle={`Exposure record - ${exposure.exposureKind.replace(/_/g, " ")}`}
      >
        <RecordMetrics
          items={[
            ["Legal effect", LAB_EXPOSURE_EFFECT_LABELS[exposure.legalEffect]],
            ["Directness", exposure.directness],
            ["Strength", `${exposure.strength}/5`],
            ["Confidence", exposure.confidence ? DATA_CONFIDENCE_LABELS[exposure.confidence] : ""],
          ]}
        />
        <RecordText label="Rationale" value={exposure.rationale} />
        {exposure.notes && <RecordText label="Caveat" value={exposure.notes} />}
        <div className="mt-3">
          <VerificationMeta item={exposure} compact />
        </div>
        <RecordActions>
          <button type="button" onClick={() => onSelectLab(exposure.labId)} className={smallButtonClass}>
            Open lab drawer
          </button>
          <a className={smallButtonClass} href={recordRoute("exposure", exposure.id)}>
            Stable URL
          </a>
          <SourceLink name={exposure.sourceName} url={exposure.sourceUrl} />
          <CorrectionLink
            recordKind="exposure"
            recordId={exposure.id}
            recordName={`${lab?.name ?? exposure.labId} - ${target.name}`}
            sourceUrl={exposure.sourceUrl}
            claim={exposure.rationale}
            compact
          />
        </RecordActions>
      </RecordPanelShell>
    );
  }

  if (
    routeRecord.kind === "institution" ||
    routeRecord.kind === "policy-process" ||
    routeRecord.kind === "standard" ||
    routeRecord.kind === "public-sector-ai" ||
    routeRecord.kind === "enforcement"
  ) {
    const corpusRecord = getCorpusRecord(routeRecord.kind as CorpusUiKind, routeRecord.id);
    if (!corpusRecord) return null;
    const related = relatedRecordsFor(corpusRecord);
    const changelog = getCorpusChangelogForRecord(corpusRecord);
    return (
      <RecordPanelShell title={corpusRecord.title} subtitle={`${corpusKindLabel(corpusRecord.kind)} - ${corpusRecord.jurisdiction}`}>
        <RecordMetrics
          items={[
            ["Status", corpusRecord.status],
            ["Jurisdiction", corpusRecord.jurisdiction],
            ["Domains", String(corpusRecord.domains.length)],
            ["Confidence", corpusRecord.metadata.confidence ? DATA_CONFIDENCE_LABELS[corpusRecord.metadata.confidence] : ""],
          ]}
        />
        <RecordText label="Research summary" value={corpusRecord.summary} />
        <RecordText label="Caveat" value={corpusRecord.caveat} />
        <RecordText
          label="Related records"
          value={
            related.length
              ? related.map((reference) => `${reference.label ?? reference.id} (${reference.kind})`).join("; ")
              : "No related record references tracked."
          }
        />
        <div className="mt-3">
          <VerificationMeta item={corpusRecord.metadata} compact />
        </div>
        <RecordChangelog entries={changelog} />
        <RecordActions>
          <a className={smallButtonClass} href={corpusRoute(corpusRecord)}>
            Stable URL
          </a>
          <EvidenceDossierButton kind={corpusRecord.routeKind} id={corpusRecord.id} compact />
          <PolicyBriefButton
            kind={
              corpusRecord.kind === "standards_conformity"
                ? "standards_conformity"
                : corpusRecord.kind === "enforcement"
                  ? "enforcement_watch"
                  : corpusRecord.kind === "policy_process"
                    ? "deadline_watch"
                    : corpusRecord.kind === "public_sector_ai" && corpusRecord.countryIso3
                      ? "country"
                      : "institution"
            }
            id={corpusRecord.kind === "institution" || corpusRecord.kind === "standards_conformity" ? corpusRecord.id : corpusRecord.countryIso3}
            compact
          />
          <SourceLink name={corpusRecord.sourceName} url={corpusRecord.sourceUrl} />
          <CorrectionLink
            recordKind={corpusRecord.kind}
            recordId={corpusRecord.id}
            recordName={corpusRecord.title}
            sourceUrl={corpusRecord.sourceUrl}
            claim={corpusRecord.summary}
            compact
          />
        </RecordActions>
      </RecordPanelShell>
    );
  }

  const rule = NATIONAL_REG_BY_ID[routeRecord.id] ?? SUBNATIONAL_BY_ID[routeRecord.id];
  if (!rule) return null;
  const jurisdictionLabel = "jurisdictionName" in rule ? rule.jurisdictionName : rule.jurisdiction;
  const obligations = getRuleObligations(rule.id);
  const implementation = getRuleImplementationMilestones(rule.id);
  return (
    <RecordPanelShell title={rule.name} subtitle={`Rule record · ${jurisdictionLabel}`}>
      <RecordMetrics
        items={[
          ["Status", rule.status],
          ["Legal effect", rule.bindingStatus],
          ["Obligations", String(obligations.length)],
          ["Implementation", String(implementation.length)],
        ]}
      />
      <RecordText label="Research summary" value={rule.summary} />
      <RecordText label="Obligations" value={summarizeObligationCategories(obligations)} />
      <RecordText label="Implementation" value={summarizeImplementationStatuses(implementation)} />
      <div className="mt-3">
        <VerificationMeta item={rule} compact />
      </div>
      <RecordActions>
        <a className={smallButtonClass} href={recordRoute("rule", rule.id)}>
          Stable URL
        </a>
        <SourceLink name={rule.sourceName} url={rule.sourceUrl} />
        <CorrectionLink
          recordKind="rule"
          recordId={rule.id}
          recordName={rule.name}
          sourceUrl={rule.sourceUrl}
          claim={rule.summary}
          compact
        />
      </RecordActions>
    </RecordPanelShell>
  );
}

function RecordChangelog({
  entries,
}: {
  entries: Array<{ id: string; changeType: string; date: string; summary: string; reviewer?: { reviewerRole: string; reviewDate: string } }>;
}) {
  return (
    <div className="mt-3 rounded-lg border border-canvas-line bg-canvas/40 p-3 text-xs">
      <p className="font-semibold text-ink-900">Record changelog</p>
      {entries.length ? (
        <ul className="mt-2 space-y-1.5">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-md bg-white px-2.5 py-2">
              <p className="font-medium text-ink-900">
                {entry.changeType.replace(/_/g, " ")} - {entry.date}
              </p>
              <p className="mt-1 leading-relaxed text-ink-600">{entry.summary}</p>
              {entry.reviewer && (
                <p className="mt-1 text-[11px] text-ink-500">
                  Reviewed by {entry.reviewer.reviewerRole} on {entry.reviewer.reviewDate}.
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-ink-600">No row-specific changelog entry is published yet.</p>
      )}
    </div>
  );
}

function CompareCard({
  item,
  onRemove,
  onSelectCountry,
  onSelectLab,
  onSelectInstrument,
}: {
  item: WorkbenchCompareItem;
  onRemove: () => void;
  onSelectCountry: (iso3: string) => void;
  onSelectLab: (labId: string) => void;
  onSelectInstrument: (instrumentId: string) => void;
}) {
  const summary = getCompareSummary(item);
  return (
    <article className="rounded-lg border border-canvas-line bg-canvas/30 p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{item.kind}</p>
          <h4 className="mt-0.5 text-sm font-semibold leading-snug text-ink-900">{summary.title}</h4>
        </div>
        <button type="button" onClick={onRemove} className="rounded p-1 text-ink-500 hover:bg-white" aria-label="Remove comparison">
          ×
        </button>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2">
        {summary.metrics.map(([label, value]) => (
          <div key={label} className="rounded-md bg-white px-2 py-1.5">
            <dt className="text-[10px] uppercase tracking-wide text-ink-500">{label}</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 leading-relaxed text-ink-600">{summary.detail}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.kind === "country" && (
          <>
            <button type="button" onClick={() => onSelectCountry(item.id)} className={smallButtonClass}>
              Open
            </button>
            <EvidenceDossierButton kind="country" id={item.id} />
          </>
        )}
        {item.kind === "lab" && (
          <>
            <button type="button" onClick={() => onSelectLab(item.id)} className={smallButtonClass}>
              Open
            </button>
            <EvidenceDossierButton kind="lab" id={item.id} />
          </>
        )}
        {item.kind === "instrument" && (
          <>
            <button type="button" onClick={() => onSelectInstrument(item.id)} className={smallButtonClass}>
              Filter
            </button>
            <EvidenceDossierButton kind="instrument" id={item.id} />
          </>
        )}
        <a className={smallButtonClass} href={recordRoute(item.kind, item.id)}>
          URL
        </a>
      </div>
    </article>
  );
}

function MiniMatrix({ title, rows }: { title: string; rows: Array<{ id: string; name: string; detail: string }> }) {
  return (
    <div className="rounded-lg border border-canvas-line bg-white p-3">
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <ul className="mt-3 space-y-1.5">
        {rows.map((row) => (
          <li key={row.id} className="rounded-md border border-canvas-line bg-canvas/40 px-2.5 py-2 text-xs">
            <p className="font-semibold text-ink-900">{row.name}</p>
            <p className="mt-0.5 text-ink-600">{row.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecordPanelShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-accent/25 bg-white p-4 shadow-panel">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">{subtitle}</p>
      <h3 className="mt-1 text-lg font-semibold text-ink-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function RecordMetrics({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-canvas-line bg-canvas/50 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{label}</dt>
          <dd className="mt-1 text-sm font-semibold text-ink-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RecordText({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 text-sm leading-relaxed text-ink-700">
      <span className="font-semibold text-ink-900">{label}: </span>
      {value}
    </div>
  );
}

function RecordActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>;
}

function parentRouteKind(parentType: string): RecordRouteKind {
  if (parentType === "international_instrument") return "instrument";
  if (parentType === "lab_exposure") return "exposure";
  return "rule";
}

function AtlasMapCard({
  item,
  onOpenAtlasMapMode,
  onSelectCountry,
}: {
  item: (typeof ATLAS_COMPARISON_MAPS)[number];
  onOpenAtlasMapMode: (mapMode: MapModeId) => void;
  onSelectCountry: (iso3: string) => void;
}) {
  const rows = buildAtlasPresetRows(item.presetId).slice(0, 3);
  const fills = useMemo(() => buildAtlasMapContext(item.mapMode).fills, [item.mapMode]);
  return (
    <article className="rounded-lg border border-canvas-line bg-canvas/35 p-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Comparison map
          </p>
          <h4 className="mt-0.5 text-sm font-semibold text-ink-900">{item.title}</h4>
        </div>
        <button
          type="button"
          onClick={() => onOpenAtlasMapMode(item.mapMode)}
          className="rounded-md border border-accent/30 bg-white px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent/5"
        >
          Open map
        </button>
      </div>
      <p className="mt-2 leading-relaxed text-ink-600">{item.detail}</p>
      <MiniChoroplethPreview fills={fills} label={`${item.title} mini map`} />
      <div className="mt-3 space-y-1.5">
        {rows.map((row, index) => (
          <button
            key={`${item.id}:${row.iso3}`}
            type="button"
            onClick={() => onSelectCountry(row.iso3)}
            className="grid w-full grid-cols-[1.25rem_1fr] gap-2 rounded-md bg-white px-2 py-1.5 text-left hover:bg-accent/5"
          >
            <span className="text-[10px] font-semibold text-ink-500">{index + 1}</span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-ink-900">{row.countryName}</span>
              <span className="block truncate text-[11px] text-ink-600">{row.primary}</span>
            </span>
          </button>
        ))}
      </div>
    </article>
  );
}

function MiniChoroplethPreview({ fills, label }: { fills: Record<string, string>; label: string }) {
  const points = useMemo(
    () =>
      COUNTRIES.filter((country) => country.iso3 !== "EUU" && country.iso3 !== "ATA").map((country, index) => ({
        iso3: country.iso3,
        name: country.name,
        fill: fills[country.iso3] ?? "#E5E7EB",
        point: miniMapPoint(country.region, country.iso3, index),
      })),
    [fills]
  );

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 220 92"
      className="mt-3 h-24 w-full rounded-md border border-canvas-line bg-white"
    >
      <rect x="0" y="0" width="220" height="92" fill="#F8FAFC" />
      <path d="M4 74 C46 66 65 78 98 70 C133 62 159 75 216 66" fill="none" stroke="#E2E8F0" strokeWidth="1" />
      {points.map((point) => (
        <circle
          key={point.iso3}
          cx={point.point[0]}
          cy={point.point[1]}
          r={point.fill === "#E5E7EB" ? 1.8 : 2.4}
          fill={point.fill}
          stroke="#FFFFFF"
          strokeWidth="0.4"
        >
          <title>{point.name}</title>
        </circle>
      ))}
    </svg>
  );
}

const MINI_REGION_ANCHORS: Record<string, [number, number]> = {
  "North America": [45, 29],
  "Latin America & Caribbean": [68, 62],
  Europe: [111, 27],
  "Sub-Saharan Africa": [118, 62],
  "Middle East & North Africa": [134, 44],
  Eurasia: [144, 28],
  "Central Asia": [156, 39],
  "East Asia": [180, 42],
  "Southeast Asia": [174, 61],
  "South Asia": [156, 57],
  Oceania: [194, 72],
  Supranational: [110, 12],
};

function miniMapPoint(region: string, iso3: string, index: number): [number, number] {
  const anchor = MINI_REGION_ANCHORS[region] ?? [110, 46];
  const hash = iso3.split("").reduce((sum, char) => sum + char.charCodeAt(0), index);
  const radius = 4 + (hash % 8);
  const angle = ((hash * 47) % 360) * (Math.PI / 180);
  return [
    Math.max(8, Math.min(212, anchor[0] + Math.cos(angle) * radius)),
    Math.max(8, Math.min(84, anchor[1] + Math.sin(angle) * radius)),
  ];
}

function optionsForKind(kind: WorkbenchCompareKind) {
  if (kind === "country") {
    return COUNTRIES.filter((country) => country.iso3 !== "ATA").map((country) => ({
      id: country.iso3,
      label: country.name,
    }));
  }
  if (kind === "lab") return FRONTIER_LABS.map((lab) => ({ id: lab.id, label: lab.name }));
  if (kind === "instrument") return INTERNATIONAL_INSTRUMENTS.map((instrument) => ({ id: instrument.id, label: instrument.name }));
  if (kind === "rule") {
    return [
    ...NATIONAL_AI_REGULATIONS.map((rule) => ({ id: rule.id, label: rule.name })),
    ...SUBNATIONAL_AI_RULES.map((rule) => ({ id: rule.id, label: rule.name })),
    ];
  }
  if (kind === "obligation") {
    return GOVERNANCE_OBLIGATIONS.map((obligation) => ({
      id: obligation.id,
      label: `${OBLIGATION_CATEGORY_LABELS[obligation.category]} - ${getRecordDisplayName(obligation.parentType, obligation.parentId)}`,
    }));
  }
  return LAB_REGULATORY_EXPOSURES.map((exposure) => {
    const lab = LAB_BY_ID[exposure.labId];
    const target = getLabExposureTarget(exposure);
    return {
      id: exposure.id,
      label: `${lab?.name ?? exposure.labId} - ${target.name}`,
    };
  });
}

function getCompareSummary(item: WorkbenchCompareItem) {
  if (item.kind === "country") {
    const summary = getCountryGovernanceSummary(item.id);
    const obligations = getCountryObligations(item.id);
    const atlas = getCountryAtlasSummary(item.id);
    return {
      title: summary.country?.name ?? item.id,
      metrics: [
        ["Binding", summary.hasBindingNationalLaw ? "Yes" : "No"],
        ["Rules", String(summary.nationalRegulations.length)],
        ["Obligations", String(obligations.length)],
        ["Oxford", formatAtlasScore(atlas.oxford)],
        ["CAIDP", formatAtlasScore(atlas.caidp)],
        ["RAM", atlas.unescoRam ? READINESS_STATUS_LABELS[atlas.unescoRam.status] : "No data"],
      ],
      detail: `${summarizeObligationCategories(obligations)} Atlas indicators are context only and do not establish legal duties.`,
    };
  }
  if (item.kind === "lab") {
    const lab = LAB_BY_ID[item.id];
    const exposures = getLabRegulatoryExposures(item.id);
    const obligations = getLabObligations(item.id);
    const intelligence = getLabIntelligenceSummary(item.id);
    return {
      title: lab?.name ?? item.id,
      metrics: [
        ["HQ", lab?.hqCountryName ?? ""],
        ["Exposure", String(exposures.length)],
        ["Binding", String(exposures.filter((row) => row.legalEffect === "binding").length)],
        ["Obligations", String(obligations.length)],
        ["Safety evidence", String(intelligence?.modelGovernanceEvidence.length ?? 0)],
        ["Evaluations", String(intelligence?.safetyEvaluationRecords.length ?? 0)],
      ],
      detail: exposureEffectSummary(exposures),
    };
  }
  if (item.kind === "instrument") {
    const instrument = INSTRUMENT_BY_ID[item.id];
    const obligations = getInstrumentObligations(item.id);
    const rows = PARTICIPATION_BY_INSTRUMENT[item.id] ?? [];
    return {
      title: instrument?.name ?? item.id,
      metrics: [
        ["Effect", instrument ? INSTRUMENT_BINDING_LABELS[instrument.bindingStatus] : ""],
        ["Rows", String(rows.length)],
        ["Obligations", String(obligations.length)],
        ["Date", instrument?.date ?? ""],
      ],
      detail: instrument?.summary ?? "",
    };
  }
  if (item.kind === "obligation") {
    const obligation = OBLIGATION_BY_ID[item.id];
    return {
      title: obligation ? OBLIGATION_CATEGORY_LABELS[obligation.category] : item.id,
      metrics: [
        ["Effect", obligation ? obligationEffectLabel(obligation.legalEffect) : ""],
        ["Directness", obligation?.directness ?? ""],
        ["Jurisdiction", obligation?.jurisdiction ?? ""],
        ["Source", obligation?.confidence ? DATA_CONFIDENCE_LABELS[obligation.confidence] : ""],
      ],
      detail: obligation
        ? `${obligation.summary} ${obligation.caveat ?? ""}`.trim()
        : "Obligation record not found.",
    };
  }
  if (item.kind === "exposure") {
    const exposure = LAB_REGULATORY_EXPOSURES.find((row) => row.id === item.id);
    const lab = exposure ? LAB_BY_ID[exposure.labId] : null;
    const target = exposure ? getLabExposureTarget(exposure) : null;
    return {
      title: exposure && target ? `${lab?.name ?? exposure.labId} - ${target.name}` : item.id,
      metrics: [
        ["Effect", exposure ? LAB_EXPOSURE_EFFECT_LABELS[exposure.legalEffect] : ""],
        ["Directness", exposure?.directness ?? ""],
        ["Strength", exposure ? String(exposure.strength) : ""],
        ["Source", exposure?.confidence ? DATA_CONFIDENCE_LABELS[exposure.confidence] : ""],
      ],
      detail: exposure
        ? `${exposure.rationale} ${exposure.notes ?? ""}`.trim()
        : "Exposure row not found.",
    };
  }
  const rule = NATIONAL_REG_BY_ID[item.id] ?? SUBNATIONAL_BY_ID[item.id];
  const obligations = getRuleObligations(item.id);
  const implementation = getRuleImplementationMilestones(item.id);
  return {
    title: rule?.name ?? item.id,
    metrics: [
      ["Effect", rule?.bindingStatus ?? ""],
      ["Status", rule?.status ?? ""],
      ["Obligations", String(obligations.length)],
      ["Milestones", String(implementation.length)],
    ],
    detail: rule?.summary ?? "",
  };
}

function renderComparisonCsv(items: WorkbenchCompareItem[]): string {
  const rows = [["kind", "id", "title", "metric", "value", "detail"]];
  items.forEach((item) => {
    const summary = getCompareSummary(item);
    if (!summary.metrics.length) {
      rows.push([item.kind, item.id, summary.title, "", "", summary.detail]);
      return;
    }
    summary.metrics.forEach(([metric, value]) => {
      rows.push([item.kind, item.id, summary.title, metric, value, summary.detail]);
    });
  });
  return rows.map(csvRow).join("\n");
}

function renderScenarioCsv(
  labId: string,
  marketIso3s: string[],
  scenario: ReturnType<typeof buildScenarioAssessment>
): string {
  const rows = [["lab", "markets", "category", "target", "legal_effect", "directness", "strength", "rationale", "source_url"]];
  if (!scenario) return rows.map(csvRow).join("\n");
  const lab = LAB_BY_ID[labId];
  const markets = marketIso3s.map((iso3) => COUNTRY_BY_ISO3[iso3]?.name ?? iso3).join("; ");
  scenario.exposureRows.forEach((row) => {
    const target = getLabExposureTarget(row);
    rows.push([
      lab?.name ?? labId,
      markets,
      "regulatory_exposure",
      target.name,
      LAB_EXPOSURE_EFFECT_LABELS[row.legalEffect],
      row.directness,
      String(row.strength),
      row.rationale,
      row.sourceUrl,
    ]);
  });
  scenario.modelGovernanceEvidence.forEach((row) => {
    rows.push([
      lab?.name ?? labId,
      markets,
      "model_governance_evidence",
      row.title,
      "context",
      "evidence",
      "",
      row.summary,
      row.sourceUrl,
    ]);
  });
  scenario.safetyEvaluationRecords.forEach((row) => {
    rows.push([
      lab?.name ?? labId,
      markets,
      "safety_evaluation",
      row.evaluationBody,
      "context",
      row.publicResult,
      "",
      row.summary,
      row.sourceUrl,
    ]);
  });
  scenario.computeDependencyRecords.forEach((row) => {
    rows.push([
      lab?.name ?? labId,
      markets,
      "compute_dependency",
      row.infrastructureId,
      "infrastructure_context",
      row.directness,
      String(row.strength),
      row.summary,
      row.sourceUrl,
    ]);
  });
  return rows.map(csvRow).join("\n");
}

function csvRow(values: string[]): string {
  return values.map((value) => `"${value.replace(/"/g, '""')}"`).join(",");
}

const smallButtonClass =
  "inline-flex items-center rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent";

/**
 * Secondary Workbench sections. Collapsed by default so the question and its
 * answer own the fold: expanded, these five contributed roughly 250 of the
 * view's 296 controls and pushed the answer off screen.
 */
function CollapsibleSection({
  summary,
  note,
  children,
}: {
  summary: string;
  note: string;
  children: React.ReactNode;
}) {
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <details
      className="mt-3 rounded-lg border border-canvas-line bg-white [&[open]>summary]:border-b [&[open]>summary]:border-canvas-line"
      onToggle={(event) => {
        if (event.currentTarget.open) setHasOpened(true);
      }}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink-900">{summary}</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-600">{note}</span>
        </span>
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-ink-500"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      {hasOpened ? <div className="p-3 pt-2">{children}</div> : null}
    </details>
  );
}
