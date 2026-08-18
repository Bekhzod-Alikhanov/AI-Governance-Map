import { useEffect, useRef, useState } from "react";
import { DATASET_RELEASES } from "../data/datasetReleases";
import { RELEASE_METADATA } from "../data/releaseMetadata";
import type { FilterState } from "../types";

interface Props {
  onOpenMethodology: () => void;
  filters: FilterState;
}

export function DataActions({ onOpenMethodology, filters }: Props) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState<"dataset" | "filtered" | "citation" | null>(null);
  const [reviewQueueCount, setReviewQueueCount] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentRelease =
    DATASET_RELEASES.find(
      (release) => release.id === RELEASE_METADATA.releaseId && release.status === "published"
    ) ?? [...DATASET_RELEASES].reverse().find((release) => release.status === "published");

  useEffect(() => {
    if (!open || reviewQueueCount !== null) return;
    let cancelled = false;
    void import("../utils/exportDataset").then(
      ({ buildDatasetSnapshot, buildSourceMetadataEntries, countRecordsAwaitingSecondPersonReview }) => {
        if (cancelled) return;
        const entries = buildSourceMetadataEntries(buildDatasetSnapshot());
        setReviewQueueCount(countRecordsAwaitingSecondPersonReview(entries));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [open, reviewQueueCount]);

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

  async function handleDownload(action: "dataset" | "filtered" | "citation") {
    setDownloading(action);
    try {
      const exports = await import("../utils/exportDataset");
      if (action === "dataset") exports.downloadDatasetJson();
      else if (action === "filtered") exports.downloadFilteredDatasetJson(filters);
      else exports.downloadCitationText();
      setOpen(false);
    } finally {
      setDownloading(null);
    }
  }

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
          className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-canvas-line bg-white p-2 text-xs shadow-drawer"
        >
          <button
            type="button"
            disabled={downloading !== null}
            onClick={() => void handleDownload("dataset")}
            className="block w-full rounded-md px-2.5 py-2 text-left font-medium text-ink-800 hover:bg-canvas"
          >
            {downloading === "dataset" ? "Preparing dataset..." : "Download dataset JSON"}
          </button>
          <button
            type="button"
            disabled={downloading !== null}
            onClick={() => void handleDownload("filtered")}
            className="block w-full rounded-md px-2.5 py-2 text-left font-medium text-ink-800 hover:bg-canvas"
          >
            {downloading === "filtered" ? "Preparing filtered JSON..." : "Download filtered JSON"}
          </button>
          <button
            type="button"
            disabled={downloading !== null}
            onClick={() => void handleDownload("citation")}
            className="block w-full rounded-md px-2.5 py-2 text-left font-medium text-ink-800 hover:bg-canvas"
          >
            {downloading === "citation" ? "Preparing citation..." : "Download citation"}
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
            href="https://github.com/Bekhzod-Alikhanov/AI-Governance-Map/blob/main/docs/SOURCE_AUDIT_CURRENT.md"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md px-2.5 py-2 font-medium text-ink-800 hover:bg-canvas"
          >
            Source audit notes
          </a>
          <a
            href="/data/changelog.json"
            className="block rounded-md px-2.5 py-2 font-medium text-ink-800 hover:bg-canvas"
          >
            What changed
          </a>
          <a
            href="/data/release-manifest.json"
            className="block rounded-md px-2.5 py-2 font-medium text-ink-800 hover:bg-canvas"
          >
            Verify release checksums
          </a>
          <div className="space-y-0.5 border-t border-canvas-line px-2.5 pt-2 text-[10px] leading-snug text-ink-500">
            <p>Released {currentRelease?.releaseDate ?? RELEASE_METADATA.releaseDate}</p>
            <p>Coverage through {currentRelease?.coverageCutoff ?? RELEASE_METADATA.coverageCutoff}</p>
            <p>
              {reviewQueueCount === null
                ? "Calculating second-person review queue…"
                : `${new Intl.NumberFormat("en-US").format(reviewQueueCount)} records awaiting second-person review`}
            </p>
            <p>Record checks have their own dates; verify time-sensitive legal status against official sources.</p>
          </div>
        </div>
      )}
    </div>
  );
}
