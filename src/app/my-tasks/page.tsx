import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cn, STATUS_BADGES, STATUS_LABELS } from "@/lib/utils";
import TaskCard, { TaskView } from "@/components/TaskCard";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tasks = (await prisma.task.findMany({
    where: { assignments: { some: { userId: user.id } } },
    include: {
      client: { select: { id: true, name: true } },
      assignments: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
  })) as unknown as TaskView[];

  const open = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          {open.length} open task{open.length === 1 ? "" : "s"} assigned to you.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Open</h2>
        {open.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Nothing assigned to you right now. Enjoy the calm!
          </p>
        ) : (
          open.map((t) => <TaskCard key={t.id} task={t} showClient />)
        )}
      </section>

      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Completed</h2>
          <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
            {done.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-500 line-through">{t.title}</p>
                  <p className="truncate text-xs text-slate-400">{t.client.name}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_BADGES[t.status])}>
                  {STATUS_LABELS[t.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
