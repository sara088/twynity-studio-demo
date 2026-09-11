"use client";

import { useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { cn } from "@/lib/utils";

export interface ModeOption<T extends string = string> {
  value: T;
  label: string;
}

export function ModeToggle<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  persistKey,
  className,
}: {
  options: ModeOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (next: T) => void;
  persistKey?: string;
  className?: string;
}) {
  const initial = defaultValue ?? options[0].value;
  const [stored, setStored] = useLocalStorage<T>(
    persistKey ?? "twynity_mode_unused",
    initial
  );
  const current = value ?? (persistKey ? stored : initial);

  useEffect(() => {
    if (value !== undefined) onChange?.(value);
  }, [value, onChange]);

  const handle = (next: T) => {
    if (persistKey) setStored(next);
    onChange?.(next);
  };

  return (
    <div
      className={cn(
        "inline-flex gap-[2px] rounded-full border border-border bg-white p-[3px]",
        className
      )}
    >
      {options.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handle(opt.value)}
            className={cn(
              "rounded-full px-[11px] py-[5px] text-[11.5px] font-semibold tracking-[0.2px] transition-colors duration-150",
              active
                ? "bg-dark text-white"
                : "text-gray-3 hover:text-dark"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
