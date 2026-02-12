import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import type { ReactNode } from "react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-sm border border-border bg-card p-8",
        className
      )}
    >
      {/* Rating */}
      {rating > 0 && (
        <div className="flex gap-1">
          {Array.from({ length: rating }).map((_, i) => (
            <Star
              key={i}
              className="size-5 fill-accent text-accent"
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="flex-1 font-display text-xl italic leading-relaxed text-foreground">
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full bg-accent font-display text-lg text-accent-foreground">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-medium">{author}</div>
          {role && (
            <div className="text-sm text-muted-foreground">{role}</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TestimonialSectionProps {
  headline?: string;
  subheadline?: string;
  children: ReactNode;
  className?: string;
}

export function TestimonialSection({
  headline = "Loved by home cooks",
  subheadline,
  children,
  className,
}: TestimonialSectionProps) {
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}
