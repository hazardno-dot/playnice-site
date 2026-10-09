import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { generateSocialDraft, validateSocialDraftMedia } from "./socialDraft.mjs";
import "./social-manager.css";

const FILTERS = ["all", "draft", "ready", "published", "failed", "archived"];
const CHANNELS = [["instagram_feed", "Instagram Feed"], ["instagram_story", "Instagram Story"], ["facebook", "Facebook"]];
const PUBLIC_ORIGIN = "https://www.playniceshop.me";
const AUDIT_LABELS = {
  draft_saved: "Draft saved",
  draft_marked_ready: "Marked ready",
  draft_reopened: "Returned to draft",
  draft_scheduled: "Scheduled",
  draft_unscheduled: "Unscheduled",
  draft_discarded: "Draft discarded",
  shadow_replay_created_from_product: "Product replay created",
  manual_product_post_created: "Product post created",
  manual_hero_post_created: "Hero post created",
  manual_journal_post_created: "Journal post created",
  manual_custom_post_created: "Blank Social draft created",
  social_history_corrected_published: "Published history corrected",
  shadow_replay_created_from_hero: "Hero replay created",
  shadow_replay_created_from_journal: "Journal replay created",
  shadow_event_created_from_product_publish: "Created from product publish",
  shadow_event_created_from_hero_publish: "Created from Hero publish",
  shadow_event_created_from_journal_publish: "Created from Journal publish",
  published_instagram_feed_deleted: "Instagram Feed deleted",
  published_instagram_story_deleted: "Instagram Story deleted",
  published_facebook_deleted: "Facebook post deleted",
  published_channel_republish_draft_created: "Channel republish draft created",
  channel_republish_draft_created: "Republish draft created",
};
const fmt = (value) => value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const label = (value) => String(value || "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const mediaSrc = (media) => media?.url || media?.src || "";
const eventTitle = (event) => event?.payload?.core?.shortName || event?.payload?.core?.name || event?.payload?.shortName || event?.payload?.name || event?.payload?.title?.sr || event?.payload?.alt || event?.source_id;
const isExplicitTestEvent = (event) => Boolean(event?.metadata?.test || event?.metadata?.replay || String(event?.source_id || "").includes("--shadow-test-") || String(event?.source_id || "").includes("--shadow-replay-"));
const PUBLISH_AUDIT_ACTIONS = {
  instagram_feed: "test_instagram_feed_published",
  instagram_story: "test_instagram_story_published",
  facebook: "test_facebook_published",
};
const DELETE_AUDIT_ACTIONS = {
  instagram_feed: "published_instagram_feed_deleted",
  instagram_story: "published_instagram_story_deleted",
  facebook: "published_facebook_deleted",
};
const publicSourceUrl = (value) => {
  if (!value) return "";
  try { return new URL(String(value), PUBLIC_ORIGIN).toString(); } catch { return ""; }
};
const auditDescription = (entry) => {
  const details = entry?.details && typeof entry.details === "object" ? entry.details : {};
  if (entry?.action === "draft_scheduled" && details.scheduled_for) return `For ${fmt(details.scheduled_for)}`;
  if (entry?.action === "draft_unscheduled") return "Returned to approved READY queue";
  if (entry?.action === "draft_marked_ready") {
    const fallback = details?.media_validation?.fallback_channels;
    if (Array.isArray(fallback) && fallback.length) return `${fallback.length} fallback channel(s); public media verified`;
    if (details?.media_validation?.public_media_verified) return "Public media verified";
  }
  if (details.previous_status || details.next_status) return `${String(details.previous_status || "—").toUpperCase()} → ${String(details.next_status || "—").toUpperCase()}`;
  if (details.canonical_source_id) return `Source ${details.canonical_source_id}`;
  if (details.apply_pr_number) return `PR #${details.apply_pr_number}`;
  if (details.journal_article_id) return `Journal #${details.journal_article_id}`;
  if (details.hero_id) return `Hero ${details.hero_id}`;
  return "Social Publisher audit event";
};

function editableContent(event, generated) {
  const stored = event?.draft_content || event?.approved_content || null;
  const source = stored || generated || {};
  return CHANNELS.reduce((out, [key]) => {
    out[key] = { caption: String(source?.[key]?.caption || "") };
    return out;
  }, {});
}

function SocialWorkspace() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState({});
  const [copiedKey, setCopiedKey] = useState("");
  const [auditRows, setAuditRows] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedDryRun, setFeedDryRun] = useState(null);
  const [feedDryRunLoading, setFeedDryRunLoading] = useState(false);
  const [feedDryRunError, setFeedDryRunError] = useState("");
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [sourcePicker, setSourcePicker] = useState({ open: false, type: "", items: [], query: "", loading: false });
  const [publishedAction, setPublishedAction] = useState("");
  const [publishedMessage, setPublishedMessage] = useState("");
  const [campaignSuccess, setCampaignSuccess] = useState("");
  const [publishedError, setPublishedError] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("social_events").select("*").order("created_at", { ascending: false }).limit(100);
    if (loadError) setError(loadError.message); else { setError(""); setEvents(data || []); }
    setLoading(false);
  };

  const reconcilePublished = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) return;
      const response = await fetch("/api/social-reconcile-published", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && Number(payload.reconciled || 0) > 0) await load();
    } catch {
      // Reconciliation is best-effort; normal Social loading must remain available.
    }
  };

  const loadAudit = async (eventId) => {
    if (!eventId) { setAuditRows([]); setAuditError(""); return; }
    setAuditLoading(true);
    const { data, error: loadError } = await supabase
      .from("social_audit_log")
      .select("id,action,details,created_at")
      .eq("social_event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (loadError) { setAuditRows([]); setAuditError(loadError.message); }
    else { setAuditRows(data || []); setAuditError(""); }
    setAuditLoading(false);
  };

  useEffect(() => {
    load();
    reconcilePublished();
    const handleSocialMediaUpdated = () => {
      setFeedDryRun(null);
      setFeedDryRunError("");
      load();
    };
    window.addEventListener("playnice:social-media-updated", handleSocialMediaUpdated);
    const onCampaignComplete = (event) => {
      if (!event.detail?.event_id) return;
      setCampaignSuccess("Campaign successfully published to Instagram and Facebook.");
      setFilter("all");
      setSelectedId("");
      load();
    };
    window.addEventListener("playnice:social-campaign-published", onCampaignComplete);
    const channel = supabase.channel("social-events-manager").on("postgres_changes", { event: "*", schema: "public", table: "social_events" }, load).subscribe();
    return () => {
      window.removeEventListener("playnice:social-media-updated", handleSocialMediaUpdated);
      window.removeEventListener("playnice:social-campaign-published", onCampaignComplete);
      supabase.removeChannel(channel);
    };
  }, []);

  const activeEvents = useMemo(() => events.filter((event) => !["cancelled", "published"].includes(event.status)), [events]);
  const counts = useMemo(() => events.reduce((out, event) => ({ ...out, [event.status]: (out[event.status] || 0) + 1 }), {}), [events]);
  const productCandidates = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return [...products]
      .filter((product) => !q || [product.name, product.shortName, product.slug, product.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)))
      .sort((a, b) => String(a.shortName || a.name || "").localeCompare(String(b.shortName || b.name || "")))
      .slice(0, 60);
  }, [productQuery]);
  const visible = useMemo(() => filter === "archived" ? events.filter((event) => ["cancelled", "published"].includes(event.status)) : filter === "published" ? events.filter((event) => event.status === "published") : filter === "all" ? activeEvents : activeEvents.filter((event) => event.status === filter), [events, activeEvents, filter]);
  const selected = visible.find((event) => event.id === selectedId) || visible[0] || null;
  const generated = useMemo(() => {
    if (!selected) return null;
    try { return generateSocialDraft(selected); } catch { return null; }
  }, [selected]);
  const draft = useMemo(() => {
    if (!selected || !generated) return null;
    const lockedSnapshot = selected.status === "ready" && selected.approved_content ? selected.approved_content : null;
    const stored = lockedSnapshot || selected.draft_content;
    if (!stored) return generated;
    return CHANNELS.reduce((out, [key]) => {
      out[key] = { ...(generated[key] || {}), ...(stored[key] || {}), media: generated[key]?.media || null };
      return out;
    }, { ...generated });
  }, [selected, generated]);
  const mediaReadiness = useMemo(() => validateSocialDraftMedia(draft || {}), [draft]);
  const carouselActive = Boolean(selected?.metadata?.social_carousel);
  const carouselApproved = carouselActive && ["instagram_feed", "facebook"].every((channel) => {
    const urls = (draft?.[channel]?.carousel || []).map((item) => item?.src || item?.url || "");
    const approved = selected?.metadata?.social_media_approval?.[channel];
    return urls.length >= 2 && Boolean(approved?.approved) && JSON.stringify(approved?.carousel_urls || []) === JSON.stringify(urls);
  });
  const activeChannelKeys = useMemo(() => {
    const configured = Array.isArray(selected?.channels) ? selected.channels.filter((channel) => CHANNELS.some(([key]) => key === channel)) : [];
    return configured.length ? configured : CHANNELS.map(([key]) => key);
  }, [selected?.channels]);
  const scopedMediaReadiness = useMemo(() => {
    const blocking = mediaReadiness.blocking.filter((channel) => activeChannelKeys.includes(channel));
    const fallback = mediaReadiness.fallback.filter((channel) => activeChannelKeys.includes(channel));
    return { ...mediaReadiness, blocking, fallback, ok: blocking.length === 0 };
  }, [mediaReadiness, activeChannelKeys]);
  const sourceLink = useMemo(() => publicSourceUrl(selected?.source_url), [selected?.source_url]);

  useEffect(() => {
    if (visible.length && !visible.some((event) => event.id === selectedId)) setSelectedId(visible[0].id);
  }, [visible, selectedId]);

  useEffect(() => {
    if (!selected || !generated) { setEditing({}); setAuditRows([]); return; }
    setEditing(editableContent(selected, generated));
    setCopiedKey("");
    setActionError("");
    setFeedDryRun(null);
    setFeedDryRunError("");
    setPublishedAction("");
    setPublishedMessage("");
    setPublishedError("");
    loadAudit(selected.id);
  }, [selected?.id, selected?.updated_at, generated]);

  const updateCaption = (key, value) => {
    setEditing((current) => ({ ...current, [key]: { caption: value } }));
    if (key === "instagram_feed") {
      setFeedDryRun(null);
      setFeedDryRunError("");
    }
  };

  const copyText = async (value, key) => {
    const text = String(value || "");
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const node = document.createElement("textarea");
        node.value = text;
        node.setAttribute("readonly", "");
        node.style.position = "fixed";
        node.style.opacity = "0";
        document.body.appendChild(node);
        node.select();
        document.execCommand("copy");
        node.remove();
      }
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => current === key ? "" : current), 1600);
    } catch {
      setActionError("Could not copy to clipboard. Please copy the text manually.");
    }
  };

  const openImage = (src) => {
    if (!src) return;
    window.open(src, "_blank", "noopener,noreferrer");
  };

  const sessionToken = async () => {
    const { data: refreshData } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
    if (refreshData?.session?.access_token) return refreshData.session.access_token;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (sessionError || !token) throw sessionError || new Error("Authenticated admin session is required.");
    return token;
  };


  const previewInstagramFeed = async () => {
    if (!draft?.instagram_feed) return;
    setFeedDryRunLoading(true);
    setFeedDryRunError("");
    try {
      const token = await sessionToken();
      const content = {
        ...draft.instagram_feed,
        caption: editing?.instagram_feed?.caption ?? draft.instagram_feed.caption ?? "",
      };
      const response = await fetch("/api/social-publish-dry-run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Instagram Feed dry run failed (${response.status}).`);
      setFeedDryRun(payload.dry_run || null);
    } catch (dryRunError) {
      setFeedDryRun(null);
      setFeedDryRunError(dryRunError.message || String(dryRunError));
    } finally {
      setFeedDryRunLoading(false);
    }
  };


  const publishedChannelState = (channel) => {
    const publishAction = PUBLISH_AUDIT_ACTIONS[channel];
    const deleteAction = DELETE_AUDIT_ACTIONS[channel];
    const published = auditRows.find((entry) => entry.action === publishAction) || null;
    const deleted = auditRows.find((entry) => entry.action === deleteAction) || null;
    return { published, deleted };
  };

  const managePublished = async (channel, action) => {
    if (!selected || selected.status !== "published" || publishedAction) return;
    // Instagram removal is manual until Meta grants instagram_manage_contents.
    if (action === "delete" && channel !== "facebook") return;

    if (action === "republish") {
      const [, title] = CHANNELS.find(([key]) => key === channel) || [channel, label(channel)];
      const confirmed = window.confirm(
        `REPUBLISH ${title.toUpperCase()}\n\nCreate a new ${title}-only draft from “${eventTitle(selected)}”?\n\nThe original Published event and deletion history will stay unchanged.`,
      );
      if (!confirmed) return;
    }

    if (action === "delete") {
      const [, title] = CHANNELS.find(([key]) => key === channel) || [channel, label(channel)];
      const confirmed = window.confirm(
        `DELETE LIVE META POST\n\nDelete the published ${title} item for “${eventTitle(selected)}”?\n\nThis removes the live post from Meta. The PlayNice audit history remains preserved. This cannot be undone.`,
      );
      if (!confirmed) return;
    }

    const actionKey = `${action}:${channel}`;
    setPublishedAction(actionKey);
    setPublishedMessage("");
    setPublishedError("");

    let popup = null;
    if (action === "open") {
      popup = window.open("about:blank", "_blank");
      if (popup) {
        try {
          popup.opener = null;
          popup.document.title = "Opening Meta post…";
          popup.document.body.innerHTML = "<p style='font-family:sans-serif;padding:24px'>Opening live Meta post…</p>";
        } catch {
          // Cross-window setup is best-effort.
        }
      }
    }

    try {
      const token = await sessionToken();
      const response = await fetch("/api/social-published-management", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_id: selected.id, channel, action }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Published Social ${action} failed (${response.status}).`);

      if (action === "open") {
        if (!payload.live_url) throw new Error("Meta did not return a live post URL.");
        if (popup) popup.location.replace(payload.live_url);
        else window.open(payload.live_url, "_blank", "noopener,noreferrer");
      } else if (action === "republish") {
        if (!payload.event?.id) throw new Error("Republish draft was created without an event id.");
        if (popup) popup.close();
        setFilter("draft");
        await load();
        setSelectedId(payload.event.id);
        await loadAudit(payload.event.id);
        setPublishedMessage("");
        window.dispatchEvent(new CustomEvent("playnice:social-state-updated", { detail: { event_id: payload.event.id, status: "draft", action: "republish" } }));
      } else {
        if (popup) popup.close();
        setPublishedMessage(`${label(channel)} deleted from Meta.`);
        await loadAudit(selected.id);
      }
    } catch (manageError) {
      if (popup) popup.close();
      setPublishedError(manageError.message || String(manageError));
    } finally {
      setPublishedAction("");
    }
  };

  const persist = async (action, extra = {}) => {
    if (!selected) return;
    setSaving(true);
    setActionError("");
    try {
      const token = await sessionToken();
      const response = await fetch("/api/social-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: selected.id, action, content: editing, ...extra }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Social draft update failed (${response.status}).`);
      if (payload.event) {
        setEvents((current) => current.map((event) => event.id === payload.event.id ? payload.event : event));
        setSelectedId(payload.event.id);
        await loadAudit(payload.event.id);
        window.dispatchEvent(new CustomEvent("playnice:social-state-updated", { detail: { event_id: payload.event.id, status: payload.event.status, action } }));
      } else {
        if (payload.discarded || payload.deleted) { setSelectedId(""); setAuditRows([]); }
        await load();
      }
    } catch (saveError) {
      setActionError(saveError.message || String(saveError));
    } finally {
      setSaving(false);
    }
  };

  const discardDraft = async () => {
    if (!selected || selected.status !== "draft") return;
    const confirmed = window.confirm(`Discard “${eventTitle(selected)}” Social draft?\n\nIt will leave the active queue but remain preserved in audit history.`);
    if (!confirmed) return;
    await persist("discard");
  };

  const deleteDraft = async () => {
    if (!selected || selected.status !== "draft") return;
    const confirmed = window.confirm(`Permanently delete “${eventTitle(selected)}” Social draft?\n\nThis cannot be undone.`);
    if (!confirmed) return;
    await persist("delete");
  };

  const openSourcePicker = async (sourceType) => {
    setSourcePicker({ open: true, type: sourceType, items: [], query: "", loading: true });
    setActionError("");
    try {
      const token = await sessionToken();
      const response = await fetch(`/api/social-source-catalog?source_type=${encodeURIComponent(sourceType)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Could not load ${sourceType} catalog (${response.status}).`);
      setSourcePicker({ open: true, type: sourceType, items: payload.items || [], query: "", loading: false });
    } catch (pickerError) {
      setSourcePicker({ open: false, type: "", items: [], query: "", loading: false });
      setActionError(pickerError.message || String(pickerError));
    }
  };

  const createSourcePost = async (item) => {
    if (!sourcePicker.type || !item) return;
    setSaving(true);
    setActionError("");
    try {
      const token = await sessionToken();
      const body = { source_type: sourcePicker.type };
      if (sourcePicker.type === "hero") body.hero_key = item.key;
      if (sourcePicker.type === "journal") body.journal_article_id = item.id;
      const response = await fetch("/api/social-shadow-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Could not create ${sourcePicker.type} Social post (${response.status}).`);
      setFilter("all");
      setSourcePicker({ open: false, type: "", items: [], query: "", loading: false });
      await load();
      const eventId = payload.event?.id || payload.event_id || "";
      if (eventId) { setSelectedId(eventId); await loadAudit(eventId); }
    } catch (createError) {
      setActionError(createError.message || String(createError));
    } finally {
      setSaving(false);
    }
  };

  const replayLatest = async (sourceType) => {
    setSaving(true);
    setActionError("");
    try {
      const token = await sessionToken();
      const response = await fetch("/api/social-shadow-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ source_type: sourceType }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Social ${sourceType} replay failed (${response.status}).`);
      await load();
      if (payload.event?.id) { setSelectedId(payload.event.id); await loadAudit(payload.event.id); }
      else if (payload.event_id) { setSelectedId(payload.event_id); await loadAudit(payload.event_id); }
    } catch (replayError) {
      setActionError(replayError.message || String(replayError));
    } finally {
      setSaving(false);
    }
  };

  const createBlankPost = async () => {
    setSaving(true);
    setActionError("");
    try {
      const token = await sessionToken();
      const response = await fetch("/api/social-shadow-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ source_type: "custom" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Could not create blank Social draft (${response.status}).`);
      setFilter("all");
      await load();
      const eventId = payload.event?.id || payload.event_id || "";
      if (eventId) { setSelectedId(eventId); await loadAudit(eventId); }
    } catch (createError) {
      setActionError(createError.message || String(createError));
    } finally {
      setSaving(false);
    }
  };

  const createProductPost = async (product) => {
    if (!product?.slug) return;
    setSaving(true);
    setActionError("");
    try {
      const token = await sessionToken();
      const productPayload = {
        core: { ...product },
        copy: productCopy[product.name] || {},
      };
      const response = await fetch("/api/social-shadow-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          source_type: "product",
          product_slug: product.slug,
          product_payload: productPayload,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Could not create Social draft for ${product.shortName || product.name} (${response.status}).`);
      setFilter("all");
      setProductPickerOpen(false);
      setProductQuery("");
      await load();
      const eventId = payload.event?.id || payload.event_id || "";
      if (eventId) { setSelectedId(eventId); await loadAudit(eventId); }
    } catch (createError) {
      setActionError(createError.message || String(createError));
    } finally {
      setSaving(false);
    }
  };

  const immutable = selected && ["ready", "published", "cancelled"].includes(selected.status);
  const reviewState = selected?.status === "ready"
      ? "READY · APPROVED"
      : selected?.status === "published"
        ? `ARCHIVED · PUBLISHED · ${selected.published_at ? fmt(selected.published_at) : "DATE UNKNOWN"}`
        : selected?.status === "cancelled"
          ? `ARCHIVED · DISCARDED · ${fmt(selected.updated_at)}`
          : "DRAFT · REVIEW";

  return <section className="social-manager">
    <div className="social-banner">
      <div><span>SOCIAL PUBLISHER V1</span><h2>Plan, review and publish</h2><p>Create social posts from Products, Hero or Journal, review channel assets, then publish manually when everything is ready.</p></div>
      <strong>MANUAL PUBLISH</strong>
    </div>

    <div className="social-kpis">
      <div><span>TOTAL</span><strong>{activeEvents.length}</strong><small>active social events</small></div>
      <div><span>DRAFT</span><strong>{counts.draft || 0}</strong><small>awaiting review</small></div>
      <div><span>READY</span><strong>{counts.ready || 0}</strong><small>approved shadow queue</small></div>
    </div>

    {error ? <div className="social-error">Social schema is not active in Supabase yet: {error}</div> : null}
    {actionError ? <div className="social-error social-action-error">{actionError}</div> : null}
    {campaignSuccess ? <div role="status" className="social-campaign-success">
      <strong>✓ {campaignSuccess}</strong>
      <span>The campaign has been archived and removed from the active queue.</span>
      <button type="button" onClick={() => setCampaignSuccess("")} aria-label="Dismiss campaign confirmation">×</button>
    </div> : null}

    <div className="social-toolbar">
      <div className="social-filter-bar">
        {FILTERS.map((value) => <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label(value)}{value !== "all" ? ` ${value === "archived" ? events.filter((event) => ["cancelled", "published"].includes(event.status)).length : counts[value] || 0}` : ""}</button>)}
      </div>
      <div className="social-create-group">
        <span>CREATE POST FROM / NEW</span>
        <div>
          <button type="button" className="social-create-product" disabled={saving} onClick={createBlankPost}>{saving ? "Working…" : "New draft"}</button>
          <button type="button" disabled={saving} onClick={() => { setProductQuery(""); setProductPickerOpen(true); }}>{saving ? "Working…" : "Product"}</button>
          <button type="button" disabled={saving} onClick={() => openSourcePicker("hero")}>{saving ? "Working…" : "Hero"}</button>
          <button type="button" disabled={saving} onClick={() => openSourcePicker("journal")}>{saving ? "Working…" : "Journal"}</button>
        </div>
      </div>
    </div>


    {sourcePicker.open ? <div className="social-product-picker-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setSourcePicker({ open: false, type: "", items: [], query: "", loading: false }); }}>
      <section className="social-product-picker" role="dialog" aria-modal="true" aria-label={`Create ${sourcePicker.type} post`}>
        <div className="social-product-picker-head">
          <div><span>{`CREATE ${sourcePicker.type.toUpperCase()} POST`}</span><h3>{sourcePicker.type === "hero" ? "Choose any Hero visual" : "Choose any Journal article"}</h3><p>Creates a fresh Social draft without changing the storefront source.</p></div>
          <button type="button" disabled={saving} onClick={() => setSourcePicker({ open: false, type: "", items: [], query: "", loading: false })}>Close</button>
        </div>
        <input autoFocus type="search" value={sourcePicker.query} onChange={(event) => setSourcePicker((current) => ({ ...current, query: event.target.value }))} placeholder={sourcePicker.type === "hero" ? "Search Hero title or key…" : "Search Journal title or article id…"} />
        <div className="social-product-picker-results">
          {sourcePicker.loading ? <div className="social-product-picker-empty">Loading…</div> : (() => {
            const q = sourcePicker.query.trim().toLowerCase();
            const items = sourcePicker.items.filter((item) => !q || [item.title, item.subtitle, item.key, item.id].filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
            return items.length ? items.map((item) => <button type="button" key={`${sourcePicker.type}-${item.id || item.key}`} disabled={saving} onClick={() => createSourcePost(item)}>
              <div><strong>{item.title || item.key}</strong><span>{item.subtitle || (sourcePicker.type === "hero" ? item.key : `Journal #${item.id}`)}</span><small>{sourcePicker.type === "hero" ? item.key : `Article #${item.id}`}</small></div>
              {item.image ? <img src={publicSourceUrl(item.image)} alt="" style={{ width: 48, height: 48, objectFit: "cover" }} /> : <em>{label(sourcePicker.type)}</em>}
            </button>) : <div className="social-product-picker-empty">No matching {sourcePicker.type} sources.</div>;
          })()}
        </div>
      </section>
    </div> : null}

    {productPickerOpen ? <div className="social-product-picker-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setProductPickerOpen(false); }}>
      <section className="social-product-picker" role="dialog" aria-modal="true" aria-label="Create product post">
        <div className="social-product-picker-head">
          <div><span>CREATE PRODUCT POST</span><h3>Choose any live product</h3><p>Creates a fresh Social draft without changing the product or storefront.</p></div>
          <button type="button" disabled={saving} onClick={() => setProductPickerOpen(false)}>Close</button>
        </div>
        <input autoFocus type="search" value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Search name, brand or slug…" />
        <div className="social-product-picker-results">
          {productCandidates.length ? productCandidates.map((product) => <button type="button" key={product.slug} disabled={saving} onClick={() => createProductPost(product)}>
            <div><strong>{product.shortName || product.name}</strong><span>{product.name}</span><small>{product.slug}</small></div>
            <em>{product.category || "Product"}</em>
          </button>) : <div className="social-product-picker-empty">No live products match this search.</div>}
        </div>
      </section>
    </div> : null}

    {visible.length ? <div className="social-layout">
      <aside className="social-list">
        <div className="social-list-head"><span>EVENT QUEUE</span><strong>{loading ? "…" : visible.length}</strong></div>
        {visible.length ? visible.map((event) => <button type="button" key={event.id} data-social-event-id={event.id} className={selected?.id === event.id ? "active" : ""} onClick={() => setSelectedId(event.id)}>
          <div><strong>{eventTitle(event)}</strong><span>{label(event.source_type)} · {label(event.event_type)}</span></div>
          <em className={event.status}>{event.status}</em>
        </button>) : <div className="social-empty">{loading ? "Loading social events…" : "No social events in this view."}</div>}
      </aside>

      <article className="social-detail">
        {selected && draft ? <>
          <div className="social-detail-head"><div><span>{label(selected.source_type)} / {label(selected.event_type)}</span><h3>{draft.headline}</h3><p>{selected.source_url || selected.source_id}</p></div><div><strong>{selected.status}</strong><small>{fmt(selected.created_at)}</small>{selected.approved_at ? <small>approved {fmt(selected.approved_at)}</small> : null}</div></div>
          <div className={`social-channel-grid ${carouselActive ? "social-channel-grid-carousel" : ""}`}>
            {CHANNELS.filter(([key]) => activeChannelKeys.includes(key)).map(([key, title]) => {
              const media = draft[key]?.media || null;
              const src = mediaSrc(media);
              const readiness = mediaReadiness.channels[key];
              const caption = editing?.[key]?.caption ?? draft[key]?.caption ?? "";
              const snapshotLocked = selected.status === "ready";
              return <section key={key} className={`social-channel-card ${key === "instagram_story" ? "story" : ""}`}>
                <div className="social-channel-head"><span>{title}</span><em>{snapshotLocked ? "APPROVED" : "EDITABLE"}</em></div>
                <div className="social-media-frame">
                  {src ? <img src={src} alt="" /> : <div className="social-media-placeholder">No channel asset selected</div>}
                  {Array.isArray(draft[key]?.carousel) ? <span className="social-carousel-count">{draft[key].carousel.length} images · carousel</span> : null}
                  <div className={`social-media-meta ${readiness.status}`}><span>{media?.format || "no asset"}</span><strong>{readiness.label}</strong></div>
                </div>
                <textarea value={caption} disabled={saving || immutable} onChange={(event) => updateCaption(key, event.target.value)} maxLength={2200} />
                <div className="social-caption-meta"><span>{caption.length}/2200</span><strong>{snapshotLocked ? "Approved snapshot" : readiness.status === "fallback" ? "Usable fallback" : readiness.status === "missing" ? "Media required" : "Media ready"}</strong></div>
                <div className="social-manual-actions">
                  <button type="button" disabled={!caption} onClick={() => copyText(caption, `${key}:caption`)}>{copiedKey === `${key}:caption` ? "Copied" : "Copy caption"}</button>
                  <button type="button" disabled={!src} onClick={() => openImage(src)}>Open image</button>
                  <button type="button" disabled={!sourceLink} onClick={() => copyText(sourceLink, `${key}:link`)}>{copiedKey === `${key}:link` ? "Copied" : "Copy link"}</button>
                </div>
              </section>;
            })}
          </div>
          <div className={`social-media-readiness ${scopedMediaReadiness.ok ? "ready" : "blocked"}`}>
            <div><span>MEDIA READINESS</span><strong>{!scopedMediaReadiness.ok ? "READY BLOCKED" : carouselActive && !carouselApproved ? "VISUAL APPROVAL REQUIRED" : "READY CHECK CAN RUN"}</strong></div>
            <p>{scopedMediaReadiness.ok
              ? carouselActive && !carouselApproved
                ? "Review all carousel images and their order, then select Approve all images & order. Both channel captions remain editable above."
                : scopedMediaReadiness.fallback.length
                ? `${scopedMediaReadiness.fallback.length} active channel(s) use a fallback asset. Backend verifies public image availability before approval.`
                : activeChannelKeys.length === 1
                  ? `${label(activeChannelKeys[0])} media is ready. Backend verifies public image availability before approval.`
                  : "All active channels have ideal media. Backend verifies public image availability before approval."
              : `Missing media: ${scopedMediaReadiness.blocking.map(label).join(", ")}.`}</p>
          </div>

          {activeChannelKeys.includes("instagram_feed") ? <section className="social-history social-dry-run">
            <div className="social-history-head">
              <div><span>INSTAGRAM FEED · META DRY RUN</span><strong>{feedDryRun ? "PAYLOAD READY" : "NO REQUEST SENT"}</strong></div>
              <button type="button" disabled={feedDryRunLoading || !draft?.instagram_feed?.media} onClick={previewInstagramFeed}>{feedDryRunLoading ? "Building…" : "Preview Meta payload"}</button>
            </div>
            {feedDryRunError ? <div className="social-history-empty">Dry run failed: {feedDryRunError}</div> : null}
            {feedDryRun ? <div className="social-history-list">
              <div className="social-history-item"><span className="social-history-dot" aria-hidden="true" /><div><strong>1. Create media container</strong><p>{feedDryRun.create?.method} {feedDryRun.create?.url}</p></div><time>NETWORK · NO</time></div>
              <div className="social-history-item"><span className="social-history-dot" aria-hidden="true" /><div><strong>Image URL</strong><p>{feedDryRun.create?.body?.image_url}</p></div><time>TOKEN · NO</time></div>
              <div className="social-history-item"><span className="social-history-dot" aria-hidden="true" /><div><strong>Caption</strong><p>{feedDryRun.create?.body?.caption}</p></div><time>{String(feedDryRun.create?.body?.caption || "").length} chars</time></div>
              <div className="social-history-item"><span className="social-history-dot" aria-hidden="true" /><div><strong>2. Publish media container</strong><p>{feedDryRun.publish_template?.method} {feedDryRun.publish_template?.url} · creation_id=&lt;MEDIA_CONTAINER_ID&gt;</p></div><time>PUBLISH · LOCKED</time></div>
            </div> : <div className="social-history-empty">Builds the exact Instagram Feed Graph request descriptor for this event. No Meta network request is made and no access token is returned to the browser.</div>}
          </section> : null}


          {selected.status === "published" ? <section className="social-published-management">
            <div className="social-published-management-head">
              <div><span>PUBLISHED MANAGEMENT</span><strong>Live Meta controls</strong></div>
              <small>Open Instagram posts for manual removal; Facebook posts can be deleted here.</small>
            </div>
            {publishedMessage ? <div className="social-published-management-message ok">{publishedMessage}</div> : null}
            {publishedError ? <div className="social-published-management-message error">{publishedError}</div> : null}
            <div className="social-published-management-grid">
              {CHANNELS.filter(([key]) => activeChannelKeys.includes(key)).map(([key, title]) => {
                const state = publishedChannelState(key);
                const hasPublished = Boolean(state.published);
                const isDeleted = Boolean(state.deleted);
                const opening = publishedAction === `open:${key}`;
                const deleting = publishedAction === `delete:${key}`;
                const republishing = publishedAction === `republish:${key}`;
                const postId = state.published?.details?.post_id || state.published?.details?.media_id || "";
                return <div className={`social-published-channel ${isDeleted ? "deleted" : ""}`} key={`published-${key}`}>
                  <div>
                    <span>{title}</span>
                    <strong>{isDeleted ? "DELETED FROM META" : hasPublished ? "LIVE · PUBLISHED" : "NO PUBLISH RECORD"}</strong>
                    <small>{isDeleted ? `Deleted ${fmt(state.deleted?.created_at)}` : hasPublished ? `Published ${fmt(state.published?.created_at)}` : "No channel publish audit record found."}</small>
                    {postId ? <code>{postId}</code> : null}
                  </div>
                  <div className={`social-published-channel-actions ${isDeleted ? "republish" : ""}`}>
                    {isDeleted
                      ? <button type="button" className="republish" disabled={!hasPublished || Boolean(publishedAction)} onClick={() => managePublished(key, "republish")}>{republishing ? "Creating draft…" : `Republish ${title}`}</button>
                      : <>
                        <button type="button" disabled={!hasPublished || Boolean(publishedAction)} onClick={() => managePublished(key, "open")}>{opening ? "Opening…" : "Open live post"}</button>
                        {key === "facebook"
                          ? <button type="button" className="danger" disabled={!hasPublished || Boolean(publishedAction)} onClick={() => managePublished(key, "delete")}>{deleting ? "Deleting…" : "Delete from Meta"}</button>
                          : <small className="social-published-manual-note">To delete, open the post and remove it in Instagram.</small>}
                      </>}
                  </div>
                </div>;
              })}
            </div>
          </section> : null}

          <div className="social-review-row">
            <div><span>REVIEW STATE</span><strong>{reviewState}</strong></div>
            <div className="social-review-actions">
              {selected.status === "draft" && !isExplicitTestEvent(selected) ? <><button type="button" disabled={saving} onClick={discardDraft}>Discard draft</button><button type="button" className="danger" disabled={saving} onClick={deleteDraft}>Delete draft</button></> : null}
              {isExplicitTestEvent(selected) ? <button type="button" disabled={saving} onClick={() => persist("discard_test")}>Discard test event</button> : null}
              {selected.status === "scheduled"
                ? <button type="button" disabled={saving} onClick={() => persist("unschedule")}>{saving ? "Working…" : "Unschedule"}</button>
                : selected.status === "ready"
                  ? <button type="button" disabled={saving} onClick={() => persist("reopen")}>{saving ? "Working…" : "Return to draft"}</button>
                  : selected.status === "draft"
                    ? <>
                      <button type="button" disabled={saving} onClick={() => persist("save")}>{saving ? "Saving…" : "Save draft"}</button>
                      <button type="button" className="primary" disabled={saving || !scopedMediaReadiness.ok} title={!scopedMediaReadiness.ok ? "Add usable media for every active channel before marking READY." : "Backend will verify public image availability before approval."} onClick={() => persist("ready")}>{saving ? "Approving…" : "Mark ready"}</button>
                    </>
                    : null}
            </div>
          </div>

          <section className="social-history">
            <div className="social-history-head"><div><span>AUDIT HISTORY</span><strong>{auditLoading ? "Loading…" : `${auditRows.length} event${auditRows.length === 1 ? "" : "s"}`}</strong></div><small>Read-only Social Publisher timeline</small></div>
            {auditError ? <div className="social-history-empty">Could not load audit history: {auditError}</div> : auditRows.length ? <div className="social-history-list">
              {auditRows.map((entry) => <div className="social-history-item" key={entry.id}>
                <span className="social-history-dot" aria-hidden="true" />
                <div><strong>{AUDIT_LABELS[entry.action] || label(entry.action)}</strong><p>{auditDescription(entry)}</p></div>
                <time>{fmt(entry.created_at)}</time>
              </div>)}
            </div> : <div className="social-history-empty">{auditLoading ? "Loading audit history…" : "No audit entries for this event yet."}</div>}
          </section>

          <div className="social-safety-row"><div><span>PUBLISH MODE</span><strong>{selected.publish_mode || "shadow"} · manual controlled</strong></div><div><span>CHANNELS</span><strong>{(selected.channels || []).length}</strong></div><button type="button" disabled title="Automatic scheduler-to-Meta publishing remains disabled. Controlled manual channel publishing is available when its environment flag is enabled.">Auto publish locked · manual enabled</button></div>
        </> : null}
      </article>
    </div> : <section className="social-empty-workspace">
      <span>SOCIAL QUEUE</span>
      <h3>No active social posts</h3>
      <p>Create a clean campaign draft, or start from a Product, Hero visual or Journal article.</p>
      <div>
        <button type="button" className="social-create-product" disabled={saving} onClick={createBlankPost}>{saving ? "Working…" : "New draft"}</button>
        <button type="button" disabled={saving} onClick={() => { setProductQuery(""); setProductPickerOpen(true); }}>Product</button>
        <button type="button" disabled={saving} onClick={() => openSourcePicker("hero")}>Hero</button>
        <button type="button" disabled={saving} onClick={() => openSourcePicker("journal")}>Journal</button>
      </div>
    </section>}

    <section id="social-manual-publish-area" className="social-manual-publish-area" aria-label="Manual publishing controls" />
  </section>;
}

export default function SocialManager() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");

      if (!placeholder || heading?.textContent?.trim() !== "Social") {
        setSlot(null);
        return;
      }

      placeholder.classList.add("social-module-active");
      placeholder.dataset.publishMode = "MANUAL MODE";
      let nextSlot = placeholder.querySelector("#social-manager-slot");
      if (!nextSlot) {
        nextSlot = document.createElement("div");
        nextSlot.id = "social-manager-slot";
        nextSlot.className = "social-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return slot ? createPortal(<SocialWorkspace />, slot) : null;
}
