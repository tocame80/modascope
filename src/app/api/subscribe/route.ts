import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";

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
      return NextResponse.json(
        { error: "Email already subscribed" },
        { status: 409 }
      );
    }

    await db.insert(subscribers).values({
      email,
      name: name || null,
      brandPreferences: brandPreferences || null,
      categoryPreferences: categoryPreferences || null,
    });

    return NextResponse.json(
      { message: "Successfully subscribed" },
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
