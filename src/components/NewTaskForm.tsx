"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-300 focus:outline-none";

export default function NewTaskForm({
  clients,
  users,
  bare = false,
  onDone,
  defaultClientId,
}: {
  clients: { id: string; name: string }[];
  users: { id: string; name: string }[];
  bare?: boolean;
  onDone?: () => void;
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(defaultClientId ?? clients[0]?.id ?? "");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);

  function toggleAssignee(id: string) {
    setAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        clientId,
        priority,
        dueDate: dueDate || null,
        assigneeIds: assignees,
      }),
    });

    setSaving(false);
    if (res.ok) {
      if (!bare) router.push("/board");
      router.refresh();
      onDone?.();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
    }
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">You need a client before you can create tasks.</p>
        <Link
          href="/clients"
          className="mt-3 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add your first client
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={bare ? "space-y-4" : "space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Task title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Design new homepage hero"
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional details, links, context…"
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Client *</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputCls}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
        <div className="flex gap-2">
          {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors " +
                (priority === p
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50")
              }
            >
              {p === "LOW" ? "Low" : p === "MEDIUM" ? "Medium" : "High"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Assign team members</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {users.map((u) => (
            <label
              key={u.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={assignees.includes(u.id)}
                onChange={() => toggleAssignee(u.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {u.name}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create task"}
        </button>
        <Link href="/board" className="text-sm text-slate-500 hover:text-slate-800">
          Cancel
        </Link>
      </div>
    </form>
  );
}
