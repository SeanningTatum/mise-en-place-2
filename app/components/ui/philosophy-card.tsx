import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PhilosophyCardProps {
  icon: ReactNode;
  quote: string;
  className?: string;
}

/**
 * A feature card that inverts its theme on hover.
 * Initial: sage background, charcoal text
 * Hover: charcoal background, white text
 * Includes a top-left icon and bottom-aligned serif quote.
 */
export function PhilosophyCard({
  icon,
  quote,
  className,
}: PhilosophyCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-8 rounded-sm min-h-[280px]",
        "bg-accent text-accent-foreground",
        "hover:bg-primary hover:text-primary-foreground",
        "transition-all duration-500 ease-out",
        "cursor-pointer",
        className
      )}
    >
      {/* Icon - top left */}
      <div className="flex items-center justify-center size-12 rounded-sm bg-foreground/10 group-hover:bg-white/10 transition-colors duration-500">
        {icon}
      </div>

      {/* Quote - bottom aligned */}
      <blockquote className="font-display text-xl md:text-2xl leading-snug mt-auto pt-8">
        "{quote}"
      </blockquote>
    </div>
  );
}

/**
 * Alternative philosophy card with attribution
 */
interface PhilosophyCardWithAuthorProps extends PhilosophyCardProps {
  author?: string;
  role?: string;
}

export function PhilosophyCardWithAuthor({
  icon,
  quote,
  author,
  role,
  className,
}: PhilosophyCardWithAuthorProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-8 rounded-sm min-h-[320px]",
        "bg-accent text-accent-foreground",
        "hover:bg-primary hover:text-primary-foreground",
        "transition-all duration-500 ease-out",
        "cursor-pointer",
        className
      )}
    >
      {/* Icon - top left */}
      <div className="flex items-center justify-center size-12 rounded-sm bg-foreground/10 group-hover:bg-white/10 transition-colors duration-500">
        {icon}
      </div>

      {/* Quote and author - bottom aligned */}
      <div className="mt-auto pt-8">
        <blockquote className="font-display text-xl md:text-2xl leading-snug">
          "{quote}"
        </blockquote>
        {(author || role) && (
          <div className="mt-4 pt-4 border-t border-current/20">
            {author && (
              <p className="font-medium text-sm">{author}</p>
            )}
            {role && (
              <p className="text-sm opacity-70">{role}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
