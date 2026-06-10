# Research Corpus Roadmap Ledger

Dataset snapshot: 2026-05-19

This ledger tracks the research-corpus expansion so new work does not duplicate existing infrastructure. Corpus records are context/evidence records unless a separate verified legal record establishes binding legal effect.

| Category | Status | Notes |
| --- | --- | --- |
| AI offices and safety institutes | partial | Starter rows added for the EU AI Office, NIST CAISI, UK AISI, CEN-CENELEC JTC 21, FTC, Canada TBS, and the CoE Treaty Office. More official national authorities can be added over time. |
| Policy processes and open windows | partial | Starter rows added for EU high-risk guideline feedback, EU GPAI implementation tools, CEN-CENELEC AI Act standards work, and UK AISI monitoring. |
| Standards and conformity infrastructure | partial | Starter rows added for CEN-CENELEC AI Act work, ISO/IEC 42001, NIST AI RMF context, and NIST GenAI Profile context. |
| Public-sector AI registries and procurement | partial | Starter rows added for U.S. federal AI use-case inventories and Canada AIA. Public procurement and additional registries remain editorial expansion. |
| Enforcement and litigation depth | partial | Existing FTC Operation AI Comply row now includes procedural metadata. More official regulator/court records remain editorial expansion. |
| Stable corpus routes | done | Routes are supported for `/institution/:id`, `/policy-process/:id`, `/standard/:id`, `/public-sector-ai/:id`, and `/enforcement/:id`. |
| Workbench corpus explorer | done | Research Corpus section added inside Workbench with facets, answer cards, context-map shortcuts, source links, dossiers, correction links, and CSV export. |
| Corpus evidence dossiers | done | Evidence dossiers now support country, lab, instrument, and corpus record types. |
| Policy brief workflow | done | Static Markdown/copy/download/print policy briefs added for country, lab-by-market, institution, deadline-watch, enforcement-watch, and standards/conformity workflows. |
| Public corpus endpoints | done | Public JSON endpoints added for institutions, policy processes, standards/conformity, public-sector AI, enforcement/litigation, corpus index, and policy brief index. |
| Context map modes | done | Context-only map modes added for AI institutions, policy windows, public-sector AI, enforcement activity, and standards/conformity. |
| Editorial release infrastructure | partial | Release package includes corpus coverage. Monthly release notes and broader source-delta monitors remain continuing operations. |
| AI assistant | deferred | Do not add until retrieval/citation guardrails are explicitly designed and tested. |

## Next Editorial Expansion

- Add official-source national AI Act authority appointments as they become available.
- Expand public-sector AI registry coverage beyond the U.S. and Canada.
- Add procurement-specific AI guidance only where the source is official and clearly AI-specific.
- Add enforcement/litigation rows only from official regulator releases, court/docket records, or issuer-controlled legal records.
- Keep standards, process, public-sector, safety, procurement, and enforcement context separate from binding-law coloring.
