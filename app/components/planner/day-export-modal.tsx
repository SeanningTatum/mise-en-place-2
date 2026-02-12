import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Printer, FileText, ListChecks } from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import {
  generateSeparateRecipesHtml,
  generateUnifiedGuideHtml,
  openPrintWindow,
} from "@/lib/print/day-recipes";

type ExportFormat = "separate" | "unified";

interface DayExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
  dayOfWeek: number;
  date: Date;
  mealCount: number;
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function DayExportModal({
  open,
  onOpenChange,
  mealPlanId,
  dayOfWeek,
  date,
  mealCount,
}: DayExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("separate");
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch full recipe data when modal opens
  const { data, isLoading } = api.mealPlan.getRecipesForDay.useQuery(
    { mealPlanId, dayOfWeek },
    { enabled: open && mealCount > 0 }
  );

  const handlePrint = () => {
    if (!data || data.meals.length === 0) {
      toast.error("No recipes to print");
      return;
    }

    setIsPrinting(true);

    try {
      const html =
        format === "separate"
          ? generateSeparateRecipesHtml(date, data.meals)
          : generateUnifiedGuideHtml(date, data.meals);

      const success = openPrintWindow(html);
      if (!success) {
        toast.error("Please allow pop-ups to print");
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to generate print document");
    } finally {
      setIsPrinting(false);
    }
  };

  const formatDateDisplay = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="day-export-modal">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Print Day's Recipes
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Date and meal count */}
          <div className="mb-6">
            <p className="text-lg font-medium">{formatDateDisplay(date)}</p>
            <p className="text-sm text-muted-foreground">
              {mealCount} {mealCount === 1 ? "recipe" : "recipes"} planned
            </p>
          </div>

          {/* Format selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-sm border border-border/60 hover:border-primary/40 hover:bg-secondary/30 transition-colors">
                <RadioGroupItem
                  value="separate"
                  id="separate"
                  className="mt-0.5"
                  data-testid="format-separate"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="separate"
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Separate Recipe Cards
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Each recipe printed as its own section with ingredients and steps
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-sm border border-border/60 hover:border-primary/40 hover:bg-secondary/30 transition-colors">
                <RadioGroupItem
                  value="unified"
                  id="unified"
                  className="mt-0.5"
                  data-testid="format-unified"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="unified"
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    Unified Cooking Guide
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Combined shopping list and cooking timeline for the day
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Recipe preview */}
          {isLoading ? (
            <div className="mt-4 p-3 bg-secondary/30 rounded-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading recipes...
              </div>
            </div>
          ) : data && data.meals.length > 0 ? (
            <div className="mt-4 p-3 bg-secondary/30 rounded-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Included recipes
              </p>
              <ul className="space-y-1">
                {data.meals.map((meal) => (
                  <li
                    key={meal.mealType}
                    className="text-sm flex items-center gap-2"
                  >
                    <span className="text-xs text-muted-foreground uppercase w-16">
                      {meal.mealType}
                    </span>
                    <span className="truncate">{meal.recipe.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPrinting}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting || isLoading || mealCount === 0}
            data-testid="print-day-button"
          >
            {isPrinting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Preparing...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
