---
title: High-Level Architecture
date: 2026-02-03
---

# High-Level Architecture

A living document showing the app's structure, feature flows, and recent changes at a glance.

---

## Product Overview

```mermaid
mindmap
  root((Mise En Place))
    Recipe Management
      URL Extraction
        YouTube with Timestamps
        Blog Import
      Custom Recipes
        AI Macro Generation
        Ingredient Autocomplete
      Recipe Collection
        Search & Filter
        Checkable Ingredients
    Meal Planning
      Weekly Planner
        7-Day Grid
        4 Meal Types
        Drag & Drop
      Multi-Course Meals
        AI Menu Suggestions
        Cooking Timeline
        Print Guides
      Meal Plan Templates
        Save Weekly Plans
        Public Sharing
        One-Click Import
      Grocery Lists
        Auto Aggregation
        Category Grouping
        Copy/Print Export
    Profile Sharing
      Public Profiles
        Custom Username
        Recipe Visibility
      Share Links
        QR Codes
        Recipe Import
    Admin Tools
      User Management
        Ban System
        Impersonation
      Recipe Oversight
      Ingredient Merging
      Documentation Viewer
```

---

## Route Map

```mermaid
flowchart TD
    subgraph Public["Public Routes"]
        HOME["/ - Landing Page"]
        LP_VIDEO["/lp/video-recipes"]
        LP_MEAL["/lp/meal-planning"]
        LP_FAMILY["/lp/family-recipes"]
        LOGIN["/login"]
        SIGNUP["/sign-up"]
        
        subgraph PublicProfiles["Public Profile Routes"]
            PROFILE_U["/u/:username - Public Profile"]
            PROFILE_RECIPE["/u/:username/recipe/:slug"]
            PROFILE_MEALS["/u/:username/meals"]
            PROFILE_MEAL["/u/:username/meals/:slug"]
            PROFILE_PLANS["/u/:username/plans"]
            PROFILE_PLAN["/u/:username/plans/:slug"]
        end
    end
    
    subgraph App["App Routes (Authenticated)"]
        subgraph Recipes["Recipe Management"]
            R_INDEX["/recipes - My Recipes"]
            R_NEW["/recipes/new - Extract from URL"]
            R_CREATE["/recipes/create - Custom Recipe"]
            R_DETAIL["/recipes/:id - Recipe Detail"]
        end
        
        subgraph Planning["Meal Planning"]
            R_PLANNER["/recipes/planner - Weekly Planner"]
            R_TEMPLATES["/recipes/templates - My Templates"]
            R_MEAL["/recipes/meal - Create Multi-Course"]
            R_MEALS["/recipes/meals - My Meals"]
            R_MEALS_ID["/recipes/meals/:id - Meal Detail"]
            R_MEALS_GEN["/recipes/meals/:id/generating"]
        end
        
        subgraph Profile["Profile Settings"]
            R_PROFILE["/recipes/profile - Profile Settings"]
            R_VIS["/recipes/visibility - Recipe Visibility"]
        end
    end
    
    subgraph Admin["Admin Routes (Admin Only)"]
        A_INDEX["/admin - Dashboard"]
        A_USERS["/admin/users - User Management"]
        A_RECIPES["/admin/recipes - All Recipes"]
        A_INGREDIENTS["/admin/ingredients - Ingredients"]
        A_DOCS["/admin/docs - Documentation"]
        A_KITCHEN["/admin/kitchen-sink - Components"]
    end
    
    subgraph API["API Routes"]
        API_AUTH["/api/auth/* - Better Auth"]
        API_TRPC["/api/trpc/* - tRPC"]
        API_UPLOAD["/api/upload-file - File Upload"]
    end
    
    HOME --> LOGIN
    LOGIN --> R_INDEX
    SIGNUP --> R_INDEX
    R_INDEX --> R_NEW
    R_INDEX --> R_CREATE
    R_INDEX --> R_DETAIL
    R_INDEX --> R_PLANNER
```

---

## Information Architecture

