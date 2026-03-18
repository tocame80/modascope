import { TelegramUpdate, TelegramSendMessageParams, TelegramInlineKeyboardMarkup } from "./telegram";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_URL || "https://modascope-eb47.vercel.app";

async function sendMessage(params: TelegramSendMessageParams): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

function getMainKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "📰 Today's Digest", callback_data: "digest" }],
      [{ text: "⚙️ Preferences", callback_data: "preferences" }],
      [{ text: "❓ Help", callback_data: "help" }],
    ],
  };
}

function getPreferencesKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "👗 Runway", callback_data: "pref_runway" }, { text: "💼 Business", callback_data: "pref_business" }],
      [{ text: "📊 Analysis", callback_data: "pref_analysis" }, { text: "🌱 Sustainability", callback_data: "pref_sustainability" }],
      [{ text: "👟 Streetwear", callback_data: "pref_streetwear" }, { text: "💎 High Jewelry", callback_data: "pref_jewelry" }],
      [{ text: "« Back", callback_data: "back" }],
    ],
  };
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  const callbackQuery = update.callback_query;

  if (callbackQuery) {
    await handleCallbackQuery(callbackQuery);
    return;
  }

  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.toLowerCase();
  const entities = message.entities;

  if (entities && entities[0]?.type === "bot_command") {
    const command = text.split(" ")[0];
    await handleCommand(chatId, message.from?.first_name, command);
    return;
  }

  await sendMessage({
    chat_id: chatId,
    text: `Welcome to ModaScope! 👋\n\nUse /start to begin, /digest to get today's news, or /help for assistance.`,
  });
}

async function handleCommand(chatId: number, firstName: string | undefined, command: string): Promise<void> {
  switch (command) {
    case "/start":
      // Subscribe user via API
      try {
        await fetch(`${API_URL}/api/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            telegramChatId: chatId,
            name: firstName || "Telegram User"
          }),
        });
      } catch (e) {
        console.error("Failed to subscribe:", e);
      }

      await sendMessage({
        chat_id: chatId,
        text: `👗 *ModaScope* — Your AI Fashion Digest\n\nWelcome${firstName ? `, ${firstName}` : ""}! You're now subscribed to daily fashion digests.\n\n*What I can do:*\n• /digest — Get today's top fashion news\n• /preferences — Customize your interests\n• /help — Get help`,
        parse_mode: "Markdown",
        reply_markup: getMainKeyboard(),
      });
      break;

    case "/digest":
      await sendDigest(chatId);
      break;

    case "/preferences":
      await sendMessage({
        chat_id: chatId,
        text: `⚙️ *Your Preferences*\n\nSelect the categories you're interested in:`,
        parse_mode: "Markdown",
        reply_markup: getPreferencesKeyboard(),
      });
      break;

    case "/help":
      await sendMessage({
        chat_id: chatId,
        text: `❓ *Help*\n\n*Available Commands:*\n• /start — Welcome message and menu\n• /digest — Get today's fashion news\n• /preferences — Customize your interests\n• /help — Show this help message\n\n*About ModaScope:*\nModaScope monitors hundreds of fashion sources and delivers personalized daily digests.`,
        parse_mode: "Markdown",
        reply_markup: getMainKeyboard(),
      });
      break;

    default:
      await sendMessage({
        chat_id: chatId,
        text: `Unknown command. Use /help for available commands.`,
      });
  }
}

async function handleCallbackQuery(callbackQuery: { id: string; data?: string; message?: { chat: { id: number } } }): Promise<void> {
  const chatId = callbackQuery.message?.chat.id;
  if (!chatId || !callbackQuery.data) return;

  const data = callbackQuery.data;

  switch (data) {
    case "digest":
      await sendDigest(chatId);
      break;
    case "preferences":
      await sendMessage({
        chat_id: chatId,
        text: `⚙️ *Your Preferences*\n\nSelect the categories you're interested in:`,
        parse_mode: "Markdown",
        reply_markup: getPreferencesKeyboard(),
      });
      break;
    case "help":
      await sendMessage({
        chat_id: chatId,
        text: `❓ *Help*\n\n*Available Commands:*\n• /start — Welcome message and menu\n• /digest — Get today's fashion news\n• /preferences — Customize your interests\n• /help — Show this help message`,
        parse_mode: "Markdown",
        reply_markup: getMainKeyboard(),
      });
      break;
    case "back":
      await sendMessage({
        chat_id: chatId,
        text: `Back to main menu`,
        reply_markup: getMainKeyboard(),
      });
      break;
    default:
      if (data.startsWith("pref_")) {
        const category = data.replace("pref_", "");
        // Save preference
        try {
          await fetch(`${API_URL}/api/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telegramChatId: chatId }),
          });
        } catch (e) {
          console.error("Failed to update preference:", e);
        }
        await sendMessage({
          chat_id: chatId,
          text: `✅ Added *${category}* to your preferences!`,
          parse_mode: "Markdown",
        });
      }
  }
}

export async function sendDigest(chatId: number): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/api/news?limit=3`);
    const data = await res.json();
    const news = data.data || [];

    if (news.length === 0) {
      await sendMessage({
        chat_id: chatId,
        text: "No news available at the moment. Check back later!",
      });
      return;
    }

    let digest = "📰 *Today's Fashion Digest*\n\n";

    for (const item of news) {
      digest += `*${item.brand}*\n`;
      digest += `${item.title}\n`;
      digest += `${item.summary.slice(0, 100)}...\n\n`;
      digest += `_Why it matters: ${item.whyItMatters}_\n\n`;
      digest += "---\n\n";
    }

    digest += "_Powered by ModaScope_";

    await sendMessage({
      chat_id: chatId,
      text: digest,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Failed to fetch digest:", error);
    await sendMessage({
      chat_id: chatId,
      text: "Sorry, couldn't fetch the digest. Please try again later.",
    });
  }
}
