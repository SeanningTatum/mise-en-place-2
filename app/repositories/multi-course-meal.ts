import { eq, and, inArray, asc } from "drizzle-orm";
import {
  multiCourseMeal,
  mealCourse,
  recipe,
  recipeIngredient,
  recipeStep,
  ingredient,
} from "@/db/schema";
import {
  NotFoundError,
  CreationError,
  UpdateError,
  DeletionError,
  QueryError,
} from "@/models/errors";
import type { Context } from "@/trpc";
import { generateId } from "@/lib/utils";
import { loggers } from "@/lib/logger";

type Database = Context["db"];

// Course types
export type CourseType =
  | "appetizer"
  | "soup_salad"
  | "main"
  | "side"
  | "dessert"
  | "drink";

export type ServiceStyle = "plated" | "family" | "buffet";

// Input interfaces
interface CreateMealInput {
  userId: string;
  name: string;
  guestCount: number;
  servingTime: string;
  serviceStyle: ServiceStyle;
  notes?: string;
  courses?: Array<{
    recipeId: string;
    courseType: CourseType;
    courseOrder: number;
    servingsOverride?: number;
    notes?: string;
  }>;
}

interface UpdateMealInput {
  mealId: string;
  userId: string;
  name?: string;
  guestCount?: number;
  servingTime?: string;
  serviceStyle?: ServiceStyle;
  notes?: string;
}

interface GetMealInput {
  mealId: string;
  userId: string;
}

interface DeleteMealInput {
  mealId: string;
  userId: string;
}

interface ListMealsInput {
  userId: string;
}

interface AddCourseInput {
  mealId: string;
  userId: string;
  recipeId: string;
  courseType: CourseType;
  courseOrder: number;
  servingsOverride?: number;
  notes?: string;
}

interface RemoveCourseInput {
  courseId: string;
  userId: string;
}

interface ReorderCoursesInput {
  mealId: string;
  userId: string;
  courseIds: string[];
}

interface GetShoppingListInput {
  mealId: string;
  userId: string;
}

interface SaveAISuggestionsInput {
  mealId: string;
  userId: string;
  suggestions: Array<{
    courseType: string;
    suggestedRecipeId?: string;
    suggestion: string;
    reasoning: string;
  }>;
}

interface SaveTimelineInput {
  mealId: string;
  userId: string;
  timeline: Array<{
    id: string;
    time: string;
    task: string;
    recipeId?: string;
    recipeName?: string;
    durationMinutes: number;
    category: "prep" | "cook" | "rest" | "serve";
  }>;
}

// Result types
export interface CourseWithRecipe {
  id: string;
  courseType: CourseType;
  courseOrder: number;
  servingsOverride: number | null;
  notes: string | null;
  recipe: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    sourceType: "youtube" | "blog" | "custom";
    servings: number | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber: number | null;
  };
}

