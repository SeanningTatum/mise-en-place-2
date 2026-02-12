import { Link } from "react-router";
import { formatDistanceToNow, format, isPast } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChefHat,
  Clock,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  Printer,
  Share2,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MealListItem } from "@/repositories/multi-course-meal";

interface MealCardProps {
  meal: MealListItem;
  onShare?: (mealId: string) => void;
  onPrint?: (mealId: string) => void;
  onDelete?: (mealId: string) => void;
}

const serviceStyleLabels: Record<string, string> = {
  plated: "Plated",
  family: "Family Style",
  buffet: "Buffet",
};

const courseTypeLabels: Record<string, string> = {
  appetizer: "Appetizer",
  soup_salad: "Soup/Salad",
  main: "Main",
  side: "Side",
  dessert: "Dessert",
  drink: "Drink",
};

export function MealCard({ meal, onShare, onPrint, onDelete }: MealCardProps) {
  const servingDate = new Date(meal.servingTime);
  const isUpcoming = !isPast(servingDate);

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {meal.thumbnailUrl ? (
          <img
            src={meal.thumbnailUrl}
            alt={meal.name}
            className="w-full h-full object-cover transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {meal.isPublic && (
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              <Eye className="mr-1 h-3 w-3" />
              Public
            </Badge>
          )}
          {isUpcoming && (
            <Badge variant="default" className="bg-primary/90 backdrop-blur-sm">
              Upcoming
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/recipes/meals/${meal.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(meal.id)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPrint?.(meal.id)}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(meal.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              to={`/recipes/meals/${meal.id}`}
              className="block font-semibold text-lg hover:text-primary transition-colors truncate"
            >
              {meal.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {serviceStyleLabels[meal.serviceStyle]}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {meal.guestCount} guests
          </span>
          <span className="flex items-center gap-1">
            <ChefHat className="h-3.5 w-3.5" />
            {meal.courseCount} {meal.courseCount === 1 ? "course" : "courses"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {format(servingDate, "MMM d")} at {format(servingDate, "h:mm a")}
          </span>
        </div>

        {/* Generation Status */}
        {meal.generationStatus === "generating" && (
          <div className="mt-3">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Clock className="mr-1 h-3 w-3 animate-spin" />
              Generating timeline...
            </Badge>
          </div>
        )}
        {meal.generationStatus === "error" && (
          <div className="mt-3">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Generation failed
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link to={`/recipes/meals/${meal.id}`}>
              View Meal
            </Link>
          </Button>
          {meal.generationStatus === "complete" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint?.(meal.id)}
            >
              <Printer className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
