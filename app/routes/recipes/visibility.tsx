import { redirect, Link } from "react-router";
import { api } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { RecipeVisibilityList } from "@/components/profile";
import { toast } from "sonner";
import { Loader2, AlertCircle, Settings } from "lucide-react";
import type { Route } from "./+types/visibility";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/authentication/login");
  }

  return { user: session.user };
}

export default function RecipeVisibilityPage() {
  // Queries
  const { data: profile, isLoading: profileLoading } = api.profile.getMyProfile.useQuery();
  const { data: recipes, isLoading: recipesLoading } = api.profile.getMyRecipesForVisibility.useQuery();

  // Mutations
  const utils = api.useUtils();
  const setVisibilityMutation = api.profile.setRecipeVisibility.useMutation({
    onSuccess: () => {
      utils.profile.getMyRecipesForVisibility.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggleVisibility = async (recipeId: string, newIsPublic: boolean) => {
    await setVisibilityMutation.mutateAsync({
      recipeId,
      isPublic: newIsPublic,
    });
  };

  const isLoading = profileLoading || recipesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no profile exists yet, prompt user to create one
  if (!profile) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <PageHeader
          title="Recipe Visibility"
          subtitle="Control which recipes appear on your public profile"
          backTo={{ label: "Recipes", href: "/recipes" }}
        />

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You need to create a profile before managing recipe visibility.</span>
            <Button asChild size="sm" variant="outline">
              <Link to="/recipes/profile">
                <Settings className="h-4 w-4 mr-2" />
                Set Up Profile
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const publicCount = recipes?.filter((r) => r.isPublic).length || 0;
  const totalCount = recipes?.length || 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Recipe Visibility"
        subtitle="Control which recipes appear on your public profile"
        backTo={{ label: "Recipes", href: "/recipes" }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display">Your Recipes</CardTitle>
              <CardDescription>
                {publicCount} of {totalCount} recipes are public
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RecipeVisibilityList
            recipes={recipes || []}
            onToggleVisibility={handleToggleVisibility}
            isLoading={setVisibilityMutation.isPending}
          />
        </CardContent>
      </Card>

      {!profile.isPublic && publicCount > 0 && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Your profile is currently private. Enable profile visibility in{" "}
            <Link to="/recipes/profile" className="font-medium underline hover:no-underline">
              Profile Settings
            </Link>{" "}
            for others to see your public recipes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
