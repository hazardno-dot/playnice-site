const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const OWNER = "hazardno-dot";
const REPO_NAME = "playnice-site";
const PRODUCT_PATH = "playnice-site/src/data/products/index.js";
const CATALOG_CACHE_MS = 5 * 60 * 1000;
const RESPONSE_WINDOW_MS = 24 * 60 * 60 * 1000;
export const ASSISTANT_RULES_VERSION = "assistant-v2.0";

let catalogCache = { expiresAt: 0, products: [] };

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 400) }; }
}

async function supabaseFetch(path, token, init = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase server configuration is incomplete.");
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: token && SUPABASE_SERVICE_ROLE_KEY && token === SUPABASE_SERVICE_ROLE_KEY
        ? SUPABASE_SERVICE_ROLE_KEY
        : SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function github(path) {
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is required for the live PlayNice catalog.");
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(payload?.message || `GitHub request failed (${response.status}).`);
  return payload;
}

export async function loadLiveProducts() {
  if (catalogCache.products.length && Date.now() < catalogCache.expiresAt) return catalogCache.products;

  const file = await github(`/repos/${OWNER}/${REPO_NAME}/contents/${PRODUCT_PATH}?ref=main`);
  const source = Buffer.from(file?.content || "", "base64").toString("utf8");
  if (!source) throw new Error("Live product catalog is empty.");

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  const liveModule = await import(moduleUrl);
  const products = Array.isArray(liveModule?.products) ? liveModule.products : [];
  if (!products.length) throw new Error("Live product catalog did not expose products.");

  catalogCache = { products, expiresAt: Date.now() + CATALOG_CACHE_MS };
  return products;
}

export function normalizeAssistantText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const tokenSet = (value) => new Set(normalizeAssistantText(value).split(" ").filter(Boolean));
const phrase = (text, values) => values.some((value) => text.includes(normalizeAssistantText(value)));

function productAliases(product) {
  const aliases = [
    product?.name,
    product?.shortName,
    product?.modalName,
    product?.cardName,
    String(product?.slug || "").replace(/-/g, " "),
  ]
    .map(normalizeAssistantText)
    .filter(Boolean);

  return [...new Set(aliases)].sort((a, b) => b.length - a.length);
}

function aliasScore(text, textTokens, alias) {
  if (!alias) return 0;
  const aliasTokens = alias.split(" ").filter(Boolean);

  if (alias.length >= 4 && (` ${text} `).includes(` ${alias} `)) {
    return 1000 + alias.length;
  }

  if (aliasTokens.length === 1) {
    const one = aliasTokens[0];
    if (one.length >= 5 && textTokens.has(one)) return 700 + one.length;
    return 0;
  }

  const matched = aliasTokens.filter((token) => token.length > 1 && textTokens.has(token));
  const ratio = matched.length / aliasTokens.length;
  if (matched.length >= 2 && ratio >= 0.66) return 400 + Math.round(ratio * 100) + matched.length * 5;
  return 0;
}

export function matchAssistantProducts(text, products, limit = 3) {
  const normalized = normalizeAssistantText(text);
  const textTokens = tokenSet(normalized);
  const scored = [];

  for (const product of products || []) {
    let score = 0;
    for (const alias of productAliases(product)) {
      score = Math.max(score, aliasScore(normalized, textTokens, alias));
    }
    if (score > 0) scored.push({ product, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || String(a.product?.name || "").localeCompare(String(b.product?.name || "")))
    .slice(0, limit)
    .map((item) => item.product);
}

function languageSignals(text) {
  const normalized = normalizeAssistantText(text);
  const english = ["hello", "hi", "price", "how much", "shipping", "delivery", "do you have", "available", "full bottle", "order", "buy", "thank you", "thanks"];
  const local = ["zdravo", "cena", "cijena", "koliko", "dostava", "isporuka", "imate li", "ima li", "poruc", "naruc", "hvala", "bocica"];
  return {
    en: english.reduce((sum, item) => sum + (normalized.includes(normalizeAssistantText(item)) ? 1 : 0), 0),
    local: local.reduce((sum, item) => sum + (normalized.includes(normalizeAssistantText(item)) ? 1 : 0), 0),
  };
}

function detectEnglish(text, fallbackText = "") {
  const primary = languageSignals(text);
  if (primary.en || primary.local) return primary.en > primary.local;
  const fallback = languageSignals(fallbackText);
  return fallback.en > fallback.local;
}

function detectIjekavian(text, fallbackText = "") {
  const score = (value) => {
    const normalized = normalizeAssistantText(value);
    const ijekavian = ["cijena", "cijene", "gdje", "sljedec", "prije", "vrijeme", "lijep", "zeljela", "htjela", "uvijek", "provjer", "vidjet"];
    const ekavian = ["cena", "cene", "gde", "sledec", "pre odluke", "vreme", "lep", "zelela", "htela", "uvek", "prover", "videt"];
    return {
      ije: ijekavian.reduce((sum, item) => sum + (normalized.includes(normalizeAssistantText(item)) ? 1 : 0), 0),
      eka: ekavian.reduce((sum, item) => sum + (normalized.includes(normalizeAssistantText(item)) ? 1 : 0), 0),
    };
  };

  const primary = score(text);
  if (primary.ije || primary.eka) return primary.ije > primary.eka;
  const fallback = score(fallbackText);
  return fallback.ije > fallback.eka;
}

function extractRequestedSizes(text) {
  const matches = [...String(text || "").matchAll(/\b(2|5|10|20|30|50|100)\s*ml\b/gi)];
  return [...new Set(matches.map((match) => `${match[1]}ml`))];
}

function priceLines(product, english) {
  const entries = Object.entries(product?.sizes || {});
  if (!entries.length) return [];
  return entries.map(([size, price]) => `• ${size.replace("ml", " ml")} — ${Number(price)} €`);
}

function productLabel(product) {
  return String(product?.shortName || product?.name || "").trim();
}

function sizeAdvice(english, ijekavian = false) {
  if (english) return "For a first impression, 2 ml is enough. If you want to wear the fragrance several times before deciding, 5 ml is the better choice.";
  return ijekavian
    ? "Za prvi utisak 2 ml je dovoljno. Ako želite da parfem nosite nekoliko puta prije odluke, 5 ml je bolji izbor."
    : "Za prvi utisak 2 ml je dovoljno. Ako želite da parfem nosite nekoliko puta pre odluke, 5 ml je bolji izbor.";
}

function shippingCopy(english) {
  return english
    ? "Delivery in Montenegro is 4 €. It is free for orders of 39 € or more, and delivery usually takes 1–2 working days after courier pickup."
    : "Dostava u Crnoj Gori je 4 €. Za porudžbine od 39 € i više je besplatna, a isporuka je obično 1–2 radna dana nakon što kurir preuzme pošiljku.";
}

function fullBottleCopy(english, product, ijekavian = false) {
  const label = product ? productLabel(product) : "";
  if (english) {
    return `${label ? `For ${label}, ` : ""}full bottles / 100 ml are not part of our standard webshop offer. We can check availability with our supplier and get back to you.`;
  }
  return ijekavian
    ? `${label ? `Za ${label}, ` : ""}puna bočica / 100 ml nije dio naše standardne ponude na sajtu. Možemo provjeriti dostupnost kod dobavljača i javiti Vam.`
    : `${label ? `Za ${label}, ` : ""}puna bočica / 100 ml nije deo naše standardne ponude na sajtu. Možemo proveriti dostupnost kod dobavljača i javiti Vam.`;
}

function orderDetailsCopy(english) {
  return english
    ? "For the order, please send us your first and last name, phone number, address, city and email."
    : "Za porudžbinu nam pošaljite ime i prezime, broj telefona, adresu, grad i email.";
}

function findContextProducts(messages, products, latestText) {
  const direct = matchAssistantProducts(latestText, products);
  if (direct.length) return { products: direct, inferred: false };

  const history = [...(messages || [])].reverse();
  for (const message of history) {
    if (!message?.body || message.body === latestText) continue;
    const matches = matchAssistantProducts(message.body, products);
    if (matches.length) return { products: matches, inferred: true };
  }
  return { products: [], inferred: false };
}

function resolveRecommendations(product, products) {
  const slugs = Array.isArray(product?.recommendations) ? product.recommendations : [];
  const bySlug = new Map((products || []).map((item) => [item.slug, item]));
  return slugs.map((slug) => bySlug.get(slug)).filter(Boolean).slice(0, 3);
}

export function buildAssistantDraft({ thread, messages, products }) {
  const ordered = Array.isArray(messages) ? messages : [];
  const latest = [...ordered].reverse().find((message) => message?.direction === "inbound") || null;
  const latestText = String(latest?.body || "").trim();
  const normalized = normalizeAssistantText(latestText);
  const previousInbound = [...ordered].reverse().find((message) =>
    message?.direction === "inbound" &&
    message !== latest &&
    String(message?.body || "").trim()
  );
  const english = detectEnglish(latestText, previousInbound?.body || "");
  const ijekavian = !english && detectIjekavian(latestText, previousInbound?.body || "");
  const context = findContextProducts(ordered, products, latestText);
  const matchedProducts = context.products;
  const primary = matchedProducts[0] || null;
  const requestedSizes = extractRequestedSizes(latestText);

  if (!latest || !latestText) {
    return {
      status: "needs_review",
      intent: "media_or_empty",
      confidence: 0.2,
      body: "",
      reason: "The latest inbound message has no text and needs human review.",
      products: [],
      sourceMessage: latest,
    };
  }

  const isOrderStatus = phrase(normalized, [
    "gde je moja", "gdje je moja", "status porudzbine", "status narudzbe", "moja posiljka",
    "tracking", "where is my order", "order status", "my shipment"
  ]);
  if (isOrderStatus) {
    return {
      status: "needs_review",
      intent: "order_status",
      confidence: 0.35,
      body: "",
      reason: "Order/shipment status requires live operational context.",
      products: matchedProducts,
      sourceMessage: latest,
    };
  }

  const asksFullBottle = phrase(normalized, ["100 ml", "100ml", "puna bocica", "cela bocica", "cijela bocica", "full bottle"]);
  const asksPrice = phrase(normalized, ["cena", "cene", "cijena", "cijene", "koliko kosta", "koliko je", "price", "how much"]);
  const asksAvailability = phrase(normalized, ["imate li", "ima li", "dostupan", "dostupno", "na stanju", "available", "in stock", "do you have"]);
  const asksShipping = phrase(normalized, ["dostava", "isporuka", "kurir", "koliko traje", "kada stize", "kad stize", "shipping", "delivery", "when does it arrive"]);
  const asksRecommendation = phrase(normalized, ["preporuc", "preporuka", "slican", "slicno", "alternativa", "recommend", "similar to", "alternative"]);
  const asksOrder = phrase(normalized, ["porucio bih", "porucila bih", "porucim", "poruciti", "narucim", "naruciti", "uzeo bih", "uzela bih", "hocu da uzmem", "zelim da uzmem", "order", "buy"]);
  const asksSizeAdvice = phrase(normalized, ["2 ml dovoljno", "2ml dovoljno", "koliko traje 2 ml", "koliko traje 2ml", "is 2 ml enough", "is 2ml enough"]);
  const asksAuthenticity = phrase(normalized, ["original", "originalni", "originalan", "authentic", "genuine"]);
  const asksWebsite = phrase(normalized, ["sajt", "webshop", "website", "web site", "link"]);
  const onlyGreeting = /^(zdravo|cao|dobar dan|dobro vece|pozdrav|hello|hi|hey)[!. ]*$/.test(normalized);
  const onlyThanks = /^(hvala|hvala vam|thanks|thank you)[!. ]*$/.test(normalized);

  if (onlyThanks) {
    return {
      status: "ready",
      intent: "thanks",
      confidence: 0.99,
      body: english ? "Thank you! We’re here if you need anything else. 😊" : "Hvala Vama! Tu smo za sve što treba. 😊",
      reason: "Simple thank-you response.",
      products: [],
      sourceMessage: latest,
    };
  }

  if (onlyGreeting) {
    return {
      status: "ready",
      intent: "greeting",
      confidence: 0.98,
      body: english ? "Hello! Of course — how can we help?" : "Zdravo! Naravno — izvolite, kako možemo da pomognemo?",
      reason: "Simple greeting.",
      products: [],
      sourceMessage: latest,
    };
  }

  if (asksSizeAdvice && !primary) {
    return {
      status: "ready",
      intent: "size_advice",
      confidence: 0.96,
      body: sizeAdvice(english, ijekavian),
      reason: "Standard decant-size guidance.",
      products: [],
      sourceMessage: latest,
    };
  }

  if (asksFullBottle) {
    const parts = [fullBottleCopy(english, primary, ijekavian)];
    if (asksShipping) parts.push(shippingCopy(english));
    return {
      status: "ready",
      intent: "full_bottle",
      confidence: primary ? 0.98 : 0.94,
      body: parts.join("\n\n"),
      reason: "Standard full-bottle supplier-check workflow.",
      products: primary ? [primary] : [],
      sourceMessage: latest,
    };
  }

  if ((asksPrice || asksAvailability) && !primary) {
    return {
      status: "needs_review",
      intent: asksPrice ? "price_unknown_product" : "availability_unknown_product",
      confidence: 0.3,
      body: "",
      reason: "A product question was detected but the fragrance could not be matched safely to the live catalog.",
      products: [],
      sourceMessage: latest,
    };
  }

  if (
    primary &&
    requestedSizes.length &&
    !asksPrice &&
    !asksAvailability &&
    !asksOrder &&
    !asksFullBottle &&
    !asksShipping &&
    !asksRecommendation &&
    !asksSizeAdvice &&
    !asksAuthenticity &&
    !asksWebsite
  ) {
    const offered = requestedSizes.filter((size) => Object.prototype.hasOwnProperty.call(primary?.sizes || {}, size));
    const unavailable = requestedSizes.filter((size) => !Object.prototype.hasOwnProperty.call(primary?.sizes || {}, size));
    const lines = [];

    for (const size of offered) {
      lines.push(english
        ? `${size.replace("ml", " ml")} of ${productLabel(primary)} is ${Number(primary.sizes[size])} €.`
        : `${size.replace("ml", " ml")} ${productLabel(primary)} je ${Number(primary.sizes[size])} €.`);
    }
    if (unavailable.length) {
      lines.push(english
        ? `${unavailable.map((size) => size.replace("ml", " ml")).join(", ")} is not listed for this fragrance. Current sizes are: ${Object.keys(primary.sizes || {}).map((size) => size.replace("ml", " ml")).join(", ")}.`
        : `${unavailable.map((size) => size.replace("ml", " ml")).join(", ")} nije navedeno za ovaj parfem. Trenutne veličine su: ${Object.keys(primary.sizes || {}).map((size) => size.replace("ml", " ml")).join(", ")}.`);
    }

    return {
      status: "ready",
      intent: "size_followup",
      confidence: context.inferred ? 0.88 : 0.96,
      body: lines.join("\n\n"),
      reason: context.inferred ? "Size follow-up resolved from recent product context." : "Size follow-up matched to the live catalog.",
      products: [primary],
      sourceMessage: latest,
    };
  }

  const parts = [];
  const intents = [];

  if (primary && (asksPrice || asksAvailability)) {
    for (const product of matchedProducts) {
      const label = productLabel(product);
      const sizes = product?.sizes || {};
      const offeredRequested = requestedSizes.filter((size) => Object.prototype.hasOwnProperty.call(sizes, size));
      const unavailableRequested = requestedSizes.filter((size) => !Object.prototype.hasOwnProperty.call(sizes, size));

      if (requestedSizes.length) {
        const requestedParts = [];
        for (const size of offeredRequested) {
          requestedParts.push(english
            ? `${size.replace("ml", " ml")} of ${label} is listed at ${Number(sizes[size])} €.`
            : `${size.replace("ml", " ml")} ${label} je u trenutnoj ponudi po ${ijekavian ? "cijeni" : "ceni"} od ${Number(sizes[size])} €.`);
        }
        if (unavailableRequested.length) {
          requestedParts.push(english
            ? `${unavailableRequested.map((size) => size.replace("ml", " ml")).join(", ")} is not listed for this fragrance. Current sizes are: ${Object.keys(sizes).map((size) => size.replace("ml", " ml")).join(", ")}.`
            : `${unavailableRequested.map((size) => size.replace("ml", " ml")).join(", ")} nije navedeno za ovaj parfem. Trenutne veličine su: ${Object.keys(sizes).map((size) => size.replace("ml", " ml")).join(", ")}.`);
        }
        if (requestedParts.length) parts.push(requestedParts.join("\n\n"));
      } else {
        const lines = priceLines(product, english);
        if (asksPrice) {
          parts.push(english
            ? `${label} is currently offered in these decant sizes:\n${lines.join("\n")}`
            : `${label} je trenutno u ponudi u ${ijekavian ? "sljedećim" : "sledećim"} dekant veličinama:\n${lines.join("\n")}`);
        } else {
          parts.push(english
            ? `${label} is in our current webshop offer. Available decant sizes are:\n${lines.join("\n")}`
            : `${label} je u našoj trenutnoj ponudi na sajtu. Dostupne dekant veličine su:\n${lines.join("\n")}`);
        }
      }
      intents.push(asksPrice ? "price" : "availability");
    }
  }

  if (asksRecommendation) {
    if (!primary) {
      return {
        status: "needs_review",
        intent: "broad_recommendation",
        confidence: 0.4,
        body: "",
        reason: "Broad fragrance recommendations need human context about taste, occasion or budget.",
        products: [],
        sourceMessage: latest,
      };
    }
    const recommendations = resolveRecommendations(primary, products);
    if (recommendations.length) {
      const names = recommendations.map((item) => `• ${productLabel(item)}`).join("\n");
      parts.push(english
        ? `If you want a similar direction with a different character, these are good options from our current catalog:\n${names}`
        : `Ako želite sličan pravac, ali drugačiji karakter, iz trenutnog kataloga bih izdvojio:\n${names}`);
      intents.push("recommendation");
    }
  }

  if (asksSizeAdvice) {
    parts.push(sizeAdvice(english, ijekavian));
    intents.push("size_advice");
  }

  if (asksAuthenticity) {
    parts.push(english
      ? "Yes — PlayNice decants original fragrances into smaller bottles; we do not sell imitation fragrance as original."
      : "Da — PlayNice dekantira originalne parfeme u manje bočice; imitacije ne predstavljamo kao original.");
    intents.push("authenticity");
  }

  if (asksWebsite) {
    parts.push(english ? "You can see the current offer at playniceshop.me." : `Aktuelnu ponudu možete ${ijekavian ? "vidjeti" : "videti"} na playniceshop.me.`);
    intents.push("website");
  }

  if (asksShipping) {
    parts.push(shippingCopy(english));
    intents.push("shipping");
  }

  if (asksOrder) {
    if (primary && requestedSizes.length) {
      const offered = requestedSizes.filter((size) => Object.prototype.hasOwnProperty.call(primary?.sizes || {}, size));
      const unavailable = requestedSizes.filter((size) => !Object.prototype.hasOwnProperty.call(primary?.sizes || {}, size));
      if (offered.length) {
        parts.push(english
          ? `For the order: ${productLabel(primary)} · ${offered.map((size) => size.replace("ml", " ml")).join(", ")}.`
          : `Za porudžbinu: ${productLabel(primary)} · ${offered.map((size) => size.replace("ml", " ml")).join(", ")}.`);
      }
      if (unavailable.length) {
        parts.push(english
          ? `${unavailable.map((size) => size.replace("ml", " ml")).join(", ")} is not listed for this fragrance. The current sizes are: ${Object.keys(primary.sizes || {}).map((size) => size.replace("ml", " ml")).join(", ")}.`
          : `${unavailable.map((size) => size.replace("ml", " ml")).join(", ")} nije navedeno za ovaj parfem. Trenutne veličine su: ${Object.keys(primary.sizes || {}).map((size) => size.replace("ml", " ml")).join(", ")}.`);
      }
    } else if (!primary) {
      parts.push(english
        ? "Of course. Tell us which fragrance and decant size you would like."
        : "Naravno. Napišite nam koji parfem i koju dekant veličinu želite.");
    }
    parts.push(orderDetailsCopy(english));
    intents.push("order");
  }

  if (parts.length) {
    const confidence = context.inferred ? 0.82 : (matchedProducts.length > 1 ? 0.9 : 0.96);
    return {
      status: "ready",
      intent: [...new Set(intents)].join("+") || "catalog",
      confidence,
      body: parts.join("\n\n"),
      reason: context.inferred ? "Product context inferred from recent conversation history." : "Matched against deterministic PlayNice business rules and live catalog.",
      products: matchedProducts,
      sourceMessage: latest,
    };
  }

  return {
    status: "needs_review",
    intent: "unknown",
    confidence: 0.2,
    body: "",
    reason: "No safe deterministic rule matched the latest customer message.",
    products: matchedProducts,
    sourceMessage: latest,
  };
}

async function loadThreadMessages(token, threadId) {
  const response = await supabaseFetch(
    `/rest/v1/social_inbox_messages?thread_id=eq.${encodeURIComponent(threadId)}&select=id,direction,body,sent_at,meta_message_id&order=sent_at.desc&limit=20`,
    token
  );
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`Could not load assistant conversation context (Supabase ${response.status}).`);
  return (Array.isArray(payload) ? payload : []).reverse();
}

async function existingDraft(token, threadId, sourceMessageId) {
  const response = await supabaseFetch(
    `/rest/v1/social_inbox_drafts?thread_id=eq.${encodeURIComponent(threadId)}&source_message_id=eq.${encodeURIComponent(sourceMessageId)}&select=*&limit=1`,
    token
  );
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`Could not inspect assistant draft state (Supabase ${response.status}).`);
  return Array.isArray(payload) ? payload[0] || null : null;
}

async function supersedeOlderDrafts(token, threadId, sourceMessageId) {
  const response = await supabaseFetch(
    `/rest/v1/social_inbox_drafts?thread_id=eq.${encodeURIComponent(threadId)}&source_message_id=neq.${encodeURIComponent(sourceMessageId)}&status=in.(ready,needs_review)`,
    token,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: "superseded" }),
    }
  );
  if (!response.ok) throw new Error(`Could not supersede older assistant drafts (Supabase ${response.status}).`);
}

