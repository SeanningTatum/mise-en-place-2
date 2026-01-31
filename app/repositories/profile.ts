import { eq, sql } from "drizzle-orm";
import { userProfile, user, recipe, recipeImport } from "@/db/schema";
import {
  NotFoundError,
  CreationError,
  UpdateError,
  QueryError,
  ValidationError,
} from "@/models/errors";
import type { Context } from "@/trpc";
import { generateId } from "@/lib/utils";
import { loggers } from "@/lib/logger";

const log = loggers.repository.child({ repository: "profile" });

type Database = Context["db"];

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  "admin",
  "api",
  "auth",
  "settings",
  "profile",
  "recipes",
  "planner",
  "login",
  "signup",
  "sign-up",
  "logout",
  "help",
  "support",
  "about",
  "terms",
  "privacy",
  "contact",
  "new",
  "edit",
  "delete",
  "null",
  "undefined",
];

// Input interfaces
interface CreateProfileInput {
  userId: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface UpdateProfileInput {
  userId: string;
  username?: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isPublic?: boolean;
}

interface GetProfileByUserIdInput {
  userId: string;
}

interface GetProfileByUsernameInput {
  username: string;
}

interface CheckUsernameAvailableInput {
  username: string;
  excludeUserId?: string; // For updates where user keeps their own username
}

interface IncrementViewCountInput {
  username: string;
}

interface CreateRecipeImportInput {
  sourceRecipeId: string;
  importedRecipeId: string;
  importedById: string;
}

// Result types
export interface ProfileWithStats {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Computed stats
  totalRecipes: number;
  totalSaves: number;
}

export interface PublicProfileResponse {
  profile: {
    id: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    viewCount: number;
    createdAt: Date;
  };
  stats: {
    totalRecipes: number;
    totalSaves: number;
  };
  user: {
    name: string;
  };
}

/**
 * Validate username format
 * - 3-30 characters
 * - Lowercase letters, numbers, hyphens only
 * - Cannot start or end with hyphen
 * - Cannot have consecutive hyphens
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  log.trace({ username }, "Validating username format");

  if (username.length < 3) {
    log.debug({ username, reason: "too_short" }, "Username validation failed");
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (username.length > 30) {
    log.debug({ username, reason: "too_long" }, "Username validation failed");
    return { valid: false, error: "Username must be at most 30 characters" };
  }
  if (!/^[a-z0-9-]+$/.test(username)) {
    log.debug(
      { username, reason: "invalid_characters" },
      "Username validation failed",
    );
    return {
      valid: false,
      error:
        "Username can only contain lowercase letters, numbers, and hyphens",
    };
  }
  if (username.startsWith("-") || username.endsWith("-")) {
    log.debug(
      { username, reason: "starts_or_ends_with_hyphen" },
      "Username validation failed",
    );
    return {
      valid: false,
      error: "Username cannot start or end with a hyphen",
    };
  }
  if (username.includes("--")) {
    log.debug(
      { username, reason: "consecutive_hyphens" },
      "Username validation failed",
    );
    return { valid: false, error: "Username cannot have consecutive hyphens" };
  }
  if (RESERVED_USERNAMES.includes(username)) {
    log.debug({ username, reason: "reserved" }, "Username validation failed");
    return { valid: false, error: "This username is reserved" };
  }

  log.trace({ username }, "Username validation passed");
  return { valid: true };
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailable(
  db: Database,
  input: CheckUsernameAvailableInput,
): Promise<{ available: boolean; error?: string }> {
  log.debug(
    { username: input.username, excludeUserId: input.excludeUserId },
    "Checking username availability",
  );

  try {
    // First validate the format
    const validation = validateUsername(input.username);
    if (!validation.valid) {
      log.debug(
        { username: input.username, error: validation.error },
        "Username format validation failed",
      );
      return { available: false, error: validation.error };
    }

    // Check if taken by another user
    const existing = await db
      .select({ userId: userProfile.userId })
      .from(userProfile)
      .where(eq(userProfile.username, input.username.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      // If excluding a user (for updates), check if it's their own username
      if (input.excludeUserId && existing[0].userId === input.excludeUserId) {
        log.debug(
          { username: input.username, userId: input.excludeUserId },
          "Username available (own username)",
        );
        return { available: true };
      }
      log.debug(
        { username: input.username, takenBy: existing[0].userId },
        "Username already taken",
      );
      return { available: false, error: "This username is already taken" };
    }

    log.debug({ username: input.username }, "Username is available");
    return { available: true };
  } catch (error) {
    log.error(
      { err: error, username: input.username },
      "Failed to check username availability",
    );
    throw new QueryError(
      "profile",
      "Failed to check username availability",
      error,
    );
  }
}

/**
 * Create a new user profile
 */
export async function createProfile(
  db: Database,
  input: CreateProfileInput,
): Promise<{ id: string }> {
  log.debug(
    { userId: input.userId, username: input.username },
    "Creating profile",
  );

  try {
    // Validate and normalize username
    const normalizedUsername = input.username.toLowerCase().trim();
    const validation = validateUsername(normalizedUsername);
    if (!validation.valid) {
      log.warn(
        {
          userId: input.userId,
          username: normalizedUsername,
          error: validation.error,
        },
        "Profile creation failed: invalid username",
      );
      throw new ValidationError("profile", validation.error!, "username");
    }

    // Check availability
    const availability = await checkUsernameAvailable(db, {
      username: normalizedUsername,
    });
    if (!availability.available) {
      log.warn(
        {
          userId: input.userId,
          username: normalizedUsername,
          error: availability.error,
        },
        "Profile creation failed: username not available",
      );
      throw new ValidationError(
        "profile",
        availability.error || "Username is not available",
        "username",
      );
    }

    const profileId = generateId();

    await db.insert(userProfile).values({
      id: profileId,
      userId: input.userId,
      username: normalizedUsername,
      displayName: input.displayName ?? null,
      bio: input.bio ?? null,
      avatarUrl: input.avatarUrl ?? null,
      isPublic: false, // Default to private
    });

    log.info(
      { profileId, userId: input.userId, username: normalizedUsername },
      "Profile created successfully",
    );
    return { id: profileId };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    log.error(
      { err: error, userId: input.userId, username: input.username },
      "Failed to create profile",
    );
    throw new CreationError("profile", "Failed to create profile", error);
  }
}

/**
 * Update an existing user profile
 */
export async function updateProfile(
  db: Database,
  input: UpdateProfileInput,
): Promise<{ success: boolean }> {
  const fieldsToUpdate = Object.keys(input).filter(
    (key) =>
      key !== "userId" && input[key as keyof UpdateProfileInput] !== undefined,
  );
  log.debug(
    { userId: input.userId, fields: fieldsToUpdate },
    "Updating profile",
  );

  try {
    // Check if profile exists
    const existing = await db
      .select({ id: userProfile.id })
      .from(userProfile)
      .where(eq(userProfile.userId, input.userId))
      .limit(1);

    if (existing.length === 0) {
      log.warn(
        { userId: input.userId },
        "Profile update failed: profile not found",
      );
      throw new NotFoundError("profile", { userId: input.userId });
    }

    // If updating username, validate it
    if (input.username !== undefined) {
      const normalizedUsername = input.username.toLowerCase().trim();
      const validation = validateUsername(normalizedUsername);
      if (!validation.valid) {
        log.warn(
          {
            userId: input.userId,
            username: normalizedUsername,
            error: validation.error,
          },
          "Profile update failed: invalid username",
        );
        throw new ValidationError("profile", validation.error!, "username");
      }

      const availability = await checkUsernameAvailable(db, {
        username: normalizedUsername,
        excludeUserId: input.userId,
      });
      if (!availability.available) {
        log.warn(
          {
            userId: input.userId,
            username: normalizedUsername,
            error: availability.error,
          },
          "Profile update failed: username not available",
        );
        throw new ValidationError(
          "profile",
          availability.error || "Username is not available",
          "username",
        );
      }
    }

    // Build update object
    const updateData: Partial<typeof userProfile.$inferInsert> = {};
    if (input.username !== undefined) {
      updateData.username = input.username.toLowerCase().trim();
    }
    if (input.displayName !== undefined) {
      updateData.displayName = input.displayName;
    }
    if (input.bio !== undefined) {
      updateData.bio = input.bio;
    }
    if (input.avatarUrl !== undefined) {
      updateData.avatarUrl = input.avatarUrl;
    }
    if (input.isPublic !== undefined) {
      updateData.isPublic = input.isPublic;
    }

    log.trace(
      { userId: input.userId, updateData },
      "Profile update data prepared",
    );

    await db
      .update(userProfile)
      .set(updateData)
      .where(eq(userProfile.userId, input.userId));

    log.info(
      { userId: input.userId, fields: fieldsToUpdate },
      "Profile updated successfully",
    );
    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    log.error(
      { err: error, userId: input.userId, fields: fieldsToUpdate },
      "Failed to update profile",
    );
    throw new UpdateError("profile", "Failed to update profile", error);
  }
}

/**
 * Get profile by user ID (for settings)
 */
export async function getProfileByUserId(
  db: Database,
  input: GetProfileByUserIdInput,
): Promise<ProfileWithStats | null> {
  log.debug({ userId: input.userId }, "Getting profile by user ID");

  try {
    const profiles = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, input.userId))
      .limit(1);

