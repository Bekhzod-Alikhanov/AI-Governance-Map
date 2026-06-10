import { useState } from "react";
import { createPortal } from "react-dom";
import type { PolicyBriefKind } from "../types";
import { downloadTextFile } from "../utils/downloadTextFile";
import { useDialogFocus } from "../utils/useDialogFocus";
import { CopyTextButton } from "./CopyTextButton";

interface Props {
  kind: PolicyBriefKind;
  id?: string;
  labId?: string;
  marketIso3s?: string[];
  compact?: boolean;
}

export function PolicyBriefButton({ kind, id, labId, marketIso3s, compact = false }: Props) {
  const [briefState, setBriefState] = useState<{
    title: string;
    subtitle: string;
    summary: string;
    markdown: string;
    filename: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function openBrief() {
    setLoading(true);
    try {
      const { buildPolicyBrief, policyBriefFilename, renderPolicyBriefMarkdown } = await import("../utils/policyBrief");
      const brief = buildPolicyBrief({ kind, id, labId, marketIso3s });
      if (!brief) return;
      const markdown = renderPolicyBriefMarkdown(brief);
      setBriefState({
        title: brief.title,
        subtitle: brief.subtitle,
        summary: brief.summary,
        markdown,
        filename: policyBriefFilename(brief),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => void openBrief()}
        className="inline-flex items-center gap-1 rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent disabled:opacity-60"
      >
        <svg
          aria-hidden="true"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
        {loading ? "Loading..." : compact ? "Brief" : "Policy brief"}
      </button>
      {briefState &&
        createPortal(
          <PolicyBriefModal
            title={briefState.title}
            subtitle={briefState.subtitle}
            summary={briefState.summary}
            markdown={briefState.markdown}
            filename={briefState.filename}
            onClose={() => setBriefState(null)}
          />,
          document.body
        )}
    </>
  );
}

function PolicyBriefModal({
  title,
  subtitle,
  summary,
  markdown,
  filename,
  onClose,
}: {
  title: string;
  subtitle: string;
  summary: string;
  markdown: string;
  filename: string;
  onClose: () => void;
}) {
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);

  function handleDownload() {
    downloadTextFile(filename, markdown, "text/markdown;charset=utf-8");
  }

  function handlePrint() {
    document.body.classList.add("printing-evidence-dossier");
    const cleanup = () => {
      document.body.classList.remove("printing-evidence-dossier");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 1200);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-ink-900/35 p-3 backdrop-blur-sm sm:p-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-xl border border-canvas-line bg-white shadow-drawer"
      >
        <header className="flex flex-wrap items-start gap-3 border-b border-canvas-line px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Policy brief
            </p>
            <h2 className="mt-0.5 text-lg font-semibold leading-tight text-ink-900">{title}</h2>
            <p className="mt-1 text-xs text-ink-500">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyTextButton text={markdown} label="Copy Markdown" copiedLabel="Copied" />
            <button type="button" onClick={handleDownload} className={buttonClass}>
              Download Markdown
            </button>
            <button type="button" onClick={handlePrint} className={buttonClass}>
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close policy brief"
              className="rounded-md p-1.5 text-ink-500 hover:bg-canvas"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </header>
        <div className="policy-scroll flex-1 overflow-y-auto bg-canvas p-3 sm:p-5">
          <article
            data-evidence-dossier-print
            className="mx-auto max-w-4xl rounded-lg border border-canvas-line bg-white p-4 text-sm text-ink-700 shadow-panel sm:p-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{subtitle}</p>
            <h3 className="mt-1 text-2xl font-semibold leading-tight text-ink-900">{title}</h3>
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              Research aid only; not legal advice. Verify time-sensitive legal status against linked official sources.
            </p>
            <p className="mt-4 leading-relaxed">{summary}</p>
            <pre className="policy-scroll mt-5 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg border border-canvas-line bg-canvas p-3 text-xs leading-relaxed text-ink-800">
              {markdown}
            </pre>
          </article>
        </div>
      </div>
    </div>
  );
}

const buttonClass =
  "rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent";
