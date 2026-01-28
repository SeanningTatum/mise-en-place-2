# Recipe Extraction App: Information Architecture

A professional-grade application that transforms YouTube cooking videos and blog posts into structured, actionable recipes with nutritional data and precise timestamps.

---

## Table of Contents

1. [Overview](#overview)
2. [User Flow](#user-flow)
3. [System Architecture](#system-architecture)
4. [Data Model](#data-model)
5. [Feature Breakdown](#feature-breakdown)
6. [UI Components](#ui-components)
7. [Technical Stack](#technical-stack)
8. [Admin Features](#admin-features)
9. [Future Roadmap](#future-roadmap)

---

## Overview

### Vision

Recipe Extraction is a precision tool for home cooks who want to extract, organize, and track recipes from video content and food blogs. The application emphasizes accuracy, clarity, and professional-grade nutritional tracking with an ingredient database for future meal planning.

### Core Value Proposition

- **One Input**: Paste a YouTube URL or blog link
- **Three Outputs**: Macros, Steps, Timestamps
- **Future Value**: Ingredient index for meal planning

### Competitive Positioning

```mermaid
quadrantChart
    title Recipe App Positioning
    x-axis Simple --> Feature-Rich
    y-axis Manual Entry --> AI-Powered
    quadrant-1 Enterprise
    quadrant-2 Power Users
    quadrant-3 Basic
    quadrant-4 Sweet Spot
    Honeydew: [0.8, 0.75]
    Flavorish: [0.5, 0.8]
    Mealime: [0.6, 0.3]
    AnyList: [0.7, 0.2]
    RecipeExtraction: [0.4, 0.85]
```

---

## User Flow

### Primary Flow Diagram

```mermaid
flowchart TD
    subgraph INPUT["INPUT"]
        A[User Pastes URL]
    end

    subgraph DETECTION["DETECTION"]
        B[Validate URL Format]
        C{URL Type?}
    end

    subgraph YOUTUBE["YOUTUBE PROCESSING"]
        D[Extract Video ID]
        E[Fetch Transcript with Timestamps]
        F[Get Video Metadata via oEmbed]
    end

    subgraph BLOG["BLOG PROCESSING"]
        G[Fetch Page Content]
        H[Try JSON-LD Recipe Schema]
        I[Fallback to Readability]
    end

    subgraph AI["AI EXTRACTION"]
        J[Send to Gemini 3]
        K[Parse Structured JSON]
    end

    subgraph OUTPUT["OUTPUT"]
        L[Recipe Preview Card]
        M[Nutritional Dashboard]
        N[Interactive Timeline]
        O[Save to Database]
    end

    A --> B
    B -->|Valid| C
    B -->|Invalid| A
    C -->|YouTube| D
    C -->|Blog| G
    D --> E --> F --> J
    G --> H
    H -->|Found| J
    H -->|Not Found| I --> J
    J --> K
    K --> L & M & N
    L & M & N --> O
```

### Detailed State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Validating: Paste URL
    Validating --> Idle: Invalid URL
    Validating --> DetectingType: Valid URL
    
    DetectingType --> FetchingYouTube: YouTube URL
    DetectingType --> FetchingBlog: Blog URL
    
    FetchingYouTube --> Extracting: Transcript Ready
    FetchingYouTube --> Error: No Transcript
    
    FetchingBlog --> Extracting: Content Ready
    FetchingBlog --> Error: Fetch Failed
    
    Extracting --> Preview: Gemini Success
    Extracting --> Error: Gemini Failed
    
    Preview --> Editing: User Edits
    Editing --> Preview: Save Edits
    
    Preview --> Saving: Save Recipe
    Saving --> Complete: Success
    Saving --> Error: Save Failed
    
    Complete --> Idle: New Recipe
    Error --> Idle: Retry
    
    Complete --> [*]
```

### User Journey Map

```mermaid
journey
    title Extract Recipe from YouTube
    section Discovery
      Find cooking video on YouTube: 5: User
      Decide to save recipe: 4: User
    section Extraction
      Copy URL: 5: User
      Open app and paste: 5: User
      Wait for extraction: 3: User
      Review preview: 4: User
    section Saving
      Edit if needed: 4: User
      Save recipe: 5: User
    section Cooking
      Open saved recipe: 5: User
      Follow steps with video: 5: User
      Click timestamp to seek: 5: User
      Check macros: 4: User
```

---

## System Architecture

### High-Level Architecture

```mermaid
flowchart TB
    subgraph CLIENT["Client Application"]
        UI[React Router UI]
        STATE[tRPC React Query]
        CACHE[Browser Cache]
    end

    subgraph EDGE["Cloudflare Edge"]
        WORKER[Cloudflare Worker]
        TRPC[tRPC Router]
        AUTH[Better Auth]
    end

    subgraph SERVICES["Core Services"]
        YT[YouTube Service]
        CONTENT[Content Extractor]
        GEMINI[Gemini Service]
        RECIPE[Recipe Service]
    end

    subgraph DATA["Data Layer"]
        D1[(Cloudflare D1)]
        R2[R2 Storage]
    end

    subgraph EXTERNAL["External APIs"]
        YOUTUBE[YouTube Transcript API]
        GOOGLE[Gemini 3 API]
    end

    UI --> WORKER
    WORKER --> AUTH
    AUTH --> TRPC
    TRPC --> YT & CONTENT & GEMINI & RECIPE

    YT --> YOUTUBE
    GEMINI --> GOOGLE

    RECIPE --> D1
    YT --> R2
```

### Processing Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant T as tRPC Router
    participant Y as YouTube Service
    participant G as Gemini Service
    participant D as Database

    U->>C: Paste YouTube URL
    C->>T: recipes.extract(url)
    T->>Y: parseYouTubeUrl(url)
    Y-->>T: videoId
    T->>Y: getTranscript(videoId)
    Y-->>T: Timestamped Transcript
    T->>Y: getVideoMetadata(videoId)
    Y-->>T: Title, Thumbnail, Duration
    
    T->>G: extractRecipe(transcript, metadata)
    G->>G: Parse with Gemini 3
    G-->>T: Structured Recipe JSON
    
    T-->>C: Recipe Preview
    C-->>U: Display Preview Card
    
    U->>C: Save Recipe
    C->>T: recipes.save(recipeData)
    T->>D: Insert Recipe + Steps + Ingredients
    D-->>T: Recipe ID
    T-->>C: Success
    C-->>U: Redirect to Recipe Detail
```

---

## Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ RECIPE : creates
    RECIPE ||--|{ RECIPE_STEP : has
    RECIPE ||--|{ RECIPE_INGREDIENT : contains
    RECIPE_INGREDIENT }o--|| INGREDIENT : references
    
    USER {
        text id PK
        text email
        text name
        text role
        timestamp created_at
    }

    RECIPE {
        text id PK
        text created_by_id FK
        text title
        text description
        text source_url
        text source_type "youtube|blog"
        text youtube_video_id
        text thumbnail_url
        int servings
        int prep_time_minutes
        int cook_time_minutes
        int calories
        real protein
        real carbs
        real fat
        real fiber
        timestamp created_at
        timestamp updated_at
    }

    RECIPE_STEP {
        text id PK
        text recipe_id FK
        int step_number
        text instruction
        int timestamp_seconds
        int duration_seconds
    }

    INGREDIENT {
        text id PK
        text name "normalized"
        text category
        timestamp created_at
    }

    RECIPE_INGREDIENT {
        text id PK
        text recipe_id FK
        text ingredient_id FK
        real quantity
        text unit
        text notes
    }
```

### TypeScript Data Structures

```typescript
interface Recipe {
  id: string;
  createdById: string;
  
  // Source
  title: string;
  description: string | null;
  sourceUrl: string;
  sourceType: 'youtube' | 'blog';
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  
  // Timing
  servings: number;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  
  // Macros (per serving)
  calories: number | null;
  protein: number | null;  // grams
  carbs: number | null;    // grams
  fat: number | null;      // grams
  fiber: number | null;    // grams
  
  // Relations
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  instruction: string;
  timestampSeconds: number | null;  // for YouTube
  durationSeconds: number | null;
}

interface Ingredient {
  id: string;
  name: string;           // normalized (e.g., "chicken breast")
  category: string | null; // e.g., "protein", "vegetable"
  createdAt: Date;
}

interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number | null;  // e.g., 2
  unit: string | null;      // e.g., "cups", "lbs"
  notes: string | null;     // e.g., "diced"
  
  // Joined
  ingredient: Ingredient;
}
```

---

## Feature Breakdown

### 1. URL Input and Validation

```mermaid
flowchart LR
    A[URL Input] --> B{Valid Format?}
    B -->|Yes| C{URL Type?}
    B -->|No| D[Show Error]
    C -->|YouTube| E[Extract Video ID]
    C -->|Blog| F[Validate Domain]
    E --> G{Video Accessible?}
    F --> H{Page Fetchable?}
    G -->|Yes| I[Proceed to Extract]
    G -->|No| J[Video Unavailable]
    H -->|Yes| I
    H -->|No| K[Page Not Found]
```

**Validation Rules:**
- YouTube: Supports youtube.com/watch, youtu.be, youtube.com/embed
- Blog: Any valid HTTP/HTTPS URL
- Video must have captions/transcript available
- Blog must be publicly accessible

### 2. Macro Extraction

```mermaid
pie showData
    title Example Macro Distribution
    "Protein" : 35
    "Carbohydrates" : 45
    "Fat" : 20
```

**Nutrition Features:**
- AI-estimated macros per serving
- Total recipe nutrition (servings × per serving)
- Visual macro breakdown
- Calorie and fiber tracking

### 3. Step-by-Step Instructions with Timestamps

| Component | Description |
|-----------|-------------|
| Step Number | Sequential ordering (1, 2, 3...) |
| Instruction | Clear, actionable cooking instruction |
| Timestamp | Click to seek YouTube video |
| Visual Indicator | Highlight active step during playback |

### 4. Interactive Video Timeline

```mermaid
gantt
    title Recipe Timeline Example (25-min Recipe)
    dateFormat mm:ss
    axisFormat %M:%S
    
    section Prep
    Gather ingredients    :prep1, 00:00, 2m
    Chop vegetables       :prep2, after prep1, 3m
    
    section Cooking
    Heat oil in pan       :cook1, after prep2, 1m
    Sear chicken          :cook2, after cook1, 5m
    Add aromatics         :cook3, after cook2, 2m
    Add sauce             :cook4, after cook3, 3m
    Simmer                :cook5, after cook4, 6m
    
    section Finish
    Plate and garnish     :fin1, after cook5, 2m
    Final adjustments     :fin2, after fin1, 1m
```

---

## UI Components

### Component Hierarchy

```mermaid
flowchart TB
    subgraph APP["Application Shell"]
        NAV[Header Navigation]
        MAIN[Main Content]
    end

    subgraph RECIPES_LIST["Recipe List Page /recipes"]
        FILTER[Filter Tabs - All/YouTube/Blog]
        SEARCH[Search Input]
        GRID[Recipe Card Grid]
        CARD[Recipe Card]
        EMPTY[Empty State]
    end

    subgraph EXTRACT_PAGE["Extract Page /recipes/new"]
        URL_INPUT[URL Input Field]
        EXTRACT_BTN[Extract Button]
        LOADING[Loading Spinner]
        PREVIEW[Recipe Preview]
    end

    subgraph PREVIEW
        HEADER[Recipe Header]
        MACROS[Macros Card]
        INGREDIENTS[Ingredients List]
        STEPS[Steps List]
        SAVE_BTN[Save Button]
    end

    subgraph DETAIL_PAGE["Detail Page /recipes/id"]
        VIDEO[YouTube Player]
        DETAIL_HEADER[Recipe Header]
        DETAIL_MACROS[Macros Card]
        DETAIL_INGREDIENTS[Checkable Ingredients]
        DETAIL_STEPS[Clickable Steps with Timestamps]
    end

    subgraph ADMIN["Admin Pages"]
        ADMIN_RECIPES[Recipes DataTable]
        ADMIN_INGREDIENTS[Ingredients Index]
    end
```

### Screen Wireframes

#### Extract New Recipe (/recipes/new)

```
┌─────────────────────────────────────────────────────────────┐
│ Logo                              My Recipes    [User Menu] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Extract a Recipe                                     │  │
│  │                                                       │  │
│  │  Paste a YouTube video or blog URL                    │  │
│  │  ┌─────────────────────────────────────┐ ┌─────────┐  │  │
│  │  │ https://youtube.com/watch?v=...     │ │ Extract │  │  │
│  │  └─────────────────────────────────────┘ └─────────┘  │  │
│  │                                                       │  │
│  │  Supports: YouTube, food blogs, recipe sites          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [After extraction - Preview Card]                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ┌─────────┐  Chicken Tikka Masala              [Edit] │  │
│  │ │ thumb   │  Source: Joshua Weissman (YouTube)        │  │
│  │ │         │  Servings: 4 | Prep: 20min | Cook: 30min  │  │
│  │ └─────────┘                                           │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Macros per serving                                    │  │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │  │
│  │ │ 520    │ │ 35g    │ │ 28g    │ │ 32g    │          │  │
│  │ │ kcal   │ │protein │ │ carbs  │ │ fat    │          │  │
│  │ └────────┘ └────────┘ └────────┘ └────────┘          │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Ingredients (12)                                      │  │
│  │ • 2 lbs chicken thighs, boneless                      │  │
│  │ • 1 cup yogurt                                        │  │
│  │ • 2 tbsp garam masala                                 │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Steps (8)                                             │  │
│  │ 1. [0:45] Marinate chicken in yogurt and spices      │  │
│  │ 2. [3:20] Heat oil in a large pan                    │  │
│  │ 3. [5:15] Add onions and cook until golden           │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                              [Cancel]  [Save Recipe]  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Recipe Detail (/recipes/:id)

```
┌─────────────────────────────────────────────────────────────┐
│ Logo                              My Recipes    [User Menu] │
├─────────────────────────────────────────────────────────────┤
│ ← Back to Recipes                                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │        [YouTube Video Embed - 16:9 aspect ratio]        │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Chicken Tikka Masala                            [⋮ Menu]    │
│ Source: Joshua Weissman • Saved Jan 25, 2026                │
│                                                             │
│ ┌──────────────────────┐  ┌──────────────────────────────┐  │
│ │ Macros per serving   │  │ Ingredients                  │  │
│ │ ────────────────     │  │ ☐ 2 lbs chicken thighs      │  │
│ │ 520 kcal             │  │ ☐ 1 cup yogurt              │  │
│ │ 35g protein          │  │ ☐ 2 tbsp garam masala       │  │
│ │ 28g carbs            │  │ ☐ 1 can tomato sauce        │  │
│ │ 32g fat              │  │ ☐ 1 cup heavy cream         │  │
│ │                      │  │                              │  │
│ │ Servings: 4          │  │                              │  │
│ └──────────────────────┘  └──────────────────────────────┘  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Steps                                                   │ │
│ │                                                         │ │
│ │ 1. [▶ 0:45] Marinate chicken in yogurt and spices      │ │
│ │    for at least 30 minutes, preferably overnight.       │ │
│ │                                                         │ │
│ │ 2. [▶ 3:20] Heat oil in a large pan over medium-high   │ │
│ │    heat. Sear marinated chicken until golden.           │ │
│ │                                                         │ │
│ │ 3. [▶ 5:15] Add onions and cook until translucent,     │ │
│ │    about 5 minutes. Add garlic and ginger.              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### My Recipes (/recipes)

```
┌─────────────────────────────────────────────────────────────┐
│ Logo                              My Recipes    [User Menu] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ My Recipes                              [+ Extract Recipe]  │
│                                                             │
│ ┌─────────┐ ┌─────────────────────────────────────────────┐ │
│ │ All     │ │ Search recipes...                           │ │
│ │ YouTube │ └─────────────────────────────────────────────┘ │
│ │ Blogs   │                                                 │
│ └─────────┘                                                 │
│                                                             │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │
│ │ [thumbnail]   │ │ [thumbnail]   │ │ [thumbnail]   │      │
│ │               │ │               │ │               │      │
│ │ Chicken Tikka │ │ Pasta Carb... │ │ Thai Green... │      │
│ │ Masala        │ │               │ │               │      │
│ │ ───────────── │ │ ───────────── │ │ ───────────── │      │
│ │ 520 kcal      │ │ 680 kcal      │ │ 420 kcal      │      │
│ │ 35g protein   │ │ 22g protein   │ │ 28g protein   │      │
│ │ YouTube       │ │ Blog          │ │ YouTube       │      │
│ └───────────────┘ └───────────────┘ └───────────────┘      │
│                                                             │
│ ┌───────────────┐ ┌───────────────┐                        │
│ │ [thumbnail]   │ │      +        │                        │
│ │               │ │               │                        │
│ │ Beef Bulgogi  │ │  Add New      │                        │
│ │               │ │  Recipe       │                        │
│ │ ───────────── │ │               │                        │
│ │ 450 kcal      │ │               │                        │
│ │ 42g protein   │ │               │                        │
│ └───────────────┘ └───────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Design System

| Element | Specification |
|---------|--------------|
| **Primary Color** | CSS variable `--primary` |
| **Background** | CSS variable `--background` |
| **Card Surface** | CSS variable `--card` |
| **Text Primary** | CSS variable `--foreground` |
| **Text Muted** | CSS variable `--muted-foreground` |
| **Border** | CSS variable `--border` |
| **Success** | `text-green-500` |
| **Error** | `text-destructive` |
| **Font Family** | System font stack (Inter) |
| **Border Radius** | `rounded-lg` (cards), `rounded-md` (inputs) |

---

## Technical Stack

### Stack Overview

```mermaid
mindmap
    root((Recipe Extraction))
        Frontend
            React Router v7
            React 19
            TailwindCSS v4
            shadcn/ui
            react-youtube
        Backend
            Cloudflare Workers
            tRPC
            Better Auth
        AI
            Gemini 3 API
        Database
            Cloudflare D1
            Drizzle ORM
        Content Extraction
            youtube-transcript
            cheerio
            Readability
        Infrastructure
            Cloudflare
            Wrangler
```

### API Endpoints (tRPC)

| Route | Type | Description |
|-------|------|-------------|
| `recipes.extract` | Mutation | Extract recipe from URL (returns preview) |
| `recipes.save` | Mutation | Save extracted recipe to database |
| `recipes.list` | Query | Get user's recipes (paginated) |
| `recipes.get` | Query | Get single recipe with all relations |
| `recipes.delete` | Mutation | Delete a recipe |
| `ingredients.list` | Query | Get all ingredients with usage count (admin) |
| `ingredients.merge` | Mutation | Merge duplicate ingredients (admin) |

### Dependencies

```bash
# Core extraction
bun add youtube-transcript cheerio @mozilla/readability linkedom

# AI
bun add @google/generative-ai

# Video player
bun add react-youtube
```

### Environment Variables

```bash
GEMINI_API_KEY=your_gemini_api_key
```

---

## Admin Features

### Recipes Management

Admin can view all recipes across all users:
- Filter by source type (YouTube/Blog)
- Filter by date range
- View recipe details
- Delete inappropriate recipes

### Ingredient Index

The ingredient database enables future meal planning:

```mermaid
flowchart LR
    subgraph Current["Phase 1: Current"]
        A[User Extracts Recipe]
        B[Ingredients Normalized]
        C[Stored in Database]
    end
    
    subgraph Future["Phase 2+: Future"]
        D[Ingredient Index]
        E[User Has Ingredients]
        F[Generate Meal Plans]
        G[Create Grocery Lists]
    end
    
    A --> B --> C --> D
    D --> E --> F --> G
```

**Admin Capabilities:**
- Browse all ingredients
- See usage count per ingredient
- Merge duplicate ingredients (e.g., "chicken breast" and "chicken breasts")
- Assign categories to ingredients

---

## Future Roadmap

### Phase 1 (Current)
- Recipe extraction from YouTube and blogs
- Step-by-step with timestamps
- Macros per serving
- Ingredient database building

### Phase 2: Meal Planning
- Weekly meal calendar
- Drag-and-drop recipes
- Nutritional goals tracking

### Phase 3: Grocery Lists
- Auto-generate from meal plan
- Combine ingredients across recipes
- Check off while shopping

### Phase 4: Pantry Management
- Track ingredients on hand
- "What can I make?" suggestions
- Expiration tracking

### Phase 5: Integrations
- Instacart integration
- Amazon Fresh integration
- Apple Reminders sync

---

## Summary

Recipe Extraction transforms the chaos of cooking videos and food blogs into structured, professional-grade recipe documentation. The clean interface puts focus on the content while Gemini 3 handles the complexity of parsing content into actionable data.

### Key Differentiators

1. **Precision Timestamps** - Click to jump directly to any step in the video
2. **AI-Estimated Macros** - Nutritional analysis without manual entry
3. **Dual Source Support** - YouTube videos AND blog posts
4. **Ingredient Database** - Building toward intelligent meal planning
5. **Modern Stack** - Cloudflare edge, React Router, shadcn/ui

---

*Architecture Document v1.0 - January 2026*
