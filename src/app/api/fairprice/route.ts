import { NextRequest, NextResponse } from "next/server";

const CONSTRUCTIONAI_API_URL =
  process.env.CONSTRUCTIONAI_API_URL || "http://localhost:8000/api/estimate";

const VALID_SIZES = new Set(["small", "medium", "large", "major"]);
const ZIP_RE = /^\d{5}$/;
const MAX_DESCRIPTION_LEN = 500;
const MAX_CATEGORY_LEN = 100;

// POST /api/fairprice — public AI estimate (no auth, rate-limited in middleware)
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { category, zip, size, description } = body;

  // Strict input validation
  if (
    typeof category !== "string" ||
    typeof zip !== "string" ||
    typeof size !== "string"
  ) {
    return NextResponse.json(
      { error: "category, zip, and size are required strings" },
      { status: 400 }
    );
  }

  if (!ZIP_RE.test(zip)) {
    return NextResponse.json(
      { error: "zip must be a 5-digit US zip code" },
      { status: 400 }
    );
  }

  if (!VALID_SIZES.has(size)) {
    return NextResponse.json(
      { error: "size must be one of: small, medium, large, major" },
      { status: 400 }
    );
  }

  if (category.length > MAX_CATEGORY_LEN) {
    return NextResponse.json(
      { error: "category too long" },
      { status: 400 }
    );
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== "string" || description.length > MAX_DESCRIPTION_LEN) {
      return NextResponse.json(
        { error: "description must be a string under 500 characters" },
        { status: 400 }
      );
    }
  }

  // Sanitize: strip anything that isn't alphanumeric, spaces, or basic punctuation
  const safeCategory = category.replace(/[^\w\s\-/&]/g, "").slice(0, MAX_CATEGORY_LEN);
  const safeDescription =
    typeof description === "string"
      ? description.replace(/[^\w\s\-.,!?()'/&$#%@+:;]/g, "").slice(0, MAX_DESCRIPTION_LEN)
      : undefined;

  const sizeBudgets: Record<string, { sqft: number; budget: string; label: string }> = {
    small: { sqft: 150, budget: "$2,000-$5,000", label: "small" },
    medium: { sqft: 400, budget: "$5,000-$15,000", label: "medium" },
    large: { sqft: 1200, budget: "$15,000-$50,000", label: "large" },
    major: { sqft: 3000, budget: "$50,000+", label: "major" },
  };

  const sizeInfo = sizeBudgets[size] || sizeBudgets.medium;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const response = await fetch(CONSTRUCTIONAI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        project: {
          type: safeCategory,
          description:
            safeDescription ||
            `${sizeInfo.label} ${safeCategory.toLowerCase()} project in ${zip}. Budget range: ${sizeInfo.budget}. This is a ${sizeInfo.label}-sized residential project.`,
          sqft: sizeInfo.sqft,
          location: zip,
          quality: "mid-range",
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI service unavailable", fallback: true },
        { status: 503 }
      );
    }

    const result = await response.json();
    return NextResponse.json({ estimate: result, source: "constructionai" });
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable", fallback: true },
      { status: 503 }
    );
  }
}
