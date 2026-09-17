let currentActions = null;
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => {
    try {
      listener(currentActions);
    } catch {}
  });
};

export const registerProductActions = (actions) => {
  currentActions = actions || null;
  notify();

  return () => {
    if (currentActions === actions) {
      currentActions = null;
      notify();
    }
  };
};

export const getProductActions = () => currentActions;

export const subscribeProductActions = (listener) => {
  if (typeof listener !== "function") return () => {};

  listeners.add(listener);
  listener(currentActions);

  return () => listeners.delete(listener);
};
