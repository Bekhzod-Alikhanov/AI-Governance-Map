# World-class Research Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an August 2026 release of the Global AI Governance Map that is answer-first, source-pinpointed, reproducible, accessible, and explicit about freshness and review status.

**Architecture:** A release metadata module is the single source of truth for dataset dates and versioning. Data helpers produce structured Workbench answers and release artifacts; React renders those objects without re-deriving legal claims. Deterministic Node scripts generate and verify checksummed immutable packages, while existing Vitest and Playwright suites guard research logic and interaction behavior.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Vitest 4, Playwright 1.61, Node.js 22.

**Spec:** `docs/audit/11-WORLD-CLASS-RESEARCH-RELEASE.md`

## Global Constraints

- `releaseDate`, `coverageCutoff`, and `statusAsOf` are `2026-08-17`; per-record `lastVerified` remains independent.
- `snapshotDate` is a one-cycle compatibility alias of `statusAsOf`, not a claim that every row was checked that day.
- Only official primary sources may upgrade a legal claim to `verified`; never assign `expert_reviewed` in this release.
- Preserve all existing lenses and secondary Workbench capabilities through progressive disclosure.
- Use native interactive semantics, visible focus, WCAG A/AA axe checks, and keyboard-complete controls.
- Public artifacts must be deterministic and SHA-256 verified.
- Do not touch `.claude/settings.local.json`, publish externally, push, merge, or invent a DOI.

---

### Task 1: Source-correct August data and verification model

**Files:**
- Create: `src/data/releaseMetadata.ts`
- Modify: `src/types.ts`
- Modify: `src/data/participation.ts`
- Modify: `src/data/implementationMilestones.ts`
- Modify: `src/data/labIntelligence.ts`
- Modify: `src/data/sourceDeltaMonitors.json`
- Modify: `src/utils/governanceTaxonomy.ts`
- Modify: `src/utils/researchWorkbench.ts`
- Modify: `src/utils/snapshotDate.test.ts`
- Modify: `src/utils/workbenchAnswers.test.ts`
- Modify: `scripts/check-manual-checks.mjs`
- Create: `scripts/check-manual-checks.test.mjs`

**Interfaces:**
- Produces: `RELEASE_METADATA = { releaseId, releaseDate, coverageCutoff, statusAsOf } as const`.
- Produces: `SourceLocator` and `VerificationMetadata.sourceLocator?: SourceLocator`; `SourceChainEntry.sourceLocator?: SourceLocator`.
- Produces: `WorkbenchAnswerCard` Council of Europe counts based on party set difference.
- Consumes: official sources and exact outcomes in the specification.

- [ ] **Step 1: Write failing data and audit tests**

Add assertions equivalent to:

```ts
expect(RELEASE_METADATA).toEqual({
  releaseId: "2026-08-17",
  releaseDate: "2026-08-17",
  coverageCutoff: "2026-08-17",
  statusAsOf: "2026-08-17",
});
expect(INTERNATIONAL_PARTICIPATION).toContainEqual(
  expect.objectContaining({ instrumentId: "coe-ai-convention", countryIso3: "ALB", participationType: "signed", date: "2026-06-15" })
);
expect(coe?.sentence).toContain("1 ratification and 20 signature-only rows");
expect(INCIDENT_ENFORCEMENT_RECORDS.some((row) => row.id === "garcia-v-character-ai-wrongful-death-2024")).toBe(false);
```

Add Node tests proving monitor expiries and manual-link expiries are merged, due-soon checks do not fail, and expired/undated checks fail.

- [ ] **Step 2: Run tests and verify the expected red state**

Run: `npm test -- src/utils/snapshotDate.test.ts src/utils/workbenchAnswers.test.ts && node --test scripts/check-manual-checks.test.mjs`

Expected: failure because release metadata, Albania, set-difference counting, and merged manual-check audit do not exist.

- [ ] **Step 3: Implement the release metadata and source corrections**

Create the metadata constant exactly as specified. Keep `DATA_SNAPSHOT_DATE` as a documented alias of `RELEASE_METADATA.statusAsOf`. Add Albania with a 15 June signature date and update the Treaty Office monitor to 20 signatures not followed by ratification, one ratification/accession, `reviewedAt: 2026-08-17`, and `validUntil: 2026-11-15`. Update the EU monitor with the AI Omnibus status reviewed on the same dates.

Add distinct EU milestones for the Omnibus entry into force (`2026-07-27`) and broad AI Act application (`2026-08-02`) with official Commission URLs and precise caveats about changed high-risk deadlines.

