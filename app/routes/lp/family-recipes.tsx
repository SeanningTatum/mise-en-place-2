import type { Route } from "./+types/family-recipes";
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
  BookOpen,
  Share2,
  Cloud,
  Camera,
  Heart,
  Users,
  Lock,
  History,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Preserve Family Recipes - Mise En Place" },
    {
      name: "description",
      content:
        "Digitize grandma's recipes before they're lost forever. Share your culinary heritage across generations. Never lose a recipe again.",
    },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  return {};
}

export default function FamilyRecipesLanding({}: Route.ComponentProps) {
  return (
    <div className="min-h-screen">
      <LandingNav />

      {/* Hero Section */}
      <HeroSection
        badge="Preserve your culinary heritage"
        headline="Grandma's recipes, safe forever."
        subheadline="Digitize your family's food story. Share across generations. Never lose a recipe to spills, moves, or time."
        primaryCta={{ label: "Preserve Your Recipes", href: "/sign-up" }}
        secondaryCta={{ label: "Learn More", href: "#why-preserve" }}
      >
        {/* Hero Visual - Recipe Card Transformation */}
        <div className="relative">
          {/* Old recipe card */}
          <div className="absolute -left-8 top-8 z-0 w-48 rotate-[-8deg] rounded-lg bg-amber-50 p-4 shadow-lg dark:bg-amber-100">
            <div className="mb-2 font-display text-sm font-semibold text-amber-900">
              Nana's Apple Pie
            </div>
            <div className="space-y-1 text-[10px] italic text-amber-800">
              <p>2 cups flour</p>
              <p>1 cup butter</p>
              <p>6-7 tart apples</p>
              <p className="text-amber-600">...more...</p>
            </div>
            {/* Stain effect */}
            <div className="absolute right-2 top-2 size-6 rounded-full bg-amber-200/60" />
          </div>

          {/* Digital recipe card */}
          <div className="relative z-10 ml-16 rounded-2xl border border-border/50 bg-card p-6 shadow-warm-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="mb-1 block text-xs text-muted-foreground">
                  From Grandma Eleanor
                </span>
                <h3 className="font-display text-xl font-semibold">
                  Nana's Apple Pie
                </h3>
              </div>
              <Heart className="size-5 text-primary" fill="currentColor" />
            </div>

            <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
              <span>Prep: 30 min</span>
              <span>Cook: 45 min</span>
              <span>Serves: 8</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="mb-2 font-medium">Ingredients</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>2 cups flour</li>
                  <li>1 cup butter</li>
                  <li>6-7 tart apples</li>
                  <li className="text-muted-foreground/60">+ 5 more</li>
                </ul>
              </div>
              <div>
                <div className="mb-2 font-medium">Instructions</div>
                <ol className="space-y-1 text-muted-foreground">
                  <li>1. Mix flour and butter</li>
                  <li>2. Slice apples thin</li>
                  <li>3. Layer in dish</li>
                  <li className="text-muted-foreground/60">+ 4 more</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Decorative arrow */}
          <div className="absolute left-28 top-1/2 z-20 -translate-y-1/2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-warm">
              <Sparkles className="size-5" />
            </div>
          </div>
        </div>
      </HeroSection>

      {/* Emotional Hook */}
      <section className="border-y border-border/40 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg italic text-muted-foreground">
              "Every family has a recipe that connects them to their past. A dish that
              tastes like childhood, like holidays, like home. Don't let those recipes
              disappear."
            </p>
          </div>
        </div>
      </section>

      {/* Why Preserve */}
      <section id="why-preserve" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Recipe cards don't last forever
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              But your family's food story can
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">Lost in moves</h3>
              <p className="text-sm text-muted-foreground">
                Recipe boxes get misplaced, left behind, or accidentally donated.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <span className="text-2xl">💧</span>
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">Damaged by time</h3>
              <p className="text-sm text-muted-foreground">
                Spills, stains, and fading ink make recipes harder to read each year.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <span className="text-2xl">🕊️</span>
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">Never written down</h3>
              <p className="text-sm text-muted-foreground">
                Some recipes only exist in someone's memory—and memories fade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border/40 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Preserve, organize, and share
            </h2>
          </div>

          <FeatureGrid columns={3}>
            <FeatureCard
              icon={<Camera className="size-6" />}
              title="Easy Digitization"
              description="Type recipes in or import from photos. We'll organize everything into a clean, searchable format."
            />
            <FeatureCard
              icon={<Cloud className="size-6" />}
              title="Secure Cloud Backup"
              description="Your recipes are safely stored in the cloud. No more worrying about losing physical cards."
            />
            <FeatureCard
              icon={<Share2 className="size-6" />}
              title="Family Sharing"
              description="Share your collection with children, siblings, or extended family. Everyone can access the recipes."
            />
            <FeatureCard
              icon={<History className="size-6" />}
              title="Recipe Stories"
              description="Add notes about where recipes came from, who made them best, and family memories."
            />
            <FeatureCard
              icon={<Lock className="size-6" />}
              title="Private by Default"
              description="Your family recipes stay private unless you choose to share them publicly."
            />
            <FeatureCard
              icon={<BookOpen className="size-6" />}
              title="Beautiful Organization"
              description="Organize by family member, occasion, or category. Find any recipe instantly."
            />
          </FeatureGrid>
        </div>
      </section>

      {/* Family Tree Visualization */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Share your culinary legacy
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Connect recipes across generations
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            {/* Family tree visualization */}
            <div className="flex flex-col items-center gap-8">
              {/* Grandparent level */}
              <div className="text-center">
                <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-secondary">
                  <span className="font-display text-xl font-semibold">GE</span>
                </div>
                <div className="font-medium">Grandma Eleanor</div>
                <div className="text-sm text-muted-foreground">42 recipes</div>
              </div>

              {/* Connector */}
              <div className="h-8 w-px bg-border" />

              {/* Parent level */}
              <div className="flex justify-center gap-16">
                {[
                  { name: "Mom (Sarah)", recipes: 28 },
                  { name: "Aunt Linda", recipes: 15 },
                  { name: "Uncle Mike", recipes: 8 },
                ].map((person) => (
                  <div key={person.name} className="text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-accent">
                      <span className="font-display text-sm font-semibold">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{person.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {person.recipes} recipes
                    </div>
                  </div>
                ))}
              </div>

              {/* Connector */}
              <div className="h-8 w-px bg-border" />

              {/* Current generation */}
              <div className="flex justify-center gap-12">
                {[
                  { name: "You", recipes: 65 },
                  { name: "Brother", recipes: 12 },
                  { name: "Cousin", recipes: 8 },
                ].map((person) => (
                  <div key={person.name} className="text-center">
                    <div
                      className={`mx-auto mb-2 flex size-12 items-center justify-center rounded-full ${
                        person.name === "You"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <span className="font-display text-sm font-semibold">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{person.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {person.recipes} recipes
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-12 text-center text-muted-foreground">
              Recipes flow down through generations—preserved forever, accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection
        headline="Preserving family food stories"
        className="bg-muted/30"
      >
        <TestimonialCard
          quote="After my grandmother passed, we found her recipe box. Now all her recipes are digitized and shared with the whole family. Her legacy lives on."
          author="Rebecca S."
          role="Family historian"
          rating={5}
        />
        <TestimonialCard
          quote="I spent a weekend typing in decades of family recipes. Now my kids can access them from anywhere, and they're backed up forever."
          author="Thomas H."
          role="Father of 4"
          rating={5}
        />
        <TestimonialCard
          quote="My aunt's famous pie recipe was almost lost when she moved. Now it's safely stored and the whole family can make it exactly the same way."
          author="Michelle K."
          role="Recipe keeper"
          rating={5}
        />
      </TestimonialSection>

      {/* CTA */}
      <CTASection
        headline="Don't let family recipes fade away"
        subheadline="Start preserving your culinary heritage today. Your future generations will thank you."
        primaryCta={{ label: "Start Preserving Free", href: "/sign-up" }}
        secondaryCta={{ label: "Back to Home", href: "/" }}
      />

      <LandingFooter />
    </div>
  );
}
