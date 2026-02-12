import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar, UtensilsCrossed, ShoppingCart } from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
  mealCount: number;
  ingredientCount?: number;
  onSuccess?: () => void;
}

const themeOptions = [
  { value: "none", label: "No theme" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "asian", label: "Asian" },
  { value: "mexican", label: "Mexican" },
  { value: "italian", label: "Italian" },
  { value: "american", label: "American" },
  { value: "budget-friendly", label: "Budget-Friendly" },
  { value: "quick-weeknight", label: "Quick Weeknight" },
  { value: "meal-prep", label: "Meal Prep" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "healthy", label: "Healthy" },
  { value: "comfort-food", label: "Comfort Food" },
  { value: "family-friendly", label: "Family-Friendly" },
];

export function SaveTemplateModal({
  open,
  onOpenChange,
  mealPlanId,
  mealCount,
  ingredientCount,
  onSuccess,
}: SaveTemplateModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");

  const utils = api.useUtils();

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setTheme("");
    }
  }, [open]);

  const createMutation = api.mealPlanTemplate.create.useMutation({
    onSuccess: (data) => {
      toast.success("Template saved!", {
        description: "View your templates in My Templates",
        action: {
          label: "View",
          onClick: () => navigate("/recipes/templates"),
        },
      });
      utils.mealPlanTemplate.list.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save template");
    },
  });

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your template");
      return;
    }

    await createMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      theme: theme && theme !== "none" ? theme : undefined,
      mealPlanId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" data-testid="save-template-modal">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save your current week as a reusable meal plan template
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Preview stats */}
          <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-sm text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>7 days</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <UtensilsCrossed className="h-4 w-4" />
              <span>{mealCount} meals</span>
            </div>
            {ingredientCount !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span>{ingredientCount} ingredients</span>
              </div>
            )}
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder="e.g., Mediterranean Week"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="template-name-input"
              autoFocus
            />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              placeholder="Describe your meal plan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
              data-testid="template-description-input"
            />
          </div>

          {/* Theme dropdown */}
          <div className="space-y-2">
            <Label htmlFor="template-theme">Theme Tag</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger
                id="template-theme"
                data-testid="template-theme-select"
              >
                <SelectValue placeholder="Select a theme (optional)" />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || !name.trim()}
            data-testid="save-template-button"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
