import { cn } from "@/lib/utils";

export function BackgroundGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0",
        className
      )}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-editorial-grid mask-radial-fade" />
      {/* Structural vertical dividers */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-border" />
      </div>
    </div>
  );
}
