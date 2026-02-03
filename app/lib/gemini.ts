import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { createLayerLogger } from "./logger";

const log = createLayerLogger("server");

/**
 * Gemini client type for dependency injection
 */
export type GeminiClient = GoogleGenAI;

/**
 * Extracted recipe data structure from Gemini
 */
export interface ExtractedRecipe {
  title: string;
  description: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  ingredients: ExtractedIngredient[];
  steps: ExtractedStep[];
}

export interface ExtractedIngredient {
  name: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
}

export interface ExtractedStep {
  stepNumber: number;
  instruction: string;
  timestampSeconds: number | null;
  durationSeconds: number | null;
}

/**
 * JSON Schema for Gemini structured output
 */
const recipeJsonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Recipe title" },
    description: { type: Type.STRING, description: "Brief description of the recipe", nullable: true },
    servings: { type: Type.INTEGER, description: "Number of servings", nullable: true },
    prepTimeMinutes: { type: Type.INTEGER, description: "Preparation time in minutes", nullable: true },
    cookTimeMinutes: { type: Type.INTEGER, description: "Cooking time in minutes", nullable: true },
    calories: { type: Type.INTEGER, description: "Estimated calories per serving", nullable: true },
    protein: { type: Type.INTEGER, description: "Estimated grams of protein per serving", nullable: true },
    carbs: { type: Type.INTEGER, description: "Estimated grams of carbohydrates per serving", nullable: true },
    fat: { type: Type.INTEGER, description: "Estimated grams of fat per serving", nullable: true },
    fiber: { type: Type.INTEGER, description: "Estimated grams of fiber per serving", nullable: true },
    ingredients: {
      type: Type.ARRAY,
      description: "List of ingredients",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Normalized ingredient name (e.g., 'chicken breasts' not '2 lbs boneless skinless chicken breasts')" },
          quantity: { type: Type.STRING, description: "Amount (e.g., '2', '1/2')", nullable: true },
          unit: { type: Type.STRING, description: "Measurement unit (e.g., 'cups', 'lbs', 'tbsp')", nullable: true },
          notes: { type: Type.STRING, description: "Preparation notes (e.g., 'diced', 'room temperature')", nullable: true },
        },
        required: ["name"],
      },
    },
    steps: {
      type: Type.ARRAY,
      description: "List of cooking steps with accurate video timestamps",
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER, description: "1-indexed step number" },
          instruction: { type: Type.STRING, description: "Clear cooking instruction" },
          timestampSeconds: { type: Type.INTEGER, description: "Exact video timestamp in seconds when this step begins (YouTube only)", nullable: true },
          durationSeconds: { type: Type.INTEGER, description: "Duration of this step in seconds until the next step begins", nullable: true },
        },
        required: ["stepNumber", "instruction"],
      },
    },
  },
  required: ["title", "ingredients", "steps"],
};

const RECIPE_EXTRACTION_PROMPT = `You are a recipe extraction expert. Extract a structured recipe from the following content.

IMPORTANT INSTRUCTIONS:
1. Extract ALL ingredients mentioned, normalizing names (e.g., "chicken breasts" not "2 lbs boneless skinless chicken breasts")
2. For YouTube videos, extract timestamps for each step (in seconds from start of video)
3. Estimate macros per serving based on standard nutritional data
4. If information is not available, use null
5. Steps should be clear, actionable instructions`;

const YOUTUBE_VIDEO_EXTRACTION_PROMPT = `You are a recipe extraction expert. Watch this cooking video carefully and extract a complete structured recipe.

CRITICAL INSTRUCTIONS FOR TIMESTAMPS:
1. For EACH cooking step, note the EXACT timestamp (in MM:SS format) when that step is shown in the video
2. Convert timestamps to total seconds for the output (e.g., 03:45 = 225 seconds)
3. Watch the entire video and identify when each cooking action begins
4. Calculate the duration of each step (seconds until the next step begins)
5. Timestamps must be accurate so users can jump to specific parts of the video

RECIPE EXTRACTION REQUIREMENTS:
1. Extract the recipe title from the video
2. List ALL ingredients mentioned with quantities, units, and preparation notes
3. Normalize ingredient names (e.g., "chicken breasts" not "2 lbs boneless skinless chicken breasts")
4. Break down the cooking process into clear, actionable steps in chronological order
5. Each step should have the accurate timestamp for when it's demonstrated
6. Estimate nutritional information (calories, protein, carbs, fat, fiber) per serving based on the ingredients
7. Note the number of servings the recipe makes
8. Estimate prep time and cook time in minutes

If any information is not available or mentioned in the video, use null for that field.`;

