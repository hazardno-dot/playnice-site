import { describe, expect, test } from "vitest";
import { auditAnnouncementDraft } from "./announcementDraft.mjs";

describe("announcement draft validation", () => {
  test("requires bilingual copy", () => {
    const result = auditAnnouncementDraft({ id: "promo-one", enabled: true, text: { sr: "", en: "Hello" }, priority: 10 });
    expect(result.errors).toContain("SR copy is required.");
  });

  test("requires product slug for openProduct", () => {
    const result = auditAnnouncementDraft({ id: "promo-one", text: { sr: "Ćao", en: "Hello" }, action: "openProduct", priority: 10 });
    expect(result.errors).toContain("Product slug is required for openProduct.");
  });

  test("accepts a valid bilingual draft", () => {
    const result = auditAnnouncementDraft({ id: "promo-one", text: { sr: "Ćao", en: "Hello" }, action: "none", priority: 10 });
    expect(result.errors).toEqual([]);
  });
});
