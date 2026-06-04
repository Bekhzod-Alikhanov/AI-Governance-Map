import { useMemo, useState } from "react";
import clsx from "clsx";
import { COUNTRIES, COUNTRY_BY_ISO3 } from "../data/countries";
import { FRONTIER_LABS, LAB_BY_ID } from "../data/frontierLabs";
import {
  GOVERNANCE_OBLIGATIONS,
  OBLIGATION_CATEGORY_LABELS,
} from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES, IMPLEMENTATION_STATUS_LABELS } from "../data/implementationMilestones";
import { INTERNATIONAL_INSTRUMENTS, INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { PARTICIPATION_BY_INSTRUMENT } from "../data/participation";
import { SUBNATIONAL_AI_RULES, SUBNATIONAL_BY_ID } from "../data/subnationalRules";
import { DEFAULT_FILTER_STATE, type FilterState } from "../types";
import type { RecordRoute } from "../utils/recordRoutes";
import { recordRoute } from "../utils/recordRoutes";
import { DATA_SNAPSHOT_DATE } from "../utils/governanceTaxonomy";
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
import { type AtlasPresetId, buildAtlasPresetRows } from "../utils/aiAtlas";
import { INSTRUMENT_BINDING_LABELS } from "../utils/getParticipationLabel";
import { DATA_CONFIDENCE_LABELS } from "../utils/getVerificationLabel";
import { SourceLink } from "./SourceLink";
import { VerificationMeta } from "./VerificationMeta";
import { EvidenceDossierButton } from "./EvidenceDossierButton";
import { CorrectionLink } from "./CorrectionLink";

type CompareKind = "country" | "lab" | "instrument" | "rule";

interface CompareSelection {
  kind: CompareKind;
  id: string;
}

interface Props {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSelectCountry: (iso3: string) => void;
  onSelectLab: (labId: string) => void;
  onSelectInstrument: (instrumentId: string) => void;
  onOpenMethodology: () => void;
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

export function WorkbenchView({
  filters,
  onFiltersChange,
  onSelectCountry,
  onSelectLab,
  onSelectInstrument,
  onOpenMethodology,
  routeRecord,
}: Props) {
  const [compareKind, setCompareKind] = useState<CompareKind>("country");
  const [compareId, setCompareId] = useState("USA");
  const [compareItems, setCompareItems] = useState<CompareSelection[]>([
    { kind: "country", id: "USA" },
    { kind: "country", id: "EUU" },
  ]);
  const [scenarioLabId, setScenarioLabId] = useState("openai");
  const [scenarioMarkets, setScenarioMarkets] = useState(["EUU", "USA", "GBR", "KOR"]);
  const [atlasPresetId, setAtlasPresetId] = useState<AtlasPresetId>("high-readiness-no-binding");

  const answerCards = useMemo(() => buildWorkbenchAnswerCards(filters), [filters]);
  const atlasRows = useMemo(() => buildAtlasPresetRows(atlasPresetId), [atlasPresetId]);
  const scenario = useMemo(
    () => buildScenarioAssessment(scenarioLabId, scenarioMarkets),
    [scenarioLabId, scenarioMarkets]
  );
  const compareOptions = optionsForKind(compareKind);

  function applyWorkflow(patch: Partial<FilterState>) {
    onFiltersChange({ ...DEFAULT_FILTER_STATE, ...patch });
  }

  function addCompareItem() {
    if (!compareId) return;
    setCompareItems((current) => {
      if (current.some((item) => item.kind === compareKind && item.id === compareId)) return current;
      return [...current, { kind: compareKind, id: compareId }].slice(-4);
    });
  }

  return (
    <div className="policy-scroll h-full overflow-auto bg-canvas-surface">
      <div className="mx-auto max-w-[1600px] px-4 py-4">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-canvas-line pb-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Research-grade workbench · snapshot {DATA_SNAPSHOT_DATE}
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

        <section className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-lg border border-canvas-line bg-white p-3">
            <h3 className="text-sm font-semibold text-ink-900">Research workflows</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {WORKFLOWS.map((workflow) => (
                <button
                  key={workflow.id}
                  type="button"
                  onClick={() => applyWorkflow(workflow.patch)}
                  className="rounded-lg border border-canvas-line bg-canvas/40 px-3 py-2 text-left hover:border-accent hover:bg-accent/5"
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
                  <p className="mt-1 text-lg font-semibold text-ink-900">{card.value}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-600">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                  onClick={() => setAtlasPresetId(preset.id)}
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

        <section className="mt-4 grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-canvas-line bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Comparison builder</h3>
                <p className="text-xs text-ink-600">Compare up to four records side by side.</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  value={compareKind}
                  onChange={(event) => {
                    const nextKind = event.target.value as CompareKind;
                    setCompareKind(nextKind);
                    setCompareId(optionsForKind(nextKind)[0]?.id ?? "");
                  }}
                  className="h-8 rounded-md border border-canvas-line bg-white px-2 text-xs text-ink-800"
                >
                  <option value="country">Countries</option>
                  <option value="lab">Labs</option>
                  <option value="instrument">Instruments</option>
                  <option value="rule">Rules</option>
                </select>
                <select
                  value={compareId}
                  onChange={(event) => setCompareId(event.target.value)}
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
                  onRemove={() =>
                    setCompareItems((current) =>
                      current.filter((candidate) => candidate.kind !== item.kind || candidate.id !== item.id)
                    )
                  }
                  onSelectCountry={onSelectCountry}
                  onSelectLab={onSelectLab}
                  onSelectInstrument={onSelectInstrument}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-canvas-line bg-white p-3">
            <h3 className="text-sm font-semibold text-ink-900">Regulatory scenario</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-600">
              Select a lab and likely deployment markets. Results come from structured exposure and obligation rows only.
            </p>
            <label className="mt-3 block text-xs font-medium text-ink-700">
              Lab
              <select
                value={scenarioLabId}
                onChange={(event) => setScenarioLabId(event.target.value)}
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
                    onClick={() =>
                      setScenarioMarkets((current) =>
                        current.includes(iso3) ? current.filter((item) => item !== iso3) : [...current, iso3]
                      )
                    }
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
              { id: "full", name: "/data/full-dataset.json", detail: "Full static research snapshot" },
              { id: "obligations", name: "/data/obligation-matrix.json", detail: "Structured obligation rows" },
              { id: "labs", name: "/data/lab-exposure-matrix.json", detail: "Lab regulatory-exposure matrix" },
            ]}
          />
        </section>
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
        <RecordText label="Research summary" value={`${summary.country.name} has ${summary.nationalRegulations.length} national entries, ${summary.participations.length} international rows, and ${summary.hqLabs.length} headquartered frontier lab(s) in this snapshot.`} />
        <RecordText label="Obligations" value={summarizeObligationCategories(obligations)} />
        <RecordText label="Implementation" value={summarizeImplementationStatuses(implementation)} />
        <RecordActions>
          <button type="button" onClick={() => onSelectCountry(summary.country!.iso3)} className={smallButtonClass}>
            Open drawer
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
            ["Power", `${lab.powerScore}/5`],
          ]}
        />
        <RecordText label="Research summary" value={lab.summary} />
        <RecordText label="Exposure" value={exposureEffectSummary(exposures)} />
        <RecordText label="Obligations" value={summarizeObligationCategories(obligations)} />
        <RecordActions>
          <button type="button" onClick={() => onSelectLab(lab.id)} className={smallButtonClass}>
            Open drawer
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

function CompareCard({
  item,
  onRemove,
  onSelectCountry,
  onSelectLab,
  onSelectInstrument,
}: {
  item: CompareSelection;
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
        <a className={smallButtonClass} href={recordRoute(item.kind === "rule" ? "rule" : item.kind, item.id)}>
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

function optionsForKind(kind: CompareKind) {
  if (kind === "country") {
    return COUNTRIES.filter((country) => country.iso3 !== "ATA").map((country) => ({
      id: country.iso3,
      label: country.name,
    }));
  }
  if (kind === "lab") return FRONTIER_LABS.map((lab) => ({ id: lab.id, label: lab.name }));
  if (kind === "instrument") return INTERNATIONAL_INSTRUMENTS.map((instrument) => ({ id: instrument.id, label: instrument.name }));
  return [
    ...NATIONAL_AI_REGULATIONS.map((rule) => ({ id: rule.id, label: rule.name })),
    ...SUBNATIONAL_AI_RULES.map((rule) => ({ id: rule.id, label: rule.name })),
  ];
}

function getCompareSummary(item: CompareSelection) {
  if (item.kind === "country") {
    const summary = getCountryGovernanceSummary(item.id);
    const obligations = getCountryObligations(item.id);
    const implementation = getCountryImplementationMilestones(item.id);
    return {
      title: summary.country?.name ?? item.id,
      metrics: [
        ["Binding", summary.hasBindingNationalLaw ? "Yes" : "No"],
        ["Rules", String(summary.nationalRegulations.length)],
        ["Obligations", String(obligations.length)],
        ["Milestones", String(implementation.length)],
      ],
      detail: summarizeObligationCategories(obligations),
    };
  }
  if (item.kind === "lab") {
    const lab = LAB_BY_ID[item.id];
    const exposures = getLabRegulatoryExposures(item.id);
    const obligations = getLabObligations(item.id);
    return {
      title: lab?.name ?? item.id,
      metrics: [
        ["HQ", lab?.hqCountryName ?? ""],
        ["Exposure", String(exposures.length)],
        ["Binding", String(exposures.filter((row) => row.legalEffect === "binding").length)],
        ["Obligations", String(obligations.length)],
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

const smallButtonClass =
  "inline-flex items-center rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent";
