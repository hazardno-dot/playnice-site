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

export default function WorkflowManager() {
  const [slot, setSlot] = useState(null);
  const [data, setData] = useState({ productDrafts: [], heroDrafts: [], journalDrafts: [], noteDrafts: [], publishHistory: [], auditLog: [], heroSlides: 0 });
  const [error, setError] = useState("");
  const noteAudit = useMemo(() => auditProductNotes(products), []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading !== "Workflow") { setSlot(null); return; }
      let nextSlot = placeholder.querySelector("#workflow-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("analytics-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "workflow-manager-slot";
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
    if (!slot) return;
    let cancelled = false;
    const load = async () => {
      const since = thirtyDaysAgo();
      const results = await Promise.all([
        supabase.from("product_drafts").select("product_slug,review_status,updated_at,apply_pr_number,published_at").order("updated_at", { ascending: false }),
        supabase.from("hero_drafts").select("hero_key,review_status,updated_at,apply_pr_number,preview_verified_at").order("updated_at", { ascending: false }),
        supabase.from("journal_drafts").select("article_id,review_status,updated_at,apply_pr_number").order("updated_at", { ascending: false }),
        supabase.from("note_drafts").select("note_key,review_status,updated_at,apply_pr_number").order("updated_at", { ascending: false }),
        supabase.from("publish_history").select("product_slug,published_at,apply_pr_number,published_commit_sha").gte("published_at", since).order("published_at", { ascending: false }).limit(30),
        supabase.from("draft_audit_log").select("id,product_slug,action,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(30),
        supabase.from("hero_slides").select("hero_key", { count: "exact", head: true }).eq("enabled", true)
      ]);
      if (cancelled) return;
      const firstError = results.find((result) => result.error)?.error;
      setError(firstError?.message || "");
      setData({
        productDrafts: results[0].data || [],
        heroDrafts: results[1].data || [],
        journalDrafts: results[2].data || [],
        noteDrafts: results[3].data || [],
        publishHistory: results[4].data || [],
        auditLog: results[5].data || [],
        heroSlides: results[6].count || 0
      });
    };
    load();
    const channels = ["product_drafts", "hero_drafts", "journal_drafts", "note_drafts", "publish_history", "draft_audit_log"].map((table) =>
      supabase.channel(`workflow-${table}`).on("postgres_changes", { event: "*", schema: "public", table }, load).subscribe()
    );
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      channels.forEach((channel) => supabase.removeChannel(channel));
      window.removeEventListener("focus", onFocus);
    };
  }, [slot]);

  if (!slot) return null;

  const productStatus = countStatuses(data.productDrafts);
  const heroStatus = countStatuses(data.heroDrafts);
  const journalStatus = countStatuses(data.journalDrafts);
  const noteStatus = countStatuses(data.noteDrafts);
  const allManaged = [...data.productDrafts, ...data.heroDrafts, ...data.journalDrafts, ...data.noteDrafts];
  const totalDrafts = allManaged.length;
  const totalApproved = productStatus.approved + heroStatus.approved + journalStatus.approved + noteStatus.approved;
  const openPrs = allManaged.filter((row) => row.apply_pr_number).length;
  const verifiedHeroPreviews = data.heroDrafts.filter((row) => row.preview_verified_at).length;
  const recent = [
    ...data.publishHistory.map((row) => ({ type: "PUBLISH", subject: row.product_slug, detail: row.apply_pr_number ? `PR #${row.apply_pr_number}` : "published", at: row.published_at })),
    ...data.auditLog.map((row) => ({ type: "PRODUCT", subject: row.product_slug, detail: String(row.action || "activity").replace(/_/g, " "), at: row.created_at })),
    ...data.heroDrafts.filter((row) => row.updated_at).map((row) => ({ type: "HERO", subject: row.hero_key, detail: row.preview_verified_at ? "preview verified" : String(row.review_status || "draft"), at: row.updated_at }))
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);

  return createPortal(<section className="analytics-manager workflow-intelligence">
    {error ? <div className="analytics-error">{error}</div> : null}
    <div className="sales-section-head">
      <div><span>CONTROL CENTER / SYSTEM</span><h2>Workflow intelligence</h2><p>Draft state, release queue and recent Control Center activity.</p></div>
      <div className="sales-head-meta"><span className="analytics-live ok">REALTIME</span><small>Operational telemetry</small></div>
    </div>

    <div className="analytics-kpis">
      <div><span>PRODUCTS</span><strong>{products.length}</strong><small>live catalog</small></div>
      <div><span>HERO</span><strong>{data.heroSlides}</strong><small>managed live slides</small></div>
      <div><span>JOURNAL</span><strong>{journalArticles.length}</strong><small>live articles</small></div>
      <div><span>NOTES</span><strong>{noteAudit.uniqueNotes}</strong><small>{noteAudit.placements} placements</small></div>
      <div><span>ACTIVE DRAFTS</span><strong>{totalDrafts}</strong><small>all managed modules</small></div>
      <div><span>APPROVED</span><strong>{totalApproved}</strong><small>awaiting next step</small></div>
    </div>

    <div className="analytics-grid">
      <article className="analytics-panel workflow-panel"><div className="analytics-panel-head"><div><span>WORKFLOW</span><h3>Draft state by module</h3></div><small>Realtime</small></div>
        <div className="workflow-table">
          {[
            {name:"Products", total:data.productDrafts.length, status:productStatus},
            {name:"Hero", total:data.heroDrafts.length, status:heroStatus},
            {name:"Journal", total:data.journalDrafts.length, status:journalStatus},
            {name:"Notes", total:data.noteDrafts.length, status:noteStatus}
          ].map((row) => <div className="workflow-row" key={row.name}><strong>{row.name}</strong><span>{row.total}</span><em className="draft">D {row.status.draft}</em><em className="ready">R {row.status.ready}</em><em className="approved">A {row.status.approved}</em></div>)}
        </div>
      </article>

      <article className="analytics-panel"><div className="analytics-panel-head"><div><span>CONTROLLED APPLY</span><h3>Release queue</h3></div><strong>{openPrs}</strong></div>
        <div className="analytics-summary"><div><span>Draft PR metadata</span><strong>{openPrs}</strong></div><div><span>Hero previews verified</span><strong>{verifiedHeroPreviews}</strong></div></div>
        <p className="analytics-note">Apply metadata is operational state only. Merge remains manual and Production is never changed from this surface.</p>
      </article>
    </div>

    <article className="analytics-panel activity-panel"><div className="analytics-panel-head"><div><span>RECENT ACTIVITY</span><h3>Latest workflow events</h3></div><small>Newest first</small></div>
      <div className="activity-list">{recent.length ? recent.map((item, index) => <div className="activity-row" key={`${item.type}-${item.subject}-${item.at}-${index}`}><span className={item.type.toLowerCase()}>{item.type}</span><strong>{item.subject || "—"}</strong><small>{item.detail}</small><time>{fmtDate(item.at)}</time></div>) : <div className="activity-empty">No workflow activity recorded in the last 30 days.</div>}</div>
    </article>
  </section>, slot);
}
