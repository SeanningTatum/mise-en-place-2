import { useState, useEffect } from "react";
import { redirect, Link, useSearchParams, useNavigate } from "react-router";
import type { Route } from "./+types/meals.[id]";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout";
import { ShareMealModal } from "@/components/sharing/share-meal-modal";
import { PrintMealModal } from "@/components/print/print-meal-modal";
import {
  Calendar,
  ChefHat,
  Clock,
  Eye,
  LayoutList,
  Printer,
  RefreshCw,
  Share2,
  ShoppingCart,
  Timer,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  try {
    const meal = await context.trpc.multiCourseMeal.getById({ mealId: params.id });
    const shoppingList = await context.trpc.multiCourseMeal.getShoppingList({ mealId: params.id });
    return { meal, shoppingList };
  } catch {
    return redirect("/recipes/meals");
  }
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.meal?.name
    ? `${data.meal.name} | Mise en Place`
    : "Meal Details | Mise en Place";
  return [
    { title },
    { name: "description", content: "View and manage your multi-course meal" },
  ];
}

const serviceStyleLabels: Record<string, string> = {
  plated: "Plated Service",
  family: "Family Style",
  buffet: "Buffet",
};

const courseTypeLabels: Record<string, string> = {
  appetizer: "Appetizer",
  soup_salad: "Soup & Salad",
  main: "Main Course",
  side: "Side Dish",
  dessert: "Dessert",
  drink: "Beverage",
};

const categoryColors: Record<string, string> = {
  prep: "bg-blue-100 text-blue-800 border-blue-200",
  cook: "bg-orange-100 text-orange-800 border-orange-200",
  rest: "bg-purple-100 text-purple-800 border-purple-200",
  serve: "bg-green-100 text-green-800 border-green-200",
};

export default function MealDetailPage({ loaderData }: Route.ComponentProps) {
  const { meal: initialMeal, shoppingList: initialShoppingList } = loaderData;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [showShareModal, setShowShareModal] = useState(searchParams.get("share") === "true");
  const [showPrintModal, setShowPrintModal] = useState(searchParams.get("print") === "true");

  // Use queries with initial data
  const { data: meal } = api.multiCourseMeal.getById.useQuery(
    { mealId: initialMeal.id },
    { initialData: initialMeal }
  );

  const { data: shoppingList } = api.multiCourseMeal.getShoppingList.useQuery(
    { mealId: initialMeal.id },
    { initialData: initialShoppingList }
  );

  const regenerateMutation = api.multiCourseMeal.startGeneration.useMutation({
    onSuccess: (data) => {
      navigate(`/recipes/meals/${meal.id}/generating`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start generation");
    },
  });

  const servingDate = new Date(meal.servingTime);
  const timeline = meal.timelineJson?.items || [];

  // Build subtitle from meal details
  const subtitleParts = [
    `${format(servingDate, "EEEE, MMMM d")} at ${format(servingDate, "h:mm a")}`,
    `${meal.guestCount} guests`,
    serviceStyleLabels[meal.serviceStyle],
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={meal.name}
        subtitle={subtitleParts.join(" • ")}
        backTo={{ label: "My Meals", href: "/recipes/meals" }}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPrintModal(true)}>
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            {timeline.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateMutation.mutate({ mealId: meal.id })}
                disabled={regenerateMutation.isPending}
              >
                <RefreshCw className={cn("h-4 w-4", regenerateMutation.isPending && "animate-spin")} />
                <span className="hidden sm:inline">Regenerate</span>
              </Button>
            )}
          </div>
        }
      />

      {meal.notes && (
        <p className="text-muted-foreground max-w-2xl">{meal.notes}</p>
      )}

      {meal.isPublic && (
        <Badge variant="secondary" className="w-fit">
          <Eye className="mr-1 h-3 w-3" />
          Public
        </Badge>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - 2 cols */}
        <div className="lg:col-span-2 space-y-8">
          {/* Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Courses ({meal.courses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meal.courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
                      {course.recipe.thumbnailUrl ? (
                        <img
                          src={course.recipe.thumbnailUrl}
                          alt={course.recipe.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {courseTypeLabels[course.courseType]}
                        </Badge>
                      </div>
                      <Link
                        to={`/recipes/${course.recipe.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {course.recipe.title}
                      </Link>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        {course.recipe.prepTimeMinutes && (
                          <span>Prep: {course.recipe.prepTimeMinutes}m</span>
                        )}
                        {course.recipe.cookTimeMinutes && (
                          <span>Cook: {course.recipe.cookTimeMinutes}m</span>
                        )}
                        {course.recipe.servings && (
                          <span>{course.recipe.servings} servings</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {timeline.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Cooking Timeline
                </CardTitle>
                <CardDescription>
                  Follow this schedule for a perfectly timed meal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-start"
                    >
                      <div className="flex-shrink-0 w-16 text-right">
                        <span className="font-mono text-sm font-medium">
                          {item.time}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full border-2",
                            categoryColors[item.category] || "bg-gray-100"
                          )}
                        />
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-border flex-1 min-h-[2rem]" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", categoryColors[item.category])}
                          >
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.durationMinutes}m
                          </span>
                        </div>
                        <p className="text-sm">{item.task}</p>
                        {item.recipeName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.recipeName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Cooking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No timeline generated yet. Generate a cooking timeline to see the perfect schedule.
                  </p>
                  <Button
                    onClick={() => regenerateMutation.mutate({ mealId: meal.id })}
                    disabled={regenerateMutation.isPending}
                  >
                    <RefreshCw className={cn("mr-2 h-4 w-4", regenerateMutation.isPending && "animate-spin")} />
                    {regenerateMutation.isPending ? "Generating..." : "Generate Timeline"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-6">
          {/* Shopping List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping List
              </CardTitle>
              <CardDescription>
                {shoppingList.totalIngredients} ingredients from {shoppingList.recipeCount} recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {shoppingList.items.map((item) => (
                  <div key={item.ingredientId} className="text-sm">
                    <span className="font-medium">{item.ingredientName}</span>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {item.quantities.map((q, i) => (
                        <span key={i}>
                          {i > 0 && " + "}
                          {q.quantity && `${q.quantity} `}
                          {q.unit && `${q.unit} `}
                          <span className="text-muted-foreground/60">
                            ({q.recipeTitle})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Macros Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutList className="h-5 w-5" />
                Nutrition Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {["calories", "protein", "carbs", "fat"].map((macro) => {
                  const total = meal.courses.reduce(
                    (sum, course) =>
                      sum + (course.recipe[macro as keyof typeof course.recipe] as number || 0),
                    0
                  );
                  const perPerson = Math.round(total / meal.guestCount);
                  return (
                    <div key={macro} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-semibold">{perPerson}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {macro === "calories" ? "cal" : "g"} {macro}/person
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ShareMealModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        mealId={meal.id}
        mealName={meal.name}
        isPublic={meal.isPublic}
        slug={meal.slug}
      />

      <PrintMealModal
        open={showPrintModal}
        onOpenChange={setShowPrintModal}
        mealId={meal.id}
        mealName={meal.name}
      />
    </div>
  );
}
