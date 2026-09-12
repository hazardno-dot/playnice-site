import React, { Suspense } from "react";

let mobileShopChunkPromise = null;

const loadMobileShopChunk = () => {
  if (!mobileShopChunkPromise) {
    mobileShopChunkPromise = import("./MobileShopV2Chunk");
  }

  return mobileShopChunkPromise;
};

const MobileShopV2Impl = React.lazy(loadMobileShopChunk);

const scheduleMobileShopPreload = () => {
  const preload = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => {
        loadMobileShopChunk();
      }, { timeout: 1600 });
      return;
    }

    window.setTimeout(() => {
      loadMobileShopChunk();
    }, 250);
  };

  if (document.readyState === "complete") {
    preload();
    return;
  }

  window.addEventListener("load", preload, { once: true });
};

if (typeof window !== "undefined" && typeof document !== "undefined") {
  scheduleMobileShopPreload();
}

export default function MobileShopV2(props) {
  return (
    <Suspense fallback={null}>
      <MobileShopV2Impl {...props} />
    </Suspense>
  );
}