| Route | Purpose | Auth | Key Components |
|-------|---------|------|----------------|
| `/` | Landing page with hero and feature highlights | Public | Hero, FeatureCards, CTA |
| `/lp/video-recipes` | Landing page for YouTube recipe enthusiasts | Public | Hero, Benefits, CTA |
| `/lp/meal-planning` | Landing page for meal planners | Public | Hero, Benefits, CTA |
| `/lp/family-recipes` | Landing page for family recipe archivists | Public | Hero, Benefits, CTA |
| `/login` | User login form | Public | LoginForm |
| `/sign-up` | User registration form | Public | SignupForm |
| `/recipes` | Recipe collection with search/filter | User | RecipeGrid, SearchBar, FilterTabs |
| `/recipes/new` | Extract recipe from YouTube/blog URL | User | URLInput, RecipeExtractor, Preview |
| `/recipes/create` | Create custom recipe manually | User | CustomRecipeForm, IngredientInput |
| `/recipes/:id` | Recipe detail with player/ingredients | User | YouTubePlayer, RecipeSteps, IngredientsList |
| `/recipes/planner` | Weekly meal planner + grocery list | User | WeeklyGrid, RecipePicker, GroceryPanel |
| `/recipes/templates` | User's meal plan templates | User | TemplateGrid, SaveTemplateModal, ShareModal |
| `/recipes/meal` | Create multi-course meal wizard | User | MealSetupForm, CoursePicker |
| `/recipes/meals` | User's saved meals list | User | MealGrid, MealCard |
| `/recipes/meals/:id` | Meal detail with share/print | User | MealDetail, ShareModal, PrintModal |
| `/recipes/meals/:id/generating` | AI generation loading page | User | ProgressBar, AnimatedTips |
| `/recipes/profile` | Profile settings (username, bio) | User | ProfileForm, AvatarUpload |
| `/recipes/visibility` | Manage recipe public/private status | User | RecipeVisibilityList, ToggleSwitch |
| `/u/:username` | Public profile page | Public | PublicProfile, PublicRecipeGrid |
| `/u/:username/recipe/:slug` | Public recipe detail | Public | PublicRecipeDetail, ImportButton |
| `/u/:username/meals` | Public meals list | Public | PublicMealsList |
| `/u/:username/meals/:slug` | Public meal detail | Public | PublicMealDetail |
| `/u/:username/plans` | Public meal plan templates list | Public | PublicPlansList, TemplateCard |
| `/u/:username/plans/:slug` | Public meal plan template detail | Public | PublicPlanDetail, ImportButton |
| `/admin` | Analytics dashboard | Admin | StatCards, TimeSeriesChart, DistributionChart |
| `/admin/users` | User management table | Admin | UserDataTable, BanModal, ImpersonateButton |
| `/admin/recipes` | All recipes across users | Admin | RecipeDataTable |
| `/admin/ingredients` | Ingredient database with merge | Admin | IngredientTable, MergeModal |
| `/admin/docs` | Markdown documentation viewer | Admin | DocsSidebar, MarkdownRenderer |

---

## Feature Flows

### Recipe Extraction

```mermaid
flowchart LR
    A[User pastes URL] --> B{URL Type?}
    B -->|YouTube| C[Fetch Transcript + Metadata]
    B -->|Blog| D[JSON-LD or Readability]
    C --> E[AI Extraction - Gemini]
    D --> E
    E --> F[Preview Recipe]
    F --> G{Save?}
    G -->|Yes| H[Store in DB]
    G -->|No| I[Discard]
```

### Custom Recipe Creation

```mermaid
flowchart LR
    A[Open Create Form] --> B[Enter Details]
    B --> C[Add Ingredients]
    C --> D[AI Autocomplete]
    D --> E[Metric Standardization]
    E --> F[Save Recipe]
    F --> G[AI Macro Generation]
```

### Weekly Meal Planning

```mermaid
flowchart TD
    A[Open Planner] --> B[Select Week]
    B --> C[View 7x4 Grid]
    C --> D[Click Slot]
    D --> E[Recipe Picker Modal]
    E --> F[Select Recipe]
    F --> G[Recipe Added to Slot]
    C --> H[View Grocery List]
    H --> I[Copy/Print List]
```

### Multi-Course Meal Planning

```mermaid
flowchart TD
    A[Create Meal] --> B[Set Name, Guests, Time, Style]
    B --> C[Add Courses]
    C --> D{Actions}
    D --> E[Get AI Suggestions]
    D --> F[Generate Timeline]
    F --> G[Loading Page with Progress]
    G --> H{Complete?}
    H -->|Yes| I[View Meal Detail]
    H -->|Error| J[Retry]
    I --> K[Share/Print Options]
```

