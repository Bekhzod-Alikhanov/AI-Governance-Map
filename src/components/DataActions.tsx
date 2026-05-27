import { useEffect, useRef, useState } from "react";
import { downloadCitationText, downloadDatasetJson } from "../utils/exportDataset";

interface Props {
  onOpenMethodology: () => void;
}

export function DataActions({ onOpenMethodology }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        className="rounded-md border border-canvas-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-canvas"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="data-actions-menu"
      >
        Data
      </button>

      {open && (
        <div
          id="data-actions-menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-canvas-line bg-white p-2 text-xs shadow-drawer"
        >
          <button
            type="button"
            onClick={() => {
              downloadDatasetJson();
              setOpen(false);
            }}
            className="block w-full rounded-md px-2.5 py-2 text-left font-medium text-ink-800 hover:bg-canvas"
          >
            Download dataset JSON
          </button>
          <button
            type="button"
            onClick={() => {
              downloadCitationText();
              setOpen(false);
            }}
            className="block w-full rounded-md px-2.5 py-2 text-left font-medium text-ink-800 hover:bg-canvas"
          >
            Download citation
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenMethodology();
              setOpen(false);
            }}
            className="block w-full rounded-md px-2.5 py-2 text-left font-medium text-ink-800 hover:bg-canvas"
          >
            Methodology
          </button>
          <a
            href="https://github.com/Bekhzod-Alikhanov/global-ai-governance-map/blob/main/docs/SOURCE_VERIFICATION_2026-05-20.md"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md px-2.5 py-2 font-medium text-ink-800 hover:bg-canvas"
          >
            Source verification notes
          </a>
          <p className="border-t border-canvas-line px-2.5 pt-2 text-[10px] leading-snug text-ink-500">
            Static May 2026 research snapshot. Verify time-sensitive legal status against official sources.
          </p>
        </div>
      )}
    </div>
  );
}
