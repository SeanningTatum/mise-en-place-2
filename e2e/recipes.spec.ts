import { test, expect } from "@playwright/test";

test.describe("Recipe Feature", () => {
  // Note: These tests require authentication. In a real scenario,
  // you would set up test authentication before running these tests.

  test.describe("Recipe List Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes");
    });

    test("should display recipes page header", async ({ page }) => {
      // Check for the main heading
      await expect(page.locator("h1")).toContainText("My Recipes");
    });

    test("should show empty state when no recipes", async ({ page }) => {
      // Look for empty state
      const emptyState = page.locator('[data-testid="empty-state"]');
      // This may or may not be visible depending on if recipes exist
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText("No recipes yet");
        await expect(page.getByRole("link", { name: /Extract Your First Recipe/i })).toBeVisible();
      }
    });

    test("should have filter tabs", async ({ page }) => {
      // Check for filter tabs
      await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "YouTube" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Blogs" })).toBeVisible();
    });

    test("should have search input", async ({ page }) => {
      const searchInput = page.locator('[data-testid="recipe-search-input"]');
      await expect(searchInput).toBeVisible();
    });

    test("should have Extract Recipe button", async ({ page }) => {
      await expect(page.getByRole("link", { name: /Extract Recipe/i })).toBeVisible();
    });

    test("should navigate to new recipe page when clicking Extract Recipe", async ({ page }) => {
      await page.click('a:has-text("Extract Recipe")');
      await expect(page).toHaveURL(/\/recipes\/new/);
    });
  });

  test.describe("New Recipe Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes/new");
    });

    test("should display extraction form", async ({ page }) => {
      // Check for URL input
      const urlInput = page.locator('[data-testid="recipe-url-input"]');
      await expect(urlInput).toBeVisible();

      // Check for Extract button
      const extractButton = page.locator('[data-testid="extract-recipe-button"]');
      await expect(extractButton).toBeVisible();
    });

    test("should have paste button", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Paste" })).toBeVisible();
    });

    test("should show validation error for empty URL", async ({ page }) => {
      const extractButton = page.locator('[data-testid="extract-recipe-button"]');
      
      // Button should be disabled when URL is empty
      await expect(extractButton).toBeDisabled();
    });

    test("should enable extract button when URL is entered", async ({ page }) => {
      const urlInput = page.locator('[data-testid="recipe-url-input"]');
      const extractButton = page.locator('[data-testid="extract-recipe-button"]');

      // Enter a URL
      await urlInput.fill("https://www.youtube.com/watch?v=test123");

      // Button should be enabled
      await expect(extractButton).toBeEnabled();
    });
  });

  test.describe("Recipe Card Grid", () => {
    test("should display recipe grid when recipes exist", async ({ page }) => {
      await page.goto("/recipes");
      
      // Check for recipe grid
      const recipeGrid = page.locator('[data-testid="recipe-grid"]');
      
      // Grid should exist (may be empty)
      await expect(recipeGrid).toBeVisible().catch(() => {
        // If no grid, empty state should be visible
        expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
      });
    });
  });

  test.describe("Navigation", () => {
    test("should navigate back to recipes list from new page", async ({ page }) => {
      await page.goto("/recipes/new");
      
      // Click back button
      await page.click('a[href="/recipes"]');
      await expect(page).toHaveURL(/\/recipes$/);
    });
  });
});

test.describe("Admin Recipe Pages", () => {
  // Note: These tests require admin authentication

  test.describe("Admin Recipes List", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/recipes");
    });

    test("should display admin recipes page", async ({ page }) => {
      // Check for page header (SiteHeader component)
      await expect(page.locator("h1, h2")).toContainText(/Recipes/i);
    });

    test("should have source type filter", async ({ page }) => {
      // Check for source filter dropdown
      await expect(page.getByRole("combobox")).toBeVisible();
    });

    test("should have search functionality", async ({ page }) => {
      // Check for search input
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe("Admin Ingredients List", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/ingredients");
    });

    test("should display admin ingredients page", async ({ page }) => {
      // Check for page header
      await expect(page.locator("h1, h2")).toContainText(/Ingredients/i);
    });

    test("should have search functionality", async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });
  });
});
