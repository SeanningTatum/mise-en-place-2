---
title: Recipe Extraction Testing
date: 2026-01-28
---

# Testing Plan: Recipe Extraction Feature

## Overview
The recipe extraction feature allows users to extract recipes from YouTube videos or blog posts, view their recipe collection, and interact with recipe details including ingredients, steps, and YouTube video playback.

## Prerequisites
- [x] Development server running
- [x] Database seeded with test data (or empty state handling)
- [x] Test user credentials available (authentication required)

## Test Scenarios

### Scenario 1: Recipe List Page - Basic Display
**Description:** Verify the recipe list page displays correctly with header, filters, and search
**Steps:**
1. Navigate to `/recipes`
2. Verify page header "My Recipes" is visible
3. Verify recipe count is displayed
4. Verify filter tabs (All, YouTube, Blogs) are visible
5. Verify search input is visible
6. Verify "Extract Recipe" button/link is visible

**Expected Result:** All UI elements render correctly

**Screenshot:** ![Recipe List Page](/docs/testing/recipes/screenshots/recipe-list-with-card.png)

### Scenario 2: Empty State
**Description:** Verify empty state displays when no recipes exist
**Steps:**
1. Navigate to `/recipes` (with no recipes)
2. Verify empty state message is visible
3. Verify "Extract Your First Recipe" button is visible

**Expected Result:** Empty state displays with CTA button

**Screenshot:** ![Empty State](/docs/testing/recipes/screenshots/recipe-list-empty.png)

### Scenario 3: Recipe Grid Display
**Description:** Verify recipe cards display in grid when recipes exist
**Steps:**
1. Navigate to `/recipes`
2. Verify recipe grid is visible (if recipes exist)
3. Verify recipe cards display with thumbnails, titles, and metadata

**Expected Result:** Recipe grid displays recipe cards correctly

**Screenshot:** ![Recipe Grid](/docs/testing/recipes/screenshots/recipe-list-with-card.png)

### Scenario 4: Search Functionality
**Description:** Verify search filters recipes by query
**Steps:**
1. Navigate to `/recipes`
2. Type search query in search input
3. Verify URL updates with search parameter
4. Verify search input retains value
5. Clear search input
6. Verify URL removes search parameter

**Expected Result:** Search filters recipes and updates URL correctly

**Screenshot:** ![Search Functionality](/docs/testing/recipes/screenshots/recipe-list-with-card.png)

### Scenario 5: Filter Tabs
**Description:** Verify source type filters work correctly
**Steps:**
1. Navigate to `/recipes`
2. Click "YouTube" filter tab
3. Verify URL updates with `source=youtube`
4. Verify tab is active
5. Click "Blogs" filter tab
6. Verify URL updates with `source=blog`
7. Click "All" tab
8. Verify URL removes source parameter

**Expected Result:** Filter tabs update URL and filter recipes correctly

**Screenshot:** ![Filter Tabs](/docs/testing/recipes/screenshots/recipe-list-with-card.png)

### Scenario 6: Recipe Card Navigation
**Description:** Verify clicking recipe card navigates to detail page
**Steps:**
1. Navigate to `/recipes`
2. Click on a recipe card
3. Verify navigation to `/recipes/:id`

**Expected Result:** Navigation to recipe detail page works

### Scenario 7: Recipe Detail Page - Basic Elements
**Description:** Verify recipe detail page displays all key elements
**Steps:**
1. Navigate to `/recipes/:id`
2. Verify recipe title is visible
3. Verify ingredients list is visible
4. Verify recipe steps are visible
5. Verify macros card is visible
6. Verify recipe menu button is visible

**Expected Result:** All key elements display correctly

**Screenshot:** ![Recipe Detail](/docs/testing/recipes/screenshots/recipe-detail.png)

### Scenario 8: YouTube Player (YouTube Recipes)
**Description:** Verify YouTube player displays for YouTube recipes
**Steps:**
1. Navigate to `/recipes/:id` (YouTube recipe)
2. Verify YouTube player container is visible
3. Verify YouTube player iframe is present

