# 01 — Findings

Pass 1 (structural). Audit date **25 July 2026**, against commit `97dc53c`.

Every row is anchored to a file:line, a command's real output, or a measurement taken in a running browser. Claims that could not be anchored are quarantined in [Unverified suspicions](#unverified-suspicions).

**Severity**: S1 undermines the artifact's core claim · S2 materially damages a primary task · S3 real but survivable · S4 polish.
**Type**: `[defect]` behaviour contradicts intent · `[risk]` latent hazard · `[taste]` preference, argued not asserted · `[strategic]` positioning.

---

## S1 — Critical

### F-01 · Track B/D · `[defect]` · Confidence: High · Effort: S

**The Layers lens ranks "hosts a lab office" above "has a binding national AI law."**

Evidence — [`getMapColor.ts:30-35`](../../src/utils/getMapColor.ts):

```ts
if (s.hqLabCount > 0) layer = "corporate";
else if (s.hasBindingNationalLaw) layer = "national_binding";
```

Confirmed in the running app (dev server, 1440×900, `?lens=layer`): `getComputedStyle` on the country paths returns `rgb(180, 83, 9)` — `#B45309`, legend label **"Has frontier-lab HQ"** — for **United States, China, France and Canada**. Germany, with binding law and no lab HQ, returns `#1D4ED8` "Binding national AI law".

I enumerated all 193 entities through both code paths in-page. Exactly 4 countries take the gold branch, and all 4 have binding or proposed national rules that the gold fill suppresses. The USA summary carries `"confirmedBindingNationalRuleCount": 1` and `"hqLabCount": 7` ([`countryMapSummaries.ts:2189-2201`](../../src/data/countryMapSummaries.ts)) — the map shows the 7, hides the 1.

**Why it matters.** The project's thesis is that AI is governed by law and institutions. On the Layers lens, the two most consequential jurisdictions on earth are coloured by where companies rent offices, and their legal status is invisible. A governance researcher reading the US as "corporate" rather than "binding law" is being told something false by the colour scale. This is the single most likely reason Layers "feels unintuitive."

**Recommendation.** Invert the precedence so legal status outranks corporate presence, and express lab HQ as an overlay (the pins already do this) rather than as a competing fill tier. If the intent is genuinely "who has the most powerful actor present," rename the tier and say so — but then it is not a governance layer.

---

### F-02 · Track A/E · `[defect]` · Confidence: High · Effort: M

**Nothing is ever pushed to browser history, so Back exits the app.**

Evidence — [`App.tsx:267`](../../src/App.tsx) uses `window.history.replaceState(null, "", nextUrl)` on every state change. `pushState` appears nowhere in `src/`. A `popstate` listener exists at [`App.tsx:229-245`](../../src/App.tsx) and is fully written — but since no entry is ever pushed, it can only fire when the user leaves the site.

**Why it matters.** The URL updates continuously as the user filters, selects and switches lenses, which *looks* like routing and trains the user to expect Back to undo. It does not: Back leaves the site entirely and discards the whole session. The `popstate` handler is dead code maintained at a cost with no behaviour. This is worse than having no URL state, because it sets an expectation and then breaks it.

**Recommendation.** Push on discrete navigation events (lens change, country/lab selection, preset application); keep `replaceState` for continuous ones (typing in search, dragging a filter). Roughly a 20-line change concentrated in the effect at `App.tsx:251-280`.

---

### F-03 · Track A · `[defect]` · Confidence: High · Effort: S

**Switching lens destroys the user's selection — the "six lenses on the same data" claim is false in the code.**

Evidence — [`App.tsx:359-368`](../../src/App.tsx):

```ts
function handleLensChange(nextLens: LensKind) {
  setLens(nextLens);
  ...
  setSelectedIso3(null);
  setSelectedLabId(null);
  setNetworkSelection(null);
```

