import type { MealForPrint } from "@/repositories/multi-course-meal";
import { loggers } from "@/lib/logger";

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format time from ISO date string
 */
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format duration in minutes to human readable
 */
function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get course type display label
 */
const courseTypeLabels: Record<string, string> = {
  appetizer: "Appetizer",
  soup_salad: "Soup & Salad",
  main: "Main Course",
  side: "Side Dish",
  dessert: "Dessert",
  drink: "Beverage",
};

/**
 * Get service style display label
 */
const serviceStyleLabels: Record<string, string> = {
  plated: "Plated Service",
  family: "Family Style",
  buffet: "Buffet Style",
};

/**
 * Get category display style
 */
const categoryColors: Record<string, { bg: string; text: string }> = {
  prep: { bg: "#dbeafe", text: "#1e40af" },
  cook: { bg: "#fed7aa", text: "#c2410c" },
  rest: { bg: "#e9d5ff", text: "#7c3aed" },
  serve: { bg: "#bbf7d0", text: "#15803d" },
};

/**
 * Common CSS styles for meal guide print documents
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
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e5e5;
  }
  
  h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2.25rem;
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
    margin-bottom: 0.5rem;
  }
  
  .meta-row {
    display: flex;
    justify-content: center;
    gap: 2rem;
    color: #666;
    font-size: 0.9rem;
    margin-top: 1rem;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .section {
    margin-bottom: 1.5rem;
  }
  
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e5e5;
  }
  
  .timeline-item {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px dotted #eee;
  }
  
  .timeline-time {
    font-family: 'Source Sans 3', monospace;
    font-weight: 600;
    width: 70px;
    flex-shrink: 0;
    text-align: right;
  }
  
  .timeline-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }
  
  .timeline-content {
    flex: 1;
  }
  
  .timeline-task {
    font-weight: 500;
  }
  
  .timeline-recipe {
    font-size: 0.85rem;
    color: #666;
  }
  
  .timeline-duration {
    font-size: 0.8rem;
    color: #888;
  }
  
  .course-card {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #fafafa;
    border-radius: 0.5rem;
    page-break-inside: avoid;
  }
  
  .course-type {
    display: inline-block;
    background: #e5e5e5;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
    margin-bottom: 0.75rem;
  }
  
  .course-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
  
  .course-meta {
    display: flex;
    gap: 1.5rem;
    color: #666;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  
  .ingredients-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .ingredient-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  
  .checkbox {
    width: 12px;
    height: 12px;
    border: 1.5px solid #999;
    flex-shrink: 0;
    margin-top: 3px;
  }
  
  .steps-list {
    list-style: none;
  }
  
  .step-item {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }
  
  .step-number {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    background: #e5e5e5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.8rem;
    color: #666;
  }
  
  .shopping-category {
    margin-bottom: 1.5rem;
  }
  
  .shopping-category-title {
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
    margin-bottom: 0.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #e5e5e5;
  }
  
  .shopping-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.25rem 0;
    font-size: 0.9rem;
  }
  
  .shopping-sources {
    font-size: 0.75rem;
    color: #888;
    margin-left: 1.25rem;
  }
  
  .footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e5e5;
    text-align: center;
    color: #888;
    font-size: 0.8rem;
  }
  
  @media print {
    body {
      padding: 0.5in;
    }
    
    header {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      page-break-after: avoid;
    }
    
    .section {
      page-break-before: avoid;
    }
    
    .timeline-item {
      page-break-inside: avoid;
    }
    
    .course-card {
      page-break-inside: avoid;
    }
  }
`;

/**
 * Generate full cooking guide HTML
 */
export function generateFullGuideHtml(meal: MealForPrint): string {
  const startTime = Date.now();
  loggers.print.debug({ mealId: meal.id }, "generateFullGuideHtml: Starting generation");

  const timeline = meal.timelineJson?.items || [];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meal.name} - Cooking Guide</title>
  <style>${printStyles}</style>
