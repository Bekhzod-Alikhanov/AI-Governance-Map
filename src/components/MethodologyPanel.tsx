import { DATA_SNAPSHOT_DATE } from "../utils/governanceTaxonomy";
import { useDialogFocus } from "../utils/useDialogFocus";

interface Props {
  onClose: () => void;
}

const SECTIONS = [
  {
    title: "Scope",
    body:
      "The map tracks AI-specific governance instruments. General privacy, cybersecurity, chip, export-control, and digital-strategy items are excluded unless they directly govern AI or frontier-AI capacity.",
  },
  {
    title: "Legal Effect",
    body:
      "Binding law, proposed law, guidance, voluntary frameworks, standards, and political declarations are separate categories. Soft-law instruments should not be read as enforceable duties.",
  },
  {
    title: "Participation",
    body:
      "Signed, ratified, endorsed, adopted, adherent, participant, member, EU applicability, and membership coverage are distinct signals. Signature is not ratification; membership coverage is not explicit endorsement.",
  },
  {
    title: "EU Applicability",
    body:
      "EU AI Act applicability is shown for EU members because the regulation applies through EU law. That does not mean each member enacted a separate national AI statute.",
  },
  {
    title: "Standards",
    body:
      "ISO/IEC, NIST, CEN-CENELEC, and similar materials are standards or technical guidance unless separately incorporated into law or procurement obligations.",
  },
  {
    title: "Frontier Labs",
    body:
      "Labs are included when they are consequential developers or deployers of frontier model families, have substantial compute/platform power, or shape frontier-AI governance commitments.",
  },
  {
    title: "Verification",
    body:
      "Official sources are preferred. Records carry source kind, verification status, confidence, and last-verified metadata where available. Uncertain claims are labelled rather than silently normalized.",
  },
];

export function MethodologyPanel({ onClose }: Props) {
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/30 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Methodology"
        tabIndex={-1}
        className="mx-auto flex h-full max-h-[760px] w-full max-w-3xl flex-col overflow-y-auto rounded-xl border border-canvas-line bg-white shadow-drawer"
      >
        <header className="sticky top-0 z-10 flex items-start gap-4 border-b border-canvas-line bg-white px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
              Methodology
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-tight text-ink-900">
              How to read this map
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">
              Static research snapshot: {DATA_SNAPSHOT_DATE}. This dashboard is not legal advice.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close methodology panel"
            className="rounded-md p-1.5 text-ink-500 hover:bg-canvas"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        <div className="px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <section key={section.title} className="rounded-lg border border-canvas-line bg-canvas/40 px-3 py-3">
                <h3 className="text-sm font-semibold text-ink-900">{section.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-700">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
            <h3 className="text-sm font-semibold text-amber-950">Update Policy</h3>
            <p className="mt-1 text-xs leading-relaxed text-amber-900">
              The dataset should be updated with official sources, last-verified dates, and caveats when legal status is ambiguous. Time-sensitive treaty status, national enactment, and source URLs should be checked before publication.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
