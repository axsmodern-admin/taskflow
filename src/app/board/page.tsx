import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cn, STATUS_ORDER, STATUS_LABELS } from "@/lib/utils";
import TaskCard, { TaskView } from "@/components/TaskCard";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tasks = (await prisma.task.findMany({
    include: {
      client: { select: { id: true, name: true } },
      assignments: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
  })) as unknown as TaskView[];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Board</h1>
          <p className="mt-1 text-sm text-slate-500">All tasks across all clients. Change a status with the dropdown on each card.</p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          + New task
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUS_ORDER.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="rounded-lg bg-slate-100 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-700">{STATUS_LABELS[status]}</h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                  {columnTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="px-1 py-4 text-center text-xs text-slate-400">No tasks</p>
                ) : (
                  columnTasks.map((t) => <TaskCard key={t.id} task={t} showClient />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
