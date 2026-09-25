import {
  classifyFragranceKnowledgeQuery,
  findPerfumerByQuery,
  findFragrancePersonalityByQuery,
  findFragranceHouseByQuery,
  findPerfumeByQuery,
  findFragranceTermByQuery,
  getPerfumerKnowledgeAnswer,
  resolveFragranceKnowledgeQuery,
} from "./fragranceKnowledgeRouter";

describe("FI Knowledge — entity routing", () => {
  const discoveryRegressionQueries = [
    "Sveže za leto do 15 €",
    "Nešto kao Naxos",
    "Čisto i elegantno za posao",
    "Date night, not too sweet",
    "Hoću parfem sa Iso E Super do 15 €",
    "Niche parfem za veče do 25 €",
    "Parfem sa jakom projekcijom do 20 €",
    "Oud parfem do 20 €",
    "Vetiver za leto do 15 €",
    "Gourmand za dejt do 20 €",
    "Tobacco parfem za zimu",
    "Kožni parfem za veče",
    "Puderast parfem za nju do 20 €",
    "Aquatic parfem za leto",
    "Kako da nađem oud parfem za veče do 25 €?",
    "Da li imaš niche parfem za posao do 20 €?",
    "Koji parfem sa vetiverom je dobar za leto?",
    "Preporuči nešto puderasto za nju",
    "Treba mi parfem sa jakom projekcijom za izlazak",
    "Želim nešto sa tonkom za zimu",
    "Suggest a woody fragrance for work under €20",
    "How do I find a fresh aquatic fragrance for summer?",
    "Which perfume with ambergris works for a date?",
    "I need a gourmand fragrance under €25",
  ];
  test.each([
    ["Ko je Quentin Bisch?", "quentin-bisch"],
    ["Ko je Quentine Bish?", "quentin-bisch"],
    ["Who is Francis Kurkdjian?", "francis-kurkdjian"],
    ["parfimer Alberto Morillas", "alberto-morillas"],
    ["Ko je Natalie Lorson?", "nathalie-lorson"],
    ["Dominik Ropion", "dominique-ropion"],
    ["Ko je Anne Flipo?", "anne-flipo"],
    ["Ko je Carlos Benaim?", "carlos-benaim"],
    ["Ko je Olivier Cresp?", "olivier-cresp"],
    ["Ko je Hamid Merati Kashani?", "hamid-merati-kashani"],
    ["Ko je Jean Claude Ellena?", "jean-claude-ellena"],
    ["Ko je Jacques Cavallier?", "jacques-cavallier-belletrud"],
    ["Ko je Cecile Zarokian?", "cecile-zarokian"],
    ["Ko je Christine Nagel?", "christine-nagel"],
  ])("resolves perfumer %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Šta je Bois Imperial?", "bois-imperial"],
    ["Ko je napravio Nice Bergamote?", "nice-bergamote"],
    ["Ko potpisuje Orange X Santal?", "orange-x-santal"],
  ])("resolves fragrance entity %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Essential Parfums?", "essential-parfums"],
    ["Šta je MFK?", "maison-francis-kurkdjian"],
    ["Ko je Frederic Malle?", "frederic-malle"],
    ["Šta je Givaudan?", "givaudan"],
    ["Šta je dsm-firmenich?", "dsm-firmenich"],
    ["Šta je IFF?", "iff"],
  ])("resolves fragrance house/company %s", (query, expectedId) => {
    expect(findFragranceHouseByQuery(query)?.id).toBe(expectedId);
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
    ["Kako i gde treba pravilno čuvati parfem?", "fragrance-storage"],
    ["Koja je razlika između designer i niche parfema?", "niche-designer-indie"],
    ["Šta su mirisne porodice?", "fragrance-families"],
    ["Šta su parfemske porodice?", "fragrance-families"],
    ["Šta je chypre parfem?", "chypre"],
    ["Šta je fougere?", "fougere"],
    ["Šta znači gourmand parfem?", "gourmand"],
    ["Šta je oud?", "oud"],
    ["Šta je ambergris?", "ambergris"],
    ["Šta je orris?", "orris-iris"],
    ["Šta je pačuli?", "patchouli"],
    ["Šta je vetiver?", "vetiver"],
    ["Koja je razlika između nerolija i orange blossoma?", "neroli-orange-blossom"],
    ["Koja je razlika između neroli i orange blossom?", "neroli-orange-blossom"],
    ["Šta je mošus u parfemu?", "musk"],
    ["Šta je fiksativ u parfemu?", "fixative"],
    ["Šta su aldehidi u parfemu?", "aldehydes"],
    ["Šta je kumarin?", "coumarin"],
    ["Šta je labdanum?", "labdanum"],
    ["Šta je benzoin?", "benzoin"],
    ["Šta je tonka bean?", "tonka-bean"],
    ["Šta je šafran u parfemu?", "saffron"],
    ["Šta je kožna nota u parfemu?", "leather-accord"],
    ["Šta je Calone?", "aquatic-calone"],
    ["Šta je olibanum?", "incense-olibanum"],
    ["Šta znači tobacco note?", "tobacco-note"],
    ["Šta znači puderast parfem?", "powdery-effect"],
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
    "Oud parfem do 20 €",
    "Vetiver za leto do 15 €",
    "Gourmand za dejt do 20 €",
    "Musk parfem za posao",
    "Tobacco parfem za zimu",
    "Kožni parfem za veče",
    "Puderast parfem za nju do 20 €",
    "Aquatic parfem za leto",
  ])("does not steal recommendation-style material query: %s", (query) => {
    expect(findFragranceTermByQuery(query)).toBeNull();
  });

  test.each(discoveryRegressionQueries)(
    "does not intercept Discovery Engine query: %s",
    (query) => {
      expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
        handled: false,
        type: "unknown",
        confidence: "low",
        entity: null,
        answer: "",
      });
    }
  );

  test.each([
    ["Ko radi u Givaudanu?", "Quentin Bisch"],
    ["Ko radi u Givaudan?", "Quentin Bisch"],
    ["Koji parfimeri rade u dsm-firmenichu?", "Alberto Morillas"],
    ["Koji parfimeri rade u dsm-firmenich?", "Alberto Morillas"],
    ["Koji parfimeri rade u Essential Parfums?", "Quentin Bisch"],
    ["Who works at Givaudan?", "Quentin Bisch"],
    ["Ko radi u IFF-u?", "Anne Flipo"],
    ["Ko radi u IFF-u?", "Carlos Benaïm"],
  ])("answers house-to-perfumer relationship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Gde radi Quentin Bisch?", "Givaudan"],
    ["Za koga radi Nathalie Lorson?", "dsm-firmenich"],
    ["Where does Alberto Morillas work?", "dsm-firmenich"],
    ["Gde radi Olivier Cresp?", "dsm-firmenich"],
    ["Gde radi Carlos Benaim?", "IFF"],
  ])("answers perfumer-to-house relationship %s", (query, expectedHouse) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.answer).toContain(expectedHouse);
  });

  test.each([
    ["Ko je napravio Bois Imperial?", "Quentin Bisch"],
    ["Ko je parfimer Nice Bergamote?", "Antoine Maisondieu"],
    ["Ko potpisuje Orange X Santal?", "Natalie Gracia-Cetto"],
  ])("answers perfume authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test("answers which verified perfumes by a perfumer are in PlayNice", () => {
    const products = [
      { slug: "bois-imperial-essential-parfums" },
      { slug: "essential-parfums-nice-bergamote" },
    ];

    const result = resolveFragranceKnowledgeQuery(
      "Šta imate od Quentin Bisch?",
      "sr",
      { products }
    );

    expect(result.handled).toBe(true);
    expect(result.answer).toContain("Bois Impérial");
    expect(result.answer).not.toContain("Nice Bergamote");
  });

  test("does not claim catalog availability when product is absent", () => {
    const result = resolveFragranceKnowledgeQuery(
      "Šta imate od Quentin Bisch?",
      "sr",
      { products: [] }
    );

    expect(result.handled).toBe(true);
    expect(result.answer).toContain("nemam potvrđen");
  });

  test("routes fragrance house question into knowledge", () => {
    const result = resolveFragranceKnowledgeQuery(
      "Ko je Essential Parfums?",
      "sr"
    );

    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance-house");
    expect(result.entity.id).toBe("essential-parfums");
    expect(result.answer).toContain("Essential Parfums");
  });

  test("routes fragrance company question into knowledge", () => {
    const result = resolveFragranceKnowledgeQuery(
      "Šta je Givaudan?",
      "sr"
    );

    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance-company");
    expect(result.entity.id).toBe("givaudan");
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

  test.each([
    "Kako da nađem oud parfem za veče do 25 €?",
    "Da li imaš niche parfem za posao do 20 €?",
    "How do I find a fresh aquatic fragrance for summer?",
    "Which perfume with ambergris works for a date?",
  ])("recommendation intent wins even when a knowledge cue is present: %s", (query) => {
    expect(findFragranceTermByQuery(query)).toBeNull();
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
