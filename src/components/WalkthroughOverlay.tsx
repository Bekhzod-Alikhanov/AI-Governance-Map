import { useEffect } from "react";
import clsx from "clsx";
import { WALKTHROUGH_STEPS } from "../data/walkthrough";
import type { LensKind, FilterState } from "../types";
import { useDialogFocus } from "../utils/useDialogFocus";

interface Props {
  stepIndex: number;
  onStepChange: (next: number) => void;
  onApplyStep: (filterPatch: Partial<FilterState>, lens: LensKind) => void;
  onClose: () => void;
}

export function WalkthroughOverlay({ stepIndex, onStepChange, onApplyStep, onClose }: Props) {
  const step = WALKTHROUGH_STEPS[stepIndex];
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);

  useEffect(() => {
    if (!step) return;
    onApplyStep(step.filterPatch ?? {}, step.lens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" && stepIndex < WALKTHROUGH_STEPS.length - 1)
        onStepChange(stepIndex + 1);
      if (e.key === "ArrowLeft" && stepIndex > 0) onStepChange(stepIndex - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepIndex, onStepChange, onClose]);

  if (!step) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={`Walkthrough - ${step.title}`}
      className="pointer-events-auto fixed bottom-6 left-1/2 z-40 w-[min(640px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl border border-canvas-line bg-white shadow-drawer"
    >
      <div className="flex items-start gap-4 p-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
          {stepIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Guided walkthrough - {stepIndex + 1} of {WALKTHROUGH_STEPS.length}
          </p>
          <h2 className="mt-0.5 text-sm font-semibold leading-tight text-ink-900">{step.title}</h2>
          <p className="mt-2 text-xs leading-relaxed text-ink-700">{step.narrative}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Exit walkthrough"
          className="rounded p-1 text-ink-500 hover:bg-canvas"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-canvas-line bg-canvas/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          {WALKTHROUGH_STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Jump to step ${i + 1}`}
              onClick={() => onStepChange(i)}
              className={clsx(
                "h-1.5 w-6 rounded-full transition-colors",
                i === stepIndex ? "bg-accent" : "bg-canvas-line hover:bg-ink-400"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStepChange(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="rounded-md border border-canvas-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:border-ink-400 disabled:opacity-40"
          >
            Previous
          </button>
          {stepIndex < WALKTHROUGH_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => onStepChange(stepIndex + 1)}
              className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-accent/90"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-ink-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-ink-700"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
