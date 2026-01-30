import { cn } from "@/lib/utils";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface MacroSummaryProps {
  totals: MacroTotals;
  variant?: "compact" | "full";
  className?: string;
}

/**
 * Display macro totals (calories, protein, carbs, fat)
 * - compact: Small inline display for day columns
 * - full: Larger display for weekly summary
 */
export function MacroSummary({
  totals,
  variant = "compact",
  className,
}: MacroSummaryProps) {
  const hasAnyData =
    totals.calories > 0 ||
    totals.protein > 0 ||
    totals.carbs > 0 ||
    totals.fat > 0;

  if (!hasAnyData) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground",
          className
        )}
        data-testid="macro-summary-compact"
      >
        {totals.calories > 0 && (
          <span className="flex items-center gap-0.5">
            <Flame className="h-2.5 w-2.5 text-amber-500" />
            {totals.calories}
          </span>
        )}
        {totals.protein > 0 && (
          <span className="flex items-center gap-0.5">
            <Beef className="h-2.5 w-2.5 text-rose-500" />
            {totals.protein}g
          </span>
        )}
        {totals.carbs > 0 && (
          <span className="flex items-center gap-0.5">
            <Wheat className="h-2.5 w-2.5 text-amber-600" />
            {totals.carbs}g
          </span>
        )}
        {totals.fat > 0 && (
          <span className="flex items-center gap-0.5">
            <Droplet className="h-2.5 w-2.5 text-sky-500" />
            {totals.fat}g
          </span>
        )}
      </div>
    );
  }

  // Full variant for weekly summary
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 sm:gap-6",
        className
      )}
      data-testid="macro-summary-full"
    >
      <MacroItem
        icon={<Flame className="h-4 w-4 text-amber-500" />}
        label="Calories"
        value={totals.calories}
        unit="kcal"
      />
      <MacroItem
        icon={<Beef className="h-4 w-4 text-rose-500" />}
        label="Protein"
        value={totals.protein}
        unit="g"
      />
      <MacroItem
        icon={<Wheat className="h-4 w-4 text-amber-600" />}
        label="Carbs"
        value={totals.carbs}
        unit="g"
      />
      <MacroItem
        icon={<Droplet className="h-4 w-4 text-sky-500" />}
        label="Fat"
        value={totals.fat}
        unit="g"
      />
      {totals.fiber > 0 && (
        <MacroItem
          icon={<span className="h-4 w-4 text-emerald-500 text-xs font-bold">F</span>}
          label="Fiber"
          value={totals.fiber}
          unit="g"
        />
      )}
    </div>
  );
}

interface MacroItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}

function MacroItem({ icon, label, value, unit }: MacroItemProps) {
  if (value === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="font-display text-lg font-semibold text-foreground">
          {value.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground ml-0.5">
            {unit}
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * Weekly macro summary bar component
 */
interface WeeklyMacroSummaryProps {
  entries: Array<{
    recipe: {
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      fiber: number | null;
    };
  }>;
  className?: string;
}

export function WeeklyMacroSummary({
  entries,
  className,
}: WeeklyMacroSummaryProps) {
  const totals = calculateMacroTotals(entries);
  const hasAnyData =
    totals.calories > 0 ||
    totals.protein > 0 ||
    totals.carbs > 0 ||
    totals.fat > 0;

  if (!hasAnyData) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-card/50 border border-border/50 rounded-xl p-4 sm:p-6",
        className
      )}
      data-testid="weekly-macro-summary"
    >
      <div className="text-center mb-4">
        <h3 className="font-display text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Weekly Totals
        </h3>
      </div>
      <MacroSummary totals={totals} variant="full" />
    </div>
  );
}

/**
 * Calculate macro totals from meal entries
 */
export function calculateMacroTotals(
  entries: Array<{
    recipe: {
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      fiber: number | null;
    };
  }>
): MacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.recipe.calories ?? 0),
      protein: acc.protein + (entry.recipe.protein ?? 0),
      carbs: acc.carbs + (entry.recipe.carbs ?? 0),
      fat: acc.fat + (entry.recipe.fat ?? 0),
      fiber: acc.fiber + (entry.recipe.fiber ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

/**
 * Calculate daily macro totals for a specific day
 */
export function calculateDailyMacros(
  entries: Array<{
    dayOfWeek: number;
    recipe: {
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fat: number | null;
      fiber: number | null;
    };
  }>,
  dayOfWeek: number
): MacroTotals {
  const dayEntries = entries.filter((e) => e.dayOfWeek === dayOfWeek);
  return calculateMacroTotals(dayEntries);
}
