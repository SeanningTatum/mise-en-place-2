#!/usr/bin/env bun
/**
 * Seed Mock Data for E2E Testing
 *
 * Creates comprehensive mock data for testing all app features:
 * - Recipes (YouTube and blog sources)
 * - Ingredients
 * - Recipe steps
 * - Meal plans
 * - Meal plan templates
 * - Multi-course meals
 *
 * Run with: bun run seed:mock-data
 *
 * Prerequisites:
 * - Test users must be seeded first: bun run seed:users
 */

import { execSync } from "node:child_process";
import crypto from "node:crypto";

// Import test user IDs for foreign keys
const TEST_USER_IDS = {
  admin: "test-admin-user-001",
  user1: "test-user-001",
  user2: "test-user-002",
  premium: "test-premium-user",
};

// Helper to generate consistent IDs
function generateId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

// Escape single quotes for SQL
function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

// ============================================================================
// MOCK DATA DEFINITIONS
// ============================================================================

interface MockRecipe {
  id: string;
  createdById: string;
  title: string;
  slug: string;
  description: string;
  sourceUrl: string | null;
  sourceType: "youtube" | "blog" | "custom";
  youtubeVideoId: string | null;
  thumbnailUrl: string | null;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isPublic: boolean;
  isCustom: boolean;
}

interface MockIngredient {
  id: string;
  name: string;
  category: string;
}

interface MockRecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: string;
  unit: string;
  notes: string | null;
}

interface MockRecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  instruction: string;
  timestampSeconds: number | null;
}

interface MockMealPlan {
  id: string;
  userId: string;
  weekStartDate: string;
  name: string | null;
}

interface MockMealPlanEntry {
  id: string;
  mealPlanId: string;
  recipeId: string;
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
}

// ============================================================================
// SAMPLE RECIPES
// ============================================================================

