import { DATA_SNAPSHOT_DATE } from "./governanceTaxonomy";
import type { VerificationMetadata } from "../types";

interface CitationInput extends VerificationMetadata {
  recordKind: string;
  recordId: string;
  recordName: string;
  sourceName?: string;
  sourceUrl?: string;
  claim?: string;
}

export function buildRecordCitation(input: CitationInput): string {
  const lines = [
    `${input.recordName} (${input.recordKind}, ${input.recordId}).`,
    `Global AI Governance Map, dataset snapshot ${DATA_SNAPSHOT_DATE}.`,
  ];

  if (input.claim) lines.push(`Claim or summary: ${input.claim}`);
  if (input.sourceName || input.sourceUrl) {
    lines.push(`Source: ${[input.sourceName, input.sourceUrl].filter(Boolean).join(" - ")}`);
  }
  if (input.verificationStatus || input.confidence || input.lastVerified) {
    lines.push(
      `Verification: ${[
        input.verificationStatus ? input.verificationStatus.replace(/_/g, " ") : null,
        input.confidence ? `${input.confidence} confidence` : null,
        input.lastVerified ? `last verified ${input.lastVerified}` : null,
      ]
        .filter(Boolean)
        .join("; ")}.`
    );
  }
  if (input.verificationNotes) lines.push(`Caveat: ${input.verificationNotes}`);
  lines.push("Research aid only; not legal advice. Verify time-sensitive status against the official source.");
  lines.push("Live app: https://global-ai-governance-map.vercel.app/");

  return lines.join("\n");
}

export function buildCountryCitation(input: {
  iso3: string;
  name: string;
  summary: string;
}): string {
  return [
    `${input.name} (${input.iso3}) country profile.`,
    `Global AI Governance Map, dataset snapshot ${DATA_SNAPSHOT_DATE}.`,
    input.summary,
    "Research aid only; not legal advice. Verify time-sensitive status against linked official sources.",
    `Live app: https://global-ai-governance-map.vercel.app/?country=${encodeURIComponent(input.iso3)}`,
  ].join("\n");
}
