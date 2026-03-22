import React from "react";
import "./App.css";

const featuredFragrances = [
  {
    name: "Creed Aventus Cologne",
    image: "/images/creed-aventus-cologne.jpg",
    price5: "€15",
    price10: "€28",
  },
  {
    name: "Givenchy Gentleman Réserve Privée",
    image: "/images/givenchy-reserve-privee.png",
    price5: "€9",
    price10: "€16",
  },
  {
    name: "Mancera Intense Cedrat Boisé",
    image: "/images/mancera-intense-cedrat-boise.png",
    price5: "€8",
    price10: "€14",
  },
  {
    name: "Gisada Ambassador Men",
    image: "/images/gisada-ambassador-men.png",
    price5: "€8",
    price10: "€14",
  },
  {
    name: "Armaf Club de Nuit Intense Man",
    image: "/images/armaf-cdnim.png",
    price5: "€4",
    price10: "€7",
  },
  {
    name: "Afnan 9PM",
    image: "/images/afnan-9pm.png",
    price5: "€4",
    price10: "€7",
  },
];

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: "center", marginTop: 40 }}>
        PlayNice
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          padding: 20,
        }}
      >
        {featuredFragrances.map((item) => (
          <div
            key={item.name}
            style={{
              background: "#111",
              padding: 20,
              borderRadius: 12,
              textAlign: "center",
              color: "#fff",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "100%",
                maxHeight: 200,
                objectFit: "contain",
              }}
            />

            <h3>{item.name}</h3>

            <p>
              5ml {item.price5} | 10ml {item.price10}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
