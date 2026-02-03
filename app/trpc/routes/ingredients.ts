import { z } from "zod/v4";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "..";
import * as ingredientRepository from "@/repositories/ingredient";
import { findSimilarIngredients } from "@/lib/gemini";
import { loggers } from "@/lib/logger";

const log = loggers.trpc;

// Input schemas
const listIngredientsInput = z.object({
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
});

const mergeIngredientsInput = z.object({
  sourceId: z.string().uuid("Invalid source ingredient ID"),
  targetId: z.string().uuid("Invalid target ingredient ID"),
});

const updateIngredientInput = z.object({
  id: z.string().uuid("Invalid ingredient ID"),
  name: z.string().min(1).optional(),
  category: z.string().nullable().optional(),
});

const searchIngredientsInput = z.object({
  query: z.string().min(2, "Query must be at least 2 characters"),
  limit: z.number().int().min(1).max(20).default(10),
});

const suggestSimilarInput = z.object({
  name: z.string().min(2, "Ingredient name must be at least 2 characters"),
});

export const ingredientsRouter = createTRPCRouter({
  /**
   * Get all ingredients with usage count (admin only)
   */
  list: adminProcedure
    .input(listIngredientsInput)
    .query(async ({ ctx, input }) => {
      return await ingredientRepository.getAllIngredients(ctx.db, input);
    }),

  /**
   * Merge two ingredients (admin only)
   * Moves all recipe references from source to target, then deletes source
   */
  merge: adminProcedure
    .input(mergeIngredientsInput)
    .mutation(async ({ ctx, input }) => {
      log.info(
        { sourceId: input.sourceId, targetId: input.targetId, adminId: ctx.auth.user.id },
        "Merging ingredients"
      );

      return await ingredientRepository.mergeIngredients(ctx.db, input);
    }),

  /**
   * Update an ingredient (admin only)
   */
  update: adminProcedure
    .input(updateIngredientInput)
    .mutation(async ({ ctx, input }) => {
      log.info({ ingredientId: input.id, adminId: ctx.auth.user.id }, "Updating ingredient");

      return await ingredientRepository.updateIngredient(ctx.db, input);
    }),

  /**
   * Get all unique categories (admin only)
   */
  categories: adminProcedure.query(async ({ ctx }) => {
    return await ingredientRepository.getIngredientCategories(ctx.db);
  }),

  // ============== User Routes (protected) ==============

  /**
   * Search ingredients by name (for autocomplete)
   */
  search: protectedProcedure
    .input(searchIngredientsInput)
    .query(async ({ ctx, input }) => {
      return await ingredientRepository.searchIngredients(ctx.db, input);
    }),

  /**
   * Suggest similar existing ingredients using AI
   * First checks alias table, then uses AI if no alias match
   */
  suggestSimilar: protectedProcedure
    .input(suggestSimilarInput)
    .query(async ({ ctx, input }) => {
      const normalizedName = input.name.toLowerCase().trim();

      // 1. First do a direct search to find exact or close matches
      const directMatches = await ingredientRepository.searchIngredients(ctx.db, {
        query: normalizedName,
        limit: 5,
      });

      // If we find exact or very close matches, return those
      const exactMatch = directMatches.find(
        (ing) => ing.name === normalizedName
      );
      if (exactMatch) {
        return {
          matches: [{ name: exactMatch.name, confidence: 1.0, id: exactMatch.id }],
          source: "exact" as const,
        };
      }

      // 2. If Gemini is available, use AI for similarity matching
      if (ctx.gemini) {
        const allIngredients = await ingredientRepository.getAllIngredientNames(ctx.db);
        
        if (allIngredients.length > 0) {
          const aiMatches = await findSimilarIngredients(
            ctx.gemini,
            normalizedName,
            allIngredients
          );

          if (aiMatches.length > 0) {
            // Map AI matches back to ingredient IDs
            const matchedIngredients = await Promise.all(
              aiMatches.slice(0, 5).map(async (match) => {
                const ing = directMatches.find((i) => i.name === match.name) ||
                  (await ingredientRepository.searchIngredients(ctx.db, {
                    query: match.name,
                    limit: 1,
                  }))[0];
                return ing
                  ? { name: ing.name, confidence: match.confidence, id: ing.id }
                  : null;
              })
            );

            return {
              matches: matchedIngredients.filter((m): m is NonNullable<typeof m> => m !== null),
              source: "ai" as const,
            };
          }
        }
      }

      // 3. Return direct search results as fallback
      return {
        matches: directMatches.slice(0, 5).map((ing) => ({
          name: ing.name,
          confidence: 0.5,
          id: ing.id,
        })),
        source: "search" as const,
      };
    }),
});
