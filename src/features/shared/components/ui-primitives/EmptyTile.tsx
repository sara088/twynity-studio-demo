import Link from "next/link";
import { cn } from "@/lib/utils";

export function EmptyTile({
  icon,
  title,
  sub,
  action,
  href,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  action?: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const inner = (
    <>
      <div className="mb-3.5 grid h-14 w-14 place-items-center rounded-[14px] border-[1.5px] border-border bg-white text-violet group-hover:border-violet">
        {icon}
      </div>
      <div className="mb-1.5 font-heading text-[18px] font-semibold tracking-[-0.4px] text-dark">
        {title}
      </div>
      {sub && (
        <div className="mb-3.5 max-w-[240px] text-[12.5px] leading-[1.5] text-gray-3">
          {sub}
        </div>
      )}
      {action}
    </>
  );

  const cls = cn(
    "group flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[18px] border-[1.5px] border-dashed border-gray-6 bg-input-bg p-8 text-center transition-colors duration-150 hover:border-violet hover:bg-violet-light",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}
