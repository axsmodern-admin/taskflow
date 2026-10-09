import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");

  if (!name || !email || password.length < 6) {
    return NextResponse.json(
      { error: "Name, email, and a password of at least 6 characters are required." },
      { status: 400 }
    );
  }

  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return NextResponse.json(
      { error: "Registration is closed. Ask an admin to create your account." },
      { status: 403 }
    );
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role: "ADMIN" },
  });

  await createSession(email);
  return NextResponse.json({ ok: true, id: user.id, name: user.name, role: user.role });
}
