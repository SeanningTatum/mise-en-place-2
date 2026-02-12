import { useState } from "react";
import { Outlet, Link, redirect, useLocation } from "react-router";
import { ChefHat, Menu, BookOpen, UtensilsCrossed, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/layout";
import { cn } from "@/lib/utils";
import type { Route } from "./+types/_layout";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect("/authentication/login");
  }

  return { user: session.user };
}

// Navigation items
const navItems = [
  { href: "/recipes", label: "Recipes", icon: BookOpen, exact: true },
  { href: "/recipes/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/recipes/planner", label: "Planner", icon: CalendarDays },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact = false,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === href
    : location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function RecipesLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Left - flex-1 for equal width */}
          <div className="flex-1 flex items-center gap-2">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <ChefHat className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-display">mise en place</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      {...item}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/recipes" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <ChefHat className="h-4 w-4 text-primary" />
              </div>
              <span className="font-display text-lg font-semibold text-foreground hidden sm:inline">
                mise en place
              </span>
            </Link>
          </div>

          {/* Center - truly centered nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          {/* Right - flex-1 + justify-end for equal width */}
          <div className="flex-1 flex items-center justify-end">
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
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
