import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WordmarkDot } from "./Logo";

export function StudioTopbar({
  breadcrumb,
  rightSlot,
  exitHref = "/workforce",
}: {
  breadcrumb: { label: string; href?: string }[];
  rightSlot?: React.ReactNode;
  exitHref?: string;
}) {
  return (
    <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-border bg-white px-[26px]">
      <div className="flex items-center gap-3">
        <WordmarkDot label="" />
        <nav className="flex items-center gap-1.5 text-[13px] text-gray-3">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-gray-5" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-dark"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={
                    i === breadcrumb.length - 1
                      ? "font-semibold text-dark"
                      : ""
                  }
                >
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {rightSlot}
        <Button variant="outline" size="md" asChild>
          <Link href={exitHref}>
            <X size={14} />
            Close
          </Link>
        </Button>
      </div>
    </header>
  );
}
