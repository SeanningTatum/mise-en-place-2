import { z } from "zod/v4";
import { createTRPCRouter, adminProcedure } from "..";
import * as ingredientRepository from "@/repositories/ingredient";
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
});
