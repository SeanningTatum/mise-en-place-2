import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Youtube, Globe, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks";
import { api } from "@/trpc/client";
import type { CourseType } from "@/repositories/multi-course-meal";

interface CoursePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (recipeId: string, courseType: CourseType) => void;
  existingCourseTypes?: CourseType[];
}

const courseTypeOptions: Array<{
  value: CourseType;
  label: string;
  emoji: string;
}> = [
  { value: "appetizer", label: "Appetizer", emoji: "🥗" },
  { value: "soup_salad", label: "Soup / Salad", emoji: "🥣" },
  { value: "main", label: "Main Course", emoji: "🍖" },
  { value: "side", label: "Side Dish", emoji: "🥔" },
  { value: "dessert", label: "Dessert", emoji: "🍰" },
  { value: "drink", label: "Drink", emoji: "🍷" },
];

export function CoursePickerModal({
  open,
  onOpenChange,
  onSelect,
  existingCourseTypes = [],
}: CoursePickerModalProps) {
  const [courseType, setCourseType] = useState<CourseType | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: recipes, isLoading } =
    api.multiCourseMeal.getRecipesForPicker.useQuery(
      { search: debouncedSearch || undefined },
      { enabled: open && !!courseType }
    );

  const handleSelectRecipe = (recipeId: string) => {
    if (!courseType) return;
    onSelect(recipeId, courseType);
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setCourseType(null);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {courseType ? "Select Recipe" : "Add Course"}
          </DialogTitle>
        </DialogHeader>

        {!courseType ? (
          // Step 1: Select course type
          <div className="space-y-3" data-testid="course-type-selector">
            <p className="text-sm text-muted-foreground">
              What type of course are you adding?
            </p>
            <RadioGroup
              onValueChange={(value) => setCourseType(value as CourseType)}
              className="grid grid-cols-2 gap-2"
            >
              {courseTypeOptions.map((option) => {
                const alreadyExists = existingCourseTypes.includes(option.value);
                return (
                  <Label
                    key={option.value}
                    htmlFor={`course-type-${option.value}`}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-all hover:border-primary/50",
                      alreadyExists && "opacity-50"
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`course-type-${option.value}`}
                      className="sr-only"
                    />
                    <span className="text-xl">{option.emoji}</span>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{option.label}</span>
                      {alreadyExists && (
                        <p className="text-xs text-muted-foreground">
                          Already added
                        </p>
                      )}
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        ) : (
          // Step 2: Select recipe
          <>
            <p className="text-sm text-muted-foreground">
              Select a recipe for your{" "}
              {courseTypeOptions.find((c) => c.value === courseType)?.label}
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="course-recipe-search"
              />
            </div>

            {/* Recipe list */}
            <ScrollArea className="h-72">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <RecipeItemSkeleton key={i} />
                  ))}
                </div>
              ) : recipes && recipes.length > 0 ? (
                <div className="space-y-2">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe.id)}
                      className="w-full text-left"
                      data-testid={`course-recipe-item-${recipe.id}`}
                    >
                      <Card className="p-2 hover:bg-secondary/50 hover:border-primary/30 transition-colors">
                        <div className="flex gap-3">
                          {recipe.thumbnailUrl ? (
                            <div className="w-12 h-12 shrink-0 rounded overflow-hidden bg-secondary">
                              <img
                                src={recipe.thumbnailUrl}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 shrink-0 rounded bg-secondary flex items-center justify-center">
                              {recipe.sourceType === "youtube" ? (
                                <Youtube className="h-4 w-4 text-muted-foreground" />
                              ) : recipe.sourceType === "custom" ? (
                                <ChefHat className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Globe className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0 py-0.5">
                            <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                              {recipe.title}
                            </h4>
                          </div>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <ChefHat className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {search ? "No recipes found" : "No recipes yet"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RecipeItemSkeleton() {
  return (
    <Card className="p-2">
      <div className="flex gap-3">
        <Skeleton className="w-12 h-12 shrink-0 rounded" />
        <div className="flex-1 py-1">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </Card>
  );
}
