"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import DriveChip from "./DriveChip";
import MapView from "./MapView";
import SheetView from "./SheetView";
import SignInCard from "./SignInCard";
import UserMenu from "./UserMenu";

type View = "map" | "sheet";

const TABS: { id: View; label: string }[] = [
  { id: "map", label: "Map view" },
  { id: "sheet", label: "Sheet view" },
];

/** Page frame: header with the brand, the Map / Sheet tab switch and the user menu. */
export default function AppShell() {
  const [view, setView] = useState<View>("map");
  const { status, notice } = useAuth();
  const signedIn = status === "signedIn";

  return (
    <div className="flex h-screen flex-col">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <div className="text-base font-semibold tracking-tight">Wishtaa Sheets</div>

        {/* Tab switch: only once signed in */}
        {signedIn ? (
          <nav className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={view === t.id}
                onClick={() => setView(t.id)}
                className={
                  "rounded-md px-3 py-1 text-sm font-medium transition " +
                  (view === t.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800")
                }
              >
                {t.label}
              </button>
            ))}
          </nav>
        ) : (
          <div />
        )}

        <div className="flex min-w-0 items-center justify-end gap-3">
          {signedIn && <DriveChip />}
          <UserMenu />
        </div>
      </header>

      {signedIn && notice && (
        <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
          {notice}
        </div>
      )}

      <main className="min-h-0 flex-1">
        {status === "loading" && (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Checking sign-in...</div>
        )}
        {status === "unconfigured" && (
          <div className="flex h-full items-center justify-center p-6">
            <div className="max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              <div className="font-semibold text-slate-800">Sign-in is not set up</div>
              <p className="mt-2">
                Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (and to
                Vercel), then restart the app.
              </p>
            </div>
          </div>
        )}
        {status === "signedOut" && <SignInCard />}
        {signedIn && (view === "map" ? <MapView /> : <SheetView />)}
      </main>
    </div>
  );
}
