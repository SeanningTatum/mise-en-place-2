---
title: Current Architecture Overview
date: 2026-01-30
---

# Mise En Place: Current Architecture Overview

A comprehensive high-level view of the existing application architecture, covering all pages, components, data flow, and system structure.

---

## Table of Contents

1. [Overview](#overview)
2. [Application Structure](#application-structure)
3. [Route Map](#route-map)
4. [System Architecture](#system-architecture)
5. [Data Model](#data-model)
6. [Feature Summary](#feature-summary)
7. [Component Library](#component-library)
8. [Design System](#design-system)

---

## Overview

### Product Vision

**Mise En Place** is a recipe management app for home cooks who save recipes from YouTube cooking videos and food blogs. Users paste a URL and AI extracts everything automatically—including video timestamps for easy reference. The app also features weekly meal planning with aggregated grocery lists.

### Core Capabilities

```mermaid
mindmap
  root((Mise En Place))
    Recipe Management
      URL Extraction
      YouTube Timestamps
      Blog Import
      Macro Tracking
    Meal Planning
      Weekly Calendar
      4 Meal Types
      Drag & Drop
    Grocery Lists
      Auto Aggregation
      Category Grouping
      Copy/Print Export
    Admin Tools
      User Management
      Recipe Oversight
      Ingredient Merging
      Documentation Viewer
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, React Router v7, Tailwind v4, shadcn/ui |
| **Backend** | Cloudflare Workers (Edge Runtime) |
| **API** | tRPC with React Query |
| **Auth** | Better Auth (email/password + sessions) |
| **Database** | Cloudflare D1 (SQLite), Drizzle ORM |
| **Storage** | Cloudflare R2 |
| **AI** | Google Gemini 3, Claude Sonnet 4.5 (fallback) |
| **Analytics** | PostHog |

---

## Application Structure

### Folder Organization

```
app/
├── auth/                    # Authentication (Better Auth)
│   ├── client.ts           # Client-side auth hooks
│   └── server.ts           # Server auth configuration
├── components/
│   ├── analytics/          # Charts, stat cards, insights
│   ├── planner/            # Meal planner components
│   ├── recipes/            # Recipe-specific components
│   └── ui/                 # shadcn/ui primitives (60+ components)
├── db/
│   ├── index.ts            # Database connection
│   └── schema.ts           # Drizzle schema definitions
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── claude.ts           # Claude AI client
│   ├── content-extractor.ts # Blog content extraction
│   ├── gemini.ts           # Gemini AI client
│   ├── utils.ts            # Shared utilities
│   └── youtube.ts          # YouTube transcript extraction
├── models/                 # Types and error classes
├── posthog/                # Analytics integration
├── repositories/           # Data access layer
│   ├── analytics.ts
│   ├── bucket.ts           # R2 storage operations
│   ├── ingredient.ts
│   ├── meal-plan.ts
│   ├── recipe.ts
│   └── user.ts
├── routes/                 # Page routes (see Route Map)
└── trpc/                   # API layer
    ├── routes/             # tRPC route handlers
    └── router.ts           # Router configuration
```

---

## Route Map

### Visual Route Hierarchy

```mermaid
flowchart TD
    subgraph Public["Public Routes"]
        HOME["/home" - Landing Page]
        LOGIN["/authentication/login"]
        SIGNUP["/authentication/sign-up"]
    end
    
    subgraph App["App Routes (Authenticated)"]
        subgraph Recipes["Recipe Management"]
            R_INDEX["/recipes" - My Recipes]
            R_NEW["/recipes/new" - Extract Recipe]
            R_DETAIL["/recipes/:id" - Recipe Detail]
            R_PLANNER["/recipes/planner" - Meal Planner]
        end
    end
    
    subgraph Admin["Admin Routes (Admin Only)"]
        A_INDEX["/admin" - Dashboard]
        A_USERS["/admin/users" - User Management]
        A_RECIPES["/admin/recipes" - All Recipes]
        A_INGREDIENTS["/admin/ingredients" - Ingredient Index]
        A_DOCS["/admin/docs" - Documentation]
        A_KITCHEN["/admin/kitchen-sink" - Component Gallery]
    end
    
    subgraph API["API Routes"]
        API_AUTH["/api/auth/*" - Better Auth]
        API_TRPC["/api/trpc/*" - tRPC]
        API_UPLOAD["/api/upload-file" - File Upload]
    end
    
    HOME --> LOGIN
    LOGIN --> R_INDEX
    SIGNUP --> R_INDEX
    R_INDEX --> R_NEW
    R_INDEX --> R_DETAIL
    R_INDEX --> R_PLANNER
```

### Route Details

| Route | Layout | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/home` | Marketing | Landing page (in progress) | No |
| `/authentication/login` | Auth | User login form | No |
| `/authentication/sign-up` | Auth | User registration form | No |
| `/recipes` | App | Recipe collection with search/filter | Yes |
| `/recipes/new` | App | Extract new recipe from URL | Yes |
| `/recipes/:id` | App | Recipe detail with YouTube player | Yes |
| `/recipes/planner` | App | Weekly meal planner + grocery list | Yes |
| `/admin` | Admin | Analytics dashboard | Admin |
| `/admin/users` | Admin | User management table | Admin |
| `/admin/recipes` | Admin | All recipes across users | Admin |
| `/admin/ingredients` | Admin | Ingredient database with merge | Admin |
| `/admin/docs` | Admin | Markdown documentation viewer | Admin |
| `/admin/kitchen-sink` | Admin | Component showcase | Admin |

### Page Flow Diagram

```mermaid
journey
    title User Journey Through App
    section Onboarding
      Visit landing: 4: Visitor
      Sign up: 5: User
      Redirect to recipes: 5: User
    section Daily Use
      Open recipes list: 5: User
      Search/filter recipes: 4: User
      View recipe detail: 5: User
      Cook with timestamps: 5: User
    section Planning
      Open meal planner: 5: User
      Add recipes to week: 5: User
      Generate grocery list: 5: User
      Copy/print list: 5: User
    section Discovery
      Find new recipe online: 4: User
      Extract from URL: 5: User
      Review and save: 5: User
```

---

## System Architecture

### High-Level Data Flow

```mermaid
flowchart TB
    subgraph Client["Browser (Client)"]
        UI[React Components]
        HOOKS[tRPC Hooks]
        AUTH_CLIENT[Better Auth Client]
    end
    
    subgraph Edge["Cloudflare Workers (Edge)"]
        WORKER[Worker Entry]
        TRPC[tRPC Router]
        AUTH[Better Auth Handler]
        LOADERS[React Router Loaders]
    end
    
    subgraph Services["Core Services"]
        YT[YouTube Service]
        CONTENT[Content Extractor]
        AI[AI Service - Gemini/Claude]
    end
    
    subgraph Data["Data Layer"]
        REPO[Repositories]
    end
    
    subgraph Storage["Cloudflare Storage"]
        D1[(D1 Database)]
        R2[R2 Bucket]
        KV[KV - Sessions]
    end
    
    subgraph External["External APIs"]
        YOUTUBE[YouTube Transcript API]
        GEMINI[Google Gemini API]
        CLAUDE[Anthropic Claude API]
    end
    
    UI --> HOOKS --> TRPC
    UI --> AUTH_CLIENT --> AUTH
    LOADERS --> TRPC
    
    TRPC --> REPO
    AUTH --> REPO
    
    TRPC --> YT --> YOUTUBE
    TRPC --> CONTENT
    TRPC --> AI --> GEMINI
    AI --> CLAUDE
    
    REPO --> D1
    REPO --> R2
    AUTH --> KV
```

### Request/Response Patterns

**Server-Side Rendering (Loaders)**:
```
Route Loader → context.trpc.route.method() → Repository → D1 → Return data
```

**Client-Side Queries**:
```
Component → api.route.useQuery() → tRPC Client → /api/trpc/* → Repository → D1
```

**Mutations**:
```
Component → api.route.useMutation() → tRPC Client → /api/trpc/* → Repository → D1
```

---

## Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ ACCOUNT : has
    USER ||--o{ RECIPE : creates
    USER ||--o{ MEAL_PLAN : owns
    
    RECIPE ||--|{ RECIPE_STEP : contains
    RECIPE ||--|{ RECIPE_INGREDIENT : has
    RECIPE_INGREDIENT }o--|| INGREDIENT : references
    
    MEAL_PLAN ||--|{ MEAL_PLAN_ENTRY : contains
    MEAL_PLAN_ENTRY }o--|| RECIPE : includes
    
    USER {
        string id PK
        string name
        string email UK
        boolean email_verified
        string image
        string role "user|admin"
        boolean banned
        string ban_reason
        timestamp ban_expires
        timestamp created_at
        timestamp updated_at
    }
    
    SESSION {
        string id PK
        string user_id FK
        string token UK
        timestamp expires_at
        string ip_address
        string user_agent
        string impersonated_by
    }
    
    ACCOUNT {
        string id PK
        string user_id FK
        string provider_id
        string account_id
        string password
        string access_token
        string refresh_token
    }
    
    RECIPE {
        string id PK
        string created_by_id FK
        string title
        string description
        string source_url
        string normalized_url UK
        string source_type "youtube|blog"
        string youtube_video_id
        string thumbnail_url
        int servings
        int prep_time_minutes
        int cook_time_minutes
        int calories
        int protein
        int carbs
        int fat
        int fiber
        timestamp created_at
        timestamp updated_at
    }
    
    RECIPE_STEP {
        string id PK
        string recipe_id FK
        int step_number
        string instruction
        int timestamp_seconds
        int duration_seconds
    }
    
    INGREDIENT {
        string id PK
        string name UK
        string category
        timestamp created_at
    }
    
    RECIPE_INGREDIENT {
        string id PK
        string recipe_id FK
        string ingredient_id FK
        string quantity
        string unit
        string notes
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
        string meal_type "breakfast|lunch|dinner|snacks"
    }
```

### Table Summary

| Table | Records | Purpose |
|-------|---------|---------|
| `user` | Core users | Auth, roles, bans |
| `session` | Active sessions | Session management |
| `account` | Auth accounts | OAuth/credential storage |
| `verification` | Email tokens | Email verification |
| `recipe` | User recipes | Extracted recipe data |
| `recipe_step` | Cooking steps | Instructions with timestamps |
| `ingredient` | Normalized ingredients | Ingredient database |
| `recipe_ingredient` | Junction | Recipe ↔ Ingredient link |
| `meal_plan` | Weekly plans | User's meal plan for a week |
| `meal_plan_entry` | Plan slots | Recipe assignments to day/meal |

---

## Feature Summary

### 1. Authentication

```mermaid
flowchart LR
    subgraph Auth["Authentication System"]
        Login[Email/Password Login]
        Signup[User Registration]
        Session[Session Management]
        Roles[Role-Based Access]
        Ban[Ban System]
        Impersonate[Admin Impersonation]
    end
```

**Capabilities**:
- Email/password authentication
- User roles: `user`, `admin`
- Ban system with reason and expiration
- Admin impersonation for support
- Device tracking via user agent

**Key Files**: `app/auth/server.ts`, `app/auth/client.ts`

### 2. Recipe Extraction

```mermaid
flowchart TD
    URL[Paste URL] --> Detect{Source Type?}
    Detect -->|YouTube| YT[Get Transcript + Metadata]
    Detect -->|Blog| Blog[JSON-LD or Readability]
    YT --> AI[Gemini AI Extraction]
    Blog --> AI
    AI --> Preview[Recipe Preview]
    Preview --> Save[Save to Database]
```

**Capabilities**:
- YouTube video extraction with timestamps
- Blog/recipe site extraction
- JSON-LD schema detection
- Readability fallback
- Dual AI providers (Gemini primary, Claude fallback)
- Macro estimation (calories, protein, carbs, fat, fiber)
- Duplicate URL detection

**Key Files**: `app/lib/youtube.ts`, `app/lib/content-extractor.ts`, `app/lib/gemini.ts`, `app/lib/claude.ts`

### 3. Recipe Collection

```mermaid
flowchart LR
    List[Recipe Grid] --> Filter[Source Filter]
    List --> Search[Text Search]
    List --> Card[Recipe Card]
    Card --> Detail[Recipe Detail]
    Detail --> Video[YouTube Player]
    Detail --> Steps[Clickable Steps]
    Detail --> Ingredients[Checkable List]
```

**Capabilities**:
- Grid view with thumbnails
- Filter by source type (YouTube/Blog/All)
- Full-text search
- Recipe detail with embedded YouTube player
- Clickable timestamps in steps
- Checkable ingredient list

**Routes**: `/recipes`, `/recipes/:id`

### 4. Meal Planning

```mermaid
flowchart TD
    Planner[Weekly Grid] --> Day[Day Column × 7]
    Day --> Slot[Meal Slot × 4]
    Slot --> Picker[Recipe Picker Modal]
    Picker --> Add[Add to Plan]
    Planner --> Grocery[Grocery List Panel]
    Grocery --> Export[Copy/Print]
```

**Capabilities**:
- 7-day × 4-meal grid (breakfast, lunch, dinner, snacks)
- Week navigation (prev/next)
- Recipe picker modal with search
- Auto-aggregated grocery list
- Category-grouped ingredients
- Copy to clipboard / print export
- Daily and weekly macro summaries

**Route**: `/recipes/planner`

### 5. Admin Dashboard

```mermaid
flowchart LR
    subgraph Admin["Admin Features"]
        Dashboard[Analytics Dashboard]
        Users[User Management]
        Recipes[Recipe Oversight]
        Ingredients[Ingredient Merge]
        Docs[Documentation Viewer]
    end
```

**Capabilities**:
- Analytics charts (time series, stat cards)
- User listing with search
- Ban/unban users
- Impersonate users
- View all recipes
- Ingredient database management
- Merge duplicate ingredients
- Markdown documentation viewer with Mermaid support

**Routes**: `/admin/*`

---

## Component Library

### UI Component Inventory

```mermaid
mindmap
  root((shadcn/ui))
    Layout
      Card
      Separator
      Sheet
      Dialog
      Drawer
      Sidebar
    Forms
      Input
      Textarea
      Select
      Checkbox
      Radio
      Switch
      Button
      Form
    Navigation
      Tabs
      Breadcrumb
      Navigation Menu
      Pagination
    Data Display
      Table
      Badge
      Avatar
      Progress
      Skeleton
    Feedback
      Alert
      Toast/Sonner
      Tooltip
      Popover
    Charts
      Area Chart
      Distribution Chart
```

### Feature Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `RecipeCard` | `components/recipes/` | Recipe thumbnail card |
| `RecipeExtractor` | `components/recipes/` | URL input and extraction |
| `RecipePreview` | `components/recipes/` | Preview before save |
| `RecipeSteps` | `components/recipes/` | Steps with timestamps |
| `IngredientsList` | `components/recipes/` | Checkable ingredients |
| `MacrosCard` | `components/recipes/` | Nutrition display |
| `YouTubePlayer` | `components/recipes/` | Embedded video player |
| `WeeklyPlannerGrid` | `components/planner/` | 7-day planner grid |
| `DayColumn` | `components/planner/` | Single day column |
| `MealSlot` | `components/planner/` | Meal type slot |
| `RecipePicker` | `components/planner/` | Recipe selection modal |
| `GroceryListPanel` | `components/planner/` | Aggregated grocery list |
| `MacroSummary` | `components/planner/` | Daily/weekly macros |
| `StatCard` | `components/analytics/` | KPI card |
| `TimeSeriesChart` | `components/analytics/` | Trend charts |
| `DistributionChart` | `components/analytics/` | Pie/donut charts |
| `MarkdownRenderer` | `components/` | Markdown with Mermaid |
| `FileUpload` | `components/` | R2 file uploader |

---

## Design System

### Editorial Cookbook Aesthetic

**Tone**: Warm, artisanal design inspired by classic cookbooks.

### Typography

| Usage | Font | Weight |
|-------|------|--------|
| Display Headlines | Playfair Display | 700 |
| Section Headlines | Playfair Display | 600 |
| Body Text | Source Sans 3 | 400 |
| UI Elements | Source Sans 3 | 500 |

### Color Palette (OKLCH)

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `oklch(0.55 0.14 35)` | Terracotta - CTAs, accents |
| `--accent` | `oklch(0.70 0.08 145)` | Sage green - secondary |
| `--background` | `oklch(0.985 0.005 85)` | Warm cream |
| `--card` | `oklch(0.995 0.003 85)` | Card backgrounds |
| `--text-heading` | `oklch(0.25 0.03 35)` | Headings |
| `--text-body` | `oklch(0.35 0.02 35)` | Body text |

### Visual Effects

- **Grain texture**: 3% opacity noise overlay
- **Warm shadows**: Brown-tinted box shadows
- **Motion**: Subtle fade/scale animations (200-300ms)

---

## Current Limitations & Future Opportunities

### What's Missing

1. **Public Recipe Sharing** - No way to share recipes with others
2. **Family Collaboration** - Single-user meal plans only
3. **Offline Mode** - Requires internet connection
4. **Recipe Scaling** - Fixed serving sizes
5. **Video Platform Expansion** - Only YouTube, no TikTok/Instagram
6. **Mobile App** - Web-only, no native apps
7. **Pantry Tracking** - No ingredient inventory
8. **Store Integration** - No Instacart/Amazon Fresh

### Feature Backlog (From Research)

| Priority | Feature | Impact |
|----------|---------|--------|
| 1 | Share Recipe Collections | +7 PMF |
| 2 | Family Collaboration | Medium |
| 3 | TikTok/Instagram Import | High demand |
| 4 | Offline Access | Medium |
| 5 | AI Recipe Generation | Premium tier |
| 6 | Recipe Scaling | Quality of life |

---

*Architecture Overview v1.0 - January 30, 2026*
