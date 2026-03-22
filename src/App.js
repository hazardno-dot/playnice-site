import React from "react";

const products = [
  {
    name: "Afnan 9PM Night Out",
    img: "https://i.imgur.com/8QfKuz1.png",
    desc: "Noćna bomba sa slatkim, zavodljivim DNA potpisom — pravi compliment getter.",
    price: "5ml = 5€ | 10ml = 9€"
  },
  {
    name: "Lattafa Asad",
    img: "https://i.imgur.com/Wz4Yx9p.png",
    desc: "Topla, začinska snaga sa tamnim luksuznim karakterom i ozbiljnim prisustvom.",
    price: "5ml = 4€ | 10ml = 7€"
  },
  {
    name: "Armaf Club de Nuit Intense",
    img: "https://i.imgur.com/ZK0pYzL.png",
    desc: "Svež, diman i moćan signature miris koji ostavlja trag.",
    price: "5ml = 5€ | 10ml = 8€"
  }
];

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(192,148,38,0.14), transparent 28%), linear-gradient(180deg, #050505 0%, #090909 42%, #030303 100%)",
    color: "#fff",
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
  },
  container: {
    maxWidth: 1240,
    margin: "0 auto",
    paddingLeft: 20,
    paddingRight: 20
  },
  badge: {
    display: "inline-block",
    border: "1px solid rgba(212,175,55,0.28)",
    borderRadius: 999,
    padding: "8px 14px",
    color: "#d9b65b",
    fontSize: 12,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    background: "rgba(212,175,55,0.04)"
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #f4d67a 0%, #caa23a 100%)",
    color: "#050505",
    padding: "14px 26px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 700,
    letterSpacing: "0.04em",
    display: "inline-block",
    boxShadow: "0 10px 30px rgba(202,162,58,0.25)"
  },
  buttonSecondary: {
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    padding: "14px 26px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 600,
    letterSpacing: "0.04em",
    display: "inline-block",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(6px)"
  },
  sectionLabel: {
    color: "#d7b255",
    letterSpacing: "0.18em",
    fontSize: 12,
    textTransform: "uppercase"
  },
  paragraph: {
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.8
  }
};

