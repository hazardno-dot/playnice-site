import { useEffect } from "react";

const FREE_SHIPPING_THRESHOLD = 39;

const formatAmount = (value) => {
  const rounded = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  return Number.isInteger(rounded)
    ? `€${rounded.toFixed(0)}`
    : `€${rounded.toFixed(2).replace(/0$/, "")}`;
};

const readShippingProgress = () => {
  const fill = document.querySelector(".announcement-progress-fill");
  const rawWidth = fill?.style?.width || "0%";
  const percent = Math.max(0, Math.min(100, Number.parseFloat(rawWidth) || 0));
  const subtotal = (percent / 100) * FREE_SHIPPING_THRESHOLD;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return { percent, remaining };
};

const decorateConfirmationBar = (bar) => {
  if (!(bar instanceof HTMLElement)) return;
  if (bar.querySelector(".mini-cart-preview-shipping")) return;

  const { percent, remaining } = readShippingProgress();
  const isUnlocked = percent >= 99.9;
  const lang = document.documentElement.lang?.toLowerCase().startsWith("en")
    ? "en"
    : "sr";

  const shipping = document.createElement("div");
  shipping.className = `mini-cart-preview-shipping${isUnlocked ? " is-unlocked" : ""}`;

  const label = document.createElement("span");
  label.className = "mini-cart-preview-shipping-label";
  label.textContent = isUnlocked
    ? lang === "en"
      ? "Free delivery unlocked"
      : "Besplatna dostava otključana"
    : lang === "en"
      ? `${formatAmount(remaining)} to free delivery`
      : `Još ${formatAmount(remaining)} do besplatne dostave`;

  const track = document.createElement("div");
  track.className = "mini-cart-preview-shipping-track";
  track.setAttribute("aria-hidden", "true");

  const progress = document.createElement("span");
  progress.className = "mini-cart-preview-shipping-progress";
  progress.style.width = `${percent}%`;

  track.appendChild(progress);
  shipping.append(label, track);
  bar.appendChild(shipping);
};

export default function DesktopCartConfirmationEnhancer() {
  useEffect(() => {
    if (!window.matchMedia("(min-width: 769px)").matches) return undefined;

    const decorateVisibleBars = () => {
      window.requestAnimationFrame(() => {
        document
          .querySelectorAll(".mini-cart-preview")
          .forEach(decorateConfirmationBar);
      });
    };

    decorateVisibleBars();

    const observer = new MutationObserver((mutations) => {
      if (
        mutations.some((mutation) =>
          Array.from(mutation.addedNodes).some(
            (node) =>
              node instanceof Element &&
              (node.matches?.(".mini-cart-preview") ||
                node.querySelector?.(".mini-cart-preview"))
          )
        )
      ) {
        decorateVisibleBars();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
