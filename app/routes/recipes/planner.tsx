import { useState, useMemo } from "react";
import { redirect } from "react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  WeeklyPlannerGrid,
  WeeklyPlannerGridSkeleton,
  RecipePicker,
  GroceryListPanel,
  WeeklyMacroSummary,
} from "@/components/planner";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import type { Route } from "./+types/planner";

// Helper to get Monday of the week for a given date
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Format date as ISO string (YYYY-MM-DD)
function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Format week range for display
function formatWeekRange(weekStart: Date): string {
  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString("en-US", { month: "long" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "long" });
  const startDay = weekStart.getDate();
  const endDay = endDate.getDate();
  const year = weekStart.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  return { user: session.user };
}

export default function PlannerPage({ loaderData }: Route.ComponentProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const weekStartISO = formatDateISO(currentWeekStart);

  // Picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dayOfWeek: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  } | null>(null);

  // Fetch meal plan for current week
  const {
    data: mealPlan,
    isLoading: isPlanLoading,
    refetch: refetchPlan,
  } = api.mealPlan.getOrCreateForWeek.useQuery(
    { weekStartDate: weekStartISO },
    { staleTime: 30000 }
  );

  // Fetch grocery list
  const {
    data: groceryList,
    isLoading: isGroceryLoading,
    refetch: refetchGrocery,
  } = api.mealPlan.getGroceryList.useQuery(
    { mealPlanId: mealPlan?.id ?? "" },
    {
      enabled: !!mealPlan?.id,
      staleTime: 30000,
    }
  );

  // Mutations
  const addEntryMutation = api.mealPlan.addEntry.useMutation({
    onSuccess: () => {
      refetchPlan();
      refetchGrocery();
      toast.success("Recipe added to meal plan");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add recipe");
    },
  });

  const removeEntryMutation = api.mealPlan.removeEntry.useMutation({
    onSuccess: () => {
      refetchPlan();
      refetchGrocery();
      toast.success("Recipe removed from meal plan");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove recipe");
    },
  });

  // Navigation
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Check if viewing current week
  const isCurrentWeek = useMemo(() => {
    const today = getMonday(new Date());
    return formatDateISO(today) === weekStartISO;
  }, [weekStartISO]);

  // Handlers
  const handleAddMeal = (
    dayOfWeek: number,
    mealType: "breakfast" | "lunch" | "dinner" | "snacks"
  ) => {
    setSelectedSlot({ dayOfWeek, mealType });
    setPickerOpen(true);
  };

  const handleRemoveMeal = (entryId: string) => {
    removeEntryMutation.mutate({ entryId });
  };

  const handleSelectRecipe = (recipeId: string) => {
    if (!mealPlan || !selectedSlot) return;

    addEntryMutation.mutate({
      mealPlanId: mealPlan.id,
      recipeId,
      dayOfWeek: selectedSlot.dayOfWeek,
      mealType: selectedSlot.mealType,
    });
  };

  // Get day name for picker
  const selectedDayName = selectedSlot
    ? dayNames[selectedSlot.dayOfWeek]
    : "";

  return (
    <div className="space-y-6" data-testid="meal-planner-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Meal Planner
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatWeekRange(currentWeekStart)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
              className="gap-1.5"
            >
              <Calendar className="h-4 w-4" />
              Today
            </Button>
          )}
          <div className="flex items-center rounded-lg border border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousWeek}
              className="rounded-r-none"
              data-testid="prev-week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextWeek}
              className="rounded-l-none"
              data-testid="next-week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Weekly Grid */}
      {isPlanLoading ? (
        <WeeklyPlannerGridSkeleton />
      ) : (
        <WeeklyPlannerGrid
          weekStartDate={currentWeekStart}
          entries={mealPlan?.entries ?? []}
          onAddMeal={handleAddMeal}
          onRemoveMeal={handleRemoveMeal}
          isLoading={addEntryMutation.isPending || removeEntryMutation.isPending}
        />
      )}

      {/* Weekly Macro Summary */}
      {!isPlanLoading && mealPlan?.entries && mealPlan.entries.length > 0 && (
        <WeeklyMacroSummary entries={mealPlan.entries} />
      )}

      {/* Grocery List */}
      <GroceryListPanel
        items={groceryList?.items ?? []}
        totalIngredients={groceryList?.totalIngredients ?? 0}
        recipeCount={groceryList?.recipeCount ?? 0}
        weekStartDate={currentWeekStart}
        isLoading={isGroceryLoading}
      />

      {/* Recipe Picker Modal */}
      <RecipePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelectRecipe}
        mealType={selectedSlot?.mealType ?? "dinner"}
        dayName={selectedDayName}
      />
    </div>
  );
}
