import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "..";
import * as recipeRepository from "@/repositories/recipe";
import { isYouTubeUrl, parseYouTubeUrl, getVideoMetadata } from "@/lib/youtube";
import { extractBlogContent, isBlogUrl } from "@/lib/content-extractor";
import { extractRecipe, extractRecipeFromYouTube, type ExtractedRecipe } from "@/lib/gemini";
import { TRPCError } from "@trpc/server";
import { loggers } from "@/lib/logger";

const log = loggers.trpc;

// Input schemas
const extractRecipeInput = z.object({
  url: z.string().url("Please enter a valid URL"),
});

const saveRecipeInput = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  sourceUrl: z.string().url(),
  sourceType: z.enum(["youtube", "blog"]),
  youtubeVideoId: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  servings: z.number().nullable(),
  prepTimeMinutes: z.number().nullable(),
  cookTimeMinutes: z.number().nullable(),
  calories: z.number().nullable(),
  protein: z.number().nullable(),
  carbs: z.number().nullable(),
  fat: z.number().nullable(),
  fiber: z.number().nullable(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string().nullish(),
      unit: z.string().nullish(),
      notes: z.string().nullish(),
    })
  ),
  steps: z.array(
    z.object({
      stepNumber: z.number(),
      instruction: z.string(),
      timestampSeconds: z.number().nullish(),
      durationSeconds: z.number().nullish(),
    })
  ),
});

const listRecipesInput = z.object({
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  sourceType: z.enum(["youtube", "blog"]).optional(),
});

const getRecipeInput = z.object({
  id: z.string().uuid("Invalid recipe ID"),
});

const deleteRecipeInput = z.object({
  id: z.string().uuid("Invalid recipe ID"),
});

// Response types for extraction
export interface ExtractedRecipeResponse {
  title: string;
  description: string | null;
  sourceUrl: string;
  sourceType: "youtube" | "blog";
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  ingredients: Array<{
    name: string;
    quantity: string | null;
    unit: string | null;
    notes: string | null;
  }>;
  steps: Array<{
    stepNumber: number;
    instruction: string;
    timestampSeconds: number | null;
    durationSeconds: number | null;
  }>;
}

export const recipesRouter = createTRPCRouter({
  /**
   * Extract recipe from URL (returns preview, not saved)
   */
  extract: protectedProcedure
    .input(extractRecipeInput)
    .mutation(async ({ input, ctx }): Promise<ExtractedRecipeResponse> => {
      const { url } = input;
      log.info({ url }, "Extracting recipe from URL");

      // Check Gemini client is configured
      if (!ctx.gemini) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Recipe extraction is not configured. Please set GEMINI_API_KEY.",
        });
      }

      let extractedRecipe: ExtractedRecipe;
      let sourceType: "youtube" | "blog";
      let youtubeVideoId: string | null = null;
      let thumbnailUrl: string | null = null;

      if (isYouTubeUrl(url)) {
        // YouTube extraction - pass URL directly to Gemini Pro for accurate timestamps
        sourceType = "youtube";
        youtubeVideoId = parseYouTubeUrl(url);
        log.debug({ url, videoId: youtubeVideoId }, "Detected YouTube URL, using Gemini Pro video processing");

        try {
          // Fetch metadata separately (for thumbnail)
          if (youtubeVideoId) {
            const metadata = await getVideoMetadata(youtubeVideoId);
            thumbnailUrl = metadata.thumbnailUrl;
          }

          // Use Gemini Pro to process the video directly for accurate timestamps
          extractedRecipe = await extractRecipeFromYouTube(ctx.gemini, url);
        } catch (error) {
          log.error({ error, url }, "Failed to extract from YouTube video");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to extract recipe from YouTube video",
          });
        }
      } else if (isBlogUrl(url)) {
        // Blog extraction
        sourceType = "blog";
        log.debug({ url }, "Detected blog URL");

        try {
          const blogContent = await extractBlogContent(url);
          thumbnailUrl = blogContent.thumbnailUrl;

          extractedRecipe = await extractRecipe(
            ctx.gemini,
            blogContent.content,
            "blog",
            { title: blogContent.title, thumbnailUrl: blogContent.thumbnailUrl || undefined }
          );
        } catch (error) {
          log.error({ error, url }, "Failed to extract from blog");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Failed to extract recipe from blog",
          });
        }
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid URL. Please provide a YouTube video URL or a blog/recipe site URL.",
        });
      }

      // Return the extracted recipe for preview
      return {
        title: extractedRecipe.title,
        description: extractedRecipe.description,
        sourceUrl: url,
        sourceType,
        youtubeVideoId,
        thumbnailUrl,
        servings: extractedRecipe.servings,
        prepTimeMinutes: extractedRecipe.prepTimeMinutes,
        cookTimeMinutes: extractedRecipe.cookTimeMinutes,
        calories: extractedRecipe.calories,
        protein: extractedRecipe.protein,
        carbs: extractedRecipe.carbs,
        fat: extractedRecipe.fat,
        fiber: extractedRecipe.fiber,
        ingredients: extractedRecipe.ingredients,
        steps: extractedRecipe.steps,
      };
    }),

  /**
   * Save extracted recipe to database
   */
  save: protectedProcedure
    .input(saveRecipeInput)
    .mutation(async ({ ctx, input }) => {
      log.info({ title: input.title, userId: ctx.auth.user.id }, "Saving recipe");

      const result = await recipeRepository.createRecipe(ctx.db, {
        userId: ctx.auth.user.id,
        ...input,
      });

      return result;
    }),

  /**
   * Get user's recipes (paginated)
   */
  list: protectedProcedure
    .input(listRecipesInput)
    .query(async ({ ctx, input }) => {
      return await recipeRepository.getRecipesByUser(ctx.db, {
        userId: ctx.auth.user.id,
        ...input,
      });
    }),

  /**
   * Get single recipe by ID
   */
  get: protectedProcedure
    .input(getRecipeInput)
    .query(async ({ ctx, input }) => {
      return await recipeRepository.getRecipeById(ctx.db, { id: input.id });
    }),

  /**
   * Delete a recipe
   */
  delete: protectedProcedure
    .input(deleteRecipeInput)
    .mutation(async ({ ctx, input }) => {
      log.info({ recipeId: input.id, userId: ctx.auth.user.id }, "Deleting recipe");

      return await recipeRepository.deleteRecipe(ctx.db, {
        id: input.id,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Get all recipes (admin only)
   */
  adminList: adminProcedure
    .input(listRecipesInput)
    .query(async ({ ctx, input }) => {
      return await recipeRepository.getAllRecipes(ctx.db, input);
    }),

  /**
   * Delete any recipe (admin only)
   */
  adminDelete: adminProcedure
    .input(deleteRecipeInput)
    .mutation(async ({ ctx, input }) => {
      log.info({ recipeId: input.id, adminId: ctx.auth.user.id }, "Admin deleting recipe");

      return await recipeRepository.deleteRecipeAsAdmin(ctx.db, { id: input.id });
    }),
});
