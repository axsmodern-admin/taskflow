import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import AddClientModal from "@/components/AddClientModal";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      contact: true,
      notes: true,
      _count: { select: { tasks: true } },
      tasks: {
        where: { status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] } },
        select: { id: true },
      },
    },
  });

  const openCount = (c: (typeof clients)[number]) => c.tasks.length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">Everyone you work with. Click a client to see their tasks.</p>
        </div>
        <AddClientModal />
      </div>

      {clients.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No clients yet — add your first one with the button above.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/clients/${c.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                  {c.contact && <p className="truncate text-xs text-slate-500">{c.contact}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-slate-700">{c._count.tasks} task{c._count.tasks === 1 ? "" : "s"}</p>
                  <p className="text-xs text-slate-500">{openCount(c)} open</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
