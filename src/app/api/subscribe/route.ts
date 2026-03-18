import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";

function generateToken(): string {
  return crypto.randomUUID();
}

export async function POST(request: Request) {
  const db = await getDb();
  
  if (!db) {
    return NextResponse.json(
      { error: "Database not configured. Please set DATABASE_URL." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { email, name, brandPreferences, categoryPreferences, telegramChatId } = body;

    if (telegramChatId) {
      const chatIdStr = String(telegramChatId);
      const existingTelegram = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.telegramChatId, chatIdStr))
        .limit(1);

      if (existingTelegram.length > 0) {
        const row = existingTelegram[0];
        return NextResponse.json(
          { 
            message: "Already subscribed via Telegram",
            preferencesUrl: row.email 
              ? `/preferences?email=${encodeURIComponent(row.email)}&token=${row.verifyToken}`
              : null
          },
          { status: 200 }
        );
      }

      const verifyToken = generateToken();

      await db.insert(subscribers).values({
        telegramChatId: String(telegramChatId),
        name: name || null,
        brandPreferences: brandPreferences ? JSON.stringify(brandPreferences) : null,
        categoryPreferences: categoryPreferences ? JSON.stringify(categoryPreferences) : null,
        verifyToken,
      });

      return NextResponse.json(
        { 
          message: "Successfully subscribed via Telegram",
          preferencesUrl: `/preferences?telegram=${telegramChatId}&token=${verifyToken}`
        },
        { status: 201 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const existingEmail = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      const row = existingEmail[0];
      return NextResponse.json(
        { 
          error: "Email already subscribed",
          token: row.verifyToken,
          preferencesUrl: `/preferences?email=${encodeURIComponent(email)}&token=${row.verifyToken}`
        },
        { status: 409 }
      );
    }

    const verifyToken = generateToken();

    await db.insert(subscribers).values({
      email,
      name: name || null,
      brandPreferences: brandPreferences ? JSON.stringify(brandPreferences) : null,
      categoryPreferences: categoryPreferences ? JSON.stringify(categoryPreferences) : null,
      verifyToken,
    });

    return NextResponse.json(
      { 
        message: "Successfully subscribed",
        token: verifyToken,
        preferencesUrl: `/preferences?email=${encodeURIComponent(email)}&token=${verifyToken}`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
