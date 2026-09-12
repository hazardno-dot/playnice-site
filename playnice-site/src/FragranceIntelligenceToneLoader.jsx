import React, { useEffect, useState } from "react";

export default function FragranceIntelligenceToneLoader() {
  const [Enhancer, setEnhancer] = useState(null);

  useEffect(() => {
    if (Enhancer) return undefined;

    let cancelled = false;

    const loadEnhancer = async () => {
      try {
        const module = await import("./FragranceIntelligenceToneEnhancer");
        if (!cancelled) {
          setEnhancer(() => module.default);
        }
      } catch (error) {
        console.error("Failed to load Fragrance Intelligence tone enhancer:", error);
      }
    };

    const handleClick = (event) => {
      if (!event.target?.closest?.(".playnice-discovery-trigger")) return;
      document.removeEventListener("click", handleClick, true);
      loadEnhancer();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      cancelled = true;
      document.removeEventListener("click", handleClick, true);
    };
  }, [Enhancer]);

  return Enhancer ? <Enhancer /> : null;
}
