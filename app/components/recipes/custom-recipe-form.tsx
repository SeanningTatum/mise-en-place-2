import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IngredientNameInput } from "./ingredient-name-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Form validation schema matching tRPC input
const customRecipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  servings: z.coerce
    .number()
    .int()
    .min(1, "Servings must be at least 1"),
  prepTimeMinutes: z.coerce.number().int().min(0).nullable(),
  cookTimeMinutes: z.coerce.number().int().min(0).nullable(),
  calories: z.coerce.number().int().min(0).nullable(),
  protein: z.coerce.number().int().min(0).nullable(),
  carbs: z.coerce.number().int().min(0).nullable(),
  fat: z.coerce.number().int().min(0).nullable(),
  fiber: z.coerce.number().int().min(0).nullable(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, "Ingredient name is required"),
        quantity: z.string().nullable(),
        unit: z.string().nullable(),
        notes: z.string().nullable(),
      })
    )
    .min(2, "At least 2 ingredients are required"),
  steps: z
    .array(
      z.object({
        instruction: z.string().min(1, "Step instruction is required"),
      })
    )
    .min(2, "At least 2 steps are required"),
});

type CustomRecipeFormData = z.infer<typeof customRecipeSchema>;

interface CustomRecipeFormProps {
  className?: string;
}

