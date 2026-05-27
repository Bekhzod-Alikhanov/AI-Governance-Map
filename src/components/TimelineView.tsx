import { useMemo, useState } from "react";
import clsx from "clsx";
import { FRONTIER_LABS } from "../data/frontierLabs";
import { INFRASTRUCTURE_NODES } from "../data/infrastructure";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { SUBNATIONAL_AI_RULES } from "../data/subnationalRules";
import type { TimelineLane } from "../types";
import { DATA_SNAPSHOT_DATE } from "../utils/governanceTaxonomy";
import { SourceLink } from "./SourceLink";

interface TimelineItem {
  id: string;
  date: string;
  year: number;
  category: "international" | "national" | "subnational" | "labs_infrastructure";
  lane: TimelineLane;
  title: string;
  jurisdiction: string;
  bindingHint: string;
  sourceName: string;
  sourceUrl: string;
  frontierAIRelevant: boolean;
}

interface Props {
  lane: TimelineLane;
  onLaneChange: (lane: TimelineLane) => void;
  frontierOnly: boolean;
  onFrontierOnlyChange: (frontierOnly: boolean) => void;
}

const LANES: Array<{ id: TimelineLane; label: string }> = [
  { id: "all", label: "All" },
  { id: "international", label: "International" },
  { id: "national_binding", label: "National binding" },
  { id: "national_proposed", label: "National proposed" },
  { id: "standards", label: "Standards" },
  { id: "labs_infrastructure", label: "Labs/infrastructure" },
];

function pickDate(input?: string): string | null {
  if (!input) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(input)) return input.slice(0, 10);
  if (/^\d{4}$/.test(input)) return `${input}-01-01`;
  return null;
}

export function TimelineView({ lane, onLaneChange, frontierOnly, onFrontierOnlyChange }: Props) {
  const items = useMemo<TimelineItem[]>(() => {
    const rows: TimelineItem[] = [];
    for (const inst of INTERNATIONAL_INSTRUMENTS) {
      const d = pickDate(inst.date);
      if (!d) continue;
      rows.push({
        id: `inst:${inst.id}`,
        date: d,
        year: Number(d.slice(0, 4)),
        category: "international",
        lane: inst.bindingStatus === "standard" || inst.organizationType === "ISO/IEC" ? "standards" : "international",
        title: inst.name,
        jurisdiction: inst.organizationType,
        bindingHint: inst.bindingStatus.replace(/_/g, " "),
        sourceName: inst.sourceName,
        sourceUrl: inst.sourceUrl,
        frontierAIRelevant: inst.frontierAIRelevant,
      });
    }
    for (const reg of NATIONAL_AI_REGULATIONS) {
      const d = pickDate(reg.dateInForce ?? reg.dateAdopted);
      if (!d) continue;
      rows.push({
        id: `nat:${reg.id}`,
        date: d,
        year: Number(d.slice(0, 4)),
        category: "national",
        lane: reg.bindingStatus === "proposed" || reg.type === "proposed_law" ? "national_proposed" : "national_binding",
        title: reg.name,
        jurisdiction: reg.jurisdiction,
        bindingHint: reg.bindingStatus,
        sourceName: reg.sourceName,
        sourceUrl: reg.sourceUrl,
        frontierAIRelevant: reg.frontierAIRelevant,
      });
    }
    for (const sub of SUBNATIONAL_AI_RULES) {
      const d = pickDate(sub.dateInForce ?? sub.dateAdopted);
      if (!d) continue;
      rows.push({
        id: `sub:${sub.id}`,
        date: d,
        year: Number(d.slice(0, 4)),
        category: "subnational",
        lane: sub.bindingStatus === "proposed" || sub.type === "proposed_law" ? "national_proposed" : "national_binding",
        title: sub.name,
        jurisdiction: `${sub.jurisdictionName} (${sub.countryIso3})`,
        bindingHint: sub.bindingStatus,
        sourceName: sub.sourceName,
        sourceUrl: sub.sourceUrl,
        frontierAIRelevant: true,
      });
    }
    for (const lab of FRONTIER_LABS) {
      rows.push({
        id: `lab:${lab.id}`,
        date: DATA_SNAPSHOT_DATE,
        year: Number(DATA_SNAPSHOT_DATE.slice(0, 4)),
        category: "labs_infrastructure",
        lane: "labs_infrastructure",
        title: lab.name,
        jurisdiction: `HQ: ${lab.hqCountryName}`,
        bindingHint: lab.isFMFMember ? "frontier lab / FMF member" : "frontier lab",
        sourceName: lab.sourceName,
        sourceUrl: lab.sourceUrl,
        frontierAIRelevant: true,
      });
    }
    for (const node of INFRASTRUCTURE_NODES) {
      rows.push({
        id: `infra:${node.id}`,
        date: DATA_SNAPSHOT_DATE,
        year: Number(DATA_SNAPSHOT_DATE.slice(0, 4)),
        category: "labs_infrastructure",
        lane: "labs_infrastructure",
        title: node.name,
        jurisdiction: node.jurisdiction ?? "Infrastructure",
        bindingHint: node.type.replace(/_/g, " "),
        sourceName: node.sourceName,
        sourceUrl: node.sourceUrl,
        frontierAIRelevant: true,
      });
    }
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const [categoryFilter, setCategoryFilter] = useState<"all" | TimelineItem["category"]>("all");
  const visible = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (lane !== "all" && item.lane !== lane) return false;
    if (frontierOnly && !item.frontierAIRelevant) return false;
    return true;
  });

  const years = [...new Set(visible.map((i) => i.year))].sort((a, b) => a - b);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas-surface">
      <header className="flex items-center justify-between border-b border-canvas-line px-5 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Chronology of AI governance</h2>
        <p className="text-xs text-ink-700">
          Showing <span className="font-semibold text-ink-900">{visible.length}</span> AI governance
          milestones from {years[0] ?? "—"} to {years[years.length - 1] ?? "—"}.
        </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-canvas-line">
          {LANES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onLaneChange(item.id)}
              className={clsx(
                "whitespace-nowrap px-2.5 py-1 text-[11px] font-medium transition-colors",
                lane === item.id ? "bg-accent text-white" : "bg-white text-ink-700 hover:bg-canvas"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-canvas-line">
          {(["all", "international", "national", "subnational"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={clsx(
                "px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                categoryFilter === c ? "bg-ink-800 text-white" : "bg-white text-ink-700 hover:bg-canvas"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-ink-700">
          <input
            type="checkbox"
            checked={frontierOnly}
            onChange={(event) => onFrontierOnlyChange(event.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer rounded border-canvas-line text-accent focus:ring-accent"
          />
          Frontier only
        </label>
        </div>
      </header>

      <div className="policy-scroll flex-1 overflow-y-auto px-5 py-4">
        <ol className="relative border-l border-canvas-line pl-5">
          {visible.map((item) => (
            <li key={item.id} className="mb-4">
              <span
                aria-hidden="true"
                className={clsx(
                  "absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white",
                  item.category === "international" && "bg-violet-600",
                  item.category === "national" && "bg-blue-700",
                  item.category === "subnational" && "bg-emerald-600",
                  item.category === "labs_infrastructure" && "bg-ink-800"
                )}
              />
              <p className="text-[11px] uppercase tracking-wide text-ink-500">
                {item.date} · {item.jurisdiction} · {item.bindingHint}
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-ink-900">{item.title}</p>
              <div className="mt-1">
                <SourceLink name={item.sourceName} url={item.sourceUrl} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
