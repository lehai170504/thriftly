import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex min-h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-1 text-xs font-semibold uppercase leading-none tracking-wide whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        brand: "bg-primary text-primary-foreground",
        info: "bg-info/15 text-info dark:bg-info/20",
        success: "bg-success/15 text-success dark:bg-success/20",
        warning: "bg-warning/20 text-warning-foreground dark:bg-warning/25",
        danger: "bg-destructive/15 text-destructive dark:bg-destructive/20",
        live: "bg-live text-live-foreground neon-glow",
      },
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground focus-visible:ring-destructive/20 [a]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

function Badge({
  className,
  tone,
  variant,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ tone, variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      tone,
      variant,
    },
  })
}

export { Badge, badgeVariants }
