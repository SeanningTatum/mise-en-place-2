import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { RecipeExtractor, RecipePreview, type ExtractedRecipeData } from "@/components/recipes";
import { api } from "@/trpc/client";
import { Sparkles, BookOpen } from "lucide-react";
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
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header with editorial styling */}
      <div className="text-center space-y-4 py-4">
        <div className="flex items-center justify-center gap-2 text-primary">
          <div className="h-px w-8 bg-primary/30" />
          <Sparkles className="h-5 w-5" />
          <div className="h-px w-8 bg-primary/30" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Add to Your Collection
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Transform any cooking video or food blog into a beautifully formatted recipe for your personal cookbook.
        </p>
      </div>

      {/* Main content */}
      {!extractedRecipe ? (
        <div className="space-y-8">
          <RecipeExtractor onExtracted={setExtractedRecipe} />
          
          {/* How it works section */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-medium uppercase tracking-wider text-muted-foreground">
                How it works
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-semibold text-sm">
                  1
                </div>
                <h3 className="font-medium text-foreground">Paste a URL</h3>
                <p className="text-sm text-muted-foreground">
                  Copy a link from YouTube or your favorite recipe blog
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-semibold text-sm">
                  2
                </div>
                <h3 className="font-medium text-foreground">AI Extraction</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI reads the content and structures the recipe for you
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-semibold text-sm">
                  3
                </div>
                <h3 className="font-medium text-foreground">Save & Cook</h3>
                <p className="text-sm text-muted-foreground">
                  Review the recipe and add it to your personal cookbook
                </p>
              </div>
            </div>
          </div>
        </div>
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
