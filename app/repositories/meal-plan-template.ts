import { eq, and, sql, inArray } from "drizzle-orm";
import {
  mealPlanTemplate,
  mealPlanTemplateEntry,
  mealPlanTemplateImport,
  mealPlan,
  mealPlanEntry,
  recipe,
  recipeIngredient,
  ingredient,
  userProfile,
  user,
} from "@/db/schema";
import {
  NotFoundError,
  CreationError,
  UpdateError,
  DeletionError,
  QueryError,
  ValidationError,
} from "@/models/errors";
import type { Context } from "@/trpc";
import { generateId } from "@/lib/utils";
import { loggers } from "@/lib/logger";

const log = loggers.repository.child({ repository: "meal-plan-template" });

type Database = Context["db"];

// Input interfaces
interface CreateTemplateInput {
  userId: string;
  name: string;
  description?: string | null;
  theme?: string | null;
  mealPlanId: string; // Source meal plan to copy from
}

interface UpdateTemplateInput {
  templateId: string;
  userId: string;
  name?: string;
  description?: string | null;
  theme?: string | null;
  coverImageUrl?: string | null;
  isPublic?: boolean;
}

interface DeleteTemplateInput {
  templateId: string;
  userId: string;
}

interface GetTemplateInput {
  templateId: string;
  userId: string;
}

interface GetPublicTemplateBySlugInput {
  username: string;
  slug: string;
}

interface ListUserTemplatesInput {
  userId: string;
}

interface ListPublicTemplatesInput {
  username: string;
}

interface ImportTemplateInput {
  templateId: string;
  userId: string;
  targetWeekStart: string; // ISO date string (Monday)
}

interface IncrementViewCountInput {
  templateId: string;
}

// Result types
export interface TemplateWithEntries {
  id: string;
  createdById: string;
  name: string;
  slug: string;
  description: string | null;
  theme: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  importCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  entries: Array<{
    id: string;
    dayOfWeek: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snacks";
    recipe: {
      id: string;
      title: string;
      slug: string | null;
      thumbnailUrl: string | null;
      sourceType: "youtube" | "blog" | "custom";
      calories: number | null;
      protein: number | null;
      prepTimeMinutes: number | null;
      cookTimeMinutes: number | null;
    };
  }>;
}

export interface TemplateListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  importCount: number;
  viewCount: number;
  mealCount: number;
  createdAt: Date;
}

export interface PublicTemplateResponse {
  template: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    theme: string | null;
    coverImageUrl: string | null;
    importCount: number;
    viewCount: number;
    createdAt: Date;
  };
  entries: Array<{
    dayOfWeek: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snacks";
    recipe: {
      id: string;
      title: string;
      slug: string | null;
      thumbnailUrl: string | null;
      sourceType: "youtube" | "blog" | "custom";
      calories: number | null;
      protein: number | null;
      prepTimeMinutes: number | null;
      cookTimeMinutes: number | null;
    };
  }>;
  groceryPreview: {
    totalIngredients: number;
    categories: Array<{ name: string; count: number }>;
  };
  nutritionSummary: {
    avgCalories: number;
    avgProtein: number;
    totalRecipes: number;
  };
  creator: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

/**
 * Generate a URL-safe slug from template name
 */
function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50) +
    "-" +
    generateId().substring(0, 8)
  );
}

/**
 * Create a new meal plan template from an existing meal plan
 */
