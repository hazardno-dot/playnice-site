/*
 * PLAYNICE FI KNOWLEDGE — FRAGRANCE PERSONALITIES
 *
 * Public fragrance-world figures who are not perfumers in this dataset.
 * Keep identity and role separate from perfumer attribution.
 */

export const fragrancePersonalities = [
  {
    id: "daniel-rene",
    name: "Daniel René",
    entityType: "fragrance-personality",
    aliases: [
      "daniel rene",
      "daniel rené",
      "daniel renea",
      "danielrenemusic",
      "daniel rene music",
    ],
    roles: [
      "Fragrance influencer",
      "Musician",
      "TV host",
      "Beauty creator",
    ],
    summary: {
      sr: "Daniel René je muzičar, TV voditelj i beauty/fragrance kreator koji je razvio snažno prisustvo u parfemskom svetu. Njegov zvanični sajt navodi fragrance sadržaj, parfemske kolaboracije i vođenje podkasta Café Lattafa sa parfimerima i drugim ljudima iz industrije. U ovoj bazi ga vodimo kao fragrance influensera i industrijsku ličnost, ne kao parfemera.",
      en: "Daniel René is a musician, TV host, and beauty/fragrance creator who built a strong presence in the fragrance world. His official site highlights fragrance content, perfume collaborations, and his Café Lattafa podcast featuring perfumers and other industry professionals. In this knowledge base he is classified as a fragrance influencer and industry personality, not as a perfumer.",
    },
    fragranceProjects: [
      { name: "Jawhari", partner: "Aroma Concepts", verified: true },
      { name: "Brulant", partner: "Ainash", verified: true },
      { name: "Illusio", partner: "Parfums de Lux", verified: true },
      { name: "Mouillée", partner: "Daniel René", verified: true },
    ],
    sources: [
      {
        label: "Daniel René Music — Biography",
        url: "https://www.danielrenemusic.com/biography",
        type: "creator-official",
      },
      {
        label: "Daniel René Music — Official site",
        url: "https://www.danielrenemusic.com/",
        type: "creator-official",
      },
    ],
  },
];

export default fragrancePersonalities;