export default function App() {
  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        img { max-width: 100%; display: block; }
        a { transition: all 0.25s ease; }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 36px;
          align-items: center;
          padding: 88px 0 68px;
        }

        .hero-title {
          font-size: clamp(40px, 7vw, 82px);
          line-height: 0.98;
          letter-spacing: 0.03em;
          margin: 22px 0 0;
        }

        .hero-text {
          margin-top: 24px;
          max-width: 640px;
          color: rgba(255,255,255,0.72);
          font-size: 18px;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 34px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 46px;
          max-width: 720px;
        }

        .feature-card {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.18);
        }

        .hero-visual {
          position: relative;
          min-height: 520px;
          border-radius: 36px;
          border: 1px solid rgba(212,175,55,0.16);
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0,0,0,0.45);
        }

        .drop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 22px;
        }

        .product-card {
          position: relative;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
          border-radius: 32px;
          padding: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
          transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
        }

        .product-card:hover {
          transform: translateY(-6px);
          border-color: rgba(212,175,55,0.22);
          box-shadow: 0 26px 60px rgba(0,0,0,0.32);
        }

        .product-image-wrap {
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .product-image {
          max-height: 180px;
          max-width: 90%;
          object-fit: contain;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 18px 34px rgba(0,0,0,0.38));
          transition: transform 0.28s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.04);
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .info-card {
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          padding: 32px;
        }

        .cta-box {
          border-radius: 36px;
          border: 1px solid rgba(212,175,55,0.16);
          background: radial-gradient(circle at center, rgba(212,175,55,0.12), transparent 48%), rgba(255,255,255,0.025);
          padding: 46px 28px;
          text-align: center;
          box-shadow: 0 25px 80px rgba(0,0,0,0.28);
        }

        .footer {
          border-top: 1px solid rgba(255,255,255,0.08);
          margin-top: 40px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 28px;
          padding: 34px 0 44px;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 18px;
        }

        .footer-links a {
          color: rgba(255,255,255,0.72);
          text-decoration: none;
        }

        .footer-links a:hover {
          color: #d9b65b;
        }

        @media (max-width: 980px) {
          .hero-grid,
          .info-grid,
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .hero-visual {
            min-height: 420px;
          }

          .feature-grid {
            grid-template-columns: 1fr;
            max-width: none;
          }
        }

        @media (max-width: 640px) {
          .hero-grid {
            padding: 64px 0 48px;
            gap: 24px;
          }

          .hero-text {
            font-size: 16px;
          }

          .hero-actions a {
            width: 100%;
            text-align: center;
          }

          .hero-visual {
            min-height: 340px;
            border-radius: 26px;
          }

          .product-card,
          .info-card,
          .cta-box {
            border-radius: 24px;
          }
        }
      `}</style>

      <div style={styles.container}>
        <section className="hero-grid">
          <div>
            <div style={styles.badge}>Remember. PlayNice.</div>

            <h1 className="hero-title">
              Otkrij parfeme
              <br />
              na pravi način.
            </h1>

            <p className="hero-text">
              Premium dekanti za one koji ne kupuju naslepo. Testiraj na svojoj koži,
              u realnim uslovima, pa tek onda odluči da li je to tvoj sledeći full bottle.
            </p>

            <div className="hero-actions">
              <a href="https://instagram.com/playnice.me" style={styles.buttonPrimary}>
                DM TO ORDER
              </a>
              <a href="mailto:order@playniceshop.me" style={styles.buttonSecondary}>
                order@playniceshop.me
              </a>
            </div>

            <div className="feature-grid">
              {[
                ["Curated", "Niche • Designer • Arabic"],
                ["Try before you buy", "Bez slepe kupovine"],
                ["Delivery", "Crna Gora"]
              ].map(([title, text]) => (
                <div key={title} className="feature-card">
                  <div style={{ color: "#e0bd64", fontWeight: 700, fontSize: 14 }}>{title}</div>
                  <div style={{ color: "rgba(255,255,255,0.66)", marginTop: 8, fontSize: 14 }}>
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div
              style={{
                position: "absolute",
                inset: "auto -10% 8% -10%",
                height: 160,
                background: "radial-gradient(circle, rgba(214,170,62,0.25), transparent 60%)",
                filter: "blur(18px)"
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 22,
                left: 22,
                border: "1px solid rgba(212,175,55,0.28)",
                color: "#d9b65b",
                borderRadius: 999,
                padding: "8px 12px",
                fontSize: 11,
                letterSpacing: "0.2em"
              }}
            >
              DROP LIVE
            </div>

            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 10,
                padding: "70px 18px 34px"
              }}
            >
              <img
                src="https://i.imgur.com/Wz4Yx9p.png"
                alt="Lattafa Asad"
                style={{
                  width: "30%",
                  maxWidth: 140,
                  objectFit: "contain",
                  transform: "translateY(18px)",
                  filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.45))"
                }}
              />
              <img
                src="https://i.imgur.com/8QfKuz1.png"
                alt="Afnan 9PM Night Out"
                style={{
                  width: "36%",
                  maxWidth: 180,
                  objectFit: "contain",
                  zIndex: 2,
                  filter: "drop-shadow(0 24px 44px rgba(212,175,55,0.22))"
                }}
              />
              <img
                src="https://i.imgur.com/ZK0pYzL.png"
                alt="Armaf Club de Nuit Intense"
                style={{
                  width: "30%",
                  maxWidth: 140,
                  objectFit: "contain",
                  transform: "translateY(18px)",
                  filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.45))"
                }}
              />
            </div>
          </div>
        </section>

        <section style={{ padding: "10px 0 72px" }}>
          <div style={{ textAlign: "center", marginBottom: 34 }}>
            <div style={styles.sectionLabel}>Limited Stock</div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: "14px 0 0" }}>
              Aktuelni drop
            </h2>
            <p style={{ ...styles.paragraph, maxWidth: 700, margin: "16px auto 0" }}>
              Pažljivo birani mirisi koji zaslužuju testiranje pre kupovine. Kada drop nestane,
              čekaš sledeći.
            </p>
          </div>

          <div className="drop-grid">
            {products.map((item) => (
              <div key={item.name} className="product-card">
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    left: 18,
                    border: "1px solid rgba(212,175,55,0.35)",
                    color: "#d9b65b",
                    borderRadius: 999,
                    padding: "6px 10px",
                    fontSize: 10,
                    letterSpacing: "0.18em"
                  }}
                >
                  LIMITED
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 116,
                    transform: "translateX(-50%)",
                    width: 190,
                    height: 190,
                    background: "radial-gradient(circle, rgba(212,175,55,0.18), transparent 62%)",
                    filter: "blur(18px)"
                  }}
                />

                <div className="product-image-wrap">
                  <img src={item.img} alt={item.name} className="product-image" />
                </div>

                <h3 style={{ color: "#e1be67", fontSize: 24, margin: "4px 0 0" }}>{item.name}</h3>
                <p style={{ color: "rgba(255,255,255,0.66)", lineHeight: 1.8, minHeight: 82 }}>
                  {item.desc}
                </p>
                <div style={{ color: "#fff", fontWeight: 700, letterSpacing: "0.02em", marginTop: 8 }}>
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingBottom: 72 }}>
          <div className="info-grid">
            <div className="info-card">
              <div style={styles.sectionLabel}>Zašto dekanti</div>
              <h2 style={{ fontSize: 36, marginTop: 14 }}>Pametniji način kupovine parfema</h2>
              <div style={{ marginTop: 22, color: "rgba(255,255,255,0.72)", lineHeight: 1.9 }}>
                <div>✔ Testiraš parfem na svojoj koži, ne na papiriću</div>
                <div>✔ Ne trošiš veliki novac na pogrešan full bottle</div>
                <div>✔ Možeš isprobati više različitih mirisa</div>
                <div>✔ Lakše pronalaziš signature scent bez rizika</div>
              </div>
            </div>

            <div
              className="info-card"
              style={{
                border: "1px solid rgba(212,175,55,0.16)",
                background: "linear-gradient(180deg, rgba(212,175,55,0.08), rgba(255,255,255,0.02))"
              }}
            >
              <div style={styles.sectionLabel}>Kako funkcioniše</div>
              <h2 style={{ fontSize: 36, marginTop: 14 }}>Try before you buy</h2>
              <div style={{ marginTop: 22, color: "rgba(255,255,255,0.78)", lineHeight: 1.9 }}>
                <div>1. Izabereš parfem ili sačekaš sledeći drop</div>
                <div>2. Javiš se preko DM-a ili emaila</div>
                <div>3. Dobijaš 5ml ili 10ml dekant za pravo testiranje</div>
                <div>4. Tek onda odlučuješ da li želiš full bottle</div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ paddingBottom: 36 }}>
          <div className="cta-box">
            <div style={styles.sectionLabel}>Kontakt</div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: "14px 0 0" }}>
              Spreman za sledeći kompliment?
            </h2>
            <p style={{ ...styles.paragraph, maxWidth: 700, margin: "16px auto 0" }}>
              Pošalji poruku, traži preporuku ili rezerviši svoj dekant iz aktuelnog dropa.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 30
              }}
            >
              <a href="https://instagram.com/playnice.me" style={styles.buttonPrimary}>
                DM TO ORDER
              </a>
              <a href="mailto:order@playniceshop.me" style={styles.buttonSecondary}>
                order@playniceshop.me
              </a>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-grid">
            <div>
              <div style={{ color: "#e1be67", fontSize: 28, fontWeight: 700, letterSpacing: "0.08em" }}>
                PLAYNICE
              </div>
              <p style={{ ...styles.paragraph, maxWidth: 460, marginTop: 12 }}>
                Curated fragrance decants za ljude koji žele da testiraju parfem pre kupovine.
                Niche. Designer. Arabic.
              </p>
            </div>

            <div>
              <div style={styles.sectionLabel}>Info</div>
              <div className="footer-links" style={{ marginTop: 14 }}>
                <a href="https://instagram.com/playnice.me">Instagram</a>
                <a href="mailto:order@playniceshop.me">order@playniceshop.me</a>
                <a href="https://www.playniceshop.me/">playniceshop.me</a>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 18, fontSize: 14 }}>
                Delivery across Montenegro · Try before you buy
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
