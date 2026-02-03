import { cn } from "@/lib/utils";

interface GenerationProgressBarProps {
  progress: number;
  className?: string;
}

export function GenerationProgressBar({
  progress,
  className,
}: GenerationProgressBarProps) {
  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground text-center">
        {progress}%
      </p>
    </div>
  );
}
