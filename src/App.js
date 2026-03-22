import React from "react";
import "./App.css";

import creedAventusCologne from "./assets/fragrances/creed-aventus-cologne.png";
import givenchyReservePrivee from "./assets/fragrances/givenchy-reserve-privee.png";
import manceraIntenseCedratBoise from "./assets/fragrances/mancera-intense-cedrat-boise.png";
import gisadaAmbassadorMen from "./assets/fragrances/gisada-ambassador-men.png";
import armafCdnim from "./assets/fragrances/armaf-cdnim.png";
import afnan9pm from "./assets/fragrances/afnan-9pm.png";

const featuredFragrances = [
  {
    name: "Creed Aventus Cologne",
    image: creedAventusCologne,
    description:
      "Fresh luxury with refined citrus brightness, woods and effortless status energy.",
    note1: "Fresh Citrus",
    note2: "Modern Luxury",
    stock: "Limited stock",
    size: "5ml / 10ml",
    price5: "€15",
    price10: "€28",
  },
  {
    name: "Givenchy Gentleman Réserve Privée",
    image: givenchyReservePrivee,
    description:
      "Dark amber elegance with boozy depth and a polished gentleman signature.",
    note1: "Whisky Amber",
    note2: "Evening Wear",
    stock: "Limited stock",
    size: "5ml / 10ml",
    price5: "€9",
    price10: "€16",
  },
  {
    name: "Mancera Intense Cedrat Boisé",
    image: manceraIntenseCedratBoise,
    description:
      "Bright citrus opening, smoky woods and niche-level presence with mass appeal.",
    note1: "Citrus Woods",
    note2: "Niche Favorite",
    stock: "Limited stock",
    size: "5ml / 10ml",
    price5: "€8",
    price10: "€14",
  },
  {
    name: "Gisada Ambassador Men",
    image: gisadaAmbassadorMen,
    description:
      "Smooth, clean and confident with an upscale masculine profile that gets attention.",
    note1: "Clean Sexy",
    note2: "Compliment Magnet",
    stock: "Limited stock",
    size: "5ml / 10ml",
    price5: "€8",
    price10: "€14",
  },
  {
    name: "Armaf Club de Nuit Intense Man",
    image: armafCdnim,
    description:
      "Bold fruity-smoky signature with huge projection and legendary value for money.",
    note1: "Smoky Fruity",
    note2: "Strong Projection",
    stock: "Limited stock",
    size: "5ml / 10ml",
    price5: "€4",
    price10: "€7",
  },
  {
    name: "Afnan 9PM",
    image: afnan9pm,
    description:
      "Sweet nightlife energy with playful seduction and strong party-season appeal.",
    note1: "Sweet Night Out",
    note2: "Clubbing Vibe",
    stock: "Limited stock",
    size: "5ml / 10ml",
    price5: "€4",
    price10: "€7",
  },
];

const reasons = [
  {
    title: "Try before you buy",
    text: "Test the fragrance on your skin in real conditions before committing to a full bottle.",
  },
  {
    title: "Curated selection",
    text: "Only carefully chosen niche, designer and Arabic fragrances make it into PlayNice.",
  },
  {
    title: "Luxury feel",
    text: "From visuals to communication, every detail is designed to feel premium and memorable.",
  },
  {
    title: "Limited stock drops",
    text: "Selective releases create more desire, stronger attention and a better brand experience.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your scent",
    text: "Pick from a curated lineup of fragrances worth testing properly.",
  },
  {
    number: "02",
    title: "Order a decant",
    text: "Get a 5ml or 10ml size and experience the fragrance outside the store.",
  },
  {
    number: "03",
    title: "Wear it for real",
    text: "See how it performs on your skin, in your day and in your own moments.",
  },
  {
    number: "04",
    title: "Decide with confidence",
    text: "No blind buying. No regret. Only smarter fragrance decisions.",
  },
];

const faqs = [
  {
    q: "What is PlayNice?",
    a: "PlayNice is a curated fragrance concept focused on premium 5ml and 10ml decants so you can discover fragrances the right way.",
  },
  {
    q: "Why buy a decant first?",
    a: "Because one quick spray in a store is not enough. A proper wear test tells you how a fragrance actually performs on your skin.",
  },
  {
    q: "How do I order?",
    a: "Send a DM on Instagram or email us directly. We will confirm availability and guide you through the order.",
  },
];

