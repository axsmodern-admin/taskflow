"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-300 focus:outline-none";

export default function ClientForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact: contact || null, notes: notes || null }),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/clients");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Client name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Acme Corp"
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Contact person</label>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="e.g. Jane Smith, jane@acme.com"
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything useful to remember about this client…"
          className={inputCls}
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
      >
        {saving ? "Adding…" : "Add client"}
      </button>
    </form>
  );
}
