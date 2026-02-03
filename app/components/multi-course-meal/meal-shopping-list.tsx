import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Copy, Printer, Check, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ScaledIngredient } from "@/repositories/multi-course-meal";

interface MealShoppingListProps {
  items: ScaledIngredient[];
  totalIngredients: number;
  recipeCount: number;
  guestCount: number;
  mealName: string;
}

const categoryOrder = [
  "Produce",
  "Proteins",
  "Dairy",
  "Pantry",
  "Spices",
  "Other",
  null,
];

export function MealShoppingList({
  items,
  totalIngredients,
  recipeCount,
  guestCount,
  mealName,
}: MealShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Group by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ScaledIngredient[]>);

  // Sort categories
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const copyToClipboard = async () => {
    const lines = [`Shopping List - ${mealName}`, `${guestCount} guests`, ""];

    for (const category of sortedCategories) {
      lines.push(category.toUpperCase());
      for (const item of groupedItems[category]) {
        const scaledQty = formatScaledQuantity(item);
        lines.push(`- ${scaledQty} ${item.ingredientName}`);
      }
      lines.push("");
    }

    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Shopping list copied to clipboard");
  };

  const printList = () => {
    // Create a simple printable version
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shopping List - ${mealName}</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            .subtitle { color: #666; margin-bottom: 2rem; }
            h2 { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 1.5rem 0 0.5rem; }
            ul { list-style: none; padding: 0; margin: 0; }
            li { padding: 0.5rem 0; border-bottom: 1px solid #eee; display: flex; gap: 0.5rem; }
            .checkbox { width: 1rem; height: 1rem; border: 1px solid #ccc; flex-shrink: 0; }
          </style>
        </head>
        <body>
          <h1>Shopping List</h1>
          <p class="subtitle">${mealName} • ${guestCount} guests</p>
          ${sortedCategories
            .map(
              (category) => `
            <h2>${category}</h2>
            <ul>
              ${groupedItems[category]
                .map(
                  (item) => `
                <li>
                  <span class="checkbox"></span>
                  <span>${formatScaledQuantity(item)} ${item.ingredientName}</span>
                </li>
              `
                )
                .join("")}
            </ul>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center" data-testid="shopping-list-empty">
        <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">
          Add courses to generate a shopping list
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="meal-shopping-list">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Shopping List</h3>
          <p className="text-sm text-muted-foreground">
            {totalIngredients} ingredients from {recipeCount} recipes • Scaled
            for {guestCount} guests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="gap-1.5"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={printList}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {sortedCategories.map((category) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="space-y-1">
              {groupedItems[category].map((item) => (
                <IngredientRow
                  key={item.ingredientId}
                  item={item}
                  isChecked={checkedItems.has(item.ingredientId)}
                  onToggle={() => toggleItem(item.ingredientId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface IngredientRowProps {
  item: ScaledIngredient;
  isChecked: boolean;
  onToggle: () => void;
}

function IngredientRow({ item, isChecked, onToggle }: IngredientRowProps) {
  const scaledQty = formatScaledQuantity(item);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors",
        isChecked && "opacity-50"
      )}
      data-testid={`ingredient-${item.ingredientId}`}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={onToggle}
        className="shrink-0"
      />
      <span className={cn("flex-1 text-sm", isChecked && "line-through")}>
        <span className="font-medium">{scaledQty}</span> {item.ingredientName}
      </span>
      {item.quantities.length > 1 && (
        <Badge variant="outline" className="text-xs shrink-0">
          {item.quantities.length} recipes
        </Badge>
      )}
    </div>
  );
}

function formatScaledQuantity(item: ScaledIngredient): string {
  // Combine quantities from all sources
  const combined = item.quantities.reduce(
    (acc, q) => {
      if (q.quantity) {
        const numQty = parseQuantity(q.quantity);
        const scaled = numQty * q.scaleFactor;
        acc.total += scaled;
        if (q.unit && !acc.unit) {
          acc.unit = q.unit;
        }
      }
      return acc;
    },
    { total: 0, unit: "" }
  );

  if (combined.total === 0) {
    return "";
  }

  // Format the number nicely
  const formatted = formatNumber(combined.total);
  return combined.unit ? `${formatted} ${combined.unit}` : formatted;
}

function parseQuantity(qty: string): number {
  // Handle fractions like "1/2", "1 1/2", etc.
  const parts = qty.trim().split(/\s+/);
  let total = 0;

  for (const part of parts) {
    if (part.includes("/")) {
      const [num, den] = part.split("/").map(Number);
      total += num / den;
    } else {
      total += parseFloat(part) || 0;
    }
  }

  return total;
}

function formatNumber(num: number): string {
  // Round to reasonable precision
  const rounded = Math.round(num * 4) / 4; // Quarter precision

  // Convert common fractions
  const whole = Math.floor(rounded);
  const frac = rounded - whole;

  let fracStr = "";
  if (Math.abs(frac - 0.25) < 0.01) fracStr = "¼";
  else if (Math.abs(frac - 0.5) < 0.01) fracStr = "½";
  else if (Math.abs(frac - 0.75) < 0.01) fracStr = "¾";
  else if (Math.abs(frac - 0.33) < 0.05) fracStr = "⅓";
  else if (Math.abs(frac - 0.67) < 0.05) fracStr = "⅔";

  if (whole === 0 && fracStr) return fracStr;
  if (fracStr) return `${whole} ${fracStr}`;
  return rounded.toString();
}
