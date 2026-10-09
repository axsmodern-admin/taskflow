import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const current = await requireAdmin();
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Never allow an admin to demote themselves (keeps at least one admin).
  if (id === current.id && body.role === "MEMBER") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "You can't remove your own admin role — you're the only admin." },
        { status: 400 }
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim() || target.name;
  if (body.role !== undefined) data.role = body.role === "ADMIN" ? "ADMIN" : "MEMBER";

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const current = await requireAdmin();
  const { id } = await params;

  if (id === current.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (target.role === "ADMIN" && adminCount <= 1) {
    return NextResponse.json(
      { error: "Can't delete the last admin account." },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
