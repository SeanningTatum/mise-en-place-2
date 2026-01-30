import { z } from "zod/v4";
import { adminProcedure, createTRPCRouter } from "..";
import * as analyticsRepository from "@/repositories/analytics";

export const analyticsRouter = createTRPCRouter({
  getUserGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getUserGrowth(ctx.db, input)
    ),

  getUserStats: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getUserStats(ctx.db)
  ),

  getRoleDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getRoleDistribution(ctx.db)
  ),

  getVerificationDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getVerificationDistribution(ctx.db)
  ),

  getRecentSignupsCount: adminProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(365).default(7),
      })
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getRecentSignupsCount(ctx.db, input)
    ),

  // Recipe analytics
  getRecipeGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getRecipeGrowth(ctx.db, input)
    ),

  getRecipeStats: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getRecipeStats(ctx.db)
  ),

  getSourceTypeDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getSourceTypeDistribution(ctx.db)
  ),

  getTopRecipeCreators: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getTopRecipeCreators(ctx.db, input)
    ),

  // Ingredient analytics
  getIngredientGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getIngredientGrowth(ctx.db, input)
    ),

  getIngredientCategoryDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getIngredientCategoryDistribution(ctx.db)
  ),

  // Meal plan analytics
  getMealPlanGrowth: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getMealPlanGrowth(ctx.db, input)
    ),

  getMealPlanStats: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getMealPlanStats(ctx.db)
  ),

  getMealTypeDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getMealTypeDistribution(ctx.db)
  ),

  getDayOfWeekDistribution: adminProcedure.query(({ ctx }) =>
    analyticsRepository.getDayOfWeekDistribution(ctx.db)
  ),

  getMostPlannedRecipes: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(({ ctx, input }) =>
      analyticsRepository.getMostPlannedRecipes(ctx.db, input)
    ),
});
