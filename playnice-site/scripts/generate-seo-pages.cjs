#!/usr/bin/env node
/**
 * Builds discoverable, static HTML entrypoints for PDP routes from the
 * canonical product catalog. React replaces the fallback <main> at runtime.
 * No browser, paid service or external network access is required.
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const HOST = "https://www.playniceshop.me";
const source = fs.readFileSync(path.join(ROOT, "src/data/products/index.js"), "utf8");
const catalogSource = source.replace(/export\s+const\s+/g, "const ") + "\n;globalThis.__catalog = products;";
const sandbox = {};
vm.runInNewContext(catalogSource, sandbox, { timeout: 5000, filename: "products/index.js" });
const products = Array.from(sandbox.__catalog || []);
if (!products.length) throw new Error("SEO build: empty product catalog");

const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;")
  .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");
const xml = escapeHtml;
const slugs = new Set();
const htmlBase = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");
const headMeta = (name, content, property = false) =>
  `<meta ${property ? "property" : "name"}="${name}" content="${escapeHtml(content)}"/>`;

function cleanBase(html) {
  const names = ["description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image"];
  const properties = ["og:type", "og:locale", "og:url", "og:title", "og:description", "og:image"];
  for (const name of names) {
    html = html.replace(new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "gi"), "");
  }
  for (const name of properties) {
    html = html.replace(new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${name}["'])[^>]*>`, "gi"), "");
  }
  return html.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, "");
}
const cleanTemplate = cleanBase(htmlBase);
for (const product of products) {
  const slug = String(product.slug || "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slugs.has(slug)) {
    throw new Error(`SEO build: invalid or duplicate slug: ${slug}`);
  }
  slugs.add(slug);
  const name = String(product.name || "").replace(/\s+NEW\s*$/i, "").trim();
  if (!name || !product.image) throw new Error(`SEO build: missing product fields: ${slug}`);
  const url = `${HOST}/product/${slug}`;
  const image = product.image.startsWith("http") ? product.image : `${HOST}${product.image}`;
  const sizes = Object.entries(product.sizes || {}).filter(([, price]) => Number(price) > 0);
  if (!sizes.length) throw new Error(`SEO build: no prices for ${slug}`);
  const sizeText = sizes.map(([size]) => size).join(", ");
  const description = `${name} — originalni parfem u PlayNice dekantima (${sizeText}). Isprobajte prije kupovine cijele bočice. Dostava širom Crne Gore.`;
  const title = `${name} | Dekanti parfema | PlayNice`;
  const offers = sizes.map(([size, price]) => ({
    "@type": "Offer", url, name: `${name} ${size} decant`, priceCurrency: "EUR",
    price: String(product.discount?.size === size
      ? Number((Number(price) * (1 - Number(product.discount.percent) / 100)).toFixed(2))
      : price),
    itemCondition: "https://schema.org/NewCondition"
  }));
  const ld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product", name, url,
    image: [image], description, sku: String(product.id || slug), offers
  }).replace(/</g, "\\u003c");
  const head = [
    headMeta("description", description), headMeta("robots", "index, follow"),
    `<link rel="canonical" href="${escapeHtml(url)}"/>`,
    headMeta("og:type", "product", true), headMeta("og:locale", "sr_ME", true),
    headMeta("og:url", url, true), headMeta("og:title", title, true),
    headMeta("og:description", description, true), headMeta("og:image", image, true),
    headMeta("twitter:card", "summary_large_image"),
    headMeta("twitter:title", title), headMeta("twitter:description", description),
    headMeta("twitter:image", image),
    `<script id="playnice-product-schema" type="application/ld+json">${ld}</script>`
  ].join("\n");
  const notes = ["top", "heart", "base"].map(level => {
    const items = product.noteMap?.[level] || [];
    return items.length ? `<p>${escapeHtml(level)}: ${escapeHtml(items.join(", "))}</p>` : "";
  }).join("");
  // Rendered immediately in server response; CRA replaces it once React mounts.
  const fallback = `<main lang="sr"><h1>${escapeHtml(name)}</h1><p>${escapeHtml(description)}</p><img src="${escapeHtml(image)}" alt="${escapeHtml(name)}"/><p>Veličine: ${escapeHtml(sizeText)}</p>${notes}<a href="/shop">Pogledajte sve parfeme</a></main>`;
  const html = cleanTemplate.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace("</head>", `${head}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  const outDir = path.join(BUILD, "product");
  fs.mkdirSync(outDir, { recursive: true });
  const canonicalMatches = html.match(/<link\b[^>]*rel="canonical"[^>]*>/gi) || [];
  const schemaMatches = html.match(/<script\b[^>]*id="playnice-product-schema"[^>]*>/gi) || [];
  if (canonicalMatches.length !== 1 || !canonicalMatches[0].includes(escapeHtml(url)) ||
      schemaMatches.length !== 1 || !html.includes(`<h1>${escapeHtml(name)}</h1>`)) {
    throw new Error(`SEO build: invalid HTML contract for ${slug}`);
  }
  fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
}
const urls = ["/", "/shop", "/journal", ...products.map(p => `/product/${p.slug}`)];
const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(p => `  <url><loc>${xml(HOST + p)}</loc></url>`), '</urlset>', ''].join("\n");
fs.writeFileSync(path.join(BUILD, "sitemap.xml"), sitemap);
console.log(`SEO Foundation: generated ${products.length} product HTML pages and ${urls.length} sitemap URLs`);
