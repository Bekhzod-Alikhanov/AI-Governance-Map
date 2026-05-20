import { useState } from "react";

const FILLS = [
  { color: "#E5E7EB", label: "No included AI-specific entry" },
  { color: "#BFDBFE", label: "Guidance, strategy, or voluntary framework only" },
  { color: "#60A5FA", label: "Proposed law or mixed legal effect" },
  { color: "#1D4ED8", label: "Binding AI-specific law applies" },
];

const OUTLINES = [
  { color: "#B45309", label: "Matches selected international instrument" },
  { color: "#6D28D9", label: "Ratified binding AI treaty", dashed: false },
  { color: "#6D28D9", label: "Signed only; not ratified", dashed: true },
];

export function Legend() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-canvas-line bg-white shadow-panel">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Legend
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
          className={`text-ink-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="grid gap-3 border-t border-canvas-line px-4 py-3 text-xs text-ink-700 md:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Country fill
            </p>
            <ul className="space-y-1.5">
              {FILLS.map((f) => (
                <li key={f.label} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3.5 w-5 rounded-sm border border-ink-400/30"
                    style={{ backgroundColor: f.color }}
                  />
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Outline
            </p>
            <ul className="space-y-1.5">
              {OUTLINES.map((o) => (
                <li key={o.label} className="flex items-center gap-2">
                  <svg width="20" height="14" viewBox="0 0 20 14">
                    <rect
                      x="1"
                      y="1"
                      width="18"
                      height="12"
                      rx="2"
                      fill="none"
                      stroke={o.color}
                      strokeWidth="1.5"
                      strokeDasharray={o.dashed ? "3 2" : undefined}
                    />
                  </svg>
                  <span>{o.label}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 pt-1 text-ink-500">
                <span className="inline-block h-3.5 w-5 rounded-sm bg-canvas-line opacity-25" />
                <span>Dimmed: does not match active filter</span>
              </li>
            </ul>
          </div>
          <p className="md:col-span-2 rounded-md bg-canvas px-2 py-1.5 text-[11px] leading-relaxed text-ink-600">
            Map colors are dataset classifications, not legal conclusions. EU member states can show binding
            applicability through the EU AI Act rather than a separate national AI law.
          </p>
        </div>
      )}
    </div>
  );
}
