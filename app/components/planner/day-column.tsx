import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { MealSlot, MealSlotSkeleton } from "./meal-slot";
import { MacroSummary, calculateMacroTotals } from "./macro-summary";
import { DayExportModal } from "./day-export-modal";

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

interface MealEntry {
  id: string;
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  recipe: RecipeData;
}

interface DayColumnProps {
  dayOfWeek: number;
  date: Date;
  entries: MealEntry[];
  mealPlanId: string;
  onAddMeal: (dayOfWeek: number, mealType: "breakfast" | "lunch" | "dinner" | "snacks") => void;
  onRemoveMeal: (entryId: string) => void;
  isLoading?: boolean;
  isToday?: boolean;
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mealTypes: Array<"breakfast" | "lunch" | "dinner" | "snacks"> = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
];

export function DayColumn({
  dayOfWeek,
  date,
  entries,
  mealPlanId,
  onAddMeal,
  onRemoveMeal,
  isLoading,
  isToday,
}: DayColumnProps) {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const dayName = dayNames[dayOfWeek];
  const dayNumber = date.getDate();
  const hasMeals = entries.length > 0;

  // Get entry for each meal type
  const getEntryForMealType = (mealType: "breakfast" | "lunch" | "dinner" | "snacks") => {
    return entries.find((e) => e.mealType === mealType);
  };

  // Calculate daily macro totals
  const dailyTotals = calculateMacroTotals(entries);

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 p-3 rounded-sm min-w-0 transition-all duration-300",
          isToday && "bg-accent/20 ring-1 ring-accent/40"
        )}
        data-testid={`day-column-${dayOfWeek}`}
      >
        {/* Day header */}
        <div className="text-center pb-3 border-b border-border/30 relative">
          {/* Print button - only show when there are meals */}
          {hasMeals && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-7 w-7 text-muted-foreground hover:text-foreground rounded-sm"
              onClick={() => setExportModalOpen(true)}
              data-testid={`print-day-${dayOfWeek}`}
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="sr-only">Print day's recipes</span>
            </Button>
          )}
          <div className="text-xs font-medium text-muted-foreground">
            {dayName}
          </div>
          <div
            className={cn(
              "text-2xl font-display",
              isToday && "text-primary"
            )}
          >
            {dayNumber}
          </div>
          {/* Daily macro totals */}
          <MacroSummary
            totals={dailyTotals}
            variant="compact"
            className="justify-center mt-2"
          />
        </div>

        {/* Meal slots */}
        <div className="flex flex-col gap-2">
          {mealTypes.map((mealType) => {
            const entry = getEntryForMealType(mealType);
            return (
              <div key={mealType}>
                <div className="text-xs text-muted-foreground font-medium mb-1 px-1">
                  {mealType}
                </div>
                {isLoading ? (
                  <MealSlotSkeleton />
                ) : (
                  <MealSlot
                    mealType={mealType}
                    recipe={entry?.recipe}
                    onAdd={() => onAddMeal(dayOfWeek, mealType)}
                    onRemove={() => entry && onRemoveMeal(entry.id)}
                    isLoading={isLoading}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Export modal */}
      <DayExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        mealPlanId={mealPlanId}
        dayOfWeek={dayOfWeek}
        date={date}
        mealCount={entries.length}
      />
    </>
  );
}

export function DayColumnSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-sm min-w-0">
      <div className="text-center pb-3 border-b border-border/30">
        <div className="h-3 w-10 bg-secondary animate-pulse rounded-sm mx-auto mb-2" />
        <div className="h-8 w-8 bg-secondary animate-pulse rounded-sm mx-auto" />
      </div>
      <div className="flex flex-col gap-3">
        {mealTypes.map((mealType) => (
          <div key={mealType}>
            <div className="h-2.5 w-14 bg-secondary animate-pulse rounded-sm mb-2" />
            <MealSlotSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
