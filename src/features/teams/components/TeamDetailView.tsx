"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Crown, User, Wallet, Pencil, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { PillButton } from "@/features/shared/components/PillButton";
import { getTeam, onTeamsChanged } from "../lib/teams";
import { getRosterTwyn } from "../data/roster";
import { COLLAB } from "../data/config";
import { CreateTeamDialog } from "./CreateTeamDialog";
import type { Team } from "../types";

export function TeamDetailView({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<Team | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const load = () => setTeam(getTeam(teamId));
    load();
    return onTeamsChanged(load);
  }, [teamId]);

  if (!team) {
    return (
      <div className="mx-auto max-w-[860px]">
        <Link href="/teams" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-4 hover:text-violet">
          <ArrowLeft size={14} /> Teams
        </Link>
        <p className="mt-8 text-[14px] text-gray-4">Team not found.</p>
      </div>
    );
  }

  const members = team.memberIds.map(getRosterTwyn).filter((m): m is NonNullable<typeof m> => !!m);
  const lead = team.leadId ? getRosterTwyn(team.leadId) : null;
  const cfg = COLLAB[team.collaboration];
  const CollabIcon = cfg.icon;

  // Mock per-persona usage (credits this month) + the central-wallet total.
  const perUsage = members.map((m, i) => ({ ...m, used: 40 + ((m.id.charCodeAt(0) + i * 37) % 90) }));
  const walletTotal = 500;
  const walletUsed = Math.min(walletTotal, perUsage.reduce((s, m) => s + m.used, 0));

  return (
    <div className="mx-auto max-w-[860px]">
      <Link href="/teams" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-4 transition-colors hover:text-violet">
        <ArrowLeft size={14} /> Teams
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 rounded-card border border-border bg-white p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-[24px] font-semibold tracking-[-0.5px] text-dark">{team.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
            {team.leadModel === "user" ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-2"><User size={13} className="text-violet" /> You lead</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-2"><Crown size={13} className="text-amber-text" /> {lead?.name} leads</span>
            )}
            <span className="h-[3px] w-[3px] rounded-full bg-gray-6" />
            <span className="inline-flex items-center gap-1.5 text-gray-3"><CollabIcon size={13} className="text-violet" /> {cfg.label}</span>
            <span className="h-[3px] w-[3px] rounded-full bg-gray-6" />
            <span className="text-gray-4">{members.length} members · created {team.createdLabel}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <PillButton variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil size={14} /> Edit</PillButton>
          <Link href={`/teams/${team.id}/chat`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-violet px-4 text-[13px] font-bold text-white transition-colors hover:bg-violet-h">
            <MessagesSquare size={14} /> Open group chat
          </Link>
        </div>
      </div>

      {/* Central wallet */}
      <div className="mt-3 rounded-card border border-border bg-white p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-heading text-[14px] font-bold text-dark"><Wallet size={15} className="text-violet" /> Central wallet</h2>
          <span className="font-sans text-[13px] font-semibold tabular-nums text-gray-3">{walletUsed} / {walletTotal} credits</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-input">
          <div className={cn("h-full rounded-full", walletUsed / walletTotal > 0.85 ? "bg-amber-text" : "bg-violet")} style={{ width: `${(walletUsed / walletTotal) * 100}%` }} />
        </div>
        <p className="mt-2 text-[12px] text-gray-4">One balance for the whole team — usage is tracked per persona below.</p>
      </div>

      {/* Members + per-persona usage */}
      <div className="mt-3 rounded-card border border-border bg-white p-5">
        <h2 className="mb-3 font-heading text-[14px] font-bold text-dark">Members · usage this month</h2>
        <div className="space-y-2">
          {perUsage.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-[12px] border border-border px-3 py-2.5">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[11px] bg-violet-mid">
                <Image src={m.portrait} alt={m.name} fill sizes="40px" className="object-cover" style={{ objectPosition: "center 20%" }} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13.5px] font-bold text-dark">{m.name}</span>
                  {team.leadId === m.id && <Crown size={12} className="shrink-0 text-amber-text" />}
                  <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em]", m.owned ? "bg-mint text-mint-text" : "bg-bg-input text-gray-4")}>
                    {m.owned ? "Yours" : "Purchased"}
                  </span>
                </div>
                <div className="truncate text-[12px] text-gray-4">{m.role}</div>
              </div>
              <div className="w-28 shrink-0">
                <div className="mb-1 text-right font-sans text-[11.5px] font-semibold tabular-nums text-gray-3">{m.used} cr</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-input">
                  <div className="h-full rounded-full bg-violet" style={{ width: `${Math.min(100, (m.used / 130) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How they collaborate */}
      <div className="mt-3 rounded-card border border-border bg-white p-5">
        <h2 className="mb-2 inline-flex items-center gap-2 font-heading text-[14px] font-bold text-dark"><CollabIcon size={15} className="text-violet" /> {cfg.label} collaboration</h2>
        <p className="text-[13px] leading-[1.55] text-gray-3">{cfg.hint} You can change this anytime in Edit — it changes how the team executes what you ask in the group chat.</p>
      </div>

      <CreateTeamDialog open={editOpen} onClose={() => setEditOpen(false)} team={team} />
    </div>
  );
}
