/**
 * How old a record's verification is, in reader-facing terms.
 *
 * The dataset's snapshot date is correct and test-enforced, but that is a
 * property of the corpus, not of the record in front of you. A reader deciding
 * whether to cite a claim needs to know when *that* claim was last checked, and
 * an ISO date alone does not communicate age at a glance.
 *
 * Thresholds match the buckets `npm run audit:data-review` already reports, so
 * the UI and the editorial tooling agree on what "stale" means.
 */
export const AGEING_AFTER_DAYS = 90;
export const STALE_AFTER_DAYS = 180;

export type VerificationFreshness = "current" | "ageing" | "stale";

export interface VerificationAge {
  days: number;
  freshness: VerificationFreshness;
  /** Reader-facing phrase, e.g. "checked 38 days ago". */
  label: string;
}

export function getVerificationAge(
  lastVerified: string | undefined,
  today: string = new Date().toISOString().slice(0, 10)
): VerificationAge | null {
  if (!lastVerified || !/^\d{4}-\d{2}-\d{2}$/.test(lastVerified)) return null;

  const then = Date.parse(`${lastVerified}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(then) || Number.isNaN(now)) return null;

  const days = Math.max(0, Math.round((now - then) / 86_400_000));
  const freshness: VerificationFreshness =
    days >= STALE_AFTER_DAYS ? "stale" : days >= AGEING_AFTER_DAYS ? "ageing" : "current";

  const label =
    days === 0 ? "checked today" : days === 1 ? "checked yesterday" : `checked ${days} days ago`;

  return { days, freshness, label };
}
