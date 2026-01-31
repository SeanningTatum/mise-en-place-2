import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Youtube, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeItem {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  sourceType: "youtube" | "blog";
  isPublic: boolean;
  saveCount: number;
}

interface RecipeVisibilityListProps {
  recipes: RecipeItem[];
  onToggleVisibility: (recipeId: string, isPublic: boolean) => void;
  isLoading?: boolean;
}

export function RecipeVisibilityList({
  recipes,
  onToggleVisibility,
  isLoading,
}: RecipeVisibilityListProps) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const handleToggle = async (recipeId: string, currentIsPublic: boolean) => {
    setPendingIds((prev) => new Set(prev).add(recipeId));
    try {
      await onToggleVisibility(recipeId, !currentIsPublic);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(recipeId);
        return next;
      });
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recipes yet. Extract your first recipe to share it!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recipes.map((recipe) => {
        const isPending = pendingIds.has(recipe.id);

        return (
          <div
            key={recipe.id}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg border transition-colors",
              recipe.isPublic
                ? "bg-accent/10 border-accent/30"
                : "bg-muted/30 border-border"
            )}
          >
            {/* Thumbnail */}
            <div className="w-16 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {recipe.thumbnailUrl ? (
                <img
                  src={recipe.thumbnailUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {recipe.sourceType === "youtube" ? (
                    <Youtube className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>

            {/* Recipe Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{recipe.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {recipe.sourceType === "youtube" ? "YouTube" : "Blog"}
                </Badge>
                {recipe.saveCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-3 w-3" />
                    {recipe.saveCount} {recipe.saveCount === 1 ? "save" : "saves"}
                  </span>
                )}
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  recipe.isPublic ? "text-accent" : "text-muted-foreground"
                )}
              >
                {recipe.isPublic ? "Public" : "Private"}
              </span>
              <Switch
                checked={recipe.isPublic}
                onCheckedChange={() => handleToggle(recipe.id, recipe.isPublic)}
                disabled={isPending || isLoading}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
