import { eq, and, inArray } from "drizzle-orm";
import {
  mealPlan,
  mealPlanEntry,
  recipe,
  recipeIngredient,
  ingredient,
} from "@/db/schema";
import {
  NotFoundError,
  CreationError,
  DeletionError,
  QueryError,
} from "@/models/errors";
import type { Context } from "@/trpc";
import { generateId } from "@/lib/utils";

type Database = Context["db"];

// Input interfaces
interface GetOrCreateMealPlanInput {
  userId: string;
  weekStartDate: string; // ISO date string (Monday)
}

interface AddEntryInput {
  mealPlanId: string;
  recipeId: string;
  dayOfWeek: number; // 0=Monday, 6=Sunday
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
}

interface RemoveEntryInput {
  entryId: string;
  userId: string;
}

interface GetMealPlanInput {
  mealPlanId: string;
  userId: string;
}

interface GetGroceryListInput {
  mealPlanId: string;
  userId: string;
}

// Result types
export interface MealPlanWithEntries {
  id: string;
  userId: string;
  weekStartDate: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  entries: Array<{
    id: string;
    dayOfWeek: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snacks";
    recipe: {
      id: string;
      title: string;
      thumbnailUrl: string | null;
      sourceType: "youtube" | "blog";
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      fiber: number | null;
      prepTimeMinutes: number | null;
      cookTimeMinutes: number | null;
    };
  }>;
}

export interface GroceryListItem {
  ingredientId: string;
  ingredientName: string;
  category: string | null;
  quantities: Array<{
    quantity: string | null;
    unit: string | null;
    notes: string | null;
    recipeTitle: string;
  }>;
}

export interface GroceryList {
  items: GroceryListItem[];
  totalIngredients: number;
  recipeCount: number;
}

/**
 * Get or create a meal plan for a specific week
 */