function App() {
  return (
    <div className="App">
      <header className="topbar">
        <div className="container topbar-inner">
          <a href="#top" className="brand">
            <span className="brand-mark">P</span>
            <span>PlayNice</span>
          </a>

          <nav className="nav">
            <a href="#featured">Featured</a>
            <a href="#how">How it works</a>
            <a href="#why">Why PlayNice</a>
            <a href="#faq">FAQ</a>
          </nav>

          <a
            className="btn btn-gold"
            href="https://www.instagram.com/playnice.me"
            target="_blank"
            rel="noreferrer"
          >
            DM to order
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow">Luxury fragrance decants</div>

              <h1>
                Discover fragrances
                <br />
                <span className="gold">the right way.</span>
              </h1>

              <p>
                Niche. Designer. Arabic. Carefully selected fragrances in 5ml
                and 10ml decants for people who want to test properly before
                buying a full bottle.
              </p>

              <div className="hero-actions">
                <a
                  className="btn btn-gold"
                  href="https://www.instagram.com/playnice.me"
                  target="_blank"
                  rel="noreferrer"
                >
                  DM to order
                </a>

                <a className="btn btn-dark" href="#featured">
                  Explore selection
                </a>
              </div>

              <div className="hero-metrics">
                <div className="metric">
                  <strong>5ml / 10ml</strong>
                  <span>
                    Smart testing sizes before full-bottle commitment.
                  </span>
                </div>

                <div className="metric">
                  <strong>Curated</strong>
                  <span>
                    No random clutter. Only fragrances worth attention.
                  </span>
                </div>

                <div className="metric">
                  <strong>Limited</strong>
                  <span>Small-batch drops designed to feel selective.</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card">
                <strong>Remember. PlayNice.</strong>
                <span>
                  Premium decants for people who prefer confidence over blind
                  buying.
                </span>
              </div>

              <div className="hero-smoke" />

              <div className="hero-bottles">
                <div className="hero-bottle left">
                  <div className="hero-bottle-label">
                    PlayNice
                    <br />
                    Selected
                  </div>
                </div>

                <div className="hero-bottle center">
                  <div className="hero-bottle-label">
                    PlayNice
                    <br />
                    Discovery
                  </div>
                </div>

                <div className="hero-bottle right">
                  <div className="hero-bottle-label">
                    PlayNice
                    <br />
                    Luxury
                  </div>
                </div>

                <div className="hero-reflection" />
              </div>
            </div>
          </div>
        </section>

        <section id="featured">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Featured fragrances</h2>
              </div>

              <p>
                A premium selection built to create desire fast: strong visuals,
                clear pricing, and instant DM intent.
              </p>
            </div>

            <div className="products-grid">
              {featuredFragrances.map((item) => (
                <article key={item.name} className="product-card">
                  <div className="product-top">
                    <span className="stock-badge">{item.stock}</span>
                    <span className="product-volume">{item.size}</span>
                  </div>

                  <div className="product-image-wrap">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="product-image"
                      loading="lazy"
                    />
                    <div className="product-reflection" />
                  </div>

                  <div className="product-body">
                    <h3 className="product-name">{item.name}</h3>

                    <p className="product-description">{item.description}</p>

                    <div className="product-meta">
                      <span className="meta-pill">{item.note1}</span>
                      <span className="meta-pill">{item.note2}</span>
                    </div>

                    <div className="price-row">
                      <span className="price-pill">5ml {item.price5}</span>
                      <span className="price-pill">10ml {item.price10}</span>
                    </div>

                    <div className="card-cta">
                      <a
                        className="btn btn-gold"
                        href="https://www.instagram.com/playnice.me"
                        target="_blank"
                        rel="noreferrer"
                      >
                        DM to order
                      </a>

                      <a
                        className="btn btn-dark"
                        href="mailto:order@playniceshop.me"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>How it works</h2>
              </div>

              <p>
                The PlayNice model is simple: experience the fragrance first,
                then decide without regret.
              </p>
            </div>

            <div className="steps">
              {steps.map((step) => (
                <article key={step.number} className="card">
                  <div className="step-number">{step.number}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-text">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why">
          <div className="container split">
            <div>
              <div className="section-head" style={{ marginBottom: 18 }}>
                <div>
                  <h2>Why PlayNice</h2>
                </div>
              </div>

              <div className="reason-grid">
                {reasons.map((reason) => (
                  <article key={reason.title} className="card">
                    <h3 className="reason-title">{reason.title}</h3>
                    <p className="reason-text">{reason.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="tag">The concept</div>

              <h3
                className="product-name"
                style={{ fontSize: "34px", marginBottom: 14 }}
              >
                No blind buying.
                <br />
                Only smart fragrance moves.
              </h3>

              <p
                className="product-description"
                style={{ minHeight: "auto", marginBottom: 16 }}
              >
                Most people decide too fast. One spray on paper, one quick
                impression, one expensive mistake. PlayNice slows that down and
                makes fragrance discovery feel premium, deliberate and worth it.
              </p>

              <p
                className="product-description"
                style={{ minHeight: "auto", marginBottom: 0 }}
              >
                This is not mass-market perfume shopping. This is curated
                access, better testing and a more refined path to finding what
                actually deserves your money.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <div className="cta">
              <div className="tag">Ready to order?</div>

              <h2>
                Limited stock.
                <br />
                High attention.
              </h2>

              <p>
                Explore the current selection, pick your decants, and order by
                DM or email. Built for fragrance lovers who want premium taste
                without unnecessary risk.
              </p>

              <div className="cta-actions">
                <a
                  className="btn btn-gold"
                  href="https://www.instagram.com/playnice.me"
                  target="_blank"
                  rel="noreferrer"
                >
                  Order via Instagram
                </a>

                <a className="btn btn-dark" href="mailto:order@playniceshop.me">
                  order@playniceshop.me
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Frequently asked</h2>
              </div>

              <p>
                Keep the buying process clear, fast and confidence-building.
              </p>
            </div>

            <div className="faq-grid">
              {faqs.map((item) => (
                <article key={item.q} className="faq-item">
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong style={{ color: "#f5f1e8" }}>Remember. PlayNice.</strong>
            <div style={{ marginTop: 8 }}>
              Premium fragrance decants for smarter buying.
            </div>
          </div>

          <div className="footer-links">
            <a
              href="https://www.instagram.com/playnice.me"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a href="mailto:order@playniceshop.me">Email</a>
            <a href="#featured">Featured</a>
            <a href="#how">How it works</a>
          </div>
        </div>
      </footer>

      <div className="sticky-mobile-cta">
        <a
          className="btn btn-gold"
          href="https://www.instagram.com/playnice.me"
          target="_blank"
          rel="noreferrer"
        >
          DM to order
        </a>
      </div>
    </div>
  );
}

export default App;
