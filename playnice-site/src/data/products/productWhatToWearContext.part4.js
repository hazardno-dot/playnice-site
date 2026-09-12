const entries = [
  {
    "sr": "Bela majica, plavi šorts i patike. Ako iza vas postoji more, odlično. Ako je parking, malo mašte.",
    "en": "A white T-shirt, blue shorts and sneakers. If there is a sea behind you, perfect. If there is a car park, use your imagination."
  },
  {
    "sr": "Polo, farmerke i lagane patike. Opušteno i čisto. Ne mora svaki parfem da dobije kostim od tri dela da bi imao dostojanstvo.",
    "en": "A polo, jeans and light sneakers. Relaxed and clean. Not every fragrance needs a three-piece suit to preserve its dignity."
  },
  {
    "sr": "Svetlosivu majicu, košulju preko i bele patike. Čisto i hladno. Snow bez potrebe da izgledate kao skijaški instruktor.",
    "en": "A light grey T-shirt, an overshirt and white sneakers. Clean and cool. Snow without looking like a ski instructor."
  },
  {
    "sr": "Bela košulja ili fina majica, bež pantalone i lagani sako. Sveže gore, toplije dole — bukvalno parfem preveden na garderobu.",
    "en": "A white shirt or fine T-shirt, beige trousers and a light blazer. Fresh on top, warmer underneath — basically the fragrance translated into clothes."
  },
  {
    "sr": "Mekan džemper, kaput i tamne pantalone. Ako uz to neko kuva kafu ili vino, možete slobodno prestati da pokušavate — atmosfera je rešena.",
    "en": "A soft sweater, coat and dark trousers. If someone is making coffee or mulled wine nearby, stop trying — the atmosphere is already complete."
  },
  {
    "sr": "Tamnoplavi ili crni sako, košulja bez kravate i dobre cipele. Noćni parfem koji ne želi da budete obezbeđenje ispred kluba.",
    "en": "A navy or black blazer, open-collar shirt and good shoes. A night fragrance that does not want you to look like security outside the club."
  },
  {
    "sr": "Bela majica, lagana jakna i sive pantalone. Sve čisto, hladno i urbano. Ako nosite fluorescentno zelene Crocsice, parfem više ne može da vas spase.",
    "en": "A white T-shirt, light jacket and grey trousers. Clean, cool and urban. If you are wearing fluorescent green Crocs, the fragrance can no longer save you."
  },
  {
    "sr": "Lanenu košulju, chinos i patike. Nešto između koktel-bara i odmora. Bakarna šolja nije obavezna, hvala Bogu.",
    "en": "A linen shirt, chinos and sneakers. Somewhere between cocktail bar and holiday mode. The copper mug is optional, fortunately."
  },
  {
    "sr": "Svetlu haljinu, svilu ili lan. Nešto što se pomera na vazduhu. Jasmin već radi teatralni deo; garderoba neka ne traži glavnu ulogu.",
    "en": "A light dress, silk or linen. Something that moves in the breeze. Jasmine is already handling the theatrical part; your clothes do not need the lead role."
  },
  {
    "sr": "Bela košulja, bež pantalone i dobre sandale ili mokasine. Mediteranska elegancija bez pokušaja da izgledate kao vlasnik jahte koju nemate.",
    "en": "A white shirt, beige trousers and good sandals or loafers. Mediterranean elegance without trying to look like the owner of a yacht you do not own."
  },
  {
    "sr": "Maslinastu, krem ili braon. Dobar pamuk, lan, jednostavne siluete. Ako odeća izgleda prirodno skupo, pogodili ste.",
    "en": "Olive, cream or brown. Good cotton, linen and simple silhouettes. If the clothes look naturally expensive, you understood the assignment."
  },
  {
    "sr": "Crno od glave do pete. Parfem se zove Overdose. Nije trenutak za pastelno žuti kardigan sa patkicama.",
    "en": "Black from head to toe. The fragrance is called Overdose. This is not the moment for a pastel-yellow cardigan covered in little ducks."
  },
  {
    "sr": "Tamni sako, košulja i nešto što izgleda skupo i kada se etiketa ne vidi. To je, usput, čitava poenta dobrog oblačenja.",
    "en": "A dark blazer, shirt and something that looks expensive even when nobody can see the label. That is, incidentally, the entire point of dressing well."
  },
  {
    "sr": "Kašmir, bela košulja ili mekani neutralni tonovi. Čisto, intimno, luksuzno. Kao hotelska posteljina koju ne želite da napustite.",
    "en": "Cashmere, a white shirt or soft neutral tones. Clean, intimate, luxurious. Like hotel bedding you have no intention of leaving."
  },
  {
    "sr": "Moderna majica, lagana jakna i dobre patike. Malo više energije, malo manje formalnosti. Kravata bi ovde izgledala kao roditeljska kontrola.",
    "en": "A modern T-shirt, light jacket and good sneakers. More energy, less formality. A tie would feel like parental controls."
  },
  {
    "sr": "Beli kupaći, velika košulja i naočare za sunce. Ako možete da pronađete Walkman, estetski ste završili zadatak.",
    "en": "White swimwear, an oversized shirt and sunglasses. If you can find a Walkman, aesthetically you have completed the task."
  },
  {
    "sr": "Crna majica, sako i nešto metalno — sat ili jednostavna narukvica. „Cosmic“ ne znači da treba da obučete srebrne pantalone. Molimo vas.",
    "en": "A black T-shirt, blazer and something metallic — a watch or simple bracelet. Cosmic does not mean silver trousers. Please."
  },
  {
    "sr": "Crnu košulju. Ostalo je verovatno privremeno.",
    "en": "A black shirt. Everything else is probably temporary."
  },
  {
    "sr": "Bela košulja, sive ili bež pantalone i minimalne patike. Ako izgledate kao arhitekta koji odbija PowerPoint, vrlo ste blizu.",
    "en": "A white shirt, grey or beige trousers and minimalist sneakers. If you look like an architect who refuses to use PowerPoint, you are very close."
  },
  {
    "sr": "Tamna majica, suede jakna i crne farmerke. Diskretno seksi. Dve reči koje garderoba mnogo češće obeća nego što ispuni.",
    "en": "A dark T-shirt, suede jacket and black jeans. Quietly sexy. Two words clothes promise far more often than they deliver."
  },
  {
    "sr": "Farmerke, bela košulja i nešto zeleno samo ako baš morate. Čaša tonika u ruci je dozvoljena. Sipanje parfema u nju nije.",
    "en": "Jeans, a white shirt and something green only if you absolutely must. A glass of tonic in your hand is allowed. Pouring the fragrance into it is not."
  },
  {
    "sr": "Crnu majicu. Naravno. Nema potrebe da se pretvaramo da ćete uz Sauvage obući laneno odelo iz Firence.",
    "en": "A black T-shirt. Obviously. There is no need to pretend you are wearing a linen suit from Florence with Sauvage."
  },
  {
    "sr": "Kvalitetan sako, majica bez logotipa i dobre pantalone. Hacivat X projektuje dovoljno luksuza; garderoba ne mora da pokazuje račun.",
    "en": "A quality blazer, a logo-free T-shirt and good trousers. Hacivat X already projects enough luxury; your clothes do not need to display the receipt."
  },
  {
    "sr": "Tamnu košulju. Rukavi zavrnuti. Kravata ostaje kod kuće. Ako ste stavili ovaj parfem, oboje znamo da poslovni sastanak nije glavni plan večeri.",
    "en": "A dark shirt. Sleeves rolled up. Tie stays home. If you chose this fragrance, we both know the business meeting is probably not the main event tonight."
  },
  {
    "sr": "Kožna jakna je previše očigledna. Obucite crnu košulju ili dobar tamni kaput i pustite da koža dolazi iz parfema. Kaubojsku kapu ostavite čoveku koji zaista ima konja.",
    "en": "A leather jacket is too obvious. Wear a black shirt or a good dark coat and let the leather come from the fragrance. Leave the cowboy hat to someone who actually owns a horse."
  }
];

export default entries;
