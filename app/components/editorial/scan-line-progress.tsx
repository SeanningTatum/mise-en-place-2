import { cn } from "@/lib/utils";

export function ScanLineProgress({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-0.5 w-full overflow-hidden bg-border",
        className
      )}
    >
      <div className="h-full w-1/3 animate-scan-line bg-info" />
    </div>
  );
}
