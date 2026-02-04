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
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-6",
        className
      )}
    >
      {/* Rating */}
      {rating > 0 && (
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <Star
              key={i}
              className="size-4 fill-amber-400 text-amber-400"
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="flex-1 font-body text-base text-foreground leading-relaxed">
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-ui text-sm font-semibold text-foreground">{author}</div>
          {role && (
            <div className="font-ui text-xs text-muted-foreground">{role}</div>
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
  headline = "Loved by Home Cooks",
  subheadline,
  children,
  className,
}: TestimonialSectionProps) {
  return (
    <section className={cn("py-20", className)}>
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="label-section mb-3 block">
            Testimonials
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-4 font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}
