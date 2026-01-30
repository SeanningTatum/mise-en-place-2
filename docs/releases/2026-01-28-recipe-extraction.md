---
title: Recipe Extraction Release
date: 2026-01-28
---

# Recipe Extraction Feature Release

**Date:** 2026-01-28

## Summary
AI-powered recipe extraction feature allowing users to extract, save, and manage recipes from YouTube videos and blog posts. Uses Gemini AI or Claude AI for intelligent extraction with support for structured output, timestamps, and nutritional macros.

## New Features
- **Recipe Extraction**: Extract recipes from YouTube videos or blog/recipe sites
- **Dual AI Providers**: 
  - Gemini 3 Pro for YouTube video processing and blog content extraction
  - Claude Sonnet 4.5 as alternative provider with tool_use for structured output
- **YouTube Integration**: Video player with timestamp-synced cooking steps
- **Recipe Collection**: Grid view with search, filtering by source type (YouTube/Blog), and pagination
- **Interactive Recipe View**: Checkable ingredient list, macros card, and step-by-step instructions
- **Admin Management**: Admin pages for viewing all recipes and managing ingredient index with duplicate merging

## Key Files

| File | Description |
|------|-------------|
| `app/lib/gemini.ts` | Gemini AI client for recipe extraction |
| `app/lib/claude.ts` | Claude AI client (alternative provider) |
| `app/lib/youtube.ts` | YouTube transcript and metadata fetching |
| `app/lib/content-extractor.ts` | Blog content extraction (JSON-LD + Readability) |
| `app/repositories/recipe.ts` | Recipe CRUD operations |
| `app/repositories/ingredient.ts` | Ingredient management |
| `app/components/recipes/` | Recipe UI components |
| `app/routes/recipes/` | User-facing recipe routes |
| `app/routes/admin/recipes.tsx` | Admin recipe management |
| `app/routes/admin/ingredients.tsx` | Admin ingredient management |
| `app/trpc/routes/recipes.ts` | Recipe tRPC endpoints |
| `app/trpc/routes/ingredients.ts` | Ingredient tRPC endpoints |

## Database Changes
New tables added via migration `0001_add_recipe_tables.sql`:
- `recipe` - Stores extracted recipes with macros, source URL/type, YouTube video ID
- `recipe_step` - Individual cooking steps with optional video timestamps
- `ingredient` - Normalized ingredient database
- `recipe_ingredient` - Junction table linking recipes to ingredients

## Routes Added

### User Routes
- `/recipes` - Recipe collection with grid view, search, and source filters
- `/recipes/new` - Extract new recipe from URL
- `/recipes/:id` - Recipe detail with video player, ingredients, steps

### Admin Routes
- `/admin/recipes` - Admin view of all recipes
- `/admin/ingredients` - Ingredient browser with merge capability

## API Endpoints
- `recipes.extract` - Extract recipe from URL (returns preview)
- `recipes.save` - Save extracted recipe
- `recipes.list` - User's recipes (paginated)
- `recipes.get` - Single recipe with relations
- `recipes.delete` - Delete owned recipe
- `recipes.adminList` - All recipes (admin)
- `recipes.adminDelete` - Delete any recipe (admin)
- `ingredients.list` - All ingredients with usage count (admin)
- `ingredients.merge` - Merge duplicate ingredients (admin)

## Bug Fixes
None - initial release.

## Breaking Changes
None.

## Dependencies Added
- `@google/genai` - Google Gemini AI SDK
- `@anthropic-ai/sdk` - Anthropic Claude SDK
- `@mozilla/readability` - Content extraction from web pages

## Testing
- Testing plan: `docs/testing/recipes/recipes.md`
- E2E tests: `e2e/recipes.spec.ts`
- Screenshots: `docs/testing/recipes/screenshots/`
