# 09 — Source triage: the anti-bot-walled URLs

**Generated 26 July 2026.** Produced while working roadmap item N3.

## What this is

The content-aware link checker (F-11) reports **17 source URLs that answer HTTP 403 with a bot-detection page rather than the document**. Before that change they were reported healthy, because the checker treated 403 as acceptable and never read a response body.

None of these is evidence the source is wrong. They are evidence the source **cannot be verified by automation**, which is a different and more honest statement.

## What was attempted, and what it showed

Each URL was tried two ways: `curl` with a browser user-agent, and a real browser that executes JavaScript.

| Outcome | Count |
|---|---|
| Verified — page loaded and matched the claim | **1** |
| Blocked by active bot detection in both | **16** |

The browser did **not** help except in one case. `iso.org`, `consilium.europa.eu`, `ai.gov.ae` and `regjeringen.no` all present "Just a moment… / Performing security verification" or a hard Cloudflare block to the automated browser exactly as they do to `curl`.

**Defeating bot detection is out of scope and will not be attempted.** That leaves human verification, which is what this checklist is for.

## Verified

| Record | URL | Evidence |
|---|---|---|
| `g7-hiroshima-statement` | [mofa.go.jp/ecm/ec/page5e_000076.html](https://www.mofa.go.jp/ecm/ec/page5e_000076.html) | Loaded in browser: "G7 Leaders' Statement on the Hiroshima AI Process", dated 30 October 2023, with the Guiding Principles and Code of Conduct PDFs listed as attachments. Entry added to `sourceLinkManualChecks.json`, expires 24 Oct 2026. |

## Needs a human — 16 URLs

For each: open it in a normal browser, confirm it is the document the record claims, then add an entry to [`src/data/sourceLinkManualChecks.json`](../../src/data/sourceLinkManualChecks.json) in the shape shown above. Set `expiresOn` roughly 90 days out. If a URL has moved, update the record's `sourceUrl` instead; if the claim is overtaken, set the record's `verificationStatus` to `superseded`.

### ISO — 6 URLs
`iso.org` runs an interstitial challenge on every request.

| Record | URL |
|---|---|
| `iso-iec-42001-2023` | `https://www.iso.org/standard/42001` |
| `iso-iec-42001-ai-management-system` | `https://www.iso.org/standard/42005` |
| `iso-iec-42005-2025` | `https://www.iso.org/standard/44545.html` |
| `iso-iec-38507-2022` | `https://www.iso.org/standard/56641.html` |
| `iso-iec-22989-2022` | `https://www.iso.org/standard/74296.html` |
| *(lab exposure row)* | `https://www.iso.org/standard/81230.html` |

**Worth checking while you are there:** `iso-iec-42001-2023` points at `/standard/42001` and `iso-iec-42001-ai-management-system` at `/standard/42005`. ISO's numeric paths are catalogue ids, not standard numbers — `42001` and `42005` look like standard numbers used as if they were catalogue ids. The other four use the `NNNNN.html` catalogue form. These two may be wrong URLs rather than blocked ones, which the checker cannot distinguish.

### MOFA — 2 URLs
Both are attachments **linked from the page already verified above**, so they are very likely fine; they were not opened directly.

| Record | URL |
|---|---|
| `hiroshima-guiding-principles` | `https://www.mofa.go.jp/files/100573471.pdf` |
| `hiroshima-code-of-conduct` | `https://www.mofa.go.jp/files/100573473.pdf` |

### National sources — 6 URLs

| Record | URL |
|---|---|
| `ae-national-ai-strategy-2031` | `https://ai.gov.ae/strategy/` |
| `fi-ai-programme` | `https://julkaisut.valtioneuvosto.fi/bitstream/handle/10024/160391/TEMrap_47_2017_verkkojulkais.pdf` |
| `fr-ai-for-humanity` | `https://www.economie.gouv.fr/actualites/strategie-nationale-intelligence-artificielle` |
| `il-national-ai-program-2024` | `https://www.gov.il/en/departments/news/national-ai-program` |
| `no-national-ai-strategy-2020` | `https://www.regjeringen.no/contentassets/1febbbb2c4fd4b7d92c67ddd353b6ae8/en-gb/pdfs/ki-strategi_en.pdf` |
| `no-ai-act-draft-2025` | `https://www.regjeringen.no/id3112327/` |

### Institutional — 2 URLs

| Record | URL |
|---|---|
| `council-eu-ai-conclusions-2024` | `https://www.consilium.europa.eu/en/press/press-releases/2024/11/05/artificial-intelligence-ai-council-approves-conclusions-to-strengthen-eu-s-ambitions/` |
| `oecd-ai-observatory-index-2026` | `https://www.oecd-ilibrary.org/en/publications/oecd-ai-observatory-index_32c01014-en.html` |

## Expiry is now enforced

`sourceLinkManualChecks.json` entries may carry `expiresOn`. Once that date passes the override stops excusing the automated failure and the record is reported again. `npm run audit:manual-checks` fails when any entry is expired, and CI runs it — so a lapsed manual verification breaks the build instead of quietly ageing, which is what happened to the Council of Europe override that expired on 5 July 2026 with nothing noticing.

## Why not just suppress these

Sixteen warnings is uncomfortable, and silencing them is one line. But the warning is accurate: nobody has confirmed these URLs serve what the records claim. A dataset whose pitch is source-backed rigour should show the gap rather than hide it. The number should fall because someone checked, not because the check was removed.
