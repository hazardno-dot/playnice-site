import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./social-instagram-test-publish.css";

const isControlledPublishEvent = (event) => Boolean(
  event?.metadata?.test ||
  event?.metadata?.replay ||
  event?.metadata?.manual_product_post ||
  event?.metadata?.manual_hero_post ||
  event?.metadata?.manual_journal_post ||
  String(event?.metadata?.producer || "").startsWith("social-manual-") ||
  String(event?.source_id || "").includes("--shadow-test-") ||
  String(event?.source_id || "").includes("--shadow-replay-") ||
  String(event?.source_id || "").includes("--manual-social-")
);

const facebookMediaSrc = (event) => String(
  event?.approved_content?.facebook?.media?.src ||
  event?.approved_content?.facebook?.media?.url ||
  ""
).trim();

const isFacebookImageCandidate = (event) => {
  const src = facebookMediaSrc(event);
  if (!src) return false;
  try {
    const pathname = new URL(src, "https://www.playniceshop.me").pathname.toLowerCase();
    return pathname.endsWith(".jpg") || pathname.endsWith(".jpeg") || pathname.endsWith(".png");
  } catch {
    return false;
  }
};

const titleFor = (event) => event?.payload?.core?.shortName || event?.payload?.core?.name || event?.payload?.title?.sr || event?.payload?.name || event?.payload?.alt || event?.source_id || "Test event";

export default function SocialFacebookTestPublishBridge() {
  const [slot, setSlot] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEvent = async () => {
    const { data } = await supabase
      .from("social_events")
      .select("*")
      .in("status", ["ready", "scheduled"])
      .order("updated_at", { ascending: false })
      .limit(20);
    const candidate = (data || []).find((row) => isControlledPublishEvent(row) && isFacebookImageCandidate(row)) || null;
    setEvent(candidate);
  };

  useEffect(() => {
    let observer;
    const attach = () => {
      const social = document.querySelector(".social-manager");
      if (!social) { setSlot(null); return; }
      let node = social.querySelector("#social-facebook-test-publish-slot");
      if (!node) {
        node = document.createElement("div");
        node.id = "social-facebook-test-publish-slot";
        const instagram = social.querySelector("#social-instagram-test-publish-slot");
        if (instagram) instagram.insertAdjacentElement("afterend", node);
        else {
          const dryRun = social.querySelector(".social-dry-run");
          if (dryRun) dryRun.insertAdjacentElement("afterend", node);
          else social.appendChild(node);
        }
      }
      setSlot(node);
    };
    attach();
    observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadEvent();
    const refresh = () => loadEvent();
    window.addEventListener("playnice:social-state-updated", refresh);
    const channel = supabase.channel("social-facebook-test-publish-bridge")
      .on("postgres_changes", { event: "*", schema: "public", table: "social_events" }, loadEvent)
      .subscribe();
    return () => {
      window.removeEventListener("playnice:social-state-updated", refresh);
      supabase.removeChannel(channel);
    };
  }, []);

  const eventTitle = useMemo(() => titleFor(event), [event]);

  const publish = async () => {
    if (!event || loading) return;
    const confirmed = window.confirm(`REAL FACEBOOK POST\n\nPublish the approved Facebook post for “${eventTitle}” to PlayNice MNE now?\n\nThis creates a real public Facebook Page post. Instagram Story and scheduler remain locked.`);
    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { data: refreshData } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
      let token = refreshData?.session?.access_token;
      if (!token) {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token;
      }
      if (!token) throw new Error("Authenticated admin session is required.");

      const response = await fetch("/api/social-instagram-feed-test-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event_id: event.id, channel: "facebook" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Facebook test publish failed (${response.status}).`);
      setMessage(`Published Facebook post · ${payload?.result?.post_id || "Meta post created"}`);
      await loadEvent();
    } catch (publishError) {
      setError(publishError?.message || String(publishError));
    } finally {
      setLoading(false);
    }
  };

  if (!slot || (!event && !message && !error)) return null;
  return createPortal(
    <section className="social-instagram-test-publish">
      <div className="social-instagram-test-copy">
        <span>FACEBOOK PAGE · MANUAL PUBLISH</span>
        <strong>{event ? eventTitle : "No approved image publish candidate"}</strong>
        <p>{event ? "Approved Facebook media is ready for controlled manual publishing." : "Create a Social post, approve its Facebook visual, then mark it READY."}</p>
      </div>
      <div className="social-instagram-test-actions">
        {message ? <small className="ok">{message}</small> : null}
        {error ? <small className="error">{error}</small> : null}
        <button type="button" onClick={publish} disabled={!event || loading}>{loading ? "Publishing…" : "Publish Facebook Page"}</button>
      </div>
    </section>,
    slot,
  );
}
