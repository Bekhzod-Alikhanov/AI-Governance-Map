# 10 — Cleanup audit

**Date:** 30 July 2026 · **Commit:** `fbbcf60`

**Status:** the audit itself changed no application code. **Every finding in §2
has since been actioned**, all on 30 July 2026 — the legend now describes the
mode it is next to, the three modes that could not differentiate are gone, manual
verification overrides can no longer live forever, and the orphaned components and
unreferenced exports are deleted. Each memo below carries a **Shipped** note
recording what actually changed and how it was verified. Sections 4 and 5 are
unchanged diagnosis: the Network lens and everything in "Keep" stay.

Net effect on the codebase: **355 lines deleted, 135 added**, across 24 files.
Test count went from 163 to 181; the 18 new tests exist to stop these specific
regressions returning.

A removal-oriented pass over every lens, panel, export and route, at 1440×900 and
390×844, against the live deployment and the local tree. The default verdict was
KEEP and the burden of proof was on removal. Every claim below is anchored to a
`file:line`, a command's output, or a number read out of the running production
app. Claims I could not anchor are quarantined in [§7 Unverified suspicions](#7-unverified-suspicions).

---

## 1. Verdict

**This is dense, and it is earning it.** The genuinely dead weight amounts to two
orphaned components, nineteen never-referenced exports, and one duplicated JSON
endpoint — perhaps 200 lines and one catalogue entry, none of it visible to a
reader. Every large surface I went in suspicious of came back a KEEP: the Network
lens is not duplicated by the side panel (they read **different edge sets**, which
is the opposite of the premise I was given), the AI Atlas is reachable in one
click rather than carried-and-unsurfaced, and the embed routes work exactly as an
embed should. The one serious problem I found is not fat at all: **three of the
seventeen map colour modes cannot differentiate any country from any other, and
the on-screen legend describes a different mode for seven of them**, so
`frontier-relevance` currently tells every visitor that all 167 rendered countries
have binding AI-specific law. That is a credibility bug wearing a feature's
clothes, and fixing it matters more than every deletion in this document combined.
If you do nothing else here, fix the legend.

The dataset itself is **not** stale, which is worth stating plainly because it is
the thing a cleanup pass usually finds rotting: all **2,333** source rows are
inside the 90-day "current" window, the oldest verified 2026-05-20. The staleness
risk here is structural rather than actual — see [§3.9](#39-manual-source-checks-that-cannot-expire--unverifiable-by-construction).

---

## 2. Findings

Only things I would actually change.

| Item | Category | Verdict | What is lost | Confidence |
|---|---|---|---|---|
| Legend describes the wrong mode for 7 of 17 modes | **Load-bearing** | ✅ **Fixed** — per-mode key, not removed | — | High |
| `frontier-relevance` colour mode | **Dead** | ✅ **Removed** — URL redirects | Nothing — it cannot differentiate by construction | High |
| `source-confidence` colour mode | **Dead** | ✅ **Removed** — question kept on the roadmap | A good question, not an answer | High |
| `ai-vibrancy` colour mode | **Dead** | ✅ **Removed** — all 66 records kept | Nothing — 98% of scored countries shared one fill | High |
| 16 of 17 manual source checks have no `expiresOn` | **Load-bearing** | ✅ **Fixed** — backfilled, check now fails | — | High |
| `DataQualityNotice.tsx`, `DeploymentBadge.tsx` | **Dead** | ✅ **Deleted** | Nothing — rendered nowhere, reachable by no route | High |
| 19 exports referenced nowhere in the repo | **Dead** | ✅ **Deleted** (+7 helpers they orphaned) | Nothing | High |
| `enforcement-events.json` ≡ `enforcement-litigation.json` | **Duplicated** | Document as an alias — **delete neither** | Two public citation URLs | High |
| Policy-brief kind `lab_market` | **Dead** (unmounted) | Wire one button — do not delete | A working, tested builder | Medium |
| Network lens at 390 px | **Load-bearing** | Keep the lens, fix the mobile layout | — | High |

The last three remain open by choice: two are "do not delete" verdicts needing a
small addition rather than a cut, and the Network mobile layout is a redesign, not
a cleanup.

---

## 3. Per-item memos

Counterargument first, then the verdict, then what breaks.

### 3.1 `frontier-relevance` — Dead

**The case for keeping it.** "Which countries touch frontier AI?" is a real
question, it is one of the few modes that speaks to the project's stated frontier
focus, and the mode is wired end to end: it is in `MAP_MODE_OPTIONS`
([`types.ts:791`](../../src/types.ts)), in the URL validator, and in the picker.
Removing a mode narrows a dropdown that took work to build, and `?mapMode=frontier-relevance`
may already be in someone's bookmark or citation.

**Measured.** Loaded `https://global-ai-governance-map.vercel.app/?mapMode=frontier-relevance`
on production and read the rendered DOM with CSS transitions disabled:

```
countryPaths: 167
inlineVars:      { "#1D4ED8": 167 }
computedFills:   { "rgb(29, 78, 216)": 167 }
```

One flat colour across every rendered country. The cause is structural, not a
data gap: `summary.hasFrontierAIRelevant` is `true` for **192 of 192** countries,
because the generator ORs in participation
([`generate-country-map-summaries.mjs:100-103`](../../scripts/generate-country-map-summaries.mjs)):

```js
hasFrontierAIRelevant:
  nationalRegulations.some((reg) => reg.frontierAIRelevant) ||
  participationInstruments.some((instrument) => instrument.frontierAIRelevant) ||
  hqLabs.length > 0,
```

Every country participates in at least one frontier-relevant instrument, so the
`FILL.empty` branch at [`getMapColor.ts:145`](../../src/utils/getMapColor.ts) is
unreachable. The mode cannot differentiate any country from any other, at any
point in the future, without a change to the derivation.

**And it is worse than useless.** The legend on screen in this mode is the
hardcoded binding-law key, because [`Legend.tsx:43`](../../src/components/Legend.tsx)
falls through for every non-atlas, non-corpus mode. Read live, simultaneously
with the fills above:

```
legendOnScreen: [ ... "rgb(29, 78, 216) => Binding AI-specific law applies" ]
```

**A visitor who selects "Frontier relevance" is shown a world uniformly painted
in the colour the key defines as "Binding AI-specific law applies."** The
product's own `binding-law` mode puts that number at 34 of 167. This is the one
finding in the audit where the artifact asserts something materially false, and
it is the exact failure mode the dataset's editorial rules exist to prevent.

**Verdict: remove the mode.** The counterargument does not survive: a control
that cannot vary is not answering a narrow question narrowly, it is answering no
question at all.

**✅ Shipped 30 July 2026.** Removed the `MAP_MODE_OPTIONS` entry
([`types.ts`](../../src/types.ts)) and the fill branch
([`getMapColor.ts`](../../src/utils/getMapColor.ts)). Because `MapModeId` is
derived from the options list, `tsc` immediately surfaced a third site I had not
inventoried — `mapColorReason.ts`, which carried a hover-reason branch for the
mode — and that was deleted too. Nothing else referenced it. The
`enumValue` guard at [`urlState.ts:217`](../../src/utils/urlState.ts) already
resolves unknown modes to `binding-law`, so `?mapMode=frontier-relevance` lands on
Geography with the default colouring instead of erroring; a test in
`urlState.test.ts` now pins that for all three retired ids. Verified in the running
app: the URL resolves to `binding-law` and renders the healthy four-colour
choropleth (101 / 34 / 23 / 9).

### 3.2 The legend describes the wrong mode for 7 of 17 modes — fix, don't remove

**The case against touching it.** The legend is not broken for the default view.
`binding-law` is the mode a visitor lands on, its five swatches are exactly right,
and the atlas and corpus paths already branch correctly to their own keys
([`Legend.tsx:161`](../../src/components/Legend.tsx), [`:130`](../../src/components/Legend.tsx)).
One could argue the remaining modes are power-user territory where a stale key is
a blemish, not a defect.

**Measured — and it reaches the promoted modes, not just the obscure ones.**
`Legend.tsx:43` selects the hardcoded binding-law `FILLS` array for all eight
modes handled by `getMapColor.ts`:

```ts
const fills = isAtlasMode ? atlasFillsForMode(mapMode) : isCorpusMode ? corpusFillsForMode(mapMode) : FILLS;
```

`treaty-participation` is one of the three modes promoted to an always-visible
button beside the dropdown ([`App.tsx:76`](../../src/App.tsx)) — so it is among
the most likely to be clicked. Read live on production:

| | rendered | legend says |
|---|---:|---|
| `#EDE9FE` | **151** countries | *absent from the legend entirely* |
| `#C4B5FD` | **16** countries | "International participation only; no national rule" |

The 151-country colour has no key at all, and the 16-country colour is labelled
with a claim about national rules rather than what it actually encodes — that the
country signed the CoE AI Convention. Similarly, `source-confidence` renders a
colour (`#FCD34D`) that appears nowhere in its on-screen key; I asserted this
programmatically rather than by eye (`renderedColourInLegend: [{ colour: "rgb(252, 211, 77)", inLegend: false }]`).

**Verdict: fix. This is the highest-value change in the audit and it removes
nothing.** Give `Legend.tsx` a per-mode key for the `getMapColor` modes, the same
way it already does for the atlas and corpus modes.

**✅ Shipped 30 July 2026.** `Legend.tsx` gained `BASE_MODE_FILLS`, a key per
`getMapColor` mode, with every colour lifted from the branch of `getMapStyle` that
produces it. Three things came out of doing it that the diagnosis had missed:

- **The outline key had the same bug.** `getMapStyle` draws the purple `#6D28D9`
  ratified / signed-not-ratified outlines only on the binding-law path; every
  other mode leaves the outline at base or instrument-match. The legend advertised
  them everywhere. `outlinesForMode` now shows them only where they are drawn.
- **The dash is part of the key.** `treaty-participation` dashes the outline for
  signed-only countries, so the legend swatch carries the dash too — otherwise the
  key is incomplete even when the colours are right.
- **The closing caveat was binding-law-specific.** The sentence about EU member
  states showing binding applicability through the EU AI Act is true only in
  `binding-law`; other modes now get a caveat that matches what they encode.

`legendFillsForMode` is exported so `Legend.test.tsx` can enumerate all 192
countries through the real fill functions for each of the 14 modes and assert that
**every colour the map paints appears in the key** — plus that no mode silently
reuses the binding-law key, and that the dashed tier matches the dashed fills.
17 tests. I mutation-tested it by restoring the old fall-through: **6 tests fail**,
naming exactly `treaty-participation`, `lab-hq`, `obligation-type` and
`implementation-deadline`. (`proposed-law` survives the mutation because both its
fills happen to appear in the binding-law key — it was the one mode where the
fall-through was accidentally harmless, which is why it showed up in the original
audit as "legend swatches never rendered" rather than "colours unexplained".)

Verified in the running app on `treaty-participation`: the 151-country `#EDE9FE`
fill now has a key entry, the 16 `#C4B5FD` countries read "Signed the CoE AI
Convention; not ratified" instead of "International participation only; no
national rule", and no rendered colour is missing from the key. The empty
`#7C3AED` ratified tier is deliberately still listed — a key that shows an
unfilled category is more honest than one that hides it.

**A related tier to keep.** In `treaty-participation`, the `#7C3AED` "ratified"
branch ([`getMapColor.ts:111-112`](../../src/utils/getMapColor.ts)) never fires:
19 countries have a `coe-ai-convention` row and **all 19 are `participationType: "signed"`**.
That is correct code awaiting a real-world event, not dead code — keep it, and let
the new legend say the tier is currently empty. A key that shows "ratified" as an
unfilled category is more honest than one that hides it.

### 3.3 `source-confidence` — Dead as built, but the question is worth keeping

**The case for keeping it — and this one is genuinely strong.** "How well-sourced
is each country?" may be the most valuable question this entire artifact could
answer. It is the one thing a governance map can offer that OECD.AI and the IAPP
tracker do not: not just what the law is, but how much you should trust the entry.
The mode is the visual expression of the project's central commitment.

**Measured.** All 167 rendered countries `#FCD34D`; `summary.sourceConfidence` is
`"medium"` for **192 of 192**. The mechanism
([`generate-country-map-summaries.mjs:8-13`](../../scripts/generate-country-map-summaries.mjs)):

```js
function sourceConfidence(records) {
  if (records.some((record) => record?.confidence === "low")) return "low";
  if (records.some((record) => record?.confidence === "medium")) return "medium";
  if (records.length > 0) return "high";
  return "none";
}
```

`recordsForConfidence` includes `participations`
([`:82-87`](../../scripts/generate-country-map-summaries.mjs)). Membership-expanded
participation rows are `medium`, and every country has at least one — so the
function short-circuits to `"medium"` universally. `"high"` is reachable only if a
country has records *and none is medium or low*, which membership expansion makes
impossible. The `low` and `high` branches at
[`getMapColor.ts:141,143`](../../src/utils/getMapColor.ts) are unreachable.

**Verdict: remove from the picker, keep the question.** A min-over-all-records
aggregate will always collapse to the floor. Making it discriminating means
choosing a different statistic — share of official-source rows, count of
manually-verified entries, age of the oldest citation — and that is a
data-modelling decision, not a cleanup. Shipping a flat map under an unlabelled
colour in the meantime answers the question wrongly, which is worse than not
answering it.

I am flagging this as the one finding where I would not argue with a maintainer
who chose to **fix the derivation instead of removing the mode**. If you have an
afternoon for it, that is the better outcome. Removal is the correct default
because it is honest today; the fix is correct if it actually gets done.

**✅ Shipped 30 July 2026**, same shape as §3.1: the `MAP_MODE_OPTIONS` entry, the
fill branch, and the `mapColorReason.ts` hover branch are gone, and the URL
resolves to `binding-law`.

**Deliberately kept:** `CountryMapSourceConfidence`
([`countryMapSummaries.ts:3`](../../src/data/countryMapSummaries.ts)), the
`sourceConfidence()` generator function, and the per-country field it emits. The
data is fine; only its visual encoding was degenerate. Anyone reviving this
question needs a different *statistic* — share of official-source rows, count of
manually-verified entries, age of the oldest citation — not a different colour
ramp, and the raw material for all three is still in the corpus.

### 3.4 Two orphaned components — Dead

**The case for keeping them.** Both are small, harmless, and tree-shaken out of
the bundle already, so deleting them saves a reader nothing and costs a diff.

**Measured.** A whole-repo grep for each name, excluding `node_modules` and `dist`,
returns exactly one line apiece — its own declaration:

```
./src/components/DataQualityNotice.tsx:3:export function DataQualityNotice() {
./src/components/DeploymentBadge.tsx:1:export function DeploymentBadge() {
```

56 and 22 lines. An independent import-graph walk from `src/main.tsx` confirms
both are unreachable (101 of 105 non-test files reachable; the other two
unreachable entries are `src/test/setup.ts`, wired via `vite.config.ts`, and
`src/vite-env.d.ts`, ambient by design). `DeploymentBadge` has not been referenced
since the initial commit. `DataQualityNotice` hardcodes `Snapshot: 19 May 2026`,
which is now wrong — so it is not merely unused, it is a stale claim waiting for
someone to mount it.

**Verdict: delete.** Nobody loses anything, because nobody can reach them.

**✅ Shipped 30 July 2026.** Both files deleted. Nothing broke — no route, no test,
no export, no public link touched either.

### 3.5 Nineteen exports referenced nowhere — Dead

**The case for keeping them.** Unused exports are free at runtime, and a utility
someone wrote deliberately may be scaffolding for work in progress.

**Measured.** Each of the following returns exactly one hit across `src/`,
`scripts/` and `tests/` — its own declaration. I re-ran the check myself on a
ten-symbol sample rather than trusting the sweep:

```
buildAtlasMapFills: 1 hit(s)          PRESET_BY_ID: 1 hit(s)
alpha3ToNumeric: 1 hit(s)             EU_AI_ACT_AUTHORITY_BY_COUNTRY: 1 hit(s)
getObligationsForParent: 1 hit(s)     getImplementationForParent: 1 hit(s)
atlasCaveatForSource: 1 hit(s)        isBindingParticipation: 1 hit(s)
effectiveVerificationStatus: 1 hit(s) rawCorpusRecordExists: 1 hit(s)
```

The full set of 19 also includes `DATASET_AUTHOR` ([`citation.ts:8`](../../src/utils/citation.ts)),
`getComputeDependencyRecordsForInfrastructure`, `getCorpusRecordByReference`,
`corpusRecordDisplayName`, `routeKindForCorpusKind`, `translateToEnglish`,
`getCountryName`, `COUNCIL_OF_EUROPE_MEMBERS`, and `OBLIGATION_EFFECT_LABELS`.
Two are worth calling out: `buildAtlasMapFills` ([`aiAtlas.ts:176`](../../src/utils/aiAtlas.ts))
is superseded by `buildAtlasMapContext`, which returns both fills and reasons —
a clean supersession. `effectiveVerificationStatus` ([`governanceTaxonomy.ts:234`](../../src/utils/governanceTaxonomy.ts))
is worth a look before deleting, given F-15's history.

**Verdict: delete the 19. Leave the other 63 alone.** A separate set of 63 symbols
are exported but referenced only inside their own defining file. Those are *not*
dead — the implementation is live, only the `export` keyword is redundant, and it
aids testability. Stripping 63 `export`s to satisfy a linter is churn.

**✅ Shipped 30 July 2026.** All 19 deleted. The compiler then surfaced a cascade
the inventory had not predicted: **seven more symbols became unreachable** once
their only caller was gone —

| Orphaned by | Also removed |
|---|---|
| `getCorpusRecordByReference`, `routeKindForCorpusKind` | `corpusKindToRouteKind`, `isCorpusReference` |
| `rawCorpusRecordExists` | four `*_BY_ID` index imports in `researchCorpus.ts` |
| `translateToEnglish` | `TRANSLATION_TABLE` (a 40-entry Russian→English map) |
| `getComputeDependencyRecordsForInfrastructure` | the `COMPUTE_DEPENDENCY_RECORDS` import |
| `OBLIGATION_EFFECT_LABELS` | the `ObligationLegalEffect` type import |

`TRANSLATION_TABLE` is the one worth naming: its own doc comment said it existed
"so that future imports from the seed DOCX can be normalised through a single
function" — and that function was the dead export. Keeping a 40-entry table to
serve a deleted consumer would have been worse than removing both.
`translateSeedDataToEnglish.ts` is now 9 lines and exports only `hasCyrillic`,
which `validateData.ts` uses to detect untranslated seed text leaking into the UI.

**On `effectiveVerificationStatus`**, which this memo originally flagged for a
second look given F-15's history: it encodes a real principle — "a record with no
explicit status is unverified, not implicitly fine" — but that principle is already
enforced by `hasCompleteVerificationMetadata`, which *is* used, and reported by
[`validateData.ts:660`](../../src/utils/validateData.ts). The deleted function was
a redundant defensive default whose fallback could never fire at 100% coverage. The
principle survives its deletion.

**Deliberately not deleted:** the five symbols in the adjacent "referenced only by
its own test" category — `embedRoute`, `isBindingLabExposure`,
`getLabExposureGraphEdges`, `SUBNATIONAL_ONLY_RULES`,
`NATIONAL_IMPLEMENTATION_RULES` — and the 63 symbols exported but used only inside
their own file. Deleting a symbol together with its test removes evidence, not
code.

### 3.6 Two byte-identical public JSON endpoints — Duplicated

**The case for keeping both.** They are public URLs. Someone may have cited either.

**Measured.**

```
events bytes 70247 litigation bytes 70247 identical: true
events keys: array len 38
litig  keys: array len 38
```

Both are advertised in `public/data/catalog.json`:

```
"/data/enforcement-events.json",
"/data/enforcement-litigation.json"
```

**Verdict: merge the *description*, delete neither file.** This is the rule from
the brief in its purest form — removing a view costs interaction surface, removing
a public record costs credibility and a reader cannot undo it. Two names for one
array is a documentation defect: a consumer diffing them to find the difference
will waste an afternoon discovering there isn't one.

**Steps and what breaks.** Annotate one as an alias of the other in `catalog.json`
and in `docs/DATA_GOVERNANCE.md`. Keep both files generated by
`scripts/write-public-data.mjs` in perpetuity. If one is ever retired, it should
serve a deprecation note in the JSON body, not a 404.

### 3.7 Policy-brief kind `lab_market` — unmounted, but wire it rather than cut it

**Measured.** The builder exists ([`policyBrief.ts:66-68`](../../src/utils/policyBrief.ts)),
is advertised in `POLICY_BRIEF_INDEX` ([`:32-37`](../../src/utils/policyBrief.ts)),
ships in `public/data/policy-brief-index.json`, and is covered by
`policyBrief.test.ts:15`. But `grep -rn "lab_market" src/` hits only `types.ts:585`,
three lines in `policyBrief.ts`, and the test. **No component mounts it.** The
other five `PolicyBriefButton` mount points are all corpus surfaces
([`ResearchCorpusPanel.tsx:94-96,375`](../../src/components/ResearchCorpusPanel.tsx),
[`WorkbenchView.tsx:1131`](../../src/components/WorkbenchView.tsx)).

**Verdict: wire one button into `LabSidePanel`, don't delete.** The code works and
is tested; the public index already promises it. Deleting would mean either
breaking that promise or editing the index to promise less. One `<PolicyBriefButton kind="lab_market">`
next to the existing `EvidenceDossierButton` at
[`LabSidePanel.tsx:61`](../../src/components/LabSidePanel.tsx) closes the gap.

### 3.8 `ai-vibrancy` — Dead. **Removed 30 July 2026.**

**The case for keeping it.** Stanford HAI is the most recognisable name among the
four index families, the mode was wired end to end with its own five-tier legend,
and "where is the AI ecosystem most active?" pairs naturally with "where is it
regulated?" — which is exactly what the Workbench's *Vibrancy vs regulation*
comparison card was built to do. It also had a real score range in the data
(0.0 to 78.6), so unlike the two modes above it was not *structurally* incapable
of discriminating.

**Measured.** Enumerating all 192 country codes through the real
`buildAtlasMapContext("ai-vibrancy")`:

```
countries with a score: 66 / 192
distinct fills: 3
buckets: #E5E7EB=126  #EDE9FE=65  #7C3AED=1
largest non-empty bucket: #EDE9FE holds 65 of 66 scored (98%)
```

**Sixty-five of the sixty-six scored countries received the same pale tint;
exactly one country received the next colour, and the top two legend tiers
(`#C4B5FD`, `#4C1D95`) never rendered at all.** The cause is a mismatch between
the index's shape and the bucketing. The raw distribution:

```
stanford-ai-vibrancy-tool-2024: n=66 min=0.0 p25=0.0 median=7.3 p75=12.3 max=78.6
```

This is a power-law index — one dominant country, a long flat tail, and **at least
a quarter of the "scored" countries scoring literally 0.0** — being bucketed
linearly against a maximum of 100 by `sequentialFill(score, 100, [...])`. Almost
everything therefore fell into the bottom band. It was also the oldest index in
the set (2024 country data, against 2025 for Oxford and 2026 for CAIDP and UNESCO)
and the only one measuring ecosystem capability rather than governance — a
different question from the rest of the artifact.

**Verdict: removed — but note this one differs from §3.1 and §3.3.** Those two are
structurally flat and can never vary. This one was flat because of an encoding
choice, and **a percentile or logarithmic bucketing would make it discriminate
properly.** That is a real alternative and it was not taken, so it is recorded
here rather than lost: if the mode is ever wanted back, the fix is in
`getAtlasMapFill`, not in the data.

**What was removed, and what was deliberately not.** Only the choropleth:
the `MAP_MODE_OPTIONS` entry ([`types.ts`](../../src/types.ts)), the
`ATLAS_MAP_MODES` membership ([`App.tsx`](../../src/App.tsx)), the fill and reason
branches in [`aiAtlas.ts`](../../src/utils/aiAtlas.ts), the legend tier list in
[`Legend.tsx`](../../src/components/Legend.tsx), and the *Vibrancy vs regulation*
card in `ATLAS_COMPARISON_MAPS` ([`WorkbenchView.tsx`](../../src/components/WorkbenchView.tsx)),
which pinned the retired mode.

**All 66 Stanford records stay**, along with every surface that shows the actual
number rather than a colour: the score card in the country side panel
([`AIAtlasSection.tsx:36`](../../src/components/AIAtlasSection.tsx)), the evidence-dossier
metric ([`evidenceDossier.ts:266`](../../src/utils/evidenceDossier.ts)), the
`vibrancy-regulatory-maturity` preset rows ([`aiAtlas.ts:266`](../../src/utils/aiAtlas.ts)),
the Table lens Indicators and Sources tabs, the full JSON export, and
`public/data/ai-atlas-indicators.json`. Verified in the running app for the United
States, which still renders `Stanford Global AI Vibrancy Tool public-data score ·
78.6/100 · Rank 1 · R&D: 68.9347 | Responsible AI: 100 | Economy: 100`, together
with its source, verification status and the dataset's own caveat that the "public
country data vintage is 2024 even though the 2026 AI Index references the tool."

That caveat is the point: **a number with its vintage attached is more honest than
a colour that put 65 of 66 countries in one bucket.** The removal deletes an
encoding, not a record.

**What broke: nothing.** `?mapMode=ai-vibrancy` is a citable URL, and
[`urlState.ts:217`](../../src/utils/urlState.ts) already resolves unknown modes to
`binding-law` via `enumValue`; a regression test now pins that behaviour for the
retired id specifically. This was the first of the three mode removals, taking the
picker 17 → 16; §3.1 and §3.3 later took it to 14. Full suite after this change:
164 unit tests, 40 e2e, lint and typecheck clean, `check:performance` `"issues": []`,
543 record routes and 544 sitemap entries unchanged.

### 3.9 Manual source checks that cannot expire — unverifiable by construction

This is the one place the "outdated / unverified" question has a real answer, and
it is not the answer I expected.

**The dataset is not stale.** Every one of the **2,333** source rows in
`public/data/source-metadata.json` sits inside the 90-day "current" band defined by
[`verificationAge.ts:12-13`](../../src/utils/verificationAge.ts):

```
current (<90d): 2333   ageing (90-179d): 0   stale (>=180d): 0   no date: 0
oldest lastVerified: 2026-05-20 (71 days)   newest: 2026-06-19
```

`DATA_SNAPSHOT_DATE` is `2026-06-19` ([`governanceTaxonomy.ts:16`](../../src/utils/governanceTaxonomy.ts)),
41 days old and test-enforced. There is no rot to cut.

**The risk is that this cannot stay true on its own.** `npm run audit:manual-checks`
reports:

```
Manual source checks: 17 total, 0 expired, 16 without an expiry date.
```

Sixteen manual verification overrides — `kr-ai-basic-act`,
`au-proposed-mandatory-guardrails`, `nl-ap-clearview-ai-fine-2024`,
`kz-ai-law-2025` and twelve others — have no `expiresOn`, so they can never
expire. A manual override is a human asserting "I checked this by hand"; one that
never lapses converts a dated act of verification into a permanent claim. **This is
the exact mechanism behind the CoE lapse that motivated L3**, and the script
already detects it — it prints the warning and then exits `0`.

**Verdict: fix, and it is two lines.** Make `check-manual-checks.mjs` exit non-zero
when an entry lacks `expiresOn`, and backfill the sixteen dates. This removes
nothing and is worth more than every deletion in §3.4–§3.6 combined, because it is
the difference between a corpus that is currently fresh and one that is
*structurally* kept fresh.

**✅ Shipped 30 July 2026.** The sixteen dates were backfilled at
**`lastChecked` + 90 days**, which is not an invented interval: it is exactly what
the one already-dated entry uses (`g7-hiroshima-statement`, `2026-07-26` →
`2026-10-24`), and it matches `AGEING_AFTER_DAYS` in
[`verificationAge.ts:12`](../../src/utils/verificationAge.ts). The backfill script
asserts the rule reproduces that entry before touching anything else.

Note what this does and does not assert. An `expiresOn` does **not** claim a source
is still valid — it schedules when a human must look again. Nothing here fabricates
verification, which is why a mechanical backfill is legitimate where a mechanical
*status* change would not be.

None of the sixteen is already expired; the earliest lapses **2026-08-27**, four
weeks out. So the build stays green today and starts failing next month unless
someone re-checks — which is the entire point.

`check-manual-checks.mjs` now exits `1` on a missing expiry as well as an expired
one, with the undated entries promoted from `console.warn` to `console.error`.
Verified both directions: removing one `expiresOn` produces
`NO EXPIRY jp-ai-guidelines-business …` and exit `1`; restoring it returns
`17 total, 0 expired, 0 without an expiry date` and exit `0`.

---

## 4. The Network lens — KEEP, and the premise was wrong

The brief framed this as a duplication question: does a global force-directed
layout tell a user anything the per-entity `ConnectionsSection` list does not?
It also stated that `DEPENDENCY_EDGES` is imported by eight modules including
`getEdgesForNode.ts`, `getLabSummary.ts`, `exportDataset.ts` and `validateData.ts`.

**Two corrections, and they change the answer.**

First, the import count. `DEPENDENCY_EDGES` has four non-test importers:
`NetworkView.tsx`, `exportDataset.ts`, `validateData.ts`, and its own defining
file. `getEdgesForNode.ts` imports a *different* export from the same module —
`EDGES_BY_NODE` ([`getEdgesForNode.ts:1`](../../src/utils/getEdgesForNode.ts)) —
and `getLabSummary.ts` does not import it at all. The conclusion that the edge
data survives regardless still holds, via `EDGES_BY_NODE`, `exportDataset` and
`validateData`.

Second, and decisively: **the two surfaces do not read the same edges.**

- `ConnectionsSection` → `getEdgesForNode` → `EDGES_BY_NODE`, built from all **99** `DEPENDENCY_EDGES` ([`dependencies.ts:265`](../../src/data/dependencies.ts)).
- `NetworkView` **discards all 63 lab-touching** `DEPENDENCY_EDGES` — `isLegacyLabExposureEdge` at [`NetworkView.tsx:129,537`](../../src/components/NetworkView.tsx) — and substitutes **106** exposure-derived edges built by `getLabExposureGraphEdge`, of which it is the only caller.

Measured edge inventory:

```
DEPENDENCY_EDGES total: 99
  of which lab-touching (dropped by NetworkView:129): 63
  non-lab (kept by NetworkView): 36
LAB_REGULATORY_EXPOSURES: 106
=> NetworkView 'All' edge pool: 142
```

So for a lab, neither surface is a superset of the other. Every one of the 13
labs differs:

| lab | side panel | graph |
|---|---:|---:|
| openai | 7 | 10 |
| anthropic | 7 | 10 |
| google-deepmind | 6 | 9 |
| mistral | 4 | 8 |
| deepseek | 3 | 6 |
| alibaba | 2 | 5 |

Running the brief's own test — *"who constrains OpenAI?"* — the side panel returns
seven hand-authored rows including `in regulates <- EU AI Act`; the graph returns
ten exposure-derived edges (`regulates` 1, `influences` 3, `coordinates` 2,
`participates_in` 2, `depends_on` 2). **The graph is the only surface that renders
the 106 source-backed lab-exposure rows as relationships.** The panel is the only
surface that still shows the 63 hand-authored lab edges.

**The redesign from F-09 shipped and works.** Read live from the production DOM at
1440 px, default preset and density:

```
nodes: 53   edges: 86   visibleLabels: 16 (30% of nodes)
edgeColourTally: { "#0F766E": 31, "#1D4ED8": 20, "#94A3B8": 18, "#7C3AED": 15, "#DC2626": 2 }
nodeColourTally: { "#6D28D9": 16, "#B45309": 13, "#1D4ED8": 11, "#10B981": 10, "#0F172A": 3 }
```

Five relationship types are visibly distinguished by colour, with a published key
([`NetworkView.tsx:42-49,481-498`](../../src/components/NetworkView.tsx)); node
area is degree, computed from the edges on screen; and the legend states outright
that "Position carries no meaning" ([`:501`](../../src/components/NetworkView.tsx)).

**What the graph shows that the list structurally cannot:** the 31-edge
`coordinates` cluster — the summit and AI-safety-institute coordination layer — as
a *shape*. A per-entity list can tell you that OpenAI coordinates with two
institutes; only the graph shows that coordination is the single densest relation
in the dataset, 31 of 86 rendered edges, and that it forms a connected hub rather
than scattered pairs. Node size as degree also lets a reader rank centrality by
eye and then verify it by counting.

**Verdict: KEEP. [`06-ROADMAP.md`](06-ROADMAP.md) L1 resolves as "do not delete the
global graph."** The ~10 KB and 571 LOC were never the argument, and the
duplication hypothesis is measurably false.

**The actual finding here is not a cleanup — it is a correctness question.** The
two surfaces *disagree*, and a reader who consults both gets two different answers
to "who regulates OpenAI." One of them is derived from source-backed exposure rows;
the other from hand-authored seeds the graph itself labels "legacy." That
divergence should be reconciled or documented, and it is your call which. It is
worth more than everything in §3 except the legend.

### 4.1 Network at 390 px — a real defect, still a KEEP

Measured at 390×844 on production:

```
network: { w: 390, h: 654, nodes: 53, labels: 16, nodesOutsideViewBox: 42 }
overlayPanels:
  node list: { x: 86,  y: 206, w: 288, h: 56  }   (z-10)
  legend:    { x: 16,  y: 206, w: 374, h: 269 }
```

**42 of 53 nodes render outside the visible box** — roughly 79% of the graph is
off-canvas, with no pan or zoom affordance in this view. And the two overlays
collide: both start at `y: 206`, the legend spans the full width, and the `z-10`
node-list panel sits on top of it — obscuring the key with the control that is
supposed to be the accessible fallback. Page-level horizontal overflow is clean
(`scrollWidth: 390`), so this is contained to the lens.

**Verdict: keep the lens, fix the layout.** Below `sm`, either constrain the force
simulation to the container or skip the graph entirely and present the node list
as the primary surface — it already exists, is searchable, and is the a11y path.

---

## 5. Keep, and why it looked cuttable

This section is longer than the removals list. That is the honest result.

**Embed routes.** On paper, textbook dead weight: `embedRoute()`
([`embedRoutes.ts:35`](../../src/utils/embedRoutes.ts)) has zero production callers
— its only caller anywhere is its own test — no component emits an `/embed/` link,
`public/robots.txt:3` disallows the family, and **0 of 544** sitemap entries are
embeds. Zero clicks in the app lead there. But I loaded `/embed/country/USA` on
production and got a complete, source-backed card ("3 national entries, 21
international participation rows... BINDING LAW: Yes... Research aid only"). It
costs ~5 KB, the framing is deliberate (rewrite plus frame policy in
`vercel.json`), and `embed-cards.json` (307 KB) advertises the URLs to external
consumers. **Unreachable from your own UI is not the same as unused — an embed is
meant to be reached from someone else's page.** The gap is marketing, not fat: a
"Copy embed code" button on the country and lab panels would cost an hour.

**The AI Atlas.** My leading "carried but unsurfaced" suspect: 14,285 lines and the
largest data module in the project. It is surfaced in five places, two of them one
click deep — map fills via four atlas colour modes, `AIAtlasSection` in the country
side panel ([`CountrySidePanel.tsx:231-233`](../../src/components/CountrySidePanel.tsx),
*not* behind a `<details>`), Table→Indicators, Table→Sources, and the Workbench
atlas section. 349 indicator scores and 74 readiness reports, with Oxford Insights
(184 rows), CAIDP (89), Stanford HAI (66) and UNESCO RAM (74) all rendering. It is
also in the full JSON export and three dedicated public endpoints. Reachable and
legible. **KEEP.**

**Three of the four index families, specifically.** "Do I need this many rankings?"
deserves a per-index answer rather than a verdict on the Atlas as a whole. Measured
across all 192 country codes:

| Index | Coverage | Distinct fills | Largest bucket | Vintage | Verdict |
|---|---:|---:|---|---|---|
| Oxford Gov AI Readiness | 184/192 | 5 | 47% | 2025 | **Keep** |
| CAIDP Democratic Values | 89/192 | 5 | 38% | 2026 | **Keep** |
| UNESCO RAM status | 74/192 | 4 | 45% | 2026 | **Keep** |
| Stanford AI Vibrancy | 66/192 | 3 | **98%** | 2024 | Mode cut ([§3.8](#38-ai-vibrancy--dead-removed-30-july-2026)) |

The three survivors are not redundant with each other: Oxford measures state
*capacity*, CAIDP measures *rights alignment*, and UNESCO RAM is a *categorical
process status* rather than a score at all. Each spreads its countries across four
or five fills with no bucket above half, so each produces a map a reader can
actually read. Their disagreements are the interesting part — a country can rank
high on Oxford capacity and low on CAIDP values, and that gap is a finding. **Keep
all three.** The line separating them from Stanford is not reputation or recency;
it is whether the encoding discriminates.

**The IMF preparedness index, carried with zero country rows.** This looks exactly
like dead data: a named source constant, a category label, and not one score. It is
the opposite. [`aiAtlas.ts:78`](../../src/data/aiAtlas.ts) records that "country
rows are not imported in this pass because the public page blocked automated data
retrieval," and `aiAtlas.test.ts:63` **asserts the absence** so nobody quietly
backfills it. It surfaces as a source-only row in Table→Indicators. Deleting it
would make the corpus look more complete than it is, and would delete the evidence
of a known gap. **KEEP — this is the dataset's integrity mechanism working.** The
same reasoning protects the other five zero-row sources (OECD ×2, GIRAI, the AISI
network, the EU GPAI code).

**The remaining fourteen colour modes.** Several are sparse: `lab-hq`
differentiates 4 countries, `proposed-law` 12, `enforcement-activity` 13 — and
`enforcement-activity` is a *promoted* mode. It is tempting to call a map with 13
coloured countries empty. It is not: **a map showing 4 lab-HQ countries is the
correct answer to "where are the frontier labs headquartered."** Sparse is a
finding; flat is a failure — a sparse map says "these four, and we checked the
rest," while a flat map says nothing at all. That distinction is the entire line
between these fourteen and the three in §3.1, §3.3 and §3.8, and it is why the
answer to "is 17 modes more than the data supports?" is **fourteen yes, three no**
rather than a round number. Note that sparseness is not even correlated with
value here: `enforcement-activity` colours only 13 countries and is one of the
three modes promoted to a visible button, because "who has actually enforced
anything?" is a question worth asking even when the honest answer is "almost
nobody."

**The Table lens.** 14 dataset tabs and 214 buttons is a lot of surface for a view
casual visitors skip. It is also the accessible alternative to every visualisation
in the product, the strongest single piece of evidence that the underlying work is
serious, and — measured — the *only* in-app path to the corpus record routes that
is not behind a `<details>` (Table→Corpus, 2 clicks, versus Workbench→expand→3
clicks). Demoting it would break the a11y story and the shallowest route to 92
records. **KEEP.**

**The Timeline lens.** A sorted list with lane filters; the Table can sort by date.
It is also the cheapest lens in the product and the only one where a first-time
reader extracts a real finding unaided. **KEEP**, per [`06-ROADMAP.md`](06-ROADMAP.md).

**Research corpus sub-collections.** All five kinds — institutions (23), policy
processes (10), standards (11), public-sector AI (10), enforcement (38) — have
their own tab, their own detail route, and prerendered pages: 92 records, 92
routes, 92 pages. Reachable two independent ways. **KEEP all five.**

**Safety evaluations (4), compute dependencies (4), model-governance evidence (16).**
The thinnest data in the project. No corpus tab, no detail routes, and with 4
evaluation records across 13 labs most labs render "No lab-specific public
evaluation rows" ([`LabIntelligenceBoard.tsx:155`](../../src/components/LabIntelligenceBoard.tsx)).
This is the category the brief warned would get abused, and it is the clearest
case for resisting: **4 records honestly reported as 4, with an explicit empty
state for the other 9 labs, is the product working.** Padding them would be a
data-integrity failure; deleting them would remove the evidentiary backbone of the
lab board. **KEEP.**

**543 record routes.** 451 of them have exactly one in-app link — the `CompareCard`
"URL" button at [`WorkbenchView.tsx:1289`](../../src/components/WorkbenchView.tsx),
four interactions deep behind a collapsed `<details>`. That reads like 451 orphaned
URLs. They are not orphaned: all 543 are in the sitemap, all 543 are prerendered
with their own `<head>` by `write-record-previews.mjs`, and they are public citation
targets. **Deleting one breaks a citation for anyone who used it, irreversibly.**
The problem is discoverability, which is a linking job. **KEEP every one.**

**Thirty public JSON endpoints.** Only 2 are clickable in the app and 23 have no UI
representation at all. They are not for the app — the app fetches none of them; its
only runtime `fetch()` is the world topology at
[`worldTopology.ts:61`](../../src/utils/worldTopology.ts). They exist for external
consumers, which is the point of publishing data. **KEEP** (see §3.6 for the one
genuine duplicate).

**Evidence dossiers, comparison tray, guided tour, methodology panel, research
questions panel, scenario simulator, lab intelligence board.** All reachable in 1–3
clicks; all answer a question nothing else does. The scenario simulator is the
weakest on paper — no extracted component, one mount point, behind a collapsed
`<details>`, market toggles untested — but it renders non-trivially on its defaults
and models lab exposure across markets, which no other surface attempts. **KEEP all
seven.** The gaps here are test coverage, not dead weight: the Workbench has no axe
scan, the "AI Atlas comparison" and "Obligation and implementation matrices"
sections are never expanded by any e2e test, and `/public-sector-ai/:id` and
`/enforcement/:id` (48 records) have no route test.

**`powerScore`.** Already dropped from every visual encoding, and the reasoning is
preserved in a comment at [`NetworkView.tsx:196-201`](../../src/components/NetworkView.tsx).
It survives as an editorial sort key ([`generate-country-map-summaries.mjs:69`](../../scripts/generate-country-map-summaries.mjs)).
**Leave it alone** — this was settled as X3.

---

## 6. Sequenced plan

All four items ran on 30 July 2026, in this order. The order mattered: cutting the
dead modes *before* rewriting the legend meant the new key had to cover 14 modes
rather than 17, and three of the entries it would otherwise have needed were for
modes that no longer exist.

| # | Change | Outcome |
|---|---|---|
| 1 | Remove `frontier-relevance` + `source-confidence` (§3.1, §3.3) | Picker 16 → 14; `tsc` surfaced a third call site in `mapColorReason.ts` |
| 2 | Per-mode legend key + regression test (§3.2) | 17 new tests; also fixed the outline key and the caveat |
| 3 | Backfill expiries, make the check fail (§3.9) | 17/17 dated; earliest lapses 2026-08-27 |
| 4 | Delete 2 components + 19 exports (§3.4, §3.5) | 7 further symbols orphaned and removed |

**Verification gate, run after all four:**

```
lint                 0
typecheck            0
unit                 181 passed (40 files)   ← was 163 / 39
e2e                  40 passed
build                0
check:performance    "issues": []            initialGzipBytes 120,853
audit:manual-checks  17 total, 0 expired, 0 without an expiry date   exit 0
record routes        543        sitemap <loc>  544
```

Two of these were mutation-tested rather than merely run, because a green test
that cannot fail is worse than no test: restoring the legend fall-through makes 6
tests fail, and removing one `expiresOn` makes `audit:manual-checks` exit 1.

**Still open, by choice.** Three items from §2 remain, and none is a deletion:
document the duplicate enforcement endpoint as an alias (§3.6), wire the
`lab_market` policy-brief button (§3.7), and fix the Network lens at 390 px (§4.1).
Beyond the audit, the open question is not a cleanup at all: decide what to do
about the Network/`ConnectionsSection` edge divergence (§4).

---

## 7. Unverified suspicions

Not anchored well enough to act on.

- **`visual.spec.ts` may be superseded by `visual-regression.spec.ts`.** The former writes screenshots to `testInfo.outputPath()` with no baseline comparison; only the latter has committed baselines. Both run under `npm run test:e2e`. I did not establish whether the uncompared screenshots serve a manual review workflow.
- **The Workbench's `compareItems` and the App-level comparison tray are two separate pinning systems** ([`types.ts:927`](../../src/types.ts) versus [`App.tsx:178`](../../src/App.tsx)), with two `CompareCard` implementations. This smells like duplication, but I did not verify whether they serve different scopes deliberately.
- **`docs/audit/` has no `03-*.md`.** [`README.md`](README.md) explains this was intentional. Noting it only so the next auditor does not go looking.
- **I could not exercise hover, tooltips, or the maximised-map chrome**, because the browser pane would not composite (see §8). Anything depending on `:hover` state is untested by this audit.

---

## 8. Method, and one correction

All live numbers were read from the production deployment
(`https://global-ai-governance-map.vercel.app`) via the rendered DOM, not from
screenshots — the browser pane would not composite frames in this environment.
Static measurements loaded the real modules through the repo's own `jiti` and
called the real functions; no fixtures, no re-implementations.

**Two measurements were taken, found wrong, and discarded. Both are recorded here
because a cleanup audit that hides its own false starts is not worth trusting.**

First: a sweep of all 17 colour modes driven by synthetic `change` events returned
identical results for every mode. The events never reached React's state, so all 17
rows were stale readings of whatever mode was loaded. Discarded entirely; the
surviving mode measurements come from independent page loads via `?mapMode=`.

Second, and more instructive: `gov-ai-readiness` initially appeared to render an
**all-grey map on production** — 167 of 167 countries at the "no data" fill —
which would have been a severe bug hiding the largest data module in the project.
It was an artifact of my own environment. The country fill is applied through a
`--country-fill` custom property consumed by
[`index.css:143-148`](../../src/index.css), which carries `transition: fill 120ms`.
In a tab that never composites, that transition never advances, so
`getComputedStyle` returns the pre-transition value. Inspecting the inline style
showed the truth — `--country-fill: #1E3A8A` on the United States, the correct
Oxford-readiness colour — and suppressing the transition revealed the full,
healthy distribution:

```
computedBeforeDisablingTransition: { "rgb(229, 231, 235)": 167 }
computedAfter: { "rgb(219, 234, 254)": 71, "rgb(147, 197, 253)": 50,
                 "rgb(37, 99, 235)": 40, "rgb(30, 58, 138)": 2, "rgb(229, 231, 235)": 4 }
```

**The atlas modes work correctly.** Every live figure in this document was
re-measured with transitions suppressed, including the two dead-mode findings in
§3.1 and §3.3, which survive the correction unchanged.

---

## What I would clean up first, and why

The legend — and that is what happened. Not because it was the biggest item; it
deleted nothing. Because it was the only place in this artifact where the product
stated something false. A reader who opened "Frontier relevance" saw the entire
world painted in the colour the on-screen key defined as *binding AI-specific law*,
in a project whose whole claim to trustworthiness is that it distinguishes binding
law from participation from guidance. Everything else in §3 was housekeeping; that
one was about whether the artifact means what it says.

The ordering lesson is worth keeping: the dead modes went first, which shrank the
legend work, and the legend went before the mechanical sweep, which was the only
item nobody would have noticed either way. **The correct first move was the one
that changed what a reader is told, not the one that removed the most lines** —
355 lines came out in the end, and not one of them was visible to anyone.

## What I was tempted to cut and shouldn't have been

The Network lens, and I went in expecting to cut it. The framing was persuasive —
a global hairball whose question a per-entity list already answers — and it was
wrong on the facts: the two surfaces read different edge sets, the graph is the
only place the 106 source-backed lab-exposure rows appear as relationships, and the
F-09 redesign has made edge type genuinely visible. I was also tempted by the embed
routes, which no click in the app can reach, and by the IMF row that carries a
source with zero data. Both are the same mistake in different clothes: judging a
surface by whether *this* UI leads to it, when an embed's whole purpose is to be
reached from elsewhere and an empty source row's whole purpose is to mark a gap
honestly. The lesson I would keep from this pass is that in a research artifact,
"nothing points at it" and "it is doing no work" are entirely different claims, and
only the first one is something you can measure.

The near-miss worth recording is Stanford. Cutting the `ai-vibrancy` **mode** was
right — 65 of 66 countries in one bucket is not an encoding — but the reflex that
came with it, to treat the underlying index as equally dead, was not. Its records
carry a rank, three component sub-scores, a methodology link and an explicit note
that the public country data is a 2024 vintage. That is a *better* artifact than
the choropleth ever was, and it survives untouched. The same discipline is what
saved the four zero-row indicator sources, including the IMF: an index that is
badly drawn and an index that is badly evidenced look identical in a dropdown and
are completely different in a corpus. Cut encodings freely; cut records almost
never.
