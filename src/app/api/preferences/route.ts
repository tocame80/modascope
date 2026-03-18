import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    const subscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);

    if (subscriber.length === 0) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    const row = subscriber[0];

    if (row.verifyToken !== token) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const brandPrefs = row.brandPreferences ? JSON.parse(row.brandPreferences) : [];
    const categoryPrefs = row.categoryPreferences ? JSON.parse(row.categoryPreferences) : [];

    return NextResponse.json({
      data: {
        email: row.email,
        name: row.name,
        brandPreferences: brandPrefs,
        categoryPreferences: categoryPrefs,
        subscribedAt: row.subscribedAt,
      },
    });
  } catch (error) {
    console.error("Preferences GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, brandPreferences, categoryPreferences, name } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    const subscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);

    if (subscriber.length === 0) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    const row = subscriber[0];

    if (row.verifyToken !== token) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const updates: Record<string, unknown> = {};
    
    if (brandPreferences !== undefined) {
      updates.brandPreferences = JSON.stringify(brandPreferences);
    }
    if (categoryPreferences !== undefined) {
      updates.categoryPreferences = JSON.stringify(categoryPreferences);
    }
    if (name !== undefined) {
      updates.name = name;
    }

    await db
      .update(subscribers)
      .set(updates)
      .where(eq(subscribers.email, email));

    return NextResponse.json({
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Preferences POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