Add source locators to the three retained litigation rows. Replace Andersen’s unsupported schedule with the narrow document-380 discovery posture, update Bartz to document 437 preliminary approval, update Kadrey to document 700’s split posture, and remove Garcia with a changelog entry. Each retained row is `editorial_checked`, but none is `expert_reviewed`.

- [ ] **Step 4: Implement one manual-review expiry audit**

Refactor the script into exported pure functions so Node tests can pass fixture objects. At runtime load both JSON files, normalize manual checks to `{ id, sourceUrl, reviewedAt, validUntil }`, warn for `0 <= daysUntilExpiry <= 14`, and exit 1 only for expired or undated entries. Keep actionable messages with the exact record/monitor id and URL.

- [ ] **Step 5: Run focused and data-review tests**

Run: `npm test -- src/utils/snapshotDate.test.ts src/utils/workbenchAnswers.test.ts && node --test scripts/check-manual-checks.test.mjs && npm run audit:manual-checks && npm run audit:data-review`

Expected: all commands exit 0; the audit reports no `uncertain` litigation rows and reports the 27 August checks as due soon without claiming they were renewed.

- [ ] **Step 6: Commit**

```bash
git add docs/audit/11-WORLD-CLASS-RESEARCH-RELEASE.md docs/superpowers/plans/2026-08-17-world-class-research-release.md src/data/releaseMetadata.ts src/types.ts src/data/participation.ts src/data/implementationMilestones.ts src/data/labIntelligence.ts src/data/sourceDeltaMonitors.json src/utils/governanceTaxonomy.ts src/utils/researchWorkbench.ts src/utils/snapshotDate.test.ts src/utils/workbenchAnswers.test.ts scripts/check-manual-checks.mjs scripts/check-manual-checks.test.mjs
git commit -m "feat: publish August source corrections"
```

### Task 2: Deterministic, citable release artifacts

