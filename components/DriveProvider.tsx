"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getSupabase } from "@/lib/supabase/client";
import {
  driveAccountAllowed,
  fetchDriveEmail,
  googleConfigured,
  requestDriveToken,
  revokeDriveToken,
} from "@/lib/google/drive";

/**
 * unconfigured    - NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing
 * notConnected    - no Drive token in this tab (normal after every page load)
 * connecting      - waiting for Google
 * connected       - token held in memory
 * mismatch        - Google account is not allowed for this sign-in (token thrown away)
 * needsReconnect  - the token could not be renewed quietly; one click on Reconnect fixes it
 */
export type DriveStatus = "unconfigured" | "notConnected" | "connecting" | "connected" | "mismatch" | "needsReconnect";

type DriveState = {
  status: DriveStatus;
  /** Google account whose Drive is connected (or the one that was rejected / last linked). */
  driveEmail: string | null;
  /** Last problem, in plain words. */
  message: string | null;
  connect: () => Promise<void>;
  /** The current token, or null. For later steps (Picker). Never store it anywhere. */
  getAccessToken: () => string | null;
};

const DriveContext = createContext<DriveState | null>(null);

export function useDrive(): DriveState {
  const ctx = useContext(DriveContext);
  if (!ctx) throw new Error("useDrive must be used inside DriveProvider");
  return ctx;
}

/** Google tokens last 60 minutes; renew after 50. */
const RENEW_AFTER_MS = 50 * 60 * 1000;
/** When the tab comes back to the front, renew if less than this is left. */
const RENEW_IF_LEFT_MS = 10 * 60 * 1000;

type LinkStatus = "linked" | "needs_reconnect" | "mismatch";

/**
 * Holds the Google Drive connection for the signed-in user.
 * The access token lives ONLY in a ref (memory). Supabase gets just the Google address and a status.
 */
export default function DriveProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const signInEmail = user?.email;

  const [status, setStatus] = useState<DriveStatus>(googleConfigured ? "notConnected" : "unconfigured");
  const [driveEmail, setDriveEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const tokenRef = useRef<{ accessToken: string; expiresAt: number } | null>(null);
  const emailRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyRef = useRef(false);
  /** Bumped when the user changes, so answers that arrive late are ignored. */
  const epochRef = useRef(0);

  const clearToken = useCallback(() => {
    tokenRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  /** Saves the link status (never a token) in Supabase. Failure only shows a message. */
  const saveLink = useCallback(
    async (email: string, linkStatus: LinkStatus) => {
      if (!userId) return;
      const now = new Date().toISOString();
      const row: Record<string, string> = { user_id: userId, google_email: email, status: linkStatus, last_checked_at: now };
      if (linkStatus === "linked") row.linked_at = now;
      const { error } = await getSupabase().from("sheets_google_links").upsert(row, { onConflict: "user_id" });
      if (error) {
        const missing = error.code === "42P01" || error.code === "PGRST205";
        setMessage(
          missing
            ? "Google link table not found. Run supabase/001_sheets_profiles_and_google_links.sql."
            : `Could not save the Drive link status (${error.code ?? "error"}).`,
        );
      }
    },
    [userId],
  );

  /** Takes a fresh token, checks which Google account it belongs to, and keeps it if allowed. */
  const acquire = useCallback(
    async (prompt: string, hint: string | undefined, interactive: boolean) => {
      if (busyRef.current) return;
      busyRef.current = true;
      const epoch = epochRef.current;
      if (interactive) setStatus("connecting");
      setMessage(null);
      try {
        const token = await requestDriveToken({ prompt, hint });
        const email = await fetchDriveEmail(token.accessToken);
        if (epoch !== epochRef.current) {
          revokeDriveToken(token.accessToken);
          return;
        }
        if (!driveAccountAllowed(signInEmail, email)) {
          // Wrong Google account: throw the token away and say so.
          revokeDriveToken(token.accessToken);
          clearToken();
          emailRef.current = email;
          setDriveEmail(email);
          setStatus("mismatch");
          setMessage(
            `You signed in as ${signInEmail}, but that Drive belongs to ${email}. Connect the same Google account.`,
          );
          await saveLink(email, "mismatch");
          return;
        }
        tokenRef.current = token;
        emailRef.current = email;
        setDriveEmail(email);
        setStatus("connected");
        await saveLink(email, "linked");
        // Renew a little before Google's 60 minutes are up.
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => void acquire("", email, false), RENEW_AFTER_MS);
      } catch (e) {
        if (epoch !== epochRef.current) return;
        const text = e instanceof Error ? e.message : "Could not connect Google Drive.";
        if (interactive) {
          // The user closed the popup or refused: nothing is wrong, they can try again.
          clearToken();
          setStatus(emailRef.current && status === "needsReconnect" ? "needsReconnect" : "notConnected");
          setMessage(text === "popup_closed" ? null : text);
        } else {
          // Quiet renewal failed: ask for one click.
          clearToken();
          setStatus("needsReconnect");
          setMessage("Google Drive needs to be reconnected.");
          if (emailRef.current) await saveLink(emailRef.current, "needs_reconnect");
        }
      } finally {
        busyRef.current = false;
      }
    },
    // `status` is only read to keep the "needs reconnect" label after a cancelled popup.
    [clearToken, saveLink, signInEmail, status],
  );

  const connect = useCallback(async () => {
    if (!googleConfigured) return;
    // After a wrong-account result, always show the account chooser.
    const prompt = status === "mismatch" ? "select_account" : "";
    await acquire(prompt, status === "mismatch" ? undefined : (emailRef.current ?? signInEmail), true);
  }, [acquire, signInEmail, status]);

  const getAccessToken = useCallback(() => {
    const t = tokenRef.current;
    return t && t.expiresAt > Date.now() + 30_000 ? t.accessToken : null;
  }, []);

  // New or signed-out user: forget everything in memory; then read the last saved link status.
  useEffect(() => {
    epochRef.current += 1;
    clearToken();
    emailRef.current = null;
    setDriveEmail(null);
    setMessage(null);
    setStatus(googleConfigured ? "notConnected" : "unconfigured");
    if (!userId || !googleConfigured) return;
    const epoch = epochRef.current;
    void getSupabase()
      .from("sheets_google_links")
      .select("google_email,status")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (epoch !== epochRef.current || !data) return;
        emailRef.current = data.google_email as string;
        setDriveEmail(data.google_email as string);
        if (data.status === "needs_reconnect") setStatus("needsReconnect");
      });
  }, [userId, clearToken]);

  // Back to this tab after a long time: the 50-minute timer may have been paused, so check.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      const t = tokenRef.current;
      if (t && t.expiresAt - Date.now() < RENEW_IF_LEFT_MS) void acquire("", emailRef.current ?? undefined, false);
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [acquire]);

  // Clear the timer if the app is closed.
  useEffect(() => clearToken, [clearToken]);

  const value = useMemo<DriveState>(
    () => ({ status, driveEmail, message, connect, getAccessToken }),
    [status, driveEmail, message, connect, getAccessToken],
  );

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
}
