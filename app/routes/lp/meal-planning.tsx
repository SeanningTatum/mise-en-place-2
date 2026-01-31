import type { Route } from "./+types/meal-planning";
import {
  LandingNav,
  LandingFooter,
  HeroSection,
  FeatureCard,
  FeatureGrid,
  TestimonialCard,
  TestimonialSection,
  CTASection,
} from "@/components/landing";
import {
  Calendar,
  ShoppingCart,
  Clock,
  Users,
  Repeat,
  Utensils,
  CheckCircle,
  ArrowRight,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Meal Planning Made Easy - Mise En Place" },
    {
      name: "description",
      content:
        "Plan your week in minutes. Generate one grocery list. Save 3 hours every week with smart meal planning.",
    },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  return {};
}

export default function MealPlanningLanding({}: Route.ComponentProps) {
  return (
    <div className="min-h-screen">
      <LandingNav />

      {/* Hero Section */}
      <HeroSection
        badge="Save 3+ hours every week"
        headline="What's for dinner? Finally answered."
        subheadline="Plan your week in minutes. Generate one grocery list. Reclaim your evenings from the daily 'what should we eat?' struggle."
        primaryCta={{ label: "Plan This Week Free", href: "/sign-up" }}
        secondaryCta={{ label: "See How It Works", href: "#how-it-works" }}
      >
        {/* Hero Visual - Calendar Grid */}
        <div className="relative">
          <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-warm-lg">
            {/* Calendar header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">This Week</h3>
              <span className="text-sm text-muted-foreground">Jan 27 - Feb 2</span>
            </div>

            {/* Mini calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Day cells with sample meals */}
              {[
                { meal: "Pasta", color: "bg-primary/20" },
                { meal: "Tacos", color: "bg-accent/50" },
                { meal: "Stir Fry", color: "bg-primary/20" },
                { meal: "Pizza", color: "bg-accent/50" },
                { meal: "Salmon", color: "bg-primary/20" },
                { meal: "Curry", color: "bg-accent/50" },
                { meal: "Soup", color: "bg-primary/20" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-2 text-center ${item.color}`}
                >
                  <div className="text-xs font-medium">{item.meal}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating grocery list */}
          <div className="absolute -bottom-8 -right-4 w-48 animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-border/50 bg-card p-4 shadow-warm delay-500 duration-500">
            <div className="mb-2 flex items-center gap-2">
              <ShoppingCart className="size-4 text-primary" />
              <span className="text-sm font-semibold">Grocery List</span>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="size-3 text-primary" />
                Chicken breast
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-3 text-primary" />
                Bell peppers
              </li>
              <li className="flex items-center gap-2">
                <div className="size-3 rounded-full border border-muted-foreground" />
                Coconut milk
              </li>
              <li className="text-muted-foreground/60">+ 12 more items</li>
            </ul>
          </div>
        </div>
      </HeroSection>

      {/* Pain Point Banner */}
      <section className="border-y border-border/40 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg text-muted-foreground">
              <span className="font-semibold text-foreground">
                "What's for dinner?"
              </span>{" "}
              The question that haunts every working parent. You're juggling schedules,
              dietary preferences, budgets, and the eternal mystery of what's actually
              in the fridge.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Plan once, eat well all week
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              15 minutes on Sunday saves hours throughout the week
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
            {/* Steps */}
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="mb-1 font-display text-lg font-semibold">
                    Drag recipes onto your calendar
                  </h3>
                  <p className="text-muted-foreground">
                    Assign meals to breakfast, lunch, dinner, and snack slots. Plan the
                    whole week in one view.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  2
                </div>
                <div>
                  <h3 className="mb-1 font-display text-lg font-semibold">
                    Generate your grocery list
                  </h3>
                  <p className="text-muted-foreground">
                    One click creates a consolidated shopping list. Items are
                    automatically categorized by store section.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  3
                </div>
                <div>
                  <h3 className="mb-1 font-display text-lg font-semibold">
                    Shop once, cook stress-free
                  </h3>
                  <p className="text-muted-foreground">
                    No more mid-week grocery runs. No more "I forgot the onion."
                    Everything you need, organized.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative rounded-2xl border border-border/50 bg-card p-6 shadow-warm-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-primary" />
                  <span className="font-display font-semibold">Weekly Planner</span>
                </div>
              </div>

              <div className="space-y-3">
                {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                  <div key={meal} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-muted-foreground">{meal}</span>
                    <div className="flex flex-1 gap-1">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-8 flex-1 rounded ${
                            Math.random() > 0.3
                              ? i % 2 === 0
                                ? "bg-primary/20"
                                : "bg-accent/50"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border/40 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Meal planning that works for busy families
            </h2>
          </div>

          <FeatureGrid columns={3}>
            <FeatureCard
              icon={<CalendarDays className="size-6" />}
              title="7-Day Meal Calendar"
              description="Visual weekly view with breakfast, lunch, dinner, and snack slots. Drag and drop to rearrange."
            />
            <FeatureCard
              icon={<ShoppingCart className="size-6" />}
              title="Smart Grocery Lists"
              description="Auto-generated from your meal plan. Items grouped by category for faster shopping."
            />
            <FeatureCard
              icon={<Repeat className="size-6" />}
              title="Repeat Favorites"
              description="Quickly reuse meals from previous weeks. Build a rotation of family favorites."
            />
            <FeatureCard
              icon={<Users className="size-6" />}
              title="Family Sharing"
              description="Everyone sees the plan. Kids can check what's for dinner without asking."
            />
            <FeatureCard
              icon={<ListChecks className="size-6" />}
              title="Recipe Scaling"
              description="Automatically adjust portions based on how many you're feeding."
            />
            <FeatureCard
              icon={<Clock className="size-6" />}
              title="Quick Add"
              description="Add meals quickly—'Taco Tuesday' without needing a full recipe."
            />
          </FeatureGrid>
        </div>
      </section>

      {/* Time Savings */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Get hours back every week
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="font-display text-5xl font-semibold text-primary">3+</div>
              <div className="mt-2 text-lg font-medium">Hours saved weekly</div>
              <p className="mt-1 text-sm text-muted-foreground">
                No more daily "what's for dinner?" stress
              </p>
            </div>
            <div className="text-center">
              <div className="font-display text-5xl font-semibold text-primary">1</div>
              <div className="mt-2 text-lg font-medium">Grocery trip</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Instead of 3-4 mid-week runs
              </p>
            </div>
            <div className="text-center">
              <div className="font-display text-5xl font-semibold text-primary">30%</div>
              <div className="mt-2 text-lg font-medium">Less food waste</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Buy only what you'll actually use
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection
        headline="Busy families love meal planning"
        className="bg-muted/30"
      >
        <TestimonialCard
          quote="I used to dread the 5pm 'what's for dinner?' panic. Now I spend 15 minutes on Sunday and the week is sorted. Life changing."
          author="Jennifer M."
          role="Working mom of 3"
          rating={5}
        />
        <TestimonialCard
          quote="The grocery list feature alone is worth it. I go to the store once, I get everything, no more forgotten ingredients."
          author="David L."
          role="Dad & home cook"
          rating={5}
        />
        <TestimonialCard
          quote="My kids can check the app to see what's for dinner instead of asking me 47 times. Small win, big impact."
          author="Amanda T."
          role="Busy parent"
          rating={5}
        />
      </TestimonialSection>

      {/* CTA */}
      <CTASection
        headline="Ready to bring calm to your kitchen?"
        subheadline="Start planning your week in minutes. Generate your first grocery list today."
        primaryCta={{ label: "Start Free Trial", href: "/sign-up" }}
        secondaryCta={{ label: "Back to Home", href: "/" }}
      />

      <LandingFooter />
    </div>
  );
}
