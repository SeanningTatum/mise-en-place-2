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
      className={cn("bg-secondary", className)}
    >
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Top section - Logo and tagline */}
        <div className="mb-16">
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="flex size-12 items-center justify-center rounded-[14px] bg-primary">
              <span className="font-display text-2xl text-primary-foreground">
                M
              </span>
            </div>
            <span className="font-display text-2xl tracking-tight">
              mise en place
            </span>
          </Link>
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            The recipe app for how people actually discover recipes today.
            Extract from YouTube, plan your week, shop smarter.
          </p>
        </div>

        {/* Links grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {/* Product Links */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground mb-6">
              Product
            </h3>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground mb-6">
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-foreground mb-6">
              Legal
            </h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              &copy; {currentYear} Mise En Place. All rights reserved.
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Made with care for home cooks everywhere.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
