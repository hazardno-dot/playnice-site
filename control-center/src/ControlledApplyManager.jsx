import React, { useEffect, useMemo, useState } from "react";
import { products } from "@shop/data/products/index.js";
import { validateProductDraft } from "./draftValidation";
import { makeLiveSnapshot, snapshotsEqual } from "./prepublish";
import { getApprovalPayloadState } from "./approvalSafety.mjs";
import { supabase } from "./supabase";
import "./controlled-apply.css";

const PREVIEW_CHECK_ITEMS = [
  ["card", "Product card · SR + EN · title/copy/badges/sizes aligned, no clipping"],
  ["modal-desktop", "Desktop modal · same shared layout, header/media/content/purchase aligned"],
  ["modal-390", "Mobile modal · 390px · no overflow, clipping or displaced controls"],
  ["modal-360", "Mobile modal · 360px · no overflow, clipping or displaced controls"],
  ["note-map", "Note Map · opens/closes correctly and notes/icons render"],
  ["purchase", "Purchase block · sizes, price, Add to cart and recommendations remain aligned"],
];

export default function ControlledApplyManager() {
  const [drafts, setDrafts] = useState([]);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [previewChecks, setPreviewChecks] = useState({});

  const readData = async () => {
    const [{ data: draftRows }, { data: historyRows }] = await Promise.all([
      supabase
        .from("product_drafts")
        .select("product_slug,payload,approved_payload,review_status,prepared_at,baseline_snapshot,apply_branch,apply_pr_number,apply_created_at,preview_verified_at,preview_verified_by")
        .order("updated_at", { ascending: false }),
      supabase
        .from("publish_history")
        .select("product_slug,apply_branch,apply_pr_number,published_at,published_commit_sha")
        .order("published_at", { ascending: false })
        .limit(5),
    ]);
    return { draftRows: draftRows || [], historyRows: historyRows || [] };
  };

  const load = async ({ sync = true } = {}) => {
    const first = await readData();
    setDrafts(first.draftRows);
    setHistory(first.historyRows);

    if (!sync) return;
    const candidates = first.draftRows.filter((row) => row.apply_pr_number && row.preview_verified_at);
    if (!candidates.length) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    let publishedAny = false;
    for (const row of candidates) {
      try {
        const response = await fetch("/api/sync-publish-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ product_slug: row.product_slug }),
        });
        const body = await response.json();
        if (response.ok && body?.status === "published") publishedAny = true;
      } catch {
        // A transient GitHub/Vercel sync failure must never block Control Center rendering.
      }
    }

    if (publishedAny) {
      const after = await readData();
      setDrafts(after.draftRows);
      setHistory(after.historyRows);
    }
  };

  useEffect(() => {
    load();
    const draftChannel = supabase
      .channel("controlled-apply-drafts")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_drafts" }, () => load({ sync: false }))
      .subscribe();
    const publishChannel = supabase
      .channel("controlled-apply-history")
      .on("postgres_changes", { event: "*", schema: "public", table: "publish_history" }, () => load({ sync: false }))
      .subscribe();
    return () => {
      supabase.removeChannel(draftChannel);
      supabase.removeChannel(publishChannel);
    };
  }, []);

  const preparedRows = useMemo(() => drafts.filter((row) =>
    row.review_status === "approved" && Boolean(row.prepared_at)
  ), [drafts]);

  const staleApprovalRows = useMemo(() => preparedRows.filter((row) =>
    !getApprovalPayloadState(row).safe
  ), [preparedRows]);

  const readyRows = useMemo(() => preparedRows.filter((row) => {
    if (!getApprovalPayloadState(row).safe) return false;
    const live = products.find((p) => p.slug === row.product_slug);
    const validation = validateProductDraft(live || null, row.payload);
    const current = live ? makeLiveSnapshot(live) : { kind: "new_product", product_slug: row.product_slug };
    return validation.status !== "blocked" && row.baseline_snapshot && snapshotsEqual(row.baseline_snapshot, current);
  }), [preparedRows]);

  const createApply = async (row) => {
    setBusy(`create:${row.product_slug}`);
    setError("");
    try {
      const approvalState = getApprovalPayloadState(row);
      if (!approvalState.safe) throw new Error("Approved payload no longer matches the current draft. Review and approve the draft again before Controlled Apply.");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");
      const endpoint = row.baseline_snapshot?.kind === "new_product" ? "/api/create-new-product" : "/api/create-apply";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_slug: row.product_slug }),
      });
      const raw = await response.text();
      let body = {};
      try { body = raw ? JSON.parse(raw) : {}; }
      catch { throw new Error(raw || "Controlled Apply returned an invalid response."); }
      if (!response.ok) throw new Error(body?.error || "Could not create or update controlled apply branch.");
      setPreviewChecks((current) => ({ ...current, [row.product_slug]: {} }));
      await load({ sync: false });
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
      const checks = previewChecks[row.product_slug] || {};
      const missing = PREVIEW_CHECK_ITEMS.filter(([id]) => checks[id] !== true);
      if (missing.length) throw new Error("Complete every visual parity check before verification.");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");
      const response = await fetch("/api/verify-product-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_slug: row.product_slug, checks }),
      });
      const raw = await response.text();
      let body = {};
      try { body = raw ? JSON.parse(raw) : {}; }
      catch { throw new Error(raw || "Preview verification returned an invalid response."); }
      if (!response.ok) throw new Error(body?.error || "Could not verify preview.");
      await load({ sync: false });
    } catch (e) {
      setError(e?.message || "Could not verify preview.");
    } finally {
      setBusy("");
    }
  };

  if (!readyRows.length && !staleApprovalRows.length && !history.length && !error) return null;

  return <div className="controlled-apply-box">
    <div className="controlled-apply-head">
      <div><span>CONTROLLED APPLY</span><strong>{readyRows.length} active{staleApprovalRows.length ? ` · ${staleApprovalRows.length} blocked` : ""}</strong></div>
      <small>Shop preview + visual parity verification required · never merges automatically</small>
    </div>

    {staleApprovalRows.map((row) => {
      const approvalState = getApprovalPayloadState(row);
      return <div className="controlled-apply-row controlled-apply-row-stack" key={`blocked:${row.product_slug}`}>
        <div className="controlled-apply-primary">
          <div>
            <strong>{row.product_slug}</strong>
            <span>APPROVAL SAFETY BLOCK · REVIEW AGAIN</span>
          </div>
        </div>
        <div className="controlled-apply-error">
          {approvalState.status === "missing-approved-payload"
            ? "Approved snapshot is missing. Return this item to Drafts, review it and approve again before apply."
            : "Current draft payload differs from the approved snapshot. Return this item to Drafts, review the latest changes and approve again before apply."}
        </div>
      </div>;
    })}

    {readyRows.map((row) => {
      const hasApply = Boolean(row.apply_branch && row.apply_pr_number);
      const hadPreview = Boolean(row.apply_created_at);
      const verified = Boolean(row.preview_verified_at);
      const checks = previewChecks[row.product_slug] || {};
      const completedChecks = PREVIEW_CHECK_ITEMS.filter(([id]) => checks[id] === true).length;
      const visualGatePassed = completedChecks === PREVIEW_CHECK_ITEMS.length;
      const shouldUpdateExisting = !hasApply && hadPreview && row.baseline_snapshot?.kind === "new_product";
      return <div className="controlled-apply-row controlled-apply-row-stack" key={row.product_slug}>
        <div className="controlled-apply-primary">
          <div>
            <strong>{row.product_slug}</strong>
            <span>{verified ? "PREVIEW VERIFIED · READY TO MERGE" : hasApply ? "PREVIEW CREATED · UPDATE OR VERIFY" : shouldUpdateExisting ? "PREVIEW EXISTS · READY TO UPDATE" : "APPROVED · READY TO APPLY"}</span>
          </div>
          {!hasApply ? <button disabled={busy === `create:${row.product_slug}`} onClick={() => createApply(row)}>
            {busy === `create:${row.product_slug}` ? (shouldUpdateExisting ? "Updating…" : "Creating…") : shouldUpdateExisting ? "Update preview branch" : "Create preview branch"}
          </button> : null}
          {hasApply && !verified ? <button disabled={busy === `create:${row.product_slug}`} onClick={() => createApply(row)}>
            {busy === `create:${row.product_slug}` ? "Updating…" : "Update preview branch"}
          </button> : null}
          {hasApply && !verified ? <button disabled={busy === `verify:${row.product_slug}` || !visualGatePassed} onClick={() => verifyPreview(row)}>
            {busy === `verify:${row.product_slug}` ? "Checking preview…" : visualGatePassed ? "Mark preview verified" : `Visual QA ${completedChecks}/${PREVIEW_CHECK_ITEMS.length}`}
          </button> : null}
        </div>

        {hasApply ? <div className={`controlled-apply-result ${verified ? "controlled-apply-verified" : ""}`}>
          <strong>{verified ? "Ready to merge" : "Preview branch active"}</strong>
          <span>{row.apply_branch}</span>
          <a href={`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`} target="_blank" rel="noreferrer">
            Open PR #{row.apply_pr_number}
          </a>
        </div> : null}

        {hasApply && !verified ? <div className="controlled-preview-gate">
          <div className="controlled-preview-gate-head">
            <strong>VISUAL PARITY GATE</strong>
            <span>{completedChecks}/{PREVIEW_CHECK_ITEMS.length}</span>
          </div>
          <p>Merge remains locked in the PlayNice workflow until the current Shop preview is green and every shared card/modal check is confirmed.</p>
          <div className="controlled-preview-checks">
            {PREVIEW_CHECK_ITEMS.map(([id, label]) => <label key={id}>
              <input
                type="checkbox"
                checked={checks[id] === true}
                onChange={(event) => setPreviewChecks((current) => ({
                  ...current,
                  [row.product_slug]: {
                    ...(current[row.product_slug] || {}),
                    [id]: event.target.checked,
                  },
                }))}
              />
              <span>{label}</span>
            </label>)}
          </div>
        </div> : null}
      </div>;
    })}

    {history.length ? <div className="controlled-published-history">
      <div className="controlled-published-title"><span>RECENTLY PUBLISHED</span><strong>PUBLISHED · LIVE</strong></div>
      {history.slice(0, 3).map((row) => <div className="controlled-published-row" key={`${row.apply_pr_number}-${row.product_slug}`}>
        <div><strong>{row.product_slug}</strong><span>{new Date(row.published_at).toLocaleString()}</span></div>
        <div className="controlled-published-meta">
          <span>LIVE</span>
          <a href={`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`} target="_blank" rel="noreferrer">PR #{row.apply_pr_number}</a>
        </div>
      </div>)}
    </div> : null}

    {error ? <div className="controlled-apply-error">{error}</div> : null}
  </div>;
}
