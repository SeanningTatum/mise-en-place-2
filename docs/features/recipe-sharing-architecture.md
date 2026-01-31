---
title: Recipe Collection Sharing Architecture
date: 2026-01-30
---

# Recipe Collection Sharing: Information Architecture

A social feature enabling users to create public profile pages showcasing their best recipes and share them with friends, family, and the broader cooking community.

---

## Table of Contents

1. [Overview](#overview)
2. [ICP Analysis](#icp-analysis)
3. [User Flow](#user-flow)
4. [System Architecture](#system-architecture)
5. [Data Model](#data-model)
6. [Feature Breakdown](#feature-breakdown)
7. [UI Components](#ui-components)
8. [UI Concepts](#ui-concepts)
9. [Frontend Design Specification](#frontend-design-specification)
10. [API Endpoints](#api-endpoints)
11. [Privacy & Security](#privacy--security)
12. [Future Roadmap](#future-roadmap)

---

## Overview

### Vision

Enable users to curate and share their recipe collections publicly, creating a viral growth loop while serving the genuine need for recipe sharing among friends and families. This feature transforms mise en place from a personal organization tool into a social platform for culinary discovery.

### Strategic Rationale

From the market research report:
- **+7 PMF Score Impact** - One of the highest-impact quick wins identified
- **Viral Loop Creation** - Shared collections drive organic discovery
- **Network Effects** - Family sharing creates household-level stickiness
- **Content Marketing** - Public profiles generate SEO value

### Core Value Proposition

| For Sharers | For Viewers |
|-------------|-------------|
| Showcase favorite recipes | Discover curated collections |
| Share with family/friends easily | Import recipes to own collection |
| Build cooking reputation | Follow favorite cooks |
| One link for all recipes | No login required to browse |

### Competitive Gap

```mermaid
quadrantChart
    title Sharing Features: Competitive Analysis
    x-axis Private Only --> Public Sharing
    y-axis Basic Export --> Social Features
    quadrant-1 Social Platforms
    quadrant-2 Our Opportunity
    quadrant-3 Traditional Apps
    quadrant-4 Export Only
    "Paprika": [0.2, 0.3]
    "AnyList": [0.3, 0.4]
    "Samsung Food": [0.7, 0.5]
    "Pinterest": [0.9, 0.9]
    "mise en place (current)": [0.1, 0.2]
    "mise en place (target)": [0.6, 0.65]
```

---

## ICP Analysis

### How Each ICP Benefits

```mermaid
flowchart TD
    subgraph ICP1["YouTube Enthusiast (72/100)"]
        Y1[Curates video recipe collection]
        Y2[Shares playlists with foodie friends]
        Y3[Builds reputation as recipe curator]
    end
    
    subgraph ICP2["Meal Planner (68/100)"]
        M1[Creates family recipe hub]
        M2[Shares meal plans with partner]
        M3[Coordinates household cooking]
    end
    
    subgraph ICP3["Recipe Archivist (58/100)"]
        A1[Preserves family recipes digitally]
        A2[Shares heritage with extended family]
        A3[Creates generational food legacy]
    end
    
    Y1 --> Share[Public Profile]
    Y2 --> Share
    M1 --> Share
    M2 --> Share
    A1 --> Share
    A2 --> Share
```

### ICP-Specific Use Cases

| ICP | Primary Use Case | Share Target | Privacy Need |
|-----|------------------|--------------|--------------|
| **YouTube Enthusiast** | "Check out my favorite video recipes" | Social media, food communities | Public by default |
| **Meal Planner** | "Here's our family meal rotation" | Partner, family group chat | Private link sharing |
| **Recipe Archivist** | "Grandma's recipes, preserved for generations" | Extended family | Family-only access |

---

## User Flow

### Primary Flow: Creating a Public Profile

```mermaid
flowchart TD
    Start([User has recipes]) --> Navigate[Go to Profile Settings]
    Navigate --> Enable[Enable Public Profile]
    Enable --> Customize[Customize Profile]
    
    subgraph Customize
        Name[Set display name]
        Bio[Add bio/description]
        Avatar[Upload avatar]
        Username[Choose unique username]
    end
    
    Customize --> Curate[Curate Collection]
    
    subgraph Curate
        Select[Select recipes to share]
        Order[Arrange order]
        Featured[Mark featured recipes]
        Collections[Create collections/folders]
    end
    
    Curate --> Preview[Preview public profile]
    Preview --> Publish[Publish]
    Publish --> Share[Get shareable link]
    Share --> End([Share on social/messaging])
```

### Flow: Viewer Discovers Shared Profile

```mermaid
flowchart TD
    Start([Receives shared link]) --> View[View public profile]
    View --> Browse[Browse recipe collection]
    Browse --> Recipe[View recipe detail]
    Recipe --> A{Action?}
    
    A -->|Save| Check{Has account?}
    Check -->|Yes| Import[Import to own collection]
    Check -->|No| Signup[Sign up prompt]
    Signup --> Import
    
    A -->|Share| Reshare[Copy link / share]
    A -->|Print| Print[Print recipe]
    
    Import --> Success[Recipe saved]
    Success --> CTA[Prompt: Create your own collection]
```

### State Machine: Profile Visibility

```mermaid
stateDiagram-v2
    [*] --> Private: Account created
    
    Private --> SetupPending: Enable sharing
    SetupPending --> Public: Complete profile
    SetupPending --> Private: Cancel setup
    
    Public --> Private: Disable sharing
    Public --> Editing: Edit profile
    Editing --> Public: Save changes
    
    note right of Private: Only owner sees recipes
    note right of Public: Anyone with link can view
```

### User Journey Map

```mermaid
journey
    title Sharing Recipe Collection
    section Setup
      Enable public profile: 4: User
      Set username: 5: User
      Write bio: 3: User
    section Curation
      Select recipes to share: 4: User
      Create collection folders: 5: User
      Mark favorites: 5: User
    section Sharing
      Copy profile link: 5: User
      Share in group chat: 5: User
      Post on social media: 4: User
    section Discovery
      Friend clicks link: 5: Viewer
      Browses collection: 5: Viewer
      Saves a recipe: 5: Viewer
      Signs up: 4: Viewer
```

---

## System Architecture

### High-Level Architecture

```mermaid
flowchart TB
    subgraph Public["Public Layer (No Auth)"]
        PublicProfile["/u/username" - Public Profile]
        PublicRecipe["/u/username/recipe-slug" - Public Recipe]
        OGMeta[Open Graph Meta Tags]
    end
    
    subgraph App["App Layer (Authenticated)"]
        ProfileSettings[Profile Settings Page]
        RecipeManager[Recipe Visibility Manager]
        ShareModal[Share Modal Component]
    end
    
    subgraph API["tRPC Layer"]
        ProfileRoutes[profile.* routes]
        RecipeRoutes[recipes.* routes]
    end
    
    subgraph Data["Data Layer"]
        ProfileRepo[profile.ts]
        RecipeRepo[recipe.ts]
    end
    
    subgraph DB["Database"]
        UserTable[(user)]
        ProfileTable[(user_profile)]
        RecipeTable[(recipe)]
        CollectionTable[(recipe_collection)]
        CollectionRecipeTable[(collection_recipe)]
    end
    
    PublicProfile --> ProfileRoutes
    PublicRecipe --> RecipeRoutes
    ProfileSettings --> ProfileRoutes
    RecipeManager --> RecipeRoutes
    
    ProfileRoutes --> ProfileRepo
    RecipeRoutes --> RecipeRepo
    
    ProfileRepo --> UserTable
    ProfileRepo --> ProfileTable
    RecipeRepo --> RecipeTable
    RecipeRepo --> CollectionTable
    RecipeRepo --> CollectionRecipeTable
```

### Share Link Generation

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant T as tRPC
    participant D as Database
    
    U->>C: Click "Share Profile"
    C->>T: profile.getShareLink()
    T->>D: Get user profile
    D-->>T: Profile with username
    T-->>C: { url: "miseenplace.app/u/username" }
    C->>C: Copy to clipboard
    C-->>U: "Link copied!" toast
    
    Note over U,C: User shares link externally
    
    participant V as Viewer
    V->>C: Opens shared link
    C->>T: profile.getPublicProfile(username)
    T->>D: Get profile + public recipes
    D-->>T: Profile data
    T-->>C: Public profile response
    C-->>V: Render public profile page
```

### Recipe Import Flow

```mermaid
sequenceDiagram
    participant V as Viewer
    participant C as Client
    participant T as tRPC
    participant D as Database
    
    V->>C: Click "Save to My Recipes"
    
    alt Not logged in
        C-->>V: Show auth modal
        V->>C: Sign up / Login
    end
    
    C->>T: recipes.importFromProfile({ recipeId, profileId })
    T->>D: Get source recipe
    D-->>T: Recipe data
    T->>T: Create copy for viewer
    T->>D: Insert cloned recipe
    D-->>T: New recipe ID
    T-->>C: { success: true, recipeId }
    C-->>V: "Recipe saved!" + link
```

---

## Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o| USER_PROFILE : has
    USER ||--o{ RECIPE : owns
    USER ||--o{ RECIPE_COLLECTION : creates
    RECIPE_COLLECTION ||--o{ COLLECTION_RECIPE : contains
    COLLECTION_RECIPE }o--|| RECIPE : references
    RECIPE ||--o{ RECIPE_IMPORT : is_source_of
    USER ||--o{ RECIPE_IMPORT : imports
    
    USER {
        string id PK
        string name
        string email
    }
    
    USER_PROFILE {
        string id PK
        string user_id FK UK
        string username UK "url-safe, unique"
        string display_name
        string bio
        string avatar_url
        boolean is_public
        int view_count
        timestamp created_at
        timestamp updated_at
    }
    
    RECIPE_COLLECTION {
        string id PK
        string user_id FK
        string name
        string description
        string slug "url-safe"
        int display_order
        boolean is_public
        timestamp created_at
    }
    
    COLLECTION_RECIPE {
        string id PK
        string collection_id FK
        string recipe_id FK
        int display_order
        boolean is_featured
    }
    
    RECIPE {
        string id PK
        string created_by_id FK
        string title
        string slug "url-safe"
        boolean is_public "default false"
        int save_count "import count"
    }
    
    RECIPE_IMPORT {
        string id PK
        string source_recipe_id FK
        string imported_recipe_id FK
        string imported_by_id FK
        timestamp imported_at
    }
```

### New Tables

#### `user_profile`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | UUID |
| `user_id` | TEXT | FK, UNIQUE | Link to user |
| `username` | TEXT | UNIQUE | URL-safe handle (e.g., "chef-sarah") |
| `display_name` | TEXT | | Public name |
| `bio` | TEXT | | Profile description |
| `avatar_url` | TEXT | | R2 stored image |
| `is_public` | INTEGER | DEFAULT 0 | Profile visibility |
| `view_count` | INTEGER | DEFAULT 0 | Analytics |
| `created_at` | INTEGER | | Timestamp |
| `updated_at` | INTEGER | | Timestamp |

#### `recipe_collection`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | UUID |
| `user_id` | TEXT | FK | Owner |
| `name` | TEXT | NOT NULL | e.g., "Weeknight Dinners" |
| `description` | TEXT | | Collection description |
| `slug` | TEXT | | URL-safe name |
| `display_order` | INTEGER | | Sort order |
| `is_public` | INTEGER | DEFAULT 0 | Collection visibility |
| `created_at` | INTEGER | | Timestamp |

#### `collection_recipe`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | UUID |
| `collection_id` | TEXT | FK | Parent collection |
| `recipe_id` | TEXT | FK | Recipe in collection |
| `display_order` | INTEGER | | Sort order |
| `is_featured` | INTEGER | DEFAULT 0 | Featured flag |

#### `recipe_import`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | UUID |
| `source_recipe_id` | TEXT | FK | Original recipe |
| `imported_recipe_id` | TEXT | FK | Cloned recipe |
| `imported_by_id` | TEXT | FK | User who imported |
| `imported_at` | INTEGER | | Timestamp |

### Schema Updates to Existing Tables

**`recipe` table additions:**
- `slug` TEXT - URL-safe title for public URLs
- `is_public` INTEGER DEFAULT 0 - Public visibility flag
- `save_count` INTEGER DEFAULT 0 - Number of imports

### TypeScript Interfaces

```typescript
interface UserProfile {
  id: string;
  userId: string;
  username: string;           // unique, url-safe
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RecipeCollection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  slug: string;
  displayOrder: number;
  isPublic: boolean;
  createdAt: Date;
  recipes?: CollectionRecipe[];
}

interface CollectionRecipe {
  id: string;
  collectionId: string;
  recipeId: string;
  displayOrder: number;
  isFeatured: boolean;
  recipe?: Recipe;  // joined
}

interface PublicProfileResponse {
  profile: UserProfile;
  collections: RecipeCollection[];
  featuredRecipes: Recipe[];
  recentRecipes: Recipe[];
  stats: {
    totalRecipes: number;
    totalSaves: number;
  };
}

interface RecipeImport {
  id: string;
  sourceRecipeId: string;
  importedRecipeId: string;
  importedById: string;
  importedAt: Date;
}
```

---

## Feature Breakdown

### Feature 1: Profile Setup

```mermaid
flowchart TD
    Start([User opens settings]) --> Check{Has profile?}
    Check -->|No| Create[Create profile form]
    Check -->|Yes| Edit[Edit profile form]
    
    subgraph Form["Profile Form"]
        Username[Username input]
        Display[Display name input]
        Bio[Bio textarea]
        Avatar[Avatar upload]
        Public[Public toggle]
    end
    
    Create --> Form
    Edit --> Form
    Form --> Validate[Validate username]
    Validate -->|Unique| Save[Save profile]
    Validate -->|Taken| Error[Show error]
    Save --> Preview[Show profile preview]
```

**Specifications:**
- Username: 3-30 chars, lowercase letters, numbers, hyphens only
- Display name: 2-50 chars
- Bio: 0-500 chars
- Avatar: Max 2MB, JPEG/PNG/WebP

### Feature 2: Recipe Visibility Control

```mermaid
flowchart LR
    Recipe[Recipe] --> Toggle{Public?}
    Toggle -->|Yes| Public[Visible on profile]
    Toggle -->|No| Private[Hidden from profile]
    
    Public --> Collection[Add to collection]
    Collection --> Featured[Mark as featured]
```

**Specifications:**
- Per-recipe visibility toggle
- Bulk visibility actions
- Collection-level visibility override
- Featured recipes appear first

### Feature 3: Recipe Collections

```mermaid
flowchart TD
    subgraph Collections["User Collections"]
        C1["🍳 Weeknight Dinners"]
        C2["🎉 Party Favorites"]
        C3["🥗 Healthy Meals"]
        C4["📺 YouTube Finds"]
    end
    
    C1 --> R1[Recipe 1]
    C1 --> R2[Recipe 2]
    C2 --> R3[Recipe 3]
    C2 --> R4[Recipe 4]
```

**Specifications:**
- Unlimited collections per user
- Drag-and-drop reordering
- Collection descriptions
- Collection-specific URLs (`/u/username/collection-slug`)

### Feature 4: Public Profile Page

**URL Structure:**
- Profile: `/u/[username]`
- Collection: `/u/[username]/[collection-slug]`
- Recipe: `/u/[username]/recipe/[recipe-slug]`

```mermaid
flowchart TD
    subgraph PublicPage["Public Profile Page"]
        Header[Profile Header - Avatar, Name, Bio]
        Stats[Stats Bar - Recipe count, Saves]
        Featured[Featured Recipes Row]
        Collections[Collection Grid]
        AllRecipes[All Recipes Grid]
    end
```

### Feature 5: Social Sharing

```mermaid
flowchart LR
    Share[Share Button] --> Modal[Share Modal]
    Modal --> CopyLink[Copy Link]
    Modal --> Twitter[Share to Twitter]
    Modal --> Facebook[Share to Facebook]
    Modal --> Pinterest[Pin to Pinterest]
    Modal --> Email[Email Link]
    Modal --> QR[QR Code]
```

**Open Graph Meta Tags:**
```html
<meta property="og:title" content="Sarah's Recipe Collection" />
<meta property="og:description" content="45 recipes • Weeknight dinners, party favorites, and more" />
<meta property="og:image" content="[dynamic preview image]" />
<meta property="og:url" content="https://miseenplace.app/u/sarah" />
```

### Feature 6: Recipe Import (Save)

```mermaid
flowchart TD
    Viewer[Viewer sees recipe] --> Save[Click Save]
    Save --> Auth{Logged in?}
    Auth -->|No| AuthModal[Auth Modal]
    Auth -->|Yes| Clone[Clone recipe]
    AuthModal --> Login[Login/Signup]
    Login --> Clone
    Clone --> Notify[Notify original creator]
    Notify --> Success[Show in My Recipes]
```

**Specifications:**
- Clone recipe with attribution
- Preserve video timestamps
- Optional: notify creator
- Track import count for analytics

---

## UI Components

### Component Hierarchy

```mermaid
flowchart TD
    subgraph Settings["Profile Settings Page"]
        ProfileForm[ProfileSettingsForm]
        UsernameInput[UsernameInput]
        AvatarUpload[AvatarUpload]
        VisibilityToggle[VisibilityToggle]
    end
    
    subgraph Manager["Recipe Manager"]
        RecipeVisibilityList[RecipeVisibilityList]
        CollectionManager[CollectionManager]
        DragDropList[DragDropList]
    end
    
    subgraph Public["Public Profile Page"]
        PublicHeader[PublicProfileHeader]
        StatsBar[ProfileStatsBar]
        FeaturedRow[FeaturedRecipesRow]
        CollectionGrid[CollectionGrid]
        RecipeGrid[PublicRecipeGrid]
        ImportButton[ImportRecipeButton]
    end
    
    subgraph Shared["Shared Components"]
        ShareModal[ShareModal]
        QRCode[QRCodeGenerator]
        OGPreview[OGImagePreview]
    end
```

### Screen Wireframe: Profile Settings

```
┌─────────────────────────────────────────────────────────────────────┐
│ Settings > Profile                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Public Profile                                    [═══════ ON ═══] │
│  Share your recipes with a public profile page                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ┌─────────┐  Username                                      │   │
│  │  │  [img]  │  ┌────────────────────────────────────────┐    │   │
│  │  │         │  │ chef-sarah                              │    │   │
│  │  │ Change  │  └────────────────────────────────────────┘    │   │
│  │  └─────────┘  miseenplace.app/u/chef-sarah                  │   │
│  │                                                             │   │
│  │  Display Name                                               │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │ Sarah's Kitchen                                        │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  Bio                                                        │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │ Home cook sharing my favorite YouTube recipe finds     │ │   │
│  │  │ and family classics. Always looking for new weeknight  │ │   │
│  │  │ dinner ideas!                                          │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │  0/500                                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Preview Profile]                              [Save Changes]      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Recipe Visibility                                                  │
│  Control which recipes appear on your public profile                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ☑ Chicken Tikka Masala               [Featured ★]  [Hide]   │   │
│  │ ☑ Pasta Carbonara                                  [Hide]   │   │
│  │ ☑ Thai Green Curry                   [Featured ★]  [Hide]   │   │
│  │ ☐ Grandma's Secret Soup (Hidden)                   [Show]   │   │
│  │ ☑ Quick Weeknight Stir Fry                         [Hide]   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Collections                                       [+ New Collection]│
│                                                                     │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐          │
│  │ Weeknight      │ │ Party          │ │ Family         │          │
│  │ Dinners        │ │ Favorites      │ │ Classics       │          │
│  │ 12 recipes     │ │ 8 recipes      │ │ 15 recipes     │          │
│  │ [Edit] [⋮]     │ │ [Edit] [⋮]     │ │ [Edit] [⋮]     │          │
│  └────────────────┘ └────────────────┘ └────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Screen Wireframe: Public Profile

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo]                                              [Sign In]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │   ┌─────────┐   Sarah's Kitchen                             │   │
│  │   │  [img]  │   @chef-sarah                                 │   │
│  │   │         │                                               │   │
│  │   └─────────┘   Home cook sharing my favorite YouTube       │   │
│  │                 recipe finds and family classics.           │   │
│  │                                                             │   │
│  │   45 recipes  •  128 saves  •  Member since Jan 2026        │   │
│  │                                                             │   │
│  │   [████ Share ████]   [Follow]                              │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Featured Recipes                                                   │
│  ─────────────────                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             │
│  │ ★ [thumb]     │ │ ★ [thumb]     │ │ ★ [thumb]     │             │
│  │               │ │               │ │               │             │
│  │ Chicken Tikka │ │ Thai Green    │ │ Perfect       │             │
│  │ Masala        │ │ Curry         │ │ Carbonara     │             │
│  │ ───────────── │ │ ───────────── │ │ ───────────── │             │
│  │ YouTube • 520 │ │ Blog • 420    │ │ YouTube • 680 │             │
│  │ kcal          │ │ kcal          │ │ kcal          │             │
│  │ 23 saves      │ │ 18 saves      │ │ 45 saves      │             │
│  └───────────────┘ └───────────────┘ └───────────────┘             │
│                                                                     │
│  Collections                                                        │
│  ───────────                                                        │
│  ┌────────────────────┐ ┌────────────────────┐                     │
│  │ 🍳 Weeknight       │ │ 🎉 Party           │                     │
│  │    Dinners         │ │    Favorites       │                     │
│  │    12 recipes      │ │    8 recipes       │                     │
│  └────────────────────┘ └────────────────────┘                     │
│                                                                     │
│  All Recipes                                           [Filter ▼]  │
│  ───────────                                                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│  │ [thumb]   │ │ [thumb]   │ │ [thumb]   │ │ [thumb]   │          │
│  │ Recipe 1  │ │ Recipe 2  │ │ Recipe 3  │ │ Recipe 4  │          │
│  │ [Save]    │ │ [Save]    │ │ [Save]    │ │ [Save]    │          │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Screen Wireframe: Share Modal

```
┌─────────────────────────────────────────────────────┐
│  Share Your Collection                          [×] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ https://miseenplace.app/u/chef-sarah     [📋] │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Share on:                                          │
│                                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 🐦  │ │ 📘  │ │ 📌  │ │ 📧  │ │ 💬  │          │
│  │     │ │     │ │     │ │     │ │     │          │
│  │ X   │ │ FB  │ │ Pin │ │Email│ │ SMS │          │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │
│                                                     │
│  ┌─────────────────┐                               │
│  │                 │                               │
│  │   [QR Code]     │  Scan to view on mobile      │
│  │                 │                               │
│  └─────────────────┘                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## UI Concepts

Three visual mockups showing the key screens for the recipe sharing feature, maintaining the editorial cookbook aesthetic.

### Concept 1: Public Profile Page

![Public Profile Page](/docs/recipe-sharing/sharing-concept-public-profile.png)

**Visual Direction**: Warm, inviting profile showcase with terracotta accents

**Key Elements**:
- Circular avatar with warm shadow
- Elegant serif typography for profile name
- Stats row showing recipe count and saves
- Featured recipes with star badges and save counts
- Source badges (YouTube/Blog) on each card

### Concept 2: Share Modal

![Share Modal](/docs/recipe-sharing/sharing-concept-share-modal.png)

**Visual Direction**: Clean, focused sharing dialog with frosted glass effect

**Key Elements**:
- Copy-to-clipboard URL field
- Social sharing buttons with brand colors
- QR code for mobile sharing
- Warm cream background with subtle grain

### Concept 3: Profile Settings

![Profile Settings](/docs/recipe-sharing/sharing-concept-settings.png)

**Visual Direction**: Organized settings page with clear visual hierarchy

**Key Elements**:
- Public profile toggle with terracotta accent
- Avatar upload with change button
- Recipe visibility controls with featured badges
- Collection cards with recipe counts
- Split layout: profile on left, visibility on right

---

## Frontend Design Specification

### Aesthetic Direction

**Tone**: Warm, inviting, community-focused—extending the editorial cookbook aesthetic to social profiles.

**Memorable Element**: The **profile header with terracotta accent band** creates instant visual recognition while maintaining the artisanal cookbook feel.

### Typography

| Usage | Font | Weight |
|-------|------|--------|
| Profile name | Playfair Display | 600 |
| Section headers | Playfair Display | 500 |
| Username | Source Sans 3 | 500 (monospace-style) |
| Bio text | Source Sans 3 | 400 |
| Stats | Source Sans 3 | 600 |

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--profile-header-bg` | `oklch(0.55 0.14 35 / 0.08)` | Profile header background |
| `--profile-accent` | `oklch(0.55 0.14 35)` | Terracotta accent |
| `--featured-badge` | `oklch(0.70 0.08 145)` | Sage featured star |
| `--save-count` | `oklch(0.55 0.14 35)` | Save count text |
| `--collection-card-bg` | `oklch(0.98 0.01 90)` | Collection card bg |

### Motion Design

| Element | Animation | Timing |
|---------|-----------|--------|
| Profile header | Fade up | 400ms ease-out |
| Featured recipes | Stagger fade in | 200ms stagger |
| Recipe grid | Grid reveal | 150ms stagger |
| Save button | Scale pulse | 200ms |
| Share modal | Slide up + fade | 300ms |
| QR code | Fade in with blur | 400ms |

### Visual Effects

**Profile Header**:
- Warm gradient overlay
- Avatar with warm shadow
- Grain texture at 2% opacity

**Recipe Cards**:
- Featured star: gold/sage gradient
- Save count badge
- Hover lift (4px) with shadow

**Share Modal**:
- Frosted glass background
- Social buttons with brand colors
- QR code with warm border

---

## API Endpoints

### tRPC Routes

| Endpoint | Type | Input | Output | Auth |
|----------|------|-------|--------|------|
| `profile.getMyProfile` | Query | - | `UserProfile \| null` | Required |
| `profile.createOrUpdate` | Mutation | `ProfileInput` | `UserProfile` | Required |
| `profile.checkUsername` | Query | `{ username }` | `{ available: boolean }` | Required |
| `profile.getPublicProfile` | Query | `{ username }` | `PublicProfileResponse` | Public |
| `profile.incrementViewCount` | Mutation | `{ username }` | - | Public |
| `collections.list` | Query | - | `RecipeCollection[]` | Required |
| `collections.create` | Mutation | `CollectionInput` | `RecipeCollection` | Required |
| `collections.update` | Mutation | `{ id, ...updates }` | `RecipeCollection` | Required |
| `collections.delete` | Mutation | `{ id }` | `{ success }` | Required |
| `collections.addRecipe` | Mutation | `{ collectionId, recipeId }` | - | Required |
| `collections.removeRecipe` | Mutation | `{ collectionId, recipeId }` | - | Required |
| `collections.reorder` | Mutation | `{ collectionId, recipeIds[] }` | - | Required |
| `recipes.setVisibility` | Mutation | `{ recipeId, isPublic }` | - | Required |
| `recipes.setBulkVisibility` | Mutation | `{ recipeIds[], isPublic }` | - | Required |
| `recipes.setFeatured` | Mutation | `{ recipeId, isFeatured }` | - | Required |
| `recipes.import` | Mutation | `{ recipeId }` | `{ newRecipeId }` | Required |
| `recipes.getPublicRecipe` | Query | `{ username, slug }` | `Recipe` | Public |

### Public Routes (No Auth)

| Route | Method | Purpose |
|-------|--------|---------|
| `/u/[username]` | GET | Public profile page (SSR) |
| `/u/[username]/[collection]` | GET | Collection page (SSR) |
| `/u/[username]/recipe/[slug]` | GET | Public recipe page (SSR) |

---

## Privacy & Security

### Visibility Model

```mermaid
flowchart TD
    subgraph Visibility["Content Visibility Layers"]
        Profile[Profile: Public/Private]
        Collection[Collection: Public/Private]
        Recipe[Recipe: Public/Private]
    end
    
    Profile -->|Public| C1{Collection Public?}
    C1 -->|Yes| R1{Recipe Public?}
    C1 -->|No| Hidden1[Collection Hidden]
    R1 -->|Yes| Visible[Recipe Visible]
    R1 -->|No| Hidden2[Recipe Hidden]
    
    Profile -->|Private| AllHidden[All Content Hidden]
```

### Privacy Controls

| Control | Default | User Can Change |
|---------|---------|-----------------|
| Profile visibility | Private | Yes |
| Recipe visibility | Private | Yes (per recipe) |
| Collection visibility | Matches profile | Yes |
| Import notifications | On | Yes |
| Analytics (view count) | On | No |

### Security Measures

1. **Username Validation**
   - Reserved words blocked (admin, api, etc.)
   - Rate-limited username changes
   - Case-insensitive uniqueness

2. **Content Moderation**
   - Admin can hide profiles
   - Report button on public profiles
   - Automated content flagging (future)

3. **Data Protection**
   - Imported recipes are copies (no link to original)
   - Original creator retains full control
   - No personal data exposed on public profiles

---

## Future Roadmap

### Phase 1: MVP (Current Scope)

- [x] User profile table and settings
- [ ] Public profile page (`/u/username`)
- [ ] Recipe visibility toggle
- [ ] Share modal with copy link
- [ ] Recipe import functionality
- [ ] Basic analytics (view count)

### Phase 2: Collections

- [ ] Create/edit collections
- [ ] Collection pages (`/u/username/collection`)
- [ ] Drag-and-drop reordering
- [ ] Collection cover images

### Phase 3: Social Features

- [ ] Follow system
- [ ] Activity feed
- [ ] Recipe comments
- [ ] Social login (Google, Apple)

### Phase 4: Discovery

- [ ] Public recipe search
- [ ] Trending recipes
- [ ] Category browsing
- [ ] Featured profiles

### Phase 5: Monetization

- [ ] Premium profiles (custom domains)
- [ ] Creator tools (analytics)
- [ ] Sponsored collections

---

## Implementation Checklist

```
Recipe Sharing Feature Progress:

DATABASE:
- [ ] Create user_profile table migration
- [ ] Create recipe_collection table migration
- [ ] Create collection_recipe table migration
- [ ] Create recipe_import table migration
- [ ] Add slug, is_public, save_count to recipe table

REPOSITORY:
- [ ] Create profile.ts repository
- [ ] Update recipe.ts with visibility methods
- [ ] Create collection.ts repository

TRPC:
- [ ] Create profile.ts routes
- [ ] Create collections.ts routes
- [ ] Update recipes.ts with public routes

PAGES:
- [ ] Profile settings page
- [ ] Public profile page (/u/[username])
- [ ] Public recipe page (/u/[username]/recipe/[slug])
- [ ] Collection page (/u/[username]/[collection])

COMPONENTS:
- [ ] ProfileSettingsForm
- [ ] UsernameInput with validation
- [ ] AvatarUpload
- [ ] RecipeVisibilityList
- [ ] CollectionManager
- [ ] PublicProfileHeader
- [ ] ShareModal
- [ ] ImportRecipeButton

SEO:
- [ ] Open Graph meta tags
- [ ] Dynamic OG images
- [ ] Sitemap for public profiles
- [ ] robots.txt updates

ANALYTICS:
- [ ] View count tracking
- [ ] Import tracking
- [ ] Share tracking (PostHog events)
```

---

*Architecture Document v1.0 - January 30, 2026*
