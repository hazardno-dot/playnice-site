import { useCallback, useEffect } from "react";
import { products } from "@shop/data/products/index.js";
import { supabase } from "./supabase";

const liveSlugs = new Set(products.map((product) => product.slug));

export default function ProductCatalogCountBridge() {
  const syncCount = useCallback(async () => {
    const stage = document.querySelector(".main-stage");
    const heading = stage?.querySelector(".topbar h1")?.textContent?.trim();
    const countNode = stage?.querySelector(".catalog-count");
    if (!stage || heading !== "Products" || !countNode) return;

    const { data, error } = await supabase
      .from("product_drafts")
      .select("product_slug");
    if (error) return;

    const draftOnly = (data || []).filter((row) => !liveSlugs.has(row.product_slug)).length;
    const label = draftOnly
      ? `${products.length} live · ${draftOnly} draft-only`
      : `${products.length} live`;

    countNode.textContent = label;
    countNode.setAttribute("title", draftOnly
      ? `${products.length} live products and ${draftOnly} unpublished draft-only product${draftOnly === 1 ? "" : "s"}`
      : `${products.length} live products`);
    countNode.setAttribute("aria-label", label);
  }, []);

  useEffect(() => {
    const stage = document.querySelector(".main-stage");
    if (!stage) return;

    const observer = new MutationObserver(() => syncCount());
    observer.observe(stage, { childList: true, subtree: true });
    syncCount();

    const channel = supabase
      .channel("product-catalog-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts" }, syncCount)
      .subscribe();

    const onFocus = () => syncCount();
    window.addEventListener("focus", onFocus);

    return () => {
      observer.disconnect();
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [syncCount]);

  return null;
}
