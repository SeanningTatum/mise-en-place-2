---
title: Meal Planner Testing
date: 2026-01-29
---

# Testing Plan: Meal Planner

## Overview
Testing the Week Meal Planner feature that allows users to:
- View a weekly calendar grid with 4 meal slots per day (breakfast, lunch, dinner, snacks)
- Add recipes to meal slots via a recipe picker modal
- Remove recipes from slots
- Navigate between weeks
- View a collapsible grocery list panel with export options

## Test Results Summary

**Test Date:** January 29, 2026  
**Tester:** Automated (Playwright MCP)  
**Overall Status:** ✅ PASSED (with minor issues)

## Test Scenarios

### Scenario 1: Login and Navigation
**Status:** ✅ PASSED

**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Enter email: `admin@test.local`
3. Enter password: `TestAdmin123!`
4. Click "Sign in"
5. Click "Meal Planner" button in header

**Result:** Successfully logged in and navigated to `/recipes/planner`

---

### Scenario 2: Weekly Planner Grid Display
**Status:** ✅ PASSED

**Screenshot:**
![Weekly Planner Grid](./screenshots/meal-planner-full.png)

**Expected Elements:**
- [x] "Meal Planner" heading displayed
- [x] Week date range displayed (e.g., "January 26 – February 1, 2026")
- [x] 7 day columns with 4 meal slots each (28 empty slots total)
- [x] Week navigation buttons (prev/next)
- [x] Grocery list panel with Copy and Print buttons

**Verified Data-TestIds:**
| Element | Test ID | Found |
|---------|---------|-------|
| Page container | `meal-planner-page` | ✅ |
| Weekly grid | `weekly-planner-grid` | ✅ |
| Day columns | `day-column-{0-6}` | ✅ |
| Empty meal slots | `meal-slot-{mealType}-empty` | ✅ |
| Prev/Next week buttons | `prev-week` / `next-week` | ✅ |
| Grocery list panel | `grocery-list-panel` | ✅ |
| Copy button | `copy-grocery-list` | ✅ |
| Print button | `print-grocery-list` | ✅ |

---

### Scenario 3: Add Recipe to Meal Slot
**Status:** ✅ PASSED

**Screenshot:**
![Recipe Picker Modal](./screenshots/recipe-picker-modal.png)

**Steps:**
1. Click "Add Breakfast" button on Monday
2. Recipe picker modal opens with "Select Recipe for Breakfast" title
3. Search box available for filtering recipes
4. Click "Mapo Tofu" recipe button
5. Modal closes, recipe appears in breakfast slot

**Result:** 
- Recipe successfully added to Monday's breakfast slot
- Grocery list automatically populated with 18 Mapo Tofu ingredients
- Toast notification shown: "Recipe added to meal plan"

---

### Scenario 4: Week Navigation
**Status:** ✅ PASSED

**Steps:**
1. Click "Next week" navigation button
2. Verify date range updates to "February 2–8, 2026"
3. Verify "Today" button appears
4. Verify new week shows empty meal slots
5. Click "Today" button to return to current week
6. Verify recipe is still in Monday's breakfast slot

**Result:** Navigation works correctly, meal plans persist per week

---

### Scenario 5: Grocery List Features
**Status:** ✅ PASSED

**Verified Features:**
- [x] Grocery list panel expands/collapses
- [x] Ingredients grouped by category ("Other" category shown)
- [x] Item count displayed ("18 items")
- [x] Checkboxes work - clicked "230 g soft tofu" and it became checked
- [x] Copy button clickable
- [x] Print button present

**Ingredients Verified:**
- caiziyou (rapeseed oil)
- 1.5 tablespoons chili bean paste (doubanjiang)
- 0.5 teaspoon chili powder
- 1 teaspoon cornstarch
- 0.5 teaspoon dark vinegar
- 2 cloves garlic
- green onions
- 1 teaspoon light soy sauce
- 35 g pork mince
- 1 tablespoon salt
- 1 teaspoon sesame oil
- 1 teaspoon shaoxing wine
- 0.5 tablespoon sichuan peppercorns
- 230 g soft tofu
- 1 teaspoon stock concentrate
- 1 teaspoon sugar
- 0.8 cups water
- 1 tablespoon water (for slurry)

---

### Scenario 6: Remove Recipe from Slot
**Status:** ⚠️ NOT TESTED (Technical Limitation)

**Issue:** The remove button (X) only appears on hover with CSS `opacity-0 group-hover:opacity-100`. The browser automation couldn't trigger the hover state to make the button clickable.

**Recommendation:** Add keyboard accessibility (e.g., focus should show the button, or add a delete option via context menu or separate button).

---

## Issues Found

### Issue 1: Screenshot Timeout (Resolved)
**Severity:** Low (Testing infrastructure)  
**Description:** `browser_take_screenshot` command sometimes times out.  
**Resolution:** Using `take_screenshot_afterwards: true` with `browser_navigate` or `browser_snapshot` works reliably.  
**Screenshots captured:** 3 screenshots added to `docs/testing/meal-planner/screenshots/`

### Issue 2: Remove Button Requires Hover
**Severity:** Medium (Accessibility)  
**Description:** The remove button on filled meal slots is hidden until mouse hover. This makes it:
- Difficult to automate testing
- Potentially inaccessible for keyboard-only users  
**Recommendation:** Show remove button on focus, or add aria-label for screen readers

### Issue 3: Viewport Click Issues
**Severity:** Low (Testing infrastructure)  
**Description:** Some elements outside the viewport failed to scroll into view properly, requiring manual viewport resizing.

---

## E2E Test Coverage

Test file: `e2e/meal-planner.spec.ts` (to be created)

### Recommended Test Cases:
1. `should display weekly planner grid with all meal slots`
2. `should open recipe picker when clicking empty slot`
3. `should add recipe to meal slot and update grocery list`
4. `should navigate between weeks`
5. `should show Today button when not on current week`
6. `should persist meal plans when navigating away and back`
7. `should allow checking off grocery list items`
8. `should copy grocery list to clipboard`

---

## Running Tests

```bash
# Run all tests
bun run test:e2e

# Run specific feature tests
bunx playwright test e2e/meal-planner.spec.ts
```

---

## Accessibility Notes

- All meal slot buttons have proper aria labels ("Add Breakfast", "Add Lunch", etc.)
- Checkboxes in grocery list are properly labeled with ingredient names
- Collapsible sections use proper expanded/collapsed states
- **Improvement needed:** Remove button should be keyboard accessible