const MOCK_RECIPES: MockRecipe[] = [
  // YouTube recipes
  {
    id: generateId("recipe", 1),
    createdById: TEST_USER_IDS.admin,
    title: "Classic Spaghetti Carbonara",
    slug: "classic-spaghetti-carbonara",
    description:
      "Authentic Italian carbonara with crispy guanciale, eggs, and pecorino romano.",
    sourceUrl: "https://www.youtube.com/watch?v=_CARBONARA123",
    sourceType: "youtube",
    youtubeVideoId: "_CARBONARA123",
    thumbnailUrl: "https://img.youtube.com/vi/_CARBONARA123/hqdefault.jpg",
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    calories: 650,
    protein: 28,
    carbs: 72,
    fat: 28,
    isPublic: true,
    isCustom: false,
  },
  {
    id: generateId("recipe", 2),
    createdById: TEST_USER_IDS.admin,
    title: "Thai Green Curry",
    slug: "thai-green-curry",
    description:
      "Fragrant Thai green curry with chicken, vegetables, and coconut milk.",
    sourceUrl: "https://www.youtube.com/watch?v=_GREENCURRY456",
    sourceType: "youtube",
    youtubeVideoId: "_GREENCURRY456",
    thumbnailUrl: "https://img.youtube.com/vi/_GREENCURRY456/hqdefault.jpg",
    servings: 4,
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    calories: 480,
    protein: 32,
    carbs: 18,
    fat: 32,
    isPublic: true,
    isCustom: false,
  },
  {
    id: generateId("recipe", 3),
    createdById: TEST_USER_IDS.user1,
    title: "Homemade Pizza Dough",
    slug: "homemade-pizza-dough",
    description:
      "Perfect pizza dough that rises beautifully and bakes up crispy.",
    sourceUrl: "https://www.youtube.com/watch?v=_PIZZADOUGH789",
    sourceType: "youtube",
    youtubeVideoId: "_PIZZADOUGH789",
    thumbnailUrl: "https://img.youtube.com/vi/_PIZZADOUGH789/hqdefault.jpg",
    servings: 4,
    prepTimeMinutes: 30,
    cookTimeMinutes: 15,
    calories: 320,
    protein: 10,
    carbs: 58,
    fat: 5,
    isPublic: false,
    isCustom: false,
  },
  // Blog recipes
  {
    id: generateId("recipe", 4),
    createdById: TEST_USER_IDS.user1,
    title: "Honey Garlic Salmon",
    slug: "honey-garlic-salmon",
    description:
      "Quick and easy baked salmon with a sticky honey garlic glaze.",
    sourceUrl: "https://example-recipe-blog.com/honey-garlic-salmon",
    sourceType: "blog",
    youtubeVideoId: null,
    thumbnailUrl: "https://example-recipe-blog.com/images/salmon.jpg",
    servings: 2,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    calories: 420,
    protein: 38,
    carbs: 22,
    fat: 18,
    isPublic: true,
    isCustom: false,
  },
  {
    id: generateId("recipe", 5),
    createdById: TEST_USER_IDS.user2,
    title: "Vegetable Stir Fry",
    slug: "vegetable-stir-fry",
    description: "Colorful vegetable stir fry with a savory soy-ginger sauce.",
    sourceUrl: "https://healthy-cooking-blog.com/veggie-stir-fry",
    sourceType: "blog",
    youtubeVideoId: null,
    thumbnailUrl: null,
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    calories: 180,
    protein: 6,
    carbs: 24,
    fat: 8,
    isPublic: true,
    isCustom: false,
  },
  // Custom recipes
  {
    id: generateId("recipe", 6),
    createdById: TEST_USER_IDS.user1,
    title: "Grandma's Secret Chocolate Cake",
    slug: "grandmas-secret-chocolate-cake",
    description:
      "A family recipe passed down through generations - the moistest chocolate cake ever.",
    sourceUrl: null,
    sourceType: "custom",
    youtubeVideoId: null,
    thumbnailUrl: null,
    servings: 12,
    prepTimeMinutes: 25,
    cookTimeMinutes: 35,
    calories: 380,
    protein: 5,
    carbs: 52,
    fat: 18,
    isPublic: false,
    isCustom: true,
  },
  {
    id: generateId("recipe", 7),
    createdById: TEST_USER_IDS.premium,
    title: "Quick Avocado Toast",
    slug: "quick-avocado-toast",
    description: "Simple but delicious avocado toast with various toppings.",
    sourceUrl: null,
    sourceType: "custom",
    youtubeVideoId: null,
    thumbnailUrl: null,
    servings: 1,
    prepTimeMinutes: 5,
    cookTimeMinutes: 2,
    calories: 320,
    protein: 8,
    carbs: 28,
    fat: 22,
    isPublic: true,
    isCustom: true,
  },
  {
    id: generateId("recipe", 8),
    createdById: TEST_USER_IDS.admin,
    title: "Overnight Oats",
    slug: "overnight-oats",
    description: "Healthy breakfast prep - creamy oats with fresh berries.",
    sourceUrl: "https://www.youtube.com/watch?v=_OVERNIGHTOATS",
    sourceType: "youtube",
    youtubeVideoId: "_OVERNIGHTOATS",
    thumbnailUrl: "https://img.youtube.com/vi/_OVERNIGHTOATS/hqdefault.jpg",
    servings: 2,
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    calories: 280,
    protein: 12,
    carbs: 45,
    fat: 6,
    isPublic: true,
    isCustom: false,
  },
];

// ============================================================================
// SAMPLE INGREDIENTS
// ============================================================================

const MOCK_INGREDIENTS: MockIngredient[] = [
  { id: generateId("ing", 1), name: "spaghetti", category: "pasta" },
  { id: generateId("ing", 2), name: "guanciale", category: "meat" },
  { id: generateId("ing", 3), name: "pecorino romano", category: "dairy" },
  { id: generateId("ing", 4), name: "eggs", category: "dairy" },
  { id: generateId("ing", 5), name: "black pepper", category: "spices" },
  { id: generateId("ing", 6), name: "chicken breast", category: "meat" },
  { id: generateId("ing", 7), name: "coconut milk", category: "dairy" },
  { id: generateId("ing", 8), name: "green curry paste", category: "condiments" },
  { id: generateId("ing", 9), name: "fish sauce", category: "condiments" },
  { id: generateId("ing", 10), name: "basil", category: "herbs" },
  { id: generateId("ing", 11), name: "all-purpose flour", category: "baking" },
  { id: generateId("ing", 12), name: "yeast", category: "baking" },
  { id: generateId("ing", 13), name: "olive oil", category: "oils" },
  { id: generateId("ing", 14), name: "salt", category: "spices" },
  { id: generateId("ing", 15), name: "salmon fillet", category: "seafood" },
  { id: generateId("ing", 16), name: "honey", category: "sweeteners" },
  { id: generateId("ing", 17), name: "garlic", category: "vegetables" },
  { id: generateId("ing", 18), name: "soy sauce", category: "condiments" },
  { id: generateId("ing", 19), name: "broccoli", category: "vegetables" },
  { id: generateId("ing", 20), name: "bell pepper", category: "vegetables" },
  { id: generateId("ing", 21), name: "ginger", category: "vegetables" },
  { id: generateId("ing", 22), name: "cocoa powder", category: "baking" },
  { id: generateId("ing", 23), name: "sugar", category: "baking" },
  { id: generateId("ing", 24), name: "butter", category: "dairy" },
  { id: generateId("ing", 25), name: "avocado", category: "vegetables" },
  { id: generateId("ing", 26), name: "bread", category: "grains" },
  { id: generateId("ing", 27), name: "oats", category: "grains" },
  { id: generateId("ing", 28), name: "milk", category: "dairy" },
  { id: generateId("ing", 29), name: "mixed berries", category: "fruits" },
];

