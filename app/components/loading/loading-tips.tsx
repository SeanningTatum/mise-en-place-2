import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKING_TIPS = [
  "Our AI accounts for rest time for meats, so your lamb will be perfectly rested before serving.",
  "The timeline considers oven temperature conflicts—if two dishes need different temps, we'll sequence them smartly.",
  "Prep tasks that can be done hours ahead are scheduled early, giving you a relaxed cooking day.",
  "Buffer time is built in between courses for plated service, so you're never rushed.",
  "Dishes that can hold their temperature are scheduled to finish first, keeping hot food hot.",
  "The AI considers parallel cooking—multiple stovetop items are timed to share your attention evenly.",
];

interface LoadingTipsProps {
  className?: string;
  interval?: number;
}

export function LoadingTips({
  className,
  interval = 5000,
}: LoadingTipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % COOKING_TIPS.length);
        setIsAnimating(false);
      }, 200);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg bg-muted/50 border border-border p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-full bg-accent/20">
          <Lightbulb className="h-4 w-4 text-accent-foreground" />
        </div>
        <div className="flex-1 min-h-[3rem]">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Did you know?
          </p>
          <p
            className={cn(
              "text-sm text-foreground transition-opacity duration-200",
              isAnimating ? "opacity-0" : "opacity-100"
            )}
          >
            {COOKING_TIPS[currentTipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
