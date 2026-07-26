# Audit — Global AI Governance Map

**Date:** 25 July 2026 · **Commit:** `97dc53c` · **Pass 1 of 2 (structural)**

A three-perspective review — staff frontend engineer, information architect, working AI-governance researcher — of the repo, the local build, and the live deployment. **No application code was changed.** Every file here is a diagnosis; proposed fixes are written as recommendations, not applied.

## Read in this order

| File | What it is |
|---|---|
| [00-EXECUTIVE-SUMMARY.md](00-EXECUTIVE-SUMMARY.md) | 2 pages, standalone. The one structural problem, top 10 findings, keep/kill/merge table, "what I'd do if I had one day", and the honest one-liner. |
| [01-FINDINGS.md](01-FINDINGS.md) | 23 findings, S1→S4, each anchored to a file:line or a measurement. Ends with what genuinely works and 6 unverified suspicions. |
| [04-VIEW-PORTFOLIO.md](04-VIEW-PORTFOLIO.md) | The four persona click-paths, then a keep/kill/merge memo per view (counterargument first), then the proposed navigation model. |
| [05-DATA-MODEL-REVIEW.md](05-DATA-MODEL-REVIEW.md) | Taxonomy critique, the 15-record live source spot-check with per-record verdicts, the `powerScore` verdict, a staleness strategy, and a proposed schema. |
| [07-OPEN-QUESTIONS.md](07-OPEN-QUESTIONS.md) | 8 decisions only the owner can make, each with a recommendation and the evidence that would settle it. |
| [02-WORKBENCH-REDESIGN.md](02-WORKBENCH-REDESIGN.md) | Purpose statement, wireframe, control inventory, progressive-disclosure strategy, microcopy, empty states, and five worked question→answer examples. |
| [06-ROADMAP.md](06-ROADMAP.md) | Now / Next / Later / Never, each with acceptance criteria. |
| [08-REMEDIATION-LOG.md](08-REMEDIATION-LOG.md) | What was actually fixed across four tiers, with before/after measurements — including a correction to F-15, whose headline number was wrong. |

## Status

**21 of 23 findings closed** across four remediation tiers, all test-first. Remaining: **F-04** is deliberately open (it is Q3 — a claim only the maintainer can make) and **F-23** (`App.tsx` state sprawl) is taste, scheduled as L2 in the roadmap.

`03-LAYERS-DECISION.md` was never written and never will be: [04-VIEW-PORTFOLIO](04-VIEW-PORTFOLIO.md) argued the merge and the merge shipped, so a second document re-arguing a settled decision would be waste.

Still not done: the filter × lens interaction matrix, React Profiler measurements, the full UI-copy audit, and the competitor benchmark against OECD.AI / Stanford AI Index / IAPP / GIRAI.

---

## Important: the audit brief was written against an older build

The commissioning brief assumed a version of this project that no longer exists. Auditing against its premises would have produced findings already fixed. Where the brief, the README and the code disagreed, **the code won**. The divergences:

| The brief assumed | Reality at `97dc53c` |
|---|---|
| "No URL state is a listed roadmap item" | [`urlState.ts`](../../src/utils/urlState.ts) (308 lines), [`recordRoutes.ts`](../../src/utils/recordRoutes.ts), [`embedRoutes.ts`](../../src/utils/embedRoutes.ts) all exist. *But* it is partial and history is never pushed — see F-02, F-05. |
| "LICENSE file — README hedges 'if present' — check" | [`LICENSE`](../../LICENSE) exists (MIT), linked unhedged from the README. |
| "Missing: methodology page, citation block, changelog, versioned releases" | [`MethodologyPanel.tsx`](../../src/components/MethodologyPanel.tsx), [`citation.ts`](../../src/utils/citation.ts), [`datasetReleases.ts`](../../src/data/datasetReleases.ts), [`docs/CHANGELOG.md`](../CHANGELOG.md) all present. |
| "4 views (Geography, Layers, Network, Timeline) + Workbench" | 6 lenses — Workbench, Geography, Layers, Network, Timeline, **Table** — plus a standalone **Embed** route family. |
| "33 international instruments, ~85 dependency edges" | `DATASET_STATS`: 37 instruments, **99** edges, 192 countries, 75 national rules, 13 labs. |
| "Absence of visual regression" | [`visual-regression.spec.ts`](../../tests/e2e/visual-regression.spec.ts) with pixel baselines (though 2 mobile baselines are skipped — F-22). |
| "Is the map navigable by keyboard at all?" | Yes — 176 of 179 country paths are focusable, 167 carry `aria-label`, and a country-list text alternative exists. The real defect is focus *order* (F-07), not focus absence. |
| "~200+ nodes in the network hairball" | 53 nodes, 87 edges in the default view. The legibility problem is real but different: only 9 nodes are labelled and edge type is not encoded at all (F-09). |

Two brief-level suspicions were confirmed exactly as written: the OG image really is a favicon SVG (F-06), and `powerScore` really is a hand-assigned constant shipped as node and pin size (F-09).

---

## Method

**Working tree.** `src/components/WorkbenchView.tsx`, `src/data/countryMapSummaries.ts`, six `public/data/*.json` and one Playwright baseline were tracked at HEAD but deleted on disk, so nothing could build. Restored with `git restore` (additive only — no local edits existed). `node_modules` was also corrupt (`typescript/lib/_tsc.js` missing); reinstalled with `npm ci`.

**Commands run, with real results:**

| Command | Result |
|---|---|
| `npm run lint` | exit 0, clean |
| `npm run typecheck` | exit 0, clean |
| `npm test` | **119 passed** (30 files), 3.61 s |
| `npm run build` | exit 0, 333 ms |
| `npm run check:performance` | `"ok": true, "issues": []` |
| `npm run test:e2e` | **36 passed, 2 skipped**, 42.0 s |
| `npm run audit:sources` | 762 sourced records, 0 metadata warnings |
| `npm run audit:source-links` | 2 link warnings, 8 manual checks used |
| `npm run audit:data-review` | 4 medium-priority items, 0 high |
| `validateData()` (direct) | **378 warnings**, 371 of them "after snapshot date" |
| `npm audit` | 4 vulnerabilities (3 high, 1 low) — dev-tooling transitive |

**Live testing.** Local dev server (`vite-dev`, port 5173) driven in a real browser at 1440×900 and 390×844 for instrumented measurement — computed fills, focus order, DOM metrics, accessibility tree, and enumeration of all 193 entities through both map colour code paths. Production (`global-ai-governance-map.vercel.app`) via `curl` for cold-load HTML, response headers, record-route metadata, and `robots.txt`/`sitemap.xml`.

**Source verification.** 15 records sampled across instruments, national rules, subnational rules and participation; every URL fetched live with a browser user-agent and checked for claim-supporting *content*, not just a status code. Full table in [05](05-DATA-MODEL-REVIEW.md#2-source-spot-check--15-records).

**Not done in this pass:** Lighthouse (no binary available in this environment — the bundle numbers here are build-output measurements, not field metrics), React Profiler re-render counts, `d3-force` main-thread profiling, colour-vision simulation, and the competitor benchmark. These are listed as unverified suspicions in [01](01-FINDINGS.md#unverified-suspicions) rather than asserted.
