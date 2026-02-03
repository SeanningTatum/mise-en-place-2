PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text,
	`description` text,
	`source_url` text,
	`normalized_url` text,
	`source_type` text NOT NULL,
	`is_custom` integer DEFAULT false NOT NULL,
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
	`is_public` integer DEFAULT false NOT NULL,
	`save_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_recipe`("id", "created_by_id", "title", "slug", "description", "source_url", "normalized_url", "source_type", "is_custom", "youtube_video_id", "thumbnail_url", "servings", "prep_time_minutes", "cook_time_minutes", "calories", "protein", "carbs", "fat", "fiber", "is_public", "save_count", "created_at", "updated_at") SELECT "id", "created_by_id", "title", "slug", "description", "source_url", "normalized_url", "source_type", "is_custom", "youtube_video_id", "thumbnail_url", "servings", "prep_time_minutes", "cook_time_minutes", "calories", "protein", "carbs", "fat", "fiber", "is_public", "save_count", "created_at", "updated_at" FROM `recipe`;--> statement-breakpoint
DROP TABLE `recipe`;--> statement-breakpoint
ALTER TABLE `__new_recipe` RENAME TO `recipe`;--> statement-breakpoint
PRAGMA foreign_keys=ON;