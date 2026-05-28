# New International Instrument

Use this template before editing `src/data/internationalInstruments.ts` or `src/data/participation.ts`.

## Instrument

- Proposed record ID:
- Display name:
- Issuer:
- Organization type:
- Instrument type:
- Binding status:
- Date:
- Frontier-AI relevance:

## Official Source

- Source name:
- Source URL:
- Source confirms:
- Source does not confirm:
- Last verified:

## Participation

- Participation type: `signed` / `ratified` / `endorsed` / `adopted` / `adherent` / `member` / `participant` / `applicable_via_eu` / `covered_by_membership`
- Canonical participant roster source:
- Countries included:
- Countries excluded or uncertain:
- Does participation come from direct sign-on, membership, EU applicability, or indirect coverage?

## Caveats

- Does this create binding obligations, political guidance, voluntary commitments, or technical standards?
- Could a user confuse this with national law?
- Does the record need `verificationNotes`?
- Should it affect country coloring, or only appear in drawers/network/timeline/table?

## Validation

Run:

```bash
npm run validate:data
npm run validate:export
npm run audit:sources
npm run audit:data-review
```
