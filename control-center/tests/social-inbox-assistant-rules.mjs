import assert from "node:assert/strict";
import { buildAssistantDraft, matchAssistantProducts } from "../lib/social-inbox-assistant.mjs";

const afnan9am = {
  id: 1,
  slug: "afnan-9am",
  name: "Afnan 9 AM Eau de Parfum",
  shortName: "9 AM",
  category: "Arabian",
  sizes: { "5ml": 4, "10ml": 7, "20ml": 13 },
  recommendations: ["afnan-turathi-blue"],
};

const turathiBlue = {
  id: 2,
  slug: "afnan-turathi-blue",
  name: "Afnan Turathi Blue Homme Eau de Parfum",
  shortName: "Turathi Blue",
  category: "Arabian",
  sizes: { "5ml": 5, "10ml": 9, "20ml": 17 },
  recommendations: [],
};

const products = [afnan9am, turathiBlue];

function inbound(id, body) {
  return { id, meta_message_id: `meta-${id}`, direction: "inbound", body, sent_at: "2026-09-23T20:00:00.000Z" };
}

function outbound(id, body) {
  return { id, meta_message_id: `meta-${id}`, direction: "outbound", body, sent_at: "2026-09-23T20:01:00.000Z" };
}

{
  const matched = matchAssistantProducts("Imate li Afnan 9 AM?", products);
  assert.equal(matched[0]?.slug, "afnan-9am");
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("1", "Imate li Afnan 9 AM, koje su cene i koliko je dostava?")],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /5 ml — 4 €/);
  assert.match(result.body, /10 ml — 7 €/);
  assert.match(result.body, /20 ml — 13 €/);
  assert.match(result.body, /Dostava u Crnoj Gori je 4 €/);
  assert.match(result.body, /Kompletnu ponudu možete pogledati na www\.playniceshop\.me\./);
  assert.doesNotMatch(result.body, /2 ml/);
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("2", "Imate li 100ml Afnan 9 AM?")],
  });
  assert.equal(result.status, "ready");
  assert.equal(result.intent, "full_bottle");
  assert.match(result.body, /nije deo naše standardne ponude/);
  assert.match(result.body, /proveriti dostupnost kod dobavljača/);
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("3", "Koliko košta Xerjoff Naxos?")],
  });
  assert.equal(result.status, "needs_review");
  assert.equal(result.intent, "price_unknown_product");
  assert.equal(result.body, "");
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("4", "Gde je moja porudžbina?")],
  });
  assert.equal(result.status, "needs_review");
  assert.equal(result.intent, "order_status");
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [
      inbound("5", "Do you have Afnan 9 AM and what are the prices?"),
      outbound("6", "Yes."),
      inbound("7", "10 ml"),
    ],
  });
  assert.equal(result.status, "ready");
  assert.equal(result.intent, "size_followup");
  assert.match(result.body, /10 ml of 9 AM is 7 €/);
  assert.doesNotMatch(result.body, /je 7 €/);
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [
      inbound("8", "Imate li Afnan 9 AM i koje veličine?"),
      outbound("9", "Imamo više dekant veličina."),
      inbound("10", "2 ml"),
    ],
  });
  assert.equal(result.status, "ready");
  assert.equal(result.intent, "size_followup");
  assert.match(result.body, /2 ml nije navedeno/);
  assert.match(result.body, /5 ml, 10 ml, 20 ml/);
}


{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("11", "Koliko je 10ml Afnan 9 AM?")],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /10 ml 9 AM je u trenutnoj ponudi po ceni od 7 €/);
  assert.doesNotMatch(result.body, /5 ml — 4 €/);
  assert.doesNotMatch(result.body, /20 ml — 13 €/);
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("12", "Imate li 2ml Afnan 9AM?")],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /2 ml nije navedeno/);
  assert.match(result.body, /5 ml, 10 ml, 20 ml/);
}

console.log("PASS  Assistant rules ground prices and sizes in the supplied catalog");
console.log("PASS  Unknown products and operational status questions are escalated for review");

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("13", "Imate li Afnan 9 AM, koje su cijene i koliko je dostava?")],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /sljedećim dekant veličinama/);
  assert.doesNotMatch(result.body, /sledećim dekant veličinama/);
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [
      inbound("14", "Imate li Afnan 9 AM i koje su cijene?"),
      outbound("15", "Da."),
      inbound("16", "10 ml"),
    ],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /10 ml 9 AM je 7 €/u);
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("17", "Imate li 100ml Afnan 9 AM? Možete li provjeriti?")],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /nije dio naše standardne ponude/);
  assert.match(result.body, /Možemo provjeriti dostupnost/);
}

console.log("PASS  Contextual size follow-ups preserve product context and customer language");

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [
      inbound("18", "Koliko je 10ml Afnan 9 AM?"),
      outbound("19", "Kompletnu ponudu možete pogledati na www.playniceshop.me."),
      inbound("20", "A koliko je 20ml Afnan 9 AM?"),
    ],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /20 ml 9 AM je u trenutnoj ponudi po ceni od 13 €/);
  assert.doesNotMatch(result.body, /playniceshop\.me/);
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [
      outbound("21", "Kompletnu ponudu možete pogledati na www.playniceshop.me."),
      inbound("22", "Koja vam je kompletna ponuda?"),
    ],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /Kompletnu ponudu možete pogledati na www\.playniceshop\.me\./);
}

{
  const result = buildAssistantDraft({
    thread: { participant_name: "Test" },
    products,
    messages: [inbound("23", "What fragrances do you have?")],
  });
  assert.equal(result.status, "ready");
  assert.match(result.body, /You can see our full offer at www\.playniceshop\.me\./);
}

console.log("PASS  Webshop footer is added to relevant commercial replies without repetitive thread spam");

