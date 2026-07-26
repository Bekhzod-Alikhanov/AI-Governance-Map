# 06 — Roadmap

Written 26 July 2026, after four remediation tiers closed 21 of 23 findings. This covers what is left.

## Done (not a bucket — context for what follows)

F-01 · F-02 · F-03 · F-05 · F-06 · F-07 · F-08 · F-09 · F-10 · F-11 · F-12 · F-13 · F-14 · F-15 · F-16 · F-17 · F-18 · F-19 · F-20 · F-21 · F-22, plus the Layers merge from [04-VIEW-PORTFOLIO](04-VIEW-PORTFOLIO.md). Detail in [08-REMEDIATION-LOG](08-REMEDIATION-LOG.md).

---

## Now (≤ 1 day)

### N1 — Merge the branch and verify the deploy
**Why first:** every fix so far is invisible. Production still serves the favicon-SVG link preview, no `robots.txt`, the old map colours.
**Acceptance:** PR [#41](https://github.com/Bekhzod-Alikhanov/AI-Governance-Map/pull/41) merged; `curl -I https://global-ai-governance-map.vercel.app` returns the four new security headers; `/robots.txt` and `/sitemap.xml` return 200; a LinkedIn/X link preview renders the 1200×630 card; the map shows no grey countries.

### N2 — Verify the CSP against the real deployment
**Why:** `vercel.json` headers cannot be exercised locally, so the CSP is the one change shipped unverified. A too-strict `script-src` would white-screen the site.
**Acceptance:** on the Vercel preview URL, the app renders, the console has no CSP violations, and `/embed/country/USA` still loads inside an `<iframe>` on a third-party origin.

### N3 — Triage the 24 anti-bot-walled sources
**Why:** the content-aware link checker (F-11) surfaced 24 official sources — ISO, MOFA ×2, Council of the EU, OECD iLibrary and others — that return a wall rather than the document. They were reported healthy for as long as the checker existed.
**Acceptance:** each of the 24 either resolves in a browser and gets a `sourceLinkManualChecks.json` entry with an `expiresOn` date, or is replaced with a reachable official mirror, or is marked `superseded`. `npm run audit:source-links` warnings drop to the residual set.
**Note:** this is human verification work. It cannot be automated, and it should not be faked.

---

## Next (≈ 1 week)

### X1 — Answer surface for each Workbench question
The restructure put the question first ([02-WORKBENCH-REDESIGN](02-WORKBENCH-REDESIGN.md)); what renders beneath is still the existing answer-card tiles. Section 10 of that spec lists five worked examples with the sentence each should produce — e.g. *"1 ratification and 20 signature-only rows. The convention is not yet in force."*
**Acceptance:** selecting any of the eight questions renders a one-sentence answer with its number and caveat inline, above the evidence rows; no tile shows a bare integer.

### X2 — Per-record link previews
`/country/UZB` and 542 other routes still share one OG card. The sitemap already enumerates them.
**Acceptance:** a build-time step emits per-route `<title>`, `og:title`, `og:description`; sharing two different record URLs produces two different previews. Prefer a post-build HTML rewrite over adopting a framework — the zero-infrastructure constraint holds.

### X3 — `powerScore`: derive, document, or drop
The Network no longer sizes by it (F-09), but it still drives **map pin size** and appears in evidence dossiers as `N/5`. It remains a hand-assigned constant.
**Acceptance:** either a published rubric in the Methodology panel naming its inputs, or the field is removed from all visual encodings and kept only as a documented editorial sort key.

---

## Later (≈ 1 month)

### L1 — Ego-network in the side panel
[04-VIEW-PORTFOLIO](04-VIEW-PORTFOLIO.md) rated Network `KEEP but redesign` at **Medium** confidence, with the open question of whether a 1–2 hop ego-network belongs in the country/lab panel instead of a top-level view. Build it in the panel first; if it satisfies the "who is connected to whom" question there, delete the global graph and reclaim a nav slot plus the `d3-force` chunk.

### L2 — Consolidate the shareable state
`App.tsx` still owns ~20 `useState` hooks (F-23). Both F-02 and F-05 were symptoms: no single place knew what "the current view" was, so things got forgotten when serialising. One reducer whose output *is* the URL would prevent the next instance.

### L3 — An honest staleness treatment
`DATA_SNAPSHOT_DATE` is now correct and test-enforced, but nothing tells a reader a record is ageing. Surface per-record age in panels and dossiers, and make CI fail on expired manual-verification overrides — the mechanism that would have caught the CoE lapse.

### L4 — Decide the maintenance claim
Open question Q3 in [07-OPEN-QUESTIONS](07-OPEN-QUESTIONS.md), and **the only item on this roadmap that is not mine to decide**: is this a maintained corpus or an archived snapshot? Either is defensible; the ambiguity is not. A governance dataset that looks live but is two months stale is more dangerous to a reader than one plainly labelled archived.

---

## Never / explicitly deferred

**Migrating to Next.js, Astro, or any SSR framework.** X2 gets the sharing benefit with a post-build script. The current stack is not the binding constraint on anything in this audit, and a framework migration would cost weeks and a permanent maintenance burden for a solo maintainer.

**Making `verificationStatus` required and backfilling it.** The vocabulary now supports a negative (F-15), and measured coverage is 100%. Bulk-reassigning statuses would mean asserting verification nobody performed — the exact failure this dataset is built to avoid.

**A visual-regression suite beyond the two baselines.** The tightened tolerances (F-22) already caught two real regressions during this work. More baselines on a single-maintainer project buys brittleness, not safety.

**Rebuilding the Table view.** It is the strongest evidence of rigour in the artifact and nobody has complained about it. Leave it alone.

**An adjacency matrix or Sankey as an additional Network view.** [04](04-VIEW-PORTFOLIO.md) raised these as alternatives, not additions. Edge type is now visible (F-09); adding a second relationship visualisation would repeat the mistake Layers made — a new top-level surface for a marginal gain.

**Chasing the remaining three `npm audit` advisories.** All one chain into `eslint-plugin-jsx-a11y`; the only fix downgrades the accessibility linter six minor versions. Revisit when upstream publishes a compatible `minimatch`.
