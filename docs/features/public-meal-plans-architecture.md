---
title: Public Meal Plans Architecture
date: 2026-02-03
---

# Public Meal Plans: Information Architecture

A feature for sharing curated weekly meal plans publicly, allowing users to showcase their planning approach and enabling visitors to import complete meal plans with one click.

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
9. [Future Roadmap](#future-roadmap)

---

## Overview

### Vision
Enable home cooks to share their weekly meal planning expertise with others. Instead of sharing individual recipes, users can share complete curated meal plans—a week's worth of coordinated meals with aggregated grocery lists—that visitors can import directly into their own planner.

### Core Value Proposition
- **For Creators**: Showcase meal planning creativity, build an audience, share curated weekly menus
- **For Visitors**: Skip the "what's for dinner" decision fatigue by importing proven meal plans
- **For the Platform**: Viral sharing mechanism, content discovery, increased engagement

### Competitive Positioning

```mermaid
quadrantChart
    title Meal Plan Sharing Landscape
    x-axis Low Curation --> High Curation
    y-axis Individual Recipes --> Complete Plans
    quadrant-1 Meal Plan Specialists
    quadrant-2 Social Meal Planners
    quadrant-3 Recipe Libraries
    quadrant-4 Content Creators
    "Plan to Eat": [0.7, 0.8]
    "Prepear": [0.65, 0.75]
    "Paprika": [0.3, 0.2]
    "Samsung Food": [0.5, 0.5]
    "mise en place (current)": [0.4, 0.35]
    "mise en place (target)": [0.75, 0.85]
```

**Differentiation**: While competitors focus on recipe sharing or subscription meal plans from influencers, mise en place enables peer-to-peer meal plan sharing with **YouTube video integration**—the only app where shared plans include timestamped video references.

---

## User Flow

### Primary Flow: Save & Share a Meal Plan

```mermaid
flowchart TD
    Start([User has populated weekly planner]) --> A{Want to share?}
    A -->|Yes| B[Open Share Modal from Planner]
    B --> C{Meal Plan Template exists?}
    C -->|No| D[Create Template Form]
    D --> E[Enter name, description, theme]
    E --> F[Save as Template]
    F --> G[Template Created]
    C -->|Yes| H[Select Template or Create New]
    H --> G
    G --> I{Make Public?}
    I -->|Yes| J[Toggle visibility ON]
    J --> K[Generate public URL]
    K --> L[Show share options]
    L --> M[Copy link / QR code / Social share]
    I -->|No| N[Stays private for personal reuse]
    M --> End([Meal plan shared])
    N --> End
```

### Detailed State Machine

```mermaid
stateDiagram-v2
    [*] --> DraftPlan: User builds weekly plan
    DraftPlan --> SavedTemplate: Save as template
    SavedTemplate --> PrivateTemplate: Default state
    PrivateTemplate --> PublicTemplate: Toggle public ON
    PublicTemplate --> PrivateTemplate: Toggle public OFF
    PublicTemplate --> SharedView: Visitor accesses URL
    SharedView --> ImportFlow: Visitor imports
    ImportFlow --> VisitorPlan: Clone to visitor's week
    PrivateTemplate --> LoadToPlanner: Creator loads
    LoadToPlanner --> DraftPlan: Apply to week
```

### Visitor Import Journey

```mermaid
journey
    title Visitor Imports a Meal Plan
    section Discovery
      Find profile via shared link: 4: Visitor
      Browse public meal plans: 5: Visitor
      View plan details: 5: Visitor
    section Evaluation
      See grocery list preview: 5: Visitor
      Check nutritional summary: 4: Visitor
      See included recipes: 5: Visitor
    section Import
      Click "Import to My Week": 5: Visitor
      Select target week: 4: Visitor
      Review import options: 4: Visitor
      Confirm import: 5: Visitor
    section Post-Import
      Navigate to planner: 5: Visitor
      See imported meals: 5: Visitor
      Generate grocery list: 5: Visitor
```

---

## System Architecture

### High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Profile[Public Profile Page]
        Planner[Weekly Planner]
        Templates[My Templates]
        PublicPlan[Public Plan View]
    end
    
    subgraph API["tRPC API Layer"]
        MealPlanRouter[mealPlan Router]
        ProfileRouter[profile Router]
        TemplateRouter[mealPlanTemplate Router]
    end
    
    subgraph Repository["Data Access Layer"]
        MealPlanRepo[meal-plan.ts]
        TemplateRepo[meal-plan-template.ts]
        ProfileRepo[profile.ts]
    end
    
    subgraph Database["Database (D1)"]
        MealPlanTable[(meal_plan)]
        TemplateTable[(meal_plan_template)]
        ProfileTable[(user_profile)]
    end
    
    Profile --> ProfileRouter
    Planner --> MealPlanRouter
    Templates --> TemplateRouter
    PublicPlan --> TemplateRouter
    
    MealPlanRouter --> MealPlanRepo
    ProfileRouter --> ProfileRepo
    TemplateRouter --> TemplateRepo
    
    MealPlanRepo --> MealPlanTable
    TemplateRepo --> TemplateTable
    ProfileRepo --> ProfileTable
```

### Import Processing Sequence

```mermaid
sequenceDiagram
    participant V as Visitor
    participant UI as Public Plan Page
    participant API as tRPC API
    participant TR as Template Repo
    participant MPR as Meal Plan Repo
    participant DB as Database

    V->>UI: Click "Import to My Week"
    UI->>API: importMealPlanTemplate({ templateId, targetWeekStart })
    API->>TR: getTemplateById(templateId)
    TR->>DB: Query template + entries
    DB-->>TR: Template with entries
    TR-->>API: Template data
    
    API->>MPR: getOrCreateMealPlan({ userId, weekStartDate })
    MPR->>DB: Get or insert meal_plan
    DB-->>MPR: Meal plan record
    MPR-->>API: Meal plan
    
    loop For each template entry
        API->>MPR: addEntry({ mealPlanId, recipeId, dayOfWeek, mealType })
        MPR->>DB: Insert meal_plan_entry
        DB-->>MPR: Entry created
    end
    
    API->>TR: incrementImportCount(templateId)
    TR->>DB: Update import_count
    
    API-->>UI: { success: true, mealPlanId }
    UI->>V: Navigate to planner
```

---

## Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o| USER_PROFILE : has
    USER ||--o{ MEAL_PLAN : creates
    USER ||--o{ MEAL_PLAN_TEMPLATE : creates
    
    MEAL_PLAN ||--o{ MEAL_PLAN_ENTRY : contains
    MEAL_PLAN_ENTRY }o--|| RECIPE : references
    
    MEAL_PLAN_TEMPLATE ||--o{ MEAL_PLAN_TEMPLATE_ENTRY : contains
    MEAL_PLAN_TEMPLATE_ENTRY }o--|| RECIPE : references
    MEAL_PLAN_TEMPLATE }o--o| MEAL_PLAN : "created from"
    
    USER_PROFILE ||--o{ MEAL_PLAN_TEMPLATE : "showcases"
    MEAL_PLAN_TEMPLATE ||--o{ MEAL_PLAN_TEMPLATE_IMPORT : "tracked by"
    USER ||--o{ MEAL_PLAN_TEMPLATE_IMPORT : performs

    MEAL_PLAN_TEMPLATE {
        text id PK
        text created_by_id FK
        text name
        text slug UK
        text description
        text theme
        text cover_image_url
        integer is_public
        integer import_count
        integer view_count
        integer created_at
        integer updated_at
    }

    MEAL_PLAN_TEMPLATE_ENTRY {
        text id PK
        text template_id FK
        text recipe_id FK
        integer day_of_week
        text meal_type
    }

    MEAL_PLAN_TEMPLATE_IMPORT {
        text id PK
        text template_id FK
        text imported_by_id FK
        integer imported_at
    }
```

### TypeScript Data Structures

```typescript
// New table: meal_plan_template
interface MealPlanTemplate {
  id: string;
  createdById: string;
  name: string;
  slug: string;
  description: string | null;
  theme: string | null; // e.g., "Mediterranean", "Budget-Friendly", "Quick Weeknight"
  coverImageUrl: string | null;
  isPublic: boolean;
  importCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// New table: meal_plan_template_entry
interface MealPlanTemplateEntry {
  id: string;
  templateId: string;
  recipeId: string;
  dayOfWeek: number; // 0-6 (Monday-Sunday)
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
}

// New table: meal_plan_template_import
interface MealPlanTemplateImport {
  id: string;
  templateId: string;
  importedById: string;
  importedAt: Date;
}

// Response types for API
interface PublicMealPlanTemplateResponse {
  template: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    theme: string | null;
    coverImageUrl: string | null;
    importCount: number;
    viewCount: number;
    createdAt: Date;
  };
  entries: Array<{
    dayOfWeek: number;
    mealType: string;
    recipe: {
      id: string;
      title: string;
      slug: string | null;
      thumbnailUrl: string | null;
      sourceType: "youtube" | "blog" | "original";
      calories: number | null;
      protein: number | null;
      prepTimeMinutes: number | null;
      cookTimeMinutes: number | null;
    };
  }>;
  groceryPreview: {
    totalIngredients: number;
    categories: Array<{ name: string; count: number }>;
  };
  nutritionSummary: {
    avgCalories: number;
    avgProtein: number;
    totalRecipes: number;
  };
  creator: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}
```

---

## Feature Breakdown

### Feature 1: Save Weekly Plan as Template

**Purpose**: Allow users to save their current weekly meal plan as a reusable template.

```mermaid
flowchart LR
    A[Weekly Planner] --> B{Has meals?}
    B -->|Yes| C[Show Save as Template button]
    C --> D[Open Template Form Modal]
    D --> E[Enter name & description]
    E --> F[Select theme tag]
    F --> G[Save Template]
    G --> H[Navigate to My Templates]
```

**User Story**: As a home cook, I want to save my current week's meal plan as a named template so I can reuse it or share it later.

**Acceptance Criteria**:
- [ ] "Save as Template" button appears when planner has at least 3 meals
- [ ] Form captures: name (required), description (optional), theme (optional dropdown)
- [ ] Slug auto-generated from name
- [ ] Success toast with link to view template
- [ ] Template appears in "My Templates" section

### Feature 2: My Templates Management

**Purpose**: Central hub for managing saved meal plan templates.

```mermaid
flowchart TD
    A[My Templates Page] --> B{Templates exist?}
    B -->|Yes| C[Show template cards]
    B -->|No| D[Empty state with CTA]
    C --> E[Card shows: name, theme, meal count, import count]
    E --> F[Actions: Edit, Load to Week, Toggle Public, Delete]
    F --> G{Action}
    G -->|Load| H[Apply to target week]
    G -->|Toggle Public| I[Update visibility]
    G -->|Edit| J[Edit details modal]
    G -->|Delete| K[Confirmation dialog]
```

**Key Features**:
- Grid of template cards with cover images
- Quick actions: Load to week, Edit, Share, Delete
- Visibility toggle with real-time URL preview
- Import count and view count stats

### Feature 3: Public Meal Plan View

**Purpose**: Public page for viewing and importing a shared meal plan.

**URL Structure**: `/u/[username]/plans/[slug]`

```mermaid
flowchart TD
    A[Public Plan Page] --> B[Header: Creator info + stats]
    B --> C[Plan Overview Card]
    C --> D[7-Day Grid Preview]
    D --> E[Nutrition Summary]
    E --> F[Grocery List Preview]
    F --> G{Visitor logged in?}
    G -->|Yes| H[Import to My Week button]
    G -->|No| I[Sign in to Import CTA]
    H --> J[Week selector modal]
    J --> K[Confirm import]
    K --> L[Redirect to planner]
```

**Features**:
- Compact weekly grid showing meal thumbnails
- Expandable recipe cards
- Aggregated grocery list preview (categories + counts)
- Weekly nutrition summary
- Share buttons (copy link, QR code)
- One-click import with week selection

### Feature 4: Import Meal Plan

**Purpose**: Clone a public meal plan template to visitor's weekly planner.

```mermaid
flowchart TD
    A[Click Import] --> B{Authenticated?}
    B -->|No| C[Redirect to login]
    B -->|Yes| D[Open Week Selector Modal]
    D --> E[Show calendar picker]
    E --> F[Preview: Target week + conflict check]
    F --> G{Conflicts exist?}
    G -->|Yes| H[Show warning: Will replace X existing meals]
    G -->|No| I[Show: Empty week - perfect]
    H --> J[Confirm import]
    I --> J
    J --> K[Clone all entries]
    K --> L[Increment import count]
    L --> M[Show success + navigate to planner]
```

**Import Behavior**:
- **Replace mode** (default): Overwrites existing meals in the target week
- **Merge mode** (future): Only fills empty slots
- Recipes must be public or owned by visitor
- Non-public recipes gracefully skipped with warning

### Feature 5: Profile Integration

**Purpose**: Display public meal plan templates on user's public profile.

```mermaid
flowchart LR
    A[Public Profile] --> B[Tab: Meal Plans]
    B --> C[Grid of public templates]
    C --> D[Card: thumbnail, name, import count]
    D --> E[Click to view full plan]
```

**Tab Order**: Original Recipes | Collected Recipes | **Meal Plans**

---

## UI Components

### Component Hierarchy

```mermaid
flowchart TD
    subgraph Pages["Route Pages"]
        Templates["/recipes/templates"]
        PublicPlan["/u/[username]/plans/[slug]"]
        Profile["/u/[username]"]
        Planner["/recipes/planner"]
    end
    
    subgraph Shared["Shared Components"]
        TemplateCard["MealPlanTemplateCard"]
        WeekGrid["MealPlanWeekGrid"]
        GroceryPreview["GroceryListPreview"]
        NutritionSummary["WeeklyNutritionSummary"]
    end
    
    subgraph Modals["Modal Components"]
        SaveModal["SaveTemplateModal"]
        ImportModal["ImportMealPlanModal"]
        ShareModal["ShareMealPlanModal"]
    end
    
    Templates --> TemplateCard
    Templates --> SaveModal
    PublicPlan --> WeekGrid
    PublicPlan --> GroceryPreview
    PublicPlan --> NutritionSummary
    PublicPlan --> ImportModal
    PublicPlan --> ShareModal
    Profile --> TemplateCard
    Planner --> SaveModal
```

### Screen Wireframes

#### Screen: Save Template Modal

```
┌─────────────────────────────────────────────────────────┐
│ ✕                    Save as Template                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Template Name *                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Mediterranean Week                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Description                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Fresh, healthy Mediterranean meals perfect for   │   │
│  │ summer. Light lunches and flavorful dinners.     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Theme Tag                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Mediterranean ▼                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Preview                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📅 7 days • 🍽️ 14 meals • 🛒 43 ingredients    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│           [ Cancel ]        [ Save Template ]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Screen: Public Meal Plan View

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to @sarah's profile                     🔗 Share   📥 Import │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Mediterranean Week                                         │    │
│  │  ━━━━━━━━━━━━━━━━━━━━                                      │    │
│  │  Fresh, healthy Mediterranean meals perfect for summer.     │    │
│  │                                                             │    │
│  │  🏷️ Mediterranean  •  📥 127 imports  •  👁️ 1.2k views     │    │
│  │                                                             │    │
│  │  Created by @sarah • Sarah Chen                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                       │
│  │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │  ← Weekly Preview     │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                       │
│  │ 🥗  │ 🍲  │ 🥙  │ 🍝  │ 🐟  │ 🍖  │ 🥘  │  ← Dinner thumbnails  │
│  │ 🥪  │ 🥗  │ 🍜  │ 🥗  │ 🥪  │ — │ — │  ← Lunch thumbnails   │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                       │
│                                                                     │
│  ┌─ Weekly Summary ────────────────────────────────────────────┐   │
│  │  📊 Avg 1,850 cal/day  •  🥩 95g protein  •  14 recipes    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ Grocery List Preview ──────────────────────────────────────┐   │
│  │  43 ingredients across 7 categories                         │   │
│  │  🥬 Produce (12)  •  🥩 Meat (4)  •  🧀 Dairy (6)  •  ...  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─ Recipes Included ──────────────────────────────────────────┐   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │   │
│  │  │  🖼️   │  │  🖼️   │  │  🖼️   │  │  🖼️   │   ...      │   │
│  │  │ Greek  │  │ Hummus │  │ Lemon  │  │ Shaksh │            │   │
│  │  │ Salad  │  │ Bowl   │  │ Chicken│  │ -uka   │            │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│         [ 📥 Import to My Week ]   (Primary CTA)                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Design System Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--template-card-bg` | `var(--card)` | Template card background |
| `--template-badge-bg` | `var(--secondary)` | Theme tag badge |
| `--import-count-text` | `var(--muted-foreground)` | Stats text |
| `--week-grid-border` | `var(--border)` | Grid cell borders |
| `--import-cta-bg` | `var(--primary)` | Primary import button |

---

## Frontend Design Specification

### Aesthetic Direction
**Tone**: Editorial cookbook meets weekly planner—warm, organized, inspiring
**Memorable Element**: The compact 7-day visual grid that shows meal thumbnails at a glance

### Typography

| Usage | Font | Weight |
|-------|------|--------|
| Template name | Playfair Display | 600 (semibold) |
| Description | Source Sans 3 | 400 (regular) |
| Stats/badges | Source Sans 3 | 500 (medium) |

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `var(--background)` | Page background |
| Card | `var(--card)` | Template cards, week grid |
| Primary | `var(--primary)` | Import button, active states |
| Secondary | `var(--secondary)` | Theme tags, stat badges |
| Muted | `var(--muted-foreground)` | Descriptions, counts |

### Motion Design
- **Card hover**: Subtle lift (`translateY(-2px)`) with shadow increase
- **Import success**: Confetti burst or checkmark animation
- **Grid reveal**: Staggered fade-in for meal thumbnails

### Visual Effects
- Grain texture on hero section (consistent with app)
- Warm shadows on template cards
- Subtle gradient on week grid header

---

## Technical Stack

### Stack Overview

```mermaid
mindmap
  root((Public Meal Plans))
    Frontend
      React Router
      TanStack Query
      shadcn/ui
      Tailwind v4
    API
      tRPC
      Zod validation
    Database
      D1 SQLite
      Drizzle ORM
    Features
      QR Code generation
      Social share meta tags
```

### API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `mealPlanTemplate.create` | mutation | Create template from current week |
| `mealPlanTemplate.update` | mutation | Update template details/visibility |
| `mealPlanTemplate.delete` | mutation | Delete a template |
| `mealPlanTemplate.list` | query | Get user's templates |
| `mealPlanTemplate.getBySlug` | query | Get public template by slug |
| `mealPlanTemplate.listPublic` | query | Get user's public templates |
| `mealPlanTemplate.import` | mutation | Import template to user's week |
| `mealPlanTemplate.incrementViewCount` | mutation | Track views |

### New Files

```
app/
├── repositories/
│   └── meal-plan-template.ts     # Template data access
├── trpc/routes/
│   └── meal-plan-template.ts     # tRPC routes
├── routes/recipes/
│   └── templates.tsx             # My Templates page
├── routes/u.[username].plans.tsx # Public plans list
├── routes/u.[username].plans.[slug].tsx # Single public plan
└── components/
    └── meal-plan-template/
        ├── template-card.tsx     # Template card component
        ├── save-template-modal.tsx
        ├── import-modal.tsx
        ├── week-preview-grid.tsx
        └── grocery-preview.tsx
```

### Migration

```sql
-- drizzle/0008_add_meal_plan_templates.sql

CREATE TABLE `meal_plan_template` (
  `id` text PRIMARY KEY NOT NULL,
  `created_by_id` text NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `theme` text,
  `cover_image_url` text,
  `is_public` integer DEFAULT false NOT NULL,
  `import_count` integer DEFAULT 0 NOT NULL,
  `view_count` integer DEFAULT 0 NOT NULL,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `meal_plan_template_slug_unique` ON `meal_plan_template` (`created_by_id`, `slug`);

CREATE TABLE `meal_plan_template_entry` (
  `id` text PRIMARY KEY NOT NULL,
  `template_id` text NOT NULL,
  `recipe_id` text NOT NULL,
  `day_of_week` integer NOT NULL,
  `meal_type` text NOT NULL,
  FOREIGN KEY (`template_id`) REFERENCES `meal_plan_template`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `meal_plan_template_import` (
  `id` text PRIMARY KEY NOT NULL,
  `template_id` text NOT NULL,
  `imported_by_id` text NOT NULL,
  `imported_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`template_id`) REFERENCES `meal_plan_template`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`imported_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
```

