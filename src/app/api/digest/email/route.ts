import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { subscribers } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { getEmailProvider, buildDigestEmailHtml } from "@/lib/email";

const API_URL = process.env.NEXT_PUBLIC_URL || "https://modascope-eb47.vercel.app";

export async function POST(request: Request) {
  const db = await getDb();
  
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (email) {
      const subscriber = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
      if (subscriber.length === 0) {
        return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
      }

      const newsRes = await fetch(`${API_URL}/api/news?limit=5`);
      const newsData = await newsRes.json();
      const news = newsData.data || [];
      if (news.length === 0) {
        return NextResponse.json({ error: "No news available" }, { status: 400 });
      }

      const provider = getEmailProvider();
      await provider.send(email, "📰 Today's Fashion Digest — " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), buildDigestEmailHtml(news));
      return NextResponse.json({ message: "Digest sent successfully", sent: 1 });
    }

    const emailSubscribers = await db.select().from(subscribers).where(sql`${subscribers.email} IS NOT NULL`);
    if (emailSubscribers.length === 0) {
      return NextResponse.json({ message: "No email subscribers found", sent: 0 });
    }

    const newsRes = await fetch(`${API_URL}/api/news?limit=5`);
    const newsData = await newsRes.json();
    const news = newsData.data || [];
    if (news.length === 0) {
      return NextResponse.json({ message: "No news available", sent: 0 });
    }

    const html = buildDigestEmailHtml(news);
    const subject = "📰 Today's Fashion Digest — " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const provider = getEmailProvider();

    let sent = 0;
    for (const subscriber of emailSubscribers) {
      if (subscriber.email) {
        try {
          await provider.send(subscriber.email, subject, html);
          sent++;
        } catch (err) {
          console.error(`Failed to send to ${subscriber.email}:`, err);
        }
      }
    }

    return NextResponse.json({ message: "Digest sent successfully", sent });
  } catch (error) {
    console.error("Send digest error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
