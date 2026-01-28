import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MacrosCard } from "./macros-card";
import { Youtube, Globe, Clock } from "lucide-react";
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
      <Card className="group overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {sourceType === "youtube" ? (
                <Youtube className="h-12 w-12 text-muted-foreground/50" />
              ) : (
                <Globe className="h-12 w-12 text-muted-foreground/50" />
              )}
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 gap-1"
          >
            {sourceType === "youtube" ? (
              <Youtube className="h-3 w-3" />
            ) : (
              <Globe className="h-3 w-3" />
            )}
            {sourceType === "youtube" ? "YouTube" : "Blog"}
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2">
            <MacrosCard calories={calories} protein={protein} compact />
            {totalTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {totalTime} min
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardHeader className="pb-2">
        <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
