import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, createToken } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { role } = await req.json();
  if (!role || !["CONTRACTOR", "HOMEOWNER", "SUBCONTRACTOR"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    // Verify user has this role in their roles array
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, email: true, name: true, roles: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.roles.includes(role)) {
      return NextResponse.json({ error: "User does not have this role" }, { status: 403 });
    }

    // Update activeRole in database
    await prisma.user.update({
      where: { id: user.id },
      data: { activeRole: role },
    });

    // Issue new token with updated activeRole
    const token = createToken({
      userId: user.id,
      email: user.email,
      role,
      roles: user.roles as ("CONTRACTOR" | "HOMEOWNER" | "SUBCONTRACTOR")[],
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: role.toLowerCase(),
        roles: user.roles.map((r: string) => r.toLowerCase()),
      },
    });

    // Update httpOnly cookie
    response.cookies.set("ftw-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
}
