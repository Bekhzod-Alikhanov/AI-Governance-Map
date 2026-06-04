import { useState } from "react";
import { createPortal } from "react-dom";
import type { DossierKind, EvidenceDossier } from "../utils/evidenceDossier";
import { downloadTextFile } from "../utils/downloadTextFile";
import { useDialogFocus } from "../utils/useDialogFocus";
import { CopyTextButton } from "./CopyTextButton";

interface Props {
  kind: DossierKind;
  id: string;
  compact?: boolean;
}

export function EvidenceDossierButton({ kind, id, compact = false }: Props) {
  const [dossierState, setDossierState] = useState<{
    dossier: EvidenceDossier;
    markdown: string;
    filename: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function openDossier() {
    setLoading(true);
    try {
      const {
        buildEvidenceDossier,
        evidenceDossierFilename,
        renderEvidenceDossierMarkdown,
      } = await import("../utils/evidenceDossier");
      const dossier = buildEvidenceDossier(kind, id, currentShareUrl());
      if (!dossier) return;
      setDossierState({
        dossier,
        markdown: renderEvidenceDossierMarkdown(dossier),
        filename: evidenceDossierFilename(dossier),
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
        onClick={() => void openDossier()}
        className="inline-flex items-center gap-1 rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h5" />
        </svg>
        {loading ? "Loading..." : compact ? "Dossier" : "Evidence dossier"}
      </button>
      {dossierState &&
        createPortal(
          <EvidenceDossierModal
            dossier={dossierState.dossier}
            markdown={dossierState.markdown}
            filename={dossierState.filename}
            onClose={() => setDossierState(null)}
          />,
          document.body
        )}
    </>
  );
}

function EvidenceDossierModal({
  dossier,
  onClose,
  markdown,
  filename,
}: {
  dossier: EvidenceDossier;
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
        aria-label={dossier.title}
        tabIndex={-1}
        className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-xl border border-canvas-line bg-white shadow-drawer"
      >
        <header className="flex flex-wrap items-start gap-3 border-b border-canvas-line px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Evidence dossier
            </p>
            <h2 className="mt-0.5 text-lg font-semibold leading-tight text-ink-900">
              {dossier.title}
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Snapshot {dossier.snapshotDate}. Research aid only; not legal advice.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyTextButton text={markdown} label="Copy Markdown" copiedLabel="Copied" />
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
            >
              Download Markdown
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-md border border-canvas-line bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:border-accent hover:text-accent"
            >
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close evidence dossier"
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
            <div className="border-b border-canvas-line pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                {dossier.subtitle}
              </p>
              <h3 className="mt-1 text-2xl font-semibold leading-tight text-ink-900">
                {dossier.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">
                Dataset snapshot {dossier.snapshotDate}. Share URL: {dossier.currentUrl}
              </p>
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                Research aid only; not legal advice. Verify time-sensitive legal status against linked official sources.
              </p>
            </div>

            <section className="mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Answer summary
              </h4>
              <p className="mt-2 leading-relaxed">{dossier.summary}</p>
            </section>

            <section className="mt-5 grid gap-2 sm:grid-cols-3">
              {dossier.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-canvas-line bg-canvas/70 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                    {metric.label}
                  </p>
                  <p className="mt-1 font-semibold text-ink-900">{metric.value}</p>
                </div>
              ))}
            </section>

            <section className="mt-5 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Key claims
              </h4>
              {dossier.sections.map((section) => (
                <div key={section.title} className="rounded-lg border border-canvas-line bg-white p-3">
                  <h5 className="text-sm font-semibold text-ink-900">{section.title}</h5>
                  <dl className="mt-2 space-y-2">
                    {section.claims.map((claim) => (
                      <div key={`${section.title}:${claim.label}`}>
                        <dt className="text-xs font-semibold text-ink-900">{claim.label}</dt>
                        <dd className="mt-0.5 text-xs leading-relaxed text-ink-700">{claim.detail}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </section>

            {dossier.caveats.length > 0 && (
              <section className="mt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Caveats
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
                  {dossier.caveats.map((caveat) => (
                    <li key={caveat} className="rounded-md bg-canvas px-2.5 py-1.5">
                      {caveat}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Sources
              </h4>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-[11px]">
                  <thead>
                    <tr className="bg-canvas">
                      <th className="border-y border-l border-canvas-line px-2 py-1.5 font-semibold text-ink-700">Record</th>
                      <th className="border-y border-canvas-line px-2 py-1.5 font-semibold text-ink-700">Verification</th>
                      <th className="border-y border-canvas-line px-2 py-1.5 font-semibold text-ink-700">Last verified</th>
                      <th className="border-y border-r border-canvas-line px-2 py-1.5 font-semibold text-ink-700">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossier.sources.map((source) => (
                      <tr key={`${source.id}:${source.sourceUrl}`}>
                        <td className="border-b border-l border-canvas-line px-2 py-1.5 align-top">{source.record}</td>
                        <td className="border-b border-canvas-line px-2 py-1.5 align-top">
                          {[source.sourceKind, source.verificationStatus, source.confidence].filter(Boolean).join(" / ")}
                        </td>
                        <td className="border-b border-canvas-line px-2 py-1.5 align-top">{source.lastVerified ?? ""}</td>
                        <td className="border-b border-r border-canvas-line px-2 py-1.5 align-top">
                          <a
                            href={source.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-accent underline-offset-2 hover:underline"
                          >
                            {source.sourceName}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}

function currentShareUrl() {
  if (typeof window === "undefined") return "https://global-ai-governance-map.vercel.app/";
  return window.location.href;
}