export async function createTemplate(
  db: Database,
  input: CreateTemplateInput,
): Promise<{ id: string; slug: string }> {
  log.debug(
    { userId: input.userId, mealPlanId: input.mealPlanId, name: input.name },
    "Creating meal plan template",
  );

  try {
    // Verify meal plan exists and belongs to user
    const mealPlans = await db
      .select({
        id: mealPlan.id,
      })
      .from(mealPlan)
      .where(
        and(
          eq(mealPlan.id, input.mealPlanId),
          eq(mealPlan.userId, input.userId),
        ),
      )
      .limit(1);

    if (mealPlans.length === 0) {
      throw new NotFoundError("mealPlan", input.mealPlanId);
    }

    // Get entries from the source meal plan
    const entries = await db
      .select({
        recipeId: mealPlanEntry.recipeId,
        dayOfWeek: mealPlanEntry.dayOfWeek,
        mealType: mealPlanEntry.mealType,
      })
      .from(mealPlanEntry)
      .where(eq(mealPlanEntry.mealPlanId, input.mealPlanId));

    if (entries.length === 0) {
      throw new ValidationError(
        "mealPlanTemplate",
        "Cannot create template from empty meal plan",
        "entries",
      );
    }

    const templateId = generateId();
    const slug = generateSlug(input.name);

    // Create template
    await db.insert(mealPlanTemplate).values({
      id: templateId,
      createdById: input.userId,
      name: input.name,
      slug,
      description: input.description ?? null,
      theme: input.theme ?? null,
      isPublic: false,
    });

    // Copy entries to template
    const templateEntries = entries.map((entry) => ({
      id: generateId(),
      templateId,
      recipeId: entry.recipeId,
      dayOfWeek: entry.dayOfWeek,
      mealType: entry.mealType,
    }));

    await db.insert(mealPlanTemplateEntry).values(templateEntries);

    log.info(
      {
        templateId,
        slug,
        entryCount: entries.length,
        userId: input.userId,
      },
      "Meal plan template created",
    );

    return { id: templateId, slug };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    log.error(
      { err: error, userId: input.userId, mealPlanId: input.mealPlanId },
      "Failed to create meal plan template",
    );
    throw new CreationError(
      "mealPlanTemplate",
      "Failed to create template",
      error,
    );
  }
}

/**
 * Update a meal plan template
 */
export async function updateTemplate(
  db: Database,
  input: UpdateTemplateInput,
): Promise<{ success: boolean; slug: string }> {
  log.debug(
    { templateId: input.templateId, userId: input.userId },
    "Updating meal plan template",
  );

  try {
    // Verify template exists and belongs to user
    const templates = await db
      .select({
        id: mealPlanTemplate.id,
        slug: mealPlanTemplate.slug,
        name: mealPlanTemplate.name,
      })
      .from(mealPlanTemplate)
      .where(
        and(
          eq(mealPlanTemplate.id, input.templateId),
          eq(mealPlanTemplate.createdById, input.userId),
        ),
      )
      .limit(1);

    if (templates.length === 0) {
      throw new NotFoundError("mealPlanTemplate", input.templateId);
    }

    const template = templates[0];
    let slug = template.slug;

    // Regenerate slug if name changed
    if (input.name && input.name !== template.name) {
      slug = generateSlug(input.name);
    }

    // Build update object
    const updateData: Partial<typeof mealPlanTemplate.$inferInsert> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.theme !== undefined) updateData.theme = input.theme;
    if (input.coverImageUrl !== undefined)
      updateData.coverImageUrl = input.coverImageUrl;
    if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;
    if (slug !== template.slug) updateData.slug = slug;

    await db
      .update(mealPlanTemplate)
      .set(updateData)
      .where(eq(mealPlanTemplate.id, input.templateId));

    log.info(
      { templateId: input.templateId, updates: Object.keys(updateData) },
      "Meal plan template updated",
    );

    return { success: true, slug };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    log.error(
      { err: error, templateId: input.templateId },
      "Failed to update meal plan template",
    );
    throw new UpdateError(
      "mealPlanTemplate",
      "Failed to update template",
      error,
    );
  }
}

/**
 * Delete a meal plan template
 */
export async function deleteTemplate(
  db: Database,
  input: DeleteTemplateInput,
): Promise<{ success: boolean }> {
  log.debug(
    { templateId: input.templateId, userId: input.userId },
    "Deleting meal plan template",
  );

  try {
    // Verify template exists and belongs to user
    const templates = await db
      .select({ id: mealPlanTemplate.id })
      .from(mealPlanTemplate)
      .where(
        and(
          eq(mealPlanTemplate.id, input.templateId),
          eq(mealPlanTemplate.createdById, input.userId),
        ),
      )
      .limit(1);

    if (templates.length === 0) {
      throw new NotFoundError("mealPlanTemplate", input.templateId);
    }

    await db
      .delete(mealPlanTemplate)
      .where(eq(mealPlanTemplate.id, input.templateId));

    log.info({ templateId: input.templateId }, "Meal plan template deleted");
    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    log.error(
      { err: error, templateId: input.templateId },
      "Failed to delete meal plan template",
    );
    throw new DeletionError(
      "mealPlanTemplate",
      "Failed to delete template",
      error,
    );
  }
}

