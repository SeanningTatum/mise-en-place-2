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
        "relative flex flex-col rounded-[32px] border p-8 lg:p-10 transition-all duration-500",
        highlighted
          ? "border-primary bg-card shadow-warm-lg scale-[1.02]"
          : "border-border/50 bg-card shadow-warm hover:border-accent",
        className
      )}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-5 py-2 text-[10px] uppercase tracking-[0.2em] font-medium text-primary-foreground">
            {badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h3 className="font-display text-2xl">{name}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <span className="font-display text-5xl lg:text-6xl">{price}</span>
        {period && (
          <span className="text-muted-foreground ml-1">/{period}</span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-10 flex-1 space-y-4">
        {features.map((feature, index) => (
          <li
            key={index}
            className={cn(
              "flex items-start gap-3",
              !feature.included && "text-muted-foreground/50"
            )}
          >
            <Check
              className={cn(
                "mt-0.5 size-5 shrink-0",
                feature.included ? "text-primary" : "text-muted-foreground/30"
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
        size="pill-lg"
        className={cn(
          "w-full",
          highlighted && "shadow-warm hover:scale-105 transition-transform"
        )}
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
    <section id="pricing" className={cn("py-24 lg:py-40", className)}>
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
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
          {children}
        </div>
      </div>
    </section>
  );
}