// ============================================================================
// RECIPE-INGREDIENT ASSOCIATIONS
// ============================================================================

const MOCK_RECIPE_INGREDIENTS: MockRecipeIngredient[] = [
  // Carbonara (recipe-001)
  { id: generateId("ri", 1), recipeId: generateId("recipe", 1), ingredientId: generateId("ing", 1), quantity: "400", unit: "g", notes: null },
  { id: generateId("ri", 2), recipeId: generateId("recipe", 1), ingredientId: generateId("ing", 2), quantity: "200", unit: "g", notes: "or pancetta" },
  { id: generateId("ri", 3), recipeId: generateId("recipe", 1), ingredientId: generateId("ing", 3), quantity: "100", unit: "g", notes: "freshly grated" },
  { id: generateId("ri", 4), recipeId: generateId("recipe", 1), ingredientId: generateId("ing", 4), quantity: "4", unit: "large", notes: "room temperature" },
  { id: generateId("ri", 5), recipeId: generateId("recipe", 1), ingredientId: generateId("ing", 5), quantity: "2", unit: "tsp", notes: "freshly ground" },
  
  // Thai Green Curry (recipe-002)
  { id: generateId("ri", 6), recipeId: generateId("recipe", 2), ingredientId: generateId("ing", 6), quantity: "500", unit: "g", notes: "sliced" },
  { id: generateId("ri", 7), recipeId: generateId("recipe", 2), ingredientId: generateId("ing", 7), quantity: "400", unit: "ml", notes: null },
  { id: generateId("ri", 8), recipeId: generateId("recipe", 2), ingredientId: generateId("ing", 8), quantity: "3", unit: "tbsp", notes: null },
  { id: generateId("ri", 9), recipeId: generateId("recipe", 2), ingredientId: generateId("ing", 9), quantity: "2", unit: "tbsp", notes: null },
  { id: generateId("ri", 10), recipeId: generateId("recipe", 2), ingredientId: generateId("ing", 10), quantity: "1", unit: "cup", notes: "Thai basil" },

  // Pizza Dough (recipe-003)
  { id: generateId("ri", 11), recipeId: generateId("recipe", 3), ingredientId: generateId("ing", 11), quantity: "500", unit: "g", notes: null },
  { id: generateId("ri", 12), recipeId: generateId("recipe", 3), ingredientId: generateId("ing", 12), quantity: "7", unit: "g", notes: "instant" },
  { id: generateId("ri", 13), recipeId: generateId("recipe", 3), ingredientId: generateId("ing", 13), quantity: "2", unit: "tbsp", notes: null },
  { id: generateId("ri", 14), recipeId: generateId("recipe", 3), ingredientId: generateId("ing", 14), quantity: "1", unit: "tsp", notes: null },

  // Honey Garlic Salmon (recipe-004)
  { id: generateId("ri", 15), recipeId: generateId("recipe", 4), ingredientId: generateId("ing", 15), quantity: "2", unit: "fillets", notes: "about 6oz each" },
  { id: generateId("ri", 16), recipeId: generateId("recipe", 4), ingredientId: generateId("ing", 16), quantity: "3", unit: "tbsp", notes: null },
  { id: generateId("ri", 17), recipeId: generateId("recipe", 4), ingredientId: generateId("ing", 17), quantity: "4", unit: "cloves", notes: "minced" },
  { id: generateId("ri", 18), recipeId: generateId("recipe", 4), ingredientId: generateId("ing", 18), quantity: "2", unit: "tbsp", notes: null },

  // Vegetable Stir Fry (recipe-005)
  { id: generateId("ri", 19), recipeId: generateId("recipe", 5), ingredientId: generateId("ing", 19), quantity: "2", unit: "cups", notes: "florets" },
  { id: generateId("ri", 20), recipeId: generateId("recipe", 5), ingredientId: generateId("ing", 20), quantity: "2", unit: "medium", notes: "sliced" },
  { id: generateId("ri", 21), recipeId: generateId("recipe", 5), ingredientId: generateId("ing", 21), quantity: "1", unit: "inch", notes: "grated" },
  { id: generateId("ri", 22), recipeId: generateId("recipe", 5), ingredientId: generateId("ing", 17), quantity: "3", unit: "cloves", notes: "minced" },
  { id: generateId("ri", 23), recipeId: generateId("recipe", 5), ingredientId: generateId("ing", 18), quantity: "3", unit: "tbsp", notes: null },

  // Chocolate Cake (recipe-006)
  { id: generateId("ri", 24), recipeId: generateId("recipe", 6), ingredientId: generateId("ing", 22), quantity: "75", unit: "g", notes: "unsweetened" },
  { id: generateId("ri", 25), recipeId: generateId("recipe", 6), ingredientId: generateId("ing", 23), quantity: "300", unit: "g", notes: null },
  { id: generateId("ri", 26), recipeId: generateId("recipe", 6), ingredientId: generateId("ing", 11), quantity: "250", unit: "g", notes: null },
  { id: generateId("ri", 27), recipeId: generateId("recipe", 6), ingredientId: generateId("ing", 24), quantity: "200", unit: "g", notes: "softened" },
  { id: generateId("ri", 28), recipeId: generateId("recipe", 6), ingredientId: generateId("ing", 4), quantity: "3", unit: "large", notes: null },

  // Avocado Toast (recipe-007)
  { id: generateId("ri", 29), recipeId: generateId("recipe", 7), ingredientId: generateId("ing", 25), quantity: "1", unit: "medium", notes: "ripe" },
  { id: generateId("ri", 30), recipeId: generateId("recipe", 7), ingredientId: generateId("ing", 26), quantity: "2", unit: "slices", notes: "sourdough" },
  { id: generateId("ri", 31), recipeId: generateId("recipe", 7), ingredientId: generateId("ing", 14), quantity: "1", unit: "pinch", notes: "flaky sea salt" },

  // Overnight Oats (recipe-008)
  { id: generateId("ri", 32), recipeId: generateId("recipe", 8), ingredientId: generateId("ing", 27), quantity: "1", unit: "cup", notes: "rolled oats" },
  { id: generateId("ri", 33), recipeId: generateId("recipe", 8), ingredientId: generateId("ing", 28), quantity: "1", unit: "cup", notes: "or oat milk" },
  { id: generateId("ri", 34), recipeId: generateId("recipe", 8), ingredientId: generateId("ing", 29), quantity: "1/2", unit: "cup", notes: "fresh or frozen" },
  { id: generateId("ri", 35), recipeId: generateId("recipe", 8), ingredientId: generateId("ing", 16), quantity: "1", unit: "tbsp", notes: "optional" },
];

