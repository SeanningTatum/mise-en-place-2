import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Printer,
  ShoppingCart,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GroceryQuantity {
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  recipeTitle: string;
}

interface GroceryListItem {
  ingredientId: string;
  ingredientName: string;
  category: string | null;
  quantities: GroceryQuantity[];
}

interface GroceryListPanelProps {
  items: GroceryListItem[];
  totalIngredients: number;
  recipeCount: number;
  weekStartDate: Date;
  isLoading?: boolean;
}

function formatQuantities(quantities: GroceryQuantity[]): string {
  // Aggregate quantities with same unit
  const aggregated: Record<string, { total: number; unit: string }> = {};
  const unparseable: string[] = [];

  for (const q of quantities) {
    if (!q.quantity) {
      unparseable.push(q.recipeTitle);
      continue;
    }

    // Try to parse the quantity as a number
    const numMatch = q.quantity.match(/^[\d.\/]+/);
    if (numMatch) {
      const num = parseFloat(eval(numMatch[0].replace(/\//g, "/"))) || 0;
      const unit = q.unit || "units";
      if (aggregated[unit]) {
        aggregated[unit].total += num;
      } else {
        aggregated[unit] = { total: num, unit };
      }
    } else {
      unparseable.push(`${q.quantity}${q.unit ? " " + q.unit : ""}`);
    }
  }

  const parts: string[] = [];
  for (const { total, unit } of Object.values(aggregated)) {
    // Round to 2 decimal places if needed
    const displayNum = total % 1 === 0 ? total : total.toFixed(1);
    parts.push(`${displayNum} ${unit}`);
  }

  if (unparseable.length > 0 && parts.length === 0) {
    return unparseable[0];
  }

  return parts.join(" + ") || "as needed";
}

function formatWeekRange(weekStartDate: Date): string {
  const endDate = new Date(weekStartDate);
  endDate.setDate(endDate.getDate() + 6);

  const startMonth = weekStartDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStartDate.getDate();
  const endDay = endDate.getDate();
  const year = weekStartDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

export function GroceryListPanel({
  items,
  totalIngredients,
  recipeCount,
  weekStartDate,
  isLoading,
}: GroceryListPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Group items by category
  const groupedItems = items.reduce(
    (groups, item) => {
      const category = item.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    },
    {} as Record<string, GroceryListItem[]>
  );

  const categories = Object.keys(groupedItems).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const generatePlainText = () => {
    const lines: string[] = [];
    lines.push(`Grocery List - Week of ${formatWeekRange(weekStartDate)}`);
    lines.push("");

    for (const category of categories) {
      lines.push(category.toUpperCase());
      for (const item of groupedItems[category]) {
        const qty = formatQuantities(item.quantities);
        lines.push(`- ${qty} ${item.ingredientName}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  };

  const handleCopyToClipboard = async () => {
    const text = generatePlainText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Grocery list copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print");
      return;
    }

    const weekRange = formatWeekRange(weekStartDate);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grocery List - ${weekRange}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Source+Sans+3:wght@400;500;600&display=swap');
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Source Sans 3', system-ui, sans-serif;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
              color: #1a1a1a;
            }
            
            header {
              text-align: center;
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 2px solid #e5e5e5;
            }
            
            h1 {
              font-family: 'Playfair Display', serif;
              font-size: 2rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            
            .subtitle {
              color: #666;
              font-size: 0.9rem;
            }
            
            .stats {
              display: flex;
              justify-content: center;
              gap: 2rem;
              margin-top: 0.75rem;
              color: #666;
              font-size: 0.85rem;
            }
            
            .categories {
              columns: 2;
              column-gap: 2rem;
            }
            
            .category {
              break-inside: avoid;
              margin-bottom: 1.5rem;
            }
            
            .category h2 {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #888;
              margin-bottom: 0.5rem;
              font-weight: 600;
            }
            
            ul {
              list-style: none;
            }
            
            li {
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
            
            .ingredient-name {
              flex: 1;
            }
            
            .quantity {
              color: #666;
              font-size: 0.9rem;
            }
            
            @media print {
              body {
                padding: 0.5in;
              }
            }
          </style>
        </head>
        <body>
          <header>
            <h1>Grocery List</h1>
            <p class="subtitle">Week of ${weekRange}</p>
            <div class="stats">
              <span>${totalIngredients} ingredients</span>
              <span>${recipeCount} recipes</span>
            </div>
          </header>
          
          <div class="categories">
            ${categories
              .map(
                (category) => `
              <div class="category">
                <h2>${category}</h2>
                <ul>
                  ${groupedItems[category]
                    .map(
                      (item) => `
                    <li>
                      <div class="checkbox"></div>
                      <span class="ingredient-name">${item.ingredientName}</span>
                      <span class="quantity">${formatQuantities(item.quantities)}</span>
                    </li>
                  `
                    )
                    .join("")}
                </ul>
              </div>
            `
              )
              .join("")}
          </div>
          
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) {
    return <GroceryListPanelSkeleton />;
  }

  return (
    <Card className="border-border/50" data-testid="grocery-list-panel">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <CardTitle className="font-display text-lg">Grocery List</CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {totalIngredients} items
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="gap-1.5"
                data-testid="copy-grocery-list"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5"
                data-testid="print-grocery-list"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Add recipes to your meal plan</p>
                <p className="text-xs">to generate a grocery list</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <div key={category}>
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                      {category}
                    </h4>
                    <ul className="space-y-1">
                      {groupedItems[category].map((item) => (
                        <li
                          key={item.ingredientId}
                          className="flex items-start gap-2"
                        >
                          <Checkbox
                            id={item.ingredientId}
                            checked={checkedItems.has(item.ingredientId)}
                            onCheckedChange={() => toggleItem(item.ingredientId)}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={item.ingredientId}
                            className={cn(
                              "text-sm cursor-pointer flex-1",
                              checkedItems.has(item.ingredientId) &&
                                "line-through text-muted-foreground"
                            )}
                          >
                            <span className="text-muted-foreground">
                              {formatQuantities(item.quantities)}
                            </span>{" "}
                            {item.ingredientName}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function GroceryListPanelSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-2" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
