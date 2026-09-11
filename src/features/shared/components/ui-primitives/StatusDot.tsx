import { cn } from "@/lib/utils";

const tone = {
  online: "bg-[#22C55E]",
  idle: "bg-gray-5",
  review: "bg-[#EAB308]",
} as const;

export function StatusDot({
  variant = "online",
  className,
}: {
  variant?: keyof typeof tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block h-3.5 w-3.5 rounded-full border-[2.5px] border-white",
        tone[variant],
        className
      )}
    />
  );
}
