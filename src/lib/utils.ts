import type { TaskStatus, Priority } from "@prisma/client";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Done",
};

export const STATUS_BADGES: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  BLOCKED: "bg-red-100 text-red-700",
  DONE: "bg-green-100 text-green-700",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const PRIORITY_BADGES: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

export function formatDueDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
