# Global AI Governance Map

An interactive policy-research dashboard. Maps **frontier-AI governance** through four switchable lenses — geography, governance layer, dependency network, and chronology — over a dataset of countries, frontier labs, international AI instruments, national AI rules, subnational rules, infrastructure choke-points, and the dependencies between them.

## Four lenses on the same data

- **Geography** — country fill by binding status of national AI rule, with frontier-lab HQ pins overlaid (13 labs, sized by power score). Click any country or lab pin for a detail drawer.
- **Layers** — recolours countries by the highest governance layer present (frontier-lab HQ → binding national law → proposed → guidance → international participation only).
- **Network** — force-directed graph of all actors and edges: countries, labs, instruments, national rules, and infrastructure, with edge types `regulates / depends_on / constrains / influences / coordinates / participates_in` (edge thickness = strength).
- **Timeline** — 115+ AI governance milestones plotted from 2017 (Finland AI Programme) → 2026 (Kazakhstan AI Law, Taiwan AI Basic Act, Vietnam AI Law).

A **"Take the tour"** button runs a guided 5-step walkthrough (① Who builds frontier AI? → ② Who can actually stop them? → ③ International coordinators → ④ Evaluations & standards → ⑤ Compute & chips).

The app is English-only, runs entirely client-side, and ships with a Vercel-ready build.

## What it shows

- **National AI-specific regulations** — EU AI Act, China's Generative AI / Deep Synthesis / Algorithm-Recommendation / AI-content-labeling rules, South Korea's AI Basic Act, NIST AI RMF, UK's pro-innovation framework + AISI, Canada's AIDA (proposed) + Voluntary Code + CAISI, Japan's AI promotion law + Guidelines + AISI, Singapore's Model Framework + AI Verify, Australia's Voluntary Standard + proposed mandatory guardrails, IndiaAI Mission.
- **International AI governance instruments** — UNESCO Ethics Recommendation, UNGA 78/265, UNGA 78/311, Global Digital Compact, UNGA 79/325 (AI Panel + Global Dialogue), OECD AI Principles, G20 AI Principles, the full G7 Hiroshima trio + reporting framework, EU AI Act, Council of Europe Framework Convention on AI, Council of the EU AI conclusions, ISO/IEC 42001 / 23894 / 38507 / 22989 / 42005, AI Safety Summit outputs (Bletchley, Seoul Declaration, Seoul Statement of Intent, Seoul Ministerial, Paris 2025 Statement, INASI), ASEAN governance guides (2024 + 2025 generative-AI expansion), African Union Continental AI Strategy, APEC Digital and AI Ministerial Statement + AI Initiative 2026–2030, bilateral instruments (EU–US trustworthy-AI roadmap, UK–US AISI MoU), and the Frontier Model Forum (flagged as non-state industry governance).
- **Participation matrix** — distinguishes `signed`, `ratified`, `endorsed`, `adopted`, `adherent`, `member`, `participant`, `applicable_via_eu`, and `covered_by_membership`.

Out-of-scope items (GDPR, DPDP, generic cybersecurity, BIS/Wassenaar/JP-NL-US export controls, generic digital strategies) are catalogued in [src/data/outOfScope.ts](src/data/outOfScope.ts) so it's clear *why* they were excluded — they are not AI-specific governance instruments.

The dataset is a snapshot as of **19 May 2026**. The Council of Europe AI Convention is not yet in force on that date.

## Tech stack

- Vite + React 19 + TypeScript (strict mode)
- Tailwind CSS v4 via `@tailwindcss/vite`
- `react-simple-maps` with the **Equal Earth** projection
- `world-atlas` country TopoJSON bundled from npm
- Static ISO numeric ↔ alpha-3 mapping in `src/utils/normalizeCountry.ts`
- No backend, no paid APIs

The project expects Node `^20.19.0 || >=22.12.0` and npm `>=10`.

