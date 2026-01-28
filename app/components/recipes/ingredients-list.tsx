import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Ingredient {
  id: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  ingredient: {
    id: string;
    name: string;
    category: string | null;
  };
}

interface IngredientsListProps {
  ingredients: Ingredient[];
  checkable?: boolean;
}

export function IngredientsList({ ingredients, checkable = false }: IngredientsListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  // Group by category if available
  const groupedIngredients = ingredients.reduce(
    (groups, ing) => {
      const category = ing.ingredient.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(ing);
      return groups;
    },
    {} as Record<string, Ingredient[]>
  );

  const categories = Object.keys(groupedIngredients).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  const hasCategories = categories.length > 1 || (categories.length === 1 && categories[0] !== "Other");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Ingredients</h3>
        {checkable && checkedItems.size > 0 && (
          <span className="text-sm text-muted-foreground">
            {checkedItems.size} of {ingredients.length} checked
          </span>
        )}
      </div>

      {hasCategories ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                {category}
              </h4>
              <ul className="space-y-2">
                {groupedIngredients[category].map((ing) => (
                  <IngredientItem
                    key={ing.id}
                    ingredient={ing}
                    checkable={checkable}
                    checked={checkedItems.has(ing.id)}
                    onToggle={() => toggleItem(ing.id)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {ingredients.map((ing) => (
            <IngredientItem
              key={ing.id}
              ingredient={ing}
              checkable={checkable}
              checked={checkedItems.has(ing.id)}
              onToggle={() => toggleItem(ing.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface IngredientItemProps {
  ingredient: Ingredient;
  checkable: boolean;
  checked: boolean;
  onToggle: () => void;
}

function IngredientItem({ ingredient: ing, checkable, checked, onToggle }: IngredientItemProps) {
  const content = (
    <span
      className={cn(
        "text-sm",
        checked && "line-through text-muted-foreground"
      )}
    >
      {ing.quantity && <span className="font-medium">{ing.quantity} </span>}
      {ing.unit && <span>{ing.unit} </span>}
      {ing.ingredient.name}
      {ing.notes && <span className="text-muted-foreground">, {ing.notes}</span>}
    </span>
  );

  if (checkable) {
    return (
      <li className="flex items-center gap-3">
        <Checkbox
          id={ing.id}
          checked={checked}
          onCheckedChange={onToggle}
          data-testid={`ingredient-checkbox-${ing.id}`}
        />
        <label
          htmlFor={ing.id}
          className="flex-1 cursor-pointer"
        >
          {content}
        </label>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-2">
      <span className="text-muted-foreground">•</span>
      {content}
    </li>
  );
}
