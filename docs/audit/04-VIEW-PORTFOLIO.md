# 04 — View Portfolio: keep / kill / merge

Pass 1. Every verdict states the **counterargument first**, then the decision, then a confidence level.

---

## Part 1 — The four personas

Click paths walked in the running app (dev build, 1440×900, Chromium). Seconds are estimates for a first-time user who reads labels; click counts are exact.

### P1 — Policy researcher: *"Does Uzbekistan have a binding AI law, and what has it signed?"*

| Step | Action | Cumulative |
|---|---|---|
| 1 | Lands on Geography. Uzbekistan is `#E5E7EB` grey. | 0 clicks, ~5 s |
| 2 | Looks for a key. The legend is collapsed (`aria-expanded="false"`) — must find and open it. | 1 click, ~15 s |
| 3 | Legend says grey = "No AI-specific data". **Stalls** — is that "no law" or "we didn't look"? | ~25 s |
| 4 | Clicks Uzbekistan. Side panel opens with membership-derived participation. | 2 clicks, ~35 s |

**Answer quality: half right, half misleading.** The dataset holds zero rows for Uzbekistan in `nationalAIRegulations.ts` and zero in `participation.ts`; its `internationalParticipationCount: 5` ([`countryMapSummaries.ts:3208`](../../src/data/countryMapSummaries.ts)) is entirely derived from UN/UNESCO membership expansion. That is a defensible modelling choice, documented in the README's Known Limitations — but the map's grey communicates "nothing here," and the second half of P1's question ("what has it signed?") is answered only if they switch to Layers, where Uzbekistan turns violet. **They will not switch**, because nothing suggests the answer lives in another lens.

### P2 — Journalist: *"Who actually regulates OpenAI?"*

| Step | Action | Cumulative |
|---|---|---|
| 1 | Lands on Geography. Sees lab pins. Clicks the OpenAI pin (San Francisco — overlapping 6 other US pins). | 1–3 clicks, ~20 s |
| 2 | Lab side panel: safety framework, power score 5/5, exposure counts. | ~35 s |
| 3 | Wants the *regulators*. Goes to Workbench → Lab Board → OpenAI exposure brief: `BINDING 1 · CONDITIONAL 3 · VOLUNTARY 2 · INFRASTRUCTURE 2`. | 5+ clicks, ~70 s |

**Answer quality: good, but buried and numerically underwhelming.** "BINDING 1" is the honest answer (the EU AI Act) and it is the most interesting fact in the product — one binding instrument reaches the largest AI lab in the world. But it arrives as a bare tile among nine others, five clicks deep, with no sentence saying what it means. P2 will quote the number without understanding it, or leave.

### P3 — Hiring manager, 90 seconds

| Step | Action | Cumulative |
|---|---|---|
| 0 | **Sees the shared link preview first**: bare title, no image (OG image is an SVG; LinkedIn/X/Slack render none). | before arrival |
| 1 | Lands on Geography. Two-thirds of the world is grey. No legend. | ~10 s |
| 2 | Hovers a few countries, clicks one, reads the side panel. Impressed by source links. | ~40 s |
| 3 | Clicks Workbench (first tab). Gets 5.9 screens, 296 buttons, one `<h2>`, tiles reading `BINDING DUTIES 12`, `EVALUATION EVIDENCE 2`, `OPEN CONSULTATIONS 1`. | ~70 s |
| 4 | Forms an impression and leaves. | 90 s |

