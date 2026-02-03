import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import { format, startOfWeek, addWeeks, isSameWeek } from "date-fns";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
  mealCount: number;
}

// Helper to get Monday of the week
function getMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

// Format date as ISO string (YYYY-MM-DD)
function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function ImportModal({
  open,
  onOpenChange,
  templateId,
  templateName,
  mealCount,
}: ImportModalProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const utils = api.useUtils();

  // Get the target week's Monday
  const targetWeekStart = useMemo(() => {
    if (!selectedDate) return null;
    return getMonday(selectedDate);
  }, [selectedDate]);

  // Format for display
  const weekRangeDisplay = useMemo(() => {
    if (!targetWeekStart) return null;
    const endDate = addWeeks(targetWeekStart, 1);
    endDate.setDate(endDate.getDate() - 1); // Sunday
    return `${format(targetWeekStart, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`;
  }, [targetWeekStart]);

  // Check if it's the current week
  const isCurrentWeek = useMemo(() => {
    if (!targetWeekStart) return false;
    return isSameWeek(targetWeekStart, new Date(), { weekStartsOn: 1 });
  }, [targetWeekStart]);

  // Check if target week has existing meals (simplified - we'll show a general warning)
  const showWarning = selectedDate && !isCurrentWeek;

  const importMutation = api.mealPlanTemplate.import.useMutation({
    onSuccess: (data) => {
      toast.success(`Imported ${data.entriesImported} meals to your planner!`, {
        action: {
          label: "View",
          onClick: () => navigate("/recipes/planner"),
        },
      });
      utils.mealPlan.getOrCreateForWeek.invalidate();
      utils.mealPlan.getGroceryList.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import template");
    },
  });

  const handleImport = async () => {
    if (!targetWeekStart) return;

    await importMutation.mutateAsync({
      templateId,
      targetWeekStart: formatDateISO(targetWeekStart),
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]" data-testid="import-modal">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Import to My Week
          </DialogTitle>
          <DialogDescription>
            Import "{templateName}" to your weekly planner
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Week selector */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Select the week to import to:
            </p>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < getMonday(new Date())}
                className="rounded-lg border"
                data-testid="import-week-calendar"
              />
            </div>
          </div>

          {/* Selected week display */}
          {targetWeekStart && (
            <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {isCurrentWeek ? "This week" : weekRangeDisplay}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {mealCount} meals will be added to this week
              </p>
            </div>
          )}

          {/* Warning/info message */}
          {targetWeekStart && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                showWarning
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-green-500/10 text-green-700 dark:text-green-400"
              }`}
            >
              {showWarning ? (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Any existing meals for this week will be replaced with the
                    template meals.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Your current week's planner will be updated with this
                    template.
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={importMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importMutation.isPending || !targetWeekStart}
            data-testid="confirm-import-button"
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
