import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";

interface GalleryCardProps {
  image: string;
  title: string;
  phase?: string;
  className?: string;
}

/**
 * Individual gallery card with 16:10 aspect ratio,
 * glassmorphism phase tag, and serif title.
 */
export function GalleryCard({
  image,
  title,
  phase,
  className,
}: GalleryCardProps) {
  return (
    <div
      className={cn(
        "group relative flex-shrink-0 w-[300px] md:w-[400px] lg:w-[500px]",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
        <img
          src={image}
          alt={title}
          className="size-full object-cover grayscale transition-all duration-[2000ms] ease-out group-hover:grayscale-0 group-hover:scale-105"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Phase tag - glassmorphism style */}
        {phase && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-white border border-white/20">
              {phase}
            </span>
          </div>
        )}
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="font-display text-2xl md:text-3xl text-white leading-tight">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}

interface HorizontalGalleryProps {
  children: ReactNode;
  className?: string;
}

/**
 * Horizontal scrolling gallery with navigation arrows
 * and gradient edge masks.
 */
export function HorizontalGallery({
  children,
  className,
}: HorizontalGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>

      {/* Left gradient mask */}
      <div className="absolute left-0 top-0 bottom-4 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      
      {/* Right gradient mask */}
      <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      {/* Navigation buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300"
        aria-label="Scroll left"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300"
        aria-label="Scroll right"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

interface GallerySectionProps {
  headline?: string;
  subheadline?: string;
  children: ReactNode;
  className?: string;
}

export function GallerySection({
  headline = "Our process",
  subheadline,
  children,
  className,
}: GallerySectionProps) {
  return (
    <section className={cn("py-24 lg:py-40", className)}>
      <div className="container mx-auto px-6 lg:px-12 mb-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
              {headline}
            </h2>
            {subheadline && (
              <p className="mt-4 text-lg text-muted-foreground max-w-xl">
                {subheadline}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 lg:px-12">
        {children}
      </div>
    </section>
  );
}
