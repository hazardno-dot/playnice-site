import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "../data/products";
import DesktopProductModalParity from "./DesktopProductModalParity";
import "./DesktopProductPageCompositionFix.css";

const PRODUCT_ROUTE = /^\/product\/([^/]+)\/?$/;
const ROUTE_EVENT = "playnice:product-route";

const getProduct = () => {
  const match = window.location.pathname.match(PRODUCT_ROUTE);
  if (!match?.[1]) return null;
  const slug = decodeURIComponent(match[1]);
  return products.find((item) => item.slug === slug) || null;
};

const getLang = () => document.documentElement.lang === "en" ? "en" : "sr";

export default function DesktopProductModalParityBridge() {
  const [product, setProduct] = useState(() => getProduct());
  const [target, setTarget] = useState(null);
  const [lang, setLang] = useState(() => getLang());

  useEffect(() => {
    const refresh = () => setProduct(getProduct());
    window.addEventListener("popstate", refresh);
    window.addEventListener(ROUTE_EVENT, refresh);
    return () => {
      window.removeEventListener("popstate", refresh);
      window.removeEventListener(ROUTE_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    if (!product || !window.matchMedia("(min-width: 769px)").matches) {
      setTarget(null);
      return undefined;
    }

    let frame;
    const resolve = () => {
      const host = document.querySelector(".desktop-product-route-host");
      if (host) {
        setTarget(host);
        return;
      }
      frame = window.requestAnimationFrame(resolve);
    };
    resolve();
    return () => window.cancelAnimationFrame(frame);
  }, [product?.slug]);

  useEffect(() => {
    const observer = new MutationObserver(() => setLang(getLang()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  if (!product || !target) return null;

  return createPortal(
    <DesktopProductModalParity product={product} lang={lang} />,
    target
  );
}
