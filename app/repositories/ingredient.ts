import { eq, count, desc, like, sql, inArray } from "drizzle-orm";
import { ingredient, recipeIngredient, ingredientAlias } from "@/db/schema";
import {
  NotFoundError,
  UpdateError,
  DeletionError,
  ValidationError,
  QueryError,
} from "@/models/errors";
import { generateId } from "@/lib/utils";
import type { Context } from "@/trpc";

type Database = Context["db"];

// Input interfaces
interface GetAllIngredientsInput {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

interface MergeIngredientsInput {
  sourceId: string;
  targetId: string;
}

interface UpdateIngredientInput {
  id: string;
  name?: string;
  category?: string | null;
}

interface CreateAliasInput {
  alias: string;
  canonicalId: string;
}

interface SearchIngredientsInput {
  query: string;
  limit?: number;
}

// Result types
export interface IngredientWithUsage {
  id: string;
  name: string;
  category: string | null;
  createdAt: Date;
  usageCount: number;
}

/**
 * Find ingredient by alias (check alias table)
 */
async function findByAlias(
  db: Database,
  normalizedName: string
): Promise<{ id: string; name: string } | null> {
  const aliasResult = await db
    .select({
      canonicalId: ingredientAlias.canonicalId,
    })
    .from(ingredientAlias)
    .where(eq(ingredientAlias.alias, normalizedName))
    .limit(1);

  if (aliasResult.length === 0) return null;

  // Get the canonical ingredient
  const canonical = await db
    .select({ id: ingredient.id, name: ingredient.name })
    .from(ingredient)
    .where(eq(ingredient.id, aliasResult[0].canonicalId))
    .limit(1);

  return canonical.length > 0 ? canonical[0] : null;
}

/**
 * Find or create an ingredient by name
 * Checks both the ingredient table and alias table for matches
 */
export async function findOrCreateIngredient(
  db: Database,
  name: string
): Promise<{ id: string; name: string; isNew: boolean }> {
  try {
    const normalizedName = name.toLowerCase().trim();

    // 1. Try to find exact match in ingredient table
    const existing = await db
      .select({ id: ingredient.id, name: ingredient.name })
      .from(ingredient)
      .where(eq(ingredient.name, normalizedName))
      .limit(1);

    if (existing.length > 0) {
      return { id: existing[0].id, name: existing[0].name, isNew: false };
    }

    // 2. Check alias table for a match
    const aliasMatch = await findByAlias(db, normalizedName);
    if (aliasMatch) {
      return { id: aliasMatch.id, name: aliasMatch.name, isNew: false };
    }

    // 3. Create new ingredient
    const newId = generateId();
    await db.insert(ingredient).values({
      id: newId,
      name: normalizedName,
      category: null,
    });

    return { id: newId, name: normalizedName, isNew: true };
  } catch (error) {
    throw new UpdateError("ingredient", "Failed to find or create ingredient", error);
  }
}

/**
 * Get all ingredients with usage count (admin)
 */
export async function getAllIngredients(
  db: Database,
  input: GetAllIngredientsInput
) {
  try {
    const offset = input.page * input.limit;

    // Build filter conditions
    const conditions = [];

    if (input.search) {
      conditions.push(like(ingredient.name, `%${input.search}%`));
    }

    if (input.category) {
      conditions.push(eq(ingredient.category, input.category));
    }

    // Get ingredients with usage count using a correlated subquery
    // Note: Using raw SQL table/column names because Drizzle template literals
    // don't correctly reference the outer query's column in correlated subqueries
    const ingredientsWithUsage = await db
      .select({
        id: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
        createdAt: ingredient.createdAt,
        usageCount: sql<number>`(
          SELECT COUNT(*) FROM recipe_ingredient 
          WHERE recipe_ingredient.ingredient_id = ingredient.id
        )`.as("usage_count"),
      })
      .from(ingredient)
      .where(
        conditions.length === 0
          ? undefined
          : conditions.length === 1
            ? conditions[0]
            : sql`${conditions[0]} AND ${conditions[1]}`
      )
      .orderBy(desc(ingredient.createdAt))
      .limit(input.limit)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(ingredient)
      .where(
        conditions.length === 0
          ? undefined
          : conditions.length === 1
            ? conditions[0]
            : sql`${conditions[0]} AND ${conditions[1]}`
      );

    return {
      ingredients: ingredientsWithUsage as IngredientWithUsage[],
      total: totalCountResult[0]?.count ?? 0,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil((totalCountResult[0]?.count ?? 0) / input.limit),
    };
  } catch (error) {
    throw new QueryError("ingredient", "Failed to get ingredients", error);
  }
}

/**
 * Get ingredient usage count
 */
export async function getIngredientUsageCount(
  db: Database,
  id: string
): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(recipeIngredient)
      .where(eq(recipeIngredient.ingredientId, id));

