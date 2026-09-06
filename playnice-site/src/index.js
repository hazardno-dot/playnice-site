import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import PrivateSelectionEnhancer from "./PrivateSelectionEnhancer";
import MobilePartnerSpotlight from "./MobilePartnerSpotlight";
import MobileDiscoveryTextPolish from "./MobileDiscoveryTextPolish";
import MobilePrivateSelectionProfile from "./MobilePrivateSelectionProfile";
import MobileShopV2 from "./MobileShopV2";
import MobileShopReveal from "./MobileShopReveal";
import MobileProductModalBubbles from "./MobileProductModalBubbles";
import "./PrivateSelectionV1.css";
import "./PrivateSelectionPolish.css";
import "./NewArrivalsScale.css";
import "./WishlistSurfacePolish.css";
import "./HeroPaginationPosition.css";
import "./MobileHeaderV2.css";
import "./MobileHomeV2.css";
import "./MobileJustInV2.css";
import "./MobileDiscoverySetsV2.css";
import "./MobilePrivateSelectionV2.css";
import "./MobileClosingFooterV2.css";
import "./MobileShopV2.css";
import "./MobileShopReveal.css";
import "./MobileProductModalV2.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
    <PrivateSelectionEnhancer />
    <MobilePartnerSpotlight />
    <MobileDiscoveryTextPolish />
    <MobilePrivateSelectionProfile />
    <MobileShopV2 />
    <MobileShopReveal />
    <MobileProductModalBubbles />
  </React.StrictMode>
);