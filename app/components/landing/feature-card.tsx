import { Link } from "react-router";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  className,
}: FeatureCardProps) {
  const content = (
    <>
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {href && (
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Learn more
          <ArrowRight className="size-4" />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={cn(
          "group flex flex-col rounded-2xl border border-border/50 bg-card p-6 shadow-warm transition-all hover:border-primary/30 hover:shadow-warm-lg",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border border-border/50 bg-card p-6 shadow-warm",
        className
      )}
    >
      {content}
    </div>
  );
}

interface FeatureGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function FeatureGrid({
  children,
  className,
  columns = 3,
}: FeatureGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "md:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
