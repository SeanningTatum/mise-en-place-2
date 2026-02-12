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
import { HeroImageBlock } from "@/components/ui/grayscale-image";
import { Link, redirect } from "react-router";
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
import { BackgroundGrid } from "@/components/editorial";

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

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    return redirect("/recipes");
  }

  return {};
}

export default function Home({}: Route.ComponentProps) {
  return (
    <div className="min-h-screen">
      <BackgroundGrid />
      <LandingNav />

      {/* Hero Section */}
      <HeroSection
        badge="Now with YouTube timestamp extraction"
        italicFirstLine="Stop pausing."
        headline="Start {underline:cooking}."
        subheadline="AI extracts recipes from YouTube with timestamps—so you can cook along without scrubbing back. Plus meal planning and smart grocery lists."
        primaryCta={{ label: "Start Free", href: "/sign-up" }}
        secondaryCta={{ label: "See How It Works", href: "#features" }}
        annotation="scroll to explore"
      >
        {/* Hero Visual - Video Player Mockup */}
        <div className="relative">
          <div className="rounded-sm border border-border/30 bg-card p-3">
            {/* Video player mockup */}
            <div className="relative aspect-video overflow-hidden rounded-sm bg-muted">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80"
                alt="Cooking demonstration"
                className="size-full object-cover grayscale transition-all duration-[2000ms] hover:grayscale-0"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex size-20 items-center justify-center rounded-full bg-white/90 transition-transform duration-500">
                  <Play className="ml-1 size-8 text-primary" fill="currentColor" />
                </div>
              </div>
              {/* YouTube logo */}
              <div className="absolute bottom-6 right-6">
                <Youtube className="size-10 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Timestamp annotations */}
          <div className="absolute -right-4 top-8 animate-fade-slide-up-delay-500 rounded-sm border border-accent/30 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
            <span className="font-mono">2:34</span> Prep onions
          </div>
          <div className="absolute -right-8 top-28 animate-fade-slide-up rounded-sm border border-accent/30 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground" style={{ animationDelay: "0.7s" }}>
            <span className="font-mono">5:12</span> Add garlic
          </div>
          <div className="absolute -right-4 top-48 animate-fade-slide-up rounded-sm border border-accent/30 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground" style={{ animationDelay: "0.9s" }}>
            <span className="font-mono">8:45</span> Simmer sauce
          </div>
        </div>
      </HeroSection>

      {/* Hero Image Block */}
      <HeroImageBlock
        src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1600&auto=format&fit=crop&q=80"
        alt="Fresh ingredients on a cutting board"
        label="Our Philosophy"
        title="Cook with intention"
      />

      {/* Problem Statement - with 160px spacing */}
      <section className="py-40 px-6 lg:px-12">
        <div className="container mx-auto text-center">
          <p className="mx-auto max-w-4xl text-2xl md:text-3xl lg:text-4xl text-foreground leading-relaxed font-display">
            Your recipes are{" "}
            <span className="italic">everywhere</span>.{" "}
            Bookmarked YouTube videos, screenshots, browser tabs, old recipe cards.
            It's a chaotic mix that makes cooking{" "}
            <span className="text-muted-foreground">stressful instead of enjoyable</span>.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-40">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
              Everything you need to cook smarter
            </h2>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
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
      <section className="py-24 lg:py-40 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
              Made for how you cook
            </h2>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a video recipe enthusiast, meal prep master, or family recipe keeper
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Video Recipes Card */}
            <Link
              to="/lp/video-recipes"
              className="group relative overflow-hidden rounded-sm border border-border bg-card p-8 lg:p-10 transition-all duration-500 hover:border-foreground"
            >
              <div className="mb-8 flex size-16 items-center justify-center rounded-sm border border-border bg-transparent text-foreground transition-all duration-500">
                <Youtube className="size-8" />
              </div>
              <h3 className="mb-3 font-display text-2xl">
                Video Recipe Lovers
              </h3>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Finally, an app that works with YouTube. Extract timestamps, ingredients,
                and steps from your favorite cooking channels.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-primary">
                Learn more <ArrowRight className="size-4" />
              </span>
            </Link>

            {/* Meal Planning Card */}
            <Link
              to="/lp/meal-planning"
              className="group relative overflow-hidden rounded-sm border border-border bg-card p-8 lg:p-10 transition-all duration-500 hover:border-foreground"
            >
              <div className="mb-8 flex size-16 items-center justify-center rounded-sm border border-border bg-transparent text-foreground transition-all duration-500">
                <Calendar className="size-8" />
              </div>
              <h3 className="mb-3 font-display text-2xl">
                Busy Meal Planners
              </h3>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Answer "what's for dinner?" once a week. Plan meals, generate grocery lists,
                and reclaim your evenings.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-primary">
                Learn more <ArrowRight className="size-4" />
              </span>
            </Link>

            {/* Family Recipes Card */}
            <Link
              to="/lp/family-recipes"
              className="group relative overflow-hidden rounded-sm border border-border bg-card p-8 lg:p-10 transition-all duration-500 hover:border-foreground"
            >
              <div className="mb-8 flex size-16 items-center justify-center rounded-sm border border-border bg-transparent text-foreground transition-all duration-500">
                <BookOpen className="size-8" />
              </div>
              <h3 className="mb-3 font-display text-2xl">
                Family Recipe Keepers
              </h3>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Digitize grandma's recipes before they're lost forever. Share your
                culinary heritage across generations.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-primary">
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
        className="border-t border-border"
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
        headline="Ready to evolve?"
        subheadline="Join thousands of home cooks who've organized their recipes, planned their meals, and rediscovered the joy of cooking."
        primaryCta={{ label: "Start Free Today", href: "/sign-up" }}
        secondaryCta={{ label: "See Pricing", href: "#pricing" }}
      />

      <LandingFooter />
    </div>
  );
}
