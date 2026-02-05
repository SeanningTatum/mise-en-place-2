import { cn } from "@/lib/utils";

interface GrayscaleImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "4/5";
}

/**
 * An image that appears grayscale by default and reveals color on hover.
 * Creates an "archival" or "latent" feel until interaction.
 * 
 * Features:
 * - grayscale(100%) by default
 * - grayscale(0%) + scale(1.05) on hover
 * - 2000ms ease-out transition for a deliberate, organic feel
 */
export function GrayscaleImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = "video",
}: GrayscaleImageProps) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    "4/5": "aspect-[4/5]",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px]",
        aspectClasses[aspectRatio],
        containerClassName
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "size-full object-cover",
          "grayscale transition-all duration-[2000ms] ease-out",
          "group-hover:grayscale-0 group-hover:scale-105",
          className
        )}
      />
    </div>
  );
}

/**
 * Grayscale image with an overlay caption
 */
interface GrayscaleImageWithCaptionProps extends GrayscaleImageProps {
  label?: string;
  title?: string;
}

export function GrayscaleImageWithCaption({
  src,
  alt,
  label,
  title,
  className,
  containerClassName,
  aspectRatio = "video",
}: GrayscaleImageWithCaptionProps) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    "4/5": "aspect-[4/5]",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px]",
        aspectClasses[aspectRatio],
        containerClassName
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "size-full object-cover",
          "grayscale transition-all duration-[2000ms] ease-out",
          "group-hover:grayscale-0 group-hover:scale-105",
          className
        )}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Caption content */}
      {(label || title) && (
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          {/* Decorative line */}
          <div className="w-12 h-0.5 bg-accent mb-4" />
          
          {label && (
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/80 mb-2">
              {label}
            </span>
          )}
          
          {title && (
            <h3 className="font-display text-2xl md:text-4xl lg:text-5xl text-white italic leading-tight">
              {title}
            </h3>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Full-width hero image block with large radius and overlay
 */
interface HeroImageBlockProps {
  src: string;
  alt: string;
  label?: string;
  title?: string;
  className?: string;
}

export function HeroImageBlock({
  src,
  alt,
  label,
  title,
  className,
}: HeroImageBlockProps) {
  return (
    <section
      className={cn(
        "w-full px-6 md:px-12 lg:px-12",
        className
      )}
    >
      <div className="group relative overflow-hidden rounded-[64px] h-[80vh] min-h-[500px]">
        <img
          src={src}
          alt={alt}
          className="size-full object-cover grayscale transition-all duration-[2000ms] ease-out group-hover:grayscale-0 group-hover:scale-105"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Caption content */}
        {(label || title) && (
          <div className="absolute bottom-0 left-0 p-8 md:p-12 lg:p-16">
            {/* Decorative horizontal rule */}
            <div className="w-12 h-0.5 bg-accent mb-6" />
            
            {label && (
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/80 mb-3">
                {label}
              </span>
            )}
            
            {title && (
              <h2 className="font-display text-4xl md:text-5xl lg:text-7xl text-white italic leading-[0.9]">
                {title}
              </h2>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
