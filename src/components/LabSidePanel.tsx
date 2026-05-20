import { getLabSummary } from "../utils/getLabSummary";
import { SourceLink } from "./SourceLink";
import { ConnectionsSection } from "./ConnectionsSection";
import { useDialogFocus } from "../utils/useDialogFocus";
import { VerificationMeta } from "./VerificationMeta";

interface Props {
  labId: string;
  onClose: () => void;
}

export function LabSidePanel({ labId, onClose }: Props) {
  const { lab, regulatoryExposure } = getLabSummary(labId);
  const dialogRef = useDialogFocus<HTMLElement>(onClose);

  if (!lab) return null;

  return (
    <aside
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${lab.name} frontier-lab details`}
      tabIndex={-1}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col border-l border-canvas-line bg-white shadow-drawer"
    >
      <header className="flex items-start gap-3 border-b border-canvas-line px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Frontier lab · HQ: {lab.hqCountryName}
            {lab.isFMFMember && " · Frontier Model Forum member"}
          </p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-ink-900">{lab.name}</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            Power score {lab.powerScore}/5
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lab panel"
          className="rounded-md p-1.5 text-ink-500 hover:bg-canvas"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      <div className="policy-scroll flex-1 overflow-y-auto px-5 py-5">
        <p className="text-sm leading-relaxed text-ink-700">{lab.summary}</p>
        <div className="mt-3">
          <VerificationMeta item={lab} />
        </div>

        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Flagship frontier models
          </h3>
          <ul className="flex flex-wrap gap-1.5">
            {lab.flagshipModels.map((m) => (
              <li
                key={m}
                className="rounded-md border border-canvas-line bg-canvas px-2 py-0.5 text-xs text-ink-700"
              >
                {m}
              </li>
            ))}
          </ul>
        </section>

        {lab.safetyFramework && (
          <section className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              Internal safety framework
            </h3>
            <div className="rounded-lg border border-canvas-line bg-white px-3 py-2.5">
              <p className="text-sm font-semibold text-ink-900">{lab.safetyFramework.name}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-500">
                Maturity: {lab.safetyFramework.maturity}
              </p>
              <div className="mt-2">
                <SourceLink
                  name={lab.safetyFramework.sourceName}
                  url={lab.safetyFramework.sourceUrl}
                />
              </div>
            </div>
          </section>
        )}

        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Regulatory exposure
          </h3>
          {regulatoryExposure.length === 0 ? (
            <p className="text-xs text-ink-500">None recorded.</p>
          ) : (
            <ul className="space-y-1.5">
              {regulatoryExposure.map((r) => (
                <li
                  key={r.id}
                  className="rounded-md border border-canvas-line bg-white px-3 py-2 text-xs text-ink-700"
                >
                  <p className="font-medium text-ink-900">{r.name}</p>
                  {r.sourceUrl && (
                    <div className="mt-1.5 space-y-1.5">
                      <VerificationMeta item={r} compact />
                      <SourceLink name="Source" url={r.sourceUrl} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Connections
          </h3>
          <ConnectionsSection nodeId={lab.id} />
        </section>

        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Source
          </h3>
          <div className="mb-2">
            <VerificationMeta item={lab} compact />
          </div>
          <SourceLink name={lab.sourceName} url={lab.sourceUrl} />
        </section>
      </div>
    </aside>
  );
}
