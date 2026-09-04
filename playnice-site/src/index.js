import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import PrivateSelectionEnhancer from "./PrivateSelectionEnhancer";
import "./PrivateSelectionV1.css";
import "./PrivateSelectionPolish.css";
import "./NewArrivalsScale.css";
import "./WishlistSurfacePolish.css";
import "./HeroPaginationPolish.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
    <PrivateSelectionEnhancer />
  </React.StrictMode>
);