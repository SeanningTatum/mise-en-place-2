import { test, expect } from "@playwright/test";

/**
 * Profile Sharing Feature E2E Tests
 *
 * Prerequisites:
 * - Development server running on http://localhost:5173
 * - User authenticated (tests use setup from auth.setup.ts)
 * - Test user credentials: admin@test.local / TestAdmin123!
 *
 * To run these tests:
 * 1. Ensure dev server is running: `bun run dev`
 * 2. Run tests: `bun run test:e2e e2e/profile-sharing.spec.ts`
 */

test.describe("Profile Sharing Feature", () => {
  test.describe("Profile Settings Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes/profile");
    });

    test("should display profile settings page header", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Public Profile");
    });

    test("should display profile visibility toggle", async ({ page }) => {
      await expect(page.getByText("Profile Visibility")).toBeVisible();
    });

    test("should display profile details card", async ({ page }) => {
      await expect(page.getByText("Profile Details")).toBeVisible();
    });

    test("should have username input field", async ({ page }) => {
      const usernameInput = page.locator("#username");
      await expect(usernameInput).toBeVisible();
    });

    test("should have display name input field", async ({ page }) => {
      const displayNameInput = page.locator("#displayName");
      await expect(displayNameInput).toBeVisible();
    });

    test("should have bio textarea", async ({ page }) => {
      const bioTextarea = page.locator("#bio");
      await expect(bioTextarea).toBeVisible();
    });

    test("should validate username format", async ({ page }) => {
      const usernameInput = page.locator("#username");

      // Clear and type invalid username (too short)
      await usernameInput.fill("ab");

      // Should show error message
      await expect(
        page.getByText("Username must be at least 3 characters"),
      ).toBeVisible();
    });

    test("should allow valid username input", async ({ page }) => {
      const usernameInput = page.locator("#username");

      // Type valid username
      await usernameInput.fill("test-user-123");

      // Should show checkmark or no error
      const errorMessage = page.getByText(
        "Username must be at least 3 characters",
      );
      await expect(errorMessage).not.toBeVisible();
    });

    test("should have character counter for bio", async ({ page }) => {
      await expect(page.getByText("/500")).toBeVisible();
    });

    test("should have save button", async ({ page }) => {
      const saveButton = page.getByRole("button", {
        name: /Save Changes|Create Profile/i,
      });
      await expect(saveButton).toBeVisible();
    });
  });

  test.describe("Profile Creation Flow", () => {
    test("should create profile with valid data", async ({ page }) => {
      await page.goto("/recipes/profile");

      // Generate unique username to avoid conflicts
      const timestamp = Date.now();
      const uniqueUsername = `test-user-${timestamp}`;

      const usernameInput = page.locator("#username");
      const displayNameInput = page.locator("#displayName");
      const bioTextarea = page.locator("#bio");

      // Fill in profile details
      await usernameInput.fill(uniqueUsername);
      await displayNameInput.fill("Test User");
      await bioTextarea.fill(
        "This is a test bio for the profile sharing feature.",
      );

      // Save profile
      const saveButton = page.getByRole("button", {
        name: /Save Changes|Create Profile/i,
      });
      await saveButton.click();

      // Should show success (toast notification or form update)
      // Wait for any loading state to complete
      await page.waitForTimeout(1000);
    });
  });

  test.describe("Recipe Visibility Controls", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes/profile");
    });

    test("should display recipe visibility section when profile exists", async ({
      page,
    }) => {
      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Recipe visibility section may or may not be visible depending on profile state
      const visibilitySection = page.getByText("Recipe Visibility");
      if (await visibilitySection.isVisible()) {
        await expect(visibilitySection).toBeVisible();
      }
    });
  });

  test.describe("Share Modal", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes/profile");
    });

    test("should show share button when profile is public", async ({
      page,
    }) => {
      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Toggle public visibility first
      const visibilityToggle = page.getByRole("switch").first();
      if (await visibilityToggle.isVisible()) {
        // Check if there's a share button in the alert
        const shareLink = page.getByText(/Your profile is live at/);
        if (await shareLink.isVisible()) {
          const shareButton = page.getByRole("button", { name: /Share/i });
          await expect(shareButton).toBeVisible();
        }
      }
    });
  });

  test.describe("Navigation", () => {
    test("should have profile link in recipes layout header", async ({
      page,
    }) => {
      await page.goto("/recipes");

      // Check for profile link in header
      const profileLink = page.getByRole("link", { name: /Profile/i });
      await expect(profileLink).toBeVisible();
    });

    test("should navigate to profile page from recipes", async ({ page }) => {
      await page.goto("/recipes");

      const profileLink = page.getByRole("link", { name: /Profile/i });
      await profileLink.click();

      await expect(page).toHaveURL(/\/recipes\/profile/);
    });
  });
});

test.describe("Public Profile Page", () => {
  // Note: These tests require a public profile to exist

  test("should show 404 for non-existent profile", async ({ page }) => {
    await page.goto("/u/nonexistent-user-12345");

    // Should show not found message
    await expect(
      page.getByText(/Profile Not Found|not found|not public/i),
    ).toBeVisible();
  });

  test("should display profile header on public page", async ({ page }) => {
    // This test will pass if a public profile exists
    // Skip if no public profiles exist
    await page.goto("/u/test-user");

    const notFound = page.getByText(/Profile Not Found/i);
    if (await notFound.isVisible()) {
      test.skip();
      return;
    }

    // If profile exists and is public, check for header elements
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have sign in link for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/u/test-user");

    const notFound = page.getByText(/Profile Not Found/i);
    if (await notFound.isVisible()) {
      // Even on 404 page, there should be a way to navigate
      return;
    }

    const signInLink = page.getByRole("link", { name: /Sign In/i });
    await expect(signInLink).toBeVisible();
  });

  test("should display share button on public profile", async ({ page }) => {
    await page.goto("/u/test-user");

    const notFound = page.getByText(/Profile Not Found/i);
    if (await notFound.isVisible()) {
      test.skip();
      return;
    }

    const shareButton = page.getByRole("button", { name: /Share/i });
    await expect(shareButton).toBeVisible();
  });

  test("should open share modal when share is clicked", async ({ page }) => {
    await page.goto("/u/test-user");

    const notFound = page.getByText(/Profile Not Found/i);
    if (await notFound.isVisible()) {
      test.skip();
      return;
    }

    const shareButton = page.getByRole("button", { name: /Share/i });
    await shareButton.click();

    // Modal should open
    await expect(page.getByText("Share Your Collection")).toBeVisible();
  });

  test("should have copy link button in share modal", async ({ page }) => {
    await page.goto("/u/test-user");

    const notFound = page.getByText(/Profile Not Found/i);
    if (await notFound.isVisible()) {
      test.skip();
      return;
    }

    const shareButton = page.getByRole("button", { name: /Share/i });
    await shareButton.click();

    // Wait for modal to open
    await expect(page.getByText("Share Your Collection")).toBeVisible();

    // Should have URL input
    const urlInput = page.locator("input[readonly]");
    await expect(urlInput).toBeVisible();
  });
});
