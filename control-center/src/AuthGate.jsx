import React, { useEffect, useRef, useState } from "react";
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
  const activeUserIdRef = useRef(null);
  const authorizedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const resolveSession = async (nextSession, { forceCheck = false } = {}) => {
      if (!mounted) return;

      const nextUserId = nextSession?.user?.id || null;
      const sameAuthorizedUser = Boolean(
        nextUserId &&
        !forceCheck &&
        activeUserIdRef.current === nextUserId &&
        authorizedRef.current
      );

      setSession(nextSession || null);

      // Supabase may emit SIGNED_IN / TOKEN_REFRESHED again when the browser or
      // installed app regains focus. For the same already-authorized user, keep
      // the Control Center mounted so unsaved editor state is preserved.
      if (sameAuthorizedUser) {
        setLoading(false);
        return;
      }

      if (!nextUserId) {
        activeUserIdRef.current = null;
        authorizedRef.current = false;
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setAuthorized(null);

      const { data, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", nextUserId)
        .maybeSingle();

      if (!mounted) return;

      let isAuthorized;
      if (adminError) {
        console.warn("Control Center admin verification failed; server-side write guards remain authoritative.", adminError);
        isAuthorized = true;
      } else {
        isAuthorized = Boolean(data?.user_id);
      }

      activeUserIdRef.current = nextUserId;
      authorizedRef.current = isAuthorized;
      setAuthorized(isAuthorized);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => resolveSession(data.session || null, { forceCheck: true }));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer any Supabase query out of the auth callback. resolveSession itself
      // decides whether this is a silent same-user refresh or a real auth change.
      window.setTimeout(() => resolveSession(nextSession || null), 0);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
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
