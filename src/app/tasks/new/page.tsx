import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import NewTaskForm from "@/components/NewTaskForm";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [clients, users] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New task</h1>
        <p className="mt-1 text-sm text-slate-500">
          Give it a clear title, pick the client, and assign whoever should do it.
        </p>
      </div>
      <NewTaskForm
        clients={clients}
        users={users.map((u) => ({ id: u.id, name: u.name }))}
      />
    </div>
  );
}
