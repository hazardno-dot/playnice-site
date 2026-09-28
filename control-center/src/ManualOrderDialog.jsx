import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";

const SOURCES = [
  ["instagram", "Instagram"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["whatsapp", "WhatsApp"],
  ["viber", "Viber"],
  ["message", "Message"],
  ["manual", "Manual"]
];

const SHIPPING_PRICE = 4;
const FREE_SHIPPING_THRESHOLD = 49;
const money = (value) => Number(value || 0).toLocaleString("en-IE", { style: "currency", currency: "EUR" });
const sortedProducts = [...products].sort((a, b) => String(a.name).localeCompare(String(b.name)));

export default function ManualOrderDialog({ open, busy, onClose, onCreate }) {
  const firstProduct = sortedProducts[0] || null;
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", city: "", address: "", note: "",
    orderSource: "instagram", instagramUsername: "", freeGift: "", language: "sr"
  });
  const [items, setItems] = useState([]);
  const [productSlug, setProductSlug] = useState(firstProduct?.slug || "");
  const [productQuery, setProductQuery] = useState(firstProduct?.name || "");
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [size, setSize] = useState(firstProduct ? Object.keys(firstProduct.sizes || {})[0] || "" : "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const product = sortedProducts.find((item) => item.slug === productSlug) || firstProduct;
  const sizes = Object.entries(product?.sizes || {});
  const productMatches = useMemo(() => {
    const needle = productQuery.trim().toLowerCase();
    if (!needle) return sortedProducts.slice(0, 12);
    return sortedProducts.filter((item) =>
      [item.name, item.shortName, item.slug, item.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    ).slice(0, 12);
  }, [productQuery]);

  useEffect(() => {
    if (!product) return;
    const nextSizes = Object.keys(product.sizes || {});
    if (!nextSizes.includes(size)) setSize(nextSizes[0] || "");
  }, [productSlug, product, size]);

  useEffect(() => {
    if (!open) return;
    setForm({
      fullName: "", email: "", phone: "", city: "", address: "", note: "",
      orderSource: "instagram", instagramUsername: "", freeGift: "", language: "sr"
    });
    setItems([]);
    setProductSlug(firstProduct?.slug || "");
    setProductQuery(firstProduct?.name || "");
    setProductPickerOpen(false);
    setSize(firstProduct ? Object.keys(firstProduct.sizes || {})[0] || "" : "");
    setQuantity(1);
    setError("");
  }, [open]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0), [items]);
  const shipping = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_PRICE : 0;
  const total = subtotal + shipping;

  if (!open) return null;

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const addItem = () => {
    setError("");
    if (!product || !size) return setError("Choose a fragrance and size.");
    const price = Number(product.sizes?.[size]);
    if (!Number.isFinite(price)) return setError("Selected size has no valid catalog price.");
    const qty = Math.max(1, Math.min(50, Number(quantity) || 1));
    setItems((current) => {
      const index = current.findIndex((item) => item.slug === product.slug && item.size === size);
      if (index < 0) return [...current, { slug: product.slug, name: product.name, size, quantity: qty, price }];
      return current.map((item, itemIndex) => itemIndex === index
        ? { ...item, quantity: Math.min(50, item.quantity + qty) }
        : item
      );
    });
    setQuantity(1);
  };

  const setItemQuantity = (index, next) => {
    const qty = Math.max(1, Math.min(50, Number(next) || 1));
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: qty } : item));
  };

  const removeItem = (index) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.fullName.trim() || !form.phone.trim() || !form.city.trim() || !form.address.trim()) {
      return setError("Full name, phone, city and address are required.");
    }
    if (!items.length) return setError("Add at least one fragrance.");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setError("Email address is not valid.");
    }

    const confirmed = window.confirm(
      "Create manual order · " + form.fullName.trim() + "\n" +
      items.length + " line item" + (items.length === 1 ? "" : "s") + " · " + money(total) +
      "\n\nThis creates a real production order in Supabase and mirrors it to Google Sheets."
    );
    if (!confirmed) return;

    try {
      await onCreate({
        ...form,
        items: items.map(({ name, size: itemSize, quantity: itemQuantity, price }) => ({
          name, size: itemSize, quantity: itemQuantity, price
        }))
      });
    } catch (createError) {
      setError(createError?.message || "Manual order could not be created.");
    }
  };

  return createPortal(
    <div className="manual-order-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onClose();
    }}>
      <form className="manual-order-dialog" onSubmit={submit}>
        <div className="manual-order-head">
          <div>
            <span>ORDERS / MANUAL INTAKE</span>
            <h2>Create order</h2>
            <p>Instagram, email, phone and message orders enter the same production lifecycle as website checkout.</p>
          </div>
          <button type="button" className="manual-order-close" onClick={onClose} disabled={busy}>×</button>
        </div>

        <div className="manual-order-grid">
          <section>
            <div className="manual-order-section-title"><span>CUSTOMER</span><strong>Delivery details</strong></div>
            <div className="manual-order-fields">
              <label><span>FULL NAME *</span><input value={form.fullName} onChange={(e) => change("fullName", e.target.value)} /></label>
              <label><span>PHONE *</span><input value={form.phone} onChange={(e) => change("phone", e.target.value)} /></label>
              <label><span>EMAIL · OPTIONAL</span><input type="email" value={form.email} onChange={(e) => change("email", e.target.value)} /></label>
              <label><span>CITY *</span><input value={form.city} onChange={(e) => change("city", e.target.value)} /></label>
              <label className="wide"><span>ADDRESS *</span><input value={form.address} onChange={(e) => change("address", e.target.value)} /></label>
              <label className="wide"><span>NOTE</span><textarea value={form.note} onChange={(e) => change("note", e.target.value)} /></label>
            </div>
          </section>

          <section>
            <div className="manual-order-section-title"><span>SOURCE</span><strong>Order context</strong></div>
            <div className="manual-order-fields">
              <label><span>ORDER SOURCE</span><select value={form.orderSource} onChange={(e) => change("orderSource", e.target.value)}>
                {SOURCES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select></label>
              <label><span>LANGUAGE</span><select value={form.language} onChange={(e) => change("language", e.target.value)}>
                <option value="sr">SR</option><option value="en">EN</option>
              </select></label>
              {form.orderSource === "instagram" ? <label className="wide"><span>INSTAGRAM USERNAME · OPTIONAL</span><input value={form.instagramUsername} onChange={(e) => change("instagramUsername", e.target.value)} placeholder="@username" /></label> : null}
              <label className="wide"><span>FREE GIFT · OPTIONAL</span><input value={form.freeGift} onChange={(e) => change("freeGift", e.target.value)} placeholder="Fragrance · size + extras" /></label>
            </div>
          </section>
        </div>

        <section className="manual-order-items">
          <div className="manual-order-section-title"><span>ORDER</span><strong>Fragrances & sizes</strong></div>
          <div className="manual-item-composer">
            <label className="product manual-product-picker"><span>FRAGRANCE</span>
              <input
                value={productQuery}
                onFocus={() => setProductPickerOpen(true)}
                onChange={(e) => {
                  setProductQuery(e.target.value);
                  setProductPickerOpen(true);
                }}
                placeholder="Search fragrance…"
                autoComplete="off"
              />
              {productPickerOpen ? <div className="manual-product-results">
                {productMatches.length ? productMatches.map((item) => <button
                  type="button"
                  key={item.slug}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setProductSlug(item.slug);
                    setProductQuery(item.name);
                    setProductPickerOpen(false);
                  }}
                >
                  <span>{item.name}</span>
                  <small>{item.category} · {Object.keys(item.sizes || {}).join(" / ")}</small>
                </button>) : <div className="manual-product-no-results">No matching fragrance.</div>}
              </div> : null}
            </label>
            <label><span>SIZE</span><select value={size} onChange={(e) => setSize(e.target.value)}>
              {sizes.map(([label, price]) => <option key={label} value={label}>{label} · {money(price)}</option>)}
            </select></label>
            <label className="qty"><span>QTY</span><input type="number" min="1" max="50" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
            <button type="button" onClick={addItem}>+ Add item</button>
          </div>

          <div className="manual-item-list">
            {items.length ? items.map((item, index) => <div className="manual-item-row" key={item.slug + ":" + item.size}>
              <div><strong>{item.name}</strong><span>{item.size} · {money(item.price)} each</span></div>
              <input type="number" min="1" max="50" value={item.quantity} onChange={(e) => setItemQuantity(index, e.target.value)} />
              <strong>{money(item.price * item.quantity)}</strong>
              <button type="button" onClick={() => removeItem(index)}>Remove</button>
            </div>) : <div className="manual-order-empty">No items added yet.</div>}
          </div>
        </section>

        <div className="manual-order-total">
          <div><span>SUBTOTAL</span><strong>{money(subtotal)}</strong></div>
          <div><span>SHIPPING</span><strong>{shipping ? money(shipping) : "FREE"}</strong></div>
          <div className="grand"><span>TOTAL</span><strong>{money(total)}</strong></div>
        </div>

        <div className="manual-order-foot">
          <div>
            {error ? <span className="manual-order-error">{error}</span> : <span>No automatic customer or admin email is sent for manual orders.</span>}
          </div>
          <div>
            <button type="button" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="primary" disabled={busy || !items.length}>{busy ? "Creating…" : "Create production order"}</button>
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
}
