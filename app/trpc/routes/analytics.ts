import { z } from "zod/v4";
import { adminProcedure, createTRPCRouter } from "..";
import * as analyticsRepository from "@/repositories/analytics";

export const analyticsRouter = createTRPCRouter({
  getUserGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getUserGrowth(ctx.db, input),
    ),

  getUserStats: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getUserStats(ctx.db),
  ),

  getRoleDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getRoleDistribution(ctx.db),
  ),

  getVerificationDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getVerificationDistribution(ctx.db),
  ),

  getRecentSignupsCount: adminProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(365).default(7),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getRecentSignupsCount(ctx.db, input),
    ),

  // Recipe analytics
  getRecipeGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getRecipeGrowth(ctx.db, input),
    ),

  getRecipeStats: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getRecipeStats(ctx.db),
  ),

  getSourceTypeDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getSourceTypeDistribution(ctx.db),
  ),

  getTopRecipeCreators: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getTopRecipeCreators(ctx.db, input),
    ),

  // Ingredient analytics
  getIngredientGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getIngredientGrowth(ctx.db, input),
    ),

  getIngredientCategoryDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getIngredientCategoryDistribution(ctx.db),
  ),

  // Meal plan analytics
  getMealPlanGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getMealPlanGrowth(ctx.db, input),
    ),

  getMealPlanStats: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getMealPlanStats(ctx.db),
  ),

  getMealTypeDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getMealTypeDistribution(ctx.db),
  ),

  getDayOfWeekDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getDayOfWeekDistribution(ctx.db),
  ),

  getMostPlannedRecipes: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getMostPlannedRecipes(ctx.db, input),
    ),

  // Profile sharing analytics
  getProfileGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getProfileGrowth(ctx.db, input),
    ),

  getProfileSharingStats: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getProfileSharingStats(ctx.db),
  ),

  getProfileVisibilityDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getProfileVisibilityDistribution(ctx.db),
  ),

  getRecipeImportGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getRecipeImportGrowth(ctx.db, input),
    ),

  getTopProfilesByViews: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(5),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getTopProfilesByViews(ctx.db, input),
    ),

  getMostSavedRecipes: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(5),
      }),
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getMostSavedRecipes(ctx.db, input),
    ),
});
