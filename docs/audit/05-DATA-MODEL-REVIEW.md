# 05 — Data model review

Pass 1. Taxonomy critique, the 15-record source spot-check, the `powerScore` verdict, a staleness strategy, and a proposed cleaned-up schema.

---

## 1. Taxonomy coherence

### 1.1 Four vocabularies describe the same fact

A single national rule carries all four of these simultaneously:

| Field | Type | Values | Location |
|---|---|---:|---|
| `type` | `NationalRegulationType` | 9 | [`types.ts:25-34`](../../src/types.ts) |
| `bindingStatus` | `NationalBindingStatus` | 5 | [`types.ts:36-41`](../../src/types.ts) |
| `status` | **`string`** | **42 distinct** | [`types.ts:83`](../../src/types.ts) |
| (separately) | `ImplementationStatus` | 8 | [`types.ts`](../../src/types.ts) |

`status` is the problem. It is free text, and across ~75 national rules it takes **42 distinct values** — close to one unique value per record:

```
"In force"
"In force; phased implementation"
"In force as guidance; no omnibus AI statute"
"In force as a broad development-plan mandate; not a standalone AI law"
"In implementation"
"In implementation; updated 2024"
"In implementation; Phase 3 launched 2025"
"Adopted; in force"
"Adopted; grace period for implementation"
...
```

**Assessment `[defect]`.** These are annotations, not a status. They cannot be filtered, faceted, counted or compared, and they overlap the two enums that *can* be: "In force" duplicates `bindingStatus: "binding"` and `ImplementationStatus: "in_force"` in a third vocabulary. The information in the qualifiers ("grace period", "no omnibus statute", "Phase 3") is genuinely valuable — it is the nuance a governance researcher wants — but it is prose and should be typed as such.

**Recommendation.** Rename `status` → `statusNote` and mark it explicitly as display-only prose. Promote the recurring qualifiers that actually carry meaning into booleans or a small enum (`hasGracePeriod`, `isOmnibusStatute`, `implementationPhase`). Derive the displayed status line from `bindingStatus` + `ImplementationStatus` + `statusNote` rather than storing a fourth opinion.

### 1.2 Enums that are justified

I expected to find over-specified taxonomies here and mostly did not.

- **`ParticipationType` (9 + `unknown`)** — justified. `signed` vs `ratified` vs `applicable_via_eu` vs `covered_by_membership` are exactly the distinctions that make the dataset more useful than a binary "is a party." The Workbench surfaces the payoff directly: *"1 ratified / 20 signed-only rows; signature is not ratification."* Keep all nine.
- **`RelationshipKind` (6)** — justified, and I initially misjudged it. The 36 hand-authored seed edges in [`dependencies.ts`](../../src/data/dependencies.ts) are dominated by `influences` and `coordinates`, with only 2 each of `regulates`, `constrains`, `depends_on` and `participates_in` — which looks like an over-specified enum. But the generated lab-exposure edges exercise all six deliberately and correctly ([`labExposure.ts:196-239`](../../src/utils/labExposure.ts)). The taxonomy is sound. **The defect is that none of it is visible** — every edge renders as the same slate line (F-09).
- **`ObligationCategory` (14)** and **`ImplementationStatus` (8)** — justified. Both map to real regulatory distinctions and both are exercised in the UI.

### 1.3 Values that exist only in the data

`InstrumentBindingStatus` has 6 values ([`urlState.ts:51-58`](../../src/utils/urlState.ts)); the map's binding-law mode collapses everything to four fills (`empty` / `guidance` / `mixed` / `binding`). `political_guidance`, `voluntary` and `standard` are visually identical on the map. Defensible as a simplification, but it means the legend cannot be read back to the data — a user cannot invert "light blue" into a `bindingStatus` value.

### 1.4 Jurisdiction misfiling

France and Germany are records in [`subnationalRules.ts:127,146`](../../src/data/subnationalRules.ts) with `jurisdictionType: "eu_member"`, counted by the README among "7 subnational rules." Two of the seven are sovereign states; a third (`fr-ai-act-implementation-draft`) has `status: "Implementation activity; specific national act not tracked"` and is therefore not a rule at all. See F-14.

---

## 2. Source spot-check — 15 records

