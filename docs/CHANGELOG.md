# Changelog

## 2026.08.0 - 17 August 2026 Research Release

### Added

- Explicit release, coverage-cutoff, and status-as-of dates, with `snapshotDate` retained as a one-cycle compatibility alias.
- JSON Schema support for pinpoint source locators, the full verification vocabulary, and two-person review status.
- Deterministic SHA-256 manifests and immutable copies of the full dataset, schema, and release package.
- DOI-ready `CITATION.cff` and Zenodo metadata. No DOI has been assigned or claimed.

### Changed

- Published the August release record and marked the unpublished June plan as superseded.
- Narrowed three federal litigation records to claims supported by pinpointed primary court documents.
- Removed the Garcia litigation row because its public claim lacked a stable primary document.

### Verification

- Schema version: `2026.08.0`.
- Release date, coverage cutoff, and status-as-of date: `2026-08-17`.
- SHA-256 manifests can be checked with `npm run validate:release`.

### Caveats

- Per-record `lastVerified` values remain record-specific; the release date does not imply every source was rechecked that day.
- `editorial_checked` is not expert review. Records marked `needs_review` or `unreviewed` remain in the second-person review queue.

## 2026.05 - May 2026 Snapshot

### Added

- Public dataset export and citation workflow for the 2026-05 snapshot.
- Research presets, shareable URLs, Table view, Methodology panel, and correction links.
- In-page maximize mode and map result-scope controls.
- Source audit, data-review, validation, accessibility, and e2e test coverage.
- Manual source-link check registry for official sites that reject scripted checks.

### Changed

- Hardened legal/source taxonomy so uncertain records do not drive strong binding-law map effects.
- Split source metadata review into official verification, likely-correct strategy context, and manual link-check exceptions.
- Softened weakly sourced proposed-law or implementation claims where the official source did not support a strong legal effect.

### Verification

- Source-audit metadata warnings: 0.
- Data-review high-priority items: 0.
- Data-review medium-priority items: 0.
- Strong legal-effect records needing review: 0.

### Caveats

- Snapshot date remains 2026-05-19.
- This dataset is a research aid, not legal advice.
- Link-check automation can be blocked by official sites; see `docs/SOURCE_AUDIT_CURRENT.md` for manual exceptions.
