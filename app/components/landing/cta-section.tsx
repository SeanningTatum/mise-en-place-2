import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  headline: string;
  subheadline?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function CTASection({
  headline,
  subheadline,
  primaryCta = { label: "Get Started", href: "/sign-up" },
  secondaryCta,
  className,
}: CTASectionProps) {
  return (
    <section
      className={cn(
        "relative py-24 md:py-32 lg:py-40 px-6 lg:px-12",
        className
      )}
    >
      <div className="container relative mx-auto">
        {/* Centered card with sage background */}
        <div className="relative mx-auto max-w-4xl border-t border-b border-border py-16 md:py-24 lg:py-32">
          <div className="relative text-center">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground leading-[0.9]">
              {headline}
            </h2>
            {subheadline && (
              <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                {subheadline}
              </p>
            )}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="pill-xl"
                className="bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300"
              >
                <Link to={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              {secondaryCta && (
                <Button
                  asChild
                  variant="outline"
                  size="pill-lg"
                  className="border-foreground/30 text-foreground hover:bg-foreground/10"
                >
                  <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
