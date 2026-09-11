"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Crown, User, Wallet, Search, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ROSTER } from "../data/roster";
import { COLLAB, COLLAB_ORDER } from "../data/config";
import { saveTeam, deleteTeam } from "../lib/teams";
import type { Team, LeadModel, Collaboration } from "../types";

export function CreateTeamDialog({
  open,
  onClose,
  team,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Pass a team to edit it; omit to create. */
  team?: Team | null;
  onSaved?: (team: Team) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(team?.name ?? "");
  const [members, setMembers] = useState<Set<string>>(new Set(team?.memberIds ?? []));
  const [leadModel, setLeadModel] = useState<LeadModel>(team?.leadModel ?? "user");
  const [leadId, setLeadId] = useState<string | undefined>(team?.leadId);
  const [collab, setCollab] = useState<Collaboration>(team?.collaboration ?? "parallel");
  const [brief, setBrief] = useState(team?.brief ?? "");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggle = (id: string) => {
    setMembers((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        if (leadId === id) setLeadId(undefined);
      } else n.add(id);
      return n;
    });
  };

  const memberList = ROSTER.filter((r) => members.has(r.id));
  const canSave =
    name.trim().length > 0 &&
    members.size >= 2 &&
    (leadModel === "user" || (leadId && members.has(leadId)));

  const save = () => {
    if (!canSave) return;
    const saved: Team = {
      id: team?.id ?? `team-${Date.now()}`,
      name: name.trim(),
      memberIds: Array.from(members),
      leadModel,
      leadId: leadModel === "persona" ? leadId : undefined,
      collaboration: collab,
      brief: brief.trim() || undefined,
      createdLabel: team?.createdLabel ?? "Just now",
    };
    saveTeam(saved);
    onSaved?.(saved);
    onClose();
  };

  const owned = ROSTER.filter((r) => r.owned);
  const purchased = ROSTER.filter((r) => !r.owned);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] w-[min(1000px,calc(100vw-32px))] max-w-[1000px] gap-0 overflow-y-auto p-0">
        {/* Header block: title + subtitle are ONE unit → tight (gap-1.5); a clearly
            larger gap (body pt) separates the header from the form (proximity). */}
        <DialogHeader className="gap-1.5 px-6 pb-0 pt-6">
          <DialogTitle className="font-heading text-[19px] font-bold leading-tight tracking-[-0.3px] text-dark">
            {team ? "Edit team" : "Create a team"}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-[1.45] text-gray-4">
            Group your twyns, pick who leads, and set how they collaborate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6 pt-5">
          {/* Name */}
          <div>
            <Label>Team name</Label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Launch Squad"
              className="mt-1.5 h-10 w-full rounded-input border-[1.5px] border-border bg-white px-3.5 text-[14px] text-dark outline-none focus:border-violet"
            />
          </div>

          {/* Members — one clean searchable list; the wide modal gives it 2 columns */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <Label>Members <span className="font-sans font-semibold text-violet">· {members.size} selected</span></Label>
              {memberList.length > 0 && (
                <div className="flex -space-x-2">
                  {memberList.slice(0, 7).map((r) => (
                    <span key={r.id} className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-white">
                      <Image src={r.portrait} alt={r.name} fill sizes="24px" className="object-cover" style={{ objectPosition: "center 20%" }} />
                    </span>
                  ))}
                  {memberList.length > 7 && (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-violet text-[10px] font-bold text-white ring-2 ring-white">+{memberList.length - 7}</span>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your twyns and purchased…"
                className="h-11 w-full rounded-input border-[1.5px] border-border bg-white pl-10 pr-3 text-[14px] text-dark outline-none focus:border-violet"
              />
            </div>

            <div className="scrollbar-thin mt-2 max-h-[320px] overflow-y-auto rounded-[12px] border border-border p-2">
              {(() => {
                const q = query.trim().toLowerCase();
                const match = (r: (typeof owned)[number]) => !q || (r.name + " " + r.role).toLowerCase().includes(q);
                const groups = [
                  { title: "Your twyns", rows: owned.filter(match) },
                  { title: "Purchased", rows: purchased.filter(match) },
                ].filter((g) => g.rows.length > 0);
                if (groups.length === 0) return <p className="px-2 py-10 text-center text-[13px] text-gray-4">No twyns match “{query}”.</p>;
                return groups.map((group) => (
                  <div key={group.title} className="mb-2 last:mb-0">
                    <div className="px-2 pb-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-5">{group.title}</div>
                    <div className="grid gap-1 sm:grid-cols-2">
                      {group.rows.map((r) => {
                        const on = members.has(r.id);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => toggle(r.id)}
                            className={cn(
                              "flex items-center gap-3 rounded-[11px] border px-3 py-2.5 text-left transition-colors",
                              on ? "border-violet-mid bg-violet-light/50" : "border-transparent hover:border-border hover:bg-input-bg/50"
                            )}
                          >
                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[10px] bg-violet-mid">
                              <Image src={r.portrait} alt={r.name} fill sizes="40px" className="object-cover" style={{ objectPosition: "center 20%" }} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-bold text-dark">{r.name}</span>
                              <span className="block truncate text-[12px] text-gray-4">{r.role}</span>
                            </span>
                            <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px]", on ? "border-violet bg-violet text-white" : "border-gray-6")}>
                              {on && <Check size={12} strokeWidth={2.6} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Lead model */}
          <div>
            <Label>Who leads?</Label>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setLeadModel("user")}
                className={cn("rounded-[12px] border p-3 text-left transition-colors", leadModel === "user" ? "border-violet-mid bg-violet-light/40" : "border-border hover:border-violet-mid/60")}
              >
                <div className="flex items-center gap-2 font-heading text-[13.5px] font-bold text-dark">
                  <User size={15} className="text-violet" /> You lead
                </div>
                <p className="mt-1 text-[12px] leading-[1.45] text-gray-4">Run a group chat — orchestrate and assign tasks to everyone.</p>
              </button>
              <button
                type="button"
                onClick={() => setLeadModel("persona")}
                className={cn("rounded-[12px] border p-3 text-left transition-colors", leadModel === "persona" ? "border-violet-mid bg-violet-light/40" : "border-border hover:border-violet-mid/60")}
              >
                <div className="flex items-center gap-2 font-heading text-[13.5px] font-bold text-dark">
                  <Crown size={15} className="text-amber-text" /> A persona leads
                </div>
                <p className="mt-1 text-[12px] leading-[1.45] text-gray-4">Talk to one lead twyn — it manages the rest internally.</p>
              </button>
            </div>

            {leadModel === "persona" && (
              <div className="mt-2.5">
                <div className="mb-1.5 text-[11.5px] font-semibold text-gray-3">Pick the lead</div>
                {memberList.length === 0 ? (
                  <p className="text-[12px] text-gray-4">Add members first.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {memberList.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setLeadId(r.id)}
                        className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors", leadId === r.id ? "border-amber-text/40 bg-amber text-amber-text" : "border-border text-gray-3 hover:border-violet-mid")}
                      >
                        {leadId === r.id && <Crown size={11} />}
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collaboration mode */}
          <div>
            <Label>How do they collaborate?</Label>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
              {COLLAB_ORDER.map((c) => {
                const cfg = COLLAB[c];
                const Icon = cfg.icon;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCollab(c)}
                    className={cn("rounded-[12px] border p-3 text-left transition-colors", collab === c ? "border-violet-mid bg-violet-light/40" : "border-border hover:border-violet-mid/60")}
                  >
                    <div className="flex items-center gap-1.5 font-heading text-[13px] font-bold text-dark">
                      <Icon size={14} className="text-violet" /> {cfg.label}
                    </div>
                    <p className="mt-1 text-[11.5px] leading-[1.4] text-gray-4">{cfg.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* How they work together — freeform brief/prompt */}
          <div>
            <Label>
              How they work together <span className="font-normal normal-case tracking-normal text-gray-5">· optional</span>
            </Label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              placeholder="e.g. Priya sets the goal, Rey pulls the numbers, and Milo writes it up. Move fast, skip the fluff, and flag anything risky before sending."
              className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border bg-white px-3.5 py-2.5 text-[13px] leading-[1.55] text-dark outline-none placeholder:text-gray-5 focus:border-violet"
            />
            <p className="mt-1 text-[11.5px] leading-[1.45] text-gray-5">
              A short brief the team follows — how to divide the work, the tone to keep, and what “good” looks like.
            </p>
          </div>

          {/* Billing note */}
          <div className="flex items-start gap-2 rounded-[10px] bg-bg-input px-3 py-2.5 text-[12px] leading-[1.5] text-gray-4">
            <Wallet size={14} className="mt-0.5 shrink-0 text-gray-4" />
            All team activity draws from your central wallet — one balance, with per-persona usage tracked automatically.
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border p-4">
          {confirmDelete && team ? (
            // The delete confirmation takes over the whole footer — no competing actions.
            <>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-error/10 text-error">
                  <Trash2 size={15} />
                </span>
                <div className="min-w-0 leading-tight">
                  <span className="block text-[13px] font-bold text-dark">Delete this team?</span>
                  <span className="block text-[11.5px] text-gray-4">This can’t be undone.</span>
                </div>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-3 transition-colors hover:border-violet hover:text-violet"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTeam(team.id);
                    onClose();
                    router.push("/teams");
                  }}
                  className="rounded-full bg-error px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:brightness-95"
                >
                  Delete team
                </button>
              </div>
            </>
          ) : (
            <>
              {team && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-4 transition-colors hover:text-error"
                >
                  <Trash2 size={14} /> Delete team
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={onClose} className="rounded-full border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-3 transition-colors hover:border-violet hover:text-violet">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSave}
                  className="rounded-full bg-violet px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {team ? "Save changes" : "Create team"}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-bold uppercase tracking-[0.04em] text-gray-2">{children}</div>;
}
