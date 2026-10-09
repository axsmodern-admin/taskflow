import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { assignments: true } },
    },
  });

  return NextResponse.json(
    users.map((u) => ({ ...u, assignmentCount: u._count.assignments }))
  );
}

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");
  const role = body?.role === "ADMIN" ? "ADMIN" : "MEMBER";

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { name, email, role, passwordHash: await hashPassword(password) },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user, { status: 201 });
}
