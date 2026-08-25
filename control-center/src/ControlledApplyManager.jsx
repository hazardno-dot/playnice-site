import React, { useEffect, useMemo, useState } from "react";
import { products } from "@shop/data/products/index.js";
import { validateProductDraft } from "./draftValidation";
import { makeLiveSnapshot, snapshotsEqual } from "./prepublish";
import { supabase } from "./supabase";
import "./controlled-apply.css";

export default function ControlledApplyManager() {
  const [drafts, setDrafts] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("product_drafts")
      .select("product_slug,payload,review_status,prepared_at,baseline_snapshot,apply_branch,apply_pr_number,apply_created_at,preview_verified_at,preview_verified_by")
      .order("updated_at", { ascending: false });
    setDrafts(data || []);
  };

  useEffect(() => { load(); }, []);

  const readyRows = useMemo(() => drafts.filter((row) => {
    const live = products.find((p) => p.slug === row.product_slug);
    if (!live || row.review_status !== "approved" || !row.prepared_at) return false;
    const validation = validateProductDraft(live, row.payload);
    const current = makeLiveSnapshot(live);
    return validation.status !== "blocked" && row.baseline_snapshot && snapshotsEqual(row.baseline_snapshot, current);
  }), [drafts]);

  const createApply = async (row) => {
    setBusy(`create:${row.product_slug}`);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");
      const response = await fetch("/api/create-apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_slug: row.product_slug }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Could not create controlled apply branch.");
      await load();
    } catch (e) {
      setError(e?.message || "Controlled apply failed.");
    } finally {
      setBusy("");
    }
  };

  const verifyPreview = async (row) => {
    setBusy(`verify:${row.product_slug}`);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Admin session expired. Sign in again.");
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("product_drafts")
        .update({ preview_verified_at: now, preview_verified_by: user.id })
        .eq("product_slug", row.product_slug);
      if (updateError) throw updateError;

      await supabase.from("draft_audit_log").insert({
        product_slug: row.product_slug,
        actor_id: user.id,
        action: "preview_verified",
        details: { branch: row.apply_branch, pr_number: row.apply_pr_number },
      });
      await load();
    } catch (e) {
      setError(e?.message || "Could not verify preview.");
    } finally {
      setBusy("");
    }
  };

  if (!readyRows.length && !error) return null;

  return <div className="controlled-apply-box">
    <div className="controlled-apply-head">
      <div><span>CONTROLLED APPLY</span><strong>{readyRows.length} ready</strong></div>
      <small>Manual verification required · never merges automatically</small>
    </div>

    {readyRows.map((row) => {
      const hasApply = Boolean(row.apply_branch && row.apply_pr_number);
      const verified = Boolean(row.preview_verified_at);
      return <div className="controlled-apply-row controlled-apply-row-stack" key={row.product_slug}>
        <div className="controlled-apply-primary">
          <div>
            <strong>{row.product_slug}</strong>
            <span>{verified ? "PREVIEW VERIFIED · READY TO MERGE" : hasApply ? "PREVIEW CREATED · VERIFICATION REQUIRED" : "APPROVED · READY TO APPLY"}</span>
          </div>
          {!hasApply ? <button disabled={busy === `create:${row.product_slug}`} onClick={() => createApply(row)}>
            {busy === `create:${row.product_slug}` ? "Creating…" : "Create preview branch"}
          </button> : null}
          {hasApply && !verified ? <button disabled={busy === `verify:${row.product_slug}`} onClick={() => verifyPreview(row)}>
            {busy === `verify:${row.product_slug}` ? "Saving…" : "Mark preview verified"}
          </button> : null}
        </div>

        {hasApply ? <div className={`controlled-apply-result ${verified ? "controlled-apply-verified" : ""}`}>
          <strong>{verified ? "Ready to merge" : "Preview branch created"}</strong>
          <span>{row.apply_branch}</span>
          <a href={`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`} target="_blank" rel="noreferrer">
            Open draft PR #{row.apply_pr_number}
          </a>
        </div> : null}
      </div>;
    })}

    {error ? <div className="controlled-apply-error">{error}</div> : null}
  </div>;
}
