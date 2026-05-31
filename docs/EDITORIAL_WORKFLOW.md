# Editorial Workflow

This project is a static research dashboard. Data changes happen through pull requests against `src/data/*`, not through a backend CMS. The goal of this workflow is to make source-backed edits predictable enough for researchers, journalists, and policy reviewers to audit.

## When To Open A Data PR

Open a data PR when you are:

- Adding a national AI-specific rule, proposal, guidance document, or institutional framework.
- Adding an international AI instrument, standard, summit output, or participation list.
- Correcting a source URL, legal status, participation status, date, or caveat.
- Adding or revising a frontier lab, safety framework, infrastructure node, or dependency edge.
- Updating verification metadata after a source review.

Do not add generic privacy, cybersecurity, semiconductor, export-control, or digital-strategy material unless the official source is explicitly AI-specific and the caveat is clear.

## Review Flow

1. Pick the closest template in `docs/templates/`.
2. Verify the claim against an official source where possible.
3. Add or update the record in `src/data/*`.
4. Include verification metadata:
   - `sourceKind`
   - `verificationStatus`
   - `confidence`
   - `lastVerified`
   - `verificationNotes` when the status is uncertain, low-confidence, indirect, or easy to misread.
5. Run the data review commands:

```bash
npm run validate:data
npm run validate:export
npm run audit:sources
npm run audit:data-review
npm run audit:deltas
```

6. If you changed UI behavior or exports, also run:

```bash
npm test
npm run build
npm run test:e2e
```

## Legal-Status Rules

- `binding` means the app has a direct official source for an enforceable AI-specific law, regulation, or treaty effect. For EU member states, this can include EU AI Act applicability, but the UI must not imply separate national enactment.
- `proposed` means not adopted or not in force. Do not color it as binding.
- `guidance`, `strategy`, `framework`, `standard`, and `code` are non-binding unless a separate official legal source says otherwise.
- `signed` is not `ratified`.
- `covered_by_membership` is indirect coverage, not an explicit country endorsement.
- ISO/IEC and CEN-CENELEC records are standardization infrastructure, not national law by themselves.
- Company commitments and lab safety frameworks are actor commitments, not state law.

## Verification Metadata Policy

Use `verified` only when the cited official source directly supports the displayed claim. Use `likely_correct` when the source is official but the claim requires limited interpretation. Use `uncertain` or `needs_external_check` when the source is incomplete, generic, indirect, blocked, or not yet checked against a primary legal record.

Records with `uncertain`, `needs_external_check`, or `low` confidence must include `verificationNotes`. The notes should explain the uncertainty, not argue around it.

## Source Freshness

The automated data-review report flags:

- Records older than 90 days for refresh planning.
- Records older than 180 days for priority refresh.
- Uncertain or low-confidence records.
- Strong legal-effect claims that are not marked verified.
- Strong legal-effect claims that rely on non-official sources.
- Automated link-check failures when `--check-links` is used.
- High-impact official sources whose observed status no longer matches the current snapshot claim when `npm run audit:deltas` is used.

Automated link checks are editorial aids. Some official sites block scripts even when a browser works. Do not downgrade a legal/source claim solely because an automated link check timed out.

If a source is manually verified but repeatedly fails scripted link checks, add a narrowly scoped entry to `src/data/sourceLinkManualChecks.json` with the record id, URL, manual status, check date, and reason. These exceptions keep CI and the source-audit report honest: they are visible in the audit output, but they do not create public warning badges or weaken the underlying source metadata.

If most source URLs fail at once with network or timeout errors, treat the link audit as inconclusive for that runtime and rerun it from CI or another unrestricted network.

The source-delta monitor is also audit-only. It covers a short list of high-impact official sources such as the Council of Europe Treaty Office, EUR-Lex, OECD, UN, UNESCO, and NIST. A `changed` result means a human should review the record; a `needs_manual_review` result often means the official site blocked automation or served a JavaScript shell. Neither status changes the public dataset by itself.

## Pull Request Checklist

- The source is official, or the record explains why a secondary source is only a lead.
- The displayed legal effect matches the source.
- Dates use `YYYY-MM-DD` when known.
- The record distinguishes adoption, signature, ratification, in-force status, membership, and applicability.
- Any indirect membership or standardization caveat is visible in `notes` or `verificationNotes`.
- The change does not make uncertain records drive strong binding-law map coloring.
- `npm run validate:data`, `npm run validate:export`, `npm run audit:sources`, `npm run audit:data-review`, and `npm run audit:deltas` have been run.

## Future CMS Decision Point

A full CMS may be useful later if non-engineer contributors need browser-based editing, role-based review, or scheduled source refreshes. Until then, this repo-native workflow keeps the public app static, cheap to host, reviewable in Git, and easy to validate in CI.
