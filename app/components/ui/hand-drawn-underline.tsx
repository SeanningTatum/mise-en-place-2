import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HandDrawnUnderlineProps {
  children: ReactNode;
  className?: string;
  underlineClassName?: string;
}

/**
 * Wraps text with a hand-drawn SVG underline stroke.
 * The underline is positioned absolutely below the text content.
 */
export function HandDrawnUnderline({
  children,
  className,
  underlineClassName,
}: HandDrawnUnderlineProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        className={cn(
          "absolute -bottom-2 left-0 w-full h-3 pointer-events-none",
          underlineClassName
        )}
        viewBox="0 0 300 12"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 8C50 9.5 100 -2 298 4"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-accent"
        />
      </svg>
    </span>
  );
}

/**
 * Alternative underline with a more wavy pattern
 */
export function HandDrawnUnderlineWavy({
  children,
  className,
  underlineClassName,
}: HandDrawnUnderlineProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        className={cn(
          "absolute -bottom-2 left-0 w-full h-4 pointer-events-none",
          underlineClassName
        )}
        viewBox="0 0 300 16"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 8C30 4 60 12 90 8C120 4 150 12 180 8C210 4 240 12 270 8C280 6 290 7 298 8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-accent"
        />
      </svg>
    </span>
  );
}
