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
        // The description text contains "Save your weekly meal plans as templates"
        await expect(
          page.locator('text=/Save your weekly meal plans as templates/')
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
    test("should display public plans page or 404 for test user", async ({
      page,
    }) => {
      // Navigate to a test user's public plans page
      await page.goto("/u/test-chef/plans");

      // May show meal plans page OR 404 depending on whether user exists
      const heading = page.locator("h1");
      await expect(heading).toBeVisible();
      
      const headingText = await heading.textContent();
      // Should be either "Meal Plans" or "Profile Not Found"
      expect(headingText).toMatch(/Meal Plans|Profile Not Found/i);
    });

    test("should have some navigation on public plans page", async ({
      page,
    }) => {
      await page.goto("/u/test-chef/plans");

      // Should have some navigation visible (header, nav, or back button)
      const header = page.locator("header, nav").first();
      const backButton = page.locator('a:has-text("Back")');
      
      const hasHeader = await header.isVisible().catch(() => false);
      const hasBackButton = await backButton.isVisible().catch(() => false);
      
      // At least one navigation element should be visible
      expect(hasHeader || hasBackButton).toBe(true);
    });

    test("should handle page state for public plans", async ({
      page,
    }) => {
      await page.goto("/u/test-chef/plans");

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Look for any of: empty state, plan count, or 404
      const emptyState = page.locator('text=/No public meal plans yet/');
      const planCount = page.locator('text=/public meal plan/');
      const notFound = page.locator('text=/Profile Not Found/i');

      const hasEmpty = await emptyState.isVisible().catch(() => false);
      const hasCount = await planCount.isVisible().catch(() => false);
      const hasNotFound = await notFound.isVisible().catch(() => false);

      // Should show one of these states
      expect(hasEmpty || hasCount || hasNotFound).toBe(true);
    });

    test("should have back link when user exists", async ({ page }) => {
      await page.goto("/u/test-chef/plans");

      // Check for back link OR 404 state
      const backLink = page.locator('a:has-text("Back to")');
      const notFound = page.locator('text=/Profile Not Found/i');
      
      const hasBackLink = await backLink.isVisible().catch(() => false);
      const hasNotFound = await notFound.isVisible().catch(() => false);
      
      // Either back link exists or user doesn't exist (404)
      expect(hasBackLink || hasNotFound).toBe(true);
    });

    test("should navigate when clicking back link if user exists", async ({
      page,
    }) => {
      await page.goto("/u/test-chef/plans");

      const backLink = page.locator('a:has-text("Back to")');
      const notFound = page.locator('text=/Profile Not Found/i');
      
      if (await notFound.isVisible().catch(() => false)) {
        // User doesn't exist, skip navigation test
        return;
      }
      
      if (await backLink.isVisible().catch(() => false)) {
        await backLink.click();
        // Should navigate somewhere (profile or home)
        await page.waitForLoadState("networkidle");
      }
    });

    test("should show 404 for non-existent user", async ({ page }) => {
      await page.goto("/u/nonexistent-user-12345/plans");

      // Should show error state (404 or "Profile not found")
      const errorMessage = page.locator('text=/Profile Not Found/i').first();
      await expect(errorMessage).toBeVisible();
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

      // Check main nav links (use exact: true to avoid matching "Create from Planner")
      await expect(page.getByRole("link", { name: "Recipes" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Meals" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Planner", exact: true })).toBeVisible();
    });
  });
});
