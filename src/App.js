import React from "react";
import "./App.css";

function App() {
  const featuredFragrances = [
    {
      name: "Creed Aventus Cologne",
      vibe: "Fresh luxury icon",
      desc: "Citrusno-drvenasti potpis za čist, skup i samouveren utisak.",
    },
    {
      name: "Givenchy Gentleman Réserve Privée",
      vibe: "Dark elegant statement",
      desc: "Topla, boozy i sofisticirana kompozicija za večernji premium vibe.",
    },
    {
      name: "Gisada Ambassador",
      vibe: "Compliment magnet",
      desc: "Modern, dopadljiv i upečatljiv miris koji lako ostavlja trag.",
    },
    {
      name: "Mancera Cedrat Boise",
      vibe: "Bold niche energy",
      desc: "Voćno-drvenasta nišna svežina sa ozbiljnim karakterom.",
    },
  ];

  const benefits = [
    {
      title: "Try Before You Buy",
      text: "Testiraj parfem na svojoj koži pre nego što se odlučiš za punu bočicu.",
    },
    {
      title: "Curated Selection",
      text: "Biramo samo parfeme koji imaju karakter, stil i wow efekat.",
    },
    {
      title: "Luxury Experience",
      text: "PlayNice nije samo prodaja dekanta — već premium osećaj od prvog kontakta.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Izaberi parfem",
      text: "Pregledaj našu pažljivo odabranu selekciju niche, designer i Arabic mirisa.",
    },
    {
      number: "02",
      title: "Odaberi 5ml ili 10ml",
      text: "Uzmi dekant veličinu koja ti odgovara za testiranje ili nošenje.",
    },
    {
      number: "03",
      title: "Pošalji porudžbinu",
      text: "Naruči jednostavno putem Instagrama ili mejla i završi kupovinu brzo.",
    },
  ];

  return (
    <div className="site-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="grain-overlay" />

      <header className="header">
        <div className="container header-inner">
          <div className="brand-block">
            <a href="/" className="brand-logo">
              PLAYNICE
            </a>
            <div className="brand-tagline">Remember. PlayNice.</div>
          </div>

          <nav className="nav">
            <a href="#featured">Collection</a>
            <a href="#experience">Experience</a>
            <a href="#how">How it works</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="section-kicker">CURATED LUXURY FRAGRANCE DECANTS</div>

              <h1 className="hero-title">
                Discover fragrances
                <span> the PlayNice way.</span>
              </h1>

              <p className="hero-text">
                Niche. Designer. Arabic.
                <br />
                Pažljivo odabrani parfemi dostupni u premium dekantima.
                <br />
                Ne kupuj na slepo — prvo testiraj, oseti i odluči.
              </p>

              <div className="hero-actions">
                <a
                  href="https://www.instagram.com/playnice.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  DM to Order
                </a>
                <a href="#featured" className="btn btn-secondary">
                  Explore Collection
                </a>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">5ml / 10ml</div>
                  <div className="stat-label">Premium decants</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">Curated</div>
                  <div className="stat-label">Selected scents only</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">Luxury</div>
                  <div className="stat-label">Boutique feel</div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-card">
                <div className="visual-topline">FEATURED CONCEPT</div>

                <div className="bottle-stage">
                  <div className="bottle-glow" />
                  <div className="bottle-shadow" />
                  <div className="bottle">
                    <div className="bottle-cap" />
                    <div className="bottle-front">PN</div>
                  </div>
                </div>

                <div className="visual-panel">
                  <h3>Try Before You Buy</h3>
                  <p>
                    Premium fragrance discovery za ljude koji žele pravi miris
                    pre pune bočice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="featured" className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-kicker">FEATURED COLLECTION</div>
              <h2 className="section-title">A selection made to leave an impression</h2>
              <p className="section-text">
                Fokus je na mirisima koji imaju identitet, prisustvo i premium osećaj.
              </p>
            </div>

            <div className="feature-grid">
              {featuredFragrances.map((item, index) => (
                <article key={index} className="feature-card">
                  <div className="feature-vibe">{item.vibe}</div>
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                  <div className="feature-meta">Available in 5ml / 10ml</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="container">
            <div className="experience-box">
              <div className="experience-copy">
                <div className="section-kicker">THE PLAYNICE EXPERIENCE</div>
                <h2 className="section-title">Built like a boutique, not just a shop</h2>
                <p className="section-text">
                  PlayNice kombinuje premium estetiku, pažljivo birane mirise i
                  jednostavan način poručivanja. Cilj nije da vidiš što više parfema —
                  već da pronađeš pravi.
                </p>
              </div>

              <div className="benefit-list">
                {benefits.map((item, index) => (
                  <div key={index} className="benefit-card">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="section">
          <div className="container">
            <div className="section-head">
              <div className="section-kicker">HOW IT WORKS</div>
              <h2 className="section-title">Simple process. Premium result.</h2>
            </div>

            <div className="steps-grid">
              {steps.map((step, index) => (
                <div key={index} className="step-card">
                  <div className="step-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section cta-section">
          <div className="container">
            <div className="cta-box">
              <div className="section-kicker">READY TO DISCOVER YOUR NEXT SIGNATURE SCENT?</div>
              <h2>Luxury starts with the right sample.</h2>
              <p>
                Pošalji poruku i naruči svoj sledeći PlayNice dekant.
              </p>

              <div className="cta-actions">
                <a
                  href="https://www.instagram.com/playnice.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  Order via Instagram
                </a>
                <a href="mailto:order@playniceshop.me" className="btn btn-secondary">
                  order@playniceshop.me
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">PLAYNICE</div>
          <div className="footer-line">Try before you buy.</div>
          <div className="footer-links">
            <a
              href="https://www.instagram.com/playnice.me/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a href="mailto:order@playniceshop.me">order@playniceshop.me</a>
          </div>
          <div className="footer-copy">Remember. PlayNice.</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
