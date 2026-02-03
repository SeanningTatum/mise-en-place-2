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
          "flex flex-col gap-2 p-2 rounded-lg min-w-0",
          isToday && "bg-primary/5 ring-1 ring-primary/20"
        )}
        data-testid={`day-column-${dayOfWeek}`}
      >
        {/* Day header */}
        <div className="text-center pb-2 border-b border-border/40 relative">
          {/* Print button - only show when there are meals */}
          {hasMeals && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setExportModalOpen(true)}
              data-testid={`print-day-${dayOfWeek}`}
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="sr-only">Print day's recipes</span>
            </Button>
          )}
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {dayName}
          </div>
          <div
            className={cn(
              "text-lg font-display font-semibold",
              isToday && "text-primary"
            )}
          >
            {dayNumber}
          </div>
          {/* Daily macro totals */}
          <MacroSummary
            totals={dailyTotals}
            variant="compact"
            className="justify-center mt-1"
          />
        </div>

        {/* Meal slots */}
        <div className="flex flex-col gap-2">
          {mealTypes.map((mealType) => {
            const entry = getEntryForMealType(mealType);
            return (
              <div key={mealType}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 px-1">
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
    <div className="flex flex-col gap-2 p-2 rounded-lg min-w-0">
      <div className="text-center pb-2 border-b border-border/40">
        <div className="h-3 w-8 bg-secondary animate-pulse rounded mx-auto mb-1" />
        <div className="h-6 w-6 bg-secondary animate-pulse rounded mx-auto" />
      </div>
      <div className="flex flex-col gap-2">
        {mealTypes.map((mealType) => (
          <div key={mealType}>
            <div className="h-2 w-12 bg-secondary animate-pulse rounded mb-1" />
            <MealSlotSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
