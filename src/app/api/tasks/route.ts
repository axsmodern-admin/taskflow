import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  await requireUser();

  const url = new URL(request.url);
  const clientId = url.searchParams.get("client");
  const status = url.searchParams.get("status");
  const assigneeId = url.searchParams.get("assignee");

  const tasks = await prisma.task.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(status ? { status: status as never } : {}),
      ...(assigneeId ? { assignments: { some: { userId: assigneeId } } } : {}),
    },
    include: {
      client: true,
      assignments: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const user = await requireUser();

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const clientId = String(body?.clientId ?? "").trim();
  const description = body?.description ? String(body.description).trim() : null;
  const status = String(body?.status ?? "TODO");
  const priority = String(body?.priority ?? "MEDIUM");
  const dueDate = body?.dueDate ? new Date(String(body.dueDate)) : null;
  const assigneeIds: string[] = Array.isArray(body?.assigneeIds)
    ? body.assigneeIds.map(String)
    : [];

  if (!title) return NextResponse.json({ error: "Task title is required." }, { status: 400 });
  if (!clientId) return NextResponse.json({ error: "Please choose a client." }, { status: 400 });
  if (Number.isNaN(dueDate?.getTime())) {
    return NextResponse.json({ error: "Invalid due date." }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status as never,
      priority: priority as never,
      dueDate,
      clientId,
      assignments: {
        create: assigneeIds.map((userId) => ({ userId })),
      },
    },
    include: {
      client: true,
      assignments: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
