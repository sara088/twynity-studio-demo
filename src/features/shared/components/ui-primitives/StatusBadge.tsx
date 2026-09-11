import { cn } from "@/lib/utils";

const tones = {
  mint: "bg-mint text-mint-text",
  amber: "bg-amber text-amber-text",
  violet: "bg-violet-mid text-violet",
  gray: "bg-input-bg text-gray-4 border border-border",
  dark: "bg-dark/72 text-white backdrop-blur",
} as const;

export function StatusBadge({
  children,
  tone = "violet",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[-0.1px]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
