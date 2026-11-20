"use client";

import { useAuth } from "./AuthProvider";

/** Header: who is signed in, and the Sign out button. */
export default function UserMenu() {
  const { user, displayName, signOut } = useAuth();
  if (!user) return null;
  return (
    <div className="flex min-w-0 items-center justify-end gap-3">
      <div className="hidden min-w-0 text-right sm:block">
        <div className="truncate text-sm font-medium text-slate-800">{displayName}</div>
        {user.email && user.email !== displayName && (
          <div className="truncate text-xs text-slate-500">{user.email}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Sign out
      </button>
    </div>
  );
}
