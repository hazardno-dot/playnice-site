const entries = [
  {
    "sr": "Čista bela majica, farmerke i patike. Ako vam za ovaj parfem treba stilista, verovatno komplikujete i ostale stvari u životu.",
    "en": "A clean white T-shirt, jeans and sneakers. If you need a stylist for this fragrance, you are probably overcomplicating other things in life too."
  },
  {
    "sr": "Crna majica ili tamna košulja. Nešto jednostavno — parfem je već poneo ananas, karamelu i dovoljno samopouzdanja za obojicu.",
    "en": "A black T-shirt or a dark shirt. Keep it simple — the fragrance already brought pineapple, caramel and enough confidence for both of you."
  },
  {
    "sr": "Sako bez kravate, dobra majica ispod i cipele koje nisu kupljene uz odelo za maturu. Želite da izgledate skupo, ne zaposleno u banci.",
    "en": "A blazer without a tie, a good T-shirt underneath and shoes that were not bought with your graduation suit. You want to look expensive, not employed by a bank."
  },
  {
    "sr": "Svetla košulja, chinos pantalone i mokasine ili čiste patike. Tygar DNK ne traži mnogo — samo da ne pokvarite stvar čarapama uz sandale.",
    "en": "A light shirt, chinos and loafers or clean sneakers. This kind of fresh, polished DNA does not need much — just do not ruin it with socks and sandals."
  },
  {
    "sr": "Lanena košulja, svetle pantalone i rukavi malo podvrnuti. Imagination stil traži da izgledate kao da imate plan za leto, čak i ako nemate.",
    "en": "A linen shirt, light trousers and slightly rolled-up sleeves. This airy style wants you to look like you have a plan for summer, even if you do not."
  },
  {
    "sr": "Crno. Košulja, haljina, majica — svejedno. Bling već radi dovoljno da objasni da večeras niste krenuli po hleb.",
    "en": "Black. Shirt, dress, T-shirt — whatever. Bling already does enough to explain that you did not leave the house just to buy bread."
  },
  {
    "sr": "Kožna jakna ili jednostavan tamni sako. Aventus DNK voli čoveka koji izgleda kao da zna gde ide. Možete i samo da hodate odlučno.",
    "en": "A leather jacket or a simple dark blazer. This DNA likes someone who looks as if they know where they are going. Walking confidently is usually enough."
  },
  {
    "sr": "Siva, bela ili svetloplava košulja. Čisto, hladno, precizno. Kao da ste pročitali mejl do kraja pre nego što ste odgovorili.",
    "en": "Grey, white or light blue. Clean, cool and precise. Like someone who actually read the entire email before replying."
  },
  {
    "sr": "Deblji džemper, vuneni kaput i nešto tamno. Viski, sandalovina i vanila ne žele tanku polo majicu. Imaju standarde.",
    "en": "A heavier sweater, a wool coat and something dark. Whisky, sandalwood and vanilla do not want a thin polo shirt. They have standards."
  },
  {
    "sr": "Plava košulja, farmerke i čiste bele patike. Da, očigledno je. Ponekad je očigledno upravo zato što radi.",
    "en": "A blue shirt, jeans and clean white sneakers. Yes, it is obvious. Sometimes it is obvious because it works."
  },
  {
    "sr": "Lan, šorts i nešto što se lako skida kada stignete do mora. Ovo nije parfem koji želi da vidi vaš zimski kaput.",
    "en": "Linen, shorts and something easy to remove once you reach the sea. This fragrance has no interest in seeing your winter coat."
  },
  {
    "sr": "Crni džemper, tamne pantalone i ozbiljne cipele ili čizme. Izgledajte kao čovek kome se ne nudi najjeftiniji viski.",
    "en": "A black sweater, dark trousers and serious shoes or boots. Look like someone who is not automatically offered the cheapest whisky."
  },
  {
    "sr": "Polo majica, chinos i patike. Uredno, moderno, bez drame. Parfem je dovoljno prilagodljiv da vam neće prijaviti modnu grešku.",
    "en": "A polo shirt, chinos and sneakers. Neat, modern, no drama. The fragrance is versatile enough not to report you for a minor fashion offence."
  },
  {
    "sr": "Džemper, kaput i nešto toplo oko vrata. Ako držite šolju kafe, fotografija se praktično sama završila.",
    "en": "A sweater, a coat and something warm around your neck. If you are holding a cup of coffee too, the photo has basically finished itself."
  },
  {
    "sr": "Tamna rolka i kaput. Bez velikih logotipa. Ako parfem izgleda skuplje od vaše garderobe, pustite ga da pobedi dostojanstveno.",
    "en": "A dark turtleneck and a coat. No giant logos. If the fragrance looks more expensive than your outfit, let it win with dignity."
  },
  {
    "sr": "Crna košulja, čizme i malo karaktera. Karamele i tamjana već ima dovoljno; zlatni lanac od 800 grama nije potreban.",
    "en": "A black shirt, boots and a little attitude. There is already enough caramel and incense going on; the two-kilo gold chain can stay at home."
  },
  {
    "sr": "Svetla košulja, maslinaste ili bež pantalone i čiste patike. Zelen, suv i sređen. Kao vikend na kojem niko nije napravio glupost.",
    "en": "A light shirt, olive or beige trousers and clean sneakers. Green, dry and put together. Like a weekend in which nobody made a terrible decision."
  },
  {
    "sr": "Rolka, sako i tamne pantalone. Med, duvan i cimet neće se buniti ni protiv kaputa. Protiv havajske košulje verovatno hoće.",
    "en": "A turtleneck, blazer and dark trousers. Honey, tobacco and cinnamon will happily accept a coat too. A Hawaiian shirt might be more controversial."
  },
  {
    "sr": "Tamno odelo ili elegantna večernja kombinacija. Ako već mirišete na oud, ružu i vanilu, trenerka sa tri pruge šalje konfliktne informacije.",
    "en": "A dark suit or an elegant evening outfit. If you already smell of oud, rose and vanilla, a three-stripe tracksuit sends mixed signals."
  },
  {
    "sr": "Sako, košulja otvorenog okovratnika i dobre cipele. Dovoljno elegantno da izgleda namerno, dovoljno opušteno da ne izgledate kao matičar.",
    "en": "A blazer, an open-collar shirt and good shoes. Elegant enough to look intentional, relaxed enough not to look like you are about to officiate a wedding."
  },
  {
    "sr": "Kupaći. Eventualno majicu preko, ako civilizacija baš insistira.",
    "en": "Swimwear. Maybe a T-shirt over it if civilization insists."
  },
  {
    "sr": "Letnja košulja, šorts i patike bez čarapa koje vire do pola lista. Rum i šećerna trska već šalju dovoljno turističkih signala.",
    "en": "A summer shirt, shorts and sneakers without socks climbing halfway up your calves. White rum and sugar cane already provide enough holiday information."
  },
  {
    "sr": "Dobar kaput, rolka i kožne cipele. Ako imate biblioteku sa kožnom foteljom, još bolje. Ako nemate, niko neće proveravati.",
    "en": "A good coat, a turtleneck and leather shoes. If you own a library with a leather armchair, even better. If not, nobody is checking."
  },
  {
    "sr": "Lanena košulja, bež šorts i mokasine. Idealno negde na obali. Podgorica u avgustu će takođe razumeti poentu.",
    "en": "A linen shirt, beige shorts and loafers. Ideally somewhere on the coast. A hot city in August will understand the idea too."
  },
  {
    "sr": "Bela košulja, pantalone na peglu i mokasine. Italijan koji ne kasni. Dakle, parfemska fantazija.",
    "en": "A white shirt, pressed trousers and loafers. An Italian who arrives on time. So, basically fragrance fiction."
  }
];

export default entries;
