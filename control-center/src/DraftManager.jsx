import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { products } from "@shop/data/products/index.js";
import { productCopy } from "@shop/data/products/productCopy.js";
import { productWearContext } from "@shop/data/products/productWearContext.js";
import discoveryProfiles from "@shop/data/products/discoveryProfiles.js";
import { validateProductDraft } from "./draftValidation";
import { makeLiveSnapshot, snapshotsEqual, buildPatchPlan } from "./prepublish";
import { requestOpenProduct } from "./productNavigation.mjs";
import "./draft-manager.css";

const formatDate = (value) => {
  if (!value) return "Unknown time";
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  } catch { return value; }
};

const getLiveProduct = (slug) => products.find((p) => p.slug === slug);
const normalize = (value) => value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
const asCsv = (value) => Array.isArray(value) ? value.join(", ") : String(value ?? "");
const same = (a, b) => normalize(a) === normalize(b);
const pushChange = (arr, section, label, liveValue, draftValue) => { if (!same(liveValue, draftValue)) arr.push({ section, label, liveValue, draftValue }); };

function buildChanges(live, draft) {
  if (!draft) return [];
  live = live || { name:"", shortName:"", category:"", image:"", inspiredBy:{}, badge:"", rating:"", ratingLabel:"", season:"", moods:[], sizes:{}, noteMap:{top:[],heart:[],base:[]}, recommendations:[], slug:"" };
  const changes = []; const core = draft.core || {};
  pushChange(changes, "Core", "Name", live.name, core.name);
  pushChange(changes, "Core", "Short name", live.shortName, core.shortName);
  pushChange(changes, "Core", "Category", live.category, core.category);
  pushChange(changes, "Core", "Image path", live.image, core.image);
  pushChange(changes, "Core", "Inspired by · name", live.inspiredBy?.name || "", core.inspiredBy?.name || "");
  pushChange(changes, "Core", "Inspired by · short", live.inspiredBy?.short || "", core.inspiredBy?.short || "");
  pushChange(changes, "Core", "Badge", live.badge, core.badge);
  pushChange(changes, "Core", "Rating", String(live.rating ?? ""), String(core.rating ?? ""));
  pushChange(changes, "Core", "Rating label", live.ratingLabel, core.ratingLabel);
  pushChange(changes, "Core", "Season", live.season, core.season);
  pushChange(changes, "Core", "Moods", asCsv(live.moods), core.moods);

  const liveSizes = live.sizes || {}, draftSizes = core.sizes || {};
  [...new Set([...Object.keys(liveSizes), ...Object.keys(draftSizes)])].forEach((size) => pushChange(changes, "Prices", size, String(liveSizes[size] ?? ""), String(draftSizes[size] ?? "")));
  ["top", "heart", "base"].forEach((level) => pushChange(changes, "Notes", level, asCsv(live.noteMap?.[level] || []), core.noteMap?.[level] || ""));
  pushChange(changes, "Recommendations", "Linked products", asCsv(live.recommendations || []), core.recommendations || "");

  const liveCopy = productCopy[live.name] || {}, draftCopy = draft.copy || {};
  ["miniTag", "scentType", "card", "modal", "whyChoose"].forEach((key) => ["sr", "en"].forEach((lang) => pushChange(changes, "Copy", `${key} · ${lang.toUpperCase()}`, liveCopy?.[key]?.[lang] || "", draftCopy?.[key]?.[lang] || "")));
  const liveWear = productWearContext[live.name] || {}, draftWear = draft.wear || {};
  ["sr", "en"].forEach((lang) => pushChange(changes, "Wear", lang.toUpperCase(), liveWear?.[lang] || "", draftWear?.[lang] || ""));
  const liveDiscovery = discoveryProfiles[live.slug] || {}, draftDiscovery = draft.discovery || {};
  [...new Set([...Object.keys(liveDiscovery), ...Object.keys(draftDiscovery)])].forEach((key) => pushChange(changes, "Discovery", key.replace(/[-_]/g, " "), String(liveDiscovery[key] ?? ""), String(draftDiscovery[key] ?? "")));
  return changes;
}