**Expected Result:** YouTube player displays for YouTube recipes

**Screenshot:** ![YouTube Player](/docs/testing/recipes/screenshots/recipe-detail.png)

### Scenario 9: Ingredients Checkboxes
**Description:** Verify ingredients can be checked/unchecked
**Steps:**
1. Navigate to `/recipes/:id`
2. Click first ingredient checkbox
3. Verify checkbox is checked
4. Click again to uncheck
5. Verify checkbox is unchecked

**Expected Result:** Ingredients can be checked/unchecked for cooking mode

**Screenshot:** ![Ingredients Checkboxes](/docs/testing/recipes/screenshots/recipe-ingredients-checked.png)

### Scenario 10: Recipe Steps with Timestamps
**Description:** Verify recipe steps display with timestamp buttons for YouTube recipes
**Steps:**
1. Navigate to `/recipes/:id` (YouTube recipe)
2. Verify recipe steps are visible
3. Verify timestamp buttons are visible (if applicable)
4. Click a timestamp button
5. Verify step becomes active/highlighted

**Expected Result:** Steps display with clickable timestamps for YouTube recipes

**Screenshot:** ![Recipe Steps](/docs/testing/recipes/screenshots/recipe-ingredients.png)

### Scenario 11: Delete Recipe Flow
**Description:** Verify delete recipe functionality
**Steps:**
1. Navigate to `/recipes/:id`
2. Click recipe menu button
3. Click "Delete Recipe" option
4. Verify delete confirmation dialog appears
5. Verify cancel button closes dialog
6. Re-open delete dialog
7. Verify confirm button exists (actual deletion may require test data)

**Expected Result:** Delete dialog opens and closes correctly

**Screenshot:** ![Delete Dialog](/docs/testing/recipes/screenshots/recipe-detail.png)

### Scenario 12: New Recipe Page - Form Display
**Description:** Verify new recipe extraction form displays correctly
**Steps:**
1. Navigate to `/recipes/new`
2. Verify URL input is visible
3. Verify "Paste" button is visible
4. Verify "Extract" button is visible
5. Verify Extract button is disabled when URL is empty

**Expected Result:** Form displays with proper validation

**Screenshot:** ![New Recipe Form](/docs/testing/recipes/screenshots/recipe-new-form.png)

### Scenario 12b: Recipe Extraction Loading State
**Description:** Verify extraction loading state displays during AI processing
**Steps:**
1. Navigate to `/recipes/new`
2. Enter a YouTube URL
3. Click Extract button
4. Verify loading state displays

**Expected Result:** Loading state shows with "Extracting..." button

**Screenshot:** ![Extracting State](/docs/testing/recipes/screenshots/recipe-extracting.png)

### Scenario 12c: Recipe Preview
**Description:** Verify extracted recipe preview displays correctly
**Steps:**
1. After extraction completes
2. Verify recipe preview with title, thumbnail
3. Verify macros, ingredients, and steps display
4. Verify Save/Cancel buttons

**Expected Result:** Recipe preview displays all extracted information

**Screenshot:** ![Recipe Preview](/docs/testing/recipes/screenshots/recipe-preview.png)

### Scenario 13: New Recipe Page - URL Input Validation
**Description:** Verify URL input enables extract button when filled
**Steps:**
1. Navigate to `/recipes/new`
2. Verify Extract button is disabled
3. Enter a URL in the input
4. Verify Extract button becomes enabled

**Expected Result:** Extract button enables when URL is entered

### Scenario 14: Pagination
**Description:** Verify pagination displays and works when multiple pages exist
**Steps:**
1. Navigate to `/recipes` (with many recipes)
2. Verify pagination controls are visible (if applicable)
3. Click "Next" button
4. Verify URL updates with page parameter
5. Click "Previous" button
6. Verify URL updates correctly