// ============================================================================
// RECIPE STEPS
// ============================================================================

const MOCK_RECIPE_STEPS: MockRecipeStep[] = [
  // Carbonara steps
  { id: generateId("step", 1), recipeId: generateId("recipe", 1), stepNumber: 1, instruction: "Bring a large pot of salted water to boil for the pasta.", timestampSeconds: 30 },
  { id: generateId("step", 2), recipeId: generateId("recipe", 1), stepNumber: 2, instruction: "Cut guanciale into small cubes or strips.", timestampSeconds: 90 },
  { id: generateId("step", 3), recipeId: generateId("recipe", 1), stepNumber: 3, instruction: "Whisk eggs with grated pecorino and black pepper.", timestampSeconds: 180 },
  { id: generateId("step", 4), recipeId: generateId("recipe", 1), stepNumber: 4, instruction: "Cook guanciale until crispy, then set aside.", timestampSeconds: 300 },
  { id: generateId("step", 5), recipeId: generateId("recipe", 1), stepNumber: 5, instruction: "Cook spaghetti until al dente, reserve pasta water.", timestampSeconds: 480 },
  { id: generateId("step", 6), recipeId: generateId("recipe", 1), stepNumber: 6, instruction: "Toss hot pasta with guanciale, then add egg mixture off heat.", timestampSeconds: 720 },

  // Thai Green Curry steps
  { id: generateId("step", 7), recipeId: generateId("recipe", 2), stepNumber: 1, instruction: "Heat oil in a wok over high heat.", timestampSeconds: 60 },
  { id: generateId("step", 8), recipeId: generateId("recipe", 2), stepNumber: 2, instruction: "Fry curry paste until fragrant, about 1 minute.", timestampSeconds: 120 },
  { id: generateId("step", 9), recipeId: generateId("recipe", 2), stepNumber: 3, instruction: "Add chicken and cook until sealed on all sides.", timestampSeconds: 240 },
  { id: generateId("step", 10), recipeId: generateId("recipe", 2), stepNumber: 4, instruction: "Pour in coconut milk and bring to simmer.", timestampSeconds: 420 },
  { id: generateId("step", 11), recipeId: generateId("recipe", 2), stepNumber: 5, instruction: "Add fish sauce and cook until chicken is done.", timestampSeconds: 600 },
  { id: generateId("step", 12), recipeId: generateId("recipe", 2), stepNumber: 6, instruction: "Finish with fresh basil leaves.", timestampSeconds: 840 },

  // Honey Garlic Salmon (no timestamps - blog recipe)
  { id: generateId("step", 13), recipeId: generateId("recipe", 4), stepNumber: 1, instruction: "Preheat oven to 400°F (200°C).", timestampSeconds: null },
  { id: generateId("step", 14), recipeId: generateId("recipe", 4), stepNumber: 2, instruction: "Mix honey, soy sauce, and minced garlic.", timestampSeconds: null },
  { id: generateId("step", 15), recipeId: generateId("recipe", 4), stepNumber: 3, instruction: "Place salmon fillets on a lined baking sheet.", timestampSeconds: null },
  { id: generateId("step", 16), recipeId: generateId("recipe", 4), stepNumber: 4, instruction: "Brush glaze generously over salmon.", timestampSeconds: null },
  { id: generateId("step", 17), recipeId: generateId("recipe", 4), stepNumber: 5, instruction: "Bake for 15-20 minutes until flaky.", timestampSeconds: null },

  // Vegetable Stir Fry (no timestamps - blog recipe)
  { id: generateId("step", 18), recipeId: generateId("recipe", 5), stepNumber: 1, instruction: "Prep all vegetables before starting.", timestampSeconds: null },
  { id: generateId("step", 19), recipeId: generateId("recipe", 5), stepNumber: 2, instruction: "Heat oil in a wok until smoking.", timestampSeconds: null },
  { id: generateId("step", 20), recipeId: generateId("recipe", 5), stepNumber: 3, instruction: "Add garlic and ginger, stir for 30 seconds.", timestampSeconds: null },
  { id: generateId("step", 21), recipeId: generateId("recipe", 5), stepNumber: 4, instruction: "Add vegetables starting with the hardest ones.", timestampSeconds: null },
  { id: generateId("step", 22), recipeId: generateId("recipe", 5), stepNumber: 5, instruction: "Add soy sauce and toss to combine.", timestampSeconds: null },

  // Overnight Oats steps
  { id: generateId("step", 23), recipeId: generateId("recipe", 8), stepNumber: 1, instruction: "Combine oats and milk in a jar or container.", timestampSeconds: 30 },
  { id: generateId("step", 24), recipeId: generateId("recipe", 8), stepNumber: 2, instruction: "Add honey if using, stir well.", timestampSeconds: 60 },
  { id: generateId("step", 25), recipeId: generateId("recipe", 8), stepNumber: 3, instruction: "Cover and refrigerate overnight (or at least 4 hours).", timestampSeconds: 90 },
  { id: generateId("step", 26), recipeId: generateId("recipe", 8), stepNumber: 4, instruction: "Top with fresh berries before serving.", timestampSeconds: 120 },
];

