import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { hashPassword } from "@shared/lib/auth";
import jwt from "jsonwebtoken";

interface ResetPayload {
  userId: string;
  type: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, password } = body;

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  let payload: ResetPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as ResetPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired reset token" },
      { status: 400 }
    );
  }

  if (payload.type !== "reset") {
    return NextResponse.json(
      { error: "Invalid token type" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: payload.userId },
    data: { passwordHash },
  });

  return NextResponse.json({ message: "Password reset successfully" });
}
