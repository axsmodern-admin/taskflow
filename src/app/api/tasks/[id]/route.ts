import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUser();
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = String(body.title).trim() || existing.title;
  if (body.description !== undefined)
    data.description = body.description ? String(body.description).trim() : null;
  if (body.status !== undefined) data.status = String(body.status);
  if (body.priority !== undefined) data.priority = String(body.priority);
  if (body.dueDate !== undefined)
    data.dueDate = body.dueDate ? new Date(String(body.dueDate)) : null;
  if (body.clientId !== undefined && body.clientId !== existing.clientId) {
    const client = await prisma.client.findUnique({ where: { id: String(body.clientId) } });
    if (!client) return NextResponse.json({ error: "Client not found." }, { status: 400 });
    data.clientId = String(body.clientId);
  }

  const update: Record<string, unknown> = { ...data };
  if (Array.isArray(body.assigneeIds)) {
    const ids = body.assigneeIds.map(String);
    update.assignments = {
      deleteMany: {},
      create: ids.map((userId: string) => ({ userId })),
    };
  }

  const task = await prisma.task.update({
    where: { id },
    data: update,
    include: {
      client: true,
      assignments: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true, deletedBy: user.email });
}
