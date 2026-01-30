import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Youtube, Globe, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";

interface RecipePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (recipeId: string) => void;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  dayName: string;
}

const mealTypeLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

export function RecipePicker({
  open,
  onOpenChange,
  onSelect,
  mealType,
  dayName,
}: RecipePickerProps) {
  const [search, setSearch] = useState("");

  const { data: recipes, isLoading } = api.mealPlan.getRecipesForPicker.useQuery(
    { search: search || undefined },
    { enabled: open }
  );

  const handleSelect = (recipeId: string) => {
    onSelect(recipeId);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Select Recipe for {mealTypeLabels[mealType]}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{dayName}</p>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="recipe-picker-search"
          />
        </div>

        {/* Recipe list */}
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <RecipePickerItemSkeleton key={i} />
              ))}
            </div>
          ) : recipes && recipes.length > 0 ? (
            <div className="space-y-2">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => handleSelect(recipe.id)}
                  className="w-full text-left"
                  data-testid={`recipe-picker-item-${recipe.id}`}
                >
                  <Card className="p-2 hover:bg-secondary/50 hover:border-primary/30 transition-colors">
                    <div className="flex gap-3">
                      {recipe.thumbnailUrl ? (
                        <div className="w-14 h-14 shrink-0 rounded overflow-hidden bg-secondary">
                          <img
                            src={recipe.thumbnailUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 shrink-0 rounded bg-secondary flex items-center justify-center">
                          {recipe.sourceType === "youtube" ? (
                            <Youtube className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Globe className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                          {recipe.title}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          {recipe.sourceType === "youtube" ? (
                            <>
                              <Youtube className="h-3 w-3 text-red-500" />
                              YouTube
                            </>
                          ) : (
                            <>
                              <Globe className="h-3 w-3" />
                              Blog
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "No recipes found" : "No recipes yet"}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {search
                  ? "Try a different search term"
                  : "Extract recipes from YouTube or blogs first"}
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function RecipePickerItemSkeleton() {
  return (
    <Card className="p-2">
      <div className="flex gap-3">
        <Skeleton className="w-14 h-14 shrink-0 rounded" />
        <div className="flex-1 py-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}
