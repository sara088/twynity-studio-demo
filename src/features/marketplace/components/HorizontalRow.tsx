"use client";

import { useRef } from "react";
import { RowHeader } from "./RowHeader";

export function HorizontalRow({
  title,
  caption,
  gapClassName = "gap-3.5",
  soon = false,
  viewAllHref,
  children,
}: {
  title: string;
  caption?: string;
  gapClassName?: string;
  soon?: boolean;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <section className="mb-10">
      <RowHeader title={title} caption={caption} soon={soon} viewAllHref={viewAllHref} onScroll={scroll} />
      <div
        ref={ref}
        className={`scrollbar-none -mx-7 flex ${gapClassName} overflow-x-auto px-7 pb-1 ${soon ? "is-soon-row" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
