import { useState } from "react";

export function DataQualityNotice() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div
      role="note"
      className="z-10 flex shrink-0 items-start gap-3 border-b border-amber-200 bg-amber-50/85 px-5 py-1.5 text-xs leading-relaxed text-amber-950"
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-amber-700"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <p className="flex-1">
        <span className="font-semibold">Snapshot: 19 May 2026.</span> Research dashboard, not legal advice. Verify
        time-sensitive legal status against official sources. Scope excludes general privacy, export-control,
        semiconductor, and cybersecurity instruments unless explicitly AI-specific.
      </p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss data-quality notice"
        className="rounded p-1 text-amber-700 hover:bg-amber-100"
      >
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
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
