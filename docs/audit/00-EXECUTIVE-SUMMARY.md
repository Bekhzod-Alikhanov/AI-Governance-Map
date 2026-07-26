# 00 — Executive Summary

**Audit date:** 25 July 2026 · **Commit:** `97dc53c` · **Pass 1 of 2** (structural)
Full detail in [01-FINDINGS](01-FINDINGS.md). Scope and method in [README](README.md).

---

## The one structural problem

> **Nothing in this product carries a subject.** Every lens answers a question about the whole world at once, the selected country or lab is deliberately destroyed on every lens switch, and the browser's Back button exits the site — so a visitor who arrives with a specific question has to re-ask it in each view, and most views cannot hear it.

The README sells "six lenses on the same data." The code disagrees at [`App.tsx:359-368`](../../src/App.tsx), where changing lens explicitly nulls `selectedIso3`, `selectedLabId` and `networkSelection`. The lenses share filters but never a subject. That single decision is why the product reads as six adjacent applications rather than one instrument, and it is upstream of most of what follows: the Workbench became a 5.9-screen dashboard because it had to be self-sufficient; the map's 17 colour modes are unshareable because no layer owns "the current view"; Back does nothing because nothing is ever pushed.

**The fix is not a redesign.** It is: preserve selection across lenses, push history on discrete navigation, and put `mapMode` in the URL. Those three changes are perhaps 60 lines and they convert six views into one instrument.

**Navigation model — viz-led vs question-led: keep viz-led, fix the subject.** The argument for question-led nav ("Who governs whom?", "What's binding where?") is strong: it matches how the four personas actually arrive, and the Workbench already gestures at it with seven workflow presets. But the counter is stronger here — question-led navigation demands that every question have a genuinely good answer surface, and this dataset cannot yet honour that promise for questions like "what should my country copy?" A question-led shell over thin answers is a worse lie than a viz-led shell over honest views. Adopt question-led *entry* (the presets, promoted to the landing surface) over a viz-led *switcher* that retains selection. Full argument in [04-VIEW-PORTFOLIO](04-VIEW-PORTFOLIO.md).

---

## Top 10 findings, ranked by (impact × confidence) ÷ effort