    if (profiles.length === 0) {
      log.trace({ userId: input.userId }, "Profile not found");
      return null;
    }

    const profile = profiles[0];

    // Get stats
    const [recipeCount, saveCount] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(recipe)
        .where(eq(recipe.createdById, input.userId)),
      db
        .select({ count: sql<number>`coalesce(sum(${recipe.saveCount}), 0)` })
        .from(recipe)
        .where(eq(recipe.createdById, input.userId)),
    ]);

    const result = {
      ...profile,
      totalRecipes: recipeCount[0]?.count ?? 0,
      totalSaves: Number(saveCount[0]?.count ?? 0),
    };

    log.trace(
      {
        userId: input.userId,
        profileId: profile.id,
        totalRecipes: result.totalRecipes,
        totalSaves: result.totalSaves,
      },
      "Profile retrieved with stats",
    );
    return result;
  } catch (error) {
    log.error(
      { err: error, userId: input.userId },
      "Failed to get profile by user ID",
    );
    throw new QueryError("profile", "Failed to get profile", error);
  }
}

/**
 * Get public profile by username (for public view)
 */
export async function getPublicProfileByUsername(
  db: Database,
  input: GetProfileByUsernameInput,
): Promise<PublicProfileResponse | null> {
  const normalizedUsername = input.username.toLowerCase().trim();
  log.debug(
    { username: normalizedUsername },
    "Getting public profile by username",
  );

  try {
    // Get profile with user info
    const profiles = await db
      .select({
        id: userProfile.id,
        userId: userProfile.userId,
        username: userProfile.username,
        displayName: userProfile.displayName,
        bio: userProfile.bio,
        avatarUrl: userProfile.avatarUrl,
        isPublic: userProfile.isPublic,
        viewCount: userProfile.viewCount,
        createdAt: userProfile.createdAt,
        userName: user.name,
      })
      .from(userProfile)
      .innerJoin(user, eq(userProfile.userId, user.id))
      .where(eq(userProfile.username, normalizedUsername))
      .limit(1);

    if (profiles.length === 0) {
      log.trace({ username: normalizedUsername }, "Public profile not found");
      return null;
    }

    const profile = profiles[0];

    // Only return if public
    if (!profile.isPublic) {
      log.debug(
        { username: normalizedUsername, userId: profile.userId },
        "Profile is not public",
      );
      return null;
    }

    // Get stats
    const [recipeCount, saveCount] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(recipe)
        .where(eq(recipe.createdById, profile.userId)),
      db
        .select({ count: sql<number>`coalesce(sum(${recipe.saveCount}), 0)` })
        .from(recipe)
        .where(eq(recipe.createdById, profile.userId)),
    ]);

    const result = {
      profile: {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        viewCount: profile.viewCount,
        createdAt: profile.createdAt,
      },
      stats: {
        totalRecipes: recipeCount[0]?.count ?? 0,
        totalSaves: Number(saveCount[0]?.count ?? 0),
      },
      user: {
        name: profile.userName,
      },
    };

    log.trace(
      {
        username: normalizedUsername,
        profileId: profile.id,
        totalRecipes: result.stats.totalRecipes,
        totalSaves: result.stats.totalSaves,
      },
      "Public profile retrieved",
    );
    return result;
  } catch (error) {
    log.error(
      { err: error, username: normalizedUsername },
      "Failed to get public profile",
    );
    throw new QueryError("profile", "Failed to get public profile", error);
  }
}

