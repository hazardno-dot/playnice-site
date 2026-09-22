import { useLayoutEffect, useRef, useState } from "react";

const fitsInTwoLines = (element, text) => {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  if (!width) return true;

  const styles = window.getComputedStyle(element);
  const probe = element.cloneNode(false);

  probe.textContent = text;
  probe.removeAttribute("id");
  probe.setAttribute("aria-hidden", "true");

  Object.assign(probe.style, {
    position: "fixed",
    left: "-99999px",
    top: "0",
    width: `${width}px`,
    maxWidth: "none",
    height: "auto",
    maxHeight: "none",
    minHeight: "0",
    overflow: "visible",
    visibility: "hidden",
    pointerEvents: "none",
    display: "block",
    WebkitLineClamp: "unset",
    WebkitBoxOrient: "unset",
  });

  document.body.appendChild(probe);

  const probeStyles = window.getComputedStyle(probe);
  const lineHeight = Number.parseFloat(probeStyles.lineHeight || styles.lineHeight);
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
