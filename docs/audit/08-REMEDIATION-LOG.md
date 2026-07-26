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

## Verification

| Gate | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | **130 passed** (31 files) — was 119 |
| `npm run build` | exit 0 |
| `npm run check:performance` | `"ok": true, "issues": []` |
| `npm run validate:data` | 10 passed |
| `npm run test:e2e` | **36 passed, 2 skipped** |

One existing e2e assertion was updated rather than weakened: `smoke.spec.ts` assumed the legend started closed, so it now asserts `aria-expanded="true"` on arrival and still exercises the toggle in both directions.

## Not addressed

These remain open from [01-FINDINGS](01-FINDINGS.md): F-04 (371 snapshot-date warnings), F-07 (focus order), F-08 (Workbench), F-09 (Network edge types, `powerScore`), F-11 (block-page false pass), F-13 (ARIA tabs), F-14 through F-21, F-23. Per-record OG tags still require prerendering — every route continues to share one preview image, which is now at least a good one.