---

## Future Roadmap

### Phase 1 (Current Scope)
- [ ] Database schema for templates
- [ ] Save weekly plan as template
- [ ] My Templates management page
- [ ] Toggle template visibility
- [ ] Public template view page
- [ ] Import template to week
- [ ] Profile integration (Meal Plans tab)
- [ ] Share modal with QR code

### Phase 2: Social Discovery
- [ ] Browse public templates (explore page)
- [ ] Template search by theme/creator
- [ ] "Like" or "Save" public templates
- [ ] Following system for creators
- [ ] Activity feed (new templates from followed users)

### Phase 3: Advanced Features
- [ ] Template versioning (update a public template)
- [ ] Scheduling (auto-load template on a future week)
- [ ] Template collections (group related templates)
- [ ] Collaboration (co-create templates with family)
- [ ] Template comments and ratings
- [ ] Export as PDF (printable meal plan guide)

---

## UI Concepts

Three distinct concepts targeting different ICPs, each tailored to resonate with a specific user persona while maintaining the editorial cookbook aesthetic.

### Concept 1: "The Curator's Canvas" (YouTube Recipe Enthusiast)

![Concept 1: Video Enthusiast](/docs/features/public-meal-plans/public-meal-plan-concept-1-video-enthusiast.png)

**Visual Direction**: Dynamic, video-forward design showcasing YouTube integration
**Target Fit Score**: 72/100

