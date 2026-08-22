# 17 August 2026 Research Release

Version `2026.08.0` is the first repository release with deterministic, digest-verified research artifacts. It is a research aid, not legal advice, and time-sensitive status must still be checked against the cited official source.

## Dates And Scope

- Release date: `2026-08-17` — the publication date of this bundle.
- Coverage cutoff: `2026-08-17` — the final date intentionally covered by this release.
- Status as of: `2026-08-17` — the date to which displayed status claims are scoped.
- Compatibility snapshot date: `2026-08-17` — a one-cycle alias for `statusAsOf`.

These release dates do not replace per-record `lastVerified` dates. Older values remain visible when a source was not checked again on release day.

## Research Corrections

- Andersen v. Stability AI, Bartz v. Anthropic, and Kadrey v. Meta now cite specific GovInfo documents and page ranges; unsupported procedural claims were removed.
- Garcia v. Character Technologies was removed because the public row did not have a stable primary document supporting its claim.
- The unpublished June refresh plan is retained as a superseded historical plan, not presented as a pending or completed release.

## Source And Review Metadata

`sourceLocator` contains a required human-readable `label` and may contain `documentId`, `article`, `section`, `page`, or `paragraph`. It pinpoints support inside `sourceUrl` and never substitutes for the canonical source.

Review status records a distinct second-person state: `editorial_checked` means an editor checked the source and claim but does not imply expert review; `expert_reviewed` requires a documented qualified reviewer; `needs_review` is an active review queue; and `unreviewed` means no second-person review is recorded. This release does not claim that the dataset as a whole was expert reviewed.

## Immutable Artifacts

The latest manifest is `public/data/release-manifest.json`. Immutable copies and their manifest are under `public/data/releases/2026-08-17/`. Each manifest lists sorted relative paths, byte counts, and lowercase SHA-256 digests for `full-dataset.json`, `schema.json`, and `release-package.json`; it does not include itself.

Verify a checkout with:

```bash
npm run data:public
npm run data:manifest
npm run validate:release
```

Generation contains no wall-clock timestamp, so repeating it with the same source tree is byte-stable.

## Manual Work Still Required

- Council of Europe Treaty Office changes may need browser/manual inspection when scripted access is blocked.
- Source entries marked `needs_review` or `unreviewed` remain due for second-person review.
- Zenodo has not been published and no DOI has been assigned.

To publish manually, a maintainer must sign in to Zenodo, choose **New upload**, upload the four files in `public/data/releases/2026-08-17/`, copy the fields from `.zenodo.json`, confirm the MIT license and dataset upload type, and click **Publish**. Record only the DOI Zenodo actually assigns in a later reviewed change.
