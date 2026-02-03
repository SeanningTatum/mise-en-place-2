CREATE TABLE `ingredient_alias` (
	`id` text PRIMARY KEY NOT NULL,
	`alias` text NOT NULL,
	`canonical_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`canonical_id`) REFERENCES `ingredient`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ingredient_alias_alias_unique` ON `ingredient_alias` (`alias`);--> statement-breakpoint
ALTER TABLE `recipe_ingredient` ADD `quantity_metric` integer;--> statement-breakpoint
ALTER TABLE `recipe_ingredient` ADD `unit_metric` text;