import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/lib/db";
import { getAuthUser } from "@shared/lib/auth";

// GET /api/contractor/profile — get current contractor's profile
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contractor = await prisma.contractor.findUnique({
    where: { userId: user.userId },
    include: {
      user: { select: { name: true, email: true, phone: true, avatar: true } },
      licenses: true,
      insuranceCerts: true,
    },
  });

  if (!contractor) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ contractor });
}

// PATCH /api/contractor/profile — update contractor profile
export async function PATCH(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "CONTRACTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    company, bio, specialty, skills, location, serviceRadius,
    yearsExperience, hourlyRate,
  } = body;

  const contractor = await prisma.contractor.update({
    where: { userId: user.userId },
    data: {
      ...(company !== undefined && { company }),
      ...(bio !== undefined && { bio }),
      ...(specialty !== undefined && { specialty }),
      ...(skills !== undefined && { skills }),
      ...(location !== undefined && { location }),
      ...(serviceRadius !== undefined && { serviceRadius }),
      ...(yearsExperience !== undefined && { yearsExperience }),
      ...(hourlyRate !== undefined && { hourlyRate }),
    },
    include: {
      user: { select: { name: true, email: true, phone: true, avatar: true } },
      licenses: true,
      insuranceCerts: true,
    },
  });

  return NextResponse.json({ contractor });
}
