import { cn } from "@/lib/utils";

export function IconButton({
  children,
  badge,
  size = "md",
  className,
  ...rest
}: {
  children: React.ReactNode;
  badge?: number;
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "relative grid place-items-center border-[1.5px] border-border bg-white text-gray-3 transition-colors duration-150 hover:border-violet hover:text-violet",
        size === "md" && "h-[37px] w-[37px] rounded-[9px]",
        size === "sm" && "h-8 w-8 rounded-lg",
        className
      )}
      {...rest}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-[5px] top-[5px] flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 border-white bg-violet text-[8px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
