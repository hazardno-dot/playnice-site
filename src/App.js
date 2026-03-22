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

const buttonPrimary = {
  background: "linear-gradient(135deg, #f4d67a 0%, #caa23a 100%)",
  color: "#050505",
  padding: "14px 26px",
  borderRadius: "999px",
  textDecoration: "none",
  fontWeight: 700,
  letterSpacing: "0.04em",
  display: "inline-block",
  boxShadow: "0 10px 30px rgba(202,162,58,0.25)"
};

const buttonSecondary = {
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  padding: "14px 26px",
  borderRadius: "999px",
  textDecoration: "none",
  fontWeight: 600,
  letterSpacing: "0.04em",
  display: "inline-block",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(6px)"
};

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(192,148,38,0.14), transparent 28%), linear-gradient(180deg, #050505 0%, #090909 42%, #030303 100%)",
        color: "#fff",
        fontFamily: "Inter, Helvetica, Arial, sans-serif"
      }}
    >
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "92px 24px 72px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 36,
          alignItems: "center"
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              border: "1px solid rgba(212,175,55,0.28)",
              borderRadius: 999,
              padding: "8px 14px",
              color: "#d9b65b",
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              background: "rgba(212,175,55,0.04)"
            }}
          >
            Remember. PlayNice.
          </div>

          <h1
            style={{
              fontSize: "clamp(42px, 7vw, 86px)",
              lineHeight: 1,
              margin: "22px 0 0",
              letterSpacing: "0.03em"
            }}
          >
            Otkrij parfeme
            <br />
            na pravi način.
          </h1>

          <p
            style={{
              marginTop: 24,
              maxWidth: 640,
              color: "rgba(255,255,255,0.72)",
              fontSize: 18,
              lineHeight: 1.8
            }}
          >
            Premium dekanti za one koji ne kupuju naslepo. Testiraj na svojoj koži,
            u realnim uslovima, pa tek onda odluči da li je to tvoj sledeći full bottle.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 34
            }}
          >
            <a href="https://instagram.com/playnice.me" style={buttonPrimary}>
              DM TO ORDER
            </a>
            <a href="mailto:order@playniceshop.me" style={buttonSecondary}>
              order@playniceshop.me
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
              marginTop: 46,
              maxWidth: 720
            }}
          >
            {[
              ["Curated", "Niche • Designer • Arabic"],
              ["Try before you buy", "Bez slepe kupovine"],
              ["Delivery", "Crna Gora"]
            ].map(([title, text]) => (
              <div
                key={title}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.025)",
                  borderRadius: 24,
                  padding: 20,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.18)"
                }}
              >
                <div style={{ color: "#e0bd64", fontWeight: 700, fontSize: 14 }}>{title}</div>
                <div style={{ color: "rgba(255,255,255,0.66)", marginTop: 8, fontSize: 14 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            minHeight: 520,
            borderRadius: 36,
            border: "1px solid rgba(212,175,55,0.16)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            overflow: "hidden",
            boxShadow: "0 25px 80px rgba(0,0,0,0.45)"
          }}
        >
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

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "10px 24px 72px" }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ color: "#d7b255", letterSpacing: "0.18em", fontSize: 12, textTransform: "uppercase" }}>
            Limited Stock
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: "14px 0 0" }}>Aktuelni drop</h2>
          <p style={{ color: "rgba(255,255,255,0.66)", maxWidth: 700, margin: "16px auto 0", lineHeight: 1.8 }}>
            Pažljivo birani mirisi koji zaslužuju testiranje pre kupovine. Kada drop nestane,
            čekaš sledeći.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 22
          }}
        >
          {products.map((item) => (
            <div
              key={item.name}
              style={{
                position: "relative",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                borderRadius: 32,
                padding: 24,
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
              }}
            >
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

              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src={item.img}
                  alt={item.name}
                  style={{
                    maxHeight: 180,
                    maxWidth: "90%",
                    objectFit: "contain",
                    position: "relative",
                    zIndex: 2,
                    filter: "drop-shadow(0 18px 34px rgba(0,0,0,0.38))"
                  }}
                />
              </div>

              <h3 style={{ color: "#e1be67", fontSize: 24, margin: "4px 0 0" }}>{item.name}</h3>
              <p style={{ color: "rgba(255,255,255,0.66)", lineHeight: 1.8, minHeight: 82 }}>{item.desc}</p>
              <div style={{ color: "#fff", fontWeight: 700, letterSpacing: "0.02em", marginTop: 8 }}>{item.price}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 72px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22
        }}
      >
        <div
          style={{
            borderRadius: 32,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
            padding: 32
          }}
        >
          <div style={{ color: "#d7b255", letterSpacing: "0.18em", fontSize: 12, textTransform: "uppercase" }}>
            Zašto dekanti
          </div>
          <h2 style={{ fontSize: 36, marginTop: 14 }}>Pametniji način kupovine parfema</h2>
          <div style={{ marginTop: 22, color: "rgba(255,255,255,0.72)", lineHeight: 1.9 }}>
            <div>✔ Testiraš parfem na svojoj koži, ne na papiriću</div>
            <div>✔ Ne trošiš veliki novac na pogrešan full bottle</div>
            <div>✔ Možeš isprobati više različitih mirisa</div>
            <div>✔ Lakše pronalaziš signature scent bez rizika</div>
          </div>
        </div>

        <div
          style={{
            borderRadius: 32,
            border: "1px solid rgba(212,175,55,0.16)",
            background: "linear-gradient(180deg, rgba(212,175,55,0.08), rgba(255,255,255,0.02))",
            padding: 32
          }}
        >
          <div style={{ color: "#d7b255", letterSpacing: "0.18em", fontSize: 12, textTransform: "uppercase" }}>
            Kako funkcioniše
          </div>
          <h2 style={{ fontSize: 36, marginTop: 14 }}>Try before you buy</h2>
          <div style={{ marginTop: 22, color: "rgba(255,255,255,0.78)", lineHeight: 1.9 }}>
            <div>1. Izabereš parfem ili sačekaš sledeći drop</div>
            <div>2. Javiš se preko DM-a ili emaila</div>
            <div>3. Dobijaš 5ml ili 10ml dekant za pravo testiranje</div>
            <div>4. Tek onda odlučuješ da li želiš full bottle</div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px 92px" }}>
        <div
          style={{
            borderRadius: 36,
            border: "1px solid rgba(212,175,55,0.16)",
            background:
              "radial-gradient(circle at center, rgba(212,175,55,0.12), transparent 48%), rgba(255,255,255,0.025)",
            padding: "46px 28px",
            textAlign: "center",
            boxShadow: "0 25px 80px rgba(0,0,0,0.28)"
          }}
        >
          <div style={{ color: "#d7b255", letterSpacing: "0.18em", fontSize: 12, textTransform: "uppercase" }}>
            Kontakt
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: "14px 0 0" }}>
            Spreman za sledeći kompliment?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.68)", maxWidth: 700, margin: "16px auto 0", lineHeight: 1.8 }}>
            Pošalji poruku, traži preporuku ili rezerviši svoj dekant iz aktuelnog dropa.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginTop: 30 }}>
            <a href="https://instagram.com/playnice.me" style={buttonPrimary}>
              DM TO ORDER
            </a>
            <a href="mailto:order@playniceshop.me" style={buttonSecondary}>
              order@playniceshop.me
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
