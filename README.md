# AI Governance Map

**Who governs frontier AI, where it binds, and what the source actually says.**

An interactive research instrument covering 192 countries, 37 international instruments, 75 national AI rules and the 13 labs building frontier models — every claim carrying the official source it came from.

<p>
  <a href="https://global-ai-governance-map.vercel.app"><img alt="Live" src="https://img.shields.io/badge/live-global--ai--governance--map.vercel.app-1E40AF?style=flat-square&logo=vercel" /></a>
  <img alt="Release" src="https://img.shields.io/badge/release-17_August_2026-B45309?style=flat-square" />
  <img alt="Sources" src="https://img.shields.io/badge/sourced_records-2%2C320-0F766E?style=flat-square" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-163_unit_%2B_40_e2e-6E9F18?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/code-MIT-555?style=flat-square" />
  <img alt="Data license" src="https://img.shields.io/badge/data-CC_BY_4.0-555?style=flat-square" />
</p>

**→ [Open the map](https://global-ai-governance-map.vercel.app)**

---

## Try these

Each link opens the live map in the state described. This is what the tool is for.

| Question | Link |
|---|---|
| Which countries have a binding AI law? | [Binding-law map](https://global-ai-governance-map.vercel.app/?mapMode=binding-law) |
| Where has an AI rule actually been enforced? | [Enforcement & litigation](https://global-ai-governance-map.vercel.app/?mapMode=enforcement-activity) |
| Who signed the Council of Europe AI Convention — and who ratified it? | [Treaty participation](https://global-ai-governance-map.vercel.app/?mapMode=treaty-participation) |
| What does one country's position look like in full? | [Uzbekistan](https://global-ai-governance-map.vercel.app/country/UZB) |
| Who can actually regulate OpenAI? | [OpenAI exposure](https://global-ai-governance-map.vercel.app/lab/openai) |
| How did we get here? | [2017 → 2026 timeline](https://global-ai-governance-map.vercel.app/?lens=timeline) |

Every one of those URLs is stable and shareable. The map's full state — view, filters, selected country, colour mode — lives in the address bar, so a view you build is a view you can cite.

---

## What it does

### One map, seventeen questions

The world map recolours on demand: binding law, proposed law, treaty participation, obligations by category, implementation deadlines, source confidence, enforcement activity, standards infrastructure, frontier relevance, lab headquarters, and seven contextual indicator layers from Oxford Insights, CAIDP, UNESCO RAM and Stanford HAI.

Countries with no national AI rule are **not** shown as blank. Most are covered by international instruments, and the map says so — because "no law here" and "nothing here" are different claims.

### Five lenses on one dataset

| Lens | What it answers |
|---|---|
| **Workbench** | Pick a research question, get an answer with its sources attached. Compare jurisdictions, labs, instruments and obligations side by side; export the comparison as CSV. |
| **Geography** | Where governance exists, and of what kind. Zoom, region focus, maximise, plus a keyboard-navigable country list as a text alternative. |
| **Network** | Who regulates, constrains, coordinates or depends on whom. Six relationship types, each visually distinct. |
| **Timeline** | 135 milestones from Finland's 2017 AI programme to the 2026 Kazakh, Taiwanese and Vietnamese AI laws. |
| **Table** | 14 datasets, sortable and filterable, with CSV export and source metadata on every row. |

### Distinctions the dataset refuses to collapse

This is where a governance map earns or loses its credibility.

- **Signature is not ratification.** The Council of Europe convention shows 1 ratification against 20 signature-only rows, and is not yet in force.
- **EU applicability is not national enactment.** A member state covered by the AI Act is tracked separately from one that has passed its own statute.
- **Context is not law.** Readiness indices, institutional records and public-sector registries are labelled context and never drive a binding-law summary.
- **An editorial gap is not an absence.** 159 countries have no institution record; the corpus says so rather than implying none exists.

### Built to be cited

- **543 stable record URLs**, each with its own title and link preview.
- **30 static JSON endpoints** under `/data/` — the whole dataset, or any slice, with no API key.
- **Evidence dossiers and policy briefs** exportable as Markdown or print/PDF for any country, lab or instrument.
- **Embeddable cards** at `/embed/country/USA` and similar, framed by design.
- **Suggested citation** and versioned dataset releases in the Methodology panel.

---

## What's in the dataset

Research release **17 August 2026**; coverage through **17 August 2026**; status as of **17 August 2026**. Per-record verification dates remain visible and test-enforced.

| | |
|---|---:|
| Countries (UN members + key territories, plus the EU) | 192 |
| International instruments | 37 |
| National AI-specific rules | 75 |
| Subnational rules | 5 |
| National EU AI Act implementation records | 2 |
| Frontier labs, with intelligence profiles | 13 |
| Participation rows | 1,439 |
| Lab regulatory exposures | 106 |
| Structured obligations | 21 |
| Implementation milestones | 20 |
| Enforcement and litigation records | 38 |
| EU AI Act authority matrix rows | 27 |
| Institutions · policy processes · standards · public-sector AI | 23 · 10 · 11 · 10 |
| Dependency edges | 99 |
| **Records carrying a source URL** | **2,320** |

Coverage spans the EU AI Act, China's CAC measures, South Korea's AI Basic Act, binding statutes in Kazakhstan, Vietnam, Taiwan, Italy and Slovenia, draft bills across Brazil, Türkiye, Mexico and others, the Bletchley → Seoul → Paris summit chain, the ISO/IEC 42001 family, NIST's AI RMF, and landmark litigation including *Bartz v. Anthropic*, *Kadrey v. Meta* and *Garcia v. Character.AI*.

**Out of scope, deliberately:** GDPR, DPDP, generic cybersecurity law, export controls and generic digital strategies are catalogued in [`outOfScope.ts`](src/data/outOfScope.ts) with the reason for each exclusion. Three infrastructure choke-points are included as context, clearly marked as not AI law.

---

## How the sourcing works

Official sources first: EUR-Lex and the EU AI Office, the Council of Europe Treaty Office, OECD Legal Instruments, UNESCO and the UN Digital Library, ISO, GOV.UK, NIST, and the national regulators — CAC, MIIT, MSIT, IMDA, MeitY, ISED, METI, Cabinet Office — plus ASEAN, the African Union and APEC for regional instruments. Issuer-controlled pages back lab safety frameworks and model evidence. Research indices (Oxford Insights, CAIDP, Stanford HAI) are used for context indicators and classified as secondary.

**Verification is checked, not asserted:**

- Every sourced record carries `sourceKind`, `verificationStatus` and `lastVerified`.
- The status vocabulary can express a negative — `unverified` and `superseded` exist, so a record can record a mistake.
- `npm run audit:source-links` reads response **bodies**, not status codes. A page returning HTTP 200 with an anti-bot interstitial is a failure, not a pass.
- Sources whose publishers block automation carry an `archivedUrl`; the checker verifies the archived snapshot instead.
- Human verification overrides carry an expiry date, and **CI fails when one lapses**.

Where a claim cannot be verified, the tooling says so rather than going quiet. [`docs/audit/09-SOURCE-TRIAGE.md`](docs/audit/09-SOURCE-TRIAGE.md) lists what is currently outstanding and why.

---

## Design decisions worth knowing

Colour on the map means legal status, never corporate presence — a country hosting a frontier lab is coloured by its law, with lab headquarters shown as separate pins. Node size in the network encodes degree, computed from the edges on screen, rather than any editorial score. Force-directed positions carry no meaning and the view says so.

The full reasoning, including a hostile three-perspective audit of this project and everything it found, is in [`docs/audit/`](docs/audit/).

---

## Accessibility and performance

- All 192 country shapes are keyboard-focusable and labelled; a country-list dialog is a full text alternative to the choropleth.
- The lens switcher implements the ARIA tabs pattern properly — roving tabindex, arrow keys, a real tab panel.
- Automated WCAG 2.1 A/AA checks (axe) run in CI across every view.
- Renders down to 390 px. No horizontal scroll; filters collapse behind one control on phones.
- **127 KB gzipped** for the application shell and **259 KB gzipped** for the complete default Workbench route. Heavy non-default views remain lazy-loaded.
- CSP, `nosniff`, `Referrer-Policy` and `Permissions-Policy` on every response; embed routes framed deliberately.

Measured release budgets (`npm run build && npm run check:performance`):

| Metric | Current | Budget |
| --- | ---: | ---: |
| Initial JavaScript | 459,822 B | 725,000 B |
| Initial JavaScript gzip | 126,759 B | 220,000 B |
| Default Workbench route gzip | 258,875 B | 270,000 B |
| Atlas lazy chunk | 417,373 B | 430,000 B |
| Corpus lazy gzip | 19,994 B | 20,500 B |
| Total JavaScript | 1,426,354 B | 1,610,000 B |

---

## Stack

React 19 · TypeScript 6 (strict) · Vite 8 · Tailwind 4 · `react-simple-maps` with an Equal Earth projection · `d3-force`.

Client-only: a static build, no backend, no API keys, no accounts. Data lives in typed TypeScript modules validated at build time, and ships as JSON. Deployment is a push to `main`.

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # 278 tests (260 Vitest + 18 Node-native)
npm run test:e2e     # 56 desktop/mobile Playwright tests, including axe
npm run build        # validates data, generates JSON, sitemap and 543 record pages
```

Quality gates: `npm run lint`, `npm run typecheck`, `npm run validate:data`, `npm run audit:sources`, `npm run audit:source-links`, `npm run audit:manual-checks`, `npm run check:performance`.

---

## Known limitations

- UNESCO, UNGA resolutions and the Global Digital Compact are represented via `covered_by_membership` rather than 193 explicit sign-on rows — this avoids implying participation data that does not exist.
- ISO/IEC standards have no per-country participation rows; they are adopted through the standardisation system, not state sign-on.
- Participation dates appear only where the official source gives a clean one.
- The Council of Europe AI Convention is **not yet in force**.
- EU AI Act authority rows follow the Commission's published list; "not yet published" does not mean a country will have no authority.
- Verify time-sensitive details against the linked source before relying on this for legal or policy decisions.

---

## Contributing and citation

Corrections are welcome and every record has a "Report correction" link that opens a pre-filled issue. See [`docs/DATA_GOVERNANCE.md`](docs/DATA_GOVERNANCE.md) for how records are added and reviewed.

**Code:** MIT — see [`LICENSE`](LICENSE).
**Dataset:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). A suggested citation is available in the app's Methodology panel and via **Data → Download citation**.

Built and maintained by **Bekhzodkhon (Beck) Alikhanov**.