export interface MultiCourseMealWithCourses {
  id: string;
  createdById: string;
  name: string;
  guestCount: number;
  servingTime: string;
  serviceStyle: ServiceStyle;
  notes: string | null;
  aiSuggestionsJson: {
    suggestions?: Array<{
      courseType: string;
      suggestedRecipeId?: string;
      suggestion: string;
      reasoning: string;
    }>;
    generatedAt?: string;
  } | null;
  timelineJson: {
    items?: Array<{
      id: string;
      time: string;
      task: string;
      recipeId?: string;
      recipeName?: string;
      durationMinutes: number;
      category: "prep" | "cook" | "rest" | "serve";
    }>;
    generatedAt?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  courses: CourseWithRecipe[];
}

export interface MealListItem {
  id: string;
  name: string;
  guestCount: number;
  servingTime: string;
  serviceStyle: ServiceStyle;
  courseCount: number;
  createdAt: Date;
}

export interface ScaledIngredient {
  ingredientId: string;
  ingredientName: string;
  category: string | null;
  quantities: Array<{
    quantity: string | null;
    unit: string | null;
    notes: string | null;
    recipeTitle: string;
    courseType: CourseType;
    scaleFactor: number;
  }>;
}

export interface ShoppingList {
  items: ScaledIngredient[];
  totalIngredients: number;
  recipeCount: number;
  guestCount: number;
}

/**
 * Create a new multi-course meal
 */
export async function create(
  db: Database,
  input: CreateMealInput
): Promise<{ id: string }> {
  const startTime = Date.now();
  loggers.repository.debug(
    { userId: input.userId, name: input.name, guestCount: input.guestCount },
    "create: Starting multi-course meal creation"
  );

  try {
    const mealId = generateId();

    await db.insert(multiCourseMeal).values({
      id: mealId,
      createdById: input.userId,
      name: input.name,
      guestCount: input.guestCount,
      servingTime: input.servingTime,
      serviceStyle: input.serviceStyle,
      notes: input.notes,
    });

    // Add courses if provided
    if (input.courses && input.courses.length > 0) {
      const courseValues = input.courses.map((course) => ({
        id: generateId(),
        mealId,
        recipeId: course.recipeId,
        courseType: course.courseType,
        courseOrder: course.courseOrder,
        servingsOverride: course.servingsOverride,
        notes: course.notes,
      }));

      await db.insert(mealCourse).values(courseValues);
    }

    loggers.repository.info(
      { mealId, courseCount: input.courses?.length || 0, durationMs: Date.now() - startTime },
      "create: Multi-course meal created successfully"
    );

    return { id: mealId };
  } catch (error) {
    loggers.repository.error(
      { error: error instanceof Error ? error.message : String(error), durationMs: Date.now() - startTime },
      "create: Failed to create multi-course meal"
    );
    throw new CreationError(
      "multiCourseMeal",
      "Failed to create multi-course meal",
      error
    );
  }
}

/**
 * Get a multi-course meal by ID with all courses
 */
export async function getById(
  db: Database,
  input: GetMealInput
): Promise<MultiCourseMealWithCourses> {
  const startTime = Date.now();
  loggers.repository.debug(
    { mealId: input.mealId },
    "getById: Fetching multi-course meal"
  );

  try {
    // Get the meal
    const meals = await db
      .select()
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      loggers.repository.warn(
        { mealId: input.mealId },
        "getById: Meal not found"
      );
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    const meal = meals[0];

    // Get courses with recipe data
    const coursesData = await db
      .select({
        id: mealCourse.id,
        courseType: mealCourse.courseType,
        courseOrder: mealCourse.courseOrder,
        servingsOverride: mealCourse.servingsOverride,
        notes: mealCourse.notes,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeThumbnailUrl: recipe.thumbnailUrl,
        recipeSourceType: recipe.sourceType,
        recipeServings: recipe.servings,
        recipePrepTime: recipe.prepTimeMinutes,
        recipeCookTime: recipe.cookTimeMinutes,
        recipeCalories: recipe.calories,
        recipeProtein: recipe.protein,
        recipeCarbs: recipe.carbs,
        recipeFat: recipe.fat,
        recipeFiber: recipe.fiber,
      })
      .from(mealCourse)
      .innerJoin(recipe, eq(mealCourse.recipeId, recipe.id))
      .where(eq(mealCourse.mealId, input.mealId))
      .orderBy(asc(mealCourse.courseOrder));

    const result = {
      id: meal.id,
      createdById: meal.createdById,
      name: meal.name,
      guestCount: meal.guestCount,
      servingTime: meal.servingTime,
      serviceStyle: meal.serviceStyle as ServiceStyle,
      notes: meal.notes,
      aiSuggestionsJson: meal.aiSuggestionsJson,
      timelineJson: meal.timelineJson,
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt,
      courses: coursesData.map((c) => ({
        id: c.id,
        courseType: c.courseType as CourseType,
        courseOrder: c.courseOrder,
        servingsOverride: c.servingsOverride,
        notes: c.notes,
        recipe: {
          id: c.recipeId,
          title: c.recipeTitle,
          thumbnailUrl: c.recipeThumbnailUrl,
          sourceType: c.recipeSourceType as "youtube" | "blog" | "custom",
          servings: c.recipeServings,
          prepTimeMinutes: c.recipePrepTime,
          cookTimeMinutes: c.recipeCookTime,
          calories: c.recipeCalories,
          protein: c.recipeProtein,
          carbs: c.recipeCarbs,
          fat: c.recipeFat,
          fiber: c.recipeFiber,
        },
      })),
    };

    loggers.repository.info(
      { mealId: input.mealId, courseCount: coursesData.length, durationMs: Date.now() - startTime },
      "getById: Successfully fetched multi-course meal"
    );

    return result;
  } catch (error) {
    loggers.repository.error(
      { mealId: input.mealId, error: error instanceof Error ? error.message : String(error), durationMs: Date.now() - startTime },
      "getById: Failed to fetch multi-course meal"
    );
    if (error instanceof NotFoundError) throw error;
    throw new QueryError(
      "multiCourseMeal",
      "Failed to get multi-course meal",
      error
    );
  }
}

/**
 * Update a multi-course meal
 */
export async function update(
  db: Database,
  input: UpdateMealInput
): Promise<{ success: boolean }> {
  try {
    // Verify meal exists and belongs to user
    const meals = await db
      .select({ id: multiCourseMeal.id })
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    const updateData: Partial<{
      name: string;
      guestCount: number;
      servingTime: string;
      serviceStyle: ServiceStyle;
      notes: string | null;
    }> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.guestCount !== undefined) updateData.guestCount = input.guestCount;
    if (input.servingTime !== undefined) updateData.servingTime = input.servingTime;
    if (input.serviceStyle !== undefined) updateData.serviceStyle = input.serviceStyle;
    if (input.notes !== undefined) updateData.notes = input.notes;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(multiCourseMeal)
        .set(updateData)
        .where(eq(multiCourseMeal.id, input.mealId));
    }

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new UpdateError(
      "multiCourseMeal",
      "Failed to update multi-course meal",
      error
    );
  }
}

