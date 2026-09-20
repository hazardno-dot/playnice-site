import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import PrivateSelectionEnhancer from "./features/private-selection/PrivateSelectionEnhancer";
import MobileShopReveal from "./mobile-v2/shop/MobileShopReveal";
import MobileMenuContact from "./mobile-v2/navigation/MobileMenuContact";
import MobileCommunityV2 from "./mobile-v2/community/MobileCommunityV2";
import DesktopFooterCatalog from "./features/footer/DesktopFooterCatalog";
import CartInteractionV2 from "./features/cart/CartInteractionV2";
import DiscoveryImageFallback from "./features/discovery/DiscoveryImageFallback";
import FragranceIntelligenceToneLoader from "./features/discovery/FragranceIntelligenceToneLoader";
import WhatsAppLinkBridge from "./features/footer/WhatsAppLinkBridge";
import DesktopCartConfirmationEnhancer from "./features/cart/DesktopCartConfirmationEnhancer";
import DesktopProductPageBridge from "./desktop-product-page/DesktopProductPageBridge";
import DesktopProductPageHeaderGuard from "./desktop-product-page/DesktopProductPageHeaderGuard";
import DesktopProductPageNavigationPolish from "./desktop-product-page/DesktopProductPageNavigationPolish";
import DesktopQuickView from "./desktop-product-page/DesktopQuickView";
import { initLocationEvents } from "./lib/locationEvents";
import "./features/private-selection/PrivateSelectionV1.css";
import "./features/private-selection/PrivateSelectionPolish.css";
import "./features/product-media/NewArrivalsScale.css";
import "./features/private-selection/WishlistSurfacePolish.css";
import "./features/private-selection/WishlistHeartGold.css";
import "./features/hero/HeroPaginationPosition.css";
import "./mobile-v2/navigation/MobileHeaderV2.css";
import "./mobile-v2/home/MobileHomeV2.css";
import "./mobile-v2/home/MobileFirstPaintContainment.css";
import "./mobile-v2/discovery/MobileFragranceIntelligenceV2.css";
import "./mobile-v2/shop/MobileJustInV2.css";
import "./mobile-v2/shop/MobileJustInBadgePolish.css";
import "./mobile-v2/discovery/MobileDiscoverySetsV2.css";
import "./mobile-v2/content/MobileHowItWorksV2.css";
import "./mobile-v2/content/MobileExhibitionV2.css";
import "./mobile-v2/content/MobileStoryV2.css";
import "./mobile-v2/content/MobileFaqV2.css";
import "./mobile-v2/private-selection/MobilePrivateSelectionV2.css";
import "./mobile-v2/private-selection/MobilePrivateSelectionDrawerV2.css";
import "./mobile-v2/navigation/MobileClosingFooterV2.css";
import "./mobile-v2/shop/MobileShopReveal.css";
import "./features/product-media/ProductImageNormalization.css";
import "./mobile-v2/product-page/MobileProductPage.css";
import "./mobile-v2/product-page/MobileProductPageBadgePolish.css";
import "./mobile-v2/product-page/MobileProductPageAccordionChevrons.css";
import "./mobile-v2/cart-checkout/MobileCartV2.css";
import "./mobile-v2/cart-checkout/MobileCheckoutV2.css";
import "./mobile-v2/cart-checkout/MobileStickyCtaV2.css";
import "./mobile-v2/home/MobileTypographyV2.css";
import "./features/cart/CartConfirmationBar.css";
import "./features/cart/DesktopCartConfirmationTone.css";
import "./mobile-v2/content/MobileManifestoFix.css";
import "./features/header/HeaderLanguageColor.css";
import "./mobile-v2/product-page/MobileProductPageNoteMap.css";
import "./features/header/AnnouncementTiming.css";
import "./desktop-product-page/DesktopProductPageOverrides.css";
import "./shared/theme/ColorHarmonizationV1.css";
import "./features/product-card/DesktopProductCardBadgePolish.css";
import "./features/home/HomeJustInBadgePolish.css";

const CARD_COPY_FONT_LINK_ID = "playnice-card-copy-italic-font";

const ensureDesktopCardCopyFont = () => {
  if (document.getElementById(CARD_COPY_FONT_LINK_ID)) return;

  const link = document.createElement("link");
  link.id = CARD_COPY_FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400&display=swap";
  document.head.appendChild(link);
};

const renderApp = () => {
  initLocationEvents();

  const root = ReactDOM.createRoot(document.getElementById("root"));

  root.render(
    <React.StrictMode>
      <App />
      <DesktopProductPageBridge />
      <DesktopProductPageHeaderGuard />
      <DesktopProductPageNavigationPolish />
      <DesktopQuickView />
      <DesktopCartConfirmationEnhancer />
      <PrivateSelectionEnhancer />
      <MobileShopReveal />
      <MobileMenuContact />
      <MobileCommunityV2 />
      <DesktopFooterCatalog />
      <CartInteractionV2 />
      <DiscoveryImageFallback />
      <FragranceIntelligenceToneLoader />
      <WhatsAppLinkBridge />
    </React.StrictMode>
  );
};

if (window.matchMedia("(min-width: 769px)").matches) {
  ensureDesktopCardCopyFont();

  Promise.all([
    import("./features/discovery/DesktopFragranceIntelligenceV2.css"),
    import("./features/discovery/DesktopFragranceIntelligenceHoverFix.css"),
    import("./features/sticky-cta/DesktopStickyCtaGlass.css"),
    import("./features/cart/DesktopConfirmationBarFit.css"),
    import("./features/header/DesktopDiscoverCleanup.css"),
    import("./features/product-card/DesktopCardCopyWidth.css"),
    import("./features/footer/DesktopFooterSocialColors.css"),
  ])
    .then(renderApp)
    .catch(renderApp);
} else {
  renderApp();
}