**Files:**
- Modify: `src/data/datasetReleases.ts`
- Modify: `src/utils/exportDataset.ts`
- Modify: `src/utils/datasetSchema.ts`
- Modify: `src/utils/datasetSchema.test.ts`
- Modify: `src/utils/exportDataset.test.ts`
- Modify: `scripts/write-public-data.mjs`
- Create: `scripts/write-release-manifest.mjs`
- Create: `scripts/write-release-manifest.test.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Create: `CITATION.cff`
- Create: `.zenodo.json`
- Create: `docs/RELEASE_2026-08.md`
- Modify: `docs/CHANGELOG.md`
- Modify: `docs/DATA_GOVERNANCE.md`
- Modify: `docs/EDITORIAL_WORKFLOW.md`

**Interfaces:**
- Consumes: `RELEASE_METADATA` and `SourceLocator` from Task 1.
- Produces: snapshot fields `releaseDate`, `coverageCutoff`, `statusAsOf`, compatibility `snapshotDate`, schema version `2026.08.0`.
- Produces: `public/data/release-manifest.json`, `public/data/releases/2026-08-17/manifest.json`, and immutable copies of `full-dataset.json`, `schema.json`, and `release-package.json`.

- [ ] **Step 1: Write failing schema/export/manifest tests**

Assert that the exported snapshot has all four date fields, schema version `2026.08.0`, accepts every verification enum including `unverified` and `superseded`, and defines `sourceLocator`. Add a Node fixture test that hashes two files, sorts paths, emits lowercase 64-character SHA-256 digests, and fails verification after one fixture changes.

- [ ] **Step 2: Run tests and verify the expected red state**

Run: `npm run validate:export && node --test scripts/write-release-manifest.test.mjs`

Expected: failure because the new metadata and manifest generator are not exported.

- [ ] **Step 3: Upgrade the public schema and release ledger**

Publish one `2026-08-17` release entry with explicit status dates, corrections, removals, unresolved manual-review items, and artifact paths. Correct the older May/June entries so planned work is not presented as a future June release in August. Extend the JSON Schema and source-metadata export with locators and review fields.

- [ ] **Step 4: Generate and verify immutable artifacts**

Implement exported `sha256File`, `buildManifest`, `writeReleaseManifest`, and `verifyManifest` functions in the Node script. The manifest shape is:

```json
{
  "releaseId": "2026-08-17",
  "algorithm": "sha256",
  "generatedFrom": "deterministic public data build",
  "files": [{ "path": "full-dataset.json", "bytes": 0, "sha256": "..." }]
}
```

The real byte count is computed. Paths are slash-normalized and sorted. Add `data:manifest` and `validate:release` scripts; make `build` generate the manifest after public data. CI runs `validate:release` after build and writes audit counts and due-review information to `$GITHUB_STEP_SUMMARY` without creating issues or publishing externally.

- [ ] **Step 5: Add citation, Zenodo, and review-governance documentation**

`CITATION.cff` cites the software and dataset release without a DOI. `.zenodo.json` contains title, description, creators, MIT license, keywords, and `upload_type: dataset`, but no `doi` field. Document two-person review meanings, source-locator rules, immutable artifact verification, and the exact human Zenodo publish step.

- [ ] **Step 6: Generate artifacts and verify**

Run: `npm run data:public && npm run data:manifest && npm run validate:release && npm run validate:export`

Expected: every command exits 0 and a second identical generation produces the same checksums for the three immutable source artifacts.

- [ ] **Step 7: Commit**

```bash
git add src/data/datasetReleases.ts src/utils/exportDataset.ts src/utils/datasetSchema.ts src/utils/datasetSchema.test.ts src/utils/exportDataset.test.ts scripts/write-public-data.mjs scripts/write-release-manifest.mjs scripts/write-release-manifest.test.mjs package.json .github/workflows/ci.yml CITATION.cff .zenodo.json docs/RELEASE_2026-08.md docs/CHANGELOG.md docs/DATA_GOVERNANCE.md docs/EDITORIAL_WORKFLOW.md public/data
git commit -m "feat: add reproducible research releases"
```

### Task 3: Answer-first Workbench

**Files:**
- Create: `src/data/workbenchQuestions.ts`
- Create: `src/utils/workbenchAnswer.ts`
- Create: `src/utils/workbenchAnswer.test.ts`
- Modify: `src/types.ts`
- Modify: `src/components/WorkbenchView.tsx`
- Create: `src/components/WorkbenchView.test.tsx`
- Modify: `src/utils/urlState.test.ts`

**Interfaces:**
- Consumes: Task 1 release metadata and verification/source-locator fields.
- Produces: `WorkbenchQuestion`, `WorkbenchAnswer`, `WorkbenchEvidenceRow`, `buildWorkbenchAnswer(questionId, filters)`, `renderWorkbenchAnswerCsv(answer)`, and `renderWorkbenchAnswerCitation(answer)`.
- Produces: default `activeQuestionId: "binding-duties-by-jurisdiction"` and `activeAnswerCardId: "binding-obligations"`.

- [ ] **Step 1: Write failing answer-model and component tests**

Test the five worked questions from the spec. Each result must contain a complete sentence, caveat, named entities, three to five evidence rows where available, official source URL, stable record URL, and status date. Test CSV quoting and a citation containing question title, release date, status date, canonical Workbench URL, and source list. Render the component and assert six featured questions, one selected button with `aria-pressed="true"`, a polite live answer region, evidence links, Cite/Export buttons, and the “Browse all questions” disclosure.

- [ ] **Step 2: Run tests and verify the expected red state**

Run: `npm test -- src/utils/workbenchAnswer.test.ts src/components/WorkbenchView.test.tsx src/utils/urlState.test.ts`

Expected: failure because structured answers, default question state, and answer controls do not exist.

- [ ] **Step 3: Build the structured question and answer layer**

Move question configuration out of the component, add categories and `featured` flags, and implement evidence derivation for the five worked questions plus a safe generic fallback. Derive names from record maps and never hard-code counts. Council of Europe evidence must deduplicate a ratified party from signature-only evidence.

- [ ] **Step 4: Restructure the Workbench above the fold**

Render the title, release metadata, six featured question buttons, and one answer surface before secondary content. The answer includes sentence, caveat, named-entity chips, three to five evidence rows, official source and stable record links, a copy-citation action, and current-answer CSV download. Use `aria-pressed` and `aria-live="polite"`.

Put all non-featured questions behind a native `<details>` labelled “Browse all questions,” with a search input and category buttons. Put workflows, all-answer-card metrics, Lab Board, Research Corpus, AI Atlas, comparison, scenario simulator, and changelog in collapsed native disclosures. Preserve their underlying content and behavior.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/utils/workbenchAnswer.test.ts src/components/WorkbenchView.test.tsx src/utils/urlState.test.ts src/utils/workbenchAnswers.test.ts`

