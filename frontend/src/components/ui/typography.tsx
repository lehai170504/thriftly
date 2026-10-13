import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { formatDateTime, formatEntityId, formatMoney, formatNumber } from "@/lib/formatters";

const headingVariants = cva("font-ui font-semibold tracking-tight text-foreground", {
  variants: {
    size: {
      display: "text-4xl leading-tight md:text-5xl",
      h1: "text-3xl leading-tight md:text-4xl",
      h2: "text-2xl leading-tight md:text-3xl",
      h3: "text-xl leading-7 md:text-2xl",
    },
  },
  defaultVariants: { size: "h2" },
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & { as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" };

function Heading({ as: Tag = "h2", size, className, ...props }: HeadingProps) {
  return <Tag className={cn(headingVariants({ size }), className)} {...props} />;
}

function Money({ value, currency = "VND", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { value: number | string | null | undefined; currency?: string }) {
  return <span className={cn("font-numeric font-semibold", className)} {...props}>{formatMoney(value, currency)}</span>;
}

function NumberText({ value, options, className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { value: number | string | null | undefined; options?: Intl.NumberFormatOptions }) {
  return <span className={cn("font-numeric", className)} {...props}>{formatNumber(value, options)}</span>;
}

function DateTime({ value, options, className, ...props }: React.HTMLAttributes<HTMLTimeElement> & { value: Date | string | number | null | undefined; options?: Intl.DateTimeFormatOptions }) {
  const parsedDate = value ? new Date(value) : null;
  const dateTime = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : undefined;
  return <time dateTime={dateTime} className={cn("font-numeric", className)} {...props}>{formatDateTime(value, options)}</time>;
}

function EntityId({ value, visibleLength, className, ...props }: React.HTMLAttributes<HTMLElement> & { value: string | null | undefined; visibleLength?: number }) {
  return <code title={value ?? undefined} className={cn("font-mono text-sm font-medium", className)} {...props}>{formatEntityId(value, visibleLength)}</code>;
}

export { DateTime, EntityId, Heading, Money, NumberText, headingVariants };
