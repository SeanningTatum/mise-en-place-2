CREATE TABLE `ingredient` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ingredient_name_unique` ON `ingredient` (`name`);--> statement-breakpoint
CREATE TABLE `recipe` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`source_url` text NOT NULL,
	`source_type` text NOT NULL,
	`youtube_video_id` text,
	`thumbnail_url` text,
	`servings` integer,
	`prep_time_minutes` integer,
	`cook_time_minutes` integer,
	`calories` integer,
	`protein` integer,
	`carbs` integer,
	`fat` integer,
	`fiber` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredient` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`quantity` text,
	`unit` text,
	`notes` text,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recipe_step` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`instruction` text NOT NULL,
	`timestamp_seconds` integer,
	`duration_seconds` integer,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade
);