async function saveDraft(token, thread, result) {
  const source = result.sourceMessage;
  const productRefs = (result.products || []).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    short_name: product.shortName || null,
  }));

  await supersedeOlderDrafts(token, thread.id, source.id);

  const response = await supabaseFetch(
    "/rest/v1/social_inbox_drafts?on_conflict=thread_id,source_message_id",
    token,
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        thread_id: thread.id,
        source_message_id: source.id,
        platform: "facebook",
        status: result.status,
        intent: result.intent,
        confidence: result.confidence,
        body: result.body || null,
        reason: result.reason || null,
        rules_version: ASSISTANT_RULES_VERSION,
        metadata: {
          source: "playnice_rule_engine",
          live_catalog: "github_main",
          source_meta_message_id: source.meta_message_id || null,
          products: productRefs,
          auto_send: false,
        },
      }),
    }
  );
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`Could not save assistant draft (Supabase ${response.status}).`);
  const row = Array.isArray(payload) ? payload[0] : payload;

  if (result.status === "needs_review") {
    await supabaseFetch(
      `/rest/v1/social_inbox_threads?id=eq.${encodeURIComponent(thread.id)}`,
      token,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: "needs_review" }),
      }
    );
  }

  return row;
}

export async function prepareAssistantDrafts(token, { threadIds = [], limit = 12 } = {}) {
  const products = await loadLiveProducts();
  const filters = [
    "platform=eq.facebook",
    "last_message_direction=eq.inbound",
    "status=in.(open,needs_review)",
  ];
  if (threadIds.length) filters.push(`id=in.(${threadIds.map(encodeURIComponent).join(",")})`);

  const response = await supabaseFetch(
    `/rest/v1/social_inbox_threads?${filters.join("&")}&select=id,platform,participant_id,participant_name,status,last_message_at,last_message_text&order=last_message_at.desc&limit=${Math.max(1, Math.min(Number(limit) || 12, 50))}`,
    token
  );
  const threads = await safeJson(response);
  if (!response.ok) throw new Error(`Could not load assistant candidate threads (Supabase ${response.status}).`);

  const created = [];
  const notificationCandidates = [];
  const skipped = [];

  for (const thread of Array.isArray(threads) ? threads : []) {
    const messages = await loadThreadMessages(token, thread.id);
    const latest = messages[messages.length - 1] || null;
    if (!latest || latest.direction !== "inbound") {
      skipped.push({ thread_id: thread.id, reason: "latest_not_inbound" });
      continue;
    }

    const latestTime = new Date(latest.sent_at || "").getTime();
    if (!Number.isFinite(latestTime) || Date.now() - latestTime > RESPONSE_WINDOW_MS) {
      skipped.push({ thread_id: thread.id, reason: "outside_response_window" });
      continue;
    }

    const previous = await existingDraft(token, thread.id, latest.id);
    if (previous) {
      if (["ready", "needs_review"].includes(previous.status) && !previous.notified_at) {
        notificationCandidates.push({
          ...previous,
          participant_name: thread.participant_name || null,
          customer_message: latest.body || null,
        });
      }
      skipped.push({ thread_id: thread.id, reason: "already_prepared", draft_id: previous.id });
      continue;
    }

    const result = buildAssistantDraft({ thread, messages, products });
    const draft = await saveDraft(token, thread, result);
    const prepared = { ...draft, participant_name: thread.participant_name || null, customer_message: latest.body || null };
    created.push(prepared);
    notificationCandidates.push(prepared);
  }

  return {
    ok: true,
    rules_version: ASSISTANT_RULES_VERSION,
    created,
    notification_candidates: notificationCandidates,
    skipped,
    auto_send: false,
  };
}

