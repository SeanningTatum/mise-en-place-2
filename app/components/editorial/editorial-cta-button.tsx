import { cn } from "@/lib/utils";

interface EditorialCtaButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function EditorialCtaButton({
  children,
  className,
  href,
  onClick,
}: EditorialCtaButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden",
    "rounded-sm bg-primary px-8 py-3",
    "text-sm font-semibold text-primary-foreground",
    "transition-all duration-700 ease-editorial",
    "hover:opacity-90",
    className
  );

  const overlay = (
    <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-700 ease-editorial group-hover:translate-y-0" />
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {overlay}
        <span className="relative z-10">{children}</span>
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {overlay}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
