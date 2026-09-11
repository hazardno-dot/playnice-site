import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import PrivateSelectionEnhancer from "./PrivateSelectionEnhancer";
import MobileShopReveal from "./mobile-v2/shop/MobileShopReveal";
import MobileMenuContact from "./mobile-v2/navigation/MobileMenuContact";
import MobileCommunityV2 from "./mobile-v2/community/MobileCommunityV2";
import DesktopFooterCatalog from "./DesktopFooterCatalog";
import CartInteractionV2 from "./CartInteractionV2";
import DiscoveryImageFallback from "./DiscoveryImageFallback";
import FragranceIntelligenceToneLoader from "./FragranceIntelligenceToneLoader";
import { initLocationEvents } from "./lib/locationEvents";
import "./PrivateSelectionV1.css";
import "./PrivateSelectionPolish.css";
import "./NewArrivalsScale.css";
import "./WishlistSurfacePolish.css";
import "./HeroPaginationPosition.css";
import "./mobile-v2/navigation/MobileHeaderV2.css";
import "./mobile-v2/home/MobileHomeV2.css";
import "./mobile-v2/home/MobileFirstPaintContainment.css";
import "./mobile-v2/discovery/MobileFragranceIntelligenceV2.css";
import "./mobile-v2/shop/MobileJustInV2.css";
import "./mobile-v2/discovery/MobileDiscoverySetsV2.css";
import "./mobile-v2/content/MobileHowItWorksV2.css";
import "./mobile-v2/content/MobileExhibitionV2.css";
import "./mobile-v2/content/MobileStoryV2.css";
import "./mobile-v2/content/MobileFaqV2.css";
import "./mobile-v2/private-selection/MobilePrivateSelectionV2.css";
import "./mobile-v2/private-selection/MobilePrivateSelectionDrawerV2.css";
import "./mobile-v2/navigation/MobileClosingFooterV2.css";
import "./mobile-v2/shop/MobileShopReveal.css";
import "./mobile-v2/modal/MobileProductModalBase.css";
import "./mobile-v2/modal/MobileProductModalPagerCore.css";
import "./mobile-v2/modal/MobileProductModalPagerPolish.css";
import "./ProductModalPurchaseV2.css";
import "./mobile-v2/product-page/MobileProductPage.css";
import "./mobile-v2/product-page/MobileProductPageFixes.css";
import "./mobile-v2/cart-checkout/MobileCartV2.css";
import "./mobile-v2/cart-checkout/MobileCheckoutV2.css";
import "./mobile-v2/cart-checkout/MobileStickyCtaV2.css";
import "./mobile-v2/home/MobileTypographyV2.css";
import "./CartConfirmationBar.css";
import "./mobile-v2/content/MobileManifestoFix.css";
import "./HeaderLanguageColor.css";

const renderApp = () => {
  initLocationEvents();

  const root = ReactDOM.createRoot(document.getElementById("root"));

  root.render(
    <React.StrictMode>
      <App />
      <PrivateSelectionEnhancer />
      <MobileShopReveal />
      <MobileMenuContact />
      <MobileCommunityV2 />
      <DesktopFooterCatalog />
      <CartInteractionV2 />
      <DiscoveryImageFallback />
      <FragranceIntelligenceToneLoader />
    </React.StrictMode>
  );
};

if (window.matchMedia("(min-width: 769px)").matches) {
  Promise.all([
    import("./DesktopFragranceIntelligenceV2.css"),
    import("./DesktopFragranceIntelligenceHoverFix.css"),
    import("./DesktopStickyCtaGlass.css"),
    import("./DesktopConfirmationBarFit.css"),
    import("./DesktopProductModalCopyV2.css"),
    import("./DesktopDiscoverCleanup.css"),
  ])
    .then(renderApp)
    .catch(renderApp);
} else {
  renderApp();
}