// ============================================================================
// MEAL PLANS
// ============================================================================

function getWeekStartDate(weeksFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + 1 + weeksFromNow * 7); // Monday
  return date.toISOString().split("T")[0];
}

const MOCK_MEAL_PLANS: MockMealPlan[] = [
  { id: generateId("mp", 1), userId: TEST_USER_IDS.admin, weekStartDate: getWeekStartDate(0), name: "This Week's Meal Plan" },
  { id: generateId("mp", 2), userId: TEST_USER_IDS.admin, weekStartDate: getWeekStartDate(1), name: "Next Week's Plan" },
  { id: generateId("mp", 3), userId: TEST_USER_IDS.user1, weekStartDate: getWeekStartDate(0), name: null },
];

const MOCK_MEAL_PLAN_ENTRIES: MockMealPlanEntry[] = [
  // Admin's current week
  { id: generateId("mpe", 1), mealPlanId: generateId("mp", 1), recipeId: generateId("recipe", 8), dayOfWeek: 0, mealType: "breakfast" },
  { id: generateId("mpe", 2), mealPlanId: generateId("mp", 1), recipeId: generateId("recipe", 1), dayOfWeek: 0, mealType: "dinner" },
  { id: generateId("mpe", 3), mealPlanId: generateId("mp", 1), recipeId: generateId("recipe", 2), dayOfWeek: 1, mealType: "dinner" },
  { id: generateId("mpe", 4), mealPlanId: generateId("mp", 1), recipeId: generateId("recipe", 5), dayOfWeek: 2, mealType: "lunch" },
  { id: generateId("mpe", 5), mealPlanId: generateId("mp", 1), recipeId: generateId("recipe", 4), dayOfWeek: 3, mealType: "dinner" },
  { id: generateId("mpe", 6), mealPlanId: generateId("mp", 1), recipeId: generateId("recipe", 7), dayOfWeek: 4, mealType: "breakfast" },
  
  // User1's current week
  { id: generateId("mpe", 7), mealPlanId: generateId("mp", 3), recipeId: generateId("recipe", 3), dayOfWeek: 5, mealType: "dinner" },
  { id: generateId("mpe", 8), mealPlanId: generateId("mp", 3), recipeId: generateId("recipe", 6), dayOfWeek: 6, mealType: "snacks" },
];

