import { cn } from "@/lib/utils";

interface EditorialEmphasisProps {
  children: React.ReactNode;
  className?: string;
  variant?: "italic" | "underline";
}

export function EditorialEmphasis({
  children,
  className,
  variant = "italic",
}: EditorialEmphasisProps) {
  if (variant === "underline") {
    return (
      <span
        className={cn(
          "underline decoration-primary decoration-1 underline-offset-4",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <em
      className={cn(
        "font-display not-italic font-light italic",
        className
      )}
    >
      {children}
    </em>
  );
}
