# Dataset Release Draft: 2026-06

Status: planned / in-progress  
Target snapshot date: 2026-06-30

This draft release note tracks changes queued after the May 2026 snapshot. It is intentionally conservative: context indicators, infrastructure sources, and procurement guidance remain separate from legal-status and binding-law rollups.

## Planned Additions

- Workbench compare state for countries, labs, instruments, rules, obligations, and lab-exposure rows.
- Stable citeable routes for obligation and exposure records.
- Top research-question presets that apply filters, comparison records, scenario inputs, and answer cards.
- AI Atlas source-family tracking for:
  - European Commission AI Factories.
  - U.S. NSF National Artificial Intelligence Research Resource pilot.
  - UK Guidelines for AI procurement.
- Keyboard-accessible country-list overlay and click-visible map-color explanations.
- Lightweight small-multiple Atlas preview maps.

## Planned Changes

- Implementation tracker expanded for UK, Italy, Slovenia, Germany, France, and Spain using existing source-backed records.
- Domain taxonomy extended with public procurement and enforcement/litigation.
- Public data exports to include richer record indexes and release metadata.

## Caveats

- Atlas source-family records are context only and do not affect binding-law coloring, legal summaries, or obligation counts.
- Procurement and infrastructure records are not treated as national AI laws.
- Official sources that block automated checks require manual review before a claim is upgraded.

## Release Gate

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run validate:data`
- `npm run validate:export`
- `npm run audit:sources`
- `npm run audit:data-review`
- `npm run audit:deltas`
- `npm run build`
- `npm run test:e2e`
