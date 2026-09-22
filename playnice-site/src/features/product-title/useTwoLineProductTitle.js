import { useLayoutEffect, useRef, useState } from "react";

const COMPACT_CONCENTRATIONS = [
  [/Extrait de Parfum/gi, "Extrait"],
  [/Eau de Parfum/gi, "EDP"],
  [/Eau de Toilette/gi, "EDT"],
  [/Eau de Cologne/gi, "EDC"],
];

const compactConcentration = (value = "") =>
  COMPACT_CONCENTRATIONS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    String(value)
  );

export const getProductTitleCandidates = (product) => {
  const fullName = String(product?.name || "").trim();
  const modalName = String(product?.modalName || "").trim();
  const compactName = compactConcentration(fullName);
  const shortName = String(product?.shortName || "").trim();

  return [fullName, modalName, compactName, shortName].filter(
    (candidate, index, candidates) =>
      candidate && candidates.indexOf(candidate) === index
  );
};

const countRenderedLines = (element) => {
  const range = document.createRange();
  range.selectNodeContents(element);

  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 && rect.height > 0
  );

  const lineTops = [];

  rects.forEach((rect) => {
    if (!lineTops.some((top) => Math.abs(top - rect.top) < 1)) {
      lineTops.push(rect.top);
    }
  });

  return lineTops.length;
};

export const useTwoLineProductTitle = (product) => {
  const candidates = getProductTitleCandidates(product);
  const fullName = candidates[0] || "";
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

      const probe = measureRef.current;
      let nextName = candidates[candidates.length - 1] || fullName;

      for (const candidate of candidates) {
        probe.textContent = candidate;

        const renderedLines = countRenderedLines(probe);
        if (renderedLines > 0 && renderedLines <= 2) {
          nextName = candidate;
          break;
        }
      }

      probe.textContent = fullName;
      setDisplayName((current) => (current === nextName ? current : nextName));
    };

    // useLayoutEffect resolves the initial title before paint.
    updateDisplayName();

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            const nextWidth =
              titleRef.current?.getBoundingClientRect().width ?? 0;

            if (Math.abs(nextWidth - lastWidth) < 0.5) return;

            lastWidth = nextWidth;
            updateDisplayName();
          })
        : null;

    if (resizeObserver) {
      resizeObserver.observe(title);
    } else {
      window.addEventListener("resize", updateDisplayName);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) updateDisplayName();
      });
    }

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateDisplayName);
    };
  }, [candidates, fullName]);

  return {
    displayName,
    fullName,
    titleRef,
    measureRef,
  };
};