export async function getOrCreateMealPlan(
  db: Database,
  input: GetOrCreateMealPlanInput
): Promise<MealPlanWithEntries> {
  try {
    // Check for existing plan
    const existingPlans = await db
      .select()
      .from(mealPlan)
      .where(
        and(
          eq(mealPlan.userId, input.userId),
          eq(mealPlan.weekStartDate, input.weekStartDate)
        )
      )
      .limit(1);

    let plan = existingPlans[0];

    // Create if doesn't exist
    if (!plan) {
      const newPlanId = generateId();
      await db.insert(mealPlan).values({
        id: newPlanId,
        userId: input.userId,
        weekStartDate: input.weekStartDate,
      });

      plan = {
        id: newPlanId,
        userId: input.userId,
        weekStartDate: input.weekStartDate,
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Get entries with recipe data
    const entries = await db
      .select({
        id: mealPlanEntry.id,
        dayOfWeek: mealPlanEntry.dayOfWeek,
        mealType: mealPlanEntry.mealType,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeThumbnailUrl: recipe.thumbnailUrl,
        recipeSourceType: recipe.sourceType,
        recipeCalories: recipe.calories,
        recipeProtein: recipe.protein,
        recipeCarbs: recipe.carbs,
        recipeFat: recipe.fat,
        recipeFiber: recipe.fiber,
        recipePrepTime: recipe.prepTimeMinutes,
        recipeCookTime: recipe.cookTimeMinutes,
      })
      .from(mealPlanEntry)
      .innerJoin(recipe, eq(mealPlanEntry.recipeId, recipe.id))
      .where(eq(mealPlanEntry.mealPlanId, plan.id));

    return {
      ...plan,
      entries: entries.map((e) => ({
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        mealType: e.mealType as "breakfast" | "lunch" | "dinner" | "snacks",
        recipe: {
          id: e.recipeId,
          title: e.recipeTitle,
          thumbnailUrl: e.recipeThumbnailUrl,
          sourceType: e.recipeSourceType,
          calories: e.recipeCalories,
          protein: e.recipeProtein,
          carbs: e.recipeCarbs,
          fat: e.recipeFat,
          fiber: e.recipeFiber,
          prepTimeMinutes: e.recipePrepTime,
          cookTimeMinutes: e.recipeCookTime,
        },
      })),
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new QueryError("mealPlan", "Failed to get or create meal plan", error);
  }
}

/**
 * Add a recipe to a meal slot
 */
export async function addEntry(
  db: Database,
  input: AddEntryInput
): Promise<{ id: string }> {
  try {
    // Verify the meal plan exists
    const plans = await db
      .select({ id: mealPlan.id })
      .from(mealPlan)
      .where(eq(mealPlan.id, input.mealPlanId))
      .limit(1);

    if (plans.length === 0) {
      throw new NotFoundError("mealPlan", input.mealPlanId);
    }

    // Verify the recipe exists
    const recipes = await db
      .select({ id: recipe.id })
      .from(recipe)
      .where(eq(recipe.id, input.recipeId))
      .limit(1);

    if (recipes.length === 0) {
      throw new NotFoundError("recipe", input.recipeId);
    }

    // Check if there's already an entry for this slot (replace it)
    const existingEntries = await db
      .select({ id: mealPlanEntry.id })
      .from(mealPlanEntry)
      .where(
        and(
          eq(mealPlanEntry.mealPlanId, input.mealPlanId),
          eq(mealPlanEntry.dayOfWeek, input.dayOfWeek),
          eq(mealPlanEntry.mealType, input.mealType)
        )
      );

    // Delete existing entry if any
    if (existingEntries.length > 0) {
      await db
        .delete(mealPlanEntry)
        .where(eq(mealPlanEntry.id, existingEntries[0].id));
    }

    // Create new entry
    const entryId = generateId();
    await db.insert(mealPlanEntry).values({
      id: entryId,
      mealPlanId: input.mealPlanId,
      recipeId: input.recipeId,
      dayOfWeek: input.dayOfWeek,
      mealType: input.mealType,
    });

    return { id: entryId };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new CreationError("mealPlanEntry", "Failed to add entry", error);
  }
}

/**
 * Remove an entry from a meal slot
 */
export async function removeEntry(
  db: Database,
  input: RemoveEntryInput
): Promise<{ success: boolean }> {
  try {
    // Verify entry exists and belongs to user's plan
    const entries = await db
      .select({
        id: mealPlanEntry.id,
        mealPlanId: mealPlanEntry.mealPlanId,
      })
      .from(mealPlanEntry)
      .innerJoin(mealPlan, eq(mealPlanEntry.mealPlanId, mealPlan.id))
      .where(
        and(
          eq(mealPlanEntry.id, input.entryId),
          eq(mealPlan.userId, input.userId)
        )
      )
      .limit(1);

    if (entries.length === 0) {
      throw new NotFoundError("mealPlanEntry", input.entryId);
    }

    await db.delete(mealPlanEntry).where(eq(mealPlanEntry.id, input.entryId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DeletionError("mealPlanEntry", "Failed to remove entry", error);
  }
}

/**
 * Get grocery list for a meal plan (aggregated ingredients)
 */
export async function getGroceryList(
  db: Database,
  input: GetGroceryListInput
): Promise<GroceryList> {
  try {
    // Verify plan belongs to user
    const plans = await db
      .select({ id: mealPlan.id })
      .from(mealPlan)
      .where(
        and(
          eq(mealPlan.id, input.mealPlanId),
          eq(mealPlan.userId, input.userId)
        )
      )
      .limit(1);

    if (plans.length === 0) {
      throw new NotFoundError("mealPlan", input.mealPlanId);
    }

    // Get all recipe IDs from the plan
    const entries = await db
      .select({ recipeId: mealPlanEntry.recipeId })
      .from(mealPlanEntry)
      .where(eq(mealPlanEntry.mealPlanId, input.mealPlanId));

    if (entries.length === 0) {
      return { items: [], totalIngredients: 0, recipeCount: 0 };
    }

    const recipeIds = [...new Set(entries.map((e) => e.recipeId))];

    // Get all ingredients for these recipes
    const ingredientsData = await db
      .select({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        ingredientCategory: ingredient.category,
        quantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        notes: recipeIngredient.notes,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
      })
      .from(recipeIngredient)
      .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
      .innerJoin(recipe, eq(recipeIngredient.recipeId, recipe.id))
      .where(inArray(recipeIngredient.recipeId, recipeIds));

    // Aggregate by ingredient
    const ingredientMap = new Map<string, GroceryListItem>();

    for (const item of ingredientsData) {
      const existing = ingredientMap.get(item.ingredientId);
      if (existing) {
        existing.quantities.push({
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
          recipeTitle: item.recipeTitle,
        });
      } else {
        ingredientMap.set(item.ingredientId, {
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName,
          category: item.ingredientCategory,
          quantities: [
            {
              quantity: item.quantity,
              unit: item.unit,
              notes: item.notes,
              recipeTitle: item.recipeTitle,
            },
          ],
        });
      }
    }

    const items = Array.from(ingredientMap.values()).sort((a, b) => {
      // Sort by category first (null/Other last), then by name
      if (a.category === b.category) {
        return a.ingredientName.localeCompare(b.ingredientName);
      }
      if (!a.category) return 1;
      if (!b.category) return -1;
      return a.category.localeCompare(b.category);
    });

    return {
      items,
      totalIngredients: items.length,
      recipeCount: recipeIds.length,
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new QueryError("groceryList", "Failed to get grocery list", error);
  }
}

/**
 * Get user's recipes for picker (simple list)
 */
export async function getUserRecipesForPicker(
  db: Database,
  input: { userId: string; search?: string }
): Promise<
  Array<{
    id: string;
    title: string;
    thumbnailUrl: string | null;
    sourceType: "youtube" | "blog";
  }>
> {
  try {
    let query = db
      .select({
        id: recipe.id,
        title: recipe.title,
        thumbnailUrl: recipe.thumbnailUrl,
        sourceType: recipe.sourceType,
      })
      .from(recipe)
      .where(eq(recipe.createdById, input.userId))
      .orderBy(recipe.title);

    const recipes = await query;

    // Filter by search if provided
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      return recipes.filter((r) =>
        r.title.toLowerCase().includes(searchLower)
      );
    }

    return recipes;
  } catch (error) {
    throw new QueryError("recipe", "Failed to get recipes for picker", error);
  }
}
