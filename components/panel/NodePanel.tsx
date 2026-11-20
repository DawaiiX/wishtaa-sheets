"use client";

import { useState, type KeyboardEvent } from "react";
import StatusChip from "@/components/StatusChip";
import { formatLastRun } from "@/lib/format";
import { STATUS_META, STATUS_ORDER, type SheetFlowNode, type SheetNodeData, type SheetStatus } from "@/lib/types";
import InstructionsTab from "./InstructionsTab";
import ScriptTab from "./ScriptTab";

type Tab = "instructions" | "script";
const TABS: { id: Tab; label: string }[] = [
  { id: "instructions", label: "Instructions" },
  { id: "script", label: "Script" },
];

/**
 * Side panel for one sheet node: manual details (Apps Script tag, status, last run)
 * plus the Instructions and Script tabs. Edits go straight to the node in memory;
 * nothing is saved anywhere yet (saving arrives in P1-5).
 */
export default function NodePanel({
  node,
  onChange,
  onClose,
}: {
  node: SheetFlowNode;
  onChange: (patch: Partial<SheetNodeData>) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("instructions");
  const d = node.data;

  // Arrow keys move between the two tabs (standard tab pattern).
  function onTabKey(e: KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      setTab((t) => (t === "instructions" ? "script" : "instructions"));
      e.preventDefault();
    }
  }

  return (
    <aside
      aria-label={`Details for ${d.name}`}
      className="flex h-full flex-col overflow-hidden bg-white"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-900" title={d.name}>
            {d.name}
          </h2>
          <div className="mt-1">
            <StatusChip status={d.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {/* Manual details */}
        <section aria-label="Details" className="space-y-3 rounded-md border border-slate-200 p-3">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-700">Has Apps Script</span>
            <input
              type="checkbox"
              role="switch"
              checked={d.hasAppsScript}
              onChange={(e) => onChange({ hasAppsScript: e.target.checked })}
              className="h-4 w-4 accent-amber-500"
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-700">Status</span>
            <select
              value={d.status}
              onChange={(e) => onChange({ status: e.target.value as SheetStatus })}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-700">Last run</span>
            <span className="text-slate-600">{formatLastRun(d.lastRun)}</span>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onChange({ lastRun: new Date().toISOString() })}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Set to now
            </button>
            <button
              type="button"
              onClick={() => onChange({ lastRun: null })}
              disabled={d.lastRun === null}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-slate-400">Status and last run are set by hand.</p>
        </section>

        {/* Tabs */}
        <div>
          <div role="tablist" aria-label="Node details" onKeyDown={onTabKey} className="flex gap-1 border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={
                  "-mb-px border-b-2 px-3 py-1.5 text-sm font-medium " +
                  (tab === t.id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-3">
            {tab === "instructions" ? (
              <InstructionsTab value={d.instructions} onChange={(instructions) => onChange({ instructions })} />
            ) : (
              <ScriptTab value={d.script} onChange={(script) => onChange({ script })} />
            )}
          </div>
        </div>
      </div>

      {/* Honest reminder until saving exists (P1-5) */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
        Not saved yet: edits live only in this browser tab until saving is added.
      </div>
    </aside>
  );
}
