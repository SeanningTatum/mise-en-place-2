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
      <div className="mb-6 flex size-14 items-center justify-center rounded-sm border border-border bg-transparent text-foreground transition-all duration-500">
        {icon}
      </div>
      <h3 className="mb-3 font-display font-light text-xl">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      {href && (
        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary opacity-0 transition-all duration-500 group-hover:opacity-100">
          <span className="text-[10px] uppercase tracking-[0.2em]">Learn more</span>
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
          "group flex flex-col rounded-sm border border-border bg-card p-8 transition-all duration-500 hover:border-foreground",
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
        "group flex flex-col rounded-sm border border-border bg-card p-8",
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
        "grid gap-8",
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
