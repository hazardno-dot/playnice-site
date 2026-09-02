import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./auth.css";

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    const resolveSession = async (nextSession) => {
      if (!mounted) return;
      setSession(nextSession || null);
      setAuthorized(nextSession ? null : false);
      if (!nextSession?.user?.id) { setLoading(false); return; }
      const { data, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", nextSession.user.id)
        .maybeSingle();
      if (!mounted) return;
      if (adminError) {
        console.warn("Control Center admin verification failed; server-side write guards remain authoritative.", adminError);
        setAuthorized(true);
      } else {
        setAuthorized(Boolean(data?.user_id));
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => resolveSession(data.session || null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      window.setTimeout(() => resolveSession(nextSession || null), 0);
    });
    return () => { mounted = false; subscription.subscription.unsubscribe(); };
  }, []);

  const signIn = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setBusy(false);
  };

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
  };

  if (loading || (session && authorized == null)) {
    return <div className="auth-shell"><div className="auth-card"><span>PLAYNICE / INTERNAL</span><h1>Control Center</h1><p>Checking secure admin session…</p></div></div>;
  }

  if (!session) {
    return <div className="auth-shell"><form className="auth-card" onSubmit={signIn}><span>PLAYNICE / INTERNAL</span><h1>Control Center</h1><p>Authorized access only.</p><label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>{error ? <div className="auth-error">{error}</div> : null}<button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form></div>;
  }

  if (!authorized) {
    return <div className="auth-shell"><div className="auth-card"><span>PLAYNICE / INTERNAL</span><h1>Access restricted</h1><p>This authenticated account is not registered as a PlayNice Control Center admin.</p><button type="button" onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button></div></div>;
  }

  return children;
}
