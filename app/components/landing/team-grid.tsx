import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TeamMemberProps {
  name: string;
  role: string;
  image: string;
  className?: string;
}

/**
 * Individual team member card with grayscale-to-color hover effect.
 * Uses 4:5 aspect ratio with 24px border radius.
 */
export function TeamMember({
  name,
  role,
  image,
  className,
}: TeamMemberProps) {
  return (
    <div className={cn("group", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] mb-4">
        <img
          src={image}
          alt={name}
          className="size-full object-cover grayscale transition-all duration-[2000ms] ease-out group-hover:grayscale-0 group-hover:scale-105"
        />
      </div>
      <h3 className="font-display text-lg">{name}</h3>
      <p className="text-sm text-muted-foreground">{role}</p>
    </div>
  );
}

interface TeamGridProps {
  children: ReactNode;
  className?: string;
  /** Enable staggered layout with asymmetrical vertical alignment */
  staggered?: boolean;
}

/**
 * Staggered grid layout for team members.
 * Columns 2 and 4 are offset down by 48px for visual interest.
 */
export function TeamGrid({
  children,
  className,
  staggered = true,
}: TeamGridProps) {
  return (
    <div
      className={cn(
        "grid gap-8 md:grid-cols-2 lg:grid-cols-4",
        staggered && "[&>*:nth-child(2)]:mt-12 [&>*:nth-child(4)]:mt-12 [&>*:nth-child(6)]:mt-12 [&>*:nth-child(8)]:mt-12",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TeamSectionProps {
  headline?: string;
  subheadline?: string;
  children: ReactNode;
  className?: string;
}

export function TeamSection({
  headline = "Meet the team",
  subheadline,
  children,
  className,
}: TeamSectionProps) {
  return (
    <section className={cn("py-24 lg:py-40", className)}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
