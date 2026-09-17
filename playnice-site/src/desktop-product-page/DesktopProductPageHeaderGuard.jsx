import { useEffect } from "react";
import { products } from "../data/products";
import { LOCATION_CHANGE_EVENT } from "../lib/locationEvents";

const PRODUCT_ROUTE = /^\/product\/([^/]+)\/?$/;

const getProductFromPath = () => {
  const match = window.location.pathname.match(PRODUCT_ROUTE);
  if (!match?.[1]) return null;

  const slug = decodeURIComponent(match[1]);
  return products.find((product) => String(product.slug || "") === slug) || null;
};

const isDesktopProductRoute = () =>
  window.matchMedia("(min-width: 769px)").matches && PRODUCT_ROUTE.test(window.location.pathname);

const getPrimaryDestination = (button) => {
  const primaryButtons = Array.from(
    document.querySelectorAll(".header-next-rail .header-next-link")
  );
  const index = primaryButtons.indexOf(button);

  if (index === 0) return { path: "/" };
  if (index === 1) return { path: "/shop" };
  if (index === 2) return { path: "/journal" };
  if (index === 3) return { path: "/", hash: "#community" };
  if (index === 4) return { path: "/exhibition" };

  return null;
};

const navigateSpa = ({ path, hash = "" }) => {
  const nextUrl = `${path}${hash}`;
  const nextState = {
    ...(window.history.state || {}),
    playniceProductModal: false,
  };

  delete nextState.productSlug;
  delete nextState.productOriginView;

  window.history.pushState(nextState, "", nextUrl);
  window.dispatchEvent(new PopStateEvent("popstate", { state: nextState }));

  if (hash === "#community") {
    window.setTimeout(() => {
      document
        .querySelector(".community-requests-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return;
  }

  const resetScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  requestAnimationFrame(() => {
    resetScroll();
    requestAnimationFrame(resetScroll);
  });
};

const ensurePersistentBadge = () => {
  if (!isDesktopProductRoute()) return;

  const product = getProductFromPath();
  const visual = document.querySelector(".desktop-product-page__visual");
  if (!product?.badge || !visual) return;

  const badges = Array.from(visual.querySelectorAll(".desktop-product-page__badge"));
  const injected = badges.find((badge) => badge.dataset.pdpPersistentBadge === "true");
  const native = badges.find((badge) => badge.dataset.pdpPersistentBadge !== "true");

  if (native) {
    injected?.remove();
    return;
  }

  if (injected) return;

  const badge = document.createElement("span");
  badge.className = "desktop-product-page__badge";
  badge.dataset.pdpPersistentBadge = "true";
  badge.textContent = product.badge;
  visual.appendChild(badge);
};

export default function DesktopProductPageHeaderGuard() {
  useEffect(() => {
    let frame = null;
    let timer = null;

    const scheduleBadgeSync = () => {
      if (frame) cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);

      frame = requestAnimationFrame(() => {
        ensurePersistentBadge();
        frame = null;
      });

      timer = window.setTimeout(() => {
        ensurePersistentBadge();
        timer = null;
      }, 100);
    };

    const handleHeaderClickCapture = (event) => {
      if (!isDesktopProductRoute()) return;

      const brand = event.target.closest?.(".header-next-brand");
      const primary = event.target.closest?.(".header-next-rail .header-next-link");

      let destination = null;
      if (brand) destination = { path: "/" };
      if (primary) destination = getPrimaryDestination(primary);
      if (!destination) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      navigateSpa(destination);
    };

    const handlePdpClickCapture = (event) => {
      if (!isDesktopProductRoute()) return;

      const note = event.target.closest?.(
        ".desktop-product-page__note-map-stage .the-note-map__note"
      );

      if (note) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();

        document
          .querySelector(".desktop-product-page__note-map-stage .the-note-map__trigger")
          ?.click();
      }

      if (event.target.closest?.(".desktop-product-page__visual")) {
        scheduleBadgeSync();
      }
    };

    const handleRouteChange = () => scheduleBadgeSync();

    document.addEventListener("click", handleHeaderClickCapture, true);
    document.addEventListener("click", handlePdpClickCapture, true);
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener(LOCATION_CHANGE_EVENT, handleRouteChange);
    scheduleBadgeSync();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("click", handleHeaderClickCapture, true);
      document.removeEventListener("click", handlePdpClickCapture, true);
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener(LOCATION_CHANGE_EVENT, handleRouteChange);
    };
  }, []);

  return null;
}
