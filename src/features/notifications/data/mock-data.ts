import type { LucideIcon } from "lucide-react";
import { Sparkles, Store, Plug, CreditCard, Clock, ShieldCheck, Video } from "lucide-react";

export type NotifTone = "violet" | "mint" | "amber" | "skill";

export interface Notification {
  id: string;
  icon: LucideIcon;
  tone: NotifTone;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// 5 unread (matches the topbar badge) + 2 read.
export const NOTIFICATIONS: Notification[] = [
  {
    id: "n0",
    icon: Video,
    tone: "violet",
    title: "Your avatar is ready",
    body: "Virtual Bob's video avatar finished processing — start a face-to-face conversation in the studio.",
    time: "Just now",
    read: false,
  },
  {
    id: "n1",
    icon: Sparkles,
    tone: "violet",
    title: "Virtual Bob is live in your studio",
    body: "Your twyn is ready — start a conversation or equip new tools.",
    time: "2h ago",
    read: false,
  },
  {
    id: "n2",
    icon: Plug,
    tone: "mint",
    title: "Gmail connected",
    body: "Virtual Bob can now read, draft, and triage email on your behalf.",
    time: "2h ago",
    read: false,
  },
  {
    id: "n3",
    icon: Store,
    tone: "skill",
    title: "New in the marketplace",
    body: "“Strategic Vision” is now available to equip on your twyns.",
    time: "5h ago",
    read: false,
  },
  {
    id: "n4",
    icon: CreditCard,
    tone: "violet",
    title: "Top-up successful",
    body: "500 credits were added to your account.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "n5",
    icon: Clock,
    tone: "amber",
    title: "You're running low on credits",
    body: "17 of 100 free credits used this month. Resets June 1.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n6",
    icon: ShieldCheck,
    tone: "mint",
    title: "Email verified",
    body: "Your account is verified — publishing and sharing are unlocked.",
    time: "3 days ago",
    read: true,
  },
];
