"use client";

import { useState } from "react";
import MapView from "./MapView";
import SheetView from "./SheetView";

type View = "map" | "sheet";

const TABS: { id: View; label: string }[] = [
  { id: "map", label: "Map view" },
  { id: "sheet", label: "Sheet view" },
];

/** Page frame: header with the brand and the Map / Sheet tab switch. */
export default function AppShell() {
  const [view, setView] = useState<View>("map");

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="text-base font-semibold tracking-tight">Wishtaa Sheets</div>

        {/* Tab switch */}
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

        <div className="w-24" /> {/* spacer; login button arrives in a later step */}
      </header>

      <main className="min-h-0 flex-1">
        {view === "map" ? <MapView /> : <SheetView />}
      </main>
    </div>
  );
}
