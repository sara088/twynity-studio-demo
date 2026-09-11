import { cn } from "@/lib/utils";

export function SectionCard({
  children,
  className,
  interactive,
  as: As = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "article" | "section" | "a";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <As
      className={cn(
        "rounded-[14px] border-[1.5px] border-border bg-white",
        interactive &&
          "transition-[border-color,box-shadow] duration-150 hover:border-violet/40 hover:shadow-[0_8px_28px_rgba(15,15,30,0.06)]",
        className
      )}
      {...rest}
    >
      {children}
    </As>
  );
}
