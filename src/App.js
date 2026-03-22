import React from "react";

export default function App() {
  return (
    <div
      style={{
        background: "black",
        color: "white",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial"
      }}
    >
      <h1 style={{ color: "gold" }}>PlayNice</h1>
      <p>Remember. PlayNice.</p>

      <h2 style={{ marginTop: "40px" }}>LIMITED STOCK</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
          marginTop: "20px"
        }}
      >
        <div style={{ border: "1px solid #333", padding: "20px", textAlign: "center" }}>
          <p style={{ color: "gold", fontSize: "12px" }}>LIMITED</p>
          <img
            src="https://i.imgur.com/8QfKuz1.png"
            alt="Afnan 9PM Night Out"
            style={{ height: "120px" }}
          />
          <h3 style={{ color: "gold" }}>Afnan 9PM Night Out</h3>
          <p>Noćna bomba — compliment getter.</p>
          <p>5ml = 5€ | 10ml = 9€</p>
        </div>

        <div style={{ border: "1px solid #333", padding: "20px", textAlign: "center" }}>
          <p style={{ color: "gold", fontSize: "12px" }}>LIMITED</p>
          <img
            src="https://i.imgur.com/Wz4Yx9p.png"
            alt="Lattafa Asad"
            style={{ height: "120px" }}
          />
          <h3 style={{ color: "gold" }}>Lattafa Asad</h3>
          <p>Topla začinska snaga.</p>
          <p>5ml = 4€ | 10ml = 7€</p>
        </div>

        <div style={{ border: "1px solid #333", padding: "20px", textAlign: "center" }}>
          <p style={{ color: "gold", fontSize: "12px" }}>LIMITED</p>
          <img
            src="https://i.imgur.com/ZK0pYzL.png"
            alt="Armaf Club de Nuit Intense"
            style={{ height: "120px" }}
          />
          <h3 style={{ color: "gold" }}>Armaf Club de Nuit Intense</h3>
          <p>Svež i moćan signature miris.</p>
          <p>5ml = 5€ | 10ml = 8€</p>
        </div>
      </div>

      <div style={{ marginTop: "60px" }}>
        <h2>Kontakt</h2>
        <p>DM na Instagram ili email:</p>
        <p>order@playniceshop.me</p>
      </div>
    </div>
  );
}
