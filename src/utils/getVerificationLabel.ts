import type { DataConfidence, SourceKind, VerificationStatus } from "../types";

export const SOURCE_KIND_LABELS: Record<SourceKind, string> = {
  official: "Primary/official source",
  secondary: "Secondary source",
  mixed: "Mixed sources",
  unknown: "Source type not classified",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  likely_correct: "Likely correct",
  uncertain: "Uncertain",
  needs_external_check: "Needs external check",
};

export const DATA_CONFIDENCE_LABELS: Record<DataConfidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export const CONFIDENCE_BADGE_CLASSES: Record<DataConfidence, string> = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-rose-200 bg-rose-50 text-rose-800",
};
