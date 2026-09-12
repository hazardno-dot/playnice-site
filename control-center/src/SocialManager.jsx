import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import { generateSocialDraft } from "./socialDraft.mjs";
import "./social-manager.css";

const FILTERS = ["all", "draft", "ready", "scheduled", "published", "failed"];
const CHANNELS = [["instagram_feed", "Instagram Feed"], ["instagram_story", "Instagram Story"], ["facebook", "Facebook"]];
const fmt = (value) => value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const label = (value) => String(value || "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const mediaSrc = (media) => media?.url || media?.src || "";

function SocialWorkspace() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("social_events").select("*").order("created_at", { ascending: false }).limit(100);
    if (loadError) setError(loadError.message); else { setError(""); setEvents(data || []); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase.channel("social-events-manager").on("postgres_changes", { event: "*", schema: "public", table: "social_events" }, load).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const counts = useMemo(() => events.reduce((out, event) => ({ ...out, [event.status]: (out[event.status] || 0) + 1 }), {}), [events]);
  const visible = useMemo(() => filter === "all" ? events : events.filter((event) => event.status === filter), [events, filter]);
  const selected = visible.find((event) => event.id === selectedId) || visible[0] || null;
  const draft = useMemo(() => {
    if (!selected) return null;
    try { return generateSocialDraft(selected); } catch { return null; }
  }, [selected]);

  useEffect(() => {
    if (visible.length && !visible.some((event) => event.id === selectedId)) setSelectedId(visible[0].id);
  }, [visible, selectedId]);

  return <section className="social-manager">
    <div className="social-banner">
      <div><span>SOCIAL PUBLISHER V1</span><h2>Shadow-mode publishing infrastructure</h2><p>Production content can create social drafts here, but Meta publishing is intentionally locked until connection and approval work is completed.</p></div>
      <strong>NO META PUBLISH</strong>
    </div>

    <div className="social-kpis">
      <div><span>TOTAL</span><strong>{events.length}</strong><small>social events</small></div>
      <div><span>DRAFT</span><strong>{counts.draft || 0}</strong><small>awaiting review</small></div>
      <div><span>READY</span><strong>{counts.ready || 0}</strong><small>future publish queue</small></div>
      <div><span>PUBLISHED</span><strong>{counts.published || 0}</strong><small>future Meta history</small></div>
    </div>

    {error ? <div className="social-error">Social schema is not active in Supabase yet: {error}</div> : null}

    <div className="social-filter-bar">{FILTERS.map((value) => <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label(value)}{value !== "all" ? ` ${counts[value] || 0}` : ""}</button>)}</div>

    <div className="social-layout">
      <aside className="social-list">
        <div className="social-list-head"><span>EVENT QUEUE</span><strong>{loading ? "…" : visible.length}</strong></div>
        {visible.length ? visible.map((event) => <button type="button" key={event.id} className={selected?.id === event.id ? "active" : ""} onClick={() => setSelectedId(event.id)}>
          <div><strong>{event.payload?.shortName || event.payload?.name || event.payload?.title?.sr || event.source_id}</strong><span>{label(event.source_type)} · {label(event.event_type)}</span></div>
          <em className={event.status}>{event.status}</em>
        </button>) : <div className="social-empty">{loading ? "Loading social events…" : "No social events in this view."}</div>}
      </aside>

      <article className="social-detail">
        {selected && draft ? <>
          <div className="social-detail-head"><div><span>{label(selected.source_type)} / {label(selected.event_type)}</span><h3>{draft.headline}</h3><p>{selected.source_url || selected.source_id}</p></div><div><strong>{selected.status}</strong><small>{fmt(selected.created_at)}</small></div></div>
          <div className="social-channel-grid">
            {CHANNELS.map(([key, title]) => {
              const media = draft[key]?.media || null;
              const src = mediaSrc(media);
              const fallback = media?.selection === "fallback";
              return <section key={key} className={`social-channel-card ${key === "instagram_story" ? "story" : ""}`}>
                <div className="social-channel-head"><span>{title}</span><em>PREVIEW</em></div>
                <div className="social-media-frame">
                  {src ? <img src={src} alt="" /> : <div className="social-media-placeholder">No channel asset selected</div>}
                  {media ? <div className={`social-media-meta ${fallback ? "fallback" : ""}`}><span>{media.format || "asset"}</span><strong>{fallback ? "FALLBACK" : "SELECTED"}</strong></div> : null}
                </div>
                <pre>{draft[key]?.caption || "No caption generated."}</pre>
              </section>;
            })}
          </div>
          <div className="social-safety-row"><div><span>PUBLISH MODE</span><strong>{selected.publish_mode || "shadow"}</strong></div><div><span>CHANNELS</span><strong>{(selected.channels || []).length}</strong></div><button type="button" disabled title="Meta publishing is intentionally disabled in Social Publisher v1">Publish locked</button></div>
        </> : <div className="social-empty-detail"><strong>Social Publisher is ready for shadow events.</strong><span>No event selected.</span></div>}
      </article>
    </div>
  </section>;
}

