import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { supabase } from "./supabase";
import { auditHeroSlides, heroRowToSlide } from "./heroAudit.mjs";
import { mergeHeroDrafts } from "./heroDraft.mjs";
import "./hero-review.css";

const productSlugs = products.map((product) => product.slug);
const HERO_WORKFLOW_UPDATED_EVENT = "playnice:hero-workflow-updated";

const statusLabel = (status) => status === "approved" ? "APPROVED" : status === "ready" ? "READY FOR REVIEW" : "DRAFT";

function ensureWorkflowSlot(detail) {
  let workflowSlot = detail.querySelector("#hero-workflow-slot");
  if (!workflowSlot) {
    workflowSlot = document.createElement("div");
    workflowSlot.id = "hero-workflow-slot";
    workflowSlot.className = "hero-workflow-stack";
    const footer = detail.querySelector(".hero-draft-footer");
    detail.insertBefore(workflowSlot, footer || null);
  }
  let reviewSlot = workflowSlot.querySelector("#hero-review-slot");
  if (!reviewSlot) {
    reviewSlot = document.createElement("div");
    reviewSlot.id = "hero-review-slot";
    const applySlot = workflowSlot.querySelector("#hero-controlled-apply-slot");
    workflowSlot.insertBefore(reviewSlot, applySlot || null);
  }
  return reviewSlot;
}

export default function HeroReviewBridge() {
  const [slot, setSlot] = useState(null);
  const [heroKey, setHeroKey] = useState("");
  const [row, setRow] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const lastDraftSignature = useRef("");

  const loadSelectedRow = useCallback(async (key) => {
    if (!key) { setRow(null); return; }
    const { data, error: loadError } = await supabase
      .from("hero_drafts")
      .select("hero_key,payload,review_status,reviewed_at,reviewed_by,approved_payload,baseline_snapshot,updated_at,apply_branch,apply_pr_number")
      .eq("hero_key", key)
      .maybeSingle();
    if (loadError) { setError(loadError.message || String(loadError)); return; }
    setError("");
    setRow(data || null);
  }, []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    let raf = 0;

    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const heading = mainStage.querySelector(".topbar h1");
        const detail = mainStage.querySelector(".hero-manager-detail");
        const active = mainStage.querySelector(".hero-slide-row.is-active");
        if (heading?.textContent?.trim() !== "Hero" || !detail || !active) {
          setSlot(null);
          setHeroKey("");
          setRow(null);
          lastDraftSignature.current = "";
          return;
        }

        setSlot(ensureWorkflowSlot(detail));
        const id = Number(active.textContent?.match(/#(\d+)/)?.[1]);
        if (!id) return;
        supabase.from("hero_slides").select("hero_key").eq("id", id).maybeSingle().then(({ data }) => {
          const key = data?.hero_key || "";
          setHeroKey((current) => current === key ? current : key);
          const hasDraftUi = Boolean(detail.querySelector(".hero-draft-footer"));
          const signature = `${key}:${hasDraftUi ? "draft" : "baseline"}`;
          if (key && signature !== lastDraftSignature.current) {
            lastDraftSignature.current = signature;
            loadSelectedRow(key);
          }
        });
      });
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [loadSelectedRow]);

  useEffect(() => { loadSelectedRow(heroKey); }, [heroKey, loadSelectedRow]);

  useEffect(() => {
    if (!heroKey) return;
    const channel = supabase.channel(`hero-review-${heroKey}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_drafts", filter: `hero_key=eq.${heroKey}` }, () => loadSelectedRow(heroKey))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [heroKey, loadSelectedRow]);

  const validateHeroSet = async () => {
    const [{ data: baselineRows, error: baselineError }, { data: draftRows, error: draftError }] = await Promise.all([
      supabase.from("hero_slides").select("id,hero_key,kind,enabled,pinned_first,position,image,desktop_image,mobile_image,alt,action_type,product_slug,preferred_size,collection_title,collection_slugs,manifesto_type").eq("enabled", true).order("position", { ascending: true }),
      supabase.from("hero_drafts").select("hero_key,payload,review_status,updated_at,baseline_snapshot")
    ]);
    if (baselineError) throw baselineError;
    if (draftError) throw draftError;
    const baseline = (baselineRows || []).map(heroRowToSlide);
    const drafts = Object.fromEntries((draftRows || []).map((item) => [item.hero_key, item]));
    const effective = mergeHeroDrafts(baseline, drafts);
    const audit = auditHeroSlides(effective, { productSlugs });
    if (audit.errors.length) throw new Error(`Hero validation failed: ${audit.errors[0].message}`);
  };

  const setReviewStatus = async (nextStatus) => {
    if (!row || !heroKey) return;
    setWorking(true); setError("");
    try {
      await validateHeroSet();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) throw authError || new Error("Authenticated admin session required.");
      const userId = authData.user.id;
      const patch = nextStatus === "approved"
        ? { review_status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: userId, approved_payload: row.payload }
        : nextStatus === "ready"
          ? { review_status: "ready", reviewed_at: null, reviewed_by: null, approved_payload: null }
          : {
              review_status: "draft",
              reviewed_at: null,
              reviewed_by: null,
              approved_payload: null,
              apply_branch: null,
              apply_pr_number: null,
              apply_created_at: null,
              apply_created_by: null,
              preview_verified_at: null,
              preview_verified_by: null,
            };
      const { data, error: updateError } = await supabase
        .from("hero_drafts")
        .update(patch)
        .eq("hero_key", heroKey)
        .select("hero_key,payload,review_status,reviewed_at,reviewed_by,approved_payload,baseline_snapshot,updated_at,apply_branch,apply_pr_number")
        .single();
      if (updateError) throw updateError;
      setRow(data);
      window.dispatchEvent(new CustomEvent(HERO_WORKFLOW_UPDATED_EVENT, { detail: { heroKey, reviewStatus: data.review_status } }));
    } catch (reviewError) {
      setError(reviewError.message || String(reviewError));
    } finally {
      setWorking(false);
    }
  };

  const status = row?.review_status || "draft";
  const approvedLocked = status === "approved";
  const copy = useMemo(() => {
    if (status === "approved") return "Approved payload is frozen for the future Apply step. Production is still untouched.";
    if (status === "ready") return "Draft passed validation and is waiting for explicit approval.";
    return "Draft is editable and has not entered review yet.";
  }, [status]);

  if (!slot || !row) return null;

  return createPortal(<section className={`hero-review-panel status-${status}`}>
    <div className="hero-review-head">
      <div><span>REVIEW WORKFLOW</span><strong>{statusLabel(status)}</strong><small>{copy}</small></div>
      <span className={`hero-review-status ${status}`}>{statusLabel(status)}</span>
    </div>
    {error ? <div className="hero-review-error">{error}</div> : null}
    <div className="hero-review-actions">
      {status === "draft" ? <button className="primary" disabled={working} onClick={() => setReviewStatus("ready")}>{working ? "Checking…" : "Ready for review"}</button> : null}
      {status === "ready" ? <><button disabled={working} onClick={() => setReviewStatus("draft")}>Return to draft</button><button className="primary" disabled={working} onClick={() => setReviewStatus("approved")}>{working ? "Checking…" : "Approve Hero draft"}</button></> : null}
      {approvedLocked ? <button disabled={working} onClick={() => setReviewStatus("draft")}>Return to draft</button> : null}
    </div>
    {status === "approved" && row.reviewed_at ? <div className="hero-review-meta">Approved {new Date(row.reviewed_at).toLocaleString()} · approved snapshot stored in Supabase</div> : null}
  </section>, slot);
}
