"use client";

import { useState } from "react";
import { LIMITS } from "@/lib/limits";
import TriggerHelp from "./TriggerHelp";

/** Script tab: script text kept for reference only. Nothing here is ever run by this site. */
export default function ScriptTab({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [copyMsg, setCopyMsg] = useState<string>("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMsg("Copied");
    } catch {
      // Fallback for browsers that block the clipboard API: select the box text and
      // use the older copy command. If that fails too, tell the user to copy by hand.
      const box = document.getElementById("node-script") as HTMLTextAreaElement | null;
      let ok = false;
      if (box) {
        box.select();
        ok = document.execCommand("copy");
      }
      setCopyMsg(ok ? "Copied" : "Copy failed: select the text and copy it by hand");
    }
    setTimeout(() => setCopyMsg(""), 2500);
  }

  return (
    <div className="space-y-3">
      <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
        Reference only. Paste this into the sheet&apos;s own Apps Script. Nothing runs from this
        site. If a sheet has several script files, paste them all in this box, each starting with a
        divider comment like{" "}
        <code className="rounded bg-amber-100 px-1">// ===== File: Name.gs =====</code>
      </p>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="node-script" className="text-sm font-medium text-slate-700">
            Script
          </label>
          <div className="flex items-center gap-2">
            <span role="status" className="text-xs text-slate-500">
              {copyMsg}
            </span>
            <button
              type="button"
              onClick={copy}
              disabled={!value}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Copy
            </button>
          </div>
        </div>
        <textarea
          id="node-script"
          value={value}
          maxLength={LIMITS.script}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="// Paste the script here for reference"
          className="w-full resize-y overflow-x-auto whitespace-pre rounded-md border border-slate-300 bg-slate-50 p-2 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <div className="text-right text-xs text-slate-400">
          {value.length.toLocaleString()} / {LIMITS.script.toLocaleString()}
        </div>
      </div>

      <TriggerHelp />
    </div>
  );
}
