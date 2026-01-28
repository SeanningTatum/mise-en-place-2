import { test as setup, expect } from "@playwright/test";
import { execSync } from "child_process";

const AUTH_FILE = "e2e/.auth/user.json";

/**
 * Authentication setup for Playwright tests
 * 
 * Uses test credentials:
 * - Email: admin@test.local
 * - Password: TestAdmin123!
 * 
 * This setup:
 * 1. Creates the test user if it doesn't exist (via sign-up)
 * 2. Upgrades the user to admin role
 * 3. Logs in and saves the auth state for reuse
 */
setup("authenticate", async ({ page }) => {
  const testEmail = "admin@test.local";
  const testPassword = "TestAdmin123!";
  const testName = "Test Admin";

  // First, try to sign up (will fail silently if user exists)
  await page.goto("/sign-up");
  
  // Check if we're on the sign-up page
  const isSignUpPage = await page.locator('input[type="email"]').isVisible().catch(() => false);
  
  if (isSignUpPage) {
    // Try to sign up
    await page.fill('input[name="name"]', testName);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    
    // Check for confirm password field
    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]');
    if (await confirmPasswordField.isVisible().catch(() => false)) {
      await confirmPasswordField.fill(testPassword);
    }
    
    await page.click('button[type="submit"]');
    
    // Wait for response - either redirect or error
    await page.waitForTimeout(2000);
    
    // Check if sign up was successful or user already exists
    const currentUrl = page.url();
    if (currentUrl.includes("/sign-up")) {
      // Might have error, try to go to login
      console.log("Sign up may have failed (user might already exist), trying login...");
    }
  }

  // Upgrade user to admin via SQL
  try {
    execSync(
      `bunx wrangler d1 execute version-two-db --local --command "UPDATE user SET role = 'admin', email_verified = 1 WHERE email = '${testEmail}';"`,
      { stdio: "pipe" }
    );
    console.log("User upgraded to admin");
  } catch (e) {
    console.log("Could not upgrade user (might not exist yet)");
  }

  // Now log in
  await page.goto("/login");
  
  // Wait for login form
  await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
  
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');
  
  // Wait for successful login (redirect away from login page)
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
  
  // Verify we're logged in by checking we can access a protected route
  await page.goto("/recipes");
  await expect(page.locator("h1")).toContainText(/Recipes/i, { timeout: 10000 });

  // Save auth state
  await page.context().storageState({ path: AUTH_FILE });
});
