import clsx from "clsx";
import type { VerificationMetadata } from "../types";
import {
  CONFIDENCE_BADGE_CLASSES,
  DATA_CONFIDENCE_LABELS,
  SOURCE_KIND_LABELS,
  VERIFICATION_STATUS_LABELS,
} from "../utils/getVerificationLabel";
import { getVerificationAge } from "../utils/verificationAge";

const REVIEW_STATUS_LABELS = {
  editorial_checked: "Editorially checked",
  needs_review: "Needs review",
  unreviewed: "Unreviewed",
  expert_reviewed: "Expert reviewed",
} as const;

const REVIEW_STATUS_CLASSES = {
  editorial_checked: "border-blue-200 bg-blue-50 text-blue-900",
  needs_review: "border-amber-200 bg-amber-50 text-amber-900",
  unreviewed: "border-canvas-line bg-white text-ink-700",
  expert_reviewed: "border-emerald-200 bg-emerald-50 text-emerald-900",
} as const;

function formatSourceLocator(locator: NonNullable<VerificationMetadata["sourceLocator"]>): string {
  const parts = [locator.documentId ? `Document ${locator.documentId}` : locator.label];
  if (locator.article) parts.push(`article ${locator.article}`);
  if (locator.section) parts.push(`section ${locator.section}`);
  if (locator.page) parts.push(`${/[–—-]/.test(locator.page) ? "pages" : "page"} ${locator.page}`);
  if (locator.paragraph) parts.push(`paragraph ${locator.paragraph}`);
  return parts.join(" · ");
}

interface Props {
  item: VerificationMetadata;
  label?: string;
  compact?: boolean;
}

export function VerificationMeta({ item, label = "Source verification", compact = false }: Props) {
  // A snapshot date describes the corpus; this describes the record in hand.
  const age = getVerificationAge(item.lastVerified);
  const hasMetadata = Boolean(
    item.sourceKind ||
      item.verificationStatus ||
      item.confidence ||
      item.lastVerified ||
      item.verificationNotes ||
      item.reviewStatus ||
      item.reviewNotes ||
      item.sourceLocator
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
        {item.reviewStatus && (
          <span
            className={clsx(
              "rounded-md border px-1.5 py-0.5 font-medium",
              REVIEW_STATUS_CLASSES[item.reviewStatus]
            )}
          >
            {REVIEW_STATUS_LABELS[item.reviewStatus]}
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
              <dd className="text-ink-800">
                {item.lastVerified}
                {age && (
                  <>
                    {" "}
                    <span
                      className={clsx(
                        "rounded px-1 py-0.5 text-[10px] font-medium",
                        age.freshness === "stale"
                          ? "bg-amber-100 text-amber-900"
                          : age.freshness === "ageing"
                            ? "bg-canvas text-ink-700"
                            : "text-ink-500"
                      )}
                    >
                      {age.label}
                    </span>
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>
      )}
      {item.sourceLocator && (
        <p className="mt-1 text-ink-700">
          <span className="font-medium text-ink-800">Source pinpoint:</span>{" "}
          {formatSourceLocator(item.sourceLocator)}
        </p>
      )}
      {item.verificationNotes && <p className="mt-1 text-ink-700">{item.verificationNotes}</p>}
      {item.reviewNotes && <p className="mt-1 text-ink-700">{item.reviewNotes}</p>}
    </div>
  );
}
