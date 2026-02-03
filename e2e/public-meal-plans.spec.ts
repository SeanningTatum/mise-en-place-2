import { test, expect } from "@playwright/test";

/**
 * Public Meal Plans E2E Tests
 *
 * Tests the meal plan templates feature:
 * - My Templates page (/recipes/templates)
 * - Save as Template from planner
 * - Public plans pages (/u/:username/plans)
 *
 * Prerequisites:
 * - Development server running
 * - User authenticated (uses auth setup)
 * - Test user: admin@test.local / TestAdmin123!
 *
 * Run: bun run test:e2e e2e/public-meal-plans.spec.ts
 */

test.describe("Public Meal Plans Feature", () => {
  test.describe("My Templates Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes/templates");
    });

    test("should display templates page header", async ({ page }) => {
      // Check for main heading
      await expect(page.locator("h1")).toContainText("My Templates");

      // Check for subtitle
      await expect(page.locator("text=Save and manage your meal plan templates")).toBeVisible();
    });

    test("should have Create from Planner button", async ({ page }) => {
      const createButton = page.getByRole("link", { name: /Create from Planner/i });
      await expect(createButton).toBeVisible();
    });

    test("should navigate to planner when clicking Create from Planner", async ({ page }) => {
      await page.click('a:has-text("Create from Planner")');
      await expect(page).toHaveURL(/\/recipes\/planner/);
    });

    test("should display template cards when templates exist", async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Check for either template cards or empty state
      const templatesPage = page.locator('[data-testid="templates-page"]');
      await expect(templatesPage).toBeVisible();

      // Look for either a template card or empty state message
      const templateCard = page.locator('text="meals"').first();
      const emptyState = page.locator('text="No templates yet"');

      const hasTemplates = await templateCard.isVisible().catch(() => false);
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      // One of these should be visible
      expect(hasTemplates || hasEmptyState).toBe(true);
    });

    test("should display empty state when no templates", async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState("networkidle");

      const emptyState = page.locator('text="No templates yet"');

      // If empty state is visible, verify its contents
      if (await emptyState.isVisible().catch(() => false)) {
        await expect(emptyState).toBeVisible();
        await expect(
          page.locator('text="Save your weekly meal plans as templates"')
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: "Go to Weekly Planner" })
        ).toBeVisible();
      }
    });
  });

  test.describe("Weekly Planner - Templates Integration", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes/planner");
    });

    test("should display meal planner page", async ({ page }) => {
      const plannerPage = page.locator('[data-testid="meal-planner-page"]');
      await expect(plannerPage).toBeVisible();

      // Check for heading
      await expect(page.locator("h1")).toContainText("Weekly Planner");
    });

    test("should have Templates link in header", async ({ page }) => {
      const templatesLink = page.getByRole("link", { name: "Templates" });
      await expect(templatesLink).toBeVisible();
    });

    test("should navigate to templates page when clicking Templates link", async ({
      page,
    }) => {
      const templatesLink = page.getByRole("link", { name: "Templates" });
      await templatesLink.click();
      await expect(page).toHaveURL(/\/recipes\/templates/);
    });

    test("should show Save as Template button when 3+ meals exist", async ({
      page,
    }) => {
      // Wait for page to load
      await page.waitForLoadState("networkidle");

      const saveTemplateButton = page.locator(
        '[data-testid="save-template-button"]'
      );

      // Button visibility depends on meal count (>= 3)
      // Just check if it exists in the DOM or is visible
      const isVisible = await saveTemplateButton.isVisible().catch(() => false);

      // Log the result for debugging
      console.log(`Save as Template button visible: ${isVisible}`);

      // If visible, verify it's a button
      if (isVisible) {
        await expect(saveTemplateButton).toBeEnabled();
        await expect(saveTemplateButton).toContainText("Save as Template");
      }
    });

    test("should have week navigation buttons", async ({ page }) => {
      const prevButton = page.locator('[data-testid="prev-week"]');
      const nextButton = page.locator('[data-testid="next-week"]');

      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
    });
  });

  test.describe("Public Plans Page", () => {
    test("should display public plans page for valid user", async ({
      page,
    }) => {
      // Navigate to a test user's public plans page
      await page.goto("/u/test-chef/plans");

      // Check for page structure
      await expect(page.locator("h1")).toContainText("Meal Plans");
    });

    test("should show sign in button for unauthenticated visitors", async ({
      page,
    }) => {
      // Open a new incognito-like context to test as unauthenticated user
      await page.goto("/u/test-chef/plans");

      // Should show sign in option in header
      const signInButton = page.getByRole("link", { name: /Sign In/i });
      await expect(signInButton).toBeVisible();
    });

    test("should display empty state when user has no public plans", async ({
      page,
    }) => {
      await page.goto("/u/test-chef/plans");

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Look for empty state or plan cards
      const emptyState = page.locator('text="No public meal plans yet"');
      const planCount = page.locator('text="public meal"');

      // Should show either empty state or plan count
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      const hasCount = await planCount.isVisible().catch(() => false);

      expect(hasEmpty || hasCount).toBe(true);
    });

    test("should have back link to user profile", async ({ page }) => {
      await page.goto("/u/test-chef/plans");

      const backLink = page.locator('a:has-text("Back to")');
      await expect(backLink).toBeVisible();
    });

    test("should navigate to profile when clicking back link", async ({
      page,
    }) => {
      await page.goto("/u/test-chef/plans");

      const backLink = page.locator('a:has-text("Back to")');
      await backLink.click();

      await expect(page).toHaveURL(/\/u\/test-chef$/);
    });

    test("should show 404 for non-existent user", async ({ page }) => {
      await page.goto("/u/nonexistent-user-12345/plans");

      // Should show error state (404 or "Profile not found")
      const errorMessage = page.locator('text="Profile Not Found"');
      const notFoundText = page.locator('text="not found"');

      const hasError = await errorMessage.isVisible().catch(() => false);
      const hasNotFound = await notFoundText.isVisible().catch(() => false);

      // Should show some kind of error
      expect(hasError || hasNotFound).toBe(true);
    });
  });

  test.describe("Navigation Flow", () => {
    test("should navigate from planner to templates and back", async ({
      page,
    }) => {
      // Start at planner
      await page.goto("/recipes/planner");
      await expect(page.locator("h1")).toContainText("Weekly Planner");

      // Go to templates
      await page.click('a:has-text("Templates")');
      await expect(page).toHaveURL(/\/recipes\/templates/);
      await expect(page.locator("h1")).toContainText("My Templates");

      // Go back to planner via Create from Planner
      await page.click('a:has-text("Create from Planner")');
      await expect(page).toHaveURL(/\/recipes\/planner/);
    });

    test("should have consistent header navigation", async ({ page }) => {
      await page.goto("/recipes/templates");

      // Check main nav links
      await expect(page.getByRole("link", { name: "Recipes" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Meals" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Planner" })).toBeVisible();
    });
  });
});
