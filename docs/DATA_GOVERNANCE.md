# Data Governance

This dashboard is a research tool, not legal advice. Dataset updates should preserve the distinction between legal status, participation status, and source confidence.

For the practical contribution workflow, templates, and pull-request checklist, see `docs/EDITORIAL_WORKFLOW.md`.

## Snapshot Discipline

- Current release date, coverage cutoff, and status-as-of date: 17 August 2026.
- `releaseDate` is when the bundle was published; `coverageCutoff` is the last date intentionally covered by the release; `statusAsOf` is the date to which displayed status claims are scoped.
- `snapshotDate` is a compatibility alias for `statusAsOf` for the 2026.08 release cycle and should not be used to overwrite record-level dates.
- Preserve every record's own `lastVerified`. A release must never imply that older sources were checked on the release date.
- Do not silently update one item past the snapshot date without either updating the full snapshot or marking the item as post-snapshot.
- Dates should use `YYYY-MM-DD` where known. If an official source gives only a month or year, leave the date blank and explain the uncertainty in `notes`.

## Recommended Metadata

New or revised records should include:

- `sourceKind`: `official`, `secondary`, `mixed`, or `unknown`.
- `verificationStatus`: `verified`, `likely_correct`, `uncertain`, `needs_external_check`, `unverified`, or `superseded`.
- `confidence`: `high`, `medium`, or `low`.
- `lastVerified`: date checked, using `YYYY-MM-DD`.
- `verificationNotes`: short caveat when the source does not fully prove the displayed claim.
- `sourceLocator`: a human-readable `label` plus any available `documentId`, `article`, `section`, `page`, or `paragraph`. Locators identify the precise support within the canonical source; they do not replace `sourceUrl`.
- `reviewStatus` and `reviewNotes`: second-person review state and any remaining caveat.

These fields are optional during migration, but `npm run validate:data` reports aggregate warnings when records do not include them.

## Public Dataset Export

- The in-app Data menu exports the exact static arrays bundled into the client build.
- The export uses schema version `2026.08.0` and fixed release metadata, not the browser download date.
- Keep the export helper in `src/utils/exportDataset.ts` aligned with any new data file so public JSON exports do not silently omit a dataset category.
- The citation download is intentionally short; the release package, methodology, and verification notes live in `docs/RELEASE_2026-08.md`, this document, and the `docs/SOURCE_VERIFICATION_*.md` files.
- `public/data/release-manifest.json` and the immutable versioned manifest list byte counts and lowercase SHA-256 digests for the full dataset, schema, and release package. Run `npm run validate:release` to detect drift.

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
5. Run `npm run validate:data`, `npm run validate:export`, `npm run audit:sources`, and `npm run audit:data-review`.
6. If UI behavior, exports, or derived selectors changed, also run `npm test`, `npm run build`, and `npm run test:e2e`.
