import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const resetToken = jwt.sign(
      { userId: user.id, type: "reset" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // TODO: send reset email with token
  }

  // Always return success to avoid leaking whether the email exists
  return NextResponse.json({
    message: "If an account exists, a reset link has been sent.",
  });
}
