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

function getMainKeyboard(lang: string = "en"): TelegramInlineKeyboardMarkup {
  const labels = lang === "ru" 
    ? { digest: "📰 Дайджест", prefs: "⚙️ Настройки", help: "❓ Помощь", lang: "🌐 Язык" }
    : { digest: "📰 Today's Digest", prefs: "⚙️ Preferences", help: "❓ Help", lang: "🌐 Language" };
  
  return {
    inline_keyboard: [
      [{ text: labels.digest, callback_data: `digest_${lang}` }],
      [{ text: labels.prefs, callback_data: "preferences" }],
      [{ text: labels.help, callback_data: "help" }],
      [{ text: labels.lang, callback_data: "language" }],
    ],
  };
}

function getLanguageKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🇬🇧 English", callback_data: "lang_en" }],
      [{ text: "🇷🇺 Русский", callback_data: "lang_ru" }],
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
    await handleCallbackQuery(callbackQuery, "en");
    return;
  }

  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.toLowerCase();
  const entities = message.entities;
  const lang = message.from?.language_code?.startsWith("ru") ? "ru" : "en";

  if (entities && entities[0]?.type === "bot_command") {
    const command = text.split(" ")[0];
    await handleCommand(chatId, message.from?.first_name, command, lang);
    return;
  }

  await sendMessage({
    chat_id: chatId,
    text: lang === "ru" 
      ? "Добро пожаловать в ModaScope! 👋\n\nИспользуйте /start для начала, /digest для новостей, /help для справки."
      : "Welcome to ModaScope! 👋\n\nUse /start to begin, /digest to get today's news, or /help for assistance.",
  });
}

