import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const db = await getDb();
  
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const telegram = searchParams.get("telegram");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    let subscriber;
    if (telegram) {
      subscriber = await db.select().from(subscribers).where(eq(subscribers.telegramChatId, telegram)).limit(1);
    } else if (email) {
      subscriber = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    } else {
      return NextResponse.json({ error: "Email or telegram is required" }, { status: 400 });
    }

    if (subscriber.length === 0) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    const row = subscriber[0];
    if (row.verifyToken !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const brandPrefs = row.brandPreferences ? JSON.parse(row.brandPreferences) : [];
    const categoryPrefs = row.categoryPreferences ? JSON.parse(row.categoryPreferences) : [];

    return NextResponse.json({
      data: {
        email: row.email,
        telegramChatId: row.telegramChatId,
        name: row.name,
        brandPreferences: brandPrefs,
        categoryPreferences: categoryPrefs,
        subscribedAt: row.subscribedAt,
      },
    });
  } catch (error) {
    console.error("Preferences GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const db = await getDb();
  
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { email, token, telegramChatId, brandPreferences, categoryPreferences, name } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    let subscriber;
    if (telegramChatId) {
      subscriber = await db.select().from(subscribers).where(eq(subscribers.telegramChatId, String(telegramChatId))).limit(1);
    } else if (email) {
      subscriber = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    } else {
      return NextResponse.json({ error: "Email or telegramChatId is required" }, { status: 400 });
    }

    if (subscriber.length === 0) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    const row = subscriber[0];
    if (row.verifyToken !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const updates: Record<string, unknown> = {};
    if (brandPreferences !== undefined) updates.brandPreferences = JSON.stringify(brandPreferences);
    if (categoryPreferences !== undefined) updates.categoryPreferences = JSON.stringify(categoryPreferences);
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;

    if (telegramChatId) {
      await db.update(subscribers).set(updates).where(eq(subscribers.telegramChatId, String(telegramChatId)));
    } else if (email) {
      await db.update(subscribers).set(updates).where(eq(subscribers.email, email));
    }

    return NextResponse.json({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("Preferences POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
