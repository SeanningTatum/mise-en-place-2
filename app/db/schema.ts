import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role", { enum: ["user", "admin"] })
    .notNull()
    .default("user"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
});

export type User = typeof user.$inferSelect;
export type UpdateUserInput = typeof user.$inferInsert;

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Recipe tables
export const recipe = sqliteTable("recipe", {
  id: text("id").primaryKey(),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug"), // URL-safe title for public URLs
  description: text("description"),
  sourceUrl: text("source_url"), // Nullable for custom recipes
  normalizedUrl: text("normalized_url"), // Nullable for custom recipes
  sourceType: text("source_type", {
    enum: ["youtube", "blog", "custom"],
  }).notNull(),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false).notNull(), // True for user-created recipes
  youtubeVideoId: text("youtube_video_id"),
  thumbnailUrl: text("thumbnail_url"),
  servings: integer("servings"),
  prepTimeMinutes: integer("prep_time_minutes"),
  cookTimeMinutes: integer("cook_time_minutes"),
  // Macros per serving
  calories: integer("calories"),
  protein: integer("protein"), // grams
  carbs: integer("carbs"), // grams
  fat: integer("fat"), // grams
  fiber: integer("fiber"), // grams
  // Public sharing fields
  isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),
  saveCount: integer("save_count").default(0).notNull(), // Number of imports
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type Recipe = typeof recipe.$inferSelect;
export type InsertRecipe = typeof recipe.$inferInsert;

export const recipeStep = sqliteTable("recipe_step", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  instruction: text("instruction").notNull(),
  timestampSeconds: integer("timestamp_seconds"),
  durationSeconds: integer("duration_seconds"),
});

export type RecipeStep = typeof recipeStep.$inferSelect;
export type InsertRecipeStep = typeof recipeStep.$inferInsert;

