import { useState, useCallback } from "react";
import { redirect, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { api } from "@/trpc/client";
import { toast } from "sonner";
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
      <div className="flex items-center justify-center py-16">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const { recipe } = loaderData;
  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) > 0
      ? (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* YouTube Player */}
      {recipe.sourceType === "youtube" && recipe.youtubeVideoId && (
        <div data-testid="youtube-player-container">
          <YouTubePlayer
            videoId={recipe.youtubeVideoId}
            seekTo={seekTo}
            onTimeUpdate={handleTimeUpdate}
            onSeeked={handleSeeked}
          />
        </div>
      )}

      {/* Recipe Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl" data-testid="recipe-title">
            {recipe.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              {recipe.sourceType === "youtube" ? (
                <>
                  <Youtube className="h-3 w-3" />
                  YouTube
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3" />
                  Blog
                </>
              )}
            </Badge>
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {recipe.servings} servings
              </span>
            )}
            {totalTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {totalTime} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Saved {new Date(recipe.createdAt).toLocaleDateString()}
            </span>
          </div>
          {recipe.description && (
            <p className="text-muted-foreground max-w-2xl">{recipe.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="recipe-menu-button">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" data-testid="view-original-link">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Original
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
              data-testid="delete-recipe-button"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Recipe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Macros */}
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

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ingredients */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <IngredientsList
              ingredients={recipe.ingredients}
              checkable
            />
          </CardContent>
        </Card>

        {/* Steps */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <RecipeSteps
              steps={recipe.steps}
              onTimestampClick={recipe.sourceType === "youtube" ? handleTimestampClick : undefined}
              activeStep={activeStep}
              showYouTubeTimestamps={recipe.sourceType === "youtube"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="delete-recipe-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel-button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="delete-confirm-button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
