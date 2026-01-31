import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "..";
import * as profileRepository from "@/repositories/profile";
import * as recipeRepository from "@/repositories/recipe";
import { loggers } from "@/lib/logger";

const log = loggers.trpc.child({ path: "profile" });

// Username validation schema
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Username can only contain lowercase letters, numbers, and hyphens",
  )
  .refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
    message: "Username cannot start or end with a hyphen",
  })
  .refine((val) => !val.includes("--"), {
    message: "Username cannot have consecutive hyphens",
  });

export const profileRouter = createTRPCRouter({
  // ============================================================
  // Protected Routes (require authentication)
  // ============================================================

  /**
   * Get current user's profile (for settings page)
   */
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    log.debug({ userId: ctx.auth.user.id }, "Getting current user profile");
    const profile = await profileRepository.getProfileByUserId(ctx.db, {
      userId: ctx.auth.user.id,
    });
    log.trace(
      { userId: ctx.auth.user.id, found: !!profile },
      "Profile lookup result",
    );
    return profile;
  }),

  /**
   * Check if a username is available
   */
  checkUsername: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      log.debug(
        { username: input.username, userId: ctx.auth.user.id },
        "Checking username availability",
      );
      const result = await profileRepository.checkUsernameAvailable(ctx.db, {
        username: input.username.toLowerCase(),
        excludeUserId: ctx.auth.user.id,
      });
      log.trace(
        {
          username: input.username,
          available: result.available,
          error: result.error,
        },
        "Username check result",
      );
      return result;
    }),

  /**
   * Create a new profile
   */
  createProfile: protectedProcedure
    .input(
      z.object({
        username: usernameSchema,
        displayName: z.string().min(2).max(50).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      log.info(
        { userId: ctx.auth.user.id, username: input.username },
        "Creating profile",
      );
      const result = await profileRepository.createProfile(ctx.db, {
        userId: ctx.auth.user.id,
        username: input.username,
        displayName: input.displayName,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
      });
      log.info(
        {
          profileId: result.id,
          userId: ctx.auth.user.id,
          username: input.username,
        },
        "Profile created successfully",
      );
      return result;
    }),

  /**
   * Update existing profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        username: usernameSchema.optional(),
        displayName: z.string().min(2).max(50).nullish(),
        bio: z.string().max(500).nullish(),
        avatarUrl: z.string().url().nullish(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fieldsToUpdate = Object.keys(input).filter(
        (key) => input[key as keyof typeof input] !== undefined,
      );
      log.info(
        { userId: ctx.auth.user.id, fields: fieldsToUpdate },
        "Updating profile",
      );
      const result = await profileRepository.updateProfile(ctx.db, {
        userId: ctx.auth.user.id,
        username: input.username,
        displayName: input.displayName,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
        isPublic: input.isPublic,
      });
      log.info(
        { userId: ctx.auth.user.id, fields: fieldsToUpdate },
        "Profile updated successfully",
      );
      return result;
    }),

  /**
   * Get user's recipes for visibility management
   */
  getMyRecipesForVisibility: protectedProcedure.query(async ({ ctx }) => {
    log.debug(
      { userId: ctx.auth.user.id },
      "Getting recipes for visibility management",
    );
    const recipes = await recipeRepository.getUserRecipesForVisibility(ctx.db, {
      userId: ctx.auth.user.id,
    });
    log.trace(
      { userId: ctx.auth.user.id, recipeCount: recipes.length },
      "Recipes retrieved for visibility",
    );
    return recipes;
  }),

  /**
   * Set a single recipe's visibility
   */
  setRecipeVisibility: protectedProcedure
    .input(
      z.object({
        recipeId: z.string(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      log.info(
        {
          userId: ctx.auth.user.id,
          recipeId: input.recipeId,
          isPublic: input.isPublic,
        },
        "Setting recipe visibility",
      );
      const result = await recipeRepository.setRecipeVisibility(ctx.db, {
        recipeId: input.recipeId,
        userId: ctx.auth.user.id,
        isPublic: input.isPublic,
      });
      log.info(
        {
          userId: ctx.auth.user.id,
          recipeId: input.recipeId,
          isPublic: input.isPublic,
        },
        "Recipe visibility updated",
      );
      return result;
    }),

  /**
   * Set visibility for multiple recipes
   */
  setBulkRecipeVisibility: protectedProcedure
    .input(
      z.object({
        recipeIds: z.array(z.string()),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      log.info(
        {
          userId: ctx.auth.user.id,
          recipeCount: input.recipeIds.length,
          isPublic: input.isPublic,
        },
        "Setting bulk recipe visibility",
      );
      const result = await recipeRepository.setBulkRecipeVisibility(ctx.db, {
        recipeIds: input.recipeIds,
        userId: ctx.auth.user.id,
        isPublic: input.isPublic,
      });
      log.info(
        {
          userId: ctx.auth.user.id,
          recipeCount: input.recipeIds.length,
          isPublic: input.isPublic,
        },
        "Bulk recipe visibility updated",
      );
      return result;
    }),

  /**
   * Import (save) a public recipe to own collection
   */
  importRecipe: protectedProcedure
    .input(z.object({ recipeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      log.info(
        { userId: ctx.auth.user.id, sourceRecipeId: input.recipeId },
        "Importing recipe",
      );

      // Clone the recipe
      const clonedRecipe = await recipeRepository.cloneRecipe(ctx.db, {
        recipeId: input.recipeId,
        newOwnerId: ctx.auth.user.id,
      });
      log.debug(
        {
          userId: ctx.auth.user.id,
          sourceRecipeId: input.recipeId,
          clonedRecipeId: clonedRecipe.id,
        },
        "Recipe cloned",
      );

      // Increment the save count on the original
      await recipeRepository.incrementSaveCount(ctx.db, {
        recipeId: input.recipeId,
      });
      log.trace(
        { recipeId: input.recipeId },
        "Save count incremented on source recipe",
      );

      // Create import record for tracking
      await profileRepository.createRecipeImport(ctx.db, {
        sourceRecipeId: input.recipeId,
        importedRecipeId: clonedRecipe.id,
        importedById: ctx.auth.user.id,
      });

      log.info(
        {
          userId: ctx.auth.user.id,
          sourceRecipeId: input.recipeId,
          newRecipeId: clonedRecipe.id,
        },
        "Recipe imported successfully",
      );
      return { newRecipeId: clonedRecipe.id };
    }),

  // ============================================================
  // Public Routes (no authentication required)
  // ============================================================

  /**
   * Get public profile by username
   */
  getPublicProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      log.debug({ username: input.username }, "Getting public profile");
      const profile = await profileRepository.getPublicProfileByUsername(
        ctx.db,
        {
          username: input.username,
        },
      );
      log.trace(
        { username: input.username, found: !!profile },
        "Public profile lookup result",
      );
      return profile;
    }),

  /**
   * Get public recipes for a profile
   */
  getPublicRecipes: publicProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await recipeRepository.getPublicRecipesByUsername(ctx.db, {
        username: input.username,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  /**
   * Get a single public recipe by slug
   */
  getPublicRecipe: publicProcedure
    .input(
      z.object({
        username: z.string(),
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await recipeRepository.getPublicRecipeBySlug(ctx.db, {
        username: input.username,
        slug: input.slug,
      });
    }),

  /**
   * Increment view count for a profile
   */
  incrementViewCount: publicProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      log.debug(
        { username: input.username },
        "Incrementing profile view count",
      );
      const result = await profileRepository.incrementViewCount(ctx.db, {
        username: input.username,
      });
      log.trace({ username: input.username }, "View count incremented");
      return result;
    }),
});
