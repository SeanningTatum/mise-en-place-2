import type { Route } from "./+types/home";
import {
  LandingNav,
  LandingFooter,
  HeroSection,
  FeatureCard,
  FeatureGrid,
  TestimonialCard,
  TestimonialSection,
  PricingCard,
  PricingSection,
  CTASection,
} from "@/components/landing";
import { Link } from "react-router";
import {
  Play,
  Calendar,
  ShoppingCart,
  Clock,
  Youtube,
  Users,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mise En Place - Recipe Management for Modern Home Cooks" },
    {
      name: "description",
      content:
        "AI-powered recipe extraction from YouTube with timestamps. Plan your week, generate grocery lists, and cook smarter. Free to start.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return {};
}

export default function Home({}: Route.ComponentProps) {
  return (
    <div className="min-h-screen">
      <LandingNav />

      {/* Hero Section */}
      <HeroSection
        badge="Now with YouTube timestamp extraction"
        headline="Stop pausing. Start cooking."
        subheadline="AI extracts recipes from YouTube with timestamps—so you can cook along without scrubbing back. Plus meal planning and smart grocery lists."
        primaryCta={{ label: "Start Free", href: "/sign-up" }}
        secondaryCta={{ label: "See How It Works", href: "#features" }}
      >
        {/* Hero Visual - Video Player Mockup */}
        <div className="relative">
          <div className="rounded-2xl border border-border/50 bg-card p-2 shadow-warm-lg">
            {/* Video player mockup */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80"
                alt="Cooking demonstration"
                className="size-full object-cover"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Play className="ml-1 size-6 text-primary" fill="currentColor" />
                </div>
              </div>
              {/* YouTube logo */}
              <div className="absolute bottom-4 right-4">
                <Youtube className="size-8 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Timestamp annotations */}
          <div className="absolute -right-4 top-8 animate-in fade-in slide-in-from-right-4 rounded-lg border border-primary/20 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-warm delay-500 duration-500">
            <span className="font-mono">2:34</span> Prep onions
          </div>
          <div className="absolute -right-8 top-24 animate-in fade-in slide-in-from-right-4 rounded-lg border border-primary/20 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-warm delay-700 duration-500">
            <span className="font-mono">5:12</span> Add garlic
          </div>
          <div className="absolute -right-4 top-40 animate-in fade-in slide-in-from-right-4 rounded-lg border border-primary/20 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-warm delay-900 duration-500">
            <span className="font-mono">8:45</span> Simmer sauce
          </div>
        </div>
      </HeroSection>

      {/* Problem Statement */}
      <section className="border-y border-border/40 bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
            <span className="font-semibold text-foreground">
              Your recipes are everywhere.
            </span>{" "}
            Bookmarked YouTube videos, screenshots, browser tabs, old recipe cards.
            It's a <span className="italic">chaotic mix</span> that makes cooking stressful
            instead of enjoyable.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to cook smarter
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for how people actually discover recipes today
            </p>
          </div>

          <FeatureGrid columns={3}>
            <FeatureCard
              icon={<Youtube className="size-6" />}
              title="Video Timestamp Extraction"
              description="Paste a YouTube URL and get a full recipe with clickable timestamps. Jump to any step without scrubbing through the video."
            />
            <FeatureCard
              icon={<Sparkles className="size-6" />}
              title="AI-Powered Import"
              description="Extract recipes from any source—blogs, Instagram, TikTok, or video. No more scrolling past life stories to find ingredients."
            />
            <FeatureCard
              icon={<Clock className="size-6" />}
              title="Cook-Along Mode"
              description="Step-by-step guidance with auto-starting timers synced to video timestamps. Focus on cooking, not your phone."
            />
            <FeatureCard
              icon={<Calendar className="size-6" />}
              title="Weekly Meal Planning"
              description="Drag recipes onto your calendar. Plan breakfast, lunch, dinner, and snacks for the whole week in minutes."
            />
            <FeatureCard
              icon={<ShoppingCart className="size-6" />}
              title="Smart Grocery Lists"
              description="Generate one consolidated shopping list from your meal plan. Items auto-categorized by store section."
            />
            <FeatureCard
              icon={<Users className="size-6" />}
              title="Share & Collaborate"
              description="Create a public profile to share your recipe collection. Import recipes from friends with one click."
            />
          </FeatureGrid>
        </div>
      </section>

      {/* ICP Sections */}
      <section className="border-y border-border/40 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Made for how you cook
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're a video recipe enthusiast, meal prep master, or family recipe keeper
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Video Recipes Card */}
            <Link
              to="/lp/video-recipes"
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-warm transition-all hover:border-primary/30 hover:shadow-warm-lg"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Youtube className="size-7" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                Video Recipe Lovers
              </h3>
              <p className="mb-4 text-muted-foreground">
                Finally, an app that works with YouTube. Extract timestamps, ingredients,
                and steps from your favorite cooking channels.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn more <ArrowRight className="size-4" />
              </span>
            </Link>

            {/* Meal Planning Card */}
            <Link
              to="/lp/meal-planning"
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-warm transition-all hover:border-primary/30 hover:shadow-warm-lg"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-accent/50 text-accent-foreground transition-colors group-hover:bg-accent">
                <Calendar className="size-7" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                Busy Meal Planners
              </h3>
              <p className="mb-4 text-muted-foreground">
                Answer "what's for dinner?" once a week. Plan meals, generate grocery lists,
                and reclaim your evenings.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn more <ArrowRight className="size-4" />
              </span>
            </Link>

            {/* Family Recipes Card */}
            <Link
              to="/lp/family-recipes"
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-warm transition-all hover:border-primary/30 hover:shadow-warm-lg"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <BookOpen className="size-7" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                Family Recipe Keepers
              </h3>
              <p className="mb-4 text-muted-foreground">
                Digitize grandma's recipes before they're lost forever. Share your
                culinary heritage across generations.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn more <ArrowRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection
        headline="Loved by home cooks"
        subheadline="Join thousands who've simplified their cooking routine"
      >
        <TestimonialCard
          quote="Finally, a recipe app that actually works with YouTube! I can save recipes from my favorite cooking channels and jump to any step while cooking."
          author="Sarah M."
          role="YouTube cooking enthusiast"
          rating={5}
        />
        <TestimonialCard
          quote="The meal planning feature has been a game-changer. I spend 15 minutes on Sunday planning the week, and the grocery list is ready to go."
          author="Michael T."
          role="Working parent"
          rating={5}
        />
        <TestimonialCard
          quote="I've been digitizing my grandmother's recipe cards. The whole family can access them now, and they're backed up forever."
          author="Elena R."
          role="Recipe archivist"
          rating={5}
        />
      </TestimonialSection>

      {/* Pricing */}
      <PricingSection
        headline="Free to start, powerful when you need it"
        subheadline="No subscription required for core features. Upgrade when you're ready."
        className="bg-muted/30"
      >
        <PricingCard
          name="Free"
          price="$0"
          description="Perfect for getting started"
          features={[
            { text: "Extract recipes from any URL", included: true },
            { text: "Save up to 50 recipes", included: true },
            { text: "Basic meal planning", included: true },
            { text: "Grocery list generation", included: true },
            { text: "Video timestamp extraction", included: false },
            { text: "AI recipe suggestions", included: false },
          ]}
          cta={{ label: "Get Started", href: "/sign-up" }}
        />
        <PricingCard
          name="Pro"
          price="$5"
          period="month"
          description="For serious home cooks"
          features={[
            { text: "Everything in Free", included: true },
            { text: "Unlimited recipes", included: true },
            { text: "Video timestamp extraction", included: true },
            { text: "AI recipe suggestions", included: true },
            { text: "Recipe scaling", included: true },
            { text: "Priority support", included: true },
          ]}
          cta={{ label: "Start Free Trial", href: "/sign-up" }}
          highlighted
          badge="Most Popular"
        />
        <PricingCard
          name="Family"
          price="$9"
          period="month"
          description="Share with your household"
          features={[
            { text: "Everything in Pro", included: true },
            { text: "Up to 5 family members", included: true },
            { text: "Shared recipe collections", included: true },
            { text: "Collaborative meal planning", included: true },
            { text: "Synced grocery lists", included: true },
            { text: "Family recipe sharing", included: true },
          ]}
          cta={{ label: "Start Free Trial", href: "/sign-up" }}
        />
      </PricingSection>

      {/* Final CTA */}
      <CTASection
        headline="Ready to simplify your cooking?"
        subheadline="Join thousands of home cooks who've organized their recipes, planned their meals, and rediscovered the joy of cooking."
        primaryCta={{ label: "Start Free Today", href: "/sign-up" }}
        secondaryCta={{ label: "See Pricing", href: "#pricing" }}
      />

      <LandingFooter />
    </div>
  );
}
