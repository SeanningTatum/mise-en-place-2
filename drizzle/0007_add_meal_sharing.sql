-- Add sharing and generation status columns to multi_course_meal table
ALTER TABLE `multi_course_meal` ADD `slug` text;
--> statement-breakpoint
ALTER TABLE `multi_course_meal` ADD `is_public` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `multi_course_meal` ADD `generation_status` text;
--> statement-breakpoint
ALTER TABLE `multi_course_meal` ADD `generation_error` text;