// ============================================================================
// MEAL PLAN TEMPLATES
// ============================================================================

interface MockMealPlanTemplate {
  id: string;
  createdById: string;
  name: string;
  slug: string;
  description: string;
  theme: string | null;
  isPublic: boolean;
}

interface MockMealPlanTemplateEntry {
  id: string;
  templateId: string;
  recipeId: string;
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
}

const MOCK_MEAL_PLAN_TEMPLATES: MockMealPlanTemplate[] = [
  {
    id: generateId("template", 1),
    createdById: TEST_USER_IDS.admin,
    name: "Mediterranean Week",
    slug: "mediterranean-week",
    description: "A week of healthy Mediterranean-inspired meals",
    theme: "Mediterranean",
    isPublic: true,
  },
  {
    id: generateId("template", 2),
    createdById: TEST_USER_IDS.user1,
    name: "Quick Weeknight Meals",
    slug: "quick-weeknight-meals",
    description: "Easy meals that take 30 minutes or less",
    theme: "Quick & Easy",
    isPublic: true,
  },
];

const MOCK_TEMPLATE_ENTRIES: MockMealPlanTemplateEntry[] = [
  { id: generateId("te", 1), templateId: generateId("template", 1), recipeId: generateId("recipe", 1), dayOfWeek: 0, mealType: "dinner" },
  { id: generateId("te", 2), templateId: generateId("template", 1), recipeId: generateId("recipe", 4), dayOfWeek: 2, mealType: "dinner" },
  { id: generateId("te", 3), templateId: generateId("template", 2), recipeId: generateId("recipe", 5), dayOfWeek: 1, mealType: "dinner" },
  { id: generateId("te", 4), templateId: generateId("template", 2), recipeId: generateId("recipe", 7), dayOfWeek: 0, mealType: "breakfast" },
];

// ============================================================================
// SQL GENERATION
// ============================================================================

