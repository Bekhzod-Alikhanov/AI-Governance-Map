# Data Governance

This dashboard is a research tool, not legal advice. Dataset updates should preserve the distinction between legal status, participation status, and source confidence.

## Snapshot Discipline

- Current snapshot date: 19 May 2026.
- Do not silently update one item past the snapshot date without either updating the full snapshot or marking the item as post-snapshot.
- Dates should use `YYYY-MM-DD` where known. If an official source gives only a month or year, leave the date blank and explain the uncertainty in `notes`.

## Recommended Metadata

New or revised records should include:

- `sourceKind`: `official`, `secondary`, `mixed`, or `unknown`.
- `verificationStatus`: `verified`, `likely_correct`, `uncertain`, or `needs_external_check`.
- `confidence`: `high`, `medium`, or `low`.
- `lastVerified`: date checked, using `YYYY-MM-DD`.
- `verificationNotes`: short caveat when the source does not fully prove the displayed claim.

These fields are optional during migration, but `npm run validate:data` reports aggregate warnings when records do not include them.

## Taxonomy Rules

National entries:

- Binding law: enforceable AI-specific law or regulation, including EU AI Act applicability for EU member states.
- Proposed law: draft or proposed AI-specific legal instrument; not in force.
- Guidance/framework/strategy: public AI-specific policy instrument without binding legal force by itself.
- Standard/code: voluntary or technical instrument unless separately required.
- Institutional framework: agency, institute, office, or coordination body; not itself an AI law.

International instruments:

- Binding treaty/regulation: legal effect may still depend on signature, ratification, entry into force, scope, and application date.
- Soft law/political guidance: recommendation, declaration, summit text, ministerial statement, roadmap, or principles without binding legal force by itself.
- Technical standard: not national law unless separately adopted, incorporated, or required.
- Voluntary framework: participation does not create binding legal duties by itself.

Participation:

- `signed` is not `ratified`.
- `ratified` is still subject to entry-into-force and scope conditions.
- `applicable_via_eu` is not a separate national enactment.
- `covered_by_membership` is indirect membership coverage, not direct signature or explicit endorsement.

## Source Review Checklist

Before adding or changing a high-impact record:

1. Prefer official sources over secondary summaries.
2. Verify the displayed status, date, jurisdiction, and legal effect against the source.
3. Add a note when participation is indirect, partial, conditional, or uncertain.
4. Do not classify privacy, cybersecurity, export-control, semiconductor, or generic digital-policy instruments as AI-specific unless the source is explicitly AI-specific.
5. Run `npm run validate:data`, `npm test`, and `npm run build`.

