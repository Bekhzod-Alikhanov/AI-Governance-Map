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

## Added Country-Level Atlas Context Rows

These rows are contextual indicators. They appear in Atlas/context surfaces, country drawers, tables, and dossiers, but do not affect binding-law coloring, legal rollups, obligation counts, or treaty participation.

| ID | Country / entity | Source basis | Context captured | Legal-status effect |
| --- | --- | --- | --- | --- |
| `ftc-operation-ai-comply-usa-2024` | United States | FTC official release | Five AI-related consumer-protection enforcement actions announced under Operation AI Comply | None |
| `us-ai-acquisition-memo-m-24-18-usa-2024` | United States | OMB M-24-18 | Federal agency AI acquisition requirements and guidance | None |
| `eu-ai-office-governance-enforcement-euu-2026` | European Union | European Commission governance/enforcement page | EU AI Office and national market-surveillance authority implementation architecture | None |
| `eu-high-risk-ai-database-euu-2024` | European Union | EUR-Lex AI Act Article 71 | EU high-risk AI database infrastructure | None |
| `eu-ai-factories-euu-2026` | European Union | European Commission AI Factories page | EU AI compute infrastructure and EuroHPC AI Factories context | None |
| `us-nairr-pilot-usa-2026` | United States | NSF NAIRR page | Shared AI research infrastructure and resource-access context | None |
| `uk-ai-security-institute-gbr-2026` | United Kingdom | UK AISI official site | Advanced-AI safety institute and model-risk research context | None |
| `japan-ai-safety-institute-jpn-2026` | Japan | Japan AISI official site | AI safety evaluation, standards/guidance support, and international coordination context | None |
| `netherlands-public-algorithm-register-nld-2026` | Netherlands | Dutch government Algorithm Register | Public-sector algorithm and high-risk AI transparency register context | None |
| `uk-ai-procurement-guidelines-gbr-2020` | United Kingdom | GOV.UK AI procurement guidance | Public-sector AI procurement guidance context | None |

## Added Implementation Milestones

| ID | Parent | Status | Caveat |
| --- | --- | --- | --- |
| `eu-ai-act-national-authorities-deadline` | `eu-ai-act` | `regulator_appointed` | Tracks the EU-level designation deadline; it is not country-by-country proof that each authority is fully operational. |
| `eu-gpai-code-practice-published` | `eu-ai-act` | `guidance_issued` | Tracks voluntary GPAI Code publication; it is not a standalone binding instrument and does not prove signatory compliance. |

## Exclusions And Caveats In This Pass

- No new comparative country-level Atlas score rows were imported.
- No FTC case rows were converted into binding AI-law records.
- No public procurement guidance was treated as a general private-sector AI obligation.
- No AI safety institute row was treated as treaty participation or national law.
- No compute/infrastructure row was treated as national AI law, enforcement, or treaty participation.
