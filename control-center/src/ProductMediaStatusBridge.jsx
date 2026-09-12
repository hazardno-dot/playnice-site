import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./product-media-upload.css";

function getSelectedSlug() {
  const slugNode = document.querySelector(".detail-panel .product-detail .slug");
  return String(slugNode?.textContent || "").split(" · ")[0].trim();
}

function ensureStatusSlot(editor) {
  if (!editor) return null;
  let slot = editor.querySelector(":scope > #product-media-status-slot");
  const panel = editor.querySelector(":scope > #product-media-upload-slot");
  if (!slot) {
    slot = document.createElement("div");
    slot.id = "product-media-status-slot";
  }
  if (panel && slot.previousElementSibling !== panel) panel.insertAdjacentElement("afterend", slot);
  return slot;
}

export default function ProductMediaStatusBridge() {
  const [slot, setSlot] = useState(null);
  const [slug, setSlug] = useState("");
  const [row, setRow] = useState(null);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const editor = mainStage.querySelector(".product-detail.edit-mode");
        const nextSlug = getSelectedSlug();
        if (!editor || !nextSlug) {
          setSlot(null);
          setSlug("");
          return;
        }
        setSlot(ensureStatusSlot(editor));
        setSlug((current) => current === nextSlug ? current : nextSlug);
      });
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!slug) { setRow(null); return; }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("product_drafts")
        .select("product_slug,payload,approved_payload,review_status,apply_branch,apply_pr_number")
        .eq("product_slug", slug)
        .maybeSingle();
      if (!cancelled) setRow(data || null);
    };
    load();
    const channel = supabase.channel(`product-media-status-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts", filter: `product_slug=eq.${slug}` }, (event) => {
        if (!cancelled) setRow(event.eventType === "DELETE" ? null : event.new || null);
      })
      .subscribe();
    const refresh = (event) => {
      if (!event?.detail?.productSlug || event.detail.productSlug === slug) load();
    };
    window.addEventListener("playnice:product-workflow-updated", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("playnice:product-workflow-updated", refresh);
      supabase.removeChannel(channel);
    };
  }, [slug]);

  if (!slot || !slug) return null;
  const mediaStage = row?.approved_payload?.mediaStage || row?.payload?.mediaStage;
  if (!mediaStage?.branch || !Array.isArray(mediaStage.files) || mediaStage.files.length < 2) return null;

  const hasShop = mediaStage.files.some((path) => /\/products\/[^/]+\.png$/i.test(path));
  const hasJustIn = mediaStage.files.some((path) => /\/products\/thumbs\/[^/]+\.webp$/i.test(path));
  const attached = Boolean(row?.apply_branch && row?.apply_pr_number);

  return createPortal(
    <section className="product-media-persisted" aria-label="Uploaded Product media status">
      <div className="product-media-persisted-copy">
        <span>MEDIA UPLOADED</span>
        <strong>{attached ? "STAGED + ATTACHED TO PREVIEW" : "READY IN PRODUCT DRAFT"}</strong>
        <small>No re-upload needed. These files remain linked to this Product workflow.</small>
        <code>{mediaStage.branch}</code>
      </div>
      <div className="product-media-persisted-checks" aria-label="Uploaded media files">
        <div className={hasShop ? "is-ready" : "is-missing"}>
          <b>{hasShop ? "✓" : "!"}</b>
          <span>SHOP</span>
          <small>600×600 PNG</small>
        </div>
        <div className={hasJustIn ? "is-ready" : "is-missing"}>
          <b>{hasJustIn ? "✓" : "!"}</b>
          <span>JUST IN</span>
          <small>320×320 WEBP</small>
        </div>
      </div>
    </section>,
    slot
  );
}
