import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import PrivateSelectionEnhancer from "./PrivateSelectionEnhancer";
import MobilePartnerSpotlight from "./MobilePartnerSpotlight";
import "./PrivateSelectionV1.css";
import "./PrivateSelectionPolish.css";
import "./NewArrivalsScale.css";
import "./WishlistSurfacePolish.css";
import "./HeroPaginationPosition.css";
import "./MobileHeaderV2.css";
import "./MobileHomeV2.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
    <PrivateSelectionEnhancer />
    <MobilePartnerSpotlight />
  </React.StrictMode>
);