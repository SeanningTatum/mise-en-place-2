import { DayColumn, DayColumnSkeleton } from "./day-column";

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

interface WeeklyPlannerGridProps {
  weekStartDate: Date;
  entries: MealEntry[];
  onAddMeal: (dayOfWeek: number, mealType: "breakfast" | "lunch" | "dinner" | "snacks") => void;
  onRemoveMeal: (entryId: string) => void;
  isLoading?: boolean;
}

function getWeekDates(weekStartDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function WeeklyPlannerGrid({
  weekStartDate,
  entries,
  onAddMeal,
  onRemoveMeal,
  isLoading,
}: WeeklyPlannerGridProps) {
  const weekDates = getWeekDates(weekStartDate);
  const today = new Date();

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-3"
      data-testid="weekly-planner-grid"
    >
      {weekDates.map((date, index) => {
        const dayEntries = entries.filter((e) => e.dayOfWeek === index);
        const isToday = isSameDay(date, today);

        return isLoading ? (
          <DayColumnSkeleton key={index} />
        ) : (
          <DayColumn
            key={index}
            dayOfWeek={index}
            date={date}
            entries={dayEntries}
            onAddMeal={onAddMeal}
            onRemoveMeal={onRemoveMeal}
            isLoading={isLoading}
            isToday={isToday}
          />
        );
      })}
    </div>
  );
}

export function WeeklyPlannerGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <DayColumnSkeleton key={index} />
      ))}
    </div>
  );
}
