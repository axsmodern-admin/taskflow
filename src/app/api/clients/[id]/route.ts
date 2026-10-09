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

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim() || existing.name;
  if (body.contact !== undefined)
    data.contact = body.contact ? String(body.contact).trim() : null;
  if (body.notes !== undefined) data.notes = body.notes ? String(body.notes).trim() : null;

  const client = await prisma.client.update({ where: { id }, data });
  return NextResponse.json(client);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUser();
  const { id } = await params;

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
