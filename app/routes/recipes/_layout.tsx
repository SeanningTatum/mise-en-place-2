import { Outlet, Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { ChefHat, Plus, ArrowLeft } from "lucide-react";

export default function RecipesLayout() {
  const location = useLocation();
  const isNewPage = location.pathname === "/recipes/new";
  const isDetailPage = location.pathname.match(/^\/recipes\/[^/]+$/);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {(isNewPage || isDetailPage) && (
              <Link to="/recipes">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/recipes" className="flex items-center gap-2 font-semibold">
              <ChefHat className="h-5 w-5" />
              <span>My Recipes</span>
            </Link>
          </div>
          {!isNewPage && (
            <Link to="/recipes/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Extract Recipe
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
