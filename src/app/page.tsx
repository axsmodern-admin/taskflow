import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cn, STATUS_BADGES, STATUS_LABELS, formatDueDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tasks = await prisma.task.findMany({
    include: {
      client: { select: { id: true, name: true } },
      assignments: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  const now = Date.now();
  const weekAhead = now + 7 * 24 * 60 * 60 * 1000;

  const open = tasks.filter((t) => t.status !== "DONE");
  const overdue = open.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now);
  const dueThisWeek = open.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() >= now && new Date(t.dueDate).getTime() <= weekAhead
  );
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const blocked = tasks.filter((t) => t.status === "BLOCKED");

  const stats = [
    { label: "Overdue", value: overdue.length, tone: "text-red-600" },
    { label: "Due this week", value: dueThisWeek.length, tone: "text-amber-600" },
    { label: "In progress", value: inProgress.length, tone: "text-blue-600" },
    { label: "Blocked", value: blocked.length, tone: "text-red-600" },
  ];

  function TaskLine({ t }: { t: (typeof tasks)[number] }) {
    return (
      <li className="flex items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{t.title}</p>
          <p className="truncate text-xs text-slate-500">
            {t.client.name}
            {t.assignments.length > 0 && ` · ${t.assignments.map((a) => a.user.name).join(", ")}`}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_BADGES[t.status])}>
          {STATUS_LABELS[t.status]}
        </span>
      </li>
    );
  }

  const attentionList = [...overdue, ...dueThisWeek]
    .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Hello, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s where your team stands today.</p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          + New task
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className={cn("text-3xl font-bold", s.tone)}>{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Needs attention</h2>
            <Link href="/board" className="text-xs font-medium text-slate-500 hover:text-slate-800">
              View board →
            </Link>
          </div>
          {attentionList.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">Nothing overdue or due this week. Nice! 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100 px-4">
              {attentionList.map((t) => (
                <TaskLine key={t.id} t={t} />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Your tasks</h2>
          </div>
          <MyTasksPreview userId={user.id} />
        </div>
      </div>
    </div>
  );
}

async function MyTasksPreview({ userId }: { userId: string }) {
  const myTasks = await prisma.task.findMany({
    where: { assignments: { some: { userId } }, status: { not: "DONE" } },
    include: { client: { select: { name: true } } },
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
    take: 6,
  });

  if (myTasks.length === 0) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-slate-500">No open tasks assigned to you right now.</p>
        <Link href="/my-tasks" className="mt-2 inline-block text-xs font-medium text-slate-500 hover:text-slate-800">
          View all my tasks →
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 px-4">
      {myTasks.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{t.title}</p>
            <p className="truncate text-xs text-slate-500">
              {t.client.name}
              {t.dueDate && ` · ${formatDueDate(new Date(t.dueDate))}`}
            </p>
          </div>
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_BADGES[t.status])}>
            {STATUS_LABELS[t.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
