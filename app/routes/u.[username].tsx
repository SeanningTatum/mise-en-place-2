import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicProfileHeader, PublicRecipeCard, ShareModal } from "@/components/profile";
import { ChefHat, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Route } from "./+types/u.[username]";

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

  // Fetch public recipes
  const recipesData = await context.trpc.profile.getPublicRecipes({
    username,
    limit: 50,
    offset: 0,
  });

  // Increment view count (fire and forget)
  context.trpc.profile.incrementViewCount({ username }).catch(() => {
    // Ignore errors for analytics
  });

  return {
    profile,
    recipes: recipesData.recipes,
    totalRecipes: recipesData.total,
  };
}

export default function PublicProfilePage({ loaderData, params }: Route.ComponentProps) {
  const { profile, recipes } = loaderData;
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);

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

        {/* Recipes Grid */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">
            Recipes
            <span className="text-muted-foreground font-normal text-base ml-2">
              ({recipes.length})
            </span>
          </h2>

          {recipes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No public recipes yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <PublicRecipeCard
                  key={recipe.id}
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
