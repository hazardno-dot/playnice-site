const PRODUCTION_HOSTS = new Set([
  "playniceshop.me",
  "www.playniceshop.me",
]);

function isProductionHost() {
  return typeof window !== "undefined" && PRODUCTION_HOSTS.has(window.location.hostname);
}

export function trackPageView(path) {
  if (!isProductionHost() || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: document.title,
  });
}

export function trackEvent(name, params = {}) {
  if (!isProductionHost() || !window.gtag) return;
  window.gtag("event", name, params);
}

export function trackMeta(name, params = {}) {
  if (!isProductionHost() || !window.fbq) return;
  window.fbq("track", name, params);
}
