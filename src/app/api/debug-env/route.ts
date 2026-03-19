import { NextResponse } from "next/server";

export async function GET() {
  const gkey = process.env.GNEWS_API_KEY ? "SET" : "NOT SET";
  const gkeyVal = process.env.GNEWS_API_KEY ? process.env.GNEWS_API_KEY.substring(0, 10) + "..." : "none";
  
  return NextResponse.json({
    GNEWS_API_KEY: gkey,
    GNEWS_API_KEY_VALUE: gkeyVal,
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "SET" : "NOT SET",
    timestamp: new Date().toISOString()
  });
}
