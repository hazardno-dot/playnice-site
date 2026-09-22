import { useLayoutEffect, useRef, useState } from "react";

const fitsInTwoLines = (element, text) => {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const parent = element.parentElement;

  if (!width || !parent) return true;

  // Keep the probe inside the real title container so parent-scoped CSS
  // (PDP, mobile PDP and Quick View typography) is applied exactly as it is
  // to the visible heading. The probe is absolutely positioned and hidden,
  // so it never participates in layout.
  const probe = element.cloneNode(false);

  probe.textContent = text;
  probe.removeAttribute("id");
  probe.setAttribute("aria-hidden", "true");

  Object.assign(probe.style, {
    position: "absolute",
    inset: "0 auto auto 0",
    width: `${width}px`,
    maxWidth: "none",
    height: "auto",
    maxHeight: "none",
    minHeight: "0",
    margin: "0",
    overflow: "visible",
    visibility: "hidden",
    pointerEvents: "none",
    display: "block",
    WebkitLineClamp: "unset",
    WebkitBoxOrient: "unset",
  });

  parent.appendChild(probe);

  const styles = window.getComputedStyle(probe);
  const lineHeight = Number.parseFloat(styles.lineHeight);
  const maxTwoLineHeight = Number.isFinite(lineHeight)
    ? lineHeight * 2 + 1
    : Number.POSITIVE_INFINITY;
  const fits = probe.scrollHeight <= maxTwoLineHeight;

  probe.remove();
  return fits;
};

export const useTwoLineProductTitle = (product) => {
  const fullName = product?.name || "";
  const fallbackName = product?.modalName || fullName;
  const [displayName, setDisplayName] = useState(fullName);
  const titleRef = useRef(null);

  useLayoutEffect(() => {
    const element = titleRef.current;
    if (!element) return undefined;

    let frameId = 0;
    let disposed = false;
    let lastWidth = element.getBoundingClientRect().width;

    const updateDisplayName = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (disposed || !titleRef.current) return;

        const nextName = fitsInTwoLines(titleRef.current, fullName)
          ? fullName
          : fallbackName;

        setDisplayName((current) => (current === nextName ? current : nextName));
      });
    };

    updateDisplayName();

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver((entries) => {
            const nextWidth = entries[0]?.contentRect?.width ?? 0;
            if (Math.abs(nextWidth - lastWidth) < 0.5) return;
            lastWidth = nextWidth;
            updateDisplayName();
          })
        : null;

    resizeObserver?.observe(element);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) updateDisplayName();
      });
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, [fullName, fallbackName]);

  return { displayName, titleRef };
};
