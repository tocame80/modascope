import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { sql } from "drizzle-orm";

export async function POST() {
  const db = await getDb();
  
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        telegram_chat_id TEXT UNIQUE,
        name TEXT,
        brand_preferences TEXT,
        category_preferences TEXT,
        is_verified BOOLEAN DEFAULT false,
        verify_token TEXT,
        subscribed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    return NextResponse.json({ message: "Table created successfully" });
  } catch (error) {
    console.error("Create table error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
