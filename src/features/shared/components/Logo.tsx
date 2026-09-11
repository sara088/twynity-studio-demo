import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Brand mark: SVG icon + "Twynity" wordmark in Syne (matches the prototype's
// .brand — icon + Syne 700, not a baked PNG wordmark).
// `wordmarkClassName` lets callers hide the wordmark responsively (e.g. the
// mobile topbar shows the mark only): wordmarkClassName="hidden sm:inline".
export function Logo({
  href = "/",
  height = 28,
  className,
  wordmarkClassName,
}: {
  href?: string;
  height?: number;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-[9px]", className)}
      aria-label="Twynity"
    >
      <Image
        src="/assets/twynity-logo.svg"
        alt=""
        width={height}
        height={height}
        priority
        className="block shrink-0"
        style={{ width: `${height}px`, height: `${height}px` }}
      />
      <span
        className={cn(
          "font-heading text-[17px] font-bold tracking-[-0.4px] text-dark",
          wordmarkClassName,
        )}
      >
        Twynity
      </span>
    </Link>
  );
}

export function WordmarkDot({ label = "Twynity" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[15px] font-bold tracking-[-0.4px] text-dark">
      <span className="relative inline-block h-[18px] w-[18px] rounded-full bg-violet">
        <span className="absolute inset-[5px] rounded-full bg-white" />
      </span>
      {label}
    </span>
  );
}
