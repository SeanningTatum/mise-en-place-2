import { eq, and, count, desc, or, like, inArray } from "drizzle-orm";
import {
  recipe,
  recipeStep,
  recipeIngredient,
  ingredient,
  user,
} from "@/db/schema";
import {
  NotFoundError,
  CreationError,
  DeletionError,
  ValidationError,
  QueryError,
} from "@/models/errors";
import type { Context } from "@/trpc";
import type { ExtractedRecipe, ExtractedIngredient, ExtractedStep } from "@/lib/gemini";
import { generateId, chunkArray, normalizeRecipeUrl } from "@/lib/utils";

type Database = Context["db"];

// Input interfaces
interface CreateRecipeInput {
  userId: string;
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
  ingredients: ExtractedIngredient[];
  steps: ExtractedStep[];
}

interface GetRecipesByUserInput {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  sourceType?: "youtube" | "blog";
}

interface GetAllRecipesInput {
  page: number;
  limit: number;
  search?: string;
  sourceType?: "youtube" | "blog";
}

interface GetRecipeByIdInput {
  id: string;
}

interface DeleteRecipeInput {
  id: string;
  userId: string;
}

// Result types
export interface RecipeWithRelations {
  id: string;
  createdById: string;
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
  createdAt: Date;
  updatedAt: Date;
  steps: Array<{
    id: string;
    stepNumber: number;
    instruction: string;
    timestampSeconds: number | null;
    durationSeconds: number | null;
  }>;
  ingredients: Array<{
    id: string;
    quantity: string | null;
    unit: string | null;
    notes: string | null;
    ingredient: {
      id: string;
      name: string;
      category: string | null;
    };
  }>;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}


// Max rows per insert to stay under D1's 100 parameter limit
// recipe_step has 6 columns: 100 / 6 = 16 rows max
// recipe_ingredient has 6 columns: 100 / 6 = 16 rows max
const MAX_ROWS_PER_INSERT = 15; // Using 15 to be safe

/**
 * Find or create ingredients and return their IDs
 */
async function findOrCreateIngredients(
  db: Database,
  ingredients: ExtractedIngredient[]
): Promise<Map<string, string>> {
  const ingredientMap = new Map<string, string>();
  if (ingredients.length === 0) return ingredientMap;

  // Normalize all names upfront
  const normalizedNames = ingredients.map((ing) => ({
    original: ing.name,
    normalized: ing.name.toLowerCase().trim(),
  }));
  const uniqueNormalized = [...new Set(normalizedNames.map((n) => n.normalized))];

  // Batch fetch existing ingredients using IN clause
  const existing = await db
    .select({ id: ingredient.id, name: ingredient.name })
    .from(ingredient)
    .where(inArray(ingredient.name, uniqueNormalized));

  const existingByName = new Map(existing.map((e) => [e.name, e.id]));

  // Identify missing ingredients
  const missingNames = uniqueNormalized.filter((name) => !existingByName.has(name));

  // Batch insert missing ingredients
  if (missingNames.length > 0) {
    const newIngredients = missingNames.map((name) => ({
      id: generateId(),
      name,
      category: null,
    }));

    const chunks = chunkArray(newIngredients, MAX_ROWS_PER_INSERT);
    for (const chunk of chunks) {
      await db.insert(ingredient).values(chunk);
    }

    // Add new IDs to the lookup map
    for (const ing of newIngredients) {
      existingByName.set(ing.name, ing.id);
    }
  }

  // Build final map using original names as keys
  for (const { original, normalized } of normalizedNames) {
    ingredientMap.set(original, existingByName.get(normalized)!);
  }

  return ingredientMap;
}

/**
 * Find an existing recipe by source URL for a specific user
 * Uses normalized URL comparison for deduplication
 */
interface FindRecipeBySourceUrlInput {
  userId: string;
  sourceUrl: string;
}

interface ExistingRecipeSummary {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  sourceUrl: string;
  sourceType: "youtube" | "blog";
}

