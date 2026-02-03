import { Link } from "react-router";
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
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Clock,
  ShoppingCart,
  Timer,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { format } from "date-fns";
import type { Route } from "./+types/u.[username].meals.[slug]";
import { cn } from "@/lib/utils";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.meal) {
    return [{ title: "Meal Not Found | mise en place" }];
  }
  
  const { meal, username } = data;
  return [
    { title: `${meal.name} by @${username} | mise en place` },
    {
      name: "description",
      content: `${meal.name} - A ${meal.courses.length}-course meal for ${meal.guestCount} guests`,
    },
    { property: "og:title", content: meal.name },
    {
      property: "og:description",
      content: `${meal.courses.length} courses for ${meal.guestCount} guests - ${serviceStyleLabels[meal.serviceStyle]}`,
    },
    { property: "og:type", content: "article" },
  ];
}

const serviceStyleLabels: Record<string, string> = {
  plated: "Plated Service",
  family: "Family Style",
  buffet: "Buffet Style",
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

export async function loader({ params, context }: Route.LoaderArgs) {
  const { username, slug } = params;

  try {
    const meal = await context.trpc.multiCourseMeal.getBySlug({ username, slug });
    return { meal, username };
  } catch {
    throw new Response("Meal not found", { status: 404 });
  }
}

export default function PublicMealDetailPage({ loaderData, params }: Route.ComponentProps) {
  const { meal, username } = loaderData;

  const servingDate = new Date(meal.servingTime);
  const timeline = meal.timelineJson?.items || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <ChefHat className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-base font-semibold tracking-tight">
              mise en place
            </span>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          to={`/u/${username}/meals`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {meal.creator.displayName || `@${username}`}'s meals
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <span>By</span>
            <Link to={`/u/${username}`} className="text-primary hover:underline">
              @{username}
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{meal.name}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(servingDate, "EEEE, MMMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {format(servingDate, "h:mm a")}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {meal.guestCount} guests
            </span>
            <span className="flex items-center gap-1.5">
              <UtensilsCrossed className="h-4 w-4" />
              {serviceStyleLabels[meal.serviceStyle]}
            </span>
          </div>
          {meal.notes && (
            <p className="mt-4 text-muted-foreground max-w-2xl">{meal.notes}</p>
          )}
        </div>

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
                  {meal.courses.map((course) => (
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
                        <p className="font-medium">{course.recipe.title}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          {course.recipe.prepTimeMinutes && (
                            <span>Prep: {course.recipe.prepTimeMinutes}m</span>
                          )}
                          {course.recipe.cookTimeMinutes && (
                            <span>Cook: {course.recipe.cookTimeMinutes}m</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {timeline.length > 0 && (
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sign up CTA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Your Own Meal</CardTitle>
                <CardDescription>
                  Create your own multi-course meal with AI-powered timeline generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/sign-up">
                    Get Started Free
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/u/${username}`}
                  className="flex items-center gap-3 hover:bg-muted/50 -m-2 p-2 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {(meal.creator.displayName || username)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {meal.creator.displayName || username}
                    </p>
                    <p className="text-sm text-muted-foreground">@{username}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Plan your own meals on mise en place
          </Link>
        </div>
      </footer>
    </div>
  );
}

// Error boundary for 404
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <ChefHat className="h-16 w-16 text-muted-foreground mx-auto" />
        <h1 className="font-display text-2xl font-semibold">Meal Not Found</h1>
        <p className="text-muted-foreground">
          This meal doesn't exist or is not public.
        </p>
        <Link to="/">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
