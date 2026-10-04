const PRODUCTION_HOSTS = new Set([
  "playniceshop.me",
  "www.playniceshop.me",
]);

const INTERNAL_ANALYTICS_KEY = "playnice_internal_analytics";

function isProductionHost() {
  return typeof window !== "undefined" && PRODUCTION_HOSTS.has(window.location.hostname);
}

function isInternalAnalyticsUser() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(INTERNAL_ANALYTICS_KEY) === "1";
  } catch (error) {
    return false;
  }
}

export function trackPageView(path) {
  if (!isProductionHost() || isInternalAnalyticsUser() || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: document.title,
  });
}

export function trackEvent(name, params = {}) {
  if (!isProductionHost() || isInternalAnalyticsUser() || !window.gtag) return;
  window.gtag("event", name, params);
}

export function trackMeta(name, params = {}) {
  if (!isProductionHost() || !window.fbq) return;
  window.fbq("track", name, params);
}
