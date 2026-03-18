import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ? "SET" : "NOT SET";
  const tgToken = process.env.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET";
  
  return NextResponse.json({
    DATABASE_URL: dbUrl,
    TELEGRAM_BOT_TOKEN: tgToken,
    timestamp: new Date().toISOString()
  });
}
