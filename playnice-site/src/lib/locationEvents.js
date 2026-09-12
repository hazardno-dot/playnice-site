const LOCATION_CHANGE_EVENT = "playnice:locationchange";

let initialized = false;
let originalPushState = null;
let originalReplaceState = null;

export const initLocationEvents = () => {
  if (initialized || typeof window === "undefined") return;

  initialized = true;
  originalPushState = window.history.pushState;
  originalReplaceState = window.history.replaceState;

  window.history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
    return result;
  };

  window.history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
    return result;
  };
};

export { LOCATION_CHANGE_EVENT };