### Profile Sharing

```mermaid
sequenceDiagram
    participant U as User
    participant P as Profile Settings
    participant DB as Database
    participant V as Visitor
    
    U->>P: Create profile with username
    P->>DB: Insert user_profile
    
    U->>P: Toggle recipe visibility
    P->>DB: Update is_public flags
    
    V->>DB: Visit /u/username
    DB-->>V: Public profile + recipes
    
    V->>DB: Import recipe
    DB-->>V: Clone recipe to visitor's collection
```

### Public Meal Plan Templates

```mermaid
flowchart TD
    A[User creates weekly plan] --> B[Click Save as Template]
    B --> C[Template Modal]
    C --> D[Enter name, description, theme]
    D --> E[Save Template]
    E --> F[Copy entries to template]
    F --> G[Toggle Public Visibility]
    G --> H{Public?}
    H -->|Yes| I[Appears on /u/username/plans]
    H -->|No| J[Private template only]
    I --> K[Visitor views template]
    K --> L[Click Import]
    L --> M[One-click import to visitor's planner]
    M --> N[Increment import count]
```

---

## Data Relationships

```mermaid
erDiagram
    USER ||--o| USER_PROFILE : "has profile"
    USER ||--o{ RECIPE : "creates"
    USER ||--o{ MEAL_PLAN : "owns"
    USER ||--o{ MULTI_COURSE_MEAL : "creates"
    USER ||--o{ MEAL_PLAN_TEMPLATE : "creates"
    USER ||--o{ MEAL_PLAN_TEMPLATE_IMPORT : "imports"
    
    RECIPE ||--|{ RECIPE_STEP : "has steps"
    RECIPE ||--|{ RECIPE_INGREDIENT : "has ingredients"
    RECIPE_INGREDIENT }o--|| INGREDIENT : "references"
    INGREDIENT ||--o{ INGREDIENT_ALIAS : "has aliases"
    
    RECIPE ||--o{ RECIPE_IMPORT : "source for"
    USER ||--o{ RECIPE_IMPORT : "imports"
    
    MEAL_PLAN ||--|{ MEAL_PLAN_ENTRY : "contains"
    MEAL_PLAN_ENTRY }o--|| RECIPE : "includes"
    
    MULTI_COURSE_MEAL ||--|{ MEAL_COURSE : "contains"
    MEAL_COURSE }o--|| RECIPE : "references"
    
    MEAL_PLAN_TEMPLATE ||--|{ MEAL_PLAN_TEMPLATE_ENTRY : "contains"
    MEAL_PLAN_TEMPLATE_ENTRY }o--|| RECIPE : "references"
    MEAL_PLAN_TEMPLATE ||--o{ MEAL_PLAN_TEMPLATE_IMPORT : "imported as"
```

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user` | User accounts | id, email, role (user/admin), banned |
| `user_profile` | Public profile settings | username, displayName, bio, isPublic |
| `recipe` | User's recipes | title, sourceType (youtube/blog/original), slug, isPublic |
| `recipe_step` | Cooking instructions | stepNumber, instruction, timestampSeconds |
| `recipe_ingredient` | Recipe ingredients | quantity, unit, quantityMetric, unitMetric |
| `ingredient` | Master ingredient list | name, category |
| `ingredient_alias` | Ingredient name variations | ingredientId, alias |
| `meal_plan` | Weekly meal plans | userId, weekStartDate |
| `meal_plan_entry` | Plan slots | dayOfWeek (0-6), mealType (breakfast/lunch/dinner/snacks) |
| `multi_course_meal` | Multi-course meals | name, guestCount, servingTime, serviceStyle, slug, isPublic |
| `meal_course` | Courses in a meal | courseType, courseOrder, recipeId |
| `meal_plan_template` | Meal plan templates | name, slug, description, theme, coverImageUrl, isPublic, importCount, viewCount |
| `meal_plan_template_entry` | Template entries | templateId, recipeId, dayOfWeek, mealType |
| `meal_plan_template_import` | Template import tracking | templateId, importedById, importedAt |
| `recipe_import` | Tracks recipe cloning | sourceRecipeId, importedRecipeId |

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Browser"]
        UI[React Components]
        HOOKS[tRPC Hooks]
        AUTH_C[Better Auth Client]
    end
    
    subgraph Edge["Cloudflare Workers"]
        RR[React Router SSR]
        TRPC[tRPC Router]
        AUTH[Better Auth Handler]
        REPO[Repositories]
    end
    
    subgraph Services["AI Services"]
        GEMINI[Google Gemini]
        CLAUDE[Anthropic Claude]
    end
    
    subgraph Storage["Cloudflare"]
        D1[(D1 - SQLite)]
        R2[R2 - Files]
        KV[KV - Sessions]
    end
    
    UI --> HOOKS --> TRPC
    UI --> AUTH_C --> AUTH
    RR --> TRPC
    TRPC --> REPO
    REPO --> D1
    REPO --> R2
    AUTH --> KV
    TRPC --> GEMINI
    TRPC --> CLAUDE
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router v7, Tailwind v4, shadcn/ui |
| Backend | Cloudflare Workers (Edge Runtime) |
| API | tRPC with React Query |
| Auth | Better Auth (email/password + sessions) |
| Database | Cloudflare D1 (SQLite), Drizzle ORM |
| Storage | Cloudflare R2 |
| AI | Google Gemini, Anthropic Claude (fallback) |
| Analytics | PostHog |

---

## Changelog

### 2026-02-03 - Public Meal Plan Templates
- Added: `/recipes/templates` route for user's meal plan templates
- Added: `/u/:username/plans` public route for user's public templates list
- Added: `/u/:username/plans/:slug` public route for template detail
- Added: `meal_plan_template` table with metadata (name, slug, description, theme, coverImageUrl, isPublic, importCount, viewCount)
- Added: `meal_plan_template_entry` table linking templates to recipes with day/meal type
- Added: `meal_plan_template_import` table tracking template imports
- Added: `mealPlanTemplate` tRPC router with create, update, delete, getById, list, getPublicBySlug, listPublic, import, incrementViewCount routes
- Added: Save as Template flow from weekly planner
- Added: One-click template import functionality

### 2026-02-03 - Custom Recipes & Ingredient Enhancements
- Added: `/recipes/create` route for manual recipe creation
- Added: `ingredient_alias` table for name variations
- Added: `quantity_metric` and `unit_metric` fields to `recipe_ingredient`
- Added: AI macro generation for custom recipes
- Added: Ingredient autocomplete with similarity detection
- Changed: Recipes now support `source_type: "original"` for custom recipes

### 2026-02-02 - Multi-Course Meal Planner Upgrade
- Added: `/recipes/meals` list page for saved meals
- Added: `/recipes/meals/:id` detail page with share/print
- Added: `/recipes/meals/:id/generating` loading page with progress
- Added: `/u/:username/meals` and `/u/:username/meals/:slug` public routes
- Added: `slug`, `isPublic`, `generationStatus`, `generationError` to `multi_course_meal`
- Added: Print views in 4 formats (full guide, timeline, shopping list, recipe cards)
- Added: QR code generation for meal sharing

### 2026-02-01 - Multi-Course Meal Planner
- Added: `/recipes/meal` wizard for creating multi-course meals
- Added: `multi_course_meal` and `meal_course` tables
- Added: AI menu suggestions via Gemini
- Added: AI cooking timeline generation

### 2026-01-31 - Profile Sharing
- Added: `/u/:username` public profile routes
- Added: `/recipes/profile` and `/recipes/visibility` settings
- Added: `user_profile` and `recipe_import` tables
- Added: `slug` and `is_public` fields to `recipe`
- Added: Recipe import (cloning) functionality

### 2026-01-29 - Weekly Meal Planner
- Added: `/recipes/planner` route
- Added: `meal_plan` and `meal_plan_entry` tables
- Added: Grocery list aggregation with category grouping

### 2026-01-28 - Recipe Extraction
- Added: `/recipes/new` route for URL extraction
- Added: YouTube transcript extraction with timestamps
- Added: Blog content extraction (JSON-LD + Readability)
- Added: Dual AI provider support (Gemini primary, Claude fallback)
- Added: `recipe`, `recipe_step`, `recipe_ingredient`, `ingredient` tables

### 2026-01-24 - Foundation
- Added: Authentication system (Better Auth)
- Added: Admin dashboard with user management
- Added: Documentation viewer at `/admin/docs`
- Added: Editorial cookbook design system
