import React from "react";

export default function App() {
  return (
    <div style={{ background: "black", color: "white", minHeight: "100vh", fontFamily: "Helvetica, Arial" }}>
      
      {/* HERO */}
      <section style={{ padding: "80px 40px", textAlign: "center" }}>
        <h1 style={{ color: "gold", fontSize: "48px", letterSpacing: "2px" }}>
          PLAYNICE
        </h1>
        <p style={{ marginTop: "10px", color: "#aaa" }}>
          Remember. PlayNice.
        </p>

        <h2 style={{ marginTop: "40px", fontSize: "28px" }}>
          Ne kupuj parfem naslepo.
        </h2>

        <p style={{ marginTop: "20px", color: "#ccc" }}>
          Testiraj. Doživi. Odluči.
        </p>

        <div style={{ marginTop: "30px" }}>
          <a href="https://instagram.com/playnice.me" style={{ background: "gold", color: "black", padding: "12px 24px", marginRight: "10px", textDecoration: "none" }}>
            DM to order
          </a>
          <a href="mailto:order@playniceshop.me" style={{ border: "1px solid #555", padding: "12px 24px", textDecoration: "none", color: "white" }}>
            Email
          </a>
        </div>
      </section>

      {/* DROP */}
      <section style={{ padding: "60px 40px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "40px" }}>LIMITED DROP</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>

          {[
            {
              name: "Afnan 9PM Night Out",
              img: "https://i.imgur.com/8QfKuz1.png",
              desc: "Noćna bomba — compliment getter.",
              price: "5ml = 5€ | 10ml = 9€"
            },
            {
              name: "Lattafa Asad",
              img: "https://i.imgur.com/Wz4Yx9p.png",
              desc: "Topla začinska snaga.",
              price: "5ml = 4€ | 10ml = 7€"
            },
            {
              name: "Armaf CDNIM",
              img: "https://i.imgur.com/ZK0pYzL.png",
              desc: "Svež i moćan signature.",
              price: "5ml = 5€ | 10ml = 8€"
            }
          ].map((item, i) => (
            <div key={i} style={{ border: "1px solid #222", padding: "20px", textAlign: "center", transition: "0.3s" }}>
              <p style={{ color: "gold", fontSize: "12px" }}>LIMITED</p>
              <img src={item.img} style={{ height: "140px", marginTop: "10px" }} />
              <h3 style={{ color: "gold", marginTop: "20px" }}>{item.name}</h3>
              <p style={{ color: "#aaa", fontSize: "14px" }}>{item.desc}</p>
              <p style={{ marginTop: "10px" }}>{item.price}</p>
            </div>
          ))}

        </div>
      </section>

      {/* WHY */}
      <section style={{ padding: "60px 40px", background: "#0a0a0a" }}>
        <h2 style={{ textAlign: "center" }}>Zašto PlayNice</h2>

        <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center", color: "#ccc" }}>
          <p>✔ Testiraš parfem pre kupovine</p>
          <p>✔ Nema slepe kupovine</p>
          <p>✔ Više parfema, manji trošak</p>
          <p>✔ Premium iskustvo</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center" }}>
        <h2>Spreman za sledeći kompliment?</h2>

        <div style={{ marginTop: "30px" }}>
          <a href="https://instagram.com/playnice.me" style={{ background: "gold", color: "black", padding: "12px 24px", marginRight: "10px", textDecoration: "none" }}>
            DM to order
          </a>
          <a href="mailto:order@playniceshop.me" style={{ border: "1px solid #555", padding: "12px 24px", textDecoration: "none", color: "white" }}>
            Email
          </a>
        </div>
      </section>

    </div>
  );
}
