import { chromium } from "playwright";

const BASE_URL = "http://localhost:5173";
const TEST_EMAIL = "admin@test.local";
const TEST_PASSWORD = "TestAdmin123!";

const SCREENSHOTS_DIR = "docs/testing/recipes/screenshots";
const PUBLIC_SCREENSHOTS_DIR = "public/docs/testing/recipes/screenshots";

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    console.log("📸 Capturing login page screenshot...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000); // Wait for any animations
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/login.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `${PUBLIC_SCREENSHOTS_DIR}/login.png`,
      fullPage: true,
    });
    console.log("✅ Login screenshot captured");

    console.log("📸 Capturing signup page screenshot...");
    await page.goto(`${BASE_URL}/sign-up`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/signup.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `${PUBLIC_SCREENSHOTS_DIR}/signup.png`,
      fullPage: true,
    });
    console.log("✅ Signup screenshot captured");

    console.log("🔐 Logging in...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 10000,
    });
    await page.waitForTimeout(1000);
    console.log("✅ Logged in");

    console.log("📸 Capturing recipe list (empty or with cards)...");
    await page.goto(`${BASE_URL}/recipes`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000); // Wait for data to load

    // Check if there are recipes
    let hasRecipes = await page
      .locator('[data-testid="recipe-card"]')
      .count()
      .catch(() => 0);

    if (hasRecipes > 0) {
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/recipe-list-with-card.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-list-with-card.png`,
        fullPage: true,
      });
      console.log("✅ Recipe list with cards screenshot captured");
    } else {
      await page.screenshot({
        path: `${SCREENSHOTS_DIR}/recipe-list-empty.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-list-empty.png`,
        fullPage: true,
      });
      console.log("✅ Empty recipe list screenshot captured");
    }

    console.log("📸 Capturing new recipe form...");
    await page.goto(`${BASE_URL}/recipes/new`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/recipe-new-form.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-new-form.png`,
      fullPage: true,
    });
    console.log("✅ New recipe form screenshot captured");

    // Try to create a recipe if none exist, or use existing one
    if (hasRecipes === 0) {
      console.log(
        "📝 No recipes found, attempting to extract one for screenshots...",
      );
      await page.goto(`${BASE_URL}/recipes/new`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      const urlInput = page.locator('[data-testid="recipe-url-input"]');
      if (await urlInput.isVisible()) {
        // Use a simple blog recipe URL that should extract quickly
        await urlInput.fill(
          "https://www.allrecipes.com/recipe/213742/cheesy-ham-and-hash-brown-casserole/",
        );
        await page.waitForTimeout(500);
        const extractButton = page.locator(
          '[data-testid="extract-recipe-button"]',
        );
        if (await extractButton.isEnabled()) {
          await extractButton.click();

          // Wait for extraction to complete (with timeout)
          console.log("⏳ Waiting for recipe extraction...");
          try {
            // Wait for either success (redirect to recipe detail) or preview to appear
            await Promise.race([
              page.waitForURL(/\/recipes\/[^/]+$/, { timeout: 60000 }),
              page.waitForSelector(
                '[data-testid="recipe-preview"], button:has-text("Save")',
                { timeout: 60000 },
              ),
            ]);

            // If we got a preview, save it
            const saveButton = page.locator('button:has-text("Save")');
            if (
              await saveButton.isVisible({ timeout: 2000 }).catch(() => false)
            ) {
              await saveButton.click();
              await page.waitForURL(/\/recipes\/[^/]+$/, { timeout: 10000 });
            }

            // Wait for recipe detail page to load
            await page
              .waitForSelector('[data-testid="recipe-title"]', {
                timeout: 10000,
              })
              .catch(() => null);
            await page.waitForTimeout(3000);
            console.log("✅ Recipe extracted successfully");
            hasRecipes = 1; // Update flag

            // If we're already on the detail page, capture it now
            const currentUrl = page.url();
            if (currentUrl.match(/\/recipes\/[^/]+$/)) {
              console.log(
                "📸 Already on detail page, capturing screenshots...",
              );

              await page.screenshot({
                path: `${SCREENSHOTS_DIR}/recipe-detail.png`,
                fullPage: true,
              });
              await page.screenshot({
                path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-detail.png`,
                fullPage: true,
              });
              console.log("✅ Recipe detail screenshot captured");

              // Capture ingredients
              console.log("📸 Looking for ingredients section...");
              const ingredientsList = page.locator(
                '[data-testid="ingredients-list"]',
              );
              const isVisible = await ingredientsList
                .isVisible({ timeout: 10000 })
                .catch(() => false);
              console.log(`Ingredients list visible: ${isVisible}`);

              if (isVisible) {
                await ingredientsList.scrollIntoViewIfNeeded();
                await page.waitForTimeout(1000);
                await page.screenshot({
                  path: `${SCREENSHOTS_DIR}/recipe-ingredients.png`,
                  fullPage: false,
                });
                await page.screenshot({
                  path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-ingredients.png`,
                  fullPage: false,
                });
                console.log("✅ Ingredients screenshot captured");

                // Check checkboxes
                const checkboxes = page.locator(
                  '[data-testid^="ingredient-checkbox-"]',
                );
                const checkboxCount = await checkboxes.count();
                console.log(`Found ${checkboxCount} ingredient checkboxes`);

                if (checkboxCount > 0) {
                  for (let i = 0; i < Math.min(3, checkboxCount); i++) {
                    try {
                      await checkboxes.nth(i).scrollIntoViewIfNeeded();
                      await checkboxes.nth(i).check({ timeout: 2000 });
                      console.log(`✅ Checked checkbox ${i + 1}`);
                    } catch (e) {
                      console.log(`⚠️  Could not check checkbox ${i + 1}`);
                    }
                  }
                  await page.waitForTimeout(500);
                  await page.screenshot({
                    path: `${SCREENSHOTS_DIR}/recipe-ingredients-checked.png`,
                    fullPage: false,
                  });
                  await page.screenshot({
                    path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-ingredients-checked.png`,
                    fullPage: false,
                  });
                  console.log(
                    "✅ Ingredients with checkboxes screenshot captured",
                  );
                } else {
                  console.log("⚠️  No checkboxes found");
                }
              } else {
                console.log(
                  "⚠️  Ingredients list not found, taking full page screenshot",
                );
                await page.screenshot({
                  path: `${SCREENSHOTS_DIR}/recipe-ingredients.png`,
                  fullPage: true,
                });
                await page.screenshot({
                  path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-ingredients.png`,
                  fullPage: true,
                });
              }

              // Skip the detail page capture below since we already did it
              hasRecipes = 2; // Use 2 to indicate we already captured detail
            }
          } catch (error) {
            console.log(
              "⚠️  Recipe extraction timed out or failed, using existing recipes if any",
            );
          }
        }
      }
    }

    // Capture recipe detail page if recipes exist and we haven't already captured it
    if (hasRecipes > 0 && hasRecipes !== 2) {
      console.log("📸 Capturing recipe detail page...");
      await page.goto(`${BASE_URL}/recipes`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);

      // Click on the first recipe card
      const firstRecipeCard = page
        .locator('[data-testid^="recipe-card"], a[href*="/recipes/"]')
        .first();
      if (
        await firstRecipeCard.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await firstRecipeCard.click();
        await page.waitForURL(/\/recipes\/[^/]+$/, { timeout: 10000 });
        await page.waitForTimeout(3000); // Wait for detail page to load

        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/recipe-detail.png`,
          fullPage: true,
        });
        await page.screenshot({
          path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-detail.png`,
          fullPage: true,
        });
        console.log("✅ Recipe detail screenshot captured");

        // Scroll to ingredients section
        const ingredientsList = page.locator(
          '[data-testid="ingredients-list"], [data-testid="ingredients"]',
        );
        if (
          await ingredientsList.isVisible({ timeout: 5000 }).catch(() => false)
        ) {
          await ingredientsList.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          await page.screenshot({
            path: `${SCREENSHOTS_DIR}/recipe-ingredients.png`,
            fullPage: false,
          });
          await page.screenshot({
            path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-ingredients.png`,
            fullPage: false,
          });
          console.log("✅ Ingredients screenshot captured");

          // Check a few ingredient checkboxes
          const checkboxes = page
            .locator(
              '[data-testid^="ingredient-checkbox"], input[type="checkbox"]',
            )
            .filter({ hasText: /ingredient/i })
            .or(
              page.locator(
                'label:has-text("ingredient") input[type="checkbox"]',
              ),
            );
          const allCheckboxes = page.locator('input[type="checkbox"]');
          const checkboxCount = await allCheckboxes.count();
          if (checkboxCount > 0) {
            // Check first 2-3 checkboxes (try to find ingredient-related ones)
            for (let i = 0; i < Math.min(3, checkboxCount); i++) {
              try {
                await allCheckboxes.nth(i).check({ timeout: 1000 });
              } catch (e) {
                // Skip if can't check
              }
            }
            await page.waitForTimeout(500);
            await page.screenshot({
              path: `${SCREENSHOTS_DIR}/recipe-ingredients-checked.png`,
              fullPage: false,
            });
            await page.screenshot({
              path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-ingredients-checked.png`,
              fullPage: false,
            });
            console.log("✅ Ingredients with checkboxes screenshot captured");
          }
        }

        // Also capture recipe list with card now that we have a recipe
        console.log("📸 Capturing recipe list with card...");
        await page.goto(`${BASE_URL}/recipes`, { waitUntil: "networkidle" });
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: `${SCREENSHOTS_DIR}/recipe-list-with-card.png`,
          fullPage: true,
        });
        await page.screenshot({
          path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-list-with-card.png`,
          fullPage: true,
        });
        console.log("✅ Recipe list with card screenshot captured");
      }
    } else {
      console.log("⚠️  No recipes found, skipping detail page screenshots");
    }

    // Try to capture extraction state (use a new page/tab to avoid interrupting)
    console.log("📸 Attempting to capture extraction state...");
    const extractionPage = await context.newPage();
    try {
      await extractionPage.goto(`${BASE_URL}/recipes/new`, {
        waitUntil: "networkidle",
      });
      await extractionPage.waitForTimeout(1000);

      const urlInput = extractionPage.locator(
        '[data-testid="recipe-url-input"]',
      );
      if (await urlInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await urlInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        await extractionPage.waitForTimeout(500);
        const extractButton = extractionPage.locator(
          '[data-testid="extract-recipe-button"]',
        );
        if (
          await extractButton.isEnabled({ timeout: 2000 }).catch(() => false)
        ) {
          // Take screenshot right after clicking (loading state)
          await extractButton.click();
          await extractionPage.waitForTimeout(500); // Immediate wait for loading state

          // Try multiple times to catch the loading state
          for (let attempt = 0; attempt < 5; attempt++) {
            const loadingState = await extractionPage
              .locator(
                'button:has-text("Extracting"), button:disabled, [data-testid="extract-recipe-button"]:disabled',
              )
              .isVisible({ timeout: 500 })
              .catch(() => false);
            if (loadingState) {
              await extractionPage.screenshot({
                path: `${SCREENSHOTS_DIR}/recipe-extracting.png`,
                fullPage: true,
              });
              await extractionPage.screenshot({
                path: `${PUBLIC_SCREENSHOTS_DIR}/recipe-extracting.png`,
                fullPage: true,
              });
              console.log("✅ Extraction loading state screenshot captured");
              break;
            }
            await extractionPage.waitForTimeout(500);
          }
        }
      }
    } catch (error) {
      console.log("⚠️  Could not capture extraction state:", error);
    } finally {
      await extractionPage.close();
    }

    console.log("\n✅ All screenshots captured successfully!");
  } catch (error) {
    console.error("❌ Error capturing screenshots:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
