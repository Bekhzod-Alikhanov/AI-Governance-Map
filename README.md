# Global AI Governance Map

> Interactive policy-research dashboard that maps how **frontier AI** is governed today — countries, frontier-AI labs, international instruments, national + subnational rules, and the dependencies between them — viewable through five switchable lenses (geography, governance layer, dependency network, chronology, and research table).

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
</p>

**Live demo:** <https://global-ai-governance-map.vercel.app>

---

## Contents

- [Overview](#overview)
- [What's on the map](#whats-on-the-map)
- [Five lenses](#five-lenses-on-the-same-data)
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
- [How to add data](#how-to-add-data)
- [Editorial workflow](#editorial-workflow)
- [Source rules](#source-rules)
- [Validation](#validation)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License & credits](#license--credits)

---

## Overview

The dashboard answers a deceptively simple question — *"how is frontier AI actually governed right now?"* — and gives a research-grade answer across five lenses on the same dataset, with research-question presets, shareable URLs, source metadata, and exportable table workflows.

It is **client-only**: a static Vite build, no backend, no paid APIs, no user accounts. Everything ships as JavaScript + JSON + an SVG world map. Deployment is a single `vercel deploy` from the project root, and the live site auto-rebuilds on every push to `main`.

The Geography and Layers maps support in-page maximize mode, region focus presets, zoom, pan, and reset controls so researchers can move from a full-world overview to a readable regional view without leaving the dashboard.

A guided **"Take the tour"** walkthrough runs new visitors through a five-step narrative: ① Who builds frontier AI? → ② Who can actually stop them? → ③ International coordinators → ④ Evaluations & standards → ⑤ Compute & chips.

## What's on the map

- **192 countries** (UN member states + key dependent territories) plus the European Union as a supranational entity.
- **13 frontier-AI labs** pinned to their HQ cities — OpenAI, Anthropic, Google DeepMind, Meta, Microsoft, Amazon, xAI, Mistral, Cohere, DeepSeek, Baidu, Alibaba, Tencent — each with internal safety framework, FMF membership, and a typed regulatory-exposure workbench.
- **33 international AI instruments** — UNESCO Recommendation, UNGA 78/265 + 78/311 + 79/325, Global Digital Compact, OECD AI Principles, G20 AI Principles, the G7 Hiroshima trio + reporting framework, EU AI Act, Council of Europe Framework Convention on AI, ISO/IEC 42001 / 23894 / 38507 / 22989 / 42005, the Bletchley → Seoul (×3) → Paris summit chain, INASI, ASEAN guides, AU Continental AI Strategy, APEC instruments, and key bilaterals (EU–US TTC roadmap, UK–US AISI MoU).
- **75+ national AI-specific rules** across China, the EU, South Korea, UK, US, Japan, Singapore, Canada, Australia, India, plus binding statutes in **Kazakhstan, Vietnam, Taiwan, Italy, Slovenia**, draft bills in **Brazil, Türkiye, Mexico, Bahrain, Costa Rica, Dominican Republic, Poland, Norway, Spain**, and 30+ formal national AI strategies.
- **7 subnational rules** — California SB 53 + 13-bill 2025 package, NYC Local Law 144, NY surveillance-pricing law, Illinois AIVIA, plus draft France/Germany EU AI Act implementations.
- **3 infrastructure choke-points** — advanced AI chips, hyperscale cloud, U.S. BIS export controls — flagged as "not AI law, but governs frontier-AI capacity".
- **~85 dependency edges** typed as `regulates / depends_on / constrains / influences / coordinates / participates_in`.
- A **participation matrix** that distinguishes `signed`, `ratified`, `endorsed`, `adopted`, `adherent`, `member`, `participant`, `applicable_via_eu`, and `covered_by_membership (indirect)`.

Out-of-scope items (GDPR, DPDP, generic cybersecurity, BIS/Wassenaar/JP-NL-US export controls, generic digital strategies) are catalogued in [`src/data/outOfScope.ts`](src/data/outOfScope.ts) with explicit `reasonExcluded` text.

## Five lenses on the same data

| Lens | What it does | Implementation |
|---|---|---|
| **Geography** | Default world map. Country fill = binding status of national AI rule. Frontier-lab HQ pins overlaid, sized by power score. Includes maximize, zoom/pan, and regional focus controls. | `WorldMap.tsx` + `LabPin.tsx`, Equal Earth projection via `react-simple-maps` |
| **Layers** | Recolours countries by the highest governance layer present (corporate / national binding / proposed / voluntary / international only). Shares the same maximize, zoom/pan, and focus controls. | `getMapColor.ts → pickPrimaryLayer` (cached) |
| **Network** | Force-directed graph of every actor and edge. Lab exposure edges are generated from the typed exposure dataset so binding, voluntary, standards, and infrastructure relationships stay distinct. | `NetworkView.tsx`, `d3-force` 300-tick static layout |
| **Timeline** | 115+ AI governance milestones plotted from 2017 (Finland AI Programme) → 2026 (Kazakhstan AI Law, Taiwan AI Basic Act, Vietnam AI Law). Filterable by international / national / subnational. | `TimelineView.tsx` |
| **Table** | Sortable, filterable research table for countries, instruments, national rules, labs, lab exposure rows, participation rows, and source metadata; supports CSV export. | `TableView.tsx` |

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
│  │  │  │    Network lens   → NetworkView      (lazy)      │    │    │    │
│  │  │  │    Timeline lens  → TimelineView     (lazy)      │    │    │    │
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
│  │   │  countries · frontierLabs · internationalInstruments │       │    │
│  │   │  nationalAIRegulations · participation · etc.       │        │    │
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

There is **no backend, no API, no database, no auth**. The entire dataset is shipped as static TypeScript modules in `src/data/*`, type-checked at build time and validated at dev start. This is intentional — the dataset is small (~70 kB minified), changes infrequently, and we want zero ongoing infrastructure cost.

## Frontend stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 19** | Concurrent rendering, automatic ref forwarding, `Suspense` for lazy lenses, `use` hook for future async data |
| Language | **TypeScript 6 (strict)** | Strict null checks; data-shape errors surface at build time before they hit production |
| Build | **Vite 8** + **`@vitejs/plugin-react`** | Standard React plugin (kept on Babel for full ESLint plugin compatibility) |
| Linting | **ESLint 10** + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` | Catches hook-rule violations and a11y mistakes before runtime |
| Bundler split | Rolldown via Vite | Manual vendor chunks (`react`, `d3`, `map`) so repeat-visit cache hits redownload only the 46 kB app chunk |
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

**None — by design.** The dataset is static TypeScript. Adding a country, instrument, regulation, or edge is an `Edit` + commit + push; Vercel auto-rebuilds.

If a future iteration needs editorial workflow (e.g. a CMS for non-engineer contributors), the natural extension points are:

1. Move `src/data/*.ts` to a backing JSON file generated from a headless CMS (Sanity / Decap / Tina).
2. Add a `vite-plugin-fetch` step at build time that fetches the live participation matrix from an authoritative source (OECD.AI Observatory, CoE Treaty Office).
3. Move dataset to **Vercel KV** + a tiny serverless API for live updates, with a build-time fallback to the bundled snapshot for offline browsing.

None of that is implemented today.

## Data layer

```
src/data/
  countries.ts                  192 ISO-3166 alpha-3 entries + region tagging + helper member lists (OECD, G7, G20, APEC, ASEAN, AU, CoE)
  euMembers.ts                  27 EU member ISO3 codes — drives applicable_via_eu participation rows
  frontierLabs.ts               13 labs + internal safety framework + FMF flag + power score
  labRegulatoryExposures.ts     typed lab exposure rows: binding, voluntary, standards, infrastructure, and indirect ecosystem claims
  infrastructure.ts             3 nodes: advanced AI chips, hyperscale cloud, U.S. BIS export controls
  internationalInstruments.ts   33 instruments with verificationMeta + canonical sources
  nationalAIRegulations.ts      75+ national AI rules with binding status + dates + regulator + source URL
  subnationalRules.ts           U.S. state/city laws + draft EU-member implementations
  participation.ts              ~1,410 rows: (instrumentId, countryIso3, participationType, date, source)
  dependencies.ts               ~85 typed edges across the actor graph
  outOfScope.ts                 GDPR, DPDP, BIS, Wassenaar, … with reasonExcluded
  sourceNotes.ts                Topic-level caveats surfaced in side panels
  walkthrough.ts                5-step guided tour content + per-step filter patch + target lens
```

Every record carries `sourceName` + `sourceUrl`. Most carry `verificationMeta` (`sourceKind`, `verificationStatus`, `confidence`, `lastVerified`) so the UI can mark uncertain claims with an explicit badge.

`participation.ts` is **derived** — it builds rows from authoritative participant lists (Bletchley participants, OECD adherents, etc.) and a few synthetic groupings (EU AI Act applicability via EU member list, UN coverage via UN membership). It is never edited row-by-row.

See [`docs/DATA_GOVERNANCE.md`](docs/DATA_GOVERNANCE.md) for the dataset taxonomy and source-review checklist. The most recent audit pass is in [`docs/SOURCE_VERIFICATION_2026-05-20.md`](docs/SOURCE_VERIFICATION_2026-05-20.md).

## Project structure

```
.
├── docs/
│   ├── DATA_GOVERNANCE.md
│   └── SOURCE_VERIFICATION_2026-05-20.md
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                       entry point
│   ├── App.tsx                        layout + state
│   ├── index.css                      Tailwind v4 @theme tokens + base
│   ├── types.ts                       all shared TS types
│   ├── components/                    21 React components
│   │   ├── WorldMap.tsx               Equal Earth SVG + country geographies + lab pins
│   │   ├── NetworkView.tsx            d3-force static-layout graph
│   │   ├── TimelineView.tsx           horizontal milestone timeline
│   │   ├── TableView.tsx              sortable/exportable research rows, including lab exposure
│   │   ├── LensSwitch.tsx             5-way lens toolbar
│   │   ├── Filters.tsx                Instrument / Participation / Binding force / Organization / Region / Frontier labs / National AI rules
│   │   ├── CountrySidePanel.tsx       per-country drawer
│   │   ├── LabSidePanel.tsx           per-lab drawer
│   │   ├── ConnectionsSection.tsx     dependency-edge list (grouped by relationship)
│   │   ├── WalkthroughOverlay.tsx     5-step guided tour
│   │   ├── DataActions.tsx            CSV / JSON dataset export
│   │   ├── SearchBox.tsx              fuzzy across countries / acts / instruments
│   │   ├── VerificationMeta.tsx       per-item source verification chip (verified / likely / uncertain)
│   │   ├── Legend / Tooltip / DataQualityNotice / EmptyState / SourceLink / ParticipationBadge / NationalRegulationList / InstrumentList / DeploymentBadge / LabPin
│   ├── data/                          13 static data modules (see above)
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
│   │   ├── exportDataset.ts                   CSV / JSON build
│   │   ├── datasetSchema.ts                   runtime dataset schema check
│   │   ├── keyboardActivation.ts              a11y helper for clickable non-button elements
│   │   ├── useDialogFocus.ts                  React hook: focus trap + Escape close
│   │   ├── translateSeedDataToEnglish.ts      Cyrillic check + RU→EN map
│   │   └── validateData.ts                    dev-mode validator + green/red summary line
│   └── test/setup.ts
├── tests/
│   └── e2e/
│       ├── smoke.spec.ts              Playwright: load + lens switch + side panel
│       └── a11y.spec.ts               Playwright: keyboard nav + dialog focus + reduced-motion
├── scripts/
│   └── run-playwright.mjs             Playwright runner with sensible defaults
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

| Chunk | Size (gzip) | Loaded |
|---|---:|---|
| `react`  | 58 kB | first paint, cached cross-deploy |
| `map`    | 48 kB | first paint, cached cross-deploy |
| `d3`     | 37 kB | first paint, cached cross-deploy |
| `index`  | 46 kB | first paint, changes per deploy |
| CSS      | 6 kB  | first paint |
| `NetworkView`  | 2 kB | **lazy** — loads when user picks Network lens |
| `TimelineView` | 1 kB | **lazy** — loads when user picks Timeline lens |

Repeat visits hit the cached vendor chunks and redownload only the 46 kB app chunk. Vite emits `<link rel="modulepreload">` for every vendor chunk in `index.html` so the browser fetches them in parallel with the main script.

Production build: ~0.6 s with SWC + Rolldown. Dev HMR: instant.

## Testing & CI

- **Unit / selector tests** — **Vitest 4** with `jsdom`. 30+ tests across `filterCountries`, `getCountryGovernanceSummary`, `governanceTaxonomy`, `exportDataset`, `keyboardActivation`, `datasetSchema`, `validateData`. Run with `npm test` or `npm run test:watch`.
- **End-to-end + accessibility** — **Playwright 1.60** (`tests/e2e/smoke.spec.ts`, `tests/e2e/a11y.spec.ts`). Run with `npm run test:e2e` (full suite) or `npm run test:a11y` (a11y only). The a11y suite covers keyboard navigation, dialog focus traps, and `prefers-reduced-motion` honouring.
- **Linting** — **ESLint 10** with `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y`. Run with `npm run lint`.
- **Type checking** — `npm run typecheck` runs `tsc -b --noEmit` against strict TypeScript.
- **Dataset checks** — `npm run validate:data` and `npm run validate:export` run the relevant vitest files in isolation, for quick pre-commit dataset sanity checks.
- **Editorial data review** — `npm run audit:data-review` produces Markdown/JSON review artifacts for stale, uncertain, low-confidence, or strong legal-effect records needing human review.
- **Official-source delta monitor** — `npm run audit:deltas` checks a small set of legally consequential official sources for changes; `npm run audit:deltas:write` refreshes `docs/SOURCE_DELTA_REPORT.md`.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs ESLint, `tsc -b`, `vitest run`, and `vite build` on every push and PR.
- **Dependabot** (`.github/dependabot.yml`) opens a PR each week for npm minor/patch updates.
- A dev-mode runtime validator (`validateData.ts`) prints a green-bold summary line if the dataset is clean: `✅ Data OK · 192 countries · 33 instruments · 75 national regs · 13 labs · 85 edges · 1410 participation rows`.

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
npm run test:e2e          # Playwright smoke + a11y end-to-end
npm run test:a11y         # Playwright a11y suite only
npm run build             # tsc -b && vite build  →  dist/
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

Secondary sources are used only to discover leads, never as the authoritative final source.

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
- Export controls (BIS, Wassenaar, JP/NL/US semiconductor restrictions) are intentionally excluded from the main dataset; they sit in `outOfScope.ts`.
- This is a research dashboard, **not legal advice**. Verify time-sensitive legal status against linked official sources before acting on a claim.

## Roadmap

- Editorial CMS backing `src/data/*` for non-engineer contributors.
- Scheduled CI artifact for `npm run audit:deltas` so official-source changes are reviewed before the public snapshot goes stale.
- Build-time fetch from OECD.AI Observatory + CoE Treaty Office for live participation deltas.
- Wider mobile breakpoints (current focus is desktop / tablet ≥ 768 px).
- Sectoral lens (military AI / lethal autonomous weapons, healthcare AI, financial AI).
- Civil-society / academia layer (CAIDP, AlgorithmWatch, AI Now, Future Society).
- Per-country share-link URLs (`?country=KAZ&lens=network`).
- Expand Playwright coverage to full visual regression + cross-browser matrix.

## License & credits

**Code**: MIT. See [`LICENSE`](LICENSE) if present, otherwise the MIT text in `package.json` applies.

**Dataset**: compiled from the official sources listed under [Source rules](#source-rules) and cross-checked against the **CAIDP Index 2026** ("Artificial Intelligence and Democratic Values 2026", Center for AI and Digital Policy). Always verify time-sensitive details against the linked sources before relying on the map for policy or legal decisions.

**Seed briefs**: two internal product briefs (one Russian-language broader-AI brief, one English-language international-instruments register) seeded the initial dataset. Both have been translated and normalised; the app ships in English only.

**Acknowledgements**: react-simple-maps, d3-geo, d3-force, world-atlas (Mike Bostock), Tailwind Labs, the Vercel team, and the original CAIDP authors whose country-by-country review made the 2026 enrichment possible.
