import {
  classifyFragranceKnowledgeQuery,
  findPerfumerByQuery,
  getPerfumerKnowledgeAnswer,
  resolveFragranceKnowledgeQuery,
} from "./fragranceKnowledgeRouter";

describe("FI Knowledge — perfumer routing", () => {
  test.each([
    ["Ko je Quentin Bisch?", "quentin-bisch"],
    ["Ko je Quentine Bish?", "quentin-bisch"],
    ["Who is Francis Kurkdjian?", "francis-kurkdjian"],
    ["parfimer Alberto Morillas", "alberto-morillas"],
    ["Ko je Natalie Lorson?", "nathalie-lorson"],
    ["Dominik Ropion", "dominique-ropion"],
  ])("resolves %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test("does not invent an unknown perfumer identity", () => {
    expect(findPerfumerByQuery("Ko je Daniel Renea?")).toBeNull();

    expect(
      classifyFragranceKnowledgeQuery(
        "Ko je Daniel Renea?"
      )
    ).toEqual({
      type: "unknown",
      confidence: "low",
      entity: null,
    });
  });

  test("returns high confidence when a perfumer cue and entity are both present", () => {
    const result = classifyFragranceKnowledgeQuery(
      "Ko je parfimer Quentin Bisch?"
    );

    expect(result.type).toBe("perfumer");
    expect(result.confidence).toBe("high");
    expect(result.entity.id).toBe("quentin-bisch");
  });

  test.each([
    "Sveže za leto do 15 €",
    "Nešto kao Naxos",
    "Čisto i elegantno za posao",
    "Date night, not too sweet",
  ])("does not intercept existing Discovery Engine query: %s", (query) => {
    expect(
      resolveFragranceKnowledgeQuery(query, "sr")
    ).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test("routes a verified perfumer question into knowledge without touching discovery", () => {
    const result = resolveFragranceKnowledgeQuery(
      "Ko je Quentine Bish?",
      "sr"
    );

    expect(result.handled).toBe(true);
    expect(result.type).toBe("perfumer");
    expect(result.entity.id).toBe("quentin-bisch");
    expect(result.answer).toContain("Quentin Bisch");
  });

  test("renders a source-backed perfumer answer without external generation", () => {
    const perfumer = findPerfumerByQuery(
      "Ko je Quentin Bisch?"
    );
    const answer = getPerfumerKnowledgeAnswer(
      perfumer,
      "sr"
    );

    expect(answer).toContain("Quentin");
    expect(answer).toContain("Bois Impérial");
  });
});