/**
 * Default model for blog/text extraction (faster, cheaper)
 */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Model for YouTube video processing - Gemini 3 Pro for best video understanding
 */
export const VIDEO_GEMINI_MODEL = "gemini-3-pro-preview";

/**
 * Create a Gemini client instance
 */
export function createGeminiClient(apiKey: string): GeminiClient {
  return new GoogleGenAI({ apiKey });
}

/**
 * Extract recipe data from a YouTube video URL using Gemini's native video processing
 * This method passes the YouTube URL directly to Gemini 3 Pro for accurate timestamp extraction
 * Following Gemini best practices: video first, then text prompt
 * See: https://ai.google.dev/gemini-api/docs/video-understanding
 */
export async function extractRecipeFromYouTube(
  client: GeminiClient,
  youtubeUrl: string,
  metadata?: { title?: string; thumbnailUrl?: string }
): Promise<ExtractedRecipe> {
  const startTime = Date.now();
  log.info({ youtubeUrl, model: VIDEO_GEMINI_MODEL }, "Starting YouTube video recipe extraction with Gemini 3 Pro");

  try {
    // Best practice: Place video first, then text prompt (per Gemini docs)
    const response = await client.models.generateContent({
      model: VIDEO_GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            // Video part first
            {
              fileData: {
                fileUri: youtubeUrl,
              },
            },
            // Text prompt after video
            {
              text: YOUTUBE_VIDEO_EXTRACTION_PROMPT,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeJsonSchema,
      },
    });

    const text = response.text ?? "";
    log.debug({ responseLength: text.length }, "Received Gemini structured response from video");

    // Parse the structured JSON response
    const extracted = JSON.parse(text) as ExtractedRecipe;

    // Normalize null values for optional fields
    const normalizedRecipe: ExtractedRecipe = {
      title: extracted.title,
      description: extracted.description ?? null,
      servings: extracted.servings ?? null,
      prepTimeMinutes: extracted.prepTimeMinutes ?? null,
      cookTimeMinutes: extracted.cookTimeMinutes ?? null,
      calories: extracted.calories ?? null,
      protein: extracted.protein ?? null,
      carbs: extracted.carbs ?? null,
      fat: extracted.fat ?? null,
      fiber: extracted.fiber ?? null,
      ingredients: (extracted.ingredients || []).map((ing) => ({
        name: ing.name,
        quantity: ing.quantity ?? null,
        unit: ing.unit ?? null,
        notes: ing.notes ?? null,
      })),
      steps: (extracted.steps || []).map((step) => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction,
        timestampSeconds: step.timestampSeconds ?? null,
        durationSeconds: step.durationSeconds ?? null,
      })),
    };

    const durationMs = Date.now() - startTime;
    log.info(
      {
        durationMs,
        model: VIDEO_GEMINI_MODEL,
        title: normalizedRecipe.title,
        ingredientCount: normalizedRecipe.ingredients.length,
        stepCount: normalizedRecipe.steps.length,
        stepsWithTimestamps: normalizedRecipe.steps.filter(s => s.timestampSeconds !== null).length,
      },
      "YouTube video recipe extraction complete"
    );

    return normalizedRecipe;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log.error({ error, durationMs, youtubeUrl }, "Failed to extract recipe from YouTube video with Gemini");
    throw new Error(
      `Failed to extract recipe from YouTube video: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Extract recipe data from text content using Gemini structured output
 * Used for blog/recipe site extraction
 */
export async function extractRecipe(
  client: GeminiClient,
  content: string,
  sourceType: "youtube" | "blog",
  metadata?: { title?: string; thumbnailUrl?: string }
): Promise<ExtractedRecipe> {
  const startTime = Date.now();
  log.info({ sourceType, contentLength: content.length }, "Starting recipe extraction with Gemini");

  const contextInfo =
    sourceType === "youtube"
      ? "This is a YouTube video transcript with timestamps. Extract video timestamps for each step."
      : "This is content from a food blog. Focus on extracting the recipe from any surrounding text.";

  const prompt = `${RECIPE_EXTRACTION_PROMPT}

SOURCE TYPE: ${sourceType}
${contextInfo}
${metadata?.title ? `VIDEO/PAGE TITLE: ${metadata.title}` : ""}

CONTENT TO EXTRACT FROM:
${content}`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeJsonSchema,
      },
    });

    const text = response.text ?? "";
    log.debug({ responseLength: text.length }, "Received Gemini structured response");

    // Parse the structured JSON response
    const extracted = JSON.parse(text) as ExtractedRecipe;

    const durationMs = Date.now() - startTime;
    log.info(
      {
        durationMs,
        title: extracted.title,
        ingredientCount: extracted.ingredients.length,
        stepCount: extracted.steps.length,
      },
      "Recipe extraction complete"
    );

    return extracted;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log.error({ error, durationMs, sourceType }, "Failed to extract recipe with Gemini");
    throw new Error(
      `Failed to extract recipe: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Nutritional macros structure
 */
export interface GeneratedMacros {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
}

/**
 * JSON Schema for macro generation
 */
const macrosJsonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    calories: { type: Type.INTEGER, description: "Estimated calories per serving", nullable: true },
    protein: { type: Type.INTEGER, description: "Estimated grams of protein per serving", nullable: true },
    carbs: { type: Type.INTEGER, description: "Estimated grams of carbohydrates per serving", nullable: true },
    fat: { type: Type.INTEGER, description: "Estimated grams of fat per serving", nullable: true },
    fiber: { type: Type.INTEGER, description: "Estimated grams of fiber per serving", nullable: true },
  },
  required: ["calories", "protein", "carbs", "fat", "fiber"],
};