**This is the persona that matters most for the artifact's stated purpose, and it gets the worst run.** The two surfaces they see — a mostly-grey map with no key, and a dashboard of small numbers — are the project's weakest. Its strongest evidence of rigour (the Table's 14 datasets, the source metadata, the audit pipeline, the honest `NO INSTITUTION DATA 159`) is never reached. The 90 seconds are spent almost exactly inverse to where the quality is.

### P4 — Official in a middle-income state: *"What are peer states doing, and what should we copy?"*

| Step | Action | Cumulative |
|---|---|---|
| 1 | Geography. Filters by Region → Central Asia. | 3 clicks, ~30 s |
| 2 | Map greys out non-matches. Kazakhstan is blue (binding); neighbours grey. | ~45 s |
| 3 | Wants Kazakhstan vs Uzbekistan side by side. Finds the compare tray via a country panel pin. | 6+ clicks, ~90 s |
| 4 | **Stalls.** Comparison shows what each *has*; nothing addresses "what should we copy." | ~120 s |

**Answer quality: the question is out of scope and the product never says so.** "What should we copy" requires normative structure — model provisions, adoption sequences, peer-group definitions — that the dataset does not contain and arguably should not. The honest response is to reframe: P4 can be served with "what have states like mine done, in what order," which the Timeline plus a region filter nearly answers today. Nothing currently routes them there.

### Common failure

All four personas arrive with a **subject** (a country, a lab, a peer group). The product is organised by **method** (map, layers, graph, chronology, table). The bridge between subject and method is selection — and selection is destroyed at every lens switch ([`App.tsx:359-368`](../../src/App.tsx)). That is the structural problem stated in [00](00-EXECUTIVE-SUMMARY.md).

---

## Part 2 — Verdict per view

### Geography — **KEEP, redesign** · Confidence: High

**Counterargument for killing/merging it:** the Table answers every question the map does, with more precision, sortable, exportable, and without colour-vision problems. The map is decorative; choropleths of categorical legal status are a known-weak encoding; and it costs the heaviest chunks in the bundle (`map` 132 KB + `d3` 117 KB raw). A serious researcher would use the Table.

**Verdict: keep — it is the spine.** It is the only view that answers "where is this happening" pre-attentively, it is what makes the artifact legible to non-specialists, and it is the entry point every persona actually lands on. But it must fix two things: 64% of it is a grey meaning both "no AI-specific rule" and "no data" (F-10), and it ships with the legend collapsed, so the colour has no key on arrival.

1. *Unique question:* "Where in the world is AI governed, and how densely?"
2. *Finding in <60 s unaided?* Yes, but currently a **wrong** one: "most of the world has no AI governance." The Layers data proves 122 of those 123 grey countries have international participation.
3. *Cost:* highest in the bundle; moderate code surface (`WorldMap.tsx` 431 lines); low cognitive load.
4. *If deleted:* the artifact stops being a map. Not recoverable elsewhere.

### Layers — **MERGE into Geography** · Confidence: High

**Counterargument for keeping it as a top-level view — and it is a real one:** Layers is not cosmetic. Enumerating all 193 entities through both code paths, **126 fills differ** between the lenses. It rescues **122 countries** from undifferentiated grey into "international participation only" (`#C4B5FD`), which is genuinely the most under-communicated fact in the dataset — that the governance floor is near-universal even where national law is absent. Killing the tier would destroy real information. Anyone arguing "it's just a colour mode" has not measured it.

**Verdict: merge, because the information is worth keeping and the *view* is not.** The 126 differences decompose into exactly two effects:

| Effect | Countries | Assessment |
|---|---:|---|
| grey → violet "international participation only" | 122 | **Genuine gain** — belongs in the default map |
| binding/proposed → gold "has frontier-lab HQ" | 4 | **Information loss** — hides US/China/France/Canada legal status behind office locations (F-01) |

So the entire marginal value of a top-level nav slot is one tier that should be in Geography anyway, plus one tier that is actively harmful. And the merge target already exists: the **"Color by"** dropdown at [`App.tsx:651-663`](../../src/App.tsx) already offers 17 modes and already sits on the Geography map.

**What would be lost:** a discoverable name. "Layers" in the nav advertises that the map can be recoloured; a 17-option dropdown labelled "Color by" hides it. Mitigate by promoting the 3–4 most useful modes to visible segmented controls beside the dropdown, rather than burying all 17.

**Concrete merge design:**
- Fold the violet "international participation only" tier into the default `binding-law` mode — it is a real category, not a separate lens.
- Retire `lens === "layer"` and `getLayerStyle()`; the `corporate` tier is deleted (lab HQs are already shown as pins, sized and toggleable).
- Nav drops from 6 to 5. `mapMode` goes into the URL (F-05), which makes all 17 modes citable — a net *gain* in shareable views versus today's one unshareable lens.

### Workbench — **KEEP, rebuild** · Confidence: High

**Counterargument for killing it:** it duplicates the Table (both list records with source metadata), it is the largest single component in the codebase (`WorkbenchView.tsx`, 82 KB built chunk), and its 296 buttons across 5.9 screens actively damage the P3 impression. Deleting it would make the product tighter and faster and lose no data.

**Verdict: keep — the concept is the differentiator, the execution is a dashboard.** Nothing else in the landscape (OECD.AI, Stanford AI Index, IAPP tracker) offers a task-first surface over structured governance data. The seven workflow presets are exactly the right idea. But what ships is not a workbench: it is nine statistic tiles, a 13-row lab table, an exposure brief, ten corpus tiles, a changelog and an institution map, stacked, under a single `<h2>`, with no question input and no answer surface.

1. *Unique question:* "Answer a specific governance question with citable evidence." Nothing else attempts this.
2. *Finding in <60 s unaided?* **No.** A first-timer cannot state what `BINDING DUTIES 12` is 12 of. The subtext ("7 jurisdictions or hooks with source-backed binding obligation rows") counts a different noun than the headline.
3. *Cost:* largest component; heaviest cognitive load in the product; dilutes the story at the exact moment P3 is forming a judgement.
4. *If deleted:* the artifact drops from "instrument" to "atlas." Recoverable only by building it properly.

Full spec in `02-WORKBENCH-REDESIGN.md` (pass 2). Direction: **one question at a time**, chosen explicitly, answered above the fold in a sentence with its sources attached; everything else behind progressive disclosure.

### Network — **KEEP, redesign and demote** · Confidence: Medium

**Counterargument for killing it:** force-directed layouts encode nothing in position, the six edge types are currently indistinguishable (all `rgb(148,163,184)`, varying only in stroke width), only 9 of 53 nodes carry labels, and node area encodes `powerScore` — a hand-assigned constant with no published derivation (F-09). Every one of those is a reason not to trust the picture. An adjacency matrix or a simple "connected to" list in the side panel would convey the same relationships without implying spatial meaning.

**Verdict: keep, but scope it to the selected entity.** The dataset's dependency edges are real work (99 typed edges) and no other view shows them. But a global hairball is the wrong container: at 53 nodes it is *nearly* legible, which is worse than clearly illegible, because it invites reading structure into positions that carry none.

Redesign, in priority order:
1. **Encode edge type** with colour or dash pattern and publish the key. Today the README's headline claim — edges "typed as `regulates / depends_on / constrains / influences / coordinates / participates_in`" — is invisible in the only view built to show it.
2. **Scope to an ego-network** on the selected country/lab/instrument (1–2 hops), which also gives lens-switching a subject to carry (F-03) and turns Network into a *detail* view rather than a competing overview.
3. **Stop sizing by `powerScore`** until it is derived or documented. Size by degree, which is computed from the data and defensible.

Confidence is Medium rather than High because the redesign might reasonably conclude the ego-network belongs inside the side panel, deleting the view entirely — a decision better made after the Workbench rebuild clarifies where detail lives.

### Timeline — **KEEP as-is** · Confidence: High

**Counterargument for merging it into Table:** it is a sorted list with lane filters; the Table can sort by date and already has an Implementation dataset. It is a chart-shaped presentation of a query.

**Verdict: keep unchanged.** It is the only view where a first-time user extracts a real finding unaided in under 60 seconds — *"AI governance activity is heavily concentrated in 2024–2026, and the binding instruments are almost all after 2024."* That is a genuine insight, legible without instruction, from 135 milestones (README says "115+" — F-21). It is cheap (5.6 KB chunk, 226-line component) and it earns its slot.

One cleanup: it stacks two overlapping lane taxonomies, both beginning with "All" (F-20). Pick one.

### Table — **KEEP as-is** · Confidence: High

**Counterargument for demoting it:** tables are not visualisations; 14 dataset tabs with 193 rows and 214 buttons is a lot of surface for a view most casual visitors will skip.

**Verdict: keep, and promote it in the narrative.** This is where the researcher persona actually ends up and it is the strongest single piece of evidence that the underlying work is serious: 14 datasets, CSV export, source metadata per row. It is also the accessible alternative to every visualisation in the product, which is what makes the a11y story credible rather than aspirational. It is currently the *last* tab and never mentioned in the first 90 seconds.

### Embed — **KEEP as-is** · Confidence: High

**Counterargument for killing it:** it is a whole route family (`/embed/:path*`) plus a component, serving a use case nobody has asked for, on a project with no known embedders.

**Verdict: keep — it is a genuine differentiator and it is nearly free** (5 KB chunk). Shipping embeddable, source-backed governance cards is a thing OECD.AI and the IAPP tracker do not do. It is under-marketed: it appears nowhere in the first 90 seconds and barely in the README. Note that framing is an *intended* use here, which makes the absence of any frame policy in `vercel.json` a decision never made (F-18).

---

## Part 3 — Proposed navigation

**Before** — six lenses, viz-led, selection destroyed on every switch:

```
[ Workbench ] [ Geography ] [ Layers ] [ Network ] [ Timeline ] [ Table ]
      │             │           │          │           │           │
      └─────────────┴───────────┴──────────┴───────────┴───────────┘
                    selection cleared on every switch
                    mapMode not in URL · no history entries
```

**After** — five views, question-led entry, one persistent subject:

```
┌─ Start with a question ────────────────────────────────────────────┐
│  What's binding where?   Who regulates this lab?                   │
│  What changed recently?  Compare jurisdictions                     │
└────────────────────────────────────────────────────────────────────┘
        │  (presets set subject + view + colour mode, all in the URL)
        ▼
[ Map ] [ Workbench ] [ Network ] [ Timeline ] [ Table ]
   │  Color by: ▸ Binding law · Participation · Enforcement · +14
   └────────────────────────────────────────────────────────────────
         SUBJECT: 🇺🇿 Uzbekistan            [pin] [clear]
         ── persists across every view · serialised to the URL ──
```

Three changes carry this:

1. **Selection persists** across view switches, rendered as a always-visible subject chip. Each view honours it in its own way (Timeline filters to that country; Network centres its ego-network; Table scrolls to the row).
2. **`mapMode` and `showLabs` join the URL**, so all 17 colour modes become citable — a net gain over today's single unshareable Layers lens.
3. **History is pushed** on discrete navigation (view change, selection, preset), so Back means "undo" and every state is bookmarkable.

The seven existing Workbench workflow presets ([`researchPresets.ts`](../../src/data/researchPresets.ts)) already encode `lens + filters + selection` — they are the question-led entry layer, currently buried inside the view that needs the most work. Promoting them to the landing surface delivers question-led navigation without committing to answers the dataset cannot yet support.
