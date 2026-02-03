---
title: Multi-Course Meal Testing
date: 2026-02-03
---

# Multi-Course Meal Planner - Test Plan

## Overview

This document describes the testing plan for the Multi-Course Meal Planner feature, which allows users to create elegant multi-course dining experiences with AI-generated cooking timelines and scaled shopping lists.

## Feature Summary

- **Create multi-course meals** with name, guest count, serving time, and service style
- **Add courses** from user's recipe library with course type categorization
- **AI menu suggestions** for improving the menu composition
- **AI-generated cooking timelines** that work backward from serving time
- **Scaled shopping lists** with aggregated ingredients

## Test Scenarios

### 1. Meal Setup Form

**Scenario 1.1: Create new meal with valid data**
- Navigate to `/recipes/meal`
- Enter meal name "Valentine's Day Dinner"
- Set guest count to 4
- Select serving date and time
- Choose "Family Style" service
- Click "Continue to Courses"
- **Expected**: Meal is created, redirects to courses step

**Scenario 1.2: Validate guest count limits**
- Attempt to set guest count below 2
- Attempt to set guest count above 50
- **Expected**: +/- buttons disabled at boundaries

**Scenario 1.3: Service style selection**
- Select each service style (Plated, Family, Buffet)
- **Expected**: Radio button selection highlights correctly

### 2. Course Management

**Scenario 2.1: Add course from recipe picker**
- Click "Add Course"
- Select course type (e.g., Appetizer)
- Search for a recipe
- Select a recipe
- **Expected**: Course card appears in the list

**Scenario 2.2: Remove course**
- Click remove button on a course card
- **Expected**: Course is removed from list

**Scenario 2.3: Multiple courses of different types**
- Add appetizer, main, and dessert courses
- **Expected**: All courses display with correct badges

### 3. AI Suggestions

**Scenario 3.1: Get AI menu suggestions**
- Add at least 2 courses
- Click "Get AI Suggestions"
- **Expected**: Loading state shows, suggestions panel appears

**Scenario 3.2: Add suggested recipe to menu**
- View AI suggestions with recipe recommendations
- Click "Add to Menu" on a suggestion
- **Expected**: Recipe is added as a new course

### 4. Cooking Timeline

**Scenario 4.1: Generate timeline**
- Add at least 2 courses
- Click "Generate Timeline"
- **Expected**: Timeline tab shows tasks grouped by time

**Scenario 4.2: Timeline categories**
- View generated timeline
- **Expected**: Tasks show correct category badges (PREP, COOK, REST, SERVE)

**Scenario 4.3: Regenerate timeline**
- Click "Regenerate" on timeline
- **Expected**: New timeline is generated

### 5. Shopping List

**Scenario 5.1: View scaled ingredients**
- Navigate to Shopping List tab
- **Expected**: Ingredients grouped by category with scaled quantities

**Scenario 5.2: Copy to clipboard**
- Click "Copy" button
- **Expected**: Shopping list copied to clipboard

**Scenario 5.3: Print list**
- Click "Print" button
- **Expected**: Print dialog opens with formatted list

### 6. Edge Cases

**Scenario 6.1: Empty courses state**
- View meal with no courses
- **Expected**: Empty state message shown

**Scenario 6.2: Minimum courses for timeline**
- Try to generate timeline with less than 2 courses
- **Expected**: Generate button disabled, helper text shown

## Test Data Requirements

- User account with saved recipes (at least 3)
- Recipes covering different categories (appetizer, main, dessert)

## Screenshots

Screenshots will be captured for:
1. `meal-setup-form.png` - Initial setup form
2. `course-list-empty.png` - Empty courses state
3. `course-picker-modal.png` - Course type selection
4. `course-list-filled.png` - List with multiple courses
5. `ai-suggestions-panel.png` - AI suggestions display
6. `cooking-timeline.png` - Generated timeline
7. `shopping-list.png` - Scaled shopping list

## E2E Test File

Test file: `e2e/multi-course-meal.spec.ts`
