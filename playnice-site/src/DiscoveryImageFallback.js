import { useEffect } from "react";

const THUMB_SEGMENT = "/products/thumbs/";
const PRODUCT_SEGMENT = "/products/";

export default function DiscoveryImageFallback() {
  useEffect(() => {
    const handleImageError = (event) => {
      const image = event.target;

      if (!(image instanceof HTMLImageElement)) return;
      if (!image.closest(".playnice-discovery-image")) return;

      const currentSrc = image.getAttribute("src") || "";

      if (!currentSrc.includes(THUMB_SEGMENT)) return;
      if (image.dataset.discoveryFallbackApplied === "true") return;

      image.dataset.discoveryFallbackApplied = "true";
      image.src = currentSrc.replace(THUMB_SEGMENT, PRODUCT_SEGMENT);
    };

    window.addEventListener("error", handleImageError, true);

    return () => {
      window.removeEventListener("error", handleImageError, true);
    };
  }, []);

  return null;
}
