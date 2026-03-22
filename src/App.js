import React from "react";

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
    <div style={styles.page}>
      <div style={styles.noiseOverlay} />

      <header style={styles.header}>
        <div style={styles.brandWrap}>
          <div style={styles.logo}>PLAYNICE</div>
          <div style={styles.tagline}>Remember. PlayNice.</div>
        </div>

        <nav style={styles.nav}>
          <a href="#featured" style={styles.navLink}>Collection</a>
          <a href="#experience" style={styles.navLink}>Experience</a>
          <a href="#how" style={styles.navLink}>How it works</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
        </nav>
      </header>

      <main>
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.eyebrow}>CURATED LUXURY FRAGRANCE DECANTS</div>

            <h1 style={styles.heroTitle}>
              Discover fragrances
              <br />
              <span style={styles.goldText}>the PlayNice way.</span>
            </h1>

            <p style={styles.heroText}>
              Niche. Designer. Arabic.
              <br />
              Pažljivo odabrani parfemi dostupni u premium dekantima.
              <br />
              Ne kupuj na slepo — prvo testiraj, oseti i odluči.
            </p>

            <div style={styles.heroButtons}>
              <a href="https://www.instagram.com/playnice.me/" target="_blank" rel="noreferrer" style={styles.primaryButton}>
                DM to Order
              </a>
              <a href="#featured" style={styles.secondaryButton}>
                Explore Collection
              </a>
            </div>

            <div style={styles.heroStats}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>5ml / 10ml</div>
                <div style={styles.statLabel}>Premium decants</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>Curated</div>
                <div style={styles.statLabel}>Only selected scents</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>Luxury</div>
                <div style={styles.statLabel}>Brand experience</div>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.heroCard}>
              <div style={styles.heroCardTop}>FEATURED CONCEPT</div>
              <div style={styles.heroBottleArea}>
                <div style={styles.bottleGlow} />
                <div style={styles.bottleMain}>
                  <div style={styles.bottleCap} />
                  <div style={styles.bottleBody}>PN</div>
                </div>
              </div>
              <div style={styles.heroCardBottom}>
                <div style={styles.heroCardTitle}>Try Before You Buy</div>
                <div style={styles.heroCardText}>
                  Premium fragrance discovery, designed for people who want the right scent before the full bottle.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="featured" style={styles.section}>
          <div style={styles.sectionIntro}>
            <div style={styles.sectionEyebrow}>FEATURED COLLECTION</div>
            <h2 style={styles.sectionTitle}>A selection made to leave an impression</h2>
            <p style={styles.sectionText}>
              Fokus je na mirisima koji imaju identitet, prisustvo i premium osećaj.
            </p>
          </div>

          <div style={styles.grid4}>
            {featuredFragrances.map((item, index) => (
              <div key={index} style={styles.fragranceCard}>
                <div style={styles.fragranceTopLine}>{item.vibe}</div>
                <h3 style={styles.fragranceName}>{item.name}</h3>
                <p style={styles.fragranceDesc}>{item.desc}</p>
                <div style={styles.fragranceFooter}>Available in 5ml / 10ml</div>
              </div>
            ))}
          </div>
        </section>

        <section id="experience" style={styles.section}>
          <div style={styles.experienceBox}>
            <div style={styles.experienceLeft}>
              <div style={styles.sectionEyebrow}>THE PLAYNICE EXPERIENCE</div>
              <h2 style={styles.sectionTitle}>Built like a boutique, not just a shop</h2>
              <p style={styles.sectionText}>
                PlayNice kombinuje premium estetiku, pažljivo birane mirise i jednostavan način poručivanja.
                Cilj nije da vidiš što više parfema — već da pronađeš pravi.
              </p>
            </div>

            <div style={styles.benefitsWrap}>
              {benefits.map((item, index) => (
                <div key={index} style={styles.benefitCard}>
                  <h3 style={styles.benefitTitle}>{item.title}</h3>
                  <p style={styles.benefitText}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" style={styles.section}>
          <div style={styles.sectionIntro}>
            <div style={styles.sectionEyebrow}>HOW IT WORKS</div>
            <h2 style={styles.sectionTitle}>Simple process. Premium result.</h2>
          </div>

          <div style={styles.stepsGrid}>
            {steps.map((step, index) => (
              <div key={index} style={styles.stepCard}>
                <div style={styles.stepNumber}>{step.number}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.ctaSection}>
          <div style={styles.ctaBox}>
            <div style={styles.sectionEyebrow}>READY TO DISCOVER YOUR NEXT SIGNATURE SCENT?</div>
            <h2 style={styles.ctaTitle}>Luxury starts with the right sample.</h2>
            <p style={styles.ctaText}>
              Pošalji poruku i naruči svoj sledeći PlayNice dekant.
            </p>

            <div style={styles.ctaButtons}>
              <a href="https://www.instagram.com/playnice.me/" target="_blank" rel="noreferrer" style={styles.primaryButton}>
                Order via Instagram
              </a>
              <a href="mailto:order@playniceshop.me" style={styles.secondaryButton}>
                order@playniceshop.me
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" style={styles.footer}>
        <div style={styles.footerBrand}>PLAYNICE</div>
        <div style={styles.footerText}>Try before you buy.</div>
        <div style={styles.footerLinks}>
          <a href="https://www.instagram.com/playnice.me/" target="_blank" rel="noreferrer" style={styles.footerLink}>
            Instagram
          </a>
          <a href="mailto:order@playniceshop.me" style={styles.footerLink}>
            order@playniceshop.me
          </a>
        </div>
        <div style={styles.footerCopy}>Remember. PlayNice.</div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(168,130,58,0.18) 0%, rgba(10,10,10,1) 28%, rgba(5,5,5,1) 100%)",
    color: "#f5efe3",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  noiseOverlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(rgba(255,255,255,0.015), rgba(255,255,255,0.015))",
    opacity: 0.8,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 6%",
    backdropFilter: "blur(10px)",
    background: "rgba(8,8,8,0.55)",
    borderBottom: "1px solid rgba(212,175,55,0.16)",
  },
  brandWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  logo: {
    fontSize: "1.2rem",
    letterSpacing: "0.35rem",
    fontWeight: 700,
    color: "#f3d38a",
  },
  tagline: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: "0.08rem",
  },
  nav: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  navLink: {
    color: "rgba(255,255,255,0.82)",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "36px",
    alignItems: "center",
    padding: "72px 6% 56px",
  },
  heroLeft: {
    maxWidth: "760px",
  },
  eyebrow: {
    display: "inline-block",
    color: "#d8b46a",
    fontSize: "0.8rem",
    letterSpacing: "0.18rem",
    marginBottom: "18px",
  },
  heroTitle: {
    fontSize: "clamp(2.7rem, 6vw, 5.6rem)",
    lineHeight: 1.02,
    margin: 0,
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },
  goldText: {
    color: "#f0c978",
    textShadow: "0 0 20px rgba(212,175,55,0.12)",
  },
  heroText: {
    marginTop: "22px",
    fontSize: "1.08rem",
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.78)",
    maxWidth: "700px",
  },
  heroButtons: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "28px",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 22px",
    borderRadius: "999px",
    textDecoration: "none",
    color: "#111",
    background: "linear-gradient(135deg, #f0d18d, #b88a33)",
    fontWeight: 700,
    boxShadow: "0 12px 30px rgba(184,138,51,0.22)",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 22px",
    borderRadius: "999px",
    textDecoration: "none",
    color: "#f5efe3",
    background: "transparent",
    border: "1px solid rgba(240,209,141,0.35)",
    fontWeight: 600,
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "34px",
  },
  statCard: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(212,175,55,0.14)",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },
  statNumber: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#f0c978",
    marginBottom: "6px",
  },
  statLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.92rem",
  },
  heroRight: {
    display: "flex",
    justifyContent: "center",
  },
  heroCard: {
    width: "100%",
    maxWidth: "460px",
    minHeight: "560px",
    borderRadius: "32px",
    padding: "22px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    border: "1px solid rgba(212,175,55,0.16)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.38)",
    position: "relative",
    overflow: "hidden",
  },
  heroCardTop: {
    color: "rgba(255,255,255,0.65)",
    letterSpacing: "0.18rem",
    fontSize: "0.78rem",
  },
  heroBottleArea: {
    position: "relative",
    height: "360px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bottleGlow: {
    position: "absolute",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(212,175,55,0.3), transparent 68%)",
    filter: "blur(10px)",
  },
  bottleMain: {
    position: "relative",
    width: "170px",
    height: "220px",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(34,34,34,0.95), rgba(10,10,10,0.98))",
    border: "1px solid rgba(240,209,141,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f0c978",
    fontWeight: 700,
    fontSize: "2rem",
    letterSpacing: "0.18rem",
    boxShadow: "0 25px 40px rgba(0,0,0,0.45)",
  },
  bottleCap: {
    position: "absolute",
    top: "-26px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "78px",
    height: "36px",
    borderRadius: "12px 12px 6px 6px",
    background: "linear-gradient(180deg, #2c2c2c, #111)",
    border: "1px solid rgba(240,209,141,0.22)",
  },
  bottleBody: {
    transform: "translateY(10px)",
  },
  heroCardBottom: {
    position: "absolute",
    left: "22px",
    right: "22px",
    bottom: "22px",
    padding: "20px",
    borderRadius: "22px",
    background: "rgba(0,0,0,0.34)",
    border: "1px solid rgba(212,175,55,0.14)",
  },
  heroCardTitle: {
    color: "#f0c978",
    fontSize: "1.2rem",
    fontWeight: 700,
    marginBottom: "8px",
  },
  heroCardText: {
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.7,
    fontSize: "0.98rem",
  },
  section: {
    padding: "28px 6% 56px",
  },
  sectionIntro: {
    maxWidth: "760px",
    marginBottom: "26px",
  },
  sectionEyebrow: {
    color: "#d8b46a",
    fontSize: "0.8rem",
    letterSpacing: "0.18rem",
    marginBottom: "10px",
  },
  sectionTitle: {
    fontSize: "clamp(2rem, 4vw, 3.4rem)",
    lineHeight: 1.1,
    margin: "0 0 10px 0",
  },
  sectionText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: "1.02rem",
    lineHeight: 1.8,
    margin: 0,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  fragranceCard: {
    padding: "24px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(212,175,55,0.14)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
  },
  fragranceTopLine: {
    color: "#d8b46a",
    fontSize: "0.78rem",
    letterSpacing: "0.12rem",
    marginBottom: "14px",
    textTransform: "uppercase",
  },
  fragranceName: {
    margin: "0 0 12px 0",
    fontSize: "1.25rem",
    lineHeight: 1.3,
  },
  fragranceDesc: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.75,
    fontSize: "0.97rem",
  },
  fragranceFooter: {
    marginTop: "18px",
    color: "#f0c978",
    fontSize: "0.92rem",
    fontWeight: 600,
  },
  experienceBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "22px",
    padding: "26px",
    borderRadius: "30px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    border: "1px solid rgba(212,175,55,0.14)",
  },
  experienceLeft: {
    paddingRight: "10px",
  },
  benefitsWrap: {
    display: "grid",
    gap: "16px",
  },
  benefitCard: {
    borderRadius: "22px",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(212,175,55,0.12)",
    padding: "20px",
  },
  benefitTitle: {
    margin: "0 0 8px 0",
    color: "#f0c978",
    fontSize: "1.08rem",
  },
  benefitText: {
    margin: 0,
    color: "rgba(255,255,255,0.74)",
    lineHeight: 1.75,
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  stepCard: {
    borderRadius: "24px",
    padding: "24px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(212,175,55,0.14)",
  },
  stepNumber: {
    color: "#f0c978",
    fontWeight: 700,
    fontSize: "1.8rem",
    marginBottom: "12px",
  },
  stepTitle: {
    margin: "0 0 10px 0",
    fontSize: "1.18rem",
  },
  stepText: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.75,
  },
  ctaSection: {
    padding: "8px 6% 72px",
  },
  ctaBox: {
    textAlign: "center",
    borderRadius: "34px",
    padding: "46px 24px",
    background:
      "radial-gradient(circle at top, rgba(212,175,55,0.16), rgba(255,255,255,0.03) 35%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(212,175,55,0.16)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.24)",
  },
  ctaTitle: {
    fontSize: "clamp(2rem, 4vw, 3.6rem)",
    margin: "10px 0 12px 0",
    lineHeight: 1.1,
  },
  ctaText: {
    maxWidth: "720px",
    margin: "0 auto",
    color: "rgba(255,255,255,0.74)",
    lineHeight: 1.8,
    fontSize: "1rem",
  },
  ctaButtons: {
    display: "flex",
    gap: "14px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "26px",
  },
  footer: {
    padding: "26px 6% 44px",
    borderTop: "1px solid rgba(212,175,55,0.12)",
    textAlign: "center",
  },
  footerBrand: {
    color: "#f0c978",
    fontWeight: 700,
    letterSpacing: "0.28rem",
    marginBottom: "8px",
  },
  footerText: {
    color: "rgba(255,255,255,0.72)",
    marginBottom: "12px",
  },
  footerLinks: {
    display: "flex",
    gap: "18px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  footerLink: {
    color: "#f3d38a",
    textDecoration: "none",
  },
  footerCopy: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.92rem",
  },
};

export default App;
