import { sql, count, eq, gte, lte, and, isNotNull, desc } from "drizzle-orm";
import type { Context } from "@/trpc";
import { user, recipe, ingredient } from "@/db/schema";

type Database = Context["db"];

export interface DateRangeInput {
  startDate: Date;
  endDate: Date;
}

/**
 * Get user growth data grouped by day
 */
export async function getUserGrowth(db: Database, input: DateRangeInput) {
  try {
    return await db
      .select({
        date: sql<string>`date(${user.createdAt} / 1000, 'unixepoch')`,
        count: count(),
      })
      .from(user)
      .where(
        and(
          gte(user.createdAt, input.startDate),
          lte(user.createdAt, input.endDate)
        )
      )
      .groupBy(sql`date(${user.createdAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${user.createdAt} / 1000, 'unixepoch')`);
  } catch (error) {
    console.error("Failed to get user growth:", error);
    return [];
  }
}

/**
 * Get summary statistics for users
 */
export async function getUserStats(db: Database) {
  try {
    const [totalResult] = await db.select({ count: count() }).from(user);
    const [verifiedResult] = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.emailVerified, true));
    const [bannedResult] = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.banned, true));
    const [adminResult] = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, "admin"));

    const totalUsers = totalResult?.count ?? 0;
    const verifiedUsers = verifiedResult?.count ?? 0;
    const bannedUsers = bannedResult?.count ?? 0;
    const adminUsers = adminResult?.count ?? 0;

    const verificationRate =
      totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

    return {
      totalUsers,
      verifiedUsers,
      bannedUsers,
      adminUsers,
      verificationRate,
    };
  } catch (error) {
    console.error("Failed to get user stats:", error);
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      bannedUsers: 0,
      adminUsers: 0,
      verificationRate: 0,
    };
  }
}

/**
 * Get user distribution by role
 */
export async function getRoleDistribution(db: Database) {
  try {
    const results = await db
      .select({
        name: user.role,
        value: count(),
      })
      .from(user)
      .groupBy(user.role);

    // Capitalize role names for display
    return results.map((r) => ({
      name: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      value: r.value,
    }));
  } catch (error) {
    console.error("Failed to get role distribution:", error);
    return [];
  }
}

/**
 * Get user distribution by verification status
 */
export async function getVerificationDistribution(db: Database) {
  try {
    const [verifiedResult] = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.emailVerified, true));
    const [unverifiedResult] = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.emailVerified, false));

    return [
      { name: "Verified", value: verifiedResult?.count ?? 0 },
      { name: "Unverified", value: unverifiedResult?.count ?? 0 },
    ];
  } catch (error) {
    console.error("Failed to get verification distribution:", error);
    return [];
  }
}

/**
 * Get recent signups count for a given period
 */
export async function getRecentSignupsCount(
  db: Database,
  input: { days: number }
) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - input.days);

    const [result] = await db
      .select({ count: count() })
      .from(user)
      .where(gte(user.createdAt, startDate));

    return result?.count ?? 0;
  } catch (error) {
    console.error("Failed to get recent signups:", error);
    return 0;
  }
}

/**
 * Get recipe growth data grouped by day
 */
export async function getRecipeGrowth(db: Database, input: DateRangeInput) {
  try {
    return await db
      .select({
        date: sql<string>`date(${recipe.createdAt} / 1000, 'unixepoch')`,
        count: count(),
      })
      .from(recipe)
      .where(
        and(
          gte(recipe.createdAt, input.startDate),
          lte(recipe.createdAt, input.endDate)
        )
      )
      .groupBy(sql`date(${recipe.createdAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${recipe.createdAt} / 1000, 'unixepoch')`);
  } catch (error) {
    console.error("Failed to get recipe growth:", error);
    return [];
  }
}

/**
 * Get summary statistics for recipes
 */
