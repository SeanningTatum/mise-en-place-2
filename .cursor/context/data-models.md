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
           └───── recipe (createdById)
                      │
                      ├───── recipe_step (recipeId)
                      │
                      └───── recipe_ingredient (recipeId)
                                   │
                                   └───── ingredient (ingredientId)
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
| `recipe` | Extracted recipes with macros | sourceType (youtube/blog), youtubeVideoId, servings, calories/protein/carbs/fat/fiber |
| `recipe_step` | Cooking instructions | stepNumber, instruction, timestampSeconds, durationSeconds |
| `ingredient` | Normalized ingredient database | name (unique), category |
| `recipe_ingredient` | Junction table | quantity (text for fractions), unit, notes |

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
