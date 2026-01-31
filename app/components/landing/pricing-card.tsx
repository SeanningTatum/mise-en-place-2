import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  cta: {
    label: string;
    href: string;
  };
  highlighted?: boolean;
  badge?: string;
  className?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted = false,
  badge,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-8",
        highlighted
          ? "border-primary bg-card shadow-warm-lg"
          : "border-border/50 bg-card shadow-warm",
        className
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
            {badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <span className="font-display text-4xl font-semibold">{price}</span>
        {period && (
          <span className="text-muted-foreground">/{period}</span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className={cn(
              "flex items-start gap-3 text-sm",
              !feature.included && "text-muted-foreground/60"
            )}
          >
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                feature.included ? "text-primary" : "text-muted-foreground/40"
              )}
            />
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        asChild
        variant={highlighted ? "default" : "outline"}
        size="lg"
        className={cn(highlighted && "shadow-warm")}
      >
        <Link to={cta.href}>{cta.label}</Link>
      </Button>
    </div>
  );
}

interface PricingSectionProps {
  headline?: string;
  subheadline?: string;
  children: ReactNode;
  className?: string;
}

export function PricingSection({
  headline = "Simple, transparent pricing",
  subheadline,
  children,
  className,
}: PricingSectionProps) {
  return (
    <section id="pricing" className={cn("py-20", className)}>
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-4 text-lg text-muted-foreground">
              {subheadline}
            </p>
          )}
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}
