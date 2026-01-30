import { useState, useCallback } from "react";
import { redirect, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  MacrosCard,
  YouTubePlayer,
  RecipeSteps,
  IngredientsList,
} from "@/components/recipes";
import {
  MoreVertical,
  ExternalLink,
  Trash2,
  Youtube,
  Globe,
  Clock,
  Users,
  Calendar,
  UtensilsCrossed,
  ListOrdered,
  ChevronDown,
} from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Route } from "./+types/[id]";

export const loader = async ({ request, context, params }: Route.LoaderArgs) => {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  const recipe = await context.trpc.recipes.get({ id: params.id });

  return { recipe };
};

export default function RecipeDetailPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(true);

  const deleteMutation = api.recipes.delete.useMutation({
    onSuccess: () => {
      toast.success("Recipe deleted");
      navigate("/recipes");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleTimestampClick = useCallback((timestampSeconds: number) => {
    setSeekTo(timestampSeconds);
  }, []);

  const handleSeeked = useCallback(() => {
    // Reset seekTo to null so clicking the same timestamp again will work
    setSeekTo(null);
  }, []);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    // Find the active step based on current video time
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

  const handleDelete = () => {
    if (!loaderData?.recipe) return;
    deleteMutation.mutate({ id: loaderData.recipe.id });
  };

  // Loading state
  if (!loaderData?.recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full bg-secondary animate-pulse" />
        <p className="mt-4 text-muted-foreground">Loading recipe...</p>
      </div>
    );
  }

  const { recipe } = loaderData;
  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) > 0
      ? (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)
      : null;

  const isYouTubeRecipe = recipe.sourceType === "youtube" && recipe.youtubeVideoId;

  // Shared header component
  const RecipeHeader = () => (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-4">
        {/* Title */}
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-foreground" data-testid="recipe-title">
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="border-border/50 shrink-0" data-testid="recipe-menu-button">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" data-testid="view-original-link">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Original
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
            data-testid="delete-recipe-button"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Recipe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // YouTube recipe: Side-by-side layout with sticky video
  if (isYouTubeRecipe) {
    return (
      <div className="mx-auto max-w-7xl">
        {/* Mobile: Stacked layout */}
        <div className="lg:hidden space-y-6">
          <div data-testid="youtube-player-container" className="rounded-xl overflow-hidden shadow-warm-lg">
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

        {/* Desktop: Side-by-side layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          {/* Left column: Sticky video player */}
          <div className="relative">
            <div className="sticky top-4 space-y-4">
              <div data-testid="youtube-player-container" className="rounded-xl overflow-hidden shadow-warm-lg">
                <YouTubePlayer
                  videoId={recipe.youtubeVideoId!}
                  seekTo={seekTo}
                  onTimeUpdate={handleTimeUpdate}
                  onSeeked={handleSeeked}
                />
              </div>
              
              {/* Compact macros under video */}
              <div data-testid="macros-card-container">
                <MacrosCard
                  calories={recipe.calories}
                  protein={recipe.protein}
                  carbs={recipe.carbs}
                  fat={recipe.fat}
                  fiber={recipe.fiber}
                  servings={recipe.servings}
                />
              </div>

              {/* Collapsible ingredients under video */}
              <Collapsible open={ingredientsOpen} onOpenChange={setIngredientsOpen}>
                <Card className="border-border/50 shadow-warm overflow-hidden">
                  <div className="h-1 bg-linear-to-r from-accent to-accent/50" />
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5 text-primary" />
                        <h2 className="font-display text-lg font-semibold text-foreground">Ingredients</h2>
                        <Badge variant="secondary" className="ml-2">
                          {recipe.ingredients.length}
                        </Badge>
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        ingredientsOpen && "rotate-180"
                      )} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <IngredientsList ingredients={recipe.ingredients} checkable />
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          </div>

          {/* Right column: Scrollable content */}
          <div className="space-y-6">
            <RecipeHeader />
            
            {/* Steps - Full height for scrolling through timestamps */}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent data-testid="delete-recipe-dialog" className="border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-xl">Delete Recipe</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="delete-cancel-button" className="border-border/50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="delete-confirm-button"
              >
                Delete Recipe
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Non-YouTube recipe: Original editorial layout
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <RecipeHeader />

      {/* Macros Card */}
      <div data-testid="macros-card-container">
        <MacrosCard
          calories={recipe.calories}
          protein={recipe.protein}
          carbs={recipe.carbs}
          fat={recipe.fat}
          fiber={recipe.fiber}
          servings={recipe.servings}
        />
      </div>

      {/* Content Grid - Editorial Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Ingredients - Sidebar style */}
        <Card className="lg:col-span-1 border-border/50 shadow-warm overflow-hidden">
          <div className="h-1 bg-linear-to-r from-accent to-accent/50" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Ingredients</h2>
            </div>
            <IngredientsList
              ingredients={recipe.ingredients}
              checkable
            />
          </div>
        </Card>

        {/* Steps - Main content */}
        <Card className="lg:col-span-2 border-border/50 shadow-warm overflow-hidden">
          <div className="h-1 bg-linear-to-r from-primary to-primary/50" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <ListOrdered className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Instructions</h2>
            </div>
            <RecipeSteps
              steps={recipe.steps}
              onTimestampClick={undefined}
              activeStep={activeStep}
              showYouTubeTimestamps={false}
            />
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="delete-recipe-dialog" className="border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel-button" className="border-border/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="delete-confirm-button"
            >
              Delete Recipe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