Expected: all focused tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/data/workbenchQuestions.ts src/utils/workbenchAnswer.ts src/utils/workbenchAnswer.test.ts src/types.ts src/components/WorkbenchView.tsx src/components/WorkbenchView.test.tsx src/utils/urlState.test.ts
git commit -m "feat: make Workbench answer first"
```

### Task 4: Research navigation, freshness UI, and accessibility

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/DataActions.tsx`
- Modify: `src/components/SearchBox.tsx`
- Create: `src/components/SearchBox.test.tsx`
- Modify: `src/components/CountrySidePanel.tsx`
- Modify: `src/components/VerificationMeta.tsx`
- Modify: `src/components/VerificationMeta.test.tsx`
- Modify: `tests/e2e/a11y.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: release metadata, release ledger, `reviewStatus`, `sourceLocator`, and Task 3 default answer semantics.
- Produces: compact Workbench country context, humanized search metadata, country contents navigation, and visible freshness/review state.

- [ ] **Step 1: Write failing component and browser tests**

Component tests assert `INSTITUTIONAL_FRAMEWORK` renders as “Institutional framework,” ArrowDown/ArrowUp/Enter/Escape preserve combobox semantics, review status and source locator are visible, and the Data menu contains release date, cutoff, due-review count, changelog, and manifest links. Browser tests select a country, switch to Workbench, assert a compact context control instead of a modal dialog, reopen the full country record, exercise country contents anchors, run axe in Workbench, set a 200% equivalent viewport/zoom, and emulate forced colors.

- [ ] **Step 2: Run tests and verify the expected red state**

Run: `npm test -- src/components/SearchBox.test.tsx src/components/VerificationMeta.test.tsx && npm run test:a11y`

Expected: the new assertions fail while the existing accessibility cases remain green.

- [ ] **Step 3: Implement compact context and research navigation**

When `lens === "workbench"` and a country is selected, do not mount the modal country drawer. Render a compact labelled context bar with country name, ISO3, “Open country record,” and clear action. Preserve `selectedIso3` and restore the full drawer on geography.

Humanize underscore enums with sentence case, widen the result popover on desktop, add explicit kind and jurisdiction lines, and keep stable option ids and active-descendant behavior. Add sticky status metadata and a contents nav to the drawer; wrap the long corpus, labs, national rules, subnational rules, connections, and international participation groups in accessible native disclosures with stable section ids.

- [ ] **Step 4: Surface freshness, review, and pinpoint citations**

Show release date, coverage cutoff, due-review count, changelog link, and manifest link in the Data menu. Extend verification metadata to show review-status badges, review notes, and a formatted source locator; never render “expert reviewed” unless that literal status is present.

- [ ] **Step 5: Run full verification**

Run: `npm test && npm run validate:data && npm run validate:export && npm run audit:manual-checks && npm run audit:sources -- --fail-on-metadata-warnings && npm run lint && npm run typecheck && npm run build && npm run validate:release && npm run test:e2e && npm run test:a11y && npm run check:performance`

Expected: every command exits 0; Playwright covers Workbench in desktop and mobile projects with no axe A/AA violations.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/DataActions.tsx src/components/SearchBox.tsx src/components/SearchBox.test.tsx src/components/CountrySidePanel.tsx src/components/VerificationMeta.tsx src/components/VerificationMeta.test.tsx tests/e2e/a11y.spec.ts tests/e2e/smoke.spec.ts
git commit -m "feat: improve research navigation and trust cues"
```

### Task 5: Whole-release integration closure

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `scripts/check-manual-checks.mjs`
- Modify: `scripts/check-manual-checks.test.mjs`
- Modify: `src/data/datasetCoverageStats.ts`
- Regenerate: `src/data/countryMapSummaries.ts`
- Modify: `src/components/WorkbenchView.tsx`
- Modify: `src/components/WorkbenchView.test.tsx`
- Modify: `docs/superpowers/plans/2026-08-17-world-class-research-release.md`

**Interfaces:**
- Produces one `npm test` command that runs Vitest suites and the two Node-native suites without double collection.
- Reconciles generated counts with the August source data and closes deferred review minors.

- [x] **Step 1: Capture the existing full-suite failures**

Run `npm test` and confirm the two Node-native files are mis-collected plus Albania count drift.

- [x] **Step 2: Separate and retain Node-native test execution**

Exclude only `scripts/check-manual-checks.test.mjs` and `scripts/write-release-manifest.test.mjs` from Vitest, add `test:node` for those exact files, and make `npm test` run both Vitest and `test:node`.

- [x] **Step 3: Regenerate August-derived counts**

Run the existing country-map-summary generator and update `internationalParticipationRows` to the derived total. Do not hand-edit generated country summaries.

- [x] **Step 4: Close deferred review minors**

Reject calendar-impossible expiry dates by UTC round-trip validation with a Node regression. Render featured questions only once as pressed controls by excluding them from the closed all-questions list, with a component regression that asserts exactly one pressed control.

- [x] **Step 5: Run full verification and commit**

Run `npm test`, lint, typecheck, data validation, export validation, manual audit, manifest validation, and focused Workbench tests. Commit with message `test: close August release integration gaps`.
