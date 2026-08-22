import type { ExpertReviewStatus, SourceLocator, VerificationMetadata } from "../types";

export const REVIEW_STATUS_LABELS: Record<ExpertReviewStatus, string> = {
  editorial_checked: "Editorially checked",
  needs_review: "Needs review",
  unreviewed: "Unreviewed",
  expert_reviewed: "Expert reviewed",
};

export const REVIEW_STATUS_CLASSES: Record<ExpertReviewStatus, string> = {
  editorial_checked: "border-blue-200 bg-blue-50 text-blue-900",
  needs_review: "border-amber-200 bg-amber-50 text-amber-900",
  unreviewed: "border-canvas-line bg-white text-ink-700",
  expert_reviewed: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export function getReviewStatus(item: VerificationMetadata): ExpertReviewStatus {
  return item.reviewStatus ?? "unreviewed";
}

export function formatSourceLocator(locator: SourceLocator): string {
  const parts = [locator.documentId ? `Document ${locator.documentId}` : locator.label];
  if (locator.article) parts.push(`article ${locator.article}`);
  if (locator.section) parts.push(`section ${locator.section}`);
  if (locator.page) parts.push(`${/[\u2013\u2014-]/.test(locator.page) ? "pages" : "page"} ${locator.page}`);
  if (locator.paragraph) parts.push(`paragraph ${locator.paragraph}`);
  return parts.join(" \u00b7 ");
}

export function formatReviewState(item: VerificationMetadata): string {
  const label = REVIEW_STATUS_LABELS[getReviewStatus(item)];
  return item.reviewNotes ? `${label} \u2014 ${item.reviewNotes}` : label;
}
