import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "./data/products";

const getCurrentProduct = () => {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/^\/product\/([^/]+)$/);
  if (!match?.[1]) return null;
  const slug = decodeURIComponent(match[1]);
  return products.find((product) => product.slug === slug) || null;
};

export default function MobileProductModalBubbles() {
  const [target, setTarget] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(() => getCurrentProduct());

  useEffect(() => {
    const refresh = () => {
      if (window.innerWidth > 640) {
        setTarget(null);
        return;
      }

      setCurrentProduct(getCurrentProduct());
      setTarget(
        document.querySelector(
          ".product-modal.open .modal-same-energy-list"
        ) || null
      );
    };

    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("popstate", refresh);
    window.addEventListener("resize", refresh);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  const relatedProducts = useMemo(() => {
    if (!currentProduct?.recommendations?.length) return [];

    return currentProduct.recommendations
      .map((slug) => products.find((product) => product.slug === slug))
      .filter(Boolean)
      .slice(0, 3);
  }, [currentProduct]);

  if (!target || relatedProducts.length === 0) return null;

  return createPortal(
    <div className="mobile-related-bubbles" aria-label="Related fragrances">
      {relatedProducts.map((product) => (
        <button
          key={product.id}
          type="button"
          className="mobile-related-bubble"
          onClick={() => {
            const productUrl = `/product/${product.slug}`;

            window.history.replaceState(
              {
                ...(window.history.state || {}),
                productSlug: product.slug,
              },
              "",
              productUrl
            );

            window.dispatchEvent(
              new PopStateEvent("popstate", { state: window.history.state })
            );
          }}
          aria-label={product.shortName || product.name}
        >
          <span className="mobile-related-bubble__circle">
            {product.image ? (
              <img src={product.image} alt="" aria-hidden="true" />
            ) : (
              <span aria-hidden="true">{product.name.charAt(0)}</span>
            )}
          </span>
          <span className="mobile-related-bubble__label">
            {product.shortName || product.name}
          </span>
        </button>
      ))}
    </div>,
    target
  );
}
