ALTER TABLE `subscribers` ADD `is_verified` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `verify_token` text;