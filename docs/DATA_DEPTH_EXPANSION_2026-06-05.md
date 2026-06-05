# Data Depth Expansion Note - 2026-06-05

This pass adds official or issuer-controlled context sources without changing legal-status rollups. These additions are designed to make the map more useful for research on implementation, enforcement, public-sector use, procurement, registries, safety institutes, and compute/infrastructure context while keeping binding-law claims separate.

## Added AI Atlas Source Families

| ID | Category | Source basis | Public-data effect | Legal-status effect |
| --- | --- | --- | --- | --- |
| `eu-ai-office-governance-enforcement` | AI regulator | European Commission governance/enforcement page | Adds EU AI Office and national competent-authority source family | None |
| `eu-gpai-code-practice-2025` | Policy implementation | European Commission GPAI Code of Practice page | Adds GPAI Code source family and signatory-context lead | None |
| `ftc-operation-ai-comply` | Enforcement activity | FTC official press release | Adds AI-related enforcement source family | None |
| `us-ai-acquisition-memo-m-24-18` | Public procurement | OMB M-24-18 official memorandum | Adds U.S. federal AI acquisition source family | None |
| `eu-high-risk-ai-database` | Public-sector registry | EUR-Lex AI Act Article 71 | Adds EU high-risk AI database source family | None |
| `uk-ai-security-institute` | AI safety institute | UK AISI official site | Adds frontier-model testing and institute source family | None |
| `japan-ai-safety-institute` | AI safety institute | Japan AISI official site | Adds Japan safety-institute source family | None |

## Added Implementation Milestones

| ID | Parent | Status | Caveat |
| --- | --- | --- | --- |
| `eu-ai-act-national-authorities-deadline` | `eu-ai-act` | `regulator_appointed` | Tracks the EU-level designation deadline; it is not country-by-country proof that each authority is fully operational. |
| `eu-gpai-code-practice-published` | `eu-ai-act` | `guidance_issued` | Tracks voluntary GPAI Code publication; it is not a standalone binding instrument and does not prove signatory compliance. |

## Exclusions In This Pass

- No new country-level Atlas score rows were imported.
- No FTC case rows were converted into binding AI-law records.
- No public procurement guidance was treated as a general private-sector AI obligation.
- No AI safety institute row was treated as treaty participation or national law.