export function CustomRecipeForm({ className }: CustomRecipeFormProps) {
  const navigate = useNavigate();
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const createMutation = api.recipes.createCustom.useMutation({
    onSuccess: (data) => {
      toast.success("Recipe created successfully!");
      navigate(`/recipes/${data.id}`);
    },
    onError: (error) => {
      setSubmitError(error.message);
      toast.error("Failed to create recipe");
    },
  });

  const form = useForm<CustomRecipeFormData>({
    resolver: zodResolver(customRecipeSchema),
    defaultValues: {
      title: "",
      description: "",
      servings: 4,
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      fiber: null,
      ingredients: [
        { name: "", quantity: "", unit: "", notes: "" },
        { name: "", quantity: "", unit: "", notes: "" },
      ],
      steps: [{ instruction: "" }, { instruction: "" }],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  async function onSubmit(data: CustomRecipeFormData) {
    setSubmitError(undefined);

    // Transform data to match tRPC input
    const input = {
      title: data.title,
      description: data.description,
      servings: data.servings,
      prepTimeMinutes: data.prepTimeMinutes,
      cookTimeMinutes: data.cookTimeMinutes,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      ingredients: data.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity || null,
        unit: ing.unit || null,
        notes: ing.notes || null,
      })),
      steps: data.steps.map((step, index) => ({
        stepNumber: index + 1,
        instruction: step.instruction,
      })),
    };

    await createMutation.mutateAsync(input);
  }

  const isSubmitting = createMutation.isPending;

  return (
    <div className={cn("space-y-8", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Info */}
          <section className="space-y-6 bg-card rounded-xl border border-border/50 p-6 shadow-warm">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-medium">
                1
              </span>
              <h2 className="font-display text-lg font-semibold">Basic Info</h2>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Recipe Name <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Grandma's Apple Pie"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-background border-border/50 focus:border-primary/50"
                      data-testid="recipe-title-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your recipe, including its history, inspiration, or special tips..."
                      {...field}
                      disabled={isSubmitting}
                      className="min-h-24 bg-background border-border/50 focus:border-primary/50 resize-none"
                      data-testid="recipe-description-input"
                    />
                  </FormControl>
                  <FormDescription>
                    Share the story behind this recipe
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Servings <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="4"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting}
                        className="bg-background border-border/50 focus:border-primary/50"
                        data-testid="recipe-servings-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prepTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="15 min"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        disabled={isSubmitting}
                        className="bg-background border-border/50 focus:border-primary/50"
                        data-testid="recipe-prep-time-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cookTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="45 min"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        disabled={isSubmitting}
                        className="bg-background border-border/50 focus:border-primary/50"
                        data-testid="recipe-cook-time-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Section 2: Ingredients */}
          <section className="space-y-6 bg-card rounded-xl border border-border/50 p-6 shadow-warm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  2
                </span>
                <h2 className="font-display text-lg font-semibold">
                  Ingredients
                </h2>
                <span className="text-sm text-muted-foreground">
                  (minimum 2)
                </span>
              </div>
            </div>

            {form.formState.errors.ingredients?.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.ingredients.root.message}
              </p>
            )}

            <div className="space-y-3">
              {ingredientFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-2 group"
                  data-testid={`ingredient-row-${index}`}
                >
                  <div className="flex items-center justify-center w-6 h-10 text-muted-foreground/50 cursor-grab">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <div className="grid grid-cols-12 gap-2 flex-1">
                    <div className="col-span-2">
                      <Input
                        placeholder="Qty"
                        {...form.register(`ingredients.${index}.quantity`)}
                        disabled={isSubmitting}
                        className="bg-background border-border/50 focus:border-primary/50"
                        data-testid={`ingredient-quantity-${index}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Unit"
                        {...form.register(`ingredients.${index}.unit`)}
                        disabled={isSubmitting}
                        className="bg-background border-border/50 focus:border-primary/50"
                        data-testid={`ingredient-unit-${index}`}
                      />
                    </div>
                    <div className="col-span-8">
                      <IngredientNameInput
                        value={form.watch(`ingredients.${index}.name`) || ""}
                        onChange={(value) =>
                          form.setValue(`ingredients.${index}.name`, value)
                        }
                        disabled={isSubmitting}
                        data-testid={`ingredient-name-${index}`}
                      />
                      {form.formState.errors.ingredients?.[index]?.name && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.ingredients[index]?.name?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={isSubmitting || ingredientFields.length <= 2}
                    className="h-10 w-10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`remove-ingredient-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendIngredient({
                  name: "",
                  quantity: "",
                  unit: "",
                  notes: "",
                })
              }
              disabled={isSubmitting}
              className="gap-2"
              data-testid="add-ingredient-button"
            >
              <Plus className="h-4 w-4" />
              Add Ingredient
            </Button>
          </section>

          {/* Section 3: Steps */}
          <section className="space-y-6 bg-card rounded-xl border border-border/50 p-6 shadow-warm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  3
                </span>
                <h2 className="font-display text-lg font-semibold">Steps</h2>
                <span className="text-sm text-muted-foreground">
                  (minimum 2)
                </span>
              </div>
            </div>

            {form.formState.errors.steps?.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.steps.root.message}
              </p>
            )}

            <div className="space-y-4">
              {stepFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 group"
                  data-testid={`step-row-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 text-muted-foreground/50 cursor-grab">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1">
                    <Textarea
                      placeholder="Describe this step..."
                      {...form.register(`steps.${index}.instruction`)}
                      disabled={isSubmitting}
                      className="min-h-20 bg-background border-border/50 focus:border-primary/50 resize-none"
                      data-testid={`step-instruction-${index}`}
                    />
                    {form.formState.errors.steps?.[index]?.instruction && (
                      <p className="text-xs text-destructive mt-1">
                        {form.formState.errors.steps[index]?.instruction?.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                    disabled={isSubmitting || stepFields.length <= 2}
                    className="h-10 w-10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`remove-step-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendStep({ instruction: "" })}
              disabled={isSubmitting}
              className="gap-2"
              data-testid="add-step-button"
            >
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </section>

          {/* Section 4: Nutrition (Optional, Collapsible) */}
          <Collapsible
            open={nutritionOpen}
            onOpenChange={setNutritionOpen}
            className="bg-card rounded-xl border border-border/50 shadow-warm"
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full p-6 text-left"
                data-testid="nutrition-toggle"
              >
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">
                    Nutrition
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    (optional)
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    nutritionOpen && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-5 gap-4">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Calories</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="—"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            disabled={isSubmitting}
                            className="bg-background border-border/50 focus:border-primary/50"
                            data-testid="nutrition-calories-input"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Protein (g)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="—"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            disabled={isSubmitting}
                            className="bg-background border-border/50 focus:border-primary/50"
                            data-testid="nutrition-protein-input"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Carbs (g)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="—"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            disabled={isSubmitting}
                            className="bg-background border-border/50 focus:border-primary/50"
                            data-testid="nutrition-carbs-input"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fat (g)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="—"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            disabled={isSubmitting}
                            className="bg-background border-border/50 focus:border-primary/50"
                            data-testid="nutrition-fat-input"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fiber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fiber (g)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="—"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            disabled={isSubmitting}
                            className="bg-background border-border/50 focus:border-primary/50"
                            data-testid="nutrition-fiber-input"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Per serving nutritional information
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Error Display */}
          {submitError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/recipes")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 shadow-warm hover:shadow-warm-lg min-w-32"
              data-testid="save-recipe-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Recipe"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