Sampled across instruments (6), national rules (5), subnational rules (3) and participation (1). Each URL fetched live on 25 July 2026 with a browser user-agent. **Pass** requires the URL to resolve *and* serve content that supports the record's claim — a status code alone is not a pass.

| # | Record | Category | HTTP | Content check | Verdict |
|---|---|---|---|---|---|
| 1 | `eu-ai-act` | Instrument | 202 | 1.53 MB EUR-Lex; 31 × "artificial intelligence" | **PASS** |
| 2 | `oecd-ai-principles` | Instrument | 200 | 4,035 B; **0** × "artificial intelligence" — JS shell | **INCONCLUSIVE** |
| 3 | `unga-78-265` | Instrument | 200 | 63 KB UN Digital Library record; 6 hits | **PASS** |
| 4 | `iso-iec-42001-2023` | Instrument | **403** | Anti-bot block; not in `sourceLinkManualChecks.json` | **BLOCKED** |
| 5 | `hiroshima-guiding-principles` | Instrument | **403** | MOFA PDF blocked; not in manual-check list | **BLOCKED** |
| 6 | `coe-ai-convention` | Instrument | 200 | **Cloudflare "Sorry, you have been blocked"** (5,509 B) | **FALSE PASS** |
| 7 | `cn-genai-interim-measures` | National | 200 | 15.8 KB served from cac.gov.cn | **PASS** |
| 8 | `jp-ai-promotion-act` | National | 200 | 59 KB; 57 × 人工知能 on the official translation site | **PASS** |
| 9 | `us-nist-ai-rmf` | National | 200 | Title "AI Risk Management Framework \| NIST" | **PASS** |
| 10 | `ru-ai-experiment-law` | National | 200 | **`http://`, not HTTPS**; content not verified | **INCONCLUSIVE** |
| 11 | `uk-ai-security-institute` | National | 200 | aisi.gov.uk/about resolves | **PASS** |
| 12 | `us-il-aivia` | Subnational | 200 | ILGA full text; "Artificial Intelligence Video" | **PASS** |
| 13 | `us-ca-sb-53-frontier` | Subnational | 200 | "CHAPTER 138 … Transparency in Frontier Artificial Intelligence Act (TFAIA)" | **PASS** |
| 14 | `fr-ai-act-implementation-draft` | Subnational | 200 | 1.8 MB `rapport_annuel_2025.pdf`, filename matches source name | **PASS (weak source)** |
| 15 | `coe-signatures` (participation) | Participation | **403** | CoE Treaty Office signature list blocked | **BLOCKED** |

**Rates:** resolve **12/15 (80%)** · content-verified **9/15 (60%)** · blocked by anti-bot **3/15** · false pass **1/15** · inconclusive **2/15**.

### What this means

**The records that verified, verified well.** Where content could be read, it was the official source, at the correct document, supporting the stated claim — the chaptered California TFAIA text, 1.5 MB of EUR-Lex, the official Japanese translation. No instance of a summary overstating its source. The editorial discipline is real.

**Three failure modes are worth acting on:**

1. **The false pass is the serious one (F-11).** `coe.int` returns HTTP 200 with a block page, and `npm run audit:source-links` reports it healthy — its entire output is 2 warnings, neither this. This is the source for the dataset's **only binding treaty**, carrying a time-sensitive claim ("not yet in force… EU ratification recorded 15 May 2026") whose manual verification override, per the README, **expired 5 July 2026**. Three weeks past expiry, nothing has flagged it.
2. **The manual-check list under-covers known blockers.** `sourceLinkManualChecks.json` holds 16 entries covering CEN-CENELEC, MSIT, METI, Australian DISR, Kazakh Adilet and others — but not ISO, not MOFA, not the CoE Treaty Office, all three of which blocked me. The mechanism exists; its coverage lags reality.
3. **Two `http://` sources** ([`nationalAIRegulations.ts:730,1290`](../../src/data/nationalAIRegulations.ts)) — `publication.pravo.gov.ru` and `static.kremlin.ru`. Plain HTTP means the content is unauthenticated in transit, which for a legal-status claim is a real (if small) integrity gap.

### Is `verificationStatus` honestly assigned?

