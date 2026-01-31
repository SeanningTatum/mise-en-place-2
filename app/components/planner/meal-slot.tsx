import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Plus, X, Clock, Flame, Beef, Wheat, Droplets, Leaf } from "lucide-react";

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

function MacroItem({
  icon,
  label,
  value,
  unit,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-secondary/50 rounded-md px-2 py-1.5",
        className
      )}
    >
      {icon}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">
          {value}
          <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>
        </span>
      </div>
    </div>
  );
}

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
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card
          className={cn(
            "group relative overflow-hidden bg-card border-border/50 hover:shadow-warm transition-shadow cursor-pointer",
            slotHeight,
            "py-0!" // Override Card's default padding
          )}
          data-testid={`meal-slot-${mealType}-filled`}
        >
          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
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

            {/* Info - simplified for card view */}
            <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
              <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                {recipe.title}
              </h4>
              {recipe.calories && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span>{recipe.calories} cal</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </HoverCardTrigger>

      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-72 p-0 overflow-hidden"
      >
        {/* Header with image */}
        {recipe.thumbnailUrl ? (
          <div className="relative h-32 w-full">
            <img
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-3 right-3">
              <h3 className="font-display font-semibold text-white text-sm leading-tight line-clamp-2">
                {recipe.title}
              </h3>
            </div>
          </div>
        ) : (
          <div className="p-3 pb-2 border-b border-border/50">
            <h3 className="font-display font-semibold text-sm leading-tight">
              {recipe.title}
            </h3>
          </div>
        )}

        {/* Details */}
        <div className="p-3 space-y-3">
          {/* Time info */}
          {totalTime > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {recipe.prepTimeMinutes && recipe.prepTimeMinutes > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{recipe.prepTimeMinutes}m prep</span>
                </div>
              )}
              {recipe.cookTimeMinutes && recipe.cookTimeMinutes > 0 && (
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  <span>{recipe.cookTimeMinutes}m cook</span>
                </div>
              )}
            </div>
          )}

          {/* Macro grid */}
          {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat || recipe.fiber) && (
            <div className="grid grid-cols-2 gap-2">
              {recipe.calories && (
                <MacroItem
                  icon={<Flame className="h-3.5 w-3.5 text-orange-500" />}
                  label="Calories"
                  value={recipe.calories}
                  unit="kcal"
                />
              )}
              {recipe.protein && (
                <MacroItem
                  icon={<Beef className="h-3.5 w-3.5 text-red-500" />}
                  label="Protein"
                  value={recipe.protein}
                  unit="g"
                />
              )}
              {recipe.carbs && (
                <MacroItem
                  icon={<Wheat className="h-3.5 w-3.5 text-amber-500" />}
                  label="Carbs"
                  value={recipe.carbs}
                  unit="g"
                />
              )}
              {recipe.fat && (
                <MacroItem
                  icon={<Droplets className="h-3.5 w-3.5 text-blue-500" />}
                  label="Fat"
                  value={recipe.fat}
                  unit="g"
                />
              )}
              {recipe.fiber && (
                <MacroItem
                  icon={<Leaf className="h-3.5 w-3.5 text-green-500" />}
                  label="Fiber"
                  value={recipe.fiber}
                  unit="g"
                  className="col-span-2"
                />
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
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