export const ingredient = sqliteTable("ingredient", {
  id: text("id").primaryKey(),
  // Unique constraint is case-sensitive; repository normalizes to lowercase
  name: text("name").notNull().unique(),
  category: text("category"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export type Ingredient = typeof ingredient.$inferSelect;
export type InsertIngredient = typeof ingredient.$inferInsert;

export const recipeIngredient = sqliteTable("recipe_ingredient", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  ingredientId: text("ingredient_id")
    .notNull()
    .references(() => ingredient.id, { onDelete: "cascade" }),
  quantity: text("quantity"), // stored as text to handle fractions like "1/2"
  unit: text("unit"), // normalized unit name
  notes: text("notes"),
  // Metric conversion for grocery list aggregation
  quantityMetric: integer("quantity_metric"), // quantity converted to metric (ml or g), scaled by 100 for precision
  unitMetric: text("unit_metric", { enum: ["ml", "g"] }), // metric unit type
});

export type RecipeIngredient = typeof recipeIngredient.$inferSelect;
export type InsertRecipeIngredient = typeof recipeIngredient.$inferInsert;

// Ingredient aliases for normalization
export const ingredientAlias = sqliteTable("ingredient_alias", {
  id: text("id").primaryKey(),
  alias: text("alias").notNull().unique(), // normalized alias (lowercase)
  canonicalId: text("canonical_id")
    .notNull()
    .references(() => ingredient.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export type IngredientAlias = typeof ingredientAlias.$inferSelect;
export type InsertIngredientAlias = typeof ingredientAlias.$inferInsert;

// Meal planning tables
export const mealPlan = sqliteTable("meal_plan", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  weekStartDate: text("week_start_date").notNull(), // ISO date string (Monday)
  name: text("name"), // Optional custom name
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type MealPlan = typeof mealPlan.$inferSelect;
export type InsertMealPlan = typeof mealPlan.$inferInsert;

export const mealPlanEntry = sqliteTable("meal_plan_entry", {
  id: text("id").primaryKey(),
  mealPlanId: text("meal_plan_id")
    .notNull()
    .references(() => mealPlan.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Monday, 6=Sunday
  mealType: text("meal_type", {
    enum: ["breakfast", "lunch", "dinner", "snacks"],
  }).notNull(),
});

export type MealPlanEntry = typeof mealPlanEntry.$inferSelect;
export type InsertMealPlanEntry = typeof mealPlanEntry.$inferInsert;

// Profile sharing tables
export const userProfile = sqliteTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(), // URL-safe, lowercase
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type UserProfile = typeof userProfile.$inferSelect;
export type InsertUserProfile = typeof userProfile.$inferInsert;

// Recipe import tracking (for analytics and attribution)
export const recipeImport = sqliteTable("recipe_import", {
  id: text("id").primaryKey(),
  sourceRecipeId: text("source_recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  importedRecipeId: text("imported_recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  importedById: text("imported_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  importedAt: integer("imported_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export type RecipeImport = typeof recipeImport.$inferSelect;
export type InsertRecipeImport = typeof recipeImport.$inferInsert;

// Multi-course meal planning tables
export const multiCourseMeal = sqliteTable("multi_course_meal", {
  id: text("id").primaryKey(),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug"), // URL-safe identifier for sharing
  guestCount: integer("guest_count").notNull(),
  servingTime: text("serving_time").notNull(), // ISO datetime string
  serviceStyle: text("service_style", {
    enum: ["plated", "family", "buffet"],
  }).notNull(),
  notes: text("notes"),
  // Sharing and visibility
  isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),
  // AI generation status for loading page
  generationStatus: text("generation_status", {
    enum: ["pending", "generating", "complete", "error"],
  }),
  generationError: text("generation_error"), // Error message if generation failed
  // Cached AI data stored as JSON
  aiSuggestionsJson: text("ai_suggestions_json", { mode: "json" }).$type<{
    suggestions?: Array<{
      courseType: string;
      suggestedRecipeId?: string;
      suggestion: string;
      reasoning: string;
    }>;
    generatedAt?: string;
  }>(),
  timelineJson: text("timeline_json", { mode: "json" }).$type<{
    items?: Array<{
      id: string;
      time: string;
      task: string;
      recipeId?: string;
      recipeName?: string;
      durationMinutes: number;
      category: "prep" | "cook" | "rest" | "serve";
    }>;
    generatedAt?: string;
  }>(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type MultiCourseMeal = typeof multiCourseMeal.$inferSelect;
export type InsertMultiCourseMeal = typeof multiCourseMeal.$inferInsert;

export const mealCourse = sqliteTable("meal_course", {
  id: text("id").primaryKey(),
  mealId: text("meal_id")
    .notNull()
    .references(() => multiCourseMeal.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  courseType: text("course_type", {
    enum: ["appetizer", "soup_salad", "main", "side", "dessert", "drink"],
  }).notNull(),
  courseOrder: integer("course_order").notNull(),
  servingsOverride: integer("servings_override"), // Optional override for scaling
  notes: text("notes"),
});

export type MealCourse = typeof mealCourse.$inferSelect;
export type InsertMealCourse = typeof mealCourse.$inferInsert;

// Meal plan template tables (for sharing weekly meal plans)
export const mealPlanTemplate = sqliteTable("meal_plan_template", {
  id: text("id").primaryKey(),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(), // URL-safe identifier, unique per user
  description: text("description"),
  theme: text("theme"), // e.g., "Mediterranean", "Budget-Friendly", "Quick Weeknight"
  coverImageUrl: text("cover_image_url"),
  isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),
  importCount: integer("import_count").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type MealPlanTemplate = typeof mealPlanTemplate.$inferSelect;
export type InsertMealPlanTemplate = typeof mealPlanTemplate.$inferInsert;

export const mealPlanTemplateEntry = sqliteTable("meal_plan_template_entry", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => mealPlanTemplate.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Monday, 6=Sunday
  mealType: text("meal_type", {
    enum: ["breakfast", "lunch", "dinner", "snacks"],
  }).notNull(),
});

export type MealPlanTemplateEntry = typeof mealPlanTemplateEntry.$inferSelect;
export type InsertMealPlanTemplateEntry =
  typeof mealPlanTemplateEntry.$inferInsert;

export const mealPlanTemplateImport = sqliteTable("meal_plan_template_import", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => mealPlanTemplate.id, { onDelete: "cascade" }),
  importedById: text("imported_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  importedAt: integer("imported_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export type MealPlanTemplateImport = typeof mealPlanTemplateImport.$inferSelect;
export type InsertMealPlanTemplateImport =
  typeof mealPlanTemplateImport.$inferInsert;