export async function findRecipeBySourceUrl(
  db: Database,
  input: FindRecipeBySourceUrlInput
): Promise<ExistingRecipeSummary | null> {
  try {
    const normalizedInputUrl = normalizeRecipeUrl(input.sourceUrl);
    
    // Get all user's recipes and compare normalized URLs
    // Note: For better performance at scale, consider adding a normalized_url column
    const userRecipes = await db
      .select({
        id: recipe.id,
        title: recipe.title,
        thumbnailUrl: recipe.thumbnailUrl,
        sourceUrl: recipe.sourceUrl,
        sourceType: recipe.sourceType,
      })
      .from(recipe)
      .where(eq(recipe.createdById, input.userId));
    
    // Find matching recipe by normalized URL
    for (const r of userRecipes) {
      if (normalizeRecipeUrl(r.sourceUrl) === normalizedInputUrl) {
        return {
          id: r.id,
          title: r.title,
          thumbnailUrl: r.thumbnailUrl,
          sourceUrl: r.sourceUrl,
          sourceType: r.sourceType as "youtube" | "blog",
        };
      }
    }
    
    return null;
  } catch (error) {
    throw new QueryError("recipe", "Failed to find recipe by URL", error);
  }
}

/**
 * Create a new recipe with all related data
 */
export async function createRecipe(
  db: Database,
  input: CreateRecipeInput
): Promise<{ id: string }> {
  try {
    const recipeId = generateId();

    // Create the recipe
    await db.insert(recipe).values({
      id: recipeId,
      createdById: input.userId,
      title: input.title,
      description: input.description,
      sourceUrl: input.sourceUrl,
      sourceType: input.sourceType,
      youtubeVideoId: input.youtubeVideoId,
      thumbnailUrl: input.thumbnailUrl,
      servings: input.servings,
      prepTimeMinutes: input.prepTimeMinutes,
      cookTimeMinutes: input.cookTimeMinutes,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      fiber: input.fiber,
    });

    // Create steps (batched to avoid D1 parameter limit)
    if (input.steps.length > 0) {
      const stepValues = input.steps.map((step) => ({
        id: generateId(),
        recipeId,
        stepNumber: step.stepNumber,
        instruction: step.instruction,
        timestampSeconds: step.timestampSeconds,
        durationSeconds: step.durationSeconds,
      }));

      const stepChunks = chunkArray(stepValues, MAX_ROWS_PER_INSERT);
      for (const chunk of stepChunks) {
        await db.insert(recipeStep).values(chunk);
      }
    }

    // Find or create ingredients and link them (batched to avoid D1 parameter limit)
    if (input.ingredients.length > 0) {
      const ingredientMap = await findOrCreateIngredients(db, input.ingredients);

      const ingredientValues = input.ingredients.map((ing) => ({
        id: generateId(),
        recipeId,
        ingredientId: ingredientMap.get(ing.name)!,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes,
      }));

      const ingredientChunks = chunkArray(ingredientValues, MAX_ROWS_PER_INSERT);
      for (const chunk of ingredientChunks) {
        await db.insert(recipeIngredient).values(chunk);
      }
    }

    return { id: recipeId };
  } catch (error) {
    throw new CreationError("recipe", "Failed to create recipe", error);
  }
}

/**
 * Get a recipe by ID with all related data
 */
export async function getRecipeById(
  db: Database,
  input: GetRecipeByIdInput
): Promise<RecipeWithRelations> {
  try {
    // Get the recipe
    const recipes = await db
      .select()
      .from(recipe)
      .where(eq(recipe.id, input.id))
      .limit(1);

    if (recipes.length === 0) {
      throw new NotFoundError("recipe", input.id);
    }

    const recipeData = recipes[0];

    // Get steps
    const steps = await db
      .select()
      .from(recipeStep)
      .where(eq(recipeStep.recipeId, input.id))
      .orderBy(recipeStep.stepNumber);

    // Get ingredients with joined ingredient data
    const ingredientsData = await db
      .select({
        id: recipeIngredient.id,
        quantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        notes: recipeIngredient.notes,
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        ingredientCategory: ingredient.category,
      })
      .from(recipeIngredient)
      .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
      .where(eq(recipeIngredient.recipeId, input.id));

    // Get creator info
    const creator = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, recipeData.createdById))
      .limit(1);

    return {
      ...recipeData,
      steps: steps.map((s) => ({
        id: s.id,
        stepNumber: s.stepNumber,
        instruction: s.instruction,
        timestampSeconds: s.timestampSeconds,
        durationSeconds: s.durationSeconds,
      })),
      ingredients: ingredientsData.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        unit: i.unit,
        notes: i.notes,
        ingredient: {
          id: i.ingredientId,
          name: i.ingredientName,
          category: i.ingredientCategory,
        },
      })),
      createdBy: creator[0] || undefined,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new QueryError("recipe", "Failed to get recipe", error);
  }
}

