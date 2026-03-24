import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { hashPassword, createToken } from "@shared/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name, role, phone } = body;

  if (!email || !password || !name || !role) {
    return NextResponse.json(
      { error: "Email, password, name, and role are required" },
      { status: 400 }
    );
  }

  if (!["CONTRACTOR", "HOMEOWNER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
      phone: phone || null,
      ...(role === "CONTRACTOR"
        ? { contractor: { create: {} } }
        : { homeowner: { create: {} } }),
    },
    include: {
      contractor: role === "CONTRACTOR",
      homeowner: role === "HOMEOWNER",
    },
  });

  const token = createToken({ userId: user.id, email: user.email, role: user.role });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  }, { status: 201 });

  response.cookies.set("ftw-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
