import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicProfileHeader, PublicRecipeCard, ShareModal } from "@/components/profile";
import { PublicTemplateCard } from "@/components/meal-plan-template";
import { ChefHat, ArrowLeft, Star, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Route } from "./+types/u.$username";

export function meta({ params }: Route.MetaArgs) {
  const username = params.username;
  return [
    { title: `@${username}'s Recipes | mise en place` },
    {
      name: "description",
      content: `Check out @${username}'s recipe collection on mise en place`,
    },
    { property: "og:title", content: `@${username}'s Recipe Collection` },
    {
      property: "og:description",
      content: `Discover recipes from @${username} on mise en place`,
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

  // Fetch original (custom), collected (extracted) recipes, and meal plan templates
  const [originalRecipes, collectedRecipes, mealPlanTemplates] = await Promise.all([
    context.trpc.profile.getPublicRecipes({
      username,
      limit: 50,
      offset: 0,
      isCustom: true,
    }),
    context.trpc.profile.getPublicRecipes({
      username,
      limit: 50,
      offset: 0,
      isCustom: false,
    }),
    context.trpc.mealPlanTemplate.listPublic({ username }),
  ]);

  // Increment view count (fire and forget)
  context.trpc.profile.incrementViewCount({ username }).catch(() => {
    // Ignore errors for analytics
  });

  return {
    profile,
    originalRecipes: originalRecipes.recipes,
    originalCount: originalRecipes.total,
    collectedRecipes: collectedRecipes.recipes,
    collectedCount: collectedRecipes.total,
    mealPlanTemplates,
    mealPlanCount: mealPlanTemplates.length,
  };
}

export default function PublicProfilePage({ loaderData, params }: Route.ComponentProps) {
  const { profile, originalRecipes, originalCount, collectedRecipes, collectedCount, mealPlanTemplates, mealPlanCount } = loaderData;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showShareModal, setShowShareModal] = useState(false);
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);

  // Default to "original" if there are original recipes, otherwise "collected"
  const defaultTab = originalCount > 0 ? "original" : "collected";
  const activeTab = searchParams.get("tab") || defaultTab;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === defaultTab) {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    setSearchParams(params);
  };

  const currentRecipes = activeTab === "original" ? originalRecipes : collectedRecipes;

  const utils = api.useUtils();
  const importRecipeMutation = api.profile.importRecipe.useMutation({
    onSuccess: (data) => {
      toast.success("Recipe saved to your collection!", {
        action: {
          label: "View",
          onClick: () => navigate(`/recipes/${data.newRecipeId}`),
        },
      });
      // Refresh the public recipes to update save counts
      utils.profile.getPublicRecipes.invalidate({ username: params.username });
    },
    onError: (error) => {
      if (error.message.includes("UNAUTHORIZED")) {
        toast.error("Please sign in to save recipes", {
          action: {
            label: "Sign In",
            onClick: () => navigate("/authentication/login"),
          },
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleSaveRecipe = async (recipeId: string) => {
    setSavingRecipeId(recipeId);
    try {
      await importRecipeMutation.mutateAsync({ recipeId });
    } finally {
      setSavingRecipeId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <ChefHat className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-base font-semibold">
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
        {/* Profile Header */}
        <PublicProfileHeader
          displayName={profile.profile.displayName}
          username={profile.profile.username}
          bio={profile.profile.bio}
          avatarUrl={profile.profile.avatarUrl}
          viewCount={profile.profile.viewCount}
          createdAt={profile.profile.createdAt}
          totalRecipes={profile.stats.totalRecipes}
          totalSaves={profile.stats.totalSaves}
          onShareClick={() => setShowShareModal(true)}
        />

        {/* Recipes Section with Tabs */}
        <section className="space-y-6">
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="bg-secondary/50 h-auto p-1">
              <TabsTrigger
                value="original"
                className={cn(
                  "gap-2 data-[state=active]:bg-card px-4 py-2",
                  originalCount === 0 && "text-muted-foreground"
                )}
                data-testid="profile-tab-original"
              >
                <Star className="h-4 w-4" />
                Original Recipes
                <span className="text-xs text-muted-foreground">({originalCount})</span>
              </TabsTrigger>
              <TabsTrigger
                value="collected"
                className={cn(
                  "gap-2 data-[state=active]:bg-card px-4 py-2",
                  collectedCount === 0 && "text-muted-foreground"
                )}
                data-testid="profile-tab-collected"
              >
                Collected Recipes
                <span className="text-xs text-muted-foreground">({collectedCount})</span>
              </TabsTrigger>
              {mealPlanCount > 0 && (
                <TabsTrigger
                  value="plans"
                  className="gap-2 data-[state=active]:bg-card px-4 py-2"
                  data-testid="profile-tab-plans"
                >
                  <Calendar className="h-4 w-4" />
                  Meal Plans
                  <span className="text-xs text-muted-foreground">({mealPlanCount})</span>
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {/* Content Grid */}
          {activeTab === "plans" ? (
            // Meal Plans Grid
            mealPlanTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No meal plans shared yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealPlanTemplates.map((template) => (
                  <PublicTemplateCard
                    key={template.id}
                    template={template}
                    username={params.username}
                  />
                ))}
              </div>
            )
          ) : // Recipe Grid
            currentRecipes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>
                  {activeTab === "original"
                    ? "No original recipes shared yet."
                    : "No collected recipes shared yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentRecipes.map((recipe) => (
                  <div key={recipe.id} className="relative">
                    {/* Original badge for custom recipes */}
                    {recipe.isCustom && (
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                        <Star className="h-3 w-3" />
                        Original
                      </div>
                    )}
                    <PublicRecipeCard
                      id={recipe.id}
                      title={recipe.title}
                      slug={recipe.slug}
                      description={recipe.description}
                      thumbnailUrl={recipe.thumbnailUrl}
                      sourceType={recipe.sourceType}
                      calories={recipe.calories}
                      protein={recipe.protein}
                      saveCount={recipe.saveCount}
                      username={params.username}
                      onSave={() => handleSaveRecipe(recipe.id)}
                      isSaving={savingRecipeId === recipe.id}
                    />
                  </div>
                ))}
              </div>
            )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Create your own recipe collection on mise en place
          </Link>
        </div>
      </footer>

      {/* Share Modal */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        username={profile.profile.username}
        displayName={profile.profile.displayName}
      />
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
