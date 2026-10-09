"use client";

import { useRouter } from "next/navigation";
import type { TaskStatus, Priority } from "@prisma/client";
import {
  cn,
  STATUS_ORDER,
  STATUS_BADGES,
  STATUS_LABELS,
  PRIORITY_BADGES,
  PRIORITY_LABELS,
  formatDueDate,
} from "@/lib/utils";

export type TaskView = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  client: { id: string; name: string };
  assignments: { id: string; user: { id: string; name: string } }[];
};

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "DONE") return false;
  const d = new Date(dueDate);
  return d.getTime() < Date.now();
}

export default function TaskCard({ task, showClient = false }: { task: TaskView; showClient?: boolean }) {
  const router = useRouter();

  async function changeStatus(value: string) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    router.refresh();
  }

  const overdue = isOverdue(task.dueDate, task.status);
  const dueLabel = task.dueDate
    ? overdue
      ? `Overdue · ${formatDueDate(new Date(task.dueDate))}`
      : formatDueDate(new Date(task.dueDate))
    : "No due date";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", PRIORITY_BADGES[task.priority])}>
          {PRIORITY_LABELS[task.priority] ?? task.priority}
        </span>
      </div>

      {showClient && (
        <p className="mt-1 text-xs text-slate-500">{task.client.name}</p>
      )}

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">{task.description}</p>
      )}

      {task.assignments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.assignments.map((a) => (
            <span
              key={a.id}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {a.user.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <span className={cn("text-xs", overdue ? "font-semibold text-red-600" : "text-slate-500")}>
          {dueLabel}
        </span>
        <select
          value={task.status}
          onChange={(e) => changeStatus(e.target.value)}
          className={cn(
            "cursor-pointer rounded-md border-0 px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-slate-400",
            STATUS_BADGES[task.status]
          )}
        >
          {STATUS_ORDER.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
