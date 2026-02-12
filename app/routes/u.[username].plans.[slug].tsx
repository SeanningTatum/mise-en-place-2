import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  WeekPreviewGrid,
  ImportModal,
} from "@/components/meal-plan-template";
import { ShareModal } from "@/components/profile";
import {
  ChefHat,
  ArrowLeft,
  Share2,
  Download,
  Eye,
  Calendar,
  ShoppingCart,
  Flame,
  Beef,
  UtensilsCrossed,
} from "lucide-react";
import type { PublicTemplateResponse } from "@/repositories/meal-plan-template";
import type { Route } from "./+types/u.[username].plans.[slug]";

// Type alias for entries
type TemplateEntry = PublicTemplateResponse["entries"][number];

export function meta({ params, data }: Route.MetaArgs) {
  const username = params.username;
  const templateName = data?.template?.name || "Meal Plan";
  return [
    { title: `${templateName} by @${username} | mise en place` },
    {
      name: "description",
      content: `${templateName} - A meal plan template shared by @${username} on mise en place`,
    },
    { property: "og:title", content: `${templateName} by @${username}` },
    {
      property: "og:description",
      content: data?.template?.description || `A meal plan template on mise en place`,
    },
    { property: "og:type", content: "article" },
  ];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const { username, slug } = params;

  // Fetch public template
  const data = await context.trpc.mealPlanTemplate.getPublicBySlug({
    username,
    slug,
  });

  if (!data) {
    throw new Response("Meal plan not found", { status: 404 });
  }

  // Increment view count (fire and forget)
  context.trpc.mealPlanTemplate
    .incrementViewCount({ templateId: data.template.id })
    .catch(() => {
      // Ignore errors
    });

  return data;
}

export default function PublicPlanDetailPage({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { template, entries, groceryPreview, nutritionSummary, creator } =
    loaderData;
  const navigate = useNavigate();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Transform entries for the week preview grid
  const gridEntries = entries.map((entry: TemplateEntry) => ({
    dayOfWeek: entry.dayOfWeek,
    mealType: entry.mealType,
    recipe: {
      id: entry.recipe.id,
      title: entry.recipe.title,
      thumbnailUrl: entry.recipe.thumbnailUrl,
      sourceType: entry.recipe.sourceType,
    },
  }));

  const handleImportClick = () => {
    // Check if user is logged in (will redirect in modal if not)
    setImportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button size="sm" onClick={handleImportClick}>
              <Download className="h-4 w-4 mr-1" />
              Import
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          to={`/u/${params.username}/plans`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {creator.displayName || `@${params.username}`}'s plans
        </Link>

        {/* Template Header Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold">
                  {template.name}
                </h1>
                {template.theme && (
                  <Badge variant="secondary" className="capitalize">
                    {template.theme.replace("-", " ")}
                  </Badge>
                )}
                {template.description && (
                  <p className="text-muted-foreground max-w-2xl">
                    {template.description}
                  </p>
                )}
              </div>

              {/* Creator info */}
              <div className="flex items-center gap-3 shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={creator.avatarUrl || undefined} />
                  <AvatarFallback>
                    {(creator.displayName || creator.username)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <Link
                    to={`/u/${creator.username}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {creator.displayName || `@${creator.username}`}
                  </Link>
                  <p className="text-muted-foreground">@{creator.username}</p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Download className="h-4 w-4" />
                {template.importCount} imports
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {template.viewCount} views
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(template.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Week Preview Grid */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Week at a Glance</h2>
          <WeekPreviewGrid entries={gridEntries} />
        </section>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nutrition Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{nutritionSummary.avgCalories}</p>
                  <p className="text-sm text-muted-foreground">avg calories/recipe</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Beef className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{nutritionSummary.avgProtein}g</p>
                  <p className="text-sm text-muted-foreground">avg protein/recipe</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{nutritionSummary.totalRecipes}</p>
                  <p className="text-sm text-muted-foreground">unique recipes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grocery List Preview */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Grocery List Preview</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {groceryPreview.totalIngredients} ingredients
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {groceryPreview.categories.map((category: { name: string; count: number }) => (
                  <Badge key={category.name} variant="outline">
                    {category.name} ({category.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recipes Included */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Recipes Included</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(
              [...new Map(entries.map((e: TemplateEntry) => [e.recipe.id, e.recipe])).values()] as TemplateEntry["recipe"][]
            ).map((recipe) => (
              <div
                key={recipe.id}
                className="group cursor-default"
                title={recipe.title}
              >
                <div className="aspect-square rounded-sm overflow-hidden bg-muted mb-2">
                  {recipe.thumbnailUrl ? (
                    <img
                      src={recipe.thumbnailUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium line-clamp-2">{recipe.title}</p>
              </div>
            )
            )}
          </div>
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={handleImportClick} className="gap-2">
            <Download className="h-5 w-5" />
            Import to My Week
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Create your own meal plans on mise en place
          </Link>
        </div>
      </footer>

      {/* Import Modal */}
      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        templateId={template.id}
        templateName={template.name}
        mealCount={entries.length}
      />

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        username={creator.username}
        displayName={creator.displayName}
        shareType="plan"
        slug={template.slug}
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
        <h1 className="font-display text-2xl font-semibold">
          Meal Plan Not Found
        </h1>
        <p className="text-muted-foreground">
          This meal plan doesn't exist or is not public.
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
