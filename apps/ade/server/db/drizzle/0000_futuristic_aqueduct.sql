CREATE TABLE `linked_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`refresh_token` text,
	`access_token` text NOT NULL,
	`text` text,
	`expires_at` integer,
	`auth_type` text NOT NULL,
	`scope` text(255),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
