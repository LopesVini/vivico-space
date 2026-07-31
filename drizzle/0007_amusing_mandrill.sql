CREATE TABLE `anonymous_events` (
	`visitor_id` text NOT NULL,
	`event` text NOT NULL,
	`event_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`visitor_id`, `event`, `event_date`),
	FOREIGN KEY (`visitor_id`) REFERENCES `anonymous_visitors`(`visitor_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `anonymous_visitors` (
	`visitor_id` text PRIMARY KEY NOT NULL,
	`first_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
