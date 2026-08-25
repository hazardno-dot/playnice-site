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
  const [result, setResult] = useState(null);

  const load = async () => {
    const { data } = await supabase
      .from("product_drafts")
      .select("product_slug,payload,review_status,prepared_at,baseline_snapshot")
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
    setBusy(row.product_slug);
    setError("");
    setResult(null);
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
      setResult(body);
      await load();
    } catch (e) {
      setError(e?.message || "Controlled apply failed.");
    } finally {
      setBusy("");
    }
  };

  if (!readyRows.length && !error && !result) return null;

  return <div className="controlled-apply-box">
    <div className="controlled-apply-head">
      <div><span>CONTROLLED APPLY</span><strong>{readyRows.length} ready</strong></div>
      <small>Draft PR only · never merges automatically</small>
    </div>

    {readyRows.map((row) => <div className="controlled-apply-row" key={row.product_slug}>
      <div><strong>{row.product_slug}</strong><span>APPROVED · READY TO APPLY</span></div>
      <button disabled={busy === row.product_slug} onClick={() => createApply(row)}>
        {busy === row.product_slug ? "Creating…" : "Create preview branch"}
      </button>
    </div>)}

    {result ? <div className="controlled-apply-result">
      <strong>Preview branch created</strong>
      <span>{result.branch}</span>
      <a href={result.pr_url} target="_blank" rel="noreferrer">Open draft PR #{result.pr_number}</a>
    </div> : null}

    {error ? <div className="controlled-apply-error">{error}</div> : null}
  </div>;
}
