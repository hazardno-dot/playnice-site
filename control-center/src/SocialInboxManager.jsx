import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./social-inbox.css";

const fmt = (value) => value ? new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date(value)) : "—";

const platformLabel = (platform) => platform === "instagram" ? "Instagram" : "Facebook";

async function getAdminToken() {
  const { data: refreshData } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
  if (refreshData?.session?.access_token) return refreshData.session.access_token;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) throw error || new Error("Authenticated admin session is required.");
  return data.session.access_token;
}

function contactLabel(thread) {
  if (thread?.participant_name) return thread.participant_name;
  if (thread?.participant_id) return `${platformLabel(thread.platform)} user · ${String(thread.participant_id).slice(-8)}`;
  return `${platformLabel(thread?.platform)} conversation`;
}

function InboxWorkspace() {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [syncState, setSyncState] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replyStatus, setReplyStatus] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [draftMeta, setDraftMeta] = useState(null);

  const loadThreads = async () => {
    const { data, error: loadError } = await supabase
      .from("social_inbox_threads")
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("meta_updated_at", { ascending: false, nullsFirst: false })
      .limit(100);
    if (loadError) {
      setError(loadError.message);
      setThreads([]);
      return [];
    }
    setError("");
    setThreads(data || []);
    return data || [];
  };

  const loadMessages = async (threadId) => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    const { data, error: loadError } = await supabase
      .from("social_inbox_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("sent_at", { ascending: true })
      .limit(100);
    if (loadError) {
      setError(loadError.message);
      setMessages([]);
      return;
    }
    setMessages(data || []);
  };

  const syncInbox = async (silent = false) => {
    setSyncing(true);
    if (!silent) setError("");
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/social-inbox-sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = payload?.meta_errors
          ? Object.entries(payload.meta_errors)
              .map(([key, value]) => `${platformLabel(key)}: ${value.message}`)
              .join(" · ")
          : "";
        throw new Error(`${payload.error || `Inbox sync failed (${response.status}).`}${details ? ` ${details}` : ""}`);
      }
      setSyncState(payload);
      const rows = await loadThreads();
      if (!selectedId && rows[0]?.id) setSelectedId(rows[0].id);
    } catch (syncError) {
      setSyncState(null);
      setError(syncError?.message || String(syncError));
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const rows = await loadThreads();
      if (!cancelled && rows[0]?.id) setSelectedId((current) => current || rows[0].id);
      if (!cancelled) await syncInbox(true);
      if (!cancelled) setLoading(false);
    })();

    const channel = supabase
      .channel("social-inbox-threads-manager")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_inbox_threads" }, loadThreads)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return undefined;
    }
    loadMessages(selectedId);
    const channel = supabase
      .channel(`social-inbox-messages-${selectedId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "social_inbox_messages",
        filter: `thread_id=eq.${selectedId}`,
      }, () => loadMessages(selectedId))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedId]);

  const visible = useMemo(
    () => filter === "all" ? threads : threads.filter((thread) => thread.platform === filter),
    [threads, filter]
  );
  const selected = visible.find((thread) => thread.id === selectedId) || visible[0] || null;

  useEffect(() => {
    if (selected?.id && selected.id !== selectedId) setSelectedId(selected.id);
    if (!selected) setMessages([]);
  }, [selected?.id, selectedId]);

  useEffect(() => {
    setReplyText("");
    setReplyError("");
    setReplyStatus("");
    setDraftMeta(null);
  }, [selectedId]);

  const generateAiDraft = async () => {
    if (!selected || selected.platform !== "facebook" || generatingDraft || sendingReply) return;

    setGeneratingDraft(true);
    setReplyError("");
    setReplyStatus("");
    setDraftMeta(null);
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/social-inbox-ai-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ thread_id: selected.id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `AI draft failed (${response.status}).`);
      if (!String(payload.draft || "").trim()) throw new Error("AI returned an empty draft.");

      setReplyText(String(payload.draft).trim());
      setDraftMeta({
        model: payload.model || "AI",
        generatedAt: payload.generated_at || new Date().toISOString(),
      });
      setReplyStatus("AI draft generated from this conversation and the live catalog. Review and edit before sending.");
    } catch (draftError) {
      setReplyError(draftError?.message || String(draftError));
    } finally {
      setGeneratingDraft(false);
    }
  };

  const sendFacebookReply = async () => {
    const text = replyText.trim();
    if (!selected || selected.platform !== "facebook" || !text || sendingReply) return;

    const confirmed = window.confirm(
      `Approve and send this Facebook reply to ${contactLabel(selected)}?\n\n${text}`
    );
    if (!confirmed) return;

    setSendingReply(true);
    setReplyError("");
    setReplyStatus("");
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/social-inbox-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          thread_id: selected.id,
          text,
          approved: true,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Facebook reply failed (${response.status}).`);

      setReplyText("");
      setReplyStatus(payload.storage_warnings?.length
        ? "Sent to Facebook. Local sync reported a storage warning; use Sync now before sending again."
        : "Sent to Facebook.");
      await Promise.all([loadMessages(selected.id), loadThreads()]);
    } catch (sendError) {
      setReplyError(sendError?.message || String(sendError));
    } finally {
      setSendingReply(false);
    }
  };

  const counts = useMemo(() => ({
    all: threads.length,
    instagram: threads.filter((thread) => thread.platform === "instagram").length,
    facebook: threads.filter((thread) => thread.platform === "facebook").length,
  }), [threads]);

  return <section className="social-inbox-manager">
    <div className="social-inbox-banner">
      <div>
        <span>SOCIAL INBOX V1</span>
        <h2>Instagram + Facebook messages</h2>
        <p>Facebook conversations can be reviewed and replied to after explicit approval. Instagram remains unavailable until Meta Advanced Access is available.</p>
      </div>
      <strong>FB APPROVAL SEND</strong>
    </div>

    <div className="social-inbox-toolbar">
      <div className="social-inbox-filters">
        {["all", "instagram", "facebook"].map((value) => <button
          type="button"
          key={value}
          className={filter === value ? "active" : ""}
          onClick={() => { setFilter(value); setSelectedId(""); }}
        >
          {value === "all" ? "All" : platformLabel(value)} <span>{counts[value]}</span>
        </button>)}
      </div>
      <button type="button" className="social-inbox-sync" disabled={syncing} onClick={() => syncInbox(false)}>
        {syncing ? "Syncing Meta…" : "Sync now"}
      </button>
    </div>

    {error ? <div className="social-inbox-error">{error}</div> : null}
    {syncState ? <div className="social-inbox-status">
      <span>LAST META SYNC</span>
      <strong>Instagram {syncState.results?.instagram?.conversations ?? "—"} · Facebook {syncState.results?.facebook?.conversations ?? "—"}</strong>
      <small>{syncState.results?.facebook
        ? (syncState.results?.instagram?.conversations
            ? "Facebook + Instagram read successfully"
            : "Facebook connected · Instagram Advanced Access unavailable")
        : "Facebook sync needs attention"}</small>
    </div> : null}

    <div className="social-inbox-layout">
      <aside className="social-inbox-list">
        <div className="social-inbox-list-head"><span>CONVERSATIONS</span><strong>{loading ? "…" : visible.length}</strong></div>
        {visible.length ? visible.map((thread) => <button
          type="button"
          key={thread.id}
          className={selected?.id === thread.id ? "active" : ""}
          onClick={() => setSelectedId(thread.id)}
        >
          <div>
            <strong>{contactLabel(thread)}</strong>
            <span>{platformLabel(thread.platform)} · {thread.last_message_direction === "outbound" ? "You replied" : "Customer"}</span>
            <p>{thread.last_message_text || "Media / attachment or no text"}</p>
          </div>
          <time>{fmt(thread.last_message_at || thread.meta_updated_at)}</time>
        </button>) : <div className="social-inbox-empty">{loading ? "Loading conversations…" : "No conversations synced yet."}</div>}
      </aside>

      <article className="social-inbox-thread">
        {selected ? <>
          <div className="social-inbox-thread-head">
            <div>
              <span>{platformLabel(selected.platform).toUpperCase()}</span>
              <h3>{contactLabel(selected)}</h3>
              <p>{selected.participant_id || selected.meta_conversation_id}</p>
            </div>
            <div><strong>{selected.status || "open"}</strong><small>synced {fmt(selected.synced_at)}</small></div>
          </div>

          <div className="social-inbox-messages">
            {messages.length ? messages.map((message) => <div
              key={message.id}
              className={`social-inbox-message ${message.direction}`}
            >
              <div>
                <span>{message.direction === "outbound" ? "PLAYNICE" : contactLabel(selected).toUpperCase()}</span>
                <p>{message.body || "Media / attachment or no text"}</p>
                <time>{fmt(message.sent_at)}</time>
              </div>
            </div>) : <div className="social-inbox-empty">No stored messages for this conversation.</div>}
          </div>

          {selected.platform === "facebook" ? <div className="social-inbox-reply-composer">
            <div className="social-inbox-reply-head">
              <div><span>FACEBOOK REPLY</span><strong>Draft → review → Approve & Send</strong></div>
              <small>Meta 24-hour response window is enforced server-side.</small>
            </div>
            <textarea
              value={replyText}
              maxLength={2000}
              rows={3}
              disabled={sendingReply || generatingDraft}
              placeholder="Write a Facebook reply…"
              onChange={(event) => {
                setReplyText(event.target.value);
                setReplyError("");
                setReplyStatus("");
                setDraftMeta(null);
              }}
            />
            {replyError ? <div className="social-inbox-reply-error">{replyError}</div> : null}
            {replyStatus ? <div className="social-inbox-reply-success">{replyStatus}</div> : null}
            <div className="social-inbox-reply-actions">
              <div className="social-inbox-ai-actions">
                <button
                  type="button"
                  className="social-inbox-ai-button"
                  disabled={generatingDraft || sendingReply}
                  onClick={generateAiDraft}
                >
                  {generatingDraft ? "Drafting…" : (replyText.trim() ? "Regenerate AI draft" : "Generate AI draft")}
                </button>
                <small>{draftMeta ? `AI DRAFT · ${draftMeta.model} · REVIEW REQUIRED` : "AI draft only · nothing is sent automatically"}</small>
              </div>
              <div className="social-inbox-send-actions">
                <small>{replyText.length}/2000</small>
                <button
                  type="button"
                  disabled={sendingReply || generatingDraft || !replyText.trim()}
                  onClick={sendFacebookReply}
                >
                  {sendingReply ? "Sending…" : "Approve & Send"}
                </button>
              </div>
            </div>
          </div> : <div className="social-inbox-reply-lock">
            <div><span>INSTAGRAM</span><strong>Messaging API unavailable without Meta Advanced Access</strong></div>
            <button type="button" disabled>Reply locked</button>
          </div>}
        </> : <div className="social-inbox-empty social-inbox-empty-thread">Select a conversation after the first Meta sync.</div>}
      </article>
    </div>
  </section>;
}

