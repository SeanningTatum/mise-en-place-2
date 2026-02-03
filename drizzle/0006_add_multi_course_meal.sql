CREATE TABLE `meal_course` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_id` text NOT NULL,
	`recipe_id` text NOT NULL,
	`course_type` text NOT NULL,
	`course_order` integer NOT NULL,
	`servings_override` integer,
	`notes` text,
	FOREIGN KEY (`meal_id`) REFERENCES `multi_course_meal`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `multi_course_meal` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_id` text NOT NULL,
	`name` text NOT NULL,
	`guest_count` integer NOT NULL,
	`serving_time` text NOT NULL,
	`service_style` text NOT NULL,
	`notes` text,
	`ai_suggestions_json` text,
	`timeline_json` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
