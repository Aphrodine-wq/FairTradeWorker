import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@shared/lib/auth";
import { prisma } from "@shared/lib/db";

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "HOMEOWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { address, city, state, zip, propertyType } = body;

  try {
    const homeowner = await prisma.homeowner.update({
      where: { userId: user.userId },
      data: {
        location: [address, city, state, zip].filter(Boolean).join(", "),
        propertyType: propertyType || "single_family",
      },
    });

    return NextResponse.json({ homeowner: { id: homeowner.id, location: homeowner.location } });
  } catch {
    return NextResponse.json({ error: "Failed to save property" }, { status: 500 });
  }
}
