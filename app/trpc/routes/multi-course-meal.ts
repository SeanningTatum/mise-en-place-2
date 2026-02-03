import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "..";
import * as multiCourseMealRepository from "@/repositories/multi-course-meal";
import * as mealPlanRepository from "@/repositories/meal-plan";
import {
  generateMenuSuggestions,
  generateCookingTimeline,
} from "@/lib/gemini";

// Generation status enum
const generationStatusEnum = z.enum(["pending", "generating", "complete", "error"]);

// Course type enum
const courseTypeEnum = z.enum([
  "appetizer",
  "soup_salad",
  "main",
  "side",
  "dessert",
  "drink",
]);

// Service style enum
const serviceStyleEnum = z.enum(["plated", "family", "buffet"]);

// Input schemas
const createMealInput = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  guestCount: z.number().int().min(2, "Minimum 2 guests").max(50, "Maximum 50 guests"),
  servingTime: z.string().datetime("Must be a valid datetime"),
  serviceStyle: serviceStyleEnum,
  notes: z.string().max(500).optional(),
  courses: z
    .array(
      z.object({
        recipeId: z.string().uuid("Invalid recipe ID"),
        courseType: courseTypeEnum,
        courseOrder: z.number().int().min(0),
        servingsOverride: z.number().int().min(1).optional(),
        notes: z.string().max(200).optional(),
      })
    )
    .optional(),
});

const updateMealInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
  name: z.string().min(1).max(100).optional(),
  guestCount: z.number().int().min(2).max(50).optional(),
  servingTime: z.string().datetime().optional(),
  serviceStyle: serviceStyleEnum.optional(),
  notes: z.string().max(500).nullable().optional(),
});

const getMealInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
});

const deleteMealInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
});

const addCourseInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
  recipeId: z.string().uuid("Invalid recipe ID"),
  courseType: courseTypeEnum,
  courseOrder: z.number().int().min(0),
  servingsOverride: z.number().int().min(1).optional(),
  notes: z.string().max(200).optional(),
});

const removeCourseInput = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

const reorderCoursesInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
  courseIds: z.array(z.string().uuid()),
});

const getShoppingListInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
});

const getMenuSuggestionsInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
  dietaryRestrictions: z.array(z.string()).optional(),
  preferredCuisine: z.string().optional(),
});

const generateTimelineInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
});

// New input schemas for sharing and generation
const setPublicInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
  isPublic: z.boolean(),
});

const getBySlugInput = z.object({
  username: z.string().min(1, "Username is required"),
  slug: z.string().min(1, "Slug is required"),
});

const updateGenerationStatusInput = z.object({
  mealId: z.string().uuid("Invalid meal ID"),
  status: generationStatusEnum,
  error: z.string().optional(),
});

