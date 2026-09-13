import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ANNOUNCEMENT_ITEMS } from "@shop/data/announcementConfig.generated.js";
import "./announcement-manager.css";

function AnnouncementPreview({ item, lang }) {
  const text = item.text?.[lang] || item.text?.en || item.text?.sr || "";
  return <div className={`announcement-preview tone-${item.tone || "default"}`}>
    <span className="announcement-preview-icon">{item.icon || "•"}</span>
    <span>{text}</span>
  </div>;
}

export default function AnnouncementManager() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading?.textContent?.trim() !== "Announcement") {
        setSlot(null);
        return;
      }

      let nextSlot = placeholder.querySelector("#announcement-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("announcement-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "announcement-manager-slot";
        nextSlot.className = "announcement-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(
    () => [...ANNOUNCEMENT_ITEMS].sort(
      (a, b) => Number(a.priority || 0) - Number(b.priority || 0)
    ),
    []
  );
  const enabledCount = rows.filter((item) => item.enabled).length;

  if (!slot) return null;

  return createPortal(<section className="announcement-manager">
    <div className="announcement-audit-strip">
      <div>
        <span>EDITORIAL ANNOUNCEMENTS</span>
        <strong>{enabledCount} enabled · {rows.length} total</strong>
      </div>
      <div className="announcement-audit-note">READ ONLY · storefront generated config</div>
    </div>

    <div className="announcement-manager-grid">
      <div className="announcement-list-panel">
        <div className="announcement-section-head">
          <div>
            <span>MANAGED ITEMS</span>
            <h2>Current promo announcements</h2>
          </div>
          <span className="announcement-count">{rows.length}</span>
        </div>

        <div className="announcement-list">
          {rows.map((item) => <article className="announcement-row" key={item.id}>
            <div className="announcement-row-top">
              <div>
                <span className={`announcement-status ${item.enabled ? "enabled" : "disabled"}`}>
                  {item.enabled ? "ENABLED" : "DISABLED"}
                </span>
                <code>{item.id}</code>
              </div>
              <strong>Priority {item.priority ?? 0}</strong>
            </div>
            <div className="announcement-copy-block">
              <span>SR</span>
              <p>{item.text?.sr || "—"}</p>
            </div>
            <div className="announcement-copy-block">
              <span>EN</span>
              <p>{item.text?.en || "—"}</p>
            </div>
            <div className="announcement-meta-row">
              <span>Icon <strong>{item.icon || "—"}</strong></span>
              <span>Tone <strong>{item.tone || "default"}</strong></span>
              <span>Action <strong>{item.action || "none"}</strong></span>
              {item.slug ? <span>Slug <strong>{item.slug}</strong></span> : null}
            </div>
          </article>)}
          {!rows.length ? <div className="announcement-empty">No editorial announcements in generated config.</div> : null}
        </div>
      </div>

      <aside className="announcement-preview-panel">
        <div className="announcement-section-head">
          <div>
            <span>LIVE COPY PREVIEW</span>
            <h2>Storefront text</h2>
          </div>
        </div>
        <div className="announcement-preview-group">
          <span>SR</span>
          {rows.filter((item) => item.enabled).map((item) => <AnnouncementPreview key={`sr-${item.id}`} item={item} lang="sr" />)}
        </div>
        <div className="announcement-preview-group">
          <span>EN</span>
          {rows.filter((item) => item.enabled).map((item) => <AnnouncementPreview key={`en-${item.id}`} item={item} lang="en" />)}
        </div>
        <div className="announcement-scope-note">
          <strong>V1 SCOPE</strong>
          <p>Only editorial/promo items are managed here. Automatic New Products, Latest Journal, Forever sponsored content and cart/shipping system messages stay outside this module.</p>
        </div>
      </aside>
    </div>
  </section>, slot);
}
