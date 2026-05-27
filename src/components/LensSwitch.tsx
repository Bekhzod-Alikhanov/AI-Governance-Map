import clsx from "clsx";
import type { LensKind } from "../types";

interface Props {
  value: LensKind;
  onChange: (next: LensKind) => void;
}

const LENSES: Array<{ id: LensKind; label: string; icon: React.ReactNode }> = [
  {
    id: "geography",
    label: "Geography",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    id: "layer",
    label: "Layers",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="M2 12l10 5 10-5" />
        <path d="M2 17l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: "network",
    label: "Network",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="m8 8 2.5 2.5M16 8l-2.5 2.5M8 16l2.5-2.5M16 16l-2.5-2.5" />
      </svg>
    ),
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "table",
    label: "Table",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16" />
        <path d="M4 12h16" />
        <path d="M4 19h16" />
        <path d="M9 5v14" />
      </svg>
    ),
  },
];

export function LensSwitch({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="View lens"
      className="inline-flex items-center overflow-hidden rounded-lg border border-canvas-line bg-white"
    >
      {LENSES.map((lens) => {
        const active = value === lens.id;
        return (
          <button
            key={lens.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(lens.id)}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-accent text-white"
                : "text-ink-700 hover:bg-canvas"
            )}
          >
            {lens.icon}
            <span>{lens.label}</span>
          </button>
        );
      })}
    </div>
  );
}
