import Anthropic from "@anthropic-ai/sdk";
import { createLayerLogger } from "./logger";
import type { ExtractedRecipe, ExtractedIngredient, ExtractedStep } from "./gemini";
import type { TranscriptSegment } from "./youtube";

const log = createLayerLogger("server");

/**
 * Claude client type for dependency injection
 */
export type ClaudeClient = Anthropic;

/**
 * Current model for recipe extraction - Claude Sonnet 4.5
 */
export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";

/**
 * Create a Claude client instance
 */
export function createClaudeClient(apiKey: string): ClaudeClient {
  return new Anthropic({ apiKey });
}

/**
 * Tool schema for extracting recipes with structured output
 */
const recipeExtractionTool = {
  name: "extract_recipe",
  description: "Extract a structured recipe from video transcript content",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Recipe title" },
      description: { type: "string", description: "Brief description of the recipe" },
      servings: { type: "number", description: "Number of servings" },
      prepTimeMinutes: { type: "number", description: "Preparation time in minutes" },
      cookTimeMinutes: { type: "number", description: "Cooking time in minutes" },
      calories: { type: "number", description: "Estimated calories per serving" },
      protein: { type: "number", description: "Estimated grams of protein per serving" },
      carbs: { type: "number", description: "Estimated grams of carbohydrates per serving" },
      fat: { type: "number", description: "Estimated grams of fat per serving" },
      fiber: { type: "number", description: "Estimated grams of fiber per serving" },
      ingredients: {
        type: "array",
        description: "List of ingredients",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Normalized ingredient name (e.g., 'chicken breasts' not '2 lbs boneless skinless chicken breasts')" },
            quantity: { type: "string", description: "Amount (e.g., '2', '1/2')" },
            unit: { type: "string", description: "Measurement unit (e.g., 'cups', 'lbs', 'tbsp')" },
            notes: { type: "string", description: "Preparation notes (e.g., 'diced', 'room temperature')" },
          },
          required: ["name"],
        },
      },
      steps: {
        type: "array",
        description: "List of cooking steps with timestamps from the video",
        items: {
          type: "object",
          properties: {
            stepNumber: { type: "number", description: "1-indexed step number" },
            instruction: { type: "string", description: "Clear cooking instruction" },
            timestampSeconds: { type: "number", description: "Video timestamp in seconds when this step is discussed" },
            durationSeconds: { type: "number", description: "Estimated duration of this step in seconds" },
          },
          required: ["stepNumber", "instruction"],
        },
      },
    },
    required: ["title", "ingredients", "steps"],
  },
};

const YOUTUBE_RECIPE_EXTRACTION_PROMPT = `You are a recipe extraction expert. Analyze this YouTube video transcript and extract a complete structured recipe.

CRITICAL INSTRUCTIONS FOR TIMESTAMPS:
1. The transcript includes timestamps in [MM:SS] format at the start of each line
2. For EACH cooking step, identify the EXACT timestamp from the transcript where that step is discussed
3. Convert timestamps to total seconds (e.g., [3:45] = 225 seconds)
4. Group related transcript segments into logical cooking steps
5. Timestamps MUST match the actual transcript - do not make up timestamps

RECIPE EXTRACTION REQUIREMENTS:
1. Extract the recipe title from the video content
2. List ALL ingredients mentioned with quantities, units, and preparation notes
3. Normalize ingredient names (e.g., "chicken breasts" not "2 lbs boneless skinless chicken breasts")
4. Break down the cooking process into clear, actionable steps
5. Each step should reference the timestamp where it's demonstrated/discussed in the video
6. Estimate nutritional information (calories, protein, carbs, fat, fiber) per serving
7. Note the number of servings the recipe makes
8. Estimate prep time and cook time in minutes

For fields where information is not available in the transcript, omit them (don't include null).`;

/**
 * Format transcript segments for Claude processing
 * Includes timestamps for accurate step mapping
 */
function formatTranscriptForClaude(segments: TranscriptSegment[]): string {
  return segments
    .map((segment) => {
      const totalSeconds = Math.floor(segment.offset / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const timestamp = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      return `[${timestamp}] ${segment.text}`;
    })
    .join("\n");
}

/**
 * Extract recipe from YouTube transcript using Claude
 * Uses the transcript with timestamps for accurate step-to-timestamp mapping
 */
export async function extractRecipeFromTranscript(
  client: ClaudeClient,
  transcriptSegments: TranscriptSegment[],
  metadata: { title: string; author?: string }
): Promise<ExtractedRecipe> {
  const startTime = Date.now();
  log.info({ model: CLAUDE_MODEL, segmentCount: transcriptSegments.length }, "Starting YouTube recipe extraction with Claude");

  const formattedTranscript = formatTranscriptForClaude(transcriptSegments);

  const prompt = `${YOUTUBE_RECIPE_EXTRACTION_PROMPT}

VIDEO TITLE: ${metadata.title}
${metadata.author ? `CHANNEL: ${metadata.author}` : ""}

TRANSCRIPT WITH TIMESTAMPS:
${formattedTranscript}

Extract the recipe using the extract_recipe tool. Make sure timestamps match the transcript.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      tools: [recipeExtractionTool],
      tool_choice: { type: "tool", name: "extract_recipe" },
      messages: [{ role: "user", content: prompt }],
    });

    // Extract tool use result
    const toolUse = response.content.find((block) => block.type === "tool_use");
    
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return a tool use response");
    }

    const extracted = toolUse.input as ExtractedRecipe;

    // Ensure null values for missing optional fields (Claude may omit them)
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
      ingredients: (extracted.ingredients || []).map((ing: ExtractedIngredient) => ({
        name: ing.name,
        quantity: ing.quantity ?? null,
        unit: ing.unit ?? null,
        notes: ing.notes ?? null,
      })),
      steps: (extracted.steps || []).map((step: ExtractedStep) => ({
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
        model: CLAUDE_MODEL,
        title: normalizedRecipe.title,
        ingredientCount: normalizedRecipe.ingredients.length,
        stepCount: normalizedRecipe.steps.length,
        stepsWithTimestamps: normalizedRecipe.steps.filter(s => s.timestampSeconds !== null).length,
      },
      "Claude recipe extraction complete"
    );

    return normalizedRecipe;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    log.error({ error, durationMs }, "Failed to extract recipe with Claude");
    throw new Error(
      `Failed to extract recipe: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
