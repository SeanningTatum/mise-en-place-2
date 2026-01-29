import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MacrosCard } from "./macros-card";
import { Youtube, Globe, Clock, Flame } from "lucide-react";
import { Link } from "react-router";

interface RecipeCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  sourceType: "youtube" | "blog";
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
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-warm-lg border-border/50 bg-card">
        {/* Image container with overlay gradient */}
        <div className="aspect-4/3 relative overflow-hidden bg-secondary">
          {thumbnailUrl ? (
            <>
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay for better text legibility */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-secondary to-muted">
              {sourceType === "youtube" ? (
                <Youtube className="h-12 w-12 text-muted-foreground/40" />
              ) : (
                <Globe className="h-12 w-12 text-muted-foreground/40" />
              )}
            </div>
          )}
          
          {/* Source badge - top right */}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 gap-1.5 bg-card/90 backdrop-blur-sm border-0 text-xs font-medium"
          >
            {sourceType === "youtube" ? (
              <Youtube className="h-3 w-3 text-red-500" />
            ) : (
              <Globe className="h-3 w-3 text-primary" />
            )}
            {sourceType === "youtube" ? "YouTube" : "Blog"}
          </Badge>

          {/* Time badge - bottom left, overlaid on image */}
          {totalTime && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Title - serif for that cookbook feel */}
          <h3 className="font-display text-lg font-medium line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {/* Macros row */}
          {(calories || protein) && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {calories && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-primary/70" />
                    <span className="font-medium text-foreground">{calories}</span>
                    <span>cal</span>
                  </div>
                )}
                {protein && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{protein}g</span>
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
    <Card className="overflow-hidden border-border/50">
      <div className="aspect-4/3 bg-linear-to-br from-secondary to-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-5 w-full bg-secondary animate-pulse rounded" />
          <div className="h-5 w-2/3 bg-secondary animate-pulse rounded" />
        </div>
        <div className="pt-3 border-t border-border/50">
          <div className="h-4 w-1/2 bg-secondary animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
