---
title: Meal Planner Architecture
date: 2026-01-29
---

# Week Meal Planner: Information Architecture

A weekly meal planning feature that enables users to organize recipes by meal type and generate aggregated grocery lists.

---

## Table of Contents

1. [Overview](#overview)
2. [User Flow](#user-flow)
3. [System Architecture](#system-architecture)
4. [Data Model](#data-model)
5. [Feature Breakdown](#feature-breakdown)
6. [UI Components](#ui-components)
7. [Frontend Design Specification](#frontend-design-specification)
8. [Technical Stack](#technical-stack)
9. [API Endpoints](#api-endpoints)

---

## Overview

### Vision

Enable users to plan their weekly meals by assigning saved recipes to specific days and meal types, then export a consolidated grocery list for efficient shopping.

### Core Value Proposition

- **One Calendar**: 7-day × 4-meal grid (breakfast, lunch, dinner, snacks)
- **Recipe Integration**: Pull from user's saved recipe collection
- **Smart Grocery List**: Auto-aggregated ingredients with quantity combining
- **Export Options**: Copy to clipboard or print styled list

### User Journey

```mermaid
journey
    title Weekly Meal Planning
    section Discovery
      Open planner: 5: User
      View week grid: 4: User
    section Planning
      Add breakfast recipe: 5: User
      Add lunch recipe: 5: User
      Add dinner recipe: 5: User
    section Export
      Generate grocery list: 5: User
      Copy or print list: 5: User
```

---

## User Flow

### Primary Flow Diagram

```mermaid
flowchart TD
    Start([User opens planner]) --> ViewWeek[View weekly grid]
    ViewWeek --> ClickSlot[Click empty meal slot]
    ClickSlot --> OpenPicker[Recipe picker modal opens]
    OpenPicker --> SelectRecipe[Select a recipe]
    SelectRecipe --> UpdateGrid[Grid updates with recipe]
    UpdateGrid --> MoreMeals{Add more meals?}
    MoreMeals -->|Yes| ClickSlot
    MoreMeals -->|No| ViewGrocery[View grocery list panel]
    ViewGrocery --> Export{Export method?}
    Export -->|Clipboard| CopyText[Copy plain text]
    Export -->|Print| PrintHTML[Print styled page]
    CopyText --> End([Done])
    PrintHTML --> End
```

### State Machine

```mermaid
stateDiagram-v2
    [*] --> Loading: Open planner
    Loading --> Viewing: Plan loaded
    Viewing --> PickerOpen: Click add meal
    PickerOpen --> Viewing: Cancel/close
    PickerOpen --> Adding: Select recipe
    Adding --> Viewing: Entry saved
    Viewing --> Removing: Click remove
    Removing --> Viewing: Entry deleted
    Viewing --> Exporting: Click export
    Exporting --> Viewing: Export complete
```

---

## System Architecture

### High-Level Architecture

```mermaid
flowchart TD
    subgraph Client [Client Layer]
        PlannerPage[Planner Page]
        WeekGrid[Weekly Grid Component]
        RecipePicker[Recipe Picker Modal]
        GroceryPanel[Grocery List Panel]
    end
    
    subgraph API [tRPC Layer]
        MealPlanRoutes[mealPlan routes]
    end
    
    subgraph Data [Repository Layer]
        MealPlanRepo[meal-plan.ts]
        RecipeRepo[recipe.ts]
    end
    
    subgraph DB [Database]
        MealPlanTable[(meal_plan)]
        MealPlanEntryTable[(meal_plan_entry)]
        RecipeTable[(recipe)]
        IngredientTable[(ingredient)]
    end
    
    PlannerPage --> WeekGrid
    WeekGrid --> RecipePicker
    PlannerPage --> GroceryPanel
    
    WeekGrid --> MealPlanRoutes
    RecipePicker --> MealPlanRoutes
    GroceryPanel --> MealPlanRoutes
    
    MealPlanRoutes --> MealPlanRepo
    MealPlanRoutes --> RecipeRepo
    
    MealPlanRepo --> MealPlanTable
    MealPlanRepo --> MealPlanEntryTable
    RecipeRepo --> RecipeTable
    RecipeRepo --> IngredientTable
```

### Grocery List Aggregation

```mermaid
flowchart TD
    Start([Get Meal Plan]) --> GetEntries[Fetch all entries with recipes]
    GetEntries --> GetIngredients[Fetch ingredients for each recipe]
    GetIngredients --> Normalize[Normalize ingredient names]
    Normalize --> Aggregate[Aggregate quantities by ingredient]
    Aggregate --> Group[Group by category]
    Group --> Format[Format for display]
    Format --> End([Return grouped list])
```

---

## Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ MEAL_PLAN : creates
    MEAL_PLAN ||--o{ MEAL_PLAN_ENTRY : contains
    MEAL_PLAN_ENTRY }o--|| RECIPE : references
    RECIPE ||--o{ RECIPE_INGREDIENT : has
    RECIPE_INGREDIENT }o--|| INGREDIENT : uses
    
    USER {
        string id PK
        string name
        string email
    }
    
    MEAL_PLAN {
        string id PK
        string user_id FK
        string week_start_date
        string name
        timestamp created_at
        timestamp updated_at
    }
    
    MEAL_PLAN_ENTRY {
        string id PK
        string meal_plan_id FK
        string recipe_id FK
        int day_of_week
        enum meal_type
    }
    
    RECIPE {
        string id PK
        string title
        string thumbnail_url
        string source_type
    }
    
    INGREDIENT {
        string id PK
        string name
        string category
    }
```

### TypeScript Interfaces

```typescript
interface MealPlan {
  id: string;
  userId: string;
  weekStartDate: string; // ISO date (YYYY-MM-DD)
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MealPlanEntry {
  id: string;
  mealPlanId: string;
  recipeId: string;
  dayOfWeek: number; // 0=Monday, 6=Sunday
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
}

interface GroceryListItem {
  ingredientId: string;
  ingredientName: string;
  category: string | null;
  quantities: Array<{
    quantity: string | null;
    unit: string | null;
    notes: string | null;
    recipeTitle: string;
  }>;
}
```

---

## Feature Breakdown

### Feature 1: Weekly Grid View

```mermaid
flowchart LR
    subgraph Grid [7-Day Grid]
        Mon[Monday]
        Tue[Tuesday]
        Wed[Wednesday]
        Thu[Thursday]
        Fri[Friday]
        Sat[Saturday]
        Sun[Sunday]
    end
    
    subgraph Slots [4 Meal Slots per Day]
        B[Breakfast]
        L[Lunch]
        D[Dinner]
        S[Snacks]
    end
    
    Mon --> B
    Mon --> L
    Mon --> D
    Mon --> S
```

**Specifications:**
- Responsive grid: 2 cols mobile, 4 cols tablet, 7 cols desktop
- Each day shows date header with day name
- Today's column highlighted
- Week navigation with prev/next buttons

### Feature 2: Recipe Picker Modal

**Specifications:**
- Search filter for user's recipes
- Thumbnail + title display
- Source type badge (YouTube/Blog)
- Closes on selection, updating grid optimistically

### Feature 3: Grocery List Export

**Export Formats:**

| Format | Method | Output |
|--------|--------|--------|
| Clipboard | Copy button | Plain text grouped by category |
| Print | Print button | Styled HTML with checkboxes |

---

## UI Components

### Component Hierarchy

```mermaid
flowchart TD
    subgraph PlannerRoute [routes/recipes/planner.tsx]
        Header[Week Navigation Header]
        WeekGrid[WeeklyPlannerGrid]
        GroceryPanel[GroceryListPanel]
    end
    
    subgraph WeekGridComp [WeeklyPlannerGrid]
        DayCol[DayColumn × 7]
    end
    
    subgraph DayColComp [DayColumn]
        MealSlot[MealSlot × 4]
    end
    
    subgraph MealSlotComp [MealSlot]
        Empty[Empty state + Add]
        Filled[Recipe card + Remove]
    end
```

### Screen Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│ Weekly Meal Planner                               [< Prev] [Next >] │
│ Week of January 27, 2026                          [Today]           │
├─────────────────────────────────────────────────────────────────────┤
│ Mon 27    │ Tue 28    │ Wed 29    │ Thu 30    │ Fri 31    │ Sat/Sun │
├───────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│ BREAKFAST │           │           │           │           │         │
│ ┌───────┐ │ + Add     │ + Add     │ + Add     │ + Add     │ + Add   │
│ │Recipe │ │           │           │           │           │         │
│ └───────┘ │           │           │           │           │         │
├───────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│ LUNCH     │           │           │           │           │         │
├───────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│ DINNER    │           │           │           │           │         │
├───────────┼───────────┼───────────┼───────────┼───────────┼─────────┤
│ SNACKS    │           │           │           │           │         │
└───────────┴───────────┴───────────┴───────────┴───────────┴─────────┘

┌─ Grocery List (collapsible) ────────────────────────────────────────┐
│ [Copy] [Print]                                      12 ingredients  │
├─────────────────────────────────────────────────────────────────────┤
│ Proteins                    │ Produce                               │
│ □ 2 lbs chicken breast      │ □ 3 onions                            │
└─────────────────────────────┴───────────────────────────────────────┘
```

---

## Frontend Design Specification

### Aesthetic Direction

**Tone**: Editorial cookbook - warm, artisanal, refined

**Memorable Element**: The warm terracotta meal type headers against cream backgrounds

### Typography

| Usage | Font | Weight |
|-------|------|--------|
| Page title | Playfair Display | 600 |
| Day headers | Playfair Display | 500 |
| Meal type labels | Source Sans 3 | 600 (uppercase, tracking) |
| Body text | Source Sans 3 | 400 |

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| --primary | oklch(0.55 0.14 35) | Terracotta - headers, accents |
| --accent | oklch(0.70 0.08 145) | Sage - action buttons |
| --background | oklch(0.98 0.01 90) | Warm cream - page bg |
| --card | white | Card backgrounds |

### Motion Design

- **Adding recipe**: Fade in + scale (0.95 → 1.0, 200ms)
- **Removing recipe**: Fade out (150ms)
- **Week navigation**: Cross-fade between weeks
- **Panel toggle**: Smooth height transition (300ms)

---

## Technical Stack

### Dependencies

```bash
# No new dependencies required - uses existing:
# - React Router for routing
# - tRPC for API
# - Drizzle ORM for database
# - shadcn/ui for components
# - Tailwind for styling
```

### Key Files

| Layer | File | Purpose |
|-------|------|---------|
| Schema | `app/db/schema.ts` | mealPlan, mealPlanEntry tables |
| Migration | `drizzle/0002_add_meal_plan_tables.sql` | DB migration |
| Repository | `app/repositories/meal-plan.ts` | CRUD + aggregation |
| tRPC | `app/trpc/routes/meal-plan.ts` | API endpoints |
| Components | `app/components/planner/` | UI components |
| Route | `app/routes/recipes/planner.tsx` | Main page |

---

## API Endpoints

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `mealPlan.getOrCreateForWeek` | Query | `{ weekStartDate: string }` | `MealPlanWithEntries` |
| `mealPlan.addEntry` | Mutation | `{ mealPlanId, recipeId, dayOfWeek, mealType }` | `{ id: string }` |
| `mealPlan.removeEntry` | Mutation | `{ entryId: string }` | `{ success: boolean }` |
| `mealPlan.getGroceryList` | Query | `{ mealPlanId: string }` | `GroceryList` |
| `mealPlan.getRecipesForPicker` | Query | `{ search?: string }` | `Recipe[]` |

---

## Future Enhancements

### Phase 2+

- **Meal prep mode**: Batch cooking workflow
- **Nutritional summary**: Weekly macros totals
- **Template weeks**: Save and reuse meal plans
- **Sharing**: Share plans with family members
- **Pantry integration**: Exclude items already owned
- **Smart suggestions**: AI-powered meal recommendations

---

*Architecture Document v1.0 - January 2026*
