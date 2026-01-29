import { Outlet, Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { ChefHat, Plus, ArrowLeft } from "lucide-react";

export default function RecipesLayout() {
  const location = useLocation();
  const isNewPage = location.pathname === "/recipes/new";
  const isDetailPage = location.pathname.match(/^\/recipes\/[^/]+$/);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Editorial cookbook style */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {(isNewPage || isDetailPage) && (
              <Link to="/recipes">
                <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/recipes" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                  mise en place
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
                  Recipe Collection
                </span>
              </div>
            </Link>
          </div>
          {!isNewPage && (
            <Link to="/recipes/new">
              <Button size="sm" className="gap-2 shadow-warm hover:shadow-warm-lg transition-shadow">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Extract Recipe</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content - generous padding, max width container */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Footer - subtle branding */}
      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-muted-foreground/70 font-display italic">
            "Everything in its place"
          </p>
        </div>
      </footer>
    </div>
  );
}
