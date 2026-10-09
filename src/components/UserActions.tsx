"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
type Role = "MEMBER" | "ADMIN";

export default function UserActions({
  userId,
  name,
  role,
  canManage,
}: {
  userId: string;
  name: string;
  role: Role;
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function changeRole(nextRole: Role) {
    if (nextRole === role || busy) return;
    setBusy(true);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function removeUser() {
    setBusy(true);
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={!canManage || busy}
        onChange={(e) => changeRole(e.target.value as Role)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-slate-500 focus:outline-none disabled:opacity-50"
      >
        <option value="ADMIN">Admin</option>
        <option value="MEMBER">Member</option>
      </select>

      {canManage &&
        (confirming ? (
          <>
            <button
              onClick={removeUser}
              disabled={busy}
              className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            disabled={busy}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            Remove
          </button>
        ))}
    </div>
  );
}