const MACRO_GENERATION_PROMPT = `You are a nutritional analyst. Based on the recipe ingredients and servings provided, estimate the nutritional information PER SERVING.

Use standard nutritional databases (USDA, etc.) as your reference. Be reasonably accurate - these estimates help users track their daily nutrition.

Guidelines:
1. Calculate total nutritional content from all ingredients
2. Divide by number of servings to get per-serving values
3. Round to whole numbers
4. If you cannot reasonably estimate a value, return null for that field
5. Consider cooking methods (e.g., fat absorbed during frying)`;

/**
 * Generate nutritional macros for a recipe based on its ingredients
 */
export async function generateMacros(
  client: GeminiClient,
  recipe: {
    title: string;
    servings: number;
    ingredients: Array<{
      name: string;
      quantity?: string | null;
      unit?: string | null;
    }>;
  }
): Promise<GeneratedMacros> {
  const startTime = Date.now();
  log.info({ title: recipe.title, ingredientCount: recipe.ingredients.length }, "Starting macro generation");

  // Format ingredients for the prompt
  const ingredientList = recipe.ingredients
    .map((ing) => {
      const parts = [];
      if (ing.quantity) parts.push(ing.quantity);
      if (ing.unit) parts.push(ing.unit);
      parts.push(ing.name);
      return `- ${parts.join(" ")}`;
    })
    .join("\n");

  const prompt = `${MACRO_GENERATION_PROMPT}

RECIPE: ${recipe.title}
SERVINGS: ${recipe.servings}

INGREDIENTS:
${ingredientList}

Estimate the nutritional content PER SERVING.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: macrosJsonSchema,
      },
    });

    const text = response.text ?? "";
    log.debug({ responseLength: text.length }, "Received Gemini macro response");

    const macros = JSON.parse(text) as GeneratedMacros;

    const durationMs = Date.now() - startTime;
    log.info(
      {
        durationMs,
        title: recipe.title,
        calories: macros.calories,
        protein: macros.protein,
      },
      "Macro generation complete"
    );

    return {
      calories: macros.calories ?? null,
      protein: macros.protein ?? null,
      carbs: macros.carbs ?? null,
      fat: macros.fat ?? null,
      fiber: macros.fiber ?? null,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log.error({ error, durationMs, title: recipe.title }, "Failed to generate macros");
    // Return nulls on failure - don't fail the whole recipe creation
    return {
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      fiber: null,
    };
  }
}

// ============================================
// Multi-Course Meal Planning AI Functions
// ============================================

/**
 * Menu suggestion structure
 */
export interface MenuSuggestion {
  courseType: string;
  suggestedRecipeId?: string;
  suggestion: string;
  reasoning: string;
}

/**
 * Timeline item structure
 */
export interface TimelineItem {
  id: string;
  time: string;
  task: string;
  recipeId?: string;
  recipeName?: string;
  durationMinutes: number;
  category: "prep" | "cook" | "rest" | "serve";
}

/**
 * JSON Schema for menu suggestions
 */
const menuSuggestionsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      description: "List of menu suggestions and improvements",
      items: {
        type: Type.OBJECT,
        properties: {
          courseType: {
            type: Type.STRING,
            description: "The course type this suggestion is for (appetizer, soup_salad, main, side, dessert, drink)",
          },
          suggestedRecipeId: {
            type: Type.STRING,
            description: "ID of suggested recipe from user's library (if applicable)",
            nullable: true,
          },
          suggestion: {
            type: Type.STRING,
            description: "The suggestion or recommendation",
          },
          reasoning: {
            type: Type.STRING,
            description: "Why this suggestion improves the menu",
          },
        },
        required: ["courseType", "suggestion", "reasoning"],
      },
    },
  },
  required: ["suggestions"],
};

const MENU_SUGGESTIONS_PROMPT = `You are a professional chef helping plan a multi-course dinner party menu.

Analyze the current menu and provide suggestions to improve it. Consider:
1. Flavor progression - courses should build from light to rich
2. Cooking method variety - avoid multiple fried or multiple roasted dishes
3. Temperature variety - mix hot and cold courses
4. Color and presentation - visual appeal across courses
5. Dietary balance - protein, vegetables, starch distribution
6. Course gaps - suggest missing course types if the menu is incomplete

When suggesting recipes, ONLY suggest recipes from the user's library (provided IDs and titles).
If no suitable recipe exists in their library, suggest what type of dish would work well.

Provide 2-4 actionable suggestions to improve the menu.`;

/**
 * Generate menu suggestions for a multi-course meal
 */
export async function generateMenuSuggestions(
  client: GeminiClient,
  input: {
    courses: Array<{
      courseType: string;
      recipeName: string;
      recipeId: string;
    }>;
    guestCount: number;
    serviceStyle: string;
    userRecipes: Array<{ id: string; title: string }>;
    dietaryRestrictions?: string[];
    preferredCuisine?: string;
  }
): Promise<MenuSuggestion[]> {
  const startTime = Date.now();
  log.info(
    { courseCount: input.courses.length, guestCount: input.guestCount },
    "Starting menu suggestions generation"
  );

  const currentMenu = input.courses.length > 0
    ? input.courses
        .map((c) => `- ${c.courseType}: ${c.recipeName}`)
        .join("\n")
    : "No courses added yet";

  const userRecipeList = input.userRecipes
    .map((r) => `- ${r.title} (ID: ${r.id})`)
    .join("\n");

  const prompt = `${MENU_SUGGESTIONS_PROMPT}

CURRENT MENU (${input.guestCount} guests, ${input.serviceStyle} service):
${currentMenu}

${input.dietaryRestrictions?.length ? `DIETARY RESTRICTIONS: ${input.dietaryRestrictions.join(", ")}` : ""}
${input.preferredCuisine ? `PREFERRED CUISINE: ${input.preferredCuisine}` : ""}

USER'S RECIPE LIBRARY:
${userRecipeList}

Analyze this menu and provide suggestions. If suggesting a recipe from the user's library, include its ID.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: menuSuggestionsSchema,
      },
    });

    const text = response.text ?? "";
    const result = JSON.parse(text) as { suggestions: MenuSuggestion[] };

    const durationMs = Date.now() - startTime;
    log.info(
      {
        durationMs,
        suggestionCount: result.suggestions.length,
      },
      "Menu suggestions generation complete"
    );

    return result.suggestions;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log.error({ error, durationMs }, "Failed to generate menu suggestions");
    throw new Error(
      `Failed to generate menu suggestions: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * JSON Schema for cooking timeline
 */
const cookingTimelineSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    timeline: {
      type: Type.ARRAY,
      description: "Ordered list of tasks with times",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "Unique identifier for this task",
          },
          time: {
            type: Type.STRING,
            description: "Time in HH:MM format (24-hour) or relative like '-2:30' for 2.5 hours before serving",
          },
          task: {
            type: Type.STRING,
            description: "Description of what to do",
          },
          recipeId: {
            type: Type.STRING,
            description: "ID of the recipe this task is for",
            nullable: true,
          },
          recipeName: {
            type: Type.STRING,
            description: "Name of the recipe this task is for",
            nullable: true,
          },
          durationMinutes: {
            type: Type.INTEGER,
            description: "How long this task takes in minutes",
          },
          category: {
            type: Type.STRING,
            description: "Task category: prep, cook, rest, or serve",
          },
        },
        required: ["id", "time", "task", "durationMinutes", "category"],
      },
    },
  },
  required: ["timeline"],
};

const COOKING_TIMELINE_PROMPT = `You are a professional chef creating a detailed cooking timeline for a dinner party.

Work BACKWARD from the serving time to create a schedule that ensures:
1. Every dish is ready when needed
2. Tasks can be done in parallel when using different equipment
3. Rest times for meats are accounted for
4. Last-minute preparations are minimized during service
5. Buffer time is included for unexpected delays

For each task, specify:
- The exact time to start (use 24-hour format like "14:00" or "18:30")
- What specifically to do
- How long it takes
- Whether it's prep, cook, rest, or serve

Consider:
- Oven capacity and temperature changes
- Stovetop burner availability
- Which tasks can be done hours or days ahead
- Which tasks must be done right before serving

Order the timeline chronologically from earliest task to latest.`;

/**
 * Generate a cooking timeline for a multi-course meal
 */
export async function generateCookingTimeline(
  client: GeminiClient,
  input: {
    mealName: string;
    guestCount: number;
    servingTime: string;
    serviceStyle: string;
    courses: Array<{
      courseType: string;
      courseOrder: number;
      recipe: {
        id: string;
        title: string;
        servings: number | null;
        prepTimeMinutes: number | null;
        cookTimeMinutes: number | null;
        steps: Array<{ stepNumber: number; instruction: string }>;
      };
    }>;
  }
): Promise<TimelineItem[]> {
  const startTime = Date.now();
  log.info(
    {
      mealName: input.mealName,
      courseCount: input.courses.length,
      servingTime: input.servingTime,
    },
    "Starting cooking timeline generation"
  );

  // Format serving time for display
  const servingDate = new Date(input.servingTime);
  const servingTimeStr = servingDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Build course details
  const courseDetails = input.courses
    .map((c) => {
      const stepsList = c.recipe.steps
        .map((s) => `  ${s.stepNumber}. ${s.instruction}`)
        .join("\n");

      return `
## ${c.courseType.toUpperCase()}: ${c.recipe.title}
- Recipe ID: ${c.recipe.id}
- Original servings: ${c.recipe.servings || "unknown"}
- Scaling to: ${input.guestCount} guests
- Prep time: ${c.recipe.prepTimeMinutes || "unknown"} minutes
- Cook time: ${c.recipe.cookTimeMinutes || "unknown"} minutes
- Steps:
${stepsList}`;
    })
    .join("\n");

  const prompt = `${COOKING_TIMELINE_PROMPT}

MEAL: ${input.mealName}
GUESTS: ${input.guestCount}
SERVING TIME: ${servingTimeStr}
SERVICE STYLE: ${input.serviceStyle}

${input.serviceStyle === "plated" ? "For plated service, stagger courses with 15-20 minutes between each." : ""}
${input.serviceStyle === "family" ? "For family style, all dishes should be ready around the same time." : ""}
${input.serviceStyle === "buffet" ? "For buffet, dishes can be ready in batches and held at serving temperature." : ""}

COURSES TO PREPARE:
${courseDetails}

Create a detailed cooking timeline working backward from ${servingTimeStr}. Include all prep, cooking, resting, and serving tasks.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cookingTimelineSchema,
      },
    });

    const text = response.text ?? "";
    const result = JSON.parse(text) as { timeline: TimelineItem[] };

    const durationMs = Date.now() - startTime;
    log.info(
      {
        durationMs,
        taskCount: result.timeline.length,
      },
      "Cooking timeline generation complete"
    );

    return result.timeline;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log.error({ error, durationMs }, "Failed to generate cooking timeline");
    throw new Error(
      `Failed to generate cooking timeline: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Similar ingredients structure for AI matching
 */
export interface SimilarIngredient {
  name: string;
  confidence: number; // 0-1 confidence score
}

/**
 * JSON Schema for ingredient similarity
 */
const similarIngredientsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    matches: {
      type: Type.ARRAY,
      description: "List of similar ingredients from the existing list",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Exact name from the existing ingredients list" },
          confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" },
        },
        required: ["name", "confidence"],
      },
    },
  },
  required: ["matches"],
};

const SIMILAR_INGREDIENTS_PROMPT = `You are an ingredient matching expert. Given a new ingredient name and a list of existing ingredients, find any that refer to the same or very similar ingredient.

MATCHING RULES:
1. Match ingredients that are essentially the same (e.g., "chicken breast" and "boneless chicken breast")
2. Match singular/plural forms (e.g., "onion" and "onions")
3. Match common abbreviations (e.g., "evoo" and "extra virgin olive oil")
4. Do NOT match different ingredients (e.g., "chicken breast" is NOT "chicken thigh")
5. Do NOT match ingredients that would require substitution (e.g., "butter" is NOT "margarine")
6. Return empty array if no good matches exist
7. Confidence should be 0.9+ for near-exact matches, 0.7-0.9 for close variants

Return matches sorted by confidence (highest first).`;

/**
 * Find similar ingredients from an existing list using AI
 */
export async function findSimilarIngredients(
  client: GeminiClient,
  ingredientName: string,
  existingIngredients: string[]
): Promise<SimilarIngredient[]> {
  const startTime = Date.now();
  log.info({ ingredientName, existingCount: existingIngredients.length }, "Starting ingredient similarity search");

  if (existingIngredients.length === 0) {
    return [];
  }

  const prompt = `${SIMILAR_INGREDIENTS_PROMPT}

NEW INGREDIENT: ${ingredientName}

EXISTING INGREDIENTS:
${existingIngredients.map((name) => `- ${name}`).join("\n")}

Find any matches for "${ingredientName}" from the existing list.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: similarIngredientsSchema,
      },
    });

    const text = response.text ?? "";
    const result = JSON.parse(text) as { matches: SimilarIngredient[] };

    const durationMs = Date.now() - startTime;
    log.info(
      {
        durationMs,
        ingredientName,
        matchCount: result.matches.length,
      },
      "Ingredient similarity search complete"
    );

    // Filter to only return matches with reasonable confidence
    return result.matches
      .filter((m) => m.confidence >= 0.7)
      .sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log.error({ error, durationMs, ingredientName }, "Failed to find similar ingredients");
    return [];
  }
}
