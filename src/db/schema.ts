import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique(),
  telegramChatId: integer("telegram_chat_id").unique(),
  name: text("name"),
  brandPreferences: text("brand_preferences"),
  categoryPreferences: text("category_preferences"),
  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  verifyToken: text("verify_token"),
  subscribedAt: integer("subscribed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
