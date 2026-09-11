import React, { Suspense } from "react";

const MobileShopV2Impl = React.lazy(() => import("./MobileShopV2Chunk"));

export default function MobileShopV2(props) {
  return (
    <Suspense fallback={null}>
      <MobileShopV2Impl {...props} />
    </Suspense>
  );
}
