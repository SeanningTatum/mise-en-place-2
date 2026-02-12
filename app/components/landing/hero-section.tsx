import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HandDrawnUnderline } from "@/components/ui/hand-drawn-underline";
import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

interface HeroSectionProps {
  /** Main headline - can include {underline:word} syntax to mark words for hand-drawn underline */
  headline: string;
  /** Optional italic first line */
  italicFirstLine?: string;
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
  /** Optional handwritten annotation text */
  annotation?: string;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
}

/**
 * Parses headline text and wraps words marked with {underline:word} in HandDrawnUnderline
 */
function parseHeadline(text: string): ReactNode[] {
  const parts = text.split(/(\{underline:[^}]+\})/);
  return parts.map((part, index) => {
    const match = part.match(/\{underline:([^}]+)\}/);
    if (match) {
      return (
        <HandDrawnUnderline key={index}>
          {match[1]}
        </HandDrawnUnderline>
      );
    }
    return part;
  });
}

export function HeroSection({
  headline,
  italicFirstLine,
  subheadline,
  primaryCta = { label: "Get Started", href: "/sign-up" },
  secondaryCta,
  badge,
  annotation,
  children,
  className,
  align = "center",
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-32",
        className
      )}
    >
      <div className="container relative mx-auto px-6 lg:px-12">
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
              align === "center" && !children && "mx-auto max-w-4xl items-center"
            )}
          >
            {badge && (
              <div className="animate-fade-slide-up">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium text-foreground">
                  {badge}
                </span>
              </div>
            )}

            {/* Massive serif headline */}
            <div className="animate-fade-slide-up-delay-100">
              {italicFirstLine && (
                <span className="block font-display text-3xl md:text-5xl lg:text-6xl italic text-foreground leading-[0.9] mb-1">
                  {italicFirstLine}
                </span>
              )}
              <h1 className="font-display text-5xl md:text-6xl lg:text-[96px] xl:text-[120px] tracking-tight text-balance leading-[0.85]">
                {parseHeadline(headline)}
              </h1>
            </div>

            <p className="animate-fade-slide-up-delay-200 max-w-[580px] text-base md:text-lg lg:text-xl text-muted-foreground text-balance leading-relaxed">
              {subheadline}
            </p>

            <div className="animate-fade-slide-up-delay-300 flex flex-wrap gap-3">
              <Button asChild size="pill-lg" className="shadow-warm-lg">
                <Link to={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              {secondaryCta && (
                <Button asChild variant="outline" size="pill-lg">
                  <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>

            {/* Handwritten annotation */}
            {annotation && (
              <div className="animate-fade-slide-up-delay-500 flex items-center gap-2 text-muted-foreground mt-2">
                <span className="font-handwritten text-2xl md:text-3xl">{annotation}</span>
                <ArrowDown className="size-4 animate-float" />
              </div>
            )}
          </div>

          {/* Visual slot */}
          {children && (
            <div className="animate-fade-slide-up-delay-300">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
