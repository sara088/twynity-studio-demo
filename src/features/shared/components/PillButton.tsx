import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Standard pill button for the app's CTAs. Fixed rules so buttons stay
// consistent everywhere: content width (never stretched), pill radius.
//   md (default) = 48px / 28px pad / 15px — primary CTAs
//   sm           = 40px / 20px pad / 13px — compact header/toolbar actions
type Variant = "primary" | "outline";
type Size = "sm" | "md";

// Shared pill class — use for Link CTAs too (e.g. <Link className={pillClass(...)}>).
export function pillClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "group inline-flex shrink-0 items-center justify-center gap-2 rounded-btn font-semibold transition-[background,border-color,color,transform] duration-150 ease-soft disabled:pointer-events-none disabled:opacity-50",
    size === "md" && "h-12 px-7 text-[15px]",
    size === "sm" && "h-10 px-5 text-[13px]",
    variant === "primary" && "bg-violet text-white hover:-translate-y-px hover:bg-violet-h",
    variant === "outline" && "border-[1.5px] border-border bg-transparent text-gray-2 hover:border-violet hover:text-violet",
    className,
  );
}

export function PillButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={pillClass(variant, size, className)} {...props} />;
}
