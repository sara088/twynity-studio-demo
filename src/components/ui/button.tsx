import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-violet/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-violet text-white hover:bg-violet-hover",
        outline:
          "border-[1.5px] border-border bg-white text-gray-2 hover:border-violet hover:text-violet",
        ghost: "text-gray-3 hover:bg-input-bg hover:text-dark",
        secondary: "bg-input-bg text-dark hover:bg-violet-light",
        destructive: "bg-error text-white hover:bg-error/90",
        link: "text-violet underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[13px]",
        md: "h-[37px] rounded-[10px] px-4 text-[13px]",
        lg: "h-[42px] rounded-[11px] px-5 text-[13px]",
        xl: "h-[52px] rounded-[13px] px-6 text-[14px]",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-md": "size-[37px] rounded-[9px]",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
