CREATE TABLE `gallery_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`instagram` text NOT NULL,
	`object_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `visitor_registry` ADD `message` text;--> statement-breakpoint
ALTER TABLE `visitor_registry` ADD `visitor_token` text;