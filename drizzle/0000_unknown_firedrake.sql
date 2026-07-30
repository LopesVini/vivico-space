CREATE TABLE `visitor_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alias` text NOT NULL,
	`message` text NOT NULL,
	`favorite` text NOT NULL,
	`locale` text DEFAULT 'pt' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`visible` integer DEFAULT 1 NOT NULL
);
