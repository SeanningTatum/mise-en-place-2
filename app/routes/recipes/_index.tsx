import { useState, useEffect } from "react";
import { redirect } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipes";
import { Search, ChefHat, Plus, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useDebounce } from "@/lib/hooks";
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
  const currentSource = searchParams.get("source") || "all";

  // Local state for immediate input feedback
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync debounced search to URL params
  useEffect(() => {
    const currentUrlSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentUrlSearch) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.delete("page");
      setSearchParams(params);
    }
  }, [debouncedSearch]);

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
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Your Cookbook
          </h1>
          <p className="text-muted-foreground">Loading your recipes...</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { recipes, total, page, totalPages } = loaderData;

  return (
    <div className="space-y-8">
      {/* Header - Editorial style with decorative elements */}
      <div className="space-y-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Your Cookbook
            </h1>
            <p className="text-muted-foreground mt-1">
              {total > 0 ? (
                <span data-testid="recipe-count">
                  A collection of <span className="font-medium text-foreground">{total}</span> treasured recipe{total !== 1 ? "s" : ""}
                </span>
              ) : (
                "Begin your culinary journey"
              )}
            </p>
          </div>
          {/* Decorative divider line - desktop only */}
          <div className="hidden sm:block flex-1 mx-8 h-px bg-linear-to-r from-transparent via-border to-transparent" />
        </div>
      </div>

      {/* Filters - refined styling */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-card/50 p-4 rounded-xl border border-border/50">
        <Tabs value={currentSource} onValueChange={handleSourceChange} className="w-full sm:w-auto">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all" data-testid="filter-tab-all" className="data-[state=active]:bg-card">
              All Sources
            </TabsTrigger>
            <TabsTrigger value="youtube" data-testid="filter-tab-youtube" className="data-[state=active]:bg-card">
              YouTube
            </TabsTrigger>
            <TabsTrigger value="blog" data-testid="filter-tab-blog" className="data-[state=active]:bg-card">
              Blogs
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your recipes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-card border-border/50 focus:border-primary/50"
            data-testid="recipe-search-input"
          />
        </div>
      </div>

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="recipe-grid">
            {recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
              >
                <RecipeCard
                  id={recipe.id}
                  title={recipe.title}
                  thumbnailUrl={recipe.thumbnailUrl}
                  sourceType={recipe.sourceType}
                  calories={recipe.calories}
                  protein={recipe.protein}
                  prepTimeMinutes={recipe.prepTimeMinutes}
                  cookTimeMinutes={recipe.cookTimeMinutes}
                />
              </div>
            ))}
          </div>

          {/* Pagination - refined */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4" data-testid="pagination">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", String(page - 1));
                  setSearchParams(params);
                }}
                className="shadow-warm hover:shadow-warm-lg"
                data-testid="pagination-previous"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground font-medium" data-testid="pagination-info">
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
                className="shadow-warm hover:shadow-warm-lg"
                data-testid="pagination-next"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Empty State - Editorial style */
        <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-state">
          <div className="relative mb-8">
            {/* Decorative circle */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-2xl scale-150" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-card border-2 border-dashed border-border">
              <ChefHat className="h-10 w-10 text-primary/60" />
            </div>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3 text-foreground">
            {searchInput || currentSource !== "all"
              ? "No recipes found"
              : "Your cookbook awaits"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
            {searchInput || currentSource !== "all"
              ? "No recipes match your filters. Try adjusting your search or explore all recipes."
              : "Transform your favorite YouTube cooking videos and food blogs into a beautifully organized personal cookbook."}
          </p>
          {!searchInput && currentSource === "all" && (
            <Link to="/recipes/new">
              <Button size="lg" className="gap-2 shadow-warm hover:shadow-warm-lg" data-testid="extract-first-recipe-button">
                <Sparkles className="h-4 w-4" />
                Extract Your First Recipe
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
