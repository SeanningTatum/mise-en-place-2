import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Page title (rendered as h1) */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Back navigation link */
  backTo?: {
    label: string;
    href: string;
  };
  /** Action buttons slot (right side) */
  actions?: React.ReactNode;
  /** Additional className for the container */
  className?: string;
}

/**
 * Consistent page header component with title, optional back navigation,
 * and action buttons slot.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="My Meals"
 *   subtitle="Manage your multi-course dining experiences"
 *   backTo={{ label: "Recipes", href: "/recipes" }}
 *   actions={
 *     <Button>
 *       <Plus className="h-4 w-4" />
 *       Plan a Meal
 *     </Button>
 *   }
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  backTo,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Top row: Back link + Actions */}
      {(backTo || actions) && (
        <div className="flex items-center justify-between gap-4">
          {backTo ? (
            <Link
              to={backTo.href}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-300 group font-medium"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span>{backTo.label}</span>
            </Link>
          ) : (
            <div />
          )}
          {actions && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
        </div>
      )}

      {/* Title + Subtitle */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[0.9]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mt-3 text-lg">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
