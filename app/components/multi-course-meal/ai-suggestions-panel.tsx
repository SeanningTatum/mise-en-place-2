import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, AlertTriangle, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuSuggestion {
  courseType: string;
  suggestedRecipeId?: string;
  suggestion: string;
  reasoning: string;
}

interface AISuggestionsPanelProps {
  suggestions: MenuSuggestion[];
  onAddSuggested?: (recipeId: string, courseType: string) => void;
  className?: string;
}

const courseTypeLabels: Record<string, string> = {
  appetizer: "Appetizer",
  soup_salad: "Soup / Salad",
  main: "Main Course",
  side: "Side Dish",
  dessert: "Dessert",
  drink: "Drink",
};

export function AISuggestionsPanel({
  suggestions,
  onAddSuggested,
  className,
}: AISuggestionsPanelProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn("p-4 bg-accent/30 border-accent", className)}
      data-testid="ai-suggestions-panel"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-accent/50">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-medium text-sm">AI Menu Suggestions</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on your current menu
            </p>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                suggestion={suggestion}
                onAdd={
                  suggestion.suggestedRecipeId && onAddSuggested
                    ? () =>
                        onAddSuggested(
                          suggestion.suggestedRecipeId!,
                          suggestion.courseType
                        )
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface SuggestionItemProps {
  suggestion: MenuSuggestion;
  onAdd?: () => void;
}

function SuggestionItem({ suggestion, onAdd }: SuggestionItemProps) {
  const isWarning = suggestion.suggestion.toLowerCase().includes("warning") ||
    suggestion.suggestion.toLowerCase().includes("consider") ||
    suggestion.suggestion.toLowerCase().includes("missing");

  return (
    <div
      className="p-3 rounded-sm bg-background/80 border"
      data-testid="suggestion-item"
    >
      <div className="flex items-start gap-2">
        {isWarning ? (
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <ChefHat className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        )}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {courseTypeLabels[suggestion.courseType] || suggestion.courseType}
            </Badge>
          </div>
          <p className="text-sm">{suggestion.suggestion}</p>
          <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
          
          {onAdd && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-2 gap-1.5 h-7 text-xs"
              onClick={onAdd}
            >
              <Plus className="h-3 w-3" />
              Add to Menu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AISuggestionsSkeleton() {
  return (
    <Card className="p-4 bg-accent/30 border-accent">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-accent/50 animate-pulse">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-48 bg-muted animate-pulse rounded mt-1.5" />
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-muted animate-pulse rounded-sm" />
            <div className="h-20 bg-muted animate-pulse rounded-sm" />
          </div>
        </div>
      </div>
    </Card>
  );
}
