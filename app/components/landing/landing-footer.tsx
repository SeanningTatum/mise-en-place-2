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
      className={cn("border-t border-border bg-muted/30", className)}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Main grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-lg font-bold text-primary-foreground">
                  M
                </span>
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                mise en place
              </span>
            </Link>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Your kitchen companion for saving, planning, and cooking recipes from anywhere.
            </p>
            <p className="mt-3 font-body text-sm italic text-muted-foreground">
              "Everything in its place"
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-ui text-sm font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-ui text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-ui text-sm font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-ui text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-ui text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-ui text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="font-ui text-sm text-muted-foreground">
            &copy; {currentYear} Mise En Place. All rights reserved.
          </p>
          <p className="font-ui text-sm text-muted-foreground">
            Made with care for home cooks everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
