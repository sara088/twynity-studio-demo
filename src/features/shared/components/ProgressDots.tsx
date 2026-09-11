import { cn } from "@/lib/utils";

export function ProgressDots({
  total,
  currentIndex,
  className,
}: {
  total: number;
  currentIndex: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-[3px] w-7 rounded-full transition-colors duration-250",
            i < currentIndex && "bg-violet",
            i === currentIndex && "bg-dark",
            i > currentIndex && "bg-border"
          )}
        />
      ))}
    </div>
  );
}
