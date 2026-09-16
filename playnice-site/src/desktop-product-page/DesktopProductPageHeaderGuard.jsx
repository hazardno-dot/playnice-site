import { useEffect } from "react";
import { products } from "../data/products";

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

  if (index === 0) return "/";
  if (index === 1) return "/shop";
  if (index === 2) return "/journal";
  if (index === 3) return "/#community";
  if (index === 4) return "/exhibition";

  return null;
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
    const handleHeaderClickCapture = (event) => {
      if (!isDesktopProductRoute()) return;

      const brand = event.target.closest?.(".header-next-brand");
      const primary = event.target.closest?.(".header-next-rail .header-next-link");

      let destination = null;
      if (brand) destination = "/";
      if (primary) destination = getPrimaryDestination(primary);
      if (!destination) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      window.location.assign(destination);
    };

    const handleNoteClickCapture = (event) => {
      if (!isDesktopProductRoute()) return;

      const note = event.target.closest?.(
        ".desktop-product-page__note-map-stage .the-note-map__note"
      );
      if (!note) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      document
        .querySelector(".desktop-product-page__note-map-stage .the-note-map__trigger")
        ?.click();
    };

    const observer = new MutationObserver(() => ensurePersistentBadge());
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });

    document.addEventListener("click", handleHeaderClickCapture, true);
    document.addEventListener("click", handleNoteClickCapture, true);
    ensurePersistentBadge();

    if (window.location.hash === "#community") {
      window.setTimeout(() => {
        document
          .querySelector(".community-requests-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleHeaderClickCapture, true);
      document.removeEventListener("click", handleNoteClickCapture, true);
    };
  }, []);

  return null;
}
