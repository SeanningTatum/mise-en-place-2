import { Link } from "react-router";
import { cn } from "@/lib/utils";

interface LandingFooterProps {
  className?: string;
}

export function LandingFooter({ className }: LandingFooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: "#features", label: "Features" },
      { href: "#pricing", label: "Pricing" },
      { href: "/lp/video-recipes", label: "Video Recipes" },
      { href: "/lp/meal-planning", label: "Meal Planning" },
      { href: "/lp/family-recipes", label: "Family Recipes" },
    ],
    company: [
      { href: "#", label: "About" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Contact" },
    ],
    legal: [
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Terms of Service" },
    ],
  };

  return (
    <footer
      className={cn("border-t border-border/40 bg-muted/30", className)}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-lg font-semibold text-primary-foreground">
                  M
                </span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                mise en place
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The recipe app for how people actually discover recipes today.
              Extract from YouTube, plan your week, shop smarter.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Mise En Place. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care for home cooks everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
