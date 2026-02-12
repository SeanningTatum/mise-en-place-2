import type { MealForExport } from "@/repositories/meal-plan";
import { loggers } from "@/lib/logger";

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format time in minutes to human readable
 */
function formatTime(minutes: number | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get meal type display label
 */
function getMealTypeLabel(mealType: string): string {
  const labels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  };
  return labels[mealType] || mealType;
}

/**
 * Group ingredients by category
 */
function groupIngredientsByCategory(
  ingredients: MealForExport["recipe"]["ingredients"],
): Record<string, typeof ingredients> {
  const groups: Record<string, typeof ingredients> = {};

  for (const ing of ingredients) {
    const category = ing.ingredient.category || "Other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(ing);
  }

  // Sort categories alphabetically with "Other" at the end
  const sortedGroups: Record<string, typeof ingredients> = {};
  const categories = Object.keys(groups).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  for (const category of categories) {
    sortedGroups[category] = groups[category];
  }

  return sortedGroups;
}

/**
 * Format ingredient for display
 */
function formatIngredient(
  ing: MealForExport["recipe"]["ingredients"][number],
): string {
  const parts: string[] = [];
  if (ing.quantity) parts.push(ing.quantity);
  if (ing.unit) parts.push(ing.unit);
  parts.push(ing.ingredient.name);
  if (ing.notes) parts.push(`(${ing.notes})`);
  return parts.join(" ");
}

/**
 * Aggregate ingredients from multiple recipes (for unified guide)
 */
interface AggregatedIngredient {
  name: string;
  category: string | null;
  quantities: Array<{
    quantity: string | null;
    unit: string | null;
    notes: string | null;
    recipeName: string;
  }>;
}

function aggregateIngredients(meals: MealForExport[]): AggregatedIngredient[] {
  const ingredientMap = new Map<string, AggregatedIngredient>();

  for (const meal of meals) {
    for (const ing of meal.recipe.ingredients) {
      const key = ing.ingredient.name.toLowerCase();
      const existing = ingredientMap.get(key);

      if (existing) {
        existing.quantities.push({
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
          recipeName: meal.recipe.title,
        });
      } else {
        ingredientMap.set(key, {
          name: ing.ingredient.name,
          category: ing.ingredient.category,
          quantities: [
            {
              quantity: ing.quantity,
              unit: ing.unit,
              notes: ing.notes,
              recipeName: meal.recipe.title,
            },
          ],
        });
      }
    }
  }

  // Sort by category then name
  return Array.from(ingredientMap.values()).sort((a, b) => {
    const catA = a.category || "zzz";
    const catB = b.category || "zzz";
    if (catA !== catB) return catA.localeCompare(catB);
    return a.name.localeCompare(b.name);
  });
}

/**
 * Format aggregated quantities for display
 */
function formatAggregatedQuantity(
  quantities: AggregatedIngredient["quantities"],
): string {
  if (quantities.length === 1) {
    const q = quantities[0];
    const parts: string[] = [];
    if (q.quantity) parts.push(q.quantity);
    if (q.unit) parts.push(q.unit);
    return parts.join(" ") || "as needed";
  }

  // Multiple quantities - show each
  return quantities
    .map((q) => {
      const parts: string[] = [];
      if (q.quantity) parts.push(q.quantity);
      if (q.unit) parts.push(q.unit);
      return parts.join(" ") || "some";
    })
    .join(" + ");
}

/**
 * Common CSS styles for print documents
 */
const printStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Source Sans 3', system-ui, sans-serif;
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
    color: #1a1a1a;
    line-height: 1.5;
  }
  
  header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e5e5e5;
  }
  
  h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }
  
  h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }
  
  h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    margin-bottom: 0.75rem;
    font-weight: 600;
  }
  
  .subtitle {
    color: #666;
    font-size: 1rem;
  }
  
  .meal-badge {
    display: inline-block;
    background: #f5f5f5;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .meta {
    display: flex;
    gap: 1.5rem;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .recipe-section {
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e5e5e5;
    page-break-inside: avoid;
  }
  
  .recipe-section:last-child {
    border-bottom: none;
  }
  
  .ingredients-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .ingredient-category {
    break-inside: avoid;
  }
  
  .ingredient-list {
    list-style: none;
  }
  
  .ingredient-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.35rem 0;
    border-bottom: 1px dotted #ddd;
  }
  
  .checkbox {
    width: 14px;
    height: 14px;
    border: 1.5px solid #999;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .steps-list {
    list-style: none;
    counter-reset: step-counter;
  }
  
  .step-item {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px dotted #eee;
  }
  
  .step-item:last-child {
    border-bottom: none;
  }
  
  .step-number {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    background: #f5f5f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.85rem;
    color: #666;
  }
  
  .step-content {
    flex: 1;
    padding-top: 3px;
  }
  
  .macros {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: #fafafa;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    margin-top: 1.5rem;
  }
  
  .macro-item {
    text-align: center;
  }
  
  .macro-value {
    font-weight: 600;
    color: #333;
  }
  
  .macro-label {
    color: #666;
    font-size: 0.75rem;
  }
  
  .combined-ingredients {
    margin-bottom: 2.5rem;
    padding: 1.5rem;
    background: #fafafa;
    border-radius: 0.5rem;
  }
  
  .cooking-timeline {
    margin-top: 2rem;
  }
  
  .timeline-meal {
    margin-bottom: 2rem;
    page-break-inside: avoid;
  }
  
  .timeline-meal-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e5e5;
  }
  
  .timeline-meal-type {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    background: #f0f0f0;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  
  .timeline-meal-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  @media print {
    body {
      padding: 0.5in;
    }
    
    .recipe-section {
      page-break-inside: avoid;
    }
    
    .timeline-meal {
      page-break-inside: avoid;
    }
  }
`;

/**
 * Generate HTML for separate recipe cards format
 */
export function generateSeparateRecipesHtml(
  date: Date,
  meals: MealForExport[],
): string {
  const startTime = Date.now();
  loggers.client.debug(
    { format: "separate", mealCount: meals.length, date: date.toISOString() },
    "Generating separate recipes HTML for print",
  );

  const dateStr = formatDate(date);

  const recipeSections = meals
    .map((meal) => {
      const recipe = meal.recipe;
      const groupedIngredients = groupIngredientsByCategory(recipe.ingredients);

      const metaItems: string[] = [];
      if (recipe.servings) {
        metaItems.push(
          `<span class="meta-item">Serves ${recipe.servings}</span>`,
        );
      }
      if (recipe.prepTimeMinutes) {
        metaItems.push(
          `<span class="meta-item">Prep: ${formatTime(recipe.prepTimeMinutes)}</span>`,
        );
      }
      if (recipe.cookTimeMinutes) {
        metaItems.push(
          `<span class="meta-item">Cook: ${formatTime(recipe.cookTimeMinutes)}</span>`,
        );
      }

      const ingredientCategories = Object.entries(groupedIngredients)
        .map(
          ([category, ings]) => `
          <div class="ingredient-category">
            <h3>${category}</h3>
            <ul class="ingredient-list">
              ${ings
                .map(
                  (ing) => `
                <li class="ingredient-item">
                  <div class="checkbox"></div>
                  <span>${formatIngredient(ing)}</span>
                </li>
              `,
                )
                .join("")}
            </ul>
          </div>
        `,
        )
        .join("");

      const steps = recipe.steps
        .map(
          (step) => `
          <li class="step-item">
            <div class="step-number">${step.stepNumber}</div>
            <div class="step-content">${step.instruction}</div>
          </li>
        `,
        )
        .join("");

      const macros =
        recipe.calories || recipe.protein || recipe.carbs || recipe.fat
          ? `
          <div class="macros">
            ${recipe.calories ? `<div class="macro-item"><div class="macro-value">${recipe.calories}</div><div class="macro-label">cal</div></div>` : ""}
            ${recipe.protein ? `<div class="macro-item"><div class="macro-value">${recipe.protein}g</div><div class="macro-label">protein</div></div>` : ""}
            ${recipe.carbs ? `<div class="macro-item"><div class="macro-value">${recipe.carbs}g</div><div class="macro-label">carbs</div></div>` : ""}
            ${recipe.fat ? `<div class="macro-item"><div class="macro-value">${recipe.fat}g</div><div class="macro-label">fat</div></div>` : ""}
            ${recipe.fiber ? `<div class="macro-item"><div class="macro-value">${recipe.fiber}g</div><div class="macro-label">fiber</div></div>` : ""}
          </div>
        `
          : "";

      return `
        <section class="recipe-section">
          <span class="meal-badge">${getMealTypeLabel(meal.mealType)}</span>
          <h2>${recipe.title}</h2>
          ${metaItems.length > 0 ? `<div class="meta">${metaItems.join("")}</div>` : ""}
          
          <h3>Ingredients</h3>
          <div class="ingredients-grid">
            ${ingredientCategories}
          </div>
          
          <h3>Instructions</h3>
          <ol class="steps-list">
            ${steps}
          </ol>
          
          ${macros}
        </section>
      `;
    })
    .join("");

  loggers.client.info(
    {
      format: "separate",
      mealCount: meals.length,
      durationMs: Date.now() - startTime,
    },
    "Separate recipes HTML generated successfully",
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Recipes for ${dateStr}</title>
        <style>${printStyles}</style>
      </head>
      <body>
        <header>
          <h1>Day's Recipes</h1>
          <p class="subtitle">${dateStr}</p>
        </header>
        
        ${recipeSections}
        
        <script>window.print();</script>
      </body>
    </html>
  `;
}

/**
 * Generate HTML for unified cooking guide format
 */
