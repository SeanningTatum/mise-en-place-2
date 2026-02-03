import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Users, Clock, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

const mealSetupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  guestCount: z.number().int().min(2, "Minimum 2 guests").max(50, "Maximum 50 guests"),
  servingDate: z.string().min(1, "Date is required"),
  servingTime: z.string().min(1, "Time is required"),
  serviceStyle: z.enum(["plated", "family", "buffet"]),
  notes: z.string().max(500).optional(),
});

export type MealSetupFormData = z.infer<typeof mealSetupSchema>;

interface MealSetupFormProps {
  defaultValues?: Partial<MealSetupFormData>;
  onSubmit: (data: MealSetupFormData) => void;
  isSubmitting?: boolean;
}

const serviceStyleOptions = [
  {
    value: "plated" as const,
    label: "Plated",
    description: "Individual portions served course by course",
    icon: "🍽️",
  },
  {
    value: "family" as const,
    label: "Family Style",
    description: "Dishes served in center for sharing",
    icon: "🥘",
  },
  {
    value: "buffet" as const,
    label: "Buffet",
    description: "Self-serve spread for guests",
    icon: "🍱",
  },
];

export function MealSetupForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: MealSetupFormProps) {
  const form = useForm<MealSetupFormData>({
    resolver: zodResolver(mealSetupSchema),
    defaultValues: {
      name: "",
      guestCount: 4,
      servingDate: new Date().toISOString().split("T")[0],
      servingTime: "19:00",
      serviceStyle: "family",
      notes: "",
      ...defaultValues,
    },
  });

  const guestCount = form.watch("guestCount");

  const incrementGuests = () => {
    const current = form.getValues("guestCount");
    if (current < 50) {
      form.setValue("guestCount", current + 1);
    }
  };

  const decrementGuests = () => {
    const current = form.getValues("guestCount");
    if (current > 2) {
      form.setValue("guestCount", current - 1);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Meal Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Meal Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Valentine's Day Dinner, Sunday Brunch, etc."
                  {...field}
                  data-testid="meal-name-input"
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Guest Count, Date, Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Guest Count */}
          <FormField
            control={form.control}
            name="guestCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Guests
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={decrementGuests}
                      disabled={guestCount <= 2}
                      data-testid="guest-decrement"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div
                      className="flex-1 h-10 flex items-center justify-center border rounded-md bg-background text-lg font-semibold"
                      data-testid="guest-count"
                    >
                      {field.value}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={incrementGuests}
                      disabled={guestCount >= 50}
                      data-testid="guest-increment"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Serving Date */}
          <FormField
            control={form.control}
            name="servingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="serving-date-input"
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Serving Time */}
          <FormField
            control={form.control}
            name="servingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    data-testid="serving-time-input"
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Service Style */}
        <FormField
          control={form.control}
          name="serviceStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Service Style
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3"
                  data-testid="service-style-group"
                >
                  {serviceStyleOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`service-${option.value}`}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                        field.value === option.value &&
                          "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`service-${option.value}`}
                        className="sr-only"
                      />
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground text-center">
                        {option.description}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes (optional) */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special notes about the meal..."
                  className="resize-none"
                  rows={2}
                  {...field}
                  data-testid="meal-notes-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="meal-setup-submit"
          >
            {isSubmitting ? "Saving..." : "Continue to Courses"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
