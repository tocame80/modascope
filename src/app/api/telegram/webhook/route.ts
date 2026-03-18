import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram-bot";
import { TelegramUpdate } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const body = await request.json() as TelegramUpdate;
    
    if (!body.update_id) {
      return NextResponse.json({ error: "Invalid update" }, { status: 400 });
    }

    await handleTelegramUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
