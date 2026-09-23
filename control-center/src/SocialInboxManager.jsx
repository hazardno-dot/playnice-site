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

function initialInboxThread() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("inbox") || "";
}

function InboxWorkspace() {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [selectedId, setSelectedId] = useState(() => initialInboxThread());
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [syncState, setSyncState] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replyStatus, setReplyStatus] = useState("");
  const [loadedDraftId, setLoadedDraftId] = useState("");
  const [assistantState, setAssistantState] = useState(null);
  const [activatingAssistant, setActivatingAssistant] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState("");

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

  const loadDrafts = async () => {
    const { data, error: loadError } = await supabase
      .from("social_inbox_drafts")
      .select("*")
      .in("status", ["ready", "needs_review"])
      .order("created_at", { ascending: false })
      .limit(200);
    if (loadError) {
      setError(loadError.message);
      setDrafts([]);
      return [];
    }
    setDrafts(data || []);
    return data || [];
  };

  const loadAssistantState = async () => {
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/social-inbox-webhook-manage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Assistant status failed (${response.status}).`);
      setAssistantState(payload);
      return payload;
    } catch (stateError) {
      setAssistantState({ ok: false, error: stateError?.message || String(stateError) });
      return null;
    }
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
      const [rows] = await Promise.all([loadThreads(), loadDrafts(), loadAssistantState()]);
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
      const [rows] = await Promise.all([loadThreads(), loadDrafts(), loadAssistantState()]);
      if (!cancelled && rows[0]?.id) setSelectedId((current) => current || rows[0].id);
      if (!cancelled) await syncInbox(true);
      if (!cancelled) setLoading(false);
    })();

    const threadChannel = supabase
      .channel("social-inbox-threads-manager")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_inbox_threads" }, loadThreads)
      .subscribe();
    const draftChannel = supabase
      .channel("social-inbox-drafts-manager")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_inbox_drafts" }, loadDrafts)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(threadChannel);
      supabase.removeChannel(draftChannel);
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
  const draftByThread = useMemo(() => {
    const map = new Map();
    for (const draft of drafts) {
      if (draft?.thread_id && !map.has(draft.thread_id)) map.set(draft.thread_id, draft);
    }
    return map;
  }, [drafts]);
  const selectedDraft = selected?.id ? draftByThread.get(selected.id) || null : null;

  useEffect(() => {
    if (selected?.id && selected.id !== selectedId) setSelectedId(selected.id);
    if (!selected) setMessages([]);
  }, [selected?.id, selectedId]);

  useEffect(() => {
    setReplyText("");
    setReplyError("");
    setReplyStatus("");
    setLoadedDraftId("");
  }, [selectedId]);

  useEffect(() => {
    if (!selectedDraft || selectedDraft.id === loadedDraftId) return;

    if (loadedDraftId && selectedDraft.id !== loadedDraftId) {
      setReplyText(selectedDraft.status === "ready" ? String(selectedDraft.body || "") : "");
      setLoadedDraftId(selectedDraft.id);
      setReplyError("");
      setReplyStatus(selectedDraft.status === "ready"
        ? "New customer message arrived. The previous Assistant draft was replaced with a fresh one."
        : "New customer message arrived. The previous draft was cleared because this message needs manual review.");
      return;
    }

    if (replyText) return;
    setLoadedDraftId(selectedDraft.id);
    if (selectedDraft.status === "ready" && selectedDraft.body) {
      setReplyText(selectedDraft.body);
      setReplyStatus("Assistant v2 prepared this draft automatically. Review or edit it before sending.");
    }
  }, [selectedDraft?.id, selectedDraft?.status, selectedDraft?.body, loadedDraftId, replyText]);

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
          assistant_draft_id: selectedDraft?.id || null,
          text,
          approved: true,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Facebook reply failed (${response.status}).`);

      const sentDraftId = selectedDraft?.id || "";
      if (sentDraftId) {
        setDrafts((current) => current.filter((draft) => draft.id !== sentDraftId));
      }
      setReplyText("");
      setLoadedDraftId(sentDraftId);
      setReplyStatus(payload.storage_warnings?.length
        ? "Sent to Facebook. Local sync reported a storage warning; use Sync now before sending again."
        : "Sent to Facebook.");
      await Promise.all([loadMessages(selected.id), loadThreads(), loadDrafts()]);
    } catch (sendError) {
      setReplyError(sendError?.message || String(sendError));
    } finally {
      setSendingReply(false);
    }
  };

  const testTelegram = async () => {
    if (testingTelegram) return;
    setTestingTelegram(true);
    setTelegramTestStatus("");
    setError("");
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/social-inbox-webhook-manage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "test_telegram" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Telegram test failed (${response.status}).`);
      setTelegramTestStatus("Telegram test sent.");
    } catch (testError) {
      setTelegramTestStatus("");
      setError(testError?.message || String(testError));
    } finally {
      setTestingTelegram(false);
    }
  };

  const activateAssistant = async () => {
    if (activatingAssistant) return;
    setActivatingAssistant(true);
    setError("");
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/social-inbox-webhook-manage", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Assistant activation failed (${response.status}).`);
      setAssistantState(payload);
    } catch (activationError) {
      setError(activationError?.message || String(activationError));
    } finally {
      setActivatingAssistant(false);
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
        <span>SOCIAL INBOX V2</span>
        <h2>Inbox Assistant</h2>
        <p>Facebook messages can be synced automatically, matched against PlayNice rules and the live catalog, and prepared as drafts. Sending still requires explicit approval.</p>
      </div>
      <strong>NO AUTO-SEND</strong>
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
    {assistantState ? <div className={`social-inbox-assistant-status ${assistantState.automation_active ? "active" : "setup"}`}>
      <div>
        <span>ASSISTANT V2</span>
        <strong>{assistantState.automation_active
          ? "Automatic Facebook intake is active"
          : (assistantState.assistant_ready ? "Draft engine ready · webhook not active yet" : "Assistant setup is incomplete")}</strong>
        <small>
          Rule engine {assistantState.assistant_ready ? "ready" : "needs configuration"}
          {" · "}Webhook {assistantState.webhook_ready ? "ready" : "needs configuration"}
          {" · "}Telegram {assistantState.notification_ready ? "ready" : "not configured"}
          {" · "}customer send always requires approval
        </small>
        {(assistantState.missing?.assistant?.length || assistantState.missing?.webhook?.length || assistantState.missing?.telegram?.length) ? <div className="social-inbox-missing-config">
          {assistantState.missing?.assistant?.length ? <span><b>Assistant:</b> {assistantState.missing.assistant.join(", ")}</span> : null}
          {assistantState.missing?.webhook?.length ? <span><b>Webhook:</b> {assistantState.missing.webhook.join(", ")}</span> : null}
          {assistantState.missing?.telegram?.length ? <span><b>Telegram:</b> {assistantState.missing.telegram.join(", ")}</span> : null}
        </div> : null}
      </div>
      <div className="social-inbox-assistant-actions">
        <button
          type="button"
          disabled={testingTelegram || !assistantState.notification_ready}
          onClick={testTelegram}
        >
          {testingTelegram ? "Testing…" : "Test Telegram"}
        </button>
        {!assistantState.automation_active ? <button
          type="button"
          disabled={activatingAssistant || !assistantState?.env?.production || !assistantState.webhook_ready || !assistantState.notification_ready}
          onClick={activateAssistant}
          title={!assistantState?.env?.production ? "Activation is available only on the production Control Center." : ""}
        >
          {activatingAssistant ? "Activating…" : (assistantState?.env?.production ? "Activate automation" : "Activate after merge")}
        </button> : <strong className="social-inbox-assistant-live">LIVE</strong>}
      </div>
      {telegramTestStatus ? <small className="social-inbox-telegram-test">{telegramTestStatus}</small> : null}
    </div> : null}

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
            {draftByThread.get(thread.id) ? <em className={`social-inbox-draft-pill ${draftByThread.get(thread.id).status}`}>
              {draftByThread.get(thread.id).status === "ready" ? "DRAFT READY" : "NEEDS REVIEW"}
            </em> : null}
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
              <div>
                <span>{selectedDraft?.status === "ready" ? "ASSISTANT DRAFT" : "FACEBOOK REPLY"}</span>
                <strong>{selectedDraft?.status === "ready"
                  ? `Prepared automatically · ${Math.round(Number(selectedDraft.confidence || 0) * 100)}% rule confidence`
                  : "Draft → review → Approve & Send"}</strong>
              </div>
              <small>Meta 24-hour response window is enforced server-side.</small>
            </div>
            {selectedDraft?.status === "needs_review" ? <div className="social-inbox-needs-review">
              <strong>Assistant needs your review</strong>
              <span>{selectedDraft.reason || "This message does not match a safe deterministic rule."}</span>
            </div> : null}
            <textarea
              value={replyText}
              maxLength={2000}
              rows={3}
              disabled={sendingReply}
              placeholder={selectedDraft?.status === "needs_review" ? "Write the reply manually…" : "Write a Facebook reply…"}
              onChange={(event) => {
                setReplyText(event.target.value);
                setReplyError("");
                setReplyStatus("");
              }}
            />
            {replyError ? <div className="social-inbox-reply-error">{replyError}</div> : null}
            {replyStatus ? <div className="social-inbox-reply-success">{replyStatus}</div> : null}
            <div className="social-inbox-reply-actions">
              <small>
                {selectedDraft?.status === "ready"
                  ? (replyText.trim() === String(selectedDraft.body || "").trim() ? "ASSISTANT · UNEDITED" : "ASSISTANT · EDITED")
                  : `${replyText.length}/2000`}
              </small>
              <button
                type="button"
                disabled={sendingReply || !replyText.trim()}
                onClick={sendFacebookReply}
              >
                {sendingReply ? "Sending…" : "Approve & Send"}
              </button>
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
  const [open, setOpen] = useState(() => Boolean(initialInboxThread()));
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

    const close = () => {
      setOpen(false);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("inbox")) {
          url.searchParams.delete("inbox");
          window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        }
      }
    };
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
      if (description) description.textContent = "Automatic Facebook intake, prepared PlayNice drafts, and explicit approval before every send.";
      if (publishBadge) publishBadge.textContent = "ASSISTED SEND";
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
