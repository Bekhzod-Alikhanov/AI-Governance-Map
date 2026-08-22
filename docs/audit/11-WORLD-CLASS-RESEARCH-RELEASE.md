# 11 — World-class research release

## Decision

Ship one August 2026 trust-and-usability release that makes the map answer-first, date-explicit, reproducible, and honest about the strength of every claim. This specification consolidates the approved recommendations from the live-product and repository audit.

## Release metadata

The release uses four distinct dates:

- `releaseDate: 2026-08-17` — when this package was produced.
- `coverageCutoff: 2026-08-17` — the latest date considered in this refresh.
- `statusAsOf: 2026-08-17` — the date attached to release-level status statements.
- `lastVerified` — remains per record and must never be inferred from a release date.

The legacy `snapshotDate` export field remains as a compatibility alias of `statusAsOf` for one schema cycle. Reader-facing copy must use “status as of” or “coverage through,” never imply that all records were individually checked on 17 August.

## Primary-source corrections

1. Add Albania (`ALB`) as a Council of Europe Framework Convention on AI signatory on 15 June 2026. The official Treaty Office remains the canonical source. The derived answer must count set difference, producing 20 signature-only parties and one ratification rather than counting the EU twice.
2. Add the AI Omnibus entry into force on 27 July 2026 and the 2 August 2026 AI Act application milestone. Copy must distinguish provisions that now apply from high-risk-system deadlines changed by the Omnibus. Canonical sources:
   - <https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force>
   - <https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act>
3. Replace broad litigation case-page claims with pinpointed primary documents:
   - Andersen: use N.D. Cal. document 380 filed 14 January 2026 only to support that the action remained in discovery; remove unsupported November 2026 / April 2027 scheduling and amendment assertions.
   - Bartz: use N.D. Cal. document 437 filed 17 October 2025, pages 1–2, for preliminary settlement approval.
   - Kadrey: use N.D. Cal. document 700 filed 25 March 2026, pages 3–5, for the named-plaintiff training-claim judgment and still-unresolved proposed-class distribution/contributory claims.
   - Garcia: remove the record from the public corpus because the constructed GovInfo route was not confirmed and no primary document supports the current claim. Record the removal in the changelog. It can return only with a stable primary document.

## Source precision and review

`VerificationMetadata` gains an optional structured `sourceLocator` with a human-readable `label` and optional `documentId`, `article`, `section`, `page`, and `paragraph`. Source-chain entries may carry the same locator. Public JSON, JSON Schema, citations, dossiers, and verification UI expose it.

`reviewStatus` is visible to readers. “Editorially checked” means a maintainer checked the record and source. “Expert reviewed” is reserved for a named domain expert and cannot be assigned in this release. `needs_review` remains visible and cannot be silently rendered as verified.

Manual-review expiry is one system: `audit:manual-checks` checks both `sourceLinkManualChecks.json` and every `manualVerification` in `sourceDeltaMonitors.json`, reports checks due within 14 days, and fails on expired or undated checks. The Council of Europe and EU monitors are renewed only because official sources were reviewed for this release; the twelve checks due 27 August remain due-soon warnings.

## Answer-first Workbench

The Workbench’s default question is `binding-duties-by-jurisdiction`. On first load, above the fold it shows:

1. the view title and freshness metadata;
2. six featured questions;
3. one live answer with a quotable sentence, caveat, named jurisdictions or records, three to five evidence rows, official-source links, stable record links, “Cite answer,” and “Export answer CSV.”

All other questions live behind a searchable “Browse all questions” disclosure with category filters. Question buttons expose `aria-pressed`; the answer region uses `aria-live="polite"`. Existing lab, corpus, Atlas, comparison, scenario, workflow, and changelog capabilities stay available in collapsed `<details>` sections.

Answers are derived objects, not UI-only strings. Each answer contains the question id/title, sentence, caveat, count label, named entities, evidence rows, status date, and source metadata. The current-answer citation and CSV are generated from that object and include the release metadata.

## Surrounding research UX

- Switching to Workbench preserves the selected country but replaces the modal-width drawer with a compact context rail/chip. The full drawer remains available on geography and can be reopened from the compact context.
- Search results humanize enum text such as `institutional_framework` to “Institutional framework,” widen the desktop popover, group title/kind/jurisdiction clearly, and preserve combobox keyboard behavior.
- The country drawer puts “status as of” and a sticky contents navigation near the top. Long evidence groups use native disclosures with stable anchors.
- The Data menu shows release date, coverage cutoff, review-due count, a “What changed” link, and release-manifest link.

## Reproducible releases

The build creates deterministic SHA-256 manifests for public research artifacts. It writes a latest manifest and a versioned `public/data/releases/2026-08-17/` package containing the full dataset, schema, release package, and checksums. A validator recomputes every digest and fails on drift.

Repository metadata includes `CITATION.cff`, `.zenodo.json`, and an August release note. These are DOI-ready but must not claim a DOI until a maintainer publishes the archive through Zenodo.

## Accessibility and verification

Playwright coverage must include Workbench, question selection, answer live region, answer citation/export controls, search keyboard navigation and humanized labels, compact country context across a lens switch, country contents navigation, 200% zoom, and forced-colors/high-contrast mode. Axe remains clean at WCAG A/AA tags for desktop and mobile projects.

The release is complete only after unit tests, data validation, export validation, manual-check audit, source audit, lint, typecheck, production build, end-to-end tests, accessibility tests, and release-manifest verification all pass.
