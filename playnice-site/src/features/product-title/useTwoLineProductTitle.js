import { useLayoutEffect, useRef, useState } from "react";

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

    const measureFullName = () => {
      if (disposed) return;

      setDisplayName(fullName);
      window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        if (disposed || !titleRef.current) return;

        const styles = window.getComputedStyle(titleRef.current);
        const lineHeight = Number.parseFloat(styles.lineHeight);
        const maxTwoLineHeight = Number.isFinite(lineHeight)
          ? lineHeight * 2 + 1
          : Number.POSITIVE_INFINITY;

        setDisplayName(
          titleRef.current.scrollHeight > maxTwoLineHeight
            ? fallbackName
            : fullName
        );
      });
    };

    measureFullName();

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver((entries) => {
            const nextWidth = entries[0]?.contentRect?.width ?? 0;
            if (Math.abs(nextWidth - lastWidth) < 0.5) return;
            lastWidth = nextWidth;
            measureFullName();
          })
        : null;

    resizeObserver?.observe(element);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) measureFullName();
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
