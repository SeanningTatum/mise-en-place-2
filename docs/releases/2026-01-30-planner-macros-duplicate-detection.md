# Planner Macros & Duplicate Recipe Detection Release

**Date:** 2026-01-30

## Summary
Adds macro nutrient tracking to the meal planner (daily and weekly totals) and duplicate recipe detection during extraction to prevent saving the same recipe twice.

## New Features
- **Daily Macro Summary**: Each day column shows calorie, protein, carb, and fat totals for planned meals
- **Weekly Macro Summary**: Aggregate macro totals displayed below the weekly planner grid
- **Duplicate Recipe Detection**: When extracting a recipe, the system checks if the URL was already saved and shows a link to the existing recipe
- **Enhanced Recipe Detail Layout**: YouTube recipes now have a side-by-side layout with sticky video player on desktop

## Key Files
| File | Description |
|------|-------------|
| `app/components/planner/macro-summary.tsx` | New macro summary components (compact & full variants) |
| `app/lib/utils.ts` | URL normalization utilities for duplicate detection |
| `app/repositories/recipe.ts` | `findRecipeBySourceUrl` for duplicate checking |
| `app/trpc/routes/recipes.ts` | Extract endpoint now returns existing recipe info |
| `app/components/recipes/recipe-extractor.tsx` | UI for duplicate detection with link to existing recipe |
| `app/routes/recipes/[id].tsx` | Improved YouTube recipe layout with sticky video |

## Bug Fixes
- Fixed CSS import order for Google Fonts (moved before Tailwind imports)

## Breaking Changes
None.

## Dependencies Added
None.