Security note: `package.json` uses an npm override for transitive `d3-color` so the
`react-simple-maps` dependency graph resolves to the patched ReDoS-safe version.
Keep the override until the upstream map dependency ships a clean dependency graph.

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

To build:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

`npm run build` runs `tsc -b` then `vite build`. The production bundle goes to `dist/`.
`npm run lint` is currently a TypeScript no-emit check; a full ESLint pass is still a roadmap item.

## Deploy to Vercel

### Option 1 — Vercel dashboard (Git import)

1. Push the project to GitHub, GitLab, or Bitbucket.
2. Open <https://vercel.com/new>.
3. Import the repository.
4. Vercel auto-detects the **Vite** framework preset. Confirm:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

The included [`vercel.json`](vercel.json) pre-locks those settings, so you can also import without touching the form.

### Option 2 — Vercel CLI

```bash
npm install -g vercel
vercel login           # only needed once per machine
vercel                 # preview deployment
vercel --prod          # production deployment
```

The CLI uses the same `vercel.json` configuration.

### Environment variables

The MVP needs none. If you add any, use the `VITE_` prefix so Vite exposes them to the client bundle and configure them in **Project → Settings → Environment Variables** in Vercel.

## How the map color logic works

Default fill:

- **Gray** — no AI-specific data currently included for the country.
- **Light blue** — has guidance / voluntary AI framework only.
- **Medium blue** — has a proposed AI law or mixed framework.
- **Dark blue** — has at least one binding AI-specific law in force (this includes EU member states under the EU AI Act).

Outlines:

- **Gold** — matches the currently selected international instrument filter.
- **Solid purple** — ratified a binding AI treaty (Council of Europe AI Convention).
- **Dashed purple** — signed a binding AI treaty but not yet ratified.

When one or more international instruments are selected as filters, countries that don't match drop to ~25 % opacity and matching countries pick up the gold outline. The **AND / OR** toggle in the filter rail controls whether a country must participate in *all* selected instruments (AND) or *at least one* (OR).

## Data architecture

```
src/data/
  countries.ts                 # ISO-3166 alpha-3 country list + region tagging + helpers (OECD / G7 / G20 / APEC / ASEAN / AU / CoE member lists)
  euMembers.ts                 # The 27 EU member ISO3 codes, drives `applicable_via_eu` participation rows
  nationalAIRegulations.ts     # AI-specific national rules, all carry `aiSpecific: true`
  internationalInstruments.ts  # AI-specific international instruments, all carry `aiSpecific: true`
  participation.ts             # `(instrumentId, countryIso3, participationType, date, source)` rows; computed programmatically from authoritative participant lists
  sourceNotes.ts               # caveats per instrument / topic
  outOfScope.ts                # excluded items + reasonExcluded
```

Every regulation and instrument has a `sourceName` and `sourceUrl`. Wherever a participant list could not be verified end-to-end, the participation type is `covered_by_membership` (UN / UNESCO / ASEAN / AU / APEC member states) and the panel surfaces a caveat note rather than implying explicit per-country sign-on.

## How to add data

### Add a new country

1. Append a `{ iso3, name, region }` entry in `src/data/countries.ts` (`COUNTRY_SEED`).
2. Make sure the topojson supplies a matching numeric id (the world-atlas 110m file does for every UN member state).
3. If the country joins the EU later, add it to `euMembers.ts`.

### Add a new national AI regulation

Append an entry to `src/data/nationalAIRegulations.ts`:

```ts
{
  id: "kebab-case-unique-id",
  name: "Display name",
  jurisdiction: "Country name",
  countryIso3: "ISO3",
  type: "law" | "regulation" | "guidance" | "code" | ...,
  bindingStatus: "binding" | "non_binding" | "voluntary" | "proposed" | "mixed",
  aiSpecific: true,               // must be true; non-AI rules belong in outOfScope.ts
  status: "Free-form status string",
  dateAdopted: "YYYY-MM-DD",      // optional
  dateInForce: "YYYY-MM-DD",      // optional
  regulatorOrBody: "Official body",
  summary: "Concise English summary.",
  frontierAIRelevant: true | false,
  sourceName: "Official source name",
  sourceUrl: "https://official.gov/url",
}
```

