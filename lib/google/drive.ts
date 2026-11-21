/**
 * Google Drive connection helpers (P2-2).
 *
 * Uses Google Identity Services (GIS) "token model" with the drive.file scope only.
 * The access token is handed to the caller and must be kept IN MEMORY ONLY: never in
 * localStorage, sessionStorage, Supabase or any cookie.
 */

/** The only Google permission this app asks for: files the user opens or creates with it. */
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

/** Public OAuth client id (not a secret). Empty when not configured. */
export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const googleConfigured = Boolean(googleClientId);

// ---- Minimal typings for the parts of GIS we use -------------------------------------------

type TokenResponse = {
  access_token?: string;
  expires_in?: number | string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type TokenClient = { requestAccessToken: (overrides?: { prompt?: string; login_hint?: string }) => void };

type GisWindow = Window & {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (r: TokenResponse) => void;
          error_callback?: (e: { type?: string; message?: string }) => void;
        }) => TokenClient;
        revoke: (token: string, done?: () => void) => void;
      };
    };
  };
};

let gisPromise: Promise<void> | null = null;

/** Loads the Google Identity Services script once. */
export function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise<void>((resolve, reject) => {
    if ((window as GisWindow).google?.accounts?.oauth2) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisPromise = null; // allow a retry
      reject(new Error("Could not load Google sign-in. Check your internet connection."));
    };
    document.head.appendChild(s);
  });
  return gisPromise;
}

export type DriveToken = { accessToken: string; expiresAt: number };

/**
 * Asks Google for a Drive access token.
 * prompt "consent"/"select_account" shows a popup (needs a click); "" tries silently.
 */
export async function requestDriveToken(opts: { prompt: string; hint?: string }): Promise<DriveToken> {
  await loadGis();
  const oauth2 = (window as GisWindow).google!.accounts.oauth2;
  return new Promise<DriveToken>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: googleClientId,
      scope: DRIVE_SCOPE,
      callback: (r) => {
        if (r.error || !r.access_token) {
          reject(new Error(r.error_description ?? r.error ?? "Google did not give access."));
          return;
        }
        // The user may untick the Drive permission on the consent screen: treat as not granted.
        if (r.scope && !r.scope.split(" ").includes(DRIVE_SCOPE)) {
          reject(new Error("Google Drive permission was not granted."));
          return;
        }
        const seconds = Number(r.expires_in ?? 3600);
        resolve({ accessToken: r.access_token, expiresAt: Date.now() + seconds * 1000 });
      },
      error_callback: (e) => reject(new Error(e.type === "popup_closed" ? "popup_closed" : e.message ?? e.type ?? "Google error")),
    });
    client.requestAccessToken({ prompt: opts.prompt, ...(opts.hint ? { login_hint: opts.hint } : {}) });
  });
}

/** Tells Google to cancel the token (used when the Google account does not match). */
export function revokeDriveToken(token: string): void {
  try {
    (window as GisWindow).google?.accounts.oauth2.revoke(token);
  } catch {
    // best effort
  }
}

/** The email of the Google account that owns the Drive this token belongs to. */
export async function fetchDriveEmail(token: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google Drive did not answer (${res.status}).`);
  const json = (await res.json()) as { user?: { emailAddress?: string } };
  const email = json.user?.emailAddress;
  if (!email) throw new Error("Google Drive did not say which account this is.");
  return email;
}

// ---- Account matching ---------------------------------------------------------------------

function isGmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain === "gmail.com" || domain === "googlemail.com";
}

/** Gmail ignores case, dots and +tags in the name part, and googlemail.com equals gmail.com. */
export function normalizeEmail(email: string): string {
  const [rawName, rawDomain] = email.trim().toLowerCase().split("@");
  if (!rawDomain) return email.trim().toLowerCase();
  if (rawDomain === "gmail.com" || rawDomain === "googlemail.com") {
    return rawName.split("+")[0].replace(/\./g, "") + "@gmail.com";
  }
  return `${rawName}@${rawDomain}`;
}

/**
 * Rule: if the user signed in with a Gmail address, the Drive account must be that same address.
 * If they signed in with a work (non-Gmail) address, any Google account may be connected.
 */
export function driveAccountAllowed(signInEmail: string | undefined, driveEmail: string): boolean {
  if (!signInEmail || !isGmail(signInEmail)) return true;
  return normalizeEmail(signInEmail) === normalizeEmail(driveEmail);
}
