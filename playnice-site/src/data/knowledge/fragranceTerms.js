/*
 * PLAYNICE FI KNOWLEDGE — TERMS & MATERIALS
 *
 * Every entry is source-backed. Knowledge routing should only intercept
 * explanatory questions; recommendation-style queries must fall through to
 * the existing Discovery Engine.
 */

export const fragranceTerms = [
  {
    id: "unisex-fragrance",
    name: "Unisex Fragrance",
    aliases: [
      "unisex fragrance",
      "unisex perfume",
      "shared fragrance",
      "gender free perfume",
    ],
    kind: "concept",
    answer: { sr: "Unisex znači da se parfem ne pozicionira isključivo za muškarce ili žene. Miris nema biološki pol; rodne oznake u parfimeriji su uglavnom dio marketinga, tradicije i očekivanja tržišta.", en: "Unisex means a fragrance is not positioned exclusively for men or women. Scent has no biological gender; gender labels in perfumery are largely shaped by marketing, tradition and market expectations." },
    sources: [{ label: "The Perfume Society — fragrance buyer guidance", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "wearing-across-gender-labels",
    name: "Wearing Across Gender Labels",
    aliases: [
      "can men wear womens perfume",
      "can women wear mens fragrance",
      "muskarac zenski parfem",
      "zena muski parfem",
    ],
    kind: "concept",
    answer: { sr: "Da — možete nositi parfem bez obzira na etiketu men ili women ako vam se miris dopada. Te oznake opisuju ciljano tržište i stil komunikacije, ne pravilo ko smije da ga nosi.", en: "Yes. You can wear a fragrance regardless of a men or women label if you enjoy it. Those labels describe target market and communication style, not a rule about who is allowed to wear the scent." },
    sources: [{ label: "The Perfume Society — fragrance buyer guidance", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "blind-buy",
    name: "Blind Buy",
    aliases: [
      "blind buy perfume",
      "blind buy fragrance",
      "buy perfume without testing",
      "kupovina parfema bez probe",
    ],
    kind: "concept",
    answer: { sr: "Blind buy je kupovina parfema bez prethodnog testiranja na koži. Opisi, note i poređenja mogu smanjiti rizik, ali ne mogu pouzdano predvidjeti lični doživljaj; sample ili decant je sigurniji način provjere.", en: "A blind buy is purchasing a fragrance without testing it on skin first. Descriptions, notes and comparisons can reduce uncertainty but cannot reliably predict personal experience; a sample or decant is a safer way to evaluate it." },
    sources: [{ label: "The Perfume Society — fragrance buyer guidance", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "safe-blind-buy",
    name: "Safe Blind Buy",
    aliases: [
      "safe blind buy",
      "blind buy safe perfume",
      "siguran blind buy",
    ],
    kind: "concept",
    answer: { sr: "Safe blind buy je samo neformalni izraz za parfem koji mnogi smatraju lako dopadljivim. Ne postoji zaista siguran blind buy za svakoga jer ukus, koža i očekivanja kupca mogu biti potpuno različiti.", en: "Safe blind buy is only an informal label for a fragrance many people consider easy to like. There is no truly safe blind buy for everyone because taste, skin and expectations differ." },
    sources: [{ label: "The Perfume Society — fragrance buyer guidance", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "versatile-fragrance",
    name: "Versatile Fragrance",
    aliases: [
      "versatile fragrance",
      "versatile perfume",
      "svestran parfem",
    ],
    kind: "concept",
    answer: { sr: "Versatile opisuje parfem koji se lako uklapa u više situacija, doba dana ili godišnjih doba. To je praktična procjena, ne tehnička kategorija, i zavisi od ličnog ukusa i okruženja.", en: "Versatile describes a fragrance that fits easily into multiple situations, times of day or seasons. It is a practical judgment rather than a technical category and depends on personal taste and environment." },
    sources: [{ label: "The Perfume Society — fragrance buyer guidance", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "seasonal-fragrance",
    name: "Seasonal Fragrance",
    aliases: [
      "summer winter perfume",
      "seasonal fragrance",
    ],
    kind: "concept",
    answer: { sr: "Seasonal fragrance je način opisivanja kako se parfem uklapa u temperaturu i raspoloženje određenog doba godine. To nije pravilo: bilo koji parfem možete nositi tokom cijele godine ako vam tako odgovara.", en: "Seasonal fragrance describes how a scent fits the temperature and mood of a season. It is not a rule: any fragrance can be worn year-round if that suits you." },
    sources: [{ label: "The Perfume Society — fragrance buyer guidance", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "discontinued-fragrance",
    name: "Discontinued Fragrance",
    aliases: [
      "discontinued fragrance",
      "discontinued perfume",
      "ukinuti parfem",
      "parfem se vise ne proizvodi",
    ],
    kind: "concept",
    answer: { sr: "Discontinued znači da je brend obustavio redovnu proizvodnju ili prodaju određenog parfema. Preostale bočice mogu i dalje biti na tržištu, ali dostupnost, cijena i stanje zavise od zaliha i načina čuvanja.", en: "Discontinued means the brand has stopped regular production or sale of a fragrance. Remaining bottles may still be available, but availability, price and condition depend on stock and storage history." },
    sources: [{ label: "The Perfume Society — fragrance buyer guidance", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "limited-edition-fragrance",
    name: "Limited Edition Fragrance",
    aliases: [
      "limited edition fragrance",
      "limited edition perfume",
      "ogranicena serija parfema",
    ],
    kind: "concept",
    answer: { sr: "Limited edition znači da je izdanje namijenjeno ograničenoj proizvodnji, periodu ili distribuciji. Oznaka sama po sebi ne znači da je formula kvalitetnija, jača ili budući kolekcionarski predmet.", en: "Limited edition means a release is intended for limited production, time period or distribution. The label itself does not mean the formula is higher quality, stronger or destined to become collectible." },
    sources: [{ label: "The Perfume Society — fragrance buyer guidance", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "proper-fragrance-storage",
    name: "Proper Fragrance Storage",
    aliases: [
      "proper fragrance storage",
      "how to store perfume",
      "best place to store perfume",
      "kako cuvati parfem",
    ],
    kind: "concept",
    answer: { sr: "Parfem je najbolje čuvati na stabilnoj sobnoj temperaturi, dalje od direktne svjetlosti i izvora toplote, sa dobro zatvorenim raspršivačem ili čepom. Tamni ormar ili fioka su obično bolji od izložene police.", en: "Fragrance is best stored at a stable room temperature, away from direct light and heat sources, with the sprayer or cap securely closed. A dark cupboard or drawer is usually better than an exposed shelf." },
    sources: [{ label: "CHANEL — fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/", type: "reference" }],
  },

  {
    id: "bathroom-storage",
    name: "Perfume in the Bathroom",
    aliases: [
      "perfume in bathroom",
      "store perfume in bathroom",
      "bathroom fragrance storage",
      "parfem u kupatilu",
      "drzati parfem u kupatilu",
    ],
    kind: "concept",
    answer: { sr: "Kupatilo nije idealno mjesto za dugoročno čuvanje parfema jer temperatura i vlaga često osciliraju. Stabilno, tamnije i umjereno hladno mjesto je bolji izbor.", en: "A bathroom is not ideal for long-term fragrance storage because temperature and humidity often fluctuate. A stable, darker and moderately cool place is a better choice." },
    sources: [{ label: "CHANEL — fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/", type: "reference" }],
  },

  {
    id: "sunlight-and-heat",
    name: "Sunlight and Heat",
    aliases: [
      "sunlight perfume",
      "heat perfume damage",
      "perfume near window",
      "parfem na suncu",
      "parfem pored radijatora",
      "toplota parfem",
      "sunce kvari parfem",
      "sunlight and heat",
    ],
    kind: "concept",
    answer: { sr: "Direktna sunčeva svjetlost i toplota mogu ubrzati promjene parfema. Bočicu je bolje držati dalje od prozora, radijatora i drugih mjesta koja se redovno zagrijavaju.", en: "Direct sunlight and heat can accelerate changes in a fragrance. It is better to keep the bottle away from windows, radiators and other places that regularly heat up." },
    sources: [{ label: "CHANEL — fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/", type: "reference" }],
  },

  {
    id: "fridge-storage",
    name: "Perfume in the Fridge",
    aliases: [
      "perfume in fridge",
      "fridge fragrance storage",
      "keep perfume refrigerated",
      "parfem u frizideru",
      "drzati parfem u frizideru",
      "parfem moze u frizider",
    ],
    kind: "concept",
    answer: { sr: "Frižider uglavnom nije potreban za normalno čuvanje parfema. Važniji su stabilna temperatura, odsustvo direktne svjetlosti i toplote; česte velike temperaturne promjene nijesu cilj.", en: "A refrigerator is generally unnecessary for normal fragrance storage. Stable temperature and protection from direct light and heat matter more; repeated large temperature swings are not the goal." },
    sources: [{ label: "CHANEL — fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/", type: "reference" }],
  },

  {
    id: "fragrance-color-change",
    name: "Fragrance Color Change",
    aliases: [
      "perfume color change",
      "fragrance got darker",
      "perfume darkened",
      "parfem promenio boju",
      "parfem promijenio boju",
      "parfem potamneo",
      "parfem potamnio",
      "parfem potamni",
      "fragrance color change",
    ],
    kind: "concept",
    answer: { sr: "Promjena boje sama po sebi ne dokazuje da je parfem pokvaren. Neki materijali prirodno tamne tokom vremena, ali nagla promjena uz drugačiji miris, zamućenje ili teksturu može biti znak degradacije.", en: "A color change alone does not prove that a fragrance has spoiled. Some materials naturally darken over time, but a major change together with altered smell, cloudiness or texture can indicate degradation." },
    sources: [{ label: "CHANEL — fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/", type: "reference" }],
  },

  {
    id: "cloudiness-and-sediment",
    name: "Cloudiness and Sediment",
    aliases: [
      "perfume cloudy",
      "sediment in perfume",
      "particles in fragrance",
      "talog u parfemu",
      "parfem mutan",
      "parfem se zamutio",
      "cloudiness and sediment",
    ],
    kind: "concept",
    answer: { sr: "Zamućenje ili talog mogu imati više uzroka i ne mogu se pouzdano dijagnostikovati samo fotografijom. Ako su novi i praćeni promjenom mirisa ili teksture, parfem treba procijeniti opreznije.", en: "Cloudiness or sediment can have several causes and cannot be reliably diagnosed from a photo alone. If they are new and accompanied by changes in smell or texture, the fragrance should be assessed more cautiously." },
    sources: [{ label: "CHANEL — fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/", type: "reference" }],
  },

  {
    id: "fragrance-gone-off",
    name: "Has Perfume Gone Off?",
    aliases: [
      "perfume gone off",
      "perfume spoiled",
      "is my perfume bad",
      "da li se parfem pokvario",
      "jel parfem pokvaren",
      "parfem istekao",
    ],
    kind: "concept",
    answer: { sr: "Parfem može degradirati. Znakovi mogu uključivati jasno promijenjen miris, jače zamućenje, zgušnjavanje ili izraženu promjenu boje. Starost sama po sebi nije dovoljan dokaz da je bočica neupotrebljiva.", en: "Fragrance can degrade. Signs may include a clearly altered smell, stronger cloudiness, thickening or pronounced color change. Age alone is not enough to prove that a bottle is unusable." },
    sources: [{ label: "CHANEL — fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/", type: "reference" }],
  },

  {
    id: "air-exposure",
    name: "Air Exposure",
    aliases: [
      "air exposure perfume",
      "oxygen perfume bottle",
      "air in perfume bottle",
      "air exposure",
    ],
    kind: "concept",
    answer: { sr: "Kiseonik i sve veći vazdušni prostor u bočici mogu vremenom doprinositi oksidaciji, ali parfem sa raspršivačem je relativno zatvoren sistem. Nema potrebe paničiti zbog normalnog vazduha koji ostaje nakon korišćenja.", en: "Oxygen and increasing headspace in a bottle can contribute to oxidation over time, but a spray bottle is a relatively closed system. There is no need to panic about the normal air remaining after use." },
    sources: [{ label: "CHANEL — fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/", type: "reference" }],
  },

  {
    id: "batch-code",
    name: "Batch Code",
    aliases: [
      "batch code perfume",
      "perfume batch code",
      "lot code fragrance",
      "batch code",
    ],
    kind: "concept",
    answer: { sr: "Batch code je proizvodni identifikacioni kod koji pomaže proizvođaču u praćenju serije i kontroli kvaliteta. Format zavisi od brenda i sam kod nije univerzalni datum proizvodnje čitljiv bez podataka proizvođača.", en: "A batch code is a production identifier that helps a manufacturer trace a lot and manage quality control. Its format varies by brand and the code is not a universal manufacturing date that can always be decoded without manufacturer data." },
    sources: [{ label: "IFRA — quality and batch guidance", url: "https://ifrafragrance.org/initiatives-positions/safe-use-fragrance-science/ifra-standards/ifra-code-of-practice/ifra-recommendations-for-good-operating-practices", type: "reference" }],
  },

  {
    id: "batch-code-authenticity",
    name: "Batch Code and Authenticity",
    aliases: [
      "batch code authenticity",
      "can batch code prove authenticity",
      "batch code fake perfume",
      "jel batch code dokazuje original",
      "da li batch code dokazuje original",
      "batch kod original",
    ],
    kind: "concept",
    answer: { sr: "Batch code može biti dio provjere, ali sam po sebi ne dokazuje da je parfem originalan: kod se može kopirati, a baze trećih strana mogu biti nepotpune. Za autentičnost treba gledati porijeklo robe, prodavca i više fizičkih detalja zajedno.", en: "A batch code can be part of a check, but by itself it does not prove authenticity: codes can be copied and third-party databases may be incomplete. Authenticity should consider provenance, seller and multiple physical details together." },
    sources: [{ label: "IFRA — quality and batch guidance", url: "https://ifrafragrance.org/initiatives-positions/safe-use-fragrance-science/ifra-standards/ifra-code-of-practice/ifra-recommendations-for-good-operating-practices", type: "reference" }],
  },

  {
    id: "counterfeit-fragrance",
    name: "Counterfeit Fragrance",
    aliases: [
      "counterfeit fragrance",
      "fake perfume",
      "falsifikat parfema",
    ],
    kind: "concept",
    answer: { sr: "Counterfeit ili falsifikat je proizvod koji se lažno predstavlja kao originalni brendirani parfem ili imitira njegov identitet i pakovanje. To nije isto što i legalno označen clone, dupe ili inspired-by parfem koji se prodaje pod sopstvenim imenom.", en: "A counterfeit is a product falsely presented as an original branded fragrance or that imitates its identity and packaging. It is not the same as a clearly labeled clone, dupe or inspired-by fragrance sold under its own name." },
    sources: [{ label: "IFRA — quality and batch guidance", url: "https://ifrafragrance.org/initiatives-positions/safe-use-fragrance-science/ifra-standards/ifra-code-of-practice/ifra-recommendations-for-good-operating-practices", type: "reference" }],
  },

  {
    id: "photo-authenticity-limit",
    name: "Authenticity from a Photo",
    aliases: [
      "authenticate perfume photo",
      "is perfume real from picture",
      "authenticity from photo",
      "jel original sa slike",
      "da li je original sa slike",
      "provera originalnosti sa slike",
    ],
    kind: "concept",
    answer: { sr: "Fotografija može otkriti sumnjive detalje, ali sama po sebi obično nije dovoljna za sigurnu potvrdu autentičnosti. Pakovanja se mijenjaju, postoje regionalne i batch razlike, a kvalitetni falsifikati mogu vizuelno izgledati uvjerljivo.", en: "A photo can reveal suspicious details, but by itself it is usually insufficient for a definitive authenticity judgment. Packaging changes, regional and batch variations exist, and sophisticated counterfeits can look visually convincing." },
    sources: [{ label: "IFRA — quality and batch guidance", url: "https://ifrafragrance.org/initiatives-positions/safe-use-fragrance-science/ifra-standards/ifra-code-of-practice/ifra-recommendations-for-good-operating-practices", type: "reference" }],
  },

  {
    id: "niche-fragrance",
    name: "Niche Fragrance",
    aliases: [
      "niche fragrance",
      "niche perfume",
      "what is niche perfume",
      "nis parfem",
    ],
    kind: "concept",
    answer: { sr: "Niche je neformalna tržišna oznaka za kuće ili kolekcije koje često stavljaju veći naglasak na parfimeriju kao specijalizovani proizvod, neobične ideje ili užu distribuciju. Granica između niche i mainstream/designer svijeta nije stroga niti univerzalna.", en: "Niche is an informal market label for houses or collections that often place greater emphasis on fragrance as a specialized product, unusual ideas or narrower distribution. The boundary between niche and mainstream or designer fragrance is not strict or universal." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "designer-fragrance",
    name: "Designer Fragrance",
    aliases: [
      "designer fragrance",
      "designer perfume",
      "designer scent",
      "dizajnerski parfem",
      "designer parfem",
    ],
    kind: "concept",
    answer: { sr: "Designer fragrance obično dolazi od modne ili lifestyle kuće kojoj parfemi nijesu jedina djelatnost. To nije ocjena kvaliteta: designer parfem može biti jednostavan, kompleksan, jeftiniji ili vrlo luksuzan.", en: "A designer fragrance usually comes from a fashion or lifestyle house for which perfume is not the only business. It is not a quality judgment: a designer scent can be simple, complex, affordable or very luxurious." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "indie-fragrance",
    name: "Indie Fragrance",
    aliases: [
      "independent perfume",
      "indie perfume",
      "indie fragrance",
    ],
    kind: "concept",
    answer: { sr: "Indie fragrance obično označava nezavisnu parfemsku kuću ili kreatora van velikih korporativnih grupa. Indie i niche se često preklapaju, ali nijesu potpuno isti pojmovi.", en: "Indie fragrance usually refers to an independent perfume house or creator outside large corporate groups. Indie and niche often overlap, but they are not exactly the same concept." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "middle-eastern-fragrance",
    name: "Middle Eastern Fragrance",
    aliases: [
      "middle eastern fragrance",
      "arabic fragrance",
      "arab perfume",
      "arapski parfem",
      "arabic parfem",
      "middle eastern parfem",
    ],
    kind: "concept",
    answer: { sr: "Middle Eastern ili Arabic fragrance opisuje porijeklo, tržišnu tradiciju ili stil kuće, ne jednu jedinu mirisnu formulu. Takvi parfemi mogu biti fresh, gourmand, woody, oud-heavy, floral ili sasvim drugačiji.", en: "Middle Eastern or Arabic fragrance describes origin, market tradition or house style, not one single olfactory formula. Such fragrances can be fresh, gourmand, woody, oud-heavy, floral or many other styles." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "clone-fragrance",
    name: "Clone Fragrance",
    aliases: [
      "clone perfume",
      "clone parfem",
      "klon parfem",
      "clone isto sto i falsifikat",
    ],
    kind: "concept",
    answer: { sr: "Clone je neformalni izraz za parfem napravljen tako da veoma blisko podsjeća na drugi poznati mirisni profil. Nije isto što i falsifikat: falsifikat se predstavlja kao originalni proizvod ili kopira njegov identitet/pakovanje.", en: "Clone is an informal term for a fragrance made to smell very close to another known scent profile. It is not the same as a counterfeit: a counterfeit presents itself as the original product or copies its identity and packaging." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "dupe-fragrance",
    name: "Dupe Fragrance",
    aliases: [
      "dupe fragrance",
      "perfume dupe",
      "dupe perfume",
      "dupe parfem",
      "dupe miris",
      "dupe ista formula",
    ],
    kind: "concept",
    answer: { sr: "Dupe je popularan izraz za povoljniju ili alternativnu kompoziciju koja podsjeća na skuplji ili poznatiji parfem. Koliko je slična originalu zavisi od konkretnog proizvoda; 'dupe' nije tehnička garancija identične formule ili performansi.", en: "Dupe is a popular term for a more affordable or alternative composition that resembles a more expensive or better-known fragrance. Similarity depends on the specific product; dupe is not a technical guarantee of an identical formula or performance." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "inspired-by-fragrance",
    name: "Inspired-by Fragrance",
    aliases: [
      "inspired by perfume",
      "inspiration fragrance",
      "inspired by parfem",
      "inspiriran parfem",
      "inspired by fragrance",
    ],
    kind: "concept",
    answer: { sr: "Inspired by znači da parfem polazi od poznatog mirisnog pravca ili ideje, ali ne mora biti precizan clone. Može dijeliti DNK, akord ili stil, a zatim otići u drugačijem pravcu.", en: "Inspired by means a fragrance starts from a familiar scent direction or idea but does not have to be a precise clone. It may share DNA, an accord or a style and then develop in a different direction." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "fragrance-dna",
    name: "Fragrance DNA",
    aliases: [
      "fragrance dna",
      "perfume dna",
      "same dna fragrance",
      "dnk parfema",
      "dna parfema",
      "isti dna parfema",
    ],
    kind: "concept",
    answer: { sr: "Fragrance DNA je neformalni način da se opiše prepoznatljiv osnovni mirisni obrazac koji dijele parfemi ili flankeri. To nije hemijski termin niti dokaz da dvije formule imaju iste sastojke.", en: "Fragrance DNA is an informal way to describe a recognizable core scent pattern shared by fragrances or flankers. It is not a chemical term and does not prove that two formulas contain the same ingredients." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "private-line",
    name: "Private Line",
    aliases: [
      "private line fragrance",
      "exclusive line perfume",
      "private collection fragrance",
      "private line automatski kvalitetniji",
      "private line",
    ],
    kind: "concept",
    answer: { sr: "Private line, exclusive line ili private collection obično označava izdvojenu premium kolekciju unutar većeg brenda. Naziv je marketinška kategorija i ne garantuje automatski višu koncentraciju, kvalitet ili performanse.", en: "Private line, exclusive line or private collection usually denotes a separate premium collection within a larger brand. It is a marketing category and does not automatically guarantee higher concentration, quality or performance." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "mass-appealing",
    name: "Mass Appealing",
    aliases: [
      "mass appealing fragrance",
      "mass pleasing perfume",
      "crowd pleasing fragrance",
      "mass appealing znaci kvalitetan",
      "mass appealing",
    ],
    kind: "concept",
    answer: { sr: "Mass appealing znači da je miris dizajniran ili percipiran kao lako dopadljiv širokom krugu ljudi. To nije mjera kvaliteta niti znači da će se svidjeti baš svakome.", en: "Mass appealing means a scent is designed or perceived as easy to like for a broad audience. It is not a measure of quality and does not mean everyone will like it." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "challenging-fragrance",
    name: "Challenging Fragrance",
    aliases: [
      "challenging fragrance",
      "difficult perfume",
      "challenging scent",
      "challenging miris",
    ],
    kind: "concept",
    answer: { sr: "Challenging opisuje parfem sa neobičnim, intenzivnim ili polarizujućim karakterom koji možda traži više nošenja da bi ga kupac razumio. To nije negativna ocjena; samo govori da nije nužno instant mass-appeal miris.", en: "Challenging describes a fragrance with an unusual, intense or polarizing character that may take several wearings to understand. It is not a negative judgment; it simply suggests the scent may not be instantly mass-appealing." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "vintage-fragrance",
    name: "Vintage Fragrance",
    aliases: [
      "vintage fragrance",
      "vintage perfume",
      "old formulation perfume",
    ],
    kind: "concept",
    answer: { sr: "Vintage može značiti stariju bočicu, stariju formulaciju ili parfem iz ranijeg perioda. Starost sama ne garantuje bolji miris: skladištenje, oksidacija i reformulacije mogu napraviti velike razlike između primjeraka.", en: "Vintage can mean an older bottle, an older formulation or a fragrance from an earlier era. Age alone does not guarantee a better scent; storage, oxidation and reformulation can create large differences between examples." },
    sources: [{ label: "The Perfume Society — fragrance terminology", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "fresh-fragrance",
    name: "Fresh Fragrance",
    aliases: [
      "fresh perfume",
      "fresh scent",
      "fresh fragrance",
    ],
    kind: "concept",
    answer: { sr: "Fresh opisuje svijetao, čist i osvježavajući mirisni utisak. Može uključivati citrusne, aquatic, green ili aromatic elemente; nije jedna jedina nota niti strogo definisana formula.", en: "Fresh describes a bright, clean and refreshing olfactory impression. It can include citrus, aquatic, green or aromatic elements; it is not one single note or a rigid formula." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "citrus-fragrance",
    name: "Citrus Fragrance",
    aliases: [
      "citrus fragrance",
      "citrus perfume",
      "citrusy scent",
    ],
    kind: "concept",
    answer: { sr: "Citrusni parfemi naglašavaju profile poput bergamotke, limuna, mandarine, narandže ili grejpfruta. Često djeluju svijetlo i energično, a najlakše citrusne note obično su među brže hlapljivim djelovima kompozicije.", en: "Citrus fragrances emphasize profiles such as bergamot, lemon, mandarin, orange or grapefruit. They often feel bright and energetic, while the lightest citrus notes are usually among the more volatile parts of a composition." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "aromatic-fragrance",
    name: "Aromatic Fragrance",
    aliases: [
      "aromatic perfume",
      "herbal aromatic scent",
      "aromatic fragrance",
    ],
    kind: "concept",
    answer: { sr: "Aromatic opisuje parfeme sa izraženim biljnim profilima poput lavande, ruzmarina, žalfije, timijana ili estragona. Često se preklapa sa fresh, fougère i woody pravcima.", en: "Aromatic describes fragrances with pronounced herbal profiles such as lavender, rosemary, sage, thyme or tarragon. It often overlaps with fresh, fougère and woody directions." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "aquatic-fragrance",
    name: "Aquatic Fragrance",
    aliases: [
      "aquatic fragrance",
      "marine fragrance",
      "watery perfume",
      "ozonic fragrance",
    ],
    kind: "concept",
    answer: { sr: "Aquatic ili marine mirisi stvaraju utisak vode, morskog vazduha, rose ili čistog vlažnog vazduha. Taj efekat se često gradi sintetičkim materijalima jer se 'miris mora' ne dobija jednostavnim prirodnim ekstraktom.", en: "Aquatic or marine fragrances create impressions of water, sea air, dew or clean humid air. This effect is often built with synthetic materials because the smell of the sea is not obtained by a simple natural extract." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "green-fragrance",
    name: "Green Fragrance",
    aliases: [
      "green fragrance",
      "green perfume",
      "leafy fragrance",
    ],
    kind: "concept",
    answer: { sr: "Green parfemi naglašavaju osjećaj lista, trave, stabljike, bilja ili zelenog čaja. Mogu djelovati svježe, gorkasto, vlažno ili hrskavo, zavisno od kompozicije.", en: "Green fragrances emphasize impressions of leaves, grass, stems, herbs or green tea. They can feel fresh, bitter, damp or crisp depending on the composition." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "floral-fragrance",
    name: "Floral Fragrance",
    aliases: [
      "floral fragrance",
      "floral perfume",
      "flower fragrance",
    ],
    kind: "concept",
    answer: { sr: "Floral parfemi grade karakter oko jednog ili više cvjetnih profila poput ruže, jasmina, božura, gardenije ili magnolije. Floral ne znači automatski slatko niti isključivo žensko.", en: "Floral fragrances build their character around one or more flower profiles such as rose, jasmine, peony, gardenia or magnolia. Floral does not automatically mean sweet or exclusively feminine." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "white-floral-fragrance",
    name: "White Floral Fragrance",
    aliases: [
      "white floral fragrance",
      "white florals",
      "white flower perfume",
    ],
    kind: "concept",
    answer: { sr: "White floral je opis za raskošne cvjetne profile poput jasmina, tuberoze, gardenije i cvijeta narandže. Mogu biti kremasti, indolični, svježi ili vrlo intenzivni.", en: "White floral describes rich flower profiles such as jasmine, tuberose, gardenia and orange blossom. They can be creamy, indolic, fresh or very intense." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "fruity-fragrance",
    name: "Fruity Fragrance",
    aliases: [
      "fruity fragrance",
      "fruity perfume",
      "fruit scent",
    ],
    kind: "concept",
    answer: { sr: "Fruity parfemi ističu voćne efekte poput jabuke, kruške, breskve, bobičastog ili tropskog voća. Mnoge voćne note u parfimeriji su akordi, a ne doslovno ulje iz samog voća.", en: "Fruity fragrances emphasize fruit effects such as apple, pear, peach, berries or tropical fruit. Many fruity notes in perfumery are accords rather than literal oils extracted from the fruit itself." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "gourmand-fragrance",
    name: "Gourmand Fragrance",
    aliases: [
      "gourmand fragrance",
      "dessert perfume",
    ],
    kind: "concept",
    answer: { sr: "Gourmand parfem koristi jestive ili desertne asocijacije poput vanile, karamele, čokolade, kafe, meda ili peciva. Gourmand ne znači nužno ekstremno sladak: može biti suv, začinjen, smoky ili woody.", en: "A gourmand fragrance uses edible or dessert-like associations such as vanilla, caramel, chocolate, coffee, honey or pastry. Gourmand does not necessarily mean extremely sweet; it can also be dry, spicy, smoky or woody." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "woody-fragrance",
    name: "Woody Fragrance",
    aliases: [
      "woody fragrance",
      "woody perfume",
      "wood fragrance",
    ],
    kind: "concept",
    answer: { sr: "Woody parfemi naglašavaju sandalovinu, kedar, vetiver, oud, patchouli ili apstraktne moderne woody molekule. Mogu biti suvi, kremasti, earthy, smoky ili ambery.", en: "Woody fragrances emphasize sandalwood, cedar, vetiver, oud, patchouli or abstract modern woody molecules. They can be dry, creamy, earthy, smoky or ambery." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "amber-fragrance",
    name: "Amber Fragrance",
    aliases: [
      "amber fragrance",
      "ambery fragrance",
      "amber perfume",
    ],
    kind: "concept",
    answer: { sr: "Amber ili ambery opisuje topao, dubok i često resinous, vanilla, spicy ili balsamic mirisni efekat. U modernoj parfimeriji 'amber' ne znači nužno prirodnu ambergris sirovinu.", en: "Amber or ambery describes a warm, deep and often resinous, vanilla, spicy or balsamic olfactory effect. In modern perfumery, amber does not necessarily mean natural ambergris material." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "spicy-fragrance",
    name: "Spicy Fragrance",
    aliases: [
      "spicy fragrance",
      "spicy perfume",
      "spiced fragrance",
    ],
    kind: "concept",
    answer: { sr: "Spicy parfemi naglašavaju efekte začina poput bibera, cimeta, kardamoma, karanfilića, šafrana ili đumbira. Mogu biti fresh-spicy ili warm-spicy, zavisno od vrste začinskog karaktera.", en: "Spicy fragrances emphasize effects such as pepper, cinnamon, cardamom, clove, saffron or ginger. They can be fresh-spicy or warm-spicy depending on the character of the spices." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "leather-fragrance",
    name: "Leather Fragrance",
    aliases: [
      "leather fragrance",
      "leathery perfume",
      "leather scent",
    ],
    kind: "concept",
    answer: { sr: "Leather je akord koji može podsjećati na novu kožu, suede, dimljenu ili animalic kožu. Pošto koža nije klasično etarsko ulje, efekat se gradi kombinacijom različitih parfemskih materijala.", en: "Leather is an accord that can suggest new leather, suede, smoky leather or animalic leather. Because leather is not a conventional essential oil, the effect is built from combinations of fragrance materials." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "powdery-fragrance",
    name: "Powdery Fragrance",
    aliases: [
      "powdery fragrance",
      "powdery scent",
    ],
    kind: "concept",
    answer: { sr: "Powdery opisuje mekan, suv, kozmetički ili puderast osjećaj. Može nastati kroz iris/orris, violet-ionone, heliotrope, musk, vanilla i druge materijale; nije jedna posebna nota.", en: "Powdery describes a soft, dry, cosmetic or talc-like impression. It can come from iris or orris, violet-ionones, heliotrope, musks, vanilla and other materials; it is not one specific note." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "clean-fragrance",
    name: "Clean Fragrance",
    aliases: [
      "clean fragrance",
      "clean smelling perfume",
      "clean scent",
    ],
    kind: "concept",
    answer: { sr: "Clean je opis utiska, a ne jedna parfemska porodica sa univerzalnom formulom. Može značiti sapunasto, musk, citrusno, airy, laundry-like ili svježe; zato je korisno pitati kupca šta tačno podrazumijeva pod 'čisto'.", en: "Clean is an impression rather than one fragrance family with a universal formula. It may mean soapy, musky, citrusy, airy, laundry-like or fresh, so it is useful to clarify what a customer means by clean." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "creamy-fragrance",
    name: "Creamy Fragrance",
    aliases: [
      "creamy fragrance",
      "creamy perfume",
      "creamy scent",
    ],
    kind: "concept",
    answer: { sr: "Creamy opisuje glatku, mekanu i zaobljenu teksturu mirisa. Često je daju sandalovina, musk, vanilla, lactonic ili određeni floralni materijali; ne znači nužno mliječnu notu.", en: "Creamy describes a smooth, soft and rounded fragrance texture. It is often created by sandalwood, musks, vanilla, lactonic or certain floral materials and does not necessarily imply a literal milk note." },
    sources: [{ label: "The Perfume Society — fragrance families", url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/", type: "reference" }],
  },

  {
    id: "skin-chemistry",
    name: "Skin Chemistry",
    aliases: [
      "skin chemistry",
      "perfume on my skin",
      "why perfume smells different on me",
    ],
    kind: "concept",
    answer: { sr: "Koža utiče na način na koji parfem isparava i kako ga doživljavamo. Masnoća ili suvoća kože, temperatura kože i individualni mirisni trag mogu promijeniti trajanje i naglasiti različite djelove formule; zato isti parfem ne mora djelovati identično na dvije osobe.", en: "Skin affects how fragrance evaporates and is perceived. Skin oiliness or dryness, temperature and an individual's odor footprint can change longevity and emphasize different parts of the formula, so the same fragrance need not behave identically on two people." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "dry-skin-performance",
    name: "Dry Skin and Fragrance",
    aliases: [
      "dry skin perfume",
      "perfume on dry skin",
      "dry skin longevity",
      "suva koza parfem",
      "parfem na suvoj kozi",
      "dry skin and fragrance",
    ],
    kind: "concept",
    answer: { sr: "Parfem često brže nestaje sa suvlje kože. Hidratacija neutralnom kremom prije nanošenja može pomoći da se miris zadrži duže, ali neće pretvoriti laganu formulu u ekstremno dugotrajan parfem.", en: "Fragrance often dissipates faster on drier skin. Moisturizing with an unscented lotion before application can help it last longer, but it will not turn a light formula into an extremely long-lasting fragrance." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "moisturized-skin-performance",
    name: "Moisturized Skin and Fragrance",
    aliases: [
      "moisturized skin perfume",
      "hydrated skin fragrance",
      "moisturizer perfume longevity",
      "hidrirana koza parfem",
      "krema pre parfema",
      "krema prije parfema",
      "moisturized skin and fragrance",
    ],
    kind: "concept",
    answer: { sr: "Hidratizovana koža obično bolje zadržava miris od veoma suve kože. Neutralna krema ili losion mogu pomoći trajnosti, naročito kod lakših parfema, bez potrebe za pretjeranim brojem prskanja.", en: "Moisturized skin generally holds fragrance better than very dry skin. An unscented cream or lotion can help longevity, especially with lighter fragrances, without requiring excessive spraying." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "fragrance-on-clothing",
    name: "Fragrance on Clothing",
    aliases: [
      "fragrance on clothing",
      "spray perfume on clothes",
      "parfem na odeci",
      "parfem na odjeci",
      "parfem na garderobi",
    ],
    kind: "concept",
    answer: { sr: "Na tkanini miris često traje duže nego na toploj koži jer sporije isparava. Ipak, prvo treba provjeriti da parfem ne ostavlja fleku ili trag, posebno na svijetlim, osjetljivim ili svilenim materijalima.", en: "Fragrance often lasts longer on fabric than on warm skin because it evaporates more slowly. However, test first for staining or residue, especially on light-colored, delicate or silk fabrics." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "temperature-performance",
    name: "Temperature and Fragrance Performance",
    aliases: [
      "temperature perfume performance",
      "weather perfume performance",
      "heat perfume projection",
      "temperature and fragrance performance",
    ],
    kind: "concept",
    answer: { sr: "Temperatura mijenja brzinu isparavanja parfema. Toplota obično ubrzava razvoj i može pojačati početnu projekciju, dok hladnoća usporava isparavanje i često utišava širenje mirisa.", en: "Temperature changes the evaporation rate of fragrance. Heat generally speeds development and can increase initial projection, while cold slows evaporation and often reduces how widely the scent diffuses." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "hot-weather-performance",
    name: "Hot Weather Performance",
    aliases: [
      "hot weather perfume",
      "perfume in heat",
      "summer heat fragrance performance",
      "hot weather performance",
    ],
    kind: "concept",
    answer: { sr: "Na vrućini parfem često brže 'procjveta', ali i brže gubi lakše top note. Zato snažniji miris može djelovati intenzivnije u startu, a svjež citrusni parfem kraće trajati nego u blažim uslovima.", en: "In hot weather fragrance often blooms faster, while lighter top notes can also disappear faster. A strong scent may feel more intense at first, while a fresh citrus fragrance may last less than it does in milder conditions." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "cold-weather-performance",
    name: "Cold Weather Performance",
    aliases: [
      "perfume in cold",
      "winter fragrance performance",
      "cold weather performance",
    ],
    kind: "concept",
    answer: { sr: "Hladnoća usporava isparavanje. To može produžiti prisustvo nekih nota, ali parfem često manje projektuje i razvija se sporije nego na toploj koži ili u toplom vazduhu.", en: "Cold slows evaporation. That can prolong the presence of some notes, but fragrance often projects less and develops more slowly than on warm skin or in warm air." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "skin-vs-paper-test",
    name: "Skin vs Paper Test",
    aliases: [
      "skin vs paper perfume",
      "test perfume on skin",
      "koza ili papir parfem",
      "skin vs paper test",
    ],
    kind: "concept",
    answer: { sr: "Blotter je odličan za prvi pregled i poređenje više parfema, ali ne pokazuje u potpunosti kako će miris reagovati sa vašom kožom. Za odluku o kupovini korisno je parfem nositi na koži kroz cijeli razvoj.", en: "A blotter is useful for a first look and comparing several fragrances, but it does not fully show how a scent will behave on your skin. For a buying decision, it is useful to wear the fragrance on skin through its full development." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "opening-vs-drydown",
    name: "Opening vs Drydown",
    aliases: [
      "opening vs drydown",
      "first impression perfume",
      "perfume changes after spraying",
      "prvi utisak parfema",
      "parfem se promeni kasnije",
      "parfem se promijeni kasnije",
      "prvi utisak isto sto i drydown",
    ],
    kind: "concept",
    answer: { sr: "Prvih nekoliko minuta nijesu cijeli parfem. Opening često naglašava najhlapljivije note, dok se srce i baza jasnije vide kasnije; zato kupovina samo na osnovu prvog prskanja može dati pogrešnu sliku.", en: "The first few minutes are not the whole fragrance. The opening often emphasizes the most volatile notes, while the heart and base become clearer later, so buying only from the first spray can give a misleading picture." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "spray-count-performance",
    name: "Spray Count and Performance",
    aliases: [
      "spray count perfume",
      "how many sprays performance",
      "more sprays stronger",
      "spray count and performance",
    ],
    kind: "concept",
    answer: { sr: "Više prskanja povećava količinu parfema i može pojačati prisustvo, ali ne mijenja samu formulu niti njenu prirodnu projekciju i trajnost. Previše prskanja može samo učiniti miris napadnim i ubrzati olfaktivni zamor.", en: "More sprays increase the amount of fragrance and can increase presence, but they do not change the formula's inherent projection or longevity. Overspraying can simply make a scent intrusive and accelerate olfactory fatigue." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "maceration-vs-maturation",
    name: "Maceration vs Maturation",
    aliases: [
      "maceration vs maturation",
      "perfume maturation",
      "maceration perfume meaning",
      "mora li parfem da macerira",
      "mora li parfem macerirati",
      "maceracija mit",
    ],
    kind: "concept",
    answer: { sr: "U proizvodnji parfema termini maceration i maturation koriste se za periode u kojima se blend ostavlja da se sjedini i razvije prije finalne obrade ili punjenja. Kod već gotove bočice nije pravilo da svaki novi parfem mora mjesecima 'macerirati' kod kupca da bi bio ispravan.", en: "In perfume production, maceration and maturation refer to periods in which a blend is allowed to integrate and develop before final processing or bottling. For an already finished retail bottle, it is not a rule that every new fragrance must sit for months at home to become correct." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "rest-after-transport",
    name: "Resting After Transport",
    aliases: [
      "rest perfume after shipping",
      "perfume after transport",
      "let perfume rest after delivery",
      "parfem posle transporta",
      "parfem poslije transporta",
      "odmor parfema nakon dostave",
      "resting after transport",
    ],
    kind: "concept",
    answer: { sr: "Nakon transporta parfem ne zahtijeva obaveznu višenedjeljnu terapiju. Ako je bio izložen velikoj toploti ili hladnoći, razumno je pustiti bočicu da se vrati na stabilnu sobnu temperaturu prije procjene mirisa.", en: "After transport, fragrance does not require a mandatory multi-week resting ritual. If it was exposed to strong heat or cold, it is reasonable to let the bottle return to a stable room temperature before judging the scent." },
    sources: [{ label: "The Perfume Society — wear and performance guidance", url: "https://perfumesociety.org/fragrant-facts-myths-everything-your-nose-needs-to-know/", type: "reference" }],
  },

  {
    id: "sample",
    name: "Fragrance Sample",
    aliases: [
      "fragrance sample",
      "perfume sample",
      "sample perfume",
    ],
    kind: "concept",
    answer: { sr: "Sample je mala količina parfema namijenjena probi prije kupovine veće količine ili pune bočice. Sample može biti fabrički ili naknadno pretočen; zato je važno razlikovati official sample od dekanta.", en: "A fragrance sample is a small amount intended for testing before buying a larger quantity or full bottle. A sample may be factory-made or decanted later, so it is useful to distinguish an official sample from a decant." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "official-sample",
    name: "Official Sample",
    aliases: [
      "official sample",
      "factory sample",
      "brand sample",
    ],
    kind: "concept",
    answer: { sr: "Official sample je uzorak koji je proizveo ili distribuirao sam brend/proizvođač u originalnom malom pakovanju. To nije isto što i dekant napravljen pretakanjem iz originalne veće bočice.", en: "An official sample is produced or distributed by the fragrance brand or manufacturer in original small packaging. It is not the same as a decant transferred from an original larger bottle." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "tester-bottle",
    name: "Tester Bottle",
    aliases: [
      "tester bottle",
      "perfume tester",
      "tester perfume",
    ],
    kind: "concept",
    answer: { sr: "Tester je originalni proizvod namijenjen demonstraciji u prodajnom okruženju. Često dolazi u jednostavnijem pakovanju ili bez ukrasnog čepa, ali pojam tester ne znači dekant niti mini bočicu.", en: "A tester is an original product intended for demonstration in a retail setting. It may come in simpler packaging or without a decorative cap, but a tester is not the same thing as a decant or miniature." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "miniature-bottle",
    name: "Miniature Bottle",
    aliases: [
      "miniature bottle",
      "perfume miniature",
      "mini perfume bottle",
    ],
    kind: "concept",
    answer: { sr: "Miniature je mala fabrička bočica koja izgledom često prati originalno pakovanje. To je druga kategorija od dekanta, koji se puni pretakanjem iz originalne bočice u neutralni atomizer.", en: "A miniature is a small factory-made bottle often styled after the original packaging. It differs from a decant, which is transferred from an original bottle into a neutral atomizer." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "full-bottle",
    name: "Full Bottle",
    aliases: [
      "full bottle",
      "full perfume bottle",
      "retail bottle",
    ],
    kind: "concept",
    answer: { sr: "Full bottle je puna fabrička bočica parfema u originalnom prodajnom formatu. PlayNice je primarno decant webshop; puna bočica nije standardna ponuda i po potrebi se provjerava dostupnost.", en: "A full bottle is the complete factory retail bottle. PlayNice primarily sells decants; full bottles are not the standard offer and availability can be checked when needed." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "decanting-process",
    name: "Decanting",
    aliases: [
      "decanting",
      "perfume decanting",
      "how decants are made",
    ],
    kind: "concept",
    answer: { sr: "Decanting je pretakanje originalnog parfema iz veće bočice u manji atomizer. Ideja je da kupac dobije stvarni parfem u manjoj količini radi testiranja ili praktičnog nošenja.", en: "Decanting is the transfer of original fragrance from a larger bottle into a smaller atomizer. The purpose is to provide the actual fragrance in a smaller amount for testing or convenient wear." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "decant-originality",
    name: "Is a Decant Original?",
    aliases: [
      "is decant original",
      "jel dekant original",
      "da li je dekant original",
      "original perfume in decant",
      "dekant original",
      "je li dekant original",
    ],
    kind: "concept",
    answer: { sr: "Dekant nije kopija parfema ako je napunjen iz originalne bočice: unutra je isti parfem, samo u drugom atomizeru i manjoj količini. Originalnost sadržaja i originalno fabričko pakovanje nijesu ista stvar.", en: "A decant is not a copy when it is filled from an original bottle: the liquid is the same fragrance, simply placed in another atomizer in a smaller quantity. Original contents and original factory packaging are different concepts." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "decant-vs-tester",
    name: "Decant vs Tester",
    aliases: [
      "decant vs tester",
      "tester vs decant",
      "difference decant tester",
      "dekant ili tester",
      "razlika dekant tester",
    ],
    kind: "concept",
    answer: { sr: "Dekant je manja količina pretočena iz originalne bočice u drugi atomizer. Tester je fabrička originalna bočica namijenjena demonstraciji. To su dvije različite stvari.", en: "A decant is a smaller amount transferred from an original bottle into another atomizer. A tester is a factory-original bottle intended for demonstration. They are different product types." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "two-ml-decant",
    name: "2 ml Decant",
    aliases: [
      "2 ml decant",
      "2ml decant",
      "2 ml sample",
      "2ml sample",
      "koliko traje 2 ml",
      "kolko traje 2ml",
      "da li je 2 ml dovoljno",
    ],
    kind: "concept",
    answer: { sr: "2 ml je dobar format za prvi utisak i nekoliko odvojenih nošenja, zavisno od broja prskanja i atomizera. Za ozbiljnije upoznavanje razvoja parfema kroz više dana 5 ml obično daje više prostora.", en: "2 ml is a useful size for a first impression and several separate wearings, depending on spray count and atomizer output. For evaluating a fragrance over more days and situations, 5 ml usually gives more room." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "five-ml-decant",
    name: "5 ml Decant",
    aliases: [
      "5 ml decant",
      "5ml decant",
      "5 ml perfume",
      "koliko traje 5 ml",
      "kolko traje 5ml",
      "da li je 5 ml dovoljno",
    ],
    kind: "concept",
    answer: { sr: "5 ml je praktičan format kada želite da parfem probate više puta, u različitim danima i uslovima. Daje znatno bolju sliku od jednog kratkog testa, a i dalje ne zahtijeva kupovinu pune bočice.", en: "5 ml is a practical size for testing a fragrance repeatedly across different days and conditions. It gives a much better picture than one brief test without committing to a full bottle." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "ten-ml-decant",
    name: "10 ml Decant",
    aliases: [
      "10 ml decant",
      "10ml decant",
      "10 ml perfume",
      "koliko traje 10 ml",
      "kolko traje 10ml",
    ],
    kind: "concept",
    answer: { sr: "10 ml već omogućava duže redovno nošenje i dobar je izbor kada vam se parfem dopada, ali još ne želite punu bočicu. Koliko će trajati zavisi od vašeg broja prskanja i atomizera.", en: "10 ml supports extended regular wear and works well when you like a fragrance but do not want a full bottle yet. How long it lasts depends on your spraying habits and atomizer output." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "twenty-ml-decant",
    name: "20 ml Decant",
    aliases: [
      "20 ml decant",
      "20ml decant",
      "20 ml perfume",
      "koliko traje 20 ml",
      "kolko traje 20ml",
    ],
    kind: "concept",
    answer: { sr: "20 ml je veliki decant format namijenjen dužem korišćenju. Ima smisla kada ste parfem već upoznali i želite znatnu količinu bez prelaska na punu fabričku bočicu.", en: "20 ml is a large decant size intended for longer use. It makes sense when you already know the fragrance and want a substantial amount without moving to a full factory bottle." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "sprays-per-ml",
    name: "Sprays per ml",
    aliases: [
      "sprays per ml",
      "how many sprays in 1 ml",
      "koliko prskanja 1 ml",
      "koliko prskanja ima ml",
      "koliko prskanja u 1 ml",
      "kolko prskanja ima 1ml",
      "koliko sprayeva u ml",
    ],
    kind: "concept",
    answer: { sr: "Ne postoji pouzdan univerzalan broj prskanja po mililitru jer atomizeri izbacuju različitu količinu tečnosti. Procjene mogu pomoći samo okvirno; stvarni broj zavisi od samog raspršivača i načina prskanja.", en: "There is no reliable universal number of sprays per milliliter because atomizers dispense different amounts of liquid. Estimates are only approximate; the real count depends on the sprayer and how it is used." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "try-before-buy",
    name: "Try Before You Buy",
    aliases: [
      "try before you buy",
      "probaj pre kupovine",
      "probaj prije kupovine",
      "test before full bottle",
    ],
    kind: "concept",
    answer: { sr: "Try before you buy znači prvo nositi parfem na svojoj koži kroz više nošenja prije odluke o većoj količini. Papirni tester ili prvi minut na koži ne pokazuju uvijek kako će se parfem razviti i ponašati tokom dana.", en: "Try before you buy means wearing a fragrance on your own skin across multiple wearings before committing to a larger amount. A paper strip or the first minute on skin does not always show how the fragrance will develop and behave through the day." },
    sources: [{ label: "PlayNice — decant and sampling guidance", url: "https://www.playniceshop.me", type: "retailer-primary" }],
  },

  {
    id: "eau-de-cologne",
    name: "Eau de Cologne",
    aliases: [
      "eau de cologne",
      "edc",
      "cologne concentration",
    ],
    kind: "concept",
    answer: { sr: "Eau de Cologne (EDC) je naziv za lakšu koncentraciju mirisa. Tipični procenti su samo okvirni i razlikuju se među brendovima; EDC zato nije garancija tačnog procenta niti određenog trajanja.", en: "Eau de Cologne (EDC) is a label for a lighter fragrance concentration. Typical percentages are only guidelines and vary by brand, so EDC does not guarantee an exact percentage or a specific longevity." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "eau-de-toilette",
    name: "Eau de Toilette",
    aliases: [
      "eau de toilette",
      "edt",
      "edt concentration",
      "sta znaci edt",
      "je li edt slabiji",
      "jel edt slabiji",
    ],
    kind: "concept",
    answer: { sr: "Eau de Toilette (EDT) obično označava lakšu koncentraciju od EDP-a u istoj liniji, ali nije pravilo da je uvijek slabiji u projekciji ili da je samo razrijeđena verzija. EDT može imati drugačiji balans nota i karakter.", en: "Eau de Toilette (EDT) usually denotes a lighter concentration than an EDP within the same line, but that does not mean it always projects less or is merely diluted. An EDT can have a different balance of notes and character." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "eau-de-parfum",
    name: "Eau de Parfum",
    aliases: [
      "eau de parfum",
      "edp",
      "edp concentration",
      "je li edp jaci",
      "jel edp jaci",
    ],
    kind: "concept",
    answer: { sr: "Eau de Parfum (EDP) obično označava višu koncentraciju od EDT-a u istoj liniji. To često pomaže trajnosti, ali EDP nije automatski bolji, jači u projekciji ili identičan miris sa više ulja.", en: "Eau de Parfum (EDP) usually indicates a higher concentration than an EDT within the same line. That often helps longevity, but an EDP is not automatically better, louder in projection, or simply the same scent with more oil." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "parfum-concentration",
    name: "Parfum",
    aliases: [
      "parfum concentration",
      "parfum strength",
      "pure parfum",
      "sta je parfum",
    ],
    kind: "concept",
    answer: { sr: "Parfum je obično među najkoncentrovanijim formatima mirisa. Ipak, oznake koncentracije nijesu univerzalno standardizovane između svih kuća, a Parfum verzija može biti i drugačije komponovana od EDT/EDP verzije.", en: "Parfum is usually among the most concentrated fragrance formats. However, concentration labels are not universally standardized across houses, and a Parfum version may also be composed differently from its EDT or EDP counterparts." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "extrait-de-parfum",
    name: "Extrait de Parfum",
    aliases: [
      "extrait de parfum",
      "extrait",
      "perfume extract",
      "sta znaci extrait",
      "jel extrait jaci",
      "je li extrait jaci",
    ],
    kind: "concept",
    answer: { sr: "Extrait de Parfum obično označava veoma visoku koncentraciju mirisne kompozicije. Viša koncentracija može produžiti trajanje, ali ne znači nužno veću projekciju; extrait često djeluje gušće i bliže koži.", en: "Extrait de Parfum usually denotes a very high concentration of fragrance composition. Higher concentration can improve longevity, but does not necessarily mean greater projection; extrait often feels denser and closer to the skin." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "concentration-vs-performance",
    name: "Concentration vs Performance",
    aliases: [
      "concentration vs performance",
      "edp always stronger",
      "extrait always stronger",
      "higher concentration stronger",
      "edp uvek jaci",
      "edp uvijek jaci",
      "extrait uvek jaci",
      "extrait uvijek jaci",
      "veca koncentracija jaci parfem",
    ],
    kind: "concept",
    answer: { sr: "Veća koncentracija ne znači automatski jaču projekciju niti bolji parfem. Ona često mijenja trajnost i gustinu, ali EDT, EDP i Parfum verzije mogu imati različite formule i ponašati se drugačije.", en: "Higher concentration does not automatically mean stronger projection or a better fragrance. It often changes longevity and density, but EDT, EDP and Parfum versions can have different formulas and behave differently." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "top-notes",
    name: "Top Notes",
    aliases: [
      "top notes",
      "top note",
      "opening notes",
      "head notes",
    ],
    kind: "concept",
    answer: { sr: "Top notes su note koje se najbrže uočavaju nakon nanošenja. Često su lakše i hlapljivije, pa snažno oblikuju prvi utisak, ali obično ne predstavljaju čitav miris nakon što se parfem razvije.", en: "Top notes are the notes noticed most quickly after application. They are often lighter and more volatile, strongly shaping the first impression but usually not representing the whole fragrance after it develops." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "heart-notes",
    name: "Heart Notes",
    aliases: [
      "heart notes",
      "middle notes",
      "heart note",
      "middle note",
    ],
    kind: "concept",
    answer: { sr: "Heart ili middle notes čine sredinu razvoja parfema. Postaju jasnije nakon početnog otvaranja i često nose glavni karakter kompozicije prije nego što baza preuzme veću ulogu.", en: "Heart or middle notes form the middle stage of a fragrance's development. They become clearer after the opening and often carry much of the composition's character before the base becomes more prominent." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "base-notes",
    name: "Base Notes",
    aliases: [
      "base notes",
      "base note",
      "fond notes",
      "drydown notes",
    ],
    kind: "concept",
    answer: { sr: "Base notes su sporije i postojanije komponente koje najviše oblikuju kasniji razvoj i drydown. Često uključuju drvenaste, ambery, musk, vanilla ili resinous pravce, ali baza nije isto što i samo jedna teška nota.", en: "Base notes are slower, more persistent components that strongly shape the later development and drydown. They often include woody, ambery, musky, vanilla or resinous directions, but the base is not simply one heavy note." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "fragrance-pyramid",
    name: "Fragrance Pyramid",
    aliases: [
      "fragrance pyramid",
      "perfume pyramid",
      "olfactory pyramid",
    ],
    kind: "concept",
    answer: { sr: "Fragrance pyramid je način opisivanja razvoja mirisa kroz top, heart i base note. To je koristan model za razumijevanje parfema, ali nije precizan vremenski raspored: note se preklapaju i mogu biti prisutne istovremeno.", en: "A fragrance pyramid describes scent development through top, heart and base notes. It is a useful model, not an exact timetable: notes overlap and can be perceptible at the same time." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "note-vs-ingredient",
    name: "Note vs Ingredient",
    aliases: [
      "note vs ingredient",
      "perfume note vs ingredient",
      "note ingredient difference",
      "is a note an ingredient",
    ],
    kind: "concept",
    answer: { sr: "Parfemska nota nije nužno doslovan sastojak. Jabuka, koža, morski vazduh ili kolač mogu biti olfaktivni efekti izgrađeni kombinacijom više prirodnih i/ili sintetičkih materijala.", en: "A perfume note is not necessarily a literal ingredient. Apple, leather, sea air or cake can be olfactory effects built from combinations of multiple natural and/or synthetic materials." },
    sources: [{ label: "The Perfume Society — fragrance basics", url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/", type: "reference" }],
  },

  {
    id: "prenyl-acetate",
    name: "Prenyl Acetate",
    aliases: [
      "prenyl acetate",
      "prenyl acetate pear",
      "prenyl acetate fruity green",
      "prenyl acetate banana",
    ],
    kind: "material",
    answer: {
      sr: "Prenyl Acetate je IFF fruity-green materijal sa svježim pear, banana i green karakterom. Daje lagan, sočan i pjenušav voćni top-note efekat.",
      en: "Prenyl Acetate is an IFF fruity-green material with fresh pear, banana and green character. It gives a light, juicy and sparkling fruity top-note effect.",
    },
    sources: [
      {
        label: "IFF — Prenyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/prenyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "anisaldehyde",
    name: "Anisaldehyde",
    aliases: [
      "anisaldehyde",
      "anisic aldehyde",
      "anisaldehyde anise",
      "anisaldehyde powdery floral",
    ],
    kind: "material",
    answer: {
      sr: "Anisaldehyde je slatko-anisic floralni materijal sa puderastim, hawthorn-like i blago vaniličnim karakterom. Koristan je u mimosa, heliotrope, floral i gourmand strukturama.",
      en: "Anisaldehyde is a sweet anisic floral material with powdery, hawthorn-like and slightly vanilla character. It is useful in mimosa, heliotrope, floral and gourmand structures.",
    },
    sources: [
      {
        label: "IFF — Anisaldehyde",
        url: "https://www.iff.com/scent/ingredients-compendium/anisaldehyde/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ethyl-vanillin",
    name: "Ethyl Vanillin",
    aliases: [
      "ethyl vanillin",
      "ethyl vanillin vanilla",
      "ethyl vanillin gourmand",
      "ethyl vanillin sweet",
    ],
    kind: "material",
    answer: {
      sr: "Ethyl Vanillin je snažan vanilla/gourmand materijal, intenzivniji i slađi od klasičnog vanillina. Daje kremastu, vrlo prepoznatljivu vaniličnu dubinu i veliku slatkoću bazi.",
      en: "Ethyl Vanillin is a powerful vanilla-gourmand material, more intense and sweeter than classical vanillin. It gives a creamy, highly recognizable vanilla depth and strong sweetness to the base.",
    },
    sources: [
      {
        label: "IFF — Ethyl Vanillin",
        url: "https://www.iff.com/scent/ingredients-compendium/ethyl-vanillin/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "piperonal",
    name: "Piperonal",
    aliases: [
      "piperonal",
      "piperonal heliotrope",
      "piperonal powdery",
      "piperonal almond vanilla",
    ],
    kind: "material",
    answer: {
      sr: "Piperonal je klasični heliotrope/powdery materijal sa almond, vanilla i floralnim karakterom. Daje meku, puderastu i nostalgičnu slatkoću heliotrope, mimosa i gourmand akordima.",
      en: "Piperonal is a classic heliotrope-powdery material with almond, vanilla and floral character. It gives soft, powdery and nostalgic sweetness to heliotrope, mimosa and gourmand accords.",
    },
    sources: [
      {
        label: "IFF — Piperonal",
        url: "https://www.iff.com/scent/ingredients-compendium/piperonal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "indole",
    name: "Indole",
    aliases: [
      "indole",
      "indole jasmine",
      "indole animalic floral",
      "indole white floral",
    ],
    kind: "material",
    answer: {
      sr: "Indole je izuzetno snažan floral-animalic materijal ključan za realističan jasmine, orange-blossom i white-floral karakter. U vrlo malim dozama daje prirodnu dubinu i senzualnost cvijetu.",
      en: "Indole is an extremely powerful floral-animalic material essential to realistic jasmine, orange-blossom and white-floral character. At very low dosage it gives flowers natural depth and sensuality.",
    },
    sources: [
      {
        label: "IFF — Indole",
        url: "https://www.iff.com/scent/ingredients-compendium/indole/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "verdox",
    name: "Verdox",
    aliases: [
      "verdox",
      "verdox apple",
      "verdox woody fruity",
      "verdox green apple",
    ],
    kind: "material",
    answer: {
      sr: "Verdox je IFF fruity-woody materijal sa green-apple karakterom i suvim woody aspektom. Daje voćnim akordima strukturu, trajnost i modernu crisp zelenost.",
      en: "Verdox is an IFF fruity-woody material with green-apple character and a dry woody aspect. It gives fruity accords structure, substantivity and modern crisp greenness.",
    },
    sources: [
      {
        label: "IFF — Verdox",
        url: "https://www.iff.com/scent/ingredients-compendium/verdox/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cinnamyl-acetate",
    name: "Cinnamyl Acetate",
    aliases: [
      "cinnamyl acetate",
      "cinnamyl acetate floral",
      "cinnamyl acetate cinnamon",
      "cinnamyl acetate balsamic",
    ],
    kind: "material",
    answer: {
      sr: "Cinnamyl Acetate je floral-spicy ester sa slatkim, balsamic i blagim cinnamon karakterom. Daje floralnim i spicy akordima mekoću, toplinu i elegantniji začinski prijelaz.",
      en: "Cinnamyl Acetate is a floral-spicy ester with sweet, balsamic and mild cinnamon character. It gives floral and spicy accords softness, warmth and a more elegant spicy transition.",
    },
    sources: [
      {
        label: "IFF — Cinnamyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/cinnamyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "pinane",
    name: "Pinane",
    aliases: [
      "pinane",
      "pinane pine",
      "pinane terpene",
      "pinane fresh woody",
    ],
    kind: "material",
    answer: {
      sr: "Pinane je fresh woody-terpenic materijal sa čistim pine karakterom. Koristan je u coniferous, fougère, herbal i fresh-woody strukturama kada treba direktan četinarski signal.",
      en: "Pinane is a fresh woody-terpenic material with clean pine character. It is useful in coniferous, fougère, herbal and fresh-woody structures when a direct coniferous signal is needed.",
    },
    sources: [
      {
        label: "IFF — Pinane",
        url: "https://www.iff.com/scent/ingredients-compendium/pinane/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "methyl-naphthyl-ketone",
    name: "Methyl Naphtyl Ketone",
    aliases: [
      "methyl naphtyl ketone",
      "methyl naphthyl ketone",
      "methyl naphtyl ketone orange blossom",
      "methyl naphtyl ketone floral",
    ],
    kind: "material",
    answer: {
      sr: "Methyl Naphtyl Ketone je klasični floralni materijal sa orange-blossom i sweet-floral karakterom. Daje floralnim bazama dubinu, trajnost i blago vintage cvjetni osjećaj.",
      en: "Methyl Naphtyl Ketone is a classic floral material with orange-blossom and sweet-floral character. It gives floral bases depth, persistence and a slightly vintage floral feel.",
    },
    sources: [
      {
        label: "IFF — Methyl Naphtyl Ketone",
        url: "https://www.iff.com/scent/ingredients-compendium/methyl-naphtyl-ketone/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "phenylacetic-acid",
    name: "Phenylacetic Acid",
    aliases: [
      "phenylacetic acid",
      "phenyl acetic acid",
      "phenylacetic acid honey",
      "phenylacetic acid animalic",
    ],
    kind: "material",
    answer: {
      sr: "Phenylacetic Acid je floral-animalic materijal sa honey, waxy i blago animalic karakterom. Važan je za honey, narcissus, jasmine i natural-floral efekte kada treba tamnija nektarna dubina.",
      en: "Phenylacetic Acid is a floral-animalic material with honey, waxy and slightly animalic character. It is important in honey, narcissus, jasmine and natural-floral effects when darker nectar-like depth is needed.",
    },
    sources: [
      {
        label: "IFF — Phenylacetic Acid",
        url: "https://www.iff.com/scent/ingredients-compendium/phenylacetic-acid/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "mck-chinese",
    name: "MCK Chinese",
    aliases: [
      "mck chinese",
      "methyl cedryl ketone chinese",
      "mck woody musk",
      "mck cedar musk",
    ],
    kind: "material",
    answer: {
      sr: "MCK Chinese je IFF woody-musk materijal iz methyl-cedryl-ketone porodice, sa suvim cedarwood karakterom i toplom musk-amber dubinom. Daje bazi dugotrajan, čvrst i klasično drvenast potpis.",
      en: "MCK Chinese is an IFF woody-musk material from the methyl-cedryl-ketone family, with dry cedarwood character and warm musky-amber depth. It gives the base a long-lasting, firm and classically woody signature.",
    },
    sources: [
      {
        label: "IFF — MCK Chinese",
        url: "https://www.iff.com/scent/ingredients-compendium/mck-chinese/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "mck-sg",
    name: "MCK SG",
    aliases: [
      "mck sg",
      "methyl cedryl ketone sg",
      "mck sg woody",
      "mck sg amber",
    ],
    kind: "material",
    answer: {
      sr: "MCK SG je IFF woody-amber materijal iz methyl-cedryl-ketone porodice sa snažnim, suvim cedarwood i ambery karakterom. Koristi se za postojanu drvenastu strukturu i baznu snagu.",
      en: "MCK SG is an IFF woody-amber material from the methyl-cedryl-ketone family with strong dry cedarwood and ambery character. It is used for persistent woody structure and base strength.",
    },
    sources: [
      {
        label: "IFF — MCK SG",
        url: "https://www.iff.com/scent/ingredients-compendium/mck-sg/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "meth-ionone-beta-coeur",
    name: "Meth Ionone Beta Coeur",
    aliases: [
      "meth ionone beta coeur",
      "methyl ionone beta coeur",
      "beta coeur ionone",
      "meth ionone beta violet",
    ],
    kind: "material",
    answer: {
      sr: "Meth Ionone Beta Coeur je IFF methyl-ionone sa elegantnim violet, orris i woody karakterom, uz blagu fruity dubinu. Daje puderastim i iris-violet strukturama više volumena i postojanosti.",
      en: "Meth Ionone Beta Coeur is an IFF methyl-ionone with elegant violet, orris and woody character plus slight fruity depth. It gives powdery and iris-violet structures more volume and substantivity.",
    },
    sources: [
      {
        label: "IFF — Meth Ionone Beta Coeur",
        url: "https://www.iff.com/scent/ingredients-compendium/meth-ionone-beta-coeur/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "meth-ionone-gamma-a-tocopherol",
    name: "Meth Ionone Gamma A-Tocopherol",
    aliases: [
      "meth ionone gamma a tocopherol",
      "methyl ionone gamma a tocopherol",
      "gamma ionone tocopherol",
      "meth ionone gamma antioxidant",
    ],
    kind: "material",
    answer: {
      sr: "Meth Ionone Gamma A-Tocopherol je IFF methyl-ionone varijanta sa gamma-ionone/orris-violet karakterom, stabilizovana dodatkom tocopherola. Daje suvu, puderastu i postojanu violet-woody strukturu.",
      en: "Meth Ionone Gamma A-Tocopherol is an IFF methyl-ionone variant with gamma-ionone, orris and violet character stabilized with tocopherol. It gives a dry, powdery and substantive violet-woody structure.",
    },
    sources: [
      {
        label: "IFF — Meth Ionone Gamma A-Tocopherol",
        url: "https://www.iff.com/scent/ingredients-compendium/meth-ionone-gamma-a-tocopherol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "meth-ionone-gamma-coeur",
    name: "Meth Ionone Gamma Coeur",
    aliases: [
      "meth ionone gamma coeur",
      "methyl ionone gamma coeur",
      "gamma coeur ionone",
      "meth ionone gamma woody",
    ],
    kind: "material",
    answer: {
      sr: "Meth Ionone Gamma Coeur je IFF methyl-ionone sa suvim woody, violet i orris karakterom. Radi kao elegantan, dugotrajan powdery-woody most između irisa, violeta i drveta.",
      en: "Meth Ionone Gamma Coeur is an IFF methyl-ionone with dry woody, violet and orris character. It acts as an elegant, long-lasting powdery-woody bridge between iris, violet and woods.",
    },
    sources: [
      {
        label: "IFF — Meth Ionone Gamma Coeur",
        url: "https://www.iff.com/scent/ingredients-compendium/meth-ionone-gamma-coeur/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "oxaspirane-819",
    name: "Oxaspirane 819",
    aliases: [
      "oxaspirane 819",
      "oxaspirane",
      "oxaspirane woody amber",
      "oxaspirane dry wood",
    ],
    kind: "material",
    answer: {
      sr: "Oxaspirane 819 je IFF woody-amber materijal sa suvim, snažnim i difuznim drvenastim karakterom. Daje modernim bazama volumen, trajnost i oštro definisan dry-wood efekat.",
      en: "Oxaspirane 819 is an IFF woody-amber material with a dry, powerful and diffusive woody character. It gives modern bases volume, longevity and a sharply defined dry-wood effect.",
    },
    sources: [
      {
        label: "IFF — Oxaspirane 819",
        url: "https://www.iff.com/scent/ingredients-compendium/oxaspirane-819/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ozofleur",
    name: "Ozofleur",
    aliases: [
      "ozofleur",
      "ozofleur ozonic",
      "ozofleur watery floral",
      "ozofleur fresh air",
    ],
    kind: "material",
    answer: {
      sr: "Ozofleur je IFF ozonic-floral materijal sa fresh-air, watery i transparentnim floralnim karakterom. Daje kompoziciji prozračnost, vodenastu svježinu i moderan clean signal.",
      en: "Ozofleur is an IFF ozonic-floral material with fresh-air, watery and transparent floral character. It gives a composition airiness, watery freshness and a modern clean signal.",
    },
    sources: [
      {
        label: "IFF — Ozofleur",
        url: "https://www.iff.com/scent/ingredients-compendium/ozofleur/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "phenoxanol",
    name: "Phenoxanol",
    aliases: [
      "phenoxanol",
      "phenoxanol rose",
      "phenoxanol floral",
      "phenoxanol geranium",
    ],
    kind: "material",
    answer: {
      sr: "Phenoxanol je IFF floralni materijal sa rose i geranium karakterom i čistim, blagim floralnim tonom. Koristan je za zaobljivanje rose akorda i dodavanje postojanosti bez pretjerane težine.",
      en: "Phenoxanol is an IFF floral material with rose and geranium character and a clean, mild floral tone. It is useful for rounding rose accords and adding substantivity without excessive weight.",
    },
    sources: [
      {
        label: "IFF — Phenoxanol",
        url: "https://www.iff.com/scent/ingredients-compendium/phenoxanol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "piconia",
    name: "Piconia",
    aliases: [
      "piconia",
      "piconia green floral",
      "piconia fresh floral",
      "piconia leafy",
    ],
    kind: "material",
    answer: {
      sr: "Piconia je IFF green-floral materijal sa svježim, leafy i čistim floralnim karakterom. Daje modernim floralnim strukturama lagan, zelen i prirodno svjež lift.",
      en: "Piconia is an IFF green-floral material with fresh, leafy and clean floral character. It gives modern floral structures a light, green and naturally fresh lift.",
    },
    sources: [
      {
        label: "IFF — Piconia",
        url: "https://www.iff.com/scent/ingredients-compendium/piconia/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "precyclemone-b",
    name: "Precyclemone B",
    aliases: [
      "precyclemone b",
      "precyclemone",
      "precyclemone marine",
      "precyclemone ozonic",
    ],
    kind: "material",
    answer: {
      sr: "Precyclemone B je IFF fresh materijal sa ozonic, watery i marine karakterom. Koristan je za prozračne aquatic i clean kompozicije kojima treba hladan, svjež i moderan morski efekat.",
      en: "Precyclemone B is an IFF fresh material with ozonic, watery and marine character. It is useful in airy aquatic and clean compositions that need a cool, fresh and modern marine effect.",
    },
    sources: [
      {
        label: "IFF — Precyclemone B",
        url: "https://www.iff.com/scent/ingredients-compendium/precyclemone-b/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "musk-z-4",
    name: "Musk Z 4",
    aliases: [
      "musk z 4",
      "musk z4",
      "musk z 4 macrocyclic",
      "musk z 4 powdery",
    ],
    kind: "material",
    answer: {
      sr: "Musk Z 4 je IFF macrocyclic musk senzualnog, mekog i puderastog karaktera. Daje bazi čist, zaobljen i dugotrajan musk efekat bez oštrine.",
      en: "Musk Z 4 is an IFF macrocyclic musk with a sensual, soft and powdery character. It gives the base a clean, rounded and long-lasting musk effect without harshness.",
    },
    sources: [
      {
        label: "IFF — Musk Z 4",
        url: "https://www.iff.com/scent/ingredients-compendium/musk-z-4/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "myrcenyl-acetate",
    name: "Myrcenyl Acetate",
    aliases: [
      "myrcenyl acetate",
      "myrcenyl acetate citrus",
      "myrcenyl acetate pear",
      "myrcenyl acetate lavender",
    ],
    kind: "material",
    answer: {
      sr: "Myrcenyl Acetate je IFF citrusni materijal fresh, clean i metallic karaktera sa pear, lavender i floralnim facetama. IFF ga posebno opisuje kao odličan cologne builder.",
      en: "Myrcenyl Acetate is an IFF citrus material with fresh, clean and metallic character plus pear, lavender and floral facets. IFF specifically describes it as an excellent cologne builder.",
    },
    sources: [
      {
        label: "IFF — Myrcenyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/myrcenyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "nectarate",
    name: "Nectarate",
    aliases: [
      "nectarate",
      "nectarate peach",
      "nectarate fruity woody",
      "nectarate substantive fruit",
    ],
    kind: "material",
    answer: {
      sr: "Nectarate je IFF fruity materijal prijatnog peach karaktera sa blagim woody podtonom. Daje postojan voćni potpis i dobro radi u širokom spektru kompozicija.",
      en: "Nectarate is an IFF fruity material with a pleasant peach character and a slight woody undertone. It gives a substantive fruity signature and works across a wide range of compositions.",
    },
    sources: [
      {
        label: "IFF — Nectarate",
        url: "https://www.iff.com/scent/ingredients-compendium/nectarate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "neryl-acetate-jax",
    name: "Neryl Acetate JAX",
    aliases: [
      "neryl acetate jax",
      "neryl acetate",
      "neryl acetate pear",
      "neryl acetate cologne",
    ],
    kind: "material",
    answer: {
      sr: "Neryl Acetate JAX je IFF fruity materijal sa sweet floral cologne karakterom i dewy pear tonovima. Daje elegantan, svjež i sočan prijelaz između citrusa, florala i voća.",
      en: "Neryl Acetate JAX is an IFF fruity material with a sweet floral cologne character and dewy pear tones. It gives an elegant, fresh and juicy transition between citrus, floral and fruit notes.",
    },
    sources: [
      {
        label: "IFF — Neryl Acetate JAX",
        url: "https://www.iff.com/scent/ingredients-compendium/neryl-acetate-jax/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "nootkatone-crystals",
    name: "Nootkatone Crystals",
    aliases: [
      "nootkatone crystals",
      "nootkatone",
      "nootkatone grapefruit",
      "nootkatone woody citrus",
    ],
    kind: "material",
    answer: {
      sr: "Nootkatone Crystals je IFF citrusni materijal izuzetno snažnog grapefruit karaktera sa woody top-note aspektom. Koristi se kada treba veoma prepoznatljiv, suv i postojan grapefruit signal.",
      en: "Nootkatone Crystals is an IFF citrus material with an extremely powerful grapefruit character and a woody top-note aspect. It is used when a highly recognizable, dry and substantive grapefruit signal is needed.",
    },
    sources: [
      {
        label: "IFF — Nootkatone Crystals",
        url: "https://www.iff.com/scent/ingredients-compendium/nootkatone-crystals/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ocimenyl-acetate",
    name: "Ocimenyl Acetate",
    aliases: [
      "ocimenyl acetate",
      "ocimenyl acetate herbal citrus",
      "ocimenyl acetate fresh",
      "ocimenyl acetate top note",
    ],
    kind: "material",
    answer: {
      sr: "Ocimenyl Acetate je IFF herbal materijal svježeg herbal-citrus top-note karaktera. Daje aromatičnim i citrusnim kompozicijama jasan, čist i lagan biljno-citrusni lift.",
      en: "Ocimenyl Acetate is an IFF herbal material with a fresh herbal-citrus top-note character. It gives aromatic and citrus compositions a clear, clean and light herbal-citrus lift.",
    },
    sources: [
      {
        label: "IFF — Ocimenyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/ocimenyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "octacetal",
    name: "Octacetal",
    aliases: [
      "octacetal",
      "octacetal orange",
      "octacetal aldehydic",
      "octacetal ozonic green",
    ],
    kind: "material",
    answer: {
      sr: "Octacetal je IFF citrusni materijal fresh, clean i orange karaktera sa aldehydic, ozonic i green facetama. Daje svjež, pjenušav i moderan citrusno-zeleni top-note efekat.",
      en: "Octacetal is an IFF citrus material with fresh, clean orange character plus aldehydic, ozonic and green facets. It gives a fresh, sparkling and modern citrus-green top-note effect.",
    },
    sources: [
      {
        label: "IFF — Octacetal",
        url: "https://www.iff.com/scent/ingredients-compendium/octacetal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "orange-flower-ether",
    name: "Orange Flower Ether",
    aliases: [
      "orange flower ether",
      "orange flower ether grapefruit",
      "orange flower ether bergamot",
      "orange flower ether citrus",
    ],
    kind: "material",
    answer: {
      sr: "Orange Flower Ether je IFF citrusni materijal sa grapefruit karakterom koji podsjeća i na bergamotku; prirodno se javlja u cvijetu narandže. Daje čist i lagan citrusno-floralni most.",
      en: "Orange Flower Ether is an IFF citrus material with a grapefruit character also reminiscent of bergamot and occurs naturally in orange flowers. It gives a clean, light citrus-floral bridge.",
    },
    sources: [
      {
        label: "IFF — Orange Flower Ether",
        url: "https://www.iff.com/scent/ingredients-compendium/orange-flower-ether/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "lyrame-super",
    name: "Lyrame Super",
    aliases: [
      "lyrame super",
      "lyrame",
      "lyrame orange blossom",
      "lyrame floral absolute",
    ],
    kind: "material",
    answer: {
      sr: "Lyrame Super je IFF floralni materijal vrlo postojanog floral-absolute karaktera sa veoma slatkim orange-blossom profilom. Povećava floralnost, fiksaciju i postojanost kompozicije.",
      en: "Lyrame Super is an IFF floral material with a very tenacious floral-absolute odor and a very sweet orange-blossom profile. It increases floralcy, fixation and substantivity in a composition.",
    },
    sources: [
      {
        label: "IFF — Lyrame Super",
        url: "https://www.iff.com/scent/ingredients-compendium/lyrame-super/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "maritima",
    name: "Maritima",
    aliases: [
      "maritima",
      "maritima ocean breeze",
      "maritima wet fresh air",
      "maritima marine",
    ],
    kind: "material",
    answer: {
      sr: "Maritima je IFF fresh materijal snažnog clean, wet i fresh-air karaktera koji podsjeća na ocean breeze. Daje kompozicijama čist, morski i vrlo vazdušast efekat.",
      en: "Maritima is an IFF fresh material with a powerful clean, wet and fresh-air character reminiscent of ocean breezes. It gives compositions a clean, marine and highly airy effect.",
    },
    sources: [
      {
        label: "IFF — Maritima",
        url: "https://www.iff.com/scent/ingredients-compendium/maritima/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "meijiff",
    name: "Meijiff",
    aliases: [
      "meijiff",
      "meijiff muguet",
      "meijiff magnolia",
      "meijiff clean floral",
    ],
    kind: "material",
    answer: {
      sr: "Meijiff je IFF floralni materijal čistog muguet karaktera sa mekanom white-magnolia nijansom. Daje clean-floral strukturama svjež, mekan i uredan cvjetni potpis.",
      en: "Meijiff is an IFF floral material with a clean muguet character and a soft white-magnolia nuance. It gives clean-floral structures a fresh, soft and polished floral signature.",
    },
    sources: [
      {
        label: "IFF — Meijiff",
        url: "https://www.iff.com/scent/ingredients-compendium/meijiff/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "melafleur",
    name: "Melafleur",
    aliases: [
      "melafleur",
      "melafleur muguet",
      "melafleur green melon",
      "melafleur fresh outdoors",
    ],
    kind: "material",
    answer: {
      sr: "Melafleur je IFF floralni materijal postojanog muguet karaktera sa fresh-outdoors efektom i zelenom melon pozadinom. Spaja floralnu čistoću sa vlažnim, prirodno-zelenim osjećajem.",
      en: "Melafleur is an IFF floral material with a substantive muguet character, a fresh-outdoors effect and a green melon background. It links floral cleanliness with a damp, naturally green impression.",
    },
    sources: [
      {
        label: "IFF — Melafleur",
        url: "https://www.iff.com/scent/ingredients-compendium/melafleur/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "melozone",
    name: "Melozone",
    aliases: [
      "melozone",
      "melozone green melon",
      "melozone fresh air",
      "melozone aldehydic",
    ],
    kind: "material",
    answer: {
      sr: "Melozone je IFF green materijal koji kombinuje green-melon i fresh-air karakter sa novim aldehydic efektom. Daje svjež, vodenast i zeleni lift sa jasnom melon komponentom.",
      en: "Melozone is an IFF green material combining green-melon and fresh-air character with a novel aldehydic effect. It gives a fresh, watery green lift with a clear melon component.",
    },
    sources: [
      {
        label: "IFF — Melozone",
        url: "https://www.iff.com/scent/ingredients-compendium/melozone/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "methyl-lavender-ketone",
    name: "Methyl Lavender Ketone",
    aliases: [
      "methyl lavender ketone",
      "mlk lavender",
      "methyl lavender ketone herbal",
      "methyl lavender ketone metallic",
    ],
    kind: "material",
    answer: {
      sr: "Methyl Lavender Ketone je IFF floralni materijal veoma snažnog sweet, herbal, metallic i lavender karaktera. Djeluje već u tragovima i daje oštar, moderan lavender-aromatic signal.",
      en: "Methyl Lavender Ketone is an IFF floral material with a very strong sweet, herbal, metallic and lavender character. It is effective even in traces and gives a sharp, modern lavender-aromatic signal.",
    },
    sources: [
      {
        label: "IFF — Methyl Lavender Ketone",
        url: "https://www.iff.com/scent/ingredients-compendium/methyl-lavender-ketone/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "montaverdi",
    name: "Montaverdi",
    aliases: [
      "montaverdi",
      "montaverdi green",
      "montaverdi apple pear",
      "montaverdi fresh green",
    ],
    kind: "material",
    answer: {
      sr: "Montaverdi je IFF green materijal koji daje svježe, prirodne green note sa fruity apple i pear karakterom. Posebno je koristan za svijetle, prirodno-zelene i crisp-fruity vrhove.",
      en: "Montaverdi is an IFF green material that imparts fresh, natural green notes with fruity apple and pear character. It is especially useful for bright, naturally green and crisp-fruity top notes.",
    },
    sources: [
      {
        label: "IFF — Montaverdi",
        url: "https://www.iff.com/scent/ingredients-compendium/montaverdi/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "muguesia",
    name: "Muguesia",
    aliases: [
      "muguesia",
      "muguesia muguet",
      "muguesia lily of the valley",
      "muguesia stable muguet",
    ],
    kind: "material",
    answer: {
      sr: "Muguesia je IFF floralni muguet materijal koji posebno dolazi do izražaja tamo gdje aldehydic muguet sastojci nijesu stabilni. Daje čist i funkcionalan lily-of-the-valley efekat.",
      en: "Muguesia is an IFF floral muguet material that is especially useful where aldehydic muguet ingredients are not stable. It provides a clean and functional lily-of-the-valley effect.",
    },
    sources: [
      {
        label: "IFF — Muguesia",
        url: "https://www.iff.com/scent/ingredients-compendium/muguesia/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "beta-naphtyl-isobutyl-ether",
    name: "Beta Naphtyl Isobutyl Ether",
    aliases: [
      "beta naphtyl isobutyl ether",
      "beta naphthyl isobutyl ether",
      "beta naphtyl ether",
      "strawberry orange blossom ether",
    ],
    kind: "material",
    answer: {
      sr: "Beta Naphtyl Isobutyl Ether je IFF fruity materijal slatkog strawberry karaktera sa fruity orange-blossom nijansom. Daje voćnim i floral-fruity akordima klasičnu slatku jagodastu dubinu.",
      en: "Beta Naphtyl Isobutyl Ether is an IFF fruity material with a sweet strawberry character and fruity orange-blossom notes. It gives fruity and floral-fruity accords a classic sweet strawberry depth.",
    },
    sources: [
      {
        label: "IFF — Beta Naphtyl Isobutyl Ether",
        url: "https://www.iff.com/scent/ingredients-compendium/beta-naphtyl-isobutyl-ether/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "bornafix",
    name: "Bornafix",
    aliases: [
      "bornafix",
      "bornafix woody amber",
      "bornafix cedarwood",
      "bornafix dry amber",
    ],
    kind: "material",
    answer: {
      sr: "Bornafix je IFF amber materijal toplog woody, dry-amber i cedarwood karaktera. Vrlo je postojan i dobro podržava woody komplekse i floralne strukture.",
      en: "Bornafix is an IFF amber material with warm woody, dry-amber and cedarwood character. It is highly substantive and supports woody complexes and floral structures well.",
    },
    sources: [
      {
        label: "IFF — Bornafix",
        url: "https://www.iff.com/scent/ingredients-compendium/bornafix/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cedarnat-oliffac",
    name: "Cedarnat Oliffac",
    aliases: [
      "cedarnat oliffac",
      "cedarnat",
      "cedarnat woody amber",
      "cedarnat creamy wood",
    ],
    kind: "material",
    answer: {
      sr: "Cedarnat Oliffac je IFF woody materijal kremastog, meko teksturisanog woody-amber profila. Daje kompoziciji zaobljenost, slojevitost i glatkiji odnos između drveta i ambera.",
      en: "Cedarnat Oliffac is an IFF woody material with a creamy, softly textured woody-amber profile. It adds roundness, layered complexity and a smoother relationship between woods and amber.",
    },
    sources: [
      {
        label: "IFF — Cedarnat Oliffac",
        url: "https://www.iff.com/scent/ingredients-compendium/cedarnat-oliffac/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cedarwood-oil-extra",
    name: "Cedarwood Oil Extra",
    aliases: [
      "cedarwood oil extra",
      "cedarwood extra",
      "cedarwood balsamic sweet",
      "cupressus funebris wood oil",
    ],
    kind: "material",
    answer: {
      sr: "Cedarwood Oil Extra je IFF woody materijal cedarwood karaktera sa balsamic-sweet aspektom. Daje klasičnu drvenastu suvoću uz nešto mekšu, slatkastu balsamičnu zaobljenost.",
      en: "Cedarwood Oil Extra is an IFF woody material with cedarwood character and a balsamic-sweet aspect. It gives classical woody dryness with a softer, slightly sweet balsamic roundness.",
    },
    sources: [
      {
        label: "IFF — Cedarwood Oil Extra",
        url: "https://www.iff.com/scent/ingredients-compendium/cedarwood-oil-extra/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cedrafix",
    name: "Cedrafix",
    aliases: [
      "cedrafix",
      "cedrafix woody amber",
      "cedrafix leathery",
      "cedrafix vetiver",
    ],
    kind: "material",
    answer: {
      sr: "Cedrafix je IFF woody materijal sa woody, amber, leathery i vetivert karakterom. Vrlo je postojan i može dati ekonomičan, dugotrajan dry-woody oslonac.",
      en: "Cedrafix is an IFF woody material with woody, amber, leathery and vetiver character. It is highly substantive and can provide an economical, long-lasting dry-woody foundation.",
    },
    sources: [
      {
        label: "IFF — Cedrafix",
        url: "https://www.iff.com/scent/ingredients-compendium/cedrafix/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "lindenol",
    name: "Lindenol",
    aliases: [
      "lindenol",
      "lindenol lilac",
      "lindenol sweet floral",
      "lindenol clean floral",
    ],
    kind: "material",
    answer: {
      sr: "Lindenol je IFF floralni materijal čistog, nježnog, slatkog lilac karaktera. Koristan je kada floralnom srcu treba fina, čista i elegantna cvjetna svježina.",
      en: "Lindenol is an IFF floral material with a clean, delicate, sweet lilac character. It is useful when a floral heart needs refined, clean and elegant floral freshness.",
    },
    sources: [
      {
        label: "IFF — Lindenol",
        url: "https://www.iff.com/scent/ingredients-compendium/lindenol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "luminide",
    name: "Luminide",
    aliases: [
      "luminide",
      "luminide musk",
      "luminide powdery musk",
      "luminide clean musk",
    ],
    kind: "material",
    answer: {
      sr: "Luminide je IFF musk materijal čistog, puderastog i mekog mošusnog karaktera sa slatkim, toplim vrhom. Daje kremastu teksturu, volumen i dugotrajnu radiant-musk podršku.",
      en: "Luminide is an IFF musk material with a clean, powdery and soft musky character plus a sweet warm top note. It provides creamy texture, volume and long-lasting radiant-musk support.",
    },
    sources: [
      {
        label: "IFF — Luminide",
        url: "https://www.iff.com/scent/ingredients-compendium/luminide/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "lyral",
    name: "Lyral",
    aliases: [
      "lyral",
      "lyral floral",
      "lyral lily",
      "lyral cyclamen",
    ],
    kind: "material",
    answer: {
      sr: "Lyral je IFF floralni materijal mekog, nježnog lily, cyclamen i lilac karaktera koji podsjeća na hydroxycitronellal. Poznat je po velikoj postojanosti i difuziji kroz drydown.",
      en: "Lyral is an IFF floral material with a soft delicate lily, cyclamen and lilac character reminiscent of hydroxycitronellal. It is known for strong tenacity and diffusion through the drydown.",
    },
    sources: [
      {
        label: "IFF — Lyral",
        url: "https://www.iff.com/scent/ingredients-compendium/lyral/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ionone-alpha",
    name: "Ionone Alpha",
    aliases: [
      "ionone alpha",
      "alpha ionone",
      "ionone alpha violet",
      "ionone alpha woody floral",
    ],
    kind: "material",
    answer: {
      sr: "Ionone Alpha je violet/woody floralni materijal sa mekanim, puderastim i blago fruity karakterom. Važan je za violet, iris, woody-floral i klasične puderaste strukture.",
      en: "Ionone Alpha is a violet-woody floral material with a soft, powdery and slightly fruity character. It is important in violet, iris, woody-floral and classical powdery structures.",
    },
    sources: [
      {
        label: "IFF — Ionone Alpha",
        url: "https://www.iff.com/scent/ingredients-compendium/ionone-alpha/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ionone-beta",
    name: "Ionone Beta",
    aliases: [
      "ionone beta",
      "beta ionone",
      "ionone beta violet",
      "ionone beta raspberry",
    ],
    kind: "material",
    answer: {
      sr: "Ionone Beta je violet-woody materijal sa dubljim, tamnijim i voćnijim karakterom od Alpha varijante, često sa raspberry-like i woody facetama. Daje više težine i dubine violet/orris strukturama.",
      en: "Ionone Beta is a violet-woody material with a deeper, darker and fruitier character than the Alpha variant, often with raspberry-like and woody facets. It gives more weight and depth to violet and orris structures.",
    },
    sources: [
      {
        label: "IFF — Ionone Beta",
        url: "https://www.iff.com/scent/ingredients-compendium/ionone-beta/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "methyl-ionone-alpha",
    name: "Methyl Ionone Alpha",
    aliases: [
      "methyl ionone alpha",
      "methyl ionone alpha violet",
      "methyl ionone alpha powdery",
    ],
    kind: "material",
    answer: {
      sr: "Methyl Ionone Alpha je powdery violet/orris materijal sa elegantnim woody i floralnim karakterom. Koristi se kada treba bogatiji, postojaniji i luksuzniji iris-violet efekat.",
      en: "Methyl Ionone Alpha is a powdery violet-orris material with elegant woody and floral character. It is used when a richer, more substantive and more luxurious iris-violet effect is needed.",
    },
    sources: [
      {
        label: "IFF — Methyl Ionone Alpha",
        url: "https://www.iff.com/scent/ingredients-compendium/methyl-ionone-alpha/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cinnamyl-alcohol",
    name: "Cinnamyl Alcohol",
    aliases: [
      "cinnamyl alcohol",
      "cinnamyl alcohol hyacinth",
      "cinnamyl alcohol balsamic",
      "cinnamyl alcohol spicy floral",
    ],
    kind: "material",
    answer: {
      sr: "Cinnamyl Alcohol je spicy-floral materijal sa blagim cinnamon, hyacinth i balsamic karakterom. Daje floralnim i spicy akordima toplinu bez oštrine čistog cinnamic aldehyde profila.",
      en: "Cinnamyl Alcohol is a spicy-floral material with mild cinnamon, hyacinth and balsamic character. It gives floral and spicy accords warmth without the sharpness of a pure cinnamic-aldehyde profile.",
    },
    sources: [
      {
        label: "IFF — Cinnamyl Alcohol",
        url: "https://www.iff.com/scent/ingredients-compendium/cinnamyl-alcohol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cinnamic-aldehyde",
    name: "Cinnamic Aldehyde",
    aliases: [
      "cinnamic aldehyde",
      "cinnamaldehyde",
      "cinnamic aldehyde cinnamon",
      "cinnamaldehyde spicy",
    ],
    kind: "material",
    answer: {
      sr: "Cinnamic Aldehyde je snažan spicy materijal sa neposrednim cinnamon karakterom. Koristi se u malim dozama za cinnamon, oriental, spicy-gourmand i carnation-like efekte zbog velike snage i topline.",
      en: "Cinnamic Aldehyde is a powerful spicy material with an immediate cinnamon character. It is used at low dosage for cinnamon, oriental, spicy-gourmand and carnation-like effects because of its strength and warmth.",
    },
    sources: [
      {
        label: "IFF — Cinnamic Aldehyde",
        url: "https://www.iff.com/scent/ingredients-compendium/cinnamic-aldehyde/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "phenylacetaldehyde",
    name: "Phenylacetaldehyde",
    aliases: [
      "phenylacetaldehyde",
      "phenyl acetaldehyde",
      "phenylacetaldehyde honey",
      "phenylacetaldehyde hyacinth",
    ],
    kind: "material",
    answer: {
      sr: "Phenylacetaldehyde je floral materijal sa honey, green i hyacinth karakterom. Daje cvjetnim akordima prirodniji nectar-like ton i naročito je koristan u hyacinth, narcissus i honey-floral pravcima.",
      en: "Phenylacetaldehyde is a floral material with honey, green and hyacinth character. It gives floral accords a more natural nectar-like tone and is especially useful in hyacinth, narcissus and honey-floral directions.",
    },
    sources: [
      {
        label: "IFF — Phenylacetaldehyde",
        url: "https://www.iff.com/scent/ingredients-compendium/phenylacetaldehyde/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "benzyl-benzoate",
    name: "Benzyl Benzoate",
    aliases: [
      "benzyl benzoate",
      "benzyl benzoate balsamic",
      "benzyl benzoate floral fixative",
      "benzyl benzoate sweet balsamic",
    ],
    kind: "material",
    answer: {
      sr: "Benzyl Benzoate je blag sweet-balsamic materijal i važan nosač/fiksativ u parfimeriji. Sam po sebi je diskretan, ali daje tijelo i postojanost floralnim, balsamic i ambery strukturama.",
      en: "Benzyl Benzoate is a mild sweet-balsamic material and an important carrier-fixative in perfumery. It is relatively discreet on its own but adds body and persistence to floral, balsamic and ambery structures.",
    },
    sources: [
      {
        label: "IFF — Benzyl Benzoate",
        url: "https://www.iff.com/scent/ingredients-compendium/benzyl-benzoate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cis-3-hexenyl-acetate",
    name: "cis-3-Hexenyl Acetate",
    aliases: [
      "cis 3 hexenyl acetate",
      "cis-3-hexenyl acetate",
      "green leaf acetate",
      "cis 3 hexenyl acetate pear",
    ],
    kind: "material",
    answer: {
      sr: "cis-3-Hexenyl Acetate je green-fruity materijal sa svježim leaf karakterom i nježnim pear/fruit efektom. U odnosu na cis-3-Hexenol djeluje manje sirovo travnato, a više sočno i voćno-zeleno.",
      en: "cis-3-Hexenyl Acetate is a green-fruity material with a fresh leafy character and a soft pear-fruit effect. Compared with cis-3-Hexenol it is less raw-grassy and more juicy, fruity-green.",
    },
    sources: [
      {
        label: "IFF — cis-3-Hexenyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/cis-3-hexenyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "raspberry-ketone",
    name: "Raspberry Ketone",
    aliases: [
      "raspberry ketone",
      "raspberry ketone raspberry",
      "raspberry ketone fruity",
      "raspberry ketone jammy",
    ],
    kind: "material",
    answer: {
      sr: "Raspberry Ketone je fruity materijal sa jasnim raspberry karakterom i blagom puderasto-slatkom dubinom. Koristi se za berry, gourmand i floral-fruity akorde kada treba prepoznatljiv malina signal.",
      en: "Raspberry Ketone is a fruity material with a clear raspberry character and a slightly powdery-sweet depth. It is used in berry, gourmand and floral-fruity accords when a recognizable raspberry signal is needed.",
    },
    sources: [
      {
        label: "IFF — Raspberry Ketone",
        url: "https://www.iff.com/scent/ingredients-compendium/raspberry-ketone/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "methyl-pamplemousse",
    name: "Methyl Pamplemousse",
    aliases: [
      "methyl pamplemousse",
      "methyl pamplemousse grapefruit",
      "methyl pamplemousse citrus",
      "methyl pamplemousse bitter grapefruit",
    ],
    kind: "material",
    answer: {
      sr: "Methyl Pamplemousse je citrusni materijal izraženog grapefruit karaktera sa suvim, bitter i peel-like aspektom. Daje modernim citrusnim akordima jasniji i dugotrajniji grapefruit potpis.",
      en: "Methyl Pamplemousse is a citrus material with a pronounced grapefruit character and dry, bitter, peel-like aspects. It gives modern citrus accords a clearer and more persistent grapefruit signature.",
    },
    sources: [
      {
        label: "IFF — Methyl Pamplemousse",
        url: "https://www.iff.com/scent/ingredients-compendium/methyl-pamplemousse/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "citral",
    name: "Citral",
    aliases: [
      "citral",
      "citral lemon",
      "citral lemongrass",
      "citral aldehydic citrus",
    ],
    kind: "material",
    answer: {
      sr: "Citral je osnovni lemon-citrus materijal intenzivnog aldehydic i lemongrass karaktera. Važan je za lemon, verbena, citrus i fresh-aromatic akorde i služi kao referentna tačka za mnoge mekše citral derivate.",
      en: "Citral is a foundational lemon-citrus material with an intense aldehydic and lemongrass character. It is important in lemon, verbena, citrus and fresh-aromatic accords and serves as a reference point for many softer citral derivatives.",
    },
    sources: [
      {
        label: "IFF — Citral",
        url: "https://www.iff.com/scent/ingredients-compendium/citral/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "citronellal",
    name: "Citronellal",
    aliases: [
      "citronellal",
      "citronellal lemon",
      "citronellal citronella",
      "citronellal green citrus",
    ],
    kind: "material",
    answer: {
      sr: "Citronellal je citrusno-green materijal sa lemon i citronella karakterom i svježom herbalnom nijansom. Daje čist, prodoran i prirodno-zeleni citrusni efekat.",
      en: "Citronellal is a citrus-green material with lemon and citronella character plus a fresh herbal nuance. It gives a clean, penetrating and naturally green citrus effect.",
    },
    sources: [
      {
        label: "IFF — Citronellal",
        url: "https://www.iff.com/scent/ingredients-compendium/citronellal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ethyl-linalool",
    name: "Ethyl Linalool",
    aliases: [
      "ethyl linalool",
      "ethyl linalool floral",
      "ethyl linalool lavender",
      "ethyl linalool citrus",
    ],
    kind: "material",
    answer: {
      sr: "Ethyl Linalool je fresh floral materijal povezan sa linalool profilom, ali obično mekši i zaobljeniji u lavender-citrus pravcu. Daje prozračnost i moderan clean-floral lift.",
      en: "Ethyl Linalool is a fresh floral material related to the linalool profile, generally softer and rounder in a lavender-citrus direction. It provides airiness and a modern clean-floral lift.",
    },
    sources: [
      {
        label: "IFF — Ethyl Linalool",
        url: "https://www.iff.com/scent/ingredients-compendium/ethyl-linalool/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "dihydrolinalool",
    name: "Dihydrolinalool",
    aliases: [
      "dihydrolinalool",
      "dihydrolinalool floral",
      "dihydrolinalool lavender",
      "dihydrolinalool fresh",
    ],
    kind: "material",
    answer: {
      sr: "Dihydrolinalool je fresh floral-aromatic materijal sa čistim lavender i citrusnim aspektima. U odnosu na linalool daje stabilniji, linearniji i često svježiji clean karakter.",
      en: "Dihydrolinalool is a fresh floral-aromatic material with clean lavender and citrus aspects. Compared with linalool it gives a more stable, linear and often fresher clean character.",
    },
    sources: [
      {
        label: "IFF — Dihydrolinalool",
        url: "https://www.iff.com/scent/ingredients-compendium/dihydrolinalool/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "benzyl-acetate",
    name: "Benzyl Acetate",
    aliases: [
      "benzyl acetate",
      "benzyl acetate jasmine",
      "benzyl acetate fruity floral",
      "benzyl acetate banana",
    ],
    kind: "material",
    answer: {
      sr: "Benzyl Acetate je klasični floral-fruity materijal važan za jasmin i ylang profile, sa slatkim, voćnim i blago banana-like aspektom. Daje floralnim srcima sočnost i volumen.",
      en: "Benzyl Acetate is a classic floral-fruity material important in jasmine and ylang profiles, with sweet fruity and slightly banana-like aspects. It adds juiciness and volume to floral hearts.",
    },
    sources: [
      {
        label: "IFF — Benzyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/benzyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "benzaldehyde",
    name: "Benzaldehyde",
    aliases: [
      "benzaldehyde",
      "benzaldehyde almond",
      "benzaldehyde cherry",
      "benzaldehyde bitter almond",
    ],
    kind: "material",
    answer: {
      sr: "Benzaldehyde je klasični aroma-materijal prepoznatljiv po bitter-almond i cherry karakteru. U parfimeriji se koristi za bademaste, koštičavo-voćne, gourmand i floralne efekte, često u vrlo malim dozama zbog neposrednog potpisa.",
      en: "Benzaldehyde is a classic aroma material recognized by its bitter-almond and cherry character. In perfumery it is used for almond, stone-fruit, gourmand and floral effects, often at low dosage because of its immediate signature.",
    },
    sources: [
      {
        label: "IFF — Benzaldehyde",
        url: "https://www.iff.com/scent/ingredients-compendium/benzaldehyde/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "methyl-anthranilate",
    name: "Methyl Anthranilate",
    aliases: [
      "methyl anthranilate",
      "methyl anthranilate grape",
      "methyl anthranilate orange blossom",
      "methyl anthranilate floral",
    ],
    kind: "material",
    answer: {
      sr: "Methyl Anthranilate je floral-fruity materijal sa karakterističnim orange-blossom i grape efektom. Posebno je važan u white-floral, neroli, tuberose i fruity strukturama kojima treba slatka, tamnija floralna dubina.",
      en: "Methyl Anthranilate is a floral-fruity material with a characteristic orange-blossom and grape effect. It is especially important in white-floral, neroli, tuberose and fruity structures that need sweet, darker floral depth.",
    },
    sources: [
      {
        label: "IFF — Methyl Anthranilate",
        url: "https://www.iff.com/scent/ingredients-compendium/methyl-anthranilate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "phenyl-ethyl-alcohol",
    name: "Phenyl Ethyl Alcohol",
    aliases: [
      "phenyl ethyl alcohol",
      "phenethyl alcohol",
      "pea rose alcohol",
      "phenyl ethyl alcohol rose",
    ],
    kind: "material",
    answer: {
      sr: "Phenyl Ethyl Alcohol je jedan od osnovnih rose building-block materijala sa mekanim, svježim i prirodno ružičastim karakterom. Daje volumen floralnim akordima bez pretjerane težine i često služi kao nosač prirodnog rose utiska.",
      en: "Phenyl Ethyl Alcohol is a fundamental rose building block with a soft, fresh and naturally rosy character. It gives volume to floral accords without excessive weight and often supports a natural rose impression.",
    },
    sources: [
      {
        label: "IFF — Phenyl Ethyl Alcohol",
        url: "https://www.iff.com/scent/ingredients-compendium/phenyl-ethyl-alcohol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "benzyl-salicylate",
    name: "Benzyl Salicylate",
    aliases: [
      "benzyl salicylate",
      "benzyl salicylate floral",
      "benzyl salicylate balsamic",
      "benzyl salicylate solar",
    ],
    kind: "material",
    answer: {
      sr: "Benzyl Salicylate je blag, postojan floralno-balsamični materijal koji se često koristi kao volumen i fiksativ u white-floral, solar i ambery strukturama. Njegov karakter je mek, topao i relativno tih, ali daje tijelo kompoziciji.",
      en: "Benzyl Salicylate is a mild, substantive floral-balsamic material often used for volume and fixation in white-floral, solar and ambery structures. Its character is soft, warm and relatively quiet, but it adds body to a composition.",
    },
    sources: [
      {
        label: "IFF — Benzyl Salicylate",
        url: "https://www.iff.com/scent/ingredients-compendium/benzyl-salicylate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "hydroxycitronellal",
    name: "Hydroxycitronellal",
    aliases: [
      "hydroxycitronellal",
      "hydroxycitronellal muguet",
      "hydroxycitronellal lily of the valley",
      "hydroxycitronellal floral",
    ],
    kind: "material",
    answer: {
      sr: "Hydroxycitronellal je istorijski ključni muguet materijal sa mekanim lily-of-the-valley, floralnim i blago citrusnim karakterom. Važan je za razumijevanje klasične muguet konstrukcije i razvoja savremenih zamjena i varijacija tog profila.",
      en: "Hydroxycitronellal is a historically important muguet material with a soft lily-of-the-valley, floral and slightly citrus character. It is important for understanding classical muguet construction and the development of modern alternatives and variations.",
    },
    sources: [
      {
        label: "IFF — Hydroxycitronellal",
        url: "https://www.iff.com/scent/ingredients-compendium/hydroxycitronellal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "linalyl-acetate",
    name: "Linalyl Acetate",
    aliases: [
      "linalyl acetate",
      "linalyl acetate bergamot",
      "linalyl acetate lavender",
      "linalyl acetate floral citrus",
    ],
    kind: "material",
    answer: {
      sr: "Linalyl Acetate je jedan od ključnih fresh floral-citrus materijala i važna komponenta profila bergamotke i lavande. Daje svježinu, mekoću i elegantan aromatic lift, naročito u cologne, fougère i citrusnim kompozicijama.",
      en: "Linalyl Acetate is a key fresh floral-citrus material and an important contributor to bergamot and lavender profiles. It provides freshness, softness and an elegant aromatic lift, especially in cologne, fougère and citrus compositions.",
    },
    sources: [
      {
        label: "IFF — Linalyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/linalyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "isobornyl-acetate",
    name: "Isobornyl Acetate",
    aliases: [
      "isobornyl acetate",
      "isobornyl acetate pine",
      "isobornyl acetate camphor",
      "isobornyl acetate woody",
    ],
    kind: "material",
    answer: {
      sr: "Isobornyl Acetate je woody-aromatic materijal sa pine, camphoraceous i balsamic karakterom. Daje suvu četinarsku svježinu i koristi se za pine, fougère, herbal i klasične woody strukture.",
      en: "Isobornyl Acetate is a woody-aromatic material with pine, camphoraceous and balsamic character. It gives dry coniferous freshness and is used in pine, fougère, herbal and classical woody structures.",
    },
    sources: [
      {
        label: "IFF — Isobornyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/isobornyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "terpinyl-acetate",
    name: "Terpinyl Acetate",
    aliases: [
      "terpinyl acetate",
      "terpinyl acetate lavender",
      "terpinyl acetate herbal",
      "terpinyl acetate bergamot",
    ],
    kind: "material",
    answer: {
      sr: "Terpinyl Acetate je fresh aromatic materijal sa herbal, lavender i citrusnim aspektima. Daje uredan, svjež i klasično parfemski lift u cologne, fougère, lavender i green strukturama.",
      en: "Terpinyl Acetate is a fresh aromatic material with herbal, lavender and citrus aspects. It gives a clean, fresh and classically perfumery lift in cologne, fougère, lavender and green structures.",
    },
    sources: [
      {
        label: "IFF — Terpinyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/terpinyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cyclabute",
    name: "Cyclabute",
    aliases: [
      "cyclabute",
      "cyclabute pineapple",
      "cyclabute peach mango",
      "cyclabute chocolate amber",
    ],
    kind: "material",
    answer: {
      sr: "Cyclabute je IFF fruity materijal sa pineapple, peach i mango top-note karakterom, uz amber i chocolate nijanse. Daje egzotično voće sa nešto tamnijim, toplijim drydownom.",
      en: "Cyclabute is an IFF fruity material with pineapple, peach and mango top-note character plus amber and chocolate nuances. It gives exotic fruit a somewhat darker, warmer drydown.",
    },
    sources: [
      {
        label: "IFF — Cyclabute",
        url: "https://www.iff.com/scent/ingredients-compendium/cyclabute/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "dihydro-cyclacet",
    name: "Dihydro Cyclacet",
    aliases: [
      "dihydro cyclacet",
      "dihydro cyclacet basil",
      "dihydro cyclacet green herbal",
    ],
    kind: "material",
    answer: {
      sr: "Dihydro Cyclacet je IFF herbal materijal vrlo snažnog green-herbal karaktera koji više podsjeća na basil oil nego na klasični Cyclacet profil. Daje intenzivan aromatično-zeleni signal.",
      en: "Dihydro Cyclacet is a very powerful IFF herbal material with a green-herbal character closer to basil oil than to the classic Cyclacet profile. It gives an intense aromatic-green signal.",
    },
    sources: [
      {
        label: "IFF — Dihydro Cyclacet",
        url: "https://www.iff.com/scent/ingredients-compendium/dihydro-cyclacet/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "dihydro-terpineol",
    name: "Dihydro Terpineol",
    aliases: [
      "dihydro terpineol",
      "dihydro terpineol pine",
      "dihydro terpineol lime",
      "dihydro terpineol earthy green",
    ],
    kind: "material",
    answer: {
      sr: "Dihydro Terpineol je IFF floralni materijal izuzetno snažnog pine, earthy, green i lime karaktera. Koristan je kada treba hladan, oštar i veoma prodoran fresh-green efekat.",
      en: "Dihydro Terpineol is an extremely powerful IFF floral material with pine, earthy, green and lime character. It is useful when a cool, sharp and highly penetrating fresh-green effect is needed.",
    },
    sources: [
      {
        label: "IFF — Dihydro Terpineol",
        url: "https://www.iff.com/scent/ingredients-compendium/dihydro-terpineol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "dihydro-terpinyl-acetate",
    name: "Dihydro Terpinyl Acetate",
    aliases: [
      "dihydro terpinyl acetate",
      "dihydro terpinyl acetate woody",
      "dihydro terpinyl acetate cologne",
    ],
    kind: "material",
    answer: {
      sr: "Dihydro Terpinyl Acetate je IFF herbal materijal svježeg woody i cologne-like karaktera. Daje čist, jednostavan i klasično svjež aromatično-drvenasti ton.",
      en: "Dihydro Terpinyl Acetate is an IFF herbal material with a fresh woody and cologne-like character. It gives a clean, simple and classically fresh aromatic-woody tone.",
    },
    sources: [
      {
        label: "IFF — Dihydro Terpinyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/dihydro-terpinyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "dimethyl-octanol",
    name: "Dimethyl Octanol",
    aliases: [
      "dimethyl octanol",
      "dimethyl octanol citronellol",
      "dimethyl octanol minty",
    ],
    kind: "material",
    answer: {
      sr: "Dimethyl Octanol je IFF floralni materijal donekle sličan Citronellolu, ali teži i minty. Daje floralnim strukturama svježinu uz nešto puniji i hladniji profil.",
      en: "Dimethyl Octanol is an IFF floral material somewhat similar to Citronellol but heavier and more minty. It gives floral structures freshness with a fuller, cooler profile.",
    },
    sources: [
      {
        label: "IFF — Dimethyl Octanol",
        url: "https://www.iff.com/scent/ingredients-compendium/dimethyl-octanol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "dimethyl-phenyl-ethyl-carbinyl-acetate",
    name: "Dimethyl Phenyl Ethyl Carbinyl Acetate",
    aliases: [
      "dimethyl phenyl ethyl carbinyl acetate",
      "dpec acetate",
      "sweet floral leafy balsamic",
    ],
    kind: "material",
    answer: {
      sr: "Dimethyl Phenyl Ethyl Carbinyl Acetate je IFF floralni materijal postojanog sweet-floral karaktera sa leafy kvalitetom i bogatim balsamic tonom. Daje cvjetnim bazama dubinu i meku balsamičnu trajnost.",
      en: "Dimethyl Phenyl Ethyl Carbinyl Acetate is an IFF floral material with a persistent sweet-floral character, leafy qualities and a rich balsamic tone. It gives floral bases depth and soft balsamic persistence.",
    },
    sources: [
      {
        label: "IFF — Dimethyl Phenyl Ethyl Carbinyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/dimethyl-phenyl-ethyl-carbinyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "dulcinyl-recrystallized",
    name: "Dulcinyl Recrystallized",
    aliases: [
      "dulcinyl recrystallized",
      "dulcinyl",
      "dulcinyl raspberry",
      "dulcinyl cotton candy",
    ],
    kind: "material",
    answer: {
      sr: "Dulcinyl Recrystallized je IFF fruity materijal ekstremno slatkog karaktera koji podsjeća na raspberry, cotton candy i blackberry jam, uz cassis i heliotrope asocijacije.",
      en: "Dulcinyl Recrystallized is an IFF fruity material with an extremely sweet character reminiscent of raspberry, cotton candy and blackberry jam, with cassis and heliotrope associations.",
    },
    sources: [
      {
        label: "IFF — Dulcinyl Recrystallized",
        url: "https://www.iff.com/scent/ingredients-compendium/dulcinyl-recrystallized/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "starfleur",
    name: "Starfleur",
    aliases: [
      "starfleur",
      "starfleur muguet",
      "starfleur freesia",
      "starfleur transparent floral",
    ],
    kind: "material",
    answer: {
      sr: "Starfleur je IFF floralni materijal svježeg, vrlo efikasnog floral-green, muguet i freesia karaktera sa aldehydic i transparentnim efektom. Posebno dobro zaokružuje green-aldehydic muguet strukture.",
      en: "Starfleur is an IFF floral material with a fresh, high-performing floral-green, muguet and freesia character plus an aldehydic transparent effect. It is especially useful for rounding green-aldehydic muguet structures.",
    },
    sources: [
      {
        label: "IFF — Starfleur",
        url: "https://www.iff.com/scent/ingredients-compendium/starfleur/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "citronellyl-acetate",
    name: "Citronellyl Acetate",
    aliases: [
      "citronellyl acetate",
      "citronellyl acetate rose",
      "citronellyl acetate citrus",
      "citronellyl acetate fruity",
    ],
    kind: "material",
    answer: {
      sr: "Citronellyl Acetate je IFF fruity materijal sa blagim rose karakterom i svježim citrusno-voćnim facetama. Koristan je kada floralnom akordu treba lakši, sočniji i manje težak rose-citrus prelaz.",
      en: "Citronellyl Acetate is an IFF fruity material with a slight rose character and fresh citrus-fruity facets. It is useful when a floral accord needs a lighter, juicier and less heavy rose-citrus transition.",
    },
    sources: [
      {
        label: "IFF — Citronellyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/citronellyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "clonal",
    name: "Clonal",
    aliases: [
      "clonal",
      "clonal orange peel",
      "clonal grapefruit",
      "clonal aldehydic",
    ],
    kind: "material",
    answer: {
      sr: "Clonal je IFF citrusni materijal suvog orange-peel karaktera sa ozonic, metallic, aldehydic, zesty i grapefruit facetama. Daje suvlji, prodorniji citrusni signal i odličnu stabilnost.",
      en: "Clonal is an IFF citrus material with a dry orange-peel character plus ozonic, metallic, aldehydic, zesty and grapefruit facets. It gives a drier, more penetrating citrus signal with excellent stability.",
    },
    sources: [
      {
        label: "IFF — Clonal",
        url: "https://www.iff.com/scent/ingredients-compendium/clonal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cortex-aldehyde-50-tec",
    name: "Cortex Aldehyde 50% TEC",
    aliases: [
      "cortex aldehyde 50",
      "cortex aldehyde 50 tec",
      "cortex stem floral",
    ],
    kind: "material",
    answer: {
      sr: "Cortex Aldehyde 50% TEC je IFF green materijal sa stem-like i flower-shop karakterom. U parfemima daje outdoors efekat, svježinu i realističnu zelenu vezu između stabljike i cvijeta.",
      en: "Cortex Aldehyde 50% TEC is an IFF green material with stem-like and flower-shop character. In fragrance it gives an outdoors effect, freshness and a realistic green connection between stem and flower.",
    },
    sources: [
      {
        label: "IFF — Cortex Aldehyde 50% TEC",
        url: "https://www.iff.com/scent/ingredients-compendium/cortex-aldehyde-50-tec/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cp-formate-aphermate",
    name: "CP Formate Aphermate",
    aliases: [
      "cp formate aphermate",
      "cp formate",
      "aphermate",
      "cp formate apple",
    ],
    kind: "material",
    answer: {
      sr: "CP Formate Aphermate je IFF fruity materijal sa fresh pine, herbal, earthy i seashore kompleksom koji pri nižim koncentracijama pokazuje fruity-apple aspekt. Dobar je za neobične svježe i prirodno-zelene voćne prelaze.",
      en: "CP Formate Aphermate is an IFF fruity material with a fresh pine, herbal, earthy and seashore complex that shows fruity apple aspects at low concentration. It is useful for unusual fresh and naturally green fruit transitions.",
    },
    sources: [
      {
        label: "IFF — CP Formate Aphermate",
        url: "https://www.iff.com/scent/ingredients-compendium/cp-formate-aphermate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cuminyl-acetate",
    name: "Cuminyl Acetate",
    aliases: [
      "cuminyl acetate",
      "cuminyl acetate herbaceous",
      "cuminyl acetate sweet woody",
    ],
    kind: "material",
    answer: {
      sr: "Cuminyl Acetate je IFF fruity materijal herbaceous i sweet karaktera sa blagim woody facetama. Daje voćnim i aromatičnim strukturama topliji i manje očigledno sladak profil.",
      en: "Cuminyl Acetate is an IFF fruity material with herbaceous and sweet character plus slight woody facets. It gives fruity and aromatic structures a warmer and less obviously sweet profile.",
    },
    sources: [
      {
        label: "IFF — Cuminyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/cuminyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cuminyl-alcohol",
    name: "Cuminyl Alcohol",
    aliases: [
      "cuminyl alcohol",
      "cuminyl alcohol caraway",
      "cuminyl alcohol spicy",
      "cuminyl alcohol herbal",
    ],
    kind: "material",
    answer: {
      sr: "Cuminyl Alcohol je IFF spicy materijal toplog začinskog, herbaceous i caraway karaktera. Koristan je za aromatične i spicy akorde kojima treba suv, topao i jasno biljni začinski signal.",
      en: "Cuminyl Alcohol is an IFF spicy material with warm spicy, herbaceous and caraway character. It is useful for aromatic and spicy accords that need a dry, warm and clearly herbal-spicy signal.",
    },
    sources: [
      {
        label: "IFF — Cuminyl Alcohol",
        url: "https://www.iff.com/scent/ingredients-compendium/cuminyl-alcohol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cyclemax",
    name: "Cyclemax",
    aliases: [
      "cyclemax",
      "cyclemax muguet",
      "cyclemax melon",
      "cyclemax watery floral",
    ],
    kind: "material",
    answer: {
      sr: "Cyclemax je IFF floralni materijal fresh muguet karaktera sa fruity-melon nijansom. Vrlo je difuzan i posebno koristan za lily, cyclamen, watery, ozonic i clean-muguet strukture.",
      en: "Cyclemax is an IFF floral material with fresh muguet character and a fruity melon nuance. It is highly diffusive and especially useful in lily, cyclamen, watery, ozonic and clean-muguet structures.",
    },
    sources: [
      {
        label: "IFF — Cyclemax",
        url: "https://www.iff.com/scent/ingredients-compendium/cyclemax/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "edenolide",
    name: "Edenolide",
    aliases: [
      "edenolide",
      "edenolide musk",
      "edenolide creamy musk",
      "edenolide green apple",
    ],
    kind: "material",
    answer: {
      sr: "Edenolide je IFF white-musk materijal puderastog, kremastog, toplog i opušteno senzualnog karaktera, uz svježe fruity nijanse. Može da doda soft green-apple ton i linearan musk potpis kroz čitavu kompoziciju.",
      en: "Edenolide is an IFF white-musk material with powdery, creamy, warm and relaxed sensual character plus fresh fruity nuances. It can add a soft green-apple tone and a linear musk signature throughout a composition.",
    },
    sources: [
      {
        label: "IFF — Edenolide",
        url: "https://www.iff.com/scent/ingredients-compendium/edenolide/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "auralva",
    name: "Auralva",
    aliases: [
      "auralva",
      "auralva neroli",
      "auralva orange muguet",
      "auralva grape",
    ],
    kind: "material",
    answer: {
      sr: "Auralva je IFF floralni materijal koji spaja neroli, orange, muguet i grape facete. Dobar je kao most između citrusnog vrha i čistog floralnog srca, naročito kada treba svjetliji i transparentniji cvjetni efekat.",
      en: "Auralva is an IFF floral material combining neroli, orange, muguet and grape facets. It works as a bridge between a citrus top and a clean floral heart, especially when a brighter and more transparent floral effect is needed.",
    },
    sources: [
      {
        label: "IFF — Auralva",
        url: "https://www.iff.com/scent/ingredients-compendium/auralva/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "bicyclononalactone",
    name: "Bicyclononalactone",
    aliases: [
      "bicyclononalactone",
      "bicyclononalactone coumarin",
      "bicyclononalactone tonka",
      "bicyclononalactone hay",
    ],
    kind: "material",
    answer: {
      sr: "Bicyclononalactone je IFF powdery materijal sa Tonka, almond, vanilla, coumarin, hay i coconut karakterom. Posebno je koristan kao stabilnija alternativa za coumarin-like efekat u puderastim i tonka strukturama.",
      en: "Bicyclononalactone is an IFF powdery material with tonka, almond, vanilla, coumarin, hay and coconut character. It is especially useful as a more stable alternative for coumarin-like effects in powdery and tonka structures.",
    },
    sources: [
      {
        label: "IFF — Bicyclononalactone",
        url: "https://www.iff.com/scent/ingredients-compendium/bicyclononalactone/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "canthoxal",
    name: "Canthoxal",
    aliases: [
      "canthoxal",
      "canthoxal licorice",
      "canthoxal basil fennel",
      "canthoxal anise",
    ],
    kind: "material",
    answer: {
      sr: "Canthoxal je IFF herbal materijal sa licorice, basil, fennel i anise profilom, uz blagu fruity i watery modifikaciju. Daje aromatičnim i herbalnim akordima neobičnu slatko-začinsku svježinu.",
      en: "Canthoxal is an IFF herbal material with licorice, basil, fennel and anise character plus slight fruity and watery modification. It gives aromatic and herbal accords an unusual sweet-spicy freshness.",
    },
    sources: [
      {
        label: "IFF — Canthoxal",
        url: "https://www.iff.com/scent/ingredients-compendium/canthoxal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cashmeran-velvet",
    name: "Cashmeran Velvet",
    aliases: [
      "cashmeran velvet",
      "cashmeran velvet amber",
      "cashmeran velvet woody",
      "cashmeran velvet spicy",
    ],
    kind: "material",
    answer: {
      sr: "Cashmeran Velvet je IFF amber materijal difuznog spicy, woody i ambery karaktera sa izraženim rounding i smoothing efektom. Koristi se kada bazi treba mekši, glađi i puniji woody-amber osjećaj.",
      en: "Cashmeran Velvet is an IFF amber material with a diffusive spicy, woody and ambery character plus strong rounding and smoothing properties. It is used when a base needs a softer, smoother and fuller woody-amber feel.",
    },
    sources: [
      {
        label: "IFF — Cashmeran Velvet",
        url: "https://www.iff.com/scent/ingredients-compendium/cashmeran-velvet/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cedryl-acetate",
    name: "Cedryl Acetate",
    aliases: [
      "cedryl acetate",
      "cedryl acetate cedar",
      "cedryl acetate vetiver",
      "cedryl acetate sweet woody",
    ],
    kind: "material",
    answer: {
      sr: "Cedryl Acetate je IFF woody materijal laganog cedar i vetiver karaktera sa slatkim woody tonom i vrlo dobrom postojanošću. Daje suvu, urednu i klasičnu drvenastu bazu bez previše grubosti.",
      en: "Cedryl Acetate is an IFF woody material with light cedar and vetiver character, a sweet woody tone and very good longevity. It gives a dry, polished and classical woody base without excessive harshness.",
    },
    sources: [
      {
        label: "IFF — Cedryl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/cedryl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "celestolide",
    name: "Celestolide",
    aliases: [
      "celestolide",
      "celestolide musk",
      "celestolide warm musk",
      "celestolide rich musk",
    ],
    kind: "material",
    answer: {
      sr: "Celestolide je IFF musk materijal toplog mošusnog karaktera sa sjajem, bogatstvom i snagom. Daje bazi puniji, zaobljeniji i jasno prisutan musk potpis.",
      en: "Celestolide is an IFF musk material with a warm musky character combining brilliance, richness and strength. It gives the base a fuller, rounder and clearly present musk signature.",
    },
    sources: [
      {
        label: "IFF — Celestolide",
        url: "https://www.iff.com/scent/ingredients-compendium/celestolide/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "citrolate",
    name: "Citrolate",
    aliases: [
      "citrolate",
      "citrolate grapefruit",
      "citrolate bitter orange",
      "citrolate melon",
    ],
    kind: "material",
    answer: {
      sr: "Citrolate je IFF citrusni materijal sa grapefruit karakterom koji podsjeća na suve facete bitter-orange ulja i ima blagu melon nijansu. Posebno je koristan u cologne strukturama kada treba smanjiti candy-sweet utisak narandže i limuna.",
      en: "Citrolate is an IFF citrus material with a grapefruit character reminiscent of the dry facets of bitter-orange oil plus a slight melon nuance. It is especially useful in cologne structures when the candy-sweet impression of orange and lemon needs to be reduced.",
    },
    sources: [
      {
        label: "IFF — Citrolate",
        url: "https://www.iff.com/scent/ingredients-compendium/citrolate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "coniferan-pure",
    name: "Coniferan Pure",
    aliases: [
      "coniferan pure",
      "coniferan",
      "coniferan cedarwood",
      "coniferan camphor",
    ],
    kind: "material",
    answer: {
      sr: "Coniferan Pure je IFF woody materijal sa fresh, clean i cooling balsamic karakterom, uz cedarwood i sweet-camphor nijanse. Daje čist, suv i hladniji drvenasti efekat.",
      en: "Coniferan Pure is an IFF woody material with a fresh, clean and cooling balsamic character plus cedarwood and sweet-camphor nuances. It gives a clean, dry and cooler woody effect.",
    },
    sources: [
      {
        label: "IFF — Coniferan Pure",
        url: "https://www.iff.com/scent/ingredients-compendium/coniferan-pure/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "agrumea",
    name: "Agrumea",
    aliases: [
      "agrumea",
      "agrumea green floral",
      "agrumea orange flower",
    ],
    kind: "material",
    answer: {
      sr: "Agrumea je IFF green-floral materijal svježeg zelenog i slatkog floralnog karaktera sa jasnim orange-flower efektom. Daje citrusno-cvjetnu svježinu bez oslanjanja na klasični neroli profil.",
      en: "Agrumea is an IFF green-floral material with a fresh green, sweet floral character and a clear orange-flower effect. It adds citrus-floral freshness without relying on a classic neroli profile.",
    },
    sources: [
      {
        label: "IFF — Agrumea",
        url: "https://www.iff.com/scent/ingredients-compendium/agrumea/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "vivaldie",
    name: "Vivaldie",
    aliases: [
      "vivaldie",
      "vivaldie green floral",
      "vivaldie flower shop",
      "vivaldie vegetable",
    ],
    kind: "material",
    answer: {
      sr: "Vivaldie je IFF green materijal svježeg floralnog flower-shop karaktera sa vegetable i fruity aspektima. Daje realističnu vlažnu zelenost i osjećaj svježeg rezanog bilja i cvijeća.",
      en: "Vivaldie is an IFF green material with a fresh floral flower-shop character plus vegetable and fruity aspects. It gives realistic damp greenness and the impression of freshly cut plant material and flowers.",
    },
    sources: [
      {
        label: "IFF — Vivaldie",
        url: "https://www.iff.com/scent/ingredients-compendium/vivaldie/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ylanganate",
    name: "Ylanganate",
    aliases: [
      "ylanganate",
      "ylanganate white floral",
      "ylanganate orange flower",
      "ylanganate ylang",
    ],
    kind: "material",
    answer: {
      sr: "Ylanganate je IFF floralni booster za white-floral note, posebno orange flower, ylang i gardenia pravce. Pojačava sjaj i kremastost floralnih akorda i ne diskolorira formulu.",
      en: "Ylanganate is an IFF floral booster for white-floral notes, especially orange flower, ylang and gardenia directions. It enhances brightness and creaminess in floral accords without discoloring the formula.",
    },
    sources: [
      {
        label: "IFF — Ylanganate",
        url: "https://www.iff.com/scent/ingredients-compendium/ylanganate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "violiff",
    name: "Violiff",
    aliases: [
      "violiff",
      "violiff violet leaf",
      "violiff tagette",
      "violiff banana",
    ],
    kind: "material",
    answer: {
      sr: "Violiff je IFF floralni materijal sa violet-leaf, green i tagette karakterom uz fruity banana nijansu. Daje živahan, moderan spoj zelenih listova i voćne cvjetnosti.",
      en: "Violiff is an IFF floral material with violet-leaf, green and tagette character plus a fruity banana nuance. It creates a vivid modern bridge between green leaves and fruity floralcy.",
    },
    sources: [
      {
        label: "IFF — Violiff",
        url: "https://www.iff.com/scent/ingredients-compendium/violiff/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ambermor",
    name: "Ambermor",
    aliases: [
      "ambermor",
      "ambermor woody amber",
      "ambermor earthy musk",
      "ambermor animalic",
    ],
    kind: "material",
    answer: {
      sr: "Ambermor je IFF amber materijal snažnog woody-amber karaktera sa sweet-earthy i musky aspektima i nježnom animalic tonalnošću. Daje dubinu i dugotrajan ambery potpis bazi.",
      en: "Ambermor is an IFF amber material with a strong woody-amber character, sweet-earthy and musky aspects and a delicate animalic tonality. It adds depth and a long-lasting ambery signature to the base.",
    },
    sources: [
      {
        label: "IFF — Ambermor",
        url: "https://www.iff.com/scent/ingredients-compendium/ambermor/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "andrane",
    name: "Andrane",
    aliases: [
      "andrane",
      "andrane precious wood",
      "andrane ambergris tobacco",
      "andrane cedar sandalwood",
    ],
    kind: "material",
    answer: {
      sr: "Andrane je IFF woody materijal precious-wood karaktera koji podsjeća na ambergris, tobacco, cedarwood i sandalwood. Snažan je i stabilan i može da podrži artificial-patchouli i klasične drvenaste strukture.",
      en: "Andrane is an IFF woody material with a precious-wood character reminiscent of ambergris, tobacco, cedarwood and sandalwood. It is powerful and stable and can support artificial-patchouli and classical woody structures.",
    },
    sources: [
      {
        label: "IFF — Andrane",
        url: "https://www.iff.com/scent/ingredients-compendium/andrane/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "citronellyl-formate",
    name: "Citronellyl Formate",
    aliases: [
      "citronellyl formate",
      "citronellyl formate grapefruit",
      "citronellyl formate citrus",
    ],
    kind: "material",
    answer: {
      sr: "Citronellyl Formate je IFF fruity-citrus materijal sa svježim citrusnim i grapefruit-rind karakterom sličnim limonenu. Koristan je za suvlji, prirodniji citrusni lift u vrhu.",
      en: "Citronellyl Formate is an IFF fruity-citrus material with a fresh citrus and grapefruit-rind character similar to limonene. It is useful for a drier, more natural citrus lift in the top note.",
    },
    sources: [
      {
        label: "IFF — Citronellyl Formate",
        url: "https://www.iff.com/scent/ingredients-compendium/citronellyl-formate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "citronellol-700",
    name: "Citronellol 700",
    aliases: [
      "citronellol 700",
      "citronellol 700 rose",
      "citronellol 700 geranium",
    ],
    kind: "material",
    answer: {
      sr: "Citronellol 700 je IFF floralni materijal sa rose i geranium karakterom, waxy tonom, blagim citrusnim i soft-powdery facetama. Predstavlja koristan kontrast čistijem Citronellol 950 profilu.",
      en: "Citronellol 700 is an IFF floral material with rose and geranium character, a waxy tone, slight citrus facets and soft powdery nuances. It provides a useful contrast to the cleaner Citronellol 950 profile.",
    },
    sources: [
      {
        label: "IFF — Citronellol 700",
        url: "https://www.iff.com/scent/ingredients-compendium/citronellol-700/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "iso-cyclo-citral",
    name: "Iso Cyclo Citral",
    aliases: [
      "iso cyclo citral",
      "iso cyclo citral leafy",
      "iso cyclo citral fougere",
    ],
    kind: "material",
    answer: {
      sr: "Iso Cyclo Citral je IFF green aldehydic materijal oštrog leafy karaktera. Posebno je koristan u fougère strukturama i hyacinth/sweet-pea kompozicijama kada treba precizan zeleni rez.",
      en: "Iso Cyclo Citral is an IFF green aldehydic material with a sharp leafy character. It is especially useful in fougère structures and hyacinth or sweet-pea compositions when a precise green cut is needed.",
    },
    sources: [
      {
        label: "IFF — Iso Cyclo Citral",
        url: "https://www.iff.com/scent/ingredients-compendium/iso-cyclo-citral/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "citral-dimethyl-acetal",
    name: "Citral Dimethyl Acetal",
    aliases: [
      "citral dimethyl acetal",
      "citral acetal",
      "citral dimethyl acetal lemon",
      "citral dimethyl acetal verbena",
    ],
    kind: "material",
    answer: {
      sr: "Citral Dimethyl Acetal je IFF citrusni materijal lemon-verbena karaktera. Miris mu je blaži i prirodniji od samog citrala, pa daje zaobljeniji citrusni signal.",
      en: "Citral Dimethyl Acetal is an IFF citrus material with a lemon-verbena character. Its odor is milder and more natural than citral itself, giving a more rounded citrus signal.",
    },
    sources: [
      {
        label: "IFF — Citral Dimethyl Acetal",
        url: "https://www.iff.com/scent/ingredients-compendium/citral-dimethyl-acetal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "verbenal",
    name: "Verbenal",
    aliases: [
      "verbenal",
      "verbenal lemongrass",
      "verbenal aldehydic citrus",
    ],
    kind: "material",
    answer: {
      sr: "Verbenal je IFF citrusni materijal intenzivnog juicy aldehydic lemongrass karaktera sa prirodnim citronellol, citral i linalool facetama. Daje snažan, pjenušav citrusno-zeleni vrh.",
      en: "Verbenal is an IFF citrus material with an intense juicy aldehydic lemongrass character and natural citronellol, citral and linalool facets. It gives a powerful sparkling citrus-green top note.",
    },
    sources: [
      {
        label: "IFF — Verbenal",
        url: "https://www.iff.com/scent/ingredients-compendium/verbenal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "citronellyl-propionate",
    name: "Citronellyl Propionate",
    aliases: [
      "citronellyl propionate",
      "citronellyl propionate rose",
      "citronellyl propionate fruity floral",
    ],
    kind: "material",
    answer: {
      sr: "Citronellyl Propionate je IFF floralni ester svježeg rose-floral karaktera sa fruity-sweet facetama. Daje lakšu, sočniju ružinu mekoću u floralnim akordima.",
      en: "Citronellyl Propionate is an IFF floral ester with fresh rose-floral character and fruity-sweet facets. It gives a lighter, juicier rose softness to floral accords.",
    },
    sources: [
      {
        label: "IFF — Citronellyl Propionate",
        url: "https://www.iff.com/scent/ingredients-compendium/citronellyl-propionate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "nerol-900",
    name: "Nerol 900",
    aliases: [
      "nerol 900",
      "nerol 900 rose citrus",
      "nerol 900 pear ozone",
    ],
    kind: "material",
    answer: {
      sr: "Nerol 900 je IFF floralni materijal slatkog fresh citrus-rose i geranium karaktera, sa citral, verbena, ozone i pear nijansama. Dobar je most između citrusnih, floralnih i voćnih vrhova.",
      en: "Nerol 900 is an IFF floral material with sweet fresh citrus-rose and geranium character plus citral, verbena, ozone and pear nuances. It is a useful bridge between citrus, floral and fruity top notes.",
    },
    sources: [
      {
        label: "IFF — Nerol 900",
        url: "https://www.iff.com/scent/ingredients-compendium/nerol-900/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cinnamalva",
    name: "Cinnamalva",
    aliases: [
      "cinnamalva",
      "cinnamalva cinnamon",
      "cinnamalva spicy",
    ],
    kind: "material",
    answer: {
      sr: "Cinnamalva je IFF spicy materijal cinnamon-like karaktera sa većim intenzitetom i hemijskom stabilnošću od Cinnamic Aldehyde profila. Daje čist i pouzdan začinski signal.",
      en: "Cinnamalva is an IFF spicy material with a cinnamon-like character, higher odor intensity and greater chemical stability than a Cinnamic Aldehyde profile. It gives a clean and reliable spicy signal.",
    },
    sources: [
      {
        label: "IFF — Cinnamalva",
        url: "https://www.iff.com/scent/ingredients-compendium/cinnamalva/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "pomarina",
    name: "Pomarina",
    aliases: [
      "pomarina",
      "pomarina molecule",
      "pomarina apple pear",
      "pomarina fig",
    ],
    kind: "material",
    answer: {
      sr: "Pomarina™ je IFF fruity-green materijal sa čistim apple i pear karakterom, prirodnim fig aspektom i banana drydownom. Daje vrlo svetao, sočan i dugotrajniji voćni lift i dobro radi u tea, green, aromatic i fresh-spicy strukturama.",
      en: "Pomarina™ is an IFF fruity-green material with clean apple and pear character, a natural fig aspect and a banana drydown. It gives a bright, juicy and relatively long-lasting fruit lift and works well in tea, green, aromatic and fresh-spicy structures.",
    },
    sources: [
      {
        label: "IFF — Pomarina",
        url: "https://www.iff.com/scent/ingredients-compendium/pomarina/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "damascone-alpha",
    name: "Damascone Alpha",
    aliases: [
      "damascone alpha",
      "alpha damascone",
      "damascone alpha rose",
      "damascone alpha blackcurrant",
    ],
    kind: "material",
    answer: {
      sr: "Damascone Alpha je IFF rose-ketone materijal sofisticovanog floral-fruity karaktera sa prirodnom ružom, kompleksnom jabukom, mint nijansom, blackcurrant efektom i plum podtonom.",
      en: "Damascone Alpha is an IFF rose-ketone material with a sophisticated floral-fruity character combining natural rose, complex apple, a mint nuance, blackcurrant and plum undertones.",
    },
    sources: [
      {
        label: "IFF — Damascone Alpha",
        url: "https://www.iff.com/scent/ingredients-compendium/damascone-alpha/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "damascone-beta",
    name: "Damascone Beta",
    aliases: [
      "damascone beta",
      "beta damascone",
      "damascone beta tobacco",
      "damascone beta plum",
    ],
    kind: "material",
    answer: {
      sr: "Damascone Beta je IFF fruity-floral rose-ketone sa svežim, zelenim i woody aspektima. Ima izražene plum, honey, tobacco i blackcurrant podtonove, pa može da poveže ružu sa tamnijim voćnim i duvanskim akordima.",
      en: "Damascone Beta is an IFF fruity-floral rose ketone with fresh, green and woody aspects. It carries plum, honey, tobacco and blackcurrant undertones, linking rose to darker fruit and tobacco accords.",
    },
    sources: [
      {
        label: "IFF — Damascone Beta",
        url: "https://www.iff.com/scent/ingredients-compendium/damascone-beta/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "damascone-delta",
    name: "Damascone Delta",
    aliases: [
      "damascone delta",
      "delta damascone",
      "damascone delta cassis",
      "damascone delta tobacco",
    ],
    kind: "material",
    answer: {
      sr: "Damascone Delta je IFF rose-ketone izuzetne difuznosti sa snažnim cassis karakterom. U tragovima može dati rose/tobacco efekat, uz fruity, apple i earthy facet.",
      en: "Damascone Delta is an IFF rose ketone with exceptional diffusion and a strong cassis character. In traces it can create a rose-tobacco effect alongside fruity, apple and earthy facets.",
    },
    sources: [
      {
        label: "IFF — Damascone Delta",
        url: "https://www.iff.com/scent/ingredients-compendium/damascone-delta/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "vertofix-coeur",
    name: "Vertofix Coeur",
    aliases: [
      "vertofix coeur",
      "vertofix",
      "vertofix cedar leather",
      "vertofix dry wood",
    ],
    kind: "material",
    answer: {
      sr: "Vertofix® Coeur je IFF woody materijal toplog precious-wood karaktera sa musky podtonom. Dugotrajan je i difuzan, sa cedar, leather i dry-wood facetama.",
      en: "Vertofix® Coeur is an IFF woody material with a warm precious-wood character and musky undertones. It is long-lasting and diffusive, with cedar, leather and dry-wood facets.",
    },
    sources: [
      {
        label: "IFF — Vertofix Coeur",
        url: "https://www.iff.com/scent/ingredients-compendium/vertofix-coeur/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "operanide",
    name: "Operanide",
    aliases: [
      "operanide",
      "operanide amber",
      "operanide powdery amber",
      "operanide gourmand",
    ],
    kind: "material",
    answer: {
      sr: "Operanide je IFF amber materijal sa mekanim, kremastim i puderastim ambery karakterom i gourmand nijansama. Koristan je za soft woods, exotic florals, spicy strukture i moderne gourmand baze.",
      en: "Operanide is an IFF amber material with a soft, creamy, powdery ambery character and gourmand nuances. It is useful in soft woods, exotic florals, spicy structures and modern gourmand bases.",
    },
    sources: [
      {
        label: "IFF — Operanide",
        url: "https://www.iff.com/scent/ingredients-compendium/operanide/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cassiffix",
    name: "Cassiffix",
    aliases: [
      "cassiffix",
      "cassiffix cassis",
      "cassiffix blackcurrant",
      "cassiffix fruity green",
    ],
    kind: "material",
    answer: {
      sr: "Cassiffix® je IFF fruity-green cassis materijal bez sulfurastog potpisa. Vrlo je difuzan i postojan, daje prirodnu green-juicy svežinu i sparkle red-berry, tropical i gourmand strukturama.",
      en: "Cassiffix® is an IFF fruity-green cassis material without a sulphuric signature. It is highly diffusive and substantive, adding natural green-juicy freshness and sparkle to red-berry, tropical and gourmand structures.",
    },
    sources: [
      {
        label: "IFF — Cassiffix",
        url: "https://www.iff.com/scent/ingredients-compendium/cassiffix/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ambrinol-95",
    name: "Ambrinol 95",
    aliases: [
      "ambrinol 95",
      "ambrinol 95 ambergris",
      "ambrinol seaweed",
    ],
    kind: "material",
    answer: {
      sr: "Ambrinol 95 je IFF ambergris-style materijal sa tonalitetima odležane prirodne ambergris tinkture. Kombinuje tobacco i leather nijanse sa oceanic-seaweed efektom i toplim animalic-musky drydownom.",
      en: "Ambrinol 95 is an IFF ambergris-style material with tonalities reminiscent of aged natural ambergris tincture. It combines tobacco and leathery nuances with an oceanic-seaweed effect and a warm animalic-musky drydown.",
    },
    sources: [
      {
        label: "IFF — Ambrinol 95",
        url: "https://www.iff.com/scent/ingredients-compendium/ambrinol-95/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ambrettolide",
    name: "Ambrettolide",
    aliases: [
      "ambrettolide",
      "ambrettolide musk",
      "ambrettolide red fruit",
      "ambrettolide floral musk",
    ],
    kind: "material",
    answer: {
      sr: "Ambrettolide je IFF macrocyclic musk velike snage i postojanosti, sa dubokim bogatim musk karakterom. Uz to daje floralnost i blagu red-fruit slatkoću.",
      en: "Ambrettolide is a powerful, substantive IFF macrocyclic musk with deep rich musk character. It also contributes floralcy and a subtle red-fruit sweetness.",
    },
    sources: [
      {
        label: "IFF — Ambrettolide",
        url: "https://www.iff.com/scent/ingredients-compendium/ambrettolide/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cyclemone-a",
    name: "Cyclemone A",
    aliases: [
      "cyclemone a",
      "cyclemone",
      "cyclemone ozone marine",
      "cyclemone herbal",
    ],
    kind: "material",
    answer: {
      sr: "Cyclemone A je IFF fresh materijal sa čistim ozone-marine kompleksom i herbal aspektima. Daje vazdušast, čist i morski signal bez klasičnog watermelon potpisa Calone profila.",
      en: "Cyclemone A is an IFF fresh material with a clean ozone-marine complex and herbal aspects. It gives an airy, clean marine signal without the classic watermelon signature associated with Calone profiles.",
    },
    sources: [
      {
        label: "IFF — Cyclemone A",
        url: "https://www.iff.com/scent/ingredients-compendium/cyclemone-a/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "damascol",
    name: "Damascol",
    aliases: [
      "damascol",
      "damascol rose",
      "damascol peppery",
      "damascol woody fruity",
    ],
    kind: "material",
    answer: {
      sr: "Damascol je IFF materijal dubokog peppery, woody, fruity i spicy karaktera sa rose-absolute efektom. Može da produži i produbi rose-ketone strukture.",
      en: "Damascol is an IFF material with deep peppery, woody, fruity and spicy character plus a rose-absolute effect. It can extend and deepen rose-ketone structures.",
    },
    sources: [
      {
        label: "IFF — Damascol",
        url: "https://www.iff.com/scent/ingredients-compendium/damascol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "peomosa",
    name: "Peomosa",
    aliases: [
      "peomosa",
      "peomosa peony",
      "peomosa mimosa",
      "peomosa cyclamen",
    ],
    kind: "material",
    answer: {
      sr: "Peomosa je IFF floralni materijal prirodnog peony, mimosa i rose karaktera, sa green, earthy, wet i cyclamen nijansama. Daje cvetnim akordima vlažniji i prirodniji osećaj latica i stabljike.",
      en: "Peomosa is an IFF floral material with natural peony, mimosa and rose character plus green, earthy, wet and cyclamen nuances. It gives floral accords a wetter, more natural petal-and-stem impression.",
    },
    sources: [
      {
        label: "IFF — Peomosa",
        url: "https://www.iff.com/scent/ingredients-compendium/peomosa/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ocimene",
    name: "Ocimene",
    aliases: [
      "ocimene",
      "ocimene herbal",
      "ocimene lavender",
      "ocimene green citrus",
    ],
    kind: "material",
    answer: {
      sr: "Ocimene je IFF herbal materijal kompleksnog lavender karaktera sa green-citrus, metallic i mango nijansama. Radi kao vrlo zanimljiv top-note most između herbal, citrusnih i voćnih akorda.",
      en: "Ocimene is an IFF herbal material with a complex lavender character plus green-citrus, metallic and mango nuances. It works as an unusual top-note bridge between herbal, citrus and fruity accords.",
    },
    sources: [
      {
        label: "IFF — Ocimene",
        url: "https://www.iff.com/scent/ingredients-compendium/ocimene/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "verdol",
    name: "Verdol",
    aliases: [
      "verdol",
      "verdol camphor",
      "verdol minty",
      "verdol pine patchouli",
    ],
    kind: "material",
    answer: {
      sr: "Verdol je IFF herbal materijal vrlo snažnog camphoraceous i minty karaktera. Posebno dobro radi u pine i patchouli pravcima kada treba hladan, prodoran i aromatičan lift.",
      en: "Verdol is a very powerful IFF herbal material with camphoraceous and minty character. It works especially well in pine and patchouli directions when a cool, penetrating aromatic lift is needed.",
    },
    sources: [
      {
        label: "IFF — Verdol",
        url: "https://www.iff.com/scent/ingredients-compendium/verdol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "verdone",
    name: "Verdone",
    aliases: [
      "verdone",
      "verdone woody",
      "verdone camphor",
      "verdone woody camphor",
    ],
    kind: "material",
    answer: {
      sr: "Verdone je IFF woody-herbal materijal snažnog woody i camphoraceous karaktera sa velikim intenzitetom i konzistentnošću. Daje čvrst, suv i aromatično-drvenast signal.",
      en: "Verdone is an IFF woody-herbal material with a powerful woody and camphoraceous character, high intensity and consistency. It gives a firm, dry and aromatic-woody signal.",
    },
    sources: [
      {
        label: "IFF — Verdone",
        url: "https://www.iff.com/scent/ingredients-compendium/verdone/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "stemone",
    name: "Stemone",
    aliases: [
      "stemone",
      "stemone molecule",
      "stemone green",
      "stemone fig leaf",
    ],
    kind: "material",
    answer: {
      sr: "Stemone je dsm-firmenich green materijal prepoznatljiv po vrlo prirodnom green-leaf i stem karakteru sa snažnom fig-leaf asocijacijom. Koristi se kada kompoziciji treba vlažan, svjež i realističan biljni efekat, naročito u zelenim, smokvastim i garden akordima.",
      en: "Stemone is a dsm-firmenich green material known for a very natural green-leaf and stem character with a strong fig-leaf association. It is used when a composition needs a damp, fresh and realistic botanical effect, especially in green, fig and garden accords.",
    },
    sources: [
      {
        label: "dsm-firmenich — STEMONE",
        url: "https://studio.dsm-firmenich.com/product/stemone-950000",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "triplal",
    name: "Triplal",
    aliases: [
      "triplal",
      "triplal molecule",
      "triplal green",
      "triplal leafy",
    ],
    kind: "material",
    answer: {
      sr: "Triplal je IFF green materijal vrlo snažnog leafy i green-floral karaktera. Daje oštar, svjež i prodoran zeleni lift i koristi se u malim količinama kada akordu treba jasniji cut-leaf ili crushed-stem utisak.",
      en: "Triplal is a very powerful IFF green material with leafy and green-floral character. It gives a sharp, fresh and penetrating green lift and is used in small amounts when an accord needs a clearer cut-leaf or crushed-stem impression.",
    },
    sources: [
      {
        label: "IFF — Triplal",
        url: "https://www.iff.com/scent/ingredients-compendium/triplal/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "cis-3-hexenol",
    name: "cis-3-Hexenol",
    aliases: [
      "cis 3 hexenol",
      "cis-3-hexenol",
      "leaf alcohol",
      "cis 3 hexenol leaf alcohol",
    ],
    kind: "material",
    answer: {
      sr: "cis-3-Hexenol, poznat i kao Leaf Alcohol, jedan je od klasičnih materijala za miris svježe pokošene trave i zgnječenog zelenog lista. Njegov direktan green karakter daje vrlo prirodan cut-grass signal i služi kao osnovni gradivni blok za leafy i herbal akorde.",
      en: "cis-3-Hexenol, also known as Leaf Alcohol, is a classic material for the smell of freshly cut grass and crushed green leaves. Its direct green character gives a highly natural cut-grass signal and serves as a core building block for leafy and herbal accords.",
    },
    sources: [
      {
        label: "IFF — cis-3-Hexenol",
        url: "https://www.iff.com/scent/ingredients-compendium/cis-3-hexenol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ambermor-ketal-crystal",
    name: "Ambermor Ketal Crystal",
    aliases: [
      "ambermor ketal crystal",
      "ambermor ketal",
      "ambermor amber woody",
    ],
    kind: "material",
    answer: {
      sr: "Ambermor Ketal Crystal je IFF amber materijal izuzetne snage sa ambery i woody karakterom, uz elegantne animalic i musky tonalitete. Vrlo je postojan i koristi se u tragovima kada bazi treba snažan, suv i sofisticiran ambery potpis.",
      en: "Ambermor Ketal Crystal is an extremely powerful IFF amber material with ambery and woody character plus elegant animalic and musky tonalities. It is highly substantive and is used in traces when a base needs a strong, dry and sophisticated ambery signature.",
    },
    sources: [
      {
        label: "IFF — Ambermor Ketal Crystal",
        url: "https://www.iff.com/scent/ingredients-compendium/ambermor-ketal-crystal/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "santaliff",
    name: "Santaliff",
    aliases: [
      "santaliff",
      "santaliff molecule",
      "santaliff sandalwood",
      "santaliff creamy",
    ],
    kind: "material",
    answer: {
      sr: "Santaliff je IFF woody materijal sandalwood karaktera sa milky i creamy facetama. Daje pojačanu postojanost i jasniji sandalwood potpis, pa je koristan u modernim kremastim i mekim drvenastim bazama.",
      en: "Santaliff is an IFF woody material with sandalwood character and milky, creamy facets. It increases substantivity and reinforces the sandalwood signature, making it useful in modern creamy and soft woody bases.",
    },
    sources: [
      {
        label: "IFF — Santaliff",
        url: "https://www.iff.com/scent/ingredients-compendium/santaliff/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "mysantol",
    name: "Mysantol",
    aliases: [
      "mysantol",
      "mysantol molecule",
      "mysantol sandalwood",
      "mysantol creamy sandal",
    ],
    kind: "material",
    answer: {
      sr: "Mysantol je IFF woody materijal vrlo aromatičnog i difuznog sandal karaktera, sa prirodno kremastim kvalitetom koji podseća na istočnoindijsku sandalovinu. Koristi se kada treba snažan, efikasan i dugotrajan sandalwood efekat.",
      en: "Mysantol is a highly aromatic and diffusive IFF woody material with a sandal character and a naturally creamy quality reminiscent of East Indian sandalwood. It is used when a strong, efficient and long-lasting sandalwood effect is needed.",
    },
    sources: [
      {
        label: "IFF — Mysantol",
        url: "https://www.iff.com/scent/ingredients-compendium/mysantol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "anisimea",
    name: "Anisimea",
    aliases: [
      "anisimea",
      "anisimea molecule",
      "anisimea powdery",
      "anisimea mimosa",
    ],
    kind: "material",
    answer: {
      sr: "Anisimea je IFF floralni materijal puderastog mimosa karaktera, sličnog slatkom mirisu cveta pomorandže. Koristan je za meke, puderaste i blago anisic floralne akorde kojima treba toplina bez teške vanilične slatkoće.",
      en: "Anisimea is an IFF floral material with a powdery mimosa character similar to the sweet smell of orange flower. It is useful for soft, powdery and slightly anisic floral accords that need warmth without heavy vanilla sweetness.",
    },
    sources: [
      {
        label: "IFF — Anisimea",
        url: "https://www.iff.com/scent/ingredients-compendium/anisimea/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "indolene-50-bb",
    name: "Indolene 50% BB",
    aliases: [
      "indolene",
      "indolene 50",
      "indolene 50 bb",
      "indolene jasmine",
    ],
    kind: "material",
    answer: {
      sr: "Indolene 50% BB je IFF floralni materijal sa jasminskim karakterom i blagom animalic nijansom. Proizvođač ga posebno navodi kao materijal koji može da produži i podrži karakter prirodnog jasmin absoluta.",
      en: "Indolene 50% BB is an IFF floral material with a jasmine character and a slight animalic nuance. The manufacturer specifically notes its usefulness for extending and supporting the character of natural jasmine absolute.",
    },
    sources: [
      {
        label: "IFF — Indolene 50% BB",
        url: "https://www.iff.com/scent/ingredients-compendium/indolene-50-bb/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "muguet-ald-50-bb",
    name: "Muguet Ald 50% BB",
    aliases: [
      "muguet ald",
      "muguet ald 50",
      "muguet ald 50 bb",
      "muguet aldehyde",
    ],
    kind: "material",
    answer: {
      sr: "Muguet Ald 50% BB je IFF floralno-aldehidni materijal snažnog osvežavajućeg karaktera sa rosy i ozone-like aspektima. I u tragovima može da doda prijatan, svetao top-note efekat u muguet i clean-floral strukturama.",
      en: "Muguet Ald 50% BB is an IFF floral-aldehydic material with a powerful refreshing character and rosy, ozone-like aspects. Even in traces it can add a pleasant bright top-note effect to muguet and clean-floral structures.",
    },
    sources: [
      {
        label: "IFF — Muguet Ald 50% BB",
        url: "https://www.iff.com/scent/ingredients-compendium/muguet-ald-50-bb/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "fructone",
    name: "Fructone",
    aliases: [
      "fructone",
      "fructone molecule",
      "fructone fruity",
      "fructone pineapple",
    ],
    kind: "material",
    answer: {
      sr: "Fructone je IFF fruity materijal snažnog egzotično-voćnog karaktera koji spaja pineapple, strawberry i apple utiske, uz woody nijansu koja podseća na slatki bor. Koristan je kada voćnom akordu treba širi, sočniji i moderniji volumen.",
      en: "Fructone is an IFF fruity material with a strong exotic-fruit character combining pineapple, strawberry and apple impressions, plus a woody nuance reminiscent of sweet pine. It is useful when a fruit accord needs broader, juicier and more modern volume.",
    },
    sources: [
      {
        label: "IFF — Fructone",
        url: "https://www.iff.com/scent/ingredients-compendium/fructone/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "ethyl-phenyl-glycidate",
    name: "Ethyl Phenyl Glycidate",
    aliases: [
      "ethyl phenyl glycidate",
      "ethyl phenyl glycidate molecule",
      "ethyl phenyl glycidate strawberry",
      "strawberry glycidate",
    ],
    kind: "material",
    answer: {
      sr: "Ethyl Phenyl Glycidate je IFF fruity materijal sa izrazito slatkim strawberry karakterom. Radi kao vrlo direktan jagodasti gradivni blok kada formuli treba prepoznatljiv candy-like ili ripe-strawberry signal.",
      en: "Ethyl Phenyl Glycidate is an IFF fruity material with a distinctly sweet strawberry character. It acts as a direct strawberry building block when a formula needs a recognizable candy-like or ripe-strawberry signal.",
    },
    sources: [
      {
        label: "IFF — Ethyl Phenyl Glycidate",
        url: "https://www.iff.com/scent/ingredients-compendium/ethyl-phenyl-glycidate/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "hexyl-acetate",
    name: "Hexyl Acetate",
    aliases: [
      "hexyl acetate",
      "hexyl acetate molecule",
      "hexyl acetate apple",
      "hexyl acetate pear",
    ],
    kind: "material",
    answer: {
      sr: "Hexyl Acetate je IFF fruity materijal zelenog voćnog karaktera koji podseća na jabuku i krušku. Posebno je koristan za crisp, juicy i green-fruity vrhove kojima treba prirodniji utisak svježeg voća.",
      en: "Hexyl Acetate is an IFF fruity material with a green-fruity character reminiscent of apple and pear. It is especially useful for crisp, juicy and green-fruity top notes that need a more natural fresh-fruit impression.",
    },
    sources: [
      {
        label: "IFF — Hexyl Acetate",
        url: "https://www.iff.com/scent/ingredients-compendium/hexyl-acetate/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "lilianth",
    name: "Lilianth",
    aliases: [
      "lilianth",
      "lilianth molecule",
      "lilianth muguet",
      "lilianth orangeflower",
    ],
    kind: "material",
    answer: {
      sr: "Lilianth je IFF floralni materijal sa svežim zelenim orange-flower i lily karakterom, citrusnim aspektom i nijansom koja podseća na hydroxycitronellal. Koristan je za čiste, svetle muguet i transparentno-floralne strukture.",
      en: "Lilianth is an IFF floral material with a fresh green orange-flower and lily character, a citrus aspect and a hydroxycitronellal-like nuance. It is useful in clean, bright muguet and transparent-floral structures.",
    },
    sources: [
      {
        label: "IFF — Lilianth",
        url: "https://www.iff.com/scent/ingredients-compendium/lilianth/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "floral-super",
    name: "Floral Super",
    aliases: [
      "floral super",
      "floral super molecule",
      "floral super cyclamen",
      "floral super fresh floral",
    ],
    kind: "material",
    answer: {
      sr: "Floral Super je IFF floralni materijal vrlo velike snage sa koncentrisanim fresh-cyclamen karakterom. Najviše radi kao high-impact floralni lift u vrhu i srcu, pa se koristi u malim količinama kada treba pojačati čist, moderan floralni signal.",
      en: "Floral Super is a very powerful IFF floral material with a concentrated fresh-cyclamen character. It acts mainly as a high-impact floral lift in the top and heart and is used in small amounts when a clean, modern floral signal needs amplification.",
    },
    sources: [
      {
        label: "IFF — Floral Super",
        url: "https://www.iff.com/scent/ingredients-compendium/floral-super/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "citronellol-950",
    name: "Citronellol 950",
    aliases: [
      "citronellol 950",
      "citronellol",
      "citronellol rose",
      "citronellol geranium",
    ],
    kind: "material",
    answer: {
      sr: "Citronellol 950 je IFF floralni materijal sa rose i geranium karakterom, voštanim tonom, blagim citrusnim facetama i mekom puderastom nijansom. To je važan gradivni materijal za ružine, geranijumske i klasične floralne akorde.",
      en: "Citronellol 950 is an IFF floral material with rose and geranium character, a waxy tone, slight citrus facets and a soft powdery nuance. It is an important building block for rose, geranium and classical floral accords.",
    },
    sources: [
      {
        label: "IFF — Citronellol 950",
        url: "https://www.iff.com/scent/ingredients-compendium/citronellol-950/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "tetrahydro-myrcenol",
    name: "Tetrahydro Myrcenol",
    aliases: [
      "tetrahydro myrcenol",
      "tetrahydromyrcenol",
      "tetrahydro myrcenol citrus",
      "tetrahydro myrcenol lime",
    ],
    kind: "material",
    answer: {
      sr: "Tetrahydro Myrcenol je IFF citrusni materijal mekog lime-citrus karaktera sa floralnim aspektom. U fresh kompozicijama daje čist, svetao i stabilan citrusni lift bez potrebe da profil ostane vezan samo za prirodna citrusna ulja.",
      en: "Tetrahydro Myrcenol is an IFF citrus material with a soft lime-citrus odor and a floral aspect. In fresh compositions it provides a clean, bright and stable citrus lift without relying only on natural citrus oils.",
    },
    sources: [
      {
        label: "IFF — Tetrahydro Myrcenol",
        url: "https://www.iff.com/scent/ingredients-compendium/tetrahydro-myrcenol/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "dimyrcetol",
    name: "Dimyrcetol",
    aliases: [
      "dimyrcetol",
      "dimyrcetol molecule",
      "dimyrcetol citrus",
      "dimyrcetol fresh citrus",
    ],
    kind: "material",
    answer: {
      sr: "Dimyrcetol je IFF fresh-citrus materijal velike snage. Proizvođač ga opisuje kao veoma snažan svež citrusni miris, pa je koristan kada formuli treba izrazit, funkcionalan i direktan fresh efekat.",
      en: "Dimyrcetol is a high-impact IFF fresh-citrus material. The manufacturer describes it as a fresh citrus of great power, making it useful when a formula needs a strong, functional and direct fresh effect.",
    },
    sources: [
      {
        label: "IFF — Dimyrcetol",
        url: "https://www.iff.com/scent/ingredients-compendium/dimyrcetol/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "myrcenol-super",
    name: "Myrcenol Super",
    aliases: [
      "myrcenol super",
      "myrcenol super molecule",
      "myrcenol super lavender",
      "myrcenol super citrus",
    ],
    kind: "material",
    answer: {
      sr: "Myrcenol Super je IFF fresh materijal sa floralno-lavandastim i citrusnim karakterom. U aromatic i fougère strukturama može da pojača osećaj čistoće, vazduha i citrusno-lavandaste svežine.",
      en: "Myrcenol Super is an IFF fresh material with floral-lavender and citrus character. In aromatic and fougère structures it can reinforce a sense of cleanliness, airiness and citrus-lavender freshness.",
    },
    sources: [
      {
        label: "IFF — Myrcenol Super",
        url: "https://www.iff.com/scent/ingredients-compendium/myrcenol-super/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "undecavertol",
    name: "Undecavertol",
    aliases: [
      "undecavertol",
      "undecavertol molecule",
      "undecavertol green",
      "undecavertol violet leaf",
    ],
    kind: "material",
    answer: {
      sr: "Undecavertol je Givaudan materijal izuzetne snage sa green-floral karakterom povezanim sa đurđevkom, svežim listom ljubičice i lipovim cvetom. Ima i prirodan fruity aspekt, pa se koristi i za podizanje pear i rose akorda, uz pažljivo doziranje.",
      en: "Undecavertol is a very powerful Givaudan material with a green-floral character related to lily of the valley, fresh violet leaf and linden blossom. It also carries a natural fruity aspect and is used to lift pear and rose accords, with careful dosage because of its strength.",
    },
    sources: [
      {
        label: "Givaudan — Undecavertol",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/undecavertol",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "spirogalbanone-pure",
    name: "Spirogalbanone Pure",
    aliases: [
      "spirogalbanone",
      "spirogalbanone pure",
      "spirogalbanone green",
      "spirogalbanone galbanum",
    ],
    kind: "material",
    answer: {
      sr: "Spirogalbanone™ Pure je Givaudan green materijal koji daje snažan, stabilan i vrlo postojan galbanum efekat sa fruity i pineapple facetama. Posebno je koristan kada treba zadržati linearan zeleni karakter kroz srce i bazu kompozicije.",
      en: "Spirogalbanone™ Pure is a Givaudan green material that gives a powerful, stable and highly substantive galbanum effect with fruity and pineapple facets. It is especially useful when a linear green signature needs to persist through the heart and base of a composition.",
    },
    sources: [
      {
        label: "Givaudan — Spirogalbanone Pure",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/spirogalbanone-pure",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "fraistone",
    name: "Fraistone",
    aliases: [
      "fraistone",
      "fraistone molecule",
      "fraistone fruity",
      "fraistone strawberry",
    ],
    kind: "material",
    answer: {
      sr: "Fraistone je IFF fruity materijal sa oporim, svežim i blago anisic karakterom koji podseća na jabuku, šljivu i jagodu. Koristi se kada voćnom akordu treba življa, modernija i manje sirupasta definicija.",
      en: "Fraistone is an IFF fruity material with a tart, fresh and slightly anisic character reminiscent of apple, plum and strawberry. It is useful when a fruit accord needs a brighter, more modern and less syrupy definition.",
    },
    sources: [
      {
        label: "IFF — Fraistone",
        url: "https://www.iff.com/scent/ingredients-compendium/fraistone/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cascalone",
    name: "Cascalone",
    aliases: [
      "cascalone",
      "cascalone molecule",
      "cascalone watery",
      "cascalone freshwater",
    ],
    kind: "material",
    answer: {
      sr: "Cascalone® je dsm-firmenich aquatic molekula sa watery, fruity i transparentno floralnim karakterom. Proizvođač je opisuje kao slađu i mekšu varijantu Calone profila, pogodnu za prirodniji clean-freshwater potpis od vrha do baze.",
      en: "Cascalone® is a dsm-firmenich aquatic molecule with watery, fruity and transparent floral character. The manufacturer describes it as a sweeter, softer variation on the Calone profile, useful for a more natural clean-freshwater signature from top to base.",
    },
    sources: [
      {
        label: "dsm-firmenich — CASCALONE",
        url: "https://studio.dsm-firmenich.com/product/cascaloner-pe-920000",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "adoxal",
    name: "Adoxal",
    aliases: [
      "adoxal",
      "adoxal molecule",
      "adoxal ozonic",
      "adoxal fresh linen",
    ],
    kind: "material",
    answer: {
      sr: "Adoxal je Givaudan vrlo snažan marine/aldehydic materijal sa prirodnim ozonic aspektom. Dobro se spaja sa muguet, cyclamen, fruity i woody akordima, a proizvođač ga posebno opisuje i kao tipičan fresh-linen mirisni signal.",
      en: "Adoxal is a very powerful Givaudan marine-aldehydic material with a natural ozonic aspect. It blends well with muguet, cyclamen, fruity and woody accords, and the manufacturer also specifically describes it as having a typical fresh-linen odor.",
    },
    sources: [
      {
        label: "Givaudan — Adoxal",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/adoxal",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "oceanol",
    name: "Oceanol",
    aliases: [
      "oceanol",
      "oceanol marine",
      "oceanol salty",
      "oceanol ozonic",
    ],
    kind: "material",
    answer: {
      sr: "Oceanol je IFF fresh marine materijal sa bright ozonic vrhom i mnogo tamnijim earthy, mossy i woody drydownom. Posebno pojačava salty/marine facet, ali može da doda kompleksnost i leather ili dark-wood strukturama.",
      en: "Oceanol is an IFF fresh marine material with a bright ozonic top and a much darker earthy, mossy and woody drydown. It especially reinforces salty-marine facets but can also add complexity to leather and dark-wood structures.",
    },
    sources: [
      {
        label: "IFF — Oceanol",
        url: "https://www.iff.com/scent/ingredients-compendium/oceanol/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "hay-absolute",
    name: "Hay Absolute",
    aliases: [
      "hay absolute",
      "hay abs",
      "absolute sena",
      "seno absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Hay Absolute je IFF/LMR absolute francuskog sena dobijen solventnom ekstrakcijom i etanolnim prečišćavanjem. Profil je sladak i herbalan, sa toplim tobacco karakterom na honeyed i dried-fruit pozadini; prirodno sadrži coumarin.",
      en: "Hay Absolute is an IFF/LMR absolute of French hay produced by solvent extraction followed by ethanol purification. Its profile is sweet and herbal with warm tobacco character over honeyed and dried-fruit undertones; it naturally contains coumarin.",
    },
    sources: [
      {
        label: "IFF LMR — Hay Absolute",
        url: "https://www.iff.com/scent/lmr-compendium/hay-absolute/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "mate-absolute",
    name: "Mate Absolute",
    aliases: [
      "mate absolute",
      "mate abs",
      "yerba mate absolute",
      "ilex paraguariensis absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Mate Absolute je absolute listova Ilex paraguariensis dobijen solventnom ekstrakcijom i etanolnim prečišćavanjem. IFF ga opisuje kao toplu herbaceous notu sa green-tea karakterom, floralno-puderastim nijansama i hay/tobacco podtonovima.",
      en: "Mate Absolute is an absolute of Ilex paraguariensis leaves produced by solvent extraction followed by ethanol purification. IFF describes it as a warm herbaceous note with green-tea character, floral-powdery nuances and hay/tobacco undertones.",
    },
    sources: [
      {
        label: "IFF LMR — Mate Absolute",
        url: "https://www.iff.com/scent/lmr-compendium/mate-abs-40pct-tec-blo/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "bran-absolute",
    name: "Bran Absolute",
    aliases: [
      "bran absolute",
      "wheat bran absolute",
      "bran abs",
      "mekinje absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Bran Absolute je IFF/LMR upcycled absolute pšeničnih mekinja iz Francuske. Profil je cereal/gourmand sa dried-fruit karakterom, hay facetama, apricot i honey podtonovima, pa može da poveže grain, tobacco-hay i gourmand akorde.",
      en: "Bran Absolute is an IFF/LMR upcycled absolute of French wheat bran. Its profile is cereal-gourmand with dried-fruit character, hay facets, apricot and honey undertones, allowing it to bridge grain, tobacco-hay and gourmand accords.",
    },
    sources: [
      {
        label: "IFF LMR — Bran Absolute",
        url: "https://www.iff.com/scent/lmr-compendium/bran-absolute/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "tonka-bean-co2-absolute",
    name: "Tonka Bean CO₂ Absolute",
    aliases: [
      "tonka bean co2 absolute",
      "tonka bean co2 abs",
      "tonka co2",
      "co2 tonka absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Tonka Bean CO₂ Absolute je superkritični CO₂ ekstrakt tonka zrna iz Brazila. IFF ga opisuje kao topao gourmand materijal sa roasted-almond i sun-dried hay nijansama, uz sweet cocoa dubinu; CO₂ proces čuva vrlo precizan profil bez termičke degradacije.",
      en: "Tonka Bean CO₂ Absolute is a supercritical CO₂ extract of Brazilian tonka beans. IFF describes it as a warm gourmand material with roasted-almond and sun-dried hay nuances plus sweet cocoa depth; the CO₂ process preserves a very accurate profile without thermal degradation.",
    },
    sources: [
      {
        label: "IFF LMR — Tonka Bean CO₂ Absolute",
        url: "https://www.iff.com/scent/lmr-compendium/tonka-bean-co%E2%82%82-abs/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "immortelle-absolute-balkans",
    name: "Immortelle Absolute Balkans",
    aliases: [
      "immortelle absolute balkans",
      "immortelle absolute",
      "helichrysum absolute balkans",
      "smilje absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Immortelle Absolute Balkans je absolute Helichrysum italicum cvetova sa Balkana. IFF ga opisuje kroz dried-fruity i liquorous vrh, warm herbaceous hay/tobacco profil, floralne facete i ambery podtonove; dobija se preko concrete faze i etanolnog prečišćavanja.",
      en: "Immortelle Absolute Balkans is an absolute of Helichrysum italicum flowers from the Balkans. IFF describes a dried-fruity, liquorous top, warm herbaceous hay/tobacco profile, floral facets and ambery undertones; it is produced through a concrete stage followed by ethanol purification.",
    },
    sources: [
      {
        label: "IFF LMR — Immortelle Absolute Balkans",
        url: "https://www.iff.com/scent/lmr-compendium/immortelle-absolute-balkans/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "orris-absolute-italy",
    name: "Orris Absolute Italy",
    aliases: [
      "orris absolute italy",
      "italian orris absolute",
      "iris pallida absolute italy",
      "orris absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Orris Absolute Italy je prirodni Iris pallida materijal iz rizoma. IFF ga dobija hidrodestilacijom praćenom frakcionom destilacijom i opisuje kao bogat, snažan floralni orris sa puderastim karakterom, violet facetom i woody bazom. Za 1 kg materijala potrebno je oko 2000 kg biljne sirovine.",
      en: "Orris Absolute Italy is a natural Iris pallida material from rhizomes. IFF obtains it by hydrodistillation followed by fractional distillation and describes it as a rich, powerful floral orris with powdery character, a violet facet and a woody base. About 2,000 kg of vegetal material are required for 1 kg.",
    },
    sources: [
      {
        label: "IFF LMR — Orris Absolute Italy",
        url: "https://www.iff.com/scent/lmr-compendium/orris-absolute-italy/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "orris-natural-15-irone",
    name: "Orris Natural 15% Irone",
    aliases: [
      "orris natural 15 irone",
      "orris natural 15 pct irone",
      "15 percent irone orris",
      "orris 15 irone",
    ],
    kind: "natural-material",
    answer: {
      sr: "Orris Natural 15% Irone je visoko koncentrisan prirodni orris materijal iz Iris pallida i Iris germanica rizoma. IFF ga opisuje kao elegantan, dubok floralni profil sa puderastim karakterom, velvet teksturom, violet facetama i woody podtonovima.",
      en: "Orris Natural 15% Irone is a highly concentrated natural orris material from Iris pallida and Iris germanica rhizomes. IFF describes it as an elegant deep floral note with powdery character, velvet texture, violet facets and woody undertones.",
    },
    sources: [
      {
        label: "IFF LMR — Orris Natural 15 PCT Irone",
        url: "https://www.iff.com/scent/lmr-compendium/orris-natural-15-pct-irone-4095c/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "violet-leaf-absolute-egypt",
    name: "Violet Leaf Absolute Egypt",
    aliases: [
      "violet leaf absolute egypt",
      "violet leaf absolute",
      "egypt violet leaf absolute",
      "viola odorata leaf absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Violet Leaf Absolute Egypt je absolute listova Viola odorata dobijen solventnom ekstrakcijom i etanolnim prečišćavanjem. IFF ga opisuje kao leafy-green floral sa watery facetama, mimosa asocijacijom i toplim mossy-leathery drydownom — sasvim drugačiji od puderasto-violet efekta ionona i irona.",
      en: "Violet Leaf Absolute Egypt is an absolute of Viola odorata leaves produced by solvent extraction followed by ethanol purification. IFF describes it as a leafy-green floral with watery facets, a mimosa-like nuance and a warm mossy-leathery drydown—very different from the powdery-violet effect of ionones and irones.",
    },
    sources: [
      {
        label: "IFF LMR — Violet Leaf Absolute Egypt",
        url: "https://www.iff.com/scent/lmr-compendium/violet-leaf-absolute-egypt/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "irisone-alpha",
    name: "Irisone Alpha",
    aliases: [
      "irisone alpha",
      "irisone alpha molecule",
      "irisone alpha orris",
      "irisone alpha violet",
    ],
    kind: "material",
    answer: {
      sr: "Irisone™ Alpha je Givaudan ionone materijal sa floralnim, orris, violet i woody karakterom. Veoma je substantivan i koristi se u woody, floral, balsamic, piney i citrus akordima, a proizvođač posebno navodi da može dati zanimljiv twist rose strukturama.",
      en: "Irisone™ Alpha is a Givaudan ionone material with floral, orris, violet and woody character. It is highly substantive and is widely used in woody, floral, balsamic, piney and citrus accords; the manufacturer also notes that it can add an interesting twist to rose accords.",
    },
    sources: [
      {
        label: "Givaudan — Irisone Alpha",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/irisonetm-alpha",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "leather-md",
    name: "Leather MD",
    aliases: [
      "leather md",
      "leather molecular distillation",
      "natural leather md",
      "leather md firmenich",
    ],
    kind: "natural-material",
    answer: {
      sr: "Leather MD je dsm-firmenich prirodni leather sastojak sa smoky, leathery, animalic i pyrogenous karakterom. Dobija se molekularnom destilacijom prirodne specijalnosti i razvijen je kao tehnički stabilnija, IFRA-kompatibilna alternativa starijim leather materijalima sa PAH ograničenjima.",
      en: "Leather MD is a dsm-firmenich natural leather ingredient with smoky, leathery, animalic and pyrogenous character. It is obtained by molecular distillation of a natural specialty and was developed as a technically stable, IFRA-compatible alternative to older leather materials affected by PAH limitations.",
    },
    sources: [
      {
        label: "dsm-firmenich — LEATHER MD",
        url: "https://studio.dsm-firmenich.com/product/leather-md-pe-936358",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "grisalva",
    name: "Grisalva",
    aliases: [
      "grisalva",
      "grisalva ambergris",
      "grisalva leather",
      "grisalva animalic",
    ],
    kind: "material",
    answer: {
      sr: "Grisalva je IFF ambergris materijal velike snage i difuzije, sa mekim animalic, ambery i leather facetama. IFF ga posebno navodi za ambergris tipove, smooth leather akorde, blond woods i klasične oriental strukture.",
      en: "Grisalva is a powerful, diffusive IFF ambergris material with soft animalic, ambery and leather facets. IFF specifically lists it for ambergris types, smooth leather accords, blond woods and classical oriental structures.",
    },
    sources: [
      {
        label: "IFF — Grisalva",
        url: "https://www.iff.com/scent/ingredients-compendium/grisalva/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "muscone",
    name: "Muscone",
    aliases: [
      "muscone",
      "muscone musk",
      "muscone animalic",
      "musk tonkin molecule",
    ],
    kind: "material",
    answer: {
      sr: "Muscone je dsm-firmenich sintetička musk molekula toplog, mekog i animalic karaktera koja evocira prirodni Musk Tonkin. Koristi se za rekonstrukciju prirodnog musk efekta i daje puderastu toplinu leather i woody kompozicijama.",
      en: "Muscone is a dsm-firmenich synthetic musk molecule with a warm, soft and animalic character evocative of natural Musk Tonkin. It is used to reconstruct natural musk effects and adds powdery warmth to leather and woody compositions.",
    },
    sources: [
      {
        label: "dsm-firmenich — MUSCONE",
        url: "https://studio.dsm-firmenich.com/product/muscone-pe-962195",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "ambrinol",
    name: "Ambrinol",
    aliases: [
      "ambrinol",
      "ambrinol ambergris",
      "ambrinol leather",
      "ambrinol animalic",
    ],
    kind: "material",
    answer: {
      sr: "Ambrinol je dsm-firmenich veoma snažna synthetic ambergris molekula sa earthy i animalic karakterom, leather nijansom i blagom musk pozadinom. Koristi se u malim dozama kao enhancer amber nota i za dodavanje dubine, teksture i animalic senzualnosti.",
      en: "Ambrinol is a very powerful dsm-firmenich synthetic ambergris molecule with earthy and animalic character, a leather nuance and subtle muskiness. It is used at low dosage as an amber enhancer and to add depth, texture and animalic sensuality.",
    },
    sources: [
      {
        label: "dsm-firmenich — AMBRINOL",
        url: "https://studio.dsm-firmenich.com/product/ambrinol-pe-908930",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "styrax-resinoid-low-styrene",
    name: "Styrax Resinoid Low Styrene",
    aliases: [
      "styrax resinoid low styrene",
      "styrax resinoid",
      "styrax leather resinoid",
      "liquidambar resinoid",
    ],
    kind: "natural-material",
    answer: {
      sr: "Styrax Resinoid Low Styrene je IFF prirodni ekstrakt balsama Liquidambar styraciflua iz Hondurasa, dobijen etanolnom ekstrakcijom. Profil je balsamic i leathery, sa cinnamic, floral, resinous-amber i animalic facetama, pa prirodno povezuje balsam, leather i amber akorde.",
      en: "Styrax Resinoid Low Styrene is an IFF natural extract of Liquidambar styraciflua balsam from Honduras obtained by ethanol extraction. Its profile is balsamic and leathery with cinnamic, floral, resinous-amber and animalic facets, naturally bridging balsam, leather and amber accords.",
    },
    sources: [
      {
        label: "IFF LMR — Styrax Resinoid Low Styrene",
        url: "https://www.iff.com/scent/lmr-compendium/styrax-resinoid-low-styrene/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "cardamom-oil-guatemala",
    name: "Cardamom Oil Guatemala",
    aliases: [
      "cardamom oil guatemala",
      "guatemala cardamom oil",
      "cardamom essential oil guatemala",
      "ulje kardamoma gvatemala",
    ],
    kind: "natural-material",
    answer: {
      sr: "Cardamom Oil Guatemala je etarsko ulje semenki Elettaria cardamomum dobijeno hidrodestilacijom. IFF ga opisuje kao veoma prodoran, svež i volatilni kardamom sa zelenim, blago metalnim karakterom koji se razvija ka tankoj fruity nijansi.",
      en: "Cardamom Oil Guatemala is an essential oil of Elettaria cardamomum seeds obtained by hydrodistillation. IFF describes it as a very penetrating, fresh and volatile cardamom with a green, slightly metallic character that dries toward a thin fruity nuance.",
    },
    sources: [
      {
        label: "IFF LMR — Cardamom Oil Guatemala",
        url: "https://www.iff.com/scent/lmr-compendium/cardamom-oil-guatemala/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "cardamom-co2-guatemala",
    name: "Cardamom Guatemala CO₂ Extract",
    aliases: [
      "cardamom guatemala co2 extract",
      "cardamom co2 guatemala",
      "cardamom co2 extract",
      "co2 cardamom",
    ],
    kind: "natural-material",
    answer: {
      sr: "Cardamom Guatemala CO₂ Extract je superkritični CO₂ ekstrakt semenki kardamoma. IFF ga opisuje kao svež, spicy-aromatic profil sa citrusnim vrhom, camphoraceous karakterom, cooling nijansama i woody pozadinom; u odnosu na hidrodestilovano ulje zadržava drugačiji balans teže i manje volatilne materije.",
      en: "Cardamom Guatemala CO₂ Extract is a supercritical CO₂ extract of cardamom seeds. IFF describes it as a fresh spicy-aromatic profile with citrus top facets, camphoraceous character, cooling nuances and woody undertones; compared with hydrodistilled oil it retains a different balance of heavier, less volatile material.",
    },
    sources: [
      {
        label: "IFF LMR — Cardamom Guatemala CO₂ Extract",
        url: "https://www.iff.com/scent/lmr-compendium/cardamom-guatemala-co2-extract/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "ginger-oil-fresh-madagascar",
    name: "Ginger Oil Fresh Madagascar",
    aliases: [
      "ginger oil fresh madagascar",
      "fresh ginger oil madagascar",
      "madagascar ginger oil",
      "ulje djumbira madagaskar",
    ],
    kind: "natural-material",
    answer: {
      sr: "Ginger Oil Fresh Madagascar je etarsko ulje svežih rizoma đumbira dobijeno hidrodestilacijom ubrzo nakon berbe. IFF ga opisuje kao sparkling svež đumbir sa zesty citrusnim facetama i woody podtonovima.",
      en: "Ginger Oil Fresh Madagascar is an essential oil of fresh ginger rhizomes hydrodistilled shortly after harvest. IFF describes it as a sparkling fresh ginger note with zesty citrus facets and woody undertones.",
    },
    sources: [
      {
        label: "IFF LMR — Ginger Oil Fresh Madagascar",
        url: "https://www.iff.com/scent/lmr-compendium/ginger-oil-fresh-madagascar/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "ginger-co2-extract",
    name: "Ginger CO₂ Extract",
    aliases: [
      "ginger co2 extract",
      "co2 ginger extract",
      "supercritical ginger extract",
      "ginger supercritical co2",
    ],
    kind: "natural-material",
    answer: {
      sr: "Ginger CO₂ Extract je superkritični CO₂ ekstrakt rizoma đumbira. IFF ga opisuje kao spicy i fresh materijal sa zesty lemon i freshly-cut-ginger akcentima, uz earthy pozadinu i nijanse čokolade koje ga jasno razlikuju od svetlijeg hidrodestilovanog ginger oil profila.",
      en: "Ginger CO₂ Extract is a supercritical CO₂ extract of ginger rhizomes. IFF describes it as spicy and fresh with zesty lemon and freshly cut ginger accents, plus an earthy background and chocolate hints that clearly distinguish it from the brighter hydrodistilled ginger-oil profile.",
    },
    sources: [
      {
        label: "IFF LMR — Ginger CO₂ Extract",
        url: "https://www.iff.com/scent/lmr-compendium/ginger-co2-extract/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "pepper-black-oil-madagascar",
    name: "Pepper Black Oil Madagascar",
    aliases: [
      "pepper black oil madagascar",
      "black pepper oil madagascar",
      "madagascar black pepper oil",
      "ulje crnog bibera madagaskar",
    ],
    kind: "natural-material",
    answer: {
      sr: "Pepper Black Oil Madagascar je hidrodestilovano etarsko ulje bobica Piper nigrum. IFF ga opisuje kao svežu i spicy black-pepper notu sa aromatic i citrusnim nijansama u vrhu i woody pozadinom.",
      en: "Pepper Black Oil Madagascar is a hydrodistilled essential oil of Piper nigrum berries. IFF describes it as a fresh spicy black-pepper note with aromatic and citrus nuances on top and a woody background.",
    },
    sources: [
      {
        label: "IFF LMR — Pepper Black Oil Madagascar",
        url: "https://www.iff.com/scent/lmr-compendium/pepper-black-oil-madagascar/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "clove-bud-oil-madagascar",
    name: "Clove Bud Oil Madagascar",
    aliases: [
      "clove bud oil madagascar",
      "madagascar clove bud oil",
      "clove bud oil",
      "ulje pupoljka karanfilica",
    ],
    kind: "natural-material",
    answer: {
      sr: "Clove Bud Oil Madagascar je hidrodestilovano etarsko ulje pupoljaka Syzygium aromaticum. IFF ga opisuje kao topao i spicy clove materijal sa puderastim, woody i sweet facetama, uz laganu smokiness i medicinal nijansu.",
      en: "Clove Bud Oil Madagascar is a hydrodistilled essential oil of Syzygium aromaticum flower buds. IFF describes it as a warm spicy clove material with powdery, woody and sweet facets plus a touch of smokiness and medicinal nuance.",
    },
    sources: [
      {
        label: "IFF LMR — Clove Bud Oil",
        url: "https://www.iff.com/scent/lmr-compendium/clove-bud-oil-org/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "vetiver-oil-haiti",
    name: "Vetiver Oil Haiti",
    aliases: [
      "vetiver oil haiti",
      "haiti vetiver oil",
      "haitian vetiver oil",
      "vetiver essential oil haiti",
    ],
    kind: "natural-material",
    answer: {
      sr: "Vetiver Oil Haiti je etarsko ulje korena vetivera dobijeno hidrodestilacijom. IFF ga opisuje kao klasičan woody-earthy vetiver sa dodirom grejpfruta i orašastim podtonovima; oko 200 kg biljnog materijala daje približno 1 kg ulja.",
      en: "Vetiver Oil Haiti is an essential oil of vetiver roots obtained by hydrodistillation. IFF describes it as the characteristic woody-earthy vetiver note with a touch of grapefruit and nutty undertones; about 200 kg of vegetal material yields roughly 1 kg of oil.",
    },
    sources: [
      {
        label: "IFF LMR — Vetiver Oil Haiti",
        url: "https://www.iff.com/scent/lmr-compendium/vetiver-oil-haiti/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "vetiver-heart",
    name: "Vetiver Heart",
    aliases: [
      "vetiver heart",
      "vetiver heart haiti",
      "fractionated vetiver heart",
      "vetiver fraction",
    ],
    kind: "natural-material",
    answer: {
      sr: "Vetiver Heart je rafinisanija frakcija haićanskog vetivera. IFF ga dobija hidrodestilacijom korena, a zatim frakcionom destilacijom kojom se izoluje srce ulja; rezultat je čistiji i suvlji woody vetiver sa nutty i grapefruit nijansama.",
      en: "Vetiver Heart is a refined fraction of Haitian vetiver. IFF obtains it by hydrodistilling the roots and then using fractional distillation to isolate the heart of the oil; the result is a cleaner, drier woody vetiver with nutty and grapefruit nuances.",
    },
    sources: [
      {
        label: "IFF LMR — Vetiver Heart",
        url: "https://www.iff.com/scent/lmr-compendium/vetiver-heart/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "vetiver-concentrate-md",
    name: "Vetiver Concentrate MD",
    aliases: [
      "vetiver concentrate md",
      "vetiver concentrate",
      "molecular distilled vetiver",
      "vetiver md",
    ],
    kind: "natural-material",
    answer: {
      sr: "Vetiver Concentrate MD je veoma koncentrisan vetiver ekstrakt sa naglašenim woody-earthy, leathery i smoky karakterom. IFF ga pravi kombinovanjem frakcija dobijenih fizičkim procesima kao što su hidrodestilacija, molekularna destilacija i resin extraction.",
      en: "Vetiver Concentrate MD is a highly concentrated vetiver extract with accentuated woody-earthy, leathery and smoky character. IFF creates it by combining fractions obtained through physical processes including hydrodistillation, molecular distillation and resin extraction.",
    },
    sources: [
      {
        label: "IFF LMR — Vetiver Concentrate MD",
        url: "https://www.iff.com/scent/lmr-compendium/vetiver-concentrate-md-for-life/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "patchouli-oil-indonesia",
    name: "Patchouli Oil Indonesia",
    aliases: [
      "patchouli oil indonesia",
      "indonesian patchouli oil",
      "patchouli essential oil indonesia",
      "patchuli ulje indonezija",
    ],
    kind: "natural-material",
    answer: {
      sr: "Patchouli Oil Indonesia je etarsko ulje stabljika i listova Pogostemon cablin dobijeno hidrodestilacijom. IFF ga opisuje kao čist i elegantan woody-earthy patchouli sa minty i camphoraceous facetama na slatkoj mossy pozadini.",
      en: "Patchouli Oil Indonesia is an essential oil of Pogostemon cablin stems and leaves obtained by hydrodistillation. IFF describes it as a clean, elegant woody-earthy patchouli with minty and camphoraceous facets over a sweet mossy background.",
    },
    sources: [
      {
        label: "IFF LMR — Patchouli Oil Indonesia",
        url: "https://www.iff.com/scent/lmr-compendium/patchouli-oil-indonesia-for-life/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "patchouli-heart-n3",
    name: "Patchouli Heart N.3",
    aliases: [
      "patchouli heart n3",
      "patchouli heart",
      "fractionated patchouli",
      "patchouli fraction",
    ],
    kind: "natural-material",
    answer: {
      sr: "Patchouli Heart N.3 je frakcionisana verzija zrelog, iron-free patchouli ulja. IFF ga opisuje kao snažan, čist woody patchouli sa camphoraceous vrhom, fruity twistom i dugotrajnim blago earthy/humid karakterom; frakciona destilacija koncentriše poželjne patchouli tonove.",
      en: "Patchouli Heart N.3 is a fractionated version of matured iron-free patchouli oil. IFF describes it as a powerful clean woody patchouli with a camphoraceous top, fruity twist and long-lasting slightly earthy-humid character; fractional distillation concentrates the most sought-after patchouli facets.",
    },
    sources: [
      {
        label: "IFF LMR — Patchouli Heart N.3",
        url: "https://www.iff.com/scent/lmr-compendium/patchouli-heart-n-3/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "lavender-oil-france",
    name: "Lavender Oil France",
    aliases: [
      "lavender oil france",
      "french lavender oil",
      "lavender essential oil france",
      "ulje lavande francuska",
    ],
    kind: "natural-material",
    answer: {
      sr: "Lavender Oil France je hidrodestilovano etarsko ulje stabljika i cvetova Lavandula angustifolia. IFF ga opisuje kao karakterističan herbal-floral lavender sa fruity efektom koji može podsećati na jabuku i krušku, uz zelene nijanse.",
      en: "Lavender Oil France is a hydrodistilled essential oil from the stems and flowers of Lavandula angustifolia. IFF describes it as a characteristic herbal-floral lavender with a fruity character evocative of apple and pear plus green nuances.",
    },
    sources: [
      {
        label: "IFF LMR — Lavender Oil France",
        url: "https://www.iff.com/scent/lmr-compendium/lavender-oil-france-lmr-csm/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "rosemary-oil-morocco",
    name: "Rosemary Oil Morocco",
    aliases: [
      "rosemary oil morocco",
      "moroccan rosemary oil",
      "rosemary essential oil morocco",
      "ulje ruzmarina maroko",
    ],
    kind: "natural-material",
    answer: {
      sr: "Rosemary Oil Morocco je hidrodestilovano etarsko ulje stabljika i listova ruzmarina. IFF ga opisuje kao fresh camphoraceous aromatik sa snažnim green i terpenic srcem, cooling efektom i minty nijansom.",
      en: "Rosemary Oil Morocco is a hydrodistilled essential oil from rosemary stems and leaves. IFF describes it as a fresh camphoraceous aromatic with a powerful green and terpenic heart, a cooling effect and a minty touch.",
    },
    sources: [
      {
        label: "IFF LMR — Rosemary Oil Morocco",
        url: "https://www.iff.com/scent/lmr-compendium/rosemary-oil-morocco-org/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "fractional-distillation",
    name: "Fractional Distillation",
    aliases: [
      "fractional distillation",
      "fractionated distillation",
      "frakciona destilacija",
      "frakcionisana destilacija",
      "fractionation",
    ],
    kind: "process",
    answer: {
      sr: "Frakciona destilacija razdvaja etarsko ulje na uže frakcije prema razlikama u volatilnosti, pa parfimer može da zadrži ili koncentriše poželjne delove profila i ublaži grublje tonove. IFF je koristi, na primer, za Vetiver Heart i Patchouli Heart.",
      en: "Fractional distillation separates an essential oil into narrower fractions according to differences in volatility, allowing perfumers to retain or concentrate desirable facets and reduce harsher notes. IFF uses it, for example, for Vetiver Heart and Patchouli Heart.",
    },
    sources: [
      {
        label: "IFF LMR — Vetiver Heart",
        url: "https://www.iff.com/scent/lmr-compendium/vetiver-heart/",
        type: "manufacturer-official",
      },
      {
        label: "IFF LMR — Patchouli Heart N.3",
        url: "https://www.iff.com/scent/lmr-compendium/patchouli-heart-n-3/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "lemon-oil-cp-spain",
    name: "Lemon Oil CP Spain",
    aliases: [
      "lemon oil cp spain",
      "spanish lemon oil",
      "cold pressed lemon oil",
      "lemon peel oil spain",
    ],
    kind: "natural-material",
    answer: {
      sr: "Lemon Oil CP Spain je hladno ceđeno etarsko ulje kore Citrus limon iz Španije. Profil je juicy, green, sparkling i zesty, sa izraženom svežinom sveže narendane kore; FCR verzija prolazi rectification radi smanjenja regulisanih furokumarina.",
      en: "Lemon Oil CP Spain is a cold-pressed essential oil from Spanish Citrus limon peel. Its profile is juicy, green, sparkling and zesty with a freshly grated peel character; the FCR grade is rectified to reduce regulated furocoumarins.",
    },
    sources: [
      {
        label: "IFF LMR — Lemon Oil CP Spain FCR",
        url: "https://www.iff.com/scent/lmr-compendium/lemon-oil-cp-spain-fcr/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "orange-oil-cp-spain",
    name: "Orange Oil CP Spain",
    aliases: [
      "orange oil cp spain",
      "spanish orange oil",
      "cold pressed orange oil",
      "sweet orange oil spain",
    ],
    kind: "natural-material",
    answer: {
      sr: "Orange Oil CP Spain je hladno ceđeno etarsko ulje kore slatke pomorandže. IFF ga opisuje kao juicy i sweet citrus sa aldehidnom facetom koja donosi dodatnu svežinu i utisak upravo oljuštene pomorandže.",
      en: "Orange Oil CP Spain is a cold-pressed essential oil of sweet-orange peel. IFF describes it as juicy and sweet, balanced by an aldehydic facet that adds freshness and a freshly peeled orange effect.",
    },
    sources: [
      {
        label: "IFF LMR — Orange Oil CP Spain",
        url: "https://www.iff.com/scent/lmr-compendium/orange-oil-cp-spain/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "grapefruit-oil-cp-white-mexico",
    name: "Grapefruit Oil CP White Mexico",
    aliases: [
      "white grapefruit oil",
      "grapefruit oil white mexico",
      "cold pressed white grapefruit",
      "grapefruit oil cp white mex",
    ],
    kind: "natural-material",
    answer: {
      sr: "Grapefruit Oil CP White Mexico je hladno ceđeno etarsko ulje kore belog grejpfruta. IFF ga opisuje kao sparkling i juicy grapefruit sa karakterističnom gorčinom i fruity facetama; FCR verzija prolazi rectification radi smanjenja furokumarina.",
      en: "Grapefruit Oil CP White Mexico is a cold-pressed essential oil of white-grapefruit peel. IFF describes it as sparkling and juicy with characteristic bitterness and fruity facets; the FCR grade is rectified to reduce furocoumarins.",
    },
    sources: [
      {
        label: "IFF LMR — Grapefruit Oil CP White Mexico FCR",
        url: "https://www.iff.com/scent/lmr-compendium/grapefruit-oil-cp-white-mex-fcr-lmr/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "lime-oil-cp-persian-mexico",
    name: "Lime Oil CP Persian Mexico",
    aliases: [
      "persian lime oil mexico",
      "lime oil cp persian mexico",
      "cold pressed lime oil",
      "persian lime oil",
    ],
    kind: "natural-material",
    answer: {
      sr: "Lime Oil CP Persian Mexico je hladno ceđeno ulje kore Citrus latifolia iz Meksika. IFF ga opisuje kao fresh, juicy i zesty lime sa herbalnim facetama i blagom slatkoćom u pozadini; FCR obrada uključuje rectification radi smanjenja furokumarina.",
      en: "Lime Oil CP Persian Mexico is a cold-pressed peel oil of Citrus latifolia from Mexico. IFF describes it as fresh, juicy and zesty lime with herbal facets and a touch of sweetness in the background; FCR processing includes rectification to reduce furocoumarins.",
    },
    sources: [
      {
        label: "IFF LMR — Lime Oil CP Persian Mexico FCR",
        url: "https://www.iff.com/scent/lmr-compendium/lime-oil-cp-persian-mex-fcr-lmr/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "orange-oil-cp-bitter-egypt",
    name: "Orange Oil CP Bitter Egypt",
    aliases: [
      "bitter orange oil egypt",
      "orange oil cp bitter egypt",
      "cold pressed bitter orange",
      "citrus aurantium peel oil egypt",
    ],
    kind: "natural-material",
    answer: {
      sr: "Orange Oil CP Bitter Egypt je hladno ceđeno etarsko ulje kore Citrus aurantium. IFF ga opisuje kao čist aldehydic citrus u ravnoteži sa izraženijom fruity-floral slatkoćom, što ga odvaja od klasičnog sweet-orange profila.",
      en: "Orange Oil CP Bitter Egypt is a cold-pressed essential oil of Citrus aurantium peel. IFF describes it as balancing a clean aldehydic citrus character with enhanced fruity-floral sweetness, distinguishing it from classic sweet-orange profiles.",
    },
    sources: [
      {
        label: "IFF LMR — Orange Oil CP Bitter Egypt",
        url: "https://www.iff.com/scent/lmr-compendium/orange-oil-cp-bitter-egypt-org/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "mandarin-oil-green-italy",
    name: "Mandarin Oil Green Italy",
    aliases: [
      "green mandarin oil",
      "mandarin oil green italy",
      "green mandarin essential oil",
      "zelena mandarina ulje",
    ],
    kind: "natural-material",
    answer: {
      sr: "Mandarin Oil Green Italy je hladno presovano etarsko ulje kore nezrele zelene mandarine iz Italije. IFF ga opisuje kao veoma floralno i fruity, sa slatkim i zesty facetama; branje pre pune zrelosti daje mu veći olfaktorni impact od crvene mandarine.",
      en: "Mandarin Oil Green Italy is a cold-pressed essential oil from the peel of unripe green mandarins grown in Italy. IFF describes it as highly floral and fruity with sweet, zesty facets; harvesting before full ripeness gives it greater olfactory impact than red mandarin.",
    },
    sources: [
      {
        label: "IFF LMR — Mandarin Oil Green Italy",
        url: "https://www.iff.com/scent/lmr-compendium/mandarin-oil-green-italy/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "bergamot-oil-italy-fcr",
    name: "Bergamot Oil Italy FCR",
    aliases: [
      "bergamot oil italy fcr",
      "bergamot oil italy",
      "bergamot essential oil fcr",
      "bergamot fcr",
    ],
    kind: "natural-material",
    answer: {
      sr: "Bergamot Oil Italy FCR je hladno presovano etarsko ulje kore bergamota iz Kalabrije koje zatim prolazi molecular distillation radi uklanjanja furocoumarina. Profil ostaje zesty i fresh citrus sa floralnim i herbalnim podtonovima.",
      en: "Bergamot Oil Italy FCR is a cold-pressed essential oil from Calabrian bergamot peel that then undergoes molecular distillation to remove furocoumarins. Its profile remains zesty and fresh citrus with floral and herbal undertones.",
    },
    sources: [
      {
        label: "IFF LMR — Bergamot Oil CP Italy FCR",
        url: "https://www.iff.com/scent/lmr-compendium/bergamot-oil-cp-italy-org-fcr-csm/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "grapefruit-oil-pink-mexico-fcr",
    name: "Grapefruit Oil Pink Mexico FCR",
    aliases: [
      "pink grapefruit oil",
      "grapefruit oil pink mexico",
      "pink grapefruit essential oil fcr",
      "grapefruit fcr",
    ],
    kind: "natural-material",
    answer: {
      sr: "Grapefruit Oil Pink Mexico FCR je hladno presovano ulje kore pink grejpfruta koje zatim prolazi rectification radi smanjenja furocoumarina. IFF ga opisuje kao bitter grapefruit sa juicy fruity facetama i aldehydic nijansama.",
      en: "Grapefruit Oil Pink Mexico FCR is a cold-pressed pink-grapefruit peel oil that is then rectified to reduce furocoumarins. IFF describes it as bitter grapefruit with juicy fruity facets and aldehydic nuances.",
    },
    sources: [
      {
        label: "IFF LMR — Grapefruit Oil CP Pink Mexico FCR",
        url: "https://www.iff.com/scent/lmr-compendium/grapefruit-oil-cp-pink-mex-fcr-lmr/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "petitgrain-citronnier-oil",
    name: "Petitgrain Citronnier Oil",
    aliases: [
      "petitgrain citronnier oil",
      "lemon petitgrain oil",
      "petitgrain lemon",
      "petitgrain citronnier",
    ],
    kind: "natural-material",
    answer: {
      sr: "Petitgrain Citronnier Oil je hidrodestilovano etarsko ulje grančica i listova limuna. IFF ga opisuje kao svež i sladak citrus sa snažnim verbena karakterom i dodirom zelene gorčine — drugačiji profil od cold-pressed ulja same kore limuna.",
      en: "Petitgrain Citronnier Oil is a hydrodistilled essential oil from lemon twigs and leaves. IFF describes it as a fresh, sweet citrus with strong verbena character and a touch of green bitterness—a different profile from cold-pressed lemon-peel oil.",
    },
    sources: [
      {
        label: "IFF LMR — Petitgrain Citronnier Oil",
        url: "https://www.iff.com/scent/lmr-compendium/petitgrain-citronnier-oil/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "basil-oil-grand-vert",
    name: "Basil Oil Grand Vert",
    aliases: [
      "basil oil grand vert",
      "grand vert basil oil",
      "basil essential oil grand vert",
      "bosiljak grand vert",
    ],
    kind: "natural-material",
    answer: {
      sr: "Basil Oil Grand Vert je hidrodestilovano ulje stabljika i listova Ocimum basilicum. IFF ga opisuje kao fresh aromatic materijal snažnog leafy-green karaktera sa anisic facetama, spicy tonalitetom i blagom slatkoćom.",
      en: "Basil Oil Grand Vert is a hydrodistilled oil from the stems and leaves of Ocimum basilicum. IFF describes it as a fresh aromatic material with strong leafy-green character, anisic facets, spicy tonality and a touch of sweetness.",
    },
    sources: [
      {
        label: "IFF LMR — Basil Oil Grand Vert",
        url: "https://www.iff.com/scent/lmr-compendium/basil-oil-grand-vert-csm/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "clary-sage-absolute-france",
    name: "Clary Sage Absolute France",
    aliases: [
      "clary sage absolute",
      "sage clary absolute france",
      "clary sage abs",
      "muskatna kadulja absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Clary Sage Absolute France je absolute Salvia sclarea stabljika i cvetova dobijen solventnom ekstrakcijom i etanolnim prečišćavanjem. IFF ga opisuje kao aromatic materijal sa jasnim amber karakterom, floralno-lavender facetama i dugotrajnim tobacco backgroundom.",
      en: "Clary Sage Absolute France is an absolute of Salvia sclarea stems and flowers produced by solvent extraction followed by ethanol purification. IFF describes it as an aromatic material with a distinct amber character, floral-lavender facets and a long-lasting tobacco background.",
    },
    sources: [
      {
        label: "IFF LMR — Sage Clary Absolute France",
        url: "https://www.iff.com/scent/lmr-compendium/sage-clary-absolute-france/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "jasmin-absolute-sambac-india",
    name: "Jasmin Absolute Sambac India",
    aliases: [
      "jasmin absolute sambac",
      "jasmine sambac absolute",
      "sambac absolute india",
      "jasmin sambac abs",
    ],
    kind: "natural-material",
    answer: {
      sr: "Jasmin Absolute Sambac India je absolute Jasminum sambac cvetova dobijen solventnom ekstrakcijom i potom prečišćavanjem etanolom. IFF ga opisuje kao topao, veoma difuzivan jasmin sa snažnim fruity i green vrhom, karakterističnom indolic facetom i blagom začinskom nijansom.",
      en: "Jasmin Absolute Sambac India is an absolute of Jasminum sambac flowers produced by solvent extraction followed by purification with ethyl alcohol. IFF describes it as a warm, highly diffusive jasmine with a powerful fruity-green top, a characteristic indolic facet and subtle spiciness.",
    },
    sources: [
      {
        label: "IFF LMR — Jasmin Absolute Sambac",
        url: "https://www.iff.com/scent/lmr-compendium/jasmin-absolute-sambac/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "jasmin-absolute-egypt",
    name: "Jasmin Absolute Egypt",
    aliases: [
      "jasmin absolute egypt",
      "jasmine grandiflorum absolute",
      "egypt jasmine absolute",
      "jasmin grandiflorum abs",
    ],
    kind: "natural-material",
    answer: {
      sr: "Jasmin Absolute Egypt je absolute Jasminum grandiflorum cvetova iz Egipta dobijen solventnom ekstrakcijom i etanolnim prečišćavanjem. Profil je floralno-fruity, snažno indolic i spicy, uz zelenu nijansu i suve hay tonove.",
      en: "Jasmin Absolute Egypt is an absolute of Egyptian Jasminum grandiflorum flowers produced by solvent extraction followed by ethanol purification. Its profile is floral-fruity, strongly indolic and spicy, with a green nuance and dry hay undertones.",
    },
    sources: [
      {
        label: "IFF LMR — Jasmin Absolute Egypt",
        url: "https://www.iff.com/scent/lmr-compendium/jasmin-absolute-egypt/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "tuberose-absolute-india",
    name: "Tuberose Absolute India",
    aliases: [
      "tuberose absolute india",
      "tuberose absolute",
      "tuberoza absolute",
      "tuberose abs india",
    ],
    kind: "natural-material",
    answer: {
      sr: "Tuberose Absolute India je absolute tuberoze dobijen preko concrete faze, a zatim etanolnim prečišćavanjem. IFF ga opisuje kao opulentan, topao i sladak white-floral materijal sa spicy i green facetama, kao i coconut-toned i solar efektom.",
      en: "Tuberose Absolute India is a tuberose absolute produced through a concrete stage followed by ethanol purification. IFF describes it as an opulent, warm and sweet white-floral material with spicy and green facets plus coconut-toned and solar effects.",
    },
    sources: [
      {
        label: "IFF LMR — Tuberose Absolute India",
        url: "https://www.iff.com/scent/lmr-compendium/tuberose-abs-india-traceable/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "rose-absolute-bulgaria",
    name: "Rose Absolute Bulgaria",
    aliases: [
      "rose absolute bulgaria",
      "bulgarian rose absolute",
      "rose damascena absolute bulgaria",
      "bugarska ruza absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Rose Absolute Bulgaria je absolute Rosa damascena cvetova dobijen solventnom ekstrakcijom i etanolnim prečišćavanjem. IFF ga opisuje kao bogat, mekan i heady rose-petal profil sa spice nijansama i blagom fruitiness u vrhu.",
      en: "Rose Absolute Bulgaria is an absolute of Rosa damascena flowers produced by solvent extraction followed by ethanol purification. IFF describes it as a rich, suave and heady rose-petal profile with spicy nuances and slight fruitiness in the top.",
    },
    sources: [
      {
        label: "IFF LMR — Rose Absolute Bulgaria",
        url: "https://www.iff.com/scent/lmr-compendium/rose-absolute-bulgaria/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "narcisse-absolute-france",
    name: "Narcisse Absolute France",
    aliases: [
      "narcisse absolute france",
      "narcissus absolute france",
      "narcisse absolute",
      "narcissus poeticus absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Narcisse Absolute France je absolute Narcissus poeticus cvetova iz Francuske. IFF ga opisuje kao bogat, opojan i zelen floralni materijal sa hay i honey podtonovima; cvetovi se prvo pretvaraju u concrete, a zatim u absolute u Grasseu.",
      en: "Narcisse Absolute France is an absolute of French Narcissus poeticus flowers. IFF describes it as a rich, intoxicating green floral material with hay and honey undertones; the flowers are first transformed into a concrete and then into an absolute in Grasse.",
    },
    sources: [
      {
        label: "IFF LMR — Narcisse Absolute France",
        url: "https://www.iff.com/scent/lmr-compendium/narcisse-absolute-france/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "orange-flower-absolute-egypt",
    name: "Orange Flower Absolute Egypt",
    aliases: [
      "orange flower absolute egypt",
      "orange blossom absolute egypt",
      "bitter orange flower absolute",
      "orange flower abs egypt",
    ],
    kind: "natural-material",
    answer: {
      sr: "Orange Flower Absolute Egypt je absolute cvetova gorke pomorandže, Citrus aurantium. IFF ga opisuje kao topao i senzualan fresh-orange-flower profil sa green facetama, blagom fruitiness i honey podtonom; concrete se dalje prečišćava etanolom do absolute-a.",
      en: "Orange Flower Absolute Egypt is an absolute of bitter-orange flowers, Citrus aurantium. IFF describes it as a warm, sensual fresh-orange-flower profile with green facets, slight fruitiness and honey undertones; the concrete is further purified with ethanol into the absolute.",
    },
    sources: [
      {
        label: "IFF LMR — Orange Flower Absolute Egypt",
        url: "https://www.iff.com/scent/lmr-compendium/orange-flower-absolute-egypt/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "olibanum-oil",
    name: "Olibanum Oil",
    aliases: [
      "olibanum oil",
      "frankincense oil",
      "tamjan ulje",
      "olibanum essential oil",
    ],
    kind: "natural-material",
    answer: {
      sr: "Olibanum Oil je etarsko ulje dobijeno hidrodestilacijom gum-resina Boswellia carterii. IFF ga opisuje kao incense materijal sa spicy-pepper karakterom, citrusnim vrhom i amber-resinous pozadinom. Pošto je destilovan, profil je volatilniji i svetliji od resinoida iste sirovine.",
      en: "Olibanum Oil is an essential oil obtained by hydrodistillation of Boswellia carterii gum-resin. IFF describes it as an incense material with spicy-pepper character, citrus top facets and an amber-resinous background. Because it is distilled, its profile is more volatile and brighter than the resinoid from the same raw material.",
    },
    sources: [
      {
        label: "IFF LMR — Olibanum Oil",
        url: "https://www.iff.com/scent/lmr-compendium/olibanum-oil/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "olibanum-resinoid",
    name: "Olibanum Resinoid",
    aliases: [
      "olibanum resinoid",
      "frankincense resinoid",
      "tamjan resinoid",
      "olibanum extract",
    ],
    kind: "natural-material",
    answer: {
      sr: "Olibanum Resinoid je solventni ekstrakt gum-resina Boswellia vrsta. IFF ga opisuje kao resinous incense sa pepper i citrus nijansama, mineralnim facetama i woody-amber pozadinom. U odnosu na olibanum oil zadržava teže, manje volatilne komponente i zato djeluje punije i baznije.",
      en: "Olibanum Resinoid is a solvent extract of Boswellia gum-resin. IFF describes it as resinous incense with pepper and citrus nuances, mineral facets and a woody-amber background. Compared with olibanum oil it retains heavier, less volatile components and therefore smells fuller and more base-oriented.",
    },
    sources: [
      {
        label: "IFF LMR — Olibanum Resinoid",
        url: "https://www.iff.com/scent/lmr-compendium/olibanum-resinoid/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "myrrh-oil",
    name: "Myrrh Oil",
    aliases: [
      "myrrh oil",
      "mirra oil",
      "ulje mire",
      "myrrh essential oil",
    ],
    kind: "natural-material",
    answer: {
      sr: "Myrrh Oil je etarsko ulje dobijeno hidrodestilacijom Commiphora myrrha gum-resina. IFF ga opisuje kao topao amber-balsamic materijal sa slatkim, spicy, aromatic i liquorice nijansama i neobičnim osećajem šumske svežine.",
      en: "Myrrh Oil is an essential oil obtained by hydrodistillation of Commiphora myrrha gum-resin. IFF describes it as a warm amber-balsamic material with sweet, spicy, aromatic and liquorice nuances plus an unusual forest-fresh facet.",
    },
    sources: [
      {
        label: "IFF LMR — Myrrh Oil",
        url: "https://www.iff.com/scent/lmr-compendium/myrrh-oil-org/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "myrrh-resinoid",
    name: "Myrrh Resinoid",
    aliases: [
      "myrrh resinoid",
      "mirra resinoid",
      "resinoid mire",
      "myrrh extract",
    ],
    kind: "natural-material",
    answer: {
      sr: "Myrrh Resinoid je ekstrakt Commiphora myrrha gum-resina dobijen etanolnom ekstrakcijom, a IFF verzija dodatno prolazi molecular distillation. Profil je topao, sladak i balsamic, sa amber, liquorice i duboko resinous facetama — gušći i bazniji od destilovanog myrrh oil-a.",
      en: "Myrrh Resinoid is an extract of Commiphora myrrha gum-resin obtained by ethanol extraction, with the IFF grade additionally refined by molecular distillation. Its profile is warm, sweet and balsamic with amber, liquorice and deeply resinous facets—denser and more base-oriented than distilled myrrh oil.",
    },
    sources: [
      {
        label: "IFF LMR — Myrrh Resinoid MD",
        url: "https://www.iff.com/scent/lmr-compendium/myrrh-resinoid-md/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "labdanum-resinoid",
    name: "Labdanum Resinoid",
    aliases: [
      "labdanum resinoid",
      "labdanum extract",
      "cistus resinoid",
    ],
    kind: "natural-material",
    answer: {
      sr: "Labdanum Resinoid je etanolni ekstrakt gum-resina Cistus ladaniferus. IFF ga opisuje kao snažan, čist i profinjen amber materijal koji je istovremeno balsamic i resinous, sa smoky, leathery i blago animalic facetama.",
      en: "Labdanum Resinoid is an ethanol extract of Cistus ladaniferus gum-resin. IFF describes it as a powerful, clean and refined amber material that is both balsamic and resinous, with smoky, leathery and slightly animalic facets.",
    },
    sources: [
      {
        label: "IFF LMR — Labdanum Resinoid",
        url: "https://www.iff.com/scent/lmr-compendium/labdanum-resinoid/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "benzoin-resoid-sumatra",
    name: "Benzoin Resoid Sumatra",
    aliases: [
      "benzoin resoid sumatra",
      "sumatra benzoin",
      "benzoin sumatra",
      "styrax benzoin resinoid",
    ],
    kind: "natural-material",
    answer: {
      sr: "Benzoin Resoid Sumatra je etanolni ekstrakt Styrax benzoin gum-resina iz Indonezije. IFF ga opisuje kao sladak balsamic materijal sa vanilla akcentima, puderastim cinnamic facetama i toplim cereal nijansama. Profil je obično topliji i cimetastiji od Siam benzoin varijante.",
      en: "Benzoin Resoid Sumatra is an ethanol extract of Styrax benzoin gum-resin from Indonesia. IFF describes it as a sweet balsamic material with vanilla accents, powdery cinnamic facets and warm cereal nuances. Its profile is generally warmer and more cinnamic than the Siam benzoin variant.",
    },
    sources: [
      {
        label: "IFF LMR — Benzoin Resoid Sumatra",
        url: "https://www.iff.com/scent/lmr-compendium/benzoin-resoid-sumatra/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "hydrodistillation",
    name: "Hydrodistillation",
    aliases: [
      "hydrodistillation",
      "hydro distillation",
      "hidrodestilacija",
      "destilacija vodom",
    ],
    kind: "process",
    answer: {
      sr: "Hidrodestilacija je postupak u kojem se biljni ili resinous materijal zagreva sa vodom, a volatilne aromatične komponente prelaze sa vodenom parom i zatim se kondenzuju. Zato prvenstveno hvata lakše, volatilnije molekule i često daje svetliji profil od solventnih ekstrakata iste sirovine.",
      en: "Hydrodistillation heats botanical or resinous material with water so volatile aromatic components travel with steam and are then condensed. It therefore primarily captures lighter, more volatile molecules and often produces a brighter profile than solvent extracts from the same raw material.",
    },
    sources: [
      {
        label: "IFF LMR — Olibanum Oil process",
        url: "https://www.iff.com/scent/lmr-compendium/olibanum-oil/",
        type: "manufacturer-official",
      },
      {
        label: "IFF LMR — Myrrh Oil process",
        url: "https://www.iff.com/scent/lmr-compendium/myrrh-oil-org/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "resinoid",
    name: "Resinoid",
    aliases: [
      "resinoid",
      "resinoid extract",
      "rezinoid",
      "parfemski resinoid",
    ],
    kind: "material-form",
    answer: {
      sr: "Resinoid je ekstrakt dobijen iz suvog biljnog materijala — često gum-resina — korišćenjem najmanje jednog rastvarača. Za razliku od destilovanog etarskog ulja, resinoid zadržava više težih i manje volatilnih komponenti, pa je tipično gušći, topliji i važniji u srcu i bazi parfema.",
      en: "A resinoid is an extract obtained from dry plant material—often gum-resin—using at least one solvent. Unlike a distilled essential oil, a resinoid retains more heavy and less volatile components, making it typically denser, warmer and more important in the heart and base of a fragrance.",
    },
    sources: [
      {
        label: "IFF LMR — Compendium definitions",
        url: "https://www.iff.com/scent/lmr-naturals/compendium-about/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "concrete-extract",
    name: "Concrete",
    aliases: [
      "concrete perfume extract",
      "concrete extract",
      "parfemski concrete",
      "konkret ekstrakt",
    ],
    kind: "material-form",
    answer: {
      sr: "Concrete je voštani aromatični međuproizvod koji nastaje solventnom ekstrakcijom biljnog materijala, naročito cvetova. Daljom obradom i prečišćavanjem etanolom iz concrete-a se dobija absolute, čime se uklanja veliki deo voskova i dobija koncentrisaniji mirisni ekstrakt.",
      en: "A concrete is a waxy aromatic intermediate produced by solvent extraction of botanical material, especially flowers. Further processing and purification with ethanol converts the concrete into an absolute, removing much of the wax and yielding a more concentrated aromatic extract.",
    },
    sources: [
      {
        label: "IFF LMR — Narcisse Absolute France",
        url: "https://www.iff.com/scent/lmr-compendium/narcisse-absolute-france/",
        type: "manufacturer-official",
      },
      {
        label: "IFF LMR — Jasmin Absolute India",
        url: "https://www.iff.com/scent/lmr-compendium/jasmin-abs-india-lmr-for-life/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "molecular-distillation",
    name: "Molecular Distillation",
    aliases: [
      "molecular distillation",
      "molekularna destilacija",
      "molecular distilled",
      "md extract",
    ],
    kind: "process",
    answer: {
      sr: "Molecular distillation je blaga vakuumska separacija koja omogućava rafinisanje ekstrakta uz manje termičko opterećenje. U prirodnoj parfimeriji koristi se da se iz resinoida ili absolute-a izdvoje ili koncentrišu poželjne olfaktorne frakcije; IFF je, na primer, koristi kod myrrh resinoida, rose absolute-a i blackcurrant bud absolute-a.",
      en: "Molecular distillation is a gentle vacuum-separation technique that refines extracts with reduced thermal stress. In natural perfumery it can isolate or concentrate desirable olfactory fractions from resinoids or absolutes; IFF uses it, for example, with myrrh resinoid, rose absolute and blackcurrant bud absolute.",
    },
    sources: [
      {
        label: "IFF LMR — Myrrh Resinoid MD",
        url: "https://www.iff.com/scent/lmr-compendium/myrrh-resinoid-md/",
        type: "manufacturer-official",
      },
      {
        label: "IFF LMR — Rose Absolute MD Turkey",
        url: "https://www.iff.com/scent/lmr-compendium/rose-abs-md-turkey-for-life/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "maltol",
    name: "Maltol",
    aliases: [
      "maltol",
      "maltol caramel",
      "maltol gourmand",
      "corps praline",
    ],
    kind: "material",
    answer: {
      sr: "Maltol je sladak gourmand materijal sa karakterističnim caramel-butterscotch, baked i blago fruity efektom. U parfimeriji se koristi za davanje topline, caramelized-sugar utiska i mekoće gourmand, fruity i balsamic akordima.",
      en: "Maltol is a sweet gourmand material with characteristic caramel-butterscotch, baked and slightly fruity effects. In perfumery it is used to add warmth, caramelised-sugar impressions and softness to gourmand, fruity and balsamic accords.",
    },
    sources: [
      {
        label: "PubChem — Maltol",
        url: "https://pubchem.ncbi.nlm.nih.gov/compound/Maltol",
        type: "scientific-reference",
      },
    ],
  },
  {
    id: "coffee-absolute-salvador",
    name: "Coffee Absolute Salvador",
    aliases: [
      "coffee absolute salvador",
      "coffee absolute",
      "coffee abs",
      "arabica coffee absolute",
      "kafa absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Coffee Absolute Salvador je Givaudan prirodni ekstrakt prženih Arabica zrna iz El Salvadora. Ima topao, toasted i velvety roasted-coffee profil sa suvim woody, cereal i vanilla-like nijansama, a Givaudan ga koristi i kao bazu za chocolate, vanilla, tobacco i leather akorde.",
      en: "Coffee Absolute Salvador is a Givaudan natural extract of roasted Arabica beans from El Salvador. It has a warm, toasted and velvety roasted-coffee profile with dry woody, cereal and vanilla-like nuances, and Givaudan also uses it as a base for chocolate, vanilla, tobacco and leather accords.",
    },
    sources: [
      {
        label: "Givaudan — Coffee Absolute Salvador",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/natural-ingredients/coffee-absolute-salvador",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "tonka-bean-absolute-brazil",
    name: "Tonka Bean Absolute Brazil",
    aliases: [
      "tonka bean absolute brazil",
      "tonka absolute",
      "tonka bean absolute",
      "tonka absolute brazil",
    ],
    kind: "natural-material",
    answer: {
      sr: "Tonka Bean Absolute Brazil je Givaudan prirodni ekstrakt Dipteryx odorata zrna. Profil je intenzivno gourmand, puderast i almond/vanilla-like, sa suvim woody i tobacco facetama; prirodno je bogat coumarin karakterom i važan u amber, fougère, tobacco i gourmand akordima.",
      en: "Tonka Bean Absolute Brazil is a Givaudan natural extract of Dipteryx odorata beans. Its profile is intensely gourmand, powdery and almond/vanilla-like, with dry woody and tobacco facets; its coumarinic character makes it important in amber, fougère, tobacco and gourmand accords.",
    },
    sources: [
      {
        label: "Givaudan — Tonka Bean Absolute Brazil",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/natural-ingredients/tonka-bean-absolute-brazil",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "cocoa-absolute",
    name: "Cocoa Absolute",
    aliases: [
      "cocoa absolute",
      "cacao absolute",
      "cocoa abs",
      "kakao absolute",
    ],
    kind: "natural-material",
    answer: {
      sr: "Cocoa Absolute je prirodni ekstrakt kakao materijala bogatog, tamnog chocolate profila sa roasted, earthy i blago smoky facetama. U fine fragrance kompozicijama daje stvarnu cocoa dubinu i koristi se za gourmand, chocolate, amber i tobacco efekte.",
      en: "Cocoa Absolute is a natural cocoa extract with a rich dark-chocolate profile and roasted, earthy and slightly smoky facets. In fine fragrance it provides authentic cocoa depth and is used in gourmand, chocolate, amber and tobacco effects.",
    },
    sources: [
      {
        label: "Lush — Cocoa Absolute",
        url: "https://www.lush.com/us/en_us/i/cocoa-absolute",
        type: "ingredient-reference",
      },
    ],
  },
  {
    id: "maple-lactone",
    name: "Maple Lactone",
    aliases: [
      "maple lactone",
      "cyclotene",
      "cikloten",
      "maple syrup molecule",
    ],
    kind: "material",
    answer: {
      sr: "Maple Lactone, poznat i kao Cyclotene, gourmand je materijal izrazito slatkog maple-syrup i caramelized-sugar karaktera sa toplim woody i blagim fruity nijansama. Koristi se za maple, caramel, praline i roasted-sugar efekte.",
      en: "Maple Lactone, also known as Cyclotene, is a gourmand material with a strongly sweet maple-syrup and caramelised-sugar character plus warm woody and slight fruity nuances. It is used for maple, caramel, praline and roasted-sugar effects.",
    },
    sources: [
      {
        label: "WHO JECFA — Maple Lactone",
        url: "https://apps.who.int/food-additives-contaminants-jecfa-database/Home/Chemical/5120",
        type: "scientific-reference",
      },
    ],
  },

  {
    id: "aldehyde-iso-c11",
    name: "Aldehyde Iso C11",
    aliases: [
      "aldehyde iso c11",
      "iso c11 aldehyde",
      "aldehid iso c11",
      "c11 iso aldehyde",
    ],
    kind: "material",
    answer: {
      sr: "Aldehyde Iso C11 je Givaudan fatty aldehyde izrazito svežeg, kompleksnog green/rose karaktera. Givaudan navodi da je nekoliko puta snažniji od C11 Undecylenic i posebno efikasan u modernim soap akordima, uz odličnu substantivnost na tkanini.",
      en: "Aldehyde Iso C11 is a Givaudan fatty aldehyde with a very fresh, complex green-rose character. Givaudan states that it is several times stronger than C11 Undecylenic and especially effective in modern soap accords, with excellent fabric substantivity.",
    },
    sources: [
      {
        label: "Givaudan — Aldehyde Iso C11",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/aldehyde-iso-c-11",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "syringa-aldehyde",
    name: "Syringa Aldehyde",
    aliases: [
      "syringa aldehyde",
      "syringa aldehid",
      "lilac aldehyde",
      "syringa floral aldehyde",
    ],
    kind: "material",
    answer: {
      sr: "Syringa Aldehyde je Givaudan floral-green aldehid sa snažnim lilac, hyacinth i rose efektom. Najčešće radi kao top-note booster u floralnim akordima i manje je pungentan od phenyl acetaldehydea.",
      en: "Syringa Aldehyde is a Givaudan floral-green aldehyde with strong lilac, hyacinth and rose effects. It is commonly used as a top-note booster in floral accords and is less pungent than phenyl acetaldehyde.",
    },
    sources: [
      {
        label: "Givaudan — Syringa Aldehyde 50%",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/syringa-aldehyde-50",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "myrac-aldehyde",
    name: "Myrac Aldehyde",
    aliases: [
      "myrac aldehyde",
      "myrac aldehid",
      "myrac",
      "clean outdoors aldehyde",
    ],
    kind: "material",
    answer: {
      sr: "Myrac Aldehyde je IFF fresh aldehid sa orange, ozonic i fruity karakterom. Veoma je snažan i postojan i daje čist outdoors efekat, zbog čega dobro povezuje citrus, fresh-air i functional-clean akorde.",
      en: "Myrac Aldehyde is an IFF fresh aldehyde with orange, ozonic and fruity characteristics. It is strong and persistent, producing a clean outdoors effect that can bridge citrus, fresh-air and functional-clean accords.",
    },
    sources: [
      {
        label: "IFF — Myrac Aldehyde",
        url: "https://www.iff.com/scent/ingredients-compendium/myrac-aldehyde/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "cyclamen-aldehyde-extra",
    name: "Cyclamen Aldehyde Extra",
    aliases: [
      "cyclamen aldehyde extra",
      "cyclamen aldehyde",
      "ciklama aldehid",
      "cyclamen marine aldehyde",
    ],
    kind: "material",
    answer: {
      sr: "Cyclamen Aldehyde Extra je Givaudan floral-green aldehid visoke snage i postojanosti. Posebno dobro radi u marine, fruity i watermelon akordima i često donosi čist, vodeni cyclamen efekat uz odlične performanse u soap i fabric bazama.",
      en: "Cyclamen Aldehyde Extra is a powerful, substantive Givaudan floral-green aldehyde. It works especially well in marine, fruity and watermelon accords, providing a clean watery-cyclamen effect with excellent soap and fabric performance.",
    },
    sources: [
      {
        label: "Givaudan — Cyclamen Aldehyde Extra",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/cyclamen-aldehyde-extra",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "cortex-aldehyde",
    name: "Cortex Aldehyde",
    aliases: [
      "cortex aldehyde",
      "cortex aldehid",
      "green stem aldehyde",
      "flower shop aldehyde",
    ],
    kind: "material",
    answer: {
      sr: "Cortex Aldehyde je IFF green aldehid sa stem-like i flower-shop karakterom. Koristi se kada parfemu treba prirodniji outdoors osećaj, svežina stabljike i zelena floralna tekstura.",
      en: "Cortex Aldehyde is an IFF green aldehyde with a stem-like, flower-shop character. It is used to give fragrances a more natural outdoors feeling, stem freshness and green floral texture.",
    },
    sources: [
      {
        label: "IFF — Cortex Aldehyde 50% TEC",
        url: "https://www.iff.com/scent/ingredients-compendium/cortex-aldehyde-50-tec/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "pino-acetaldehyde",
    name: "Pino Acetaldehyde",
    aliases: [
      "pino acetaldehyde",
      "pino aldehyde",
      "pino acetaldehid",
      "marine pine aldehyde",
    ],
    kind: "material",
    answer: {
      sr: "Pino Acetaldehyde je IFF fresh aldehid sa herbal, marine, watery, woody i balsamic aspektima, uz pine karakter i sea-breeze efekat. Posebno je koristan kada fresh ili marine kompoziciji treba više prirodne drvenaste i balsamične dubine.",
      en: "Pino Acetaldehyde is an IFF fresh aldehyde with herbal, marine, watery, woody and balsamic aspects plus pine character and a sea-breeze effect. It is especially useful when a fresh or marine composition needs more natural woody and balsamic depth.",
    },
    sources: [
      {
        label: "IFF — Pino Acetaldehyde",
        url: "https://www.iff.com/scent/ingredients-compendium/pino-acetaldehyde/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "javanol",
    name: "Javanol",
    aliases: [
      "javanol",
      "javanol sandalwood",
      "javanol molecule",
      "javanol molekul",
    ],
    kind: "material",
    answer: {
      sr: "Javanol™ je Givaudan sandalwood molekula izuzetne snage i postojanosti. Ima bogat, prirodno delujući kremasti sandalwood karakter sa blagim rosy nijansama i može se koristiti i u vrlo malim dozama da doda punoću i kremastost akordima.",
      en: "Javanol™ is a Givaudan sandalwood molecule of exceptional power and substantivity. It has a rich, natural-smelling creamy sandalwood character with subtle rosy nuances and can be used at very low dosage to add richness and creaminess to accords.",
    },
    sources: [
      {
        label: "Givaudan — Javanol",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/javanol",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "bacdanol",
    name: "Bacdanol",
    aliases: [
      "bacdanol",
      "bacdanol sandalwood",
      "bacdanol molecule",
      "bakdanol",
    ],
    kind: "material",
    answer: {
      sr: "Bacdanol® je IFF woody materijal sa snažnom i vrlo realističnom sandalwood notom. Izuzetno je difuzivan i postojan, a proizvođač posebno navodi njegovu sposobnost da dugotrajno podrži floralne akorde.",
      en: "Bacdanol® is an IFF woody material with a powerful, true sandalwood note. It is extremely diffusive and long-lasting, and the manufacturer specifically highlights its ability to provide durable support to floral accords.",
    },
    sources: [
      {
        label: "IFF — Bacdanol",
        url: "https://www.iff.com/scent/ingredients-compendium/bacdanol/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "polysantol",
    name: "Polysantol",
    aliases: [
      "polysantol",
      "polysantol sandalwood",
      "polysantol molecule",
      "polisantal",
    ],
    kind: "material",
    answer: {
      sr: "Polysantol® je dsm-firmenich sintetička sandalwood molekula dubokog i difuzivnog karaktera koji naglašava prirodnu kremastost istočnoindijskog sandalwooda. Veoma je postojan i koristi se u woody, musky, milky i sandalwood akordima.",
      en: "Polysantol® is a dsm-firmenich synthetic sandalwood molecule with a deep, diffusive character emphasizing the natural creaminess of East Indian sandalwood. It is highly substantive and is used in woody, musky, milky and sandalwood accords.",
    },
    sources: [
      {
        label: "dsm-firmenich — POLYSANTOL",
        url: "https://studio.dsm-firmenich.com/product/polysantolr-pe-974656",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "cedramber",
    name: "Cedramber",
    aliases: [
      "cedramber",
      "cedramber cedar",
      "cedramber ambergris",
      "cedramber molecule",
    ],
    kind: "material",
    answer: {
      sr: "Cedramber® je IFF dry woody materijal koji spaja ambergris efekat sa bogatim suvim cedarwood aspektom. Veoma je difuzivan, traje duže od 48 sati i dobro radi kao most između cedar, amber i dry-woods struktura.",
      en: "Cedramber® is an IFF dry woody material combining an ambergris effect with a rich, dry cedarwood aspect. It is highly diffusive, lasts beyond 48 hours and works well as a bridge between cedar, amber and dry-woods structures.",
    },
    sources: [
      {
        label: "IFF — Cedramber",
        url: "https://www.iff.com/scent/ingredients-compendium/cedramber/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "cedroxyde",
    name: "Cedroxyde",
    aliases: [
      "cedroxyde",
      "cedroxyde cedar",
      "cedroxyde woody",
      "cedroxide",
    ],
    kind: "material",
    answer: {
      sr: "Cedroxyde® je dsm-firmenich sintetička woody molekula snažne i kompleksne dry-wood note sa cedarwood, patchouli i ambery facetama. Može pojačati suve amber akorde i dati elegantniju drvenastu strukturu chypre, fougère i oriental kompozicijama.",
      en: "Cedroxyde® is a dsm-firmenich synthetic woody molecule with a powerful, complex dry-wood note featuring cedarwood, patchouli and ambery facets. It can strengthen dry amber accords and add elegant woody structure to chypre, fougère and oriental compositions.",
    },
    sources: [
      {
        label: "dsm-firmenich — CEDROXYDE",
        url: "https://studio.dsm-firmenich.com/product/cedroxyder-pe-922470",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "timberol",
    name: "Timberol",
    aliases: [
      "timberol",
      "timberol woody",
      "timberol cedar",
      "timberol amber",
    ],
    kind: "material",
    answer: {
      sr: "Timberol® je Symrise woody-amber materijal sa cedarwood i ambergris karakterom. Proizvođač ga opisuje kao snažan modifier woody akorda: u nižim dozama može ojačati floralnu stranu, a u višim daje izrazito suv i snažan woody potpis.",
      en: "Timberol® is a Symrise woody-amber material with cedarwood and ambergris character. The manufacturer describes it as a powerful modifier for woody accords: at lower dosage it can reinforce floral facets, while higher levels create a distinctly dry and powerful woody signature.",
    },
    sources: [
      {
        label: "Symrise — Timberol",
        url: "https://www.symrise.com/fileadmin/symrise/Marketing/Scent_and_care/Aroma_molecules/Ingredient_finder/SYM_PC_Datenblaetter/SYM_PC-Timberol.pdf",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "galaxolide",
    name: "Galaxolide",
    aliases: [
      "galaxolide",
      "galaxolide musk",
      "galaxolid",
      "galaxolide clean musk",
    ],
    kind: "material",
    answer: {
      sr: "Galaxolide™ je IFF polycyclic musk veoma čistog, snažnog i svestranog karaktera. Ima izuzetnu postojanost dužu od 48 sati i kvalitet koji se približava tonu macrocyclic muskova, ali pripada drugoj hemijskoj porodici.",
      en: "Galaxolide™ is an IFF polycyclic musk with a very clean, powerful and versatile character. It has exceptional persistence beyond 48 hours and a quality approaching the tone of macrocyclic musks, while belonging to a different chemical family.",
    },
    sources: [
      {
        label: "IFF — Galaxolide",
        url: "https://www.iff.com/scent/ingredients-compendium/galaxolide-undiluted/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "velvione",
    name: "Velvione",
    aliases: [
      "velvione",
      "velvione musk",
      "velvion",
      "velvione macrocyclic musk",
    ],
    kind: "material",
    answer: {
      sr: "Velvione™ je Givaudan macrocyclic musk snažnog puderastog karaktera sa blagim animalic aspektom. Veoma je postojan, stabilan i biorazgradiv, a u fine fragrance formulama daje puderasti volumen i mekanu musk teksturu.",
      en: "Velvione™ is a Givaudan macrocyclic musk with a powerful powdery character and a slight animalic aspect. It is highly substantive, stable and biodegradable, adding powdery volume and musky softness in fine fragrance.",
    },
    sources: [
      {
        label: "Givaudan — Velvione",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/velvionetm",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "muscemor",
    name: "Muscemor",
    aliases: [
      "muscemor",
      "muscemor musk",
      "musk emor",
      "muscemor animalic",
    ],
    kind: "material",
    answer: {
      sr: "Muscemor je IFF musk sa musk-ketone-sličnim i animalic karakterom. Za razliku od izrazito clean muskova, daje više klasične musk dubine i prirodnijeg animalic tona, uz dobru stabilnost i fine-fragrance performanse.",
      en: "Muscemor is an IFF musk with a musk-ketone-like and animalic character. Unlike strongly clean musks, it brings more classical musk depth and a more natural animalic tone, with good stability and fine-fragrance performance.",
    },
    sources: [
      {
        label: "IFF — Muscemor",
        url: "https://www.iff.com/scent/ingredients-compendium/muscemor/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "hexadecanolide",
    name: "Hexadecanolide",
    aliases: [
      "hexadecanolide",
      "hexadecanolide musk",
      "hexadecanolid",
      "sweet macrocyclic musk",
    ],
    kind: "material",
    answer: {
      sr: "Hexadecanolide je IFF macrocyclic musk slatkog, difuzivnog i veoma postojanog karaktera sa balsamic i animalic efektima. IFF ga navodi kao materijal sa više od 48 sati substantivnosti i veoma dobrim fine-fragrance performansama.",
      en: "Hexadecanolide is an IFF macrocyclic musk with a sweet, diffusive and highly persistent character plus balsamic and animalic effects. IFF lists substantivity beyond 48 hours and very good fine-fragrance performance.",
    },
    sources: [
      {
        label: "IFF — Hexadecanolide",
        url: "https://www.iff.com/scent/ingredients-compendium/hexadecanolide/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "zenolide",
    name: "Zenolide",
    aliases: [
      "zenolide",
      "zenolide musk",
      "zenolid",
      "zenolide red fruit",
    ],
    kind: "material",
    answer: {
      sr: "Zenolide je IFF macrocyclic musk mekog, nežnog karaktera sa diskretnom red-fruit nijansom. Spaja musk mekoću i veoma dugu substantivnost sa voćnim akcentom koji ga razlikuje od neutralnijih clean muskova.",
      en: "Zenolide is an IFF macrocyclic musk with a soft, delicate character and a subtle red-fruit nuance. It combines musky softness and very long substantivity with a fruity accent that distinguishes it from more neutral clean musks.",
    },
    sources: [
      {
        label: "IFF — Zenolide",
        url: "https://www.iff.com/scent/ingredients-compendium/zenolide/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "orionide-oliffac",
    name: "Orionide Oliffac",
    aliases: [
      "orionide oliffac",
      "orionide",
      "orionide musk",
      "orionide clean musk",
    ],
    kind: "material",
    answer: {
      sr: "Orionide™ Oliffac™ je IFF musk baza veoma čistog, kremastog i difuzivnog karaktera sa blagom floralnom i prirodno animalic facetom. Proizvođač navodi substantivnost dužu od nedelju dana i posebno snažan efekat kroz vrh, srce i bazu.",
      en: "Orionide™ Oliffac™ is an IFF musk base with a very clean, creamy and diffusive character plus subtle floral and natural animalic facets. The manufacturer lists substantivity beyond one week and strong performance through top, heart and base.",
    },
    sources: [
      {
        label: "IFF — Orionide Oliffac",
        url: "https://www.iff.com/scent/ingredients-compendium/orionide-oliffac/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "floralozone",
    name: "Floralozone",
    aliases: [
      "floralozone",
      "floral ozone",
      "floralozone ozonic",
      "floralozone marine",
    ],
    kind: "material",
    answer: {
      sr: "Floralozone je IFF molekula snažnog, čistog green/fresh-air karaktera koji podseća na morski povetarac. Daje ozonični lift kompoziciji bez preuzimanja cele strukture i veoma je substantivna.",
      en: "Floralozone is an IFF molecule with a powerful clean green/fresh-air character reminiscent of ocean breezes. It gives fragrances an ozonic lift without dominating the whole structure and is highly substantive.",
    },
    sources: [
      {
        label: "IFF — Floralozone",
        url: "https://www.iff.com/scent/ingredients-compendium/floralozone/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "helional",
    name: "Helional",
    aliases: [
      "helional",
      "helional ozone",
      "helional aquatic",
      "helional cyclamen",
    ],
    kind: "material",
    answer: {
      sr: "Helional® je IFF floralno-ozonični materijal zelenog cyclamen karaktera, sa top notama ozona i sveže pokošenog sena. Često služi kao most između watery, floral i green struktura.",
      en: "Helional® is an IFF floral-ozonic material with a green cyclamen character and top notes of ozone and freshly cut hay. It often acts as a bridge between watery, floral and green structures.",
    },
    sources: [
      {
        label: "IFF — Helional",
        url: "https://www.iff.com/scent/ingredients-compendium/helional/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "aquaflora",
    name: "Aquaflora",
    aliases: [
      "aquaflora",
      "aqua flora",
      "aquaflora aquatic",
      "aquaflora muguet",
    ],
    kind: "material",
    answer: {
      sr: "Aquaflora je IFF transparentan aquatic-muguet materijal sa svežim green i cyclamen efektom. Povećava telo parfema i daje prirodniji watery floral osećaj u transparentnim muguet i cyclamen akordima.",
      en: "Aquaflora is an IFF transparent aquatic-muguet material with fresh green and cyclamen effects. It increases fragrance body and gives a more natural watery-floral quality to transparent muguet and cyclamen accords.",
    },
    sources: [
      {
        label: "IFF — Aquaflora",
        url: "https://www.iff.com/scent/ingredients-compendium/aquaflora/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "tropicalia",
    name: "Tropicalia",
    aliases: [
      "tropicalia",
      "tropicalia fruity",
      "tropicalia tropical",
      "tropicalia molecule",
    ],
    kind: "material",
    answer: {
      sr: "Tropicalia™ je IFF veoma snažan fruity materijal sa tropskim mango, guava, melon i jackfruit efektima, uz blagu green-minty i white-floral nijansu. U tragovima može dodati i animalic/castoreum dubinu leather i chypre akordima.",
      en: "Tropicalia™ is a very powerful IFF fruity material with tropical mango, guava, melon and jackfruit effects plus a slight green-minty and white-floral nuance. At trace levels it can also add animalic/castoreum depth to leather and chypre accords.",
    },
    sources: [
      {
        label: "IFF — Tropicalia",
        url: "https://www.iff.com/scent/ingredients-compendium/tropicalia/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "methyl-laitone",
    name: "Methyl Laitone",
    aliases: [
      "methyl laitone",
      "methyl lactone",
      "metil laitone",
      "methyl laitone creamy",
    ],
    kind: "material",
    answer: {
      sr: "Methyl Laitone je Givaudan spiro-lactone materijal izrazito kremastog, fruity i coconut-milk karaktera. Daje gustinu white-floral akordima poput jasmina, gardenije i tuberoze, kao i mlečnost peach, osmanthus i sandalwood strukturama.",
      en: "Methyl Laitone is a Givaudan spiro-lactone material with an intensely creamy, fruity, coconut-milk character. It adds density to white-floral accords such as jasmine, gardenia and tuberose, and milkiness to peach, osmanthus and sandalwood structures.",
    },
    sources: [
      {
        label: "Givaudan — Methyl Laitone",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/methyl-laitone-10tec",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "frutonile",
    name: "Frutonile",
    aliases: [
      "frutonile",
      "frutonile peach",
      "frutonile lactonic",
      "frutonile molecule",
    ],
    kind: "material",
    answer: {
      sr: "Frutonile je Givaudan fruity materijal intenzivnog peach karaktera sa lactonic podtonom. Stabilan je kroz širok pH raspon i omogućava postojan, jasan voćni efekat pri niskim koncentracijama.",
      en: "Frutonile is a Givaudan fruity material with an intense peach character and lactonic undertones. It is stable across a wide pH range and provides a clear, persistent fruity effect at low concentration.",
    },
    sources: [
      {
        label: "Givaudan — Frutonile",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/frutonile",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "ultravanil",
    name: "Ultravanil",
    aliases: [
      "ultravanil",
      "ultra vanil",
      "ultravanil vanilla",
      "ultravanil molecule",
    ],
    kind: "material",
    answer: {
      sr: "Ultravanil je Givaudan vanillic materijal veoma snažnog vanilla-absolute karaktera sa izraženom phenolic pozadinom. Koristi se u malim količinama kao booster za druge vanillic materijale i znatno manje menja boju formule od klasičnog vanillina ili ethyl vanillina.",
      en: "Ultravanil is a Givaudan vanillic material with a very powerful vanilla-absolute character and a pronounced phenolic background. It is used at low levels as a booster for other vanillic materials and discolours formulas much less than classic vanillin or ethyl vanillin.",
    },
    sources: [
      {
        label: "Givaudan — Ultravanil 80%/DPG",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/ultravanil-80dpg",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "isobutavan",
    name: "Isobutavan",
    aliases: [
      "isobutavan",
      "isobuta van",
      "isobutavan vanilla",
      "isobutavan molecule",
    ],
    kind: "material",
    answer: {
      sr: "Isobutavan je Givaudan gourmand-vanilla materijal slatkog i kremastog karaktera koji može podsjetiti na belu čokoladu, cream soda efekat i mekanu kajsiju. Manje je puderast od vanillina i značajno manje sklon promeni boje formule.",
      en: "Isobutavan is a Givaudan gourmand-vanilla material with a sweet, creamy character reminiscent of white chocolate, cream soda and soft apricot. It is less powdery than vanillin and substantially less prone to formula discolouration.",
    },
    sources: [
      {
        label: "Givaudan — Isobutavan",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/isobutavan",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "okoumal",
    name: "Okoumal",
    aliases: [
      "okoumal",
      "okoumal amber",
      "okoumal woody",
      "okumal",
    ],
    kind: "material",
    answer: {
      sr: "Okoumal™ je Givaudan woody-amber materijal sa dodatnim tobacco i musky facetama. Daje volumen, bogatstvo i toplinu, vrlo je postojan i posebno dobro radi uz cedar, patchouli i sandalwood materijale.",
      en: "Okoumal™ is a Givaudan woody-amber material with additional tobacco and musky facets. It adds volume, richness and warmth, is extremely long-lasting and works especially well with cedar, patchouli and sandalwood materials.",
    },
    sources: [
      {
        label: "Givaudan — Okoumal",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/okoumaltm",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "cetalor",
    name: "Cetalor",
    aliases: [
      "cetalor",
      "cetalor ambergris",
      "cetalor amber",
      "cetalor molecule",
    ],
    kind: "material",
    answer: {
      sr: "Cetalor je IFF ambergris materijal snažnog amber-woody karaktera. Proizvođač ga opisuje kao jednu od svojih najfinijih ambergris nota, sa bogatim i elegantnim efektom, visokim uticajem u srcu i bazi i substantivnošću dužom od 48 sati.",
      en: "Cetalor is an IFF ambergris material with a powerful amber-woody character. The manufacturer describes it as one of its finest ambergris notes, with a rich elegant effect, high heart and base impact and substantivity beyond 48 hours.",
    },
    sources: [
      {
        label: "IFF — Cetalor",
        url: "https://www.iff.com/scent/ingredients-compendium/cetalor/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "ambermax",
    name: "Ambermax",
    aliases: [
      "ambermax",
      "amber max",
      "ambermax amber",
      "ambermax molecule",
    ],
    kind: "material",
    answer: {
      sr: "Ambermax™ je Givaudan veoma snažan suv amber materijal sa woody/cedar facetama. Odlikuju ga izrazita substantivnost i velika efikasnost, a proizvođač ga pozicionira kao jedan od ključnih building blockova u modernoj ambery-woody paleti.",
      en: "Ambermax™ is a very powerful dry ambery material from Givaudan with woody and cedarwood facets. It is highly substantive and efficient, and the manufacturer positions it as a key building block in the modern ambery-woody palette.",
    },
    sources: [
      {
        label: "Givaudan — Ambermax",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/ambermaxtm-10tec",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "benzoin-resoid-siam",
    name: "Benzoin Resoid Siam",
    aliases: [
      "benzoin resoid siam",
      "siam benzoin",
      "benzoin siam",
      "benzoin resinoid",
      "benzoin resoid",
    ],
    kind: "natural-material",
    answer: {
      sr: "Benzoin Resoid Siam je prirodni IFF/LMR ekstrakt smole Styrax tonkinensis iz Laosa i Vijetnama. Profil je sladak, puderast i balsamičan, sa vanilla, cinnamic i resinous-amber nijansama; dobija se ekstrakcijom gum-resina etil alkoholom.",
      en: "Benzoin Resoid Siam is a natural IFF/LMR extract of Styrax tonkinensis gum-resin from Laos and Vietnam. Its profile is sweet, powdery and balsamic with vanilla, cinnamic and resinous-amber facets, produced by extraction with ethyl alcohol.",
    },
    sources: [
      {
        label: "IFF LMR — Benzoin Resoid Siam",
        url: "https://www.iff.com/scent/lmr-compendium/benzoin-resoid-siam/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "iso-butyl-quinoline",
    name: "Iso Butyl Quinoline",
    aliases: [
      "iso butyl quinoline",
      "isobutyl quinoline",
      "ibq",
      "iso butil kinolin",
      "isobutil kinolin",
    ],
    kind: "material",
    answer: {
      sr: "Iso Butyl Quinoline je IFF leather materijal veoma intenzivnog zemljanog, kožnog, korenastog i orašastog karaktera. Ima i drvenaste, ambraste i tobacco nijanse i posebno dobro se kombinuje sa oakmoss i vetiver strukturama.",
      en: "Iso Butyl Quinoline is an IFF leather material with an intense earthy, leathery, rooty and nutty character. It also shows woody, ambery and tobacco-like facets and blends especially well with oakmoss and vetiver structures.",
    },
    sources: [
      {
        label: "IFF — Iso Butyl Quinoline",
        url: "https://www.iff.com/scent/ingredients-compendium/iso-butyl-quinoline/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "safraleine",
    name: "Safraleine",
    aliases: [
      "safraleine",
      "safraleine saffron",
      "safraleine leather",
      "safralein",
    ],
    kind: "material",
    answer: {
      sr: "Safraleine™ je Givaudan spicy materijal toplog, snažnog saffron karaktera sa kožnim, drvenastim i tobacco facetama. Kompleksnost dodatno uključuje floralne nijanse slične rose-ketone materijalima, pa može povezati spice, leather i floral akorde.",
      en: "Safraleine™ is a Givaudan spicy material with a warm, powerful saffron character and leathery, woody and tobacco facets. Its complexity also includes rose-ketone-like floral nuances, allowing it to bridge spice, leather and floral accords.",
    },
    sources: [
      {
        label: "Givaudan — Safraleine",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/safraleinetm",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "safranal",
    name: "Safranal",
    aliases: [
      "safranal",
      "safranal saffron",
      "safranal molekul",
      "safranal molecule",
    ],
    kind: "material",
    answer: {
      sr: "Safranal je Givaudan materijal sa začinskom saffron notom, herbalnim i tobacco facetama i diskretnim floralnim podtonom. Proizvođač ga navodi kao naročito koristan u spicy, tobacco, orris i woody kompozicijama.",
      en: "Safranal is a Givaudan material with a spicy saffron note, herbaceous and tobacco facets and subtle floral undertones. The manufacturer highlights it as especially useful in spicy, tobacco, orris and woody compositions.",
    },
    sources: [
      {
        label: "Givaudan — Safranal",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/safranal",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "kephalis",
    name: "Kephalis",
    aliases: [
      "kephalis",
      "kephalis tobacco",
      "kephalis woody",
      "kefalis",
    ],
    kind: "material",
    answer: {
      sr: "Kephalis je Givaudan bogat woody-amber materijal sa tobacco karakterom. Veoma je postojan u srcu i bazi i dobro se spaja sa floralnim notama, ali i sa sofisticiranim ambrastim, woody-aldehydic i tobacco kompozicijama.",
      en: "Kephalis is a rich Givaudan woody-amber material with a tobacco character. It is long-lasting in the heart and base and blends well with florals as well as sophisticated ambery, woody-aldehydic and tobacco compositions.",
    },
    sources: [
      {
        label: "Givaudan — Kephalis",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/kephalis",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "veraspice",
    name: "Veraspice",
    aliases: [
      "veraspice",
      "vera spice",
      "veraspice clove",
      "veraspice tobacco",
    ],
    kind: "material",
    answer: {
      sr: "Veraspice je IFF spicy materijal sa toplim efektom koji podseća na karanfilić, uz prirodno delujuće white-floral nijanse i glatke tobacco-leaf tonove. Ima jak uticaj u vrhu, ali ostaje primetan i kroz srce i bazu.",
      en: "Veraspice is an IFF spicy material with a warm clove-like effect, natural white-floral nuances and smooth tobacco-leaf facets. It has strong top-note impact while remaining present through the heart and base.",
    },
    sources: [
      {
        label: "IFF — Veraspice",
        url: "https://www.iff.com/scent/ingredients-compendium/veraspice/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "trimofix",
    name: "Trimofix",
    aliases: [
      "trimofix",
      "trimofix woody",
      "trimofix tobacco",
      "trimofix amber",
    ],
    kind: "material",
    answer: {
      sr: "Trimofix je IFF snažan i difuzivan woody-amber materijal sa vetiver, dimnim i tobacco nijansama i blagim mošusnim podtonom. IFF posebno navodi njegovu sposobnost da doda telo i dubinu leather, vetiver i tobacco akordima.",
      en: "Trimofix is an IFF powerful, diffusive woody-amber material with vetiver, smoky and tobacco nuances and a slight musky undertone. IFF specifically notes its ability to add body and depth to leather, vetiver and tobacco accords.",
    },
    sources: [
      {
        label: "IFF — Trimofix",
        url: "https://www.iff.com/scent/ingredients-compendium/trimofix/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "liffarome",
    name: "Liffarome",
    aliases: [
      "liffarome",
      "liffarome molecule",
      "liffarome molekul",
      "liffarome green",
    ],
    kind: "material",
    answer: {
      sr: "Liffarome™ je IFF green materijal sa prirodnim utiskom ljubičice, zelene kruške i pokošene trave. Proizvođač navodi da je veoma efikasan čak i u tragovima i da snažno radi u vrhu i srcu kompozicije.",
      en: "Liffarome™ is an IFF green material with a natural-smelling violet, green pear and cut-grass profile. The manufacturer notes that it is effective even at trace levels and has strong impact in both the top and heart of a composition.",
    },
    sources: [
      {
        label: "IFF — Liffarome",
        url: "https://www.iff.com/scent/ingredients-compendium/liffarome/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "vertoliff",
    name: "Vertoliff",
    aliases: [
      "vertoliff",
      "vertolif",
      "vertoliff molecule",
      "vertoliff molekul",
    ],
    kind: "material",
    answer: {
      sr: "Vertoliff je IFF green molekula projektovana da parfemu doda svežinu i iskru. Ima visok uticaj u top notama i koristi se kada je potreban čist, prodoran zeleni lift bez teške bazne mase.",
      en: "Vertoliff is an IFF green molecule designed to add freshness and sparkle to a fragrance. It has strong top-note impact and is useful when a clean, penetrating green lift is needed without a heavy base effect.",
    },
    sources: [
      {
        label: "IFF — Vertoliff",
        url: "https://www.iff.com/scent/ingredients-compendium/vertoliff/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "limoxal",
    name: "Limoxal",
    aliases: [
      "limoxal",
      "limoxal molecule",
      "limoxal molekul",
      "limoxal citrus",
    ],
    kind: "material",
    answer: {
      sr: "Limoxal je IFF citrusna molekula sa veoma difuzivnim utiskom sveže kore limuna i pomorandže. Proizvođač navodi da posebno dobro radi uz prirodna citrusna ulja i da blaga herbalna nijansa može da pojača ukupnu snagu i volumen kompozicije.",
      en: "Limoxal is an IFF citrus molecule with a highly diffusive impression of fresh lemon and orange zest. The manufacturer notes that it works especially well with natural citrus oils and that its slight herbal facet can enhance the overall strength and volume of a composition.",
    },
    sources: [
      {
        label: "IFF — Limoxal",
        url: "https://www.iff.com/scent/ingredients-compendium/limoxal/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "bergamal",
    name: "Bergamal",
    aliases: [
      "bergamal",
      "bergamal molecule",
      "bergamal molekul",
      "bergamal citrus",
    ],
    kind: "material",
    answer: {
      sr: "Bergamal je IFF citrusni aldehidni materijal sa osvežavajućim profilom limuna, citronele i verbene, uz suvu koru pomorandže. Najviše utiče na vrh parfema i koristi se za čist, svetao i suv citrusni akcenat.",
      en: "Bergamal is an IFF citrus-aldehydic material with a refreshing lemon, citronella and verbena profile plus dry orange-peel facets. Its main impact is in the top of a fragrance, where it provides a clean, bright and dry citrus accent.",
    },
    sources: [
      {
        label: "IFF — Bergamal",
        url: "https://www.iff.com/scent/ingredients-compendium/bergamal/",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "meth-ionone-alpha-extra",
    name: "Meth Ionone Alpha Extra",
    aliases: [
      "meth ionone alpha extra",
      "methyl ionone alpha extra",
      "alpha methyl ionone",
      "alpha meth ionone",
    ],
    kind: "material",
    answer: {
      sr: "Meth Ionone Alpha Extra je IFF materijal iz porodice metil-ionona sa glatkim voskastim, orris-drvenastim karakterom i nijansama ljubičice. IFF ga opisuje kao veoma difuzivan i dugotrajan materijal koji daje volumen i puderastu eleganciju floralnim i drvenastim kompozicijama.",
      en: "Meth Ionone Alpha Extra is an IFF methyl-ionone material with a smooth beeswax-like, orris-woody character and violet nuances. IFF describes it as highly diffusive and long-lasting, adding volume and powdery elegance to floral and woody compositions.",
    },
    sources: [
      {
        label: "IFF — Meth Ionone Alpha Extra",
        url: "https://www.iff.com/scent/ingredients-compendium/meth-ionone-alpha-extra/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "meth-ionone-gamma-pure",
    name: "Meth Ionone Gamma Pure",
    aliases: [
      "meth ionone gamma pure",
      "methyl ionone gamma",
      "gamma methyl ionone",
      "gamma meth ionone",
    ],
    kind: "material",
    answer: {
      sr: "Meth Ionone Gamma Pure je IFF metil-ionon sa drvenastim, duvanskim, orris i violet facetama i izraženim puderastim tonom. IFF posebno ističe njegovu snagu i u vrhu i u telu kompozicije.",
      en: "Meth Ionone Gamma Pure is an IFF methyl-ionone with woody, tobacco, orris and violet facets and a pronounced powdery tone. IFF specifically highlights its strength in both the top and body of a composition.",
    },
    sources: [
      {
        label: "IFF — Meth Ionone Gamma Pure",
        url: "https://www.iff.com/scent/ingredients-compendium/meth-ionone-gamma-pure/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "irisone-pure",
    name: "Irisone Pure",
    aliases: [
      "irisone pure",
      "irisone",
      "irisone violet",
      "irisone orris",
    ],
    kind: "material",
    answer: {
      sr: "Irisone™ Pure je Givaudan ionone materijal snažnog floralno-violet karaktera, sa orris, voćnim i drvenastim facetama. Proizvođač navodi da se lako uklapa u floralne, drvenaste, aldehidne, voćne i chypre akorde.",
      en: "Irisone™ Pure is a Givaudan ionone material with a powerful floral-violet character and orris, fruity and woody facets. The manufacturer notes that it blends readily into floral, woody, aldehydic, fruity and chypre accords.",
    },
    sources: [
      {
        label: "Givaudan — Irisone Pure",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/irisonetm-pure",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "irone-alpha",
    name: "Irone Alpha",
    aliases: [
      "irone alpha",
      "alpha irone",
      "irone",
      "irone orris",
    ],
    kind: "material",
    answer: {
      sr: "Irone Alpha je Givaudan molekula bogatog, prirodno delujućeg floralnog karaktera koja je naročito važna u orris i violet kompozicijama. Givaudan je opisuje kao veoma difuzivnu i sposobnu da parfemu doda volumen i postojanost.",
      en: "Irone Alpha is a Givaudan molecule with a rich, natural-smelling floral character that is especially important in orris and violet compositions. Givaudan describes it as highly diffusive and able to add volume and tenacity to a fragrance.",
    },
    sources: [
      {
        label: "Givaudan — Irone Alpha",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/irone-alpha",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "dihydro-ionone-beta",
    name: "Dihydro Ionone Beta",
    aliases: [
      "dihydro ionone beta",
      "dihydroionone beta",
      "beta dihydro ionone",
      "dihydro ionone",
    ],
    kind: "material",
    answer: {
      sr: "Dihydro Ionone Beta je Givaudan član ionone porodice sa izraženijim drvenastim i blago ambrastim karakterom, uz floralne, orris i voćne nijanse. Koristi se da kompoziciji doda sofisticovan volumen, naročito kada se kombinuje sa floralnim materijalima.",
      en: "Dihydro Ionone Beta is a Givaudan member of the ionone family with a more pronounced woody and slightly ambery character, alongside floral, orris and fruity nuances. It is used to add sophisticated volume, especially in combination with floral materials.",
    },
    sources: [
      {
        label: "Givaudan — Dihydro Ionone Beta",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/dihydro-ionone-beta",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "jasmone-cis",
    name: "Jasmone Cis",
    aliases: [
      "jasmone cis",
      "cis jasmone",
      "cis-jasmone",
      "jasmone",
      "jasmon",
    ],
    kind: "material",
    answer: {
      sr: "Jasmone Cis je Givaudan floralna molekula sa toplim, zelenim jasminskim karakterom. Koristi se u kvalitetnim rekonstrukcijama jasmina i tuberoze, kao i u rekonstrukcijama etarskih ulja, gde pomaže da floralni akord djeluje prirodnije i življe.",
      en: "Jasmone Cis is a Givaudan floral molecule with a warm, green jasmine character. It is widely used in high-quality jasmine and tuberose reconstructions and in essential-oil reconstructions, helping floral accords feel more natural and alive.",
    },
    sources: [
      {
        label: "Givaudan — Jasmone Cis",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/jasmone-cis",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "jasmolactone-delta",
    name: "Jasmolactone Delta",
    aliases: [
      "jasmolactone delta",
      "jasmolactone",
      "jasmolactone molecule",
      "jasmolactone molekul",
    ],
    kind: "material",
    answer: {
      sr: "Jasmolactone Delta je sintetička floralna laktonska molekula dsm-firmenicha. Ima bogat jasminski karakter sa mekanim voćnim nijansama koje mogu podsjetiti na breskvu, kajsiju i kokosovo mlijeko; posebno dobro radi kao podrška jasminskim akordima.",
      en: "Jasmolactone Delta is a synthetic floral lactone from dsm-firmenich. It has a rich jasmine-petal character with soft fruity nuances reminiscent of peach, apricot and coconut milk, and works especially well as support in jasmine accords.",
    },
    sources: [
      {
        label: "dsm-firmenich — JASMOLACTONE DELTA",
        url: "https://studio.dsm-firmenich.com/product/jasmolactone-delta-pe-965414",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "josenol",
    name: "Josenol",
    aliases: [
      "josenol",
      "josenol molecule",
      "josenol molekul",
      "josenol muguet",
    ],
    kind: "material",
    answer: {
      sr: "Josenol® je dsm-firmenich floralna molekula sa nježnim muguet-puderastim karakterom, uz nijanse mimoze, heliotropa i anisa. Koristi se kao floralni building block u muguet akordima, ali i kao podrška ružičastim floralnim strukturama i dugotrajnoj puderastoj mekoći.",
      en: "Josenol® is a dsm-firmenich floral molecule with a delicate muguet-powdery character and hints of mimosa, heliotrope and anise. It is used as a floral building block in muguet accords, as support in rosy floral structures and to enhance soft powdery longevity.",
    },
    sources: [
      {
        label: "dsm-firmenich — JOSENOL",
        url: "https://studio.dsm-firmenich.com/product/josenolr-pe-953125",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "firascone",
    name: "Firascone",
    aliases: [
      "firascone",
      "firascone molecule",
      "firascone molekul",
      "firascone rose ketone",
    ],
    kind: "material",
    answer: {
      sr: "Firascone® je dsm-firmenich rosy-fruity molekula inspirisana porodicom rose ketones. Proizvođač je opisuje kao spoj ruže, voćnosti i blage saffron nijanse, sa profilom veoma bliskim prirodnim damascone efektima i velikom upotrebljivošću u floralnim i voćnim kompozicijama.",
      en: "Firascone® is a dsm-firmenich rosy-fruity molecule inspired by the rose-ketone family. The manufacturer describes it as combining rose, fruit and a subtle saffron nuance, with an olfactory profile close to naturally occurring damascone effects and broad usefulness in floral and fruity compositions.",
    },
    sources: [
      {
        label: "dsm-firmenich — FIRASCONE",
        url: "https://studio.dsm-firmenich.com/product/firasconer-pe-942551",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "florhydral",
    name: "Florhydral",
    aliases: [
      "florhydral",
      "florhydral molecule",
      "florhydral molekul",
      "florhydral muguet",
    ],
    kind: "material",
    answer: {
      sr: "Florhydral™ je Givaudan floralna molekula sa svežim muguet/hijacint efektom i aldehidnim karakterom. Proizvođač je opisuje kao veoma intenzivan i prirodno delujući white-floral materijal koji daje volumen i svežinu, posebno u muguet, lipa i hijacint akordima.",
      en: "Florhydral™ is a Givaudan floral molecule with a fresh muguet/hyacinth effect and an aldehydic character. The manufacturer describes it as a very intense, natural-smelling white-floral material that adds volume and freshness, especially in muguet, linden and hyacinth accords.",
    },
    sources: [
      {
        label: "Givaudan — Florhydral",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/florhydraltm",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "nympheal",
    name: "Nympheal",
    aliases: [
      "nympheal",
      "nympheal molecule",
      "nympheal molekul",
      "nympheal muguet",
    ],
    kind: "material",
    answer: {
      sr: "Nympheal™ je Givaudan muguet molekula sa zelenim, vodenim i lipa-cvetnim facetama. Givaudan je opisuje kao difuzivan white-floral materijal koji kompoziciji daje kremastu floralnu gustinu, volumen i vrlo izraženu difuziju.",
      en: "Nympheal™ is a Givaudan muguet molecule with green, watery and linden-blossom facets. Givaudan describes it as a diffusive white-floral material that brings creamy floral density, volume and very strong diffusion to a composition.",
    },
    sources: [
      {
        label: "Givaudan — Nympheal",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/nympheal",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "muguissimo",
    name: "Muguissimo",
    aliases: [
      "muguissimo",
      "muguissimo molecule",
      "muguissimo molekul",
      "muguissimo muguet",
    ],
    kind: "material",
    answer: {
      sr: "Muguissimo® je sintetička muguet molekula kompanije dsm-firmenich sa svežim, čistim i vodenasto-ciklamenskim karakterom. Proizvođač posebno ističe linearnost materijala i njegovu sposobnost da prirodan petal efekat zadrži od vrha do baze kompozicije.",
      en: "Muguissimo® is a synthetic muguet molecule from dsm-firmenich with a fresh, clean, watery-cyclamen character. The manufacturer specifically highlights its linearity and its ability to maintain a natural petal effect from the top through the base of a composition.",
    },
    sources: [
      {
        label: "dsm-firmenich — MUGUISSIMO",
        url: "https://studio.dsm-firmenich.com/product/muguissimor-pe-961822",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "dupical",
    name: "Dupical",
    aliases: [
      "dupical",
      "dupical molecule",
      "dupical molekul",
      "dupical muguet",
    ],
    kind: "material",
    answer: {
      sr: "Dupical je Givaudan muguet molekula sa svežim, transparentnim, zelenim i aldehidnim karakterom. Proizvođač je opisuje kao veoma snažan modifier i enhancer muguet efekta, sa vodenasto-floralnim i lily-of-the-valley facetama.",
      en: "Dupical is a Givaudan muguet molecule with a fresh, transparent, green and aldehydic character. The manufacturer describes it as a powerful modifier and enhancer of the muguet effect, with watery floral and lily-of-the-valley facets.",
    },
    sources: [
      {
        label: "Givaudan — Dupical",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/dupical",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "norlimbanol",
    name: "Norlimbanol",
    aliases: [
      "norlimbanol",
      "norlimbanol molecule",
      "norlimbanol molekul",
      "norlimbanol drvenasti",
    ],
    kind: "material",
    answer: {
      sr: "Norlimbanol® je sintetička woody-amber molekula kompanije dsm-firmenich, lansirana 1986. Proizvođač je opisuje kao veoma snažnu, suvu drvenastu i ambrastu notu koja deluje kroz celu olfaktornu piramidu i može da pojača svežinu vrha i dugotrajnost kompozicije.",
      en: "Norlimbanol® is a synthetic woody-amber molecule from dsm-firmenich, launched in 1986. The manufacturer describes it as a very powerful dry woody and ambery note that can affect the full olfactory pyramid, enhancing fresh top notes and fragrance tenacity.",
    },
    sources: [
      {
        label: "dsm-firmenich — NORLIMBANOL",
        url: "https://studio.dsm-firmenich.com/product/norlimbanolr-pe-967412",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "ambrofix",
    name: "Ambrofix",
    aliases: [
      "ambrofix",
      "ambro fix",
      "ambrofix molecule",
      "ambrofix molekul",
    ],
    kind: "material",
    answer: {
      sr: "Ambrofix™ je veoma snažna i postojana ambrasta molekula kompanije Givaudan sa autentičnim ambergris efektom i suvom drvenastom senzualnošću. Givaudan danas proizvodi i biotehnološku verziju iz šećerne trske, uz isti olfaktorni profil.",
      en: "Ambrofix™ is a highly powerful and substantive ambery molecule from Givaudan, designed to deliver an authentic ambergris effect with dry woody sensuality. Givaudan also produces it through a biotechnology route starting from sugar cane while retaining the same olfactory profile.",
    },
    sources: [
      {
        label: "Givaudan — Ambrofix",
        url: "https://www.givaudan.com/fragrance-beauty/fragrance-ingredients-business/fragrance-molecules/ambrofix",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "amber-xtreme",
    name: "Amber Xtreme",
    aliases: [
      "amber xtreme",
      "amber extreme",
      "amberxtreme",
      "amber xtreme molecule",
      "amber xtreme molekul",
    ],
    kind: "material",
    answer: {
      sr: "Amber Xtreme™ je IFF amber-woody sastojak visokog performansa, prvobitno captive materijal njihovih parfumera, a od 2015. dostupan širej industriji. IFF ga koristi za pojačavanje performansa i stabilnosti kompozicije i ubraja ga među svoje prepoznatljive moderne molekule.",
      en: "Amber Xtreme™ is a high-performance amber-woody ingredient from IFF. Originally a captive material for IFF perfumers, it was released to the wider industry in 2015. IFF positions it as a performance-enhancing, highly stable material and one of its signature modern molecules.",
    },
    sources: [
      {
        label: "IFF — Amber Xtreme launch",
        url: "https://ir.iff.com/node/10526",
        type: "manufacturer-official",
      },
      {
        label: "IFF — Scent",
        url: "https://www.iff.com/scent/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "akigalawood",
    name: "Akigalawood",
    aliases: [
      "akigalawood",
      "akigala wood",
      "akigalawood molecule",
      "akigalawood molekul",
    ],
    kind: "material",
    answer: {
      sr: "Akigalawood™ je ekskluzivni Givaudan materijal dobijen biotehnološkom preradom patchouli ulja. Givaudan ga opisuje kao začinsko-drvenast, radijantan i prostorno izražen materijal sa facetama patchoulija i agarwooda/oud-a.",
      en: "Akigalawood™ is an exclusive Givaudan ingredient produced through biotechnology from patchouli oil. Givaudan describes it as spicy and woody, radiant and room-filling, with facets of patchouli and agarwood/oud.",
    },
    sources: [
      {
        label: "Givaudan — Unique ingredients / Akigalawood",
        url: "https://www.givaudan.com/fragrance-beauty/technologies-and-captives/unique-ingredients",
        type: "manufacturer-official",
      },
      {
        label: "Givaudan — Biotechnology",
        url: "https://www.givaudan.com/fragrance-beauty/biotechnology",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "habanolide",
    name: "Habanolide",
    aliases: [
      "habanolide",
      "habanolid",
      "habanolide musk",
      "habanolide mosus",
      "habanolide mošus",
      "musk habanolide",
    ],
    kind: "material",
    answer: {
      sr: "Habanolide® je sintetički makrociklični mošus kompanije dsm-firmenich. Proizvođač ga opisuje kao veoma snažan, elegantan i postojan mošus sa toplim, blago drvenastim podtonom; kombinuje snagu i tenacity aromatskih mošusa sa glatkoćom makrocikličnih mošusa.",
      en: "Habanolide® is a synthetic macrocyclic musk from dsm-firmenich. The manufacturer describes it as a very powerful, elegant and substantive musk with a warm, slightly woody undertone, combining the strength and tenacity of aromatic musks with the smoothness of macrocyclic musks.",
    },
    sources: [
      {
        label: "dsm-firmenich — HABANOLIDE",
        url: "https://studio.dsm-firmenich.com/product/habanolider-pe-947303",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "muscenone-delta",
    name: "Muscenone Delta",
    aliases: [
      "muscenone",
      "muscenone delta",
      "muscenone musk",
      "muscenone mošus",
      "muscenone mosus",
    ],
    kind: "material",
    answer: {
      sr: "Muscenone® Delta je sintetički mošus kompanije dsm-firmenich sa puderastim, orris i blago animalnim karakterom. U malim dozama može da radi kao enhancer, dok u većim dozama daje prepoznatljiv mošusni karakter uz vrlo visoku substantivnost na koži, kosi i tkanini.",
      en: "Muscenone® Delta is a synthetic musk from dsm-firmenich with powdery, orris-like and slightly animalic facets. At low dosage it can work as an enhancer; at higher dosage it contributes a distinct musky character with very high substantivity on skin, hair and fabric.",
    },
    sources: [
      {
        label: "dsm-firmenich — MUSCENONE DELTA",
        url: "https://studio.dsm-firmenich.com/product/muscenoner-delta-pe-962191",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "exaltolide",
    name: "Exaltolide",
    aliases: [
      "exaltolide",
      "exaltolid",
      "exaltolide musk",
      "exaltolide mošus",
      "exaltolide mosus",
    ],
    kind: "material",
    answer: {
      sr: "Exaltolide® je sintetički makrociklični mošus kompanije dsm-firmenich. Proizvođač ga opisuje kao izuzetno fin i elegantan mošus prirodnog utiska, sa diskretnim voćnim podtonovima; koristi se da kompoziciji doda dubinu, zaobljenost i senzualan efekat na koži.",
      en: "Exaltolide® is a synthetic macrocyclic musk from dsm-firmenich. The manufacturer describes it as an exceptionally fine, elegant and natural-smelling musk with subtle fruity undertones, used to add depth, roundness and a sensual effect on skin.",
    },
    sources: [
      {
        label: "dsm-firmenich — EXALTOLIDE",
        url: "https://studio.dsm-firmenich.com/product/exaltolider-pe-941962",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "damascenone",
    name: "Damascenone",
    aliases: [
      "damascenone",
      "damaskenon",
      "damascenone molecule",
      "damascenone molekul",
      "rose ketone damascenone",
    ],
    kind: "material",
    answer: {
      sr: "Damascenone je veoma snažna mirisna molekula iz porodice rose ketones. dsm-firmenich je opisuje kao prirodno delujući spoj ruže, šljive i voćnih tonova sa mogućim duvanskim ili slatko-jabučnim nijansama; zbog velike snage daje primetan efekat i pri veoma malim dozama.",
      en: "Damascenone is a highly powerful aroma molecule from the rose-ketone family. dsm-firmenich describes it as a natural-smelling combination of rose, plum and fruity facets, with possible tobacco or sweet-apple nuances; because of its potency it can have a clear effect at very low dosage.",
    },
    sources: [
      {
        label: "dsm-firmenich — DAMASCENONE",
        url: "https://studio.dsm-firmenich.com/product/damascenone-pe-937450",
        type: "manufacturer-official",
      },
    ],
  },

  {
    id: "clearwood",
    name: "Clearwood",
    aliases: [
      "clearwood",
      "clear wood",
      "clearwood prisma",
      "clear wood prisma",
    ],
    kind: "material",
    answer: {
      sr: "Clearwood® je biotehnološki drvenasti materijal kompanije dsm-firmenich, uveden 2014. Proizvođač ga opisuje kao čist, moderan patchouli efekat sa tamnim drvenastim karakterom i kremastom ambrastom toplinom; koristi se kada parfimer želi patchouli potpis sa velikom jasnoćom i postojanošću.",
      en: "Clearwood® is a biotech woody material from dsm-firmenich, introduced in 2014. The manufacturer describes it as a clean modern patchouli effect with a dark woody character and creamy ambery warmth; it is useful when a perfumer wants a clear, persistent patchouli signature.",
    },
    sources: [
      {
        label: "dsm-firmenich — Biotechnology / Clearwood",
        url: "https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/ingredients/biotechnology.html",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "dreamwood",
    name: "Dreamwood",
    aliases: [
      "dreamwood",
      "dream wood",
      "dreamwood base",
    ],
    kind: "material",
    answer: {
      sr: "Dreamwood® je captive materijal kompanije dsm-firmenich razvijen biotehnologijom i predstavljen 2020. Kompanija ga vezuje za održiviji sandalwood pravac i koristi ga kao osnovu za materijale koji daju kremastu, toplu i dugotrajnu drvenastu teksturu nalik sandalovini.",
      en: "Dreamwood® is a dsm-firmenich captive developed through biotechnology and introduced in 2020. The company positions it within a more sustainable sandalwood direction and uses it as the core of materials designed to give a creamy, warm and persistent sandalwood-like woody texture.",
    },
    sources: [
      {
        label: "dsm-firmenich — Biotechnology / Dreamwood",
        url: "https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/ingredients/biotechnology.html",
        type: "manufacturer-official",
      },
      {
        label: "Firmenich — DREAMWOOD BASE",
        url: "https://www.firmenich.com/product/200260147",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "helvetolide",
    name: "Helvetolide",
    aliases: [
      "helvetolide",
      "helvetolid",
      "helvetolide musk",
      "helvetolide mosus",
      "helvetolide mošus",
    ],
    kind: "material",
    answer: {
      sr: "Helvetolide® je sintetički mošus kompanije dsm-firmenich i prvi aliciklični mošus te kuće, otkriven i patentiran 1991. dsm-firmenich posebno ističe njegovu relativnu volatilnost: ne ponaša se samo kao duboka baza, već može da doda prisustvo i mošusnu auru kroz veći deo razvoja parfema.",
      en: "Helvetolide® is a synthetic musk from dsm-firmenich and the company's first alicyclic musk, discovered and patented in 1991. dsm-firmenich specifically highlights its relative volatility: rather than acting only as a deep base note, it can add presence and a musky aura through much of a fragrance's development.",
    },
    sources: [
      {
        label: "dsm-firmenich — Expo 2025 fragrance materials",
        url: "https://our-company.dsm-firmenich.com/en/our-company/news/trade-news/2025/dsm-firmenich-scents-the-swiss-and-dutch-pavilions-at-expo-2025-in-osaka.html",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "z11",
    name: "Z11",
    aliases: [
      "z11",
      "z 11",
      "z11 molecule",
      "z11 molekul",
    ],
    kind: "material",
    answer: {
      sr: "Z11™ je snažan drvenasto-ambrasti materijal kompanije dsm-firmenich, uveden 2018. Proizvođač ga opisuje kao suv, veoma postojan i metalno čist drvenasti efekat blizak Ambrox porodici, projektovan za visok performans i jasnu baznu strukturu.",
      en: "Z11™ is a powerful woody-amber material from dsm-firmenich, introduced in 2018. The manufacturer describes it as dry, highly tenacious and sleekly metallic in character, structurally close to the Ambrox family and designed for strong performance and a clear base structure.",
    },
    sources: [
      {
        label: "dsm-firmenich — Biotechnology / Z11",
        url: "https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/ingredients/biotechnology.html",
        type: "manufacturer-official",
      },
    ],
  },


  {
    id: "amber-accord",
    name: "Amber accord",
    aliases: ["amber accord", "amber akord", "amber nota", "amber u parfemu"],
    kind: "accord",
    answer: {
      sr: "Amber u parfimeriji najčešće označava topao, balsamičan, smolast i slatkast akord, a ne jedan prirodni materijal. Klasično se može graditi oko vanile, labdanuma i benzoinastih ili srodnih smolastih efekata. Ne treba ga mešati sa ambergrisom, koji je sasvim druga sirovina i mirisna ideja.",
      en: "Amber in perfumery usually means a warm, balsamic, resinous and sweet accord rather than one natural material. Classical amber effects may be built around vanilla, labdanum and benzoin-like or related resinous materials. It should not be confused with ambergris, which is a very different material and olfactory idea.",
    },
    sources: [
      {
        label: "The Perfume Society — Fragrance families",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "abstract-fragrance",
    name: "Abstract fragrance",
    aliases: ["abstract fragrance", "apstraktan parfem", "apstraktni miris"],
    kind: "composition-concept",
    answer: {
      sr: "Apstraktan parfem nije zamišljen da verno imitira jednu prepoznatljivu prirodnu stvar. Umesto toga, različiti materijali se kombinuju u novu mirisnu ideju koja nema doslovan pandan u prirodi. CHANEL N°5 je istorijski važan primer takvog pristupa.",
      en: "An abstract fragrance is not intended to faithfully imitate one recognizable natural object. Instead, materials are combined into a new olfactory idea without a literal counterpart in nature. CHANEL N°5 is a historically important example of this approach.",
    },
    sources: [
      {
        label: "CHANEL — N°5",
        url: "https://www.chanel.com/us/fragrance/p/125230/n5-eau-de-parfum-spray/",
        type: "brand-official",
      },
    ],
  },
  {
    id: "guerlinade",
    name: "Guerlinade",
    aliases: ["guerlinade", "gerlinada", "guerlain signature accord"],
    kind: "house-signature",
    answer: {
      sr: "Guerlinade je naziv kojim Guerlain opisuje prepoznatljiv potpis kuće. U savremenom objašnjenju Shalimara kuća ga vezuje za iris, jasmin, bergamot, ružu, vanilu i tonku. To nije fiksna javna formula već istorijski olfaktivni potpis koji se provlači kroz različite Guerlain kompozicije.",
      en: "Guerlinade is the term Guerlain uses for the house's recognizable olfactory signature. In its contemporary Shalimar explanation, the house associates it with iris, jasmine, bergamot, rose, vanilla and tonka bean. It is not a single public fixed formula, but a historic house signature expressed across different compositions.",
    },
    sources: [
      {
        label: "Guerlain — Shalimar",
        url: "https://www.guerlain.com/us/en-us/c/shalimar.html",
        type: "brand-official",
      },
    ],
  },

  {
    id: "diffusion",
    name: "Diffusion",
    aliases: ["diffusion", "difuzija", "difuzija parfema"],
    kind: "performance-concept",
    answer: {
      sr: "Difuzija opisuje koliko lako i ravnomerno mirisne molekule izlaze iz kompozicije i šire se kroz vazduh. Nije isto što i sama jačina: parfem može imati dobru difuziju bez agresivne projekcije, ili biti veoma jak blizu kože ali se slabije širiti.",
      en: "Diffusion describes how readily and evenly aroma materials leave a composition and spread through the air. It is not the same as sheer strength: a fragrance can diffuse well without projecting aggressively, or smell very strong up close while spreading less effectively.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "substantivity",
    name: "Substantivity",
    aliases: ["substantivity", "substantivnost", "substantivnost parfema"],
    kind: "performance-concept",
    answer: {
      sr: "Substantivnost je sposobnost mirisnog materijala da ostane prisutan na podlozi, poput kože ili tkanine, tokom vremena. Visoka substantivnost često doprinosi dugotrajnosti, ali sama po sebi ne garantuje snažnu projekciju.",
      en: "Substantivity is the ability of an aroma material to remain on a substrate such as skin or fabric over time. High substantivity often contributes to longevity, but it does not by itself guarantee strong projection.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "tenacity",
    name: "Tenacity",
    aliases: ["tenacity", "tenacitet", "postojanost materijala"],
    kind: "performance-concept",
    answer: {
      sr: "Tenacity opisuje koliko dugo određeni mirisni materijal zadržava prepoznatljiv karakter tokom isparavanja. U praksi se prepliće sa substantivnošću i trajnošću, ali se može odnositi na ponašanje pojedinačnog materijala, ne samo gotovog parfema.",
      en: "Tenacity describes how long a particular aroma material retains a recognizable character as it evaporates. In practice it overlaps with substantivity and longevity, but it can refer to the behavior of an individual material rather than only the finished perfume.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "volatility",
    name: "Volatility",
    aliases: ["volatility", "volatilnost", "isparljivost", "isparljivost parfema"],
    kind: "formulation-concept",
    answer: {
      sr: "Volatilnost je sklonost materijala da isparava. Vrlo volatilni materijali obično se osećaju ranije i brže nestaju, dok manje volatilni materijali ostaju duže. To pomaže da razumemo razvoj parfema, ali klasična podela top/heart/base nije strogo fizičko pravilo za svaku molekulu.",
      en: "Volatility is a material's tendency to evaporate. Highly volatile materials are often perceived earlier and disappear faster, while less volatile materials remain longer. This helps explain fragrance development, although the classic top/heart/base model is not a strict physical rule for every molecule.",
    },
    sources: [
      {
        label: "The Perfume Society — How perfume works",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "evaporation-curve",
    name: "Evaporation curve",
    aliases: ["evaporation curve", "kriva isparavanja", "razvoj isparavanja parfema"],
    kind: "formulation-concept",
    answer: {
      sr: "Kriva isparavanja opisuje kako se intenzitet i odnos materijala menjaju kroz vreme dok parfem isparava. Parfimer koristi materijale različite volatilnosti i substantivnosti kako bi oblikovao prelaz od otvaranja do drydowna bez naglih rupa u kompoziciji.",
      en: "An evaporation curve describes how the intensity and balance of materials change over time as a fragrance evaporates. Perfumers use materials with different volatility and substantivity to shape the transition from opening to drydown without abrupt gaps in the composition.",
    },
    sources: [
      {
        label: "The Perfume Society — How perfume works",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "radiance",
    name: "Radiance",
    aliases: ["radiance", "radijantnost", "zračenje parfema", "zracenje parfema"],
    kind: "descriptor",
    answer: {
      sr: "Radiance je parfemski opis za utisak da kompozicija 'svetli' i širi se jasno kroz vazduh bez nužne težine ili glasnoće. Često zavisi od izbora i odnosa materijala koji podižu kompoziciju i daju transparentnu ekspanziju.",
      en: "Radiance is a perfumery descriptor for the impression that a composition 'glows' and travels clearly through the air without necessarily feeling heavy or loud. It often depends on the choice and balance of materials that lift the formula and create transparent expansion.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "texture",
    name: "Fragrance texture",
    aliases: ["fragrance texture", "tekstura parfema", "tekstura mirisa"],
    kind: "descriptor",
    answer: {
      sr: "Tekstura je metaforičan način da se opiše kako parfem deluje čulu mirisa: kremasto, baršunasto, suvo, praškasto, vlažno, oštro, glatko ili vazdušasto. To nije jedna merljiva osobina, već koristan senzorski jezik za odnos materijala u kompoziciji.",
      en: "Texture is a metaphorical way to describe how a fragrance feels to the sense of smell: creamy, velvety, dry, powdery, damp, sharp, smooth or airy. It is not one measurable property, but useful sensory language for how materials interact in a composition.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "transparency",
    name: "Transparency",
    aliases: ["transparency", "transparent fragrance", "transparentan parfem", "transparentni miris"],
    kind: "descriptor",
    answer: {
      sr: "Transparentan parfem deluje prozračno i čisto, sa prostorom između glavnih mirisnih ideja umesto guste, zasićene mase. Transparentnost ne znači nužno slab performans; lagana struktura može i dalje imati dobru difuziju i trajnost.",
      en: "A transparent fragrance feels airy and clear, with perceptible space between its main olfactory ideas rather than a dense saturated mass. Transparency does not necessarily mean weak performance; a light structure can still diffuse and last well.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "density",
    name: "Fragrance density",
    aliases: ["fragrance density", "gustina parfema", "gust miris", "dense fragrance"],
    kind: "descriptor",
    answer: {
      sr: "Gustina opisuje koliko je kompozicija senzorski zbijena ili slojevita. Gust parfem može delovati bogato, puno i kompaktno, dok prozračan parfem ostavlja više prostora između elemenata. Gustina nije isto što i koncentracija ulja niti automatski znači veću trajnost.",
      en: "Density describes how packed or layered a composition feels sensorially. A dense fragrance can feel rich, full and compact, while an airy fragrance leaves more space between elements. Density is not the same as oil concentration and does not automatically mean greater longevity.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "balance",
    name: "Fragrance balance",
    aliases: ["fragrance balance", "balans parfema", "uravnotežen parfem", "uravnotezen parfem"],
    kind: "formulation-concept",
    answer: {
      sr: "Balans u parfemu znači da različiti elementi podržavaju zamišljeni efekat bez neželjenog dominiranja jednog dela formule. To ne znači da svi sastojci moraju biti jednako glasni; namerno asimetrična kompozicija može biti veoma dobro izbalansirana.",
      en: "Balance in fragrance means that different elements support the intended effect without one part of the formula dominating unintentionally. It does not mean every ingredient must be equally loud; a deliberately asymmetric composition can still be very well balanced.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "overdose-perfumery",
    name: "Overdose in perfumery",
    aliases: ["overdose in perfumery", "overdose parfimerija", "predoziranje materijala", "overdose materijala"],
    kind: "formulation-concept",
    answer: {
      sr: "U parfimeriji 'overdose' obično znači namerno korišćenje nekog materijala ili efekta u neuobičajeno visokoj dozi kako bi postao dominantan deo identiteta parfema. To je kreativna tehnika, ne medicinski izraz niti tvrdnja da je proizvod nebezbedan.",
      en: "In perfumery, an 'overdose' usually means deliberately using a material or effect at an unusually high level so it becomes a dominant part of the fragrance identity. It is a creative technique, not a medical term or a claim that the product is unsafe.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },

  {
    id: "cashmeran",
    name: "Cashmeran",
    aliases: ["cashmeran", "cashmeran molecule", "kašmeran", "kasmeran"],
    kind: "material",
    answer: {
      sr: "Cashmeran je sintetički mirisni materijal sa drvenastim, mošusnim, toplim, blago začinskim i mineralnim nijansama. Često se koristi da kompoziciji da teksturu, mekoću i suv, obavijajući drvenasti efekat.",
      en: "Cashmeran is a synthetic aroma material with woody, musky, warm, slightly spicy and mineral facets. It is often used to add texture, softness and a dry enveloping woody effect to a composition.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "ethyl-maltol",
    name: "Ethyl maltol",
    aliases: ["ethyl maltol", "etil maltol"],
    kind: "material",
    answer: {
      sr: "Ethyl maltol je snažan sladak aromatični materijal koji može dati utisak karamele, karamelizovanog šećera, candy floss-a i toplog gourmand efekta. U malim količinama zaobljava kompoziciju; u većim može postati veoma dominantan.",
      en: "Ethyl maltol is a powerful sweet aroma material that can suggest caramel, cooked sugar, cotton candy and warm gourmand effects. In small amounts it can round a composition; at higher levels it can become very dominant.",
    },
    sources: [
      {
        label: "IFRA Transparency List — Ethyl maltol",
        url: "https://ifrafragrance.org/transparency-list?query=4940-11-8",
        type: "industry-standard",
      },
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "linalool",
    name: "Linalool",
    aliases: ["linalool", "linalol"],
    kind: "material",
    answer: {
      sr: "Linalool je rasprostranjena mirisna molekula prisutna u brojnim biljkama i etarskim uljima. Profil joj je cvetan, svež, blago citrusan i aromatičan. Može biti prirodnog ili sintetičkog porekla; hemijski identitet molekule je isti.",
      en: "Linalool is a widely occurring aroma molecule found in many plants and essential oils. Its profile is floral, fresh, lightly citrusy and aromatic. It may be naturally sourced or synthetic; the chemical identity of the molecule is the same.",
    },
    sources: [
      {
        label: "IFRA — Safe use",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },
  {
    id: "limonene",
    name: "Limonene",
    aliases: ["limonene", "limonen"],
    kind: "material",
    answer: {
      sr: "Limonene je citrusna mirisna molekula obilno prisutna u korama citrusa. Daje svetao limunasto-narandžast efekat i čest je sastojak citrusnih ulja. Kao i mnogi terpeni, može oksidirati, zbog čega su pravilno čuvanje i bezbednosna kontrola važni.",
      en: "Limonene is a citrus aroma molecule abundant in citrus peels. It gives a bright lemon-orange effect and is common in citrus oils. Like many terpenes, it can oxidize, which is why proper storage and safety control matter.",
    },
    sources: [
      {
        label: "IFRA — Safe use",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },
  {
    id: "eugenol",
    name: "Eugenol",
    aliases: ["eugenol"],
    kind: "material",
    answer: {
      sr: "Eugenol je začinska aromatična molekula snažno povezana sa mirisom karanfilića. Daje topao, začinski, blago diman i lekovito-slatkast karakter i koristi se u začinskim, floralnim i amber kompozicijama.",
      en: "Eugenol is a spicy aroma molecule strongly associated with clove. It brings warm, spicy, slightly smoky and medicinal-sweet facets and is used in spicy, floral and amber compositions.",
    },
    sources: [
      {
        label: "IFRA — Safe use",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },
  {
    id: "geraniol",
    name: "Geraniol",
    aliases: ["geraniol"],
    kind: "material",
    answer: {
      sr: "Geraniol je cvetna mirisna molekula koja se prirodno nalazi u ruži, geranijumu i drugim biljkama. Daje svež, ružičast, cvetan i blago citrusan karakter i široko se koristi u floralnim akordima.",
      en: "Geraniol is a floral aroma molecule naturally present in rose, geranium and other plants. It gives a fresh, rosy, floral and slightly citrusy character and is widely used in floral accords.",
    },
    sources: [
      {
        label: "IFRA — Safe use",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },
  {
    id: "ozonic",
    name: "Ozonic",
    aliases: ["ozonic", "ozonska nota", "ozonski parfem"],
    kind: "descriptor",
    answer: {
      sr: "Ozonic opisuje prozračan, hladan, čist i često 'vazdušast' efekat koji može podsećati na vazduh posle oluje ili otvoren prostor. To je mirisni opis/akord, ne doslovno prisustvo ozona u parfemu.",
      en: "Ozonic describes an airy, cool, clean and often open-space effect that can evoke the air after a storm. It is an olfactory descriptor or accord, not literal ozone contained in the perfume.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "mineral",
    name: "Mineral",
    aliases: ["mineral note", "mineralna nota", "mineralni parfem"],
    kind: "descriptor",
    answer: {
      sr: "Mineral je apstraktan mirisni opis za hladne, kamene, slane, kredaste, metalne ili suve teksture u parfemu. Ne znači da parfem sadrži 'miris kamena' kao jednu sirovinu; efekat se gradi kombinacijom različitih materijala.",
      en: "Mineral is an abstract olfactory descriptor for cool, stony, salty, chalky, metallic or dry textures in fragrance. It does not mean the perfume contains a single 'stone smell' ingredient; the effect is built from combinations of materials.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "salty",
    name: "Salty",
    aliases: ["salty note", "slana nota", "salt accord"],
    kind: "descriptor",
    answer: {
      sr: "Slani efekat u parfemu je akordska iluzija. Može delovati morski, mineralno, kožno ili gotovo telesno, zavisno od drugih materijala oko njega. Ne podrazumeva jednostavno dodavanje kuhinjske soli kao mirisne note.",
      en: "A salty effect in fragrance is an accord-based illusion. It can feel marine, mineral, leathery or almost skin-like depending on the surrounding materials. It does not simply mean adding table salt as an olfactory note.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "smoky",
    name: "Smoky",
    aliases: ["smoky note", "dimna nota", "dimni parfem"],
    kind: "descriptor",
    answer: {
      sr: "Dimni karakter može dolaziti iz incense, guaiac, cade, vetiver, leather, tobacco i drugih materijala ili akorda. 'Smoky' zato opisuje efekat, ne jednu obaveznu sirovinu, a raspon ide od suptilne suve zadimljenosti do tamnog katranastog utiska.",
      en: "Smoky character can come from incense, guaiac, cade, vetiver, leather, tobacco and other materials or accords. 'Smoky' therefore describes an effect rather than one mandatory ingredient, ranging from subtle dry smoke to dark tarry impressions.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "green",
    name: "Green",
    aliases: ["green note", "zelena nota", "zeleni miris"],
    kind: "descriptor",
    answer: {
      sr: "Green opisuje mirisne efekte koji podsećaju na list, travu, stabljiku, biljnu gorčinu ili sveže presečenu vegetaciju. Može nastati iz prirodnih materijala poput galbanuma i petitgraina ili iz sintetičkih zelenih molekula i akorda.",
      en: "Green describes olfactory effects reminiscent of leaves, grass, stems, vegetal bitterness or freshly cut plant material. It can come from natural materials such as galbanum and petitgrain or from synthetic green molecules and accords.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "aromatic",
    name: "Aromatic",
    aliases: [
      "aromatic",
      "aromatic parfem",
      "aromatični parfem",
      "aromatic note",
    ],
    kind: "descriptor",
    answer: {
      sr: "Aromatic u parfimeriji najčešće opisuje profil zasnovan na biljnim, herbalnim i svežim materijalima poput lavande, žalfije, ruzmarina, bosiljka ili mente. Često se prepliće sa fougère i fresh stilovima, ali nije isto što i bilo koji pojedinačni sastojak.",
      en: "Aromatic in perfumery usually describes a profile built around herbal, fresh plant-like materials such as lavender, sage, rosemary, basil or mint. It often overlaps with fougère and fresh styles, but it is not the same thing as any single ingredient.",
    },
    sources: [
      {
        label: "The Perfume Society — Fragrance families",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/",
        type: "industry-education",
      },
    ],
  },

  {
    id: "vanilla-vanillin",
    name: "Vanilla / Vanillin",
    aliases: [
      "vanilla",
      "vanila",
      "vanile",
      "vanilin",
      "vanillin",
      "vanilina",
      "vanila i vanilin",
      "vanile i vanilina",
      "razlika izmedju vanile i vanilina",
      "vanila u parfemu",
      "vanilla in perfume",
    ],
    kind: "material-family",
    answer: {
      sr: "Vanila kao mirisni profil i vanilin kao molekula nisu isto. Prirodni ekstrakti vanile sadrže veliki broj aromatičnih komponenti, dok je vanilin jedna od ključnih molekula koje daju prepoznatljiv sladak, kremast i balsamičan utisak. U parfimeriji se vrlo često koriste i prirodni ekstrakti i sintetički vanilin, pojedinačno ili zajedno.",
      en: "Vanilla as an olfactory profile and vanillin as a molecule are not the same thing. Natural vanilla extracts contain many aromatic compounds, while vanillin is one of the key molecules responsible for the familiar sweet, creamy and balsamic impression. Perfumery commonly uses natural extracts and synthetic vanillin, separately or together.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "sandalwood",
    name: "Sandalwood",
    aliases: ["sandalwood", "sandalovina", "sandalovo drvo"],
    kind: "material",
    answer: {
      sr: "Sandalovina daje mekan, kremast, mlečno-drvenast i blago sladak karakter. Prirodna sandalovina je cenjena i ograničena sirovina, pa savremene formule često kombinuju prirodne ekstrakte sa sintetičkim sandalwood molekulima kako bi dobile željenu teksturu, stabilnost i održivost.",
      en: "Sandalwood brings a soft, creamy, milky-woody and slightly sweet character. Natural sandalwood is valuable and limited, so modern formulas often combine natural extracts with synthetic sandalwood molecules to achieve the desired texture, stability and sustainability.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "cedarwood",
    name: "Cedarwood",
    aliases: ["cedarwood", "cedar", "kedrovina", "kedar", "cedar note"],
    kind: "material-family",
    answer: {
      sr: "Kedrovina u parfimeriji može biti suva, čista, olovkasto-drvenasta, dimna ili blago aromatična, zavisno od vrste kedra i materijala koji se koristi. Različiti cedarwood materijali ne mirišu identično, pa 'cedar' na listi nota ne označava jednu univerzalnu aromu.",
      en: "Cedarwood can smell dry, clean, pencil-like, smoky or lightly aromatic depending on the species and material used. Different cedarwood materials do not smell identical, so 'cedar' on a note list does not represent one universal aroma.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "oakmoss",
    name: "Oakmoss",
    aliases: ["oakmoss", "oak moss", "hrastova mahovina"],
    kind: "material",
    answer: {
      sr: "Oakmoss je klasična parfemska sirovina sa vlažnim, zemljanim, zelenim, mahovinastim i blago kožastim karakterom. Istorijski je ključna u chypre i fougère strukturama. Savremena upotreba prirodnog oakmossa je regulisana, pa se često koriste pročišćene frakcije i zamenski akordi.",
      en: "Oakmoss is a classic perfumery material with damp, earthy, green, mossy and slightly leathery facets. Historically it is central to chypre and fougère structures. Modern use of natural oakmoss is regulated, so purified fractions and substitute accords are commonly used.",
    },
    sources: [
      {
        label: "IFRA — Standards",
        url: "https://ifrafragrance.org/safe-use/standards",
        type: "industry-official",
      },
    ],
  },
  {
    id: "rose",
    name: "Rose",
    aliases: ["rose note", "ruža u parfemu", "ruza u parfemu", "rose in perfume"],
    kind: "material-family",
    answer: {
      sr: "Ruža u parfimeriji nije jedan jedini miris. Različite vrste, ekstrakcije i sintetički materijali mogu dati sve od sveže, citrusne i zelene ruže do medne, začinske, voćne, puderaste ili tamne ruže. Zato dve 'rose' kompozicije mogu imati vrlo različit karakter.",
      en: "Rose in perfumery is not one single smell. Different species, extraction methods and synthetic materials can range from fresh, citrusy and green rose to honeyed, spicy, fruity, powdery or dark rose effects. Two 'rose' fragrances can therefore smell very different.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "jasmine",
    name: "Jasmine",
    aliases: ["jasmine", "jasmin", "jasmin u parfemu", "jasmine in perfume"],
    kind: "material-family",
    answer: {
      sr: "Jasmin može biti svetao, cvetan i kremast, ali i zelen, voćan ili blago animalan. Prirodni jasmine absolute je kompleksan, dok savremena parfimerija često gradi jasminski efekat kombinacijom prirodnih i sintetičkih materijala poput Hedionea i drugih jasminskih molekula.",
      en: "Jasmine can be bright, floral and creamy, but also green, fruity or slightly animalic. Natural jasmine absolute is complex, while modern perfumery often builds jasmine effects with combinations of natural and synthetic materials such as Hedione and other jasmine-related molecules.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "tuberose",
    name: "Tuberose",
    aliases: ["tuberose", "tuberoza", "tuberoza u parfemu"],
    kind: "material-family",
    answer: {
      sr: "Tuberoza je intenzivno belo cveće sa kremastim, slatkim, zelenim i ponekad gotovo animalnim karakterom. U parfimeriji može delovati raskošno i gusto, ali se može stilizovati i kao svetlija, vazdušnija cvetna nota.",
      en: "Tuberose is an intensely scented white flower with creamy, sweet, green and sometimes almost animalic facets. In perfumery it can feel lush and dense, but it can also be styled as a lighter, airier floral note.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "violet-ionones",
    name: "Violet / Ionones",
    aliases: ["violet note", "ljubičica u parfemu", "ljubicica u parfemu", "ionones", "jononi"],
    kind: "material-family",
    answer: {
      sr: "Miris ljubičice u parfimeriji uglavnom se rekonstruiše, jer cvet ljubičice nije praktičan izvor etarskog ulja za klasičnu proizvodnju. Iononi i srodni materijali daju karakterističan puderast, cvetan, drvenast i blago voćan efekat koji se povezuje sa ljubičicom i irisnim akordima.",
      en: "The smell of violet in perfumery is usually reconstructed because violet flowers are not a practical source of essential oil for conventional production. Ionones and related materials create the characteristic powdery, floral, woody and slightly fruity effect associated with violet and iris accords.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "heliotrope-heliotropin",
    name: "Heliotrope / Heliotropin",
    aliases: ["heliotrope", "heliotropin", "heliotrop", "heliotropin u parfemu"],
    kind: "material-family",
    answer: {
      sr: "Heliotropni efekat je mekan, puderast, bademast i vanilast. Heliotropin je važna aromatična molekula za takav profil i često se koristi u puderastim, floralnim i gourmand kompozicijama. Naziv može opisivati i akord, ne nužno prirodni ekstrakt cveta.",
      en: "A heliotrope effect is soft, powdery, almond-like and vanilla-like. Heliotropin is an important aroma molecule for this profile and is common in powdery, floral and gourmand compositions. The term can describe an accord rather than a natural flower extract.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "ambrette",
    name: "Ambrette seed",
    aliases: ["ambrette", "ambrette seed", "seme ambrete", "sjeme ambrete"],
    kind: "material",
    answer: {
      sr: "Ambrette seed je biljna sirovina sa mekim, toplim, mošusnim i blago voćno-kruškastim karakterom. Često se opisuje kao jedan od retkih prirodnih materijala koji mogu dati izraženo mošusni efekat, ali ne miriše identično modernim sintetičkim mošusima.",
      en: "Ambrette seed is a botanical material with a soft, warm, musky and slightly fruity, pear-like character. It is often described as one of the relatively rare natural materials capable of giving a distinctly musky effect, though it does not smell identical to modern synthetic musks.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "petitgrain",
    name: "Petitgrain",
    aliases: ["petitgrain", "petit grain", "petitgren"],
    kind: "material",
    answer: {
      sr: "Petitgrain se najčešće dobija destilacijom listova i grančica gorke narandže. Profil je citrusno-zelen, aromatičan, blago drvenast i cvetan. Iako dolazi sa istog drveta kao neroli i bitter orange peel, miriše drugačije jer potiče iz drugog dela biljke.",
      en: "Petitgrain is most commonly distilled from the leaves and twigs of the bitter orange tree. Its profile is citrus-green, aromatic, lightly woody and floral. Although it comes from the same tree as neroli and bitter orange peel, it smells different because it is derived from a different part of the plant.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "galbanum",
    name: "Galbanum",
    aliases: ["galbanum", "galbanum resin", "galbanum u parfemu"],
    kind: "material",
    answer: {
      sr: "Galbanum je smolasti materijal poznat po vrlo zelenom, gorkom, biljnom i blago zemljanom karakteru. U malim količinama može dati snažan efekat presečene stabljike i oštrinu koja je važna u klasičnim zelenim i chypre kompozicijama.",
      en: "Galbanum is a resinous material known for an intensely green, bitter, vegetal and slightly earthy character. In small amounts it can create a vivid cut-stem effect and sharpness important in classic green and chypre compositions.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "myrrh",
    name: "Myrrh",
    aliases: ["myrrh", "mirra", "smirna u parfemu"],
    kind: "material",
    answer: {
      sr: "Mirra je aromatična smola sa toplim, balsamičnim, smolastim, blago dimnim i ponekad lekovito-gorkim karakterom. Često se koristi u amber, incense i orijentalno inspirisanim kompozicijama, gde daje dubinu i suvu slatkoću.",
      en: "Myrrh is an aromatic resin with warm, balsamic, resinous, lightly smoky and sometimes medicinal-bitter facets. It is common in amber, incense and oriental-inspired compositions, where it adds depth and dry sweetness.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "elemi",
    name: "Elemi",
    aliases: ["elemi", "elemi resin", "elemi smola"],
    kind: "material",
    answer: {
      sr: "Elemi je smola sa svetlim, limunasto-biberastim, zelenim i balsamičnim karakterom. Može povezati citrusne, začinske i smolaste delove kompozicije i dati transparentniji resinous efekat od težih smola poput labdanuma ili mirre.",
      en: "Elemi is a resin with bright lemony-peppery, green and balsamic facets. It can bridge citrus, spice and resinous parts of a composition and create a more transparent resin effect than heavier resins such as labdanum or myrrh.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "osmanthus",
    name: "Osmanthus",
    aliases: ["osmanthus", "osmantus", "osmanthus note"],
    kind: "material-family",
    answer: {
      sr: "Osmanthus je cvetni materijal poznat po neobičnoj kombinaciji kajsijasto-voćnih, cvetnih, čajnih i blago kožastih nijansi. U kompoziciji može povezati voćne, floralne i leather elemente bez klasične slatkoće.",
      en: "Osmanthus is a floral material known for an unusual combination of apricot-like fruitiness, florals, tea facets and a slight leather nuance. In a composition it can bridge fruity, floral and leather effects without conventional sweetness.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "tea-accord",
    name: "Tea accord",
    aliases: ["tea accord", "tea note", "čajna nota", "cajna nota", "čaj u parfemu", "caj u parfemu"],
    kind: "accord",
    answer: {
      sr: "Čajna nota u parfemu često je akord, a ne direktan ekstrakt šolje čaja. Može biti citrusno-zelen, aromatičan, diman, cvetan ili blago suv i taninski, zavisno od toga da li kompozicija cilja utisak zelenog, crnog, mate ili drugog čaja.",
      en: "A tea note in perfume is often an accord rather than a direct extract of brewed tea. It can be citrus-green, aromatic, smoky, floral or dry and tannic depending on whether the composition aims to suggest green tea, black tea, mate or another tea style.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "lactonic",
    name: "Lactonic",
    aliases: ["lactonic", "laktonski", "mlečna nota", "mlecna nota", "milky note"],
    kind: "descriptor",
    answer: {
      sr: "Lactonic opisuje mlečan, kremast, kokosast, breskvast ili mekan voćno-kremasti efekat koji često dolazi od laktona i srodnih materijala. To nije jedna nota; različiti laktoni mogu mirisati vrlo različito i davati različite teksture.",
      en: "Lactonic describes milky, creamy, coconut-like, peachy or soft fruity-creamy effects often produced by lactones and related materials. It is not one single note; different lactones can smell very different and create different textures.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },

  {
    id: "perfume-oil",
    name: "Perfume oil",
    aliases: ["perfume oil", "parfemsko ulje", "uljani parfem"],
    kind: "formulation",
    answer: {
      sr: "Perfume oil je mirisna kompozicija razblažena u uljnom ili drugom nealkoholnom nosaču umesto u tipičnoj alkoholnoj bazi spreja. Takvi proizvodi često ostaju bliže koži i razvijaju se drugačije od alkoholnih sprejeva, ali naziv 'oil' sam po sebi ne garantuje veću postojanost ili kvalitet.",
      en: "A perfume oil is a fragrance composition diluted in an oil-based or other non-alcoholic carrier instead of the typical alcoholic spray base. These products often stay closer to skin and develop differently from alcohol sprays, but the word 'oil' alone does not guarantee greater longevity or quality.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "attar-itr",
    name: "Attar / Itr",
    aliases: ["attar", "itr", "ittar", "attar perfume", "attar parfem"],
    kind: "formulation-tradition",
    answer: {
      sr: "Attar, itr ili ittar je tradicionalni naziv za koncentrisani miris, naročito povezan sa južnoazijskom i bliskoistočnom parfemskom kulturom. Tradicionalni attari mogu biti destilovani u sandalovom ulju, dok se danas termin koristi šire i za različite alkohol-free parfemske uljne formate. Zato sastav treba proveravati po konkretnom proizvodu.",
      en: "Attar, itr or ittar is a traditional term for concentrated fragrance, especially associated with South Asian and Middle Eastern perfumery. Traditional attars may be distilled into sandalwood oil, while today the term is used more broadly for different alcohol-free perfume-oil formats. The actual composition should therefore be checked product by product.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "ethanol-role",
    name: "Alcohol / ethanol in perfume",
    aliases: [
      "alkohol u parfemu",
      "etanol u parfemu",
      "alcohol in perfume",
      "ethanol in perfume"
    ],
    kind: "formulation",
    answer: {
      sr: "Etanol je najčešći nosač u klasičnim parfemskim sprejevima. Rastvara veliki broj mirisnih materijala, brzo isparava i pomaže da se kompozicija rasprši i projektuje sa kože. Njegova uloga nije da 'pokvari' parfem; pravilno formulisan alkoholni parfem je standardan format fine fragrance industrije.",
      en: "Ethanol is the most common carrier in classic fine-fragrance sprays. It dissolves many aroma materials, evaporates quickly and helps the composition disperse and project from skin. Its role is not to 'damage' the perfume; a properly formulated alcoholic fragrance is a standard fine-fragrance format.",
    },
    sources: [
      {
        label: "The Perfume Society — How perfume works",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-does-perfume-work/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "fragrance-dilution",
    name: "Fragrance dilution",
    aliases: ["dilution", "razblaživanje parfema", "razblazivanje parfema", "diluting perfume"],
    kind: "formulation",
    answer: {
      sr: "Razblaživanje u parfimeriji znači podešavanje koncentracije mirisne kompozicije odgovarajućim nosačem, najčešće etanolom, vodom u kontrolisanom udelu ili uljnom bazom kod oil formata. Promena koncentracije može promeniti projekciju, teksturu i razvoj, a ne samo 'jačinu'.",
      en: "Dilution in perfumery means adjusting the concentration of the fragrance compound with a suitable carrier, most commonly ethanol, controlled amounts of water, or an oil base in oil formats. Changing concentration can alter projection, texture and development, not merely make a scent 'stronger' or 'weaker'.",
    },
    sources: [
      {
        label: "IFRA — Safe use of fragrance",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },
  {
    id: "concentration-performance-myth",
    name: "Concentration vs performance",
    aliases: [
      "da li edp traje duže od edt",
      "da li edp traje duze od edt",
      "is edp stronger than edt",
      "is parfum stronger than edp",
      "concentration and performance"
    ],
    kind: "concept",
    answer: {
      sr: "Veća deklarisana koncentracija ne garantuje automatski veću projekciju niti dužu postojanost. EDT, EDP, Parfum i Extrait opisuju približne koncentracione stilove, ali formule mogu biti različite, a materijali imaju različitu isparljivost. EDP može trajati duže od EDT-a, ali to nije univerzalno pravilo.",
      en: "A higher labeled concentration does not automatically guarantee stronger projection or longer wear. EDT, EDP, Parfum and Extrait describe approximate concentration styles, but formulas may differ and aroma materials have different volatilities. An EDP may last longer than an EDT, but it is not a universal rule.",
    },
    sources: [
      {
        label: "IFRA — Fragrance concentration terminology",
        url: "https://ifrafragrance.org/",
        type: "industry-official",
      },
    ],
  },
  {
    id: "extrait-projection",
    name: "Extrait projection",
    aliases: [
      "da li extrait najviše projektuje",
      "da li extrait najvise projektuje",
      "does extrait project more",
      "extrait projection"
    ],
    kind: "concept",
    answer: {
      sr: "Extrait ili Parfum često ima višu koncentraciju mirisne kompozicije, ali to ne znači da nužno projektuje više. Viša koncentracija može dati gušći, bogatiji i dugotrajniji osećaj bliže koži, dok lakše i hlapljivije formule ponekad projektuju snažnije u prvom delu nošenja.",
      en: "Extrait or Parfum often contains a higher concentration of fragrance compound, but that does not necessarily mean greater projection. Higher concentration can create a denser, richer and longer-lasting effect closer to skin, while lighter, more volatile formulas may project more strongly early in the wear.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "alcohol-free",
    name: "Alcohol-free fragrance",
    aliases: ["alcohol free fragrance", "alcohol-free perfume", "parfem bez alkohola"],
    kind: "formulation",
    answer: {
      sr: "Parfem bez alkohola koristi drugi nosač, na primer uljnu, vodenu ili emulzionu bazu. To menja način raspršivanja, sušenja i projekcije, ali ne znači automatski da je proizvod prirodniji, jači ili pogodniji za svaku osetljivu kožu. Bezbednost zavisi od kompletne formule.",
      en: "An alcohol-free fragrance uses another carrier, such as an oil, water-based or emulsion system. This changes spray behavior, drying and projection, but does not automatically make the product more natural, stronger or suitable for every sensitive skin type. Safety depends on the complete formula.",
    },
    sources: [
      {
        label: "IFRA — Safe use of fragrance",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },

  {
    id: "steam-distillation",
    name: "Steam distillation",
    aliases: ["steam distillation", "destilacija parom", "parna destilacija"],
    kind: "process",
    answer: {
      sr: "Destilacija parom je klasična metoda dobijanja etarskih ulja iz aromatičnih biljnih materijala. Para prolazi kroz biljku, nosi isparljive mirisne komponente, a zatim se kondenzuje i odvaja od vode. Metoda je pogodna za mnoge sirovine, ali ne za sve — toplota može promeniti ili oštetiti osetljive mirisne molekule.",
      en: "Steam distillation is a classic method for obtaining essential oils from aromatic plant materials. Steam passes through the botanical material, carries volatile aromatic compounds, and is then condensed so the oil can be separated from the water. It works well for many materials, but not all, because heat can alter or damage delicate aroma molecules.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "expression",
    name: "Expression",
    aliases: ["expression", "cold pressing", "cold pressed extraction", "hladno ceđenje", "hladno cedjenje", "ceđenje citrusa", "cedjenje citrusa"],
    kind: "process",
    answer: {
      sr: "Expression, odnosno hladno ceđenje, koristi se prvenstveno za citrusne kore. Ulje se mehanički oslobađa iz kore bez klasične destilacije. Tako se dobijaju veoma sveži i prirodni citrusni profili, ali citrusna ulja mogu sadržati komponente osetljive na svetlost i oksidaciju.",
      en: "Expression, or cold pressing, is used mainly for citrus peels. The aromatic oil is mechanically released from the peel rather than distilled. This preserves very fresh, natural citrus character, though citrus oils can contain components sensitive to light and oxidation.",
    },
    sources: [
      {
        label: "IFF LMR — Lemon Oil CP Spain",
        url: "https://www.iff.com/scent/lmr-compendium/lemon-oil-cp-spain-fcr/",
        type: "manufacturer-official",
      },
      {
        label: "IFF LMR — Orange Oil CP Spain",
        url: "https://www.iff.com/scent/lmr-compendium/orange-oil-cp-spain/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "solvent-extraction",
    name: "Solvent extraction",
    aliases: ["solvent extraction", "ekstrakcija rastvaračem", "ekstrakcija rastvaracem"],
    kind: "process",
    answer: {
      sr: "Ekstrakcija rastvaračem koristi se za mirisne materijale koji su previše osetljivi za visoku temperaturu. Biljni materijal se obrađuje odgovarajućim rastvaračem da bi se izdvojile aromatične i voštane komponente; daljom obradom može nastati absolute. Cilj je sačuvati kompleksnije, manje termički izmenjene mirisne nijanse.",
      en: "Solvent extraction is used for aromatic materials that are too delicate for high heat. Botanical material is treated with a suitable solvent to extract aromatic and waxy components; further processing can produce an absolute. The aim is to preserve complex facets with less heat-induced alteration.",
    },
    sources: [
      {
        label: "IFF LMR — Narcisse Absolute France process",
        url: "https://www.iff.com/scent/lmr-compendium/narcisse-absolute-france/",
        type: "manufacturer-official",
      },
      {
        label: "IFF LMR — Jasmin Absolute India process",
        url: "https://www.iff.com/scent/lmr-compendium/jasmin-abs-india-lmr-for-life/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "absolute",
    name: "Absolute",
    aliases: ["absolute", "absolut", "parfemski absolute", "mirisni absolute"],
    kind: "material-form",
    answer: {
      sr: "Absolute je visoko koncentrisan aromatični ekstrakt koji se često dobija nakon solventne ekstrakcije biljnog materijala. U poređenju sa etarskim uljem iste biljke, absolute može imati drugačiji, puniji i kompleksniji profil jer metoda izvlači drugačiji skup mirisnih komponenti.",
      en: "An absolute is a highly concentrated aromatic extract commonly produced after solvent extraction of botanical material. Compared with an essential oil from the same plant, an absolute can smell different, richer and more complex because the extraction method captures a different range of aromatic components.",
    },
    sources: [
      {
        label: "IFF LMR — Narcisse Absolute France process",
        url: "https://www.iff.com/scent/lmr-compendium/narcisse-absolute-france/",
        type: "manufacturer-official",
      },
      {
        label: "IFF LMR — Jasmin Absolute India process",
        url: "https://www.iff.com/scent/lmr-compendium/jasmin-abs-india-lmr-for-life/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "essential-oil",
    name: "Essential oil",
    aliases: ["essential oil", "etarsko ulje", "etarsko ulje", "eterično ulje", "etericno ulje"],
    kind: "material-form",
    answer: {
      sr: "Etarsko ulje je koncentrisana aromatična frakcija biljnog materijala, najčešće dobijena destilacijom ili, kod citrusa, ceđenjem kore. Nije isto što i parfemsko ulje kao gotov proizvod, niti znači da je materijal automatski bezbedniji samo zato što je prirodan.",
      en: "An essential oil is a concentrated aromatic fraction of botanical material, usually obtained by distillation or, for citrus, by peel expression. It is not the same thing as a finished 'perfume oil', and being natural does not automatically make a material safer.",
    },
    sources: [
      {
        label: "IFRA — Safe use of fragrance",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },
  {
    id: "co2-extraction",
    name: "CO₂ extraction",
    aliases: [
      "co2 extraction",
      "co2 ekstrakcija",
      "supercritical co2",
      "supercritical co2 extraction",
      "supercritical extraction",
      "superkritični co2",
      "superkriticni co2",
      "superkritična co2 ekstrakcija",
      "superkriticna co2 ekstrakcija",
    ],
    kind: "process",
    answer: {
      sr: "CO₂ ekstrakcija u parfimeriji najčešće koristi ugljen-dioksid u superkritičnim uslovima kao ekstrakcioni fluid. IFF navodi da je metoda posebno pogodna za jedinjenja niske volatilnosti ili ona osetljiva na termičku degradaciju, pa može sačuvati detalje sirovine koje klasična destilacija gubi ili menja.",
      en: "CO₂ extraction in perfumery commonly uses carbon dioxide under supercritical conditions as the extraction fluid. IFF notes that the method is particularly suited to low-volatility compounds or materials sensitive to thermal degradation, preserving raw-material details that conventional distillation may lose or alter.",
    },
    sources: [
      {
        label: "IFF LMR — Compendium definitions",
        url: "https://www.iff.com/scent/lmr-naturals/compendium-about/",
        type: "manufacturer-official",
      },
      {
        label: "IFF LMR — Natural extraction technologies",
        url: "https://www.iff.com/scent/lmr-naturals/",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "headspace",
    name: "Headspace technology",
    aliases: ["headspace", "headspace technology", "headspace tehnika", "headspace tehnologija"],
    kind: "process",
    answer: {
      sr: "Headspace tehnike hvataju i analiziraju isparljive molekule u vazduhu neposredno oko mirisnog objekta — na primer cveta, voća ili prostora — bez potrebe da se sam objekat klasično ekstrahuje. Dobijeni hemijski profil parfimeru pomaže da rekonstruiše mirisni utisak kombinacijom dostupnih materijala.",
      en: "Headspace techniques capture and analyze volatile molecules in the air immediately surrounding a fragrant object, such as a flower, fruit or place, without conventionally extracting the object itself. The resulting chemical profile helps perfumers reconstruct the olfactory impression using available materials.",
    },
    sources: [
      {
        label: "Givaudan — ScentTrek",
        url: "https://www.givaudan.com/fragrance-beauty/innovation/creative-innovation/scenttrek",
        type: "industry-official",
      },
    ],
  },
  {
    id: "enfleurage",
    name: "Enfleurage",
    aliases: ["enfleurage", "anfleraž", "anfleraz"],
    kind: "process",
    answer: {
      sr: "Enfleurage je istorijska metoda ekstrakcije mirisa u kojoj se sveže cveće polaže na mast koja upija aromatične molekule. Proces je spor i radno intenzivan i danas se gotovo ne koristi u industrijskoj parfimeriji, ali je važan za istoriju ekstrakcije vrlo osetljivih cvetova.",
      en: "Enfleurage is a historical fragrance-extraction method in which fresh flowers are placed on fat that absorbs their aromatic molecules. The process is slow and labor-intensive and is now rarely used industrially, but it remains important in the history of extracting very delicate flowers.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "captive-material",
    name: "Captive fragrance material",
    aliases: ["captive", "captive molecule", "captive material", "ekskluzivna molekula"],
    kind: "industry",
    answer: {
      sr: "Captive je mirisni materijal koji određena kompanija razvije i zadrži za sopstvenu ili ograničenu upotrebu umesto da ga slobodno prodaje celoj industriji. Takvi materijali mogu parfimerima te kuće dati specifične teksture ili efekte koje konkurenti ne mogu jednostavno kupiti kao istu sirovinu.",
      en: "A captive is an aroma material developed by a fragrance company and kept for proprietary or limited use rather than sold broadly across the industry. Captives can give that company's perfumers distinctive textures or effects that competitors cannot simply purchase as the identical raw material.",
    },
    sources: [
      {
        label: "dsm-firmenich — Perfumery ingredients",
        url: "https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/ingredients.html",
        type: "industry-official",
      },
    ],
  },
  {
    id: "tincture",
    name: "Tincture",
    aliases: ["tincture", "tinktura", "parfemska tinktura"],
    kind: "process",
    answer: {
      sr: "Tinktura u parfimeriji nastaje potapanjem aromatičnog materijala u alkohol da bi se deo mirisnih komponenti postepeno rastvorio. Istorijski se koristila za različite prirodne materijale; danas je češća u zanatskoj i eksperimentalnoj parfimeriji nego u velikoj industrijskoj proizvodnji.",
      en: "A perfumery tincture is made by soaking an aromatic material in alcohol so some of its fragrant components gradually dissolve. Historically it was used for many natural materials; today it is more common in artisanal and experimental perfumery than in large-scale industrial production.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },

  {
    id: "beast-mode",
    name: "Beast mode",
    aliases: ["beast mode", "beastmode", "zver od parfema", "zvijer od parfema"],
    kind: "community-term",
    answer: {
      sr: "“Beast mode” je neformalni izraz iz parfemske zajednice za miris koji se doživljava kao vrlo snažan po projekciji, sili mirisnog traga i/ili postojanosti. Nije tehnički standard i nema univerzalni prag; utisak zavisi od doze, kože, klime, prostora i osobe koja ga procenjuje.",
      en: "“Beast mode” is an informal fragrance-community term for a scent perceived as very strong in projection, trail and/or longevity. It is not a technical standard and has no universal threshold; perception depends on dose, skin, climate, setting and the person evaluating it.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence community terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "signature-scent",
    name: "Signature scent",
    aliases: ["signature scent", "signature fragrance", "potpisni parfem", "parfem kao potpis"],
    kind: "community-term",
    answer: {
      sr: "Signature scent je parfem koji osoba nosi dovoljno često da postane deo njenog prepoznatljivog mirisnog identiteta. Ne mora biti najjači, najskuplji ili najsloženiji parfem; važnije je da odgovara osobi, svakodnevici i rasponu situacija u kojima ga realno nosi.",
      en: "A signature scent is a fragrance worn often enough to become part of a person's recognizable olfactory identity. It does not have to be the strongest, most expensive or most complex perfume; fit with the wearer, daily life and real use cases matters more.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence community terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "dumb-reach",
    name: "Dumb reach",
    aliases: ["dumb reach", "easy reach", "bez razmišljanja parfem", "bez razmisljanja parfem"],
    kind: "community-term",
    answer: {
      sr: "“Dumb reach” je neformalni izraz za parfem koji se lako bira bez mnogo razmišljanja jer radi u mnogo svakodnevnih situacija. Obično podrazumeva prijatnost, svestranost i relativno nizak rizik da bude pretežak ili neprikladan za prostor.",
      en: "“Dumb reach” is informal fragrance-community language for a scent that is easy to choose without much thought because it works across many everyday situations. It usually implies pleasantness, versatility and relatively low risk of being too heavy or inappropriate for the setting.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence community terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "blue-fragrance",
    name: "Blue fragrance",
    aliases: ["blue fragrance", "blue perfume", "plavi parfem", "blue scent"],
    kind: "community-term",
    answer: {
      sr: "“Blue fragrance” je neformalna kategorija, ne zvanična olfaktorna porodica. Obično opisuje moderan, čist, svež i svestran profil koji često kombinuje citruse, aromatične note, drvene ili amberske molekule i ponekad aquatic ili začinske elemente. Granice kategorije su subjektivne.",
      en: "“Blue fragrance” is an informal category rather than an official olfactory family. It usually describes a modern, clean, fresh and versatile profile combining citrus, aromatic notes, woods or amber materials, sometimes with aquatic or spicy facets. The category boundaries are subjective.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence community terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "freshie",
    name: "Freshie",
    aliases: [
      "freshie",
      "svežak parfem",
      "svezak parfem",
    ],
    kind: "community-term",
    answer: {
      sr: "“Freshie” je neformalni naziv za parfem koji se doživljava pretežno sveže, lagano i osvežavajuće. Često uključuje citruse, aquatic, zelene ili aromatične elemente, ali nema strogu formulu niti zvaničnu definiciju.",
      en: "“Freshie” is informal fragrance-community language for a perfume perceived as predominantly fresh, light and refreshing. It often includes citrus, aquatic, green or aromatic elements, but there is no strict formula or official definition.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence community terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "compliment-getter",
    name: "Compliment getter",
    aliases: ["compliment getter", "kompliment parfem", "parfem za komplimente"],
    kind: "community-term",
    answer: {
      sr: "“Compliment getter” je zajednički izraz za parfem za koji ljudi često tvrde da dobija pozitivne reakcije okoline. To nije merljiva osobina samog parfema: reakcije zavise od osobe, doze, konteksta, kulture, blizine i ukusa ljudi oko nje.",
      en: "“Compliment getter” is community language for a fragrance people often claim receives positive reactions from others. It is not a measurable property of the perfume itself; reactions depend on the wearer, dose, context, culture, proximity and the tastes of people nearby.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence community terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "office-safe",
    name: "Office safe",
    aliases: ["office safe", "office-safe", "bezbedan za kancelariju", "siguran za kancelariju"],
    kind: "community-term",
    answer: {
      sr: "“Office safe” obično znači da parfem ima kontrolisanu projekciju, prijatan i relativno nenametljiv profil i da je manje verovatno da će smetati ljudima u zatvorenom prostoru. To nije apsolutna oznaka: količina prskanja, ventilacija, pravila radnog mesta i osetljivost drugih ljudi su presudni.",
      en: "“Office safe” usually means a fragrance has controlled projection, a pleasant relatively unobtrusive profile and a lower chance of bothering people indoors. It is not an absolute label; spray amount, ventilation, workplace rules and other people's sensitivity are decisive.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence community terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },
  {
    id: "batch-variation",
    name: "Batch variation",
    aliases: ["batch variation", "razlika između batch-eva", "razlika izmedju batcheva", "razlika između serija parfema", "razlika izmedju serija parfema"],
    kind: "concept",
    answer: {
      sr: "Batch variation znači da različite proizvodne serije istog parfema mogu pokazati male razlike u boji, intenzitetu ili mirisnom utisku. Razlozi mogu uključiti prirodne sirovine, dozvoljene proizvodne tolerancije, starenje bočice i reformulacije kroz vreme. Velike razlike ne treba automatski pripisivati batch-u bez dodatnih dokaza.",
      en: "Batch variation means different production lots of the same fragrance may show small differences in color, intensity or olfactory impression. Causes can include natural raw materials, permitted manufacturing tolerances, bottle aging and reformulations over time. Large differences should not automatically be blamed on batch variation without additional evidence.",
    },
    sources: [
      {
        label: "IFRA — Fragrance materials and safe use",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },

  {
    id: "spray-count",
    name: "Spray count",
    aliases: [
      "koliko prskanja",
      "broj prskanja",
      "how many sprays",
      "spray count",
    ],
    kind: "usage",
    answer: {
      sr: "Ne postoji univerzalan broj prskanja koji važi za svaki parfem. Jačina formule, atomizer, koncentracija, stil mirisa, temperatura, prostor i lična tolerancija menjaju optimalnu dozu. Kao praktičan pristup, kreni skromnije i proceni projekciju posle 15–30 minuta pre nego što dodaš još.",
      en: "There is no universal spray count that works for every fragrance. Formula strength, atomizer output, concentration, fragrance style, temperature, setting and personal tolerance all affect the appropriate dose. A practical approach is to start modestly and reassess projection after 15–30 minutes before adding more.",
    },
    sources: [
      {
        label: "The Perfume Society — How to wear perfume",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-to-wear-perfume/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "skin-vs-clothes",
    name: "Skin vs clothes",
    aliases: [
      "parfem na koži ili odeći",
      "parfem na kozi ili odeci",
      "skin or clothes",
      "perfume on clothes",
      "perfume on skin",
    ],
    kind: "usage",
    answer: {
      sr: "Na koži parfem reaguje sa temperaturom, vlagom i sebumom pa se razvoj mirisa vidi potpunije. Na odeći često traje duže jer je isparavanje sporije, ali razvoj može biti ravniji i postoji rizik od fleka ili oštećenja osetljivih materijala. Za procenu mirisa koža je korisnija; za produžen trag odeća može pomoći ako je tkanina bezbedna za prskanje.",
      en: "On skin, fragrance interacts with warmth, moisture and skin oils, so its development is easier to observe. On clothing it often lasts longer because evaporation is slower, but the scent can develop more linearly and there is a risk of staining or damaging delicate fabrics. Skin is better for evaluating a fragrance; clothing can extend the trail when the fabric is safe to spray.",
    },
    sources: [
      {
        label: "The Perfume Society — How to wear perfume",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-to-wear-perfume/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "pulse-points",
    name: "Pulse points",
    aliases: [
      "pulse points",
      "pulse point",
      "tačke pulsa",
      "tacke pulsa",
      "gde nanositi parfem",
      "gdje nanositi parfem",
    ],
    kind: "usage",
    answer: {
      sr: "Tačke pulsa su toplije zone poput vrata, ručnih zglobova i pregiba laktova. Toplota može pomoći isparavanju i difuziji mirisa, ali nema potrebe trljati zglobove jedan o drugi — to ne poboljšava parfem i može ubrzati promenu najhlapljivijih nota.",
      en: "Pulse points are warmer areas such as the neck, wrists and inner elbows. Warmth can help evaporation and diffusion, but there is no need to rub the wrists together; rubbing does not improve the fragrance and can accelerate the loss of the most volatile opening materials.",
    },
    sources: [
      {
        label: "The Perfume Society — How to wear perfume",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-to-wear-perfume/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "weather-performance",
    name: "Weather and fragrance performance",
    aliases: [
      "vreme i parfem",
      "vrijeme i parfem",
      "temperatura i parfem",
      "temperatura utiče na parfem",
      "temperatura utice na parfem",
      "weather and perfume",
      "heat and perfume",
      "cold weather perfume",
    ],
    kind: "performance",
    answer: {
      sr: "Temperatura menja brzinu isparavanja mirisnih materijala. Toplota obično pojačava difuziju i projekciju, dok hladnoća usporava isparavanje i može učiniti parfem mirnijim i zatvorenijim. Zato isti parfem može delovati znatno drugačije leti i zimi, iako formula nije promenjena.",
      en: "Temperature changes the evaporation rate of fragrance materials. Heat generally increases diffusion and projection, while cold slows evaporation and can make a fragrance feel quieter and more closed. The same perfume can therefore behave very differently in summer and winter even though the formula has not changed.",
    },
    sources: [
      {
        label: "The Perfume Society — How perfume works",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-does-perfume-work/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "humidity-performance",
    name: "Humidity and fragrance performance",
    aliases: [
      "vlaga i parfem",
      "vlaga utiče na parfem",
      "vlaga utice na parfem",
      "vlažnost i parfem",
      "vlaznost i parfem",
      "humidity and perfume",
      "humid weather perfume",
    ],
    kind: "performance",
    answer: {
      sr: "Vlažnost može promeniti način na koji parfem deluje u vazduhu i na koži. U toplom i vlažnom okruženju miris često deluje punije i prisutnije, pa teške, slatke ili vrlo amberske kompozicije mogu brže postati napadne. To je razlog da se doza prilagodi uslovima, a ne samo koncentraciji na etiketi.",
      en: "Humidity can change how a fragrance feels in the air and on skin. In warm, humid conditions a scent can feel fuller and more present, so heavy, sweet or strongly ambery compositions may become overwhelming more quickly. This is why dosage should adapt to conditions, not only to the concentration printed on the label.",
    },
    sources: [
      {
        label: "The Perfume Society — How to wear perfume",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-to-wear-perfume/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "seasonality",
    name: "Fragrance seasonality",
    aliases: [
      "sezonski parfem",
      "parfem po sezoni",
      "parfem za godišnje doba",
      "parfem za godisnje doba",
      "fragrance seasonality",
    ],
    kind: "concept",
    answer: {
      sr: "Sezonske oznake u parfimeriji su praktična smernica, ne fizičko pravilo. Sveži citrusni, aromatični i aquatic mirisi često su lakši za visoke temperature, dok bogati amber, gourmand, oud i začinski profili često bolje podnose hladnoću. Ali doza, klima, prostor i lični ukus mogu biti važniji od same oznake 'letnji' ili 'zimski'.",
      en: "Seasonal labels in perfumery are practical guidance, not a physical rule. Fresh citrus, aromatic and aquatic scents are often easier to wear in high heat, while rich amber, gourmand, oud and spicy profiles often suit colder conditions. But dosage, climate, setting and personal taste can matter more than the label 'summer' or 'winter'.",
    },
    sources: [
      {
        label: "The Perfume Society — Choosing fragrance",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "overapplication",
    name: "Overapplication",
    aliases: [
      "previše parfema",
      "previse parfema",
      "previše prskanja",
      "previse prskanja",
      "overapplication",
      "too much perfume",
    ],
    kind: "usage",
    answer: {
      sr: "Preterano nanošenje može pojačati projekciju do nivoa koji je neprijatan drugima, naročito u zatvorenim prostorima. Takođe može ubrzati olfaktornu adaptaciju, pa osoba koja nosi parfem ima utisak da ga više ne oseća dok je drugima i dalje vrlo jak. Manja početna doza je pouzdanija od naknadnog 'jurjenja' mirisa dodatnim prskanjem.",
      en: "Overapplication can increase projection to a level that is uncomfortable for others, especially indoors. It can also accelerate olfactory adaptation, making the wearer feel the scent has disappeared while it remains strong to other people. A smaller initial dose is more reliable than chasing the scent with repeated extra sprays.",
    },
    sources: [
      {
        label: "The Perfume Society — How to wear perfume",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-to-wear-perfume/",
        type: "industry-education",
      },
    ],
  },

  {
    id: "drydown",
    name: "Drydown",
    aliases: ["drydown", "dry down", "sušenje parfema", "završnica parfema"],
    kind: "concept",
    answer: {
      sr: "Drydown je kasnija faza razvoja parfema na koži, kada najisparljiviji materijali uglavnom više nisu dominantni i više dolaze do izražaja baza, vezujući materijali i sporije isparljive komponente. Nije potpuno odvojena 'treća scena' — razvoj je kontinuiran i može biti vrlo linearan ili veoma promenljiv, zavisno od formule.",
      en: "Drydown is the later stage of a fragrance's development on skin, when the most volatile materials are no longer dominant and base materials, fixative effects and slower-evaporating components become more apparent. It is not a completely separate third act; development is continuous and can be very linear or highly evolving depending on the formula.",
    },
    sources: [
      {
        label: "The Perfume Society — How perfume works",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-does-perfume-work/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "linear-fragrance",
    name: "Linear fragrance",
    aliases: ["linear fragrance", "linear perfume", "linearan parfem", "linearni parfem"],
    kind: "concept",
    answer: {
      sr: "Linearan parfem je miris čiji se osnovni karakter relativno malo menja od otvaranja do kasnijeg nošenja. To ne znači da se ništa ne menja — isparavanje i dalje postoji — već da je glavna mirisna slika namerno stabilnija i manje piramidalna.",
      en: "A linear fragrance keeps a relatively consistent core character from opening through later wear. That does not mean nothing changes—evaporation still occurs—but the main olfactory picture is deliberately more stable and less pyramid-like.",
    },
    sources: [
      {
        label: "The Perfume Society — How perfume works",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/how-does-perfume-work/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "skin-scent",
    name: "Skin scent",
    aliases: ["skin scent", "skin-scent", "miris uz kožu", "miris uz kozu"],
    kind: "concept",
    answer: {
      sr: "Skin scent je parfemski stil ili faza nošenja sa malom projekcijom: miris ostaje blizu kože i uglavnom ga primećuju osoba koja ga nosi i ljudi u neposrednoj blizini. To nije isto što i loša postojanost — parfem može trajati dugo, a ipak projektovati vrlo malo.",
      en: "A skin scent is a fragrance style or wearing phase with low projection: the scent stays close to the skin and is noticed mainly by the wearer and people nearby. It is not the same as poor longevity; a fragrance can last a long time while projecting very little.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "decant",
    name: "Decant",
    aliases: ["decant", "dekant", "dekant parfema", "šta je dekant", "sta je dekant"],
    kind: "concept",
    answer: {
      sr: "Dekant je manja količina originalnog parfema pretočena iz originalne bočice u zasebnu manju bočicu ili atomizer. Sadržaj ostaje originalni parfem; menja se samo pakovanje i količina. Dekanti služe da se parfem realno proba kroz više nošenja bez kupovine pune bočice.",
      en: "A decant is a smaller quantity of original fragrance transferred from the original bottle into a separate smaller vial or atomizer. The liquid remains the original fragrance; only the packaging and quantity change. Decants let someone test a fragrance over multiple wears without buying a full bottle.",
    },
    sources: [
      {
        label: "PlayNice — Try before you buy",
        url: "https://playniceshop.me/",
        type: "first-party",
      },
    ],
  },
  {
    id: "atomizer",
    name: "Atomizer",
    aliases: ["atomizer", "atomiser", "raspršivač parfema", "rasprsivac parfema"],
    kind: "concept",
    answer: {
      sr: "Atomizer je mehanizam i bočica koji parfem pretvaraju u finu maglicu pri prskanju. Količina po prskanju nije univerzalna: zavisi od pumpe, mlaznice, viskoznosti formule i samog pakovanja, pa broj prskanja nije pouzdana univerzalna mera doze.",
      en: "An atomizer is the pump/nozzle system and container that turns fragrance into a fine spray. The amount delivered per spray is not universal; it depends on the pump, nozzle, formula viscosity and packaging, so spray count is not a universal dosage measurement.",
    },
    sources: [
      {
        label: "The Perfume Society — Perfume glossary",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/perfume-glossary/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "oxidation",
    name: "Oxidation",
    aliases: ["oxidation", "oksidacija", "oksidacija parfema", "parfem oksidirao"],
    kind: "concept",
    answer: {
      sr: "Oksidacija je hemijska promena koja može nastati kada mirisni materijali reaguju sa kiseonikom. Toplota, svetlost i vazduh mogu ubrzati promene u parfemu. Blaga promena boje sama po sebi ne dokazuje da je parfem pokvaren; važniji su trajna promena mirisa, oštra ili neobična nota i loši uslovi čuvanja.",
      en: "Oxidation is a chemical change that can occur when fragrance materials react with oxygen. Heat, light and air can accelerate changes in a perfume. A slight color change alone does not prove a fragrance has spoiled; a persistent change in smell, harsh or unusual facets and poor storage conditions are more meaningful signals.",
    },
    sources: [
      {
        label: "The Perfume Society — How to store perfume",
        url: "https://perfumesociety.org/how-to-store-your-fragrance/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "shelf-life",
    name: "Fragrance shelf life",
    aliases: ["shelf life", "rok trajanja parfema", "koliko traje parfem u bočici", "koliko traje parfem u bocici"],
    kind: "concept",
    answer: {
      sr: "Parfem nema jedan univerzalni rok nakon kog odjednom postaje neupotrebljiv. Stabilnost zavisi od formule, pakovanja i čuvanja. Dobro zatvoren parfem, zaštićen od toplote, svetlosti i velikih temperaturnih promena, često ostaje upotrebljiv godinama. Procenu je bolje zasnivati na stvarnoj promeni mirisa nego samo na starosti bočice.",
      en: "There is no single universal date after which every perfume suddenly becomes unusable. Stability depends on formula, packaging and storage. A well-sealed fragrance protected from heat, light and large temperature swings can often remain usable for years. Actual odor change is more informative than bottle age alone.",
    },
    sources: [
      {
        label: "The Perfume Society — How to store perfume",
        url: "https://perfumesociety.org/how-to-store-your-fragrance/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "ifra",
    name: "IFRA",
    aliases: ["ifra", "ifra standard", "ifra standards"],
    kind: "industry",
    answer: {
      sr: "IFRA je International Fragrance Association. Njeni standardi određuju zabrane, ograničenja ili uslove upotrebe određenih mirisnih sastojaka na osnovu bezbednosnih procena. IFRA standard nije isto što i zakon, ali ga industrija široko koristi kao sistem upravljanja bezbednom upotrebom mirisnih materijala.",
      en: "IFRA is the International Fragrance Association. Its Standards set prohibitions, restrictions or conditions of use for certain fragrance ingredients based on safety assessments. An IFRA Standard is not the same thing as law, but it is widely used by the industry as a system for managing the safe use of fragrance materials.",
    },
    sources: [
      {
        label: "IFRA — Standards",
        url: "https://ifrafragrance.org/safe-use/standards",
        type: "industry-official",
      },
    ],
  },
  {
    id: "fragrance-allergens",
    name: "Fragrance allergens",
    aliases: ["fragrance allergens", "perfume allergens", "alergeni u parfemu", "alergeni u parfemima"],
    kind: "safety",
    answer: {
      sr: "Neki mirisni sastojci mogu izazvati alergijsku reakciju kod osetljivih osoba. Zato regulativa i industrijski standardi zahtevaju kontrolu i, u određenim slučajevima, deklarisanje pojedinih alergena. Prisustvo deklarisanog alergena ne znači da će svako reagovati; rizik zavisi od osobe, izloženosti i koncentracije.",
      en: "Some fragrance ingredients can trigger allergic reactions in sensitized individuals. Regulations and industry standards therefore require control and, in certain cases, disclosure of specific allergens. The presence of a listed allergen does not mean everyone will react; risk depends on the individual, exposure and concentration.",
    },
    sources: [
      {
        label: "IFRA — Safe use of fragrance",
        url: "https://ifrafragrance.org/safe-use",
        type: "industry-official",
      },
    ],
  },
  {
    id: "clone-inspired-by",
    name: "Clone / inspired-by fragrance",
    aliases: [
      "clone fragrance",
      "perfume clone",
      "klon parfema",
      "inspirisan parfem",
    ],
    kind: "concept",
    answer: {
      sr: "U parfemskoj zajednici 'clone' ili 'inspired-by' obično znači miris koji namerno cilja prepoznatljiv profil drugog parfema. To ne znači da je formula identična, da koristi iste sirovine ili da će se ponašati isto na koži. Sličnost može biti velika u određenoj fazi, a razlike u otvaranju, teksturi, projekciji i drydownu značajne.",
      en: "In fragrance-community usage, a 'clone' or 'inspired-by' fragrance usually means a scent deliberately targeting the recognizable profile of another perfume. It does not mean the formula is identical, uses the same materials or performs the same on skin. Similarity can be high in one phase while opening, texture, projection and drydown differ substantially.",
    },
    sources: [
      {
        label: "PlayNice — Fragrance Intelligence terminology",
        url: "https://playniceshop.me/",
        type: "first-party-editorial",
      },
    ],
  },

  {
    id: "aldehydes",
    name: "Aldehydes",
    aliases: ["aldehydes", "aldehidi", "aldehidni parfem", "aldehydic"],
    kind: "material-family",
    answer: {
      sr: "Aldehidi su široka grupa mirisnih molekula, a u parfimeriji se često vezuju za blistav, čist, sapunast, citrusan, metalan ili voštan efekat — zavisno od konkretnog aldehida. Nisu jedna nota niti svi mirišu isto. U klasičnoj parfimeriji poznati su po tome što mogu da daju kompoziciji sjaj, volumen i apstraktniji karakter.",
      en: "Aldehydes are a broad family of aroma molecules. In perfumery they can create sparkling, clean, soapy, citrusy, metallic or waxy effects depending on the specific aldehyde. They are not a single note and do not all smell alike. In classical perfumery they are famous for adding lift, volume and a more abstract character.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "coumarin",
    name: "Coumarin",
    aliases: ["coumarin", "kumarin"],
    kind: "material",
    answer: {
      sr: "Kumarin je mirisna molekula sa toplim, slatkastim, seno-likim i bademasto-tonka karakterom. Prirodno je prisutan, između ostalog, u tonka pasulju, ali se u parfimeriji široko koristi i kao sintetički materijal. Posebno je važan u fougère strukturama.",
      en: "Coumarin is an aroma molecule with a warm, sweet, hay-like, almond-tonka character. It occurs naturally in materials such as tonka bean and is also widely used synthetically in perfumery. It is especially important in fougère structures.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "labdanum",
    name: "Labdanum",
    aliases: ["labdanum", "labdanum resin", "cistus", "cistus labdanum"],
    kind: "material",
    answer: {
      sr: "Labdanum je smolasti materijal dobijen iz biljaka roda Cistus. U parfimeriji daje topao, ambrast, kožast, balzamičan, smolast i ponekad blago animalan karakter. Jedan je od ključnih gradivnih materijala klasičnih amber akorda.",
      en: "Labdanum is a resinous material obtained from Cistus plants. In perfumery it gives warm, ambery, leathery, balsamic, resinous and sometimes slightly animalic facets. It is one of the key building materials of classical amber accords.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "benzoin",
    name: "Benzoin",
    aliases: ["benzoin", "benzoe", "benzoin resin", "benzoinska smola"],
    kind: "material",
    answer: {
      sr: "Benzoin je balzamična smola sa toplim, slatkim, vanilastim, blago začinskim i karamelnim nijansama. Često se koristi u amber, balsamic i gourmand kompozicijama, a može doprineti i zaobljenosti i postojanosti baze.",
      en: "Benzoin is a balsamic resin with warm, sweet, vanilla-like, lightly spicy and caramel facets. It is common in amber, balsamic and gourmand compositions and can also contribute roundness and persistence to a fragrance base.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "tonka-bean",
    name: "Tonka bean",
    aliases: ["tonka", "tonka bean", "tonka pasulj", "tonka zrno"],
    kind: "material",
    answer: {
      sr: "Tonka pasulj potiče iz semena drveta Dipteryx odorata. Miris mu je topao, sladak i složen, često sa utiscima vanile, badema, sena, duvana i začina. Bogat je kumarinom i čest je u fougère, amber i gourmand parfemima.",
      en: "Tonka bean comes from the seeds of Dipteryx odorata. Its scent is warm, sweet and complex, often suggesting vanilla, almond, hay, tobacco and spice. It is rich in coumarin and common in fougère, amber and gourmand fragrances.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "saffron",
    name: "Saffron",
    aliases: ["saffron", "šafran", "safran"],
    kind: "material",
    answer: {
      sr: "Šafran u parfimeriji može dati suv, začinski, kožast, blago metalan i topao efekat. Prirodni šafran je skup, pa se njegov mirisni utisak često gradi kombinacijom prirodnih i sintetičkih materijala. Posebno je čest u modernim amber, leather i oud kompozicijama.",
      en: "Saffron can bring dry, spicy, leathery, slightly metallic and warm effects to fragrance. Natural saffron is expensive, so its olfactory impression is often built with a combination of natural and synthetic materials. It is especially common in modern amber, leather and oud compositions.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "leather-accord",
    name: "Leather accord",
    aliases: ["leather accord", "leather note", "kožna nota", "kozna nota", "kožni akord", "kozni akord"],
    kind: "accord",
    answer: {
      sr: "Kožna nota u parfemu najčešće nije ekstrakt prave kože, već akord izgrađen od više mirisnih materijala. Može biti suva, dimna, katranasta, antilopasta, meka, animalna ili elegantno puderasta. Istorijski je povezana sa dimnim i fenolnim materijalima, a savremeni leather akordi mogu biti mnogo mekši i čistiji.",
      en: "A leather note in perfume is usually not an extract of real leather but an accord built from multiple aroma materials. It can be dry, smoky, tarry, suede-like, soft, animalic or elegantly powdery. Historically it is linked with smoky and phenolic materials, while modern leather accords can be much softer and cleaner.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "aquatic-calone",
    name: "Aquatic / Calone",
    aliases: [
      "calone",
      "calone molecule",
      "calone marine",
      "calone watermelon",
      "aquatic accord",
      "aquatic note",
      "vodena nota",
      "morska nota",
      "marine accord",
    ],
    kind: "material-family",
    answer: {
      sr: "Aquatic ili marine efekat u savremenoj parfimeriji često se gradi sintetičkim molekulima i akordima. Calone® je dsm-firmenich watery molekula intenzivnog ozone/marine karaktera sa floralnim podtonom; postala je ključni potpis marine talasa 1990-ih i često daje morski, vlažan i blago watermelon-like utisak. Aquatic parfem zato ne mora doslovno da sadrži morsku vodu.",
      en: "Aquatic or marine effects in modern perfumery are often built with synthetic aroma molecules and accords. Calone® is a dsm-firmenich watery molecule with intense ozone and marine character plus floral undertones; it became a defining signature of the marine wave of the 1990s and often gives a sea-breeze, wet and slightly watermelon-like impression. An aquatic fragrance therefore does not literally contain sea water.",
    },
    sources: [
      {
        label: "dsm-firmenich — CALONE",
        url: "https://studio.dsm-firmenich.com/product/caloner-pe-918970",
        type: "manufacturer-official",
      },
    ],
  },
  {
    id: "incense-olibanum",
    name: "Incense / Olibanum",
    aliases: ["incense", "olibanum", "frankincense", "tamjan"],
    kind: "material",
    answer: {
      sr: "Olibanum, odnosno frankincense ili tamjan, aromatična je smola koja može dati svetao citrusno-smolast, suv, mineralan, diman, balzamičan i duhovno-asocijativan karakter. U parfimeriji se koristi i u svežim i u tamnim kompozicijama — nije rezervisan samo za teške orijentalne mirise.",
      en: "Olibanum, also called frankincense or incense, is an aromatic resin that can bring bright citrus-resinous, dry, mineral, smoky, balsamic and contemplative facets. In perfumery it appears in both fresh and dark compositions and is not limited to heavy oriental styles.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "tobacco-note",
    name: "Tobacco note",
    aliases: ["tobacco note", "tobacco", "duvan", "duvanska nota"],
    kind: "material-family",
    answer: {
      sr: "Duvanska nota u parfemu može ići od suvog lista, sena i začina do mednog, slatkog, dimnog, kožastog ili gotovo čokoladnog karaktera. Često je akordska interpretacija, a ne jednostavno 'miris cigarete'. Zato dva tobacco parfema mogu mirisati potpuno različito.",
      en: "A tobacco note in fragrance can range from dry leaf, hay and spice to honeyed, sweet, smoky, leathery or almost chocolate-like facets. It is often an accord-based interpretation rather than simply 'the smell of a cigarette', so two tobacco fragrances can smell completely different.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "powdery-effect",
    name: "Powdery effect",
    aliases: ["powdery", "puderast", "puderasta nota", "powdery perfume"],
    kind: "concept",
    answer: {
      sr: "Puderast karakter nije jedna jedina sirovina. Može nastati iz materijala i akorda poput irisa/orrisa, heliotropina, ljubičice, mošusa, vanile i nekih aldehida. Rezultat može podsećati na kozmetički puder, ruž za usne, mekanu kožu ili suvu baršunastu teksturu.",
      en: "A powdery effect is not one single raw material. It can come from materials and accords such as iris/orris, heliotropin, violet, musks, vanilla and some aldehydes. The result can evoke face powder, lipstick, soft skin or a dry velvety texture.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },

  {
    id: "fragrance-families",
    name: "Fragrance families",
    aliases: [
      "fragrance families",
      "perfume families",
      "families of perfume",
      "fragrance family",
      "mirisne porodice",
      "parfemske porodice",
      "porodice parfema",
    ],
    kind: "concept",
    answer: {
      sr: "Mirisne porodice su klasifikacioni sistem koji grupiše parfeme prema dominantnom karakteru. Različiti sistemi koriste malo drugačije podele, ali često srećeš fresh/citrus, floral, woody, ambrée/amber, gourmand, chypre i fougère. Granice nisu apsolutne: jedan parfem može pripadati više porodica ili stajati između njih.",
      en: "Fragrance families are a classification system that groups perfumes by dominant olfactory character. Different systems use slightly different divisions, but common groups include fresh/citrus, floral, woody, amber, gourmand, chypre and fougère. The borders are not absolute: one perfume can belong to more than one family or sit between them.",
    },
    sources: [
      {
        label: "The Perfume Society — Fragrance Families",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "chypre",
    name: "Chypre",
    aliases: ["chypre", "sipra", "šipra", "chypre family", "chypre parfem"],
    kind: "family",
    answer: {
      sr: "Chypre je klasična mirisna porodica čiji je tradicionalni kostur suv, topao i mahovinasto-drvenast. Najčešće se vezuje za kontrast bergamota na vrhu i baze od hrastove mahovine, pačulija i labdanuma. Moderni chypre parfemi često prilagođavaju tu strukturu savremenim regulatornim i kreativnim uslovima.",
      en: "Chypre is a classic fragrance family with a traditionally dry, warm, mossy-woody structure. It is commonly associated with a bergamot opening over a base built around oakmoss, patchouli and labdanum. Modern chypres often reinterpret that structure for contemporary regulatory and creative conditions.",
    },
    sources: [
      {
        label: "The Perfume Society — Chypre",
        url: "https://perfumesociety.org/fragrance-families/chypre/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "fougere",
    name: "Fougère",
    aliases: ["fougere", "fougère", "fuzer", "fougere family", "fougere parfem"],
    kind: "family",
    answer: {
      sr: "Fougère je porodica čije ime na francuskom znači 'paprat'. Klasična fougère struktura obično spaja aromatičnu lavandu sa bergamotom, geranijumom, mahovinom, vetiverom i kumarinom. Danas je vrlo česta u muškoj parfimeriji, ali sama struktura nije vezana isključivo za pol.",
      en: "Fougère is a fragrance family whose name means 'fern' in French. A classic fougère structure commonly combines aromatic lavender with bergamot, geranium, moss, vetiver and coumarin. It is very common in masculine perfumery today, but the structure itself is not inherently gender-specific.",
    },
    sources: [
      {
        label: "The Perfume Society — Fougère",
        url: "https://perfumesociety.org/fragrance-families/fougere/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "gourmand",
    name: "Gourmand",
    aliases: ["gourmand", "gurmanski", "gourmand perfume", "gurmanski parfem"],
    kind: "family",
    answer: {
      sr: "Gourmand parfemi grade utisak jestivih ili desertnih nota — vanile, karamele, čokolade, meda, kafe, pralina i sličnih akorda. To je relativno mlada moderna porodica koja je snažno porasla od 1990-ih. Gourmand ne znači nužno samo 'veoma sladak': kompozicija može biti suva, začinska, dimna ili drvenasta, a i dalje imati jestivi karakter.",
      en: "Gourmand fragrances create an edible or dessert-like impression with notes such as vanilla, caramel, chocolate, honey, coffee or praline. It is a relatively young modern family that expanded strongly from the 1990s onward. Gourmand does not necessarily mean simply 'very sweet': a composition can be dry, spicy, smoky or woody while retaining an edible character.",
    },
    sources: [
      {
        label: "The Perfume Society — Fragrance Families",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/fragrance-families/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "oud",
    name: "Oud / Oudh",
    aliases: ["oud", "oudh", "agarwood", "agar wood", "agar drvo"],
    kind: "material",
    answer: {
      sr: "Oud, odnosno oudh ili agarwood, potiče od smolastog drveta određenih Aquilaria stabala koje nastaje kao odgovor na infekciju ili oštećenje. Prirodni oud može imati vrlo kompleksan drvenast, balzamičan, zemljan, diman i ponekad animalan karakter. Zbog retkosti i cene, savremena parfimerija često koristi i sintetičke oud akorde.",
      en: "Oud, oudh or agarwood comes from resinous wood formed in certain Aquilaria trees as a response to infection or damage. Natural oud can be extremely complex, with woody, balsamic, earthy, smoky and sometimes animalic facets. Because it is rare and expensive, modern perfumery also frequently uses synthetic oud accords.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients / Oudh",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "ambergris",
    name: "Ambergris",
    aliases: ["ambergris", "siva ambra", "grey amber", "gray amber"],
    kind: "material",
    answer: {
      sr: "Ambergris je retka prirodna supstanca povezana sa sistemom za varenje ulješure. Posle dugog sazrevanja u morskom okruženju dobija kompleksan topao, slan, mineralan i animalno-ambarski karakter. Istorijski je bio cenjen i kao fiksativ; danas se u većini moderne parfimerije njegov efekat postiže sintetičkim molekulima i akordima.",
      en: "Ambergris is a rare natural substance associated with the digestive system of sperm whales. After long ageing in a marine environment it develops a complex warm, salty, mineral and animalic-amber character. Historically it was also valued as a fixative; in most modern perfumery its effect is recreated with synthetic molecules and accords.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients / Ambergris",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "orris-iris",
    name: "Iris / Orris",
    aliases: ["orris", "orris root", "iris", "iris note", "koren irisa", "korijen irisa"],
    kind: "material",
    answer: {
      sr: "U parfimeriji se 'iris' često odnosi na orris — materijal dobijen iz rizoma irisa, a ne prvenstveno iz cveta. Rizomi se dugo suše i sazrevaju pre destilacije, zbog čega je kvalitetan orris veoma skup. Miris može biti puderast, mekan, zemljan, puterast, ljubičast i elegantno drvenast.",
      en: "In perfumery, 'iris' often refers to orris — material obtained from iris rhizomes rather than mainly from the flower. The rhizomes are dried and aged for years before processing, which helps make high-quality orris very expensive. Its scent can be powdery, soft, earthy, buttery, violet-like and elegantly woody.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients / Orris root",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "patchouli",
    name: "Patchouli",
    aliases: ["patchouli", "pačuli", "paculi"],
    kind: "material",
    answer: {
      sr: "Pačuli dolazi iz listova biljke Pogostemon cablin iz porodice nane. Njegov miris može biti zemljan, vlažan, drvenast, diman, začinski, kamforast ili čak čokoladno-taman, zavisno od kvaliteta i obrade. Važan je u chypre, amber, woody i mnogim modernim kompozicijama.",
      en: "Patchouli comes from the leaves of Pogostemon cablin, a member of the mint family. Depending on quality and processing, it can smell earthy, damp, woody, smoky, spicy, camphoraceous or even dark and chocolate-like. It is important in chypre, amber, woody and many modern compositions.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients / Patchouli",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "vetiver",
    name: "Vetiver",
    aliases: ["vetiver", "vetivert", "vetiver note"],
    kind: "material",
    answer: {
      sr: "Vetiver se dobija prvenstveno iz korena tropske trave Chrysopogon zizanioides. U parfemu može dati suv, zemljan, korenast, diman, zelen, orašast ili čak blago citrusan efekat. Zbog velike postojanosti često se koristi u bazi, ali može biti i glavna tema cele kompozicije.",
      en: "Vetiver is obtained mainly from the roots of the tropical grass Chrysopogon zizanioides. In fragrance it can smell dry, earthy, rooty, smoky, green, nutty or even slightly citrusy. Because of its persistence it is often used in the base, but it can also be the central theme of an entire composition.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "neroli-orange-blossom",
    name: "Neroli and orange blossom",
    aliases: [
      "neroli",
      "nerolija",
      "orange blossom",
      "orange blossoma",
      "neroli i orange blossom",
      "nerolija i orange blossoma",
      "cvet narandze",
      "cvijet narandze",
    ],
    kind: "material",
    answer: {
      sr: "Neroli i orange blossom potiču od cvetova gorke narandže, ali nisu isti materijal. Neroli je etarsko ulje dobijeno destilacijom i često deluje sveže, zeleno, citrusno i blago gorko; orange blossom absolute se obično dobija ekstrakcijom i može biti bogatiji, topliji, slađi i senzualniji.",
      en: "Neroli and orange blossom come from bitter-orange flowers, but they are not the same material. Neroli is an essential oil produced by distillation and often smells fresh, green, citrusy and slightly bitter; orange blossom absolute is typically extracted and can feel richer, warmer, sweeter and more sensual.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "musk",
    name: "Musk",
    aliases: ["musk", "mošus", "mosus", "white musk", "beli mosus", "bijeli mosus"],
    kind: "material",
    answer: {
      sr: "Savremeni parfemski mošusi su gotovo uvek sintetički materijali. Mogu biti čisti i 'vešasti', puderasti, kremasti, topli, kožasti ili blago animalni, zavisno od molekula. Često služe kao mekana baza, daju osećaj kože i pomažu da kompozicija deluje zaokruženije i dugotrajnije.",
      en: "Modern perfumery musks are almost always synthetic materials. Depending on the molecule they can smell clean and laundry-like, powdery, creamy, warm, skin-like or mildly animalic. They often form a soft base, create a skin-like effect and help a composition feel more rounded and persistent.",
    },
    sources: [
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "fixative",
    name: "Fixative",
    aliases: ["fixative", "fiksativ", "fixative in perfume", "fiksativ u parfemu"],
    kind: "concept",
    answer: {
      sr: "Fiksativ je naziv za materijal ili funkciju u formuli koja usporava isparavanje i pomaže da miris traje i razvija se ravnomernije. Mnogi teži bazni materijali — smole, određena drveta, pačuli, vetiver, orris i mošusi — mogu imati fiksativni efekat. To nije magični sastojak koji automatski pretvara svaki parfem u '12 sati trajnosti'.",
      en: "A fixative is a material or function in a formula that slows evaporation and helps a fragrance last and develop more evenly. Many heavier base materials — resins, certain woods, patchouli, vetiver, orris and musks — can have a fixative effect. It is not a magic ingredient that automatically turns every perfume into a '12-hour fragrance'.",
    },
    sources: [
      {
        label: "The Perfume Society — A-Z / Fixative",
        url: "https://perfumesociety.org/wp-content/uploads/2018/06/SL31.OnlineIssue.pdf",
        type: "industry-education",
      },
    ],
  },

  {
    id: "projection",
    name: "Projection",
    aliases: [
      "projection",
      "projekcija",
      "koliko se oseca parfem",
      "koliko se osjeca parfem",
      "koliko daleko se oseca",
      "koliko daleko se osjeca",
      "scent circle",
      "throw",
    ],
    kind: "concept",
    answer: {
      sr: "Projection opisuje koliko se miris širi od osobe koja ga nosi u datom trenutku — praktično njegov mirisni 'radijus'. Sillage je druga stvar: trag koji ostaje iza tebe dok se krećeš. Jak projection može postojati uz kraći sillage i obrnuto; oba se menjaju kroz razvoj parfema.",
      en: "Projection describes how far a fragrance radiates from the wearer at a given moment — its practical scent radius. Sillage is different: the trail left behind as the wearer moves. Strong projection can exist with a shorter trail and vice versa, and both can change during a fragrance's development.",
    },
    sources: [
      {
        label: "The Perfume Society — FAQ / scent circle",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/faq/",
        type: "industry-education",
      },
      {
        label: "The Perfume Society — A-Z / Sillage",
        url: "https://perfumesociety.org/wp-content/uploads/2018/06/SL31.OnlineIssue.pdf",
        type: "industry-education",
      },
    ],
  },
  {
    id: "flanker",
    name: "Flanker",
    aliases: [
      "flanker",
      "flanker parfem",
      "flanker fragrance",
      "flanker miris",
    ],
    kind: "concept",
    answer: {
      sr: "Flanker je novo izdanje povezano sa postojećim parfemom — obično deli ime, identitet ili deo mirisne ideje originala, ali menja koncentraciju, karakter, note ili namenu. Može biti trajno izdanje ili limited edition. Nije nužno samo 'jača verzija' originala.",
      en: "A flanker is a new release connected to an existing fragrance, usually sharing its name, identity or part of its olfactory idea while changing concentration, character, notes or purpose. It may be permanent or limited edition and is not necessarily just a stronger version of the original.",
    },
    sources: [
      {
        label: "The Perfume Society — Frequently Asked Questions",
        url: "https://perfumesociety.org/frequently-asked-questions/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "reformulation",
    name: "Reformulation",
    aliases: [
      "reformulation",
      "reformulacija",
      "reformulisan parfem",
      "reformuliran parfem",
      "promenjena formula parfema",
      "promijenjena formula parfema",
    ],
    kind: "concept",
    answer: {
      sr: "Reformulacija znači da je formula postojećeg parfema promenjena nakon originalnog lansiranja. Razlozi mogu uključivati dostupnost sirovina, regulatorna ograničenja, stabilnost, trošak ili kreativnu odluku brenda. Dobra reformulacija pokušava da sačuva identitet mirisa čak i kada se pojedini materijali moraju zameniti ili ograničiti.",
      en: "Reformulation means the formula of an existing fragrance has been changed after its original release. Reasons can include raw-material availability, regulatory restrictions, stability, cost or a creative brand decision. A good reformulation aims to preserve the fragrance's identity even when certain materials must be replaced or restricted.",
    },
    sources: [
      {
        label: "The Perfume Society — fragrance advice / reformulation",
        url: "https://perfumesociety.org/tag/advice/",
        type: "industry-education",
      },
      {
        label: "IFRA — Understanding the Standards",
        url: "https://ifrafragrance.org/understanding-standards",
        type: "industry-standard",
      },
    ],
  },
  {
    id: "niche-designer-indie",
    name: "Designer, niche and indie fragrance",
    aliases: [
      "designer vs niche",
      "niche vs designer",
      "designer i niche",
      "niche i designer",
      "designer i nisni",
      "nisni i dizajnerski",
      "dizajnerski i nisni",
      "razlika izmedju niche i designer",
      "razlika izmedju designer i niche",
      "niche parfem",
      "nisni parfem",
      "indie parfem",
      "artisan perfume",
      "artisanal perfume",
    ],
    kind: "concept",
    answer: {
      sr: "Designer parfem obično dolazi iz modne, beauty ili lifestyle kuće kojoj parfemi nisu jedina delatnost. 'Niche' je istorijski označavao nezavisnije kuće fokusirane na parfem, ali je granica danas prilično zamagljena i termin često opisuje umetničkiji, manje masovno orijentisan pristup. 'Indie' se najčešće koristi za manje nezavisne kuće i autore. To su tržišne i kulturne kategorije, ne garancije kvaliteta.",
      en: "Designer fragrance usually comes from a fashion, beauty or lifestyle house for which perfume is not the only business. Historically, 'niche' referred more to independent perfume-focused houses, but the boundary is now blurred and the term often signals a more artistic, less mass-oriented approach. 'Indie' usually refers to smaller independent houses and creators. These are market and cultural categories, not guarantees of quality.",
    },
    sources: [
      {
        label: "The Perfume Society — What is niche fragrance?",
        url: "https://perfumesociety.org/tag/what-is-niche/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "maceration",
    name: "Maceration",
    aliases: [
      "maceration",
      "maceracija",
      "macerate perfume",
      "macerating perfume",
      "odlezavanje parfema",
      "odlezhavanje parfema",
    ],
    kind: "concept",
    answer: {
      sr: "U klasičnom procesu proizvodnje parfema, maceracija označava period tokom kog se već pomešani mirisni sastojci ostavljaju da zajedno odstoje i razviju se pre završne procene i punjenja. The Perfume Society opisuje period od više nedelja, dok Fragonard navodi da pojedine mešavine sazrevaju jedan do tri meseca. U internet zajednicama se reč često koristi mnogo šire za 'odležavanje bočice', pa FI ne treba automatski da tretira svaku takvu tvrdnju kao industrijski standard.",
      en: "In classical perfume production, maceration is the resting period in which blended fragrance materials are allowed to sit together and develop before final evaluation and bottling. The Perfume Society describes a period of several weeks, while Fragonard notes that some blends mature for one to three months. Online fragrance communities often use the word more loosely for 'letting a bottle sit', so FI should not treat every such claim as an industry standard.",
    },
    sources: [
      {
        label: "The Perfume Society — A-Z / Maceration",
        url: "https://perfumesociety.org/wp-content/uploads/2018/06/SL31.OnlineIssue.pdf",
        type: "industry-education",
      },
      {
        label: "The Perfume Society — Fragonard",
        url: "https://perfumesociety.org/perfume-house/fragonard/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "natural-vs-synthetic",
    name: "Natural and synthetic fragrance materials",
    aliases: [
      "natural vs synthetic",
      "synthetic vs natural",
      "prirodni i sinteticki",
      "prirodni vs sinteticki",
      "prirodni sastojci",
      "sinteticki sastojci",
      "synthetic ingredients",
      "natural ingredients",
    ],
    kind: "concept",
    answer: {
      sr: "Moderna parfimerija gotovo uvek kombinuje prirodne i sintetičke materijale. Prirodni materijali mogu biti kompleksni ekstrakti biljaka ili drugih prirodnih izvora; sintetičke molekule mogu rekreirati prirodne efekte ili dati potpuno nove mirisne mogućnosti. 'Prirodno' ne znači automatski kvalitetnije ili bezbednije, niti 'sintetičko' znači jeftino ili loše — oba tipa materijala su osnovni alat savremenog parfumera.",
      en: "Modern perfumery almost always combines natural and synthetic materials. Naturals can be complex extracts from plants or other natural sources; synthetic molecules can recreate natural effects or create entirely new olfactory possibilities. 'Natural' does not automatically mean higher quality or safer, and 'synthetic' does not mean cheap or inferior — both are fundamental tools of modern perfumery.",
    },
    sources: [
      {
        label: "IFRA — The fragrance value chain",
        url: "https://ifrafragrance.org/about-fragrance/fragrance-value-chain",
        type: "industry-standard",
      },
      {
        label: "The Perfume Society — Ingredients",
        url: "https://perfumesociety.org/discover-perfume/an-introduction/ingredients/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "layering",
    name: "Fragrance layering",
    aliases: [
      "layering",
      "layer perfumes",
      "layer fragrance",
      "mesanje parfema",
      "mijesanje parfema",
      "kombinovanje parfema",
      "kombiniranje parfema",
      "nositi dva parfema",
    ],
    kind: "concept",
    answer: {
      sr: "Layering je nošenje dva ili više mirisa zajedno da bi se dobio ličniji rezultat. Najlakši početak je kombinovati mirise iz slične porodice ili koristiti jedan jednostavniji miris kao osnovu, pa dodati svežinu, cvetnost, začine ili baznu dubinu drugim. Nema univerzalno 'tačne' kombinacije — testiranje na koži je važnije od teorije.",
      en: "Layering means wearing two or more fragrances together to create a more personal result. An easy starting point is combining scents from related families or using a simpler scent as a base, then adding freshness, florals, spice or deeper base character with another. There is no universally 'correct' combination — testing on skin matters more than theory.",
    },
    sources: [
      {
        label: "The Perfume Society — FAQ / layering",
        url: "https://perfumesociety.org/frequently-asked-questions/",
        type: "industry-education",
      },
      {
        label: "The Perfume Society — How to layer",
        url: "https://perfumesociety.org/tag/how-to-layer/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "blotter-vs-skin",
    name: "Blotter vs skin testing",
    aliases: [
      "blotter vs skin",
      "paper vs skin",
      "bloter ili koza",
      "blotter ili koza",
      "papir ili koza",
      "testirati na kozi",
      "testirati na papiru",
      "probati na kozi",
    ],
    kind: "concept",
    answer: {
      sr: "Blotter je odličan za prvi utisak i brzo poređenje više mirisa, ali nije zamena za kožu. Parfem se na koži zagreva, razvija i može drugačije da se ponaša tokom sati. Najpraktičnije je prvo eliminisati očigledne promašaje na blotteru, a favorite zatim nositi na koži dovoljno dugo da prođu top note i pokažu srce i bazu.",
      en: "A blotter is excellent for a first impression and for comparing several scents quickly, but it is not a substitute for skin. On skin a fragrance warms, develops and can behave differently over hours. A practical method is to eliminate obvious misses on blotters first, then wear the favourites on skin long enough for the top notes to fade and the heart and base to emerge.",
    },
    sources: [
      {
        label: "The Perfume Society — Frequently Asked Questions",
        url: "https://perfumesociety.org/frequently-asked-questions/",
        type: "industry-education",
      },
      {
        label: "The Perfume Society — Blotters",
        url: "https://perfumesociety.org/product/perfume-society-blotters/",
        type: "industry-education",
      },
    ],
  },
  {
    id: "fragrance-storage",
    name: "Fragrance storage",
    aliases: [
      "store perfume",
      "perfume storage",
      "cuvanje parfema",
      "čuvanje parfema",
      "cuvati parfem",
      "čuvati parfem",
      "pravilno cuvati parfem",
      "pravilno čuvati parfem",
      "gde cuvati parfem",
      "gdje cuvati parfem",
      "gde čuvati parfem",
      "gdje čuvati parfem",
      "gde drzati parfem",
      "gdje drzati parfem",
      "kupatilo parfem",
      "bathroom perfume",
      "kako treba cuvati parfem",
    ],
    kind: "concept",
    answer: {
      sr: "Parfem je najbolje čuvati dalje od direktne svetlosti i velikih temperaturnih promena. Tamni ormar ili fioka u umereno hladnoj prostoriji su bolji izbor od sunčane police ili kupatila. Toplota i svetlost mogu ubrzati promene formule, naročito kod lakših, citrusnih kompozicija.",
      en: "Fragrance is best stored away from direct light and large temperature swings. A dark cupboard or drawer in a moderately cool room is a better choice than a sunny shelf or bathroom. Heat and light can accelerate changes in the formula, especially in lighter citrus-heavy compositions.",
    },
    sources: [
      {
        label: "The Perfume Society — Storage",
        url: "https://perfumesociety.org/tag/storage/",
        type: "industry-education",
      },
    ],
  },
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
      "parfum",
      "koncentracija parfema",
      "koncentracija mirisa",
      "sta znaci edp",
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
      "cant smell my own perfume",
      "cant smell my perfume",
      "i cant smell my own perfume",
      "i cant smell my perfume",
      "cannot smell my own perfume",
      "cannot smell my perfume",
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
      "note pyramid",
      "piramida nota",
      "gornje note",
      "srednje note",
      "bazne note",
      "note parfema",
      "top heart base notes",
      "top heart and base notes",
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
