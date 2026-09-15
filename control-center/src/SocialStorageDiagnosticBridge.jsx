import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";

const BUCKET = "social-media";

function onePixelJpegBlob() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  context.fillStyle = "#000000";
  context.fillRect(0, 0, 1, 1);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create diagnostic JPEG.")), "image/jpeg", 0.8);
  });
}

export default function SocialStorageDiagnosticBridge() {
  const [slot, setSlot] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let observer;
    const sync = () => {
      const social = document.querySelector(".social-manager");
      const anchor = social?.querySelector("#social-media-override-slot");
      if (!social || !anchor) {
        setSlot(null);
        return;
      }
      let node = social.querySelector("#social-storage-diagnostic-slot");
      if (!node) {
        node = document.createElement("div");
        node.id = "social-storage-diagnostic-slot";
        anchor.insertAdjacentElement("afterend", node);
      }
      setSlot(node);
    };
    sync();
    observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(`SESSION FAILED: ${sessionError.message || sessionError}`);
      const session = sessionData?.session;
      if (!session?.user?.id) throw new Error("SESSION FAILED: no authenticated Supabase user in the browser.");

      const blob = await onePixelJpegBlob();
      const path = `_diagnostics/${session.user.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: "image/jpeg",
        cacheControl: "60",
        upsert: false,
      });
      if (uploadError) {
        setResult({ ok: false, text: `STORAGE UPLOAD FAILED: ${uploadError.message || String(uploadError)}` });
        return;
      }

      setResult({ ok: true, text: `STORAGE UPLOAD OK · authenticated user ${session.user.id.slice(0, 8)}…` });
      await supabase.storage.from(BUCKET).remove([path]).catch(() => null);
    } catch (error) {
      setResult({ ok: false, text: error?.message || String(error) });
    } finally {
      setRunning(false);
    }
  };

  if (!slot) return null;
  return createPortal(
    <section style={{ marginTop: 10, border: "1px solid #303842", background: "#0f1419", padding: "10px 12px", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "grid", gap: 3 }}>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "#8e99a8" }}>SOCIAL STORAGE DIAGNOSTIC</span>
        <strong style={{ fontSize: 12, color: result?.ok ? "#9fd5b1" : result ? "#e0a3a3" : "#c7d0d9" }}>{result?.text || "Tests authenticated upload only · no event or Meta changes"}</strong>
      </div>
      <button type="button" disabled={running} onClick={run} style={{ minWidth: 170, padding: "9px 12px", border: "1px solid #456150", background: "#122019", color: "#b8ddc4", cursor: running ? "wait" : "pointer" }}>
        {running ? "Testing…" : "Run storage diagnostic"}
      </button>
    </section>,
    slot,
  );
}
