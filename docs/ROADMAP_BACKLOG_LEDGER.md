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
| Research Workbench lens | done | Workbench, workflows, answer cards, comparison cards, obligation/exposure compare support, scenario workflow, Atlas comparison cards, shareable Workbench state, top-20 research-question presets, and comparison/scenario CSV exports exist. | Continue expanding preset quality as the dataset grows. |
| Obligations | done | Obligation dataset, filters, table rows, validation, exports, dossiers, direct compare support, and stable obligation routes exist. | Broaden substantive obligation coverage through future editorial passes. |
| Lab exposure | done | Typed lab exposure rows, drawer grouping, table rows, network links, dossiers, direct compare support, stable exposure routes, and scenario links exist. | Add more exposure rows only when source-backed. |
| Stable record routes | done | Country, lab, instrument, rule, obligation, and exposure routes render through Workbench record panels and are covered by route tests. | Keep route IDs stable across releases. |
| Map modes | done | Legal, obligation, implementation, source-confidence, frontier-relevance, and Atlas modes exist, with click-visible country explanations, lightweight Atlas preview maps, and a synchronized accessible country list. | Add new map modes only when they answer a concrete research question. |
| Domain taxonomy | done | Domain taxonomy covers frontier/GPAI, sectoral, compute, procurement, enforcement/litigation, and related categories; relevant table/workbench surfaces expose domains. | Expand domain tagging during future source-verification passes. |
| Implementation tracker | done | Implementation milestones, filters, timeline/table rows, deadline cards, and dossiers exist across EU, Korea, California, China, CoE, UK, Brazil, Türkiye, Mexico, Norway, Italy, Slovenia, Germany, France, and Spain coverage. | Add enforcement events as official records appear. |
| AI Atlas | done | Oxford, CAIDP, UNESCO RAM, Stanford, IMF/OECD/GIRAI-style source families, AI safety institute/regulator context, procurement, and compute/cloud/chip investment context are represented or staged as contextual Atlas data; Atlas data lazy-loads. | Normalize more country rows only where durable machine-readable data is available. |
| Source trust release system | done | CI audits, data-review, source-delta reports, release records, manual-check notes, and June release notes exist. | Manual review remains required for official sites that block automation. |
| Public data exports | done | Full dataset, country summaries, obligations, lab exposure, implementation tracker, Atlas sources/indicators, source metadata, changelog, catalog, record index, and embed-card manifests exist. | Keep export schema changes documented in release notes. |
| Embeddable widgets | done | Compact embed routes and generated embed-card manifests exist for country, lab, instrument, obligation, exposure, implementation, and Atlas records. | Add styling variants if third-party embedding becomes a real workflow. |
| Visual regression and performance QA | done | E2E, a11y, visual smoke screenshots, Atlas lazy-loading, and explicit performance-budget checks exist. | Add stricter pixel-diff baselines once the visual design stabilizes. |