export default function SocialInboxManager() {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar nav");
    const mainStage = document.querySelector(".main-stage");
    if (!sidebar || !mainStage) return;
    const manageGroup = [...sidebar.querySelectorAll(".nav-group")]
      .find((group) => group.querySelector(".nav-label")?.textContent?.trim() === "MANAGE");
    if (!manageGroup) return;

    let button = manageGroup.querySelector("[data-social-inbox-manager-nav='true']");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.socialInboxManagerNav = "true";
      button.title = "Inbox";
      button.innerHTML = '<span class="nav-icon" aria-hidden="true">I</span><span class="nav-dot"></span><span class="nav-text">Inbox</span>';
      const socialButton = manageGroup.querySelector("[data-social-manager-nav='true']");
      if (socialButton?.nextSibling) manageGroup.insertBefore(button, socialButton.nextSibling);
      else manageGroup.appendChild(button);
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
    const publishBadge = mainStage?.querySelector(".topbar .read-only-badge");
    const navButtons = [...document.querySelectorAll(".sidebar nav button")];
    const button = navButtons.find((item) => item.dataset.socialInboxManagerNav === "true");
    if (!mainStage || !heading || !button) return;

    let nextSlot = mainStage.querySelector("#social-inbox-manager-slot");
    if (!nextSlot) {
      nextSlot = document.createElement("div");
      nextSlot.id = "social-inbox-manager-slot";
      mainStage.appendChild(nextSlot);
    }
    const topbar = mainStage.querySelector(".topbar");
    const baseChildren = [...mainStage.children].filter((child) => child !== topbar && child !== nextSlot);

    if (open) {
      navButtons.forEach((item) => item.classList.toggle("active", item === button));
      heading.textContent = "Inbox";
      if (eyebrow) eyebrow.textContent = "MANAGE / SOCIAL INBOX";
      if (description) description.textContent = "Review social conversations in one place and send explicitly approved Facebook replies.";
      if (publishBadge) publishBadge.textContent = "FB SEND";
      baseChildren.forEach((child) => {
        if (child.dataset.inboxPreviousDisplay === undefined) child.dataset.inboxPreviousDisplay = child.style.display || "";
        child.style.display = "none";
      });
      nextSlot.style.display = "block";
      setSlot(nextSlot);
    } else {
      nextSlot.style.display = "none";
      baseChildren.forEach((child) => {
        if (child.dataset.inboxPreviousDisplay !== undefined) {
          child.style.display = child.dataset.inboxPreviousDisplay;
          delete child.dataset.inboxPreviousDisplay;
        }
      });
      setSlot(null);
    }
  }, [open]);

  return slot ? createPortal(<InboxWorkspace />, slot) : null;
}
