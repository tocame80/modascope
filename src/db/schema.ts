import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  brandPreferences: text("brand_preferences"),
  categoryPreferences: text("category_preferences"),
  subscribedAt: integer("subscribed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
