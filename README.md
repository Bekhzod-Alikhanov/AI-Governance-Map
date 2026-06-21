# AI Governance Map

> Research-grade global AI governance and AI Atlas workbench for mapping laws, institutions, frontier labs, obligations, implementation milestones, AI readiness indicators, public-sector AI systems, enforcement and litigation evidence, standards infrastructure, and the dependencies between them.

<p>
  <a href="https://global-ai-governance-map.vercel.app">
    <img alt="Live demo"
         src="https://img.shields.io/badge/live-global--ai--governance--map.vercel.app-1E40AF?style=flat-square&logo=vercel" />
  </a>
  <img alt="React"   src="https://img.shields.io/badge/React-19.2-149ECA?style=flat-square&logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript" />
  <img alt="Vite"    src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4.3-38BDF8?style=flat-square&logo=tailwindcss" />
  <img alt="Vitest"  src="https://img.shields.io/badge/Vitest-4.1-6E9F18?style=flat-square&logo=vitest" />
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-1.60-2EAD33?style=flat-square&logo=playwright" />
  <img alt="ESLint" src="https://img.shields.io/badge/ESLint-10-4B32C3?style=flat-square&logo=eslint" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-555?style=flat-square" />
  <img alt="Snapshot" src="https://img.shields.io/badge/dataset_snapshot-19_May_2026-B45309?style=flat-square" />
  <img alt="Codebase size" src="https://img.shields.io/badge/source%20%2B%20data-51%2C596%20lines-0F766E?style=flat-square" />
</p>

**Live demo:** <https://global-ai-governance-map.vercel.app>

---

## Contents

