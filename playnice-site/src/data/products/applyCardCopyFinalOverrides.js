import { productCopy } from "./productCopy";

const FINAL_CARD_COPY = {
  "Calvin Klein Defy Parfum": {
    sr: "Topli začini, kakao i sandalovina. Gladak i moderan trag.",
    en: "Warm spice, cocoa and sandalwood with a smooth modern finish.",
  },
  "Terre d'Hermès Eau de Toilette": {
    sr: "Grejp, kremen i kedar. Suv, zemljan i odmah prepoznatljiv.",
    en: "Grapefruit, flint and cedarwood. Dry, earthy and iconic.",
  },
  "Essential Parfums Bois Impérial Eau de Parfum": {
    sr: "Bosiljak, Timut biber i vetiver u suvom drvenom tragu.",
  },
  "Essential Parfums Nice Bergamote Eau de Parfum": {
    en: "Bergamot, ylang-ylang and cedarwood with a bright natural lift.",
  },
  "Essential Parfums Orange X Santal Eau de Parfum": {
    sr: "Gorka narandža i bosiljak preko suve, kremaste sandalovine.",
  },
  "French Avenue Safari Breeze Eau de Parfum": {
    en: "Coconut and black currant sharpened by green grapefruit.",
  },
  "French Avenue Vulcan Sable Eau de Parfum": {
    sr: "Viskij i korijander preko tople, kremaste sandalovine.",
  },
  "Lattafa Khamrah Waha Eau de Parfum": {
    sr: "Yuzu, krastavac i morska so. Sveže, slano, neočekivano.",
  },
  "Narciso Rodriguez NARCISO Poudrée Eau de Parfum": {
    en: "White jasmine and rose wrapped in soft powdery musk.",
  },
  "Rasasi Hawas Black Eau de Parfum": {
    sr: "Ananas i bergamot nad tamnom mahovinom i drvenom bazom.",
  },
  "Rayhaan Azul Eau de Parfum": {
    en: "Bergamot, lemon and grapefruit in clean summer brightness.",
  },
  "Tom Ford Noir Extreme Eau de Parfum": {
    sr: "Kardamom i kulfi u kremastoj vanili za tamnije večeri.",
  },
  "Yves Saint Laurent Black Opium Le Parfum": {
    sr: "Vanila i crna kafa preko mekog belog cveća. Bogato i zavodljivo.",
  },
  "Yves Saint Laurent L'Homme Eau de Parfum": {
    sr: "Gorka narandža, vetiver i hrastovo drvo. Tiha elegancija.",
  },
  "Yves Saint Laurent Y Iced Cologne Eau de Toilette Intense": {
    sr: "Ledena nana i žalfija preko čistog, hladnog ambroksana.",
  },
};

Object.entries(FINAL_CARD_COPY).forEach(([name, nextCard]) => {
  const entry = productCopy[name];
  if (!entry) return;
  entry.card = { ...entry.card, ...nextCard };
});

export { FINAL_CARD_COPY };
