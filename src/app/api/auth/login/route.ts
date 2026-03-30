import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { verifyPassword, createToken } from "@shared/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

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
  });

  response.cookies.set("ftw-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
