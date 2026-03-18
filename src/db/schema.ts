import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  telegramChatId: text("telegram_chat_id").unique(),
  name: text("name"),
  brandPreferences: text("brand_preferences"),
  categoryPreferences: text("category_preferences"),
  isVerified: boolean("is_verified").default(false),
  verifyToken: text("verify_token"),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});
