import { useEffect, useRef, useState } from "react";
import { RESEARCH_PRESETS } from "../data/researchPresets";
import type { ResearchPreset } from "../types";

interface Props {
  activePresetId: string | null;
  onApplyPreset: (preset: ResearchPreset) => void;
}

export function ResearchQuestionsPanel({ activePresetId, onApplyPreset }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activePreset = activePresetId
    ? RESEARCH_PRESETS.find((preset) => preset.id === activePresetId)
    : null;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        className="rounded-md border border-canvas-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-canvas"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="research-question-menu"
      >
        Questions
      </button>

      {open && (
        <div
          id="research-question-menu"
          className="policy-scroll absolute right-0 top-full z-50 mt-2 w-[min(520px,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto rounded-lg border border-canvas-line bg-white p-2 text-xs shadow-drawer"
        >
          <div className="border-b border-canvas-line px-2 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              Research questions
            </p>
            <p className="mt-1 leading-relaxed text-ink-600">
              Apply a question to set the lens, filters, and relevant selected node.
            </p>
            {activePreset && (
              <p className="mt-2 rounded-md bg-accent/10 px-2 py-1.5 text-[11px] leading-relaxed text-accent">
                Active: {activePreset.title}
              </p>
            )}
          </div>
          <div className="mt-2 space-y-1">
            {RESEARCH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onApplyPreset(preset);
                  setOpen(false);
                }}
                className="block w-full rounded-md px-2.5 py-2 text-left hover:bg-canvas"
              >
                <span className="block font-semibold text-ink-900">{preset.title}</span>
                <span className="mt-0.5 block leading-relaxed text-ink-600">{preset.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
