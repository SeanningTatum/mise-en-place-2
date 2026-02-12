import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Youtube, Globe, Clock, Flame, PenLine } from "lucide-react";
import { Link } from "react-router";

interface RecipeCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  sourceType: "youtube" | "blog" | "custom";
  calories?: number | null;
  protein?: number | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
}

export function RecipeCard({
  id,
  title,
  thumbnailUrl,
  sourceType,
  calories,
  protein,
  prepTimeMinutes,
  cookTimeMinutes,
}: RecipeCardProps) {
  const totalTime =
    (prepTimeMinutes || 0) + (cookTimeMinutes || 0) > 0
      ? (prepTimeMinutes || 0) + (cookTimeMinutes || 0)
      : null;

  return (
    <Link to={`/recipes/${id}`} data-testid={`recipe-card-${id}`} className="block h-full">
      <Card className="group h-full flex flex-col overflow-hidden transition-all duration-500 border-border/30 bg-card rounded-sm py-0 gap-0">
        {/* Image container with overlay gradient */}
        <div className="aspect-4/3 relative overflow-hidden bg-secondary rounded-t-sm">
          {thumbnailUrl ? (
            <>
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover transition-all duration-500 ease-out"
              />
              {/* Gradient overlay for better text legibility */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-secondary to-muted">
              {sourceType === "youtube" ? (
                <Youtube className="h-12 w-12 text-muted-foreground/40" />
              ) : sourceType === "custom" ? (
                <PenLine className="h-12 w-12 text-muted-foreground/40" />
              ) : (
                <Globe className="h-12 w-12 text-muted-foreground/40" />
              )}
            </div>
          )}

          {/* Source badge - top right */}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 gap-1.5 bg-card/90 backdrop-blur-md border-0 text-xs font-medium rounded-full px-2.5 py-1"
          >
            {sourceType === "youtube" ? (
              <Youtube className="h-3 w-3 text-red-500" />
            ) : sourceType === "custom" ? (
              <PenLine className="h-3 w-3 text-accent" />
            ) : (
              <Globe className="h-3 w-3 text-primary" />
            )}
            {sourceType === "youtube" ? "YouTube" : sourceType === "custom" ? "Original" : "Blog"}
          </Badge>

          {/* Time badge - bottom left, overlaid on image */}
          {totalTime && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </div>
          )}
        </div>

        {/* Content - flex-1 to push macros to bottom */}
        <div className="flex flex-col flex-1 p-4">
          {/* Title - fixed height area for consistency */}
          <h3 className="font-display text-lg line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors duration-500 min-h-[2.75rem]">
            {title}
          </h3>

          {/* Macros row - always at bottom */}
          <div className="mt-auto pt-3 border-t border-border/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {calories ? (
                <div className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-accent" />
                  <span className="font-medium text-foreground">{calories}</span>
                  <span>cal</span>
                </div>
              ) : null}
              {protein ? (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{protein}g</span>
                  <span>protein</span>
                </div>
              ) : null}
              {!calories && !protein && (
                <span className="text-muted-foreground/50">No nutrition data</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden border-border/30 rounded-sm py-0 gap-0">
      <div className="aspect-4/3 bg-linear-to-br from-secondary to-muted animate-pulse rounded-t-sm" />
      <div className="flex flex-col flex-1 p-4">
        <div className="min-h-[2.75rem] space-y-1.5">
          <div className="h-5 w-full bg-secondary animate-pulse rounded-sm" />
          <div className="h-5 w-2/3 bg-secondary animate-pulse rounded-sm" />
        </div>
        <div className="mt-auto pt-3 border-t border-border/30">
          <div className="h-4 w-1/2 bg-secondary animate-pulse rounded-sm" />
        </div>
      </div>
    </Card>
  );
}
