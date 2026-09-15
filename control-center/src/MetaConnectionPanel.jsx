import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

const STATUS_LABELS = {
  not_configured: "NOT CONFIGURED",
  partial: "PARTIAL",
  connected: "CONNECTED",
  invalid_connection: "INVALID",
};

const CREDENTIAL_LABELS = {
  system_user: "System User",
  page_env_fallback: "Page token fallback",
};

const box = {
  display: "grid",
  gap: 12,
  padding: "18px 20px",
  margin: "0 0 20px",
  border: "1px solid rgba(118, 151, 137, 0.28)",
  background: "rgba(10, 16, 14, 0.72)",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
};

const small = { color: "#789184", fontSize: 12, letterSpacing: ".04em" };

const checkButton = (loading) => ({
  minWidth: 142,
  padding: "9px 13px",
  border: "1px solid rgba(102, 165, 129, 0.5)",
  background: loading ? "rgba(21, 34, 27, 0.7)" : "#101a15",
  color: loading ? "#76877d" : "#a9d3b9",
  fontSize: 12,
  letterSpacing: ".03em",
  lineHeight: 1.2,
  cursor: loading ? "wait" : "pointer",
  opacity: loading ? 0.8 : 1,
  outline: "none",
  boxShadow: "none",
});

async function getAdminToken() {
  const { data: refreshData } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
  if (refreshData?.session?.access_token) return refreshData.session.access_token;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) throw error || new Error("Authenticated admin session is required.");
  return data.session.access_token;
}

export default function MetaConnectionPanel() {
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const token = await getAdminToken();
      const response = await fetch("/api/meta-connection-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || `Meta connection check failed (${response.status}).`);
      setState({ loading: false, data: payload, error: "" });
    } catch (error) {
      setState({ loading: false, data: null, error: error?.message || String(error) });
    }
  };

  useEffect(() => { load(); }, []);

  const data = state.data || {};
  const status = STATUS_LABELS[data.status] || (state.loading ? "CHECKING" : "UNKNOWN");
  const env = data.env || {};
  const credentialLabel = CREDENTIAL_LABELS[data.credential_source] || "Not resolved";

  return <section style={box}>
    <div style={row}>
      <div>
        <div style={{ ...small, marginBottom: 5 }}>META CONNECTION · TEST ONLY</div>
        <strong style={{ fontSize: 19 }}>Instagram + Facebook connection</strong>
      </div>
      <div style={{ textAlign: "right" }}>
        <strong>{status}</strong>
        <div style={small}>Publish remains hard locked</div>
      </div>
    </div>

    {state.error ? <div className="social-error">{state.error}</div> : null}

    {!state.loading && !state.error ? <>
      <div style={row}>
        <div><span style={small}>FACEBOOK PAGE</span><div>{data.facebook_page?.name || (env.facebook_page_id ? "Configured · not verified" : "Not configured")}</div></div>
        <div><span style={small}>INSTAGRAM</span><div>{data.instagram_account?.username ? `@${data.instagram_account.username}` : (env.instagram_account_id ? "Configured · not verified" : "Not verified")}</div></div>
        <div><span style={small}>GRAPH</span><div>{data.graph_verified ? "Verified" : "Not verified"}</div></div>
        <div><span style={small}>CREDENTIAL</span><div>{credentialLabel}</div></div>
      </div>

      <div style={row}>
        <div style={small}>App ID {env.app_id ? "✓" : "—"} · App secret {env.app_secret ? "✓" : "—"} · Page ID {env.facebook_page_id ? "✓" : "—"} · System User {env.system_user_access_token ? "✓" : "—"} · Page fallback {env.page_access_token ? "✓" : "—"} · IG ID {env.instagram_account_id ? "✓" : "—"}</div>
        <button type="button" onClick={load} disabled={state.loading} style={checkButton(state.loading)}>
          {state.loading ? "Checking connection…" : "Check connection"}
        </button>
      </div>

      {data.graph_error?.message ? <div className="social-error">Meta Graph: {data.graph_error.message}</div> : null}
      <div style={small}>Required capability contract: {(data.required_permissions || []).join(" · ") || "awaiting configuration"}</div>
    </> : null}
  </section>;
}
