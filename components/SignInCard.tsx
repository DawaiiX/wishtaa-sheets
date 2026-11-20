"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

/** Shown instead of the map until the user signs in. */
export default function SignInCard() {
  const { signInWithGoogle, error } = useAuth();
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    await signInWithGoogle(); // normally leaves the page for Google, so busy stays on
    setBusy(false);
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Sign in to Wishtaa Sheets</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use your Google account. This only identifies you; it does not give the app access to your
          Google Drive.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={go}
          disabled={busy}
          className="mt-6 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? "Opening Google..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
