# Data Models

## Schema Location

**Primary source:** `app/db/schema.ts`

Always read the schema file directly for current table definitions.

## Entity Relationships

```
user ◄─────┬───── session (userId)
           │         └── impersonatedBy → user
           │
           ├───── account (userId)
           │
           ├───── verification (identifier = email)
           │
           ├───── user_profile (userId)
           │
           ├───── meal_plan (userId)
           │         └── meal_plan_entry (mealPlanId) → recipe
           │
           ├───── meal_plan_template (createdById)
           │         ├── meal_plan_template_entry (templateId) → recipe
           │         └── meal_plan_template_import (templateId, importedById)
           │
           ├───── multi_course_meal (userId)
           │         └── meal_course (mealId) → recipe
           │
           └───── recipe (createdById)
                      │
                      ├───── recipe_step (recipeId)
                      │
                      ├───── recipe_ingredient (recipeId)
                      │         └── ingredient (ingredientId)
                      │
                      └───── recipe_import (sourceRecipeId, clonedRecipeId)
```

## Tables Overview

### Auth Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `user` | Core user with roles/bans | Referenced by session, account, recipe |
| `session` | Active sessions | Links user, tracks impersonation |
| `account` | OAuth/credential accounts | Belongs to user |
| `verification` | Email verification tokens | Links to user by email |

### Recipe Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `recipe` | Extracted recipes with macros | sourceType (youtube/blog), youtubeVideoId, servings, calories/protein/carbs/fat/fiber, slug, isPublic, saveCount |
| `recipe_step` | Cooking instructions | stepNumber, instruction, timestampSeconds, durationSeconds |
| `ingredient` | Normalized ingredient database | name (unique), category |
| `ingredient_alias` | Name variations for matching | ingredientId, alias |
| `recipe_ingredient` | Junction table | quantity (text for fractions), unit, notes, quantityMetric, unitMetric |
| `recipe_import` | Tracks recipe cloning | userId, sourceRecipeId, clonedRecipeId |

### Profile Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user_profile` | Public user profiles | userId, username (unique), displayName, bio, avatarUrl, isPublic, viewCount |

### Meal Planning Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `meal_plan` | Weekly meal plans | userId, weekStartDate |
| `meal_plan_entry` | Individual meal assignments | mealPlanId, dayOfWeek (0-6), mealType enum, recipeId |
| `meal_plan_template` | Saved meal plan templates for sharing | createdById, name, slug, description, theme, coverImageUrl, isPublic, importCount, viewCount |
| `meal_plan_template_entry` | Meal assignments in templates | templateId, recipeId, dayOfWeek (0-6), mealType enum |
| `meal_plan_template_import` | Tracks template imports | templateId, importedById, importedAt |
| `multi_course_meal` | Multi-course dining events | userId, name, guestCount, servingTime, serviceStyle, slug, isPublic, generationStatus, generationError, aiSuggestionsJson, timelineJson |
| `meal_course` | Courses within a meal | mealId, recipeId, courseType, courseOrder, servingsOverride |

## SQLite Conventions

- **Booleans**: INTEGER (0/1)
- **Timestamps**: INTEGER (Unix epoch ms)
- **Enums**: TEXT with app-level validation (e.g., `sourceType: "youtube" | "blog"`)
- **JSON**: TEXT with serialization
- **Fractions**: TEXT (e.g., quantity "1/2")

## Migrations

- **Location**: `drizzle/`
- **Generate**: `bun run db:generate`
- **Apply**: `bun run db:migrate`

See `.cursor/rules/database.mdc` for Drizzle patterns.
