"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

type AuthStatus = "loading" | "signedOut" | "signedIn" | "unconfigured";

type AuthState = {
  status: AuthStatus;
  user: User | null;
  displayName: string;
  /** Sign-in problem to show on the sign-in card (for example the user cancelled at Google). */
  error: string | null;
  /** Non-blocking warning, for example the profile table is missing. */
  notice: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Best display name we have for a user (Google gives full_name). */
function nameOf(user: User): string {
  const m = user.user_metadata ?? {};
  return String(m.full_name ?? m.name ?? user.email ?? "Signed in");
}

/** After Google redirects back with a problem, the reason is in the URL: read it, then clean the URL. */
function takeUrlError(): string | null {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const msg = url.searchParams.get("error_description") ?? hash.get("error_description");
  if (!msg && !url.searchParams.has("error") && !hash.has("error")) return null;
  for (const k of ["error", "error_code", "error_description"]) url.searchParams.delete(k);
  url.hash = "";
  window.history.replaceState({}, "", url.pathname + url.search);
  return msg ?? "Sign-in was not completed.";
}

/**
 * Holds the Supabase sign-in state for the whole app.
 * Identity only: Google is asked for openid, email and profile. No Drive permission here.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(supabaseConfigured ? "loading" : "unconfigured");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const profiledFor = useRef<string | null>(null);

  // Create the user's profile row the first time they sign in (never overwrites an existing one).
  const ensureProfile = useCallback(async (u: User) => {
    if (profiledFor.current === u.id) return;
    profiledFor.current = u.id;
    const { error: err } = await getSupabase()
      .from("sheets_profiles")
      .upsert({ user_id: u.id, display_name: nameOf(u).slice(0, 100) }, { onConflict: "user_id", ignoreDuplicates: true });
    if (err) {
      const missing = err.code === "42P01" || err.code === "PGRST205";
      setNotice(
        missing
          ? "Profile table not found. Run supabase/001_sheets_profiles_and_google_links.sql in the Supabase SQL Editor."
          : `Could not save your profile (${err.code ?? "error"}).`,
      );
    } else {
      setNotice(null);
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const urlError = takeUrlError();
    if (urlError) setError(urlError);

    const supabase = getSupabase();
    let active = true;

    function apply(u: User | null) {
      if (!active) return;
      setUser(u);
      setStatus(u ? "signedIn" : "signedOut");
      if (u) void ensureProfile(u);
      else profiledFor.current = null;
    }

    supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const { error: err } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        // Let the user pick which Google account to use.
        queryParams: { prompt: "select_account" },
      },
    });
    if (err) setError(err.message);
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setNotice(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      displayName: user ? nameOf(user) : "",
      error,
      notice,
      signInWithGoogle,
      signOut,
    }),
    [status, user, error, notice, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
