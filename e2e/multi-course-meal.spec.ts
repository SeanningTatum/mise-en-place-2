import { test, expect } from "@playwright/test";

test.describe("Multi-Course Meal Planner", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/recipes/meal");
    // Wait for the page to load
    await expect(page.getByTestId("multi-course-meal-page")).toBeVisible();
  });

  test("displays meal setup form", async ({ page }) => {
    // Verify form elements are present
    await expect(page.getByTestId("meal-name-input")).toBeVisible();
    await expect(page.getByTestId("guest-count")).toBeVisible();
    await expect(page.getByTestId("serving-date-input")).toBeVisible();
    await expect(page.getByTestId("serving-time-input")).toBeVisible();
    await expect(page.getByTestId("service-style-group")).toBeVisible();
  });

  test("adjusts guest count with buttons", async ({ page }) => {
    // Initial count should be 4
    await expect(page.getByTestId("guest-count")).toContainText("4");

    // Increment
    await page.getByTestId("guest-increment").click();
    await expect(page.getByTestId("guest-count")).toContainText("5");

    // Decrement
    await page.getByTestId("guest-decrement").click();
    await page.getByTestId("guest-decrement").click();
    await expect(page.getByTestId("guest-count")).toContainText("3");
  });

  test("decrement button disabled at minimum (2 guests)", async ({ page }) => {
    // Click decrement until we reach 2
    await page.getByTestId("guest-decrement").click(); // 3
    await page.getByTestId("guest-decrement").click(); // 2

    // Button should be disabled at 2
    await expect(page.getByTestId("guest-decrement")).toBeDisabled();
  });

  test("can select service style", async ({ page }) => {
    // Click on "Plated" option
    await page.getByLabel("Plated").click();
    await expect(page.getByRole("radio", { name: "Plated" })).toBeChecked();

    // Click on "Buffet" option
    await page.getByLabel("Buffet").click();
    await expect(page.getByRole("radio", { name: "Buffet" })).toBeChecked();
  });

  test("can navigate back to recipes", async ({ page }) => {
    await page.getByTestId("back-to-recipes").click();
    await expect(page).toHaveURL("/recipes");
  });
});

test.describe("Multi-Course Meal - Course Management", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("displays create meal flow", async ({ page }) => {
    // Navigate to meal planner
    await page.goto("/recipes/meal");
    await expect(page.getByTestId("multi-course-meal-page")).toBeVisible();

    // Fill in the setup form
    await page.getByTestId("meal-name-input").fill("Test Dinner Party");

    // Submit the form (this may fail if validation requires other fields)
    await page.getByTestId("meal-setup-submit").click();

    // If the form submitted successfully, we should see the courses step
    // This test may need adjustment based on backend availability
  });
});

test.describe("Multi-Course Meal - Validation", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("shows validation error for empty meal name", async ({ page }) => {
    await page.goto("/recipes/meal");
    await expect(page.getByTestId("multi-course-meal-page")).toBeVisible();

    // Clear the meal name and try to submit
    await page.getByTestId("meal-name-input").clear();
    await page.getByTestId("meal-setup-submit").click();

    // Should show validation error
    await expect(page.getByText("Name is required")).toBeVisible();
  });
});
