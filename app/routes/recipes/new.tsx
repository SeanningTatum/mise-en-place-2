import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { RecipeExtractor, RecipePreview, type ExtractedRecipeData } from "@/components/recipes";
import { api } from "@/trpc/client";
import type { Route } from "./+types/new";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  return {};
};

export default function NewRecipePage() {
  const navigate = useNavigate();
  const [extractedRecipe, setExtractedRecipe] = useState<ExtractedRecipeData | null>(null);

  const saveMutation = api.recipes.save.useMutation({
    onSuccess: (data) => {
      navigate(`/recipes/${data.id}`);
    },
  });

  const handleSave = () => {
    if (!extractedRecipe) return;
    saveMutation.mutate(extractedRecipe);
  };

  const handleCancel = () => {
    setExtractedRecipe(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Extract a Recipe</h1>
        <p className="text-muted-foreground">
          Paste a YouTube video or blog URL to automatically extract the recipe.
        </p>
      </div>

      {!extractedRecipe ? (
        <RecipeExtractor onExtracted={setExtractedRecipe} />
      ) : (
        <RecipePreview
          recipe={extractedRecipe}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={saveMutation.isPending}
        />
      )}
    </div>
  );
}
