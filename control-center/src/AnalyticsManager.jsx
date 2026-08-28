import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { journalArticles } from "@shop/data/journal/index.js";
import { auditProductNotes } from "./noteAudit.mjs";
import { supabase } from "./supabase";
import "./analytics-manager.css";

const STATUS_ORDER = ["draft", "ready", "approved"];
const fmtDate = (value) => value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const countStatuses = (rows = []) => STATUS_ORDER.reduce((out, status) => ({ ...out, [status]: rows.filter((row) => String(row.review_status || "draft").toLowerCase() === status).length }), {});

export default function AnalyticsManager() {
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ productDrafts: [], journalDrafts: [], noteDrafts: [], publishHistory: [], auditLog: [] });
  const noteAudit = useMemo(() => auditProductNotes(products), []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading !== "Analytics") { setSlot(null); return; }
      let nextSlot = placeholder.querySelector("#analytics-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("analytics-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "analytics-manager-slot";
        nextSlot.className = "analytics-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const since = thirtyDaysAgo();
      const [productDrafts, journalDrafts, noteDrafts, publishHistory, auditLog] = await Promise.all([
        supabase.from("product_drafts").select("product_slug,review_status,updated_at,apply_pr_number,published_at").order("updated_at", { ascending: false }),
        supabase.from("journal_drafts").select("article_id,review_status,updated_at,apply_pr_number").order("updated_at", { ascending: false }),
        supabase.from("note_drafts").select("note_key,review_status,updated_at,apply_pr_number").order("updated_at", { ascending: false }),
        supabase.from("publish_history").select("product_slug,published_at,apply_pr_number,published_commit_sha").gte("published_at", since).order("published_at", { ascending: false }).limit(30),
        supabase.from("draft_audit_log").select("id,product_slug,action,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(30),
      ]);
      if (cancelled) return;
      const firstError = [productDrafts, journalDrafts, noteDrafts, publishHistory, auditLog].find((result) => result.error)?.error;
      if (firstError) setError(firstError.message);
      else setError("");
      setData({
        productDrafts: productDrafts.data || [],
        journalDrafts: journalDrafts.data || [],
        noteDrafts: noteDrafts.data || [],
        publishHistory: publishHistory.data || [],
        auditLog: auditLog.data || [],
      });
      setLoading(false);
    };
    load();
    const channels = ["product_drafts", "journal_drafts", "note_drafts", "publish_history", "draft_audit_log"].map((table) =>
      supabase.channel(`analytics-${table}`).on("postgres_changes", { event: "*", schema: "public", table }, load).subscribe()
    );
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      channels.forEach((channel) => supabase.removeChannel(channel));
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const productStatus = useMemo(() => countStatuses(data.productDrafts), [data.productDrafts]);
  const journalStatus = useMemo(() => countStatuses(data.journalDrafts), [data.journalDrafts]);
  const noteStatus = useMemo(() => countStatuses(data.noteDrafts), [data.noteDrafts]);
  const totalDrafts = data.productDrafts.length + data.journalDrafts.length + data.noteDrafts.length;
  const totalApproved = productStatus.approved + journalStatus.approved + noteStatus.approved;
  const openPrs = [...data.productDrafts, ...data.journalDrafts, ...data.noteDrafts].filter((row) => row.apply_pr_number).length;

  const recent = useMemo(() => [
    ...data.publishHistory.map((row) => ({ type: "PUBLISH", subject: row.product_slug, detail: row.apply_pr_number ? `PR #${row.apply_pr_number}` : "published", at: row.published_at })),
    ...data.auditLog.map((row) => ({ type: "PRODUCT", subject: row.product_slug, detail: String(row.action || "activity").replace(/_/g, " "), at: row.created_at })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12), [data.publishHistory, data.auditLog]);

  if (!slot) return null;
  return createPortal(<section className="analytics-manager">
    <div className="analytics-head">
      <div><span>CONTROL CENTER INTELLIGENCE</span><h2>Operational analytics</h2><p>Live catalog + Supabase workflow telemetry. Traffic and conversion analytics are intentionally separate until a web analytics source is connected.</p></div>
      <div className={`analytics-live ${loading ? "loading" : error ? "error" : "ok"}`}>{loading ? "SYNCING" : error ? "PARTIAL DATA" : "LIVE"}</div>
    </div>
    {error ? <div className="analytics-error">{error}</div> : null}

    <div className="analytics-kpis">
      <div><span>PRODUCTS</span><strong>{products.length}</strong><small>live catalog</small></div>
      <div><span>JOURNAL</span><strong>{journalArticles.length}</strong><small>live articles</small></div>
      <div><span>NOTES</span><strong>{noteAudit.uniqueNotes}</strong><small>{noteAudit.placements} placements</small></div>
      <div><span>ACTIVE DRAFTS</span><strong>{totalDrafts}</strong><small>all managed modules</small></div>
      <div><span>APPROVED</span><strong>{totalApproved}</strong><small>awaiting next step</small></div>
      <div><span>DRAFT PRS</span><strong>{openPrs}</strong><small>apply metadata present</small></div>
    </div>

    <div className="analytics-grid">
      <article className="analytics-panel workflow-panel"><div className="analytics-panel-head"><div><span>WORKFLOW</span><h3>Draft state by module</h3></div><small>Realtime</small></div>
        <div className="workflow-table">
          {[{name:"Products", total:data.productDrafts.length, status:productStatus},{name:"Journal", total:data.journalDrafts.length, status:journalStatus},{name:"Notes", total:data.noteDrafts.length, status:noteStatus}].map((row) => <div className="workflow-row" key={row.name}><strong>{row.name}</strong><span>{row.total}</span><em className="draft">D {row.status.draft}</em><em className="ready">R {row.status.ready}</em><em className="approved">A {row.status.approved}</em></div>)}
        </div>
      </article>

      <article className="analytics-panel"><div className="analytics-panel-head"><div><span>30 DAYS</span><h3>Publishing activity</h3></div><strong>{data.publishHistory.length}</strong></div>
        <div className="analytics-summary"><div><span>Published products</span><strong>{new Set(data.publishHistory.map((row) => row.product_slug)).size}</strong></div><div><span>Logged product actions</span><strong>{data.auditLog.length}</strong></div></div>
        <p className="analytics-note">This is Control Center operational history, not customer traffic. GA/Vercel traffic metrics can be connected as a separate source without changing the draft workflow.</p>
      </article>
    </div>

    <article className="analytics-panel activity-panel"><div className="analytics-panel-head"><div><span>RECENT ACTIVITY</span><h3>Latest workflow events</h3></div><small>Newest first</small></div>
      <div className="activity-list">{recent.length ? recent.map((item, index) => <div className="activity-row" key={`${item.type}-${item.subject}-${item.at}-${index}`}><span className={item.type === "PUBLISH" ? "publish" : "product"}>{item.type}</span><strong>{item.subject || "—"}</strong><small>{item.detail}</small><time>{fmtDate(item.at)}</time></div>) : <div className="activity-empty">No workflow activity recorded in the last 30 days.</div>}</div>
    </article>
  </section>, slot);
}
