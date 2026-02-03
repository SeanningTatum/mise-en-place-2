import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "..";
import * as mealPlanTemplateRepository from "@/repositories/meal-plan-template";

export const mealPlanTemplateRouter = createTRPCRouter({
  /**
   * Create a new meal plan template from an existing meal plan
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        theme: z.string().max(50).optional(),
        mealPlanId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await mealPlanTemplateRepository.createTemplate(ctx.db, {
        userId: ctx.auth.user.id,
        name: input.name,
        description: input.description ?? null,
        theme: input.theme ?? null,
        mealPlanId: input.mealPlanId,
      });
    }),

  /**
   * Update a meal plan template
   */
  update: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).nullish(),
        theme: z.string().max(50).nullish(),
        coverImageUrl: z.string().url().nullish(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await mealPlanTemplateRepository.updateTemplate(ctx.db, {
        templateId: input.templateId,
        userId: ctx.auth.user.id,
        name: input.name,
        description: input.description,
        theme: input.theme,
        coverImageUrl: input.coverImageUrl,
        isPublic: input.isPublic,
      });
    }),

  /**
   * Delete a meal plan template
   */
  delete: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await mealPlanTemplateRepository.deleteTemplate(ctx.db, {
        templateId: input.templateId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * Get a template by ID (owner only)
   */
  getById: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await mealPlanTemplateRepository.getTemplateById(ctx.db, {
        templateId: input.templateId,
        userId: ctx.auth.user.id,
      });
    }),

  /**
   * List user's templates
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return await mealPlanTemplateRepository.listUserTemplates(ctx.db, {
      userId: ctx.auth.user.id,
    });
  }),

  /**
   * Get a public template by username and slug
   */
  getPublicBySlug: publicProcedure
    .input(
      z.object({
        username: z.string(),
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await mealPlanTemplateRepository.getPublicTemplateBySlug(ctx.db, {
        username: input.username,
        slug: input.slug,
      });
    }),

  /**
   * List public templates for a user
   */
  listPublic: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await mealPlanTemplateRepository.listPublicTemplates(ctx.db, {
        username: input.username,
      });
    }),

  /**
   * Import a template to user's meal plan for a specific week
   */
  import: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        targetWeekStart: z.string(), // ISO date string (Monday)
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await mealPlanTemplateRepository.importTemplate(ctx.db, {
        templateId: input.templateId,
        userId: ctx.auth.user.id,
        targetWeekStart: input.targetWeekStart,
      });
    }),

  /**
   * Increment view count for a template (fire and forget)
   */
  incrementViewCount: publicProcedure
    .input(
      z.object({
        templateId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await mealPlanTemplateRepository.incrementViewCount(ctx.db, {
        templateId: input.templateId,
      });
    }),
});