**Expected Result:** Pagination navigates between pages correctly

**Screenshot:** (Pagination only visible with multiple recipes)

## UI Elements to Verify

### Recipe List Page
- [x] Page header "My Recipes"
- [x] Recipe count display
- [x] Filter tabs (All, YouTube, Blogs)
- [x] Search input with placeholder
- [x] Recipe grid container
- [x] Recipe cards with thumbnails
- [x] Empty state with CTA
- [x] Pagination controls (when applicable)

### Recipe Detail Page
- [x] Recipe title
- [x] Source type badge (YouTube/Blog)
- [x] Servings and time information
- [x] YouTube player (for YouTube recipes)
- [x] Macros card
- [x] Ingredients list with checkboxes
- [x] Recipe steps with timestamps
- [x] Recipe menu button
- [x] Delete confirmation dialog

### New Recipe Page
- [x] URL input field
- [x] Paste button
- [x] Extract button
- [x] Loading state during extraction
- [x] Error messages

## API/Data Verification

### tRPC Routes
- [x] `recipes.list` - Returns paginated recipes with filters
- [x] `recipes.get` - Returns single recipe with all details
- [x] `recipes.extract` - Extracts recipe from URL (may be difficult to test e2e)
- [x] `recipes.save` - Saves extracted recipe
- [x] `recipes.delete` - Deletes recipe

### Data Flow
- [x] Recipe list loads with pagination
- [x] Search and filter parameters update URL
- [x] Recipe detail loads with all related data
- [x] Ingredients and steps display correctly

## Accessibility Checks
- [x] Keyboard navigation works
- [x] Focus states visible
- [x] ARIA labels present (via semantic HTML)
- [x] Form inputs have proper labels

## Test IDs Reference

| Element | Test ID |
|---------|---------|
| Recipe search input | `recipe-search-input` |
| Recipe grid | `recipe-grid` |
| Recipe card | `recipe-card-{id}` |
| Empty state | `empty-state` |
| Filter tab All | `filter-tab-all` |
| Filter tab YouTube | `filter-tab-youtube` |
| Filter tab Blog | `filter-tab-blog` |
| Recipe count | `recipe-count` |
| Pagination | `pagination` |
| Pagination Previous | `pagination-previous` |
| Pagination Next | `pagination-next` |
| Pagination Info | `pagination-info` |
| Recipe title | `recipe-title` |
| YouTube player container | `youtube-player-container` |
| YouTube player | `youtube-player` |
| Macros card container | `macros-card-container` |
| Ingredients list | `ingredients-list` |
| Ingredient checkbox | `ingredient-checkbox-{id}` |
| Recipe steps | `recipe-steps` |
| Recipe step | `recipe-step-{number}` |
| Timestamp button | `timestamp-button-{number}` |
| Recipe menu button | `recipe-menu-button` |
| Delete recipe button | `delete-recipe-button` |
| Delete dialog | `delete-recipe-dialog` |
| Delete cancel button | `delete-cancel-button` |
| Delete confirm button | `delete-confirm-button` |
| Recipe URL input | `recipe-url-input` |
| Extract recipe button | `extract-recipe-button` |
| Extract first recipe button | `extract-first-recipe-button` |

## E2E Test Coverage

Test file: `e2e/recipes.spec.ts`

### Running Tests

```bash
# Run all tests
bun run test:e2e

# Run specific feature tests
bunx playwright test e2e/recipes.spec.ts
```

## Notes

- **Extraction Flow**: The actual recipe extraction (submitting a URL) may be difficult to test e2e due to external API calls (YouTube API, Gemini AI). Focus on UI/navigation tests.
- **Test Data**: Tests handle both empty state (no recipes) and populated state (recipes exist) gracefully.
- **Authentication**: All routes require authentication - tests assume user is logged in.
- **YouTube Player**: YouTube player tests verify presence but don't test actual video playback (iframe limitations).