/**
 * Get recipes by user with pagination
 */
export async function getRecipesByUser(
  db: Database,
  input: GetRecipesByUserInput
) {
  try {
    const offset = input.page * input.limit;

    // Build filter conditions
    const conditions = [eq(recipe.createdById, input.userId)];

    if (input.search) {
      conditions.push(
        or(
          like(recipe.title, `%${input.search}%`),
          like(recipe.description, `%${input.search}%`)
        )!
      );
    }

    if (input.sourceType) {
      conditions.push(eq(recipe.sourceType, input.sourceType));
    }

    const finalCondition = and(...conditions);

    const [recipes, totalCountResult] = await Promise.all([
      db
        .select()
        .from(recipe)
        .where(finalCondition)
        .orderBy(desc(recipe.createdAt))
        .limit(input.limit)
        .offset(offset),
      db.select({ count: count() }).from(recipe).where(finalCondition),
    ]);

    return {
      recipes,
      total: totalCountResult[0]?.count ?? 0,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil((totalCountResult[0]?.count ?? 0) / input.limit),
    };
  } catch (error) {
    throw new QueryError("recipe", "Failed to get recipes", error);
  }
}

/**
 * Get all recipes (admin) with pagination
 */
export async function getAllRecipes(db: Database, input: GetAllRecipesInput) {
  try {
    const offset = input.page * input.limit;

    // Build filter conditions
    const conditions = [];

    if (input.search) {
      conditions.push(
        or(
          like(recipe.title, `%${input.search}%`),
          like(recipe.description, `%${input.search}%`)
        )
      );
    }

    if (input.sourceType) {
      conditions.push(eq(recipe.sourceType, input.sourceType));
    }

    const finalCondition =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const [recipes, totalCountResult] = await Promise.all([
      db
        .select({
          id: recipe.id,
          title: recipe.title,
          sourceUrl: recipe.sourceUrl,
          sourceType: recipe.sourceType,
          thumbnailUrl: recipe.thumbnailUrl,
          calories: recipe.calories,
          protein: recipe.protein,
          createdAt: recipe.createdAt,
          createdById: recipe.createdById,
          userName: user.name,
          userEmail: user.email,
        })
        .from(recipe)
        .leftJoin(user, eq(recipe.createdById, user.id))
        .where(finalCondition)
        .orderBy(desc(recipe.createdAt))
        .limit(input.limit)
        .offset(offset),
      db.select({ count: count() }).from(recipe).where(finalCondition),
    ]);

    return {
      recipes,
      total: totalCountResult[0]?.count ?? 0,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil((totalCountResult[0]?.count ?? 0) / input.limit),
    };
  } catch (error) {
    throw new QueryError("recipe", "Failed to get recipes", error);
  }
}

/**
 * Delete a recipe (with ownership check)
 */
export async function deleteRecipe(db: Database, input: DeleteRecipeInput) {
  try {
    // Check ownership
    const existingRecipe = await db
      .select({ id: recipe.id, createdById: recipe.createdById })
      .from(recipe)
      .where(eq(recipe.id, input.id))
      .limit(1);

    if (existingRecipe.length === 0) {
      throw new NotFoundError("recipe", input.id);
    }

    if (existingRecipe[0].createdById !== input.userId) {
      throw new ValidationError(
        "recipe",
        "You don't have permission to delete this recipe",
        "id"
      );
    }

    // Delete recipe (cascade will delete steps and recipe_ingredients)
    await db.delete(recipe).where(eq(recipe.id, input.id));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new DeletionError("recipe", "Failed to delete recipe", error);
  }
}

/**
 * Delete a recipe as admin (no ownership check)
 */
export async function deleteRecipeAsAdmin(
  db: Database,
  input: { id: string }
) {
  try {
    const existingRecipe = await db
      .select({ id: recipe.id })
      .from(recipe)
      .where(eq(recipe.id, input.id))
      .limit(1);

    if (existingRecipe.length === 0) {
      throw new NotFoundError("recipe", input.id);
    }

    await db.delete(recipe).where(eq(recipe.id, input.id));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DeletionError("recipe", "Failed to delete recipe", error);
  }
}
