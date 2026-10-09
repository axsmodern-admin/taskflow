"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-300 focus:outline-none";

export default function UserForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    setSaving(false);
    if (res.ok) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("MEMBER");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Full name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. John Brooks" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@company.com"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Temporary password *</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as "MEMBER" | "ADMIN")} className={inputCls}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
      >
        {saving ? "Adding…" : "Add team member"}
      </button>
    </form>
  );
}
