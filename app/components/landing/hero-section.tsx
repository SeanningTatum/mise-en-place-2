import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  badge?: string;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function HeroSection({
  headline,
  subheadline,
  primaryCta = { label: "Start Free", href: "/sign-up" },
  secondaryCta,
  badge,
  children,
  className,
  align = "center",
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-20 md:py-28 lg:py-32",
        className
      )}
    >
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 size-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div
          className={cn(
            "grid gap-12 lg:gap-16",
            children ? "lg:grid-cols-2 lg:items-center" : "lg:grid-cols-1",
            align === "center" && !children && "text-center"
          )}
        >
          {/* Content */}
          <div
            className={cn(
              "flex flex-col gap-6",
              align === "center" && !children && "mx-auto max-w-3xl items-center"
            )}
          >
            {badge && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  {badge}
                </span>
              </div>
            )}

            <h1 className="animate-in fade-in slide-in-from-bottom-4 font-display text-4xl font-semibold tracking-tight text-balance duration-500 delay-100 md:text-5xl lg:text-6xl">
              {headline}
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-4 max-w-xl text-lg text-muted-foreground text-balance duration-500 delay-200 md:text-xl">
              {subheadline}
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-wrap gap-4 duration-500 delay-300">
              <Button asChild size="lg" className="shadow-warm-lg">
                <Link to={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              {secondaryCta && (
                <Button asChild variant="outline" size="lg">
                  <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Visual slot */}
          {children && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
