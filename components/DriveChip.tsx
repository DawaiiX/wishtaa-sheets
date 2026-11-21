"use client";

import { useDrive } from "./DriveProvider";

/** Header chip: shows whether Google Drive is connected, with the Connect / Reconnect button. */
export default function DriveChip() {
  const { status, driveEmail, message, connect } = useDrive();

  if (status === "unconfigured") {
    return (
      <span
        className="hidden rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 sm:inline"
        title="Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local and restart the app."
      >
        Drive not set up
      </span>
    );
  }

  if (status === "connected") {
    return (
      <span
        className="inline-flex max-w-[16rem] items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800"
        title={`Google Drive connected: ${driveEmail ?? ""}`}
      >
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
        <span className="truncate">Drive: {driveEmail}</span>
      </span>
    );
  }

  const label =
    status === "connecting"
      ? "Connecting..."
      : status === "needsReconnect"
        ? "Reconnect Drive"
        : status === "mismatch"
          ? "Connect another account"
          : "Connect Google Drive";
  const warn = status === "needsReconnect" || status === "mismatch";

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span role="alert" className="hidden max-w-[22rem] truncate text-xs text-amber-700 lg:inline" title={message}>
          {message}
        </span>
      )}
      <button
        type="button"
        onClick={() => void connect()}
        disabled={status === "connecting"}
        className={
          "shrink-0 rounded-md border px-2.5 py-1 text-sm font-medium disabled:cursor-wait disabled:opacity-60 " +
          (warn
            ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
        }
      >
        {label}
      </button>
    </div>
  );
}
