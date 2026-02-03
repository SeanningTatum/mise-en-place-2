CREATE TABLE `meal_plan_template` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`theme` text,
	`cover_image_url` text,
	`is_public` integer DEFAULT false NOT NULL,
	`import_count` integer DEFAULT 0 NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meal_plan_template_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`recipe_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`meal_type` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `meal_plan_template`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meal_plan_template_import` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`imported_by_id` text NOT NULL,
	`imported_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `meal_plan_template`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`imported_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meal_plan_template_user_slug_unique` ON `meal_plan_template` (`created_by_id`, `slug`);
