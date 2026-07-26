# 02 — Workbench redesign

Spec for F-08. Written against `WorkbenchView.tsx` at 1,660 lines / 296 buttons / 283 links / 5.9 screens / one `<h2>`.

## 1. What it is for

**Purpose, one sentence:** *Answer one named AI-governance question at a time, above the fold, with the sources attached.*

**Primary user task:** pick a question → read the answer → follow the evidence.

That is what the heading already promises — "Answer concrete AI-governance questions" — and what the code does not deliver.

## 2. The gap

What the code intends, reconstructed: `TOP_RESEARCH_QUESTIONS` ([`WorkbenchView.tsx:143`](../../src/components/WorkbenchView.tsx)) holds eight real questions, each carrying a `FilterState` patch, comparison items, an optional scenario and an `answerCardId`. That is a question-answering engine.

What a first-time user sees instead: seven workflow presets, nine unlabelled statistic tiles, a 13-row lab table, an exposure brief, ten corpus tiles, a changelog, an institution map and a policy-window list — **all expanded, all at once**, under a single heading.

**The gap:** the question layer exists in the data and is buried in the middle of a dashboard. Nothing tells the user "this view answers questions"; it reads as "this view shows everything."

Two specific harms:
- `BINDING DUTIES 12` is a number with no question attached. Its own subtext counts a different noun ("7 jurisdictions or hooks"), so the headline cannot be read aloud as a fact.
- Small counts (`EVALUATION EVIDENCE 2`, `OPEN CONSULTATIONS 1`) are honest but, presented as a wall of tiles, read as thinness rather than precision.

## 3. Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ RESEARCH WORKBENCH · SNAPSHOT 2026-06-19          [Methodology]    │
│                                                                    │
│ h2  Answer concrete AI-governance questions                        │
│                                                                    │
│ ┌─ Pick a question ────────────────────────────────────────────┐   │
│ │ (•) Which countries have binding AI duties?                  │   │
│ │ ( ) Who requires incident reporting?                         │   │
│ │ ( ) CoE signed vs ratified?          ( ) EU Act vs national?  │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ ┌─ ANSWER ─────────────────────────────────────────────────────┐   │
│ │ h3  12 source-backed binding obligation rows across 7        │   │
│ │     jurisdictions.                                           │   │
│ │                                                              │   │
│ │     Signature is not ratification; EU applicability is not   │   │
│ │     national enactment.                                      │   │
│ │                                                              │   │
│ │     [EU] [China] [South Korea]        [Export CSV] [Cite]    │   │
│ │     └─ evidence rows, each with its official source link     │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ ▸ Frontier lab intelligence board            (collapsed)           │
│ ▸ Research corpus                            (collapsed)           │
│ ▸ AI Atlas comparison                        (collapsed)           │
│ ▸ Scenario simulator                         (collapsed)           │
│ ▸ Changelog                                  (collapsed)           │
└────────────────────────────────────────────────────────────────────┘
```

**Above the fold:** the question list and the answer. Nothing else.

## 4. Controls

| Control | Behaviour | State |
|---|---|---|
| Question selector | Sets filters, comparison items, scenario, answer card in one action | `wbQuestion` in URL |
| Answer card | Read-only; the sentence, the number, the caveat | derived |
| Evidence rows | Each links to its official source and its record route | derived |
| Export CSV / Cite | Acts on the **current answer**, not the whole dataset | — |
| Section disclosures | `<details>`, collapsed by default, state remembered per session | — |

## 5. Default state

Question 1 selected (`binding-duties-by-jurisdiction`), its answer rendered, all five secondary sections collapsed. A visitor who does nothing still sees a complete answer to a real question — which is the difference between a workbench and a dashboard.

## 6. Progressive disclosure

Five sections become `<details>` elements: Lab Board, Research Corpus, AI Atlas, Scenario Simulator, Changelog. Each keeps its current content unchanged. Collapsed, they contribute a heading each instead of ~250 controls.

Expected effect: **296 buttons → roughly 40 visible**, 5.9 screens → roughly 1.5.

## 7. Headings

One `<h2>` for the view, one `<h3>` per section, `<h4>` inside answers. Currently 1 `<h2>` and 11 `<h3>` with no nesting logic, so heading navigation is useless. This is the cheapest accessibility win in the file.

## 8. Microcopy

- Answer headline states the fact, not the metric: *"12 source-backed binding obligation rows across 7 jurisdictions"* — not `BINDING DUTIES / 12`.
- Every answer carries its caveat inline. The CoE answer must say *"signature is not ratification"* where the number is, not in a footnote.
- Section summaries say what is inside and how much: *"Frontier lab intelligence board — 13 labs"*.

## 9. Empty / loading / error

- **Empty:** *"No rows match this question in the 19 June 2026 snapshot. This is an editorial gap, not a claim that nothing exists."* Never render a bare `0`.
- **Loading:** the view is lazy-loaded; keep the existing `LensFallback`.
- **Error:** if a lazy corpus import fails, the section shows *"Could not load corpus records"* and the answer above stays intact.

## 10. Worked examples

| # | Question | Interaction | Readable answer |
|---|---|---|---|
| 1 | *Which countries have binding AI duties?* | Default selection | "12 source-backed binding obligation rows across 7 jurisdictions." EU, China, South Korea pinned; each row links to EUR-Lex, CAC, MSIT. |
| 2 | *Who requires incident reporting?* | One click | "Incident-reporting duties appear in 2 tracked rules." Rows: California SB 53 (chaptered TFAIA), EU AI Act Art. 73. |
| 3 | *CoE signed vs ratified?* | One click | "1 ratification and 20 signature-only rows. The convention is not yet in force." Links to the CoE Treaty Office. |
| 4 | *Who actually regulates OpenAI?* | One click | "1 binding hook, 3 conditional, 2 voluntary, 2 infrastructure." The single binding hook is the EU AI Act — the most interesting fact in the dataset, currently five clicks deep. |
| 5 | *EU AI Act vs national enactment?* | One click | "The Act applies in 27 member states; 3 have tracked national implementation activity." Distinguishes applicability from enactment. |

## 11. Scope of the build

**In:** question selector promoted to the top; one answer surface; five sections collapsed behind `<details>`; heading hierarchy; empty-state copy.

**Out:** rewriting the data helpers in `researchWorkbench.ts` (they are sound), changing any dataset, and the scenario simulator's model. This is a restructure of what renders and when — not a reimplementation.

**Deliberately kept:** every existing capability. Nothing is deleted; the heavy sections move one click away.