| # | ID | Finding | Sev | Effort |
|---|---|---|---|---|
| 1 | [F-01](01-FINDINGS.md#f-01--track-bd--defect--confidence-high--effort-s) | Layers ranks "hosts a lab office" above "has binding AI law" — the US, China, France and Canada render as *corporate*, hiding their legal status | S1 | S |
| 2 | [F-03](01-FINDINGS.md#f-03--track-a--defect--confidence-high--effort-s) | Switching lens destroys the selection; "six lenses on the same data" is false in code | S1 | S |
| 3 | [F-06](01-FINDINGS.md#f-06--track-estrategic--defect--confidence-high--effort-m) | All 762 records share one link preview, and the OG image is an SVG no platform renders. No robots.txt, no sitemap | S2 | M |
| 4 | [F-05](01-FINDINGS.md#f-05--track-ab--defect--confidence-high--effort-s) | The map's 17 colour modes — the richest thing in the product — are not in the URL and cannot be cited | S2 | S |
| 5 | [F-04](01-FINDINGS.md#f-04--track-d--defect--confidence-high--effort-s) | The validator emits 378 warnings every run; 371 say the data postdates its own published snapshot date. Nothing fails | S1 | S |
| 6 | [F-10](01-FINDINGS.md#f-10--track-ad--defect--confidence-high--effort-s) | 64% of the default map is a grey meaning both "no rule" and "no data", and the legend ships collapsed | S2 | S |
| 7 | [F-02](01-FINDINGS.md#f-02--track-ae--defect--confidence-high--effort-m) | `replaceState` only — Back exits the site, and the written `popstate` handler is dead code | S1 | M |
| 8 | [F-12](01-FINDINGS.md#f-12--track-e--defect--confidence-high--effort-s) | Published performance table is stale; the "strict" total-JS budget was quietly raised 50 KB | S2 | S |
| 9 | [F-09](01-FINDINGS.md#f-09--track-cd--defect--confidence-high--effort-m) | Network's 6 edge types are all the same grey line; node size encodes a hand-assigned `powerScore` with no methodology | S2 | M |
| 10 | [F-11](01-FINDINGS.md#f-11--track-d--risk--confidence-high--effort-s) | A Cloudflare "you have been blocked" page returns HTTP 200 and passes the link checker — on the dataset's only binding treaty | S2 | S |

Ranks 1, 2, 4, 5, 6 and 8 are all **S-effort**. Six of the ten highest-value findings are small, local changes.

---

## Keep / kill / merge verdicts

Reasoning, counterarguments and confidence per view in [04-VIEW-PORTFOLIO](04-VIEW-PORTFOLIO.md).

| View | Verdict | One-line reason |
|---|---|---|
| **Geography** | **KEEP, redesign** | The product's spine. Fix the grey ambiguity (F-10) and open the legend. |
| **Layers** | **MERGE into Geography** | It is a colour mode, not a view — and 118 of its 126 differences from Geography are one tier ("international participation only") that belongs in the default map. |
| **Workbench** | **KEEP, rebuild** | The right idea, executed as a dashboard: 296 buttons, 5.9 screens, one `<h2>`, no question input. Spec in pass 2. |
| **Network** | **KEEP, redesign — demote** | Answers "who is connected to whom" uniquely, but currently cannot show edge *type* at all. Scope it to an ego-network on the selected entity. |
| **Timeline** | **KEEP as-is** | The one view that works unaided: 135 milestones, legible in seconds. Merge its duplicated filter rows (F-20). |
| **Table** | **KEEP as-is** | 14 datasets, CSV export, honest. The researcher's actual destination and the strongest evidence of rigour. |
| **Embed** | **KEEP as-is** | Real differentiator; genuinely unusual for a portfolio artifact. Under-marketed. |

Net: **nothing gets killed, one thing gets merged.** The nav goes from six lenses to five, and the merged Layers becomes a colour-mode control that is already built ([`App.tsx:651-663`](../../src/App.tsx)) and already has 17 options.

---

## Data verdict, in brief

Full detail in [05-DATA-MODEL-REVIEW](05-DATA-MODEL-REVIEW.md).

- **Source spot-check, 15 records:** 12/15 resolve; **9/15 verified by content**; 3 blocked by anti-bot (ISO, MOFA, CoE Treaty Office) and *not* covered by the project's own manual-check list; 1 false pass (HTTP 200 serving a block page); 1 inconclusive. The records that verified, verified well — California SB 53 resolves to the chaptered TFAIA text, the EU AI Act to 1.5 MB of EUR-Lex, Japan's AI Act to the official translation.
- **`powerScore`: drop it or derive it.** It is a hand-assigned 1–5 constant driving node area and pin size, defended nowhere. Shipping it as the most salient visual encoding in the Network view is the least defensible thing in the artifact.
- **Staleness:** the snapshot badge says 19 May 2026; every `lastVerified` in the corpus is later, through 19 June; today is 25 July. The manual CoE verification override expired 5 July and nothing noticed.
- **Verification vocabulary is optimistic by construction** — the worst thing `VerificationStatus` can express is "someone should check this," and 89% of sourced records carry no status at all.

---

## What I'd do if I had one day

Ordered by effect on a stranger who opens the link for 90 seconds.

1. **Make the link shareable (≈2 hours).** Render a 1200×630 PNG OG image showing the actual map, switch `twitter:card` to `summary_large_image`, add `robots.txt` and a generated `sitemap.xml`. Right now a pasted link previews as a bare title with no image — this is the *first* thing every reviewer sees, and it currently says "unfinished."
2. **Fix the map's first impression (≈3 hours).** Open the legend by default; invert the Layers precedence so binding law outranks lab HQ (F-01); split "no AI-specific rule" from "no data" so the default map stops showing two-thirds of the world as blank. The map is the product's face and it currently mislabels the United States.
3. **Make selection survive (≈2 hours).** Stop nulling `selectedIso3` on lens change; add `mapMode` to the URL; push history on lens and selection changes. This converts six apps into one instrument and makes every view citable.

Everything else — the Workbench rebuild, the Network redesign, the verification-vocabulary work — is worth doing and none of it changes the 90-second read.

---

## The honest one-liner

**A serious research instrument wearing a competent portfolio demo's clothes, undersold by its own front door.**

The dataset work is real: 762 sourced records, a five-command audit pipeline, editorial notes that argue against their own records, and a corpus tile that volunteers "159 countries have no institution data." That is researcher behaviour, not portfolio behaviour. But the artifact presents itself through a map that colours the US by its office leases, six views that forget what you were looking at, and a shared link with no preview image — so the first 90 seconds systematically undersell the next 90 minutes. It is not over-engineered; it is under-narrated. The gap between what it contains and what it communicates is the whole finding.
