import { describe, expect, it } from "vitest";
import { GOVERNANCE_OBLIGATIONS } from "../data/governanceObligations";
import { IMPLEMENTATION_MILESTONES } from "../data/implementationMilestones";
import { NATIONAL_AI_REGULATIONS, NATIONAL_REG_BY_ID } from "../data/nationalAIRegulations";
import { RELEASE_METADATA } from "../data/releaseMetadata";
import { WORKBENCH_QUESTION_BY_ID } from "../data/workbenchQuestions";
import { DEFAULT_FILTER_STATE, type WorkbenchAnswer } from "../types";
import {
  buildWorkbenchAnswer,
  renderWorkbenchAnswerCitation,
  renderWorkbenchAnswerCsv,
} from "./workbenchAnswer";

const WORKED_QUESTION_IDS = [
  "binding-duties-by-jurisdiction",
  "incident-reporting",
  "coe-signed-ratified",
  "frontier-lab-binding-exposure",
  "eu-act-vs-national-law",
] as const;

describe("structured Workbench answers", () => {
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
});

describe("Workbench answer renderers", () => {
  const quotedAnswer: WorkbenchAnswer = {
    questionId: "quoted-question",
    questionTitle: 'Who said "yes", and when?',
    sentence: 'One answer says "yes", with a qualification.',
    caveat: "Tracked data, not legal advice.",
    countLabel: "1 row",
    namedEntities: ["Example Entity"],
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
      },
    ],
  };

  it("renders the documented RFC-4180 CSV columns and quotes commas and double quotes", () => {
    const csv = renderWorkbenchAnswerCsv(quotedAnswer);
    const [header, row] = csv.split("\r\n");

    expect(header).toBe(
      "question_id,question_title,answer,caveat,entity,evidence_id,evidence_name,source_name,source_url,record_url,status_as_of"
    );
    expect(row).toContain('"Who said ""yes"", and when?"');
    expect(row).toContain('"Example, ""official"" record"');
    expect(row).toContain('"Official Gazette, Office"');
  });

  it("renders a citation with title, release and status dates, canonical question URL, and sources", () => {
    const answer = buildWorkbenchAnswer("binding-duties-by-jurisdiction", DEFAULT_FILTER_STATE);
    const citation = renderWorkbenchAnswerCitation(answer);

    expect(citation).toContain(answer.questionTitle);
    expect(citation).toContain(RELEASE_METADATA.releaseDate);
    expect(citation).toContain(RELEASE_METADATA.statusAsOf);
    expect(citation).toContain("https://global-ai-governance-map.vercel.app/?lens=workbench&wbQuestion=binding-duties-by-jurisdiction");
    for (const source of new Set(answer.evidence.map((row) => row.sourceName))) {
      expect(citation).toContain(source);
    }
  });
});
