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
