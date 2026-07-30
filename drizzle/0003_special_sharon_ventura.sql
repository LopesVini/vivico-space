CREATE TABLE `gallery_removal_votes` (
	`photo_id` text NOT NULL,
	`instagram` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`photo_id`, `instagram`),
	FOREIGN KEY (`photo_id`) REFERENCES `gallery_photos`(`id`) ON UPDATE no action ON DELETE cascade
);
