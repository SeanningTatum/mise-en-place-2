import { Link } from "react-router";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ChefHat, ArrowLeft, Clock, Users, UtensilsCrossed } from "lucide-react";
import { format } from "date-fns";
import type { Route } from "./+types/u.[username].meals";

export function meta({ params }: Route.MetaArgs) {
  const username = params.username;
  return [
    { title: `@${username}'s Meals | mise en place` },
    {
      name: "description",
      content: `Check out @${username}'s meal plans on mise en place`,
    },
    { property: "og:title", content: `@${username}'s Meal Plans` },
    {
      property: "og:description",
      content: `Discover meal plans from @${username} on mise en place`,
    },
    { property: "og:type", content: "profile" },
  ];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const { username } = params;

  // Fetch public profile data
  const profile = await context.trpc.profile.getPublicProfile({ username });

  if (!profile) {
    throw new Response("Profile not found", { status: 404 });
  }

  // Fetch public meals
  const meals = await context.trpc.multiCourseMeal.listPublicMeals({ username });

  return {
    profile,
    meals,
  };
}

const serviceStyleLabels: Record<string, string> = {
  plated: "Plated",
  family: "Family Style",
  buffet: "Buffet",
};

export default function PublicMealsPage({ loaderData, params }: Route.ComponentProps) {
  const { profile, meals } = loaderData;

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
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          to={`/u/${params.username}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {profile.profile.displayName || `@${params.username}`}'s profile
        </Link>

        {/* Page Title */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {profile.profile.displayName || `@${params.username}`}'s Meals
          </h1>
          <p className="text-muted-foreground mt-1">
            {meals.length} public meal {meals.length === 1 ? "plan" : "plans"}
          </p>
        </div>

        {/* Meals Grid */}
        {meals.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-6 rounded-full bg-muted/50 inline-block mb-4">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">No public meals yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => {
              const servingDate = new Date(meal.servingTime);
              return (
                <Card key={meal.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {meal.thumbnailUrl ? (
                      <img
                        src={meal.thumbnailUrl}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <Link
                      to={`/u/${params.username}/meals/${meal.slug}`}
                      className="font-semibold text-lg hover:text-primary transition-colors"
                    >
                      {meal.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {serviceStyleLabels[meal.serviceStyle]}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 pb-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {meal.guestCount} guests
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="h-3.5 w-3.5" />
                        {meal.courseCount} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {format(servingDate, "MMM d")}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button asChild variant="default" size="sm" className="w-full">
                      <Link to={`/u/${params.username}/meals/${meal.slug}`}>
                        View Meal
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-auto">
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
        <h1 className="font-display text-2xl font-semibold">Profile Not Found</h1>
        <p className="text-muted-foreground">
          This profile doesn't exist or is not public.
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
