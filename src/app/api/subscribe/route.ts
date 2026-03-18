import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";

function generateToken(): string {
  return crypto.randomUUID();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, brandPreferences, categoryPreferences } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const existingSubscriber = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);

    if (existingSubscriber.length > 0) {
      const row = existingSubscriber[0];
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
