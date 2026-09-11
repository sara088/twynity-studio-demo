"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { RECENT_CONVERSATIONS, type Conversation } from "../data/conversations";

export function ConversationHistory({
  onSelect,
}: {
  onSelect?: (c: Conversation) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("n6");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RECENT_CONVERSATIONS;
    return RECENT_CONVERSATIONS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-border px-5 py-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-5"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="h-10 w-full rounded-[10px] border-[1.5px] border-violet/40 bg-violet-light/40 pl-10 pr-3 text-[13px] text-dark outline-none placeholder:text-gray-5 focus:border-violet focus:bg-violet-light/60"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-[13px] text-gray-4">
            No conversations match &ldquo;{query}&rdquo;.
          </div>
        )}
        {filtered.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActiveId(c.id);
                onSelect?.(c);
              }}
              className={cn(
                "group flex w-full items-start gap-4 border-b border-border px-5 py-3.5 text-left transition-colors last:border-b-0",
                active ? "bg-violet-light/55" : "hover:bg-input-bg/60"
              )}
            >
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "truncate font-heading text-[13.5px] font-bold tracking-[-0.2px]",
                    active ? "text-violet" : "text-dark"
                  )}
                >
                  {c.title}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-gray-4">
                  {c.preview}
                </div>
              </div>
              <span className="shrink-0 pt-0.5 text-[11px] text-gray-4 tabular-nums">
                {c.timestamp}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
