import { redirect, Link } from "react-router";
import { CustomRecipeForm } from "@/components/recipes";
import { PenLine, ArrowLeft } from "lucide-react";
import type { Route } from "./+types/create";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  return {};
};

export default function CreateRecipePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back link */}
      <Link
        to="/recipes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        data-testid="back-to-recipes-link"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Link>

      {/* Header with editorial styling */}
      <div className="text-center space-y-4 py-4">
        <div className="flex items-center justify-center gap-2 text-primary">
          <div className="h-px w-8 bg-primary/30" />
          <PenLine className="h-5 w-5" />
          <div className="h-px w-8 bg-primary/30" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
          Create Your Own Recipe
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Capture your culinary creations in your personal cookbook. Perfect for
          family recipes, personal favorites, and original dishes.
        </p>
      </div>

      {/* Form */}
      <CustomRecipeForm />
    </div>
  );
}