export async function getRecipeStats(db: Database) {
  try {
    const [totalResult] = await db.select({ count: count() }).from(recipe);
    const [youtubeResult] = await db
      .select({ count: count() })
      .from(recipe)
      .where(eq(recipe.sourceType, "youtube"));
    const [blogResult] = await db
      .select({ count: count() })
      .from(recipe)
      .where(eq(recipe.sourceType, "blog"));

    // Get average macros (only from recipes that have them)
    const [avgCaloriesResult] = await db
      .select({
        avg: sql<number>`avg(${recipe.calories})`,
      })
      .from(recipe)
      .where(isNotNull(recipe.calories));
    const [avgProteinResult] = await db
      .select({
        avg: sql<number>`avg(${recipe.protein})`,
      })
      .from(recipe)
      .where(isNotNull(recipe.protein));
    const [avgCarbsResult] = await db
      .select({
        avg: sql<number>`avg(${recipe.carbs})`,
      })
      .from(recipe)
      .where(isNotNull(recipe.carbs));
    const [avgFatResult] = await db
      .select({
        avg: sql<number>`avg(${recipe.fat})`,
      })
      .from(recipe)
      .where(isNotNull(recipe.fat));

    const totalRecipes = totalResult?.count ?? 0;
    const youtubeRecipes = youtubeResult?.count ?? 0;
    const blogRecipes = blogResult?.count ?? 0;

    return {
      totalRecipes,
      youtubeRecipes,
      blogRecipes,
      avgCalories: avgCaloriesResult?.avg ? Math.round(avgCaloriesResult.avg) : null,
      avgProtein: avgProteinResult?.avg ? Math.round(avgProteinResult.avg) : null,
      avgCarbs: avgCarbsResult?.avg ? Math.round(avgCarbsResult.avg) : null,
      avgFat: avgFatResult?.avg ? Math.round(avgFatResult.avg) : null,
    };
  } catch (error) {
    console.error("Failed to get recipe stats:", error);
    return {
      totalRecipes: 0,
      youtubeRecipes: 0,
      blogRecipes: 0,
      avgCalories: null,
      avgProtein: null,
      avgCarbs: null,
      avgFat: null,
    };
  }
}

/**
 * Get recipe distribution by source type
 */
export async function getSourceTypeDistribution(db: Database) {
  try {
    const results = await db
      .select({
        name: recipe.sourceType,
        value: count(),
      })
      .from(recipe)
      .groupBy(recipe.sourceType);

    // Capitalize source type names for display
    return results.map((r) => ({
      name: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      value: r.value,
    }));
  } catch (error) {
    console.error("Failed to get source type distribution:", error);
    return [];
  }
}

/**
 * Get top users by recipe count
 */
export async function getTopRecipeCreators(db: Database, input: { limit: number }) {
  try {
    const results = await db
      .select({
        userId: recipe.createdById,
        recipeCount: count(),
        userName: user.name,
      })
      .from(recipe)
      .innerJoin(user, eq(recipe.createdById, user.id))
      .groupBy(recipe.createdById, user.name)
      .orderBy(desc(count()))
      .limit(input.limit);

    return results.map((r) => ({
      userId: r.userId,
      userName: r.userName,
      recipeCount: r.recipeCount,
    }));
  } catch (error) {
    console.error("Failed to get top recipe creators:", error);
    return [];
  }
}

/**
 * Get ingredient growth data grouped by day
 */
export async function getIngredientGrowth(db: Database, input: DateRangeInput) {
  try {
    return await db
      .select({
        date: sql<string>`date(${ingredient.createdAt} / 1000, 'unixepoch')`,
        count: count(),
      })
      .from(ingredient)
      .where(
        and(
          gte(ingredient.createdAt, input.startDate),
          lte(ingredient.createdAt, input.endDate)
        )
      )
      .groupBy(sql`date(${ingredient.createdAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${ingredient.createdAt} / 1000, 'unixepoch')`);
  } catch (error) {
    console.error("Failed to get ingredient growth:", error);
    return [];
  }
}

/**
 * Get ingredient distribution by category
 */
export async function getIngredientCategoryDistribution(db: Database) {
  try {
    const results = await db
      .select({
        name: ingredient.category,
        value: count(),
      })
      .from(ingredient)
      .where(isNotNull(ingredient.category))
      .groupBy(ingredient.category);

    return results.map((r) => ({
      name: r.name ?? "Uncategorized",
      value: r.value,
    }));
  } catch (error) {
    console.error("Failed to get ingredient category distribution:", error);
    return [];
  }
}