export const multiCourseMealRouter = createTRPCRouter({
  /**
   * Create a new multi-course meal
   */
  create: protectedProcedure
    .input(createMealInput)
    .mutation(async ({ ctx, input }) => {
      return await multiCourseMealRepository.create(ctx.db, {
        userId: ctx.auth.user.id,
        ...input,
      });
    }),

  /**
   * Get a multi-course meal by ID
   */
  getById: protectedProcedure
    .input(getMealInput)
    .query(async ({ ctx, input }) => {
      return await multiCourseMealRepository.getById(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Update a multi-course meal
   */
  update: protectedProcedure
    .input(updateMealInput)
    .mutation(async ({ ctx, input }) => {
      return await multiCourseMealRepository.update(ctx.db, {
        ...input,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Delete a multi-course meal
   */
  delete: protectedProcedure
    .input(deleteMealInput)
    .mutation(async ({ ctx, input }) => {
      return await multiCourseMealRepository.deleteMeal(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * List user's multi-course meals
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return await multiCourseMealRepository.list(ctx.db, {
      userId: ctx.auth.user.id,
    });
  }),

  /**
   * Add a course to a meal
   */
  addCourse: protectedProcedure
    .input(addCourseInput)
    .mutation(async ({ ctx, input }) => {
      return await multiCourseMealRepository.addCourse(ctx.db, {
        ...input,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Remove a course from a meal
   */
  removeCourse: protectedProcedure
    .input(removeCourseInput)
    .mutation(async ({ ctx, input }) => {
      return await multiCourseMealRepository.removeCourse(ctx.db, {
        courseId: input.courseId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Reorder courses in a meal
   */
  reorderCourses: protectedProcedure
    .input(reorderCoursesInput)
    .mutation(async ({ ctx, input }) => {
      return await multiCourseMealRepository.reorderCourses(ctx.db, {
        ...input,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Get scaled shopping list for a meal
   */
  getShoppingList: protectedProcedure
    .input(getShoppingListInput)
    .query(async ({ ctx, input }) => {
      return await multiCourseMealRepository.getShoppingList(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Get user's recipes for the picker (reuse from meal-plan)
   */
  getRecipesForPicker: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return await mealPlanRepository.getUserRecipesForPicker(ctx.db, {
        userId: ctx.auth.user.id,
        search: input.search,
      });
    }),

  /**
   * Get AI menu suggestions
   */
  getMenuSuggestions: protectedProcedure
    .input(getMenuSuggestionsInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.gemini) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI service is not configured",
        });
      }

      // Get meal with courses
      const meal = await multiCourseMealRepository.getById(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
      });

      // Get user's recipes for suggestions
      const userRecipes = await mealPlanRepository.getUserRecipesForPicker(
        ctx.db,
        { userId: ctx.auth.user.id }
      );

      // Generate suggestions
      const suggestions = await generateMenuSuggestions(ctx.gemini, {
        courses: meal.courses.map((c) => ({
          courseType: c.courseType,
          recipeName: c.recipe.title,
          recipeId: c.recipe.id,
        })),
        guestCount: meal.guestCount,
        serviceStyle: meal.serviceStyle,
        userRecipes: userRecipes.map((r) => ({
          id: r.id,
          title: r.title,
        })),
        dietaryRestrictions: input.dietaryRestrictions,
        preferredCuisine: input.preferredCuisine,
      });

      // Save suggestions to meal
      await multiCourseMealRepository.saveAISuggestions(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
        suggestions,
      });

      return suggestions;
    }),

  /**
   * Generate cooking timeline
   */
  generateTimeline: protectedProcedure
    .input(generateTimelineInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.gemini) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI service is not configured",
        });
      }

      // Get meal with full recipe details
      const mealData = await multiCourseMealRepository.getCoursesWithFullRecipes(
        ctx.db,
        {
          mealId: input.mealId,
          userId: ctx.auth.user.id,
        }
      );

      // Generate timeline
      const timeline = await generateCookingTimeline(ctx.gemini, {
        mealName: mealData.meal.name,
        guestCount: mealData.meal.guestCount,
        servingTime: mealData.meal.servingTime,
        serviceStyle: mealData.meal.serviceStyle,
        courses: mealData.courses.map((c) => ({
          courseType: c.courseType,
          courseOrder: c.courseOrder,
          recipe: {
            id: c.recipe.id,
            title: c.recipe.title,
            servings: c.recipe.servings,
            prepTimeMinutes: c.recipe.prepTimeMinutes,
            cookTimeMinutes: c.recipe.cookTimeMinutes,
            steps: c.recipe.steps,
          },
        })),
      });

      // Save timeline to meal
      await multiCourseMealRepository.saveTimeline(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
        timeline,
      });

      return timeline;
    }),

  /**
   * Set meal public visibility
   */
  setPublic: protectedProcedure
    .input(setPublicInput)
    .mutation(async ({ ctx, input }) => {
      return await multiCourseMealRepository.setPublicVisibility(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
        isPublic: input.isPublic,
      });
    }),

  /**
   * Get generation status (for polling on loading page)
   */
  getGenerationStatus: protectedProcedure
    .input(getMealInput)
    .query(async ({ ctx, input }) => {
      return await multiCourseMealRepository.getGenerationStatus(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Start timeline generation (async - sets status to pending, returns immediately)
   */
  startGeneration: protectedProcedure
    .input(generateTimelineInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.gemini) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI service is not configured",
        });
      }

      // Set status to generating
      await multiCourseMealRepository.updateGenerationStatus(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
        status: "generating",
      });

      // Start generation in background (async - don't await)
      // For now, we'll do it synchronously but wrap in try-catch to update status
      try {
        // Get meal with full recipe details
        const mealData = await multiCourseMealRepository.getCoursesWithFullRecipes(
          ctx.db,
          {
            mealId: input.mealId,
            userId: ctx.auth.user.id,
          }
        );

        // Generate timeline
        const timeline = await generateCookingTimeline(ctx.gemini, {
          mealName: mealData.meal.name,
          guestCount: mealData.meal.guestCount,
          servingTime: mealData.meal.servingTime,
          serviceStyle: mealData.meal.serviceStyle,
          courses: mealData.courses.map((c) => ({
            courseType: c.courseType,
            courseOrder: c.courseOrder,
            recipe: {
              id: c.recipe.id,
              title: c.recipe.title,
              servings: c.recipe.servings,
              prepTimeMinutes: c.recipe.prepTimeMinutes,
              cookTimeMinutes: c.recipe.cookTimeMinutes,
              steps: c.recipe.steps,
            },
          })),
        });

        // Save timeline to meal
        await multiCourseMealRepository.saveTimeline(ctx.db, {
          mealId: input.mealId,
          userId: ctx.auth.user.id,
          timeline,
        });

        // Update status to complete
        await multiCourseMealRepository.updateGenerationStatus(ctx.db, {
          mealId: input.mealId,
          userId: ctx.auth.user.id,
          status: "complete",
        });
      } catch (error) {
        // Update status to error
        await multiCourseMealRepository.updateGenerationStatus(ctx.db, {
          mealId: input.mealId,
          userId: ctx.auth.user.id,
          status: "error",
          error: error instanceof Error ? error.message : "Generation failed",
        });
        throw error;
      }

      return { redirectTo: `/recipes/meals/${input.mealId}/generating` };
    }),

  /**
   * Get full meal data for printing
   */
  getPrintData: protectedProcedure
    .input(getMealInput)
    .query(async ({ ctx, input }) => {
      return await multiCourseMealRepository.getMealForPrint(ctx.db, {
        mealId: input.mealId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Get a public meal by username and slug (public route - no auth required)
   */
  getBySlug: publicProcedure
    .input(getBySlugInput)
    .query(async ({ ctx, input }) => {
      return await multiCourseMealRepository.getBySlug(ctx.db, {
        username: input.username,
        slug: input.slug,
      });
    }),

  /**
   * List public meals for a user (public route - no auth required)
   */
  listPublicMeals: publicProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await multiCourseMealRepository.listPublicMeals(ctx.db, {
        username: input.username,
      });
    }),
});
