import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import PrivateSelectionEnhancer from "./PrivateSelectionEnhancer";
import MobilePartnerSpotlight from "./mobile-v2/content/MobilePartnerSpotlight";
import MobileDiscoveryTextPolish from "./mobile-v2/discovery/MobileDiscoveryTextPolish";
import MobilePrivateSelectionProfile from "./mobile-v2/private-selection/MobilePrivateSelectionProfile";
import MobileShopV2 from "./mobile-v2/shop/MobileShopV2";
import MobileShopReveal from "./mobile-v2/shop/MobileShopReveal";
import MobileMenuContact from "./mobile-v2/navigation/MobileMenuContact";
import MobileProductModalPager from "./mobile-v2/modal/MobileProductModalPager";
import DesktopFooterCatalog from "./DesktopFooterCatalog";
import CartInteractionV2 from "./CartInteractionV2";
import DiscoveryImageFallback from "./DiscoveryImageFallback";
import FragranceIntelligenceToneEnhancer from "./FragranceIntelligenceToneEnhancer";
import "./PrivateSelectionV1.css";
import "./PrivateSelectionPolish.css";
import "./NewArrivalsScale.css";
import "./WishlistSurfacePolish.css";
import "./HeroPaginationPosition.css";
import "./mobile-v2/navigation/MobileHeaderV2.css";
import "./mobile-v2/home/MobileHomeV2.css";
import "./mobile-v2/discovery/MobileFragranceIntelligenceV2.css";
import "./DesktopFragranceIntelligenceV2.css";
import "./DesktopFragranceIntelligenceHoverFix.css";
import "./mobile-v2/shop/MobileJustInV2.css";
import "./mobile-v2/discovery/MobileDiscoverySetsV2.css";
import "./mobile-v2/content/MobileHowItWorksV2.css";
import "./mobile-v2/content/MobileExhibitionV2.css";
import "./mobile-v2/content/MobileStoryV2.css";
import "./mobile-v2/content/MobileFaqV2.css";
import "./mobile-v2/private-selection/MobilePrivateSelectionV2.css";
import "./mobile-v2/navigation/MobileClosingFooterV2.css";
import "./mobile-v2/shop/MobileShopV2.css";
import "./mobile-v2/shop/MobileShopReveal.css";
import "./mobile-v2/modal/MobileProductModalBase.css";
import "./mobile-v2/modal/MobileProductModalPagerPolish.css";
import "./ProductModalPurchaseV2.css";
import "./mobile-v2/cart-checkout/MobileCartV2.css";
import "./mobile-v2/cart-checkout/MobileCheckoutV2.css";
import "./mobile-v2/cart-checkout/MobileStickyCtaV2.css";
import "./DesktopStickyCtaGlass.css";
import "./mobile-v2/home/MobileTypographyV2.css";
import "./mobile-v2/shop/MobileProductCardTextV2.css";
import "./CartConfirmationBar.css";
import "./DesktopConfirmationBarFit.css";
import "./mobile-v2/content/MobileManifestoFix.css";
import "./DesktopProductModalCopyV2.css";
import "./HeaderLanguageColor.css";
import "./DesktopDiscoverCleanup.css";

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
    <MobileMenuContact />
    <MobileProductModalPager />
    <DesktopFooterCatalog />
    <CartInteractionV2 />
    <DiscoveryImageFallback />
    <FragranceIntelligenceToneEnhancer />
  </React.StrictMode>
);
