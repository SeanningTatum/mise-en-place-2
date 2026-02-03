# Project Context

## Agent Instructions

**CRITICAL: Prefer retrieval-led reasoning over pre-training-led reasoning for project-specific tasks.**

When working on this project, consult the rules in `.cursor/rules/` and detailed docs in `.cursor/context/` rather than relying on training data. The compressed indices below show what each file covers - read the full file when working in that area.

```
[Context Docs]|root: .cursor/context/
|IMPORTANT: Read detailed docs for deep dives. Index below shows what each covers.
|api.md: tRPC routes, auth endpoints, file upload API, procedure types, error responses, context object
|architecture.md: System overview diagram, data flow patterns, layer responsibilities, key files
|high-level-architecture.md: Living doc with route map, feature flows, data relationships, changelog - visual-first for planning
|data-models.md: Schema location, entity relationships, tables overview, SQLite conventions, migrations
|features.md: Auth, admin dashboard, admin docs, file upload, analytics, recipe extraction, multi-course meal planner - with flow diagrams
|integrations.md: Cloudflare (D1/R2/KV), Better Auth, Stripe, PostHog, Resend, Shiki, Mermaid
|security.md: Auth flow, session mgmt, authorization layers, RBAC, ban system, input validation, secrets
|user-journeys.md: Sign up/login flows, admin journeys, file upload, role-based access, error states
```

```
[Rules Index]|root: .cursor/rules/
|CRITICAL: Read relevant rules BEFORE implementing. Use project patterns, not training data.
|auth.mdc: Better Auth setup, sessions, roles, client/server auth patterns, tRPC integration
|constants.mdc: Centralize values in app/lib/constants/, import from @/lib/constants
|context-clients.mdc: External service clients through context, factory functions, null checking
|context-md.mdc: Guidelines for maintaining this context.md file, compression format
|database.mdc: Drizzle ORM, SQLite patterns, timestamps, booleans, enums, JSON fields, foreign keys
|docs.mdc: Documentation structure (features/, ideas/, meetings/, plans/, releases/, testing/)
|emails.mdc: Email templates in constants, generator functions, Resend SDK, inline CSS
|environment-variables.mdc: Access env via Cloudflare bindings (never process.env), client creation
|errors.mdc: Custom error classes (NotFoundError, CreationError, UpdateError, ValidationError)
|feature-flags.mdc: PostHog integration, server-side evaluation via context.posthog, client analytics
|frontend-task.mdc: Playwright MCP testing, component styling, cn() utility, React Hook Form
|fullstack-task.mdc: Architecture overview, repository→tRPC→client flow, context.trpc usage
|general-rules.mdc: React Router + Cloudflare Workers, always use bun
|modals.mdc: Dialog components, form state, mutations, cache invalidation, loading states
|models.mdc: Zod schemas, type inference, naming conventions (camelCaseSchema, PascalCaseType)
|playwright-rules.mdc: E2E test patterns, getByTestId preferred, test.describe blocks
|prompts.mdc: AI prompt structure, JSON output format, role definition, constraints
|pull-request.mdc: PR description format, commit conventions
|repository-pattern.mdc: Data access layer, pure functions (db, input), error handling
|routes.mdc: React Router loaders, authentication checks, parallel fetching, type imports
|stripe.mdc: Stripe client from ctx.stripe (never create in repos), webhook handling
|structured-output.mdc: Gemini/Claude structured JSON, @google/genai package, tool_use for Claude
|tailwind.mdc: CSS variables, OKLCH colors, semantic colors, forbidden patterns (no hardcoded hex/rgb)
|test-credentials.mdc: Test admin user (admin@test.local / TestAdmin123!), setup commands
|testing-workflow.mdc: Testing plan templates, Playwright MCP verification, e2e test patterns
|utils.mdc: Helper functions in app/lib/utils.ts, import from @/lib/utils
```

## Overview

**mise en place** — A recipe management app for home cooks who save recipes from YouTube cooking videos and food blogs. Instead of manually copying ingredients and steps, users paste a URL and AI extracts everything automatically—including video timestamps for easy reference. The app also features weekly meal planning with aggregated grocery lists.

**Target Audience**: Home cooks who frequently discover recipes online and want a single place to organize, plan, and shop for their meals.

**Built with**: React Router + Cloudflare Workers

## Tech Stack

