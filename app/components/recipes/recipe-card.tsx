import { Card, CardContent } from "@/components/ui/card";
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
    <Link to={`/recipes/${id}`} data-testid={`recipe-card-${id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-1 border-border bg-card rounded-xl">
        {/* Image container */}
        <div className="aspect-4/3 relative overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <>
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Bottom gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              {sourceType === "youtube" ? (
                <Youtube className="h-12 w-12 text-muted-foreground/30" />
              ) : sourceType === "custom" ? (
                <PenLine className="h-12 w-12 text-muted-foreground/30" />
              ) : (
                <Globe className="h-12 w-12 text-muted-foreground/30" />
              )}
            </div>
          )}

          {/* Source badge */}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 gap-1.5 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-semibold"
          >
            {sourceType === "youtube" ? (
              <Youtube className="h-3 w-3" />
            ) : sourceType === "custom" ? (
              <PenLine className="h-3 w-3" />
            ) : (
              <Globe className="h-3 w-3" />
            )}
            {sourceType === "youtube" ? "Video" : sourceType === "custom" ? "Original" : "Blog"}
          </Badge>

          {/* Time badge */}
          {totalTime && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-ui font-medium bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-display text-base font-bold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Macros row */}
          {(calories || protein) && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-4 font-ui text-xs text-muted-foreground">
                {calories && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-primary/70" />
                    <span className="font-semibold text-foreground">{calories}</span>
                    <span>cal</span>
                  </div>
                )}
                {protein && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{protein}g</span>
                    <span>protein</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border rounded-xl">
      <div className="aspect-4/3 bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-5 w-full bg-muted animate-pulse rounded" />
          <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
        </div>
        <div className="pt-3 border-t border-border">
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
