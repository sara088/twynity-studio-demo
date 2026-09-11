"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Crown, MessagesSquare, SquarePen, LayoutList } from "lucide-react";
import { getTeams, onTeamsChanged } from "../lib/teams";
import { getRosterTwyn } from "../data/roster";
import { COLLAB } from "../data/config";
import { CreateTeamDialog } from "./CreateTeamDialog";
import type { Team } from "../types";

export function TeamsGrid() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);

  useEffect(() => {
    const load = () => setTeams(getTeams());
    load();
    return onTeamsChanged(load);
  }, []);

  const dialogOpen = createOpen || !!editing;

  return (
    <>
      <div className="grid justify-center gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),360px))] sm:justify-start">
        {teams.map((t) => (
          <TeamCard key={t.id} team={t} onEdit={() => setEditing(t)} />
        ))}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="group flex min-h-[264px] flex-col items-center justify-center gap-3 rounded-card border-[1.5px] border-dashed border-gray-6 bg-bg-input px-6 py-8 text-center transition-colors hover:border-violet hover:bg-violet-light"
        >
          <span className="grid h-12 w-12 place-items-center rounded-input border border-border bg-white text-violet transition-colors group-hover:border-violet">
            <Plus size={22} />
          </span>
          <span className="font-heading text-[15px] font-semibold text-dark">Create a team</span>
          <span className="max-w-[220px] text-[12.5px] leading-[1.5] text-gray-3">Group your twyns to work together on one goal.</span>
        </button>
      </div>

      <CreateTeamDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        team={editing}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
      />
    </>
  );
}

function TeamCard({ team, onEdit }: { team: Team; onEdit: () => void }) {
  const members = team.memberIds.map(getRosterTwyn).filter((m): m is NonNullable<typeof m> => !!m);
  const lead = team.leadId ? getRosterTwyn(team.leadId) : null;
  const cfg = COLLAB[team.collaboration];
  const CollabIcon = cfg.icon;
  const shown = members.slice(0, 4);
  const extra = members.length - shown.length;

  return (
    <article className="flex flex-col rounded-card border border-border bg-white p-3 transition-[border-color,box-shadow] duration-150 hover:border-violet/40 hover:shadow-[0_8px_28px_rgba(15,15,30,0.06)]">
      {/* Header — member montage. Nested radius: card 20px − p-3 (12px) = 8px keeps
          its corners concentric with the card. */}
      <div className="relative mb-3 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[8px] bg-gradient-to-br from-violet-light via-bg-input to-bg-input">
        <div className="flex -space-x-5">
          {shown.map((m) => (
            <span key={m.id} className="relative h-14 w-14 overflow-hidden rounded-full shadow-[0_2px_8px_rgba(15,15,30,0.12)] ring-[3px] ring-white">
              <Image src={m.portrait} alt={m.name} fill sizes="64px" className="object-cover" style={{ objectPosition: "center 20%" }} />
            </span>
          ))}
          {extra > 0 && (
            <span className="grid h-14 w-14 place-items-center rounded-full bg-violet font-heading text-[16px] font-bold text-white ring-[3px] ring-white">+{extra}</span>
          )}
        </div>
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10.5px] font-bold text-violet ring-1 ring-black/5 backdrop-blur">
          <CollabIcon size={11} /> {cfg.label}
        </span>
        {team.leadModel === "persona" && lead && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber px-2 py-1 text-[10.5px] font-bold text-amber-text">
            <Crown size={10} /> {lead.name.split(" ").slice(-1)[0]}
          </span>
        )}
      </div>

      {/* Name + subtitle */}
      <h3 className="mb-1 font-heading text-[18px] font-semibold leading-[1.05] tracking-[-0.4px] text-dark">{team.name}</h3>
      <p className="mb-4 text-[13px] text-gray-3">
        {members.length} member{members.length === 1 ? "" : "s"} · {team.leadModel === "user" ? "You lead" : `${lead?.name ?? "A persona"} leads`}
      </p>

      {/* Actions — mirrors the twyn card: primary + secondary row */}
      <div className="mt-auto space-y-2">
        <Link
          href={`/teams/${team.id}/chat`}
          className="flex h-[40px] items-center justify-center gap-2 rounded-btn bg-violet text-[13px] font-semibold text-white transition-colors hover:bg-violet-h"
        >
          <MessagesSquare size={15} strokeWidth={2} /> Group chat
        </Link>
        <div className="flex gap-1.5">
          <Link
            href={`/teams/${team.id}`}
            className="inline-flex h-[34px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-btn border border-border bg-white text-[12.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
          >
            <LayoutList size={14} /> Overview
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-[34px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-btn border border-border bg-white text-[12.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
          >
            <SquarePen size={14} /> Edit
          </button>
        </div>
      </div>
    </article>
  );
}
