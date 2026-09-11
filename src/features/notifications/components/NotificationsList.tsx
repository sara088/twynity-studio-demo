"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { PillButton } from "@/features/shared/components/PillButton";
import { NOTIFICATIONS, type NotifTone } from "../data/mock-data";

const TONE: Record<NotifTone, string> = {
  violet: "bg-violet-light text-violet",
  mint: "bg-mint text-mint-text",
  amber: "bg-amber text-amber-text",
  skill: "bg-skill-bg text-skill-text",
};

export function NotificationsList() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        title="Notifications"
        subtitle={
          unread
            ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}.`
            : "You're all caught up."
        }
        actions={
          unread ? (
            <PillButton variant="outline" size="sm" onClick={markAll}>
              <Check size={14} /> Mark all as read
            </PillButton>
          ) : undefined
        }
      />

      <div className="space-y-2.5">
        {items.map((n) => {
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => markOne(n.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-card border p-4 text-left transition-colors",
                n.read
                  ? "border-border bg-white hover:border-violet/30"
                  : "border-violet-mid/50 bg-violet-light/30 hover:border-violet",
              )}
            >
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-input", TONE[n.tone])}>
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-dark">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet" />}
                </div>
                <p className="mt-0.5 text-[12.5px] leading-[1.5] text-gray-3">{n.body}</p>
              </div>
              <span className="shrink-0 text-[11.5px] text-gray-5 tabular-nums">{n.time}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
