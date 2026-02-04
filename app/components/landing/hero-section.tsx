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
  primaryCta = { label: "Get Started Free", href: "/sign-up" },
  secondaryCta,
  badge,
  children,
  className,
  align = "center",
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-16 md:py-24 lg:py-32",
        className
      )}
    >
      <div className="container relative mx-auto px-4">
        <div
          className={cn(
            "grid gap-12 lg:gap-16",
            children ? "lg:grid-cols-[1.1fr_1fr] lg:items-center" : "lg:grid-cols-1",
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 font-ui text-xs font-semibold text-primary">
                  {badge}
                </span>
              </div>
            )}

            <h1 className="animate-in fade-in slide-in-from-bottom-4 font-display text-4xl font-extrabold tracking-tight text-balance duration-300 delay-75 md:text-5xl lg:text-6xl xl:text-7xl">
              {headline}
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl font-body text-lg text-muted-foreground text-balance duration-300 delay-150 md:text-xl leading-relaxed">
              {subheadline}
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-wrap gap-3 duration-300 delay-200">
              <Button asChild size="lg" className="shadow-soft-md">
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
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 delay-200">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Simple intro paragraph component (non-editorial)
export function IntroText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-body text-lg leading-relaxed text-foreground md:text-xl",
        className
      )}
    >
      {children}
    </p>
  );
}

// Renamed export for backwards compatibility
export const EditorialIntro = IntroText;
