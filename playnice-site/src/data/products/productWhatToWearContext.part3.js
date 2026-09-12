const entries = [
  {
    "sr": "Lanena ili utility košulja, chinos i lagane patike. Safari, ali bez bež prsluka sa 46 džepova. Niste David Attenborough.",
    "en": "A linen or utility shirt, chinos and light sneakers. Safari, yes. Beige vest with 46 pockets, no. You are not David Attenborough."
  },
  {
    "sr": "Suede jakna, košulja ili rolka i tamne pantalone. Čaj i antilop traže teksturu. Majica sa natpisom „KING“ može ostati u fioci.",
    "en": "A suede jacket, shirt or turtleneck and dark trousers. Tea and suede want texture. The T-shirt that says KING can remain in the drawer."
  },
  {
    "sr": "Košulju. Dobru. Ne zato što parfem zahteva formalnost, nego zato što ćete verovatno završiti dovoljno blizu nekoga da će primetiti kragnu.",
    "en": "A shirt. A good one. Not because the fragrance demands formality, but because you may end up close enough to someone for them to notice the collar."
  },
  {
    "sr": "Najbolje što manje. Majica, šorts, možda lanena košulja. Jul nije vreme za modni doktorat.",
    "en": "As little as possible. T-shirt, shorts, perhaps a linen shirt. July is no time for a PhD in fashion."
  },
  {
    "sr": "Svetla košulja, maslinaste pantalone i jednostavne patike. Zeleno i sređeno. Botanika, ali sa dobrim frizerom.",
    "en": "A light shirt, olive trousers and simple sneakers. Green and well-groomed. Botany with a good haircut."
  },
  {
    "sr": "Tamna košulja ili džemper. Nešto u bordo ili crnoj ako baš želite da sarađujete sa nazivom, ali nemojmo praviti uniformu.",
    "en": "A dark shirt or sweater. Burgundy or black if you really want to cooperate with the name, but there is no need to create a uniform."
  },
  {
    "sr": "Crna jakna, tamne farmerke i čizme. Da, opet crno. Parfem se zove Hawas Black; nismo imali mnogo prostora za avangardu.",
    "en": "A black jacket, dark jeans and boots. Yes, black again. It is called Hawas Black; there was limited room for avant-garde thinking."
  },
  {
    "sr": "Siva ili bela košulja, tamne pantalone i čiste patike. Elegantno, ali bez korporativnog mirisa fotokopir aparata.",
    "en": "A grey or white shirt, dark trousers and clean sneakers. Elegant, but without the corporate scent of a photocopier."
  },
  {
    "sr": "Crna rolka i sako. Ako već parfem ima ime kao negativac iz Bond filma, nema potrebe da dolazite u bermudama.",
    "en": "A black turtleneck and blazer. If the fragrance already has the name of a Bond villain, there is no need to arrive wearing Bermuda shorts."
  },
  {
    "sr": "Kašmir, neutralne boje i nešto mekano. Bež, krem, puderasto roze, siva. Odeća koja ne viče — samo zna.",
    "en": "Cashmere, neutral colours and something soft. Beige, cream, powder pink, grey. Clothes that do not shout — they simply know."
  },
  {
    "sr": "Crnu haljinu. Da, kliše je. Da, radi. Neke stvari su kliše zato što je ostatak sveta već izgubio raspravu.",
    "en": "A black dress. Yes, it is a cliché. Yes, it works. Some things become clichés because the rest of the world already lost the argument."
  },
  {
    "sr": "Bela majica, lagana košulja i svetle pantalone. Citrus i đumbir ne žele da provedu leto pod tri sloja crne sintetike.",
    "en": "A white T-shirt, light shirt and pale trousers. Citrus and ginger have no desire to spend summer trapped beneath three layers of black polyester."
  },
  {
    "sr": "Tehnička jakna, čista majica i patike. Hladno, urbano, moderno. Kao frižider koji je dobio Instagram profil.",
    "en": "A technical jacket, clean T-shirt and sneakers. Cool, urban, modern. Like a refrigerator that got an Instagram account."
  },
  {
    "sr": "Polo majica ili lanena košulja i chinos. Sveže, zeleno, uredno. Konj na bočici nije dozvola za jahaće čizme.",
    "en": "A polo or linen shirt with chinos. Fresh, green and neat. The horse on the bottle is not permission to wear riding boots."
  },
  {
    "sr": "Bela majica. Kraj. Ako baš insistirate, farmerke. Miris se već dovoljno potrudio da sve bude jednostavno.",
    "en": "A white T-shirt. Done. Jeans too, if you insist. The fragrance already worked hard enough to make everything simple."
  },
  {
    "sr": "Crna košulja, dobre patike i pantalone koje vam stvarno stoje. Ovo je moderan dejt, ne renesansni bal.",
    "en": "A black shirt, good sneakers and trousers that genuinely fit. This is a modern date, not a Renaissance ball."
  },
  {
    "sr": "Najbolje ništa. Toliko je lagan.",
    "en": "Preferably nothing. It is that light."
  },
  {
    "sr": "Crna rolka, kaput i čizme. Ako uđete u sobu i neko pomisli da ste došli da kupite hotel, kombinacija je uspela.",
    "en": "A black turtleneck, coat and boots. If you enter the room and someone assumes you are there to buy the hotel, the outfit worked."
  },
  {
    "sr": "Kožna jakna preko svetle majice. Baš kao parfem: prvo deluje sveže, a onda shvatite da je ispod dosta ozbiljniji čovek.",
    "en": "A leather jacket over a light T-shirt. Just like the fragrance: fresh at first, then you realise there is a much more serious man underneath."
  },
  {
    "sr": "Minimalistički sako, fina majica i čiste pantalone. Prada ne traži mnogo ukrasa. Zato i piše Prada, a ne „Sve po 3 eura“.",
    "en": "A minimalist blazer, fine T-shirt and clean trousers. Prada does not need many decorations. That is why it says Prada rather than EVERYTHING €3."
  },
  {
    "sr": "Crnu majicu, crne pantalone i dobre patike. Jednostavno, moderno, malo previše lepo upakovano. Baš kao parfem.",
    "en": "A black T-shirt, black trousers and good sneakers. Simple, modern, almost suspiciously well packaged. Much like the fragrance."
  },
  {
    "sr": "Bomber ili biker jaknu, crnu majicu i patike. Samo bez ogromne munje na majici. Bočica je već odradila taj vic.",
    "en": "A bomber or biker jacket, black T-shirt and sneakers. Just skip the giant lightning bolt on the shirt. The bottle already made that joke."
  },
  {
    "sr": "Polo majica, lagani sako i čiste patike. Kao da idete na jahtu, čak i ako idete na kafu kod autobuske.",
    "en": "A polo shirt, light blazer and clean sneakers. As if you are heading to a yacht, even when you are actually heading for coffee near the bus station."
  },
  {
    "sr": "Bela košulja, svetle pantalone i što manje detalja. Morska so i čist mošus ne traže zlatnu Versace meduzu od 14 centimetara.",
    "en": "A white shirt, light trousers and as few details as possible. Sea salt and clean musk do not require a giant gold Medusa on your chest."
  },
  {
    "sr": "Otvorenu košulju. Jedno dugme više nego što bi vam majka odobrila.",
    "en": "An open shirt. One button more than your mother would approve of."
  }
];

export default entries;