</head>
<body>
  <header>
    <h1>${meal.name}</h1>
    <p class="subtitle">${serviceStyleLabels[meal.serviceStyle]} for ${meal.guestCount} Guests</p>
    <div class="meta-row">
      <span class="meta-item">${formatDate(meal.servingTime)}</span>
      <span class="meta-item">Serving at ${formatTime(meal.servingTime)}</span>
      <span class="meta-item">${meal.courses.length} Courses</span>
    </div>
  </header>

  ${timeline.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Cooking Timeline</h2>
    ${timeline.map((item) => `
    <div class="timeline-item">
      <div class="timeline-time">${item.time}</div>
      <div class="timeline-content">
        <span class="timeline-badge" style="background: ${categoryColors[item.category]?.bg || "#f5f5f5"}; color: ${categoryColors[item.category]?.text || "#666"};">
          ${item.category}
        </span>
        <span class="timeline-duration">${item.durationMinutes}m</span>
        <div class="timeline-task">${item.task}</div>
        ${item.recipeName ? `<div class="timeline-recipe">${item.recipeName}</div>` : ""}
      </div>
    </div>
    `).join("")}
  </div>
  ` : ""}

  <div class="section">
    <h2 class="section-title">Recipes</h2>
    ${meal.courses.map((course) => `
    <div class="course-card">
      <span class="course-type">${courseTypeLabels[course.courseType]}</span>
      <h3 class="course-title">${course.recipe.title}</h3>
      <div class="course-meta">
        ${course.recipe.prepTimeMinutes ? `<span>Prep: ${formatDuration(course.recipe.prepTimeMinutes)}</span>` : ""}
        ${course.recipe.cookTimeMinutes ? `<span>Cook: ${formatDuration(course.recipe.cookTimeMinutes)}</span>` : ""}
        ${course.recipe.servings ? `<span>${course.recipe.servings} servings</span>` : ""}
      </div>
      
      ${course.recipe.ingredients.length > 0 ? `
      <h3>Ingredients</h3>
      <div class="ingredients-grid">
        ${course.recipe.ingredients.map((ing) => `
        <div class="ingredient-item">
          <div class="checkbox"></div>
          <span>${ing.quantity || ""} ${ing.unit || ""} ${ing.ingredient.name}${ing.notes ? ` (${ing.notes})` : ""}</span>
        </div>
        `).join("")}
      </div>
      ` : ""}
      
      ${course.recipe.steps.length > 0 ? `
      <h3>Instructions</h3>
      <ol class="steps-list">
        ${course.recipe.steps.map((step) => `
        <li class="step-item">
          <span class="step-number">${step.stepNumber}</span>
          <span>${step.instruction}</span>
        </li>
        `).join("")}
      </ol>
      ` : ""}
    </div>
    `).join("")}
  </div>

  <div class="footer">
    <p>Generated with Mise en Place</p>
  </div>
</body>
</html>
  `;

  loggers.print.info(
    { mealId: meal.id, durationMs: Date.now() - startTime },
    "generateFullGuideHtml: Generation complete"
  );

  return html;
}

/**
 * Generate timeline-only HTML
 */
