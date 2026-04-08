import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { hashPassword, createToken, COOKIE_MAX_AGE } from "@shared/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name, role, phone } = body;

  if (!email || !password || !name || !role) {
    return NextResponse.json(
      { error: "Email, password, name, and role are required" },
      { status: 400 }
    );
  }

  if (!["CONTRACTOR", "HOMEOWNER", "SUBCONTRACTOR"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const roleRelation =
    role === "CONTRACTOR"
      ? { contractor: { create: {} } }
      : role === "SUBCONTRACTOR"
        ? { subContractor: { create: {} } }
        : { homeowner: { create: {} } };

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      roles: [role],
      activeRole: role,
      phone: phone || null,
      ...roleRelation,
    },
    include: {
      contractor: role === "CONTRACTOR",
      homeowner: role === "HOMEOWNER",
      subContractor: role === "SUBCONTRACTOR",
    },
  });

  const token = createToken({
    userId: user.id,
    email: user.email,
    role: user.activeRole,
    roles: user.roles as ("CONTRACTOR" | "HOMEOWNER" | "SUBCONTRACTOR")[],
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.activeRole,
      roles: user.roles,
    },
    token,
  }, { status: 201 });

  response.cookies.set("ftw-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
