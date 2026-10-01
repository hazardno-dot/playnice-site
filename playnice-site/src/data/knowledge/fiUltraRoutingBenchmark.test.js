import { fiUltraRoutingBenchmark } from "./fiUltraRoutingBenchmark";
import { resolveFragranceKnowledgeQuery } from "../../lib/fragranceKnowledgeRouter";

describe("FI Ultra routing benchmark", () => {
  test.each(fiUltraRoutingBenchmark.discovery)(
    "keeps discovery query on original engine: %s",
    (query) => {
      expect(
        resolveFragranceKnowledgeQuery(query, "sr").handled
      ).toBe(false);
    }
  );

  test.each(fiUltraRoutingBenchmark.knowledge)(
    "routes knowledge query correctly: %s",
    (query, expectedType) => {
      const result =
        resolveFragranceKnowledgeQuery(query, "sr");

      expect(result.handled).toBe(true);
      expect(result.type).toBe(expectedType);
      expect(result.answer).toBeTruthy();
    }
  );
});