If `aiSpecific` is not literally `true`, the dev-mode validator will surface an error.

### Add a new international instrument

Append an entry to `src/data/internationalInstruments.ts` (same schema as above plus `organizationType`, `instrumentType`, `bindingStatus`, optional `powerScore`).

### Add participation data

`src/data/participation.ts` builds rows from named participant lists. Add a new list at the top (e.g. `const MY_INSTRUMENT_PARTICIPANTS = [...]`) and a `makeRows(...)` call inside the assembly section. Always:

- Use an existing `participationType` (do **not** infer `ratified` from `signed`).
- Provide a `sourceName` + `sourceUrl` for the participant list, ideally the official treaty office / declaration page rather than a media summary.
- Add a `note` when the participation is partial, indirect, or via membership.

## Source rules

Official sources are preferred:

- EUR-Lex, European Commission AI Office for EU
- Council of Europe Treaty Office for the CoE AI Convention
- OECD legal instruments for the AI Principles
- UNESCO and UN Digital Library for UN-system instruments
- ISO for ISO/IEC standards
- GOV.UK for AI Safety Summit outputs
- Élysée for the Paris Statement
- NIST for AI RMF, CAISI, INASI documents
- CAC / MIIT / MSIT / IMDA / MeitY / ISED / METI / Cabinet Office for national rules
- ASEAN, African Union, APEC official portals for regional instruments

Secondary sources are used only to discover leads, never as the authoritative final source.

See [docs/DATA_GOVERNANCE.md](docs/DATA_GOVERNANCE.md) for the dataset taxonomy, verification metadata, and source-review checklist. The current source-audit notes are in [docs/SOURCE_VERIFICATION_2026-05-20.md](docs/SOURCE_VERIFICATION_2026-05-20.md).

## Known limitations

- UNESCO, UNGA resolutions, and the Global Digital Compact are represented via `covered_by_membership` across UN member states rather than as 193 explicit sign-on rows. This avoids implying participation data we do not have.
- ISO/IEC standards have no per-country participation rows. Standards are voluntary and adopted via the global standardization system, not per-state sign-on.
- The Frontier Model Forum is shown for context but flagged as non-state / industry governance. No country participation rows.
- Participation dates are filled only where the underlying official source gives a clean date.
- The Council of Europe AI Convention is **not yet in force** as of 19 May 2026. Entry into force requires five ratifications including at least three Council of Europe member states.
- Export controls (BIS, Wassenaar, JP/NL/US semiconductor restrictions) are intentionally excluded from the main dataset; they are catalogued in `outOfScope.ts` as non-AI-specific.
- This is a research dashboard, not legal advice. Verify time-sensitive legal status against the linked official sources before relying on a claim.

## Validation

Run the explicit data checks with:

```bash
npm run validate:data
```

`src/utils/validateData.ts` runs on dev-mode app start and logs a grouped console report. It checks:

- Every country has `iso3`, `name`, `region`.
- Every national regulation has `aiSpecific === true`.
- Every international instrument has `aiSpecific === true`.
- Every participation row references a known instrument id and country iso3.
- Every regulation and instrument has a `sourceUrl`.
- Source URLs are parseable and use classified hosts where possible.
- Snapshot dates do not exceed 19 May 2026.
- EU-only applicability rows do not attach to non-EU countries.
- Indirect `covered_by_membership` rows are surfaced for caveat review.
- No duplicate ids across data sources.
- No Cyrillic characters in displayed strings (the seed inputs were Russian; the app is English-only).

If the validator passes, the console shows a single green-bold info line summarizing dataset size.

## License

MIT. The dataset is compiled from official sources; please verify time-sensitive details against the linked sources before relying on the map for policy or legal decisions.