async function handleCommand(chatId: number, firstName: string | undefined, command: string, lang: string = "en"): Promise<void> {
  switch (command) {
    case "/start":
      try {
        await fetch(`${API_URL}/api/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            telegramChatId: chatId,
            name: firstName || (lang === "ru" ? "Пользователь Telegram" : "Telegram User")
          }),
        });
      } catch (e) {
        console.error("Failed to subscribe:", e);
      }

      const welcomeMsg = lang === "ru"
        ? `👗 *ModaScope* — AI Дайджест моды\n\nДобро пожаловать${firstName ? `, ${firstName}` : ""}! Вы подписались на ежедневные дайджесты моды.\n\n*Что я умею:*\n• /digest — Получить новости\n• /preferences — Настроить интересы\n• /help — Помощь`
        : `👗 *ModaScope* — Your AI Fashion Digest\n\nWelcome${firstName ? `, ${firstName}` : ""}! You're now subscribed to daily fashion digests.\n\n*What I can do:*\n• /digest — Get today's top fashion news\n• /preferences — Customize your interests\n• /help — Get help`;

      await sendMessage({
        chat_id: chatId,
        text: welcomeMsg,
        parse_mode: "Markdown",
        reply_markup: getMainKeyboard(lang),
      });
      break;

    case "/digest":
      await sendDigest(chatId, lang);
      break;

    case "/preferences":
      await sendMessage({
        chat_id: chatId,
        text: lang === "ru" ? "⚙️ *Ваши предпочтения*\n\nВыберите категории:" : "⚙️ *Your Preferences*\n\nSelect the categories you're interested in:",
        parse_mode: "Markdown",
        reply_markup: getPreferencesKeyboard(),
      });
      break;

    case "/help":
      await sendMessage({
        chat_id: chatId,
        text: lang === "ru"
          ? "❓ *Помощь*\n\n*Команды:*\n• /start — Приветствие\n• /digest — Новости\n• /preferences — Интересы\n• /help — Помощь\n\n*О ModaScope:*\nModaScope отслеживает сотни источников моды и доставляет персональные дайджесты."
          : "❓ *Help*\n\n*Available Commands:*\n• /start — Welcome message and menu\n• /digest — Get today's fashion news\n• /preferences — Customize your interests\n• /help — Show this help message\n\n*About ModaScope:*\nModaScope monitors hundreds of fashion sources and delivers personalized daily digests.",
        parse_mode: "Markdown",
        reply_markup: getMainKeyboard(lang),
      });
      break;

    default:
      await sendMessage({
        chat_id: chatId,
        text: lang === "ru" ? "Неизвестная команда. Используйте /help." : "Unknown command. Use /help for available commands.",
      });
  }
}

async function handleCallbackQuery(callbackQuery: { id: string; data?: string; message?: { chat: { id: number } } }, userLang: string = "en"): Promise<void> {
  const chatId = callbackQuery.message?.chat.id;
  if (!chatId || !callbackQuery.data) return;

  const data = callbackQuery.data;
  let lang = userLang;

  if (data.startsWith("digest_")) {
    lang = data.replace("digest_", "");
    await sendDigest(chatId, lang);
    return;
  }

  if (data.startsWith("lang_")) {
    lang = data.replace("lang_", "");
    await sendMessage({
      chat_id: chatId,
      text: lang === "ru" ? "✅ Язык изменён на русский!" : "✅ Language changed to English!",
      reply_markup: getMainKeyboard(lang),
    });
    return;
  }

  switch (data) {
    case "digest":
      await sendDigest(chatId, lang);
      break;
    case "language":
      await sendMessage({
        chat_id: chatId,
        text: lang === "ru" ? "🌐 Выберите язык:" : "🌐 Select language:",
        reply_markup: getLanguageKeyboard(),
      });
      break;
    case "preferences":
      await sendMessage({
        chat_id: chatId,
        text: lang === "ru" ? "⚙️ *Ваши предпочтения*\n\nВыберите категории:" : "⚙️ *Your Preferences*\n\nSelect the categories you're interested in:",
        parse_mode: "Markdown",
        reply_markup: getPreferencesKeyboard(),
      });
      break;
    case "help":
      await sendMessage({
        chat_id: chatId,
        text: lang === "ru" 
          ? "❓ *Помощь*\n\n*Команды:*\n• /start — Приветствие и меню\n• /digest — Получить новости\n• /preferences — Настроить интересы\n• /help — Это сообщение"
          : "❓ *Help*\n\n*Available Commands:*\n• /start — Welcome message and menu\n• /digest — Get today's fashion news\n• /preferences — Customize your interests\n• /help — Show this help message",
        parse_mode: "Markdown",
        reply_markup: getMainKeyboard(lang),
      });
      break;
    case "back":
      await sendMessage({
        chat_id: chatId,
        text: lang === "ru" ? "Главное меню" : "Back to main menu",
        reply_markup: getMainKeyboard(lang),
      });
      break;
    default:
      if (data.startsWith("pref_")) {
        const category = data.replace("pref_", "");
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
          text: lang === "ru" ? `✅ Добавлено: *${category}*` : `✅ Added *${category}* to your preferences!`,
          parse_mode: "Markdown",
        });
      }
  }
}

export async function sendDigest(chatId: number, lang: string = "en"): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/api/news?limit=3`);
    const data = await res.json();
    const news = data.data || [];

    if (news.length === 0) {
      await sendMessage({
        chat_id: chatId,
        text: lang === "ru" ? "Новостей пока нет. Попробуйте позже!" : "No news available at the moment. Check back later!",
      });
      return;
    }

    const title = lang === "ru" ? "📰 Ежедневный дайджест моды" : "📰 *Today's Fashion Digest*";
    let digest = title + "\n\n";

    for (const item of news) {
      digest += `*${item.brand}*\n`;
      digest += `${item.title}\n`;
      digest += `${item.summary.slice(0, 80)}...\n\n`;
      if (item.url) {
        digest += `[${lang === "ru" ? "Читать источник" : "Read source"}](${item.url})\n`;
      }
      digest += "---\n\n";
    }

    digest += lang === "ru" ? "_Сделано с ❤️ от ModaScope_" : "_Powered by ModaScope_";

    await sendMessage({
      chat_id: chatId,
      text: digest,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Failed to fetch digest:", error);
    await sendMessage({
      chat_id: chatId,
      text: lang === "ru" ? "Не удалось получить новости. Попробуйте позже." : "Sorry, couldn't fetch the digest. Please try again later.",
    });
  }
}
