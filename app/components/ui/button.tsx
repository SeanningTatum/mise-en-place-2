import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide transition-all duration-700 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-border rounded-sm hover:opacity-90",
        destructive:
          "bg-destructive text-white border border-border rounded-sm hover:opacity-90",
        outline:
          "bg-transparent text-foreground border border-border rounded-sm hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground border border-border rounded-sm hover:opacity-90",
        ghost:
          "hover:bg-muted hover:text-foreground rounded-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-8 text-base has-[>svg]:px-6",
        xl: "h-14 px-10 text-lg has-[>svg]:px-7",
        pill: "h-10 rounded-sm px-6 has-[>svg]:px-4",
        "pill-lg": "h-12 rounded-sm px-8 text-base has-[>svg]:px-5",
        "pill-xl": "h-14 rounded-sm px-10 text-lg has-[>svg]:px-6",
        icon: "size-10 rounded-sm",
        "icon-xs": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-sm",
        "icon-lg": "size-11 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
