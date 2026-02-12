import { useState } from "react";
import { redirect, Link } from "react-router";
import type { Route } from "./+types/meals";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";
import { MealCard } from "@/components/meals/meal-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/login");
  }

  const meals = await context.trpc.multiCourseMeal.list();

  return { meals };
}

export function meta() {
  return [
    { title: "My Meals | Mise en Place" },
    { name: "description", content: "Manage your planned multi-course meals" },
  ];
}

export default function MealsPage({ loaderData }: Route.ComponentProps) {
  const { meals: initialMeals } = loaderData;
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Use query with initial data for real-time updates
  const { data: meals } = api.multiCourseMeal.list.useQuery(undefined, {
    initialData: initialMeals,
  });

  const utils = api.useUtils();

  const deleteMutation = api.multiCourseMeal.delete.useMutation({
    onSuccess: () => {
      toast.success("Meal deleted successfully");
      utils.multiCourseMeal.list.invalidate();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete meal");
    },
  });

  const handleDelete = (mealId: string) => {
    setDeleteId(mealId);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ mealId: deleteId });
    }
  };

  const handleShare = (mealId: string) => {
    // Navigate to meal detail with share modal open
    window.location.href = `/recipes/meals/${mealId}?share=true`;
  };

  const handlePrint = (mealId: string) => {
    // Navigate to meal detail with print modal open
    window.location.href = `/recipes/meals/${mealId}?print=true`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Meals"
        subtitle="Plan and organize your multi-course dining experiences"
        actions={
          <Button asChild>
            <Link to="/recipes/meal">
              <Plus className="h-4 w-4" />
              Plan a Meal
            </Link>
          </Button>
        }
      />

      {/* Meals Grid */}
      {meals && meals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onShare={handleShare}
              onPrint={handlePrint}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-2xl scale-150" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-card border border-dashed border-border">
              <UtensilsCrossed className="h-10 w-10 text-primary/60" />
            </div>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
            No meals planned yet
          </h2>
          <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
            Start planning your first multi-course meal. Our AI will help you create
            the perfect cooking timeline.
          </p>
          <Button asChild size="lg">
            <Link to="/recipes/meal">
              <Plus className="h-5 w-5" />
              Plan Your First Meal
            </Link>
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meal? This action cannot be undone.
              All courses and the cooking timeline will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
