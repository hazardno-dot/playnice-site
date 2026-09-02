export function trackPageView(path) {
  if (!window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: document.title,
  });
}

export function trackEvent(name, params = {}) {
  if (!window.gtag) return;
  window.gtag("event", name, params);
}

export function trackMeta(name, params = {}) {
  if (!window.fbq) return;
  window.fbq("track", name, params);
}