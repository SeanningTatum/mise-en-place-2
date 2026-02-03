---
title: Meal Planner UX Upgrade Testing
date: 2026-02-03
---

# Testing Plan: Meal Planner UX Upgrade

## Overview
Testing the major upgrade to the multi-course meal planner with:
1. **Save & Share** - Persistent meals list, public sharing at `/u/[username]/meals/[slug]`
2. **Print Views** - Cookbook-style printable guides with multiple format options
3. **Loading UX** - Dedicated loading page for AI generation at `/recipes/meals/:id/generating`

## Prerequisites
- [x] Development server running
- [ ] Database seeded with test data
- [ ] Test user credentials available

## Test Scenarios

### Scenario 1: View My Meals Page (Empty State)
**Description:** Verify the My Meals page renders correctly when no meals exist
**Steps:**
1. Navigate to `/recipes/meals`
2. Verify empty state displays correctly
**Expected Result:** Empty state with "No meals planned yet" message and CTA button

**Screenshot:** ![My Meals Empty State](./screenshots/meals-page-empty.png)

### Scenario 2: View My Meals Page (With Meals)
**Description:** Verify saved meals appear in a grid
**Steps:**
1. Navigate to `/recipes/meals`
2. Verify meal cards display with correct information
**Expected Result:** Grid of meal cards showing name, courses, guests, date, and actions

**Screenshot:** ![My Meals Grid](./screenshots/meals-page-grid.png)

### Scenario 3: Meal Card Actions
**Description:** Test meal card dropdown menu actions
**Steps:**
1. Navigate to `/recipes/meals`
2. Hover over a meal card
3. Click the dropdown menu button
4. Verify Edit, Share, Print, Delete options appear
**Expected Result:** Dropdown menu displays all action options

**Screenshot:** ![Meal Card Actions](./screenshots/meal-card-actions.png)

### Scenario 4: Meal Detail Page
**Description:** View meal detail with courses and timeline
**Steps:**
1. Navigate to `/recipes/meals/:id`
2. Verify meal header info (name, date, guests, service style)
3. Verify courses section displays all courses
4. Verify timeline section (or empty state if not generated)
5. Verify shopping list sidebar
**Expected Result:** Full meal detail with all sections visible

**Screenshot:** ![Meal Detail Page](./screenshots/meal-detail-page.png)

### Scenario 5: Share Modal
**Description:** Test the share meal modal functionality
**Steps:**
1. Navigate to `/recipes/meals/:id`
2. Click "Share" button
3. Verify modal opens with visibility toggle
4. Toggle to public
5. Verify share link and QR code appear
**Expected Result:** Share modal with copy link, social buttons, and QR code

**Screenshot:** ![Share Modal](./screenshots/share-modal.png)

### Scenario 6: Print Modal
**Description:** Test the print meal modal with format options
**Steps:**
1. Navigate to `/recipes/meals/:id`
2. Click "Print" button
3. Verify modal opens with format options
4. Select each format and verify selection changes
**Expected Result:** Print modal with 4 format options (Full Guide, Timeline, Shopping List, Recipe Cards)

**Screenshot:** ![Print Modal](./screenshots/print-modal.png)

### Scenario 7: Loading/Generating Page
**Description:** Test the AI generation loading page
**Steps:**
1. Navigate to `/recipes/meals/:id/generating`
2. Verify chef animation displays
3. Verify progress bar animates
4. Verify cooking tips carousel
**Expected Result:** Loading page with animation, progress bar, and tips

**Screenshot:** ![Generating Page](./screenshots/generating-page.png)

### Scenario 8: Public Meals List Page
**Description:** Verify public meals list for a user
**Steps:**
1. Navigate to `/u/:username/meals`
2. Verify header with sign in button
3. Verify page title with username
4. Verify meal cards grid (or empty state)
**Expected Result:** Public meals grid with user attribution

**Screenshot:** ![Public Meals List](./screenshots/public-meals-list.png)

### Scenario 9: Public Meal Detail Page
**Description:** Verify public meal detail view
**Steps:**
1. Navigate to `/u/:username/meals/:slug`
2. Verify meal header with creator info
3. Verify courses section
4. Verify timeline section
5. Verify CTA sidebar for sign up
**Expected Result:** Full public meal detail with signup CTA

**Screenshot:** ![Public Meal Detail](./screenshots/public-meal-detail.png)

### Scenario 10: Delete Meal Confirmation
**Description:** Test delete meal confirmation dialog
**Steps:**
1. Navigate to `/recipes/meals`
2. Click dropdown on a meal card
3. Click "Delete" option
4. Verify confirmation dialog appears
**Expected Result:** Confirmation dialog with cancel and delete buttons

**Screenshot:** ![Delete Confirmation](./screenshots/delete-confirmation.png)

## UI Elements to Verify
- [x] MealCard component renders with correct badges (Public, Upcoming)
- [x] MealCard dropdown menu shows on hover
- [ ] ShareMealModal visibility toggle works
- [ ] ShareMealModal QR code renders
- [ ] PrintMealModal format selection works
- [ ] ChefAnimation renders correctly
- [ ] GenerationProgressBar animates
- [ ] LoadingTips carousel cycles

## API/Data Verification
- [ ] `multiCourseMeal.list` returns meals correctly
- [ ] `multiCourseMeal.getById` returns full meal detail
- [ ] `multiCourseMeal.setPublic` toggles visibility
- [ ] `multiCourseMeal.getPrintData` returns print data
- [ ] `multiCourseMeal.getGenerationStatus` returns status
- [ ] `multiCourseMeal.listPublicMeals` returns public meals
- [ ] `multiCourseMeal.getBySlug` returns public meal by slug

## Accessibility Checks
- [ ] Keyboard navigation works on meal cards
- [ ] Focus states visible on buttons
- [ ] ARIA labels present on modals
- [ ] Print format options keyboard accessible

## Test IDs Reference

| Element | Test ID |
|---------|---------|
| My Meals Page | `meals-page` |
| Empty State | `meals-empty-state` |
| Meal Card | `meal-card-{id}` |
| Meal Card Dropdown | `meal-card-dropdown-{id}` |
| Share Button | `share-button` |
| Print Button | `print-button` |
| Share Modal | `share-modal` |
| Print Modal | `print-modal` |
| Visibility Toggle | `visibility-toggle` |
| Print Format Option | `print-format-{format}` |
| Delete Dialog | `delete-dialog` |

## E2E Test Coverage

Test file: `e2e/meal-planner-upgrade.spec.ts`

### Running Tests

```bash
# Run all tests
bun run test:e2e

# Run specific feature tests
bunx playwright test e2e/meal-planner-upgrade.spec.ts
```

## Test Results

### Completed Scenarios
- [ ] Scenario 1: View My Meals Page (Empty State)
- [ ] Scenario 2: View My Meals Page (With Meals)
- [ ] Scenario 3: Meal Card Actions
- [ ] Scenario 4: Meal Detail Page
- [ ] Scenario 5: Share Modal
- [ ] Scenario 6: Print Modal
- [ ] Scenario 7: Loading/Generating Page
- [ ] Scenario 8: Public Meals List Page
- [ ] Scenario 9: Public Meal Detail Page
- [ ] Scenario 10: Delete Meal Confirmation

### Issues Found
_To be updated during testing_

### Screenshots Captured
_To be updated during testing_
