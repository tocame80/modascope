import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { sql } from "drizzle-orm";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    // Get all Telegram subscribers
    const telegramSubscribers = await db
      .select()
      .from(subscribers)
      .where(sql`${subscribers.telegramChatId} IS NOT NULL`);

    if (telegramSubscribers.length === 0) {
      return NextResponse.json({ 
        message: "No Telegram subscribers found",
        sent: 0 
      });
    }

    // Fetch news
    const newsRes = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/news?limit=5`);
    const newsData = await newsRes.json();
    const news = newsData.data || [];

    if (news.length === 0) {
      return NextResponse.json({ 
        message: "No news available",
        sent: 0 
      });
    }

    // Build digest message
    let digest = "📰 *Today's Fashion Digest*\n\n";

    for (const item of news) {
      digest += `*${item.brand}*\n`;
      digest += `${item.title}\n`;
      digest += `${item.summary.slice(0, 100)}...\n\n`;
      digest += `_Why it matters: ${item.whyItMatters}_\n\n`;
      digest += "---\n\n";
    }

    digest += "_Powered by ModaScope_";

    // Send to all subscribers
    let sent = 0;
    for (const subscriber of telegramSubscribers) {
      if (subscriber.telegramChatId) {
        await sendTelegramMessage(subscriber.telegramChatId, digest);
        sent++;
      }
    }

    return NextResponse.json({ 
      message: "Digest sent successfully",
      sent 
    });
  } catch (error) {
    console.error("Send digest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
