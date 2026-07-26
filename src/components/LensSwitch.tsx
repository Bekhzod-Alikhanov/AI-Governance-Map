import clsx from "clsx";
import type { LensKind } from "../types";

interface Props {
  value: LensKind;
  onChange: (next: LensKind) => void;
}

/** Id of the element the lens tabs control. Applied to <main> in App.tsx. */
export const LENS_PANEL_ID = "main-content";

function tabId(lens: LensKind) {
  return `lens-tab-${lens}`;
}

const LENSES: Array<{ id: LensKind; label: string; icon: React.ReactNode }> = [
  {
    id: "workbench",
    label: "Workbench",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16" />
        <path d="M4 12h10" />
        <path d="M4 19h7" />
        <path d="m16 16 2 2 4-5" />
      </svg>
    ),
  },
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
  // role="tab" is a promise about keyboard behaviour: arrow keys move between
  // tabs, only the selected tab is in the tab order, and each tab points at the
  // panel it controls. Declaring the roles without these is worse than using
  // plain buttons, because a screen reader announces navigation that isn't there.
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = LENSES.findIndex((lens) => lens.id === value);
    if (currentIndex < 0) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % LENSES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + LENSES.length) % LENSES.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = LENSES.length - 1;
    }
    if (nextIndex === null) return;

    event.preventDefault();
    const nextLens = LENSES[nextIndex];
    onChange(nextLens.id);
    // Focus follows selection, per the ARIA tabs pattern.
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>(`#${tabId(nextLens.id)}`)
      ?.focus();
  }

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
            id={tabId(lens.id)}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={LENS_PANEL_ID}
            tabIndex={active ? 0 : -1}
            onKeyDown={handleKeyDown}
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
