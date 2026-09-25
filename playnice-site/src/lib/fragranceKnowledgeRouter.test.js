import {
  classifyFragranceKnowledgeQuery,
  findPerfumerByQuery,
  findFragrancePersonalityByQuery,
  findFragranceTermByQuery,
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

  test("keeps Daniel René canonical without Serbian case ending in aliases", () => {
    expect(findFragrancePersonalityByQuery("Ko je Daniel Rene?")?.id).toBe("daniel-rene");
    expect(findFragrancePersonalityByQuery("Ko je Daniel Renea?")).toBeNull();
  });

  test("does not mislabel Daniel René as a perfumer", () => {
    expect(findPerfumerByQuery("Ko je Daniel Rene?")).toBeNull();
    const result = resolveFragranceKnowledgeQuery("Ko je Daniel Rene?", "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance-personality");
  });

  test.each([
    ["Šta je sillage?", "sillage"],
    ["Šta znači EDP?", "fragrance-concentration"],
    ["Objasni Iso E Super", "iso-e-super"],
    ["What is Hedione?", "hedione"],
    ["Šta je Ambroxan?", "ambrox"],
    ["Zašto ne osećam svoj parfem?", "olfactory-fatigue"],
    ["Zbog čega ne mogu da osetim parfem?", "olfactory-fatigue"],
    ["Why can't I smell my own perfume?", "olfactory-fatigue"],
    ["Objasni top heart i base notes", "note-pyramid"],
    ["Šta znači trajnost parfema?", "longevity"],
    ["Šta je parfemski akord?", "accord"],
    ["Šta je projection?", "projection"],
    ["Koja je razlika između projection i sillage?", "projection"],
    ["Šta je flanker parfem?", "flanker"],
    ["Šta znači reformulacija parfema?", "reformulation"],
    ["Koja je razlika između niche i designer parfema?", "niche-designer-indie"],
    ["Šta je maceracija parfema?", "maceration"],
    ["Prirodni vs sintetički sastojci — koja je razlika?", "natural-vs-synthetic"],
    ["Kako se radi layering parfema?", "layering"],
    ["Blotter ili koža — kako da testiram parfem?", "blotter-vs-skin"],
    ["Kako treba čuvati parfem?", "fragrance-storage"],
  ])("resolves explanatory fragrance term %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Hoću parfem sa Iso E Super do 15 €",
    "EDP za posao do 20 €",
    "Nešto sa Hedione za leto",
    "Parfem sa Ambroxanom za izlazak",
    "Trajan parfem za posao do 20 €",
    "Niche parfem za veče do 25 €",
    "Designer parfem za posao",
    "Parfem sa jakom projekcijom do 20 €",
    "Parfem za layering do 15 €",
  ])("does not steal recommendation-style material query: %s", (query) => {
    expect(findFragranceTermByQuery(query)).toBeNull();
  });

  test.each([
    "Sveže za leto do 15 €",
    "Nešto kao Naxos",
    "Čisto i elegantno za posao",
    "Date night, not too sweet",
    "Hoću parfem sa Iso E Super do 15 €",
    "Niche parfem za veče do 25 €",
    "Parfem sa jakom projekcijom do 20 €",
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

  test("ordered-token matching handles natural wording with filler words", () => {
    expect(
      findFragranceTermByQuery(
        "Why can't I smell my own perfume?"
      )?.id
    ).toBe("olfactory-fatigue");

    expect(
      findFragranceTermByQuery(
        "Kako i gde treba pravilno čuvati parfem?"
      )?.id
    ).toBe("fragrance-storage");
  });

  test("answers fragrance education without invoking recommendation routing", () => {
    const result = resolveFragranceKnowledgeQuery("Šta je Iso E Super?", "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance-term");
    expect(result.answer).toContain("IFF");
  });
});
