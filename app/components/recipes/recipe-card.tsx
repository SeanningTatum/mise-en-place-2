import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MacrosCard } from "./macros-card";
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
      <Card className="group overflow-hidden transition-all duration-500 hover:shadow-warm-lg border-border/30 bg-card rounded-[24px]">
        {/* Image container with overlay gradient */}
        <div className="aspect-4/3 relative overflow-hidden bg-secondary rounded-t-[24px]">
          {thumbnailUrl ? (
            <>
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover grayscale transition-all duration-[2000ms] ease-out group-hover:grayscale-0 group-hover:scale-105"
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
            className="absolute top-4 right-4 gap-1.5 bg-card/90 backdrop-blur-md border-0 text-[10px] uppercase tracking-[0.1em] font-medium rounded-full px-3 py-1.5"
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
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-[10px] uppercase tracking-[0.1em] font-medium bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5">
          {/* Title - serif for that cookbook feel */}
          <h3 className="font-display text-xl line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors duration-500">
            {title}
          </h3>

          {/* Macros row */}
          {(calories || protein) && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {calories && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-accent" />
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
    <Card className="overflow-hidden border-border/30 rounded-[24px]">
      <div className="aspect-4/3 bg-linear-to-br from-secondary to-muted animate-pulse rounded-t-[24px]" />
      <CardContent className="p-5 space-y-3">
        <div className="space-y-2">
          <div className="h-6 w-full bg-secondary animate-pulse rounded-[8px]" />
          <div className="h-6 w-2/3 bg-secondary animate-pulse rounded-[8px]" />
        </div>
        <div className="pt-4 border-t border-border/30">
          <div className="h-4 w-1/2 bg-secondary animate-pulse rounded-[8px]" />
        </div>
      </CardContent>
    </Card>
  );
}
