# 08 — Remediation log (day-one fixes)

**Date:** 25 July 2026 · Applied after [01-FINDINGS](01-FINDINGS.md), against the three changes named in [00-EXECUTIVE-SUMMARY](00-EXECUTIVE-SUMMARY.md#what-id-do-if-i-had-one-day).

All work was test-first: each behavioural change got a failing test before implementation.

---

## 1 · Map first impression — F-01, F-10

| Change | File |
|---|---|
| `pickPrimaryLayer` now ranks legal status above corporate presence; `corporate` only applies when there is no rule and no participation to report | [`getMapColor.ts:25-40`](../../src/utils/getMapColor.ts) |
| Geography mode distinguishes "international participation only" (`#C4B5FD`) from "no data" (`#E5E7EB`) | [`getMapColor.ts`](../../src/utils/getMapColor.ts) |
| Legend opens by default; new fill entry added to match the map | [`Legend.tsx`](../../src/components/Legend.tsx) |
| New test file, 7 cases, written before the fix | [`getMapColor.test.ts`](../../src/utils/getMapColor.test.ts) |

**Measured effect** (in-page, default Geography lens, 1440×900):

| | Before | After |
|---|---:|---:|
| Grey "no AI-specific data" countries | 123 | **0** |
| Violet "international participation only" | — | 101 |
| United States / China / France | gold "has frontier-lab HQ" (Layers) | **binding blue** |
| Legend `aria-expanded` on load | `false` | `true` |

The default map no longer presents two-thirds of the world as blank, and no longer labels the US and China by their office locations.

## 2 · Shareable state — F-02, F-03, F-05

| Change | File |
|---|---|
| `mapMode` and `showLabs` added to `ShareableAppState`, parsed and serialised via the existing `enumValue` pattern | [`urlState.ts`](../../src/utils/urlState.ts) |
| `handleLensChange` no longer nulls `selectedIso3` / `selectedLabId` / `networkSelection` — only transient hover state is cleared | [`App.tsx`](../../src/App.tsx) |
| Discrete navigation (lens change, country/lab selection, preset) writes a history entry via `pushState`; continuous edits still `replaceState` | [`App.tsx`](../../src/App.tsx) |
| `popstate` handler restores the two new fields — it is now reachable code | [`App.tsx`](../../src/App.tsx) |
| 4 new round-trip tests written before the fix | [`urlState.test.ts`](../../src/utils/urlState.test.ts) |

**Verified end-to-end in the browser:**

```
start                     → ""                                              history.length 2
change colour mode        → "?mapMode=enforcement-activity"
select Uzbekistan         → "?country=UZB&mapMode=enforcement-activity"      history.length 3
switch to Timeline        → "?lens=timeline&country=UZB&mapMode=..."         history.length 4
                            selection survived: true
history.back()            → "?country=UZB&mapMode=enforcement-activity"      still on site: true
```

All 17 colour modes are now citable, the subject survives a change of view, and Back undoes rather than exits.

## 3 · Shareable link — F-06

| Change | File |
|---|---|
| 1200×630 PNG OG image rendered from the live map, chrome stripped | [`scripts/generate-og-image.mjs`](../../scripts/generate-og-image.mjs), `npm run data:og` |
| `og:image` / `twitter:image` point at the PNG; added `og:image:width/height/type/alt`; `twitter:card` → `summary_large_image` | [`index.html`](../../index.html) |
| `robots.txt` and a 544-URL `sitemap.xml` generated from the record-page index; wired into `npm run build` | [`scripts/write-seo-files.mjs`](../../scripts/write-seo-files.mjs), `npm run data:seo` |

The card now shows the actual map with its legend, so the link communicates what the project is before anyone clicks.

---

## Two things this surfaced

**The performance budget failed, exactly as F-12 predicted.** The new code pushed total JS to 1,600,508 B against a 1,600,000 B ceiling that had 22 bytes of headroom. Rather than silently raise it — the behaviour the audit criticised — I first recovered 300 B by removing genuine duplication: the 17 map-mode ids existed in both `App.tsx` and `urlState.ts`, and are now derived from a single `MAP_MODE_OPTIONS` const in [`types.ts`](../../src/types.ts), from which `MapModeId` is also inferred. The remaining ~500 B is real functionality, so the ceiling moved to 1,610,000 **with the reason recorded in the script** and the README table regenerated from measured output. Corpus gzip remains the binding constraint at 19,887 / 20,000.

**The visual-regression suite does not protect the map.** After recolouring 101 of 167 countries, `map SVG remains visually stable` still passed. `--update-snapshots=all` changed the baseline md5 (`c10cbb8c…` → `87885436…`), proving the render differed and the tolerance absorbed it. Written up as a strengthened [F-22](01-FINDINGS.md#f-22--track-e--defect--confidence-high--effort-s). Baselines have been updated, since the change was intentional.

---

---

# Second tier — F-11, F-13, F-19, F-21, F-22

## 4 · The lens switcher's ARIA tab pattern — F-13

`role="tablist"` with six `role="tab"` children, but no tabpanel, no `aria-controls`, no roving tabindex and no key handling. Now complete: `<main>` carries `role="tabpanel"`, only the selected tab is in the tab order, and Left/Right/Up/Down/Home/End move selection with focus following.

The handler sits on the tabs rather than the tablist — both because that is what the ARIA practices describe, and because a handler on the tablist trips `jsx-a11y/interactive-supports-focus`, since the tablist itself must not be focusable.

**Worth noting:** axe reported zero violations before this change and reports zero after. Automated checks cannot see a broken interaction contract, which is why the README's "no automated violations" claim was always weaker evidence than it looked. An e2e test now covers what axe cannot.

## 5 · Visual baselines that actually fail — F-22

Tightened the map to `threshold: 0.1` / `maxDiffPixelRatio: 0.01` (from 0.25 / 0.04) and the embed card to 0.15 / 0.02.

**Verified rather than assumed.** Reverting only the colour logic, against the current baseline at identical dimensions, produces 48,287 differing pixels (ratio 0.07) and the test fails — where the same change previously passed. An earlier attempt at this proof was confounded: removing the forced viewport changed the image height (684→604 px), so the failure was a size mismatch rather than a colour difference. The clean run isolates the colour.

Both tests also stopped skipping on `mobile-chromium` and no longer force a viewport, so each project captures its own device (Desktop Chrome, Pixel 7). Four baselines, none skipped.

## 6 · A link check that can fail — F-11

The check treated HTTP 403 as healthy outright, and a successful HEAD ended it without ever seeing a body. Now a successful HEAD is confirmed with a bounded GET (16 KB, so multi-megabyte legal PDFs are not pulled in full), and HTML responses are scanned for a narrow set of interstitial markers.

**This surfaced more than expected.** Link warnings went from 2 to 26, of which **24 are official sources behind anti-bot walls that were previously reported as healthy** — ISO, MOFA for both Hiroshima documents, the Council of the EU, OECD iLibrary among them. The original finding said the checker missed *content*; it also explicitly whitelisted 403. These 24 need human verification and manual-check entries — not a code fix — and the audit stays warning-only in CI.

Manual overrides may now carry an `expiresOn` date; once past, the override stops excusing the failure. The CoE Treaty Office override expired 5 July 2026 with nothing surfacing it.

A bug I introduced and caught: `BLOCKED_CONTENT_MARKERS` was declared after the module's top-level CLI entry point, putting it in the temporal dead zone and producing 187 false `ReferenceError` failures on the first live run. Exit code was 0; only reading the report revealed it.

## 7 · Advisories and README accuracy — F-19, F-21

`npm audit fix` cleared the undici advisories (TLS validation bypass, header injection, response-queue poisoning) and the postcss path traversal.

**Three high-severity advisories remain, deliberately.** All one chain: `brace-expansion` → `minimatch` → `eslint-plugin-jsx-a11y`. The only fix is `--force`, which downgrades the lint plugin from 6.10.2 to 6.4.1. A DoS in a glob expander, inside a lint plugin, that never runs on untrusted input and never ships, is not worth a six-version downgrade of an accessibility linter.

README figures corrected: 135 timeline milestones (not "115+"), 136 unit tests (not 118), Playwright 1.61.

---

## Verification

| Gate | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | **136 passed** (31 files) — was 119 |
| `npm run build` | exit 0 |
| `npm run check:performance` | `"ok": true, "issues": []` |
| `npm run validate:data` | 10 passed |
| `npm run test:e2e` | **40 passed, 0 skipped** — was 36 passed, 2 skipped |

One existing e2e assertion was updated rather than weakened: `smoke.spec.ts` assumed the legend started closed, so it now asserts `aria-expanded="true"` on arrival and still exercises the toggle in both directions.

---

# Third tier — the Layers merge and the polish set

## 8 · Layers retired into the map's colour modes

Executes the verdict argued in [04-VIEW-PORTFOLIO](04-VIEW-PORTFOLIO.md#layers--merge-into-geography--confidence-high---executed-26-july-2026). Nav goes from six lenses to five: **Workbench · Geography · Network · Timeline · Table**.

Removed: `"layer"` from `LensKind` and the URL validator, the tab, `getLayerStyle`, `pickPrimaryLayer`, `LAYER_FILL`, `LAYER_LABEL`, `LAYER_CACHE`, and the now-unused `lens` parameter threaded through `getMapStyle`, `buildGovernanceColorReason`, `WorldMap`, `CountrySidePanel`, `CountryTooltip` and `MapCountryList`.

The predicted loss was discoverability — a named tab advertised that the map could be recoloured, and a 17-option dropdown does not. Mitigated as the memo specified: **binding law, treaty participation and enforcement are now visible segmented controls**. `ResearchPreset` gained an optional `mapMode`, and applying a preset now sets the colour mode; without it, a preset applied while an unrelated mode was active would silently answer a different question than its title promises.

Old `?lens=layer` links resolve to Geography (verified live: `?lens=layer&country=UZB` → `?country=UZB`, Geography active, selection intact). **Total JS fell 1,600,508 → 1,600,420 bytes** — the deletion paid for itself, as predicted.

**The tightened baseline earned its keep immediately.** Moving the control cluster ahead of the map in DOM order (for F-07) meant the test's `#main-content svg` locator captured a control-button icon instead of the projection. The suite failed; the locator is now explicit about targeting `svg.rsm-svg`. Two tiers earlier this would have passed silently.

## 9 · Polish set — F-07, F-17, F-18, F-20

| Finding | Before | After |
|---|---|---|
| **F-07** focus order | "Color by" at focus position ~198, behind 189 map elements | **position 25**, ahead of the first country at 30 |
| **F-17** tap targets | 8 controls at 23 px, under WCAG 2.2 AA | **0 sub-minimum** across Geography, Network, Timeline at 390 px |
| **F-18** headers | `vercel.json` had rewrites, no headers | nosniff · Referrer-Policy · Permissions-Policy · CSP, with `frame-ancestors` open only on `/embed/*` |
| **F-20** timeline | two unsynchronised filter rows, both starting "All" | one shareable lane taxonomy, with `subnational` promoted to a lane |

F-07 was free: the control cluster is absolutely positioned, so DOM order carries no visual cost.

F-20's two filters cut the same 135 milestones along overlapping axes, and combinations like `standards` + `subnational` returned nothing. Subnational items previously folded into the `national_*` lanes; they now have their own lane, so one URL-serialised taxonomy carries everything the two rows did. `category` survives as data for the timeline dot colours.

The CSP is safe to ship: the app loads no cross-origin resources (the external URLs in the bundle are link targets, which CSP does not govern) and contains no `<form>`, so `form-action 'none'` costs nothing. **It cannot be verified locally** — `vercel.json` headers only apply on Vercel — so confirm with `curl -I` against the preview deployment.

## Verification (third tier)

| Gate | Result |
|---|---|
| `npm run lint` / `npm run typecheck` | exit 0 |
| `npm test` | **136 passed** (31 files) |
| `npm run build` | exit 0 |
| `npm run check:performance` | `"ok": true` — total JS **down** to 1,600,420 |
| `npm run test:e2e` | **40 passed, 0 skipped** |

Browser-verified at 1440 and 390 px: five tabs, `?lens=layer` resolves to Geography, the promoted controls set `mapMode` and serialise to the URL, the Timeline shows a single filter row, zero console errors.

---

# Fourth tier — data credibility, Network, mobile, Workbench

## 10 · Data credibility (F-04, F-14, F-15, F-16)

**Validator warnings: 378 → 1.** `DATA_SNAPSHOT_DATE` moves to 2026-06-19, the true `max(lastVerified)`, with a test enforcing that equality so re-verification past it fails the build. The remaining date warnings turned out to be the check being wrong rather than the data — a consultation deadline and the EU AI Act's phased application are *supposed* to be in the future — so the snapshot ceiling now applies only to backward-looking fields. The one surviving warning is the two Russian sources served over plain HTTP; neither host answers on HTTPS, so it stays visible, and the test pins the exact set.

Non-official host counts moved to a new `notes` channel: the four research indices the Atlas layer cites are a disclosure the UI already makes, not a defect. A warning readers are meant to ignore is how 378 accumulated unnoticed.

France and Germany are no longer counted as subnational rules — `jurisdictionLevel()` splits the module into **5 subnational rules and 2 national implementation records**.

**A correction to the audit itself.** F-15 claimed 11% verification coverage. That was wrong: it came from grepping literal `verificationStatus:` occurrences, which misses the shared spread constants most records inherit from. Measured by evaluating the data, coverage is **100% — 1,094 `verified` and 464 `likely_correct` across 1,558 core records**. The finding is annotated with the correction. What survives is that the scale had no negative value (`unverified` and `superseded` added) and that zero core records are `uncertain`.

## 11 · Network (F-09)

Edge type is now visible: colour and dash per relationship, with a legend. **Distinct edge styles on the default view: 1 → 5.** The README's "typed as regulates / depends_on / constrains / …" claim is finally true in the picture.

Node area now encodes **degree** rather than `powerScore` — the hand-assigned constant was doing the most salient visual work in the view. As a side effect more nodes clear the labelling threshold: **9 → 16 labelled**. The caption also now states that force-directed position carries no meaning.

## 12 · Mobile chrome (F-17 remainder)

Header + filter toolbar: **33% → 23%** of a 390 px viewport; the toolbar drops 133 px → 43 px and the map gains 90 px. Expanding reveals all 11 filter controls unchanged.

## 13 · Workbench (F-08)

Spec in [02-WORKBENCH-REDESIGN](02-WORKBENCH-REDESIGN.md). The question layer already existed in `TOP_RESEARCH_QUESTIONS` and was buried mid-page; it now leads. Five secondary sections moved behind `<details>`.

| | Before | After |
|---|---:|---:|
| Screens of content | 5.9 | **1.8** |
| Reachable controls | 296 | **30** (266 one click away) |
| Sections expanded on arrival | all | question selector only |

Nothing was deleted. The e2e suite needed updating in five places — which is the redesign working: the assertions now open a disclosure first, proving content moved rather than vanished.

## Verification (fourth tier)

| Gate | Result |
|---|---|
| `npm run lint` / `npm run typecheck` | exit 0 |
| `npm test` | **142 passed** (33 files) |
| `npm run build` | exit 0 |
| `npm run check:performance` | `"ok": true` |
| `npm run test:e2e` | **40 passed, 0 skipped** |

## Not addressed

Open from [01-FINDINGS](01-FINDINGS.md): **F-04** (371 snapshot-date warnings), **F-08** (Workbench), **F-09** (Network edge types, `powerScore`), **F-14** (France and Germany filed as subnational rules), **F-15** (verification vocabulary cannot express a negative; 89% of records carry no status), **F-16** (343 unclassified source hosts, 2 `http://` sources), **F-23** (`App.tsx` state sprawl).

Also open, surfaced by this work rather than the original audit: **the 24 official sources behind anti-bot walls** that the content-aware link checker now reports. They need human verification and manual-check entries, not code. And **33% of a 390 px viewport is still header plus filter toolbar** — F-17's tap targets are fixed, its chrome budget is not.

**F-04 is deliberately untouched.** Whether this dataset is "maintained" or "an archived snapshot" is a claim only the maintainer can make — it is [Q3 in the open questions](07-OPEN-QUESTIONS.md), and changing `DATA_SNAPSHOT_DATE` would be asserting something about the data on their behalf.

Per-record OG tags still require prerendering, so every route shares one preview image — now a good one.
