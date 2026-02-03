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
    <div className={cn("space-y-4", className)}>
      {/* Top row: Back link + Actions */}
      {(backTo || actions) && (
        <div className="flex items-center justify-between gap-4">
          {backTo ? (
            <Link
              to={backTo.href}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>{backTo.label}</span>
            </Link>
          ) : (
            <div />
          )}
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}

      {/* Title + Subtitle */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
