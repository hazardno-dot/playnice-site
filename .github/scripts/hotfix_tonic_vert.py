from pathlib import Path


def read_raw(path):
    with open(path, 'r', encoding='utf-8', newline='') as f:
        return f.read()


def write_raw(path, text):
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(text)

index_path = Path('playnice-site/src/data/products/index.js')
text = read_raw(index_path)
old = '''    slug: "thomas-kosmala-no-8-tonic-vert",
    name: "Thomas Kosmala No. 8 Tonic Vert Eau de Parfum",
    shortName: "No. 8 Tonic Vert",
    category: "Niche",
    image: "/products/thomas-kosmala-no-8-tonic-vert.webp",
    sizes: {"2ml":6.5,"5ml":15,"10ml":27},
    badge: "",
    rating: 8.2,
    ratingLabel: "Fresh Pick",
    season: "summer",
    moods: ["clean","summer","signature"],
    recommendations: ["thomas-kosmala-no-1-tonic-blanc","essential-parfums-nice-bergamote","essential-parfums-orange-x-santal"],
    noteMap: {'''
new = '''    slug: "thomas-kosmala-no-8-tonic-vert",
    name: "Thomas Kosmala No. 8 Tonic Vert Eau de Parfum",
    modalName: "Thomas Kosmala No. 8 Tonic Vert EDP",
    shortName: "No. 8 Tonic Vert",
    category: "Niche",
    image: "/products/thomas-kosmala-no-8-tonic-vert.webp",
    sizes: { "2ml": 6.5, "5ml": 15, "10ml": 27 },
    badge: "PLAYNICE PICK",
    rating: 8.2,
    ratingLabel: "Fresh Pick",
    season: "summer",
    moods: ["clean", "summer", "signature"],
    recommendations: [
      "thomas-kosmala-no-1-tonic-blanc",
      "essential-parfums-nice-bergamote",
      "essential-parfums-orange-x-santal"
    ],
    inspiredBy: {
      name: "Original Thomas Kosmala creation",
      short: "Green Citrus Aromatic DNA"
    },
    noteMap: {'''
if old not in text:
    raise SystemExit('Tonic Vert index block not found')
write_raw(index_path, text.replace(old, new, 1))

copy_path = Path('playnice-site/src/data/products/productCopy.js')
text = read_raw(copy_path)
start_marker = '  "Thomas Kosmala No. 8 Tonic Vert Eau de Parfum": {'
start = text.find(start_marker)
if start < 0:
    raise SystemExit('Tonic Vert copy block start not found')
end = text.find('\n  }\n};', start)
if end < 0:
    raise SystemExit('Tonic Vert copy block end not found')
replacement = '''  "Thomas Kosmala No. 8 Tonic Vert Eau de Parfum": {
    miniTag: {
      sr: "🌿 Zeleni / Citrusni",
      en: "🌿 Green / Citrus"
    },
    card: {
      sr: "Citrusi, hladna menta i vetiver u čistom zelenom aromatičnom mirisu.",
      en: "Citrus, cool mint and vetiver in a clean green aromatic fragrance."
    },
    modal: {
      sr: "Bergamot, limun, mandarina i limeta prelaze u hladnu mentu, geranijum i pomelo, dok vetiver, mošus i hrastova mahovina ostavljaju suv, čist i zelen trag.",
      en: "Bergamot, lemon, mandarin and lime lead into cool mint, geranium and pomelo, while vetiver, musk and oakmoss leave a dry, clean and green trail."
    },
    scentType: {
      sr: "Citrusno-zeleni aromatični",
      en: "Citrus green aromatic"
    },
    dominantNotes: {
      sr: ["bergamot", "menta", "vetiver", "hrastova mahovina"],
      en: ["bergamot", "mint", "vetiver", "oakmoss"]
    },
    tags: {
      sr: ["Svež", "Čist", "Zelen"],
      en: ["Fresh", "Clean", "Green"]
    },
    whyChoose: {
      sr: "Ako želiš hladan, suv i čist zeleni parfem za tople dane.",
      en: "If you want a cool, dry and clean green fragrance for warm days."
    }
  }'''
write_raw(copy_path, text[:start] + replacement + text[end + len('\n  }'):])

wear_path = Path('playnice-site/src/data/products/productWearContext.js')
text = read_raw(wear_path)
old = '''  "Thomas Kosmala No. 8 Tonic Vert Eau de Parfum": {
    "sr": "Najbolji je tokom toplijih dana, za kancelariju, dnevne obaveze i situacije kada želiš čist, svež i nenametljiv miris sa malo više karaktera.",
    "en": "Best suited to warmer days, the office, everyday wear and situations where you want a clean, fresh and understated scent with a little more character."
  }'''
new = '''  "Thomas Kosmala No. 8 Tonic Vert Eau de Parfum": {
    sr: "Topli dani, posao, svakodnevno nošenje.",
    en: "Warm days, work, everyday wear."
  }'''
if old not in text:
    raise SystemExit('Tonic Vert wear block not found')
write_raw(wear_path, text.replace(old, new, 1))
