import { perfumers } from "../data/knowledge/perfumers";
import { fragranceHouses } from "../data/knowledge/fragranceHouses";
import { fragrancePerfumes } from "../data/knowledge/fragrancePerfumes";
import { fragranceTerms } from "../data/knowledge/fragranceTerms";
import {
  findPerfumerByQuery,
  findPerfumeByQuery,
  findFragranceTermByQuery,
  resolveFragranceKnowledgeQuery,
} from "./fragranceKnowledgeRouter";

const expectUniqueIds = (items) => {
  const ids = items.map((item) => item.id);
  expect(new Set(ids).size).toBe(ids.length);
};

const expectHttpsSources = (sources = []) => {
  expect(sources.length).toBeGreaterThan(0);
  sources.forEach((source) => {
    expect(source.url).toMatch(/^https:\/\//);
    expect(source.label).toBeTruthy();
    expect(source.type).toBeTruthy();
  });
};

describe("FI Ultra knowledge expansion contract", () => {
  test("keeps knowledge graph IDs unique and referentially valid", () => {
    expectUniqueIds(perfumers);
    expectUniqueIds(fragranceHouses);
    expectUniqueIds(fragrancePerfumes);
    expectUniqueIds(fragranceTerms);

    const perfumerIds = new Set(perfumers.map((item) => item.id));
    const houseIds = new Set(fragranceHouses.map((item) => item.id));

    fragrancePerfumes.forEach((fragrance) => {
      expect(houseIds.has(fragrance.houseId)).toBe(true);
      expect(fragrance.perfumerIds.length).toBeGreaterThan(0);
      fragrance.perfumerIds.forEach((id) => {
        expect(perfumerIds.has(id)).toBe(true);
      });
      const house = fragranceHouses.find((item) => item.id === fragrance.houseId);
      fragrance.perfumerIds.forEach((id) => {
        expect((house?.perfumerIds || []).includes(id)).toBe(true);
      });
      expect(fragrance.summary?.sr).toBeTruthy();
      expect(fragrance.summary?.en).toBeTruthy();
      expect(fragrance.aliases?.length).toBeGreaterThan(0);
      expectHttpsSources(fragrance.sources);
    });

    fragranceHouses.forEach((house) => {
      (house.perfumerIds || []).forEach((id) => {
        expect(perfumerIds.has(id)).toBe(true);
      });
      expectHttpsSources(house.sourceLinks);
    });

    perfumers.forEach((perfumer) => {
      expectHttpsSources(perfumer.sources);
    });

    fragranceTerms.forEach((term) => {
      expect(term.answer?.sr).toBeTruthy();
      expect(term.answer?.en).toBeTruthy();
      expectHttpsSources(term.sources);
    });
  });

  test("raises explicit minimum coverage without weakening source contracts", () => {
    expect(fragranceTerms.length).toBeGreaterThanOrEqual(480);
    expect(perfumers.length).toBeGreaterThanOrEqual(38);
    expect(fragranceHouses.length).toBeGreaterThanOrEqual(15);
    expect(fragrancePerfumes.length).toBeGreaterThanOrEqual(80);
  });

  test.each([
    ["Ko je Edmond Rudnitska?", "edmond-roudnitska"],
    ["Who is Edmond Roudnitska?", "edmond-roudnitska"],
  ])("resolves new heritage perfumer %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Diorissimo?", "dior-diorissimo"],
    ["Who created Dior Diorissimo?", "dior-diorissimo"],
  ])("resolves new heritage fragrance %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Šta je Clearwood?", "clearwood"],
    ["Objasni Clear Wood Prisma", "clearwood"],
    ["What is Dreamwood?", "dreamwood"],
    ["Šta je Helvetolide mošus?", "helvetolide"],
    ["What does Z11 do in perfumery?", "z11"],
  ])("resolves advanced material query %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Diorissimo?", "Edmond Roudnitska"],
    ["Who created Diorissimo?", "Edmond Roudnitska"],
  ])("answers Diorissimo authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    "Parfem sa Clearwood za jesen",
    "Treba mi nešto sa Dreamwood do 25 €",
    "Helvetolide parfem za posao",
    "Preporuči nešto sa Z11 za zimu",
    "Nešto kao Diorissimo za proleće",
    "Recommend something like Diorissimo for spring",
  ])("new knowledge entities do not steal recommendation intent: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });
  test.each([
    ["Ko je Guy Robert?", "guy-robert"],
    ["Who is Guy Robert?", "guy-robert"],
    ["Ko je Gi Robert?", "guy-robert"],
  ])("resolves additional heritage perfumer %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio L Heure Bleue?", "guerlain-lheure-bleue-1912"],
    ["Who created L'Heure Bleue?", "guerlain-lheure-bleue-1912"],
    ["Ko je napravio Mitsouko?", "guerlain-mitsouko-1919"],
    ["Ko je napravio Mitsuko?", "guerlain-mitsouko-1919"],
    ["Ko je parfimer Calèche?", "hermes-caleche-edt"],
    ["Who created Hermes Caleche?", "hermes-caleche-edt"],
  ])("resolves additional heritage fragrance %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Šta je Habanolide?", "habanolide"],
    ["Objasni Habanolide mošus", "habanolide"],
    ["What is Muscenone Delta?", "muscenone-delta"],
    ["Šta je Exaltolide musk?", "exaltolide"],
    ["What does Damascenone do in perfumery?", "damascenone"],
  ])("resolves second advanced molecule batch %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio L Heure Bleue?", "Jacques Guerlain"],
    ["Ko je napravio Mitsouko?", "Jacques Guerlain"],
    ["Ko je napravio Caleche?", "Guy Robert"],
  ])("answers additional heritage authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    "Parfem sa Habanolide za posao",
    "Treba mi nešto sa Muscenone do 25 €",
    "Exaltolide parfem za svaki dan",
    "Preporuči nešto sa Damascenone za veče",
    "Nešto kao Mitsouko ali modernije",
    "Something like L Heure Bleue for winter",
    "Alternativa za Caleche za posao",
  ])("second expansion does not steal recommendation intent: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je habanolide, zapravo?", "habanolide"],
    ["Možeš li objasniti šta je Muscenone Delta?", "muscenone-delta"],
    ["What exactly is Exaltolide in perfumery?", "exaltolide"],
    ["Objasni mi molim te Damascenone u parfimeriji", "damascenone"],
  ])("handles filler words and punctuation around new molecule aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Pierre Francois Pascal Guerlain?", "pierre-francois-pascal-guerlain"],
    ["Ko je Pjer Fransoa Paskal Gerlen?", "pierre-francois-pascal-guerlain"],
    ["Who is Aimé Guerlain?", "aime-guerlain"],
    ["Ko je Eme Gerlen?", "aime-guerlain"],
  ])("resolves Guerlain generation perfumer %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Eau de Cologne Imperiale?", "guerlain-eau-de-cologne-imperiale-1853"],
    ["Who created Guerlain Eau de Cologne Impériale?", "guerlain-eau-de-cologne-imperiale-1853"],
    ["Ko je napravio Jicky?", "guerlain-jicky-1889"],
    ["Ko je napravio Jiki?", "guerlain-jicky-1889"],
    ["Ko je napravio Cologne du Coq?", "guerlain-eau-de-cologne-du-coq-1894"],
  ])("resolves Guerlain heritage fragrance %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Šta je Norlimbanol?", "norlimbanol"],
    ["What exactly is Ambrofix?", "ambrofix"],
    ["Objasni Amber Extreme", "amber-xtreme"],
    ["What is Akigala Wood?", "akigalawood"],
  ])("resolves woody amber molecule expansion %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Eau de Cologne Imperiale?", "Pierre-François-Pascal Guerlain"],
    ["Ko je napravio Jicky?", "Aimé Guerlain"],
    ["Ko je napravio Eau de Cologne du Coq?", "Aimé Guerlain"],
  ])("answers Guerlain generation authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test("Guerlain house graph exposes all verified historical perfumers", () => {
    const result = resolveFragranceKnowledgeQuery("Koji parfimeri rade u Guerlain?", "sr");
    expect(result.handled).toBe(true);
    expect(result.answer).toContain("Pierre-François-Pascal Guerlain");
    expect(result.answer).toContain("Aimé Guerlain");
    expect(result.answer).toContain("Jacques Guerlain");
  });

  test.each([
    "Parfem sa Norlimbanol za zimu",
    "Treba mi nešto sa Ambrofix do 30 €",
    "Amber Xtreme parfem za izlazak",
    "Preporuči nešto sa Akigalawood",
    "Nešto kao Jicky ali modernije",
    "Alternative to Eau de Cologne Imperiale for summer",
    "Cologne du Coq za svaki dan",
  ])("third expansion preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Norlimbanol, zapravo?", "norlimbanol"],
    ["What really is Ambrofix in perfumery?", "ambrofix"],
    ["Objasni mi Amber Xtreme molekul", "amber-xtreme"],
    ["Možeš li objasniti šta je Akigalawood?", "akigalawood"],
  ])("handles natural phrasing around woody amber aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Un Jardin sur le Nil?", "hermes-un-jardin-sur-le-nil"],
    ["Who created Hermes Un Jardin sur le Nil?", "hermes-un-jardin-sur-le-nil"],
    ["Ko potpisuje Eau de rhubarbe ecarlate?", "hermes-eau-de-rhubarbe-ecarlate"],
    ["Who created Eau de Citron Noir?", "hermes-eau-de-citron-noir"],
  ])("resolves modern Hermès authorship entity %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Un Jardin sur le Nil?", "Jean-Claude Ellena"],
    ["Ko je napravio Eau de rhubarbe écarlate?", "Christine Nagel"],
    ["Ko je napravio Eau de citron noir?", "Christine Nagel"],
  ])("answers modern Hermès authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Florhydral?", "florhydral"],
    ["What exactly is Nympheal?", "nympheal"],
    ["Objasni Muguissimo", "muguissimo"],
    ["Šta je Dupical muguet?", "dupical"],
  ])("resolves muguet molecule layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Florhydral za proleće",
    "Treba mi nešto sa Nympheal za leto",
    "Muguissimo parfem za svaki dan",
    "Preporuči nešto sa Dupical",
    "Nešto kao Un Jardin sur le Nil do 20 €",
    "Alternative to Eau de rhubarbe ecarlate",
    "Citron Noir za posao do 25 €",
  ])("muguet and modern authorship layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je florhydral, zapravo?", "florhydral"],
    ["What really is Nympheal in perfumery?", "nympheal"],
    ["Možeš li objasniti šta je Muguissimo?", "muguissimo"],
    ["Objasni mi, molim te, Dupical muguet molekul", "dupical"],
  ])("handles filler words around muguet molecule aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("prefers the longer perfume alias over generic Nil wording", () => {
    expect(findPerfumeByQuery("Ko je napravio Hermès Un Jardin sur le Nil?")?.id)
      .toBe("hermes-un-jardin-sur-le-nil");
  });

  test.each([
    ["Ko je napravio Barenia?", "hermes-barenia-edp"],
    ["Who created Hermès Barénia?", "hermes-barenia-edp"],
    ["Ko potpisuje Agar Ebene?", "hermes-agar-ebene"],
    ["Who created Eau de basilic pourpre?", "hermes-eau-de-basilic-pourpre"],
  ])("resolves contemporary Christine Nagel authorship %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Barénia?", "Christine Nagel"],
    ["Ko je napravio Agar Ebene?", "Christine Nagel"],
    ["Ko je napravio Eau de basilic pourpre?", "Christine Nagel"],
  ])("answers contemporary Hermès authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Jasmone Cis?", "jasmone-cis"],
    ["What exactly is Jasmolactone Delta?", "jasmolactone-delta"],
    ["Objasni Josenol muguet", "josenol"],
    ["Šta je Firascone rose ketone?", "firascone"],
  ])("resolves rose jasmine chemistry layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Jasmone Cis za proleće",
    "Treba mi nešto sa Jasmolactone Delta",
    "Josenol parfem za svaki dan",
    "Preporuči nešto sa Firascone",
    "Nešto kao Barenia ali jeftinije",
    "Alternative to Agar Ebene",
    "Basilic Pourpre za leto do 25 €",
  ])("rose jasmine layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je cis jasmone, zapravo?", "jasmone-cis"],
    ["What really is Jasmolactone in perfumery?", "jasmolactone-delta"],
    ["Možeš li objasniti šta je Josenol?", "josenol"],
    ["Objasni mi Firascone molekul", "firascone"],
  ])("handles natural phrasing around rose jasmine aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Maurice Roucel?", "maurice-roucel"],
    ["Ko je Moris Rusel?", "maurice-roucel"],
    ["Who is Maurice Roucel?", "maurice-roucel"],
  ])("resolves Maurice Roucel aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Musc Ravageur?", "frederic-malle-musc-ravageur"],
    ["Who created Bigarade Concentree?", "frederic-malle-bigarade-concentree"],
    ["Ko potpisuje Cologne Indelebile?", "frederic-malle-cologne-indelebile"],
  ])("resolves Frédéric Malle authorship entity %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Musc Ravageur?", "Maurice Roucel"],
    ["Ko je napravio Bigarade Concentrée?", "Jean-Claude Ellena"],
    ["Ko je napravio Cologne Indélébile?", "Dominique Ropion"],
  ])("answers Frédéric Malle authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Meth Ionone Alpha Extra?", "meth-ionone-alpha-extra"],
    ["What is Meth Ionone Gamma Pure?", "meth-ionone-gamma-pure"],
    ["Objasni Irisone Pure", "irisone-pure"],
    ["Šta je Irone Alpha?", "irone-alpha"],
    ["What exactly is Dihydro Ionone Beta?", "dihydro-ionone-beta"],
  ])("resolves ionone orris chemistry layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Meth Ionone Alpha Extra",
    "Treba mi nešto sa Irisone Pure za posao",
    "Irone Alpha parfem do 30 €",
    "Preporuči nešto sa Dihydro Ionone Beta",
    "Nešto kao Musc Ravageur ali blaže",
    "Alternative to Bigarade Concentree",
    "Cologne Indelebile za leto",
  ])("ionone authorship layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je alpha methyl ionone?", "meth-ionone-alpha-extra"],
    ["Objasni gamma meth ionone", "meth-ionone-gamma-pure"],
    ["Možeš li objasniti Irisone violet?", "irisone-pure"],
    ["What really is alpha irone in perfumery?", "irone-alpha"],
    ["Objasni mi dihydroionone beta", "dihydro-ionone-beta"],
  ])("handles ionone family aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Sophia Grojsman?", "sophia-grojsman"],
    ["Ko je Sofija Grojsman?", "sophia-grojsman"],
    ["Who is Pierre Bourdon?", "pierre-bourdon"],
    ["Ko je Pjer Burdon?", "pierre-bourdon"],
  ])("resolves new Frédéric Malle perfumer aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Outrageous?", "frederic-malle-outrageous"],
    ["Who created Frédéric Malle Outrageous?", "frederic-malle-outrageous"],
    ["Ko je napravio Iris Poudre?", "frederic-malle-iris-poudre"],
  ])("resolves new Frédéric Malle perfume entity %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Outrageous?", "Sophia Grojsman"],
    ["Ko je napravio Iris Poudre?", "Pierre Bourdon"],
  ])("answers new Frédéric Malle authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Liffarome?", "liffarome"],
    ["What exactly is Vertoliff?", "vertoliff"],
    ["Objasni Limoxal citrus", "limoxal"],
    ["Šta je Bergamal?", "bergamal"],
  ])("resolves green citrus chemistry layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Liffarome za proleće",
    "Treba mi nešto sa Vertoliff",
    "Limoxal parfem za leto",
    "Preporuči nešto sa Bergamal do 25 €",
    "Nešto kao Outrageous ali jeftinije",
    "Alternative to Iris Poudre",
  ])("green citrus authorship layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je liffarome green?", "liffarome"],
    ["Možeš li objasniti šta je Vertolif?", "vertoliff"],
    ["What really is Limoxal in perfumery?", "limoxal"],
    ["Objasni mi Bergamal citrus molekul", "bergamal"],
  ])("handles green citrus aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Edouard Flechier?", "edouard-flechier"],
    ["Ko je Eduar Flesije?", "edouard-flechier"],
    ["Who is Michel Roudnitska?", "michel-roudnitska"],
    ["Ko je Mišel Rudnitska?", "michel-roudnitska"],
  ])("resolves dark-style perfumer aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Rose Tonnerre?", "frederic-malle-rose-tonnerre"],
    ["Who created Rose Tonnerre?", "frederic-malle-rose-tonnerre"],
    ["Ko potpisuje Noir Epices?", "frederic-malle-noir-epices"],
  ])("resolves leather spice authorship entity %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Rose Tonnerre?", "Édouard Fléchier"],
    ["Ko je napravio Noir Épices?", "Michel Roudnitska"],
  ])("answers leather spice authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Iso Butyl Quinoline?", "iso-butyl-quinoline"],
    ["Objasni IBQ leather", "iso-butyl-quinoline"],
    ["What exactly is Safraleine?", "safraleine"],
    ["Šta je Safranal?", "safranal"],
    ["Objasni Kephalis tobacco", "kephalis"],
    ["What is Veraspice?", "veraspice"],
    ["Šta je Trimofix amber?", "trimofix"],
  ])("resolves leather tobacco spice chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Iso Butyl Quinoline",
    "Treba mi nešto sa Safraleine za zimu",
    "Safranal parfem za veče",
    "Preporuči nešto sa Kephalis",
    "Veraspice parfem do 30 €",
    "Nešto sa Trimofix za jesen",
    "Nešto kao Rose Tonnerre ali lakše",
    "Alternative to Noir Epices",
  ])("leather tobacco spice layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je IBQ?", "iso-butyl-quinoline"],
    ["Možeš li objasniti Safralein?", "safraleine"],
    ["What really is Safranal in perfumery?", "safranal"],
    ["Objasni mi Kefalis tobacco molekul", "kephalis"],
    ["Sta je vera spice?", "veraspice"],
    ["Možeš li objasniti Trimofix woody?", "trimofix"],
  ])("handles leather tobacco aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Bruno Jovanovic?", "bruno-jovanovic"],
    ["Ko je Bruno Jovanović?", "bruno-jovanovic"],
    ["Who is Olivier Pescheux?", "olivier-pescheux"],
    ["Ko je Olivije Pešo?", "olivier-pescheux"],
  ])("resolves Essential Parfums perfumer aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Mon Vetiver?", "essential-parfums-mon-vetiver"],
    ["Who created Essential Parfums Mon Vetiver?", "essential-parfums-mon-vetiver"],
    ["Ko je napravio Divine Vanille?", "essential-parfums-divine-vanille"],
  ])("resolves Essential Parfums authorship entity %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Mon Vetiver?", "Bruno Jovanovic"],
    ["Ko je napravio Divine Vanille?", "Olivier Pescheux"],
  ])("answers Essential Parfums authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Ultravanil?", "ultravanil"],
    ["What exactly is Isobutavan?", "isobutavan"],
    ["Objasni Okoumal amber", "okoumal"],
    ["Šta je Cetalor ambergris?", "cetalor"],
    ["What is Ambermax?", "ambermax"],
    ["Objasni Benzoin Resoid Siam", "benzoin-resoid-siam"],
  ])("resolves amber vanilla resin layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Ultravanil za zimu",
    "Treba mi nešto sa Isobutavan",
    "Okoumal parfem za veče",
    "Preporuči nešto sa Cetalor",
    "Ambermax parfem do 30 €",
    "Nešto sa Benzoin Siam",
    "Nešto kao Mon Vetiver ali jeftinije",
    "Alternative to Divine Vanille",
  ])("amber vanilla resin layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je ultra vanil?", "ultravanil"],
    ["Možeš li objasniti Isobutavan vanilla?", "isobutavan"],
    ["What really is Okoumal in perfumery?", "okoumal"],
    ["Objasni mi Cetalor ambergris", "cetalor"],
    ["Sta je Amber Max?", "ambermax"],
    ["Možeš li objasniti benzoin resinoid?", "benzoin-resoid-siam"],
  ])("handles amber vanilla resin aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Calice Becker?", "calice-becker"],
    ["Ko je Kalis Beker?", "calice-becker"],
    ["Who is Calice Becker?", "calice-becker"],
  ])("resolves Calice Becker aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Fig Infusion?", "essential-parfums-fig-infusion"],
    ["Who created Essential Parfums Fig Infusion?", "essential-parfums-fig-infusion"],
    ["Ko je napravio The Musc?", "essential-parfums-the-musc"],
  ])("resolves aquatic fruity batch authorship entity %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Fig Infusion?", "Nathalie Lorson"],
    ["Ko je napravio The Musc?", "Calice Becker"],
  ])("answers aquatic fruity batch authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Floralozone?", "floralozone"],
    ["What exactly is Helional?", "helional"],
    ["Objasni Aquaflora aquatic", "aquaflora"],
    ["Šta je Tropicalia?", "tropicalia"],
    ["What is Methyl Laitone?", "methyl-laitone"],
    ["Objasni Frutonile peach", "frutonile"],
  ])("resolves aquatic fruity lactonic chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Floralozone za leto",
    "Treba mi nešto sa Helional",
    "Aquaflora parfem za posao",
    "Preporuči nešto sa Tropicalia",
    "Methyl Laitone parfem do 30 €",
    "Nešto sa Frutonile",
    "Nešto kao Fig Infusion ali jeftinije",
    "Alternative to The Musc",
  ])("aquatic fruity layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je floral ozone?", "floralozone"],
    ["Možeš li objasniti Helional aquatic?", "helional"],
    ["What really is Aqua Flora in perfumery?", "aquaflora"],
    ["Objasni mi Tropicalia fruity", "tropicalia"],
    ["Sta je methyl lactone?", "methyl-laitone"],
    ["Možeš li objasniti Frutonile lactonic?", "frutonile"],
  ])("handles aquatic fruity aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Sophie Labbe?", "sophie-labbe"],
    ["Ko je Sofi Labe?", "sophie-labbe"],
    ["Who is Fabrice Pellegrin?", "fabrice-pellegrin"],
    ["Ko je Fabris Pelegrin?", "fabrice-pellegrin"],
  ])("resolves musk batch perfumer aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Rose Magnetic?", "essential-parfums-rose-magnetic"],
    ["Who created Essential Parfums Rose Magnetic?", "essential-parfums-rose-magnetic"],
    ["Ko je napravio Patchouli Mania?", "essential-parfums-patchouli-mania"],
  ])("resolves musk batch authorship entity %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Rose Magnetic?", "Sophie Labbé"],
    ["Ko je napravio Patchouli Mania?", "Fabrice Pellegrin"],
  ])("answers musk batch authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Galaxolide?", "galaxolide"],
    ["What exactly is Velvione?", "velvione"],
    ["Objasni Muscemor animalic", "muscemor"],
    ["Šta je Hexadecanolide musk?", "hexadecanolide"],
    ["What is Zenolide?", "zenolide"],
    ["Objasni Orionide clean musk", "orionide-oliffac"],
  ])("resolves musk family chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Galaxolide za svaki dan",
    "Treba mi nešto sa Velvione",
    "Muscemor parfem za veče",
    "Preporuči nešto sa Hexadecanolide",
    "Zenolide parfem do 30 €",
    "Nešto sa Orionide musk",
    "Nešto kao Rose Magnetic ali manje slatko",
    "Alternative to Patchouli Mania",
  ])("musk family layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Galaxolid?", "galaxolide"],
    ["Možeš li objasniti Velvion musk?", "velvione"],
    ["What really is Muscemor in perfumery?", "muscemor"],
    ["Objasni mi sweet macrocyclic musk", "hexadecanolide"],
    ["Sta je Zenolid?", "zenolide"],
    ["Možeš li objasniti Orionide?", "orionide-oliffac"],
  ])("handles musk family aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Terre d Hermes Eau Intense Vetiver?", "hermes-terre-eau-intense-vetiver"],
    ["Who created Terre d'Hermes Eau Intense Vetiver?", "hermes-terre-eau-intense-vetiver"],
    ["Ko je napravio Terre EDP Intense?", "hermes-terre-eau-de-parfum-intense"],
    ["Who created Bois Imperial Extrait?", "essential-parfums-bois-imperial-extrait"],
  ])("resolves woody batch authorship entities %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Terre d Hermes Eau Intense Vetiver?", "Christine Nagel"],
    ["Ko je napravio Terre d Hermes Eau de Parfum Intense?", "Christine Nagel"],
    ["Ko je napravio Bois Imperial Extrait?", "Quentin Bisch"],
  ])("answers woody batch authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Javanol?", "javanol"],
    ["What exactly is Bacdanol?", "bacdanol"],
    ["Objasni Polysantol sandalwood", "polysantol"],
    ["Šta je Cedramber?", "cedramber"],
    ["What is Cedroxyde?", "cedroxyde"],
    ["Objasni Timberol woody", "timberol"],
  ])("resolves sandalwood cedar vetiver chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Javanol za zimu",
    "Treba mi nešto sa Bacdanol",
    "Polysantol parfem za posao",
    "Preporuči nešto sa Cedramber",
    "Cedroxyde parfem do 30 €",
    "Nešto sa Timberol",
    "Nešto kao Terre Eau Intense Vetiver ali jeftinije",
    "Alternative to Bois Imperial Extrait",
  ])("woody material layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Javanol sandalwood?", "javanol"],
    ["Možeš li objasniti Bakdanol?", "bacdanol"],
    ["What really is Polisantal in perfumery?", "polysantol"],
    ["Objasni mi Cedramber cedar", "cedramber"],
    ["Sta je Cedroxide?", "cedroxyde"],
    ["Možeš li objasniti Timberol amber?", "timberol"],
  ])("handles woody material aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Henri Robert?", "henri-robert"],
    ["Ko je Anri Rober?", "henri-robert"],
    ["Who is Jacques Polge?", "jacques-polge"],
    ["Ko je Zak Polz?", "jacques-polge"],
  ])("resolves CHANEL lineage perfumer aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Chanel No 19?", "chanel-no19-edt"],
    ["Who created CHANEL N19?", "chanel-no19-edt"],
    ["Ko je napravio Coco Mademoiselle?", "chanel-coco-mademoiselle-2001"],
    ["Who created Bleu de Chanel?", "chanel-bleu-de-chanel-2010"],
  ])("resolves CHANEL lineage authorship entities %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Chanel No 19?", "Henri Robert"],
    ["Ko je napravio Coco Mademoiselle?", "Jacques Polge"],
    ["Ko je napravio Bleu de Chanel?", "Jacques Polge"],
  ])("answers CHANEL lineage authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Aldehyde Iso C11?", "aldehyde-iso-c11"],
    ["What exactly is Syringa Aldehyde?", "syringa-aldehyde"],
    ["Objasni Myrac aldehyde", "myrac-aldehyde"],
    ["Šta je Cyclamen Aldehyde Extra?", "cyclamen-aldehyde-extra"],
    ["What is Cortex Aldehyde?", "cortex-aldehyde"],
    ["Objasni Pino Acetaldehyde", "pino-acetaldehyde"],
  ])("resolves aldehydic clean fresh chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Aldehyde Iso C11",
    "Treba mi nešto sa Syringa Aldehyde",
    "Myrac Aldehyde parfem za leto",
    "Preporuči nešto sa Cyclamen Aldehyde Extra",
    "Cortex Aldehyde parfem do 30 €",
    "Nešto sa Pino Acetaldehyde",
    "Nešto kao Chanel No 19 ali modernije",
    "Alternative to Coco Mademoiselle",
    "Bleu de Chanel alternativa za posao",
  ])("aldehydic CHANEL layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je iso c11 aldehyde?", "aldehyde-iso-c11"],
    ["Možeš li objasniti lilac aldehyde?", "syringa-aldehyde"],
    ["What really is clean outdoors aldehyde?", "myrac-aldehyde"],
    ["Objasni mi ciklama aldehid", "cyclamen-aldehyde-extra"],
    ["Sta je green stem aldehyde?", "cortex-aldehyde"],
    ["Možeš li objasniti marine pine aldehyde?", "pino-acetaldehyde"],
  ])("handles aldehydic aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("CHANEL house graph exposes historical and current perfumer lineage", () => {
    const result = resolveFragranceKnowledgeQuery("Koji parfimeri rade u Chanel?", "sr");
    expect(result.handled).toBe(true);
    expect(result.answer).toContain("Ernest Beaux");
    expect(result.answer).toContain("Henri Robert");
    expect(result.answer).toContain("Jacques Polge");
    expect(result.answer).toContain("Olivier Polge");
  });

  test.each([
    ["Ko je Jordi Fernandez?", "jordi-fernandez"],
    ["Ko je Đordi Fernandez?", "jordi-fernandez"],
    ["Who is Jordi Fernández?", "jordi-fernandez"],
  ])("resolves Jordi Fernández aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Ambre Latte?", "essential-parfums-ambre-latte"],
    ["Who created Essential Parfums Ambre Latte?", "essential-parfums-ambre-latte"],
    ["Ko je napravio Velvet Iris?", "essential-parfums-velvet-iris"],
  ])("resolves gourmand batch authorship entities %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Ambre Latte?", "Jordi Fernández"],
    ["Ko je napravio Velvet Iris?", "Dominique Ropion"],
  ])("answers gourmand batch authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Maltol?", "maltol"],
    ["What exactly is Coffee Absolute?", "coffee-absolute-salvador"],
    ["Objasni Tonka Bean Absolute", "tonka-bean-absolute-brazil"],
    ["Šta je Cocoa Absolute?", "cocoa-absolute"],
    ["What is Maple Lactone?", "maple-lactone"],
    ["Objasni Ethyl Maltol", "ethyl-maltol"],
  ])("resolves gourmand caramel coffee cocoa chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    "Parfem sa Maltol za zimu",
    "Treba mi nešto sa Coffee Absolute",
    "Tonka Absolute parfem za veče",
    "Preporuči nešto sa Cocoa Absolute",
    "Maple Lactone parfem do 30 €",
    "Nešto sa Ethyl Maltol",
    "Nešto kao Ambre Latte ali manje slatko",
    "Alternative to Velvet Iris",
  ])("gourmand chemistry layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je corps praline?", "maltol"],
    ["Možeš li objasniti coffee abs?", "coffee-absolute-salvador"],
    ["What really is tonka absolute in perfumery?", "tonka-bean-absolute-brazil"],
    ["Objasni mi cacao absolute", "cocoa-absolute"],
    ["Sta je cyclotene?", "maple-lactone"],
    ["Možeš li objasniti etil maltol?", "ethyl-maltol"],
  ])("handles gourmand aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Šta je Olibanum Oil?", "olibanum-oil"],
    ["What is Frankincense Resinoid?", "olibanum-resinoid"],
    ["Objasni Myrrh Oil", "myrrh-oil"],
    ["Šta je Myrrh Resinoid?", "myrrh-resinoid"],
    ["What exactly is Labdanum Resinoid?", "labdanum-resinoid"],
    ["Objasni Sumatra Benzoin", "benzoin-resoid-sumatra"],
  ])("resolves resin balsam material forms %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Šta je hidrodestilacija?", "hydrodistillation"],
    ["What is a resinoid?", "resinoid"],
    ["Objasni parfemski concrete", "concrete-extract"],
    ["What exactly is supercritical CO2 extraction?", "co2-extraction"],
    ["Šta je molecular distillation?", "molecular-distillation"],
    ["Objasni solvent extraction", "solvent-extraction"],
    ["What is an absolute in perfumery?", "absolute"],
  ])("resolves extraction and material-form concepts %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes olibanum oil from olibanum resinoid by process and profile", () => {
    const oil = findFragranceTermByQuery("Šta je Olibanum Oil?");
    const resinoid = findFragranceTermByQuery("Šta je Olibanum Resinoid?");
    expect(oil?.id).toBe("olibanum-oil");
    expect(resinoid?.id).toBe("olibanum-resinoid");
    expect(oil?.answer?.sr).toContain("hidrodestilacij");
    expect(resinoid?.answer?.sr).toContain("solvent");
  });

  test("distinguishes myrrh oil from molecular-distilled myrrh resinoid", () => {
    const oil = findFragranceTermByQuery("Šta je Myrrh Oil?");
    const resinoid = findFragranceTermByQuery("Šta je Myrrh Resinoid?");
    expect(oil?.id).toBe("myrrh-oil");
    expect(resinoid?.id).toBe("myrrh-resinoid");
    expect(oil?.answer?.sr).toContain("hidrodestilacij");
    expect(resinoid?.answer?.sr).toContain("molecular distillation");
  });

  test.each([
    "Parfem sa Olibanum Oil za zimu",
    "Treba mi nešto sa Frankincense Resinoid",
    "Myrrh Resinoid parfem za veče",
    "Preporuči nešto sa Labdanum Resinoid",
    "Benzoin Sumatra parfem do 30 €",
  ])("resin extraction layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je tamjan ulje?", "olibanum-oil"],
    ["Možeš li objasniti frankincense resinoid?", "olibanum-resinoid"],
    ["What really is resinoid in perfumery?", "resinoid"],
    ["Objasni mi superkritična co2 ekstrakcija", "co2-extraction"],
    ["Sta je MD extract?", "molecular-distillation"],
    ["Možeš li objasniti konkret ekstrakt?", "concrete-extract"],
  ])("handles extraction aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Gabrielle Chanel?", "chanel-gabrielle-edp"],
    ["Who created GABRIELLE CHANEL Eau de Parfum?", "chanel-gabrielle-edp"],
    ["Ko je napravio Paris Deauville?", "chanel-paris-deauville"],
  ])("resolves floral natural batch authorship entities %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Gabrielle Chanel?", "Olivier Polge"],
    ["Ko je napravio Paris Deauville?", "Olivier Polge"],
  ])("answers floral natural batch authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Jasmin Absolute Sambac?", "jasmin-absolute-sambac-india"],
    ["What exactly is Jasmine Grandiflorum Absolute?", "jasmin-absolute-egypt"],
    ["Objasni Tuberose Absolute", "tuberose-absolute-india"],
    ["Šta je Rose Absolute Bulgaria?", "rose-absolute-bulgaria"],
    ["What is Narcisse Absolute France?", "narcisse-absolute-france"],
    ["Objasni Orange Blossom Absolute Egypt", "orange-flower-absolute-egypt"],
  ])("resolves floral absolute material layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes sambac from grandiflorum jasmine absolutes", () => {
    expect(findFragranceTermByQuery("Šta je Jasmine Sambac Absolute?")?.id)
      .toBe("jasmin-absolute-sambac-india");
    expect(findFragranceTermByQuery("Šta je Jasmine Grandiflorum Absolute?")?.id)
      .toBe("jasmin-absolute-egypt");
  });

  test.each([
    "Parfem sa Jasmine Sambac Absolute",
    "Treba mi nešto sa Tuberose Absolute",
    "Rose Absolute Bulgaria parfem za veče",
    "Preporuči nešto sa Orange Flower Absolute",
    "Nešto kao Gabrielle Chanel ali manje floralno",
    "Alternative to Paris Deauville",
  ])("floral natural layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je jasmin sambac abs?", "jasmin-absolute-sambac-india"],
    ["Možeš li objasniti egypt jasmine absolute?", "jasmin-absolute-egypt"],
    ["What really is Tuberose Absolute India?", "tuberose-absolute-india"],
    ["Objasni mi bugarska ruza absolute", "rose-absolute-bulgaria"],
    ["Sta je narcissus poeticus absolute?", "narcisse-absolute-france"],
    ["Možeš li objasniti bitter orange flower absolute?", "orange-flower-absolute-egypt"],
  ])("handles floral absolute aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Mathieu Nardin?", "mathieu-nardin"],
    ["Ko je Matje Nardin?", "mathieu-nardin"],
    ["Who is Mathieu Nardin?", "mathieu-nardin"],
  ])("resolves Mathieu Nardin aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Neroli Botanica?", "essential-parfums-neroli-botanica"],
    ["Who created Néroli Botanica?", "essential-parfums-neroli-botanica"],
    ["Ko je napravio Osmanthus Absolu?", "essential-parfums-osmanthus-absolu"],
  ])("resolves green citrus authorship entities %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Neroli Botanica?", "Anne Flipo"],
    ["Ko je napravio Osmanthus Absolu?", "Mathieu Nardin"],
  ])("answers green citrus batch authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Green Mandarin Oil?", "mandarin-oil-green-italy"],
    ["What exactly is Bergamot Oil FCR?", "bergamot-oil-italy-fcr"],
    ["Objasni Pink Grapefruit Oil", "grapefruit-oil-pink-mexico-fcr"],
    ["Šta je Petitgrain Citronnier?", "petitgrain-citronnier-oil"],
    ["What is Basil Oil Grand Vert?", "basil-oil-grand-vert"],
    ["Objasni Clary Sage Absolute", "clary-sage-absolute-france"],
  ])("resolves green aromatic citrus naturals %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes cold-pressed citrus peel oil from leaf and stem petitgrain", () => {
    const mandarin = findFragranceTermByQuery("Šta je Green Mandarin Oil?");
    const petitgrain = findFragranceTermByQuery("Šta je Petitgrain Citronnier?");
    expect(mandarin?.answer?.sr).toContain("hladno presovano");
    expect(petitgrain?.answer?.sr).toContain("grančica i listova");
  });

  test.each([
    "Parfem sa Green Mandarin Oil",
    "Treba mi nešto sa Bergamot Oil FCR",
    "Pink Grapefruit Oil parfem za leto",
    "Preporuči nešto sa Petitgrain Citronnier",
    "Basil Oil Grand Vert parfem do 30 €",
    "Nešto sa Clary Sage Absolute",
    "Nešto kao Neroli Botanica ali lakše",
    "Alternative to Osmanthus Absolu",
  ])("green aromatic naturals layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Ko je napravio Afternoon Swim?", "louis-vuitton-afternoon-swim"],
    ["Who created Louis Vuitton Afternoon Swim?", "louis-vuitton-afternoon-swim"],
    ["Ko je napravio Pacific Chill?", "louis-vuitton-pacific-chill"],
  ])("resolves Louis Vuitton citrus authorship %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Afternoon Swim?", "Jacques Cavallier Belletrud"],
    ["Ko je napravio Pacific Chill?", "Jacques Cavallier Belletrud"],
  ])("answers Louis Vuitton citrus authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Lemon Oil CP Spain?", "lemon-oil-cp-spain"],
    ["What exactly is Orange Oil CP Spain?", "orange-oil-cp-spain"],
    ["Objasni White Grapefruit Oil", "grapefruit-oil-cp-white-mexico"],
    ["Šta je Persian Lime Oil?", "lime-oil-cp-persian-mexico"],
    ["What is Bitter Orange Oil Egypt?", "orange-oil-cp-bitter-egypt"],
  ])("resolves citrus peel oil expansion %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes cold-pressed lemon peel oil from hydrodistilled lemon petitgrain", () => {
    const peel = findFragranceTermByQuery("Šta je Lemon Oil CP Spain?");
    const petitgrain = findFragranceTermByQuery("Šta je Petitgrain Citronnier?");
    expect(peel?.id).toBe("lemon-oil-cp-spain");
    expect(petitgrain?.id).toBe("petitgrain-citronnier-oil");
    expect(peel?.answer?.sr).toContain("kore");
    expect(petitgrain?.answer?.sr).toContain("grančica i listova");
  });

  test.each([
    "Parfem sa Lemon Oil za leto",
    "Treba mi nešto sa Orange Oil CP",
    "White Grapefruit Oil parfem za posao",
    "Preporuči nešto sa Persian Lime Oil",
    "Bitter Orange Oil parfem do 30 €",
    "Nešto kao Afternoon Swim ali jeftinije",
    "Alternative to Pacific Chill",
  ])("citrus peel layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je cold pressed lemon oil?", "lemon-oil-cp-spain"],
    ["Možeš li objasniti spanish orange oil?", "orange-oil-cp-spain"],
    ["What really is white grapefruit oil?", "grapefruit-oil-cp-white-mexico"],
    ["Objasni mi cold pressed lime oil", "lime-oil-cp-persian-mexico"],
    ["Sta je cold pressed bitter orange?", "orange-oil-cp-bitter-egypt"],
    ["Šta znači cold pressed extraction?", "expression"],
  ])("handles citrus peel aliases and expression phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Paris Edimbourg?", "chanel-paris-edimbourg"],
    ["Who created CHANEL Paris Edimbourg?", "chanel-paris-edimbourg"],
    ["Ko je napravio Paris Venise?", "chanel-paris-venise"],
  ])("resolves green woody CHANEL authorship %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Paris Edimbourg?", "Olivier Polge"],
    ["Ko je napravio Paris Venise?", "Olivier Polge"],
  ])("answers green woody CHANEL authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Vetiver Oil Haiti?", "vetiver-oil-haiti"],
    ["What exactly is Vetiver Heart?", "vetiver-heart"],
    ["Objasni Vetiver Concentrate MD", "vetiver-concentrate-md"],
    ["Šta je Patchouli Oil Indonesia?", "patchouli-oil-indonesia"],
    ["What is Patchouli Heart N3?", "patchouli-heart-n3"],
    ["Objasni Lavender Oil France", "lavender-oil-france"],
    ["Šta je Rosemary Oil Morocco?", "rosemary-oil-morocco"],
    ["What is fractional distillation?", "fractional-distillation"],
  ])("resolves green herbal fractionation layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes whole vetiver oil from fractionated Vetiver Heart", () => {
    const oil = findFragranceTermByQuery("Šta je Vetiver Oil Haiti?");
    const heart = findFragranceTermByQuery("Šta je Vetiver Heart?");
    expect(oil?.id).toBe("vetiver-oil-haiti");
    expect(heart?.id).toBe("vetiver-heart");
    expect(oil?.answer?.sr).toContain("hidrodestilacij");
    expect(heart?.answer?.sr).toContain("frakcion");
  });

  test("distinguishes whole patchouli oil from Patchouli Heart fraction", () => {
    const oil = findFragranceTermByQuery("Šta je Patchouli Oil Indonesia?");
    const heart = findFragranceTermByQuery("Šta je Patchouli Heart?");
    expect(oil?.id).toBe("patchouli-oil-indonesia");
    expect(heart?.id).toBe("patchouli-heart-n3");
    expect(heart?.answer?.sr).toContain("frakcion");
  });

  test.each([
    "Parfem sa Vetiver Heart za posao",
    "Treba mi nešto sa Patchouli Heart",
    "Lavender Oil parfem za svaki dan",
    "Preporuči nešto sa Rosemary Oil",
    "Nešto kao Paris Edimbourg ali jeftinije",
    "Alternative to Paris Venise",
  ])("green herbal fraction layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Haitian vetiver oil?", "vetiver-oil-haiti"],
    ["Možeš li objasniti fractionated vetiver heart?", "vetiver-heart"],
    ["What really is molecular distilled vetiver?", "vetiver-concentrate-md"],
    ["Objasni mi fractionated patchouli", "patchouli-heart-n3"],
    ["Sta je french lavender oil?", "lavender-oil-france"],
    ["Možeš li objasniti moroccan rosemary oil?", "rosemary-oil-morocco"],
    ["Šta znači fractionation?", "fractional-distillation"],
  ])("handles green herbal aliases and fractionation phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Delphine Jelk?", "delphine-jelk"],
    ["Ko je Delfin Jelk?", "delphine-jelk"],
    ["Who is Delphine Jelk?", "delphine-jelk"],
  ])("resolves Delphine Jelk aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio L Homme Ideal Le Parfum?", "guerlain-lhomme-ideal-le-parfum"],
    ["Who created Guerlain L'Homme Ideal Le Parfum?", "guerlain-lhomme-ideal-le-parfum"],
    ["Ko je napravio Rosa Verde?", "guerlain-aqua-allegoria-rosa-verde"],
  ])("resolves Guerlain modern authorship entities %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio L Homme Ideal Le Parfum?", "Delphine Jelk"],
    ["Ko je napravio Rosa Verde?", "Delphine Jelk"],
  ])("answers Guerlain modern authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Cardamom Oil Guatemala?", "cardamom-oil-guatemala"],
    ["What exactly is Cardamom CO2 Extract?", "cardamom-co2-guatemala"],
    ["Objasni Ginger Oil Fresh Madagascar", "ginger-oil-fresh-madagascar"],
    ["Šta je Ginger CO2 Extract?", "ginger-co2-extract"],
    ["What is Black Pepper Oil Madagascar?", "pepper-black-oil-madagascar"],
    ["Objasni Clove Bud Oil", "clove-bud-oil-madagascar"],
  ])("resolves spice natural and extraction layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes cardamom hydrodistillation from cardamom CO2 extraction", () => {
    const oil = findFragranceTermByQuery("Šta je Cardamom Oil Guatemala?");
    const co2 = findFragranceTermByQuery("Šta je Cardamom CO2 Extract?");
    expect(oil?.id).toBe("cardamom-oil-guatemala");
    expect(co2?.id).toBe("cardamom-co2-guatemala");
    expect(oil?.answer?.sr).toContain("hidrodestilacij");
    expect(co2?.answer?.sr).toContain("CO₂");
  });

  test("distinguishes ginger oil from ginger CO2 extract", () => {
    const oil = findFragranceTermByQuery("Šta je Ginger Oil Fresh Madagascar?");
    const co2 = findFragranceTermByQuery("Šta je Ginger CO2 Extract?");
    expect(oil?.id).toBe("ginger-oil-fresh-madagascar");
    expect(co2?.id).toBe("ginger-co2-extract");
    expect(oil?.answer?.sr).toContain("hidrodestilacij");
    expect(co2?.answer?.sr).toContain("čokolade");
  });

  test.each([
    "Parfem sa Cardamom Oil za zimu",
    "Treba mi nešto sa Cardamom CO2",
    "Ginger Oil parfem za veče",
    "Preporuči nešto sa Ginger CO2 Extract",
    "Black Pepper Oil parfem do 30 €",
    "Nešto sa Clove Bud Oil",
    "Nešto kao L Homme Ideal Le Parfum ali lakše",
    "Alternative to Rosa Verde",
  ])("spice natural layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Guatemala cardamom oil?", "cardamom-oil-guatemala"],
    ["Možeš li objasniti CO2 cardamom?", "cardamom-co2-guatemala"],
    ["What really is fresh ginger oil Madagascar?", "ginger-oil-fresh-madagascar"],
    ["Objasni mi supercritical ginger extract", "ginger-co2-extract"],
    ["Sta je Madagascar black pepper oil?", "pepper-black-oil-madagascar"],
    ["Možeš li objasniti clove bud oil?", "clove-bud-oil-madagascar"],
  ])("handles spice natural aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je Jean Louis Sieuzac?", "jean-louis-sieuzac"],
    ["Ko je Žan Lui Sijezak?", "jean-louis-sieuzac"],
    ["Who is Jean-Louis Sieuzac?", "jean-louis-sieuzac"],
  ])("resolves Jean-Louis Sieuzac aliases %s", (query, expectedId) => {
    expect(findPerfumerByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Galop d Hermes?", "hermes-galop-parfum"],
    ["Who created Kelly Caleche?", "hermes-kelly-caleche-edt"],
    ["Ko je napravio Bel Ami?", "hermes-bel-ami-edt"],
  ])("resolves Hermès leather authorship entities %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Galop d Hermes?", "Christine Nagel"],
    ["Ko je napravio Kelly Caleche?", "Jean-Claude Ellena"],
    ["Ko je napravio Bel Ami?", "Jean-Louis Sieuzac"],
  ])("answers Hermès leather authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Leather MD?", "leather-md"],
    ["What exactly is Grisalva?", "grisalva"],
    ["Objasni Muscone animalic", "muscone"],
    ["Šta je Ambrinol?", "ambrinol"],
    ["What is Styrax Resinoid?", "styrax-resinoid-low-styrene"],
  ])("resolves leather animalic material layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes natural Styrax resinoid from synthetic leather animalic materials", () => {
    const natural = findFragranceTermByQuery("Šta je Styrax Resinoid?");
    const synthetic = findFragranceTermByQuery("Šta je Ambrinol?");
    expect(natural?.id).toBe("styrax-resinoid-low-styrene");
    expect(synthetic?.id).toBe("ambrinol");
    expect(natural?.kind).toBe("natural-material");
    expect(synthetic?.kind).toBe("material");
  });

  test.each([
    "Parfem sa Leather MD za zimu",
    "Treba mi nešto sa Grisalva",
    "Muscone parfem za veče",
    "Preporuči nešto sa Ambrinol",
    "Styrax Resinoid parfem do 30 €",
    "Nešto kao Galop d Hermes ali jeftinije",
    "Alternative to Kelly Caleche",
    "Bel Ami alternativa za posao",
  ])("leather animalic layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je natural leather MD?", "leather-md"],
    ["Možeš li objasniti Grisalva leather?", "grisalva"],
    ["What really is Musk Tonkin molecule?", "muscone"],
    ["Objasni mi Ambrinol leather", "ambrinol"],
    ["Sta je liquidambar resinoid?", "styrax-resinoid-low-styrene"],
  ])("handles leather animalic aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio 31 Rue Cambon?", "chanel-31-rue-cambon"],
    ["Who created CHANEL 31 Rue Cambon?", "chanel-31-rue-cambon"],
    ["Ko je napravio La Pausa?", "chanel-la-pausa"],
    ["Who created 28 La Pausa?", "chanel-la-pausa"],
  ])("resolves CHANEL iris authorship entities %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio 31 Rue Cambon?", "Jacques Polge"],
    ["Ko je napravio La Pausa?", "Jacques Polge"],
  ])("answers CHANEL iris authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Orris Absolute Italy?", "orris-absolute-italy"],
    ["What exactly is Orris Natural 15 Irone?", "orris-natural-15-irone"],
    ["Objasni Violet Leaf Absolute", "violet-leaf-absolute-egypt"],
    ["Šta je Irisone Alpha?", "irisone-alpha"],
    ["What is Irone Alpha?", "irone-alpha"],
  ])("resolves orris violet powdery layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes natural violet leaf from powdery violet ionone chemistry", () => {
    const leaf = findFragranceTermByQuery("Šta je Violet Leaf Absolute?");
    const ionone = findFragranceTermByQuery("Šta je Irisone Alpha?");
    expect(leaf?.id).toBe("violet-leaf-absolute-egypt");
    expect(ionone?.id).toBe("irisone-alpha");
    expect(leaf?.answer?.sr).toContain("leafy-green");
    expect(ionone?.kind).toBe("material");
  });

  test("distinguishes natural orris extract from Irone Alpha molecule", () => {
    const natural = findFragranceTermByQuery("Šta je Orris Absolute Italy?");
    const molecule = findFragranceTermByQuery("Šta je Irone Alpha?");
    expect(natural?.id).toBe("orris-absolute-italy");
    expect(molecule?.id).toBe("irone-alpha");
    expect(natural?.kind).toBe("natural-material");
    expect(molecule?.kind).toBe("material");
  });

  test.each([
    "Parfem sa Orris Absolute za posao",
    "Treba mi nešto sa Orris Natural 15 Irone",
    "Violet Leaf Absolute parfem za leto",
    "Preporuči nešto sa Irisone Alpha",
    "Irone Alpha parfem do 30 €",
    "Nešto kao La Pausa ali jeftinije",
    "Alternative to 31 Rue Cambon",
  ])("orris violet layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je italian orris absolute?", "orris-absolute-italy"],
    ["Možeš li objasniti orris 15 irone?", "orris-natural-15-irone"],
    ["What really is Egypt violet leaf absolute?", "violet-leaf-absolute-egypt"],
    ["Objasni mi Irisone Alpha violet", "irisone-alpha"],
  ])("handles orris violet aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Tobacco Honey?", "guerlain-tobacco-honey"],
    ["Who created Guerlain Tobacco Honey?", "guerlain-tobacco-honey"],
  ])("resolves Tobacco Honey authorship %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test("answers Tobacco Honey authorship", () => {
    const result = resolveFragranceKnowledgeQuery("Ko je napravio Tobacco Honey?", "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain("Delphine Jelk");
  });

  test.each([
    ["Šta je Hay Absolute?", "hay-absolute"],
    ["What exactly is Mate Absolute?", "mate-absolute"],
    ["Objasni Bran Absolute", "bran-absolute"],
    ["Šta je Tonka Bean CO2 Absolute?", "tonka-bean-co2-absolute"],
    ["What is Immortelle Absolute?", "immortelle-absolute-balkans"],
  ])("resolves tea tobacco hay naturals %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes solvent-extracted Tonka Absolute from Tonka CO2 Absolute", () => {
    const absolute = findFragranceTermByQuery("Šta je Tonka Bean Absolute Brazil?");
    const co2 = findFragranceTermByQuery("Šta je Tonka Bean CO2 Absolute?");
    expect(absolute?.id).toBe("tonka-bean-absolute-brazil");
    expect(co2?.id).toBe("tonka-bean-co2-absolute");
    expect(absolute?.answer?.sr).toContain("ekstrakt");
    expect(co2?.answer?.sr).toContain("CO₂");
  });

  test.each([
    "Parfem sa Hay Absolute za jesen",
    "Treba mi nešto sa Mate Absolute",
    "Bran Absolute parfem za veče",
    "Preporuči nešto sa Tonka Bean CO2",
    "Immortelle Absolute parfem do 30 €",
    "Nešto kao Tobacco Honey ali manje slatko",
  ])("tea tobacco hay layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je seno absolute?", "hay-absolute"],
    ["Možeš li objasniti yerba mate absolute?", "mate-absolute"],
    ["What really is wheat bran absolute?", "bran-absolute"],
    ["Objasni mi tonka co2", "tonka-bean-co2-absolute"],
    ["Sta je smilje absolute?", "immortelle-absolute-balkans"],
  ])("handles tea tobacco hay aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio On the Beach?", "louis-vuitton-on-the-beach"],
    ["Who created Louis Vuitton On the Beach?", "louis-vuitton-on-the-beach"],
    ["Ko je napravio City of Stars?", "louis-vuitton-city-of-stars"],
  ])("resolves marine fresh Louis Vuitton authorship %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio On the Beach?", "Jacques Cavallier Belletrud"],
    ["Ko je napravio City of Stars?", "Jacques Cavallier Belletrud"],
  ])("answers marine fresh Louis Vuitton authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    ["Šta je Calone?", "aquatic-calone"],
    ["What exactly is Cascalone?", "cascalone"],
    ["Objasni Adoxal ozonic", "adoxal"],
    ["Šta je Oceanol?", "oceanol"],
  ])("resolves marine ozonic molecule layer %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes classic marine Calone from softer freshwater Cascalone", () => {
    const calone = findFragranceTermByQuery("Šta je Calone?");
    const cascalone = findFragranceTermByQuery("Šta je Cascalone?");
    expect(calone?.id).toBe("aquatic-calone");
    expect(cascalone?.id).toBe("cascalone");
    expect(calone?.answer?.sr).toContain("marine");
    expect(cascalone?.answer?.sr).toContain("freshwater");
  });

  test("distinguishes ozonic fresh-linen Adoxal from salty mossy Oceanol", () => {
    const adoxal = findFragranceTermByQuery("Šta je Adoxal?");
    const oceanol = findFragranceTermByQuery("Šta je Oceanol?");
    expect(adoxal?.answer?.sr).toContain("fresh-linen");
    expect(oceanol?.answer?.sr).toContain("salty");
  });

  test.each([
    "Parfem sa Calone za leto",
    "Treba mi nešto sa Cascalone",
    "Adoxal parfem za svaki dan",
    "Preporuči nešto sa Oceanol",
    "Nešto kao On the Beach ali jeftinije",
    "Alternative to City of Stars",
  ])("marine ozonic layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Calone watermelon?", "aquatic-calone"],
    ["Možeš li objasniti Cascalone freshwater?", "cascalone"],
    ["What really is Adoxal fresh linen?", "adoxal"],
    ["Objasni mi Oceanol salty", "oceanol"],
  ])("handles marine ozonic aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Šta je Undecavertol?", "undecavertol"],
    ["Objasni Spirogalbanone Pure", "spirogalbanone-pure"],
    ["What is Fraistone?", "fraistone"],
  ])("resolves green fruity high-impact chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio French Lover?", "frederic-malle-french-lover"],
    ["Who created Music for a While?", "frederic-malle-music-for-a-while"],
  ])("resolves Frederic Malle green fruity authorship %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio French Lover?", "Pierre Bourdon"],
    ["Ko je napravio Music for a While?", "Carlos Benaïm"],
  ])("answers Frederic Malle green fruity authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    "Preporuči parfem sa Undecavertol",
    "Nešto sa Spirogalbanone za leto",
    "Fraistone parfem za svaki dan",
    "Nešto kao French Lover ali svežije",
    "Alternative to Music for a While",
  ])("green fruity layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Undecavertol violet leaf?", "undecavertol"],
    ["Možeš li objasniti Spirogalbanone galbanum?", "spirogalbanone-pure"],
    ["What exactly is Fraistone strawberry?", "fraistone"],
  ])("handles green fruity aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Tetrahydro Myrcenol?", "tetrahydro-myrcenol"],
    ["Objasni Dimyrcetol", "dimyrcetol"],
    ["What is Myrcenol Super?", "myrcenol-super"],
  ])("resolves fresh citrus functional chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Dior New Look?", "dior-new-look"],
    ["Who created Dioriviera?", "dior-dioriviera"],
  ])("resolves modern Dior Francis Kurkdjian authorship %s", (query, expectedId) => {
    expect(findPerfumeByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
    ["Ko je napravio Dior New Look?", "Francis Kurkdjian"],
    ["Ko je napravio Dioriviera?", "Francis Kurkdjian"],
  ])("answers modern Dior Francis Kurkdjian authorship %s", (query, expectedName) => {
    const result = resolveFragranceKnowledgeQuery(query, "sr");
    expect(result.handled).toBe(true);
    expect(result.type).toBe("fragrance");
    expect(result.answer).toContain(expectedName);
  });

  test.each([
    "Preporuči parfem sa Tetrahydro Myrcenol",
    "Nešto sa Dimyrcetol za leto",
    "Myrcenol Super parfem za svaki dan",
    "Nešto kao Dior New Look ali jeftinije",
    "Alternative to Dioriviera",
  ])("fresh citrus layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Tetrahydro Myrcenol lime?", "tetrahydro-myrcenol"],
    ["Možeš li objasniti Dimyrcetol fresh citrus?", "dimyrcetol"],
    ["What exactly is Myrcenol Super lavender?", "myrcenol-super"],
  ])("handles fresh citrus aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Lilianth?", "lilianth"],
    ["Objasni Floral Super", "floral-super"],
    ["What is Citronellol 950?", "citronellol-950"],
  ])("resolves muguet transparent floral chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes transparent muguet lift from high-impact cyclamen and rose structure", () => {
    const lilianth = findFragranceTermByQuery("Šta je Lilianth?");
    const floralSuper = findFragranceTermByQuery("Šta je Floral Super?");
    const citronellol = findFragranceTermByQuery("Šta je Citronellol 950?");
    expect(lilianth?.answer?.sr).toContain("muguet");
    expect(floralSuper?.answer?.sr).toContain("cyclamen");
    expect(citronellol?.answer?.sr).toContain("rose");
  });

  test.each([
    "Preporuči parfem sa Lilianth",
    "Nešto sa Floral Super za svaki dan",
    "Citronellol parfem za leto",
  ])("muguet floral layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Lilianth muguet?", "lilianth"],
    ["Možeš li objasniti Floral Super cyclamen?", "floral-super"],
    ["What exactly is Citronellol rose?", "citronellol-950"],
  ])("handles muguet floral aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Fructone?", "fructone"],
    ["Objasni Ethyl Phenyl Glycidate", "ethyl-phenyl-glycidate"],
    ["What is Hexyl Acetate?", "hexyl-acetate"],
  ])("resolves fruity ester chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes exotic fruit, strawberry and green apple pear materials", () => {
    const fructone = findFragranceTermByQuery("Šta je Fructone?");
    const strawberry = findFragranceTermByQuery("Šta je Ethyl Phenyl Glycidate?");
    const hexyl = findFragranceTermByQuery("Šta je Hexyl Acetate?");
    expect(fructone?.answer?.sr).toContain("pineapple");
    expect(strawberry?.answer?.sr).toContain("strawberry");
    expect(hexyl?.answer?.sr).toContain("jabuku");
  });

  test.each([
    "Preporuči parfem sa Fructone",
    "Nešto sa Ethyl Phenyl Glycidate",
    "Hexyl Acetate parfem za leto",
  ])("fruity ester layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Fructone pineapple?", "fructone"],
    ["Možeš li objasniti strawberry glycidate?", "ethyl-phenyl-glycidate"],
    ["What exactly is Hexyl Acetate pear?", "hexyl-acetate"],
  ])("handles fruity ester aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Anisimea?", "anisimea"],
    ["Objasni Indolene 50% BB", "indolene-50-bb"],
    ["What is Muguet Ald 50% BB?", "muguet-ald-50-bb"],
  ])("resolves powdery indolic muguet chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes powdery mimosa, indolic jasmine and aldehydic muguet profiles", () => {
    const anisimea = findFragranceTermByQuery("Šta je Anisimea?");
    const indolene = findFragranceTermByQuery("Šta je Indolene?");
    const muguet = findFragranceTermByQuery("Šta je Muguet Ald?");
    expect(anisimea?.answer?.sr).toContain("puderastog");
    expect(indolene?.answer?.sr).toContain("animalic");
    expect(muguet?.answer?.sr).toContain("ozone-like");
  });

  test.each([
    "Preporuči parfem sa Anisimea",
    "Nešto sa Indolene za veče",
    "Muguet Ald parfem za svaki dan",
  ])("powdery indolic muguet layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Anisimea powdery?", "anisimea"],
    ["Možeš li objasniti Indolene jasmine?", "indolene-50-bb"],
    ["What exactly is Muguet aldehyde?", "muguet-ald-50-bb"],
  ])("handles powdery indolic muguet aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Ambermor Ketal Crystal?", "ambermor-ketal-crystal"],
    ["Objasni Santaliff", "santaliff"],
    ["What is Mysantol?", "mysantol"],
  ])("resolves ambery sandalwood chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes dry ambery power from milky and diffusive sandal profiles", () => {
    const ambermor = findFragranceTermByQuery("Šta je Ambermor Ketal?");
    const santaliff = findFragranceTermByQuery("Šta je Santaliff?");
    const mysantol = findFragranceTermByQuery("Šta je Mysantol?");
    expect(ambermor?.answer?.sr).toContain("animalic");
    expect(santaliff?.answer?.sr).toContain("milky");
    expect(mysantol?.answer?.sr).toContain("difuznog");
  });

  test.each([
    "Preporuči parfem sa Ambermor Ketal",
    "Nešto sa Santaliff za veče",
    "Mysantol parfem za svaki dan",
  ])("ambery sandalwood layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Ambermor amber woody?", "ambermor-ketal-crystal"],
    ["Možeš li objasniti Santaliff creamy?", "santaliff"],
    ["What exactly is Mysantol sandalwood?", "mysantol"],
  ])("handles ambery sandalwood aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Stemone?", "stemone"],
    ["Objasni Triplal", "triplal"],
    ["What is Leaf Alcohol?", "cis-3-hexenol"],
  ])("resolves green leaf stem chemistry %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("distinguishes fig leaf stem, sharp leafy floral and cut grass profiles", () => {
    const stemone = findFragranceTermByQuery("Šta je Stemone?");
    const triplal = findFragranceTermByQuery("Šta je Triplal?");
    const leafAlcohol = findFragranceTermByQuery("Šta je Leaf Alcohol?");
    expect(stemone?.answer?.sr).toContain("fig-leaf");
    expect(triplal?.answer?.sr).toContain("green-floral");
    expect(leafAlcohol?.answer?.sr).toContain("pokošene trave");
  });

  test.each([
    "Preporuči parfem sa Stemone",
    "Nešto sa Triplal za proleće",
    "Leaf Alcohol parfem za svaki dan",
  ])("green leaf stem layer preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Sta je Stemone fig leaf?", "stemone"],
    ["Možeš li objasniti Triplal leafy?", "triplal"],
    ["What exactly is cis 3 hexenol leaf alcohol?", "cis-3-hexenol"],
  ])("handles green leaf stem aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Pomarina?", "pomarina"],
    ["Šta je Damascone Alpha?", "damascone-alpha"],
    ["Šta je Damascone Beta?", "damascone-beta"],
    ["Šta je Damascone Delta?", "damascone-delta"],
    ["Šta je Vertofix Coeur?", "vertofix-coeur"],
    ["Šta je Operanide?", "operanide"],
    ["Šta je Cassiffix?", "cassiffix"],
    ["Šta je Ambrinol 95?", "ambrinol-95"],
    ["Šta je Ambrettolide?", "ambrettolide"],
    ["Šta je Cyclemone A?", "cyclemone-a"],
    ["Šta je Damascol?", "damascol"],
    ["Šta je Peomosa?", "peomosa"],
    ["Šta je Ocimene?", "ocimene"],
    ["Šta je Verdol?", "verdol"],
    ["Šta je Verdone?", "verdone"],
  ])("resolves large multi-category FI chemistry batch %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates alpha beta and delta damascone signatures", () => {
    const alpha = findFragranceTermByQuery("Šta je Damascone Alpha?");
    const beta = findFragranceTermByQuery("Šta je Damascone Beta?");
    const delta = findFragranceTermByQuery("Šta je Damascone Delta?");
    expect(alpha?.answer?.sr).toContain("jabukom");
    expect(beta?.answer?.sr).toContain("tobacco");
    expect(delta?.answer?.sr).toContain("cassis");
  });

  test("separates ambergris musk amber and marine materials in the large batch", () => {
    expect(findFragranceTermByQuery("Šta je Ambrinol 95?")?.answer?.sr).toContain("seaweed");
    expect(findFragranceTermByQuery("Šta je Ambrettolide?")?.answer?.sr).toContain("musk");
    expect(findFragranceTermByQuery("Šta je Operanide?")?.answer?.sr).toContain("puderastim");
    expect(findFragranceTermByQuery("Šta je Cyclemone A?")?.answer?.sr).toContain("ozone-marine");
  });

  test("separates fruity green floral herbal and woody additions", () => {
    expect(findFragranceTermByQuery("Šta je Pomarina?")?.answer?.sr).toContain("apple");
    expect(findFragranceTermByQuery("Šta je Cassiffix?")?.answer?.sr).toContain("cassis");
    expect(findFragranceTermByQuery("Šta je Peomosa?")?.answer?.sr).toContain("peony");
    expect(findFragranceTermByQuery("Šta je Ocimene?")?.answer?.sr).toContain("lavender");
    expect(findFragranceTermByQuery("Šta je Vertofix Coeur?")?.answer?.sr).toContain("leather");
  });

  test.each([
    "Preporuči parfem sa Pomarina",
    "Damascone Alpha parfem za leto",
    "Nešto sa Damascone Beta",
    "Preporuči Damascone Delta parfem",
    "Nešto sa Vertofix Coeur",
    "Operanide parfem za veče",
    "Cassiffix parfem za svaki dan",
    "Nešto sa Ambrinol 95",
    "Ambrettolide parfem",
    "Cyclemone A parfem za leto",
    "Damascol preporuka",
    "Peomosa parfem",
    "Ocimene parfem",
    "Verdol parfem",
    "Verdone parfem",
  ])("large FI batch preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Pomarina apple pear?", "pomarina"],
    ["Šta je alpha damascone blackcurrant?", "damascone-alpha"],
    ["Šta je beta damascone tobacco?", "damascone-beta"],
    ["Šta je delta damascone cassis?", "damascone-delta"],
    ["Šta je Vertofix dry wood?", "vertofix-coeur"],
    ["Šta je Operanide powdery amber?", "operanide"],
    ["Šta je Cassiffix blackcurrant?", "cassiffix"],
    ["Šta je Ambrinol seaweed?", "ambrinol-95"],
    ["Šta je Ambrettolide floral musk?", "ambrettolide"],
    ["Šta je Cyclemone ozone marine?", "cyclemone-a"],
    ["Šta je Damascol peppery?", "damascol"],
    ["Šta je Peomosa cyclamen?", "peomosa"],
    ["Šta je Ocimene green citrus?", "ocimene"],
    ["Šta je Verdol pine patchouli?", "verdol"],
    ["Šta je Verdone woody camphor?", "verdone"],
  ])("large FI batch resolves aliases and filler phrasing: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Citronellyl Formate?", "citronellyl-formate"],
    ["Šta je Citronellol 700?", "citronellol-700"],
    ["Šta je Iso Cyclo Citral?", "iso-cyclo-citral"],
    ["Šta je Citral Dimethyl Acetal?", "citral-dimethyl-acetal"],
    ["Šta je Verbenal?", "verbenal"],
    ["Šta je Citronellyl Propionate?", "citronellyl-propionate"],
    ["Šta je Nerol 900?", "nerol-900"],
    ["Šta je Cinnamalva?", "cinnamalva"],
  ])("resolves citrus floral spicy extension batch %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates citrus aldehydic rose ester and spicy directions", () => {
    expect(findFragranceTermByQuery("Šta je Citral Dimethyl Acetal?")?.answer?.sr).toContain("verbena");
    expect(findFragranceTermByQuery("Šta je Iso Cyclo Citral?")?.answer?.sr).toContain("leafy");
    expect(findFragranceTermByQuery("Šta je Citronellyl Propionate?")?.answer?.sr).toContain("rose-floral");
    expect(findFragranceTermByQuery("Šta je Cinnamalva?")?.answer?.sr).toContain("cinnamon-like");
  });

  test.each([
    "Preporuči parfem sa Citronellyl Formate",
    "Preporuči parfem sa Citronellol 700",
    "Preporuči parfem sa Iso Cyclo Citral",
    "Preporuči parfem sa Citral Dimethyl Acetal",
    "Preporuči parfem sa Verbenal",
    "Preporuči parfem sa Citronellyl Propionate",
    "Preporuči parfem sa Nerol 900",
    "Preporuči parfem sa Cinnamalva",
  ])("citrus floral spicy extension preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Citronellyl Formate grapefruit?", "citronellyl-formate"],
    ["Šta je Citronellol 700 geranium?", "citronellol-700"],
    ["Šta je Iso Cyclo Citral fougere?", "iso-cyclo-citral"],
    ["Šta je Citral Dimethyl Acetal verbena?", "citral-dimethyl-acetal"],
    ["Šta je Verbenal lemongrass?", "verbenal"],
    ["Šta je Citronellyl Propionate fruity floral?", "citronellyl-propionate"],
    ["Šta je Nerol 900 pear ozone?", "nerol-900"],
    ["Šta je Cinnamalva cinnamon?", "cinnamalva"],
  ])("citrus floral spicy extension resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Agrumea?", "agrumea"],
    ["Šta je Vivaldie?", "vivaldie"],
    ["Šta je Ylanganate?", "ylanganate"],
    ["Šta je Violiff?", "violiff"],
    ["Šta je Ambermor?", "ambermor"],
    ["Šta je Andrane?", "andrane"],
  ])("resolves final large-batch green floral amber woody additions %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates green floral white floral amber and precious wood additions", () => {
    expect(findFragranceTermByQuery("Šta je Agrumea?")?.answer?.sr).toContain("orange-flower");
    expect(findFragranceTermByQuery("Šta je Vivaldie?")?.answer?.sr).toContain("flower-shop");
    expect(findFragranceTermByQuery("Šta je Ylanganate?")?.answer?.sr).toContain("white-floral");
    expect(findFragranceTermByQuery("Šta je Ambermor?")?.answer?.sr).toContain("animalic");
    expect(findFragranceTermByQuery("Šta je Andrane?")?.answer?.sr).toContain("ambergris");
  });

  test.each([
    "Preporuči parfem sa Agrumea",
    "Preporuči parfem sa Vivaldie",
    "Preporuči parfem sa Ylanganate",
    "Preporuči parfem sa Violiff",
    "Preporuči parfem sa Ambermor",
    "Preporuči parfem sa Andrane",
  ])("final large-batch additions preserve recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Agrumea orange flower?", "agrumea"],
    ["Šta je Vivaldie flower shop?", "vivaldie"],
    ["Šta je Ylanganate white floral?", "ylanganate"],
    ["Šta je Violiff violet leaf?", "violiff"],
    ["Šta je Ambermor earthy musk?", "ambermor"],
    ["Šta je Andrane cedar sandalwood?", "andrane"],
  ])("final large-batch additions resolve aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Auralva?", "auralva"],
    ["Šta je Bicyclononalactone?", "bicyclononalactone"],
    ["Šta je Canthoxal?", "canthoxal"],
    ["Šta je Cashmeran Velvet?", "cashmeran-velvet"],
    ["Šta je Cedryl Acetate?", "cedryl-acetate"],
    ["Šta je Celestolide?", "celestolide"],
    ["Šta je Citrolate?", "citrolate"],
    ["Šta je Coniferan Pure?", "coniferan-pure"],
  ])("resolves large IFF material block A %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates powdery tonka musk citrus and cool woody profiles in block A", () => {
    expect(findFragranceTermByQuery("Šta je Bicyclononalactone?")?.answer?.sr).toContain("Tonka");
    expect(findFragranceTermByQuery("Šta je Celestolide?")?.answer?.sr).toContain("mošusnog");
    expect(findFragranceTermByQuery("Šta je Citrolate?")?.answer?.sr).toContain("grapefruit");
    expect(findFragranceTermByQuery("Šta je Coniferan Pure?")?.answer?.sr).toContain("cooling");
  });

  test.each([
    "Preporuči parfem sa Auralva",
    "Preporuči parfem sa Bicyclononalactone",
    "Preporuči parfem sa Canthoxal",
    "Preporuči parfem sa Cashmeran Velvet",
    "Preporuči parfem sa Cedryl Acetate",
    "Preporuči parfem sa Celestolide",
    "Preporuči parfem sa Citrolate",
    "Preporuči parfem sa Coniferan Pure",
  ])("large IFF material block A preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Auralva orange muguet?", "auralva"],
    ["Šta je Bicyclononalactone tonka?", "bicyclononalactone"],
    ["Šta je Canthoxal basil fennel?", "canthoxal"],
    ["Šta je Cashmeran Velvet woody?", "cashmeran-velvet"],
    ["Šta je Cedryl Acetate vetiver?", "cedryl-acetate"],
    ["Šta je Celestolide warm musk?", "celestolide"],
    ["Šta je Citrolate bitter orange?", "citrolate"],
    ["Šta je Coniferan camphor?", "coniferan-pure"],
  ])("large IFF material block A resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Citronellyl Acetate?", "citronellyl-acetate"],
    ["Šta je Clonal?", "clonal"],
    ["Šta je Cortex Aldehyde 50% TEC?", "cortex-aldehyde-50-tec"],
    ["Šta je CP Formate Aphermate?", "cp-formate-aphermate"],
    ["Šta je Cuminyl Acetate?", "cuminyl-acetate"],
    ["Šta je Cuminyl Alcohol?", "cuminyl-alcohol"],
    ["Šta je Cyclemax?", "cyclemax"],
    ["Šta je Edenolide?", "edenolide"],
  ])("resolves large IFF material block B %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates citrus aldehydic green fruity spicy floral and musk profiles in block B", () => {
    expect(findFragranceTermByQuery("Šta je Clonal?")?.answer?.sr).toContain("orange-peel");
    expect(findFragranceTermByQuery("Šta je Cortex Aldehyde 50% TEC?")?.answer?.sr).toContain("stem-like");
    expect(findFragranceTermByQuery("Šta je Cuminyl Alcohol?")?.answer?.sr).toContain("caraway");
    expect(findFragranceTermByQuery("Šta je Edenolide?")?.answer?.sr).toContain("white-musk");
  });

  test.each([
    "Preporuči parfem sa Citronellyl Acetate",
    "Preporuči parfem sa Clonal",
    "Preporuči parfem sa Cortex Aldehyde 50% TEC",
    "Preporuči parfem sa CP Formate Aphermate",
    "Preporuči parfem sa Cuminyl Acetate",
    "Preporuči parfem sa Cuminyl Alcohol",
    "Preporuči parfem sa Cyclemax",
    "Preporuči parfem sa Edenolide",
  ])("large IFF material block B preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Citronellyl Acetate rose?", "citronellyl-acetate"],
    ["Šta je Clonal grapefruit?", "clonal"],
    ["Šta je Cortex Aldehyde 50 TEC?", "cortex-aldehyde-50-tec"],
    ["Šta je CP Formate apple?", "cp-formate-aphermate"],
    ["Šta je Cuminyl Acetate sweet woody?", "cuminyl-acetate"],
    ["Šta je Cuminyl Alcohol caraway?", "cuminyl-alcohol"],
    ["Šta je Cyclemax watery floral?", "cyclemax"],
    ["Šta je Edenolide green apple?", "edenolide"],
  ])("large IFF material block B resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Cyclabute?", "cyclabute"],
    ["Šta je Dihydro Cyclacet?", "dihydro-cyclacet"],
    ["Šta je Dihydro Terpineol?", "dihydro-terpineol"],
    ["Šta je Dihydro Terpinyl Acetate?", "dihydro-terpinyl-acetate"],
    ["Šta je Dimethyl Octanol?", "dimethyl-octanol"],
    ["Šta je Dimethyl Phenyl Ethyl Carbinyl Acetate?", "dimethyl-phenyl-ethyl-carbinyl-acetate"],
    ["Šta je Dulcinyl Recrystallized?", "dulcinyl-recrystallized"],
    ["Šta je Starfleur?", "starfleur"],
  ])("resolves large IFF material block C %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates tropical fruit herbal green balsamic gourmand and transparent floral profiles in block C", () => {
    expect(findFragranceTermByQuery("Šta je Cyclabute?")?.answer?.sr).toContain("pineapple");
    expect(findFragranceTermByQuery("Šta je Dihydro Cyclacet?")?.answer?.sr).toContain("basil");
    expect(findFragranceTermByQuery("Šta je Dimethyl Phenyl Ethyl Carbinyl Acetate?")?.answer?.sr).toContain("balsamic");
    expect(findFragranceTermByQuery("Šta je Dulcinyl Recrystallized?")?.answer?.sr).toContain("cotton candy");
    expect(findFragranceTermByQuery("Šta je Starfleur?")?.answer?.sr).toContain("freesia");
  });

  test.each([
    "Preporuči parfem sa Cyclabute",
    "Preporuči parfem sa Dihydro Cyclacet",
    "Preporuči parfem sa Dihydro Terpineol",
    "Preporuči parfem sa Dihydro Terpinyl Acetate",
    "Preporuči parfem sa Dimethyl Octanol",
    "Preporuči parfem sa Dimethyl Phenyl Ethyl Carbinyl Acetate",
    "Preporuči parfem sa Dulcinyl Recrystallized",
    "Preporuči parfem sa Starfleur",
  ])("large IFF material block C preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Cyclabute peach mango?", "cyclabute"],
    ["Šta je Dihydro Cyclacet basil?", "dihydro-cyclacet"],
    ["Šta je Dihydro Terpineol lime?", "dihydro-terpineol"],
    ["Šta je Dihydro Terpinyl Acetate cologne?", "dihydro-terpinyl-acetate"],
    ["Šta je Dimethyl Octanol minty?", "dimethyl-octanol"],
    ["Šta je sweet floral leafy balsamic?", "dimethyl-phenyl-ethyl-carbinyl-acetate"],
    ["Šta je Dulcinyl cotton candy?", "dulcinyl-recrystallized"],
    ["Šta je Starfleur freesia?", "starfleur"],
  ])("large IFF material block C resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Benzaldehyde?", "benzaldehyde"],
    ["Šta je Methyl Anthranilate?", "methyl-anthranilate"],
    ["Šta je Phenyl Ethyl Alcohol?", "phenyl-ethyl-alcohol"],
    ["Šta je Benzyl Salicylate?", "benzyl-salicylate"],
    ["Šta je Hydroxycitronellal?", "hydroxycitronellal"],
    ["Šta je Linalyl Acetate?", "linalyl-acetate"],
    ["Šta je Isobornyl Acetate?", "isobornyl-acetate"],
    ["Šta je Terpinyl Acetate?", "terpinyl-acetate"],
  ])("resolves fundamentals material block D %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates almond grape rose muguet and aromatic woody fundamentals", () => {
    expect(findFragranceTermByQuery("Šta je Benzaldehyde?")?.answer?.sr).toContain("bitter-almond");
    expect(findFragranceTermByQuery("Šta je Methyl Anthranilate?")?.answer?.sr).toContain("grape");
    expect(findFragranceTermByQuery("Šta je Phenyl Ethyl Alcohol?")?.answer?.sr).toContain("rose");
    expect(findFragranceTermByQuery("Šta je Hydroxycitronellal?")?.answer?.sr).toContain("muguet");
    expect(findFragranceTermByQuery("Šta je Isobornyl Acetate?")?.answer?.sr).toContain("pine");
  });

  test.each([
    "Preporuči parfem sa Benzaldehyde",
    "Preporuči parfem sa Methyl Anthranilate",
    "Preporuči parfem sa Phenyl Ethyl Alcohol",
    "Preporuči parfem sa Benzyl Salicylate",
    "Preporuči parfem sa Hydroxycitronellal",
    "Preporuči parfem sa Linalyl Acetate",
    "Preporuči parfem sa Isobornyl Acetate",
    "Preporuči parfem sa Terpinyl Acetate",
  ])("fundamentals material block D preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Benzaldehyde cherry?", "benzaldehyde"],
    ["Šta je Methyl Anthranilate grape?", "methyl-anthranilate"],
    ["Šta je phenethyl alcohol rose?", "phenyl-ethyl-alcohol"],
    ["Šta je Benzyl Salicylate solar?", "benzyl-salicylate"],
    ["Šta je Hydroxycitronellal muguet?", "hydroxycitronellal"],
    ["Šta je Linalyl Acetate bergamot?", "linalyl-acetate"],
    ["Šta je Isobornyl Acetate pine?", "isobornyl-acetate"],
    ["Šta je Terpinyl Acetate lavender?", "terpinyl-acetate"],
  ])("fundamentals material block D resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je cis-3-Hexenyl Acetate?", "cis-3-hexenyl-acetate"],
    ["Šta je Raspberry Ketone?", "raspberry-ketone"],
    ["Šta je Methyl Pamplemousse?", "methyl-pamplemousse"],
    ["Šta je Citral?", "citral"],
    ["Šta je Citronellal?", "citronellal"],
    ["Šta je Ethyl Linalool?", "ethyl-linalool"],
    ["Šta je Dihydrolinalool?", "dihydrolinalool"],
    ["Šta je Benzyl Acetate?", "benzyl-acetate"],
  ])("resolves fundamentals material block E %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates green leaf berry grapefruit lemon fresh floral and jasmine fundamentals", () => {
    expect(findFragranceTermByQuery("Šta je cis-3-Hexenyl Acetate?")?.answer?.sr).toContain("pear");
    expect(findFragranceTermByQuery("Šta je Raspberry Ketone?")?.answer?.sr).toContain("raspberry");
    expect(findFragranceTermByQuery("Šta je Methyl Pamplemousse?")?.answer?.sr).toContain("grapefruit");
    expect(findFragranceTermByQuery("Šta je Citral?")?.answer?.sr).toContain("lemongrass");
    expect(findFragranceTermByQuery("Šta je Benzyl Acetate?")?.answer?.sr).toContain("jasmin");
  });

  test.each([
    "Preporuči parfem sa cis-3-Hexenyl Acetate",
    "Preporuči parfem sa Raspberry Ketone",
    "Preporuči parfem sa Methyl Pamplemousse",
    "Preporuči parfem sa Citral",
    "Preporuči parfem sa Citronellal",
    "Preporuči parfem sa Ethyl Linalool",
    "Preporuči parfem sa Dihydrolinalool",
    "Preporuči parfem sa Benzyl Acetate",
  ])("fundamentals material block E preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je green leaf acetate?", "cis-3-hexenyl-acetate"],
    ["Šta je Raspberry Ketone jammy?", "raspberry-ketone"],
    ["Šta je Methyl Pamplemousse grapefruit?", "methyl-pamplemousse"],
    ["Šta je Citral lemongrass?", "citral"],
    ["Šta je Citronellal citronella?", "citronellal"],
    ["Šta je Ethyl Linalool lavender?", "ethyl-linalool"],
    ["Šta je Dihydrolinalool fresh?", "dihydrolinalool"],
    ["Šta je Benzyl Acetate jasmine?", "benzyl-acetate"],
  ])("fundamentals material block E resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Ionone Alpha?", "ionone-alpha"],
    ["Šta je Ionone Beta?", "ionone-beta"],
    ["Šta je Methyl Ionone Alpha?", "methyl-ionone-alpha"],
    ["Šta je Cinnamyl Alcohol?", "cinnamyl-alcohol"],
    ["Šta je Cinnamic Aldehyde?", "cinnamic-aldehyde"],
    ["Šta je Phenylacetaldehyde?", "phenylacetaldehyde"],
    ["Šta je Benzyl Benzoate?", "benzyl-benzoate"],
  ])("resolves fundamentals material block F %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates ionone violet powdery cinnamon honey floral and balsamic fundamentals", () => {
    expect(findFragranceTermByQuery("Šta je Ionone Alpha?")?.answer?.sr).toContain("puderastim");
    expect(findFragranceTermByQuery("Šta je Ionone Beta?")?.answer?.sr).toContain("raspberry");
    expect(findFragranceTermByQuery("Šta je Cinnamic Aldehyde?")?.answer?.sr).toContain("cinnamon");
    expect(findFragranceTermByQuery("Šta je Phenylacetaldehyde?")?.answer?.sr).toContain("honey");
  });

  test.each([
    "Preporuči parfem sa Ionone Alpha",
    "Preporuči parfem sa Ionone Beta",
    "Preporuči parfem sa Methyl Ionone Alpha",
    "Preporuči parfem sa Methyl Ionone Gamma",
    "Preporuči parfem sa Cinnamyl Alcohol",
    "Preporuči parfem sa Cinnamic Aldehyde",
    "Preporuči parfem sa Phenylacetaldehyde",
    "Preporuči parfem sa Benzyl Benzoate",
  ])("fundamentals material block F preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je alpha ionone violet?", "ionone-alpha"],
    ["Šta je beta ionone raspberry?", "ionone-beta"],
    ["Šta je Methyl Ionone Alpha powdery?", "methyl-ionone-alpha"],
    ["Šta je Cinnamyl Alcohol hyacinth?", "cinnamyl-alcohol"],
    ["Šta je cinnamaldehyde spicy?", "cinnamic-aldehyde"],
    ["Šta je Phenylacetaldehyde honey?", "phenylacetaldehyde"],
    ["Šta je Benzyl Benzoate floral fixative?", "benzyl-benzoate"],
  ])("fundamentals material block F resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Beta Naphtyl Isobutyl Ether?", "beta-naphtyl-isobutyl-ether"],
    ["Šta je Bornafix?", "bornafix"],
    ["Šta je Cedarnat Oliffac?", "cedarnat-oliffac"],
    ["Šta je Cedarwood Oil Extra?", "cedarwood-oil-extra"],
    ["Šta je Cedrafix?", "cedrafix"],
    ["Šta je Lindenol?", "lindenol"],
    ["Šta je Luminide?", "luminide"],
    ["Šta je Lyral?", "lyral"],
  ])("resolves verified IFF block G %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates fruity strawberry woody amber clean musk and lilac muguet profiles in block G", () => {
    expect(findFragranceTermByQuery("Šta je Beta Naphtyl Isobutyl Ether?")?.answer?.sr).toContain("strawberry");
    expect(findFragranceTermByQuery("Šta je Bornafix?")?.answer?.sr).toContain("dry-amber");
    expect(findFragranceTermByQuery("Šta je Luminide?")?.answer?.sr).toContain("puderastog");
    expect(findFragranceTermByQuery("Šta je Lyral?")?.answer?.sr).toContain("cyclamen");
  });

  test.each([
    "Preporuči parfem sa Beta Naphtyl Isobutyl Ether",
    "Preporuči parfem sa Bornafix",
    "Preporuči parfem sa Cedarnat Oliffac",
    "Preporuči parfem sa Cedarwood Oil Extra",
    "Preporuči parfem sa Cedrafix",
    "Preporuči parfem sa Lindenol",
    "Preporuči parfem sa Luminide",
    "Preporuči parfem sa Lyral",
  ])("verified IFF block G preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je beta naphthyl isobutyl ether?", "beta-naphtyl-isobutyl-ether"],
    ["Šta je Bornafix dry amber?", "bornafix"],
    ["Šta je Cedarnat creamy wood?", "cedarnat-oliffac"],
    ["Šta je Cedarwood balsamic sweet?", "cedarwood-oil-extra"],
    ["Šta je Cedrafix leathery?", "cedrafix"],
    ["Šta je Lindenol lilac?", "lindenol"],
    ["Šta je Luminide powdery musk?", "luminide"],
    ["Šta je Lyral cyclamen?", "lyral"],
  ])("verified IFF block G resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Lyrame Super?", "lyrame-super"],
    ["Šta je Maritima?", "maritima"],
    ["Šta je Meijiff?", "meijiff"],
    ["Šta je Melafleur?", "melafleur"],
    ["Šta je Melozone?", "melozone"],
    ["Šta je Methyl Lavender Ketone?", "methyl-lavender-ketone"],
    ["Šta je Montaverdi?", "montaverdi"],
    ["Šta je Muguesia?", "muguesia"],
  ])("resolves verified IFF block H %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates orange blossom marine muguet melon lavender and green-fruity profiles in block H", () => {
    expect(findFragranceTermByQuery("Šta je Lyrame Super?")?.answer?.sr).toContain("orange-blossom");
    expect(findFragranceTermByQuery("Šta je Maritima?")?.answer?.sr).toContain("ocean breeze");
    expect(findFragranceTermByQuery("Šta je Melafleur?")?.answer?.sr).toContain("melon");
    expect(findFragranceTermByQuery("Šta je Methyl Lavender Ketone?")?.answer?.sr).toContain("metallic");
  });

  test.each([
    "Preporuči parfem sa Lyrame Super",
    "Preporuči parfem sa Maritima",
    "Preporuči parfem sa Meijiff",
    "Preporuči parfem sa Melafleur",
    "Preporuči parfem sa Melozone",
    "Preporuči parfem sa Methyl Lavender Ketone",
    "Preporuči parfem sa Montaverdi",
    "Preporuči parfem sa Muguesia",
  ])("verified IFF block H preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Lyrame orange blossom?", "lyrame-super"],
    ["Šta je Maritima ocean breeze?", "maritima"],
    ["Šta je Meijiff magnolia?", "meijiff"],
    ["Šta je Melafleur green melon?", "melafleur"],
    ["Šta je Melozone aldehydic?", "melozone"],
    ["Šta je Methyl Lavender Ketone metallic?", "methyl-lavender-ketone"],
    ["Šta je Montaverdi apple pear?", "montaverdi"],
    ["Šta je Muguesia lily of the valley?", "muguesia"],
  ])("verified IFF block H resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Musk Z 4?", "musk-z-4"],
    ["Šta je Myrcenyl Acetate?", "myrcenyl-acetate"],
    ["Šta je Nectarate?", "nectarate"],
    ["Šta je Neryl Acetate JAX?", "neryl-acetate-jax"],
    ["Šta je Nootkatone Crystals?", "nootkatone-crystals"],
    ["Šta je Ocimenyl Acetate?", "ocimenyl-acetate"],
    ["Šta je Octacetal?", "octacetal"],
    ["Šta je Orange Flower Ether?", "orange-flower-ether"],
  ])("resolves verified IFF block I %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates powdery musk cologne peach grapefruit herbal citrus and ozonic orange profiles in block I", () => {
    expect(findFragranceTermByQuery("Šta je Musk Z 4?")?.answer?.sr).toContain("puderastog");
    expect(findFragranceTermByQuery("Šta je Myrcenyl Acetate?")?.answer?.sr).toContain("cologne");
    expect(findFragranceTermByQuery("Šta je Nectarate?")?.answer?.sr).toContain("peach");
    expect(findFragranceTermByQuery("Šta je Nootkatone Crystals?")?.answer?.sr).toContain("grapefruit");
    expect(findFragranceTermByQuery("Šta je Octacetal?")?.answer?.sr).toContain("ozonic");
  });

  test.each([
    "Preporuči parfem sa Musk Z 4",
    "Preporuči parfem sa Myrcenyl Acetate",
    "Preporuči parfem sa Nectarate",
    "Preporuči parfem sa Neryl Acetate JAX",
    "Preporuči parfem sa Nootkatone Crystals",
    "Preporuči parfem sa Ocimenyl Acetate",
    "Preporuči parfem sa Octacetal",
    "Preporuči parfem sa Orange Flower Ether",
  ])("verified IFF block I preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Musk Z4 powdery?", "musk-z-4"],
    ["Šta je Myrcenyl Acetate pear?", "myrcenyl-acetate"],
    ["Šta je Nectarate peach?", "nectarate"],
    ["Šta je Neryl Acetate pear?", "neryl-acetate-jax"],
    ["Šta je Nootkatone grapefruit?", "nootkatone-crystals"],
    ["Šta je Ocimenyl Acetate herbal citrus?", "ocimenyl-acetate"],
    ["Šta je Octacetal ozonic green?", "octacetal"],
    ["Šta je Orange Flower Ether bergamot?", "orange-flower-ether"],
  ])("verified IFF block I resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je MCK Chinese?", "mck-chinese"],
    ["Šta je MCK SG?", "mck-sg"],
    ["Šta je Meth Ionone Beta Coeur?", "meth-ionone-beta-coeur"],
    ["Šta je Meth Ionone Gamma A-Tocopherol?", "meth-ionone-gamma-a-tocopherol"],
    ["Šta je Meth Ionone Gamma Coeur?", "meth-ionone-gamma-coeur"],
    ["Šta je Oxaspirane 819?", "oxaspirane-819"],
    ["Šta je Ozofleur?", "ozofleur"],
    ["Šta je Phenoxanol?", "phenoxanol"],
    ["Šta je Piconia?", "piconia"],
    ["Šta je Precyclemone B?", "precyclemone-b"],
  ])("resolves verified IFF block J %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates woody musk methyl ionone ozonic rose and green floral profiles in block J", () => {
    expect(findFragranceTermByQuery("Šta je MCK Chinese?")?.answer?.sr).toContain("cedarwood");
    expect(findFragranceTermByQuery("Šta je Meth Ionone Beta Coeur?")?.answer?.sr).toContain("orris");
    expect(findFragranceTermByQuery("Šta je Ozofleur?")?.answer?.sr).toContain("watery");
    expect(findFragranceTermByQuery("Šta je Phenoxanol?")?.answer?.sr).toContain("rose");
  });

  test.each([
    "Preporuči parfem sa MCK Chinese",
    "Preporuči parfem sa MCK SG",
    "Preporuči parfem sa Meth Ionone Beta Coeur",
    "Preporuči parfem sa Meth Ionone Gamma A-Tocopherol",
    "Preporuči parfem sa Meth Ionone Gamma Coeur",
    "Preporuči parfem sa Oxaspirane 819",
    "Preporuči parfem sa Ozofleur",
    "Preporuči parfem sa Phenoxanol",
    "Preporuči parfem sa Piconia",
    "Preporuči parfem sa Precyclemone B",
  ])("verified IFF block J preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je MCK Chinese cedar musk?", "mck-chinese"],
    ["Šta je MCK SG amber?", "mck-sg"],
    ["Šta je Meth Ionone Beta violet?", "meth-ionone-beta-coeur"],
    ["Šta je Gamma Ionone Tocopherol?", "meth-ionone-gamma-a-tocopherol"],
    ["Šta je Meth Ionone Gamma woody?", "meth-ionone-gamma-coeur"],
    ["Šta je Oxaspirane dry wood?", "oxaspirane-819"],
    ["Šta je Ozofleur fresh air?", "ozofleur"],
    ["Šta je Phenoxanol rose?", "phenoxanol"],
    ["Šta je Piconia leafy?", "piconia"],
    ["Šta je Precyclemone marine?", "precyclemone-b"],
  ])("verified IFF block J resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Prenyl Acetate?", "prenyl-acetate"],
    ["Šta je Anisaldehyde?", "anisaldehyde"],
    ["Šta je Ethyl Vanillin?", "ethyl-vanillin"],
    ["Šta je Piperonal?", "piperonal"],
    ["Šta je Indole?", "indole"],
    ["Šta je Verdox?", "verdox"],
    ["Šta je Cinnamyl Acetate?", "cinnamyl-acetate"],
    ["Šta je Pinane?", "pinane"],
    ["Šta je Methyl Naphtyl Ketone?", "methyl-naphthyl-ketone"],
    ["Šta je Phenylacetic Acid?", "phenylacetic-acid"],
  ])("resolves verified IFF block K %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("separates fruity green anisic vanilla indolic woody pine and honey profiles in block K", () => {
    expect(findFragranceTermByQuery("Šta je Prenyl Acetate?")?.answer?.sr).toContain("pear");
    expect(findFragranceTermByQuery("Šta je Anisaldehyde?")?.answer?.sr).toContain("anisic");
    expect(findFragranceTermByQuery("Šta je Ethyl Vanillin?")?.answer?.sr).toContain("vanilla");
    expect(findFragranceTermByQuery("Šta je Indole?")?.answer?.sr).toContain("animalic");
    expect(findFragranceTermByQuery("Šta je Verdox?")?.answer?.sr).toContain("green-apple");
  });

  test.each([
    "Preporuči parfem sa Prenyl Acetate",
    "Preporuči parfem sa Anisaldehyde",
    "Preporuči parfem sa Ethyl Vanillin",
    "Preporuči parfem sa Piperonal",
    "Preporuči parfem sa Indole",
    "Preporuči parfem sa Verdox",
    "Preporuči parfem sa Cinnamyl Acetate",
    "Preporuči parfem sa Pinane",
    "Preporuči parfem sa Methyl Naphtyl Ketone",
    "Preporuči parfem sa Phenylacetic Acid",
  ])("verified IFF block K preserves recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({
      handled: false,
      type: "unknown",
      confidence: "low",
      entity: null,
      answer: "",
    });
  });

  test.each([
    ["Šta je Prenyl Acetate pear?", "prenyl-acetate"],
    ["Šta je Anisic Aldehyde?", "anisaldehyde"],
    ["Šta je Ethyl Vanillin vanilla?", "ethyl-vanillin"],
    ["Šta je Piperonal heliotrope?", "piperonal"],
    ["Šta je Indole jasmine?", "indole"],
    ["Šta je Verdox green apple?", "verdox"],
    ["Šta je Cinnamyl Acetate balsamic?", "cinnamyl-acetate"],
    ["Šta je Pinane pine?", "pinane"],
    ["Šta je Methyl Naphthyl Ketone floral?", "methyl-naphthyl-ketone"],
    ["Šta je Phenylacetic Acid honey?", "phenylacetic-acid"],
  ])("verified IFF block K resolves aliases: %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });


  test.each([
    ["Šta je Eau de Cologne?", "eau-de-cologne"],
    ["Šta je Eau de Toilette?", "eau-de-toilette"],
    ["Šta je Eau de Parfum?", "eau-de-parfum"],
    ["Šta je Parfum?", "parfum-concentration"],
    ["Šta je Extrait de Parfum?", "extrait-de-parfum"],
    ["Šta je Concentration vs Performance?", "concentration-vs-performance"],
    ["Šta je Top Notes?", "top-notes"],
    ["Šta je Heart Notes?", "heart-notes"],
    ["Šta je Base Notes?", "base-notes"],
    ["Šta je Fragrance Pyramid?", "fragrance-pyramid"],
    ["Šta je Note vs Ingredient?", "note-vs-ingredient"],
  ])("resolves buyer fundamentals block L %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("buyer fundamentals separate concentration labels from guaranteed performance", () => {
    expect(findFragranceTermByQuery("Šta je Eau de Parfum?")?.answer?.sr).toContain("nije automatski");
    expect(findFragranceTermByQuery("Šta je Concentration vs Performance?")?.answer?.sr).toContain("ne znači automatski");
    expect(findFragranceTermByQuery("Šta je Note vs Ingredient?")?.answer?.sr).toContain("nije nužno");
  });

  test.each([
    "Preporuči parfem sa Eau de Cologne",
    "Preporuči parfem sa Eau de Toilette",
    "Preporuči parfem sa Eau de Parfum",
    "Preporuči parfem sa Parfum",
    "Preporuči parfem sa Extrait de Parfum",
    "Preporuči parfem sa Concentration vs Performance",
    "Preporuči parfem sa Top Notes",
    "Preporuči parfem sa Heart Notes",
    "Preporuči parfem sa Base Notes",
    "Preporuči parfem sa Fragrance Pyramid",
    "Preporuči parfem sa Note vs Ingredient",
  ])("buyer fundamentals preserve recommendation sovereignty: %s", (query) => {
    expect(resolveFragranceKnowledgeQuery(query, "sr")).toEqual({handled:false,type:"unknown",confidence:"low",entity:null,answer:""});
  });


  test.each([
    ["Šta je Fragrance Sample?", "sample"],
    ["Šta je Official Sample?", "official-sample"],
    ["Šta je Tester Bottle?", "tester-bottle"],
    ["Šta je Miniature Bottle?", "miniature-bottle"],
    ["Šta je Full Bottle?", "full-bottle"],
    ["Šta je Decanting?", "decanting-process"],
    ["Šta je Is a Decant Original??", "decant-originality"],
    ["Šta je Decant vs Tester?", "decant-vs-tester"],
    ["Šta je 2 ml Decant?", "two-ml-decant"],
    ["Šta je 5 ml Decant?", "five-ml-decant"],
    ["Šta je 10 ml Decant?", "ten-ml-decant"],
    ["Šta je 20 ml Decant?", "twenty-ml-decant"],
    ["Šta je Sprays per ml?", "sprays-per-ml"],
    ["Šta je Try Before You Buy?", "try-before-buy"],
  ])("resolves decant sampling block M %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("sampling guidance avoids false spray precision and distinguishes product types", () => {
    expect(findFragranceTermByQuery("Šta je Sprays per ml?")?.answer?.sr).toContain("Ne postoji");
    expect(findFragranceTermByQuery("Šta je Decant vs Tester?")?.answer?.sr).toContain("različite");
    expect(findFragranceTermByQuery("Šta je 2 ml Decant?")?.answer?.sr).toContain("5 ml");
  });


  test.each([
    ["Šta je Skin Chemistry?", "skin-chemistry"],
    ["Šta je Dry Skin and Fragrance?", "dry-skin-performance"],
    ["Šta je Moisturized Skin and Fragrance?", "moisturized-skin-performance"],
    ["Šta je Fragrance on Clothing?", "fragrance-on-clothing"],
    ["Šta je Temperature and Fragrance Performance?", "temperature-performance"],
    ["Šta je Hot Weather Performance?", "hot-weather-performance"],
    ["Šta je Cold Weather Performance?", "cold-weather-performance"],
    ["Šta je Skin vs Paper Test?", "skin-vs-paper-test"],
    ["Šta je Opening vs Drydown?", "opening-vs-drydown"],
    ["Šta je Spray Count and Performance?", "spray-count-performance"],
    ["Šta je Maceration vs Maturation?", "maceration-vs-maturation"],
    ["Šta je Resting After Transport?", "rest-after-transport"],
  ])("resolves performance and skin block N %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("performance guidance avoids common fragrance myths", () => {
    expect(findFragranceTermByQuery("Šta je Maceration vs Maturation?")?.answer?.sr).toContain("nije pravilo");
    expect(findFragranceTermByQuery("Šta je Spray Count and Performance?")?.answer?.sr).toContain("ne mijenja");
    expect(findFragranceTermByQuery("Šta je Resting After Transport?")?.answer?.sr).toContain("ne zahtijeva");
  });


  test.each([
    ["Šta je Fresh Fragrance?", "fresh-fragrance"],
    ["Šta je Citrus Fragrance?", "citrus-fragrance"],
    ["Šta je Aromatic Fragrance?", "aromatic-fragrance"],
    ["Šta je Aquatic Fragrance?", "aquatic-fragrance"],
    ["Šta je Green Fragrance?", "green-fragrance"],
    ["Šta je Floral Fragrance?", "floral-fragrance"],
    ["Šta je White Floral Fragrance?", "white-floral-fragrance"],
    ["Šta je Fruity Fragrance?", "fruity-fragrance"],
    ["Šta je Gourmand Fragrance?", "gourmand-fragrance"],
    ["Šta je Woody Fragrance?", "woody-fragrance"],
    ["Šta je Amber Fragrance?", "amber-fragrance"],
    ["Šta je Spicy Fragrance?", "spicy-fragrance"],
    ["Šta je Leather Fragrance?", "leather-fragrance"],
    ["Šta je Powdery Fragrance?", "powdery-fragrance"],
    ["Šta je Clean Fragrance?", "clean-fragrance"],
    ["Šta je Creamy Fragrance?", "creamy-fragrance"],
  ])("resolves buyer vocabulary block O %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("buyer vocabulary explains descriptors without treating them as literal ingredients", () => {
    expect(findFragranceTermByQuery("Šta je Leather Fragrance?")?.answer?.sr).toContain("akord");
    expect(findFragranceTermByQuery("Šta je Clean Fragrance?")?.answer?.sr).toContain("opis utiska");
    expect(findFragranceTermByQuery("Šta je Fruity Fragrance?")?.answer?.sr).toContain("akordi");
  });


  test.each([
    ["Šta je Niche Fragrance?", "niche-fragrance"],
    ["Šta je Designer Fragrance?", "designer-fragrance"],
    ["Šta je Indie Fragrance?", "indie-fragrance"],
    ["Šta je Middle Eastern Fragrance?", "middle-eastern-fragrance"],
    ["Šta je Clone Perfume?", "clone-fragrance"],
    ["Šta je Dupe Fragrance?", "dupe-fragrance"],
    ["Šta je Inspired-by Fragrance?", "inspired-by-fragrance"],
    ["Šta je Fragrance DNA?", "fragrance-dna"],
    ["Šta je Private Line?", "private-line"],
    ["Šta je Mass Appealing?", "mass-appealing"],
    ["Šta je Challenging Fragrance?", "challenging-fragrance"],
    ["Šta je Vintage Fragrance?", "vintage-fragrance"],
  ])("resolves market terminology block P %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("market vocabulary avoids quality judgments and counterfeit confusion", () => {
    expect(findFragranceTermByQuery("Šta je Designer Fragrance?")?.answer?.sr).toContain("nije ocjena kvaliteta");
    expect(findFragranceTermByQuery("Šta je Clone Perfume?")?.answer?.sr).toContain("Nije isto što i falsifikat");
    expect(findFragranceTermByQuery("Šta je Private Line?")?.answer?.sr).toContain("ne garantuje");
  });


  test.each([
    ["Šta je Proper Fragrance Storage?", "proper-fragrance-storage"],
    ["Šta je Perfume in the Bathroom?", "bathroom-storage"],
    ["Šta je Sunlight and Heat?", "sunlight-and-heat"],
    ["Šta je Perfume in the Fridge?", "fridge-storage"],
    ["Šta je Fragrance Color Change?", "fragrance-color-change"],
    ["Šta je Cloudiness and Sediment?", "cloudiness-and-sediment"],
    ["Šta je Has Perfume Gone Off??", "fragrance-gone-off"],
    ["Šta je Air Exposure?", "air-exposure"],
    ["Šta je Batch Code?", "batch-code"],
    ["Šta je Batch Code and Authenticity?", "batch-code-authenticity"],
    ["Šta je Counterfeit Fragrance?", "counterfeit-fragrance"],
    ["Šta je Authenticity from a Photo?", "photo-authenticity-limit"],
  ])("resolves storage authenticity block Q %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("storage and authenticity guidance avoids unsafe certainty", () => {
    expect(findFragranceTermByQuery("Šta je Batch Code and Authenticity?")?.answer?.sr).toContain("sam po sebi ne dokazuje");
    expect(findFragranceTermByQuery("Šta je Authenticity from a Photo?")?.answer?.sr).toContain("nije dovoljna");
    expect(findFragranceTermByQuery("Šta je Perfume in the Fridge?")?.answer?.sr).toContain("nije potreban");
  });


  const buyerQueryBases = [
  [
    "eau-de-toilette",
    "edt"
  ],
  [
    "eau-de-parfum",
    "edp"
  ],
  [
    "extrait-de-parfum",
    "extrait"
  ],
  [
    "parfum-concentration",
    "parfum strength"
  ],
  [
    "concentration-vs-performance",
    "higher concentration stronger"
  ],
  [
    "top-notes",
    "top notes"
  ],
  [
    "heart-notes",
    "middle notes"
  ],
  [
    "base-notes",
    "base notes"
  ],
  [
    "fragrance-pyramid",
    "perfume pyramid"
  ],
  [
    "note-vs-ingredient",
    "note vs ingredient"
  ],
  [
    "sample",
    "perfume sample"
  ],
  [
    "official-sample",
    "official sample"
  ],
  [
    "tester-bottle",
    "perfume tester"
  ],
  [
    "miniature-bottle",
    "perfume miniature"
  ],
  [
    "full-bottle",
    "full bottle"
  ],
  [
    "decanting-process",
    "perfume decanting"
  ],
  [
    "decant-originality",
    "dekant original"
  ],
  [
    "decant-vs-tester",
    "decant vs tester"
  ],
  [
    "two-ml-decant",
    "2 ml decant"
  ],
  [
    "five-ml-decant",
    "5 ml decant"
  ],
  [
    "ten-ml-decant",
    "10 ml decant"
  ],
  [
    "twenty-ml-decant",
    "20 ml decant"
  ],
  [
    "sprays-per-ml",
    "sprays per ml"
  ],
  [
    "try-before-buy",
    "try before you buy"
  ],
  [
    "skin-chemistry",
    "skin chemistry"
  ],
  [
    "dry-skin-performance",
    "dry skin perfume"
  ],
  [
    "moisturized-skin-performance",
    "moisturized skin perfume"
  ],
  [
    "fragrance-on-clothing",
    "fragrance on clothing"
  ],
  [
    "temperature-performance",
    "temperature perfume performance"
  ],
  [
    "hot-weather-performance",
    "hot weather perfume"
  ],
  [
    "cold-weather-performance",
    "perfume in cold"
  ],
  [
    "skin-vs-paper-test",
    "skin vs paper perfume"
  ],
  [
    "opening-vs-drydown",
    "opening vs drydown"
  ],
  [
    "spray-count-performance",
    "spray count perfume"
  ],
  [
    "maceration-vs-maturation",
    "maceration vs maturation"
  ],
  [
    "rest-after-transport",
    "perfume after transport"
  ],
  [
    "niche-fragrance",
    "niche perfume"
  ],
  [
    "designer-fragrance",
    "designer perfume"
  ],
  [
    "middle-eastern-fragrance",
    "arapski parfem"
  ],
  [
    "clone-fragrance",
    "clone perfume"
  ],
  [
    "dupe-fragrance",
    "dupe perfume"
  ],
  [
    "inspired-by-fragrance",
    "inspired by perfume"
  ],
  [
    "fragrance-dna",
    "fragrance dna"
  ],
  [
    "private-line",
    "private line fragrance"
  ],
  [
    "mass-appealing",
    "mass appealing fragrance"
  ],
  [
    "challenging-fragrance",
    "challenging fragrance"
  ],
  [
    "proper-fragrance-storage",
    "how to store perfume"
  ],
  [
    "bathroom-storage",
    "perfume in bathroom"
  ],
  [
    "fridge-storage",
    "perfume in fridge"
  ],
  [
    "sunlight-and-heat",
    "sunlight perfume"
  ],
  [
    "fragrance-color-change",
    "perfume color change"
  ],
  [
    "cloudiness-and-sediment",
    "sediment in perfume"
  ],
  [
    "fragrance-gone-off",
    "perfume gone off"
  ],
  [
    "batch-code",
    "batch code perfume"
  ],
  [
    "batch-code-authenticity",
    "batch code authenticity"
  ],
  [
    "counterfeit-fragrance",
    "fake perfume"
  ],
  [
    "photo-authenticity-limit",
    "authenticity from photo"
  ]
];

  test.each(
    buyerQueryBases.flatMap(([expectedId, alias]) => [
      [`Sta je ${alias}?`, expectedId],
      [`Možeš li objasniti ${alias}?`, expectedId],
      [`What is ${alias}?`, expectedId],
    ])
  )("real-world buyer query matrix resolves %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test.each([
  [
    "jel dekant original",
    "decant-originality"
  ],
  [
    "je li dekant original",
    "decant-originality"
  ],
  [
    "da l je dekant original",
    "decant-originality"
  ],
  [
    "kolko traje 2ml",
    "two-ml-decant"
  ],
  [
    "koliko traje 5 ml",
    "five-ml-decant"
  ],
  [
    "kolko traje 10ml",
    "ten-ml-decant"
  ],
  [
    "koliko prskanja u 1 ml",
    "sprays-per-ml"
  ],
  [
    "kolko prskanja ima 1ml",
    "sprays-per-ml"
  ],
  [
    "jel edt slabiji",
    "eau-de-toilette"
  ],
  [
    "je li edp jaci",
    "eau-de-parfum"
  ],
  [
    "jel extrait jaci",
    "extrait-de-parfum"
  ],
  [
    "da li je veca koncentracija jaci parfem",
    "concentration-vs-performance"
  ],
  [
    "mora li parfem da macerira",
    "maceration-vs-maturation"
  ],
  [
    "moze li parfem posle transporta odmah da se koristi",
    "rest-after-transport"
  ],
  [
    "parfem na suvoj kozi jel krace traje",
    "dry-skin-performance"
  ],
  [
    "moze li parfem na odeci",
    "fragrance-on-clothing"
  ],
  [
    "koza ili papir parfem",
    "skin-vs-paper-test"
  ],
  [
    "jel prvi utisak isto sto i drydown",
    "opening-vs-drydown"
  ],
  [
    "kako cuvati parfem",
    "proper-fragrance-storage"
  ],
  [
    "jel parfem moze u frizider",
    "fridge-storage"
  ],
  [
    "jel lose drzati parfem u kupatilu",
    "bathroom-storage"
  ],
  [
    "da li sunce kvari parfem",
    "sunlight-and-heat"
  ],
  [
    "jel normalno da parfem potamni",
    "fragrance-color-change"
  ],
  [
    "jel normalan talog u parfemu",
    "cloudiness-and-sediment"
  ],
  [
    "da li se parfem pokvario ako je star",
    "fragrance-gone-off"
  ],
  [
    "jel batch code dokazuje original",
    "batch-code-authenticity"
  ],
  [
    "jel mozes znati da je original sa slike",
    "photo-authenticity-limit"
  ],
  [
    "sta znaci niche parfem",
    "niche-designer-indie"
  ],
  [
    "sta je dizajnerski parfem",
    "designer-fragrance"
  ],
  [
    "sta znaci arapski parfem",
    "middle-eastern-fragrance"
  ],
  [
    "jel clone isto sto i falsifikat",
    "clone-fragrance"
  ],
  [
    "jel dupe ista formula",
    "dupe-fragrance"
  ],
  [
    "sta znaci inspired by parfem",
    "inspired-by-fragrance"
  ],
  [
    "sta znaci dna parfema",
    "fragrance-dna"
  ],
  [
    "jel private line automatski kvalitetniji",
    "private-line"
  ],
  [
    "jel mass appealing znaci kvalitetan",
    "mass-appealing"
  ],
  [
    "sta znaci challenging miris",
    "challenging-fragrance"
  ],
  [
    "sta je clean fragrance",
    "clean-fragrance"
  ],
  [
    "sta je creamy fragrance",
    "creamy-fragrance"
  ],
  [
    "sta je powdery fragrance",
    "powdery-fragrance"
  ],
  [
    "sta je aquatic fragrance",
    "aquatic-fragrance"
  ],
  [
    "sta je gourmand fragrance",
    "gourmand-fragrance"
  ],
  [
    "sta je white floral fragrance",
    "white-floral-fragrance"
  ]
])(
    "colloquial SR buyer query resolves %s",
    (query, expectedId) => {
      expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
    }
  );

  test.each([
  "Preporuči mi niche parfem za posao",
  "Koji designer parfem da kupim",
  "Daj mi arapski parfem za zimu",
  "Treba mi clone Bleu de Chanel",
  "Koji dupe je najbolji za mene",
  "Preporuči inspired by parfem za leto",
  "Koji EDP za kancelariju",
  "Treba mi extrait za izlazak",
  "Koji gourmand parfem preporučuješ",
  "Daj mi woody parfem za svaki dan",
  "Preporuči aquatic parfem za more",
  "Koji clean fragrance za posao",
  "Tražim powdery parfem za dejt",
  "Preporuči white floral za svadbu",
  "Daj mi nešto sa jakim sillage",
  "Koji parfem najduže traje",
  "Preporuči parfem koji traje 12 sati",
  "Koji parfem ima najbolju projekciju",
  "Treba mi 5 ml parfema za leto",
  "Daj mi parfem sličan mom testeru",
  "Preporuči nešto što liči na niche parfem",
  "Koji parfem da probam pre full bottle",
  "Treba mi signature scent",
  "Koji mass appealing parfem za poklon",
  "Preporuči challenging parfem",
  "Daj mi parfem sa citrusnim openingom",
  "Koji amber parfem za hladno vreme",
  "Preporuči leather fragrance za veče",
  "Koji spicy fragrance za jesen",
  "Treba mi fresh fragrance do 40€"
])(
    "buyer recommendation intent stays outside FI: %s",
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
    ["Šta je Unisex Fragrance?", "unisex-fragrance"],
    ["Može li muškarac nositi ženski parfem?", "wearing-across-gender-labels"],
    ["Šta je Blind Buy Perfume?", "blind-buy"],
    ["Šta je Safe Blind Buy?", "safe-blind-buy"],
    ["Šta je Versatile Fragrance?", "versatile-fragrance"],
    ["Šta je Seasonal Fragrance?", "seasonal-fragrance"],
    ["Šta je Discontinued Fragrance?", "discontinued-fragrance"],
    ["Šta je Limited Edition Fragrance?", "limited-edition-fragrance"],
  ])("resolves buyer lingo block R %s", (query, expectedId) => {
    expect(findFragranceTermByQuery(query)?.id).toBe(expectedId);
  });

  test("buyer lingo stays descriptive rather than making purchase judgments", () => {
    expect(findFragranceTermByQuery("Šta je Safe Blind Buy?")?.answer?.sr).toContain("Ne postoji zaista siguran");
    expect(findFragranceTermByQuery("Šta je Limited Edition Fragrance?")?.answer?.sr).toContain("ne znači");
  });


});