export function generateUnifiedGuideHtml(
  date: Date,
  meals: MealForExport[],
): string {
  const startTime = Date.now();
  loggers.client.debug(
    { format: "unified", mealCount: meals.length, date: date.toISOString() },
    "Generating unified cooking guide HTML for print",
  );

  const dateStr = formatDate(date);
  const mealSummary = meals
    .map((m) => `${getMealTypeLabel(m.mealType)}: ${m.recipe.title}`)
    .join(" • ");

  // Aggregate all ingredients
  const aggregatedIngredients = aggregateIngredients(meals);
  const groupedAggregated: Record<string, AggregatedIngredient[]> = {};

  for (const ing of aggregatedIngredients) {
    const category = ing.category || "Other";
    if (!groupedAggregated[category]) {
      groupedAggregated[category] = [];
    }
    groupedAggregated[category].push(ing);
  }

  const sortedCategories = Object.keys(groupedAggregated).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  const ingredientsSections = sortedCategories
    .map(
      (category) => `
      <div class="ingredient-category">
        <h3>${category}</h3>
        <ul class="ingredient-list">
          ${groupedAggregated[category]
            .map(
              (ing) => `
            <li class="ingredient-item">
              <div class="checkbox"></div>
              <span>${formatAggregatedQuantity(ing.quantities)} ${ing.name}</span>
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>
    `,
    )
    .join("");

  // Build cooking timeline
  const timeline = meals
    .map((meal) => {
      const steps = meal.recipe.steps
        .map(
          (step) => `
          <li class="step-item">
            <div class="step-number">${step.stepNumber}</div>
            <div class="step-content">${step.instruction}</div>
          </li>
        `,
        )
        .join("");

      return `
        <div class="timeline-meal">
          <div class="timeline-meal-header">
            <span class="timeline-meal-type">${getMealTypeLabel(meal.mealType)}</span>
            <span class="timeline-meal-title">${meal.recipe.title}</span>
          </div>
          <ol class="steps-list">
            ${steps}
          </ol>
        </div>
      `;
    })
    .join("");

  // Calculate total macros
  const totalMacros = meals.reduce(
    (acc, meal) => {
      return {
        calories: acc.calories + (meal.recipe.calories || 0),
        protein: acc.protein + (meal.recipe.protein || 0),
        carbs: acc.carbs + (meal.recipe.carbs || 0),
        fat: acc.fat + (meal.recipe.fat || 0),
        fiber: acc.fiber + (meal.recipe.fiber || 0),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  const hasMacros =
    totalMacros.calories ||
    totalMacros.protein ||
    totalMacros.carbs ||
    totalMacros.fat;

  const macrosSection = hasMacros
    ? `
      <div class="macros">
        <strong style="margin-right: 1rem;">Daily Totals:</strong>
        ${totalMacros.calories ? `<div class="macro-item"><div class="macro-value">${totalMacros.calories}</div><div class="macro-label">cal</div></div>` : ""}
        ${totalMacros.protein ? `<div class="macro-item"><div class="macro-value">${totalMacros.protein}g</div><div class="macro-label">protein</div></div>` : ""}
        ${totalMacros.carbs ? `<div class="macro-item"><div class="macro-value">${totalMacros.carbs}g</div><div class="macro-label">carbs</div></div>` : ""}
        ${totalMacros.fat ? `<div class="macro-item"><div class="macro-value">${totalMacros.fat}g</div><div class="macro-label">fat</div></div>` : ""}
        ${totalMacros.fiber ? `<div class="macro-item"><div class="macro-value">${totalMacros.fiber}g</div><div class="macro-label">fiber</div></div>` : ""}
      </div>
    `
    : "";

  loggers.client.info(
    {
      format: "unified",
      mealCount: meals.length,
      ingredientCount: aggregatedIngredients.length,
      durationMs: Date.now() - startTime,
    },
    "Unified cooking guide HTML generated successfully",
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cooking Guide - ${dateStr}</title>
        <style>${printStyles}</style>
      </head>
      <body>
        <header>
          <h1>Daily Cooking Guide</h1>
          <p class="subtitle">${dateStr}</p>
          <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">${mealSummary}</p>
        </header>
        
        <section class="combined-ingredients">
          <h2 style="margin-bottom: 1.5rem;">Shopping List</h2>
          <div class="ingredients-grid">
            ${ingredientsSections}
          </div>
        </section>
        
        <section class="cooking-timeline">
          <h2>Cooking Instructions</h2>
          ${timeline}
        </section>
        
        ${macrosSection}
        
        <script>window.print();</script>
      </body>
    </html>
  `;
}

/**
 * Open print window with generated HTML
 */
export function openPrintWindow(html: string): boolean {
  loggers.client.debug("Opening print window");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    loggers.client.warn("Failed to open print window - pop-up may be blocked");
    return false;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  loggers.client.info("Print window opened successfully");
  return true;
}
