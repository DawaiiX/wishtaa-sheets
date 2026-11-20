import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** False when the two env vars are missing; the UI then shows a set-up message. */
export const supabaseConfigured = Boolean(url && anonKey);

/**
 * Fields Supabase can add to the saved session after an OAuth sign-in: the provider's
 * (Google's) own access and refresh tokens. This app never keeps a Google token in browser
 * storage, so they are removed before anything is written.
 */
const GOOGLE_TOKEN_FIELDS = ["provider_token", "provider_refresh_token"];

/** Browser storage for the Supabase login session, with Google tokens stripped on write. */
const guardedStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      let out = value;
      try {
        const parsed: unknown = JSON.parse(value);
        if (parsed && typeof parsed === "object") {
          for (const f of GOOGLE_TOKEN_FIELDS) delete (parsed as Record<string, unknown>)[f];
          out = JSON.stringify(parsed);
        }
      } catch {
        // Not JSON (for example the PKCE code verifier): store as is.
      }
      window.localStorage.setItem(key, out);
    } catch {
      // Storage blocked: the user simply has to sign in again after a reload.
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

let client: SupabaseClient | null = null;

/** The one Supabase client. Browser only; uses the public anon key (never the service key). */
export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase is not configured");
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: guardedStorage,
      },
    });
  }
  return client;
}
