import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cn, STATUS_BADGES, STATUS_LABELS } from "@/lib/utils";
import TaskCard, { TaskView } from "@/components/TaskCard";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  const tasks = (await prisma.task.findMany({
    where: { clientId: id },
    include: {
      client: { select: { id: true, name: true } },
      assignments: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: [{ status: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }],
  })) as unknown as TaskView[];

  const open = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/clients" className="text-xs font-medium text-slate-500 hover:text-slate-800">
            ← All clients
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{client.name}</h1>
          {client.contact && <p className="mt-1 text-sm text-slate-500">Contact: {client.contact}</p>}
          {client.notes && <p className="mt-2 max-w-xl text-sm text-slate-600">{client.notes}</p>}
          <p className="mt-2 text-sm text-slate-500">
            {open.length} open task{open.length === 1 ? "" : "s"} · {done.length} completed
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          + New task
        </Link>
      </div>

      {open.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Open tasks</h2>
          {open.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              showClient={false}
            />
          ))}
        </section>
      )}

      {open.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No open tasks for this client yet.
        </p>
      )}

      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Completed</h2>
          <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
            {done.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="truncate text-sm text-slate-500 line-through">{t.title}</p>
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
