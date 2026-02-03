import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Clock,
  FileText,
  Loader2,
  Printer,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import {
  generateFullGuideHtml,
  generateTimelineOnlyHtml,
  generateShoppingListHtml,
  generateRecipeCardsHtml,
  openPrintWindow,
} from "@/lib/print/meal-guide";
import { cn } from "@/lib/utils";

type PrintFormat = "full" | "timeline" | "shopping" | "cards";

interface PrintMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId: string;
  mealName: string;
}

const formatOptions: Array<{
  value: PrintFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: "full",
    label: "Full Cooking Guide",
    description: "Timeline, recipes, and shopping list",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    value: "timeline",
    label: "Timeline Only",
    description: "Just the cooking schedule",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    value: "shopping",
    label: "Shopping List",
    description: "Aggregated ingredients with checkboxes",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    value: "cards",
    label: "Recipe Cards",
    description: "Individual recipe pages for each course",
    icon: <UtensilsCrossed className="h-5 w-5" />,
  },
];

export function PrintMealModal({
  open,
  onOpenChange,
  mealId,
  mealName,
}: PrintMealModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<PrintFormat>("full");
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: printData, isLoading } = api.multiCourseMeal.getPrintData.useQuery(
    { mealId },
    { enabled: open }
  );

  const handlePrint = async () => {
    if (!printData) {
      toast.error("Unable to load meal data for printing");
      return;
    }

    setIsPrinting(true);

    try {
      let html: string;

      switch (selectedFormat) {
        case "full":
          html = generateFullGuideHtml(printData);
          break;
        case "timeline":
          html = generateTimelineOnlyHtml(printData);
          break;
        case "shopping":
          html = generateShoppingListHtml(printData);
          break;
        case "cards":
          html = generateRecipeCardsHtml(printData);
          break;
        default:
          html = generateFullGuideHtml(printData);
      }

      openPrintWindow(html);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to generate print document");
      console.error("Print error:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Meal Guide
          </DialogTitle>
          <DialogDescription>
            Choose a format to print your cooking guide for "{mealName}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as PrintFormat)}
              className="space-y-3"
            >
              {formatOptions.map((option) => (
                <label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedFormat === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      selectedFormat === option.value
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isLoading || isPrinting || !printData}
          >
            {isPrinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