**The assignments are honest; the vocabulary is not.** Distribution: 44 `verified`, 38 `likely_correct`, 2 `uncertain`, 1 `needs_external_check` — and the `uncertain` flags land exactly where they should, on the four litigation records, which `npm run audit:data-review` independently surfaces as *"uncertain record should be checked before being cited as settled."*

The structural problems are two:
- **`VerificationStatus` has no negative value** ([`types.ts:44-48`](../../src/types.ts)). The worst the schema can say is "someone should check this." There is no `unverified`, `disputed` or `superseded`.
- **85 status values for 762 sourced records (11%).** The other 89% carry no verification status at all, and the test that supposedly guards this is satisfied by any one of five optional fields ([`governanceTaxonomy.ts:201-209`](../../src/utils/governanceTaxonomy.ts)) — a record declaring only `sourceKind: "official"` passes as having "explicit verification metadata."

---

## 3. Power score — verdict

**Drop it from visual encoding; keep it as an internal sort key at most.**

The facts:
- Hand-assigned per lab in [`frontierLabs.ts`](../../src/data/frontierLabs.ts): six 5s, six 4s, one 3. No formula, no inputs, no source, no methodology note.
- The only validation is a range check, `powerScore < 1 || > 5` ([`validateData.ts:210`](../../src/utils/validateData.ts)).
- It drives **map pin size**, **network node area** ([`NetworkView`](../../src/components/NetworkView.tsx), captioned on screen as *"Size = power score"*), instrument sort order ([`getCountryGovernanceSummary.ts:85-86`](../../src/utils/getCountryGovernanceSummary.ts)), and is printed in evidence dossiers as `"Power score: N/5"` ([`evidenceDossier.ts:398`](../../src/utils/evidenceDossier.ts)).

**The argument for keeping it:** every index makes judgement calls, including the CAIDP Index and Oxford Insights readiness scores this project already cites. Refusing to rank is its own distortion — treating Cohere and OpenAI as equally consequential would be *less* accurate, not more. And the lab side panel does disclose the caveat: *"frontier-lab inclusion, HQ treatment, and power score remain methodology judgments."*

**Why that argument loses here:** the comparators publish their methodology. A reader can interrogate how Oxford Insights weights its pillars; they cannot interrogate why Amazon is a 4 and Cohere a 3. Worse, `powerScore` is the *most visually salient* variable in two views — area, which humans read pre-attentively — so the least defensible number in the dataset is doing the most rhetorical work. In an artifact whose whole pitch is source-backed rigour, that is the softest target a reviewer has.

**Recommendation, in order of preference:**
1. **Derive it** from published inputs — frontier model releases, disclosed compute, market reach, regulatory exposure count — and publish the formula in the Methodology panel. The exposure data to do this largely exists.
2. **Or size by degree** in the Network view (computed from the edge set, trivially defensible) and by a constant on the map, keeping `powerScore` only as a tiebreak sort key with a documented caveat.
3. **Do not** keep the current arrangement. It is the single easiest finding for a hostile reader to use against the whole dataset.

---

## 4. Staleness strategy

### Current state

| Signal | Value |
|---|---|
| `DATA_SNAPSHOT_DATE` | 2026-05-19 ([`governanceTaxonomy.ts:10`](../../src/utils/governanceTaxonomy.ts)) |
| `lastVerified` range in corpus | 2026-05-20 → 2026-06-19 |
| Records whose `lastVerified` postdates the snapshot | **93 of 93 (100%)** |
| Validator warnings generated as a result | **371** |
| Audit date | 2026-07-25 |
| Age of newest verification | 36 days |
| CoE manual-verification override | **expired 2026-07-05** |

The dataset is internally inconsistent about its own age (F-04) and its one time-boxed manual exception has lapsed silently.

### Proposed treatment

The framing should be **"a maintained corpus with per-record freshness,"** not "a snapshot." The data already supports the former; the badge claims the latter and the code contradicts both.