    return result[0]?.count ?? 0;
  } catch (error) {
    throw new QueryError("ingredient", "Failed to get usage count", error);
  }
}

/**
 * Merge two ingredients (move all references from source to target, then delete source)
 */
export async function mergeIngredients(
  db: Database,
  input: MergeIngredientsInput
): Promise<{ success: boolean; mergedCount: number }> {
  try {
    if (input.sourceId === input.targetId) {
      throw new ValidationError(
        "ingredient",
        "Cannot merge ingredient with itself",
        "sourceId"
      );
    }

    // Verify both ingredients exist
    const [source, target] = await Promise.all([
      db
        .select({ id: ingredient.id })
        .from(ingredient)
        .where(eq(ingredient.id, input.sourceId))
        .limit(1),
      db
        .select({ id: ingredient.id })
        .from(ingredient)
        .where(eq(ingredient.id, input.targetId))
        .limit(1),
    ]);

    if (source.length === 0) {
      throw new NotFoundError("ingredient", input.sourceId, "Source ingredient not found");
    }

    if (target.length === 0) {
      throw new NotFoundError("ingredient", input.targetId, "Target ingredient not found");
    }

    // Get count of references to merge
    const usageCount = await getIngredientUsageCount(db, input.sourceId);

    // Update all recipe_ingredient references from source to target
    await db
      .update(recipeIngredient)
      .set({ ingredientId: input.targetId })
      .where(eq(recipeIngredient.ingredientId, input.sourceId));

    // Delete the source ingredient
    await db.delete(ingredient).where(eq(ingredient.id, input.sourceId));

    return { success: true, mergedCount: usageCount };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new UpdateError("ingredient", "Failed to merge ingredients", error);
  }
}

/**
 * Update an ingredient
 */
export async function updateIngredient(
  db: Database,
  input: UpdateIngredientInput
): Promise<{ success: boolean }> {
  try {
    // Verify ingredient exists
    const existing = await db
      .select({ id: ingredient.id })
      .from(ingredient)
      .where(eq(ingredient.id, input.id))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundError("ingredient", input.id);
    }

    // Build update data
    const updateData: Partial<{ name: string; category: string | null }> = {};
    if (input.name !== undefined) {
      updateData.name = input.name.toLowerCase().trim();
    }
    if (input.category !== undefined) {
      updateData.category = input.category;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(ingredient)
        .set(updateData)
        .where(eq(ingredient.id, input.id));
    }

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new UpdateError("ingredient", "Failed to update ingredient", error);
  }
}

/**
 * Get all unique categories
 */
export async function getIngredientCategories(db: Database): Promise<string[]> {
  try {
    const results = await db
      .selectDistinct({ category: ingredient.category })
      .from(ingredient)
      .where(sql`${ingredient.category} IS NOT NULL`);

    return results
      .map((r) => r.category)
      .filter((c): c is string => c !== null);
  } catch (error) {
    throw new QueryError("ingredient", "Failed to get categories", error);
  }
}