function groupChanges(changes) { return changes.reduce((acc, change) => { (acc[change.section] ||= []).push(change); return acc; }, {}); }
function displayValue(value) { const text = String(value ?? ""); return text.length ? text : "—"; }
const workflowLabel = (status) => status === "approved" ? "APPROVED" : status === "ready" ? "READY FOR REVIEW" : "DRAFT";

export default function DraftManager() {
  const [open, setOpen] = useState(false), [drafts, setDrafts] = useState([]), [loading, setLoading] = useState(true), [expanded, setExpanded] = useState(null), [error, setError] = useState(""), [acting, setActing] = useState("");
  const load = async ({ quiet = false } = {}) => {
    if (!quiet) { setLoading(true); setError(""); }
    const { data, error: loadError } = await supabase.from("product_drafts").select("product_slug,payload,updated_at,review_status,reviewed_at,reviewed_by,baseline_snapshot,approved_payload,prepared_at,prepared_by").order("updated_at", { ascending: false });
    if (loadError) { setError(loadError.message || "Could not load drafts."); if (!quiet) setLoading(false); return; }
    setDrafts(data || []); setLoading(false);
  };
  useEffect(() => {
    let cancelled = false;
    load();
    const channel = supabase.channel("draft-manager-product-drafts").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "product_drafts" },
      () => { if (!cancelled) load({ quiet: true }); }
    ).subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, []);

  const count = drafts.length;
  const draftRows = useMemo(() => drafts.map((row) => {
    const live = getLiveProduct(row.product_slug), changes = buildChanges(live, row.payload), validation = validateProductDraft(live, row.payload);
    const currentSnapshot = live ? makeLiveSnapshot(live) : { kind: "new_product", product_slug: row.product_slug };
    const drifted = Boolean(row.baseline_snapshot) && !snapshotsEqual(row.baseline_snapshot, currentSnapshot);
    const patchPlan = buildPatchPlan(changes);
    const readyToApply = row.review_status === "approved" && !drifted && validation.status !== "blocked" && Boolean(row.prepared_at);
    return { ...row, live, changes, groupedChanges: groupChanges(changes), validation, currentSnapshot, drifted, patchPlan, readyToApply };
  }), [drafts]);

  const audit = async (slug, action, details = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("draft_audit_log").insert({ product_slug: slug, actor_id: user.id, action, details });
  };

  const discard = async (slug) => {
    if (!window.confirm(`Discard unpublished draft for ${slug}? This cannot be undone.`)) return;
    await audit(slug, "discarded");
    const { error: deleteError } = await supabase.from("product_drafts").delete().eq("product_slug", slug);
    if (deleteError) { setError(deleteError.message || "Could not discard draft."); return; }
    setDrafts((current) => current.filter((row) => row.product_slug !== slug)); setExpanded(null);
  };

  const setWorkflowStatus = async (row, nextStatus) => {
    if (row.validation.status === "blocked" && nextStatus !== "draft") {
      setError("Blocked drafts cannot move forward. Fix validation errors first."); return;
    }
    setActing(`${row.product_slug}:${nextStatus}`); setError("");
    const patch = { review_status: nextStatus, prepared_at: null, prepared_by: null };
    if (nextStatus === "approved") {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { setError(userError?.message || "No authenticated admin session."); setActing(""); return; }
      patch.reviewed_at = new Date().toISOString();
      patch.reviewed_by = user.id;
      patch.approved_payload = row.payload;
    } else {
      patch.reviewed_at = null;
      patch.reviewed_by = null;
      patch.approved_payload = null;
    }
    const { error: updateError } = await supabase.from("product_drafts").update(patch).eq("product_slug", row.product_slug);
    if (updateError) setError(updateError.message || "Could not update review status.");
    else await audit(row.product_slug, nextStatus === "approved" ? "approved" : nextStatus === "ready" ? "marked_ready" : "returned_to_draft", { change_count: row.changes.length });
    await load({ quiet: true }); setActing("");
  };

  const prepareApply = async (row) => {
    if (row.review_status !== "approved" || row.validation.status === "blocked") return;
    setActing(`${row.product_slug}:prepare`); setError("");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { setError(userError?.message || "No authenticated admin session."); setActing(""); return; }
    const baseline = row.baseline_snapshot || row.currentSnapshot;
    const drifted = !snapshotsEqual(baseline, row.currentSnapshot);
    if (drifted) {
      setError("LIVE DRIFT detected. The Shop data changed after the preparation baseline was captured. Return this item to draft and review again.");
      setActing(""); return;
    }
    const now = new Date().toISOString();
    const { error: updateError } = await supabase.from("product_drafts").update({ baseline_snapshot: baseline, prepared_at: now, prepared_by: user.id, approved_payload: row.payload }).eq("product_slug", row.product_slug);
    if (updateError) setError(updateError.message || "Could not prepare approved draft.");
    else await audit(row.product_slug, "prepared", { files: row.patchPlan.map((p) => p.file), change_count: row.changes.length });
    await load({ quiet: true }); setActing("");
  };

  const openProduct = (row) => {
    setOpen(false);
    requestOpenProduct(row.product_slug);
  };

  return <>
    <button className={`draft-manager-trigger ${count ? "has-drafts" : ""}`} onClick={() => { setOpen(true); load(); }}><span>Drafts</span><strong>{loading ? "…" : count}</strong></button>
    {open ? <div className="draft-manager-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <aside className="draft-manager-panel">
        <header className="draft-manager-head"><div><span className="eyebrow">SUPABASE / UNPUBLISHED</span><h2>Draft management</h2><p>{count} persistent draft{count === 1 ? "" : "s"}</p></div><button className="draft-manager-close" onClick={() => setOpen(false)}>×</button></header>
        <div className="draft-manager-notice">NO PUBLISH · Preparation only. No file or live Shop data can be changed here.</div>
        {error ? <div className="draft-manager-error">{error}</div> : null}
        <div className="draft-manager-list">
          {loading ? <div className="draft-manager-empty">Loading drafts…</div> : !draftRows.length ? <div className="draft-manager-empty">No unpublished drafts.</div> : draftRows.map((row) => {
            const title = row.payload?.core?.name || row.live?.name || row.product_slug, isExpanded = expanded === row.product_slug;
            const blocked = row.validation.status === "blocked", status = row.review_status || "draft", busy = acting.startsWith(`${row.product_slug}:`);
            return <article className="draft-manager-card" key={row.product_slug}>
              <div className="draft-manager-card-top">
                <div><strong>{title}</strong><span>{row.product_slug}</span><small>Updated {formatDate(row.updated_at)}</small>{row.reviewed_at ? <small>Approved {formatDate(row.reviewed_at)}</small> : null}{row.prepared_at ? <small>Prepared {formatDate(row.prepared_at)}</small> : null}</div>
                <div className="draft-card-badges"><span className={`draft-workflow-badge ${status}`}>{workflowLabel(status)}</span>{row.readyToApply ? <span className="draft-prep-badge ready">READY TO APPLY</span> : row.drifted ? <span className="draft-prep-badge drift">LIVE DRIFT</span> : null}<span className={`draft-validation-badge ${blocked ? "blocked" : "ready"}`}>{blocked ? `BLOCKED · ${row.validation.errors.length}` : "VALID"}</span><span className="draft-manager-change-count">{row.changes.length} change{row.changes.length === 1 ? "" : "s"}</span></div>
              </div>
              {isExpanded ? <div className="draft-manager-review full-diff">
                <section className={`draft-prepublish-panel ${row.drifted ? "drift" : row.readyToApply ? "ready" : "idle"}`}>
                  <div className="draft-validation-head"><strong>{row.drifted ? "Live data changed" : row.readyToApply ? "Pre-publish preparation passed" : "Pre-publish preparation"}</strong><span>{row.patchPlan.length} file{row.patchPlan.length === 1 ? "" : "s"}</span></div>
                  <p>{row.drifted ? "The current live dataset no longer matches the captured preparation baseline." : row.readyToApply ? "Approved payload, validation and live baseline are aligned. Nothing has been published." : status === "approved" ? "Generate a read-only file plan and capture the live baseline before any future apply step." : "Approval is required before preparation."}</p>
                </section>
                <section className={`draft-validation-panel ${blocked ? "blocked" : "ready"}`}>
                  <div className="draft-validation-head"><strong>{blocked ? "Validation blocked" : "Validation passed"}</strong><span>{row.validation.errors.length} errors · {row.validation.warnings.length} warnings</span></div>
                  {!row.validation.issues.length ? <p>All required product-data checks passed.</p> : <div className="draft-validation-list">{row.validation.issues.map((item, index) => <div className={`draft-validation-item ${item.level}`} key={`${item.section}-${item.field}-${index}`}><span>{item.level === "error" ? "!" : "△"}</span><div><strong>{item.section} · {item.field}</strong><p>{item.message}</p></div></div>)}</div>}
                </section>
                {!row.changes.length ? <p className="draft-manager-no-core">Draft matches current live data.</p> : Object.entries(row.groupedChanges).map(([section, items]) => <section className="draft-review-section" key={section}>
                  <div className="draft-review-section-head"><strong>{section}</strong><span>{items.length} change{items.length === 1 ? "" : "s"}</span></div>
                  <div className="draft-review-section-body">{items.map((change) => <div className="draft-change" key={`${section}-${change.label}`}><span>{change.label}</span><div><small>LIVE</small><p>{displayValue(change.liveValue)}</p></div><div><small>DRAFT</small><p>{displayValue(change.draftValue)}</p></div></div>)}</div>
                </section>)}
                {status === "approved" ? <section className="draft-patch-plan"><div className="draft-review-section-head"><strong>Generated patch preview</strong><span>READ ONLY</span></div><div className="draft-patch-files">{row.patchPlan.map((plan) => <div className="draft-patch-file" key={plan.file}><strong>{plan.file}</strong>{plan.items.map((item) => <p key={`${plan.file}-${item.section}-${item.label}`}>{item.section} · {item.label}: <span>{displayValue(item.liveValue)}</span> → <b>{displayValue(item.draftValue)}</b></p>)}</div>)}</div></section> : null}
              </div> : null}
              <div className="draft-manager-actions">
                <button onClick={() => setExpanded(isExpanded ? null : row.product_slug)}>{isExpanded ? "Hide review" : "Review changes"}</button>
                <button onClick={() => openProduct(row)}>Open product</button>
                {status === "draft" ? <button className="workflow" disabled={blocked || busy} onClick={() => setWorkflowStatus(row, "ready")}>{busy ? "Updating…" : "Mark ready for review"}</button> : null}
                {status === "ready" ? <button className="workflow approve" disabled={blocked || busy} onClick={() => setWorkflowStatus(row, "approved")}>{busy ? "Updating…" : "Approve"}</button> : null}
                {status === "approved" && !row.prepared_at ? <button className="workflow prepare" disabled={blocked || busy} onClick={() => prepareApply(row)}>{busy ? "Preparing…" : "Prepare apply"}</button> : null}
                {status !== "draft" ? <button className="workflow secondary" disabled={busy} onClick={() => setWorkflowStatus(row, "draft")}>Return to draft</button> : null}
                <button className="danger" onClick={() => discard(row.product_slug)}>Discard draft</button>
              </div>
            </article>;
          })}
        </div>
      </aside>
    </div> : null}
  </>;
}
