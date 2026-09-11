"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (next: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full max-w-[480px] flex-1", className)}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-[37px] w-full rounded-[10px] border-[1.5px] border-border bg-input-bg pl-[14px] pr-9 text-[13px] text-dark outline-none transition-colors duration-150 placeholder:text-gray-6 focus:border-violet"
      />
      <Search
        className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 text-gray-5"
        size={15}
      />
    </div>
  );
}
