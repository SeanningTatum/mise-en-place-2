import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
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
        "relative flex flex-col rounded-xl border-2 p-8",
        highlighted
          ? "border-primary bg-card shadow-soft-lg"
          : "border-border bg-card",
        className
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-6">
          <Badge variant="highlight">{badge}</Badge>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="font-display text-xl font-bold tracking-tight">{name}</h3>
        <p className="mt-1 font-body text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-6 pb-6 border-b border-border">
        <span className="font-display text-4xl font-extrabold tracking-tight">{price}</span>
        {period && (
          <span className="font-ui text-sm text-muted-foreground">/{period}</span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className={cn(
              "flex items-start gap-3 font-body text-sm",
              !feature.included && "text-muted-foreground/60"
            )}
          >
            {feature.included ? (
              <Check className="mt-0.5 size-4 shrink-0 text-sage" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
            )}
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        asChild
        variant={highlighted ? "default" : "outline"}
        size="lg"
        className={cn(highlighted && "shadow-soft-md")}
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
  headline = "Simple, honest pricing",
  subheadline,
  children,
  className,
}: PricingSectionProps) {
  return (
    <section id="pricing" className={cn("py-20", className)}>
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="label-section mb-3 block">
            Pricing
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
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}
