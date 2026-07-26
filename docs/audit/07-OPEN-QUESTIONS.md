# 07 — Open questions

Things I could not settle from the code and the live site alone. Each is phrased as a decision, with my recommendation and the evidence that would settle it.

---

### Q1 — Is this primarily a research instrument or primarily a portfolio artifact?

Both are stated. They pull in opposite directions on nearly every finding in this audit: a research instrument should lead with the Table and the methodology and can afford a dense Workbench; a portfolio artifact should lead with a legible map, a great link preview, and one memorable finding in 30 seconds.

The current build is optimised for neither — it opens on a map with no legend and puts the densest surface first in the tab order.

**Recommendation: portfolio-first *presentation*, research-grade *substance*.** They are only in conflict at the front door. Fix the first 90 seconds (OG image, open legend, one headline finding) and nothing about the dataset's rigour is compromised. The Table and Methodology stay exactly as they are — they just stop being the last thing anyone finds.

**What would settle it:** analytics. There are none — no page-view tracking beyond Vercel Speed Insights, and no URL state on the map's colour modes, so even if analytics existed you could not tell which of the 17 modes anyone uses. Adding `mapMode` to the URL (F-05) is a prerequisite for ever answering this empirically.

---

### Q2 — What is `powerScore` actually measuring?

I can see what it does (pin size, node area, sort order, dossier output) but not what it means. Six labs are 5, six are 4, one is 3.

**Recommendation:** derive it or demote it — see [05](05-DATA-MODEL-REVIEW.md#3-power-score--verdict). If there was a rubric in your head when you assigned these, write it down; that alone converts the weakest item in the dataset into a defensible one.

**What would settle it:** your own answer to "why is Amazon 4 and Cohere 3?" If it takes more than two sentences, it needs a published methodology. If it takes fewer, it needs a published methodology *and* is easy to write.

---

### Q3 — Is the dataset maintained, or is it an archived snapshot?

The README roadmap promises "monthly dataset releases." The infrastructure exists ([`datasetReleases.ts`](../../src/data/datasetReleases.ts), a changelog, a delta monitor). But the newest verification in the corpus is 19 June 2026, the snapshot badge says 19 May, and the CoE manual override expired 5 July with nothing noticing.

This is the highest-stakes ambiguity in the project, because a governance dataset that *looks* live but is two months stale is more dangerous to a reader than one clearly labelled as archived.

**Recommendation:** pick one and say it in the UI. If you will review monthly, print "next review: <date>" in the Methodology panel and set the CI cron to fail when it lapses. If you will not, relabel to "archived snapshot, last reviewed 19 June 2026" — which costs you nothing in credibility and gains you honesty.

**What would settle it:** whether you will actually run the audit scripts monthly for the next six months. Only you know.

---

### Q4 — Should the Network view exist as a view, or as a panel section?

I recommended KEEP-with-redesign at Medium confidence, scoped to an ego-network on the selected entity ([04](04-VIEW-PORTFOLIO.md#network--keep-redesign-and-demote--confidence-medium)). But if the ego-network is the right answer, its natural home is the country/lab side panel, not a top-level tab — at which point the view disappears.

**Recommendation:** defer this until after the Workbench rebuild. That rebuild will establish where "detail about one entity" lives, and the Network decision follows from it rather than the other way round.

**What would settle it:** build the ego-network inside the side panel first. If it satisfies the "who is connected to whom" question there, delete the global graph and reclaim a nav slot plus the `d3-force` chunk.

---

### Q5 — Is the "AI-specific only" scope line drawn where you want it?

[`outOfScope.ts`](../../src/data/outOfScope.ts) excludes GDPR, DPDP, export controls and generic digital strategies with explicit `reasonExcluded` text — a genuine intellectual choice, and a good one. But three infrastructure choke-points *are* included, one of which is US BIS export controls, which is also the thing the scope note says is excluded. The distinction (context vs. law) is coherent in the data model and invisible in the UI.

I could not determine whether a first-time user ever encounters the scope rationale: `outOfScope.ts` feeds the Methodology panel, which is behind a "Data" menu button that P1–P4 mostly never open.

**Recommendation:** keep the scope line where it is — it is defensible and well-argued. Surface it: one sentence near the legend saying what this map does *not* cover, with a link to the full rationale. The reasoning is a strength currently filed where only a repo reader will see it.

**What would settle it:** ask two AI-governance researchers whether they expected GDPR on this map. If both did, the line needs explaining, not moving.

---

### Q6 — What is the mobile commitment?

The README concedes desktop/tablet ≥768px, but the app renders at 390 px with no horizontal overflow. Meanwhile 33% of the phone viewport is chrome and 8 visible controls fail the WCAG 2.2 24 px target minimum (F-17).

So the docs undersell what exists, and what exists is not quite good enough to claim.

**Recommendation:** commit to mobile. Most traffic from a shared LinkedIn or X link is mobile, and that is the artifact's main distribution channel. The remaining work is small — raise the chips to 24 px, collapse the filter toolbar behind one control below `md` — and it converts a documented weakness into a claim you can make.

**What would settle it:** Vercel Speed Insights already collects device-class data. Check the actual mobile share before investing further.

---

### Q7 — Should the four aggregator sources be reclassified, or reduced?

342 source URLs point at oxfordinsights.com (185), caidp.org (90), hai.stanford.edu (67) — all flagged "unknown host" by the validator, against an "official-first" framing. They are disclosed in the footer, so this is not concealment. But they are the bulk of the Atlas indicator layer.

**Recommendation:** classify them explicitly as `secondary` in [`sourceHosts.json`](../../src/data/sourceHosts.json) so the count becomes a deliberate statement rather than an unclassified gap, and make sure the UI never lets an indicator-derived value sit visually adjacent to a binding-law value without a marker. The data model already says these are "contextual only and never drive binding-law summaries" — make the classification say it too.

**What would settle it:** whether you consider a research index citing an official source to be a secondary source or a source chain. `SourceChainEntry` exists in the type system and is barely used; it may be the right home for this.

---

### Q8 — Who is the second maintainer?

Not a rhetorical question. `App.tsx` is 946 lines with 20 `useState` hooks; `aiAtlas.ts` is 14,285 lines; `WorkbenchView.tsx` is a 65 KB source file. The code is clean — zero TODOs, one `eslint-disable`, lint and typecheck green — so this is not a criticism of quality. But several of my recommendations (URL-state consolidation, the Workbench rebuild) are sized differently depending on whether anyone else will ever read this code.

**Recommendation:** if the answer is "nobody," skip the architectural refactor in F-23 entirely and spend the time on the data. If the answer is "a reviewer at a hiring committee," then `App.tsx` is a work sample and its state sprawl is the first thing an engineer will notice.

**What would settle it:** whether you would put this repo link on an application for an engineering role or a policy role. The answer changes the roadmap.

---

## Deferred to pass 2

Not open questions — simply not yet done, per the agreed scope:

- `02-WORKBENCH-REDESIGN.md` — full spec, wireframes, worked examples
- `03-LAYERS-DECISION.md` — the merge design at implementation depth (direction already committed in [04](04-VIEW-PORTFOLIO.md#layers--merge-into-geography--confidence-high))
- `06-ROADMAP.md` — Now / Next / Later / Never buckets with acceptance criteria
- Remaining Track A/B/D/E finding rows: filter × lens interaction matrix, React Profiler re-render counts, `d3-force` main-thread profiling, full UI copy and reading-level audit, competitor benchmark against OECD.AI / Stanford AI Index / IAPP / GIRAI / CAIDP