export default function SocialManager() {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar nav");
    const mainStage = document.querySelector(".main-stage");
    if (!sidebar || !mainStage) return;
    const manageGroup = [...sidebar.querySelectorAll(".nav-group")].find((group) => group.querySelector(".nav-label")?.textContent?.trim() === "MANAGE");
    if (!manageGroup) return;

    let button = manageGroup.querySelector("[data-social-manager-nav='true']");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.socialManagerNav = "true";
      button.title = "Social";
      button.innerHTML = '<span class="nav-icon" aria-hidden="true">S</span><span class="nav-dot"></span><span class="nav-text">Social</span>';
      const notesButton = [...manageGroup.querySelectorAll("button")].find((item) => item.textContent?.trim() === "Notes");
      manageGroup.insertBefore(button, notesButton || null);
    }

    const close = () => setOpen(false);
    const show = (event) => { event.preventDefault(); event.stopPropagation(); setOpen(true); };
    button.addEventListener("click", show);
    [...sidebar.querySelectorAll("button")].filter((item) => item !== button).forEach((item) => item.addEventListener("click", close));
    return () => {
      button.removeEventListener("click", show);
      [...sidebar.querySelectorAll("button")].filter((item) => item !== button).forEach((item) => item.removeEventListener("click", close));
    };
  }, []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    const heading = mainStage?.querySelector(".topbar h1");
    const eyebrow = mainStage?.querySelector(".topbar .eyebrow");
    const description = mainStage?.querySelector(".topbar p");
    const navButtons = [...document.querySelectorAll(".sidebar nav button")];
    const button = navButtons.find((item) => item.dataset.socialManagerNav === "true");
    if (!mainStage || !heading || !button) return;

    let nextSlot = mainStage.querySelector("#social-manager-slot");
    if (!nextSlot) {
      nextSlot = document.createElement("div");
      nextSlot.id = "social-manager-slot";
      mainStage.appendChild(nextSlot);
    }
    const topbar = mainStage.querySelector(".topbar");
    const baseChildren = [...mainStage.children].filter((child) => child !== topbar && child !== nextSlot);

    if (open) {
      navButtons.forEach((item) => item.classList.toggle("active", item === button));
      heading.textContent = "Social";
      if (eyebrow) eyebrow.textContent = "MANAGE / SOCIAL PUBLISHER";
      if (description) description.textContent = "Shadow-mode queue for Instagram and Facebook content generated from live PlayNice publishing events.";
      baseChildren.forEach((child) => {
        if (child.dataset.socialPreviousDisplay === undefined) child.dataset.socialPreviousDisplay = child.style.display || "";
        child.style.display = "none";
      });
      nextSlot.style.display = "block";
      setSlot(nextSlot);
    } else {
      nextSlot.style.display = "none";
      baseChildren.forEach((child) => {
        if (child.dataset.socialPreviousDisplay !== undefined) {
          child.style.display = child.dataset.socialPreviousDisplay;
          delete child.dataset.socialPreviousDisplay;
        }
      });
      setSlot(null);
    }
  }, [open]);

  return slot ? createPortal(<SocialWorkspace />, slot) : null;
}
