import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MacrosCard } from "./macros-card";
import { Youtube, Globe, Clock, Users, Loader2 } from "lucide-react";
import type { ExtractedRecipeData } from "./recipe-extractor";

interface RecipePreviewProps {
  recipe: ExtractedRecipeData;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

function formatTimestamp(seconds: number | null): string {
  if (seconds === null) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function RecipePreview({ recipe, onSave, onCancel, isSaving }: RecipePreviewProps) {
  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) > 0
      ? (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)
      : null;

  return (
    <Card className="overflow-hidden" data-testid="recipe-preview">
      {/* Header with thumbnail */}
      <div className="flex flex-col sm:flex-row">
        {recipe.thumbnailUrl && (
          <div className="sm:w-48 flex-shrink-0">
            <img
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              className="w-full h-32 sm:h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-xl">{recipe.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="gap-1">
                  {recipe.sourceType === "youtube" ? (
                    <>
                      <Youtube className="h-3 w-3" />
                      YouTube
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      Blog
                    </>
                  )}
                </Badge>
                {recipe.servings && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {recipe.servings} servings
                  </span>
                )}
                {totalTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {totalTime} min
                  </span>
                )}
              </div>
            </div>
          </div>
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {recipe.description}
            </p>
          )}
        </CardHeader>
      </div>

      <Separator />

      <CardContent className="py-4 space-y-6">
        {/* Macros */}
        <MacrosCard
          calories={recipe.calories}
          protein={recipe.protein}
          carbs={recipe.carbs}
          fat={recipe.fat}
          fiber={recipe.fiber}
          servings={recipe.servings}
        />

        {/* Ingredients */}
        <div>
          <h3 className="font-semibold mb-2">
            Ingredients ({recipe.ingredients.length})
          </h3>
          <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>
                  {ing.quantity && <span className="font-medium">{ing.quantity} </span>}
                  {ing.unit && <span>{ing.unit} </span>}
                  {ing.name}
                  {ing.notes && (
                    <span className="text-muted-foreground">, {ing.notes}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <h3 className="font-semibold mb-2">
            Steps ({recipe.steps.length})
          </h3>
          <ol className="space-y-3 text-sm">
            {recipe.steps.map((step) => (
              <li key={step.stepNumber} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                  {step.stepNumber}
                </span>
                <div className="flex-1">
                  {step.timestampSeconds !== null && (
                    <Badge variant="outline" className="mr-2 text-xs font-mono">
                      {formatTimestamp(step.timestampSeconds)}
                    </Badge>
                  )}
                  <span>{step.instruction}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="justify-end gap-2 py-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isSaving} data-testid="save-recipe-button">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Recipe"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
