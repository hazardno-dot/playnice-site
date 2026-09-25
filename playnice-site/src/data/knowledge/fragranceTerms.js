/*
 * PLAYNICE FI KNOWLEDGE — TERMS & MATERIALS
 *
 * Every entry is source-backed. Knowledge routing should only intercept
 * explanatory questions; recommendation-style queries must fall through to
 * the existing Discovery Engine.
 */

export const fragranceTerms = [
  {
    id: "sillage",
    name: "Sillage",
    aliases: ["sillage", "silaz", "silage", "trag mirisa", "mirisni trag"],
    kind: "concept",
    answer: {
      sr: "Sillage je trag koji parfem ostavlja u vazduhu dok se nosilac kreće ili nakon što prođe. Nije isto što i trajnost: parfem može dugo trajati na koži, a imati tih sillage — ili obrnuto.",
      en: "Sillage is the scent trail a fragrance leaves in the air as the wearer moves or after they pass. It is not the same as longevity: a fragrance can last a long time on skin while leaving a quiet trail, or vice versa.",
    },
    sources: [
      {
        label: "The Perfume Society — Sillage",
        url: "https://perfumesociety.org/wp-content/uploads/2018/06/SL31.OnlineIssue.pdf",
        type: "industry-education",
      },
    ],
  },
  {
    id: "fragrance-concentration",
    name: "Fragrance concentration",
    aliases: [
      "eau de toilette",
      "edt",
      "eau de parfum",
      "edp",
      "parfum",
      "extrait",
      "extrait de parfum",
      "koncentracija parfema",
      "koncentracija mirisa",
    ],
    kind: "concept",
    answer: {
      sr: "EDT, EDP, Parfum i Extrait su uobičajene oznake koncentracije, ali nemaju univerzalno fiksne međunarodne granice. IFRA navodi tipične raspone: EDT oko 5–15%, EDP oko 10–20%, a parfum/extrait približno 15–40%. Veća koncentracija ne garantuje automatski veću projekciju ili dužu trajnost — formula i materijali su jednako važni.",
      en: "EDT, EDP, Parfum and Extrait are common concentration labels, but there are no universally fixed international boundaries. IFRA lists typical ranges of about 5–15% for EDT, 10–20% for EDP and roughly 15–40% for perfume extract. A higher concentration does not automatically guarantee stronger projection or longer wear; the formula and materials matter too.",
    },
    sources: [
      {
        label: "IFRA — Using the Standards",
        url: "https://ifrafragrance.org/using-the-standards",
        type: "industry-standard",
      },
    ],
  },
  {
    id: "iso-e-super",
    name: "Iso E Super",
    aliases: ["iso e super", "isoe super", "iso e"],
    kind: "material",
    answer: {
      sr: "Iso E Super je moderna drvenasto-ambarna mirisna molekula kompanije IFF. IFF je opisuje kao glatku, drvenastu i ambrastu, sa baršunastim utiskom; često se koristi da kompoziciji doda punoću, teksturu i suptilnu snagu.",
      en: "Iso E Super is a modern woody-amber aroma molecule from IFF. IFF describes it as smooth, woody and ambery with a velvety sensation, often used to add fullness, texture and subtle strength to a composition.",
    },
    sources: [
      {
        label: "IFF — Iso E Super",
        url: "https://www.iff.com/scent/ingredients-compendium/iso-e-super/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "hedione",
    name: "Hedione",
    aliases: ["hedione", "hedion"],
    kind: "material",
    answer: {
      sr: "Hedione je sintetička floralna molekula iz dsm-firmenicha sa transparentnim jasminskim karakterom i citrusnom svežinom. Proizvođač navodi da može pojačati prisutnost i difuziju floralnih nota bez nužnog povećanja osećaja jačine.",
      en: "Hedione is a synthetic floral molecule from dsm-firmenich with a transparent jasmine character and a fresh citrus facet. The manufacturer notes that it can enhance presence and diffusion of floral notes without necessarily making a fragrance feel stronger.",
    },
    sources: [
      {
        label: "dsm-firmenich — HEDIONE",
        url: "https://studio.dsm-firmenich.com/product/hedioner-pe-964898",
        type: "manufacturer-official",
      },
    ],
  },
];

export default fragranceTerms;
