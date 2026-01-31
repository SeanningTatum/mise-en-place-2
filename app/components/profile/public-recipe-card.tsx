import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Youtube, Globe, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicRecipeCardProps {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  sourceType: "youtube" | "blog";
  calories: number | null;
  protein: number | null;
  saveCount: number;
  username: string;
  onSave?: () => void;
  isSaving?: boolean;
  showSaveButton?: boolean;
}

export function PublicRecipeCard({
  title,
  slug,
  description,
  thumbnailUrl,
  sourceType,
  calories,
  protein,
  saveCount,
  username,
  onSave,
  isSaving,
  showSaveButton = true,
}: PublicRecipeCardProps) {
  const recipeUrl = `/u/${username}/recipe/${slug}`;

  return (
    <Card className="group overflow-hidden border-border/60 hover:border-primary/30 transition-all hover:shadow-warm">
      <Link to={recipeUrl} className="block">
        {/* Thumbnail */}
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              {sourceType === "youtube" ? (
                <Youtube className="h-12 w-12 text-muted-foreground/50" />
              ) : (
                <Globe className="h-12 w-12 text-muted-foreground/50" />
              )}
            </div>
          )}

          {/* Source Badge */}
          <Badge
            variant="secondary"
            className={cn(
              "absolute top-2 left-2 text-xs",
              sourceType === "youtube"
                ? "bg-red-500/90 text-white hover:bg-red-500"
                : "bg-accent/90 text-accent-foreground hover:bg-accent"
            )}
          >
            {sourceType === "youtube" ? (
              <>
                <Youtube className="h-3 w-3 mr-1" />
                YouTube
              </>
            ) : (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Blog
              </>
            )}
          </Badge>

          {/* Save Count */}
          {saveCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs font-medium text-primary">
              <Bookmark className="h-3 w-3 fill-current" />
              {saveCount}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <CardContent className="p-4">
        <Link to={recipeUrl} className="block">
          <h3 className="font-display font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        )}

        {/* Macros */}
        {(calories || protein) && (
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            {calories && (
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                {calories} kcal
              </span>
            )}
            {protein && (
              <span>{protein}g protein</span>
            )}
          </div>
        )}

        {/* Save Button */}
        {showSaveButton && onSave && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 gap-2"
            onClick={(e) => {
              e.preventDefault();
              onSave();
            }}
            disabled={isSaving}
          >
            <Bookmark className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save to My Recipes"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
