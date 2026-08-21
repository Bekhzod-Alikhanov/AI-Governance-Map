import { describe, expect, it } from "vitest";
import { GOVERNANCE_OBLIGATIONS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "../data/implementationMilestones";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { RELEASE_METADATA } from "../data/releaseMetadata";
import { COUNTRY_INDICATOR_SCORES, COUNTRY_READINESS_REPORTS } from "../data/aiAtlas";
import { INSTRUMENT_BY_ID } from "../data/internationalInstruments";
import { PUBLIC_SECTOR_AI_RECORDS } from "../data/researchCorpus";
import {
  WORKBENCH_QUESTION_BY_ID,
  WORKBENCH_QUESTIONS,
} from "../data/workbenchQuestions";
import { DEFAULT_FILTER_STATE, type WorkbenchAnswer } from "../types";
import {
  buildWorkbenchAnswer,
  renderWorkbenchAnswerCitation,
  renderWorkbenchAnswerCsv,
} from "./workbenchAnswer";
import { getCountryGovernanceSummary } from "./getCountryGovernanceSummary";
import { parseShareableState } from "./urlState";

const WORKED_QUESTION_IDS = [
  "binding-duties-by-jurisdiction",
  "incident-reporting",
  "coe-signed-ratified",
  "frontier-lab-binding-exposure",
  "eu-act-vs-national-law",
] as const;

describe("structured Workbench answers", () => {
  const expectedAnswerNouns: Record<string, RegExp> = {
    "binding-duties-by-jurisdiction": /binding obligation/i,
    "incident-reporting": /incident-reporting/i,
    "model-evaluation": /model-evaluation/i,
    "coe-signed-ratified": /ratification.*signature-only/i,
    "eu-act-vs-national-law": /EU regulation.*national implementation/i,
    "frontier-lab-binding-exposure": /frontier labs?.*binding exposure/i,
    "labs-with-safety-frameworks": /labs?.*safety framework/i,
    "government-evaluation-exposure": /government evaluation/i,
    "china-synthetic-media": /China.*synthetic-media/i,
    "high-readiness-weak-law": /readiness/i,
    "unesco-ram-available": /UNESCO RAM/i,
    "standards-soft-law": /standards.*soft-law/i,
    "implementation-deadlines": /implementation deadline/i,
    "employment-ai": /employment AI/i,
    biometrics: /biometric/i,
    "healthcare-ai": /healthcare AI/i,
    "compute-dependencies": /compute dependency/i,
    "source-confidence": /high-confidence/i,
    "proposed-laws": /proposed law/i,
    "gpai-market-access": /GPAI market-access/i,
    "public-sector-ai": /public-sector AI/i,
    "citation-brief": /citable source/i,
  };

  it.each(WORKBENCH_QUESTIONS)(
    "derives sentence, count, entities, caveat, and evidence from the $id scope",
    (question) => {
      const answer = buildWorkbenchAnswer(question.id, DEFAULT_FILTER_STATE);

      expect(answer.sentence.trim()).toMatch(/[.!?]$/);
      expect(answer.sentence.trim()).toMatch(expectedAnswerNouns[question.id]);
      expect(answer.caveat.trim()).not.toBe("");
      expect(answer.countLabel.trim()).not.toBe("");
      expect(answer.evidence.length).toBeLessThanOrEqual(5);

      for (const row of answer.evidence) {
        expect(row.sourceName.trim()).not.toBe("");
        expect(row.sourceUrl).toMatch(/^https?:\/\//);
      }

      expect(new Set(answer.namedEntities)).toEqual(
        new Set(answer.evidence.map((row) => row.entity)),
      );
      if (answer.evidence.length === 0) {
        expect(answer.sentence).toMatch(/tracked release has no matching evidence/i);
      }
    },
  );

  it("uses UNESCO RAM activity rows rather than the global country count", () => {
    const answer = buildWorkbenchAnswer("unesco-ram-available", DEFAULT_FILTER_STATE);
    const ramRows = COUNTRY_READINESS_REPORTS.filter(
      (row) =>
        row.sourceId === "unesco-ram-global-hub-2026" &&
        (row.status === "completed" || row.status === "in_process"),
    );
    const ramIds = new Set(ramRows.map((row) => row.id));

    expect(answer.sentence).toContain(`${ramRows.length} UNESCO RAM activity rows`);
    expect(answer.countLabel).toBe(`${ramRows.length} UNESCO RAM activity rows`);
    expect(answer.sentence).not.toMatch(/191 countries|countries match/i);
    expect(answer.evidence.length).toBeGreaterThan(0);
    expect(answer.evidence.every((row) => ramIds.has(row.id))).toBe(true);
  });

  it("keeps high-readiness evidence inside the no-confirmed-binding-law scope", () => {
    const expected = COUNTRY_INDICATOR_SCORES
      .filter(
        (row) =>
          row.sourceId === "oxford-gov-ai-readiness-2025" &&
          row.score !== undefined &&
          row.score >= 60 &&
          !getCountryGovernanceSummary(row.countryIso3).hasBindingNationalLaw,
      )
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 8);
    const answer = buildWorkbenchAnswer("high-readiness-weak-law", DEFAULT_FILTER_STATE);

    expect(answer.sentence).toContain(
      `${expected.length} high-readiness countries with no confirmed binding AI-specific law`,
    );
    expect(answer.countLabel).toBe(
      `${expected.length} high-readiness / no-confirmed-binding-law countries`,
    );
    expect(answer.evidence.map((row) => row.id)).toEqual(
      expected.slice(0, 5).map((row) => row.id),
    );
  });

  it("combines public-sector obligations with registry and context records", () => {
    const obligationIds = new Set(
      GOVERNANCE_OBLIGATIONS
        .filter((row) => row.domains.includes("public-sector"))
        .map((row) => row.id),
    );
    const contextIds = new Set(PUBLIC_SECTOR_AI_RECORDS.map((row) => row.id));
    const answer = buildWorkbenchAnswer("public-sector-ai", DEFAULT_FILTER_STATE);

    expect(answer.sentence).toContain(
      `${obligationIds.size} public-sector obligation rows and ${contextIds.size} registry/context rows`,
    );
    expect(answer.evidence.some((row) => obligationIds.has(row.id))).toBe(true);
    expect(answer.evidence.some((row) => contextIds.has(row.id))).toBe(true);
  });

  it("renders readable middle-dot separators in compact comparison counts", () => {
    expect(
      buildWorkbenchAnswer("coe-signed-ratified", DEFAULT_FILTER_STATE).countLabel,
    ).toBe("1 ratified · 20 signature-only");
    expect(
      buildWorkbenchAnswer("eu-act-vs-national-law", DEFAULT_FILTER_STATE).countLabel,
    ).toMatch(/^\d+ EU regulations · \d+ national implementation rows$/);
  });

  it("uses configured standards and soft-law instruments without lab-exposure nouns", () => {
    const question = WORKBENCH_QUESTION_BY_ID["standards-soft-law"];
    const configuredIds = (question.compareItems ?? [])
      .filter((item) => item.kind === "instrument")
      .map((item) => item.id);
    const answer = buildWorkbenchAnswer(question.id, DEFAULT_FILTER_STATE);

    expect(answer.sentence).toContain(
      `${configuredIds.length} configured standards and soft-law instruments`,
    );
    expect(answer.countLabel).toBe(`${configuredIds.length} standards and soft-law instruments`);
    expect(answer.sentence).not.toMatch(/lab|binding hooks?/i);
    expect(answer.evidence.map((row) => row.id)).toEqual(configuredIds);
    expect(answer.evidence.every((row) => Boolean(INSTRUMENT_BY_ID[row.id]))).toBe(true);
  });

  it.each(WORKED_QUESTION_IDS)("builds a complete source-backed answer for %s", (questionId) => {
    const answer = buildWorkbenchAnswer(questionId, DEFAULT_FILTER_STATE);

    expect(answer).toMatchObject({
      questionId,
      questionTitle: expect.any(String),
      sentence: expect.stringMatching(/[.!?]$/),
      caveat: expect.any(String),
      countLabel: expect.any(String),
      namedEntities: expect.any(Array),
      evidence: expect.any(Array),
      statusAsOf: RELEASE_METADATA.statusAsOf,
    });
    expect(answer.namedEntities.length).toBeGreaterThan(0);
    const minimumEvidence = ["incident-reporting", "coe-signed-ratified"].includes(questionId) ? 1 : 3;
    expect(answer.evidence.length).toBeGreaterThanOrEqual(minimumEvidence);
    expect(answer.evidence.length).toBeLessThanOrEqual(5);

    for (const evidence of answer.evidence) {
      expect(evidence).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        sourceName: expect.any(String),
        sourceUrl: expect.stringMatching(/^https?:\/\//),
        sourceKind: expect.any(String),
        verificationStatus: expect.any(String),
        confidence: expect.any(String),
        lastVerified: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      });
      expect(evidence.id).not.toBe("");
      expect(evidence.name).not.toBe("");
      if (evidence.recordUrl) expect(evidence.recordUrl).toMatch(/^\//);
    }
  });

  it("names binding jurisdictions and provides routable official evidence with a caveat", () => {
    const answer = buildWorkbenchAnswer("binding-duties-by-jurisdiction", DEFAULT_FILTER_STATE);

    expect(answer.sentence).toMatch(/binding obligation/i);
    expect(answer.caveat).toMatch(/tracked|snapshot|legal advice/i);
    expect(answer.namedEntities).toEqual(expect.arrayContaining(["European Union", "California"]));
    expect(answer.evidence.every((row) => row.sourceKind === "official")).toBe(true);
    expect(answer.evidence.every((row) => Boolean(row.recordUrl))).toBe(true);
  });

  it("includes California SB 53 and any structured EU AI Act incident-reporting row", () => {
    const answer = buildWorkbenchAnswer("incident-reporting", DEFAULT_FILTER_STATE);

    expect(answer.evidence.some((row) => row.id === "ca-sb-53-incident-reporting")).toBe(true);
    const euIncidentRows = GOVERNANCE_OBLIGATIONS.filter(
      (row) => row.category === "incident_reporting" && row.parentId === "eu-ai-act"
    );
    for (const row of euIncidentRows) {
      expect(answer.evidence.some((evidence) => evidence.id === row.id)).toBe(true);
    }
  });

  it("does not present multiple records backed by the same official source as independent evidence", () => {
    const answer = buildWorkbenchAnswer("incident-reporting", DEFAULT_FILTER_STATE);
    const sourceUrls = answer.evidence.map((row) => row.sourceUrl);

    expect(new Set(sourceUrls).size).toBe(sourceUrls.length);
  });

  it("separates CoE ratification from signature-only parties without duplicating the EU", () => {
    const answer = buildWorkbenchAnswer("coe-signed-ratified", DEFAULT_FILTER_STATE);

    expect(answer.sentence).toContain("1 ratification and 20 signature-only rows");
    expect(answer.caveat).toMatch(/signature is not ratification/i);
    expect(answer.caveat).toMatch(/not yet in force/i);
    expect(answer.namedEntities.filter((entity) => entity === "European Union")).toHaveLength(1);
    expect(answer.evidence.filter((row) => row.name.includes("European Union"))).toHaveLength(1);
  });

  it("names frontier labs and distinguishes applicability hooks from enforcement findings", () => {
    const answer = buildWorkbenchAnswer("frontier-lab-binding-exposure", DEFAULT_FILTER_STATE);

    expect(answer.namedEntities).toEqual(expect.arrayContaining(["OpenAI", "Google DeepMind", "Mistral"]));
    expect(answer.sentence).toMatch(/binding/i);
    expect(answer.caveat).toMatch(/not .*enforcement finding|applicability/i);
  });

  it("distinguishes direct EU applicability from national implementation activity", () => {
    const answer = buildWorkbenchAnswer("eu-act-vs-national-law", DEFAULT_FILTER_STATE);

    expect(answer.sentence).toMatch(/directly applicable|direct applicability/i);
    expect(`${answer.sentence} ${answer.caveat}`).toMatch(/national implementation/i);
    expect(answer.namedEntities).toEqual(expect.arrayContaining(["European Union", "Italy", "Slovenia"]));
  });

  it("derives EU and national entity names from the configured rule records", () => {
    const italy = NATIONAL_REG_BY_ID["it-law-132-2025"];
    const originalJurisdiction = italy.jurisdiction;
    italy.jurisdiction = "Italian Republic";

    try {
      const answer = buildWorkbenchAnswer("eu-act-vs-national-law", DEFAULT_FILTER_STATE);
      expect(answer.namedEntities).toContain("Italian Republic");
      expect(answer.namedEntities).not.toContain("Italy");
    } finally {
      italy.jurisdiction = originalJurisdiction;
    }
  });

  it("does not claim a regional EU row when the configured regional record is unavailable", () => {
    const regional = NATIONAL_REG_BY_ID["eu-ai-act-regional"];
    delete NATIONAL_REG_BY_ID["eu-ai-act-regional"];

    try {
      const answer = buildWorkbenchAnswer("eu-act-vs-national-law", DEFAULT_FILTER_STATE);
      expect(answer.countLabel).toMatch(/^0 EU regulations/);
      expect(answer.namedEntities).not.toContain("European Union");
      expect(answer.caveat).not.toMatch(/supplement the directly applicable EU regulation/i);
    } finally {
      NATIONAL_REG_BY_ID["eu-ai-act-regional"] = regional;
    }
  });

  it("uses proposed-law records rather than unrelated binding obligations as proposed-law evidence", () => {
    const answer = buildWorkbenchAnswer("proposed-laws", DEFAULT_FILTER_STATE);
    const proposedRuleIds = new Set(
      NATIONAL_AI_REGULATIONS.filter((row) => row.bindingStatus === "proposed").map((row) => row.id),
    );

    expect(answer.evidence.length).toBeGreaterThan(0);
    expect(answer.evidence.every((row) => proposedRuleIds.has(row.id))).toBe(true);
  });

  it("answers the source-confidence question with high-confidence claims", () => {
    const answer = buildWorkbenchAnswer("source-confidence", DEFAULT_FILTER_STATE);

    expect(answer.sentence).toMatch(/high-confidence/i);
    expect(answer.evidence.length).toBeGreaterThan(0);
    expect(answer.evidence.every((row) => row.confidence === "high")).toBe(true);
  });

  it("uses resolved configured comparisons as the complete China question evidence set", () => {
    const question = WORKBENCH_QUESTION_BY_ID["china-synthetic-media"];
    const configuredRules = (question.compareItems ?? [])
      .filter((item) => item.kind === "rule")
      .map((item) => NATIONAL_REG_BY_ID[item.id])
      .filter((row): row is NonNullable<typeof row> => Boolean(row));
    const configuredIds = new Set(configuredRules.map((row) => row.id));
    const configuredSourceUrls = new Set(configuredRules.map((row) => row.sourceUrl));

    const answer = buildWorkbenchAnswer(question.id, DEFAULT_FILTER_STATE);

    expect(answer.evidence.length).toBeGreaterThan(0);
    expect(answer.evidence.every((row) => configuredIds.has(row.id))).toBe(true);
    expect(answer.evidence.every((row) => configuredSourceUrls.has(row.sourceUrl))).toBe(true);
  });

  it("shows only upcoming implementation deadlines, sorted from soonest to latest", () => {
    const answer = buildWorkbenchAnswer("implementation-deadlines", DEFAULT_FILTER_STATE);
    const expected = IMPLEMENTATION_MILESTONES
      .filter((row) => ["phased_application", "implementing_rules_pending"].includes(row.status))
      .map((row) => ({ row, deadline: row.nextDeadline ?? row.date }))
      .filter((entry): entry is { row: (typeof IMPLEMENTATION_MILESTONES)[number]; deadline: string } =>
        Boolean(entry.deadline && entry.deadline > RELEASE_METADATA.statusAsOf),
      )
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 5);

    expect(answer.evidence.map((row) => row.id)).toEqual(expected.map((entry) => entry.row.id));
    if (expected.length === 0) {
      expect(answer.sentence).toMatch(/no upcoming deadlines/i);
      expect(answer.countLabel).toBe("0 upcoming deadlines");
    }
  });

  it("includes the two changed AI Omnibus high-risk deadlines with official evidence", () => {
    const expected = [
      {
        id: "eu-ai-omnibus-high-risk-annex-iii-deadline",
        date: "2027-12-02",
        label: "AI Omnibus high-risk-system deadline (Annex III)",
      },
      {
        id: "eu-ai-omnibus-high-risk-products-deadline",
        date: "2028-08-02",
        label: "AI Omnibus regulated-product high-risk-system deadline (Annex I)",
      },
    ];
    const officialUrl = "https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force";
    const rows = expected.map(({ id }) => IMPLEMENTATION_MILESTONES.find((row) => row.id === id));
    const question = WORKBENCH_QUESTION_BY_ID["implementation-deadlines"];
    const answer = buildWorkbenchAnswer(question.id, DEFAULT_FILTER_STATE);

    expect(rows.map((row) => row?.date)).toEqual(expected.map((row) => row.date));
    expect(rows.map((row) => row?.label)).toEqual(expected.map((row) => row.label));
    expect(rows.every((row) => row?.sourceUrl === officialUrl)).toBe(true);
    expect(rows.every((row) => /changed|extended/i.test(`${row?.summary} ${row?.verificationNotes}`))).toBe(true);
    expect(question.featured).toBe(true);
    expect(answer.sentence.trim()).not.toBe("");
    expect(answer.evidence.map((row) => row.id)).toEqual(expected.map((row) => row.id));
    expect(answer.evidence.map((row) => row.name)).toEqual(
      expected.map((row) => `${row.label} — ${row.date}`),
    );
    expect(answer.evidence.every((row) => row.sourceUrl === officialUrl)).toBe(true);
  });

  it("rebuilds the selected answer and effective configuration from the citation URL alone", () => {
    const question = WORKBENCH_QUESTION_BY_ID["model-evaluation"];
    const selectedFilters = { ...DEFAULT_FILTER_STATE, ...question.patch };
    const selected = buildWorkbenchAnswer(question.id, selectedFilters);
    const citation = renderWorkbenchAnswerCitation(selected);
    const canonicalUrl = citation.match(/Canonical Workbench URL: (.+)/)?.[1];

    expect(canonicalUrl).toBeTruthy();
    const parsed = parseShareableState(new URL(canonicalUrl!).search);
    const rebuilt = buildWorkbenchAnswer(parsed.workbench.activeQuestionId!, parsed.filters);

    expect(parsed.filters).toEqual(selectedFilters);
    expect(parsed.workbench.compareItems).toEqual(
      question.compareItems ?? [],
    );
    expect(parsed.workbench.activeAnswerCardId).toBe(question.answerCardId ?? null);
    expect(rebuilt).toEqual(selected);
  });
});

