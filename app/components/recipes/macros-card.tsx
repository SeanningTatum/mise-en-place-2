import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplets, Leaf } from "lucide-react";

interface MacrosCardProps {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  servings?: number | null;
  compact?: boolean;
}

export function MacrosCard({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  servings,
  compact = false,
}: MacrosCardProps) {
  const macros = [
    { label: "Calories", value: calories, unit: "kcal", icon: Flame, color: "text-orange-500" },
    { label: "Protein", value: protein, unit: "g", icon: Beef, color: "text-red-500" },
    { label: "Carbs", value: carbs, unit: "g", icon: Wheat, color: "text-amber-500" },
    { label: "Fat", value: fat, unit: "g", icon: Droplets, color: "text-yellow-500" },
    { label: "Fiber", value: fiber, unit: "g", icon: Leaf, color: "text-green-500" },
  ].filter((m) => m.value !== null && m.value !== undefined);

  if (macros.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-3">
        {macros.slice(0, 3).map((macro) => (
          <div key={macro.label} className="flex items-center gap-1 text-sm text-muted-foreground">
            <macro.icon className={`h-3.5 w-3.5 ${macro.color}`} />
            <span>
              {macro.value}
              {macro.unit !== "kcal" && macro.unit}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Macros per serving
          {servings && <span className="text-muted-foreground font-normal"> ({servings} servings)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {macros.map((macro) => (
            <div key={macro.label} className="flex flex-col items-center gap-1 text-center">
              <macro.icon className={`h-5 w-5 ${macro.color}`} />
              <span className="text-2xl font-bold">{macro.value}</span>
              <span className="text-xs text-muted-foreground">
                {macro.unit === "kcal" ? "kcal" : `g ${macro.label.toLowerCase()}`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