function generateMockDataSQL(): string[] {
  const statements: string[] = [];
  const timestamp = Date.now();

  statements.push(`-- ============================================================================`);
  statements.push(`-- MOCK DATA FOR E2E TESTING`);
  statements.push(`-- Generated: ${new Date().toISOString()}`);
  statements.push(`-- ============================================================================\n`);

  // Clear existing mock data first
  statements.push(`-- Clear existing mock data`);
  statements.push(`DELETE FROM meal_plan_template_entry WHERE template_id LIKE 'template-%';`);
  statements.push(`DELETE FROM meal_plan_template WHERE id LIKE 'template-%';`);
  statements.push(`DELETE FROM meal_plan_entry WHERE meal_plan_id LIKE 'mp-%';`);
  statements.push(`DELETE FROM meal_plan WHERE id LIKE 'mp-%';`);
  statements.push(`DELETE FROM recipe_step WHERE recipe_id LIKE 'recipe-%';`);
  statements.push(`DELETE FROM recipe_ingredient WHERE recipe_id LIKE 'recipe-%';`);
  statements.push(`DELETE FROM recipe WHERE id LIKE 'recipe-%';`);
  statements.push(`DELETE FROM ingredient WHERE id LIKE 'ing-%';`);
  statements.push(``);

  // Ingredients
  statements.push(`-- Insert ingredients`);
  for (const ing of MOCK_INGREDIENTS) {
    statements.push(`INSERT INTO ingredient (id, name, category, created_at)
VALUES ('${ing.id}', '${escapeSql(ing.name)}', '${escapeSql(ing.category)}', ${timestamp});`);
  }
  statements.push(``);

  // Recipes
  statements.push(`-- Insert recipes`);
  for (const recipe of MOCK_RECIPES) {
    statements.push(`INSERT INTO recipe (id, created_by_id, title, slug, description, source_url, normalized_url, source_type, is_custom, youtube_video_id, thumbnail_url, servings, prep_time_minutes, cook_time_minutes, calories, protein, carbs, fat, is_public, created_at, updated_at)
VALUES ('${recipe.id}', '${recipe.createdById}', '${escapeSql(recipe.title)}', '${recipe.slug}', '${escapeSql(recipe.description)}', ${recipe.sourceUrl ? `'${recipe.sourceUrl}'` : "NULL"}, ${recipe.sourceUrl ? `'${recipe.sourceUrl}'` : "NULL"}, '${recipe.sourceType}', ${recipe.isCustom ? 1 : 0}, ${recipe.youtubeVideoId ? `'${recipe.youtubeVideoId}'` : "NULL"}, ${recipe.thumbnailUrl ? `'${recipe.thumbnailUrl}'` : "NULL"}, ${recipe.servings}, ${recipe.prepTimeMinutes}, ${recipe.cookTimeMinutes}, ${recipe.calories || "NULL"}, ${recipe.protein || "NULL"}, ${recipe.carbs || "NULL"}, ${recipe.fat || "NULL"}, ${recipe.isPublic ? 1 : 0}, ${timestamp}, ${timestamp});`);
  }
  statements.push(``);

  // Recipe Ingredients
  statements.push(`-- Insert recipe ingredients`);
  for (const ri of MOCK_RECIPE_INGREDIENTS) {
    statements.push(`INSERT INTO recipe_ingredient (id, recipe_id, ingredient_id, quantity, unit, notes)
VALUES ('${ri.id}', '${ri.recipeId}', '${ri.ingredientId}', '${ri.quantity}', '${ri.unit}', ${ri.notes ? `'${escapeSql(ri.notes)}'` : "NULL"});`);
  }
  statements.push(``);

  // Recipe Steps
  statements.push(`-- Insert recipe steps`);
  for (const step of MOCK_RECIPE_STEPS) {
    statements.push(`INSERT INTO recipe_step (id, recipe_id, step_number, instruction, timestamp_seconds)
VALUES ('${step.id}', '${step.recipeId}', ${step.stepNumber}, '${escapeSql(step.instruction)}', ${step.timestampSeconds || "NULL"});`);
  }
  statements.push(``);

  // Meal Plans
  statements.push(`-- Insert meal plans`);
  for (const mp of MOCK_MEAL_PLANS) {
    statements.push(`INSERT INTO meal_plan (id, user_id, week_start_date, name, created_at, updated_at)
VALUES ('${mp.id}', '${mp.userId}', '${mp.weekStartDate}', ${mp.name ? `'${escapeSql(mp.name)}'` : "NULL"}, ${timestamp}, ${timestamp});`);
  }
  statements.push(``);

  // Meal Plan Entries
  statements.push(`-- Insert meal plan entries`);
  for (const entry of MOCK_MEAL_PLAN_ENTRIES) {
    statements.push(`INSERT INTO meal_plan_entry (id, meal_plan_id, recipe_id, day_of_week, meal_type)
VALUES ('${entry.id}', '${entry.mealPlanId}', '${entry.recipeId}', ${entry.dayOfWeek}, '${entry.mealType}');`);
  }
  statements.push(``);

  // Meal Plan Templates
  statements.push(`-- Insert meal plan templates`);
  for (const template of MOCK_MEAL_PLAN_TEMPLATES) {
    statements.push(`INSERT INTO meal_plan_template (id, created_by_id, name, slug, description, theme, is_public, import_count, view_count, created_at, updated_at)
VALUES ('${template.id}', '${template.createdById}', '${escapeSql(template.name)}', '${template.slug}', '${escapeSql(template.description)}', ${template.theme ? `'${escapeSql(template.theme)}'` : "NULL"}, ${template.isPublic ? 1 : 0}, 0, 0, ${timestamp}, ${timestamp});`);
  }
  statements.push(``);

  // Template Entries
  statements.push(`-- Insert template entries`);
  for (const entry of MOCK_TEMPLATE_ENTRIES) {
    statements.push(`INSERT INTO meal_plan_template_entry (id, template_id, recipe_id, day_of_week, meal_type)
VALUES ('${entry.id}', '${entry.templateId}', '${entry.recipeId}', ${entry.dayOfWeek}, '${entry.mealType}');`);
  }

  return statements;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function executeCommand(command: string, silent = true): string | null {
  try {
    const result = execSync(command, {
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    });
    return result;
  } catch (error: any) {
    if (!silent) {
      console.error(`Command failed: ${error.message}`);
    }
    return null;
  }
}

function printUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                       Mock Data Seed Script                                    ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  Creates comprehensive mock data for e2e testing.                             ║
║                                                                                ║
║  Prerequisites:                                                                ║
║    Run 'bun run seed:users' first to create test users!                       ║
║                                                                                ║
║  Usage:                                                                        ║
║    bun run seed:mock-data           Generate and run locally                   ║
║    bun run seed:mock-data --sql     Generate SQL only (print to stdout)        ║
║    bun run seed:mock-data --remote  Run against remote database                ║
║                                                                                ║
║  Data Created:                                                                 ║
║    • ${MOCK_RECIPES.length} Recipes (YouTube, blog, custom)                                     ║
║    • ${MOCK_INGREDIENTS.length} Ingredients                                                       ║
║    • ${MOCK_RECIPE_STEPS.length} Recipe steps (with timestamps for YouTube)                      ║
║    • ${MOCK_MEAL_PLANS.length} Meal plans                                                          ║
║    • ${MOCK_MEAL_PLAN_TEMPLATES.length} Meal plan templates                                                   ║
╚════════════════════════════════════════════════════════════════════════════════╝
`);
}

async function main() {
  const args = process.argv.slice(2);
  const sqlOnly = args.includes("--sql");
  const remote = args.includes("--remote");
  const help = args.includes("--help") || args.includes("-h");

  if (help) {
    printUsage();
    process.exit(0);
  }

  console.log("\n🍽️  Mock Data Seed Script\n");

  const sqlStatements = generateMockDataSQL();
  const sqlContent = sqlStatements.join("\n");

  if (sqlOnly) {
    console.log(sqlContent);
    return;
  }

  // Write to temp file
  const tempFile = "/tmp/seed-mock-data.sql";
  await Bun.write(tempFile, sqlContent);
  console.log(`📝 Generated SQL written to ${tempFile}`);

  // Execute against database
  const dbFlag = remote ? "--remote" : "--local";
  const dbName = "mise-en-place-2-db";

  console.log(`\n🔄 Running against ${remote ? "remote" : "local"} database...`);

  const result = executeCommand(
    `bunx wrangler d1 execute ${dbName} ${dbFlag} --file=${tempFile}`,
    false
  );

  if (result !== null) {
    console.log("\n✅ Mock data seeded successfully!\n");
    console.log("Summary:");
    console.log(`  • ${MOCK_RECIPES.length} Recipes`);
    console.log(`  • ${MOCK_INGREDIENTS.length} Ingredients`);
    console.log(`  • ${MOCK_RECIPE_INGREDIENTS.length} Recipe-Ingredient associations`);
    console.log(`  • ${MOCK_RECIPE_STEPS.length} Recipe steps`);
    console.log(`  • ${MOCK_MEAL_PLANS.length} Meal plans`);
    console.log(`  • ${MOCK_MEAL_PLAN_ENTRIES.length} Meal plan entries`);
    console.log(`  • ${MOCK_MEAL_PLAN_TEMPLATES.length} Meal plan templates`);
    console.log(`  • ${MOCK_TEMPLATE_ENTRIES.length} Template entries`);
  } else {
    console.error("\n❌ Failed to seed mock data");
    console.error("Make sure test users exist first: bun run seed:users");
    process.exit(1);
  }
}

main().catch(console.error);

// Export for use in other scripts
export {
  MOCK_RECIPES,
  MOCK_INGREDIENTS,
  MOCK_RECIPE_INGREDIENTS,
  MOCK_RECIPE_STEPS,
  MOCK_MEAL_PLANS,
  MOCK_MEAL_PLAN_ENTRIES,
  TEST_USER_IDS,
};
