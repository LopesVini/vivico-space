CREATE TABLE `visitor_registry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`instagram` text NOT NULL,
	`first_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `visitor_registry_instagram_unique` ON `visitor_registry` (`instagram`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_visitor_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alias` text NOT NULL,
	`message` text NOT NULL,
	`favorite` text NOT NULL,
	`locale` text DEFAULT 'pt' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`visible` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_visitor_entries`("id", "alias", "message", "favorite", "locale", "created_at", "visible") SELECT "id", "alias", "message", "favorite", "locale", "created_at", "visible" FROM `visitor_entries`;--> statement-breakpoint
DROP TABLE `visitor_entries`;--> statement-breakpoint
ALTER TABLE `__new_visitor_entries` RENAME TO `visitor_entries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;