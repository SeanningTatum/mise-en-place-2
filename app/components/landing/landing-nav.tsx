import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface LandingNavProps {
  className?: string;
}

export function LandingNav({ className }: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/login", label: "Login" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full h-20 bg-background/80 backdrop-blur-md border-b border-border/30",
        className
      )}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary">
            <span className="font-display text-xl text-primary-foreground">
              M
            </span>
          </div>
          <span className="font-display text-xl tracking-tight">
            mise en place
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="pill" className="shadow-warm">
            <Link to="/sign-up">Get Started</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-[12px] p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border/30 bg-background/95 backdrop-blur-md md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-6 py-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="pill" className="w-full shadow-warm mt-4">
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
