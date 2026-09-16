import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MetaConnectionPanel from "./MetaConnectionPanel";

export default function MetaConnectionBridge() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const sync = () => {
      if (cancelled) return;
      const socialRoot = document.querySelector("#social-manager-slot .social-manager");
      if (!socialRoot) {
        setSlot(null);
        return;
      }
      let next = socialRoot.querySelector("#meta-connection-slot");
      if (!next) {
        next = document.createElement("div");
        next.id = "meta-connection-slot";
        const banner = socialRoot.querySelector(".social-banner");
        if (banner?.nextSibling) socialRoot.insertBefore(next, banner.nextSibling);
        else socialRoot.appendChild(next);
      }
      setSlot(next);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelled = true;
      observer.disconnect();
      setSlot(null);
    };
  }, []);

  return slot ? createPortal(<MetaConnectionPanel />, slot) : null;
}
