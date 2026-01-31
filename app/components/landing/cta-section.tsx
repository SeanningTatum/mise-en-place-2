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
  primaryCta = { label: "Start Free", href: "/sign-up" },
  secondaryCta,
  className,
}: CTASectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-20 md:py-28",
        className
      )}
    >
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5" />

      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-64 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              {subheadline}
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
      </div>
    </section>
  );
}
