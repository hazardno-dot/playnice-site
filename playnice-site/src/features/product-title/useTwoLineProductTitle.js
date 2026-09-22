import { useLayoutEffect, useRef, useState } from "react";

export const useTwoLineProductTitle = (product) => {
  const fullName = product?.name || "";
  const fallbackName = product?.modalName || fullName;
  const [displayName, setDisplayName] = useState(fullName);
  const titleRef = useRef(null);
  const measureRef = useRef(null);

  useLayoutEffect(() => {
    const title = titleRef.current;
    const measure = measureRef.current;
    if (!title || !measure) return undefined;

    let frameId = 0;
    let disposed = false;
    let lastWidth = title.getBoundingClientRect().width;

    const updateDisplayName = () => {
      window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        if (disposed || !measureRef.current) return;

        const probe = measureRef.current;
        const styles = window.getComputedStyle(probe);
        const lineHeight = Number.parseFloat(styles.lineHeight);
        const maxTwoLineHeight = Number.isFinite(lineHeight)
          ? lineHeight * 2 + 1
          : Number.POSITIVE_INFINITY;

        const nextName =
          probe.scrollHeight <= maxTwoLineHeight
            ? fullName
            : fallbackName;

        setDisplayName((current) => (current === nextName ? current : nextName));
      });
    };

    updateDisplayName();

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            const nextWidth = titleRef.current?.getBoundingClientRect().width ?? 0;
            if (Math.abs(nextWidth - lastWidth) < 0.5) return;
            lastWidth = nextWidth;
            updateDisplayName();
          })
        : null;

    resizeObserver?.observe(title);

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

  return {
    displayName,
    fullName,
    titleRef,
    measureRef,
  };
};
