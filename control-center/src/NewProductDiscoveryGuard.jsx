import React, { useEffect } from "react";
import { products } from "@shop/data/products/index.js";

const LIVE_SLUGS = new Set(products.map((product) => product.slug));

function selectedSlug(root) {
  const slugNode = root?.querySelector(".slug");
  return String(slugNode?.textContent || "").split(" · ")[0].trim();
}

function setNativeInputValue(input, value) {
  const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
  descriptor?.set?.call(input, String(value ?? ""));
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function isAllZero(values) {
  return values.length > 0 && values.every((value) => {
    const text = String(value ?? "").trim();
    return text !== "" && Number.isFinite(Number(text)) && Number(text) === 0;
  });
}

function normalizeNewProductEditor() {
  const editor = document.querySelector(".product-detail.edit-mode");
  if (!editor || editor.dataset.discoveryGuardApplied === "true") return;
  const slug = selectedSlug(editor);
  if (!slug || LIVE_SLUGS.has(slug)) return;

  const inputs = Array.from(editor.querySelectorAll(".discovery-edit-grid input[type='number']"));
  if (!inputs.length || !isAllZero(inputs.map((input) => input.value))) return;

  editor.dataset.discoveryGuardApplied = "true";
  inputs.forEach((input) => setNativeInputValue(input, ""));
}

function patchLegacyReadOnlyCoverage() {
  const detail = document.querySelector(".product-detail:not(.edit-mode)");
  if (!detail) return;
  const slug = selectedSlug(detail);
  if (!slug || LIVE_SLUGS.has(slug)) return;

  const metrics = Array.from(detail.querySelectorAll(".discovery-metric"));
  const values = metrics.map((metric) => metric.querySelector("strong")?.textContent ?? "");
  const legacyAllZero = metrics.length > 0 && isAllZero(values);
  if (!legacyAllZero) return;

  const discoveryChip = Array.from(detail.querySelectorAll(".coverage-checks > span"))
    .find((node) => String(node.textContent || "").includes("Discovery"));
  if (discoveryChip && !discoveryChip.classList.contains("missing")) {
    discoveryChip.classList.remove("ok");
    discoveryChip.classList.add("missing");
    discoveryChip.textContent = "! Discovery";

    const totalNode = detail.querySelector(".coverage-panel > div:first-child > strong");
    const match = String(totalNode?.textContent || "").match(/^(\d+)\/(\d+) layers$/);
    if (match && totalNode) totalNode.textContent = `${Math.max(0, Number(match[1]) - 1)}/${match[2]} layers`;

    const status = detail.querySelector(".coverage-status");
    if (status) {
      status.classList.remove("complete");
      status.classList.add("incomplete");
      status.textContent = "CHECK DATA";
    }
  }

  metrics.forEach((metric) => {
    const value = metric.querySelector("strong");
    if (value) value.textContent = "—";
    const meter = metric.querySelector(".meter > span");
    if (meter) meter.style.width = "0%";
  });
}

export default function NewProductDiscoveryGuard() {
  useEffect(() => {
    let frame = 0;
    const run = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        normalizeNewProductEditor();
        patchLegacyReadOnlyCoverage();
      });
    };

    run();
    const root = document.querySelector(".main-stage") || document.body;
    const observer = new MutationObserver(run);
    observer.observe(root, { childList: true, subtree: true });
    document.addEventListener("input", run, true);
    document.addEventListener("change", run, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("input", run, true);
      document.removeEventListener("change", run, true);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
