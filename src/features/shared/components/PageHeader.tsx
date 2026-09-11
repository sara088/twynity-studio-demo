import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end",
        className
      )}
    >
      <div>
        <h1 className="mb-1.5 font-heading text-[30px] font-semibold leading-[1.1] tracking-[-0.7px] text-dark">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-[540px] text-[13.5px] leading-[1.45] text-gray-3">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
