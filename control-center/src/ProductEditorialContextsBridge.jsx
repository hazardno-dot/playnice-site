import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { productWearContext } from "@shop/data/products/productWearContext.js";
import { productDoNotWearContext } from "@shop/data/products/productDoNotWearContext.js";
import { productWhatToWearContext } from "@shop/data/products/productWhatToWearContext.js";
import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";
import { supabase } from "./supabase";
import "./product-editorial-contexts.css";

const emptyPair = () => ({ sr: "", en: "" });
const clonePair = (value) => ({ sr: String(value?.sr || ""), en: String(value?.en || "") });
const csv = (value) => Array.isArray(value) ? value.join(", ") : String(value || "");

function selectedSlug(root = document) {
  const node = root.querySelector(".detail-panel .product-detail .slug");
  return String(node?.textContent || "").split(" · ")[0].trim();
}

function liveDraft(product) {
  if (!product) return null;
  return {
    core: {
      name: product.name || "",
      shortName: product.shortName || "",
      category: product.category || "",
      image: product.image || "",
      badge: product.badge || "",
      rating: product.rating ?? "",
      ratingLabel: product.ratingLabel || "",
      season: product.season || "",
      moods: csv(product.moods),
      inspiredBy: {
        name: product.inspiredBy?.name || "",
        short: product.inspiredBy?.short || "",
      },
      sizes: { ...(product.sizes || {}) },
      noteMap: {
        top: csv(product.noteMap?.top),
        heart: csv(product.noteMap?.heart),
        base: csv(product.noteMap?.base),
      },
      recommendations: csv(product.recommendations),
    },
    copy: JSON.parse(JSON.stringify(productCopy[product.name] || {})),
    wear: clonePair(productWearContext[product.name]),
    doNotWear: clonePair(productDoNotWearContext[product.name]),
    whatToWear: clonePair(productWhatToWearContext[product.name]),
    discovery: { ...(discoveryProfiles[product.slug] || {}) },
    savedAt: null,
  };
}

function ContextPair({ title, subtitle, value, disabled, onChange }) {
  return <section className="cc-editorial-context-card">
    <div className="cc-editorial-context-head">
      <span>{subtitle}</span>
      <h3>{title}</h3>
    </div>
    <div className="cc-editorial-context-grid">
      <label><span>SR</span><textarea value={value.sr} disabled={disabled} onChange={(event) => onChange("sr", event.target.value)} /></label>
      <label><span>EN</span><textarea value={value.en} disabled={disabled} onChange={(event) => onChange("en", event.target.value)} /></label>
    </div>
  </section>;
}

export default function ProductEditorialContextsBridge() {
  const [slot, setSlot] = useState(null);
  const [slug, setSlug] = useState("");
  const [editing, setEditing] = useState(false);
  const [row, setRow] = useState(null);
  const [doNotWear, setDoNotWear] = useState(emptyPair);
  const [whatToWear, setWhatToWear] = useState(emptyPair);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const live = useMemo(() => products.find((product) => product.slug === slug) || null, [slug]);

  useEffect(() => {
    const stage = document.querySelector(".main-stage");
    if (!stage) return;

    const sync = () => {
      const detail = document.querySelector(".detail-panel .product-detail");
      if (!detail) {
        setSlot(null);
        setSlug("");
        setEditing(false);
        return;
      }
      const nextSlug = selectedSlug();
      const nextEditing = detail.classList.contains("edit-mode");
      if (!nextSlug) return;

      let nextSlot = detail.querySelector("#product-editorial-contexts-slot");
      if (!nextSlot) {
        nextSlot = document.createElement("div");
        nextSlot.id = "product-editorial-contexts-slot";
        nextSlot.className = "product-editorial-contexts-slot";
        const discovery = [...detail.querySelectorAll(".edit-section, .detail-section")]
          .find((section) => section.querySelector(".section-heading span")?.textContent?.trim() === "DISCOVERY INTELLIGENCE");
        if (discovery) discovery.insertAdjacentElement("beforebegin", nextSlot);
        else detail.appendChild(nextSlot);
      }
      setSlot(nextSlot);
      setSlug((current) => current === nextSlug ? current : nextSlug);
      setEditing(nextEditing);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(stage, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!slug) {
      setRow(null);
      setDoNotWear(emptyPair());
      setWhatToWear(emptyPair());
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("product_drafts").select("product_slug,payload,updated_at").eq("product_slug", slug).maybeSingle();
      if (cancelled) return;
      setRow(data || null);
      const payload = data?.payload || null;
      const name = payload?.core?.name || live?.name || "";
      setDoNotWear(clonePair(payload?.doNotWear || productDoNotWearContext[name]));
      setWhatToWear(clonePair(payload?.whatToWear || productWhatToWearContext[name]));
      setMessage("");
    };
    load();
    const channel = supabase.channel(`cc-product-editorial-contexts-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts", filter: `product_slug=eq.${slug}` }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [slug, live]);

  if (!slot || !slug) return null;

  const updatePair = (setter) => (lang, value) => setter((current) => ({ ...current, [lang]: value }));

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) throw authError || new Error("No authenticated admin session.");
      const currentPayload = row?.payload || liveDraft(live);
      if (!currentPayload) throw new Error("Create the product draft before adding editorial contexts.");
      const nextPayload = {
        ...currentPayload,
        doNotWear: clonePair(doNotWear),
        whatToWear: clonePair(whatToWear),
        savedAt: new Date().toISOString(),
      };
      const { data, error } = await supabase.from("product_drafts")
        .upsert({ product_slug: slug, payload: nextPayload, created_by: auth.user.id }, { onConflict: "created_by,product_slug" })
        .select("product_slug,payload,updated_at")
        .single();
      if (error) throw error;
      setRow(data);
      setMessage("Saved to product draft.");
    } catch (error) {
      setMessage(error?.message || "Could not save editorial contexts.");
    } finally {
      setSaving(false);
    }
  };

  const body = <div className={`cc-editorial-contexts ${editing ? "is-editing" : "is-readonly"}`}>
    <ContextPair title="When NOT to wear" subtitle="EDITORIAL CONTEXT" value={doNotWear} disabled={!editing || saving} onChange={updatePair(setDoNotWear)} />
    <ContextPair title="What to wear" subtitle="STYLE CONTEXT" value={whatToWear} disabled={!editing || saving} onChange={updatePair(setWhatToWear)} />
    {editing ? <div className="cc-editorial-context-actions">
      <small>{message || "SUPABASE DRAFT ONLY · Controlled Apply remains the publish gate."}</small>
      <button type="button" className="secondary-btn" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save contexts"}</button>
    </div> : null}
  </div>;

  return createPortal(body, slot);
}
