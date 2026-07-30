CREATE TABLE `abuse_events` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`fingerprint` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `abuse_events_lookup_idx` ON `abuse_events` (`kind`,`fingerprint`,`created_at`);--> statement-breakpoint
CREATE TABLE `gallery_vote_origins` (
	`photo_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`photo_id`, `fingerprint`),
	FOREIGN KEY (`photo_id`) REFERENCES `gallery_photos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DELETE FROM `gallery_photos`
WHERE `id` IN (
	SELECT older.`id`
	FROM `gallery_photos` older
	JOIN `gallery_photos` newer ON newer.`instagram` = older.`instagram`
	WHERE newer.`created_at` > older.`created_at`
		OR (newer.`created_at` = older.`created_at` AND newer.`id` > older.`id`)
);--> statement-breakpoint
CREATE UNIQUE INDEX `gallery_photos_instagram_unique` ON `gallery_photos` (`instagram`);
