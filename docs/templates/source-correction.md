# Source Or Status Correction

Use this template for corrections to source URLs, legal status, participation status, dates, or caveats.

## Existing Record

- Record ID:
- Record name:
- Current source URL:
- Current claim:
- Current legal or participation status:

## Proposed Correction

- Corrected source URL:
- Corrected claim:
- Corrected legal or participation status:
- Corrected date:
- Last verified:

## Evidence

- What does the official source directly confirm?
- What does it leave uncertain?
- Should the record be marked `verified`, `likely_correct`, `uncertain`, or `needs_external_check`?
- Should confidence be `high`, `medium`, or `low`?
- What `verificationNotes` should be shown?

## Validation

Run:

```bash
npm run audit:sources
npm run audit:data-review
npm run validate:data
```
