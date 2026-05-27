import { buildCorrectionIssueUrl } from "../utils/correctionLink";

interface Props {
  recordKind: string;
  recordId: string;
  recordName: string;
  sourceUrl?: string;
  claim?: string;
  compact?: boolean;
}

export function CorrectionLink({
  recordKind,
  recordId,
  recordName,
  sourceUrl,
  claim,
  compact = false,
}: Props) {
  return (
    <a
      href={buildCorrectionIssueUrl({ recordKind, recordId, recordName, sourceUrl, claim })}
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? "inline-flex items-center rounded-md border border-canvas-line px-2 py-0.5 text-[11px] font-medium text-ink-600 hover:border-accent hover:text-accent"
          : "inline-flex items-center rounded-md border border-canvas-line bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:border-accent hover:text-accent"
      }
    >
      Report correction
    </a>
  );
}
