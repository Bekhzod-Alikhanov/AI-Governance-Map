# Lab Or Infrastructure Update

Use this template before editing `src/data/frontierLabs.ts`, `src/data/infrastructure.ts`, or `src/data/dependencies.ts`.

## Actor Or Infrastructure Node

- Proposed record ID:
- Display name:
- Category: frontier lab / safety framework / chips / cloud / export control / dependency edge
- Jurisdiction or HQ country:
- Why it is frontier-AI relevant:

## Source

- Official source name:
- Official source URL:
- Source confirms:
- Source does not confirm:
- Last verified:

## Caveats

- Does this describe corporate policy, government policy, technical capacity, or legal constraint?
- Could a user confuse HQ location with full regulatory control?
- Is the power score sourced and explainable?
- Does the dependency edge overstate causality?

## Validation

Run:

```bash
npm run validate:data
npm run audit:sources
npm run audit:data-review
npm test
```
