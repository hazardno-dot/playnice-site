import {
  classifyFragranceKnowledgeQuery,
  findPerfumerByQuery,
  findFragrancePersonalityByQuery,
  getPerfumerKnowledgeAnswer,
  resolveFragranceKnowledgeQuery,
} from "./fragranceKnowledgeRouter";

describe("FI Knowledge — entity routing", () => {
  test.each([
    ["Ko je Quentin Bisch?", "quentin-bisch"],
    ["Ko je Quentine Bish?", "quentin-bisch"],
    ["Who is Francis Kurkdjian?", "francis-kurkdjian"],
    ["parfimer Alberto Morillas", "alberto-morillas"],
    ["Ko je Natalie Lorson?", "nathalie-lorson"],
    ["Dominik Ropion", "dominique-ropion"],
  ])("resolves perfumer %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test("keeps Daniel René out of the perfumer dataset", () => {
    expect(findPerfumerByQuery("Ko je Daniel Renea?")).toBeNull();
  });

  test.each([
    "Ko je Daniel Rene?",
    "Ko je Daniel Renea?",
    "Ko je danielrenemusic?",
  ])("resolves Daniel René as fragrance personality: %s", (query) => {
    const person = findFragrancePersonalityByQuery(query);
    expect(person?.id).toBe("daniel-rene");

    const classified = classifyFragranceKnowledgeQuery(query);
    expect(classified.type).toBe("fragrance-personality");
    expect(classified.entity.id).toBe("daniel-rene");
  });

  test("does not mislabel Daniel René as a perfumer even when user does", () => {
    const result = resolveFragranceKnowledgeQuery(
      "Ko je parfimer Daniel Renea?",
      "sr"
    );
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance-personality");
    expect(result.answer).toContain("ne kao parfemera");
  });

  test.each([
    "Sveže za leto do 15 €",
    "Nešto kao Naxos",
    "Čisto i elegantno za posao",
    "Date night, not too sweet",
  ])("does not intercept Discovery Engine query: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test("routes verified perfumer question into knowledge", () => {
    const result = resolveFragranceKnowledgeQuery("Ko je Quentine Bish?", "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("perfumer");
    expect(result.entity.id).toBe("quentin-bisch");
    expect(result.answer).toContain("Quentin Bisch");
  });

  test("renders source-backed perfumer answer", () => {
    const perfumer = findPerfumerByQuery("Ko je Quentin Bisch?");
    const answer = getPerfumerKnowledgeAnswer(perfumer, "sr");
    expect(answer).toContain("Quentin");
    expect(answer).toContain("Bois Impérial");
  });
});
