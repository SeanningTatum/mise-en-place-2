import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border border-border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-700 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a&]:hover:opacity-90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:opacity-90",
        destructive:
          "bg-destructive-background text-destructive-text border-destructive [a&]:hover:bg-destructive [a&]:hover:text-destructive-foreground",
        outline:
          "text-foreground bg-transparent [a&]:hover:bg-muted",
        accent:
          "bg-accent text-accent-foreground [a&]:hover:opacity-90",
        tertiary:
          "bg-tertiary text-tertiary-foreground [a&]:hover:opacity-90",
        quaternary:
          "bg-quaternary text-quaternary-foreground [a&]:hover:opacity-90",
        // Semantic status variants
        success:
          "bg-success-background text-success-text border-success [a&]:hover:bg-success [a&]:hover:text-success-foreground",
        warning:
          "bg-warning-background text-warning-text border-warning [a&]:hover:bg-warning [a&]:hover:text-warning-foreground",
        info:
          "bg-info-background text-info-text border-info [a&]:hover:bg-info [a&]:hover:text-info-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