// ============== Alias Management ==============

/**
 * Create an alias for an ingredient
 */
export async function createAlias(
  db: Database,
  input: CreateAliasInput
): Promise<{ id: string }> {
  try {
    const normalizedAlias = input.alias.toLowerCase().trim();

    // Verify canonical ingredient exists
    const canonical = await db
      .select({ id: ingredient.id })
      .from(ingredient)
      .where(eq(ingredient.id, input.canonicalId))
      .limit(1);

    if (canonical.length === 0) {
      throw new NotFoundError("ingredient", input.canonicalId, "Canonical ingredient not found");
    }

    // Check if alias already exists
    const existing = await db
      .select({ id: ingredientAlias.id })
      .from(ingredientAlias)
      .where(eq(ingredientAlias.alias, normalizedAlias))
      .limit(1);

    if (existing.length > 0) {
      throw new ValidationError("ingredientAlias", "Alias already exists", "alias");
    }

    // Also check if alias matches an existing ingredient name
    const ingredientMatch = await db
      .select({ id: ingredient.id })
      .from(ingredient)
      .where(eq(ingredient.name, normalizedAlias))
      .limit(1);

    if (ingredientMatch.length > 0) {
      throw new ValidationError(
        "ingredientAlias",
        "Alias matches an existing ingredient name",
        "alias"
      );
    }

    const newId = generateId();
    await db.insert(ingredientAlias).values({
      id: newId,
      alias: normalizedAlias,
      canonicalId: input.canonicalId,
    });

    return { id: newId };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new UpdateError("ingredientAlias", "Failed to create alias", error);
  }
}

/**
 * Get all aliases for an ingredient
 */
export async function getAliasesForIngredient(
  db: Database,
  ingredientId: string
): Promise<{ id: string; alias: string }[]> {
  try {
    return await db
      .select({ id: ingredientAlias.id, alias: ingredientAlias.alias })
      .from(ingredientAlias)
      .where(eq(ingredientAlias.canonicalId, ingredientId));
  } catch (error) {
    throw new QueryError("ingredientAlias", "Failed to get aliases", error);
  }
}

/**
 * Delete an alias
 */
export async function deleteAlias(db: Database, aliasId: string): Promise<void> {
  try {
    const result = await db
      .delete(ingredientAlias)
      .where(eq(ingredientAlias.id, aliasId));

    // Note: D1/SQLite doesn't return affected rows, so we can't check if delete succeeded
  } catch (error) {
    throw new DeletionError("ingredientAlias", "Failed to delete alias", error);
  }
}

// ============== Ingredient Search ==============

/**
 * Search ingredients by name (for autocomplete)
 */
export async function searchIngredients(
  db: Database,
  input: SearchIngredientsInput
): Promise<{ id: string; name: string; category: string | null }[]> {
  try {
    const normalizedQuery = input.query.toLowerCase().trim();
    const limit = input.limit ?? 10;

    if (normalizedQuery.length < 2) {
      return [];
    }

    return await db
      .select({
        id: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
      })
      .from(ingredient)
      .where(like(ingredient.name, `%${normalizedQuery}%`))
      .orderBy(
        // Prioritize exact matches and prefix matches
        sql`CASE 
          WHEN ${ingredient.name} = ${normalizedQuery} THEN 0
          WHEN ${ingredient.name} LIKE ${normalizedQuery + '%'} THEN 1
          ELSE 2
        END`,
        ingredient.name
      )
      .limit(limit);
  } catch (error) {
    throw new QueryError("ingredient", "Failed to search ingredients", error);
  }
}

/**
 * Get all ingredient names (for AI similarity matching)
 */
export async function getAllIngredientNames(db: Database): Promise<string[]> {
  try {
    const results = await db
      .select({ name: ingredient.name })
      .from(ingredient);

    return results.map((r) => r.name);
  } catch (error) {
    throw new QueryError("ingredient", "Failed to get ingredient names", error);
  }
}
