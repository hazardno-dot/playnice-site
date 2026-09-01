import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./hero-apply.css";

export default function HeroApplyBridge() {
  const [slot, setSlot] = useState(null);
  const [heroKey, setHeroKey] = useState("");
  const [row, setRow] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const loadRow = useCallback(async (key) => {
    if (!key) { setRow(null); return; }
    const { data, error: loadError } = await supabase
      .from("hero_drafts")
      .select("hero_key,payload,approved_payload,review_status,apply_branch,apply_pr_number,apply_created_at,preview_verified_at,preview_verified_by")
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
        const active = mainStage.querySelector(".hero-slide-row.is-active");
        const applyAnchor = mainStage.querySelector("#hero-apply-anchor");
        if (heading?.textContent?.trim() !== "Hero" || !active || !applyAnchor) {
          setSlot(null);
          return;
        }

        setSlot(applyAnchor);
        const id = Number(active.textContent?.match(/#(\d+)/)?.[1]);
        if (!id) return;
        supabase.from("hero_slides").select("hero_key").eq("id", id).maybeSingle().then(({ data, error: keyError }) => {
          if (keyError) { setError(keyError.message || String(keyError)); return; }
          const key = data?.hero_key || "";
          setHeroKey((current) => current === key ? current : key);
        });
      });
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  useEffect(() => { loadRow(heroKey); }, [heroKey, loadRow]);

  useEffect(() => {
    if (!heroKey) return;
    const channel = supabase.channel(`hero-apply-${heroKey}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_drafts", filter: `hero_key=eq.${heroKey}` }, () => loadRow(heroKey))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [heroKey, loadRow]);

  useEffect(() => {
    const detail = document.querySelector(".hero-manager-detail");
    if (!detail || !row) return;
    const locked = row.review_status !== "draft" || Boolean(row.apply_branch);
    const edit = detail.querySelector(".hero-edit-btn");
    const discard = [...detail.querySelectorAll("button")].find((button) => button.textContent?.trim() === "Discard draft");
    if (edit) {
      edit.disabled = locked;
      edit.title = locked ? "Return the draft to Draft before editing." : "";
    }
    if (discard) {
      discard.disabled = locked;
      discard.title = locked ? "Return the draft to Draft before discarding." : "";
    }
  }, [row, slot]);

  const createPreview = async () => {
    if (!row || !heroKey) return;
    setBusy("create"); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Admin session expired. Sign in again.");
      const response = await fetch("/api/create-hero-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ hero_key: heroKey }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Could not create Hero preview branch.");
      await loadRow(heroKey);
    } catch (applyError) {
      setError(applyError.message || String(applyError));
    } finally {
      setBusy("");
    }
  };

  const verifyPreview = async () => {
    if (!row || !heroKey) return;
    setBusy("verify"); setError("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error("Admin session expired. Sign in again.");
      const now = new Date().toISOString();
      const { error: updateError } = await supabase.from("hero_drafts")
        .update({ preview_verified_at: now, preview_verified_by: user.id })
        .eq("hero_key", heroKey);
      if (updateError) throw updateError;
      await loadRow(heroKey);
    } catch (verifyError) {
      setError(verifyError.message || String(verifyError));
    } finally {
      setBusy("");
    }
  };

  if (!slot || !row || row.review_status !== "approved") return null;

  const hasApply = Boolean(row.apply_branch && row.apply_pr_number);
  const verified = Boolean(row.preview_verified_at);

  return createPortal(<section className={`hero-apply-panel ${verified ? "verified" : hasApply ? "preview" : "approved"}`}>
    <div className="hero-apply-head">
      <div><span>CONTROLLED APPLY</span><strong>{verified ? "PREVIEW VERIFIED" : hasApply ? "PREVIEW CREATED" : "APPROVED · READY TO APPLY"}</strong></div>
      <small>approved_payload only · draft PR · never auto-merges</small>
    </div>
    {error ? <div className="hero-apply-error">{error}</div> : null}
    {!hasApply ? <div className="hero-apply-actions"><button className="primary" disabled={busy === "create"} onClick={createPreview}>{busy === "create" ? "Creating…" : "Create preview branch"}</button></div> : <div className="hero-apply-result">
      <div><span>BRANCH</span><code>{row.apply_branch}</code></div>
      <div><span>PR</span><a href={`https://github.com/hazardno-dot/playnice-site/pull/${row.apply_pr_number}`} target="_blank" rel="noreferrer">Open PR #{row.apply_pr_number}</a></div>
      {verified ? <div className="hero-apply-ready">READY TO MERGE · manual merge only</div> : <button className="primary" disabled={busy === "verify"} onClick={verifyPreview}>{busy === "verify" ? "Saving…" : "Mark preview verified"}</button>}
    </div>}
  </section>, slot);
}
