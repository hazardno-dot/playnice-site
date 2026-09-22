import { useLayoutEffect, useRef, useState } from "react";

const countRenderedLines = (element) => {
  const textNode = element.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return 0;

  const range = document.createRange();
  range.selectNodeContents(element);

  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 && rect.height > 0
  );

  range.detach?.();

  const lineTops = [];
  rects.forEach((rect) => {
    if (!lineTops.some((top) => Math.abs(top - rect.top) < 1)) {
      lineTops.push(rect.top);
    }
  });

  return lineTops.length;
};

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

    let disposed = false;
    let lastWidth = title.getBoundingClientRect().width;

    const updateDisplayName = () => {
      if (disposed || !measureRef.current) return;

      const renderedLines = countRenderedLines(measureRef.current);
      const nextName =
        renderedLines > 0 && renderedLines <= 2
          ? fullName
          : fallbackName;

      setDisplayName((current) => (current === nextName ? current : nextName));
    };

    // useLayoutEffect runs before paint, so the initial choice is made without
    // exposing a full-name -> fallback swap to the user.
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
