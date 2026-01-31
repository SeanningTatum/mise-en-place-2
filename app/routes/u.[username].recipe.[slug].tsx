import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MacrosCard,
  YouTubePlayer,
  RecipeSteps,
  IngredientsList,
} from "@/components/recipes";
import { ShareModal } from "@/components/profile";
import {
  ExternalLink,
  Youtube,
  Globe,
  Clock,
  Users,
  UtensilsCrossed,
  ListOrdered,
  ChevronLeft,
  Bookmark,
  Share2,
} from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import { useMediaQuery } from "@/lib/hooks";
import type { Route } from "./+types/u.[username].recipe.[slug]";

export const meta = ({ data }: Route.MetaArgs) => {
  if (!data?.recipe) {
    return [
      { title: "Recipe Not Found | mise en place" },
      { name: "description", content: "This recipe doesn't exist or is not public." },
    ];
  }

  const { recipe, username } = data;
  return [
    { title: `${recipe.title} by @${username} | mise en place` },
    { name: "description", content: recipe.description || `A recipe shared by @${username}` },
    { property: "og:title", content: `${recipe.title} by @${username}` },
    { property: "og:description", content: recipe.description || `A recipe shared by @${username}` },
    { property: "og:image", content: recipe.thumbnailUrl },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const { username, slug } = params;

  if (!username || !slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const recipe = await context.trpc.profile.getPublicRecipe({
    username,
    slug,
  });

  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }

  return { recipe, username };
};

export default function PublicRecipeDetailPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  // Use media query to conditionally render only ONE YouTube player
  // lg breakpoint = 1024px
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const utils = api.useUtils();

  const importMutation = api.profile.importRecipe.useMutation({
    onSuccess: () => {
      toast.success("Recipe saved to your collection!");
      utils.profile.getPublicRecipe.invalidate();
    },
    onError: (error) => {
      if (error.message.includes("UNAUTHORIZED")) {
        toast.error("Please sign in to save recipes", {
          action: {
            label: "Sign In",
            onClick: () => navigate("/login"),
          },
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleTimestampClick = useCallback((timestampSeconds: number) => {
    setSeekTo(timestampSeconds);
  }, []);

  const handleSeeked = useCallback(() => {
    setSeekTo(null);
  }, []);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    const recipe = loaderData?.recipe;
    if (!recipe) return;

    const currentStep = recipe.steps.find((step, index) => {
      const nextStep = recipe.steps[index + 1];
      const stepTime = step.timestampSeconds || 0;
      const nextStepTime = nextStep?.timestampSeconds || Infinity;
      return currentTime >= stepTime && currentTime < nextStepTime;
    });

    if (currentStep) {
      setActiveStep(currentStep.stepNumber);
    }
  }, [loaderData?.recipe]);

  const handleSaveRecipe = () => {
    if (!loaderData?.recipe) return;
    importMutation.mutate({ sourceRecipeId: loaderData.recipe.id });
  };

  if (!loaderData?.recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full bg-secondary animate-pulse" />
        <p className="mt-4 text-muted-foreground">Loading recipe...</p>
      </div>
    );
  }

  const { recipe, username } = loaderData;
  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) > 0
      ? (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)
      : null;

  const isYouTubeRecipe = recipe.sourceType === "youtube" && recipe.youtubeVideoId;
  const recipeUrl = typeof window !== "undefined" 
    ? window.location.href 
    : `https://miseenplace.app/u/${username}/recipe/${recipe.slug}`;

  // Recipe header with back button and save
  const RecipeHeader = () => (
    <div className="space-y-4">
      {/* Back to profile */}
      <Link
        to={`/u/${username}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to @{username}'s profile
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4 flex-1">
          {/* Title */}
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-foreground">
            {recipe.title}
          </h1>
          
          {/* Meta info pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 bg-card border border-border/50">
              {recipe.sourceType === "youtube" ? (
                <>
                  <Youtube className="h-3.5 w-3.5 text-red-500" />
                  <span>YouTube</span>
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span>Blog</span>
                </>
              )}
            </Badge>
            {recipe.servings && (
              <Badge variant="outline" className="gap-1.5 px-3 py-1 border-border/50">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{recipe.servings} servings</span>
              </Badge>
            )}
            {totalTime && (
              <Badge variant="outline" className="gap-1.5 px-3 py-1 border-border/50">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{totalTime} min</span>
              </Badge>
            )}
          </div>
          
          {/* Description */}
          {recipe.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="border-border/50"
            onClick={() => setShareModalOpen(true)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View Original</span>
            </a>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={handleSaveRecipe}
            disabled={importMutation.isPending}
          >
            <Bookmark className="h-4 w-4" />
            {importMutation.isPending ? "Saving..." : "Save Recipe"}
          </Button>
        </div>
      </div>
    </div>
  );

  // YouTube recipe: Side-by-side layout with sticky video
  // IMPORTANT: Only render ONE layout to avoid duplicate YouTube iframes
  if (isYouTubeRecipe) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-lg font-semibold text-foreground">mise en place</span>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </header>

        <main className="container max-w-7xl mx-auto px-4 py-8">
          {/* Conditionally render mobile OR desktop layout - never both */}
          {!isDesktop ? (
            // Mobile: Stacked layout
            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden shadow-warm-lg">
                <YouTubePlayer
                  videoId={recipe.youtubeVideoId!}
                  seekTo={seekTo}
                  onTimeUpdate={handleTimeUpdate}
                  onSeeked={handleSeeked}
                />
              </div>
              <RecipeHeader />
              <MacrosCard
                calories={recipe.calories}
                protein={recipe.protein}
                carbs={recipe.carbs}
                fat={recipe.fat}
                fiber={recipe.fiber}
                servings={recipe.servings}
              />
              <Card className="border-border/50 shadow-warm overflow-hidden">
                <div className="h-1 bg-linear-to-r from-accent to-accent/50" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">Ingredients</h2>
                  </div>
                  <IngredientsList ingredients={recipe.ingredients} checkable />
                </div>
              </Card>
              <Card className="border-border/50 shadow-warm overflow-hidden">
                <div className="h-1 bg-linear-to-r from-primary to-primary/50" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <ListOrdered className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">Instructions</h2>
                  </div>
                  <RecipeSteps
                    steps={recipe.steps}
                    onTimestampClick={handleTimestampClick}
                    activeStep={activeStep}
                    showYouTubeTimestamps
                  />
                </div>
              </Card>
            </div>
          ) : (
            // Desktop: Side-by-side layout
            <div className="grid grid-cols-[1fr_400px] gap-8">
              {/* Left: Sticky video */}
              <div className="space-y-6">
                <div className="sticky top-24">
                  <div className="rounded-xl overflow-hidden shadow-warm-lg">
                    <YouTubePlayer
                      videoId={recipe.youtubeVideoId!}
                      seekTo={seekTo}
                      onTimeUpdate={handleTimeUpdate}
                      onSeeked={handleSeeked}
                    />
                  </div>
                  <div className="mt-6">
                    <RecipeHeader />
                  </div>
                </div>
              </div>

              {/* Right: Scrollable content */}
              <div className="space-y-6">
                <MacrosCard
                  calories={recipe.calories}
                  protein={recipe.protein}
                  carbs={recipe.carbs}
                  fat={recipe.fat}
                  fiber={recipe.fiber}
                  servings={recipe.servings}
                />
                <Card className="border-border/50 shadow-warm overflow-hidden">
                  <div className="h-1 bg-linear-to-r from-accent to-accent/50" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <UtensilsCrossed className="h-5 w-5 text-primary" />
                      <h2 className="font-display text-lg font-semibold text-foreground">Ingredients</h2>
                    </div>
                    <IngredientsList ingredients={recipe.ingredients} checkable />
                  </div>
                </Card>
                <Card className="border-border/50 shadow-warm overflow-hidden">
                  <div className="h-1 bg-linear-to-r from-primary to-primary/50" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <ListOrdered className="h-5 w-5 text-primary" />
                      <h2 className="font-display text-lg font-semibold text-foreground">Instructions</h2>
                    </div>
                    <RecipeSteps
                      steps={recipe.steps}
                      onTimestampClick={handleTimestampClick}
                      activeStep={activeStep}
                      showYouTubeTimestamps
                    />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </main>

        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          url={recipeUrl}
          title={`Share "${recipe.title}"`}
        />
      </div>
    );
  }

  // Blog recipe: Single column layout with image
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold text-foreground">mise en place</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero image */}
          {recipe.thumbnailUrl && (
            <div className="aspect-video rounded-xl overflow-hidden shadow-warm-lg">
              <img
                src={recipe.thumbnailUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <RecipeHeader />

          <MacrosCard
            calories={recipe.calories}
            protein={recipe.protein}
            carbs={recipe.carbs}
            fat={recipe.fat}
            fiber={recipe.fiber}
            servings={recipe.servings}
          />

          <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
            <Card className="border-border/50 shadow-warm overflow-hidden h-fit">
              <div className="h-1 bg-linear-to-r from-accent to-accent/50" />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">Ingredients</h2>
                </div>
                <IngredientsList ingredients={recipe.ingredients} checkable />
              </div>
            </Card>

            <Card className="border-border/50 shadow-warm overflow-hidden">
              <div className="h-1 bg-linear-to-r from-primary to-primary/50" />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <ListOrdered className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">Instructions</h2>
                </div>
                <RecipeSteps steps={recipe.steps} />
              </div>
            </Card>
          </div>
        </div>
      </main>

      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        url={recipeUrl}
        title={`Share "${recipe.title}"`}
      />
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold">Recipe Not Found</h1>
          <p className="text-muted-foreground">
            This recipe doesn't exist or is not public.
          </p>
        </div>
        <Button variant="default" asChild>
          <Link to="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
