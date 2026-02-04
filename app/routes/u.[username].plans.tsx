import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { PublicTemplateCard } from "@/components/meal-plan-template";
import { ChefHat, ArrowLeft, UtensilsCrossed } from "lucide-react";
import type { TemplateListItem } from "@/repositories/meal-plan-template";
import type { Route } from "./+types/u.[username].plans";

export function meta({ params }: Route.MetaArgs) {
  const username = params.username;
  return [
    { title: `@${username}'s Meal Plans | mise en place` },
    {
      name: "description",
      content: `Check out @${username}'s meal plan templates on mise en place`,
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

  // Fetch public meal plan templates
  const templates = await context.trpc.mealPlanTemplate.listPublic({ username });

  return {
    profile,
    templates,
  };
}

export default function PublicPlansPage({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { profile, templates } = loaderData;

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
          <Link to="/authentication/login">
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
          Back to {profile.profile.displayName || `@${params.username}`}'s
          profile
        </Link>

        {/* Page Title */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {profile.profile.displayName || `@${params.username}`}'s Meal Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            {templates.length} public meal{" "}
            {templates.length === 1 ? "plan" : "plans"}
          </p>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-6 rounded-full bg-muted/50 inline-block mb-4">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">No public meal plans yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template: TemplateListItem) => (
              <PublicTemplateCard
                key={template.id}
                template={template}
                username={params.username}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Create your own meal plans on mise en place
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
        <h1 className="font-display text-2xl font-semibold">
          Profile Not Found
        </h1>
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