describe("Workbench answer renderers", () => {
  const quotedAnswer: WorkbenchAnswer = {
    questionId: "quoted-question",
    questionTitle: 'Who said "yes", and when?',
    sentence: 'One answer says "yes", with a qualification.',
    caveat: "Tracked data, not legal advice.",
    countLabel: "1 row",
    namedEntities: ["Example Entity"],
    releaseDate: RELEASE_METADATA.releaseDate,
    coverageCutoff: RELEASE_METADATA.coverageCutoff,
    statusAsOf: RELEASE_METADATA.statusAsOf,
    evidence: [
      {
        id: "example-evidence",
        name: 'Example, "official" record',
        entity: "Example Entity",
        sourceName: "Official Gazette, Office",
        sourceUrl: "https://example.test/official",
        recordUrl: "/obligation/example-evidence",
        sourceKind: "official",
        verificationStatus: "verified",
        confidence: "high",
        lastVerified: "2026-08-17",
        sourceLocator: {
          label: "N.D. Cal. Document 700, filed 25 March 2026, pages 3–5",
          documentId: "700",
          page: "3–5",
        },
        reviewStatus: "needs_review",
        reviewNotes: "Second-person review remains outstanding.",
      },
    ],
  };

  it("renders the documented RFC-4180 CSV columns and quotes commas and double quotes", () => {
    const csv = renderWorkbenchAnswerCsv(quotedAnswer);
    const [header, row] = csv.split("\r\n");

    expect(header).toBe(
      "question_id,question_title,answer,caveat,entity,evidence_id,evidence_name,source_name,source_url,record_url,source_locator,review_status,review_notes,last_verified,release_date,coverage_cutoff,status_as_of"
    );
    expect(row).toContain('"Who said ""yes"", and when?"');
    expect(row).toContain('"Example, ""official"" record"');
    expect(row).toContain('"Official Gazette, Office"');
    expect(row).toContain("Document 700 · pages 3–5");
    expect(row).toContain("needs_review");
    expect(row).toContain("Second-person review remains outstanding.");
    expect(row).toContain(RELEASE_METADATA.releaseDate);
    expect(row).toContain(RELEASE_METADATA.coverageCutoff);
  });

  it("always exports one RFC-4180 summary row when scoped evidence is empty", () => {
    const empty: WorkbenchAnswer = {
      ...quotedAnswer,
      questionId: "empty-question",
      questionTitle: "Which evidence is available?",
      sentence: "The tracked release has no matching evidence for this question.",
      countLabel: "0 matching evidence rows",
      namedEntities: [],
      evidence: [],
    };
    const csv = renderWorkbenchAnswerCsv(empty);
    const [header, summary, ...extra] = csv.split("\r\n");

    expect(header).toContain("release_date,coverage_cutoff,status_as_of");
    expect(summary).toContain("empty-question");
    expect(summary).toContain("The tracked release has no matching evidence");
    expect(extra).toEqual([]);
  });

  it("renders a citation with title, release and status dates, canonical question URL, and sources", () => {
    const answer = buildWorkbenchAnswer("binding-duties-by-jurisdiction", DEFAULT_FILTER_STATE);
    const citation = renderWorkbenchAnswerCitation(answer);

    expect(citation).toContain(answer.questionTitle);
    expect(citation).toContain(RELEASE_METADATA.releaseDate);
    expect(citation).toContain(`coverage through ${RELEASE_METADATA.coverageCutoff}`);
    expect(citation).toContain(RELEASE_METADATA.statusAsOf);
    expect(citation).toContain("https://global-ai-governance-map.vercel.app/?lens=workbench&wbQuestion=binding-duties-by-jurisdiction");
    for (const source of new Set(answer.evidence.map((row) => row.sourceName))) {
      expect(citation).toContain(source);
    }
  });

  it("includes pinpoint and review metadata in citable source lines", () => {
    const citation = renderWorkbenchAnswerCitation(quotedAnswer);

    expect(citation).toContain("Document 700 · pages 3–5");
    expect(citation).toContain("Needs review");
    expect(citation).toContain("Second-person review remains outstanding.");
    expect(citation).toContain(RELEASE_METADATA.releaseDate);
    expect(citation).toContain(RELEASE_METADATA.coverageCutoff);
    expect(citation).toContain(RELEASE_METADATA.statusAsOf);
  });
});