1. **Redefine the constant.** Make `DATA_SNAPSHOT_DATE` a derived value — `max(lastVerified)` across the corpus — computed at build time by the existing generator scripts. It then cannot drift, and the 371 warnings vanish for the right reason.
2. **Change the validator's assertion.** Warn when `lastVerified` is *older* than N days, not when it is newer than a hardcoded date. Then assert `warnings.length === 0` in [`validateData.test.ts`](../../src/utils/validateData.test.ts) so warnings can never again accumulate unseen.
3. **Surface age per record, not per dataset.** Every side panel and dossier already renders `VerificationMeta`; add a relative age ("verified 36 days ago") and a visible amber state past 180 days. `audit:data-review` already computes the 90/180-day buckets — it reports 0 in both today, which is true and will stop being true in September.
4. **Fail the build on expired manual overrides.** `sourceLinkManualChecks.json` entries carry `lastChecked`; add `expiresOn` and make CI fail when today exceeds it. This is the specific mechanism that would have caught the CoE lapse.
5. **State the update cadence in the UI, or state that there isn't one.** The README roadmap promises "monthly dataset releases"; [`datasetReleases.ts`](../../src/data/datasetReleases.ts) exists to support it. If the cadence is real, print "next review: <date>" in the Methodology panel. If it is aspirational, say "archived snapshot, last reviewed <date>" — which is honest and costs nothing. Do not leave it ambiguous.

---

## 5. Proposed cleaned-up schema

Changes only; everything unmentioned stays as it is.

```ts
// ─── Verification: make the negative expressible, and make it required ───
export type VerificationStatus =
  | "verified"            // primary official source read; claim confirmed
  | "likely_correct"      // official source read; claim inferred, not explicit
  | "uncertain"           // source ambiguous or contested
  | "needs_external_check"// no readable source; blocked or offline
  | "unverified"          // NEW — never checked. The honest default.
  | "superseded";         // NEW — source moved or claim overtaken by events

export interface VerificationMetadata {
  sourceKind: SourceKind;              // was optional → now required
  verificationStatus: VerificationStatus; // was optional → now required
  lastVerified: string;                // was optional → now required (ISO date)
  confidence?: DataConfidence;
  verificationNotes?: string;
  sourceChain?: SourceChainEntry[];
  reviewStatus?: ExpertReviewStatus;
  reviewNotes?: string;
  sourceExpiresOn?: string;            // NEW — for time-boxed manual overrides
}

// Tighten the guard so it means what its name says.
export function hasVerificationMetadata(item: VerificationMetadata): boolean {
  return Boolean(item.verificationStatus && item.lastVerified && item.sourceKind);
}

// ─── National rules: stop storing status four times ───
export interface NationalAIRegulation extends VerificationMetadata {
  type: NationalRegulationType;        // unchanged (9)
  bindingStatus: NationalBindingStatus;// unchanged (5) — the machine-readable truth
  implementationStatus?: ImplementationStatus; // unchanged (8)
  statusNote?: string;                 // RENAMED from `status`; display-only prose
  hasGracePeriod?: boolean;            // NEW — extracted from the 42 free-text values
  isOmnibusStatute?: boolean;          // NEW
  // `status: string` is removed.
}

// ─── Jurisdiction: stop filing sovereign states as subnational ───
export type JurisdictionLevel = "subnational" | "national_implementation";
// `fr-*` and `de-*` records move to "national_implementation" and are
// counted separately from the 5 genuine subnational rules.

// ─── Power score: make it derived or drop it ───
export interface FrontierLab {
  // powerScore: number;  ← remove, OR:
  powerScore?: {
    value: number;                     // 1–5
    method: "derived" | "editorial";
    inputs?: string[];                 // what produced it
    methodologyUrl: string;            // required if `editorial`
  };
}
```

**Should this become schema-first (Zod/Valibot + inferred types + generated data)?**

**No, not at this size — but close the specific gap.** The argument for it is real: [`validateData.ts`](../../src/utils/validateData.ts) (699 lines) and [`types.ts`](../../src/types.ts) (965 lines) encode overlapping rules in two places and can drift — and they demonstrably have, since the compile-time types happily permit the 371 runtime warnings. A Zod schema would collapse both into one source of truth.

Against: the data modules are static TypeScript, so the compiler already catches shape errors at build time, and Zod's value is mostly at untrusted boundaries — of which this app has none. It would add a runtime dependency to a bundle already at 99.99% of its own total-JS budget, and it is a multi-day refactor for a solo maintainer.

**Cheaper fix that gets most of the benefit:** make the three fields above required in `VerificationMetadata`. The compiler will then enforce, at zero runtime cost, exactly what the 699-line validator is currently failing to enforce at runtime.
