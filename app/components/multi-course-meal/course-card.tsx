import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Pencil, Trash2, Youtube, Globe, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseType } from "@/repositories/multi-course-meal";

interface CourseCardProps {
  id: string;
  courseType: CourseType;
  courseOrder: number;
  recipe: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    sourceType: "youtube" | "blog" | "custom";
    servings: number | null;
  };
  guestCount: number;
  onEdit?: () => void;
  onRemove?: () => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const courseTypeLabels: Record<CourseType, string> = {
  appetizer: "Appetizer",
  soup_salad: "Soup / Salad",
  main: "Main Course",
  side: "Side Dish",
  dessert: "Dessert",
  drink: "Drink",
};

const courseTypeColors: Record<CourseType, string> = {
  appetizer: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  soup_salad: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  main: "bg-primary/10 text-primary",
  side: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  dessert: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  drink: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

export function CourseCard({
  id,
  courseType,
  courseOrder,
  recipe,
  guestCount,
  onEdit,
  onRemove,
  isDragging,
  dragHandleProps,
}: CourseCardProps) {
  const originalServings = recipe.servings || 1;
  const scaleFactor = guestCount / originalServings;
  const isScaled = Math.abs(scaleFactor - 1) > 0.01;

  return (
    <Card
      className={cn(
        "p-4 transition-all",
        isDragging && "shadow-lg scale-[1.02] bg-card/95"
      )}
      data-testid={`course-card-${id}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="flex items-center justify-center w-6 h-full cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        {/* Course Number and Type Badge */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-sm font-semibold text-muted-foreground">
            {courseOrder + 1}.
          </span>
          <Badge
            variant="secondary"
            className={cn("text-xs font-medium", courseTypeColors[courseType])}
          >
            {courseTypeLabels[courseType]}
          </Badge>
        </div>

        {/* Thumbnail */}
        <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-secondary">
          {recipe.thumbnailUrl ? (
            <img
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {recipe.sourceType === "youtube" ? (
                <Youtube className="h-6 w-6 text-muted-foreground" />
              ) : recipe.sourceType === "custom" ? (
                <ChefHat className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Globe className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 leading-snug">
            {recipe.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Serves {guestCount}
            {isScaled && (
              <span className="text-primary/80">
                {" "}
                (scaled from {originalServings})
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              data-testid={`course-edit-${id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
              data-testid={`course-remove-${id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
