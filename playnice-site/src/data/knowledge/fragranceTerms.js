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
    id: "ambrox",
    name: "Ambrox / Ambroxan",
    aliases: [
      "ambrox",
      "ambroxan",
      "ambrox super",
      "cetalox",
    ],
    kind: "material",
    answer: {
      sr: "Ambrox i srodne ambergris-molekule daju suv, mineralan, drvenasto-ambarski efekat i često veoma dobru difuziju i postojanost. dsm-firmenich navodi da je Ambrox razvijen iz istraživanja mirisnog karaktera ambergrisa, dok je Ambrox Super modernija, izrazito snažna i elegantna ambrasta varijanta sa mošusnim i drvenastim tonovima.",
      en: "Ambrox and related ambergris-style molecules give a dry, mineral, woody-amber effect and are often highly diffusive and persistent. dsm-firmenich traces Ambrox to research into the odor character of ambergris, while Ambrox Super is a more modern, very powerful and elegant ambery variant with musky and woody tonalities.",
    },
    sources: [
      {
        label: "dsm-firmenich — Biotechnology / Ambrox Super",
        url: "https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/ingredients/biotechnology.html",
        type: "manufacturer-official",
      },
      {
        label: "dsm-firmenich — Cetalox",
        url: "https://studio.dsm-firmenich.com/product/cetaloxr-pe-922560",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "olfactory-fatigue",
    name: "Olfactory fatigue",
    aliases: [
      "olfactory fatigue",
      "nose fatigue",
      "zamaranje nosa",
      "navikavanje nosa",
      "ne osecam svoj parfem",
      "ne osećam svoj parfem",
      "ne mogu da osetim parfem",
      "ne mogu da osjetim parfem",
      "anosmia",
      "anosmija",
    ],
    kind: "concept",
    answer: {
      sr: "Ako posle nekog vremena više ne osećaš svoj parfem, to ne znači automatski da je nestao. Nos može da se desenzitizuje na miris koji je stalno prisutan, pa ga drugi ljudi i dalje mogu primećivati. To nije isto što i prava anosmija: anosmija znači gubitak ili odsustvo čula mirisa, a moguća je i selektivna slabija osetljivost na pojedine velike molekule, poput nekih mošusa.",
      en: "If you stop noticing your own fragrance after a while, it does not automatically mean it has disappeared. The nose can become desensitized to a continuously present smell while other people can still notice it. That is not the same as true anosmia, which is loss or absence of smell; selective reduced sensitivity to some large aroma molecules, such as certain musks, can also occur.",
    },
    sources: [
      {
        label: "The Perfume Society — FAQ",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/",
        type: "industry-education",
      },
      {
        label: "The Perfume Society — Fragrant facts & myths",
        url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "note-pyramid",
    name: "Top, heart and base notes",
    aliases: [
      "top notes",
      "heart notes",
      "middle notes",
      "base notes",
      "note pyramid",
      "piramida nota",
      "gornje note",
      "srednje note",
      "bazne note",
      "note parfema",
    ],
    kind: "concept",
    answer: {
      sr: "Klasična parfemska piramida deli razvoj mirisa na top, heart i base note. Top note se prve osete i obično su lakše i brže isparavaju; heart note čine centralni karakter mirisa; base note se razvijaju kasnije i obično najduže ostaju. To je koristan model, ali nije svaki moderan parfem strogo piramidalan — postoje i linearnije kompozicije koje se tokom nošenja menjaju mnogo manje.",
      en: "The classical fragrance pyramid divides development into top, heart and base notes. Top notes appear first and are usually lighter and faster to evaporate; heart notes form the central character; base notes emerge later and usually last the longest. It is a useful model, but not every modern fragrance follows a strict pyramid — some are more linear and change much less over time.",
    },
    sources: [
      {
        label: "The Perfume Society — FAQ",
        url: "https://perfumesociety.org/frequently-asked-questions/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "longevity",
    name: "Longevity",
    aliases: [
      "longevity",
      "trajnost",
      "koliko traje parfem",
      "koliko dugo traje parfem",
      "postojanost parfema",
    ],
    kind: "concept",
    answer: {
      sr: "Longevity je koliko dugo parfem ostaje primetljiv na koži ili odeći. Ne određuje ga samo koncentracija: utiču i formula, tip materijala, koža, temperatura i vlažnost. Teže bazne note poput drveta, smola, kože i duvana obično isparavaju sporije od laganih citrusnih nota.",
      en: "Longevity is how long a fragrance remains noticeable on skin or clothing. It is not determined by concentration alone: formula, materials, skin, temperature and humidity all matter. Heavier base-note materials such as woods, resins, leather and tobacco usually evaporate more slowly than light citrus notes.",
    },
    sources: [
      {
        label: "The Perfume Society — Make perfume last longer",
        url: "https://perfumesociety.org/make-perfume-last-longer/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "accord",
    name: "Accord",
    aliases: [
      "accord",
      "akord",
      "mirisni akord",
      "parfemski akord",
    ],
    kind: "concept",
    answer: {
      sr: "Akord je kombinacija više mirisnih materijala koja zajedno stvara novi, prepoznatljiv utisak — slično akordu u muzici. Na primer, amber u parfimeriji često nije jedna sirovina nego akord građen od materijala poput labdanuma, benzoina i vanile.",
      en: "An accord is a combination of several fragrance materials that together create a distinct new impression, similar to a chord in music. For example, amber in perfumery is often not a single raw material but an accord built from materials such as labdanum, benzoin and vanilla.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients / Amber",
        url: "https://perfumesociety.org/ingredients/?letter=a",
        type: "industry-education",
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
