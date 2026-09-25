/*
 * PLAYNICE FI KNOWLEDGE — TERMS & MATERIALS
 *
 * Every entry is source-backed. Knowledge routing should only intercept
 * explanatory questions; recommendation-style queries must fall through to
 * the existing Discovery Engine.
 */

export const fragranceTerms = [

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
      "seasonal fragrance",
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
    aliases: ["clone fragrance", "perfume clone", "klon parfema", "inspired by fragrance", "inspirisan parfem"],
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
    aliases: ["calone", "aquatic accord", "aquatic note", "vodena nota", "morska nota", "marine accord"],
    kind: "material-family",
    answer: {
      sr: "Aquatic ili marine efekat u savremenoj parfimeriji često se gradi sintetičkim molekulima i akordima. Calone je jedan od najpoznatijih materijala tog tipa i može dati morski, ozonski, vodenast i blago dinjasto-voćni utisak. Aquatic parfem zato ne mora doslovno da sadrži 'morsku vodu' kao sirovinu.",
      en: "Aquatic or marine effects in modern perfumery are often built with synthetic aroma molecules and accords. Calone is one of the best-known materials of this type and can create marine, ozonic, watery and slightly melon-like facets. An aquatic fragrance therefore does not literally need to contain 'sea water' as a raw material.",
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
      "indie fragrance",
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
