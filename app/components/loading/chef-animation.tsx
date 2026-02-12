import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChefAnimationProps {
  className?: string;
}

export function ChefAnimation({ className }: ChefAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        {/* Animated chef hat */}
        <div className="animate-bounce">
          <div className="p-6 rounded-full bg-primary/10 border border-primary/20">
            <ChefHat className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          <span
            className="h-2 w-2 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
