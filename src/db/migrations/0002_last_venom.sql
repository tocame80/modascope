PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`telegram_chat_id` integer,
	`name` text,
	`brand_preferences` text,
	`category_preferences` text,
	`is_verified` integer DEFAULT false,
	`verify_token` text,
	`subscribed_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_subscribers`("id", "email", "telegram_chat_id", "name", "brand_preferences", "category_preferences", "is_verified", "verify_token", "subscribed_at") SELECT "id", "email", "telegram_chat_id", "name", "brand_preferences", "category_preferences", "is_verified", "verify_token", "subscribed_at" FROM `subscribers`;--> statement-breakpoint
DROP TABLE `subscribers`;--> statement-breakpoint
ALTER TABLE `__new_subscribers` RENAME TO `subscribers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_telegram_chat_id_unique` ON `subscribers` (`telegram_chat_id`);