export async function markAssistantDraftSent(token, { threadId, finalText, metaMessageId, sentAt }) {
  const lookup = await supabaseFetch(
    `/rest/v1/social_inbox_drafts?thread_id=eq.${encodeURIComponent(threadId)}&status=in.(ready,needs_review)&select=id,body,metadata&order=created_at.desc&limit=1`,
    token
  );
  const rows = await safeJson(lookup);
  if (!lookup.ok) throw new Error(`Could not load assistant draft audit state (Supabase ${lookup.status}).`);
  const draft = Array.isArray(rows) ? rows[0] : null;
  if (!draft) return null;

  const original = String(draft.body || "").trim();
  const final = String(finalText || "").trim();
  const response = await supabaseFetch(
    `/rest/v1/social_inbox_drafts?id=eq.${encodeURIComponent(draft.id)}`,
    token,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "sent",
        final_text: final,
        sent_at: sentAt || new Date().toISOString(),
        sent_message_id: metaMessageId || null,
        metadata: {
          ...(draft.metadata && typeof draft.metadata === "object" ? draft.metadata : {}),
          reviewed_by_admin: true,
          edited_before_send: Boolean(original && final && original !== final),
          auto_send: false,
        },
      }),
    }
  );
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`Could not update assistant draft audit state (Supabase ${response.status}).`);
  return Array.isArray(payload) ? payload[0] || null : payload;
}