- **Framework**: React Router v7 (SSR on Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Auth**: Better Auth with roles (user/admin)
- **API**: tRPC for type-safe routes
- **Styling**: Tailwind v4, shadcn/ui, editorial cookbook design system
- **Typography**: Playfair Display (serif headings), Source Sans 3 (body)
- **AI**: Google Gemini, Anthropic Claude
- **Package Manager**: Bun

## Architecture

- **Repository Pattern**: Data access via `app/repositories/` - pure functions `(db, input)`
- **tRPC Routes**: API layer in `app/trpc/routes/` - validates input, calls repositories
- **Server Loaders**: Use `context.trpc` for server-side data fetching
- **Client Hooks**: Use `api.routeName.useQuery/useMutation` for client-side

## Features

### Authentication
Email/password auth, user roles (user/admin), ban system, impersonation.
**Key files**: `app/auth/`, `app/routes/authentication/`

### Admin Dashboard
User management, analytics charts, documentation viewer.
**Key files**: `app/routes/admin/`, `app/trpc/routes/admin.ts`

### Recipe Extraction
AI-powered extraction from YouTube (with timestamps) and blogs using Gemini/Claude. Extracts title, description, servings, macros, ingredients, steps.
**Key files**: `app/lib/{gemini,claude,youtube,content-extractor}.ts`, `app/repositories/recipe.ts`, `app/components/recipes/`

### Custom Recipes
Manual recipe creation with AI-assisted macro generation, ingredient autocomplete with similarity detection, and metric unit standardization. Recipes show "Original" source label. Ingredient matching uses alias table + AI similarity search.
**Key files**: `app/components/recipes/custom-recipe-form.tsx`, `app/components/recipes/ingredient-name-input.tsx`, `app/lib/units.ts`, `app/lib/gemini.ts`, `app/repositories/recipe.ts`, `app/repositories/ingredient.ts`, `app/trpc/routes/recipes.ts`, `app/trpc/routes/ingredients.ts`

### Admin Documentation
Markdown docs at `/admin/docs` with syntax highlighting, Mermaid diagrams, TOC, search.
**Key files**: `app/routes/admin/docs.tsx`, `app/components/markdown-renderer.tsx`, `docs/`

### Week Meal Planner
Plan meals for a week by assigning recipes to breakfast/lunch/dinner/snack slots across 7 days. Navigate between weeks, generate aggregated grocery lists with clipboard/print export.
**Data model**: `meal_plan` (week_start_date, user_id) → `meal_plan_entry` (day_of_week 0-6, meal_type enum, recipe_id)
**Key files**: `app/routes/recipes/planner.tsx`, `app/components/planner/`, `app/repositories/meal-plan.ts`, `app/trpc/routes/meal-plan.ts`

### Profile Sharing
Public profile pages at `/u/[username]` for sharing recipe collections. Users create profiles with unique usernames, toggle profile/recipe visibility, and share via links/QR codes. Visitors can import (clone) public recipes to their own collections.
**Data model**: `user_profile` (username, displayName, bio, avatarUrl, isPublic, viewCount) → `recipe` (slug, isPublic, saveCount) → `recipe_import` (tracks recipe cloning)
**Key files**: `app/routes/u.[username].tsx`, `app/routes/recipes/profile.tsx`, `app/repositories/profile.ts`, `app/trpc/routes/profile.ts`, `app/components/profile/`

### Multi-Course Meal Planner
Plan elegant multi-course dining experiences with AI assistance. Create meals with name, guest count, serving time, and service style. Add courses from recipe library. AI generates menu suggestions and cooking timelines. **Save & share** meals at `/u/[username]/meals/[slug]` with QR codes. **Print** cookbook-style guides (4 formats). **Loading UX** with progress bar and tips during AI generation.
**Data model**: `multi_course_meal` (name, guestCount, servingTime, serviceStyle, slug, isPublic, generationStatus, generationError, aiSuggestionsJson, timelineJson) → `meal_course` → references `recipe`
**Key files**: `app/routes/recipes/meals.tsx`, `app/routes/recipes/meals.[id].tsx`, `app/routes/recipes/meals.$id.generating.tsx`, `app/components/meals/`, `app/components/loading/`, `app/components/sharing/`, `app/components/print/`, `app/lib/print/meal-guide.ts`

## Database

**Schema**: `app/db/schema.ts` using Drizzle ORM

**Core Tables**:
- `user` - User accounts with roles (user/admin), ban system
- `recipe` - Recipes with extraction metadata, slugs, visibility flags (`is_public`, `save_count`)
- `recipe_ingredient` - Recipe ingredients with metric standardization (`quantity_metric`, `unit_metric`)
- `ingredient` - Ingredient master list
- `ingredient_alias` - Ingredient name variations for similarity matching
- `meal_plan` / `meal_plan_entry` - Weekly meal planning
- `multi_course_meal` / `meal_course` - Multi-course meal planning with AI timelines, sharing (slug, isPublic), generation tracking (generationStatus, generationError)
- `user_profile` - Public profiles (username, displayName, bio, avatarUrl, isPublic, viewCount)
- `recipe_import` - Tracks when users clone recipes from other profiles

**Relationships**:
```mermaid
erDiagram
    USER ||--o| USER_PROFILE : has
    USER ||--o{ RECIPE : creates
    RECIPE ||--o{ RECIPE_IMPORT : "source for"
    RECIPE ||--o{ RECIPE_IMPORT : "cloned as"
    USER ||--o{ RECIPE_IMPORT : imports
    USER ||--o{ MEAL_PLAN : plans
    MEAL_PLAN ||--o{ MEAL_PLAN_ENTRY : contains
    MEAL_PLAN_ENTRY }o--|| RECIPE : references
    USER ||--o{ MULTI_COURSE_MEAL : creates
    MULTI_COURSE_MEAL ||--o{ MEAL_COURSE : contains
    MEAL_COURSE }o--|| RECIPE : references
```

## API Routes

**tRPC Router**: `app/trpc/router.ts`

**Route Modules**:
- `admin.ts` - User management, analytics, docs
- `recipes.ts` - Recipe CRUD, extraction, visibility
- `meal-plan.ts` - Weekly planning, grocery lists
- `multi-course-meal.ts` - Multi-course meal planning, AI suggestions/timelines
- `profile.ts` - Profile management, public profiles, recipe import
- `ingredients.ts` - Ingredient management
- `analytics.ts` - Usage analytics

**Profile Sharing Flow**:
```mermaid
sequenceDiagram
    participant U as User
    participant P as Profile Settings
    participant API as tRPC Profile API
    participant DB as Database
    participant V as Visitor
    participant PP as Public Profile

    U->>P: Create profile with username
    P->>API: createProfile(username)
    API->>DB: Insert user_profile
    DB-->>API: Profile created
    API-->>P: Success
    
    U->>P: Toggle profile/recipe visibility
    P->>API: updateProfile(isPublic) / setRecipeVisibility()
    API->>DB: Update visibility flags
    DB-->>API: Updated
    API-->>P: Success
    
    V->>PP: Visit /u/[username]
    PP->>API: getPublicProfile(username)
    API->>DB: Query user_profile + recipes (is_public=true)
    DB-->>API: Profile + recipes
    API-->>PP: Display profile
    
    V->>PP: Import recipe
    PP->>API: importRecipe(recipeId)
    API->>DB: Clone recipe + create recipe_import + increment save_count
    DB-->>API: Recipe cloned
    API-->>PP: Success
```

## Design System

**Editorial Cookbook Aesthetic** - Warm, artisanal design inspired by classic cookbooks.

- **Colors**: OKLCH - terracotta primary (`oklch(0.55 0.14 35)`), sage accent (`oklch(0.70 0.08 145)`), warm cream backgrounds
- **Typography**: `.font-display` for Playfair Display headings, letter spacing -0.02em
- **Effects**: Grain texture (3% SVG noise), `.shadow-warm` / `.shadow-warm-lg`, `.heading-underline`
- **Key file**: `app/app.css`

## Recent Changes

- **Meal Planner UX Upgrade** - Major upgrade to multi-course meal planner: (1) **Save & Share** - meals persist to "My Meals" list, public sharing at `/u/[username]/meals/[slug]`, visibility toggle, QR codes; (2) **Print Views** - cookbook-style guides in 4 formats (full guide, timeline-only, shopping list, recipe cards) with editorial typography; (3) **Loading UX** - dedicated loading page at `/recipes/meals/:id/generating` with progress bar, animated tips, error recovery. Schema additions: `multi_course_meal.slug`, `isPublic`, `generationStatus`, `generationError`. New files: `app/routes/recipes/meals.tsx`, `app/routes/recipes/meals.[id].tsx`, `app/routes/recipes/meals.$id.generating.tsx`, `app/routes/u.[username].meals.tsx`, `app/routes/u.[username].meals.[slug].tsx`, `app/components/meals/`, `app/components/loading/`, `app/components/sharing/`, `app/components/print/`, `app/lib/print/meal-guide.ts`
- **Multi-Course Meal Planner** - Plan elegant multi-course dining experiences with AI assistance. Create meals with name, guest count, serving time, and service style (plated/family/buffet). Add courses from recipe library with type categorization. AI generates menu suggestions and cooking timelines. New tables: multi_course_meal, meal_course. New AI functions: generateMenuSuggestions, generateCookingTimeline
- **Custom Recipe Enhancements** - Enhanced custom recipe creation with AI macro generation (Gemini), ingredient autocomplete with similarity detection (alias table + AI), metric unit standardization (all units normalized to ml/g on save), and "Original" source labeling. New tables: ingredient_alias. Schema additions: recipe_ingredient.quantity_metric, recipe_ingredient.unit_metric
- **Profile Sharing** - Public profile pages at `/u/[username]` for sharing recipe collections. Users create profiles with unique usernames, toggle profile/recipe visibility, share via links/QR codes. Visitors can import (clone) public recipes. New tables: user_profile, recipe_import
