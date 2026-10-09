import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  await requireUser();

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      contact: true,
      notes: true,
      createdAt: true,
      _count: { select: { tasks: true } },
      tasks: {
        where: { status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] } },
        select: { id: true },
      },
    },
  });

  return NextResponse.json(
    clients.map(({ tasks, ...c }) => ({
      ...c,
      taskCount: c._count.tasks,
      openTaskCount: tasks.length,
    }))
  );
}

export async function POST(request: Request) {
  const user = await requireUser();

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Client name is required." }, { status: 400 });

  const client = await prisma.client.create({
    data: {
      name,
      contact: body?.contact ? String(body.contact).trim() : null,
      notes: body?.notes ? String(body.notes).trim() : null,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
