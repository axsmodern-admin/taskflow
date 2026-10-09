import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import UserForm from "@/components/UserForm";
import UserActions from "@/components/UserActions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const current = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assignments: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Team</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everyone with access to TaskFlow. Admins can manage this list and see every client&apos;s tasks.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {u.name}
                    {u.id === current.id && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        You
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {u.email} · {u._count.assignments} task{u._count.assignments === 1 ? "" : "s"} assigned
                  </p>
                </div>
                <UserActions
                  userId={u.id}
                  name={u.name}
                  role={u.role}
                  canManage={u.id !== current.id}
                />
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-400">
            Removing someone closes their login and unassigns their tasks.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Add a team member</h2>
          <UserForm />
        </div>
      </div>
    </div>
  );
}
