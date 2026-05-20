import { useState } from "react";
import type { NationalAIRegulation } from "../types";
import { NationalBindingBadge } from "./ParticipationBadge";
import { NATIONAL_BINDING_DESCRIPTIONS, NATIONAL_BINDING_LABELS } from "../utils/getParticipationLabel";
import { SourceLink } from "./SourceLink";
import { EmptyState } from "./EmptyState";
import { VerificationMeta } from "./VerificationMeta";

interface Props {
  regulations: NationalAIRegulation[];
}

export function NationalRegulationList({ regulations }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (regulations.length === 0) {
    return (
      <EmptyState message="No AI-specific national regulation currently included in this dataset." />
    );
  }

  return (
    <ul className="space-y-2">
      {regulations.map((reg) => {
        const expanded = expandedId === reg.id;
        return (
          <li
            key={reg.id}
            className="rounded-lg border border-canvas-line bg-white"
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : reg.id)}
              aria-expanded={expanded}
              className="flex w-full items-start gap-2 px-3 py-2.5 text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug text-ink-900">
                  {reg.name}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-500">
                  {reg.type.replace(/_/g, " ")}
                  {reg.regulatorOrBody && <> · {reg.regulatorOrBody}</>}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <NationalBindingBadge status={reg.bindingStatus} />
                  {reg.frontierAIRelevant && (
                    <span className="inline-flex items-center rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                      Frontier-AI relevant
                    </span>
                  )}
                </div>
              </div>
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`mt-1 text-ink-500 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {expanded && (
              <div className="space-y-2 border-t border-canvas-line px-3 py-2.5 text-xs text-ink-700">
                <p className="leading-relaxed">{reg.summary}</p>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                  <div className="col-span-2">
                    <dt className="text-ink-500">
                      Legal status: {NATIONAL_BINDING_LABELS[reg.bindingStatus]}
                    </dt>
                    <dd className="text-ink-800">
                      {NATIONAL_BINDING_DESCRIPTIONS[reg.bindingStatus]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-500">Status</dt>
                    <dd className="text-ink-800">{reg.status}</dd>
                  </div>
                  {reg.dateAdopted && (
                    <div>
                      <dt className="text-ink-500">Adopted</dt>
                      <dd className="text-ink-800">{reg.dateAdopted}</dd>
                    </div>
                  )}
                  {reg.dateInForce && (
                    <div>
                      <dt className="text-ink-500">In force</dt>
                      <dd className="text-ink-800">{reg.dateInForce}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-ink-500">Jurisdiction</dt>
                    <dd className="text-ink-800">{reg.jurisdiction}</dd>
                  </div>
                </dl>
                {reg.notes && (
                  <p className="rounded bg-canvas px-2 py-1.5 text-[11px] leading-relaxed">
                    <span className="font-semibold text-ink-900">Note: </span>
                    {reg.notes}
                  </p>
                )}
                <VerificationMeta item={reg} />
                <SourceLink name={reg.sourceName} url={reg.sourceUrl} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
