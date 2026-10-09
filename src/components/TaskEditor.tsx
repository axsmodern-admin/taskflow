"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskStatus, Priority } from "@prisma/client";
import { STATUS_ORDER, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/utils";
import type { TaskView } from "./TaskCard";

type Member = { id: string; name: string };
type ClientOption = { id: string; name: string };

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const inputClass =
  "w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";

export default function TaskEditor({
  task,
  onDone,
}: {
  task: TaskView;
  onDone: () => void;
}) {
  const router = useRouter();

  const [clients, setClients] = useState<ClientOption[] | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));
  const [clientId, setClientId] = useState(task.client.id);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    task.assignments.map((a) => a.user.id)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: ClientOption[]) => setClients(list))
      .catch(() => setClients([]));
    fetch("/api/members")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Member[]) => setMembers(list))
      .catch(() => setMembers([]));
  }, []);

  function toggleAssignee(id: string) {
    setAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description.trim() ? description.trim() : null,
        status,
        priority,
        dueDate: dueDate || null,
        clientId,
        assigneeIds,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong while saving.");
      setSaving(false);
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <div className="mt-3 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className={inputClass}
          >
            {STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={inputClass}
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputClass}
            disabled={clients === null || clients.length === 0}
          >
            {clients === null && <option>Loading…</option>}
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Assigned to
        </label>
        {members === null ? (
          <p className="text-xs text-slate-400">Loading team…</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-slate-400">No team members yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const checked = assigneeIds.includes(m.id);
              return (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                    checked
                      ? "border-slate-400 bg-white font-medium text-slate-900"
                      : "border-slate-300 bg-white text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAssignee(m.id)}
                    className="h-3.5 w-3.5"
                  />
                  {m.name}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving || title.trim() === ""}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
