import React, { Suspense } from "react";

const TheNoteMapImpl = React.lazy(() => import("./TheNoteMapImpl"));

export default function TheNoteMap(props) {
  return (
    <Suspense fallback={null}>
      <TheNoteMapImpl {...props} />
    </Suspense>
  );
}
