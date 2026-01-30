import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "..";
import * as mealPlanRepository from "@/repositories/meal-plan";

// Input schemas
const getOrCreateForWeekInput = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date format (YYYY-MM-DD)"),
});

const addEntryInput = z.object({
  mealPlanId: z.string().uuid("Invalid meal plan ID"),
  recipeId: z.string().uuid("Invalid recipe ID"),
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snacks"]),
});

const removeEntryInput = z.object({
  entryId: z.string().uuid("Invalid entry ID"),
});

const getGroceryListInput = z.object({
  mealPlanId: z.string().uuid("Invalid meal plan ID"),
});

const getRecipesForPickerInput = z.object({
  search: z.string().optional(),
});

export const mealPlanRouter = createTRPCRouter({
  /**
   * Get or create a meal plan for a specific week
   */
  getOrCreateForWeek: protectedProcedure
    .input(getOrCreateForWeekInput)
    .query(async ({ ctx, input }) => {
      return await mealPlanRepository.getOrCreateMealPlan(ctx.db, {
        userId: ctx.auth.user.id,
        weekStartDate: input.weekStartDate,
      });
    }),

  /**
   * Add a recipe to a meal slot
   */
  addEntry: protectedProcedure
    .input(addEntryInput)
    .mutation(async ({ ctx, input }) => {
      return await mealPlanRepository.addEntry(ctx.db, input);
    }),

  /**
   * Remove an entry from a meal slot
   */
  removeEntry: protectedProcedure
    .input(removeEntryInput)
    .mutation(async ({ ctx, input }) => {
      return await mealPlanRepository.removeEntry(ctx.db, {
        entryId: input.entryId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Get aggregated grocery list for a meal plan
   */
  getGroceryList: protectedProcedure
    .input(getGroceryListInput)
    .query(async ({ ctx, input }) => {
      return await mealPlanRepository.getGroceryList(ctx.db, {
        mealPlanId: input.mealPlanId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Get user's recipes for the picker
   */
  getRecipesForPicker: protectedProcedure
    .input(getRecipesForPickerInput)
    .query(async ({ ctx, input }) => {
      return await mealPlanRepository.getUserRecipesForPicker(ctx.db, {
        userId: ctx.auth.user.id,
        search: input.search,
      });
    }),
});
