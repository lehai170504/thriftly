import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-wait [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-surface hover:bg-primary/90 hover:shadow-elevated",
        default: "bg-primary text-primary-foreground shadow-surface hover:bg-primary/90 hover:shadow-elevated",
        outline:
          "border-border bg-transparent hover:bg-foreground/5 hover:text-foreground dark:border-border dark:hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-foreground/5 hover:text-foreground dark:hover:bg-accent hover:text-accent-foreground",
        glass: "glass text-foreground shadow-surface hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-surface hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        md: "h-11 px-5",
        xs: "h-8 px-3 text-xs",
        sm: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
        "icon-xs": "size-8",
        "icon-sm": "size-10",
        "icon-lg": "size-12",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "md",
  shape = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" className="animate-spin" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