**Hero Design**:
- Split-screen layout with video thumbnail mosaic
- 7-day grid showing recipe thumbnails with play button overlays
- Prominent YouTube badges on video-sourced recipes
- Mediterranean theme tag with import/view stats

**Color Emphasis**: Heavier primary (terracotta) for energy and action

**Key Visual Elements**:
- Video play icons on recipe cards
- Import count prominently displayed
- Chef creator profile integration
- Grocery list preview at bottom

**Headline**: "Mediterranean Week"
**Subheadline**: "Experience the vibrant flavors with easy-to-follow video recipes from top YouTube creators"

---

### Concept 2: "The Organizer's Oasis" (Overwhelmed Meal Planner)

![Concept 2: Meal Planner](/docs/features/public-meal-plans/public-meal-plan-concept-2-meal-planner.png)

**Visual Direction**: Calm, organized, grid-focused design for busy families
**Target Fit Score**: 68/100

**Hero Design**:
- Clean 7-day grid as the visual centerpiece
- Full week at a glance with breakfast/lunch/dinner/snacks rows
- Prep time badges on each meal
- Total time per day at bottom of columns

**Color Emphasis**: Sage green for calm, organized feel

**Key Visual Elements**:
- "547 families use this plan" social proof
- Time badges showing prep minutes
- "All recipes under 30 minutes" badge
- Grocery list category breakdown
- Clear "Copy This Plan to My Week" CTA

**Headline**: "Quick Family Dinners"
**Subheadline**: "30-minute meals for busy weeknights. 547 families use this plan."

---

### Concept 3: "The Heritage Keeper" (Analog Recipe Archivist)

![Concept 3: Recipe Archivist](/docs/features/public-meal-plans/public-meal-plan-concept-3-recipe-archivist.png)

**Visual Direction**: Warm, nostalgic, cookbook-inspired heritage aesthetic
**Target Fit Score**: 58/100

**Hero Design**:
- Magazine-style editorial layout
- Handwritten script accents
- Featured "Sunday's Centerpiece" recipe highlight
- Personal family story quote block

**Color Emphasis**: Warm cream with deep terracotta and gold accents

**Key Visual Elements**:
- "Family Recipe" badges
- Grandmother portrait illustration
- "Passed down from Rosa" attribution
- Heritage statistics: "Shared by 89 families • Passed down 3 generations"
- "Print as Recipe Book" secondary action

**Headline**: "Grandma Rosa's Sunday Suppers"
**Subheadline**: "A week of Italian comfort. These are the meals my grandmother made every Sunday..."

---

*Architecture Document v1.0 — Public Meal Plans — February 3, 2026*
