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

## Not addressed

Open from [01-FINDINGS](01-FINDINGS.md): F-04 (371 snapshot-date warnings), F-07 (focus order), F-08 (Workbench), F-09 (Network edge types, `powerScore`), F-12 partially, F-14 through F-18, F-20, F-21 partially, F-23.

**F-04 is deliberately untouched.** Whether this dataset is "maintained" or "an archived snapshot" is a claim only the maintainer can make — it is [Q3 in the open questions](07-OPEN-QUESTIONS.md), and changing `DATA_SNAPSHOT_DATE` would be asserting something about the data on their behalf.

Per-record OG tags still require prerendering, so every route shares one preview image — now a good one.
