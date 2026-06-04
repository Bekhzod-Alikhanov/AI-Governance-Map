# Remaining Research Workbench Backlog Ledger

Generated: 2026-06-04

This ledger tracks the earlier roadmap items so implementation can proceed without duplicating already-completed foundations. It is an editorial/product checklist, not legal advice.

## Status Key

- `done`: implemented and covered by the current validation gate.
- `partial`: meaningful foundation exists, but the earlier acceptance target is not complete.
- `pending`: not yet implemented.
- `deferred`: intentionally out of scope for this static/client-only cycle.

## Roadmap Ledger

| Area | Status | Current state | Remaining implementation target |
| --- | --- | --- | --- |
| Baseline validation gate | done | `lint`, `typecheck`, tests, data validation, export validation, source audit, data review, source deltas, build, and e2e pass. | Re-run after each major phase. |
| AI assistant | deferred | No assistant is present. | Keep deferred until structured data, stable pages, exports, citations, and retrieval constraints are complete. |
| Research Workbench lens | partial | Workbench, workflows, answer cards, comparison cards, scenario workflow, and Atlas comparison cards exist. | Add obligation/exposure comparison, shareable Workbench state, top-20 question presets, linked answer cards, and CSV export for comparisons/scenarios. |
| Obligations | partial | Obligation dataset, filters, table rows, validation, exports, and dossiers exist. | Broaden obligation coverage and add direct compare/page support. |
| Lab exposure | partial | Typed lab exposure rows, drawer grouping, table rows, network links, and dossiers exist. | Add direct compare/page support and richer scenario links. |
| Stable record routes | partial | Country, lab, instrument, and rule routes exist through Workbench panels. | Add obligation/exposure routes and richer record pages with full related evidence blocks. |
| Map modes | partial | Legal, obligation, implementation, source-confidence, frontier-relevance, and Atlas modes exist. | Add click-visible explanations, lightweight small-multiple previews, and synchronized accessible country list. |
| Domain taxonomy | partial | Domain taxonomy and filters exist for obligations and Workbench workflows. | Expand domain coverage and add domain columns/presets across relevant datasets and pages. |
| Implementation tracker | partial | Implementation milestones, filters, timeline/table rows, and dossiers exist. | Add fuller country/rule coverage, deadline cards, and enforcement/regulator milestones. |
| AI Atlas | partial | Oxford, CAIDP, UNESCO RAM, Stanford, and source-only context families exist; Atlas data lazy-loads. | Normalize additional country rows only where durable machine-readable data is available; add unmatched-country reports. |
| Source trust release system | partial | CI audits, data-review, source-delta reports, release data, and manual-check notes exist. | Expand monitor coverage, monthly release artifacts, and unresolved review reporting. |
| Public data exports | partial | Full dataset, country summaries, obligations, lab exposure, source metadata, and changelog exist. | Add implementation tracker, Atlas indicators, record index, embed manifests, and citation metadata. |
| Embeddable widgets | pending | No public widget routes or embed cards exist. | Add compact country, lab exposure, treaty participation, obligation, implementation, and Atlas indicator widgets. |
| Visual regression and performance QA | partial | E2E and a11y smoke tests exist; bundle split for Atlas exists. | Add visual screenshots/regression tests and explicit performance budget checks. |

