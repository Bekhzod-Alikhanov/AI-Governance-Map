const ISSUE_BASE_URL = "https://github.com/Bekhzod-Alikhanov/AI-Governance-Map/issues/new";

export interface CorrectionLinkInput {
  recordKind: string;
  recordId: string;
  recordName: string;
  sourceUrl?: string;
  claim?: string;
}

export function buildCorrectionIssueUrl(input: CorrectionLinkInput): string {
  const title = `Data correction: ${input.recordName}`;
  const body = [
    "## Record",
    `- Kind: ${input.recordKind}`,
    `- ID: ${input.recordId}`,
    `- Name: ${input.recordName}`,
    input.sourceUrl ? `- Current source: ${input.sourceUrl}` : "- Current source: not provided",
    "",
    "## Current claim",
    input.claim?.trim() || "Please describe the current claim that needs review.",
    "",
    "## Suggested correction",
    "Please describe the proposed correction and include an official source URL where possible.",
    "",
    "## Source quality",
    "- Prefer official legal text, treaty-office records, regulator pages, or issuer-controlled documents.",
    "- This project is a research dashboard and not legal advice.",
  ].join("\n");

  const params = new URLSearchParams({
    title,
    body,
    labels: "data-correction,source-verification",
  });
  return `${ISSUE_BASE_URL}?${params.toString()}`;
}