/**
 * Get a template by ID (for owner)
 */
export async function getTemplateById(
  db: Database,
  input: GetTemplateInput,
): Promise<TemplateWithEntries> {
  log.debug(
    { templateId: input.templateId, userId: input.userId },
    "Getting meal plan template",
  );

  try {
    // Get template
    const templates = await db
      .select()
      .from(mealPlanTemplate)
      .where(
        and(
          eq(mealPlanTemplate.id, input.templateId),
          eq(mealPlanTemplate.createdById, input.userId),
        ),
      )
      .limit(1);

    if (templates.length === 0) {
      throw new NotFoundError("mealPlanTemplate", input.templateId);
    }

    const template = templates[0];

    // Get entries with recipe data
    const entries = await db
      .select({
        id: mealPlanTemplateEntry.id,
        dayOfWeek: mealPlanTemplateEntry.dayOfWeek,
        mealType: mealPlanTemplateEntry.mealType,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeSlug: recipe.slug,
        recipeThumbnailUrl: recipe.thumbnailUrl,
        recipeSourceType: recipe.sourceType,
        recipeCalories: recipe.calories,
        recipeProtein: recipe.protein,
        recipePrepTime: recipe.prepTimeMinutes,
        recipeCookTime: recipe.cookTimeMinutes,
      })
      .from(mealPlanTemplateEntry)
      .innerJoin(recipe, eq(mealPlanTemplateEntry.recipeId, recipe.id))
      .where(eq(mealPlanTemplateEntry.templateId, input.templateId));

    return {
      ...template,
      entries: entries.map((e) => ({
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        mealType: e.mealType as "breakfast" | "lunch" | "dinner" | "snacks",
        recipe: {
          id: e.recipeId,
          title: e.recipeTitle,
          slug: e.recipeSlug,
          thumbnailUrl: e.recipeThumbnailUrl,
          sourceType: e.recipeSourceType,
          calories: e.recipeCalories,
          protein: e.recipeProtein,
          prepTimeMinutes: e.recipePrepTime,
          cookTimeMinutes: e.recipeCookTime,
        },
      })),
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    log.error(
      { err: error, templateId: input.templateId },
      "Failed to get meal plan template",
    );
    throw new QueryError("mealPlanTemplate", "Failed to get template", error);
  }
}

/**
 * List user's templates
 */
export async function listUserTemplates(
  db: Database,
  input: ListUserTemplatesInput,
): Promise<TemplateListItem[]> {
  log.debug({ userId: input.userId }, "Listing user templates");

  try {
    const templates = await db
      .select({
        id: mealPlanTemplate.id,
        name: mealPlanTemplate.name,
        slug: mealPlanTemplate.slug,
        description: mealPlanTemplate.description,
        theme: mealPlanTemplate.theme,
        coverImageUrl: mealPlanTemplate.coverImageUrl,
        isPublic: mealPlanTemplate.isPublic,
        importCount: mealPlanTemplate.importCount,
        viewCount: mealPlanTemplate.viewCount,
        createdAt: mealPlanTemplate.createdAt,
      })
      .from(mealPlanTemplate)
      .where(eq(mealPlanTemplate.createdById, input.userId))
      .orderBy(mealPlanTemplate.createdAt);

    // Get meal counts for each template
    const templateIds = templates.map((t) => t.id);
    if (templateIds.length === 0) {
      return [];
    }

    const entryCounts = await db
      .select({
        templateId: mealPlanTemplateEntry.templateId,
        count: sql<number>`count(*)`,
      })
      .from(mealPlanTemplateEntry)
      .where(inArray(mealPlanTemplateEntry.templateId, templateIds))
      .groupBy(mealPlanTemplateEntry.templateId);

    const countMap = new Map(entryCounts.map((e) => [e.templateId, e.count]));

    return templates.map((t) => ({
      ...t,
      mealCount: countMap.get(t.id) ?? 0,
    }));
  } catch (error) {
    log.error({ err: error, userId: input.userId }, "Failed to list templates");
    throw new QueryError("mealPlanTemplate", "Failed to list templates", error);
  }
}

/**
 * List public templates for a user (by username)
 */
export async function listPublicTemplates(
  db: Database,
  input: ListPublicTemplatesInput,
): Promise<TemplateListItem[]> {
  log.debug({ username: input.username }, "Listing public templates");

  try {
    // Get user ID from username
    const profiles = await db
      .select({ userId: userProfile.userId })
      .from(userProfile)
      .where(eq(userProfile.username, input.username.toLowerCase()))
      .limit(1);

    if (profiles.length === 0) {
      return [];
    }

    const userId = profiles[0].userId;

    const templates = await db
      .select({
        id: mealPlanTemplate.id,
        name: mealPlanTemplate.name,
        slug: mealPlanTemplate.slug,
        description: mealPlanTemplate.description,
        theme: mealPlanTemplate.theme,
        coverImageUrl: mealPlanTemplate.coverImageUrl,
        isPublic: mealPlanTemplate.isPublic,
        importCount: mealPlanTemplate.importCount,
        viewCount: mealPlanTemplate.viewCount,
        createdAt: mealPlanTemplate.createdAt,
      })
      .from(mealPlanTemplate)
      .where(
        and(
          eq(mealPlanTemplate.createdById, userId),
          eq(mealPlanTemplate.isPublic, true),
        ),
      )
      .orderBy(mealPlanTemplate.createdAt);

    // Get meal counts
    const templateIds = templates.map((t) => t.id);
    if (templateIds.length === 0) {
      return [];
    }

    const entryCounts = await db
      .select({
        templateId: mealPlanTemplateEntry.templateId,
        count: sql<number>`count(*)`,
      })
      .from(mealPlanTemplateEntry)
      .where(inArray(mealPlanTemplateEntry.templateId, templateIds))
      .groupBy(mealPlanTemplateEntry.templateId);

    const countMap = new Map(entryCounts.map((e) => [e.templateId, e.count]));

    return templates.map((t) => ({
      ...t,
      mealCount: countMap.get(t.id) ?? 0,
    }));
  } catch (error) {
    log.error(
      { err: error, username: input.username },
      "Failed to list public templates",
    );
    throw new QueryError(
      "mealPlanTemplate",
      "Failed to list public templates",
      error,
    );
  }
}

/**
 * Get public template by username and slug
 */
export async function getPublicTemplateBySlug(
  db: Database,
  input: GetPublicTemplateBySlugInput,
): Promise<PublicTemplateResponse | null> {
  log.debug(
    { username: input.username, slug: input.slug },
    "Getting public template by slug",
  );

  try {
    // Get user profile
    const profiles = await db
      .select({
        userId: userProfile.userId,
        username: userProfile.username,
        displayName: userProfile.displayName,
        avatarUrl: userProfile.avatarUrl,
      })
      .from(userProfile)
      .where(eq(userProfile.username, input.username.toLowerCase()))
      .limit(1);

    if (profiles.length === 0) {
      return null;
    }

    const profile = profiles[0];

    // Get template
    const templates = await db
      .select()
      .from(mealPlanTemplate)
      .where(
        and(
          eq(mealPlanTemplate.createdById, profile.userId),
          eq(mealPlanTemplate.slug, input.slug),
          eq(mealPlanTemplate.isPublic, true),
        ),
      )
      .limit(1);

    if (templates.length === 0) {
      return null;
    }

    const template = templates[0];

    // Get entries with recipe data
    const entries = await db
      .select({
        dayOfWeek: mealPlanTemplateEntry.dayOfWeek,
        mealType: mealPlanTemplateEntry.mealType,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeSlug: recipe.slug,
        recipeThumbnailUrl: recipe.thumbnailUrl,
        recipeSourceType: recipe.sourceType,
        recipeCalories: recipe.calories,
        recipeProtein: recipe.protein,
        recipePrepTime: recipe.prepTimeMinutes,
        recipeCookTime: recipe.cookTimeMinutes,
      })
      .from(mealPlanTemplateEntry)
      .innerJoin(recipe, eq(mealPlanTemplateEntry.recipeId, recipe.id))
      .where(eq(mealPlanTemplateEntry.templateId, template.id));

    // Calculate nutrition summary
    const recipesWithCalories = entries.filter(
      (e) => e.recipeCalories !== null,
    );
    const recipesWithProtein = entries.filter((e) => e.recipeProtein !== null);
    const avgCalories =
      recipesWithCalories.length > 0
        ? Math.round(
            recipesWithCalories.reduce(
              (sum, e) => sum + (e.recipeCalories ?? 0),
              0,
            ) / recipesWithCalories.length,
          )
        : 0;
    const avgProtein =
      recipesWithProtein.length > 0
        ? Math.round(
            recipesWithProtein.reduce(
              (sum, e) => sum + (e.recipeProtein ?? 0),
              0,
            ) / recipesWithProtein.length,
          )
        : 0;

    // Get grocery list preview (ingredient categories and counts)
    const recipeIds = [...new Set(entries.map((e) => e.recipeId))];
    let groceryPreview: PublicTemplateResponse["groceryPreview"] = {
      totalIngredients: 0,
      categories: [],
    };

    if (recipeIds.length > 0) {
      const ingredientsData = await db
        .select({
          ingredientId: ingredient.id,
          category: ingredient.category,
        })
        .from(recipeIngredient)
        .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
        .where(inArray(recipeIngredient.recipeId, recipeIds));

      // Dedupe by ingredient ID
      const uniqueIngredients = new Map<string, { category: string | null }>();
      for (const ing of ingredientsData) {
        if (!uniqueIngredients.has(ing.ingredientId)) {
          uniqueIngredients.set(ing.ingredientId, {
            category: ing.category,
          });
        }
      }

      // Group by category
      const categoryCount = new Map<string, number>();
      for (const ing of uniqueIngredients.values()) {
        const cat = ing.category || "Other";
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      }

      groceryPreview = {
        totalIngredients: uniqueIngredients.size,
        categories: Array.from(categoryCount.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      };
    }

    return {
      template: {
        id: template.id,
        name: template.name,
        slug: template.slug,
        description: template.description,
        theme: template.theme,
        coverImageUrl: template.coverImageUrl,
        importCount: template.importCount,
        viewCount: template.viewCount,
        createdAt: template.createdAt,
      },
      entries: entries.map((e) => ({
        dayOfWeek: e.dayOfWeek,
        mealType: e.mealType as "breakfast" | "lunch" | "dinner" | "snacks",
        recipe: {
          id: e.recipeId,
          title: e.recipeTitle,
          slug: e.recipeSlug,
          thumbnailUrl: e.recipeThumbnailUrl,
          sourceType: e.recipeSourceType,
          calories: e.recipeCalories,
          protein: e.recipeProtein,
          prepTimeMinutes: e.recipePrepTime,
          cookTimeMinutes: e.recipeCookTime,
        },
      })),
      groceryPreview,
      nutritionSummary: {
        avgCalories,
        avgProtein,
        totalRecipes: new Set(entries.map((e) => e.recipeId)).size,
      },
      creator: {
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      },
    };
  } catch (error) {
    log.error(
      { err: error, username: input.username, slug: input.slug },
      "Failed to get public template",
    );
    throw new QueryError(
      "mealPlanTemplate",
      "Failed to get public template",
      error,
    );
  }
}

/**
 * Import a template to user's meal plan for a specific week
 */
export async function importTemplate(
  db: Database,
  input: ImportTemplateInput,
): Promise<{ success: boolean; mealPlanId: string; entriesImported: number }> {
  log.debug(
    {
      templateId: input.templateId,
      userId: input.userId,
      targetWeek: input.targetWeekStart,
    },
    "Importing meal plan template",
  );

  try {
    // Get template (must be public or owned by user)
    const templates = await db
      .select({
        id: mealPlanTemplate.id,
        createdById: mealPlanTemplate.createdById,
        isPublic: mealPlanTemplate.isPublic,
      })
      .from(mealPlanTemplate)
      .where(eq(mealPlanTemplate.id, input.templateId))
      .limit(1);

    if (templates.length === 0) {
      throw new NotFoundError("mealPlanTemplate", input.templateId);
    }

    const template = templates[0];

    // Check access
    if (!template.isPublic && template.createdById !== input.userId) {
      throw new NotFoundError("mealPlanTemplate", input.templateId);
    }

    // Get template entries
    const entries = await db
      .select({
        recipeId: mealPlanTemplateEntry.recipeId,
        dayOfWeek: mealPlanTemplateEntry.dayOfWeek,
        mealType: mealPlanTemplateEntry.mealType,
      })
      .from(mealPlanTemplateEntry)
      .where(eq(mealPlanTemplateEntry.templateId, input.templateId));

    if (entries.length === 0) {
      throw new ValidationError(
        "mealPlanTemplate",
        "Template has no entries",
        "entries",
      );
    }

    // Get or create meal plan for target week
    let targetMealPlan = await db
      .select({ id: mealPlan.id })
      .from(mealPlan)
      .where(
        and(
          eq(mealPlan.userId, input.userId),
          eq(mealPlan.weekStartDate, input.targetWeekStart),
        ),
      )
      .limit(1);

    let mealPlanId: string;
    if (targetMealPlan.length === 0) {
      mealPlanId = generateId();
      await db.insert(mealPlan).values({
        id: mealPlanId,
        userId: input.userId,
        weekStartDate: input.targetWeekStart,
      });
    } else {
      mealPlanId = targetMealPlan[0].id;
      // Clear existing entries for this week
      await db
        .delete(mealPlanEntry)
        .where(eq(mealPlanEntry.mealPlanId, mealPlanId));
    }

    // Copy entries to meal plan
    const newEntries = entries.map((entry) => ({
      id: generateId(),
      mealPlanId,
      recipeId: entry.recipeId,
      dayOfWeek: entry.dayOfWeek,
      mealType: entry.mealType,
    }));

    await db.insert(mealPlanEntry).values(newEntries);

    // Record the import for analytics
    await db.insert(mealPlanTemplateImport).values({
      id: generateId(),
      templateId: input.templateId,
      importedById: input.userId,
    });

    // Increment import count on template
    await db
      .update(mealPlanTemplate)
      .set({
        importCount: sql`${mealPlanTemplate.importCount} + 1`,
      })
      .where(eq(mealPlanTemplate.id, input.templateId));

    log.info(
      {
        templateId: input.templateId,
        mealPlanId,
        entriesImported: newEntries.length,
        userId: input.userId,
      },
      "Meal plan template imported",
    );

    return {
      success: true,
      mealPlanId,
      entriesImported: newEntries.length,
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    log.error(
      { err: error, templateId: input.templateId, userId: input.userId },
      "Failed to import meal plan template",
    );
    throw new CreationError(
      "mealPlanTemplate",
      "Failed to import template",
      error,
    );
  }
}

/**
 * Increment view count for a template
 */
export async function incrementViewCount(
  db: Database,
  input: IncrementViewCountInput,
): Promise<{ success: boolean }> {
  log.trace(
    { templateId: input.templateId },
    "Incrementing template view count",
  );

  try {
    await db
      .update(mealPlanTemplate)
      .set({
        viewCount: sql`${mealPlanTemplate.viewCount} + 1`,
      })
      .where(eq(mealPlanTemplate.id, input.templateId));

    return { success: true };
  } catch (error) {
    log.error(
      { err: error, templateId: input.templateId },
      "Failed to increment view count",
    );
    // Don't throw - view count is non-critical
    return { success: false };
  }
}