- [Overview](#overview)
- [Codebase size](#codebase-size)
- [What's on the map](#whats-on-the-map)
- [Six lenses](#six-lenses-on-the-same-data)
- [Architecture](#architecture)
- [Frontend stack](#frontend-stack)
- [Backend / API](#backend--api)
- [Data layer](#data-layer)
- [Project structure](#project-structure)
- [Performance](#performance-budget)
- [Testing & CI](#testing--ci)
- [Running locally](#running-locally)
- [Deployment (Vercel)](#deployment-vercel)
- [How the map colour logic works](#how-the-map-colour-logic-works)
- [Stable record URLs and public data](#stable-record-urls-and-public-data)
- [How to add data](#how-to-add-data)
- [Editorial workflow](#editorial-workflow)
- [Source rules](#source-rules)
- [Validation](#validation)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License & credits](#license--credits)

---

## Overview

The dashboard answers a deceptively simple question — *"how is AI actually governed, measured, implemented, and institutionally overseen right now?"* — and gives a research-grade answer across six lenses on the same dataset, with a task-first Research Workbench, stable record URLs, source metadata, evidence dossiers, policy briefs, public JSON endpoints, and exportable table workflows.

It is **client-only**: a static Vite build, no backend, no paid APIs, no user accounts. Everything ships as JavaScript + JSON + an SVG world map. Deployment is a single `vercel deploy` from the project root, and the live site auto-rebuilds on every push to `main`.

The Geography and Layers maps support in-page maximize mode, region focus presets, zoom, pan, reset controls, result-fit status, country-list alternatives, and context-only Atlas/corpus map modes so researchers can move from a full-world overview to source-backed details without leaving the dashboard.

A guided **"Take the tour"** walkthrough introduces the frontier-AI governance story: who builds frontier AI, who can regulate them, which international coordinators matter, how evaluations and standards fit in, and where compute/chip dependencies shape the real governance environment.

## Codebase size

The project currently contains **51,596 tracked source/data/config lines** across **187 files**, excluding generated `public/data/*` exports, Playwright screenshots, and `package-lock.json`.

Including generated public JSON exports and the lockfile, the repository has **256,403 tracked source/data/config lines** across **218 files**. The smaller 51,596-line figure is the better indicator of maintainable application and dataset source size.

## What's on the map

- **192 countries** (UN member states + key dependent territories) plus the European Union as a supranational entity.
- **13 frontier-AI labs** pinned to their HQ cities — OpenAI, Anthropic, Google DeepMind, Meta, Microsoft, Amazon, xAI, Mistral, Cohere, DeepSeek, Baidu, Alibaba, Tencent — each with lab intelligence profiles, official/issuer-backed model-governance evidence, safety-framework references, typed regulatory exposure, and deployment-market context.
- **37 international AI instruments** — UNESCO Recommendation, UNGA 78/265 + 78/311 + 79/325, Global Digital Compact, OECD AI Principles, G20 AI Principles, the G7 Hiroshima trio + reporting framework, EU AI Act, Council of Europe Framework Convention on AI, ISO/IEC 42001 / 23894 / 38507 / 22989 / 42005, the Bletchley → Seoul → Paris summit chain, INASI, ASEAN guides, AU Continental AI Strategy, APEC instruments, NIST AI RMF / GenAI Profile, GPAI statements, CEN-CENELEC AI Act standardization work, and key bilaterals.
- **75+ national AI-specific rules** across China, the EU, South Korea, UK, US, Japan, Singapore, Canada, Australia, India, plus binding statutes in **Kazakhstan, Vietnam, Taiwan, Italy, Slovenia**, draft bills in **Brazil, Türkiye, Mexico, Bahrain, Costa Rica, Dominican Republic, Poland, Norway, Spain**, and 30+ formal national AI strategies.
- **7 subnational rules** — California SB 53 + 13-bill 2025 package, NYC Local Law 144, NY surveillance-pricing law, Illinois AIVIA, plus draft France/Germany EU AI Act implementations.
- **27-row EU AI Act authority matrix** distinguishing Commission-listed market-surveillance authorities, pending national designations, and member states where the Commission list has not yet published an authority.
- **3 infrastructure choke-points** and **4 compute-dependency records** — advanced AI chips, hyperscale cloud, U.S. BIS export controls, cloud/provider dependencies, and national compute signals — flagged as context rather than AI law.
- **38 enforcement & litigation records** — civil/regulatory enforcement actions, regulator investigations, policy warnings, and **9 court litigation cases**, including landmark AI copyright suits (*Bartz v. Anthropic*, *Kadrey v. Meta*) and the first AI-chatbot wrongful-death case (*Garcia v. Character.AI / Google*), each sourced to an official regulator notice or federal court-docket page (govinfo.gov).
- **99 dependency edges** typed as `regulates / depends_on / constrains / influences / coordinates / participates_in`.
- A **participation matrix** that distinguishes `signed`, `ratified`, `endorsed`, `adopted`, `adherent`, `member`, `participant`, `applicable_via_eu`, and `covered_by_membership (indirect)`.
- A structured **obligation matrix** for risk assessment, transparency/disclosure, incident reporting, model evaluation, registration/filing, conformity assessment, watermarking/content labeling, bias audit, cybersecurity, data governance, prohibited practices, compute reporting, and safety-framework publication.
- An **implementation tracker** for proposed, adopted, in-force, phased-application, implementing-rules-pending, regulator-appointed, guidance-issued, and enforcement-observed milestones.
- A **research corpus** of institutions, policy processes, standards/conformity records, public-sector AI registries/procurement records, enforcement/litigation evidence, safety-evaluation records, and corpus changelog entries.
- **AI Atlas context indicators** for Oxford Insights Government AI Readiness 2025, CAIDP AI and Democratic Values 2026, UNESCO RAM Global Hub status/profile rows, and Stanford HAI Global AI Vibrancy public data. These indicators are contextual only and never drive binding-law summaries.
- **29 static public data endpoints** in `public/data/`, generated at build time from the same TypeScript source modules.

Out-of-scope items (GDPR, DPDP, generic cybersecurity, BIS/Wassenaar/JP-NL-US export controls, generic digital strategies) are catalogued in [`src/data/outOfScope.ts`](src/data/outOfScope.ts) with explicit `reasonExcluded` text.

## Six lenses on the same data

| Lens | What it does | Implementation |
|---|---|---|
| **Workbench** | Task-first research workbench with workflow presets, answer cards, side-by-side comparison, Lab Board, Research Corpus explorer, policy briefs, stable record summaries, public endpoint links, and a conservative lab/market scenario simulator. | `WorkbenchView.tsx` + `researchWorkbench.ts` |
| **Geography** | Default world map. Country fill = binding status of national AI rule. Frontier-lab HQ pins overlaid, sized by power score. Includes maximize, zoom/pan, and regional focus controls. | `WorldMap.tsx` + `LabPin.tsx`, Equal Earth projection via `react-simple-maps` |
| **Layers** | Recolours countries by the highest governance layer present (corporate / national binding / proposed / voluntary / international only). Map modes can also show treaty participation, lab HQs, obligations, implementation deadlines, source confidence, frontier relevance, AI Atlas indicators, and context-only corpus modes. | `getMapColor.ts → pickPrimaryLayer` (cached) |
| **Network** | Force-directed graph of every actor and edge. Lab exposure edges are generated from the typed exposure dataset so binding, voluntary, standards, and infrastructure relationships stay distinct. | `NetworkView.tsx`, `d3-force` 300-tick static layout |
| **Timeline** | 115+ AI governance milestones plotted from 2017 (Finland AI Programme) → 2026 (Kazakhstan AI Law, Taiwan AI Basic Act, Vietnam AI Law). Filterable by international / national / subnational. | `TimelineView.tsx` |
| **Table** | Sortable, filterable research table for countries, instruments, national rules, labs, lab exposure rows, EU AI Act authorities, obligations, implementation milestones, corpus records, AI Atlas indicators, participation rows, releases, and source metadata; supports CSV export. | `TableView.tsx` |

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Browser tab                                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │  React 19  (SPA, no SSR — everything renders client-side)        │    │
│  │  ┌──────────────────────────────────────────────────────────┐    │    │
│  │  │  App.tsx — lens state, filter reducer, selection state   │    │    │
│  │  │  ┌─────────────────┐  ┌──────────────────┐               │    │    │
│  │  │  │ Filters toolbar │  │   LensSwitch     │               │    │    │
│  │  │  └─────────────────┘  └──────────────────┘               │    │    │
│  │  │  ┌──────────────────────────────────────────────────┐    │    │    │
│  │  │  │  <main>:                                         │    │    │    │
│  │  │  │    Geography lens → WorldMap + LabPin (eager)    │    │    │    │
│  │  │  │    Layers lens    → WorldMap (recolored)         │    │    │    │
│  │  │  │    Workbench      → WorkbenchView    (lazy)      │    │    │    │
│  │  │  │    Network lens   → NetworkView      (lazy)      │    │    │    │
│  │  │  │    Timeline lens  → TimelineView     (lazy)      │    │    │    │
│  │  │  │    Table lens     → TableView        (lazy)      │    │    │    │
│  │  │  └──────────────────────────────────────────────────┘    │    │    │
│  │  │  ┌──────────────────────────────────────────────────┐    │    │    │
│  │  │  │  Country / Lab side panels, Walkthrough overlay  │    │    │    │
│  │  │  └──────────────────────────────────────────────────┘    │    │    │
│  │  └──────────────────────────────────────────────────────────┘    │    │
│  │                              ▲                                   │    │
│  │                              │                                   │    │
│  │              memoised selectors in src/utils/*                   │    │
│  │   ┌──────────────────────────┴──────────────────────────┐        │    │
│  │   │  filterCountries · getCountryGovernanceSummary ·    │        │    │
│  │   │  getLabSummary · getEdgesForNode · getMapColor      │        │    │
│  │   └─────────────────────────────────────────────────────┘        │    │
│  │                              ▲                                   │    │
│  │                              │                                   │    │
│  │   ┌──────────────────────────┴──────────────────────────┐        │    │
│  │   │  Static TypeScript data modules in src/data/*       │        │    │
│  │   │  governance · corpus · Atlas · lab intelligence     │        │    │
│  │   │  generated public JSON endpoints in public/data/*   │        │    │
│  │   └─────────────────────────────────────────────────────┘        │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│       Bundled assets: world-atlas TopoJSON · Inter (woff2) · CSS         │
└──────────────────────────────────────────────────────────────────────────┘
                         ▲
                         │
                         │   Static-file CDN
                         │
              ┌────────────────────────┐
              │   Vercel Edge Network  │  (auto-deploy on git push to main)
              │   ├─ /assets/*  (1y)   │
              │   └─ /          (HTML) │
              └────────────────────────┘
                         ▲
                         │  GitHub integration
                         │
              ┌────────────────────────┐
              │   GitHub repository    │  CI: tsc -b · vitest · vite build
              │  Bekhzod-Alikhanov/…   │  Dependabot: weekly minor bumps
              └────────────────────────┘
```

There is **no runtime backend, database, or auth**. The source dataset lives in static TypeScript modules in `src/data/*`, is type-checked at build time, and is validated at dev start. Build-time scripts also emit static public JSON endpoints under `public/data/*`, so researchers can reuse the dataset without scraping the UI.

## Frontend stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 19** | Concurrent rendering, automatic ref forwarding, `Suspense` for lazy lenses, `use` hook for future async data |
| Language | **TypeScript 6 (strict)** | Strict null checks; data-shape errors surface at build time before they hit production |
| Build | **Vite 8** + **`@vitejs/plugin-react`** | Standard React plugin (kept on Babel for full ESLint plugin compatibility) |
| Linting | **ESLint 10** + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` | Catches hook-rule violations and a11y mistakes before runtime |
| Bundler split | Rolldown via Vite | Manual vendor chunks (`react`, `d3`, `map`) plus lazy feature/data chunks for Workbench, Table, Atlas, research corpus, dossiers, policy briefs, and side panels |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/vite`) | CSS-first theme tokens in `src/index.css`; Lightning CSS for prefixes; ~84 % faster builds than v3 |
| Map | **react-simple-maps** + **d3-geo** | Equal Earth projection, declarative `<Geographies>`/`<Geography>` |
| World data | **world-atlas** TopoJSON (110m, ~100 kB) | Bundled locally — no CDN round-trip on first paint |
| Graph | **d3-force** | Pre-computed 300-tick static layout; runs once when entering Network lens |
| Iconography | Inline SVG (Heroicons-style) | No icon-font dependency |
| Font | **Inter** via `@fontsource/inter` | Self-hosted woff2 — no Google Fonts handshake |
| Telemetry | **`@vercel/speed-insights`** | Real-user Core Web Vitals in the Vercel dashboard |

State management: a single `useReducer` for filter state + plain `useState` for selection/hover/lens. No Redux, Zustand, Jotai. The dataset is small enough that all memoisation lives in pure functions (`Map`-cached) rather than React Context.

### Accessibility

- All side panels and the walkthrough overlay are real `role="dialog"` + `aria-modal="true"` containers, with focus trapped inside while open and Escape to dismiss (`src/utils/useDialogFocus.ts`).
- Every interactive element has a visible `focus-visible` ring (`ring-2 ring-accent`).
- `prefers-reduced-motion` collapses all animations to near-zero duration.
- Per-item **source verification status** is rendered next to every regulation, instrument, lab, and infrastructure node via `<VerificationMeta>` — readers see at a glance whether a claim is `verified`, `likely_correct`, or `uncertain` and which kind of source it was checked against.
- Status badges (`signed` / `ratified` / `applicable_via_eu` / …) carry full descriptions in `title` + `aria-label`.

## Backend / API

**No runtime backend — by design.** The editorial source of truth is static TypeScript. Adding a country, instrument, regulation, corpus row, Atlas indicator, lab evidence row, or edge is an `Edit` + commit + push; Vercel auto-rebuilds.

The app does publish a static data API under `public/data/*`. Those JSON files are generated during `npm run build` from the same TypeScript source modules used by the UI.

If a future iteration needs editorial workflow (e.g. a CMS for non-engineer contributors), the natural extension points are:

1. Move `src/data/*.ts` to a backing JSON file generated from a headless CMS (Sanity / Decap / Tina).
2. Add a build-time ingest step that fetches verified public datasets from authoritative sources where licenses and terms allow it.
3. Move dataset to **Vercel KV** + a tiny serverless API for live updates, with a build-time fallback to the bundled snapshot for offline browsing.

None of that is implemented today.

## Data layer

```
src/data/
  countries.ts                  192 ISO-3166 alpha-3 entries + region tagging + helper member lists (OECD, G7, G20, APEC, ASEAN, AU, CoE)
  euMembers.ts                  27 EU member ISO3 codes — drives applicable_via_eu participation rows
  euAiActAuthorities.ts         27-row EU AI Act authority matrix, generated from compact listed/pending contacts
  frontierLabs.ts               13 labs + internal safety framework + FMF flag + power score
  labIntelligence.ts            lab profiles, model-governance evidence, safety evaluations, incidents, compute dependencies, and corpus changelog
  labRegulatoryExposures.ts     106 typed lab exposure rows: binding, voluntary, standards, infrastructure, and indirect ecosystem claims
  infrastructure.ts             3 nodes: advanced AI chips, hyperscale cloud, U.S. BIS export controls
  internationalInstruments.ts   37 instruments with verificationMeta + canonical sources
  nationalAIRegulations.ts      75+ national AI rules with binding status + dates + regulator + source URL
  subnationalRules.ts           U.S. state/city laws + draft EU-member implementations
  participation.ts              1,439 rows: (instrumentId, countryIso3, participationType, date, source)
  researchCorpus.ts             institutions, policy processes, standards/conformity, public-sector AI, enforcement/litigation, corpus changelog
  aiAtlas.ts                    contextual readiness/index/RAM/vibrancy rows, kept separate from legal status
  governanceObligations.ts      21 obligation rows connected to rules, instruments, labs, and dossiers
  implementationMilestones.ts   20 implementation/enforcement/deadline milestones
  governanceDomains.ts          14 domain tags for frontier/GPAI, biometrics, compute, public sector, procurement, and other sectors
  dependencies.ts               99 typed edges across the actor graph
  datasetReleases.ts            versioned release records and record-level changelog entries
  dataDictionary.ts             exported field definitions, examples, inclusion rules, and caveats
  countryMapSummaries.ts        compact precomputed map summaries for faster first paint
  outOfScope.ts                 GDPR, DPDP, BIS, Wassenaar, … with reasonExcluded
  sourceNotes.ts                Topic-level caveats surfaced in side panels
  walkthrough.ts                5-step guided tour content + per-step filter patch + target lens
```

Every public claim carries `sourceName` + `sourceUrl` or equivalent source metadata. Most records carry `verificationMeta` (`sourceKind`, `verificationStatus`, `confidence`, `lastVerified`) so the UI, dossiers, exports, and audits can mark uncertain claims with an explicit badge.

`participation.ts` is **derived** — it builds rows from authoritative participant lists (Bletchley participants, OECD adherents, etc.) and a few synthetic groupings (EU AI Act applicability via EU member list, UN coverage via UN membership). It is never edited row-by-row.

See [`docs/DATA_GOVERNANCE.md`](docs/DATA_GOVERNANCE.md), [`docs/EDITORIAL_WORKFLOW.md`](docs/EDITORIAL_WORKFLOW.md), [`docs/RESEARCH_CORPUS_LEDGER.md`](docs/RESEARCH_CORPUS_LEDGER.md), and [`docs/SOURCE_AUDIT_CURRENT.md`](docs/SOURCE_AUDIT_CURRENT.md) for the dataset taxonomy, editorial workflow, corpus coverage, and current source-audit posture.

## Project structure

```
.
├── docs/
│   ├── DATA_GOVERNANCE.md
│   ├── EDITORIAL_WORKFLOW.md
│   ├── RESEARCH_CORPUS_LEDGER.md
│   ├── ROADMAP_BACKLOG_LEDGER.md
│   ├── RELEASE_2026-05.md / RELEASE_2026-06.md
│   └── SOURCE_AUDIT_CURRENT.md
├── public/
│   ├── data/                         generated public JSON endpoints
│   └── favicon.svg
├── src/
│   ├── main.tsx                       entry point
│   ├── App.tsx                        layout + state
│   ├── index.css                      Tailwind v4 @theme tokens + base
│   ├── types.ts                       all shared TS types
│   ├── components/                    39 React components
│   │   ├── WorldMap.tsx               Equal Earth SVG + country geographies + lab pins
│   │   ├── NetworkView.tsx            d3-force static-layout graph
│   │   ├── TimelineView.tsx           horizontal milestone timeline
│   │   ├── WorkbenchView.tsx          task-first research workflows, comparisons, scenario simulator
│   │   ├── ResearchCorpusPanel.tsx    corpus facets, answer cards, and CSV export
│   │   ├── LabIntelligenceBoard.tsx   lab profiles, model evidence, evals, incidents, compute context
│   │   ├── TableView.tsx              sortable/exportable research rows, including lab exposure, corpus, Atlas, EU authority matrix
│   │   ├── LensSwitch.tsx             6-way lens toolbar
│   │   ├── Filters.tsx                Instrument / Participation / Binding force / Organization / Region / Frontier labs / Obligations / Domains / Implementation / National AI rules
│   │   ├── CountrySidePanel.tsx       per-country drawer with Atlas/corpus/evidence dossier sections
│   │   ├── LabSidePanel.tsx           per-lab drawer with exposure, intelligence, evidence dossier sections
│   │   ├── ConnectionsSection.tsx     dependency-edge list (grouped by relationship)
│   │   ├── WalkthroughOverlay.tsx     5-step guided tour
│   │   ├── DataActions.tsx            CSV / JSON dataset export
│   │   ├── EvidenceDossierButton.tsx  Markdown/download/print evidence dossiers
│   │   ├── PolicyBriefButton.tsx      source-backed policy brief generation
│   │   ├── SearchBox.tsx              fuzzy across countries / acts / instruments
│   │   ├── VerificationMeta.tsx       per-item source verification chip (verified / likely / uncertain)
│   │   ├── Legend / Tooltip / DataQualityNotice / EmptyState / SourceLink / ParticipationBadge / NationalRegulationList / InstrumentList / DeploymentBadge / LabPin
│   ├── data/                          static data modules (see above)
│   ├── utils/                         memoised selectors, validation, export, search
│   │   ├── filterCountries.ts                 LRU-cached filter matcher
│   │   ├── getCountryGovernanceSummary.ts     per-iso3 joined view
│   │   ├── getLabSummary.ts                   per-lab joined view
│   │   ├── labExposure.ts                     labels, summaries, targets, graph edges
│   │   ├── getEdgesForNode.ts                 grouped by relationship type
│   │   ├── getMapColor.ts                     fill / outline / opacity per lens
│   │   ├── getParticipationLabel.ts           label + description for badges
│   │   ├── getVerificationLabel.ts            verificationMeta → human label + colour
│   │   ├── governanceTaxonomy.ts              dataset classifications
│   │   ├── normalizeCountry.ts                ISO numeric ↔ alpha-3 static table
│   │   ├── searchData.ts                      fuzzy ranker
│   │   ├── researchWorkbench.ts               obligation, implementation, comparison, and scenario helpers
│   │   ├── recordRoutes.ts                    stable country/lab/instrument/rule/obligation/exposure/corpus route parsing
│   │   ├── exportDataset.ts                   CSV / JSON build
│   │   ├── datasetSchema.ts                   runtime dataset schema check
│   │   ├── keyboardActivation.ts              a11y helper for clickable non-button elements
│   │   ├── useDialogFocus.ts                  React hook: focus trap + Escape close
│   │   ├── translateSeedDataToEnglish.ts      Cyrillic check + RU→EN map
│   │   └── validateData.ts                    dev-mode validator + green/red summary line
│   └── test/setup.ts
├── tests/
│   └── e2e/
│       ├── smoke.spec.ts              Playwright: load + lens switch + side panel + workbench flows
│       ├── a11y.spec.ts               Playwright: keyboard nav + dialog focus + reduced-motion
│       └── visual-regression.spec.ts  Playwright: map/embed screenshot baselines
├── scripts/
│   ├── run-playwright.mjs             Playwright runner with sensible defaults
│   ├── write-public-data.mjs          generates public/data/*.json from app data
│   ├── audit-sources.mjs              source metadata/link audit
│   ├── audit-data-review.mjs          editorial review queue
│   ├── audit-source-deltas.mjs        official-source delta monitor
│   ├── check-performance-budget.mjs   JS/chunk budget gate
│   └── generate-country-map-summaries.mjs  compact default-map summary generator
├── playwright.config.ts               Playwright config
├── eslint.config.js                   ESLint 10 flat config (react-hooks + jsx-a11y)
├── .github/
│   ├── workflows/ci.yml               eslint + tsc + vitest + vite build on every push/PR
│   └── dependabot.yml                 weekly npm minor bumps
├── vercel.json                        Vite preset locked
├── vite.config.ts                     React plugin + manual vendor chunks + Vitest (excludes tests/e2e)
├── tsconfig.{app,node}.json           strict TS project references
├── package.json                       no postcss / tailwind.config (Tailwind v4 CSS-first)
└── README.md
```

## Performance budget

`npm run check:performance` enforces a hard budget before deploy:

| Metric | Current | Budget |
|---|---:|---:|
| Initial JS | 656,925 bytes | 725,000 bytes |
| Initial JS gzip | 194,426 bytes | 220,000 bytes |
| Atlas lazy chunk | 417,656 bytes | 430,000 bytes |
| Corpus gzip | 19,892 bytes | 20,000 bytes |
| Total JS | 1,549,981 bytes | 1,550,000 bytes |

The default map path is kept lean by using compact country map summaries instead of importing every national-regulation row on first load. Heavy Atlas, corpus, lab-intelligence, dossier, policy-brief, Workbench, Table, Network, and Timeline code paths are lazy-loaded by feature area.

The budget is intentionally strict and currently tight: `totalJsBytes` is only 19 bytes under the ceiling. The next large data expansion should first move more corpus/table-only data into generated JSON or deeper lazy chunks.

## Testing & CI

- **Unit / selector tests** — **Vitest 4** with `jsdom`. 118 tests across filters, map summaries, governance taxonomy, export/schema checks, evidence dossiers, policy briefs, record routes, Workbench helpers, corpus validation, Atlas parsing, lab exposure, and keyboard helpers. Run with `npm test` or `npm run test:watch`.
- **End-to-end + accessibility** — **Playwright 1.60** (`tests/e2e/smoke.spec.ts`, `tests/e2e/a11y.spec.ts`). Run with `npm run test:e2e` (full suite) or `npm run test:a11y` (a11y only). The a11y suite covers keyboard navigation, dialog focus traps, and `prefers-reduced-motion` honouring.
- **Visual regression** — Playwright pixel baselines cover the main map SVG and a compact country embed card. Update intentionally changed baselines with `npm run test:e2e -- tests/e2e/visual-regression.spec.ts --update-snapshots`.
- **Linting** — **ESLint 10** with `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y`. Run with `npm run lint`.
- **Type checking** — `npm run typecheck` runs `tsc -b --noEmit` against strict TypeScript.
- **Dataset checks** — `npm run validate:data` and `npm run validate:export` run the relevant vitest files in isolation, for quick pre-commit dataset sanity checks.
- **Editorial data review** — `npm run audit:data-review` produces Markdown/JSON review artifacts for stale, uncertain, low-confidence, or strong legal-effect records needing human review.
- **Official-source delta monitor** — `npm run audit:deltas` checks a small set of legally consequential official sources for changes; `npm run audit:deltas:write` refreshes `docs/SOURCE_DELTA_REPORT.md`.
- **Performance budget** — `npm run check:performance` fails if initial JS, Atlas chunk, corpus chunk, or total JS exceed the published budget.
- **Manual-source overrides** — Some official treaty/legal sites block static fetches. The CoE Treaty Office monitor has a time-limited manual verification record documented in `docs/SOURCE_VERIFICATION_2026-06-05.md`; it expires on 5 July 2026.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs ESLint, `tsc -b`, `vitest run`, and `vite build` on every push and PR.
- **Dependabot** (`.github/dependabot.yml`) opens a PR each week for npm minor/patch updates.
- A dev-mode runtime validator (`validateData.ts`) prints a green-bold summary line if the dataset is clean and checks countries, EU AI Act authority rows, national rules, international instruments, participation rows, lab exposure, corpus records, Atlas metadata, source classification, duplicate IDs, snapshot dates, and Cyrillic leakage.

## Running locally

Requires Node ≥ 20.19 and npm ≥ 10.

```bash
npm install
npm run dev      # http://localhost:5173
```

To build / test / lint:

```bash
npm run lint              # eslint .
npm run typecheck         # tsc -b --noEmit
npm test                  # vitest run (unit + selector tests)
npm run validate:data     # vitest run on validateData + governanceTaxonomy only
npm run validate:export   # vitest run on exportDataset + datasetSchema only
npm run audit:data-review # editorial report for source freshness and legal-status review
npm run audit:deltas      # official-source delta monitor for high-impact records
npm run audit:source-links # source-link audit, warning-first for official sites that block automation
npm run check:performance # JS/chunk budget gate
npm run test:e2e          # Playwright smoke + a11y end-to-end
npm run test:a11y         # Playwright a11y suite only
npm run data:map-summary  # generate compact country map summaries
npm run data:public       # generate public/data/*.json endpoints
npm run build             # data:map-summary && data:public && tsc -b && vite build  →  dist/
npm run preview           # serves dist/
```

## Deployment (Vercel)

### Git import (recommended)

1. Push to GitHub.
2. Open <https://vercel.com/new>, import the repo.
3. Vercel auto-detects Vite. Confirm install command `npm ci`, build `npm run build`, output `dist`.
4. Deploy.

The included [`vercel.json`](vercel.json) and `.npmrc` (`legacy-peer-deps=true` so the React 19 install accepts react-simple-maps's React 18 peer pin) handle the install step.

Subsequent pushes to `main` auto-deploy via the GitHub integration.

### Vercel CLI

```bash
npm install -g vercel
vercel login            # once per machine
vercel                  # preview deployment
vercel --prod           # production deployment
```

### Environment variables

None required. If you add any, use the `VITE_` prefix and configure them in **Project → Settings → Environment Variables**.

## How the map colour logic works

Default fill (Geography lens):

- **Gray** — no AI-specific data currently included for this country.
- **Light blue** — has guidance / voluntary AI framework only.
- **Medium blue** — has a proposed AI law or mixed framework.
- **Dark blue** — has at least one binding AI-specific law in force (includes EU member states under the EU AI Act).

Outlines:

- **Gold** — matches the currently selected international instrument filter.
- **Solid purple** — ratified a binding AI treaty (Council of Europe AI Convention).
- **Dashed purple** — signed a binding AI treaty but not yet ratified.

When one or more instruments are selected, countries that don't match drop to ~25 % opacity. The **AND / OR** toggle in the Instrument popover controls whether a country must participate in *all* selected instruments (AND) or *at least one* (OR).

The map mode selector can also recolor countries by proposed laws, CoE treaty participation, frontier-lab HQs, selected obligation/domain rows, implementation deadlines, source confidence, frontier relevance, AI Atlas context indicators, institutions, policy windows, public-sector AI, standards/conformity, and enforcement activity. These modes are explanatory research aids; they do **not** change binding-law summaries unless a verified legal record separately supports that status.

## Stable record URLs and public data

Stable SPA routes are supported for major records:

- `/country/USA`
- `/lab/openai`
- `/instrument/eu-ai-act`
- `/rule/kr-ai-basic-act`
- `/obligation/ca-sb-53-incident-reporting`
- `/exposure/openai--market_access--eu-ai-act-regional`
- `/institution/eu-ai-office`
- `/policy-process/eu-high-risk-ai-guidelines-consultation-2026`
- `/standard/iso-iec-42001-ai-management-system`
- `/public-sector-ai/us-federal-ai-use-case-inventory`
- `/enforcement/ftc-operation-ai-comply-2024`
- `/enforcement/bartz-v-anthropic-copyright-2025`

Compact embeddable routes are also supported for cards such as `/embed/country/USA`, `/embed/instrument/eu-ai-act`, `/embed/obligation/ca-sb-53-incident-reporting`, and `/embed/atlas/oxford-gov-ai-readiness-2025`.

Vercel rewrites these routes to the SPA, and the Workbench or embed view renders the matching record summary, obligations, implementation milestones, source metadata, correction link, and evidence-dossier actions where available.

Build-time public data endpoints:

- `/data/full-dataset.json`
- `/data/country-summaries.json`
- `/data/obligation-matrix.json`
- `/data/lab-exposure-matrix.json`
- `/data/lab-intelligence.json`
- `/data/model-governance-evidence.json`
- `/data/safety-evaluations.json`
- `/data/enforcement-events.json`
- `/data/compute-dependencies.json`
- `/data/institutions.json`
- `/data/policy-processes.json`
- `/data/standards-conformity.json`
- `/data/public-sector-ai.json`
- `/data/eu-ai-act-authority-matrix.json`
- `/data/enforcement-litigation.json`
- `/data/policy-brief-index.json`
- `/data/corpus-index.json`
- `/data/corpus-coverage-report.json`
- `/data/data-dictionary.json`
- `/data/implementation-tracker.json`
- `/data/ai-atlas-indicators.json`
- `/data/ai-atlas-sources.json`
- `/data/readiness-reports.json`
- `/data/source-metadata.json`
- `/data/changelog.json`
- `/data/catalog.json`
- `/data/record-page-index.json`
- `/data/embed-cards.json`
- `/data/schema.json`
- `/data/release-package.json`

## How to add data

### Add a new country

1. Append a `{ iso3, name, region }` entry in `src/data/countries.ts` (`COUNTRY_SEED`).
2. Make sure the topojson supplies a matching numeric id (the world-atlas 110m file does for every UN member state).
3. If the country joins the EU later, add it to `euMembers.ts`.

### Add a new national AI regulation

Append to `src/data/nationalAIRegulations.ts`:

```ts
{
  id: "kebab-case-unique-id",
  name: "Display name",
  jurisdiction: "Country name",
  countryIso3: "ISO3",
  type: "law" | "regulation" | "guidance" | "code" | "strategy" | ...,
  bindingStatus: "binding" | "non_binding" | "voluntary" | "proposed" | "mixed",
  aiSpecific: true,              // must be true; non-AI rules belong in outOfScope.ts
  status: "Free-form status string",
  dateAdopted: "YYYY-MM-DD",     // optional
  dateInForce: "YYYY-MM-DD",     // optional
  regulatorOrBody: "Official body",
  summary: "Concise English summary.",
  frontierAIRelevant: true | false,
  sourceName: "Official source name",
  sourceUrl: "https://official.gov/url",
}
```

If `aiSpecific` is not literally `true`, the validator surfaces an error.

### Add a new international instrument

Same schema as above plus `organizationType`, `instrumentType`, `bindingStatus`, optional `powerScore`. Append to `src/data/internationalInstruments.ts`.

### Add participation data

`src/data/participation.ts` builds rows from named participant lists. Add a new list at the top, then call `makeRows(...)` in the assembly section. Always:

- Use an existing `participationType` (never infer `ratified` from `signed`).
- Provide `sourceName` + `sourceUrl` to the official treaty office / declaration page, not a media summary.
- Add a `note` when participation is partial, indirect, or via membership.

## Editorial workflow

The lightweight editorial workflow is documented in [`docs/EDITORIAL_WORKFLOW.md`](docs/EDITORIAL_WORKFLOW.md). It keeps the app static and Git-reviewed while giving contributors templates and review checks for source-backed updates.

Use the templates in [`docs/templates/`](docs/templates/) before adding or correcting:

- National AI regulations.
- International instruments and participation rows.
- Source/status corrections.
- Frontier-lab, infrastructure, and dependency records.
- Institutions, policy processes, standards/conformity, public-sector AI, enforcement/litigation, AI Atlas, and lab-intelligence records.

Public correction reports can also use the GitHub issue form in [`.github/ISSUE_TEMPLATE/data-correction.yml`](.github/ISSUE_TEMPLATE/data-correction.yml).

Release and audit references:

- [May 2026 dataset release package](docs/RELEASE_2026-05.md)
- [Current source audit](docs/SOURCE_AUDIT_CURRENT.md)
- [Changelog](docs/CHANGELOG.md)

## Source rules

Official sources are preferred:

- **EUR-Lex** + European Commission AI Office for EU
- **Council of Europe Treaty Office** for the CoE AI Convention
- **OECD Legal Instruments** for the AI Principles (`OECD/LEGAL/0449`)
- **UNESCO** and **UN Digital Library** for UN-system instruments
- **ISO** for ISO/IEC standards
- **GOV.UK** for AI Safety Summit outputs
- **Élysée** for the Paris Statement
- **NIST** for AI RMF, CAISI, INASI documents
- **CAC / MIIT / MSIT / IMDA / MeitY / ISED / METI / Cabinet Office** for national rules
- **ASEAN / African Union / APEC** official portals for regional instruments
- **Official national regulator, ministry, court, and public-inventory pages** for institutions, enforcement, procurement, registries, and policy processes
- **Issuer-controlled lab/company pages** for model-release evidence, safety frameworks, responsible-scaling policies, and deployment-market context
- **Oxford Insights, CAIDP, UNESCO, Stanford HAI, IMF, OECD.AI, and other transparent index publishers** for AI Atlas context indicators

Secondary sources are used only to discover leads or clearly labeled context, never as the authoritative basis for binding legal status.

## Validation

```bash
npm run validate:data
npm run audit:sources
npm run audit:source-links
npm run audit:sources -- --output=source-audit-report.md --json-output=source-audit-report.json
npm run audit:source-links -- --output=source-link-audit-report.md --json-output=source-link-audit-report.json
npm run audit:data-review
npm run audit:data-review -- --output=data-review-report.md --json-output=data-review-report.json
```

`audit:source-links` is an editorial aid, not a public UI signal. Some official
government and standards sites reject scripted `HEAD`/`GET` checks or time out even when a
human browser can open them. Known cases live in
[`src/data/sourceLinkManualChecks.json`](src/data/sourceLinkManualChecks.json); the audit report
separates true link warnings from manual-check exceptions. Do not downgrade a record's legal/source
status solely because an official site blocks automation.

CI uploads Markdown and JSON artifacts for source metadata, source links, and editorial review.
Metadata warnings fail CI; link warnings remain non-failing unless a maintainer explicitly runs
`--fail-on-link-warnings`. If a runtime cannot reach most external source sites, the link audit
reports a link-environment warning instead of flooding the report with false broken-link warnings.

CI also uploads Markdown and JSON editorial data-review artifacts. These are warning-first
review aids for source freshness, low-confidence records, uncertain status, and strong
legal-effect claims that deserve human attention before public citation.

`validateData.ts` runs on dev-mode app start and logs a grouped console report. It checks:

- Every country has `iso3`, `name`, `region`.
- Every national regulation has `aiSpecific === true`.
- Every international instrument has `aiSpecific === true`.
- Every participation row references a known instrument id and country iso3.
- Every regulation and instrument has a `sourceUrl`, source classification, verification status, confidence, and `lastVerified` metadata where available.
- Source URLs are parseable and use classified hosts where possible.
- Snapshot dates do not exceed 19 May 2026.
- EU-only applicability rows do not attach to non-EU countries.
- Indirect `covered_by_membership` rows are surfaced for caveat review.
- No duplicate ids across data sources.
- No Cyrillic characters leak into displayed strings.

## Known limitations

- UNESCO, UNGA resolutions, and the Global Digital Compact are represented via `covered_by_membership` across UN member states rather than 193 explicit sign-on rows. This avoids implying participation data we do not have.
- ISO/IEC standards have no per-country participation rows. Standards are voluntary and adopted via the global standardization system, not per-state sign-on.
- The Frontier Model Forum is shown for context but flagged as non-state / industry governance.
- Participation dates are filled only where the underlying official source gives a clean date.
- The Council of Europe AI Convention is **not yet in force** as of 19 May 2026.
- EU AI Act authority rows follow the European Commission's published authority list; countries marked "not yet published" should not be read as lacking a future authority.
- AI Atlas scores, public-sector records, standards, procurement guidance, lab intelligence, and enforcement context are separated from legal-status coloring unless a verified legal record independently supports a binding claim.
- Export controls (BIS, Wassenaar, JP/NL/US semiconductor restrictions) are intentionally excluded from the main dataset; they sit in `outOfScope.ts`.
- This is a research dashboard, **not legal advice**. Verify time-sensitive legal status against linked official sources before acting on a claim.

## Roadmap

- Expand official-source coverage for EU AI Act authorities, national AI regulators, AI safety institutes, public-sector AI registries, procurement guidance, enforcement/litigation events, and lab intelligence.
- Expand the obligation matrix beyond the first high-impact instruments and rules while preserving official-source verification.
- Add deeper sectoral domains for employment, biometrics, healthcare, finance, education/children, defense/autonomous weapons, synthetic media, public procurement, and compute/cloud/chips.
- Move more corpus/table-only data into deeper lazy chunks or generated JSON before another large dataset expansion.
- Add monthly dataset releases with source-delta artifacts, source-audit artifacts, and public changelog entries.
- Add more embeddable country/lab/treaty/obligation/Atlas/corpus cards backed by the generated public JSON endpoints.
- Expand Playwright coverage to visual regression, route smoke tests, workbench scenarios, and cross-browser matrix.

## License & credits

**Code**: MIT. See [`LICENSE`](LICENSE).

**Dataset**: licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Compiled from the official sources listed under [Source rules](#source-rules) and cross-checked against the **CAIDP Index 2026** ("Artificial Intelligence and Democratic Values 2026", Center for AI and Digital Policy). Always verify time-sensitive details against the linked sources before relying on the map for policy or legal decisions.

**Seed briefs**: two internal product briefs (one Russian-language broader-AI brief, one English-language international-instruments register) seeded the initial dataset. Both have been translated and normalised; the app ships in English only.

**Acknowledgements**: react-simple-maps, d3-geo, d3-force, world-atlas (Mike Bostock), Tailwind Labs, the Vercel team, and the original CAIDP authors whose country-by-country review made the 2026 enrichment possible.
