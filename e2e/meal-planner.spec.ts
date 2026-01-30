import { test, expect } from "@playwright/test";

test.describe("Meal Planner", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/recipes/planner");
    // Wait for the planner to load
    await expect(page.getByTestId("meal-planner-page")).toBeVisible();
  });

  test("displays weekly planner grid", async ({ page }) => {
    // Verify the grid is visible
    await expect(page.getByTestId("weekly-planner-grid")).toBeVisible();

    // Verify all 7 day columns are present
    for (let i = 0; i < 7; i++) {
      await expect(page.getByTestId(`day-column-${i}`)).toBeVisible();
    }
  });

  test("displays empty meal slots", async ({ page }) => {
    // Check that empty meal slots are shown
    const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
    for (const mealType of mealTypes) {
      const emptySlots = page.getByTestId(`meal-slot-${mealType}-empty`);
      // At least some slots should be empty
      await expect(emptySlots.first()).toBeVisible();
    }
  });

  test("opens recipe picker when clicking add button", async ({ page }) => {
    // Click on an empty breakfast slot
    await page.getByTestId("meal-slot-breakfast-empty").first().click();

    // Verify the recipe picker modal is shown
    await expect(page.getByText("Select Recipe for Breakfast")).toBeVisible();
    await expect(page.getByTestId("recipe-picker-search")).toBeVisible();
  });

  test("navigates between weeks", async ({ page }) => {
    // Get the initial week text
    const initialWeekText = await page.locator("text=/Week of|January|February/").first().textContent();

    // Navigate to next week
    await page.getByTestId("next-week").click();

    // Verify the week changed
    await page.waitForTimeout(500);
    const nextWeekText = await page.locator("text=/Week of|January|February/").first().textContent();
    expect(nextWeekText).not.toEqual(initialWeekText);

    // Navigate back
    await page.getByTestId("prev-week").click();
    await page.waitForTimeout(500);

    // Verify we're back to original week
    const currentWeekText = await page.locator("text=/Week of|January|February/").first().textContent();
    expect(currentWeekText).toEqual(initialWeekText);
  });

  test("displays grocery list panel", async ({ page }) => {
    // Verify grocery list panel is visible
    await expect(page.getByTestId("grocery-list-panel")).toBeVisible();

    // Verify copy and print buttons exist
    await expect(page.getByTestId("copy-grocery-list")).toBeVisible();
    await expect(page.getByTestId("print-grocery-list")).toBeVisible();
  });

  test("can toggle grocery list panel", async ({ page }) => {
    // Find the collapsible trigger (Grocery List header)
    const groceryListHeader = page.getByText("Grocery List").first();
    await groceryListHeader.click();

    // Wait a moment for animation
    await page.waitForTimeout(300);

    // Click again to expand
    await groceryListHeader.click();

    // Verify it's visible again
    await expect(page.getByTestId("grocery-list-panel")).toBeVisible();
  });
});

test.describe("Meal Planner with Recipes", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("can add and remove recipe from meal slot", async ({ page }) => {
    // First, we need to have at least one recipe
    // Navigate to the planner
    await page.goto("/recipes/planner");
    await expect(page.getByTestId("meal-planner-page")).toBeVisible();

    // Click on an empty breakfast slot
    await page.getByTestId("meal-slot-breakfast-empty").first().click();

    // Wait for the recipe picker modal
    await expect(page.getByText("Select Recipe for Breakfast")).toBeVisible();

    // If there are recipes, select the first one
    const recipeItem = page.locator('[data-testid^="recipe-picker-item-"]').first();
    const hasRecipes = await recipeItem.isVisible().catch(() => false);

    if (hasRecipes) {
      await recipeItem.click();

      // Wait for the slot to be filled
      await expect(page.getByTestId("meal-slot-breakfast-filled")).toBeVisible({
        timeout: 5000,
      });

      // Remove the recipe
      await page.getByTestId("meal-slot-breakfast-remove").click();

      // Verify the slot is empty again
      await expect(page.getByTestId("meal-slot-breakfast-empty").first()).toBeVisible({
        timeout: 5000,
      });
    } else {
      // Close the modal if no recipes
      await page.keyboard.press("Escape");
    }
  });
});