/**
 * Increment view count for a profile
 */
export async function incrementViewCount(
  db: Database,
  input: IncrementViewCountInput,
): Promise<{ success: boolean }> {
  const normalizedUsername = input.username.toLowerCase().trim();
  log.debug(
    { username: normalizedUsername },
    "Incrementing profile view count",
  );

  try {
    await db
      .update(userProfile)
      .set({
        viewCount: sql`${userProfile.viewCount} + 1`,
      })
      .where(eq(userProfile.username, normalizedUsername));

    log.trace({ username: normalizedUsername }, "View count incremented");
    return { success: true };
  } catch (error) {
    log.error(
      { err: error, username: normalizedUsername },
      "Failed to increment view count",
    );
    throw new UpdateError("profile", "Failed to increment view count", error);
  }
}

/**
 * Create a recipe import record
 */
export async function createRecipeImport(
  db: Database,
  input: CreateRecipeImportInput,
): Promise<{ id: string }> {
  log.debug(
    {
      sourceRecipeId: input.sourceRecipeId,
      importedRecipeId: input.importedRecipeId,
      importedById: input.importedById,
    },
    "Creating recipe import record",
  );

  try {
    const importId = generateId();

    await db.insert(recipeImport).values({
      id: importId,
      sourceRecipeId: input.sourceRecipeId,
      importedRecipeId: input.importedRecipeId,
      importedById: input.importedById,
    });

    log.info(
      {
        importId,
        sourceRecipeId: input.sourceRecipeId,
        importedRecipeId: input.importedRecipeId,
        importedById: input.importedById,
      },
      "Recipe import record created",
    );
    return { id: importId };
  } catch (error) {
    log.error(
      {
        err: error,
        sourceRecipeId: input.sourceRecipeId,
        importedRecipeId: input.importedRecipeId,
        importedById: input.importedById,
      },
      "Failed to create recipe import record",
    );
    throw new CreationError(
      "recipeImport",
      "Failed to create recipe import record",
      error,
    );
  }
}
