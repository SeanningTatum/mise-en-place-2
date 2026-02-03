import { Youtube, Globe, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekPreviewGridEntry {
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  recipe: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    sourceType: "youtube" | "blog" | "custom";
  };
}

interface WeekPreviewGridProps {
  entries: WeekPreviewGridEntry[];
  compact?: boolean;
  showMealTypes?: ("breakfast" | "lunch" | "dinner" | "snacks")[];
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const defaultMealTypes: ("breakfast" | "lunch" | "dinner" | "snacks")[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
];

const mealTypeLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

export function WeekPreviewGrid({
  entries,
  compact = false,
  showMealTypes = defaultMealTypes,
}: WeekPreviewGridProps) {
  // Build a lookup map for quick access
  const entryMap = new Map<string, WeekPreviewGridEntry>();
  for (const entry of entries) {
    entryMap.set(`${entry.dayOfWeek}-${entry.mealType}`, entry);
  }

  // Filter meal types that have at least one entry if not showing all
  const relevantMealTypes = showMealTypes.filter((mealType) =>
    entries.some((e) => e.mealType === mealType)
  );

  // Use filtered meal types if any have entries, otherwise show default dinner/lunch
  const displayMealTypes =
    relevantMealTypes.length > 0 ? relevantMealTypes : ["dinner", "lunch"];

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden",
        compact ? "text-xs" : "text-sm"
      )}
      data-testid="week-preview-grid"
    >
      {/* Header row with day names */}
      <div className="grid grid-cols-8 bg-secondary/50">
        <div className="p-2 font-medium text-muted-foreground border-r">
          &nbsp;
        </div>
        {dayNames.map((day, i) => (
          <div
            key={day}
            className={cn(
              "p-2 text-center font-medium",
              i < 6 && "border-r border-border/50"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Meal rows */}
      {displayMealTypes.map((mealType, rowIndex) => (
        <div
          key={mealType}
          className={cn(
            "grid grid-cols-8",
            rowIndex < displayMealTypes.length - 1 && "border-b"
          )}
        >
          {/* Meal type label */}
          <div
            className={cn(
              "p-2 font-medium text-muted-foreground border-r bg-secondary/30 flex items-center",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {compact ? mealTypeLabels[mealType].substring(0, 1) : mealTypeLabels[mealType]}
          </div>

          {/* Day cells */}
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const entry = entryMap.get(`${dayIndex}-${mealType}`);
            return (
              <MealCell
                key={`${dayIndex}-${mealType}`}
                entry={entry}
                compact={compact}
                isLastColumn={dayIndex === 6}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface MealCellProps {
  entry?: WeekPreviewGridEntry;
  compact?: boolean;
  isLastColumn?: boolean;
}

function MealCell({ entry, compact, isLastColumn }: MealCellProps) {
  if (!entry) {
    return (
      <div
        className={cn(
          "p-1 min-h-[48px] flex items-center justify-center",
          !isLastColumn && "border-r border-border/50"
        )}
      >
        <span className="text-muted-foreground/30">—</span>
      </div>
    );
  }

  const SourceIcon =
    entry.recipe.sourceType === "youtube"
      ? Youtube
      : entry.recipe.sourceType === "custom"
      ? ChefHat
      : Globe;

  return (
    <div
      className={cn(
        "p-1 min-h-[48px] flex items-center justify-center",
        !isLastColumn && "border-r border-border/50"
      )}
      title={entry.recipe.title}
    >
      {entry.recipe.thumbnailUrl ? (
        <div
          className={cn(
            "relative rounded overflow-hidden bg-secondary",
            compact ? "w-8 h-8" : "w-10 h-10"
          )}
        >
          <img
            src={entry.recipe.thumbnailUrl}
            alt={entry.recipe.title}
            className="w-full h-full object-cover"
          />
          {entry.recipe.sourceType === "youtube" && (
            <div className="absolute bottom-0 right-0 bg-red-600 p-0.5 rounded-tl">
              <Youtube className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "rounded bg-secondary flex items-center justify-center",
            compact ? "w-8 h-8" : "w-10 h-10"
          )}
        >
          <SourceIcon className="h-4 w-4 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for the week preview grid
 */
export function WeekPreviewGridSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="border rounded-lg overflow-hidden animate-pulse">
      {/* Header */}
      <div className="grid grid-cols-8 bg-secondary/50">
        <div className="p-2 border-r">&nbsp;</div>
        {dayNames.map((day, i) => (
          <div
            key={day}
            className={cn(
              "p-2 text-center",
              i < 6 && "border-r border-border/50"
            )}
          >
            <div className="h-4 bg-muted-foreground/20 rounded w-8 mx-auto" />
          </div>
        ))}
      </div>

      {/* Rows */}
      {["Dinner", "Lunch"].map((mealType, rowIndex) => (
        <div
          key={mealType}
          className={cn("grid grid-cols-8", rowIndex < 1 && "border-b")}
        >
          <div className="p-2 border-r bg-secondary/30">
            <div className="h-4 bg-muted-foreground/20 rounded w-12" />
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "p-1 min-h-[48px] flex items-center justify-center",
                i < 6 && "border-r border-border/50"
              )}
            >
              <div
                className={cn(
                  "rounded bg-muted-foreground/20",
                  compact ? "w-8 h-8" : "w-10 h-10"
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
