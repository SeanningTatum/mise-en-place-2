import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Clock, Flame } from "lucide-react";

interface RecipeData {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  sourceType: "youtube" | "blog";
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
}

interface MealSlotProps {
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  recipe?: RecipeData;
  onAdd: () => void;
  onRemove: () => void;
  isLoading?: boolean;
}

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

const mealTypeColors = {
  breakfast: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  lunch: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  dinner: "bg-primary/10 text-primary",
  snacks: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

export function MealSlot({
  mealType,
  recipe,
  onAdd,
  onRemove,
  isLoading,
}: MealSlotProps) {
  const totalTime = recipe
    ? (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)
    : 0;

  // Fixed height for consistent slot sizing
  const slotHeight = "h-[88px]";

  if (!recipe) {
    return (
      <button
        onClick={onAdd}
        disabled={isLoading}
        data-testid={`meal-slot-${mealType}-empty`}
        className={cn(
          "w-full border-2 border-dashed border-border/60 rounded-lg",
          slotHeight,
          "flex flex-col items-center justify-center gap-1",
          "text-muted-foreground hover:text-foreground",
          "hover:border-primary/40 hover:bg-secondary/30",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Plus className="h-5 w-5" />
        <span className="text-xs font-medium">Add {mealTypeLabels[mealType]}</span>
      </button>
    );
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card border-border/50 hover:shadow-warm transition-shadow",
        slotHeight,
        "py-0!" // Override Card's default padding
      )}
      data-testid={`meal-slot-${mealType}-filled`}
    >
      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={isLoading}
        aria-label={`Remove ${mealTypeLabels[mealType]}`}
        className={cn(
          "absolute top-1 right-1 z-10 h-6 w-6",
          "opacity-60 hover:opacity-100 transition-opacity",
          "bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
        )}
        data-testid={`meal-slot-${mealType}-remove`}
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="flex gap-2 p-2 h-full">
        {/* Thumbnail */}
        {recipe.thumbnailUrl ? (
          <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-secondary my-auto">
            <img
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 shrink-0 rounded bg-secondary flex items-center justify-center my-auto">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
          <h4 className="font-medium text-sm line-clamp-2 leading-tight">
            {recipe.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {totalTime > 0 && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {totalTime}m
              </span>
            )}
            {recipe.calories && (
              <span className="flex items-center gap-0.5">
                <Flame className="h-3 w-3" />
                {recipe.calories}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MealSlotSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 h-[88px] py-0!">
      <div className="flex gap-2 p-2 h-full">
        <div className="w-16 h-16 shrink-0 rounded bg-secondary animate-pulse my-auto" />
        <div className="flex-1 flex flex-col justify-center py-0.5">
          <div className="h-4 bg-secondary animate-pulse rounded w-full" />
          <div className="h-3 bg-secondary animate-pulse rounded w-1/2 mt-1" />
        </div>
      </div>
    </Card>
  );
}