**Why it matters.** The README sells "six lenses on the same dataset." In practice the lenses share *filters* but not *subject*. A researcher who finds Uzbekistan on the map and clicks Timeline to see its chronology gets the global timeline and has to find Uzbekistan again — except Timeline has no country selector, so they cannot. This single line is why the lens switcher feels like six separate apps rather than six views of one thing, and it is the mechanical cause of the IA problem named in [00-EXECUTIVE-SUMMARY](00-EXECUTIVE-SUMMARY.md).

**Recommendation.** Preserve `selectedIso3` / `selectedLabId` across lens changes and let each lens decide how to honour the selection (Timeline filters to that country's milestones; Network centres its ego-network; Table scrolls to the row). Clearing selection is right only when the new lens genuinely cannot represent it — and all six can.

---

### F-04 · Track D · `[defect]` · Confidence: High · Effort: S

**The dataset's own validator emits 378 warnings on every run; 371 say the data postdates its published snapshot date. Nothing fails.**

Evidence — executing `validateData()` against the current dataset:

```
ok: true
errors: 0
warnings: 378
after-snapshot warnings: 371
  Lab exposure openai--market_access--eu-ai-act-regional lastVerified is after snapshot date 2026-05-19: 2026-05-20
```

`DATA_SNAPSHOT_DATE = "2026-05-19"` ([`governanceTaxonomy.ts:10`](../../src/utils/governanceTaxonomy.ts)). **All 93 `lastVerified` values in `src/data/*.ts` are later than it**, running through 2026-06-19. The guard at [`validateData.ts:68-70`](../../src/utils/validateData.ts) fires correctly — it is simply never enforced, because [`validateData.test.ts`](../../src/utils/validateData.test.ts) asserts only `report.errors` is empty plus one specific warning substring.

**Why it matters.** The README ships a `dataset snapshot 19 May 2026` badge and the Workbench header prints `SNAPSHOT 2026-05-19`. The code disagrees 371 times. Either the badge understates currency by a month (records were verified to 19 June), or "snapshot" means something not implemented. For an artifact whose value rests on knowing exactly how old each claim is, having the freshness field contradict the freshness label in 100% of cases is a credibility problem, not a lint nit.

**Recommendation.** Decide what `DATA_SNAPSHOT_DATE` means. If it is "the date the corpus was last cut," it must move forward when records are re-verified. If it is a floor, the comparison operator is backwards. Then assert `warnings.length === 0` in the test so it can never silently drift again.

---

## S2 — Major

### F-05 · Track A/B · `[defect]` · Confidence: High · Effort: S

**The map's colour mode — the substance of what Layers does — is not in the shareable URL.**

Evidence — `ShareableAppState` ([`urlState.ts:25-36`](../../src/utils/urlState.ts)) has no `mapMode` member, and `mapMode` is plain component state at [`App.tsx:183`](../../src/App.tsx). Also excluded: `showLabs`, `isMapMaximized`, `showCountryList`, `timelineFrontierOnly`, `compareItems`. Confirmed live: switching **Color by** through all 17 options never changes `location.search`.

**Why it matters.** There are 17 colour modes ([`App.tsx:71-89`](../../src/App.tsx)) — "Enforcement & litigation", "Gov readiness", "Obligations" and so on. They are the single richest interaction in the product, and none can be linked to, bookmarked, or cited. A researcher who builds the exact view that makes their argument cannot put it in a footnote. The feature that exists (URL state) stops precisely short of the feature that matters.

**Recommendation.** Add `mapMode` and `showLabs` to `ShareableAppState`. Both are enums with existing validator sets; this follows the established `enumValue()` pattern and is perhaps 10 lines.

---

### F-06 · Track E/strategic · `[defect]` · Confidence: High · Effort: M

**Every one of the 762 records shares one identical link preview, and the preview image is an SVG that no major platform renders.**

Evidence:
- Production HTML is **2,421 bytes** with an empty `<div id="root">` — verified by `curl` against the live site. No content is server-rendered.
- `og:image` and `twitter:image` both point at `/favicon.svg` ([`index.html:26,34`](../../index.html)). LinkedIn, X, Slack and Facebook do not render SVG Open Graph images; the card renders with no image at all.
- `twitter:card` is `summary`, not `summary_large_image`.
- `curl https://global-ai-governance-map.vercel.app/country/UZB` returns `<title>Global AI Governance Map</title>` and the generic `og:title`. All 12 record-route families in [`vercel.json`](../../vercel.json) rewrite to the same static shell.
- `/robots.txt` → **404**. `/sitemap.xml` → **404**.

**Why it matters.** This is the highest-leverage finding for the artifact's stated purpose. The project is used as evidence of capability in job applications, which means its distribution channel is a pasted link. Today that link previews as a bare title with no image, and search engines index nothing but the title. The "stable record URLs" feature — real work, correctly built — delivers zero sharing value because every URL looks identical when shared.

**Recommendation, cheapest first.** (1) Render a 1200×630 PNG OG image and switch `twitter:card` to `summary_large_image` — under an hour, fixes the visible half. (2) Add `robots.txt` + a generated `sitemap.xml` from the record routes — the generator scripts already enumerate every record. (3) Only then consider prerendering per-record HTML; `vite-plugin-ssg` or a post-build script emitting static `<head>` per route keeps the zero-infrastructure constraint intact. Do not migrate frameworks for this.

---

### F-07 · Track A/E · `[defect]` · Confidence: High · Effort: M

**Keyboard users must pass 189 map elements to reach the map's own controls.**

Evidence — measured in-page on the Geography lens at 1440×900: 220 focusable elements total. Country paths occupy tab positions **22 through 197** (176 countries), followed by 13 lab pins. "Map focus", "Map color mode", "Country list", zoom and reset appear at position **198+** — despite rendering visually at the *top-left corner above the map*.

**Why it matters.** Visual order and focus order disagree by roughly 190 stops (WCAG 2.4.3). To change the colour mode by keyboard you tab through every country on Earth. The "Skip to main content" link at [`App.tsx:491`](../../src/App.tsx) jumps *into* the map, not past it, so it makes this worse rather than better. The axe suite passes because axe cannot evaluate focus-order sanity.

**Recommendation.** Move the control cluster before `<Geographies>` in DOM order and position it visually with CSS, or add a "Skip map" link as the first focusable element inside `<main>`.

---

### F-08 · Track B · `[defect]` · Confidence: High · Effort: L

**The Workbench presents 296 buttons and 283 links across 5.9 screens under a single `<h2>`.**

Evidence — measured in-page at 1440×900 on the Workbench lens:

| Metric | Value |
|---|---|
| Scroll height | 5,349 px (5.9 viewports) |
| `<button>` | 296 |
| `<a>` | 283 |
| `<table>` / `<tr>` | 2 / 107 |
| `<h2>` / `<h3>` | **1** / 11 |

**Why it matters.** The heading promises "Answer concrete AI-governance questions," but there is no question input and no answer surface — there are 7 workflow presets, 9 unlabelled statistic tiles, a 13-row lab table, an exposure brief, 10 corpus tiles, a changelog and an institution map, all stacked. A first-time user reads this as "a very long dashboard," not "a workbench." With one `<h2>` for six screens, screen-reader heading navigation is useless and there is no visual hierarchy telling anyone where to start.

The answer cards also under-sell the dataset by presenting thin counts without denominators: `BINDING DUTIES 12`, `EVALUATION EVIDENCE 2`, `OPEN CONSULTATIONS 1`, `IMPLEMENTATION 8`. A hiring manager skimming these sees small numbers, not rigour.

**Recommendation.** Full spec deferred to `02-WORKBENCH-REDESIGN.md` (pass 2). The structural direction: one question at a time, selected explicitly, answered above the fold with its sources; everything else behind progressive disclosure.

---

### F-09 · Track C/D · `[defect]` · Confidence: High · Effort: M

**The Network view's six edge types are visually identical, and its only strong encoding is an undocumented hand-assigned number.**

Evidence — measured in-page on the Network lens:
- 53 nodes, 87 edge elements, **9 text labels** — 44 nodes are unlabelled circles.
- Every edge computes to stroke `rgb(148, 163, 184)`. The only variation is `stroke-width` (1 / 1.5 / 2 / 2.5 px). There is no colour, dash or marker distinction.
- The on-screen caption reads: *"Size = power score · Stroke thickness = edge strength."* The legend lists node types only; **there is no edge-type key**, because edge type is not encoded.
- `powerScore` is a hand-written constant per lab ([`frontierLabs.ts`](../../src/data/frontierLabs.ts): six 5s, six 4s, one 3). [`validateData.ts:210`](../../src/utils/validateData.ts) checks only that it falls in 1–5. No derivation, no methodology, no source.

**Why it matters.** The README advertises "99 dependency edges typed as `regulates / depends_on / constrains / influences / coordinates / participates_in`." That typing is real in the data and absent from the picture — the one view whose entire purpose is showing relationships cannot show what kind of relationship. Meanwhile node area, the most salient visual variable in the whole view, is driven by a number the project assigns by judgement and never defends. A reviewer who asks "why is Amazon a 4 and Cohere a 3?" has no answer to read.

**Recommendation.** Encode edge type with colour or dash and publish the key; demote edge strength to opacity. For `powerScore`: document the rubric, derive it from something (compute, model releases, market reach), or drop it and size nodes by degree — see [05-DATA-MODEL-REVIEW](05-DATA-MODEL-REVIEW.md#power-score-verdict).

---

### F-10 · Track A/D · `[defect]` · Confidence: High · Effort: S

**The default map paints 64% of the world in a grey that means two different things, and the legend explaining it is collapsed.**

Evidence — enumerating all 193 entities through `getMapStyle` in-page:

| Fill | Geography (default) | Layers |
|---|---:|---:|
| `#E5E7EB` grey — "No AI-specific data" | **123** | 1 |
| `#C4B5FD` violet — "International participation only" | — | **122** |
| `#1D4ED8` binding | 35 | 32 |
| `#60A5FA` proposed | 10 | 9 |
| `#BFDBFE` guidance | 25 | 25 |
| `#B45309` corporate | — | 4 |

126 of 193 fills differ between the two lenses. The legend is `aria-expanded="false"` on load — the map ships with **no visible colour key**.

**Why it matters.** 122 of those 123 grey countries *do* have international participation; the default lens simply cannot say so. Uzbekistan is the worked example: `internationalParticipationCount: 5` ([`countryMapSummaries.ts:3208`](../../src/data/countryMapSummaries.ts)) but zero rows in `nationalAIRegulations.ts` and zero in `participation.ts` — its 5 come from membership-derived expansion. On the default map it is grey, indistinguishable from a country with no data. A visitor's first impression is "two-thirds of the world is blank," which understates both the dataset and the state of global AI governance. And they cannot even check what grey means without first discovering and opening the legend.

**Recommendation.** Open the legend by default. Split "no AI-specific rule" from "no data" into two fills. Strongly consider making the violet international-participation tier part of the default map rather than a separate lens — see [03/04 view decisions](04-VIEW-PORTFOLIO.md).

---

### F-11 · Track D · `[risk]` · Confidence: High · Effort: S

**A source URL returning "you have been blocked" counts as a healthy link.**

Evidence — `https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence` returns **HTTP 200** whose body is a Cloudflare interstitial: *"Sorry, you have been blocked / You are unable to access www.coe.int"* (5,509 bytes). `npm run audit:source-links` reports this URL as fine — its total output is 2 link warnings, neither of them this one.

This is the source for `coe-ai-convention`, the **only binding treaty in the dataset**, whose summary asserts a time-sensitive status ("not yet in force… EU ratification is recorded on 15 May 2026") last manually checked **2026-06-05 — 50 days ago**.

**Why it matters.** The link checker validates reachability, not content, so the highest-stakes record in the corpus is guarded by a check that cannot fail. `docs/SOURCE_VERIFICATION_2026-06-05.md` documents a manual override for the CoE Treaty Office that the README says **expires 5 July 2026** — three weeks ago. The safeguard has lapsed and nothing surfaced it.

**Recommendation.** Have the link checker assert a per-record content needle (a title fragment or document number) rather than a status code, and fail loudly when a manual-verification override passes its expiry date.

---

### F-12 · Track E · `[defect]` · Confidence: High · Effort: S

**The published performance table is wrong on its headline row, and the budget it claims to hold was quietly raised by 50 KB.**

Evidence — `npm run build` then `npm run check:performance`, actual output vs [`README.md:330-341`](../../README.md):

| Metric | README "Current" | README "Budget" | Measured | Actual budget |
|---|---:|---:|---:|---:|
| Initial JS | 656,925 | 725,000 | 654,924 | 725,000 |
| Initial JS gzip | 194,426 | 220,000 | 193,602 | 220,000 |
| Atlas lazy chunk | 417,656 | 430,000 | 417,656 | 430,000 |
| Corpus gzip | 19,892 | 20,000 | 19,886 | 20,000 |
| **Total JS** | **1,549,981** | **1,550,000** | **1,599,978** | **1,600,000** |

[`scripts/check-performance-budget.mjs:16-17`](../../scripts/check-performance-budget.mjs) states it plainly: *"Raised 1_550_000 -> 1_600_000 for the AI litigation/enforcement corpus expansion."*

**Why it matters.** The README's editorial framing — *"The budget is intentionally strict and currently tight: `totalJsBytes` is only 19 bytes under the ceiling"* — now reads as discipline the project did not exercise. The honest statement is that total JS grew ~50 KB and the ceiling moved to accommodate it. Separately, corpus gzip has **114 bytes** of headroom (19,886 / 20,000): the next enforcement record will break the build.

**Recommendation.** Regenerate the table from `check-performance-budget.mjs --json` at release time rather than hand-maintaining it, and state budget changes in the changelog. A published budget that moves silently is worse than no budget.

---

## S3 — Moderate

### F-13 · Track E · `[defect]` · Confidence: High · Effort: S

**The lens switcher declares an ARIA tab pattern it does not implement.**

Evidence — measured in-page: `role="tablist"` present, 6 × `role="tab"` with `aria-selected` — and **0 elements with `role="tabpanel"`**, no `aria-controls` on any tab, no roving `tabindex` (all null), no keydown handler on the tablist.

**Why it matters.** A screen reader announces "tab, 2 of 6, selected" and then offers nothing to navigate to; arrow keys, which the pattern obliges, do nothing. Declaring `role="tab"` is a promise about keyboard behaviour. axe passes it because axe checks attribute validity, not interaction contracts — a good illustration of why the README's "no automated violations" claim is weaker evidence than it looks.

**Recommendation.** Either complete the pattern (`aria-controls` → a `role="tabpanel"` wrapper on `<main>`, roving tabindex, arrow-key handling) or drop the ARIA roles and let them be ordinary buttons, which is honest and costs nothing.

---

### F-14 · Track D · `[defect]` · Confidence: High · Effort: S

**Two sovereign states are filed as subnational rules.**

Evidence — `fr-ai-act-implementation-draft` and `de-ai-act-implementation-draft` are entries in [`src/data/subnationalRules.ts:127,146`](../../src/data/subnationalRules.ts), both with `jurisdictionType: "eu_member"`. The README counts them in "**7 subnational rules** — California SB 53…, NYC Local Law 144, … plus draft France/Germany EU AI Act implementations."

The French entry is additionally not a rule: `name: "France - EU AI Act implementation activity"`, `status: "Implementation activity; specific national act not tracked"`, sourced to CNIL's 2025 annual report.

**Why it matters.** "Subnational" has a precise meaning to the audience this project is courting, and France is not it. Anyone who opens the file finds member states in a table of US cities and states. It also inflates the headline count: 7 subnational rules is really 5.

**Recommendation.** Split `jurisdictionType: "eu_member"` rows into a national implementation-tracking table, or rename the module to something like `subFederalAndImplementationRules`. Report the counts separately. Credit where due: the French record's `verificationNotes` explicitly says the source "does not establish a comprehensive national implementation act" and that the record "has been softened" — the editorial honesty is real, it is the filing that is wrong.

### F-15 · Track D · `[risk]` · Confidence: High · Effort: S

> **⚠️ Corrected 26 July 2026 — this finding's headline number was wrong.** The original claimed "85 values for 762 sourced records (11%)", inferred from grepping literal `verificationStatus:` occurrences. That grep undercounted badly: most records inherit verification metadata from shared spread constants (`...OFFICIAL_VERIFIED`, `...REVIEWED_OFFICIAL_SOURCE`), and the 85 literals are per-record *overrides*. Measured properly by evaluating the data, coverage is **100%**: across 1,558 core records (national rules, instruments, participation, subnational), **1,094 `verified` and 464 `likely_correct`, none missing**. The coverage complaint is withdrawn. What follows is what survives.

**The verification vocabulary cannot express a negative, and the guard that enforces it is near-vacuous.**

Evidence:
- `VerificationStatus` ([`types.ts:44-48`](../../src/types.ts)) was `verified | likely_correct | uncertain | needs_external_check`. There was no `unverified`, `disputed`, `superseded` or `incorrect` — the worst thing the schema could say about a claim was "someone should look at this."
- `hasVerificationMetadata()` ([`governanceTaxonomy.ts`](../../src/utils/governanceTaxonomy.ts)) returns true if *any one* of `sourceKind`, `verificationStatus`, `confidence`, `lastVerified`, `verificationNotes` is set. The test asserting "no records lack explicit verification metadata" is therefore satisfied by a record declaring only `sourceKind: "official"`.
- The effective distribution is still notably optimistic: **zero** core records are `uncertain` or `needs_external_check`. The four `uncertain` flags all sit on litigation records outside the core set.

**Why it matters.** A scale with no negative value cannot record a mistake. When a source moves or a claim is overtaken by events — which is routine in this domain — there is no way to say so, so the record silently keeps asserting its last state.

**Recommendation.** Add genuinely negative values and tighten the guard to require the full triple. Do **not** attempt to reassign statuses in bulk: that would be inventing verification nobody performed.

**Status: fixed.** `unverified` and `superseded` added; `hasCompleteVerificationMetadata` requires `sourceKind` + `verificationStatus` + `lastVerified`; the validator now reports real coverage as a note (currently 2,320 of 2,320).

### F-16 · Track D · `[risk]` · Confidence: High · Effort: S

**343 source hosts are unclassified, and the largest unclassified blocks are third-party indices, not official sources.**

Evidence — from the same `validateData()` run:

```
343 source URL(s): source host is not classified
185 source URL(s) use unknown host oxfordinsights.com
 90 source URL(s) use unknown host www.caidp.org
 67 source URL(s) use unknown host hai.stanford.edu
 10 source URL(s) use secondary host www.srgresearch.com
  2 source URL(s): source URL is not HTTPS
```

The two non-HTTPS sources are [`nationalAIRegulations.ts:730`](../../src/data/nationalAIRegulations.ts) (`http://publication.pravo.gov.ru/...`) and [`:1290`](../../src/data/nationalAIRegulations.ts) (`http://static.kremlin.ru/...`).

**Why it matters.** The site's footer badge lists "Oxford Insights · CAIDP · Stanford HAI" among its sources, so their presence is disclosed — but the "official-first" framing sits uneasily with 342 rows sourced to research indices. Meanwhile `audit:sources` reports **"Metadata warnings: 0"** while `validateData` reports 378 warnings on the same corpus. Two validators, two verdicts, and CI only gates on the quiet one.

**Recommendation.** Classify the four aggregator hosts explicitly as `secondary` so the count is deliberate rather than a gap, reconcile the two validators onto one report, and upgrade the two `http://` URLs or mark them as known-insecure.

### F-17 · Track E · `[defect]` · Confidence: High · Effort: S

**Mobile is better than the README admits, but fails WCAG 2.2 target size.**

Evidence — measured at 390×844: no horizontal overflow (`scrollWidth` 390 = viewport). Header 147 px + filter toolbar 133 px = **280 px, 33% of the viewport**, before any content. **8 of 29** visible buttons are 23 px tall, under the 24×24 minimum of WCAG 2.2 AA (2.5.8) — the network preset chips ("All", "Labs and laws", "Summits", "Standards", "Compute", "All edges").

**Why it matters.** The README concedes "desktop/tablet ≥768px," which undersells the work: the layout genuinely holds at 390 px. But a third of a phone screen spent on chrome, plus sub-minimum tap targets, means the traffic that actually arrives from a shared link gets the worst version of the product while the docs tell them not to bother.

**Recommendation.** Raise the chips to 24 px, collapse the filter toolbar behind a single "Filters" control below `md`, and update the README to claim what the code delivers.

### F-18 · Track E · `[risk]` · Confidence: Medium · Effort: S

**No security headers, on a product that ships an embed feature.**

Evidence — `curl -I` against production returns only Vercel's default `Strict-Transport-Security`, plus `Access-Control-Allow-Origin: *`. No `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` or frame policy. [`vercel.json`](../../vercel.json) has no `headers` block at all — only `rewrites`.

**Why it matters.** The app deliberately serves embeddable cards (`/embed/:path*`), so framing is an intended use — which makes the *absence* of a considered `frame-ancestors` policy a decision never made rather than a decision made. Low exploitability for a static site with no auth and no user data; the cost of fixing is a dozen lines.

**Recommendation.** Add a `headers` block: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a CSP with `frame-ancestors *` scoped to `/embed/*` and `'self'` elsewhere.

### F-19 · Track E · `[risk]` · Confidence: High · Effort: S

**Three high-severity advisories in the dependency tree.**

Evidence — `npm audit`: **4 vulnerabilities (1 low, 3 high)**. `undici` 7.0.0–7.27.2 (7 advisories: TLS validation bypass, header injection, response-queue poisoning), and `postcss` (path traversal via sourceMappingURL). `npm outdated` shows 17 packages behind, including `vite` 8.0.16 → 8.1.5 and `eslint` 10.5.0 → 10.8.0.

Both vulnerable packages are build/test-time transitive dependencies, not shipped runtime code, which caps real exposure — but `undici` is the fetch layer used by the source-link auditing scripts, which do make outbound requests.

**Recommendation.** `npm audit fix` and let Dependabot's weekly PRs land. Note the `.npmrc` `legacy-peer-deps=true` workaround exists for `react-simple-maps@3`'s React 18 peer pin; that library is the binding constraint on a future React 20 upgrade and should be tracked as such.

---

## S4 — Minor

### F-20 · Track A · `[taste]` · Confidence: High · Effort: S
**Timeline stacks two overlapping lane taxonomies.** The view renders one filter row of `All / International / National binding / National proposed / Standards / Labs-infrastructure` directly above a second of `All / International / National / Subnational / Frontier only`. Two different partitions of the same 135 milestones, adjacent, both starting with "All". Pick one.

### F-21 · Track D · `[defect]` · Confidence: High · Effort: S
**README counts drift from `DATASET_STATS`.** README says "115+ milestones"; the Timeline renders **135**. README says "118 tests"; `npm test` reports **119 passed (30 files)**. `DATASET_STATS` ([`datasetStats.ts`](../../src/data/datasetStats.ts)) is the single source of truth for countries/instruments/rules/labs/edges and the prose does not read from it. Generate the numbers.

### F-22 · Track E · `[defect]` · Confidence: High · Effort: S
**Visual-regression tolerances are loose enough to miss a wholesale recolouring of the map, and mobile has no baselines at all.**

`npm run test:e2e`: **36 passed, 2 skipped** — both skips are `visual-regression.spec.ts` under `mobile-chromium`, so mobile rendering has no pixel protection, which is exactly where F-17 lives.

More seriously, **the desktop baseline does not protect the map either**. Demonstrated during remediation: after the F-01/F-10 fixes recoloured **101 of 167 rendered countries** from grey `#E5E7EB` to violet `#C4B5FD`, `map SVG remains visually stable` still **passed**. Forcing `--update-snapshots=all` changed the baseline's md5 from `c10cbb8c…` to `87885436…`, proving the render genuinely differed — the comparison simply tolerated it. The settings at [`visual-regression.spec.ts:12-14`](../../tests/e2e/visual-regression.spec.ts) are `maxDiffPixelRatio: 0.04` with `threshold: 0.25`; grey and light violet are close enough in the per-pixel colour metric that the change never registered.

**Why it matters.** A visual-regression test that passes when half the choropleth changes meaning is worse than none, because it reports safety it does not provide. Tighten `threshold` toward 0.1 and add baselines for the `mobile-chromium` project.

### F-23 · Track E · `[taste]` · Confidence: High · Effort: M
**`App.tsx` owns 20 `useState` hooks plus a reducer across 946 lines.** [`App.tsx:154-190`](../../src/App.tsx). The `useReducer` covers filters only; everything else — map view, map mode, compare tray, four network/timeline controls, three panel toggles — is flat component state threaded down by props. It works and it is readable, so this is taste, not defect. But F-02 and F-05 are both symptoms of the same cause: there is no single place that knows what "the current view" is, so things get forgotten when serialising. Consolidating the shareable slice into one reducer whose output *is* the URL would fix both and shrink the file.

---

## What genuinely works

The engineering hygiene is real and better than most solo projects: **zero** `TODO`/`FIXME`/`HACK` comments and exactly one `eslint-disable` in ~40,000 lines; lint and `tsc -b` clean; 119 unit tests and 36 Playwright tests green in 42 seconds; a 5-command data-audit pipeline wired into CI with artifact upload. The dataset's editorial instincts are sound where they are exercised — the CoE record separates 20 signatures from 1 ratification, the corpus tile openly reports `NO INSTITUTION DATA 159`, and the French record documents its own weakness in `verificationNotes` rather than hiding it. The map is genuinely keyboard-reachable (176 of 179 country paths focusable, 167 with `aria-label`) and has a country-list text alternative — better than most choropleths ship.

---

## Unverified suspicions

Listed separately because I could not anchor them in this pass.

1. **d3-force may block the main thread on Network entry.** [`NetworkView.tsx`](../../src/components/NetworkView.tsx) runs a 300-tick static layout. 53 nodes / 87 edges is small enough that it probably does not matter, but I did not profile the long task.
2. **Re-render cost on hover across 192 geographies.** The `Map`-based memo cache in `getMapColor.ts` looks sound, but I did not attach the React Profiler to count renders per hover.
3. **Whether `LAYER_CACHE` can serve stale fills after a data reload.** It is a module-level `Map` with no invalidation ([`getMapColor.ts:23`](../../src/utils/getMapColor.ts)). Harmless with static imports; a hazard if data ever becomes dynamic.
4. **Whether the 4 litigation records flagged `uncertain` by `audit:data-review` are correctly characterised.** I confirmed they are flagged; I did not read the dockets.
5. **Whether `oecd-ai-principles` genuinely supports its claim.** The URL returns HTTP 200 but only 4,035 bytes with zero occurrences of "artificial intelligence" — consistent with a JS-rendered shell. Needs a browser check, not a fetch.
6. **Real-world Lighthouse scores.** Not run; no Lighthouse binary in this environment. Bundle numbers here are build-output measurements, not field metrics.