/**
 * Delete a multi-course meal
 */
export async function deleteMeal(
  db: Database,
  input: DeleteMealInput
): Promise<{ success: boolean }> {
  try {
    // Verify meal exists and belongs to user
    const meals = await db
      .select({ id: multiCourseMeal.id })
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    // Cascade delete will handle courses
    await db
      .delete(multiCourseMeal)
      .where(eq(multiCourseMeal.id, input.mealId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DeletionError(
      "multiCourseMeal",
      "Failed to delete multi-course meal",
      error
    );
  }
}

/**
 * List user's multi-course meals
 */
export async function list(
  db: Database,
  input: ListMealsInput
): Promise<MealListItem[]> {
  try {
    const meals = await db
      .select({
        id: multiCourseMeal.id,
        name: multiCourseMeal.name,
        guestCount: multiCourseMeal.guestCount,
        servingTime: multiCourseMeal.servingTime,
        serviceStyle: multiCourseMeal.serviceStyle,
        createdAt: multiCourseMeal.createdAt,
      })
      .from(multiCourseMeal)
      .where(eq(multiCourseMeal.createdById, input.userId))
      .orderBy(multiCourseMeal.createdAt);

    // Get course counts
    const mealIds = meals.map((m) => m.id);
    if (mealIds.length === 0) {
      return [];
    }

    const courseCounts = await db
      .select({
        mealId: mealCourse.mealId,
        count: mealCourse.id,
      })
      .from(mealCourse)
      .where(inArray(mealCourse.mealId, mealIds));

    // Count courses per meal
    const countMap = new Map<string, number>();
    for (const c of courseCounts) {
      countMap.set(c.mealId, (countMap.get(c.mealId) || 0) + 1);
    }

    return meals.map((m) => ({
      id: m.id,
      name: m.name,
      guestCount: m.guestCount,
      servingTime: m.servingTime,
      serviceStyle: m.serviceStyle as ServiceStyle,
      courseCount: countMap.get(m.id) || 0,
      createdAt: m.createdAt,
    }));
  } catch (error) {
    throw new QueryError(
      "multiCourseMeal",
      "Failed to list multi-course meals",
      error
    );
  }
}

/**
 * Add a course to a meal
 */
export async function addCourse(
  db: Database,
  input: AddCourseInput
): Promise<{ id: string }> {
  try {
    // Verify meal exists and belongs to user
    const meals = await db
      .select({ id: multiCourseMeal.id })
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    // Verify recipe exists
    const recipes = await db
      .select({ id: recipe.id })
      .from(recipe)
      .where(eq(recipe.id, input.recipeId))
      .limit(1);

    if (recipes.length === 0) {
      throw new NotFoundError("recipe", input.recipeId);
    }

    const courseId = generateId();
    await db.insert(mealCourse).values({
      id: courseId,
      mealId: input.mealId,
      recipeId: input.recipeId,
      courseType: input.courseType,
      courseOrder: input.courseOrder,
      servingsOverride: input.servingsOverride,
      notes: input.notes,
    });

    return { id: courseId };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new CreationError("mealCourse", "Failed to add course", error);
  }
}

/**
 * Remove a course from a meal
 */
export async function removeCourse(
  db: Database,
  input: RemoveCourseInput
): Promise<{ success: boolean }> {
  try {
    // Verify course exists and belongs to user's meal
    const courses = await db
      .select({
        id: mealCourse.id,
        mealId: mealCourse.mealId,
      })
      .from(mealCourse)
      .innerJoin(
        multiCourseMeal,
        eq(mealCourse.mealId, multiCourseMeal.id)
      )
      .where(
        and(
          eq(mealCourse.id, input.courseId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (courses.length === 0) {
      throw new NotFoundError("mealCourse", input.courseId);
    }

    await db.delete(mealCourse).where(eq(mealCourse.id, input.courseId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DeletionError("mealCourse", "Failed to remove course", error);
  }
}

/**
 * Reorder courses in a meal
 */
export async function reorderCourses(
  db: Database,
  input: ReorderCoursesInput
): Promise<{ success: boolean }> {
  try {
    // Verify meal exists and belongs to user
    const meals = await db
      .select({ id: multiCourseMeal.id })
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    // Update course orders
    for (let i = 0; i < input.courseIds.length; i++) {
      await db
        .update(mealCourse)
        .set({ courseOrder: i })
        .where(
          and(
            eq(mealCourse.id, input.courseIds[i]),
            eq(mealCourse.mealId, input.mealId)
          )
        );
    }

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new UpdateError("mealCourse", "Failed to reorder courses", error);
  }
}

/**
 * Get scaled shopping list for a meal
 */
export async function getShoppingList(
  db: Database,
  input: GetShoppingListInput
): Promise<ShoppingList> {
  try {
    // Get meal with guest count
    const meals = await db
      .select({
        id: multiCourseMeal.id,
        guestCount: multiCourseMeal.guestCount,
      })
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    const meal = meals[0];

    // Get all courses with recipe servings
    const coursesData = await db
      .select({
        courseType: mealCourse.courseType,
        servingsOverride: mealCourse.servingsOverride,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeServings: recipe.servings,
      })
      .from(mealCourse)
      .innerJoin(recipe, eq(mealCourse.recipeId, recipe.id))
      .where(eq(mealCourse.mealId, input.mealId));

    if (coursesData.length === 0) {
      return {
        items: [],
        totalIngredients: 0,
        recipeCount: 0,
        guestCount: meal.guestCount,
      };
    }

    const recipeIds = [...new Set(coursesData.map((c) => c.recipeId))];

    // Get all ingredients
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

    // Build recipe info map for scaling
    const recipeInfoMap = new Map<
      string,
      { servings: number | null; courseType: CourseType; title: string }
    >();
    for (const c of coursesData) {
      recipeInfoMap.set(c.recipeId, {
        servings: c.servingsOverride || c.recipeServings,
        courseType: c.courseType as CourseType,
        title: c.recipeTitle,
      });
    }

    // Aggregate by ingredient with scaling info
    const ingredientMap = new Map<string, ScaledIngredient>();

    for (const item of ingredientsData) {
      const recipeInfo = recipeInfoMap.get(item.recipeId);
      if (!recipeInfo) continue;

      // Calculate scale factor
      const originalServings = recipeInfo.servings || 1;
      const scaleFactor = meal.guestCount / originalServings;

      const existing = ingredientMap.get(item.ingredientId);
      const quantityInfo = {
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
        recipeTitle: item.recipeTitle,
        courseType: recipeInfo.courseType,
        scaleFactor,
      };

      if (existing) {
        existing.quantities.push(quantityInfo);
      } else {
        ingredientMap.set(item.ingredientId, {
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName,
          category: item.ingredientCategory,
          quantities: [quantityInfo],
        });
      }
    }

    const items = Array.from(ingredientMap.values()).sort((a, b) => {
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
      guestCount: meal.guestCount,
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new QueryError(
      "shoppingList",
      "Failed to get shopping list",
      error
    );
  }
}

/**
 * Save AI suggestions to meal
 */
export async function saveAISuggestions(
  db: Database,
  input: SaveAISuggestionsInput
): Promise<{ success: boolean }> {
  try {
    // Verify meal exists and belongs to user
    const meals = await db
      .select({ id: multiCourseMeal.id })
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    await db
      .update(multiCourseMeal)
      .set({
        aiSuggestionsJson: {
          suggestions: input.suggestions,
          generatedAt: new Date().toISOString(),
        },
      })
      .where(eq(multiCourseMeal.id, input.mealId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new UpdateError(
      "multiCourseMeal",
      "Failed to save AI suggestions",
      error
    );
  }
}

/**
 * Save cooking timeline to meal
 */
export async function saveTimeline(
  db: Database,
  input: SaveTimelineInput
): Promise<{ success: boolean }> {
  try {
    // Verify meal exists and belongs to user
    const meals = await db
      .select({ id: multiCourseMeal.id })
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    await db
      .update(multiCourseMeal)
      .set({
        timelineJson: {
          items: input.timeline,
          generatedAt: new Date().toISOString(),
        },
      })
      .where(eq(multiCourseMeal.id, input.mealId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new UpdateError(
      "multiCourseMeal",
      "Failed to save timeline",
      error
    );
  }
}

/**
 * Get full recipe details for all courses (for AI timeline generation)
 */
export async function getCoursesWithFullRecipes(
  db: Database,
  input: GetMealInput
): Promise<{
  meal: {
    id: string;
    name: string;
    guestCount: number;
    servingTime: string;
    serviceStyle: ServiceStyle;
  };
  courses: Array<{
    id: string;
    courseType: CourseType;
    courseOrder: number;
    recipe: {
      id: string;
      title: string;
      servings: number | null;
      prepTimeMinutes: number | null;
      cookTimeMinutes: number | null;
      steps: Array<{
        stepNumber: number;
        instruction: string;
      }>;
    };
  }>;
}> {
  try {
    // Get meal
    const meals = await db
      .select()
      .from(multiCourseMeal)
      .where(
        and(
          eq(multiCourseMeal.id, input.mealId),
          eq(multiCourseMeal.createdById, input.userId)
        )
      )
      .limit(1);

    if (meals.length === 0) {
      throw new NotFoundError("multiCourseMeal", input.mealId);
    }

    const meal = meals[0];

    // Get courses with recipes
    const coursesData = await db
      .select({
        id: mealCourse.id,
        courseType: mealCourse.courseType,
        courseOrder: mealCourse.courseOrder,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeServings: recipe.servings,
        recipePrepTime: recipe.prepTimeMinutes,
        recipeCookTime: recipe.cookTimeMinutes,
      })
      .from(mealCourse)
      .innerJoin(recipe, eq(mealCourse.recipeId, recipe.id))
      .where(eq(mealCourse.mealId, input.mealId))
      .orderBy(asc(mealCourse.courseOrder));

    // Get steps for all recipes
    const recipeIds = coursesData.map((c) => c.recipeId);
    const stepsData =
      recipeIds.length > 0
        ? await db
            .select()
            .from(recipeStep)
            .where(inArray(recipeStep.recipeId, recipeIds))
            .orderBy(recipeStep.stepNumber)
        : [];

    // Group steps by recipe
    const stepsByRecipe = new Map<
      string,
      Array<{ stepNumber: number; instruction: string }>
    >();
    for (const step of stepsData) {
      const existing = stepsByRecipe.get(step.recipeId) || [];
      existing.push({
        stepNumber: step.stepNumber,
        instruction: step.instruction,
      });
      stepsByRecipe.set(step.recipeId, existing);
    }

    return {
      meal: {
        id: meal.id,
        name: meal.name,
        guestCount: meal.guestCount,
        servingTime: meal.servingTime,
        serviceStyle: meal.serviceStyle as ServiceStyle,
      },
      courses: coursesData.map((c) => ({
        id: c.id,
        courseType: c.courseType as CourseType,
        courseOrder: c.courseOrder,
        recipe: {
          id: c.recipeId,
          title: c.recipeTitle,
          servings: c.recipeServings,
          prepTimeMinutes: c.recipePrepTime,
          cookTimeMinutes: c.recipeCookTime,
          steps: stepsByRecipe.get(c.recipeId) || [],
        },
      })),
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new QueryError(
      "multiCourseMeal",
      "Failed to get courses with recipes",
      error
    );
  }
}
