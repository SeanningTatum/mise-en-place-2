import { useState, useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ChefHat, Clock, ShoppingCart } from "lucide-react";
import {
  MealSetupForm,
  CourseList,
  CoursePickerModal,
  AISuggestionsPanel,
  AISuggestionsSkeleton,
  CookingTimeline,
  CookingTimelineSkeleton,
  MealShoppingList,
} from "@/components/multi-course-meal";
import type { MealSetupFormData } from "@/components/multi-course-meal/meal-setup-form";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import type { Route } from "./+types/meal";
import type { CourseType } from "@/repositories/multi-course-meal";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  return { user: session.user };
}

type WizardStep = "setup" | "courses" | "timeline";

export default function MealPlannerPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>("setup");
  const [mealId, setMealId] = useState<string | null>(null);
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);

  // Mutations
  const createMealMutation = api.multiCourseMeal.create.useMutation({
    onSuccess: (data) => {
      setMealId(data.id);
      setStep("courses");
      toast.success("Meal created! Now add your courses.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create meal");
    },
  });

  const addCourseMutation = api.multiCourseMeal.addCourse.useMutation({
    onSuccess: () => {
      refetchMeal();
      toast.success("Course added");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add course");
    },
  });

  const removeCourseMutation = api.multiCourseMeal.removeCourse.useMutation({
    onSuccess: () => {
      refetchMeal();
      toast.success("Course removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove course");
    },
  });

  const getMenuSuggestionsMutation = api.multiCourseMeal.getMenuSuggestions.useMutation({
    onSuccess: () => {
      refetchMeal();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to get suggestions");
    },
  });

  const generateTimelineMutation = api.multiCourseMeal.generateTimeline.useMutation({
    onSuccess: () => {
      refetchMeal();
      setStep("timeline");
      toast.success("Timeline generated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate timeline");
    },
  });

  // Query for meal data
  const {
    data: meal,
    isLoading: isMealLoading,
    refetch: refetchMeal,
  } = api.multiCourseMeal.getById.useQuery(
    { mealId: mealId! },
    { enabled: !!mealId }
  );

  // Query for shopping list
  const { data: shoppingList, isLoading: isShoppingListLoading } =
    api.multiCourseMeal.getShoppingList.useQuery(
      { mealId: mealId! },
      { enabled: !!mealId && step === "timeline" }
    );

  // Handlers
  const handleSetupSubmit = (data: MealSetupFormData) => {
    // Combine date and time into ISO string
    const servingTime = new Date(
      `${data.servingDate}T${data.servingTime}:00`
    ).toISOString();

    createMealMutation.mutate({
      name: data.name,
      guestCount: data.guestCount,
      servingTime,
      serviceStyle: data.serviceStyle,
      notes: data.notes,
    });
  };

  const handleAddCourse = (recipeId: string, courseType: CourseType) => {
    if (!mealId) return;

    const nextOrder = meal?.courses?.length || 0;
    addCourseMutation.mutate({
      mealId,
      recipeId,
      courseType,
      courseOrder: nextOrder,
    });
  };

  const handleRemoveCourse = (courseId: string) => {
    removeCourseMutation.mutate({ courseId });
  };

  const handleGetSuggestions = () => {
    if (!mealId) return;
    getMenuSuggestionsMutation.mutate({ mealId });
  };

  const handleGenerateTimeline = () => {
    if (!mealId) return;
    generateTimelineMutation.mutate({ mealId });
  };

  const handleRegenerateTimeline = () => {
    if (!mealId) return;
    generateTimelineMutation.mutate({ mealId });
  };

  const handleAddSuggestedRecipe = (recipeId: string, courseType: string) => {
    if (!mealId) return;
    const nextOrder = meal?.courses?.length || 0;
    addCourseMutation.mutate({
      mealId,
      recipeId,
      courseType: courseType as CourseType,
      courseOrder: nextOrder,
    });
  };

  return (
    <div className="space-y-6" data-testid="multi-course-meal-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/recipes")}
          data-testid="back-to-recipes"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            {step === "setup" && "Plan a Multi-Course Meal"}
            {step === "courses" && (meal?.name || "Build Your Menu")}
            {step === "timeline" && (meal?.name || "Cooking Timeline")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {step === "setup" && "Create an elegant dining experience with AI assistance"}
            {step === "courses" && `${meal?.guestCount || 0} guests • Add courses to your menu`}
            {step === "timeline" && "Your personalized cooking schedule"}
          </p>
        </div>
      </div>

      {/* Step 1: Setup */}
      {step === "setup" && (
        <Card className="p-6">
          <MealSetupForm
            onSubmit={handleSetupSubmit}
            isSubmitting={createMealMutation.isPending}
          />
        </Card>
      )}

      {/* Step 2: Courses */}
      {step === "courses" && meal && (
        <div className="space-y-6">
          {/* Course List */}
          <Card className="p-6">
            <CourseList
              courses={meal.courses}
              guestCount={meal.guestCount}
              onAddCourse={() => setCoursePickerOpen(true)}
              onEditCourse={() => {}}
              onRemoveCourse={handleRemoveCourse}
              onGetAISuggestions={handleGetSuggestions}
              isLoadingSuggestions={getMenuSuggestionsMutation.isPending}
            />
          </Card>

          {/* AI Suggestions */}
          {getMenuSuggestionsMutation.isPending && <AISuggestionsSkeleton />}
          {meal.aiSuggestionsJson?.suggestions && (
            <AISuggestionsPanel
              suggestions={meal.aiSuggestionsJson.suggestions}
              onAddSuggested={handleAddSuggestedRecipe}
            />
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("setup")}>
              Back to Setup
            </Button>
            <Button
              onClick={handleGenerateTimeline}
              disabled={
                meal.courses.length < 2 || generateTimelineMutation.isPending
              }
              data-testid="generate-timeline-btn"
            >
              {generateTimelineMutation.isPending
                ? "Generating..."
                : "Generate Timeline →"}
            </Button>
          </div>

          {meal.courses.length < 2 && (
            <p className="text-sm text-muted-foreground text-center">
              Add at least 2 courses to generate a timeline
            </p>
          )}

          {/* Course Picker Modal */}
          <CoursePickerModal
            open={coursePickerOpen}
            onOpenChange={setCoursePickerOpen}
            onSelect={handleAddCourse}
            existingCourseTypes={meal.courses.map((c) => c.courseType)}
          />
        </div>
      )}

      {/* Step 3: Timeline */}
      {step === "timeline" && meal && (
        <div className="space-y-6">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline" className="gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="shopping" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Shopping List
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <Card className="p-6">
                {generateTimelineMutation.isPending ? (
                  <CookingTimelineSkeleton />
                ) : meal.timelineJson?.items ? (
                  <CookingTimeline
                    timeline={meal.timelineJson.items}
                    mealName={meal.name}
                    servingTime={meal.servingTime}
                    guestCount={meal.guestCount}
                    onRegenerate={handleRegenerateTimeline}
                    isRegenerating={generateTimelineMutation.isPending}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Timeline not generated yet
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="shopping" className="mt-4">
              <Card className="p-6">
                {isShoppingListLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 bg-muted rounded" />
                      ))}
                    </div>
                  </div>
                ) : shoppingList ? (
                  <MealShoppingList
                    items={shoppingList.items}
                    totalIngredients={shoppingList.totalIngredients}
                    recipeCount={shoppingList.recipeCount}
                    guestCount={shoppingList.guestCount}
                    mealName={meal.name}
                  />
                ) : null}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("courses")}>
              Back to Menu
            </Button>
            <Button onClick={() => navigate("/recipes")}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
