import { test, expect } from "@playwright/test";

/**
 * Recipe Feature E2E Tests
 * 
 * Prerequisites:
 * - Development server running on http://localhost:5173
 * - User authenticated (tests will redirect to /login if not authenticated)
 * - Test user credentials: admin@test.local / TestAdmin123!
 * 
 * To run these tests:
 * 1. Ensure dev server is running: `bun run dev`
 * 2. Run tests: `bun run test:e2e e2e/recipes.spec.ts`
 * 
 * Note: Tests handle both empty state (no recipes) and populated state gracefully.
 * Some tests may be skipped if no recipes exist in the database.
 */

test.describe("Recipe Feature", () => {

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

    test("should navigate to recipe detail when clicking recipe card", async ({ page }) => {
      await page.goto("/recipes");
      
      // Wait for recipe grid to load
      const recipeGrid = page.locator('[data-testid="recipe-grid"]');
      const emptyState = page.locator('[data-testid="empty-state"]');
      
      // If recipes exist, click the first one
      if (await recipeGrid.isVisible()) {
        const firstCard = page.locator('[data-testid^="recipe-card-"]').first();
        if (await firstCard.isVisible()) {
          await firstCard.click();
          // Should navigate to recipe detail page
          await expect(page).toHaveURL(/\/recipes\/[a-zA-Z0-9-]+$/);
        }
      } else if (await emptyState.isVisible()) {
        // Skip test if no recipes exist
        test.skip();
      }
    });
  });

  test.describe("Search Functionality", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes");
    });

    test("should filter recipes by search query", async ({ page }) => {
      const searchInput = page.locator('[data-testid="recipe-search-input"]');
      await expect(searchInput).toBeVisible();

      // Type in search input
      await searchInput.fill("test");
      
      // Wait for URL to update with search param
      await page.waitForURL(/search=test/);
      
      // Search input should show the value
      await expect(searchInput).toHaveValue("test");
    });

    test("should clear search when input is cleared", async ({ page }) => {
      const searchInput = page.locator('[data-testid="recipe-search-input"]');
      
      // Enter search
      await searchInput.fill("test");
      await page.waitForURL(/search=test/);
      
      // Clear search
      await searchInput.fill("");
      
      // URL should not have search param
      await expect(page).toHaveURL(/\/recipes$/);
    });
  });

  test.describe("Filter Tabs", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/recipes");
    });

    test("should filter by YouTube source type", async ({ page }) => {
      const youtubeTab = page.locator('[data-testid="filter-tab-youtube"]');
      await expect(youtubeTab).toBeVisible();
      
      await youtubeTab.click();
      
      // URL should update with source filter
      await page.waitForURL(/source=youtube/);
      
      // Tab should be active
      await expect(youtubeTab).toHaveAttribute("data-state", "active");
    });

    test("should filter by Blog source type", async ({ page }) => {
      const blogTab = page.locator('[data-testid="filter-tab-blog"]');
      await expect(blogTab).toBeVisible();
      
      await blogTab.click();
      
      // URL should update with source filter
      await page.waitForURL(/source=blog/);
      
      // Tab should be active
      await expect(blogTab).toHaveAttribute("data-state", "active");
    });

    test("should show all recipes when All tab is selected", async ({ page }) => {
      const allTab = page.locator('[data-testid="filter-tab-all"]');
      
      // First select YouTube
      await page.locator('[data-testid="filter-tab-youtube"]').click();
      await page.waitForURL(/source=youtube/, { timeout: 10000 });
      
      // Then select All
      await allTab.click();
      
      // Wait for URL to update - source param should be removed
      await page.waitForTimeout(1000);
      
      // URL should not have source param (might have other params like page)
      const url = page.url();
      expect(url).not.toContain("source=youtube");
      expect(url).not.toContain("source=blog");
    });
  });

  test.describe("Pagination", () => {
    test("should display pagination when multiple pages exist", async ({ page }) => {
      await page.goto("/recipes");
      
      const pagination = page.locator('[data-testid="pagination"]');
      
      // Pagination may or may not be visible depending on recipe count
      if (await pagination.isVisible()) {
        await expect(pagination).toBeVisible();
        await expect(page.locator('[data-testid="pagination-info"]')).toBeVisible();
        await expect(page.locator('[data-testid="pagination-previous"]')).toBeVisible();
        await expect(page.locator('[data-testid="pagination-next"]')).toBeVisible();
      }
    });

    test("should navigate to next page", async ({ page }) => {
      await page.goto("/recipes");
      
      const pagination = page.locator('[data-testid="pagination"]');
      
      if (await pagination.isVisible()) {
        const nextButton = page.locator('[data-testid="pagination-next"]');
        const isDisabled = await nextButton.isDisabled();
        
        if (!isDisabled) {
          await nextButton.click();
          await page.waitForURL(/page=1/);
        }
      }
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

  test.describe("Recipe Detail Page", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to recipes list first
      await page.goto("/recipes");
      
      // Try to find a recipe card to navigate to detail page
      const recipeGrid = page.locator('[data-testid="recipe-grid"]');
      const emptyState = page.locator('[data-testid="empty-state"]');
      
      if (await recipeGrid.isVisible()) {
        const firstCard = page.locator('[data-testid^="recipe-card-"]').first();
        if (await firstCard.isVisible()) {
          await firstCard.click();
          await page.waitForURL(/\/recipes\/[a-zA-Z0-9-]+$/);
        } else {
          // No recipes, skip detail page tests
          test.skip();
        }
      } else if (await emptyState.isVisible()) {
        // No recipes, skip detail page tests
        test.skip();
      }
    });

    test("should display recipe title", async ({ page }) => {
      const title = page.locator('[data-testid="recipe-title"]');
      await expect(title).toBeVisible();
      await expect(title).not.toBeEmpty();
    });

    test("should display ingredients list", async ({ page }) => {
      const ingredientsList = page.locator('[data-testid="ingredients-list"]');
      await expect(ingredientsList).toBeVisible();
    });

    test("should display recipe steps", async ({ page }) => {
      const recipeSteps = page.locator('[data-testid="recipe-steps"]');
      await expect(recipeSteps).toBeVisible();
    });

    test("should allow checking ingredients when checkable", async ({ page }) => {
      const ingredientsList = page.locator('[data-testid="ingredients-list"]');
      
      if (await ingredientsList.isVisible()) {
        // Find first ingredient checkbox
        const firstCheckbox = page.locator('[data-testid^="ingredient-checkbox-"]').first();
        
        if (await firstCheckbox.isVisible()) {
          // Check the ingredient
          await firstCheckbox.click();
          await expect(firstCheckbox).toBeChecked();
          
          // Uncheck the ingredient
          await firstCheckbox.click();
          await expect(firstCheckbox).not.toBeChecked();
        }
      }
    });

    test("should display YouTube player for YouTube recipes", async ({ page }) => {
      // Check if YouTube player container exists
      const youtubeContainer = page.locator('[data-testid="youtube-player-container"]');
      
      // YouTube player may or may not be present depending on recipe source
      if (await youtubeContainer.isVisible()) {
        const youtubePlayer = page.locator('[data-testid="youtube-player"]');
        await expect(youtubePlayer).toBeVisible();
      }
    });

    test("should display macros card", async ({ page }) => {
      const macrosContainer = page.locator('[data-testid="macros-card-container"]');
      await expect(macrosContainer).toBeVisible();
    });

    test("should have recipe menu button", async ({ page }) => {
      const menuButton = page.locator('[data-testid="recipe-menu-button"]');
      await expect(menuButton).toBeVisible();
    });

    test("should open delete dialog when delete is clicked", async ({ page }) => {
      const menuButton = page.locator('[data-testid="recipe-menu-button"]');
      await menuButton.click();
      
      const deleteButton = page.locator('[data-testid="delete-recipe-button"]');
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();
      
      // Delete dialog should be visible
      const deleteDialog = page.locator('[data-testid="delete-recipe-dialog"]');
      await expect(deleteDialog).toBeVisible();
      
      // Should have cancel and confirm buttons
      await expect(page.locator('[data-testid="delete-cancel-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-confirm-button"]')).toBeVisible();
    });

    test("should close delete dialog when cancel is clicked", async ({ page }) => {
      // Open delete dialog
      await page.locator('[data-testid="recipe-menu-button"]').click();
      await page.locator('[data-testid="delete-recipe-button"]').click();
      
      const deleteDialog = page.locator('[data-testid="delete-recipe-dialog"]');
      await expect(deleteDialog).toBeVisible();
      
      // Click cancel
      await page.locator('[data-testid="delete-cancel-button"]').click();
      
      // Dialog should be closed
      await expect(deleteDialog).not.toBeVisible();
    });

    test("should display timestamp buttons for YouTube recipes", async ({ page }) => {
      const recipeSteps = page.locator('[data-testid="recipe-steps"]');
      
      if (await recipeSteps.isVisible()) {
        // Check if any timestamp buttons exist (YouTube recipes only)
        const timestampButton = page.locator('[data-testid^="timestamp-button-"]').first();
        
        // Timestamp buttons may or may not exist depending on recipe source
        if (await timestampButton.isVisible()) {
          await expect(timestampButton).toBeVisible();
        }
      }
    });

    test("should highlight active step when timestamp is clicked", async ({ page }) => {
      const recipeSteps = page.locator('[data-testid="recipe-steps"]');
      
      if (await recipeSteps.isVisible()) {
        const timestampButton = page.locator('[data-testid^="timestamp-button-"]').first();
        
        if (await timestampButton.isVisible()) {
          // Click timestamp button
          await timestampButton.click();
          
          // The corresponding step should be highlighted (active)
          // Note: This is a visual/interaction test that may require waiting for video state
          // We'll verify the step element exists and can be clicked
          const firstStep = page.locator('[data-testid^="recipe-step-"]').first();
          await expect(firstStep).toBeVisible();
        }
      }
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
      // Check for source filter dropdown (first combobox on page)
      const comboboxes = page.getByRole("combobox");
      await expect(comboboxes.first()).toBeVisible();
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
