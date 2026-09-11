import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface text-ink-muted border border-border",
        accent: "bg-accent-tint text-accent-ink border border-accent-tint-border",
        success: "bg-success-tint text-success border border-success/20",
        warning: "bg-warning-tint text-warning border border-warning/20",
        danger: "bg-danger-tint text-danger border border-danger/20",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "danger" && "bg-danger",
            variant === "accent" && "bg-accent",
            (!variant || variant === "neutral") && "bg-ink-subtle"
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
