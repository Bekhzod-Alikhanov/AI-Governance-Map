import clsx from "clsx";
import type { VerificationMetadata } from "../types";
import {
  CONFIDENCE_BADGE_CLASSES,
  DATA_CONFIDENCE_LABELS,
  SOURCE_KIND_LABELS,
  VERIFICATION_STATUS_LABELS,
} from "../utils/getVerificationLabel";

interface Props {
  item: VerificationMetadata;
  label?: string;
  compact?: boolean;
}

export function VerificationMeta({ item, label = "Source verification", compact = false }: Props) {
  const hasMetadata = Boolean(
    item.sourceKind ||
      item.verificationStatus ||
      item.confidence ||
      item.lastVerified ||
      item.verificationNotes
  );

  if (!hasMetadata) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-900">
        <span className="font-semibold">{label}: </span>
        Verification metadata not yet recorded.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-canvas-line bg-canvas/70 px-2 py-1.5 text-[11px] leading-relaxed text-ink-700">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold text-ink-900">{label}</span>
        {item.verificationStatus && (
          <span className="rounded-md border border-canvas-line bg-white px-1.5 py-0.5 text-ink-700">
            {VERIFICATION_STATUS_LABELS[item.verificationStatus]}
          </span>
        )}
        {item.confidence && (
          <span
            className={clsx(
              "rounded-md border px-1.5 py-0.5 font-medium",
              CONFIDENCE_BADGE_CLASSES[item.confidence]
            )}
          >
            {DATA_CONFIDENCE_LABELS[item.confidence]}
          </span>
        )}
      </div>
      {!compact && (
        <dl className="mt-1 grid gap-x-3 gap-y-0.5 sm:grid-cols-2">
          {item.sourceKind && (
            <div>
              <dt className="text-ink-500">Source type</dt>
              <dd className="text-ink-800">{SOURCE_KIND_LABELS[item.sourceKind]}</dd>
            </div>
          )}
          {item.lastVerified && (
            <div>
              <dt className="text-ink-500">Last checked</dt>
              <dd className="text-ink-800">{item.lastVerified}</dd>
            </div>
          )}
        </dl>
      )}
      {item.verificationNotes && <p className="mt-1 text-ink-700">{item.verificationNotes}</p>}
    </div>
  );
}