export function generateTimelineOnlyHtml(meal: MealForPrint): string {
  const timeline = meal.timelineJson?.items || [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meal.name} - Timeline</title>
  <style>${printStyles}</style>
</head>
<body>
  <header>
    <h1>${meal.name}</h1>
    <p class="subtitle">Cooking Timeline</p>
    <div class="meta-row">
      <span class="meta-item">${formatDate(meal.servingTime)}</span>
      <span class="meta-item">Serving at ${formatTime(meal.servingTime)}</span>
    </div>
  </header>

  <div class="section">
    ${timeline.length > 0 ? timeline.map((item) => `
    <div class="timeline-item">
      <div class="timeline-time">${item.time}</div>
      <div class="timeline-content">
        <span class="timeline-badge" style="background: ${categoryColors[item.category]?.bg || "#f5f5f5"}; color: ${categoryColors[item.category]?.text || "#666"};">
          ${item.category}
        </span>
        <span class="timeline-duration">${item.durationMinutes}m</span>
        <div class="timeline-task">${item.task}</div>
        ${item.recipeName ? `<div class="timeline-recipe">${item.recipeName}</div>` : ""}
      </div>
    </div>
    `).join("") : "<p>No timeline generated yet.</p>"}
  </div>

  <div class="footer">
    <p>Generated with Mise en Place</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate shopping list HTML
 */
export function generateShoppingListHtml(meal: MealForPrint): string {
  // Aggregate ingredients by category
  const ingredientMap = new Map<string, {
    name: string;
    category: string;
    quantities: Array<{ quantity: string | null; unit: string | null; notes: string | null; recipeName: string }>;
  }>();

  for (const course of meal.courses) {
    for (const ing of course.recipe.ingredients) {
      const key = ing.ingredient.name.toLowerCase();
      const existing = ingredientMap.get(key);
      if (existing) {
        existing.quantities.push({
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
          recipeName: course.recipe.title,
        });
      } else {
        ingredientMap.set(key, {
          name: ing.ingredient.name,
          category: ing.ingredient.category || "Other",
          quantities: [{
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes,
            recipeName: course.recipe.title,
          }],
        });
      }
    }
  }

  // Group by category
  const byCategory = new Map<string, typeof ingredientMap extends Map<string, infer V> ? V[] : never>();
  for (const ing of ingredientMap.values()) {
    const cat = ing.category;
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(ing);
  }

  // Sort categories
  const sortedCategories = Array.from(byCategory.keys()).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meal.name} - Shopping List</title>
  <style>${printStyles}</style>
</head>
<body>
  <header>
    <h1>${meal.name}</h1>
    <p class="subtitle">Shopping List for ${meal.guestCount} Guests</p>
    <div class="meta-row">
      <span class="meta-item">${ingredientMap.size} items</span>
      <span class="meta-item">${meal.courses.length} recipes</span>
    </div>
  </header>

  <div class="section">
    ${sortedCategories.map((category) => `
    <div class="shopping-category">
      <div class="shopping-category-title">${category}</div>
      ${byCategory.get(category)!.map((ing) => `
      <div class="shopping-item">
        <div class="checkbox"></div>
        <div>
          <span>${ing.quantities.map((q) => `${q.quantity || ""} ${q.unit || ""}`).join(" + ").trim() || "as needed"} ${ing.name}</span>
          ${ing.quantities.length > 1 ? `
          <div class="shopping-sources">From: ${ing.quantities.map((q) => q.recipeName).join(", ")}</div>
          ` : ""}
        </div>
      </div>
      `).join("")}
    </div>
    `).join("")}
  </div>

  <div class="footer">
    <p>Generated with Mise en Place</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate recipe cards HTML (individual recipe pages)
 */
export function generateRecipeCardsHtml(meal: MealForPrint): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meal.name} - Recipe Cards</title>
  <style>
    ${printStyles}
    
    .recipe-card {
      page-break-after: always;
      padding: 2rem;
    }
    
    .recipe-card:last-child {
      page-break-after: auto;
    }
  </style>
</head>
<body>
  ${meal.courses.map((course) => `
  <div class="recipe-card">
    <header style="margin-bottom: 1.5rem;">
      <span class="course-type">${courseTypeLabels[course.courseType]}</span>
      <h1 style="font-size: 1.75rem;">${course.recipe.title}</h1>
      <div class="course-meta" style="margin-top: 0.75rem;">
        ${course.recipe.prepTimeMinutes ? `<span>Prep: ${formatDuration(course.recipe.prepTimeMinutes)}</span>` : ""}
        ${course.recipe.cookTimeMinutes ? `<span>Cook: ${formatDuration(course.recipe.cookTimeMinutes)}</span>` : ""}
        ${course.recipe.servings ? `<span>${course.recipe.servings} servings</span>` : ""}
      </div>
    </header>

    ${course.recipe.ingredients.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Ingredients</h2>
      <div class="ingredients-grid">
        ${course.recipe.ingredients.map((ing) => `
        <div class="ingredient-item">
          <div class="checkbox"></div>
          <span>${ing.quantity || ""} ${ing.unit || ""} ${ing.ingredient.name}${ing.notes ? ` (${ing.notes})` : ""}</span>
        </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
    
    ${course.recipe.steps.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Instructions</h2>
      <ol class="steps-list">
        ${course.recipe.steps.map((step) => `
        <li class="step-item">
          <span class="step-number">${step.stepNumber}</span>
          <span>${step.instruction}</span>
        </li>
        `).join("")}
      </ol>
    </div>
    ` : ""}
  </div>
  `).join("")}
</body>
</html>
  `;
}

/**
 * Open print window with HTML content
 */
export function openPrintWindow(html: string): void {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for fonts to load
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
