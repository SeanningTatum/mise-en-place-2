# Meal Planner Release

**Date:** 2026-01-29

## Summary
Full-featured weekly meal planner allowing users to assign recipes to breakfast, lunch, dinner, and snack slots across a 7-day calendar. Includes an aggregated grocery list with clipboard and print export options.

## New Features
- **Weekly Planner Grid**: 7-day × 4-meal grid with intuitive slot assignment
- **Recipe Picker Modal**: Search and select recipes from your collection to add to meal slots
- **Week Navigation**: Navigate between weeks with previous/next buttons and a "Today" shortcut
- **Grocery List Panel**: Collapsible panel showing aggregated ingredients from planned meals, grouped by category
- **Export Options**: Copy grocery list to clipboard or print for shopping trips
- **Interactive Checkboxes**: Mark off items as you shop

## Key Files
| File | Description |
|------|-------------|
| `app/routes/recipes/planner.tsx` | Main planner page with week navigation and layout |
| `app/components/planner/weekly-planner-grid.tsx` | 7-day grid container |
| `app/components/planner/day-column.tsx` | Single day column with 4 meal slots |
| `app/components/planner/meal-slot.tsx` | Individual meal slot component |
| `app/components/planner/recipe-picker.tsx` | Modal for selecting recipes |
| `app/components/planner/grocery-list-panel.tsx` | Aggregated grocery list with export |
| `app/repositories/meal-plan.ts` | Data access layer for meal plans |
| `app/trpc/routes/meal-plan.ts` | tRPC routes for meal plan CRUD |
| `app/db/schema.ts` | meal_plan and meal_plan_entry tables |
| `drizzle/0002_add_meal_plan_tables.sql` | Database migration |

## Bug Fixes
None - initial release.

## Breaking Changes
None.

## Dependencies Added
None - uses existing project dependencies.
