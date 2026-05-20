# Source Verification Pass — 20 May 2026

This pass checked high-impact legal/source claims against official or issuer-controlled sources. It does not provide legal advice. Items marked uncertain should not be treated as confirmed legal status until a direct official law text, treaty-office record, or gazette record is reviewed.

## Confirmed And Updated

| Item | Result | Repo action |
| --- | --- | --- |
| EU AI Act | Official EUR-Lex/European Commission sources support Regulation (EU) 2024/1689, in force 2024-08-01 with phased application. | Added verification metadata and EU-applicability caveat. |
| European AI Office | Official Commission source supports institutional role, not a separate binding law. | Changed `eu-ai-office` from `binding` to `non_binding`. |
| CoE AI Convention | Official CoE material supports treaty framing, signature/ratification distinction, EU ratification on 2026-05-15, and entry-into-force conditions. | Added verification metadata and Treaty Office caveat. |
| OECD AI Principles | OECD Legal Instruments record is the preferred source for OECD/LEGAL/0449 and the 2024 revision. | Replaced topic-page source with OECD Legal Instruments URL. |
| UNESCO Ethics Recommendation | Official UNESCO source supports adoption on 2021-11-23. | Removed hard-coded "193 member states" phrasing from summary. |
| UNGA 78/265, 78/311, 79/325 | UN Digital Library records support dates and resolution identifiers. | Added verification metadata. |
| Bletchley Declaration | GOV.UK source supports represented countries and New Zealand joining later. | Added verification metadata. |
| Seoul Declaration / Statement / Ministerial | GOV.UK sources support leaders/ministerial texts and participants. | Added verification metadata. |
| INASI launch members | GOV.UK Seoul source lists Australia, Canada, EU, France, Germany, Italy, Japan, Korea, Singapore, UK, US. | Replaced Kenya with Germany and Italy in launch-member participation rows; added GOV.UK source override. |
| Paris AI Action Summit statement | Official Elysee source supports signatory list; US and UK are not listed. | Softened summary wording and added verification metadata. |
| ISO/IEC 42001 | Official ISO page is `/standard/81230.html`, not `/standard/42001`. | Fixed source URL. |
| ISO/IEC 42005 | Official ISO page shows publication on 2025-05-28. | Corrected date from 2025-01-01 to 2025-05-28. |
| South Korea AI Basic Act | Official MSIT source supports National Assembly passage on 2024-12-26 and effective date 2026-01-22. | Added verification metadata. |
| Japan AI Promotion Act | Japanese Law Translation identifies Act No. 53 of 2025, promulgated/enforced 2025-06-04 except specified provisions. | Corrected adoption/in-force dates to 2025-06-04. |
| Canada AIDA | Official ISED source describes AIDA as part of Bill C-27; Parliament status means it did not become law. | Changed status/summary to historical proposal, not active law. |
| U.S. TAKE IT DOWN Act | Congress.gov supports Public Law 119-12. It is a deepfake/content statute, not broad frontier-model governance. | Set `frontierAIRelevant` to `false` and added caveat metadata. |

## Marked Uncertain

| Item | Reason |
| --- | --- |
| Vietnam Law on Artificial Intelligence | Current source is a generic National Assembly page, not a stable law record. |
| Vietnam Law on Digital Technology Industry | Current source is generic; needs direct legal text/status check. |
| Taiwan Artificial Intelligence Basic Act | Current source is a generic press-release index, not a direct act record. |
| Slovenia EU AI Act implementation law | Current source is a ministry landing page, not a direct official law/gazette record. |
| Kazakhstan AI Law | Official legal database source exists, but detailed status/date should be checked against direct legal text before relying on map coloring. |

## Official Sources Used

- EUR-Lex: https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng
- European Commission AI Office: https://digital-strategy.ec.europa.eu/en/policies/ai-office
- Council of Europe Framework Convention / Treaty Office: https://www.coe.int/en/web/artificial-intelligence/the-framework-convention-on-artificial-intelligence
- OECD Legal Instruments OECD/LEGAL/0449: https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0449
- UNESCO Recommendation on AI Ethics: https://www.unesco.org/en/artificial-intelligence/recommendation-ethics
- UN Digital Library: https://digitallibrary.un.org/
- GOV.UK Bletchley Declaration: https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration/the-bletchley-declaration-by-countries-attending-the-ai-safety-summit-1-2-november-2023
- GOV.UK Seoul Declaration: https://www.gov.uk/government/publications/seoul-declaration-for-safe-innovative-and-inclusive-ai-ai-seoul-summit-2024
- GOV.UK Seoul Ministerial Statement: https://www.gov.uk/government/publications/seoul-ministerial-statement-for-advancing-ai-safety-innovation-and-inclusivity-ai-seoul-summit-2024
- Elysee Paris AI Action Summit statement: https://www.elysee.fr/en/emmanuel-macron/2025/02/11/statement-on-inclusive-and-sustainable-artificial-intelligence-for-people-and-the-planet
- ISO standards catalogue: https://www.iso.org/
- MSIT AI Basic Act source: https://www.msit.go.kr/eng/bbs/view.do?bbsSeqNo=42&mId=4&mPid=2&nttSeqNo=1214&sCode=eng
- Japanese Law Translation: https://www.japaneselawtranslation.go.jp/ja/laws/view/5066/ja
- Congress.gov S.146 / Public Law 119-12: https://www.congress.gov/bill/119th-congress/senate-bill/146
- ISED AIDA page: https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act

