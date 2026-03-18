import { TelegramUpdate, TelegramSendMessageParams, TelegramInlineKeyboardMarkup } from "./telegram";

const TELEGRAM_API_URL = `https://api.telegram.io/v0`;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(params: TelegramSendMessageParams): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not configured");
    return;
  }

  try {
    await fetch(`${TELEGRAM_API_URL}/bot${BOT_TOKEN}/sendMessage`, {
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
    await handleCommand(chatId, command);
    return;
  }

  await sendMessage({
    chat_id: chatId,
    text: `Welcome to ModaScope! 👋\n\nUse /start to begin, /digest to get today's news, or /help for assistance.`,
  });
}

async function handleCommand(chatId: number, command: string): Promise<void> {
  switch (command) {
    case "/start":
      await sendMessage({
        chat_id: chatId,
        text: `👗 *ModaScope* — Your AI Fashion Digest

Stay ahead of fashion trends with personalized daily digests.

*What I can do:*
• /digest — Get today's top fashion news
• /preferences — Customize your interests
• /help — Get help

_Choose your interests to personalize your feed._`,
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
        text: `⚙️ *Your Preferences*

Select the categories you're interested in:`,
        parse_mode: "Markdown",
        reply_markup: getPreferencesKeyboard(),
      });
      break;

    case "/help":
      await sendMessage({
        chat_id: chatId,
        text: `❓ *Help*

*Available Commands:*
• /start — Welcome message and menu
• /digest — Get today's fashion news
• /preferences — Customize your interests
• /help — Show this help message

*About ModaScope:*
ModaScope monitors hundreds of fashion sources and delivers personalized daily digests.`,
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
        text: `⚙️ *Your Preferences*

Select the categories you're interested in:`,
        parse_mode: "Markdown",
        reply_markup: getPreferencesKeyboard(),
      });
      break;
    case "help":
      await sendMessage({
        chat_id: chatId,
        text: `❓ *Help*

*Available Commands:*
• /start — Welcome message and menu
• /digest — Get today's fashion news
• /preferences — Customize your interests
• /help — Show this help message`,
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
        await sendMessage({
          chat_id: chatId,
          text: `✅ Added *${category}* to your preferences!`,
          parse_mode: "Markdown",
        });
      }
  }
}

async function sendDigest(chatId: number): Promise<void> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/news?limit=3`);
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
