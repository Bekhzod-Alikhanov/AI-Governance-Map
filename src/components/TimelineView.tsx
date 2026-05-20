import { useMemo, useState } from "react";
import clsx from "clsx";
import { INTERNATIONAL_INSTRUMENTS } from "../data/internationalInstruments";
import { NATIONAL_AI_REGULATIONS } from "../data/nationalAIRegulations";
import { SUBNATIONAL_AI_RULES } from "../data/subnationalRules";
import { SourceLink } from "./SourceLink";

interface TimelineItem {
  id: string;
  date: string;
  year: number;
  category: "international" | "national" | "subnational";
  title: string;
  jurisdiction: string;
  bindingHint: string;
  sourceName: string;
  sourceUrl: string;
}

function pickDate(input?: string): string | null {
  if (!input) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(input)) return input.slice(0, 10);
  if (/^\d{4}$/.test(input)) return `${input}-01-01`;
  return null;
}

export function TimelineView() {
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
        title: inst.name,
        jurisdiction: inst.organizationType,
        bindingHint: inst.bindingStatus.replace(/_/g, " "),
        sourceName: inst.sourceName,
        sourceUrl: inst.sourceUrl,
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
        title: reg.name,
        jurisdiction: reg.jurisdiction,
        bindingHint: reg.bindingStatus,
        sourceName: reg.sourceName,
        sourceUrl: reg.sourceUrl,
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
        title: sub.name,
        jurisdiction: `${sub.jurisdictionName} (${sub.countryIso3})`,
        bindingHint: sub.bindingStatus,
        sourceName: sub.sourceName,
        sourceUrl: sub.sourceUrl,
      });
    }
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const [filter, setFilter] = useState<"all" | TimelineItem["category"]>("all");
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);

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
        <div className="inline-flex overflow-hidden rounded-lg border border-canvas-line">
          {(["all", "international", "national", "subnational"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={clsx(
                "px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                filter === c ? "bg-accent text-white" : "bg-white text-ink-700 hover:bg-canvas"
              )}
            >
              {c}
            </button>
          ))}
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
                  item.category === "subnational" && "bg-emerald-600"
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
