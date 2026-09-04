import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import "./discovery-bulk-paste.css";

const normalizeKey = (value) => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
const normalizeLabel = (value) => normalizeKey(String(value || "").replace(/\s+/g, " "));
const PRODUCT_SLUGS = new Set(products.map((product) => product.slug));

function selectedSlug(root) {
  const slugNode = root?.querySelector(".product-detail.edit-mode .slug");
  return String(slugNode?.textContent || "").split(" · ")[0].trim();
}

function setReactInputValue(input, value) {
  const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
  descriptor?.set?.call(input, String(value));
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function parseBlock(source) {
  const values = {};
  const invalid = [];
  const trimmed = source.trim();
  if (!trimmed) return { values, invalid: ["empty input"] };

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      Object.entries(parsed).forEach(([key, raw]) => {
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 0 || value > 10) invalid.push(key);
        else values[normalizeKey(key)] = value;
      });
      return { values, invalid };
    } catch {
      return { values: {}, invalid: ["invalid JSON"] };
    }
  }

  trimmed.split(/\r?\n/).forEach((line) => {
    const clean = line.trim();
    if (!clean) return;
    const match = clean.match(/^([^:=]+)\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*,?$/);
    if (!match) { invalid.push(clean); return; }
    const value = Number(match[2]);
    if (!Number.isFinite(value) || value < 0 || value > 10) invalid.push(match[1].trim());
    else values[normalizeKey(match[1])] = value;
  });
  return { values, invalid };
}

export default function DiscoveryBulkPasteBridge() {
  const [slot, setSlot] = useState(null);
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const root = document.querySelector(".main-stage");
    if (!root) return;

    const sync = () => {
      const editor = root.querySelector(".product-detail.edit-mode");
      const grid = editor?.querySelector(".discovery-edit-grid");
      const slug = selectedSlug(root);
      const isNewProduct = Boolean(slug && !PRODUCT_SLUGS.has(slug));
      if (!grid || isNewProduct) { setSlot(null); return; }
      let host = grid.parentElement?.querySelector(":scope > #discovery-bulk-paste-slot");
      if (!host && grid.parentElement) {
        host = document.createElement("div");
        host.id = "discovery-bulk-paste-slot";
        grid.parentElement.insertBefore(host, grid);
      }
      setSlot(host || null);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const apply = () => {
    const grid = document.querySelector(".product-detail.edit-mode .discovery-edit-grid");
    if (!grid) { setMessage("Discovery fields are not available."); return; }

    const fields = Array.from(grid.querySelectorAll(".edit-field"));
    const inputs = new Map();
    fields.forEach((field) => {
      const label = field.querySelector("span")?.textContent;
      const input = field.querySelector("input");
      if (label && input) inputs.set(normalizeLabel(label), input);
    });

    const { values, invalid } = parseBlock(source);
    const unknown = [];
    let applied = 0;
    Object.entries(values).forEach(([key, value]) => {
      const input = inputs.get(key);
      if (!input) { unknown.push(key); return; }
      setReactInputValue(input, value);
      applied += 1;
    });

    const parts = [`${applied} values applied`];
    if (unknown.length) parts.push(`${unknown.length} unknown`);
    if (invalid.length) parts.push(`${invalid.length} invalid`);
    setMessage(`${parts.join(" · ")}. Review the fields below, then Save Draft.`);
  };

  if (!slot) return null;
  return createPortal(
    <div className="discovery-bulk-paste">
      <div className="discovery-bulk-paste-head">
        <div>
          <strong>Advanced · Scent profile only</strong>
          <span>Use only when editing Discovery values on an existing product.</span>
        </div>
        <button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "Collapse" : "Open"}</button>
      </div>
      {expanded ? <>
        <textarea
          value={source}
          onChange={(event) => { setSource(event.target.value); setMessage(""); }}
          placeholder={"date: 5.0\ncasual: 9.3\ncitrus: 9.3\noffice: 9.0\n..."}
        />
        <div className="discovery-bulk-paste-head">
          <span>Paste all Discovery values at once · key: value or JSON</span>
          <button type="button" onClick={apply}>Apply values</button>
        </div>
        {message ? <div className="discovery-bulk-paste-message">{message}</div> : null}
      </> : null}
    </div>,
    slot
  );
}
