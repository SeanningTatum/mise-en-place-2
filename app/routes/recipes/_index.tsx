import { redirect } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipes";
import { Search, ChefHat, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { api } from "@/trpc/client";
import type { Route } from "./+types/_index";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "0");
  const search = url.searchParams.get("search") || undefined;
  const sourceType = url.searchParams.get("source") as "youtube" | "blog" | undefined;

  const data = await context.trpc.recipes.list({
    page,
    limit: 12,
    search,
    sourceType: sourceType || undefined,
  });

  return { ...data, search, sourceType };
};

export default function RecipesIndex({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const currentSource = searchParams.get("source") || "all";

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleSourceChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("source", value);
    } else {
      params.delete("source");
    }
    params.delete("page");
    setSearchParams(params);
  };

  // Handle loading state
  if (!loaderData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">My Recipes</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { recipes, total, page, totalPages } = loaderData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <span className="text-sm text-muted-foreground" data-testid="recipe-count">
          {total} recipe{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Tabs value={currentSource} onValueChange={handleSourceChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all" data-testid="filter-tab-all">All</TabsTrigger>
            <TabsTrigger value="youtube" data-testid="filter-tab-youtube">YouTube</TabsTrigger>
            <TabsTrigger value="blog" data-testid="filter-tab-blog">Blogs</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recipes..."
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-testid="recipe-search-input"
          />
        </div>
      </div>

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                thumbnailUrl={recipe.thumbnailUrl}
                sourceType={recipe.sourceType}
                calories={recipe.calories}
                protein={recipe.protein}
                prepTimeMinutes={recipe.prepTimeMinutes}
                cookTimeMinutes={recipe.cookTimeMinutes}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2" data-testid="pagination">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", String(page - 1));
                  setSearchParams(params);
                }}
                data-testid="pagination-previous"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground" data-testid="pagination-info">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", String(page + 1));
                  setSearchParams(params);
                }}
                data-testid="pagination-next"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="empty-state">
          <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No recipes yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {currentSearch || currentSource !== "all"
              ? "No recipes match your filters. Try adjusting your search."
              : "Start building your recipe collection by extracting recipes from YouTube videos or food blogs."}
          </p>
          {!currentSearch && currentSource === "all" && (
            <Link to="/recipes/new">
              <Button className="gap-2" data-testid="extract-first-recipe-button">
                <Plus className="h-4 w-4" />
                Extract Your First Recipe
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
