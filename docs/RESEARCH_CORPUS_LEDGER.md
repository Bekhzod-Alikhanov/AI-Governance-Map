# Research Corpus Roadmap Ledger

Dataset snapshot: 2026-05-19

This ledger tracks the research-corpus expansion so new work does not duplicate existing infrastructure. Corpus records are context/evidence records unless a separate verified legal record establishes binding legal effect.

| Category | Status | Notes |
| --- | --- | --- |
| AI offices and safety institutes | partial | Starter rows now include the EU AI Office, European AI Board, AI Act Service Desk, NIST CAISI, UK AISI, Canada CAISI, Japan AISI, Singapore AISI, CEN-CENELEC JTC 21, FTC, Canada TBS, CoE Treaty Office, and selected pending EU AI Act single points of contact. More official national authorities and regulator-power matrices remain editorial expansion. |
| Policy processes and open windows | partial | Starter rows now include EU high-risk guideline feedback, Article 50 transparency feedback, Irish/UK/EU parliamentary processes, EU GPAI implementation tools, AI Board coordination monitoring, CEN-CENELEC AI Act standards work, and UK AISI monitoring. More open consultations, hearings, draft guidance, and treaty-update windows remain editorial expansion. |
| Standards and conformity infrastructure | partial | Starter rows now include CEN-CENELEC AI Act work, ISO/IEC 42001, ISO/IEC 23894, ISO/IEC 42005, NIST AI RMF context, NIST GenAI Profile context, NIST AI RMF Playbook, AI Act notified-body infrastructure, and AI Act Article 43 conformity-assessment routes. More conformity-assessment and certification/assurance infrastructure remains editorial expansion. |
| Public-sector AI registries and procurement | partial | Starter rows now include U.S. federal AI use-case inventories, Canada AIA, EU high-risk AI database context, Netherlands algorithm register, UK Algorithmic Transparency Recording Standard, U.S. OMB AI acquisition guidance, UK AI procurement guidelines, and New Zealand Algorithm Charter. Additional national registers, procurement rules, and public AI inventories remain editorial expansion. |
| Enforcement and litigation depth | partial | Official-source rows now include FTC Operation AI Comply, FTC Rytr, FTC Rite Aid, SEC AI-washing settlements, FTC DoNotPay, Dutch DPA Clearview AI, and Korean PIPC DeepSeek status examination. More official regulator/court/docket records remain editorial expansion; media-only allegations stay excluded. |
| Stable corpus routes | done | Routes are supported for `/institution/:id`, `/policy-process/:id`, `/standard/:id`, `/public-sector-ai/:id`, and `/enforcement/:id`. |
| Workbench corpus explorer | done | Research Corpus section added inside Workbench with facets, answer cards, context-map shortcuts, source links, dossiers, correction links, and CSV export. |
| Corpus evidence dossiers | done | Evidence dossiers now support country, lab, instrument, and corpus record types. |
| Policy brief workflow | done | Static Markdown/copy/download/print policy briefs added for country, lab-by-market, institution, deadline-watch, enforcement-watch, and standards/conformity workflows. |
| Public corpus endpoints | done | Public JSON endpoints added for institutions, policy processes, standards/conformity, public-sector AI, enforcement/litigation, corpus index, and policy brief index. |
| Context map modes | done | Context-only map modes added for AI institutions, policy windows, public-sector AI, enforcement activity, and standards/conformity. |
| Data dictionary | done | Human-readable dictionary is visible in Workbench and exported at `/data/data-dictionary.json`. |
| Corpus coverage report | done | Coverage, stale-check, official-source-gap, and missing-institution diagnostics are visible in Workbench and exported at `/data/corpus-coverage-report.json`. |
| Record-level corpus changelog | done | Corpus record pages show row-level changelog entries where available, and release packages include corpus changelog metadata. |
| Editorial release infrastructure | partial | Release package includes corpus coverage, dictionary, source metadata, and changelog. Monthly release notes and broader source-delta monitors remain continuing operations. |
| AI assistant | deferred | Do not add until retrieval/citation guardrails are explicitly designed and tested. |

## Next Editorial Expansion

- Add official-source national AI Act authority appointments as they become available.
- Complete the EU AI Act competent-authority and market-surveillance matrix as member-state designations become final.
- Expand public-sector AI registry coverage beyond the current U.S., Canada, EU, Netherlands, UK, and New Zealand starter rows.
- Add procurement-specific AI guidance only where the source is official and clearly AI-specific.
- Add enforcement/litigation rows only from official regulator releases, court/docket records, or issuer-controlled legal records.
- Expand safety-institute and technical-evaluation-body rows only where official pages support the mandate, powers, and caveats.
- Keep standards, process, public-sector, safety, procurement, and enforcement context separate from binding-law coloring.
