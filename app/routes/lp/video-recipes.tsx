import type { Route } from "./+types/video-recipes";
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
  Play,
  Clock,
  Youtube,
  Sparkles,
  Instagram,
  ListChecks,
  Bookmark,
  Timer,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Video Recipe Extraction - Mise En Place" },
    {
      name: "description",
      content:
        "Extract recipes from YouTube with timestamps. Finally, a recipe app that works with video. Cook along without scrubbing back.",
    },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  return {};
}

export default function VideoRecipesLanding({}: Route.ComponentProps) {
  return (
    <div className="min-h-screen">
      <LandingNav />

      {/* Hero Section */}
      <HeroSection
        badge="Works with YouTube, TikTok & Instagram"
        headline="Stop pausing. Start cooking."
        subheadline="AI extracts recipes from YouTube with timestamps—so you can cook along without scrubbing back. The first recipe app built for how you actually discover recipes."
        primaryCta={{ label: "Start Free", href: "/sign-up" }}
        secondaryCta={{ label: "See It In Action", href: "#how-it-works" }}
      >
        {/* Hero Visual - Video Player with Timestamps */}
        <div className="relative">
          <div className="rounded-2xl border border-border/50 bg-card p-2 shadow-warm-lg">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80"
                alt="Cooking demonstration"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Play className="ml-1 size-6 text-primary" fill="currentColor" />
                </div>
              </div>
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

      {/* Social Proof Banner */}
      <section className="border-y border-border/40 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐⭐⭐⭐⭐</span>
              <span className="text-sm text-muted-foreground">
                "Finally works with YouTube!"
              </span>
            </div>
            <div className="hidden h-6 w-px bg-border md:block" />
            <div className="flex items-center gap-4">
              <Youtube className="size-6 text-muted-foreground" />
              <Instagram className="size-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Import from any video platform
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Existing recipe apps don't understand video
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              You discover recipes on YouTube and TikTok. You save them. But when it's time
              to cook, you're scrubbing through a 15-minute video trying to find the
              ingredient amounts. Or worse—your phone times out while your hands are covered
              in flour.
            </p>
            <p className="mt-4 text-lg font-medium text-foreground">
              Mise en place extracts everything you need, with timestamps you can actually
              use while cooking.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y border-border/40 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From URL to organized recipe in seconds
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-warm">
                <span className="font-display text-2xl font-semibold">1</span>
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">Paste a URL</h3>
              <p className="text-sm text-muted-foreground">
                Copy any YouTube, TikTok, or Instagram video link and paste it into
                Mise en place.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-warm">
                <span className="font-display text-2xl font-semibold">2</span>
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">AI extracts the recipe</h3>
              <p className="text-sm text-muted-foreground">
                Our AI watches the video and extracts ingredients, steps, and timestamps
                for each technique.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-warm">
                <span className="font-display text-2xl font-semibold">3</span>
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">Cook along with timestamps</h3>
              <p className="text-sm text-muted-foreground">
                Click any step to jump to that exact moment in the video. No more
                scrubbing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Built for video recipe lovers
            </h2>
          </div>

          <FeatureGrid columns={3}>
            <FeatureCard
              icon={<Youtube className="size-6" />}
              title="YouTube Timestamp Extraction"
              description="Every step links to the exact moment in the video. Click to jump directly to that technique."
            />
            <FeatureCard
              icon={<Instagram className="size-6" />}
              title="Multi-Platform Support"
              description="Works with YouTube, TikTok, Instagram Reels, and any other video platform."
            />
            <FeatureCard
              icon={<Sparkles className="size-6" />}
              title="Smart Ingredient Detection"
              description="AI identifies ingredients even when the creator doesn't list them explicitly."
            />
            <FeatureCard
              icon={<Timer className="size-6" />}
              title="Auto-Starting Timers"
              description="Timers auto-start when you reach time-sensitive steps. No more burnt garlic."
            />
            <FeatureCard
              icon={<ListChecks className="size-6" />}
              title="Clean Recipe Format"
              description="No ads, no life stories, no popups. Just the recipe, organized for cooking."
            />
            <FeatureCard
              icon={<Bookmark className="size-6" />}
              title="Save Your Favorites"
              description="Build your personal collection of video recipes from all your favorite creators."
            />
          </FeatureGrid>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection
        headline="Finally, a recipe app that gets it"
        className="bg-muted/30"
      >
        <TestimonialCard
          quote="I watch Joshua Weissman and Kenji Lopez-Alt constantly. Now I can actually use their recipes without pausing every 10 seconds."
          author="Marcus K."
          role="YouTube cooking enthusiast"
          rating={5}
        />
        <TestimonialCard
          quote="The timestamp feature is incredible. I saved a pasta recipe and each step links to the exact moment in the video. Game changer."
          author="Lisa W."
          role="Home cook"
          rating={5}
        />
        <TestimonialCard
          quote="I was using a notes app to write down ingredients from TikTok videos. This is so much better—it just extracts everything automatically."
          author="Jordan P."
          role="Recipe collector"
          rating={5}
        />
      </TestimonialSection>

      {/* Comparison */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Why video recipes need different tools
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Other apps */}
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
              <h3 className="mb-4 font-display text-lg font-semibold text-destructive">
                Other recipe apps
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-destructive">✗</span>
                  Only work with text-based recipe websites
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-destructive">✗</span>
                  Save a link but lose all the details
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-destructive">✗</span>
                  No timestamps—scrub through videos manually
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-destructive">✗</span>
                  Can't extract from TikTok or Instagram
                </li>
              </ul>
            </div>

            {/* Mise en place */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8">
              <h3 className="mb-4 font-display text-lg font-semibold text-primary">
                Mise en place
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">✓</span>
                  Built specifically for video content
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">✓</span>
                  Extracts full recipe with ingredients and steps
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">✓</span>
                  Clickable timestamps for every technique
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">✓</span>
                  Works with YouTube, TikTok, Instagram, and more
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        headline="Stop scrubbing. Start cooking."
        subheadline="Join thousands of video recipe lovers who've found a better way to save and use their favorite cooking content."
        primaryCta={{ label: "Start Free", href: "/sign-up" }}
        secondaryCta={{ label: "Back to Home", href: "/" }}
      />

      <LandingFooter />
    </div>
  );
}
