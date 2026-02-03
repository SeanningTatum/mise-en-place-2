/**
 * Seed common ingredient aliases
 *
 * This script populates the ingredient_alias table with common variations
 * of ingredient names to improve ingredient normalization.
 *
 * Run with: bun run scripts/seed-ingredient-aliases.ts
 *
 * Note: This script requires the database to be accessible via Wrangler.
 * For local development, ensure you've run the migrations first.
 */

import { drizzle } from "drizzle-orm/d1";
import { ingredient, ingredientAlias } from "../app/db/schema";
import { eq } from "drizzle-orm";

// Common ingredient aliases mapped to their canonical names
// The key is the canonical name, values are aliases
const INGREDIENT_ALIASES: Record<string, string[]> = {
  // Proteins
  "chicken breast": ["chicken breasts", "boneless chicken breast", "skinless chicken breast", "boneless skinless chicken breast"],
  "chicken thigh": ["chicken thighs", "boneless chicken thigh", "bone-in chicken thigh"],
  "ground beef": ["beef mince", "minced beef", "hamburger meat"],
  "ground turkey": ["turkey mince", "minced turkey"],
  "ground pork": ["pork mince", "minced pork"],
  "bacon": ["bacon strips", "streaky bacon", "bacon rashers"],
  "salmon": ["salmon fillet", "salmon filet"],

  // Dairy
  "butter": ["unsalted butter", "salted butter"],
  "milk": ["whole milk", "2% milk", "skim milk"],
  "heavy cream": ["heavy whipping cream", "whipping cream", "double cream"],
  "cream cheese": ["philadelphia cream cheese"],
  "sour cream": ["soured cream"],
  "parmesan cheese": ["parmigiano reggiano", "parmesan", "grated parmesan"],
  "cheddar cheese": ["cheddar", "sharp cheddar", "mild cheddar"],
  "mozzarella cheese": ["mozzarella", "fresh mozzarella"],

  // Oils & Fats
  "olive oil": ["extra virgin olive oil", "evoo", "light olive oil"],
  "vegetable oil": ["canola oil", "neutral oil"],
  "coconut oil": ["virgin coconut oil"],
  "sesame oil": ["toasted sesame oil"],

  // Vegetables
  "onion": ["onions", "yellow onion", "white onion", "brown onion"],
  "garlic": ["garlic cloves", "fresh garlic"],
  "bell pepper": ["bell peppers", "capsicum", "sweet pepper"],
  "tomato": ["tomatoes", "roma tomato", "plum tomato"],
  "potato": ["potatoes", "russet potato", "yukon gold potato"],
  "carrot": ["carrots"],
  "celery": ["celery stalks", "celery sticks"],
  "spinach": ["baby spinach", "fresh spinach"],
  "broccoli": ["broccoli florets"],
  "mushroom": ["mushrooms", "button mushrooms", "cremini mushrooms", "baby bella mushrooms"],
  "zucchini": ["courgette", "zucchini squash"],
  "eggplant": ["aubergine"],
  "green onion": ["green onions", "scallion", "scallions", "spring onion", "spring onions"],
  "cilantro": ["fresh cilantro", "coriander", "fresh coriander"],
  "parsley": ["fresh parsley", "flat leaf parsley", "italian parsley"],

  // Pantry Staples
  "all-purpose flour": ["ap flour", "plain flour", "flour"],
  "bread flour": ["strong flour"],
  "granulated sugar": ["white sugar", "sugar", "caster sugar"],
  "brown sugar": ["light brown sugar", "dark brown sugar", "packed brown sugar"],
  "powdered sugar": ["confectioners sugar", "icing sugar"],
  "baking powder": ["double acting baking powder"],
  "baking soda": ["bicarbonate of soda", "sodium bicarbonate"],
  "salt": ["table salt", "fine salt", "sea salt"],
  "kosher salt": ["coarse salt", "flaky salt"],
  "black pepper": ["freshly ground black pepper", "ground black pepper", "pepper"],
  "vanilla extract": ["pure vanilla extract", "vanilla"],

  // Canned Goods
  "canned tomatoes": ["diced tomatoes", "crushed tomatoes", "tinned tomatoes"],
  "tomato paste": ["tomato puree", "tomato concentrate"],
  "chicken broth": ["chicken stock", "chicken bouillon"],
  "vegetable broth": ["vegetable stock", "veggie broth"],
  "beef broth": ["beef stock", "beef bouillon"],
  "coconut milk": ["canned coconut milk", "full fat coconut milk"],

  // Condiments & Sauces
  "soy sauce": ["shoyu", "tamari"],
  "worcestershire sauce": ["worcester sauce"],
  "hot sauce": ["hot pepper sauce", "cayenne sauce"],
  "dijon mustard": ["dijon", "french mustard"],
  "mayonnaise": ["mayo"],
  "ketchup": ["tomato ketchup", "catsup"],

  // Grains & Pasta
  "rice": ["white rice", "long grain rice"],
  "pasta": ["dried pasta"],
  "spaghetti": ["spaghetti pasta"],
  "penne": ["penne pasta", "penne rigate"],
};

async function seedAliases() {
  // This is a placeholder - in production, you'd need to get the D1 database
  // through Wrangler or your Cloudflare bindings
  console.log("Ingredient Alias Seeding Script");
  console.log("================================\n");

  console.log("This script generates SQL INSERT statements for common ingredient aliases.");
  console.log("You can run these against your D1 database using Wrangler.\n");

  const sqlStatements: string[] = [];

  for (const [canonical, aliases] of Object.entries(INGREDIENT_ALIASES)) {
    const normalizedCanonical = canonical.toLowerCase().trim();

    for (const alias of aliases) {
      const normalizedAlias = alias.toLowerCase().trim();

      // Skip if alias is the same as canonical
      if (normalizedAlias === normalizedCanonical) continue;

      // Generate a UUID-like ID
      const id = crypto.randomUUID();

      sqlStatements.push(
        `INSERT OR IGNORE INTO ingredient_alias (id, alias, canonical_id, created_at)
SELECT '${id}', '${normalizedAlias}', i.id, (CAST(unixepoch('subsecond') * 1000 AS INTEGER))
FROM ingredient i WHERE i.name = '${normalizedCanonical}';`
      );
    }
  }

  console.log("-- SQL statements to seed ingredient aliases");
  console.log("-- Run with: wrangler d1 execute mise-en-place-2-db --local --file=seed-aliases.sql\n");
  console.log(sqlStatements.join("\n\n"));

  console.log("\n\n-- Summary:");
  console.log(`-- Total aliases to create: ${sqlStatements.length}`);
  console.log(`-- Canonical ingredients covered: ${Object.keys(INGREDIENT_ALIASES).length}`);
}

seedAliases();
